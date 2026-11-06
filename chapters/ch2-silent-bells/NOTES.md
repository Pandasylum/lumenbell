# Chapitre II · Silent Bells (notes du dossier)

- **État** : import du 25 octobre (`archives/chapters/ch2-silent-bells/legacy/silent-bells.source.html`, tag `ch2-import`), puis étapes A (écarts techniques), B (gameplay et textes), C1 (décors, sorts, intro et outro, retouches) faites ; historique des étapes : `DECISIONS.md` et `ROADMAP.md`.
- **Cahier des charges** : `docs/CH2-SPEC.md` (décisions de Kevin du 27 octobre 2026). Lore : `docs/LORE.md`.
- **Pièges connus** : numéros de phase internes ≠ numéros affichés (voir `## Tests`).

## Fichiers
- `src/` : **la source à modifier**, en morceaux (28 octobre 2026, branche `engine/shared`), comme au Chapitre I : `src/parts.txt` donne l'ordre d'assemblage (= ordre d'exécution, une seule IIFE ouverte dans `js/00-open.js` et fermée dans `js/96-loop.js`) ; `build/assemble.py` colle les morceaux octet pour octet. Ancienne page unique `src/silent-bells.html` retirée : les numéros de ligne `ch2:NNN` de `docs/COMMUN.md` renvoient à elle.
- Carte : `page/head.html` (jusqu'au `<style>` ouvrant), `page/style.css`, `page/body.html` (de `</style>` au `<script>` ouvrant), `js/00-open.js` (ouverture de l'IIFE), `js/02-core.js` (clés, constantes, `DIFFS`, canvas, état), `04-audio-sfx.js`, `08-effects.js` (particules, motifs), `12-hero-states.js` (états du Veilleur), `16-update.js`, `20-draw-helpers.js`, `24-backgrounds.js`, `28-hero-draw.js` (choix de la pose du Veilleur commun : `drawHero`, `heroShape`), `32-boss-rust-king.js`, `36-boss-hollow-voice.js`, `40-boss-drowned-beacon.js`, `44-counters-help-frame.js`, `48-stills.js`, `52-cine-phases.js`, `56-form2-render.js`, `60-music.js`, `64-prologue.js`, `68-form2-logic.js`, `72-flow.js`, `76-epilogue.js`, `80-sfx-combat.js`, `88-lang.js`, `92-events.js`, `96-loop.js`, `page/end.html`. Coupes sur les commentaires de section ; la ligne vide qui précède reste à la fin du morceau précédent ; chaque morceau finit par un saut de ligne.
- `archives/chapters/ch2-silent-bells/legacy/silent-bells.source.html` : import d'origine, archivé, **ne pas modifier**. Aucun test ne le lit ; seul un commentaire de `build/build_chapter.py` le cite.
- `dist/index.html` : généré, suivi dans git ; à committer avec sa source.


## Build
- Commande, sorties et vérification CI : `NOTES.md:Outillage`. Chaque remplacement exige une occurrence unique : si la source change à cet endroit, le build échoue.
- Écarts entre `dist/index.html` et `src/` (les seuls), comme au Chapitre I :
  1. retrait de `<meta name="claude:viewport-fit-sides" content="cover">` (propre à l'hébergeur d'artefacts) ;
  2. retrait des trois `<link>` Google Fonts ;
  3. contenu de `build/fonts.css` inséré au début du `<style>` du jeu (Big Shoulders Display 700–800 et DM Sans 400–700, polices variables).
- La source garde la meta et les liens Google pour rester affichable telle quelle dans un aperçu en ligne.

## Gameplay (étape B, 27 octobre)
- **Difficultés** : PV et multiplicateurs `m` / `rm` (Veilleur 6 / 4 / 3 PV, Épreuve 4 PV) : `docs/COMMUN.md` (difficultés) et `tests/ch2-trial.js`. PV des boss inchangés (6 / 8 / 10, à régler après essais). `sp` (vitesse des attaques) inchangé.
- **Riposte** (`closePat`, table `R_CNT`) : dans les trois phases, une série sans faute déclenche la riposte automatique (2 dégâts si tous les blocages sont parfaits et la série compte au moins deux attaques à toucher). Phase III : foudre renvoyée vers la lanterne (forme I) ou la méduse (forme II). La contre-attaque « quand la lanterne faiblit, touche pour frapper » (menace `strike`) et la fenêtre de l'orbite de la forme II sont **supprimées** ; l'orbite tourne sans s'arrêter. Le barrage (rester appuyé) reste la mécanique de la phase. La contre-attaque à jauge de fatigue n'existait pas dans le code : rien à garder ni à retirer (réservée à un chapitre suivant).
- **Écrit à l'écran** : titres (cinématiques), noms de boss, cartons d'intro et d'outro, onomatopées `ONO` (voir « Deuxième passe »). Les rages et derniers assauts ne s'affichent plus : sting + `say()` (lecteur d'écran). Aide visuelle des faisceaux : un demi-cercle (pointillé : se préparer ; plein : tenir) au lieu de « TIENS ! ».
- **États du Veilleur** (communs aux deux chapitres depuis le 31 octobre, `engine/hero-states` : `LB.hero`, `shared/js/16-hero.js` ; ici `S.pl`, `down()`, `plStep()`, `PT()`, `gest()`) : `ready` → `act` → `recover` → `ready`. Le geste dépend de la phase (`GESTURE`, numéros internes) : blocage en phase II (`LB.HERO_T.block`), pas de côté en phase I (`dodge`), garde en phase III (`hold` : prolongée tant que le bouton est tenu, contre les faisceaux, avec l'endurance `S.pl.stam` ; `broken` 0,9 s de récupération si elle s'épuise). Mêmes durées qu'avant (0,333 s puis 0,7 s, × `m`, `rm`) : les tables `T` et `R_T` n'existent plus, `DG` ne garde que le retour d'un reflet (`backTurn`, `backWin`). Appui refusé (`deny` 0,25 s) : la lanterne du Veilleur passe au rouge (`LB.DENY_COL`, `LB.watcherLanternCol` dans `heroShape`) ; la barre de récupération (`LB.drawRecoveryBar`) n'est dessinée que si la case « Aide » est cochée (plus de barre d'office : changement de rendu du 31 octobre).
- **Résolution à l'impact** : arrêt à l'impact, `grace`, `perf`, coup reçu (`hurt`, étourdissement raccourci), reflet esquivé : valeurs dans `docs/COMMUN.md` (machine à états, tables de durées) ; cas vérifiés par l'en-tête de `tests/ch2-input.js`.
- **Animation** : pas de côté (`S.dodgeT`) et blocage (`S.guardT`) datés au seul passage de `ready` à l'action ; un appui refusé ne les touche pas. Le dôme de la phase III suit l'état (`S.holding` = garde en cours).
- **Déblocage** : `UNLOCK_ALL = true` (en tête du script) ouvre les trois phases de la frise dès le départ ; `false` rétablit le déblocage progressif par `lb-ch2-unl` (fonction `unlocked()`). Difficultés et Épreuve : toujours ouvertes ; la frise est fermée en Épreuve.
- Les définitions mortes (`P1`, `P2`, `P3`, `spawn`, `fooled`, `anim1`, `drawOrbs` déclarées deux fois, la seconde l'emportait) ont été retirées ; seules restent celles du bas du script.

## Textes (étape B)
- Source : `docs/CH2-SPEC.md`. Cartes : sourcil = titre de phase, titre = nom du boss, texte = panneau d'entrée (`PH[id].desc`) ou de fin (`PH[id].end`), forme II (`PH[3].form2`). Fin de phase III : carte « Phase III terminée » entre la cinématique de fin et l'outro ; victoire : « Chapitre II · Silent Bells » + records.
- Intro (`PCAP_TXT`, durées `CINE_D.intro`, titre `PRO_TITLE`) et outro (`ECAP_TXT`, durées `CINE_D.outro`) : cartons du cadre commun `LB.cine` (voir plus bas). Titre de l'intro : `LB.title` (« LUMEN » turquoise + « BELL » crème, chapitre dessous en Big Shoulders crème, comme au Chapitre I ; vérifié par `tests/title.js` de 360 px au bureau). Carton 5 de l'outro : « Chapitre III · Hollow Roots. À suivre. » (EN « Chapter III · Hollow Roots. To be continued. », titre du Chapitre III fixé dans `docs/LORE.md` § 15 le 1er novembre), légende teintée `CH_COL[3]`.
- `seriesTitle`, `SERIES_T` et `caption()` (légende dessinée dans le canvas) ont été retirés le 1er novembre : la légende est celle du module, en HTML sous l'image.
- Menu (menu commun depuis le 1er novembre) : « Lumenbell » puis « Chapitre II · Silent Bells » dessous ; pas d'accroche, de mode d'emploi, de version ni de chapitre suivant (`CHAPTER` n'en déclare pas). Titre de page : « Lumenbell · Silent Bells » (le build coupe sur cette ligne).
- **Liste de référence** : `TEXTES.md` (dans ce dossier), régénérée par `node tests/ch2-texts.js --write`. Toute modification de texte doit la mettre à jour dans le même commit (relire le diff).
- Phrases pour le lecteur d'écran seulement (`say`, `aria`) : descriptives, hors cahier des charges, à relire si besoin (lignes 1 à 12 et 44 à 55 de `TEXTES.md`).

## Texte : `_(en, fr)`
- Même ordre qu'au Chapitre I. Depuis le 28 octobre (`engine/shared`) : `const _=LB._;` (fonction commune, `shared/js/08-lang.js`), langue courante `LB.lang.cur`. **Langue par défaut : celle de l'appareil, sinon anglais** (avant : français) ; boutons de langue dans l'ordre EN, FR (comme au Chapitre I). `<html lang="fr">` reste dans la page, remplacé au démarrage par `applyLang`.

## Clés de sauvegarde
Table des clés et des anciennes clés lues : `shared/NOTES.md:Clés`. Ce chapitre déclare seulement `LB.setup({id:'ch2', old:{'lb-ch2-unl':['db-unl']}, oldPrefix:[['lb-ch2-best-','db-best-']]})` dans `js/02-core.js`.
- Drapeau « intro vue » : `lb-ch2-intro` (1er novembre, `engine/cine`) ; le prologue n'est joué qu'au premier lancement d'une partie, puis seulement par le bouton « ▶ Intro » du menu (`#introBtn`, en haut à gauche, comme au Chapitre I ; `replayPrologue()` : joué par-dessus le menu, l'état de la partie, temps du jeu et partie en pause compris, est rendu tel quel à la fin).

## `<head>`
- Repris dans les styles du jeu : `html{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}` (zones sûres, utiles sur téléphone avec `viewport-fit=cover`). Le reste de l'enveloppe (`color-scheme:light`, `box-sizing`, police et fond du `body`, `[hidden]`, `img`) était écrasé par les styles du jeu ; `scroll-padding-top` ne servait pas (pas d'ancres).

## Tests
Descriptions : en-tête de chaque fichier et `NOTES.md:Outillage` (lancement local : `PW_CHROMIUM`, `NOTES.md:Pièges`).
- Fichiers : `tests/ch2-texts.js`, `ch2-keys.js`, `ch2-smoke.js`, `ch2-trial.js`, `ch2-input.js`, `ch2-title.js` (lance `title.js`, les deux chapitres), `cine.js` (passage et drapeau, les deux chapitres), `ch2-retouches3.js`, `ch2-announce.js`, `ch2-bot.js` ; outil commun `ch2-lib.js` (copie de test à crochets `build/out/ch2-test.html`, non suivie ; le `dist` publié n'a aucun crochet).
- Numéros de phase : interne `S.phase` 2 = Phase I (la Voix Creuse), 1 = Phase II (l'Ancien de Rouille), 3 = Phase III (le Phare Noyé) ; `ORDER=[2,1,3]`. Le test lit `document.body.dataset.ph` (interne) et `#hdEye` (affiché).

## Pièges
- Plus d'écran de démarrage (retiré le 5 novembre) : les tests ouvrent le chapitre directement.

## Mesures des états du Veilleur (27 octobre, `node tests/ch2-input.js`)
| Cas | Résultat |
|---|---|
| Spam à l'aveugle toutes les 0,25 / 0,5 / 0,75 / 1 s, Normal, phases I / II / III | mort dans les 12 cas, en 7 à 15 s, boss à 8/8 (7/8 une fois) |
| Idem en Difficile | mort dans les 12 cas, en 5 à 10 s, boss à 10/10 (9/10 une fois) |
| Un appui trop tôt (0,05 / 0,1 / 0,2 s avant l'ouverture de l'action), Normal, 72 cas | 1 coup : 58 ; 0 coup : 14 (tous à 0,05 s trop tôt en phases II et III : l'attaque tombe dans les 0,06 s de grâce de la récupération ; en phase I la grâce est de 0,05 s) ; jamais 2 |
| Joueur parfait, Normal et Difficile, 3 phases | 0 coup |
| Spam toutes les 0,25 s pendant 4 s en phase I (16 appuis) | 5 pas de côté seulement (les autres appuis : barre rouge) |

Mesures précédentes (table `INPUT`, remplacée) : appuis toutes les 0,25 s → mort ; un appui trop tôt → 1 coup dans 72 cas sur 72. Avant toute correction (blocage de 0,25 s, rien en phase III) : marteler en phase III en tenant la garde battait le boss sans coup reçu.

## Mesures de la phase III sans contre-attaque (27 octobre, `node tests/ch2-bot.js 100`)
Victoires sur 100 parties (formes I et II), temps moyen d'une victoire, coups reçus en moyenne :

| Erreur de timing (σ) | Normal (4 PV, fenêtre 0,2 s) | Difficile (3 PV, fenêtre 0,12 s) |
|---|---|---|
| 40 ms | 100/100, 55,6 s, 0,0 | 99/100, 69,9 s, 0,0 |
| 70 ms | 99/100, 63,6 s, 0,3 | 39/100, 80,5 s, 1,3 |
| 100 ms | 81/100, 69,7 s, 1,4 | 2/100, 84,0 s, 2,0 |

Avec la table `INPUT` (remplacée) : Normal 100/100, 99/100, 86/100 ; Difficile 100/100, 52/100, 2/100.

Avec les états du Veilleur (bot visant le milieu de la fenêtre d'arrêt : 0,14 s avant l'impact en Normal, 0,075 s en Difficile ; 100 parties) : Normal 100/100 (73,6 s), 98/100, 60/100 ; Difficile 84/100, 9/100, 0/100. La fenêtre n'est plus symétrique : il faut avoir lancé l'action avant l'impact (0,333 s × m), seules 0,05 à 0,06 s de grâce sont accordées après ; un appui en retard est un coup reçu. Difficile (action 0,2 s, récupération 0,84 s) est nettement plus dur : timings à régler dans la session d'équilibrage.

Avant l'étape B (main : 6 / 5 PV, fenêtres 0,2 / 0,155 s, contre-attaque à frapper, que le bot touchait aussi), 30 parties : Normal 30/30 à 40, 70 et 100 ms (45,7 / 50,0 / 57,6 s) ; Difficile 30/30, 30/30, 28/30. La phase reste gagnable ; elle est plus longue (riposte à 1 dégât quand la série ne compte que des faisceaux) et Difficile est nettement plus dur (3 PV, fenêtre ×0,6) : à régler avec les PV des boss après les essais sur téléphone.

## Vocabulaire : bloquer, plus de parade (28 octobre)
- Voir `docs/GLOSSAIRE.md` (bloquer / esquiver, mots interdits à l'écran).
- Clé gardée : `S.guardT` (date d'animation du blocage). Les durées sont dans `LB.HERO_T` (`block`, `hold`).

## Nouveaux sorts (étape C1, partie 2, 28 octobre, `ch2/spells`)
- **Table `SP`** (à côté de `FINAL_AT`) : toutes les durées des nouveaux sorts, × `f` comme les autres séries ; valeurs **provisoires** reprises des sorts voisins (le commentaire de la table dit d'où vient chacune).
- **Phase II** (`P1`) : `wave(big)` (menace `wave` : `tl` pied posé, `ti` blocage), `rafter(ti)` (menaces `rafter` n = 1 et 2), `surge()` = vague + poutre (remplace `stomp` et `rock`), `dwave()` (rage), `rust()` (rage : `S.rust` = nuage, puis une menace `slam` avec `ls` et `rust`). Dessin : `drawWave()`, `drawRafter()` (table `RAFTER`), `drawRust()` (`RUSTP`, `S.kingHead`).
- **Phase III, forme I** (`P3`) : `kwave()` (menace `kwave`, maintien comme `beam`), `tide()` (rage : vague puis deux `spike` avec `tide`). Dessin dans `drawBeacon()`.
- **Phase III, forme II** (`P3b`) : `storm()` (rage : menaces `sring` puis `trap` avec `hold`, `ta`, `tb`). La cloche-piège sait maintenant appuyer (maintien) en plus de tomber (tap).
- **Phase I** (`P2`) : `echoR()` (rage : l'écho, puis deux `shard` avec `from` = reflet 1 ou 2 qui se brise). `drawBoss2()` cache le reflet brisé ; `drawOrbs()` fait partir l'éclat de son visage.
- **Contrôle du 28 octobre** : joueur parfait (bot à erreur nulle) sur chaque nouveau sort forcé, Normal et Difficile : 0 coup reçu dans les 14 cas. Bot de la phase III (20 parties) : Normal 20/20, 20/20, 11/20 à 40 / 70 / 100 ms ; Difficile 17/20, 2/20, 1/20 (avant les nouveaux sorts : 20/20, 19/20, 11/20 ; 20/20, 0/20, 0/20).

## Visuels des combats (étape C1, 27 octobre, `ch2/visuals-fights`)
- **Couleur** : `CH_COL[2]`, `--acc` (code couleur : `docs/CH2-SPEC.md`).
- **Décors** (`bg1` cale, `bg2` salle des reflets, `bg3` récifs) : plus de forge, de neige, de lac gelé ni d'aurore. `bg2` dessine l'eau ; le reflet est posé par `mirrorFloor()` après le Veilleur et le boss (copie du haut de l'image, retournée et écrasée ; table `MIRROR`) ; la trappe (`HATCH`, `drawHatch(k)`) est fermée sous l'eau pendant le combat et s'ouvre à la fin de la phase I. Embruns : `SPRAY` ; rochers : `reefRock()`.
- **Pièces du Roi = pièces de la tour** (`PDRAW`, `TOWER`) : `tb0`, `tb1` (avec la cage du cœur), `tb2` (les trois cloches du torse), `ring` ×6 (jambes), `sbell` ×2 (épaules), `seg` ×4 (bras), `head` (cloche de tête), `fist` (main droite), `harp` (harpon de la main gauche). Le Roi (`drawBoss1`) dessine son torse, ses épaules et ses jambes avec ces fonctions : une retouche d'une pièce change le Roi et la tour. `FIXED(k)` : pièces qui restent sur le récif quand la tour éclate (cloches du torse, poing, harpon) ; `STUMP` : leur empilement en forme II. Sommet de la tour : `LY = GY-333`.
- **Harpon** : `harpoon(x, y, angle, longueur)` (pointe en (x, y), renvoie l'anneau pour la chaîne) ; `pHarp` le dessine tenu. Attaques `chain` (trois lancers) et `hpOut`/`hpBack` (aller, puis retour) : main gauche, mêmes temps qu'avant.
- **Cloche** : `pHead(heat, o)` ; signes anguleux (`RUNES`, `runes()`) toujours ; `o.word` (mot gravé, `_('Crown','Couronne')`) et `o.crack` après le dernier coup (`bellMarks()`). Repos final : `BELL_REST`.
- **Cinématiques** : temps des nouveaux moments dans `CINE_P1` (lanterne : chute, enfoncement ; trappe), `CINE_P2` (ancre tirée du sol puis mise dans le dos ; lueur qui monte de l'épave), `CINE_P3` (zoom sur la cloche). Lanterne : `lanternPos()`, `keeperLantern()`, `sinkGlow()` (pulsation et trappe, posées après le reflet). Ancre au sol : `ANCHOR_FLOOR`.
- **Pics de récif** : `spikeTell()` (annonce) et `reefSpikes()` (coup reçu), mêmes temps qu'avant.
- **Menu** : le SVG garde sa construction ; aurore → brume, montagnes → mer et récifs, neige (`.msn`) → embruns qui montent.
- **Planches avant/après** des PR de l'étape C1 : `archives/chapters/ch2-silent-bells/shots/` (archivées, JPEG, avant à gauche = `main`, après à droite). Pièces de revue, à supprimer une fois les visuels validés.

## Intro et outro (étape C1, partie 3, 28 octobre, `ch2/visuals-cinematics`)
- `drawPrologue(t)` : plans `PRO_SHOTS` (côte et village, Phare au large, plage, haut du Phare + Veilleur + titre) ; cartons `PCAPF`, titre `PRO_TITLE` (inchangés) ; sons `PSFX`. `drawEpilogue(t)` : plans `EPI_SHOTS` (matin, gros plan de la cloche, vallée du Chapitre I, sous les vagues, forêt + titre) ; cartons `ECAPF`, titre `EPI_TITLE` (inchangés) ; sons `EFXL` ; tours de la vallée `VTOW`, tour qui s'éteint `TOWER_OUT` à `EPI_DARK`, fissures `VCRACKS`.
- Décors partagés : `lighthouse(x, y, échelle, lueur)` (le Phare de pierre), `village()`, `boat()`, `seaBand()`, `mist()`, `skyGrad()`. Le gros plan de la cloche réutilise `pHead()` avec `bellMarks()`.
- Retirés : `PSTARS`, `proMarsh`, `hangBell` (étoiles, marais, cloche suspendue de l'ancienne version). `proHero()` a été retiré le 1er novembre (le prologue et l'épilogue appellent `LB.drawWatcher`).

## Retouches du 28 octobre (`ch2/retouches`)
- **Intro** : `PRO_T` (durées des cartons comme au Chapitre I, fondus), `PRO_SHOTS` calculé (débuts des plans A à E), `PRO_TITLE`, `PRO_LEN` ; textes dans `PCAP_TXT`, temps des cartons dans `PCAPF`. **Outro** : 4 plans + titre, `SPIRE` (Flèche de la forêt).
- **Fonds fixes des cartons de fin** : `S.still` (id interne de la phase, posé par `clearedCard`, remis à 0 par `resetPhaseState`) ; `drawStill(id)` est dessiné à la place de la scène tant que la carte est ouverte.
- **Trappe** : `HATCH` (position, marche, `toll` = intervalle du tintement), `hatchTop()`, `drawHatch(k)` (dessinée avec la salle, donc reflétée), `S.hatchSnap` (chaîne rompue), `hatchRing()` (ondes du tintement, `S.hatchRing`), son `bellMuffled`. Vue d'en dessous dans `bg1`. Descente de caméra : `S.camDY` (entrée de la phase II).
- **Fin de phase II** : `hullSky(k)` (trou dans le pont, ciel, `MOON`), `hullDebris()` (`DEBRIS`), `moonCone()`, `kingKneel()`, `moonOnKing()` ; temps dans `CINE_P2` ; fond fixe `kingEndStill()`.
- **Restes de Veilleur** sur le Roi : cape et anneau dans `drawBoss1`, cage `deadLantern()`. Phase III : `WRECKS`/`wreck()`, membrures, bâton sans lanterne, lune, dans `bg3`.
- **Rages** : `DIFFS[..].u` (seuils), `RAGE` (cri, dernier assaut), `rageMarks()` (cases soulignées de la jauge, classe `mark`), `S.rageN` / `S.rageNext` / `S.roarT` ; `spawn()` lance le cri puis le sort de rage (`gen(stage, f, b, false, rage)` : `rage` = numéro de la rage). `angerCheck()` est remplacé (le nom va au lecteur d'écran par `rageBanner()`).
- **Pluie de bris** : `RAIN` (espacement aléatoire, marge et étourdissement du Difficile, valeurs du Chapitre I) ; `stops(th)` reçoit la menace pour la marge.
- **Orbes illusoires** : pleines, contour en pointillé (`drawOrbs`).

## Deuxième passe de retouches (28 octobre, `ch2/retouches`)
- Onomatopées : `ONO` = `block` (`CLANG`), `final` (`KRAKOOM`), `crush` (`KRAAAK`) ; plus de `hit`.
- Lueur du miroir : `MIRROR_GLOW`, `mirrorLight()` (dans `drawVoice`, visage de la vraie Voix seulement).
- Bâton sans lanterne : `STAFF` (dans `bg3`). Plus de `bossBar` (transformation de la phase III).
- Choc de la riposte : `SHOCK` (valeurs du Chapitre I), `S.hitstop` (dans `update`, le temps du jeu `gt` recule d'autant : arrêt sur image), `S.flashHit`, `S.recoil`, `S.rings`, `S.bossHurtT` ; son `sfx.thud`. Le corps du boss est décalé et incliné dans `draw()` (fonction `body`).
- `retryPhase()` repart toujours de la forme I.
- Illusions (règle de série validée le 30 octobre : esquiver une illusion n'est pas une faute, la faute est le coup de retour reçu ; appliquée le 31 octobre) : `fooled()` ne casse plus la série (`pat.ok`), il lance une menace `back` réelle (`DG.backTurn`, `DG.backWin`) ; `drawOrbs` la fait passer derrière le Veilleur et durcir (pointillé qui s'efface). Test : `tests/ch2-input.js`, partie 4.

## Troisième passe de retouches (28 octobre, `ch2/retouches-3`)
- **Entrée de la phase III** : le Veilleur est déjà posé ; la caméra recule depuis lui (`CINE_P3.reveal`, `revealZ`, `revealX`, `revealY`). Plus de `whooshDown` ni de `land` dans `CSFX['3:in']`.
- **Décor de la phase III** : table `HULL` (côtes, mât et voile, ponts, pointes, flottants, ballant), `hullRuin()` et `floatDebris()` dans `bg3`. Bâton et lune inchangés.
- **Onomatopées** : `CLANG` aussi à la garde de la phase III (`success`, phase 3). Phase I : aucun mot ; phase II : aucun mot pour les attaques du Roi.
- **Chocs** : `SHOCK.form` (1 = tour : `thud` + `bellHit`, étincelles ; 2 = méduse : `sfx.squelch` + `MUSIC.fx('jellyHit')`, éclaboussures translucides). `damageBoss` lit la forme en phase III.
- **Test** : `node tests/ch2-retouches3.js` (crochets de test étendus dans `tests/ch2-lib.js`).
- **Avancement** : fait = points 1 à 4 ; point 5 (retours du test de Kevin) vide. Reste à faire : juger au téléphone la caméra d'entrée, le décor et les deux sons de choc ; régler `HULL` et `SHOCK.form` ensuite.
- Décisions : `archives/decisions/2026-10-28-ch2-retouches-3.md`.
- **Mesure du bot de la phase III** (100 parties, après cette passe) : Normal 100/100, 94/100, 41/100 ; Difficile 60/100, 3/100, 0/100 (aucune logique de combat touchée : le tirage de `Math.random` change avec les nouvelles particules, d'où les écarts de `--check` à 20 parties : 17/20 une fois à 70 ms, 20/20 sur `main`).

## Audio commun (session `engine/audio`, 28 octobre)
- Plus de contexte propre : `04-audio-sfx.js` est réduit à `ensureAudio`, `tone`, `noise` (renvois à `LB.audio`), `sfx`, `play` ; `60-music.js` (`MUSIC`) se branche sur `LB.audio.ctx` (sortie brute `LB.audio.dest`) et lit `LB.audio.sound` / `music` au lieu de `fxOn` / `musOn`. Niveaux déclarés dans `LB.setup` (`audio:{master:.75,sfx:.9,mus:.3}`). Cases Son / Musique : `syncAudio` (`92-events.js`) appelle `LB.audio.setSound` / `setMusic`.
- Code mort `MUS` / `musTick` (`04-audio-sfx.js`) toujours présent, branché sur `LB.audio.mus`.
- **Avancement** : fait = rebranchement, test `tests/audio.js`. Reste à faire : juger sur téléphone la latence des bruitages (contexte commun en `latencyHint:'playback'`) et la reprise après écran verrouillé.

## Lore : `CHANGEMENTS.md` A, B, C, H, J(a), J(b) (31 octobre, `ch2/lore-changements`)
- Textes : voir `TEXTES.md` ; plus de carton à la forme II (le combat reprend après la cinématique) ; boss affiché « L'Ancien de Rouille » / « The Rust Elder » ; forme II « La Sans-Fond » / « The Bottomless » ; bouton de la phase III « Bloquer » / « Block ». Noms de code inchangés (`drawBoss1`, `kingKneel`…).
- Lumière : `HEART_GLOW` + `heartSeams()` (`32-boss-rust-king.js`) = cœur turquoise fixe dès la phase II, visible par les jointures ; les lueurs de la Sans-Fond (cœur de la tour, méduse, points des tentacules) ne pulsent plus. Seules pulsent la lanterne de la gardienne et la lueur au fond de l'eau de l'outro.
- Rémanence : `evaporate()` et table `REMANENCE` (`08-effects.js`), déclenchée à la dissolution de la méduse (`ecFinale`). Les particules à `c2` passent de `c` à `c2` pendant leur vie.
- Décisions : `docs/decisions/2026-10-31-ch2-lore-changements.md`.

## Veilleur du Chapitre I (session `engine/watcher`, 1er novembre)
- Le Veilleur est celui de la série (`shared/js/20-watcher.js`, `LB.drawWatcher`) : heaume, tabard, sceptre-lanterne à petite cloche. Plus de tête ronde, d'écharpe, de sacoche ni de bâton à cristal (`drawWizard`, `wizPoly`, `proHero` retirés). `heroShape(x, y, pose, opt, tint, ghost)` choisit la couleur de la lanterne, l'intensité (`lamp` = 1 − `S.lampDim`) et pose `S.orbX` / `S.orbY` (centre de la lanterne : départ des ripostes).
- Poses (`drawHero`) : phase I `dodgeSide` (`S.dodgeT`, 0,38 s, image rémanente), phase II `block` pendant l'action + bouclier `LB.drawBlock` (remplace l'arc bleu), phase III `hold` + dôme ; `hurt` (coup reçu, garde brisée ; voile rouge gardé) ; ripostes `counter` (phase II, ruée) et `cast` ; cinématiques `S.heroPose` = `{staffA, lean}` (angle du bâton) ; défaite `down`, couché. Prologue `walk` puis `idle`, épilogue `idle`. Respiration au repos et en cinématique.
- Barre d'endurance (phase III) à `y − 206` (elle couvrait la lanterne à `y − 150`).
- Menu : silhouette commune avec la lanterne (`shared/svg/watcher-menu.svg`, ligne `@svg` de `page/body.html`) ; l'œil turquoise est retiré (la règle CSS `.mscene .eye` reste, sans effet).

## Phare Noyé : sommet d'avant C1 (1er novembre, `ch2/phare-v1`, `CHANGEMENTS.md` M)
- **Restauré** : les deux blocs sombres qui encadrent la méduse au sommet de la tour (commit `2b75101`, supprimés par `0bad679`). Dans `2b75101`, c'étaient les cloches d'épaule (`sbell`) couchées à côté de la lanterne. Aujourd'hui `sbell` sert de balcon : pour ne pas bouger les balcons, les blocs sont une pièce propre à la tour, `PDRAW.lamp` (`pLamp`, le dessin de `pSmallBell` de `2b75101`, avec le `bronze()` actuel), placée par `LAMPS` (70 px de chaque côté de la lanterne, 24 px plus bas) et dessinée par `lamps(jx, jy, opacité, écart)`.
- **Hors de `TOWER`** : aucun index, aucune pose, aucun son ni aucune menace ne change (`RINGS`, `SBELLS`, `MOV`, `EFALL`, `CSFX` identiques). L'Ancien (`drawBoss1`) ne les dessine pas : son aspect est identique au pixel.
- Où ils sont dessinés : `drawBoss3` (forme I, menu), `drawTransform` (apparaissent pendant que la méduse descend dans la lanterne : `down`), `ecTransition` (projetés à l'éclatement, effacés avec `gl`), `drawEclGame` (menace `reform` : opacité `k`). Forme II au repos : rien n'est ajouté ; le sommet de la forme II de `2b75101` est déjà celui d'aujourd'hui (cloches d'épaule de part et d'autre de la cloche de tête, au-dessus de la méduse).
- **Tempête de cloches** (`storm()`, menaces `sring`) : les anneaux partent des lanternes latérales `P[SBELLS[side]]` de la forme II (contrôlé à l'image), pas des blocs, qui n'existent qu'en forme I. Timings inchangés.
- **Tranché par Kevin (1er novembre)** : les deux blocs sont les « lanternes latérales », pièces propres à la tour, trouvées au sol, sans équivalent chez l'Ancien (phrase sous le tableau de `docs/CH2-SPEC.md`). Bronze actuel gardé.

## Lanternes latérales : tirs et construction (1er novembre, `ch2/phare-v1`, 2e passe)
- **Poses** : `lampPoses(jx, jy, k, écart)` (autour de la méduse, `k` = rayon / 36 ; le point de la pose est le milieu de la bouche, d'où partent les lumières ; index 0 = gauche, 1 = droite). `drawLamps(poses, opacité)`. Au sol au début de la phase III : `LAMP_FLOOR` (sur la plage, au centre, x = 400 et 560, séparées : retour de Kevin du 1er novembre) ; après la mort de la Sans-Fond : `LAMP_REST` (cinématique de fin et fond fixe `drawStill`).
- **Construction** : `lampFly(t)` dans `drawTransform` ; elles sont emportées du coin au sommet par une tentacule, avec les temps existants de la cloche de tête (gauche) et de l'ancre (droite) : aucun nouveau temps.
- **Forme I** : faisceau (`beamShape(bx, a, côté)` : depuis la lanterne du côté où le balayage commence, `th.dir`), foudre (annonce et éclair depuis une lanterne, choisie par `th.seed`), crépitement d'annonce de charge (aux deux bouches). Le faisceau de la cinématique d'entrée et celui de la reformation (forme II) partent de la lanterne droite.
- **Forme II** (retour de Kevin du 1er novembre) : les lanternes et les cloches d'épaule échangent leurs places (elles se ressemblent, la tour éclatée ne change pas) : les lanternes sont tenues en haut par les tentacules, aux poses `P[SBELLS[…]]`, hors de la partie cachée ; les cloches d'épaule se placent près de la méduse (`drawEcl`, 8e paramètre `sw` : 1 = échangées, 0 = tour). Échange progressif à l'éclatement (`sw = gl`) et à la reformation (`sw = 1 - k`). Faisceaux latéraux `lbeam` et anneaux `sring` partent de `P[SBELLS[th.side]]`, donc des lanternes (les anneaux alternent, `side = i % 2`). À la fin, chaque pièce tombe à la place de l'autre ; le fond fixe `drawStill` suit le même échange.
- Rien ne change dans la logique : temps, tables, zones de coup, tirages aléatoires (aucun `burst` ajouté).
- **Écart avec 2b75101** : dans cette version, la forme I ne tirait pas depuis les blocs (faisceau et crépitement partaient de la méduse, la foudre du ciel) ; seule la forme II tirait depuis les lanternes latérales (alors les cloches d'épaule).

## Prologue et épilogue dans le cadre commun (session `engine/cine`, 1er novembre)
- `PRO` (`72-flow.js`, drapeau `lb-ch2-intro`) et `EPI` (`76-epilogue.js`, sans drapeau) sont des `LB.cine.create` : canvas plein écran au-dessus de la page, légende HTML sous l'image, bouton « Passer › » du module (le `#skip` du jeu ne sert plus qu'aux cinématiques de phase), Échap / Entrée / **Espace** passent (Espace restait bloqué ici). `S.mode` reste `prologue` / `epilogue` pendant la lecture ; `draw()` ne peint alors que du noir sous la boîte ; la fin vient du module (`endPrologue`, `endEpilogue`), plus de `PRO_LEN` / `EPI_LEN`.
- **Durées** : table `CINE_D` (`64-prologue.js`) : intro `[6, 7, 7, 7, 6]` (A à D + plan du titre ; avant `[6, 7, 7, 7]` + 4,6 s), outro `[7, 6, 6, 7, 7]` (avant ≈ 4 s par carton, 19 s en tout ; maintenant 33 s). `PRO_SHOTS` et `EPI_SHOTS` en découlent ; les temps internes de l'épilogue (tour qui s'éteint `EPI_DARK`, fissures `VCRACKS`, sons `EFXL`, carton 5 `EPI_TITLE`) sont comptés depuis le début de leur plan, comme avant.
- **Cadre retiré des scènes** : creux au noir entre les plans, fondus de début et de fin, légendes dessinées, grand titre « Chapitre III. À suivre. » dessiné sur la forêt (devenu la légende teintée du carton 5). Les plans eux-mêmes (`PRO_SHOTS`, `EPI_SHOTS`, Phare, village, vallée, forêt, Veilleur, particules, sons) sont inchangés ; le carton 5 de l'épilogue reprend le plan de la forêt.
- `cineScene(fn, vignette)` (`72-flow.js`) dessine un plan dans le canvas du module (`ctx` échangé le temps du dessin)  ; le temps du jeu `gt` (particules) avance avec la boucle du jeu comme avant, et ne suit le temps du module (`onTick`) que si la boucle est arrêtée (menu ouvert, rejeu).
- Copie de test (`tests/ch2-lib.js`) : `LB.cine.manual = true`, `step(dt, dessiner)` fait aussi avancer `LB.cine` ; `__t.PRO`, `__t.EPI`.
- `tests/ch2-smoke.js` : passe le prologue par Échap avant de cliquer la frise (le prologue couvre maintenant l'en-tête).

## Carte « à suivre » (session `ch2/cinematics`, 1er novembre)
- Le carton 5 de l'épilogue dessine « LUMENBELL · CHAPITRE III » / « HOLLOW ROOTS » par `LB.nextCard` (`76-epilogue.js`, forêt, depuis `EPI_TITLE`), vert mousse `CH_COL[3]` ; `CH_COL` est maintenant `LB.CH_COL` (`shared/js/24-cine.js`). Légende inchangée. Cinématiques de phase (trappe, descente, fin de phase II, transformation, fin de phase III) : pas passées par `LB.cine`, à faire plus tard.

## Cadre commun (session `menu/common`, 1er novembre)
- Menu, écran de démarrage, cartes, pause, entrées, HUD, aide et plein écran : `shared/js/28-ui.js` (voir `shared/NOTES.md`), alimentés par `CHAPTER` (`js/02-core.js` : turquoise `#4fe0cc`, ligne du chapitre `#9fe4ff`, embruns, « Épreuve de l'eau » et sa note d'origine). Le menu est celui du Chapitre I (structure, ordre du titre, polices, tailles) ; la scène SVG reste dans `page/body.html`, ses animations propres (faisceau, méduse, brume, tentacules) dans `page/style.css`.
- **Nouveau pour le joueur** : écran de démarrage (Commencer + langues, le clic lance la musique du menu), plein écran dans l'en-tête et le menu, Entrée / Espace au menu (Normal), W et Z, « ▶ Outro » après la vraie fin (`lb-ch2-end`, écrite à la victoire ; `replayEpilogue()` dans `72-flow.js`), records de l'Épreuve sous Normal et Difficile, cartes et pause aux boutons l'un sous l'autre, frise masquée en Épreuve, `TRIAL_OPEN` (`js/02-core.js`).
- **Aide** : `LB.help` (plus d'aide cochée d'office en Facile ; désactivée en Épreuve) ; 3ᵉ défaite en Facile : « Activer l'aide visuelle » à la place de « Menu » sur la carte de défaite. Repère (`drawHelp`, `44-counters-help-frame.js`) : `LB.cue` pour l'attaque réelle la plus proche (barre en Normal et Difficile à `CUE_Y` au-dessus des pieds, cercle en Facile) ; demi-cercle des faisceaux et pointillé des reflets gardés.
- Retirés : `84-menu-art.js` (`renderMenu`, `MS`, canvas `#mc` : code mort), `OPT_KEY`, `frameScene` (cadrage portrait propre au chapitre), anciennes cartes `.brow`, écouteurs de touches du chapitre (`LB.input` ; les cinématiques de phase prennent Entrée / Échap par `skip`).
- 2026-11-02 (engine/next-card) : le carton de l'épilogue n'a qu'un appel `LB.nextCard` (rendu commun, `LB.NEXT_T`) ; pas de dessin local du titre « à suivre » (garde dans `tests/cine.js`).
- 2026-11-02 (engine/brand-colors) : « LUMEN »/« BELL » (titre d'intro, carton « à suivre », menu) suivent `LB.BRAND` : « LUMEN » couleur du chapitre, « BELL » crème ; aucune couleur en dur pour ce mot dans le chapitre (garde dans `tests/cine.js`).

- 2026-11-02 (`menu/common-ui`) : lien « chapitre suivant » et carte de défaite / de fin communs (`shared/js/28-ui.js`) ; `CHAPTER.next` = `{n, title, open?}` (couleur dérivée de `LB.CH_COL`), cartes avec `onMenu` au lieu de `go2` « Menu ». Décision : `docs/decisions/2026-11-02-menu-common-ui.md`.

- 2026-11-02 (`menu/crown` A, `shared/` seulement) : ouvert depuis le hub (`site/chN/index.html?from=hub`), le chapitre n'a pas d'écran de démarrage et son menu montre « Retour » vers le hub ; ouvert seul, écran de démarrage et plus de lien en bas du menu (« chapitre suivant » retiré). `CHAPTER.next` retiré (2 novembre, `hub/cleanup`). `dist` reconstruit (seuls les morceaux communs changent).
- 2026-11-02 (`menu/crown-fixes`, session moteur) : bouton plein écran retiré de l'en-tête et du menu ; mouvement réduit lu par `LB.motion` (réglage du hub, sinon le système) ; lien du menu « Chapitres » ; ouvert depuis le hub, la carte de la vraie fin (hors Épreuve) porte « Chapitres » et ramène au hub (`LB.hubEnd`). Voir `docs/decisions/2026-11-02-hub-fixes.md`.

## Sorts de l'Ancien de Rouille (5 novembre, `ch2/ancien-sorts`)
- Refonte de `P1` : harpon (`hpOut` + `plank` ×2), balayage 2 / 3 / 4 coups (en Difficile le 4e est une `wave` d'ancre), vague + poutre, rage 1 nuage de rouille (`S.rust` jusqu'au KO) + balayage, rage 2 double vague + harpon, rage finale Glas (`toll` à `gid`, décor `rafter` / `dchain`), Finish (`finishStart`, contre `finish`). Durées provisoires dans `SP`. `slam`, `chain`, `toll` hors de la rotation (noms gardés).
- Contres : `counterKing(k)` (un par sort : `S.cnt.spell` = dernier sort de la série), Veilleur en pose `cast` sans ruée. Glas : `S.glasN` (total contré, pas une série), `S.echoes` (échos renvoyés) ; pas de riposte à dégâts en rage finale, seul le Finish termine.
- Décision et points à valider : `docs/decisions/2026-11-05-ch2-ancien-sorts.md`. Tests : `ch2-smoke`, `ch2-input` (joueur parfait Normal et Difficile : 0 coup).
- Balayage en combo : `SP.sweep.d` (écarts entre impacts par difficulté), animation `comboPose` (poses `SWP`, 64-prologue.js, branchée en tête de `anim1raw`).
