# Inventaire des sons — Chapitre I (Pont de braise)

Doc seule, aucun code modifié. Sources : `chapters/ch1-ember-bridge/src/js/04-audio-sfx.js` et `64-audio-music.js` (lus en entier), appels repérés par extraits dans `08-state.js`, `12-effects.js`, `16-p1-bridge-logic.js`, `36-p2-foundry-logic.js`, `44-p3-belfry-logic.js`, `52-p3-belfry-decor.js`, `76-cine-intro.js`, `80-cine-outro.js`.

Tout passe par `LB.audio` (`tone`, `noise`, contextes partagés). Aucun fichier audio : tout est synthétisé.

**Onomatopée** = texte flottant affiché au même moment ; « — » = aucun dans le code vu. **Remplacement** : catégorie de la liste cible ; « à créer » si aucune ne convient ; « (à valider) » = rattachement déduit, pas écrit dans le code.

## Briques communes (04-audio-sfx.js, 12-effects.js)

| Fonction | Moment | Onomatopée | Remplacement |
|---|---|---|---|
| `tone(f,d,type,v,slide)` / `noise(d,v,f0,f1)` | Brique de base de presque tous les sons | — | (brique, non remplaçable en soi) |
| `thud(p)` | Tout impact (p = puissance) : blocage, touché boss, encaisser | — | à créer (impact générique) |
| `boom(d,v)` | Coups sourds : entrées, impacts lourds, chute | BOOM / BOUM ! (parfois) | à créer |
| `whoosh(d,v,up)` | Élans, plongeons, cinématiques | — | à créer |
| `footfall(big)` | Pas du Veilleur et du Colosse (intros P1, P3) | — | à créer |
| `anvil()` | Parade sur coup de masse / lame, masse qui retombe | — | à créer (ou élan de la masse, à valider) |
| `roar()` | Rugissement : entrée Colosse P1, P2 (éruption), P3 (entrée, soin), cinématique | RAAAH ! | cris du Colosse : entrée / rage |
| `painCry(d,v)` | Cri de douleur long (P1 fin, finale P3) | — | cris du Colosse : chute |
| `cryVoice` / `hurtCry` (6 cris dans `CRIES`) | Colosse touché (`cry1`) | GRAAAH !, RAAAH !, HRRNGH !, KHAAAA !, GWOOOAR !, AARRGH ! | cris du Colosse : touché |
| `ringBell(amp,v)` | Grande cloche du Veilleur (P3), glas final | — | glas |
| `finEcho(v)` | Écho du glas (finale P3) | — | glas |
| `dblTell()` | Hard : chaîne double annoncée | — | chaîne |
| `chainTell()` | Annonce des souffles enchaînés | — | souffles (blocage) (à valider) |

## Phase 1 — Pont (16-p1-bridge-logic.js, 08-state.js)

| Fonction | Moment | Onomatopée | Remplacement |
|---|---|---|---|
| `introStep` (boom + whoosh) | Intro : arrivée du Colosse | — | cris du Colosse : entrée |
| `introStep` (`footfall`, `tone`, `roar`) | Intro : pas puis rugissement | RAAAH ! | cris du Colosse : entrée |
| `press` (blocage) | Joueur lève la garde | — | bloquer |
| `startAttack` (fouet, `tone` 110) | Début de la chaîne | — | chaîne |
| `startAttack` (épée, `tone` 180) | Début du triple coup | — | élan de la masse (à valider) |
| `startAttack` (souffle, `tone` 90) / `fyEnter` / `fl_in` | Préparation d'un souffle | — | souffles (à créer pour l'élan) |
| `bossStep` `windup→strike`, `sw1/2/3`, `fy_t`, `rk_t` | Frappe qui part (fouet, 3 coups, jet, rocher) | — | frappe |
| `resolveStrike` / `blockSuccess` | Frappe bloquée | CLANG | bloquer |
| `resolveSword` (`anvil`) | Coup d'épée paré ou non | — | bloquer / encaisser |
| `resolveSword` (raté) et `ballHit` | Joueur touché | BAM / COUP ! | encaisser |
| `hurtPlayer` | Joueur touché en fureur | BAM… | encaisser |
| `resolveFlame` (paré) | Souffle bloqué | CLANG | souffles (blocage) |
| `resolveFlame` (raté) | Souffle subi | BRÛLÉ ! | souffles (touché) |
| `startOrb` | Combo bloqué, orbe lancée | CLANG | à créer |
| `headHit`, `orbHit`, `legHit`, `ringHit` | Boss touché | — (cri via `cry1`) | toucher le boss + cris : touché |
| `startFury` | Entrée en fureur | — | cris du Colosse : rage |
| `bossStep` `fy_roar` / fin P1 (`F.a`, `F.b`, `F.r`) | Rayon final, `painCry`, marteau qui brise le pont | BOUM ! | cris du Colosse : chute |
| `bossStep` (F.s, F.j, F.c) | Pont brisé, Colosse plonge | — | à créer |
| Esquive | Pas d'esquive en P1 | — | — |

## Phase 2 — Fonderie (36-p2-foundry-logic.js)

