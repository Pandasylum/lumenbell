# Glossaire Lumenbell

Vocabulaire déjà décidé dans le dépôt, sans terme inventé. État au 30 octobre 2026 (branche `docs/glossaire`) ; mis à jour le 31 octobre 2026 par la session `engine/hero-states` (gestes, appui refusé, barre de récupération, À trancher n° 3, 4 et 6).

- **Colonnes** : terme FR | terme EN | nom dans le code | règle d'usage | source (`fichier:ligne`).
- **« — »** : rien de décidé dans le dépôt (pas de nom EN, pas de nom de code).
- **« lore »** : le terme n'a de source que dans `docs/LORE.md` (non modifié ici).
- **Priorité des documents** : `docs/LORE.md` est la référence unique du lore ; `CHANGEMENTS.md` liste ce qui reste à faire dans le jeu. Quand le code ou un ancien document dit autre chose, la ligne est dans « À trancher » ; aucun choix n'y est proposé.
- Les noms de code sont ceux du Chapitre I (ch1) et du Chapitre II (ch2) ; ils peuvent rester en anglais ou en l'ancien vocabulaire (`CHANGEMENTS.md:27`).

## Règles de vocabulaire à reprendre

| Règle | Source |
|---|---|
| « braise » en minuscule (le feu de l'élément) ; « Braise » désigne l'élément, pas un nom propre | `CLAUDE.md:18` ; `DECISIONS.md` (« Refonte du lore Ch. I ») |
| **Bloquer** (EN *block*) et **esquiver** (EN *dodge*) ; plus de « parer » | `docs/CH2-SPEC.md:98` ; `docs/COMMUN.md §1.2` ; `archives/DECISIONS-2026-10-27-28.md#bloquer` ; `CHANGEMENTS.md:101` |
| Exception voulue : « Ta garde est brisée » / *Your guard is broken* (lecteur d'écran de la phase III du Chapitre II, `12-hero-states.js:40`) reste tel quel, malgré « garde » / « guard ». Ne pas le remplacer par « bloquer » ; il ne s'affiche jamais à l'écran (le bouton, lui, dit « Bloquer » / « Block ») | `docs/decisions/2026-10-30-ch2-validations.md` ; `docs/GLOSSAIRE.md` (À trancher n° 2) |
| Veilleur, féminin **Veilleure** | `docs/CH2-SPEC.md:10` ; `docs/LORE.md:128` |
| Le Veilleur ne parle pas ; sa lanterne est « sceptre-lanterne » / « lanterne », jamais « bâton » | `BIBLE.md:15` ; `docs/CH2-SPEC.md:9` |
| Tout texte en deux langues, `_('anglais','français')` ou `{d,en,fr}` | `CLAUDE.md:12` |
| Aucun mot d'annonce à l'écran ; seulement onomatopées et titres de phase ; les phrases descriptives servent au lecteur d'écran | `BIBLE.md:16` ; `docs/CH2-SPEC.md:6` |
| Ce qui se déduit du combat reste déduit | `BIBLE.md:19` ; `docs/CH2-SPEC.md:7` |
| « Phare » prend sa majuscule partout ; le navire est masculin | `CHANGEMENTS.md:34` |
| Nom EN du Phare Noyé : toujours *Drowned Lighthouse* ; « beacon » ne désigne que le fanal du Clocher (Chapitre I) | `CHANGEMENTS.md:70` |
| Une lanterne s'éteint, elle n'est jamais « brisée » | `docs/LORE.md:118` |
| « Lumenbell » : nom du jeu et de la série | `BIBLE.md:8` ; `docs/CH2-SPEC.md:8` |

## Gestes du joueur

| Terme FR | Terme EN | Nom dans le code | Règle d'usage | Source |
|---|---|---|---|---|
| Bloquer | Block | `LB.HERO_T.block` (durée ; ch1 phases I et III, ch2 phase II), geste `block`, `S.guardT` (date d'animation, ch2), `sfx.block`, `ONO.block` (ch2) | Libellé du bouton en phases I **et III** du Chapitre I (31 octobre : plus de « Parer »), en phase II **et en phase III** du Chapitre II (même mot partout ; en phase III le geste reste le blocage tenu) | `chapters/ch1-ember-bridge/src/js/36-p2-foundry-logic.js:31` ; `chapters/ch2-silent-bells/src/js/64-prologue.js:119` ; `chapters/ch2-silent-bells/NOTES.md:82-83` |
| Esquiver | Dodge | `LB.HERO_T.dodge` (durées), geste `dodge` ; `S.dodgeT` (date d'animation, ch2) | Libellé du bouton en phase II du Chapitre I et en phase I du Chapitre II | `chapters/ch1-ember-bridge/src/js/36-p2-foundry-logic.js:4,31` ; `chapters/ch2-silent-bells/src/js/64-prologue.js:124` |
| Bloquer tenu / barrage (phase III) | Held block | `LB.HERO_T.hold` (durée, endurance), état tenu tant que le bouton est appuyé (ch2) | « Blocage tenu » dans le cahier des charges ; « barrage » dans les décisions. Le bouton s'appelle « Bloquer » / « Block » (tranché le 30 octobre ; À faire, `CHANGEMENTS.md` J) | `docs/CH2-SPEC.md:98` ; `archives/DECISIONS-2026-10-27-28.md#etats-veilleur` ; `chapters/ch2-silent-bells/NOTES.md:83` |
| Ta garde est brisée | Your guard is broken | `12-hero-states.js:40` (ch2) | **Conservé volontairement** (tranché le 30 octobre) : texte du lecteur d'écran de la phase III uniquement, jamais affiché. Ne pas le remplacer par « bloquer » ; le bouton, lui, reste « Bloquer » / « Block » | `docs/decisions/2026-10-30-ch2-validations.md` (n° 5) ; À trancher n° 2 |
| Garde (phase III du Chapitre I) | — | `LB.HERO_T.block` (geste `block`) ; `drawBarrier` | Blocage de la phase III : 0,333 s avec 0,06 s de grâce (comme la phase I ; le bouton dit « Bloquer » / « Block » depuis le 31 octobre) | `BIBLE.md:81` ; `shared/js/16-hero.js` |
| Un seul bouton | — | `#ward` (bouton) | Espace, flèche haut, Z ou W, toucher ; le même bouton bloque ou esquive selon le moment ; P pause, R recommencer | `BIBLE.md:29-30` ; `chapters/ch1-ember-bridge/src/js/36-p2-foundry-logic.js:31` |
| Prêt / action / récupération | — | `ready` → `act` → `recover` → `ready` ; `deny` ; `hurt` | Machine à états du Veilleur, commune aux deux chapitres. Noms de code, jamais affichés | `chapters/ch2-silent-bells/src/js/12-hero-states.js:2-4` ; `docs/COMMUN.md §1.1` |
| Appui refusé | — | `deny` (0,25 s) | Seul retour : la **lanterne du Veilleur passe au rouge** pendant `deny`, toujours, dans les trois phases des deux chapitres (décision de Kevin du 31 octobre, qui remplace celle du 28 octobre : la barre n'est plus le retour d'un appui refusé) | `docs/decisions/2026-10-31-engine-hero-states.md` ; `shared/js/16-hero.js` (`LB.DENY_COL`) |
| Récupération | — | `LB.HERO_T.<geste>.rec` (0,7 s) | Table de timing, jamais en dur | `NOTES.md:5` ; `shared/js/16-hero.js` |
| Grâce | — | `LB.HERO_T.<geste>.grace` (0,06 s en blocage et tenu, 0,05 s en esquive) | Premières secondes de la récupération où un coup compte encore comme arrêté | `chapters/ch2-silent-bells/NOTES.md:27` |
| Parfait | Perfect | `perf` (ch2) | Jamais affiché à l'écran (mot d'annonce). Reste un compteur de fin au Chapitre II (« Parfaits ») | `chapters/ch2-silent-bells/src/js/72-flow.js:46` ; `tests/ch2-announce.js:13` |
| Riposte | Riposte | `closePat`, `R_CNT` (ch2) | Vient d'une **série réussie** ; pas de fenêtre « FRAPPE ! ». Jamais affichée à l'écran | `docs/CH2-SPEC.md:37` ; `chapters/ch2-silent-bells/NOTES.md:24` ; `chapters/ch1-ember-bridge/src/js/36-p2-foundry-logic.js:161` |
| Série | Series | — | Enchaînement d'attaques arrêtées (« Série bloquée », lecteur d'écran) | `archives/DECISIONS-2026-10-27-28.md#bloquer` |
| Contre | — | — | Phase III du Chapitre I : le physique se contre à la cloche, la distance avec des éclats, l'arme et le crochet avec le rayon au sol | `BIBLE.md:60-66` |
| Reflet (faux coup) | Reflection | `fool` (ch2) | Phase I du Chapitre II : esquiver sans mordre aux faux reflets | `docs/CH2-SPEC.md:36` ; `archives/DECISIONS-2026-10-27-28.md#etats-veilleur` ; `archives/DECISIONS-2026-10-27-28.md#deuxieme-passe` |
| Épreuve du feu | Trial by Fire | `trial`, `RUN` (ch1) ; `HERO_DIFF.trial` | Trois phases d'affilée, 4 PV au départ, +1 PV entre les phases (plafond : 4 PV), PV conservés, une mort ramène à la phase I | `BIBLE.md:41` ; `chapters/ch1-ember-bridge/src/page/body.html:77` ; `docs/decisions/2026-10-31-engine-hero-states.md` (n° 2 remplacé le 31 octobre) |

## Personnages

| Terme FR | Terme EN | Nom dans le code | Règle d'usage | Source |
|---|---|---|---|---|
| Veilleur | Watcher | `drawWizard` (ch1), `heroShape`, `drawHero`, `proHero` (ch2) | Le héros ; ne parle pas ; jamais nommé. Nom de code `Wizard` hérité, pas un terme du jeu | `BIBLE.md:15` ; `DEMANDES.md:60` ; `docs/LORE.md:130` |
| Veilleure | — (pas de féminin en anglais) | — | Féminin de Veilleur. La gardienne n'a pas de féminin en anglais (« its keeper »), il se voit à l'image | `docs/CH2-SPEC.md:10,59` ; `docs/LORE.md:128` |
| Colosse de braise | Ember Colossus (court : Colossus) | `demonBody` (silhouette) | Boss du Chapitre I, trois phases. Silhouette validée : on ne la change pas | `BIBLE.md:9,44` |
| Gardienne | keeper | — | Veilleure actuelle de la tour du Chapitre II, tombée avant le héros | `docs/CH2-SPEC.md:14,59` ; `docs/LORE.md:185` |
| La Voix Creuse | The Hollow Voice | `36-boss-hollow-voice.js` | Boss de la phase I du Chapitre II | `docs/CH2-SPEC.md:43,59` ; `chapters/ch2-silent-bells/src/js/64-prologue.js:124` |
| L'Ancien de Rouille | The Rust Elder | — | Boss de la phase II du Chapitre II. « Ancien » est un indice : il nomme un ancien Veilleur. Voir « À trancher » (Roi de Rouille) | `CHANGEMENTS.md:54-56` ; `docs/LORE.md:80,326` |
| Le Phare Noyé | The Drowned Lighthouse | `40-boss-drowned-beacon.js`, `drawBeacon`, `beaconState` (ch2) | Boss de la phase III du Chapitre II, deux formes ; aussi la tour | `docs/CH2-SPEC.md:59` ; `CHANGEMENTS.md:70` |
| La Sans-Fond | The Bottomless | — | Titre de la forme II ; parasite en forme de méduse. Le mot « parasite » n'est jamais employé à l'écran | `CHANGEMENTS.md:49` ; `docs/LORE.md:52,155` |
| Les Scellés | The Sealed | — | Nom courant des anciens Veilleurs enchaînés sous les tours. Aucun texte ne formule « les Scellés étaient des Veilleurs » | `BIBLE.md:21,23` ; `docs/LORE.md:50` |
| Les Liés | The Bound | — | Vrai nom des Scellés ; secret ; textes écrits seulement, à partir du chapitre IV | `BIBLE.md:21` ; `docs/LORE.md:42,51` |
| Les parasites | (jamais définis) | — | Lore seulement ; jamais nommés à l'écran | lore (`docs/LORE.md:52`) |
| L'Umbryn | The Umbryn | — | Présence ancienne endormie au centre. Secret | `BIBLE.md:21` ; `docs/LORE.md:53` |
| Les Doyens | The Priors | — | Plus anciens de l’ordre, vivants. Chapitre VI, pas dans le jeu | lore (docs/LORE.md) |
| Les Sonneurs | The Bellringers | — | Rang de l'ordre, jamais un titre de boss | lore (`docs/LORE.md:59,326`) ; `CHANGEMENTS.md:54,147` |
| Le Roi Spectral | The Spectral King | — | Vharos, principal des Doyens ; « le Doyen » en phase I du chapitre VI, avant sa transformation. Chapitre VI, pas dans le jeu. Ne pas toucher | lore (docs/LORE.md) ; CHANGEMENTS.md |
| Le Lié principal | — | — | Le héros à la fin (chapitre VII) : il succède au Premier Lié au centre. Il reste sept Liés. Secret, jamais dit à l’écran | lore (docs/LORE.md) |

## Éléments de jeu

| Terme FR | Terme EN | Nom dans le code | Règle d'usage | Source |
|---|---|---|---|---|
| Lumen | The Lumen | — | Flamme que porte chaque Veilleur dans sa lanterne. Sa vraie couleur est le blanc ; le héros a un jaune neutre (lanterne au repos `#ffe066`, allumée `#fffbe3`, en récupération `#a88f4a`, rouge de `deny` `#ff6b6b`) et ses tirs virent au jaune-blanc, cœur `#fffaee` (`LB.WATCHER_T.lantern`) | `BIBLE.md:22` ; `docs/LORE.md:48,117` ; `docs/decisions/2026-11-01-lanterne-couleur-releve.md` |
| braise | ember | — | Élément du Chapitre I, orange chaud. Minuscule pour le feu | `CLAUDE.md:18` ; `docs/LORE.md:109` |
| Sceptre-lanterne / lanterne | — | `lanternBeam` (rayon) | Seul outil du Veilleur ; tous ses contres viennent de lui | `BIBLE.md:31` ; `docs/CH2-SPEC.md:9` ; `chapters/ch1-ember-bridge/NOTES.md:24` |
| Cloche | bell | `ringBell` (ch1), `pHead` (ch2) | Le verrou. Au Chapitre I, la grande cloche répond, étourdit (1,3 s) et désarme | `BIBLE.md:22,64,71` ; `chapters/ch1-ember-bridge/NOTES.md:31` |
| Cloche de tête | — | `pHead` | La cloche du Phare, portée par le boss de la phase II ; signes anguleux (`RUNES`) | `docs/CH2-SPEC.md:33` ; `chapters/ch2-silent-bells/NOTES.md:98` |
| Couronne | Crown | `o.word` | Mot gravé en clair sur la cloche, visible après le dernier coup de la phase III | `docs/CH2-SPEC.md:33,59` ; `chapters/ch2-silent-bells/NOTES.md:98` |
| Couronne d'ancrage | The Anchor Crown | — | Cercle de six tours et une au centre. Nom secret, jamais expliqué | `BIBLE.md:20,26` ; `docs/LORE.md:46` |
| Flèches liées | The Bound Spires | — | Ce que les Veilleurs disent de leurs tours | `BIBLE.md:22` ; `docs/LORE.md:47` ; `docs/TEXTES-CH1.md:240` |
| Tour / flèche | tower / spire | — | Le lieu. Ne pas mélanger tour, Scellé et Couronne | `docs/LORE.md:40` |
| Fanal | beacon (Bell Tower beacon) | `drawFanal`, `R.fanalAt` | Fanal du Clocher (Chapitre I), allumé à la fin ; ne pas confondre avec le Phare Noyé | `chapters/ch1-ember-bridge/src/js/52-p3-belfry-decor.js:3-4` ; `docs/TEXTES-CH1.md:224` |
| Clocher des Veilleurs | The Watchers' Bell Tower | `R` (phase III), `belfry` | Décor de la phase III du Chapitre I | `DECISIONS.md` (« Refonte du lore Ch. I ») ; `docs/TEXTES-CH1.md:14` |
| Fonderie | Foundry | `Q`, `drawLake` | Décor de la phase II du Chapitre I | `BIBLE.md:9,53` |
| Pont de pierre | stone bridge | `G` | Décor de la phase I du Chapitre I | `BIBLE.md:9,52` |
| La salle des reflets / La cale / Les récifs | The Mirror Hall / The Hold / The Reefs | `ORDER=[2,1,3]` | Titres des trois phases du Chapitre II | `docs/CH2-SPEC.md:43,45,47,59` ; `chapters/ch2-silent-bells/src/js/64-prologue.js:112,119,124,130` |
| Rémanence | Afterglow | — | Évaporation du Lumen à la fin de la phase III du Chapitre II, sans texte ni bruitage | lore (`docs/LORE.md:57`) ; `CHANGEMENTS.md:131-133` |
| Masse | mace | `demonBody` | L'arme du Colosse est une masse, pas un marteau | `BIBLE.md:45,68` |
| Rage | rage | `rages`, `LB.rage(name)` (proposé) | Aucun nom à l'écran ; nom au lecteur d'écran. Chapitre I : Râle d'agonie, Fureur, Embrasement ; Difficile : Fureur de braise, Danse des chaînes, Embrasement final | `BIBLE.md:48` ; `archives/COMMUN-inventaire.md#s1-4` |

| Rages du Chapitre II | — (noms EN non définis dans les sources lues) | `storm()` (Tempête de cloches) | Échos (phase I), Nuage de rouille et Double vague (phase II), Marée montante (forme I), Tempête de cloches (forme II) | `docs/CH2-SPEC.md:104-118` ; `chapters/ch2-silent-bells/NOTES.md:89` |
| Harpon | harpoon | `harp` | Main gauche du boss de la phase II ; le crochet à chaîne n'existe qu'au Colosse | `docs/CH2-SPEC.md:108` ; `chapters/ch2-silent-bells/NOTES.md:97` |
| Code couleur par chapitre | — | `CH_COL` | I braise (orange chaud) ; II marée (turquoise `#4fe0cc`) ; III racine (vert mousse tirant sur le jaune) ; IV givre (bleu-blanc pâle) ; V cendre (gris argenté) ; VI ombre (violet) ; VII vide (blanc) ; héros jaune neutre | `docs/CH2-SPEC.md:72` ; `docs/LORE.md:107-117` ; `chapters/ch2-silent-bells/NOTES.md:94` |
=======
| Rages du Chapitre II | — (noms EN non définis dans les sources lues) | `storm()` (Tempête de cloches) | Échos (phase I), Nuage de rouille et Double vague (phase II), Marée montante (forme I), Tempête de cloches (forme II) | `docs/CH2-SPEC.md:104-118` ; `chapters/ch2-silent-bells/NOTES.md:129` |
| Harpon | harpoon | `harp` | Main gauche du boss de la phase II ; le crochet à chaîne n'existe qu'au Colosse | `docs/CH2-SPEC.md:108` ; `chapters/ch2-silent-bells/NOTES.md:112` |
| Code couleur par chapitre | — | `CH_COL` | I braise (orange chaud) ; II marée (turquoise `#4fe0cc`) ; III racine (vert mousse tirant sur le jaune) ; IV givre (bleu-blanc pâle) ; V cendre (gris argenté) ; VI ombre (violet) ; VII vide (blanc) ; héros jaune neutre | `docs/CH2-SPEC.md:72` ; `docs/LORE.md:107-117` ; `chapters/ch2-silent-bells/NOTES.md:109` |
| Clochette | handbell | — | Catalyseur de la lumière, même modèle que celle des sceptres : elle fait résonner le Lumen, elle n’en fournit pas. Chapitre III, pas dans le jeu | lore (docs/LORE.md) |


## Interface

| Terme FR | Terme EN | Nom dans le code | Règle d'usage | Source |
|---|---|---|---|---|
| Facile / Normal / Difficile | Easy / Normal / Hard | `DIFFS` (ch1), `HERO_DIFF` | PV du Veilleur 6 / 4 / 3 ; fenêtres × 2 / × 1 / × 0,6 ; Normal est la référence | `BIBLE.md:35-39` ; `chapters/ch1-ember-bridge/src/js/00-core.js:12` ; `archives/COMMUN-inventaire.md#s1-3` |
| Respire / À la loyale / Sans pitié / Challenge ultime | Breathe / Fair and square / No mercy / Ultimate challenge (anglais provisoire, à valider par le projet Lore) | `LB.menu` (`TX`) | Sous-titres de Facile, Normal, Difficile et de l'Épreuve, communs à tous les chapitres (décision du 1er novembre, appliquée par `menu/common`) ; remplacent « Le vrai combat », « Respirer », « Le Colosse déchaîné », « Sans soin » | `shared/js/28-ui.js` ; `docs/decisions/2026-11-01-menus-epreuve-sous-titres.md` |
| Épreuve du feu / Épreuve de l'eau | Trial by Fire / Trial by Water (anglais provisoire, à valider) | `CHAPTER.trial.name`, `data-diff="trial"` | « Épreuve » + élément du chapitre, dans tous les menus (sous-titre « Challenge ultime ») ; Chapitre III : « Épreuve de la terre » (anglais à fournir) | `chapters/ch1-ember-bridge/src/js/00-core.js` ; `chapters/ch2-silent-bells/src/js/02-core.js` |
| Note de l'Épreuve : « Tu récupères 1 PV entre les phases. » | *You recover 1 life between phases.* | `CHAPTER.trial.note` | Texte d'origine du Chapitre I, dans la note de l'Épreuve des deux chapitres (au Chapitre II, ancien sous-titre « Épreuve ») | `chapters/ch2-silent-bells/src/js/02-core.js` |
| Phase I sur III · … | Phase I of III · … | — | Sourcil des cartes de phase du Chapitre II ; le titre est le nom du boss | `chapters/ch2-silent-bells/src/js/64-prologue.js:119,124,130` ; `archives/DECISIONS-2026-10-27-28.md#ch2-gameplay-textes` |
| Chapitre II · Silent Bells | Chapter II · Silent Bells | — | Titre au menu ; « Ember Bridge · Chapitre II » disparaît. Badge « À venir » tant que verrouillé | `docs/CH2-SPEC.md:8` ; `BIBLE.md:8` |
| Passer | Skip | `#cineSkip` | Bouton des cinématiques (intro, outro) | `docs/COMMUN.md §1.6` |
| Aide | Help | `lb-help`, `LB.help` | Case décochée par défaut, activable partout (Difficile compris), désactivée en Épreuve ; « Activer l'aide visuelle » proposé à la 3ᵉ défaite en Facile (appliqué le 1er novembre, `menu/common`) | `docs/decisions/2026-10-28-engine-shared.md:8` ; `shared/js/28-ui.js` |
| Son / Musique | — | `lb-snd`, `lb-mus` | Options mémorisées dans les deux chapitres | `docs/decisions/2026-10-28-engine-shared.md:22` |
| Barre de récupération | — | `LB.drawRecoveryBar` | **Repère d'aide** : jamais visible d'office, elle ne s'affiche que si la case « Aide » est cochée, sous les pieds du Veilleur pendant la récupération, dans les trois phases des deux chapitres ; jamais rouge (décision du 31 octobre, qui remplace « toujours visible » du 28 octobre). Remplace l'arc gris des phases II et III du Chapitre I | `docs/decisions/2026-10-31-engine-hero-states.md` ; `shared/js/16-hero.js` |
| Fin de partie : Temps, Coups reçus, Parfaits, Record | Time, Hits taken, Perfects, Best | — | Stats du Chapitre II | `chapters/ch2-silent-bells/src/js/72-flow.js:46` |
| Fin de partie : Blocages, Esquives, Meilleur temps | Blocks, Dodges, Best time | — | Stats du Chapitre I (« Parades » / *Parries* remplacé le 31 octobre). Au Chapitre II, « Parfaits » / *Perfects* est un autre compteur (arrêts parfaits), gardé. Voir « À trancher » n° 6 | `chapters/ch1-ember-bridge/src/js/44-p3-belfry-logic.js` |

## Onomatopées autorisées à l'écran

Seules ces onomatopées et les titres de phase s'affichent (`BIBLE.md:16`). Les noms ci-dessous sont des mots, pas des annonces.

| Mot | Usage | Source |
|---|---|---|
| BAM, FWOOOSH, KRAAAK, BOOM, CHAK, SKRAAT, CLANG, THUNK, CRAAAC, KRAKOOM | Table `ONO` du Chapitre I. `CLANG` = blocage, `KRAKOOM` = coup final, `KRAAAK` = Veilleur écrasé | `chapters/ch1-ember-bridge/src/js/12-effects.js:21` |
| CLANG, KRAKOOM, KRAAAK | Table `ONO` du Chapitre II. `CLANG` aux phases II et III ; aucun mot en phase I ; plus de `BAM` | `chapters/ch2-silent-bells/src/js/08-effects.js:5` ; `archives/decisions/2026-10-28-ch2-retouches-3.md:15` |
| GRAAAH, RAAAH, HRRNGH, KHAAAA, GWOOOAR, AARRGH | Cris du Colosse touché, selon la force du coup, sans répéter | `BIBLE.md:75` |

## Termes interdits

| Terme interdit | Pourquoi | Source |
|---|---|---|
| « Parfait ! », « Paré », « Esquivé », « Touché », « Contré », « Un reflet ! », « Trop tard », « FRAPPE ! », « TIENS ! », « Coup de grâce » | Mots d'annonce à l'écran | `docs/CH2-SPEC.md:6` |
| « Coup double », « Bloqué », « Garde brisée », « Il revient », « Prépare la garde », « Riposte », « Parade » | Mots d'annonce (liste `BAN`, FR) ; testés sur le texte dessiné au canvas | `tests/ch2-announce.js:13-14` |
| « Perfect », « Parried », « PARRY! », « Dodged », « Countered », « A reflection », « Too late », « Strike! », « Hold! », « Get ready », « Final blow », « Double hit », « Hit! », « Blocked », « Guard broken », « Comes back », « × N » | Mots d'annonce (liste `BAN`, EN) | `tests/ch2-announce.js:15-16` |
| « PARADE ! », « DOUBLE / TRIPLE PARADE ! », « PARÉ ! », « DÉSARMÉ ! », « TOUCHÉ ! » | Anciens mots d'annonce du Chapitre I, convertis en onomatopées par la table `ONO` (`CLANG`, `BAM`) | `chapters/ch1-ember-bridge/src/js/12-effects.js:9,15` |
| « Le Roi n'est plus le Roi », « Fais taire le glas », « Ne crois pas ce que tu vois », « Éteins le phare », modes d'emploi dans les cartes de phase | Textes à supprimer de l'ancienne version | `docs/CH2-SPEC.md:56` |
| **parer**, **parade**, **paré** et dérivés | Le Veilleur n'a plus d'épée ; un seul geste, bloquer. Encore présents au Chapitre I (voir « À trancher ») | `docs/CH2-SPEC.md:98` ; `docs/COMMUN.md §1.2` ; `archives/DECISIONS-2026-10-27-28.md#bloquer` ; `CHANGEMENTS.md:101` |
| « bâton » pour la lanterne du héros | Elle s'appelle « sceptre-lanterne » / « lanterne ». (Le « bâton de Veilleur sans lanterne » du décor de la phase III est un objet à part) | `docs/CH2-SPEC.md:9` ; `archives/DECISIONS-2026-10-27-28.md#retouches` |
| « à genoux », « plie un genou » dans les textes de fin de phase I (Chapitre I) | Le genou est réservé à l'outro ; le Colosse n'est pas dit « à genoux » dans les textes | `CHANGEMENTS.md:79` ; `DECISIONS.md` (« Refonte du lore Ch. I ») |
| « Drowned Beacon » | Le nom EN est *Drowned Lighthouse* ; voir « À trancher » | `CHANGEMENTS.md:70,114` |
| « Sonneur » comme nom de boss | C'est un rang de l'ordre | `CHANGEMENTS.md:54,147` ; `docs/LORE.md:326` |
| « Gloamfall », « Mournhold », « Watchlight » comme terme | Termes écartés | `BIBLE.md:25` |
| « parasite » à l'écran, « Liés » avant le chapitre IV | Mots secrets, jamais employés à l'écran ni expliqués | `docs/LORE.md:42,52,96` |
| « les Scellés étaient des Veilleurs » (toute formulation) | La vérité n'est jamais dite | `BIBLE.md:23` ; `DECISIONS.md` (« Refonte du lore Ch. I ») |
| « ancre » seul pour désigner la Couronne ou le sceau | Le mot ne désigne plus rien dans le lore (l'ancre géante du Chapitre II est un accessoire) | `docs/LORE.md:40` |
| « brisée » pour une chaîne ou une lanterne (« une chaîne cède », « une lanterne s'éteint ») | Formulation retenue | `DECISIONS.md` (« Refonte du lore Ch. I ») ; `docs/LORE.md:118` |
| Nom, citation, musique ou icône tirés d'une œuvre existante | Propriété intellectuelle | `BIBLE.md:18` |
| Texte qui explique l'image | Ce qui se déduit du combat reste déduit | `BIBLE.md:19` ; `docs/CH2-SPEC.md:7` |
| « huitième Lié », « huitième place » | Abandonnés le 30 octobre : le héros succède au Premier Lié, il reste sept Liés | docs/LORE.md § 8, § 11 |

## À trancher

Incohérences entre documents, ou entre documents et code. Une ligne par point, sans proposition de choix.

| # | Point | Sources en tension |
|---|---|---|
| 1 | ~~Bouton de la phase III du Chapitre II : « Garde » / « Guard » ou « Bloquer » / « Block »~~ **Tranché le 30 octobre : « Bloquer » / « Block »** (voir `docs/decisions/2026-10-30-ch2-validations.md`) ; application : `CHANGEMENTS.md` J | `archives/DECISIONS-2026-10-27-28.md#bloquer` ; `chapters/ch2-silent-bells/NOTES.md:82` ; `docs/COMMUN.md §1.2` ; `docs/CH2-SPEC.md:98` |
| 2 | ~~Lecteur d'écran de la phase III du Chapitre II : « Ta garde est brisée » / *Your guard is broken* (`garde` / `guard`) alors que le vocabulaire est « bloquer »~~ **Tranché le 30 octobre : « Ta garde est brisée » / *Your guard is broken* est conservé volontairement** (texte du lecteur d'écran uniquement ; le bouton reste « Bloquer » / « Block ») | `chapters/ch2-silent-bells/src/js/12-hero-states.js:40` ; `archives/DECISIONS-2026-10-27-28.md#bloquer` |
| 3 | ~~Bouton « Parer » / *Parry* en phase III du Chapitre I, alors que « parer » est abandonné~~ **Tranché et appliqué le 31 octobre : « Bloquer » / *Block* dans les phases I et III du Chapitre I** (session `engine/hero-states`) | `chapters/ch1-ember-bridge/src/js/36-p2-foundry-logic.js` (`setPhaseUI`) ; `docs/decisions/2026-10-31-engine-hero-states.md` |
| 4 | ~~Textes du Chapitre I en « paré » / « Parade réussie » / « Combo paré », libellé « Parades » des stats, code `parry`, `parries`, `DMG_PARRY`~~ **Tranché et appliqué le 31 octobre : « bloqué » / « Blocage réussi » / « Combo bloqué » (lecteur d'écran), « Blocages » / *Blocks* (stats), aide « …le bon moment pour bloquer », mode d'emploi « bloquer, esquiver » ; code `blocks` (phases I et III), `dodges` (phase II), `blockSuccess`, `DMG_BLOCK`** | `docs/decisions/2026-10-31-engine-hero-states.md` ; `docs/TEXTES-CH1.md` |
| 5 | ~~`docs/CH2-SPEC.md` dit encore « Phase II : parer » et « fenêtres de parade » ; `BIBLE.md:35` dit déjà « Fenêtres de blocage »~~ **Tranché le 28 octobre : « bloquer »** ; application : `CHANGEMENTS.md` F | `docs/CH2-SPEC.md:36,38` ; `BIBLE.md:35` ; `CHANGEMENTS.md:101` |
| 6 | ~~Stats de fin : « Parfaits » (Chapitre II), « Parades » (Chapitre I), « Blocages » (recommandation de l'audit)~~ **Tranché le 31 octobre pour le Chapitre I : « Blocages » / *Blocks* ; le Chapitre II garde « Parfaits » / *Perfects* (autre compteur : arrêts parfaits)** | `chapters/ch2-silent-bells/src/js/72-flow.js:46` ; `chapters/ch1-ember-bridge/src/js/44-p3-belfry-logic.js` ; `docs/COMMUN.md:49` |
| 7 | ~~« Roi de Rouille » / *Rust King* (CH2-SPEC, DECISIONS, code, boucle d'affichage) ou « Ancien de Rouille » / *Rust Elder* (LORE, CHANGEMENTS B, statut « À faire »)~~ **Tranché : « l'Ancien de Rouille » / *The Rust Elder*** (`docs/LORE.md` ; `CHANGEMENTS.md` B, à faire) | `docs/CH2-SPEC.md:16,45,59,106` ; `DECISIONS.md` (« Chapitre II · Silent Bells ») ; `chapters/ch2-silent-bells/src/js/64-prologue.js:119` ; `docs/LORE.md:80,326` ; `CHANGEMENTS.md:54-56` |
| 8 | ~~Titre de la forme II : « L'Éclaté » / *The Shattered* ou « La Sans-Fond » / *The Bottomless*~~ **Tranché : forme II titrée « La Sans-Fond »** (`docs/LORE.md` ; `CHANGEMENTS.md` A et C, à faire) | `docs/CH2-SPEC.md:47,59` ; `chapters/ch2-silent-bells/src/js/64-prologue.js:130` ; `CHANGEMENTS.md:49` ; `docs/LORE.md:155` |
| 9 | ~~Texte de la forme II : carton « La tour éclate. Au milieu des débris, la méduse, à découvert. » dans le cahier des charges, à supprimer selon CHANGEMENTS A~~ **Tranché : carton de la forme II supprimé** (`CHANGEMENTS.md` A, à faire) | `docs/CH2-SPEC.md:47,67` ; `CHANGEMENTS.md:49` |
| 10 | ~~Textes de phases du Chapitre II : formulations du cahier des charges et de `CHANGEMENTS.md` § A différentes pour les mêmes écrans~~ **Tranché : les textes de `CHANGEMENTS.md` § A font foi** (à faire) | `docs/CH2-SPEC.md:43-47,63-67` ; `CHANGEMENTS.md:37-42` |
| 11 | ~~« Roi Sombre » (CH2-SPEC, DECISIONS) ou « Roi Spectral » (LORE, CHANGEMENTS F)~~ **Tranché : « Roi Spectral »** (`docs/LORE.md` ; `CHANGEMENTS.md` F, à faire) | `docs/CH2-SPEC.md:84` ; `DECISIONS.md` (« Chapitre II · Silent Bells ») ; `docs/LORE.md:99,327,348` ; `CHANGEMENTS.md:109` |
| 12 | ~~« Drowned Beacon » (Chapitre I, texte EN ; noms de code et commentaires du Chapitre II) ou *Drowned Lighthouse*~~ **Tranché : « Drowned Lighthouse »** (`CHANGEMENTS.md` D, à faire) | `chapters/ch1-ember-bridge/src/js/44-p3-belfry-logic.js:468` ; `chapters/ch1-ember-bridge/src/js/80-cine-outro.js:12` ; `chapters/ch2-silent-bells/src/js/40-boss-drowned-beacon.js:1` ; `CHANGEMENTS.md:70-77` |
| 13 | « Marteau de guerre » / « Combo de marteau » alors que l'arme est une masse (noms affichés non renommés) | `BIBLE.md:66,68` ; `NOTES.md:31` |
| ~~14~~ | ~~Nom de l'épreuve : « Épreuve du feu » (Chapitre I) ou « Épreuve » / « Sans soin » (Chapitre II)~~ → **tranché le 1er novembre** : « Épreuve » + élément du chapitre, dans tous les menus, voir `docs/decisions/2026-11-01-menus-epreuve-sous-titres.md` ; **appliqué le 1er novembre** (session `menu/common`, `docs/decisions/2026-11-01-menu-common.md`) | `BIBLE.md:41` ; `chapters/ch1-ember-bridge/src/page/body.html:77` ; `chapters/ch2-silent-bells/src/js/88-lang.js:7` ; `archives/COMMUN-inventaire.md#s1-3` |
| ~~15~~ | ~~Sous-titres : « Respire » / « Respirer » (Facile) ; « Le Colosse déchaîné » / « Sans pitié » (Difficile)~~ → **tranché le 1er novembre** : sous-titres communs à tous les chapitres, voir `docs/decisions/2026-11-01-menus-epreuve-sous-titres.md` ; **appliqué le 1er novembre** (session `menu/common`, anglais provisoire à valider) | `chapters/ch1-ember-bridge/src/js/68-texts-ui.js:7-9` ; `chapters/ch2-silent-bells/src/js/88-lang.js:7` ; `archives/COMMUN-inventaire.md#s1-3` |
| ~~16~~ | ~~Outil du héros : « sceptre-lanterne » (Chapitre I) ou bâton à cristal (Chapitre II, dessin)~~ **Tranché et appliqué le 1er novembre : le sceptre-lanterne dans les deux chapitres** (le Chapitre II reprend le Veilleur du Chapitre I, session `engine/watcher`, `docs/decisions/2026-11-01-engine-watcher.md`) ; reste la mention de `docs/CH2-SPEC.md:9` (session « 00 · Direction ») | `BIBLE.md:31` ; `docs/CH2-SPEC.md:9` ; `NOTES.md:42` ; `docs/COMMUN.md §1.5` |
| 17 | Rage de la phase I du Chapitre II : « Échos » (CH2-SPEC, lecteur d'écran) ou « Écho » (DECISIONS) | `docs/CH2-SPEC.md:104` ; `archives/DECISIONS-2026-10-27-28.md#sorts` |
| 18 | Onomatopée `BAM` du Chapitre II : `NOTES.md` du chapitre la liste (l. 26) et la retire (l. 150) | `chapters/ch2-silent-bells/NOTES.md:25,120` ; `archives/DECISIONS-2026-10-27-28.md#deuxieme-passe` |
| 19 | Numéros de phase internes du Chapitre II différents des numéros affichés (`ORDER=[2,1,3]`) | `chapters/ch2-silent-bells/NOTES.md:5` ; `chapters/ch2-silent-bells/src/js/64-prologue.js:112` |
| 20 | ~~`CLAUDE.md` cite `GLOSSAIRE.md` à la racine ; le fichier est `docs/GLOSSAIRE.md`~~ **Corrigé le 31 octobre : `CLAUDE.md` vise `docs/GLOSSAIRE.md`** | `CLAUDE.md:6` ; `README.md:31` |
