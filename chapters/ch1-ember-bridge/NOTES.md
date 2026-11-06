# Chapitre I – Ember Bridge (notes du dossier)

- **État** : v1.0 publié. Source découpée dans `src/` (27 octobre 2026, branche `ch1/split`) ; `legacy/` n'existe plus. `dist/index.html` = référence construite par `python3 build/build_chapter.py ch1-ember-bridge`, inchangée par le découpage.
- **Assemblage** : `build/assemble.py` colle les morceaux listés dans `src/parts.txt`, **dans cet ordre, octet pour octet, sans rien ajouter**. Le résultat est l'ancien fragment (sans doctype, une IIFE unique) ; `build_chapter.py` et `build_test.py` le transforment comme avant. Pas de modules JS : tous les fichiers JS partagent la portée de l'IIFE ouverte dans `00-core.js` et fermée dans `84-loop.js`.
- **Structure du code** : phases `G` (P1 pont), `Q` (P2 Fonderie, `drawLake`, `lakeY()`), `R` (P3 Clocher, `ringBell`, `FIN`, `finaleScore`) ; cinématiques `SC` (cartons `{d,en,fr}`) et `DRAW=[sStatue,sValley,sTowers,sSea,sDawn,sTitle]` ; panneaux `CARD1`, `LORE`, `showEnd`, `qEnd`, `rEnd` ; i18n `_(en,fr)`.
- **Textes** : `docs/TEXTES-CH1.md` (régénérable, colonne `fichier:ligne`). Lore : `docs/LORE.md`.
- **Cartes de transition** (fin de phase I : `showEnd`, cas `G.p2` ; fin de phase II : `qEnd`) : ligne du haut « Transition », titre neutre « Phase I/II terminée », le récit dans le texte seulement (voir `DECISIONS.md`, 28 octobre 2026).
- **Tests** : `tests/smoke.js` et `tests/keys.js` doivent afficher `errs []`.
- **Sauvegarde** (28 octobre 2026, `engine/shared`) : `lb-lang`, `lb-snd`, `lb-mus`, `lb-help`, `lb-ch1-intro`, `lb-ch1-end`, `lb-ch1-best-<mode>` par `LB.store` / `LB.key` ; anciennes `eb-…` lues si la nouvelle manque. Son, Musique et Aide mémorisés ; l'aide reprend sa valeur mémorisée à chaque choix de difficulté, coupée là où la case est masquée (`noHelp`).