| Fonction | Moment | Onomatopée | Remplacement |
|---|---|---|---|
| `qStep` (battements d'ailes, `noise`+`boom`) | Intro P2 | — | cris du Colosse : entrée |
| `qStep` (`tone` 90, PHASE II) | Intro P2 : titre | PHASE II | cris du Colosse : entrée |
| `qStep` (éclaboussure) | Colosse dans le métal en fusion | — | à créer |
| `qStep` (`roar`, `boom`) | Colosse jaillit du four | — | cris du Colosse : entrée |
| `qPress` (esquive) | Pas de côté | — | esquiver |
| `qResolve` (esquive réussie) | Attaque esquivée | — | esquiver |
| `qLaunch` | Départ d'une attaque | — | frappe |
| `qRage` | Rage du Colosse | — | cris du Colosse : rage |
| `qRoar` | Cri / éboulement (Difficile) | — | cris du Colosse : rage |
| `qHurt` | Joueur touché | HIT ! / ÉCRASÉ ! | encaisser |
| `qCounter` | Esquive parfaite, riposte | — | à créer |
| `qDamage` | Boss touché | — | toucher le boss |
| `qFinalStep` | Dernier assaut, rayon, explosions | COUP ULTIME ! | cris du Colosse : chute |

## Phase 3 — Beffroi (44-p3-belfry-logic.js, 52-p3-belfry-decor.js)

| Fonction | Moment | Onomatopée | Remplacement |
|---|---|---|---|
| `rStep` intro (`footfall`, `whoosh`, `boom`, `ringBell` 0,22) | Arrivée, cloche qui réagit | — | cris du Colosse : entrée / glas (à valider) |
| `rStep` intro (`roar`, `tone` 70) | Rugissement d'entrée | PHASE III | cris du Colosse : entrée |
| `rPress` (blocage) | Garde levée | — | bloquer |
| `rLaunch` | Départ d'une attaque | — | frappe |
| `rResolve` (gs/stab : `anvil`) | Coup de masse paré/non | CLANG (paré) | bloquer |
| `rResolve` (bomb) | Bombe explose | — | à créer |
| `rDamage` | Joueur touché | selon coup (`HTXT`) | encaisser |
| `rAtkEnd` | Combo bloqué, riposte | — | à créer |
| `rCnStep` (bell / bat / plant / bolt) | Contre : cloche, chauve-souris, masse, éclair | — | toucher le boss / glas (cloche) |
| `rBoss` `heal` | Colosse récupère ses PV (`roar`, notes montantes) | — | cris du Colosse : rage |
| `rFinale` (genou, `painCry`, masse au sol) | Début de la mort | — | cris du Colosse : chute / élan de la masse |
| `rFinale` (ailes brisées, `roar`) | Ailes coupées | CRAAAC | cris du Colosse : touché |
| `rFinale` (`coup`, `painCry`, explosions) | Coup fatal | — | cris du Colosse : chute |
| `rFinale` (chute, impact) | Colosse s'effondre | — | cris du Colosse : chute |
| `rFinale` (fanal, `painCry` pierre) | Pétrification | — | cris du Colosse : chute |
| `rFinale` (`ringBell` à FIN.glas) | Cloche finale | — | glas |

## Cinématiques

| Fonction | Moment | Onomatopée | Remplacement |
|---|---|---|---|
| `CUE` (intro) `tone` | Plan 2 | — | à créer |
| `CUE` (intro) `boom`+`roar` | Plan 3 | — | cris du Colosse : entrée |
| Outro (`tone` accords) | Fin du chapitre | — | à créer |

## Musique (64-audio-music.js)

Générée en direct (`musTick`, toutes les 90 ms ; aucun fichier). Le niveau `lvl` est calculé dans `musTick` ; le tempo vient de `bpm=[0,100,112,124,142,150,160][lvl]`. Pas de rampe : le tempo change par paliers.

| Phase | lvl | Tempo départ → final | Déclencheur de l'accélération | Instruments / voix | Fonctions |
|---|---|---|---|---|---|
| P1 | 1 | 100 | — (`R` et `Q` absents) | tambours (`mDrum`), basse dent de scie, nappe de cordes, arpège carré, mélodie triangle (thème `MLEAD`, Ré mineur) | `musStep`, `mVoice`, `mNoise`, `mDrum` |
| P2 | 2 | 112 | `Q` existe (P2 démarre) | + percussions courtes, mélodie dent de scie, arpège plus dense | `musStep` |
| P3 début | 3 | 124 | `R` existe | autre progression et thème `MCH3`/`MLEAD3`, cor en contre-chant (`MHORN3`), coups de cuivres | `musStep` |
| P3 soin | 4 | 142 | `R.healed` (Colosse a tout récupéré) | + cri d'agonie, tambours doublés | `musStep`, `musTick` |
| P3 rage 5 | 5 | 150 | `R.u5` | chœur de cuivres, chœur « ooh » (`mChoir`), basse octave ; gain bus 0,56 | `musStep`, `mChoir` |
| P3 dernière rage | 6 | 160 | `R.u55` | tambours serrés, lead doublé, chœur « aah », cordes galopantes ; gain bus 0,5 | `musStep`, `mChoir` |

Hors combat :

| Musique | Moment | Contenu | Fonctions |
|---|---|---|---|
| Menu | Menu visible | bourdon grave, nappe mineure, cloches lointaines (tempo libre, 4 s par pas) | `menuStep` |
| Finale | Mode `finale` de la P3 | partition calée sur `FIN` (cloche, foudre, ailes, coup, chute, élégie) | `finaleScore` |
| Espace / fin | Plan large puis fin du chapitre | Ré majeur, harpe/violoncelle, chœur doux, écho (4 s par pas) | `spaceStep` |

Aucune musique pendant la pause ni les écrans de texte. Les paliers de rage du chapitre II sont hors périmètre.
