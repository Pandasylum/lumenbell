# Éléments communs entre les chapitres – audit

Session `engine/audit` (28 octobre 2026). **Aucun code de jeu modifié** : ce fichier est l'inventaire de ce qui doit être identique d'un chapitre à l'autre, des écarts constatés entre le Chapitre I et le Chapitre II, d'une API commune minimale et d'un plan en sessions. Rien n'est appliqué ; les recommandations marquées **(à trancher)** ont été tranchées le 28 octobre : voir `docs/decisions/2026-10-28-engine-shared.md`, §1.

Références : `ch1:` = `chapters/ch1-ember-bridge/src/` (fichiers découpés, numéros de ligne propres à chaque fichier) ; `ch2:` = `chapters/ch2-silent-bells/src/silent-bells.html` (numéro de ligne seul).

## Synthèse
- **Déjà commun** : canevas 960 × 540, polices (Big Shoulders Display + DM Sans, `build/fonts.css` inliné), variables CSS de police, structure HTML (en-tête, frise `#phases`, barres `.bars`/`.pips`, `#ov`, `#pause`, `#menu`, `.controls`, `#ward`), `_(en, fr)`, principe des états `ready` → action → `recover` et durées de base (0,333 s / 0,7 s, `deny` 0,25 s), multiplicateurs `m`/`rm`, PV du Veilleur 6 / 4 / 3, onomatopées seules à l'écran, rages sans texte (lecteur d'écran seulement).
- **Recopié mais divergent** : tout le reste. Chaque chapitre a sa propre machine à états (quatre implémentations au total : trois au Chapitre I, une au Chapitre II), son propre dessin du Veilleur (le Chapitre II n'a ni heaume, ni tabard, ni lanterne : un bâton à cristal), sa propre cinématique, son propre menu, son propre audio, ses clés (`eb-…` contre `lb-…`), ses tests.
- **Écarts les plus visibles pour le joueur** : le dessin du Veilleur ; la barre de récupération (toujours visible au Chapitre II, seulement avec l'aide et seulement en phase I au Chapitre I) ; « Parer » encore affiché sur le bouton (Ch. I phase III, Ch. II phase II) ; l'ordre du titre dans le menu du Chapitre II (chapitre **au-dessus** de « Lumenbell ») ; le prologue du Chapitre II rejoué à chaque partie ; les règles de l'Épreuve.

## 1. Tableau par élément

*Archivés (faits ou sans session en attente) : §1.3 difficultés et PV, 1.4 rages, 1.9 pause, 1.11 son, 1.12 polices, 1.13 clés `lb-…`, 1.15 tests et bot, ainsi que l'en-tête « Fichiers lus » : [archives/COMMUN-inventaire.md](../archives/COMMUN-inventaire.md).*

Légende de la colonne « Reco » : **C** = à mettre en commun telle quelle ; **C1** = prendre la version du Chapitre I ; **C2** = prendre la version du Chapitre II ; **T** = à trancher par Kevin.

### 1.1 États du Veilleur

| Élément | Identique | Diffère (Ch. I ↔ Ch. II) | Reco |
|---|---|---|---|
| Machine à états | `ready` → action → `recover` → `ready` ; un appui n'agit qu'en `ready`, sinon `deny` = 0,25 s ; attaque jugée à l'impact | Ch. I : trois copies, une par phase, noms d'état différents (`barrier`, `dodge`, `guard`) — ch1:`08-state.js:59-70` + `16-p1-bridge-logic.js:349-357` ; `36-p2-foundry-logic.js:52-57` + `:268-282` ; `44-p3-belfry-logic.js:55-60` + `:381-399`. Ch. II : une seule (`act`), durées par `PT()` selon la phase — ch2:`396-425` | **C2** (une seule machine, état `act`), paramétrée par mécanique (bloquer / esquiver / tenir) et non par phase |
| Tables de durées | `T.barrier`/`DG.act`/`R_T.guard` = 0,333 ; `T.recovery`/`DG.rec`/`R_T.rec` = 0,7 | Ch. I : durées écrasées par `applyDiff` (ch1:`60-ui-menu.js:78-89`), `deny` en dur (`08-state.js:69`, `36:57`, `44:60`). Ch. II : multiplication à la lecture (`PT()`, ch2:`398-401`), `deny`, `perf`, `grace`, `hurt` dans les tables (ch2:`393-395`). **Attention** : au Ch. II, `T` sert à la phase II (parade) et `DG` à la phase I (esquive) ; au Ch. I, `T` = phase I (blocage), `DG` = phase II (esquive) | **C2** : une table `HERO_T` par mécanique, multipliée à la lecture |
| Grâce après l'action | — | Ch. I : 0,06 s en dur (`16-p1-bridge-logic.js:11`), `DG.grace` 0,05 (+0,13 en Difficile contre chute/rocher, `36:114`), `R_T.grace` 0,06 (`44:4`). Ch. II : `T.grace` 0,06, `DG.grace` 0,05, `R_T.grace` 0,06 (ch2:`393-395`), sans bonus Difficile | **C**, valeurs par mécanique ; bonus Difficile du Ch. I = réglage d'attaque, pas du Veilleur |
| Fenêtre courte du souffle | — | Ch. I seulement : `T.flwin` 0,2 (`00-core.js:29`), `BRW` en phase III (`44:156`), `fm` (Difficile) | Garder comme réglage **par attaque** (`win` sur l'attaque), pas dans le Veilleur |
| Étourdissement après coup | Règle `min(base, max(min, écart − 0,2))` | Ch. I phase I : durées fixes 0,3 / 0,55 / 0,9 (`16-p1-bridge-logic.js:50,103,163,195`) ; phase II min 0,14 (`36:137`) ; phase III min 0,22 (`44:181`). Ch. II : min 0,14 partout (ch2:`438-440`) | **C2** (une règle, `HURT={min:.14,margin:.2}`) ; **T** pour la phase I du Ch. I (le relèvement après la prise est une animation, à garder hors règle) |
| Barre de récupération | Position sous les pieds (x ± 31, y + 8, hauteur 6), bleue `#6fd3ff`, rouge `#ff5252` pendant `deny` | Ch. I : phase I seulement, et **seulement avec l'aide visuelle** (dans `drawHints`, ch1:`32-p1-bridge-render.js:317-379`, barre `:375-379`) ; phases II et III : arc gris autour du Veilleur, aide seulement, pas de rouge (`40-p2-foundry-render.js:411-414`, `56-p3-belfry-render.js:509-512`). Ch. II : barre toujours visible en jeu, trois phases (ch2:`633-635`) | **C2** **(T)** : la barre est le seul retour d'un appui refusé ; la proposer toujours visible |
| Retour d'un appui refusé sur le personnage | — | Ch. I phase I : lanterne rouge `#ff6b6b` (`32-p1-bridge-render.js:282`) ; phases II-III : rien. Ch. II : rien sur le personnage | **C** : lanterne rouge pendant `deny` dans les trois phases (une ligne dans le dessin commun) |
| Blocage (bouclier) | Ellipse bleue devant le Veilleur, montée 0,07 s | Ch. I : `drawBarrier` (`32:295-308`), même dessin en phase III (`56-p3-belfry-render.js:151-160`). Ch. II : arc bleu de 58 px, 0,26 s (ch2:`613`, `629`) | **C1** (dessin du Ch. I), durée = durée de l'action |
| Esquive (pas de côté) | Décalage, retour | Ch. I phase II : plongée vers le bas `DG.drop` 110 px, forme `u<.27 / u<.73` (`36:4`, `40-p2-foundry-render.js:301-303`). Ch. II phase I : pas de côté −48 px sur 0,38 s + image rémanente (ch2:`614`, `624`) | Deux poses d'esquive dans le dessin commun (`dodgeDown`, `dodgeSide`), durée = action |
| Garde tenue (phase III) | — | Ch. I : garde au toucher, durée fixe (`44:59`, `:397`). Ch. II : tenue tant que le bouton est appuyé, endurance `drain`/`regen`, `broken` 0,9 s (ch2:`395`, `418-424`, barre d'endurance `637`) | Mode `hold` optionnel de la machine commune (**C2**) ; le Ch. I garde `tap` |
| Reflets (faux coups) | — | Ch. II seulement : `DG.fool` 0,6 s, `aimedAt` (ch2:`394`, `470`, `490`) | Option `fool` de la machine commune |
| Parfait | — | Ch. I : phase III seulement (`44:191`). Ch. II : `perf` 0,08 × m dans les trois phases (ch2:`471`) | **C2** (`perf` dans `HERO_T`) |
| Une attaque arrêtée renvoie à `ready` | Oui | Ch. I phase I : coup simple, non (le Veilleur finit sa récupération, `16-p1-bridge-logic.js:23-30`) ; chaîne double et épées, oui (`parrySuccess`, `16:80-87`) ; phases II-III : oui (`36:119`, `44:169`). Ch. II : oui partout (ch2:`465`, `471`) | **C2** **(T)** pour la phase I du Ch. I : change le ressenti du pont, à valider en jeu |

### 1.2 Vocabulaire (bloquer / esquiver, plus de « parer »)

Décision du 28 octobre (`docs/CH2-SPEC.md:98`) : un seul geste **bloquer** (*block*) et **esquiver** (*dodge*) ; la phase III tient le blocage.

| Où | Ch. I | Ch. II | Reco |
|---|---|---|---|
| Bouton `#ward` | « Bloquer » / « Esquiver » / **« Parer »** en phase III (ch1:`36-p2-foundry-logic.js:31`) | « Esquiver » / **« Parer »** en phase II / « Garde » en phase III (ch2:`1608`, `1613`, `1619`, libellé initial `266`) | Bloquer / Esquiver / Bloquer (phase III : même mot, geste tenu) |
| Mode d'emploi du menu | « bloquer, esquiver, **parer** » (ch1:`page/body.html:88`, `68-texts-ui.js:18`) | aucun | « Un seul bouton : bloquer, esquiver. » ou rien (**T** : le Ch. II l'a retiré) |
| Stats de fin | « Parades » (ch1:`08-state.js:85`, `44-p3-belfry-logic.js:316`, `:334`) | « Parfaits » (ch2:`1909`) | « Blocages » |
| Aide en Facile | « …le bon moment pour **parer** » (ch1:`08-state.js:76`) | — | « …pour bloquer » |
| Lecteur d'écran | « paré », « Parade réussie », « Fureur parée », « lève ta garde pour parer »… (ch1:`16-p1-bridge-logic.js:19,30,96,138,147,235,244`, `44-p3-belfry-logic.js:52,191`) | « Série parée » (ch2:`496`) | « bloqué », « Blocage réussi »… |
| Code et commentaires | `barrier`, `parries`, `DMG_PARRY` (`00-core.js:32`) | `parry` (sons, `ONO.parry`, ch2:`376`, `431`) | Renommage dans la session « Veilleur » ; `ONO.parry` → `ONO.block` |
| Documents | `BIBLE.md:31` (« bloque, esquive ou pare »), `:36` (« Fenêtres de parade »), `:81` | `docs/CH2-SPEC.md:36-38` | À corriger par la session « 00 · Direction » (hors périmètre ici) |

### 1.5 Dessin du Veilleur et poses

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Corps | Gabarit (manteau de −94 à 0, bras au point (23, −78), main (26, −62)), variante blanche `o.white` | Ch. I : heaume à visière, tabard à l'emblème, ceinture, épaulières, couleurs `#3c4a6e`/`#1e2538` (ch1:`24-hero-draw.js:2-28`). Ch. II : tête ronde sans heaume, visage sombre à deux yeux, écharpe blanche, sacoche, couleurs `#4a5c84`/`#222a40` (ch2:`641-656`), alors que le commentaire dit « same skin as Ember Bridge » (`639`) | **C1** (le Veilleur validé) |
| Outil | — | Ch. I : sceptre-lanterne avec petite cloche (`24-hero-draw.js:30-55`), rayon `lanternBeam` (`:57-63`). Ch. II : bâton à cristal en losange (ch2:`662-670`), contraire à `BIBLE.md:32` et `docs/CH2-SPEC.md:9` | **C1** |
| Poses | — | Ch. I : une fonction par phase (`drawPlayer` `32:262-293`, `drawHero2` `40-p2-foundry-render.js:318-331` + `:301-306`, `heroPose3` `48-p3-belfry-poses.js:120`, `drawHero3` `56-p3-belfry-render.js:137-160`), plus un Veilleur simplifié dans l'outro (`80-cine-outro.js:20-23`). Ch. II : `drawHero` + `heroShape` (angle du bâton, `ch2:609-674`), `proHero` (prologue, `1530`) | Une fonction `drawWatcher(pose)` et une table de poses (§ 3) |
| Respiration | — | Ch. I : immobile (`fl:0`) ; Ch. II : balancement `bob` et pans `fl` (ch2:`659-660`) | **T** |
| Silhouettes (menu, intro) | Même tracé SVG du Veilleur (ch1:`body.html:49-54`, `76-cine-intro.js:7` ; ch2:`217-218`) | Ch. II : sans la lanterne, un œil turquoise à la place (`241`) | **C1** |

### 1.6 Intro et outro

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Module | — | Ch. I : `CINE` (ch1:`76-cine-intro.js:2-135`) et `OUTRO` (`80-cine-outro.js:2-117`), deux copies du même moteur : canvas dédié `#cineC`, cartons `SC=[{d,en,fr}]`, `DRAW=[…]`, fondus de 0,8 s, légende HTML `#cineCap`. Ch. II : dessiné dans le canvas du jeu (`S.mode='prologue'/'epilogue'`, ch2:`1881-1882`, `1991-1992`), cartons `[début, fin, texte]` (`1524-1527`, `1940-1944`), légende dessinée (`caption`, `1119-1122`) | **C1** : un seul module `LB.cine`, cartons `{d,en,fr}` |
| `play`, `seen` | — | Ch. I : `play(done)`, `seen()` mémorisé `eb-intro` (`76:23-24`, `:122`, `:134`) ; outro `play`, `playing` (`80:116`). Ch. II : aucun drapeau, **le prologue repart à chaque partie** lancée depuis le menu (ch2:`1919-1924`) | **C1** (`lb-chN-intro`) |
| « Passer » | « Skip › / Passer › » | Ch. I : bouton `#cineSkip` dans `.cine` + Échap/Entrée/Espace (`76:127-133`, `style.css:199`). Ch. II : bouton `.skip` dans la scène + Entrée/Échap ; Espace bloqué (ch2:`166`, `56`, `2062-2066`) | **C1** (Espace passe aussi) **(T)** |
| Bouton de rejeu | — | Ch. I : « ▶ Intro », « ▶ Outro » (après la vraie fin) dans le menu (ch1:`body.html:64-65`, `style.css:192-193`, `84-loop.js:5`). Ch. II : aucun | **C1** |
| Vitesse des cartons | — | Ch. I : 6 à 9,5 s (`76:17-21`, `80:9-14`) ; Ch. II : ≈ 4 s (ch2:`1524-1527`) ; `docs/CH2-SPEC.md:134` demande 6-7 s | **C1** (table de durées par chapitre) |
| Titre de fin d'intro | « Lumenbell » en grand, chapitre dessous | Ch. I : « LUMEN » orange + « BELL » crème, 96 px, base y = 118, chapitre 26 px Big Shoulders crème y = 160 (ch1:`76-cine-intro.js:100-101`). Ch. II : « LUMENBELL » crème 96 px à y = 0,36 H, chapitre 17 px DM Sans espacé, couleur du chapitre, trait dessous, placement mesuré (ch2:`1111-1118`, `1595`) | **C2** pour le placement mesuré (testé par `tests/ch2-title.js`) ; **T** pour la typographie (Lumen coloré, police du sous-titre) |
| Titre de fin d'outro | — | Ch. I : « LUMENBELL · CHAPITRE II » **petit au-dessus**, « SILENT BELLS » grand (ch1:`80-cine-outro.js:90`) ; Ch. II : « Chapitre III. À suivre. » grand, couleur du Ch. III (ch2:`1987`) | **T** : règle commune « annonce du chapitre suivant » |

### 1.7 Menu et écran titre

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Structure | `.ov.menu`, scène SVG `.mscene` 960 × 540, `.mcard`, `#mphM` (4 boutons), `#mphT`, `#mResume`, `#langs` | Ch. I : en plus `#introBtn`, `#outroBtn`, plein écran `.fsm`, `.tag`, `.how`, `.ver` (v1.0.0), `#trialNote`, lien chapitre suivant `#mNext` (ch1:`body.html:63-91`). Ch. II : rien de tout cela (ch2:`193-262`) | Une fonction `LB.menu`, éléments fixes communs |
| Ordre du titre | — | Ch. I : « Lumenbell » (`h2`) **puis** chapitre (`.eyebrow.chap`) dessous (ch1:`body.html:69-70`). Ch. II : chapitre **au-dessus** puis « Lumenbell » (ch2:`247-248`) — contraire à `ROADMAP.md:215` | **C1** |
| Polices et tailles | `.mcard h2` Big Shoulders 800, `clamp(40px,9vw,88px)`, « Lumen » coloré, `.mph button b` 18 px | Ligne du chapitre : 16 px, `.2em`, couleur `--glow` (ch1:`style.css:94`) ↔ 12 px, `.14em`, `#9fe4ff` (ch2:`33`, `108`) ; couleurs `--ember` ↔ `--teal` ; halos (ch1:`style.css:91-92`, ch2:`109-110`) | **C1** pour les tailles ; couleurs depuis la table du chapitre |
| Positions | Remontée du titre `translateY(-9vh)` | Ch. II : centrage `place-items:center`, variante portrait propre (ch2:`83`, `101-104`) ; Ch. I : boutons Intro/Outro/plein écran en haut à gauche (`style.css:177-193`) ; langues : `.langs` avec zones sûres au Ch. II seulement (ch1:`style.css:200`, ch2:`120`) | **C2** pour les zones sûres et le portrait, **C1** pour les boutons |
| Ordre des langues | — | EN puis FR (ch1:`body.html:67`) ↔ FR puis EN (ch2:`245`) | **T** |
| Langue par défaut | — | Langue de l'appareil, sinon anglais (ch1:`00-core.js:3-6`) ↔ français (ch2:`297`) | **C1** |
| Écran de démarrage | — | Ch. I : `#gate` (Commencer + langues), clic obligatoire qui débloque le son (ch1:`body.html:32`, `style.css:97-99`, `84-loop.js:12-13`). Ch. II : aucun ; musique au premier geste (ch2:`2092-2093`) | **C1** |
| Animations et durées | Scintillement `mglow`, `mblink` identiques | Particules : 26 braises montantes 5-12 s ↔ 34 flocons descendants 7-15 s (ch1:`60-ui-menu.js:76`, ch2:`2105`, CSS `mrise` / `mfall`) ; balayage du faisceau `msweep` au Ch. II | Durées dans une table `MENU_T`, type de particule par chapitre |
| Navigation clavier | — | Ch. I : Entrée/Espace lancent Normal depuis le menu (ch1:`60-ui-menu.js:115-117`) ; Ch. II : clavier ignoré dans le menu (ch2:`2065`) | **C1** |
| Code mort | — | Ch. II : `renderMenu` lit `#mc`, absent du HTML, jamais appelé (ch2:`2023-2035`) | À retirer avec le menu commun |

### 1.8 HUD

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Barres de vie | Structure `.bars > .bar(.boss) > span + .pips`, compteur `n/max` | Nom du boss : texte HTML fixe + `UIT` (ch1:`body.html:16`, `68-texts-ui.js:24`) ↔ `#nmB` mis à jour par phase (ch2:`161`, `1626`) ; repères de rage (§ 1.4) ; `pips` à 4 arguments ↔ 3 (ch1:`16:324`, ch2:`1622`) | **C2** pour le nom, **C1** pour les repères |
| Sourcil d'en-tête | « Phase X sur III · … » | Ch. I : `setPhaseUI` (ch1:`36-p2-foundry-logic.js:24-32`) ; Ch. II : `hud()` (ch2:`1623-1630`) ; Ch. II affiche « Prologue » / « Épilogue » | **C** |
| Frise des phases | `#phases` | En Épreuve : masquée (ch1:`60-ui-menu.js:87`) ↔ désactivée (ch2:`1629`) | **T** |
| Plein écran | — | Ch. I : bouton dans l'en-tête et le menu (ch1:`body.html:11`, `60-ui-menu.js:61-66`) ; Ch. II : aucun | **C1** |
| Onomatopées | Table `ONO`, majuscules, Big Shoulders 800 | Ch. I : le code appelle encore `float('PARRY!')`… et `ONO` traduit chaque ancien mot d'annonce en onomatopée ou le supprime (ch1:`12-effects.js:5-23`, appel `16-p1-bridge-logic.js:27`) ; tailles par mot `ONOSZ` 42-68 px, vie 0,9 s (`12-effects.js:25`, `:72`). Ch. II : `ONO` direct par usage (`parry`, `hit`…), 26 px fixes, vie 1 s (ch2:`376-377`, `1087-1088`) | Tailles **C1**, appels **C2** (`LB.ono('CLANG')`, plus de mots d'annonce dans le code) |

### 1.10 Aide visuelle

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Valeur par défaut | Case « Aide visuelle » | Ch. I : décochée à chaque choix de difficulté, non mémorisée ; proposée en Facile à la 3ᵉ défaite (ch1:`60-ui-menu.js:92`, `08-state.js:72-79`). Ch. II : mémorisée `lb-help`, **cochée d'office en Facile** (ch2:`1921`, `2086`) | **T** |
| Disponibilité | Désactivée en Épreuve | Ch. I : masquée en Difficile (`noHelp`, `60-ui-menu.js:93`) ; Ch. II : disponible en Difficile | **T** |
| Repère | Indique l'ouverture de la fenêtre d'action | Ch. I : barre au-dessus de la tête (orange puis bleue, `hintBar`, `32:311-316`, approche `HINT_LEAD` 0,8 s) en Normal, cercle qui se resserre en Facile (`32:322-330`, `40:398-410`, `56:496-508`). Ch. II : cercle qui se resserre pour toutes les difficultés, blanc pendant la fenêtre, pointillé pour un reflet, demi-cercle pour un faisceau (ch2:`1046-1060`) | Une fonction `LB.cue(k, open, kind)` ; **T** pour le style |

### 1.14 Entrées et cartes

| Élément | Identique | Diffère | Reco |
|---|---|---|---|
| Touches d'action | Espace, flèche haut, toucher l'écran, bouton `#ward` | Ch. I : aussi W et Z (ch1:`60-ui-menu.js:123`, `BIBLE.md:30`) ; Ch. II : Espace et flèche haut seulement, gère le relâchement (ch2:`2067`, `2071`) | **C** : W et Z au Ch. II, relâchement géré pour tous |
| Toucher | `pointerdown` | Ch. II : capture du pointeur et `up()` (ch2:`2058-2061`) | **C2** |
| Cartes `#ov` | Sourcil, titre, texte, bouton | Ch. I : `#ovStats` + `go2` = « Activer l'aide » (ch1:`body.html:22-30`) ; Ch. II : `.brow`, `go2` = Menu, `#ovHow`, `showCard(o)` (ch2:`168-180`, `1867-1873`) | **C2** (`showCard(o)` déclaratif) |

## 2. Recommandation générale

1. **Référence par élément** : le Chapitre I pour ce que le joueur voit et qui a été validé (Veilleur, lanterne, menu, cinématique `CINE`, Épreuve verrouillée, écran de démarrage, onomatopées, repères de rage) ; le Chapitre II pour la mécanique et l'outillage (une seule machine à états, tables lues à la lecture, `store` avec migration, options mémorisées, tests à pas fixe, placement mesuré du titre, zones sûres).
2. **Le chapitre ne déclare que des données** (nom, couleur, sous-titres, PV des boss, seuils de rage, scènes, cartons, attaques) et appelle les fonctions communes. Ce qui est dessiné ou joué de façon propre (boss, décors, attaques, musique de combat) reste dans le chapitre.
3. **Pas de modules ES, un seul objet global `LB`** : voir `docs/decisions/2026-10-28-engine-shared.md`, §2, et `shared/NOTES.md`.
4. **Reproductibilité** : chaque session commune change volontairement le `dist` des deux chapitres ; le nouveau `dist` devient la référence dans le même commit, après comparaison en image (méthode du Chapitre II, `NOTES.md` du dossier) et tests verts.

## 3. API commune minimale

Tout est dans l'objet `LB`. Les noms sont des propositions.

### 3.1 Table par chapitre (la seule chose qu'un chapitre déclare pour le cadre commun)
```js
const CHAPTER={
  n:3, id:'ch3',                                   // numéro, préfixe des clés lb-ch3-…
  name:{en:'…',fr:'…'},                            // « Chapitre III · … »
  color:'#b9cf5a', color2:'#…',                    // code couleur (braise, marée, racines, givre…), halo
  sub:{easy:{en,fr},normal:{en,fr},hard:{en,fr}},  // sous-titres des difficultés (Facile et Normal communs par défaut)
  trial:{name:{en,fr},sub:{en,fr}},
  phases:[{name:{en,fr},head:{en,fr},boss:{en,fr},gesture:'dodge'|'block'|'hold',bossHp:{easy,normal,hard},rages:{easy:[…],normal:[…],hard:[…]}},…],
  intro:{scenes:[{d:6,en,fr,draw}],title:true}, outro:{scenes:[…],next:{n:4}},
  menu:{scene:'<svg…>', particles:'rise'|'fall', count:30},
  oldKeys:{}                                       // anciennes clés à migrer (Ch. I : eb-…, Ch. II : pn-/db-…)
};
```

### 3.2 Tables communes (réglages, jamais en dur)
| Table | Contenu |
|---|---|
| `HERO_T` | par geste : `block:{act:.333,rec:.7,grace:.06,perf:.08}`, `dodge:{act:.333,rec:.7,grace:.05,perf:.08,fool:.6}`, `hold:{act:.333,rec:.7,grace:.06,perf:.08,drain:.36,regen:.38,broken:.9}` ; `deny:.25` ; `hurt:{base:.38,min:.14,margin:.2}` |
| `HERO_DIFF` | `easy:{hp:6,m:2,rm:1}`, `normal:{hp:4,m:1,rm:1}`, `hard:{hp:3,m:.6,rm:1.2}`, `trial:{hp:4,heal:0}` (**T**) |
| `CINE_T` | fondu 0,8 s, apparition de la légende 0,5 s + 0,6 s, durée minimale d'un carton 6 s |
| `TITLE_T` | `size:96, sub:…, gap:22, y:.36` (placement mesuré du Ch. II) |
| `MENU_T` | durées des particules et des scintillements, remontée du titre (`-9vh`, `-4vh` en paysage bas) |
| `ONO`, `ONOSZ` | mots et tailles (table du Ch. I) |
| `FONT` | `display`, `body` |

### 3.3 Fonctions
| Domaine | Fonctions |
|---|---|
| Langue, texte | `LB._(en,fr)`, `LB.lang.init()`, `LB.lang.set(l)`, `LB.lang.apply(rows)` (lignes `[sélecteur, en, fr]`, comme `UIT`) |
| Sauvegarde | `LB.store.get(k,def)`, `LB.store.set(k,v)`, `LB.key(name)` → `lb-<name>` ou `lb-chN-<name>` |
| Audio | `LB.audio.ensure()`, `LB.audio.tone(…)`, `LB.audio.noise(…)`, `LB.audio.setSound(on)`, `LB.audio.setMusic(on)` (un seul contexte, suspendu en arrière-plan) |
| Difficulté | `LB.diff.apply(name, chapterDiff)` → `{hp,m,rm,trial,…}` fusionné avec la table du chapitre |
| Veilleur, états | `LB.hero.create()`, `LB.hero.press(p,gesture)`, `LB.hero.release(p)`, `LB.hero.step(p,dt,{gesture,held})`, `LB.hero.stops(p,win)` (arrêt à l'impact ; `win` optionnel pour une fenêtre propre à l'attaque), `LB.hero.stopped(p)` (retour à `ready`), `LB.hero.hurt(p,nextGap)`, `LB.hero.perfect(p)` |
| Veilleur, dessin | `LB.drawWatcher(ctx,x,y,pose,t,opt)` ; poses : `idle`, `block`, `dodgeSide`, `dodgeDown`, `hold`, `hurt`, `down`, `cast`, `counter`, `victory`, `fall`, `walk` ; `opt` : `white`, `scale`, `lanternCol`, `glow` ; `LB.drawLantern(…)`, `LB.lanternBeam(…)`, `LB.drawRecoveryBar(ctx,x,y,p)`, `LB.drawBlock(ctx,x,y,k)` |
| Aide visuelle | `LB.cue(ctx,x,y,k,open,kind)` (`kind` : `real`, `fake`, `hold`) |
| HUD | `LB.hud.pips(box,n,max,marks)`, `LB.hud.set({php,pmax,bhp,bmax,marks,bossName,head,ward})`, `LB.hud.phaseTrack(n,{trial})` |
| Effets | `LB.ono(word,x,y,col)`, `LB.rage(name,desc)` (lecteur d'écran + sting, rien à l'écran), `LB.say(txt)` |
| Cartes | `LB.card.show({eye,title,desc,table,go,onGo,go2,onGo2})`, `LB.card.hide()` |
| Cinématiques | `LB.cine.create({key,scenes,onEnd})` → `{play(done), seen(), playing()}` ; bouton « Passer », Échap/Entrée/Espace ; `LB.title(ctx,t,t0)` (« Lumenbell » en grand, chapitre dessous, couleur du chapitre) |
| Menu | `LB.menu.mount(CHAPTER,{onDiff,onTrial,onIntro,onOutro})`, `LB.menu.show(fromGame)`, `LB.menu.hide()`, `LB.gate.mount()` |
| Pause, entrées | `LB.input.bind({press,release,retry,pause,skip})` (Espace, flèche haut, W, Z, toucher ; P/Échap ; R ; Entrée), `LB.pause.set(on)` |
| Boucle | `LB.loop.start(step,render)` (dt borné à 0,05 s, `perfWatch` du Ch. I) |
| Test | `LB.testHooks(extra)` → `window.__t` de forme commune, ajouté seulement par le build de test |

Un chapitre III ne contient alors que : `CHAPTER`, ses boss et décors (`render`, attaques avec `{at,gesture,win?}`), ses scènes de cinématique, sa musique de combat, et un appel `LB.boot(CHAPTER)`.

## 4. Plan en sessions ordonnées

Chaque session : une branche, une PR, tests verts, `NOTES.md` et `DECISIONS.md` à jour, nouveau `dist` de référence comparé en image. Ne commencer une session que si les décisions **(T)** qui la concernent sont prises.

| # | Branche | Périmètre | Ne touche pas | Tests ajoutés |
|---|---|---|---|---|
| 0 à 2 | `engine/audit`, `engine/shared`, `engine/audio` | **Faites** (27–28 octobre) : voir `docs/decisions/2026-10-28-engine-shared.md` et `archives/decisions/2026-10-28-engine-audio.md` | — | — |
| 3 (**faite le 31 octobre**, voir `docs/decisions/2026-10-31-engine-hero-states.md`) | `engine/hero-states` | `LB.hero.*`, `HERO_T`, `HERO_DIFF`, `LB.diff.apply` ; les trois phases du Ch. I et du Ch. II rebranchées ; barre de récupération et lanterne rouge communes ; **vocabulaire bloquer / esquiver** (bouton, aide, stats, lecteur d'écran, noms de code) | dessin du Veilleur, attaques, timings des boss | `input` généralisé (Ch. I compris), bots Normal/Difficile du Ch. I à pas fixe avant/après |
| 4 | `engine/watcher` | `LB.drawWatcher` et poses, lanterne, bouclier, esquives ; le Ch. II reprend le Veilleur du Ch. I (heaume, tabard, sceptre-lanterne) ; silhouettes du menu et des cinématiques | états, boss | captures déterministes de chaque pose, par chapitre |
| 5 | `engine/cine` | `LB.cine`, `CINE_T`, `LB.title`, `TITLE_T` ; prologue et épilogue du Ch. II portés dans le module (cartons à 6-7 s, drapeau `lb-ch2-intro`, rejeu) ; intro/outro du Ch. I | scènes dessinées (étape C du Ch. II) | `title` généralisé, passage et rejeu |
| 6 | `menu/common` | `LB.menu`, `LB.gate`, `LB.card`, `LB.pause`, `LB.input`, HUD (`LB.hud`, repères de rage calculés, nom du boss), aide (`LB.cue`), plein écran, `MENU_T` ; les deux menus alimentés par `CHAPTER` ; Épreuve selon la décision prise | choix du chapitre (Couronne) | `menu-title` généralisé, `announce` généralisé, `trial` généralisé |
| 7 | `engine/tests` | Suite commune paramétrée par chapitre (`smoke`, `input`, `keys`, `title`, `announce`, `trial`, `bot`) et CI unique ; retrait des tests en double | jeu | toute la suite |
| 8 | `menu/crown` | Écran de choix du chapitre (la Couronne), progression, déblocage progressif commun, APK avec les deux chapitres (`ROADMAP.md:215`) | chapitres | parcours menu → chapitre → menu |
| 9 | `ch3/skeleton` | Gabarit du Chapitre III : `CHAPTER`, une phase vide qui n'appelle que `LB.*` | moteur | tous les tests communs passent sur le gabarit |

Ordre des dépendances : 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 ; 4 et 5 peuvent s'inverser. Les sessions de chapitre en cours (Ch. II étape C « visuels ») doivent passer **avant** la session 4 ou attendre après la session 6, pour ne pas redessiner un Veilleur ou des cinématiques qui vont être remplacés.

Les décisions ouvertes à l'origine de l'audit sont toutes tranchées : `docs/decisions/2026-10-28-engine-shared.md`, §1.

Mise à jour du 31 octobre 2026 (session 3 faite) : la décision n° 1 (barre de récupération toujours visible, seul retour d'un appui refusé) est **remplacée** par la décision de Kevin du 31 octobre : la lanterne du Veilleur passe au rouge pendant `deny` (seul retour), la barre n'est plus qu'un repère d'aide (case « Aide » cochée). Voir `docs/decisions/2026-10-31-engine-hero-states.md`. Les lignes « Barre de récupération » et « Retour d'un appui refusé » du § 1.1 restent l'état de l'audit du 28 octobre.