## Carte de `src/`
| Fichier | Contenu |
|---|---|
| `page/head.html` | `<title>`, metas, liens Google Fonts (retirés par `build_chapter.py`), `<style>` ouvrant |
| `page/style.css` | Tout le CSS (entre `<style>` et `</style>`) |
| `page/body.html` | `</style>`, balisage HTML (en-tête, barres, arène, scène SVG du menu dans `#menu`, commandes), `<script>` ouvrant ; la carte `#ov`, la pause, l'écran de démarrage et le reste du menu sont créés par `LB.card`, `LB.pause`, `LB.menu` (`shared/js/28-ui.js`) ; la boîte de cinématique `#cine` par `LB.cine` |
| `js/00-open.js` | Ouverture de l'IIFE (suivie, dans `parts.txt`, de `@shared` : le code commun `shared/`, objet `LB`) |
| `js/00-core.js` | `LB.setup` (clés `lb-ch1-…`, anciennes `eb-…`), `_ = LB._`, constantes, `DIFFS`, `RUN`, `T`, `rageHp`, **`CHAPTER`** (table du cadre commun), carte et pause communes (`LB.card.mount`, `LB.pause.mount`), canvas, `el`, `LORE`, utilitaires, repères géométriques |
| `js/04-audio-sfx.js` | `ensureAudio` (= `LB.audio.ensure`), `tone` et `noise` (enveloppe d'origine, via `LB.audio.tone`/`noise`), bruitages, cris (`painCry`, `roar`). Le contexte, la suspension en arrière-plan et le déverrouillage sont dans `shared/js/12-audio.js` |
| `js/08-state.js` | `newGame`, `start`, `press`, intro de phase, `deathCard`, `showEnd` |
| `js/12-effects.js` | Étincelles, onomatopées (`ONO`, `ONOSZ`), cris du Colosse (`CRIES`, `MEGA`), `float` |
| `js/16-p1-bridge-logic.js` | Phase I : logique du combat, rages, `bossStep`, `hud`, `step` |
| `js/20-p1-bridge-decor.js` | Phase I : calques statiques du pont (`buildStatic`) |
| `js/24-hero-draw.js` | Raccourci `lanternBeam` ; le Veilleur (corps, sceptre-lanterne, poses, bouclier) est dans `shared/js/20-watcher.js` (`LB.drawWatcher`) |
| `js/28-boss-body.js` | Colosse : chaîne, enclumes, masse rangée, **`demonBody`** (silhouette validée, partagée) |
| `js/32-p1-bridge-render.js` | Phase I : poses, attaques, effets, aides, `render` |
| `js/36-p2-foundry-logic.js` | Phase II : `Q`, `DG`, repères du fond (`QFLOOR`, `QLAKE`, `QEDGE`), attaques, `lakeY` (horloge de la fin), `qDive`, `qEnd`, `qStep` |
| `js/40-p2-foundry-render.js` | Phase II : fond de la Fonderie (`qBackground`, hotte `qHood`), ailes, Colosse, Veilleur, lave, rebord, bloc, chaînes et lanterne (`drawLake`, `qLantern`), `renderQ` |
| `js/44-p3-belfry-logic.js` | Phase III : `R`, `R_T`, `RATK`, `ULT`, `FIN`, `rEnd`, `rStep`, `rFinale` |
| `js/48-p3-belfry-poses.js` | Phase III : finale (`heroFin`, `finBoss`, ailes tombées), poses du Veilleur et du Colosse, masse |
| `js/52-p3-belfry-decor.js` | Phase III : tours, cloche (`ringBell`), fanal, beffroi, fond et sol |
| `js/56-p3-belfry-render.js` | Phase III : aura, fissures, Colosse, contres (cloche, éclats, rayon), fin vers la mer, `renderR` |
| `js/60-ui-menu.js` | `CARD1`, `goPhase`, options, pause (`setPause`), réessayer, menu commun (`LB.menu.mount`, braises), `showMenu`, difficultés (`applyDiff`, `LB.help.use`), entrées communes (`LB.input.bind`) |
| `js/64-audio-music.js` | Musique synthétisée : combat, menu, finale, outro, `MUS`, `musTick` |
| `js/68-texts-ui.js` | Textes d'interface hors menu (`UIT`, `UIA`), `applyLang` (rappelé par les boutons de langue de `LB.menu`) |
| `js/72-boot.js` | Démarrage (`buildStatic`, `newGame`, `showMenu`) |
| `js/76-cine-intro.js` | Cinématique d'intro : scènes `DRAW`, cartons `SC` (durées), sons `CUE`, titre `LB.title` ; cadre `LB.cine` (`CINE`, drapeau `lb-ch1-intro`) |
| `js/80-cine-outro.js` | Outro de la vraie fin : scènes, cartons `SC`, son `ENTER` ; cadre `LB.cine` (`OUTRO`, sans drapeau) |
| `js/84-loop.js` | `endSeen`, `trialOpen`, boucle `frame`, **fermeture de l'IIFE** |
| `page/end.html` | `</script>` |

Les textes `_()` restent là où ils sont utilisés (le découpage n'a rien déplacé) : chercher dans `docs/TEXTES-CH1.md` pour trouver le fichier.

## Pièges du découpage
- **L'ordre de `parts.txt` est l'ordre d'exécution.** Une seule IIFE : déplacer un morceau peut casser une `const` utilisée avant sa déclaration (TDZ) même si le build « passe ». Ne pas réordonner sans raison.
- **Chaque morceau finit par un saut de ligne**, et tout fichier de `src/` doit être listé dans `parts.txt` : `assemble.py` refuse sinon (erreur claire plutôt que JS collé ou fichier ignoré).
- **Ancrages des scripts de build** : `build_chapter.py` cherche `<style>`/`</style>` et les 3 liens Google Fonts (`page/`) ; `build_test.py` cherche `requestAnimationFrame(frame);\n})();` (fin de `84-loop.js`) et `LB.cine.create({key:'intro',` (`76-cine-intro.js`, pour y ajouter `testSeen:true`). Ne pas modifier ces lignes sans adapter les scripts.
- Le texte d'ouverture de la phase I n'existe plus qu'une fois : `CARD1` dans `js/60-ui-menu.js` (la carte est créée par `LB.card`).
- `js/72-boot.js` finit par un commentaire « écran de démarrage » qui décrit en fait le code de `84-loop.js` : laissé tel quel pour rester octet pour octet identique.
- Les coupes sont faites sur les commentaires de section (`/* ---------- … */`) ; la ligne vide qui précède reste à la fin du morceau précédent.

## États du Veilleur communs et vocabulaire (session `engine/hero-states`, 31 octobre)
- Les trois phases passent par `LB.hero` (`shared/js/16-hero.js`, voir `shared/NOTES.md`) : phase I et III = geste `block`, phase II = `dodge`. États `act` (ex-`barrier`, `dodge`, `guard`), `recover`, `hurt` (ex-`down` des coups reçus ; `down` ne reste que pour la prise relâchée, qui est une animation, et pour figer le Veilleur à la défaite). `G.pl`, `Q.pl`, `R.pl` = `LB.hero.create()`.
- Tables : la durée de l'action, de la récupération et de la grâce est dans `LB.HERO_T` (× `m`, `rm` de la difficulté, `HD(geste)` dans le code) ; `T.barrier`, `T.recovery`, `DG.act`/`rec`/`grace`/`hurt`, `R_T.guard`/`rec`/`grace` n'existent plus. Restent des réglages d'attaque : `T.flwin` et `BRW` (fenêtre courte du souffle, passée à `LB.hero.stops` en `win`), `T.hitSw`/`hitSwLast`/`hitFl`/`hitFy` (étourdissements fixes de la phase I), `DG.drop`/`fall`/`wide`, `R_T.down`/`min`/`lasso`/`stun`. Difficultés : `php`, `m`, `rm` retirés de `DIFFS` (ils viennent de `LB.HERO_DIFF` par `LB.diff.apply` ; `DIFF.hp`, `DIFF.heal`).
- **Phase I** : une attaque bloquée renvoie à `ready` (avant, le coup simple laissait finir le blocage et la récupération). **Épreuve** : 4 PV au départ, +1 PV entre les phases (plafond 4, `DIFF.heal`, décision du 31 octobre : remplace « aucun soin »), ouverte pendant les tests (`TRIAL_OPEN` dans `00-core.js`).
- **Appui refusé** : lanterne rouge (`LB.DENY_COL`) dans les trois phases (`drawPlayer`, `drawHero2`, `drawHero3`). **Barre de récupération** : `LB.drawRecoveryBar` dans `drawHints`, `drawHints2`, `drawHints3`, donc avec la case « Aide » seulement ; elle remplace l'arc gris des phases II et III.
- **Vocabulaire** : plus de « parer » (`blocks` en phases I et III, `dodges` en phase II, `blockSuccess`, `DMG_BLOCK`, bouton « Bloquer » en phases I et III, « Blocages » en fin de partie). Les appels flottants passent `'CLANG'` directement (plus de mots d'annonce, même cachés).
- Tests : `tests/input.js ch1`, `tests/ch1-bot.js` (comparaison avant / après sur la même graine : 540 parties identiques).

## Audio commun (session `engine/audio`, 28 octobre)
- Le contexte audio, `bgAudio` / `unlockAudio` et les réglages Son / Musique sont passés à `LB.audio` (`shared/js/12-audio.js`). `tone(f,d,type,v,slide)` et `noise(d,v,f0,f1)` restent ici, avec leur enveloppe d'origine, et appellent `LB.audio.tone` / `noise` ; la musique (`64-audio-music.js`) se branche sur le bus `LB.audio.mus`. `prefs` ne garde que `help`.
- **Avancement** : fait = rebranchement, test `tests/audio.js`. Reste à faire : écoute sur téléphone (pause / reprise, contexte en `playback`).

## Veilleur dessiné commun (session `engine/watcher`, 1er novembre)
- `drawWizard`, `drawLantern`, `drawScepter` n'existent plus ici : `drawPlayer` (phase I), `drawHero2` (phase II), `drawHero3` (phase III), `drawBarrier` (`LB.drawBlock`), l'outro (`watcher` : `opt.flat` ; Veilleur de dos face au phare : `opt.ink`) et l'intro (`LB.drawWatcherSil`) appellent le module commun. Chaque phase garde sa chorégraphie (`heroPose`, `heroPose3`, `heroFin`, `heroFlee`, estoc, prise) et la passe en options : bâton planté (`staff`) en phase I, corps réduit (`body:{dy:44,s:.8}`) et sceptre (`sa`, `L:80`) en phase II, sceptre (`sa`, `L:76`) en phase III.
- **Respiration** au repos seulement (pose `idle`) : phase I hors intro et hors prise, phase III en combat ; pas en phase II (chute, pans au vent inchangés).
- Menu : la silhouette du Veilleur vient de `shared/svg/watcher-menu.svg` (ligne `@svg` de `page/body.html`).
- Preuve d'identité : `tests/visual-shots.js --no-breath` contre `main` : 126/126 identiques.

## Phase II au fond de la Fonderie, vraie fin partout (session `ch1/foundry-floor`, 1er novembre)
- **Décor fixe** : plus de défilement ni de traits de chute. Le Veilleur se tient sur un bloc du pont tombé sur le rebord (`QH`, pieds à `QH[1]+44`) ; le rebord est `DG.drop` plus bas (`QFLOOR`), la lave juste dessous (`QLAKE`), à droite de `QEDGE`. Mur, équerres, chaîne rompue, anneau et petite lanterne orange (section G : posée sur le rebord, x = 150, lueur faible, pulsation lente `Q.time*1.3`) sont dessinés pendant tout le combat (`drawLake(false)`). Hotte du grand four (`qHood`) en haut à droite.
- **Aléatoire inchangé** : `Q.streaks`, `Q.debris`, `Q.scroll`, `Q.speed` sont encore mis à jour dans `qStep` (mêmes tirages, donc mêmes parties du bot) mais ne sont plus dessinés.
- **Fin** : `lakeY()` n'est plus un niveau dessiné, c'est l'horloge de la fin (le plongeon a lieu au même instant qu'avant). `qDive()` fait descendre le Colosse vers la lave (dessin seulement) ; la lave passe devant lui une fois englouti, puis il s'envole vers la hotte. La passerelle et sa phrase sont supprimées ; `Q.landed` n'existe plus.
- **Défaite** : le Veilleur tombe du bloc sur le rebord (`DG.drop` plus bas) et reste couché ; plus de chute dans le vide.
- **Esquive** (session `ch1/dodge-side`, 1er novembre) : pas de côté du Chapitre II (pose `dodgeSide`, image rémanente) sur le bloc, à la place de la plongée ; réglages de dessin dans `DG.side` (0,38 s, recul de 18 px vers la gauche, limité par le bloc, inclinaison autour des pieds). La pose suit l'appui (`Q.sideT`, `qSideK`) ; un arrêt réussi ne la coupe pas, un coup reçu l'interrompt. `p.ox`/`p.oy` (décalage figé de la plongée) n'existent plus. `DG.drop` reste (rebord, défaite) ; `dodgeDown` reste dans le module commun, inutilisée. Contre sur la tête et Finish : le Veilleur reste au sol, seul le rayon vise. Estoc : pas en avant de 28 px (au lieu de 60) et sans saut, pour rester sur le bloc ; les dégâts ne dépendent pas de la position du Veilleur. Voir `docs/decisions/2026-11-01-ch1-esquive-pas-de-cote.md` (à valider : amplitude du pas de côté réduite par la largeur du bloc).
- **Facile** : plus de fuite ni de fausse fin (`R.mode` `flee`/`fake`, `FLEE`, `heroFlee`, `fleeBoss` supprimés). À 1 PV, la foudre mène directement à la vraie fin (`startFinale`), sans seconde vie ; `rEnd` (mode `space`) écrit `lb-ch1-end` et déverrouille l'Épreuve du feu et le Chapitre II comme en Normal.

## Cinématiques communes (session `engine/cine`, 1er novembre)
- L'intro (`CINE`) et l'outro (`OUTRO`) passent par `LB.cine` (`shared/js/24-cine.js`) : boîte, canvas, légende, bouton « Passer », fondus, clavier et drapeau `lb-ch1-intro` sont dans le module ; le chapitre ne garde que ses scènes (`DRAW`), ses cartons et durées (`SC`), ses sons (`CUE` : tintement du carton 3, braise et rugissement du carton 4 ; `ENTER` de l'outro) et le titre `LB.title` (« LUMEN » `#ff7a2b`, mi-carton 5). Les dessins de l'outro reçoivent l'état de lecture (`sTowers`, `sSea` : quatrième argument `st`).
- Le style et le balisage de `#cine` ont quitté `page/style.css` et `page/body.html` (créés par le module, mêmes règles). `UIT` garde `#cineSkip` (sans effet tant que la boîte n'existe pas).
- Preuve : `tests/visual-shots.js` (126/126 hors Chapitre II) et `--cine` (63/63 cartons du Chapitre I, titre compris) identiques au pixel contre `main`.

## Cadre commun (session `menu/common`, 1er novembre)
- Menu, écran de démarrage, cartes, pause, entrées, HUD, aide et plein écran viennent de `shared/js/28-ui.js` (voir `shared/NOTES.md`), alimentés par `CHAPTER` (`js/00-core.js`). Le chapitre garde : `CARD1`, `LORE`, ses cartes de fin (`showEnd`, `qEnd`, `rEnd`, `deathCard(o)` : objets passés à `LB.card.show`), `runTable` (lignes du tableau de l'Épreuve), `setPhaseUI` (sourcil, bouton, frise par `LB.hud`), `hud` (`LB.hud.player`, `LB.hud.boss`, repères `LB.hud.marks(rageHp(DIFF, phase))`).
- **Identique au pixel** sauf les sous-titres des difficultés (« À la loyale », « Sans pitié » ; en anglais provisoire « Fair and square », « No mercy »). Le balisage des barres est gardé tel quel (nom en texte nu devant le compteur : une balise autour du nom décalait de 42 pixels l'anticrénelage).
- **Aide** : `LB.help` ; plus de `noHelp` (case disponible en Difficile), désactivée en Épreuve ; 3ᵉ défaite en Facile : « Activer l'aide visuelle » et sa phrase (`CHAPTER.help.offer`). Repère : `LB.cue` (`drawHints`, `drawHints2`, `drawHints3`), même dessin qu'avant.
- `mk1`, `mk`, `mkR` retirés de `DIFFS` (repères calculés par `rageHp`, mêmes cases) ; `prefs`, `deaths`, `updNext`, `updBest`, `trialMenu`, `hintBar`, `HINT_LEAD` n'existent plus (`LB.menu.update`, `LB.help`, `LB.cue`, `LB.CUE_T.lead`). `__t` de la copie de test : `showEnd`, `setPause` en plus.
- 2026-11-02 (engine/next-card) : le dernier carton de l'outro n'a qu'un appel `LB.nextCard` (rendu commun, `LB.NEXT_T`) ; ne pas y redessiner « LUMENBELL · CHAPITRE » (garde dans `tests/cine.js`).
- 2026-11-02 (engine/brand-colors) : « LUMEN »/« BELL » (titre d'intro, carton « à suivre », menu) suivent `LB.BRAND` : « LUMEN » couleur du chapitre, « BELL » crème ; aucune couleur en dur pour ce mot dans le chapitre (garde dans `tests/cine.js`).

- 2026-11-02 (`menu/common-ui`) : lien « chapitre suivant » et carte de défaite / de fin communs (`shared/js/28-ui.js`) ; `CHAPTER.next` = `{n, title, open?}` (couleur dérivée de `LB.CH_COL`), cartes avec `onMenu` au lieu de `go2` « Menu ». Décision : `docs/decisions/2026-11-02-menu-common-ui.md`.

- 2026-11-02 (`menu/crown` A, `shared/` seulement) : ouvert depuis le hub (`site/chN/index.html?from=hub`), le chapitre n'a pas d'écran de démarrage et son menu montre « Retour » vers le hub ; ouvert seul, écran de démarrage et plus de lien en bas du menu (« chapitre suivant » retiré). `CHAPTER.next` retiré (2 novembre, `hub/cleanup`). `dist` reconstruit (seuls les morceaux communs changent).
- 2026-11-02 (`menu/crown-fixes`, session moteur) : bouton plein écran retiré de l'en-tête et du menu ; mouvement réduit lu par `LB.motion` (réglage du hub, sinon le système) ; lien du menu « Chapitres » ; ouvert depuis le hub, la carte de la vraie fin (hors Épreuve) porte « Chapitres » et ramène au hub (`LB.hubEnd`). Voir `docs/decisions/2026-11-02-hub-fixes.md`.
