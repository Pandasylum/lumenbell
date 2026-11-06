⚠ Périmé pour le Chapitre II depuis le 2026-11-04. Valeurs actuelles : voir docs/decisions (2026-11-04-c2-pv-rage-calque-c1, 2026-11-04-c2-rage-relance-c1, 2026-11-05-rythme-uniforme, 2026-11-06-voix-vitesse-x1, 2026-11-06-boss-rules) et LB.BOSS_DIFF / LB.BOSS_RULES (shared/js/18-boss-diff.js). Périmé : PV et seuils de boss du C2, facteur f (sp, ×1,1 de rage, vitesse de la Voix), rythme interne des attaques, durées « avant ⟹ après rage ». Valable : Partie 1 (Chapitre I), gestes du Veilleur (shared). Les tableaux C2 ne sont régénérés que lors du prochain rééquilibrage d'un boss, à la demande de Kevin.

# BALANCE — Lumenbell, Chapitres I et II

*Doc seule, généré par lecture du code (branche `main`) — aucune valeur inventée. Les valeurs du code sont recopiées ; une valeur dérivée porte sa formule. Hors périmètre : `docs/` uniquement.*

## Lecture

- **Cellule Facile / Normal / Difficile** : `prép. / fenêtre / durée` en secondes, multiplicateurs appliqués. **prép.** = du début de l'attaque à son premier impact (ou au début de la tenue pour un faisceau) ; **fenêtre** = temps pendant lequel un appui arrête l'attaque (voir ci-dessous) ; **durée** = voir le titre de chaque table.
- **Fenêtre d'un tap** = `act + grâce` (`LB.hero.stops`, `shared/js/16-hero.js:58`) : appui au plus `act` avant l'impact (le Veilleur est en action), ou dans la grâce de sa récupération. Fenêtre de **tenue** (C2, faisceaux) = tb − ta.
- **C2 — rythme interne** : aucune accélération par difficulté ni par rage ; le rythme interne des attaques = durées du Normal en secondes réelles (décision du 5 novembre 2026, `docs/decisions/2026-11-05-rythme-uniforme.md`). La fenêtre d'un tap ne change pas.
- **prov.** = O quand le code lui-même marque la valeur « PROVISOIRE ». **contre** : riposte du Veilleur (C1 phase III seulement).
- Ordre des phases C2 à l'écran : I Voix Creuse (interne P2), II Ancien de Rouille (interne P1), III Phare (interne P3, formes I et II) — `ORDER=[2,1,3]`, `64-prologue.js:95`.

### Gestes du Veilleur (communs, `LB.HERO_T` / `LB.HERO_DIFF`, `shared/js/16-hero.js:13-30`)

| | Facile | Normal | Difficile |
|---|---|---|---|
| PV du Veilleur (hp) | 6 | 4 | 3 |
| m (action) / rm (récupération) | 2 / 1 | 1 / 1 | .6 / 1.2 |
| action = .333 × m (bloquer, esquiver, tenir) | .666 | .333 | .1998 |
| récupération = .7 × rm | .7 | .7 | .84 |
| grâce (bloquer, tenir .06 · esquiver .05) | .06 / .05 | .06 / .05 | .06 / .05 |
| parfait = .08 × m (appui au plus ce délai avant l'impact) | .16 | .08 | .048 |
| refus d'appui (deny) | .25 | .25 | .25 |
| étourdissement après coup : base .38 (bloquer, esquiver) / .55 (tenir), plancher .14, marge .2 → min(base, max(.14, écart − .2)) | | | |
| garde tenue : drain .36 /s · regen .38 /s · brisée .9 s | | | |
| **fenêtre tap** bloquer (= act + .06) | .726 | .393 | .26 |
| **fenêtre tap** esquiver (= act + .05) | .716 | .383 | .25 |
| Épreuve (tn / th) | 4 PV au départ, +1 entre les phases, plafond 4 (`HERO_DIFF.trial`) | | |

## Partie 1 — Chapitre I : Ember Bridge

### En-tête C1

| | Facile | Normal | Difficile | source |
|---|---|---|---|---|
| PV du Colosse, phases I et II (`bhp`) | 8 | 10 | 14 | `00-core.js:13-15` |
| PV du Colosse, phase III (`rbhp`, défaut = bhp) | 8 | 10 | 12 | `00-core.js:15,19` |
| Rages phase I (fureur : PV du Colosse → niveau, `fury`) | 4 → fureur 5 ; 1 → fureur 1 | 5 → 5 ; 1 → 1 | 10 → 5 ; 5 → 6 ; 1 → 1 | `00-core.js:13-15` |
| `rageHp(d,2)` (phase II : `rages` ou `[u]`) | [4] | [5] | [10, 5] | `00-core.js:26` |
| `rageHp(d,3)` (phase III : `[ru]` ou `[ru, u2]`) | [4] | [5] | [8, 5] | `00-core.js:19,26` |
| Dernier assaut (PV du Colosse) | 1 | 1 | 1 | `44-p3-belfry-logic.js:130` (`R.bhp<=1`), fureur 1 |
| `DIFFS[..].u` | 4 | 5 | 10 (`u2` 5, `ru` 8) | `00-core.js:13-15` |
| Jets de fureur (`jets`) | 2 | 4 | 4 (séquences propres, `furySeq`) | `00-core.js:13-15` |
| Seconde vie (phase III) | non | oui | oui | `44-p3-belfry-logic.js:205` |
| Fenêtre du souffle `fm` (flwin = .2 × fm, BRW = .2 × fm) | fm = m = 2 | 1 | 1 (`fm:1`) | `60-ui-menu.js:73-75` |
| Pause entre attaques | I : rand(1.2, 2.2) · II : rand(.8, 1.4) | idem | rand(.5, .9) (`waitMin/Max`) | `08-state.js:14`, `36-p2…:65` |
| Table de timing phase I | `T` (`00-core.js:44-47`) | idem | `T` surchargée par `DIFFS.hard.t` (`00-core.js:16`) | |

**Durées de geste, Épreuve** : voir le tableau commun ci-dessus ; `RUN` : max 4, cur 4, +`heal` 1 entre phases (`00-core.js:40`).

**Débris / pierres (pluie)** — C1 n'a pas de table `RAIN` : phase II, cri `qRoar` (**Difficile seul**) = 5 chutes, 1re à .9 + rand(0, .2), espacement rand(.55, .9) (code `rand(DIFF.hard?.55:.32, DIFF.hard?.9:.62)`, la branche .32–.62 n'est jamais utilisée), grâce +`DG.wide` .13, étourdissement `DG.fall` .14 (`36-p2-foundry-logic.js:6,100-105`). Phase III : attaques `rocks` (pierres) et `roar` (5 chutes en Difficile, `44-p3-belfry-logic.js:77-83`). Phase I : rocher de la fureur 1 (`rk_t` .5 + `rk_j` .55, `16-p1…:295`). Étourdissement d'un coup de pierre en phase III : `R_T.down` .55.

**C1 · Phase I — le pont (geste bloquer, grâce .06 ; PV Colosse 8 / 10 / 14)**

| sort | nom de code | geste | contre | prép. | fenêtre | durée | dégâts | Facile | Normal | Difficile | source | prov. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Crochet (bloqué : rebond .42 + étourdissement du Colosse, puis attente) | `whip (windup→strike)` | bloquer | — | windup+strike | act+grâce | +rebound+stagger | 1 PV | 1.25 / 0.726 / 2.42 | 1.25 / 0.393 / 2.42 | 0.92 / 0.26 / 1.94 | 16-p1-bridge-logic.js:54 · T 00-core.js:44 | N |
| Double crochet (Difficile seul ; 2e coup .18+.32 après le 1er) | `whip dbl` | bloquer | — | windup+strike |  | +.5+rebound+stagger | 1 PV | — | — | 0.92 puis 1.42 / 0.26 / 2.44 | 16-p1-bridge-logic.js:73 · 16-p1-bridge-logic.js:268 | N |
| Marteau 2 coups (Facile/Normal) · 3 coups (Difficile) ; contre = orbe (cast+orb) | `sword (sw1→sw2→sw3)` | bloquer | — | sw1w+sw1 | act+grâce | dernier coup+cast+orb | 1 PV | coups 1.2 / 2.35 · prép 1.2 · fen 0.726 · durée 3.3 | coups 1.2 / 2.35 · prép 1.2 · fen 0.393 · durée 3.3 | coups 1.01 / 1.64 / 2.51 · prép 1.01 · fen 0.26 · durée 3.46 | 16-p1-bridge-logic.js:89 · 16-p1-bridge-logic.js:276 | N |
| Souffle (fenêtre propre : flwin×fm + .03, sans grâce ; bloqué : élan .28+.1, Colosse « hurt » 1.0) | `flame (fl_in→fl_out)` | bloquer | — | fli+flo | flwin×fm+.03 | +dash+.1+1.0 | 1 PV | 0.85 / 0.43 / 2.23 | 0.85 / 0.23 / 2.23 | 0.75 / 0.23 / 2.13 | 16-p1-bridge-logic.js:142 · fm 60-ui-menu.js:73 | N |
| Souffles enchaînés (Difficile ; après crochet/marteau bloqué ; chance .75 si PV≤5, .4 si PV≤10, ou après 2 attaques simples) | `startComboFlame (fli .35 puis .3)` | bloquer | — |  |  |  | 1 PV | — | — | 0.6 puis 1.15 / 0.23 / 2.53 | 16-p1-bridge-logic.js:134 · chain 00-core.js:16 | N |
| Fureur 1 (rage) : PV Colosse ≈ Facile 4 · Normal 5 · Difficile 10 ; fin = bague du Veilleur (−1 PV Colosse, +1.05) | `startFury (jets j, souffles b, rochers r)` | bloquer | — | roar 1.0 + premier jet |  | roar 1.0 + jets, 1er jet fyt+.3, suivants fyg+fyt+.3 ; souffle fli+.25 (.3 si précédent b) ; rocher .5+.55 | 1 PV / jet | jj → prép 1.75 / durée 2.65 | jjjj → prép 1.75 / durée 4.45 | jjjjjj → prép 1.66 / durée 5.21 | 16-p1-bridge-logic.js:179 · 16-p1-bridge-logic.js:291 | N |
| Fureur 2 (Difficile seul) : PV Colosse 5 | `startFury (jets j, souffles b, rochers r)` | bloquer | — | roar 1.0 + premier jet |  | roar 1.0 + jets, 1er jet fyt+.3, suivants fyg+fyt+.3 ; souffle fli+.25 (.3 si précédent b) ; rocher .5+.55 | 1 PV / jet | — | — | jjbbjj → prép 1.66 / durée 5.04 | 16-p1-bridge-logic.js:179 · 16-p1-bridge-logic.js:291 | N |
| Fureur finale (PV Colosse 1) : le Veilleur lève sa lanterne (+3.9 s, fin de phase) | `startFury (jets j, souffles b, rochers r)` | bloquer | — | roar 1.0 + premier jet |  | roar 1.0 + jets, 1er jet fyt+.3, suivants fyg+fyt+.3 ; souffle fli+.25 (.3 si précédent b) ; rocher .5+.55 | 1 PV / jet | jjr → prép 1.75 / durée 3.7 | jjjjr → prép 1.75 / durée 5.5 | jjbbrrr → prép 1.66 / durée 6.77 | 16-p1-bridge-logic.js:179 · 16-p1-bridge-logic.js:291 | N |

Attente avant chaque attaque : Facile/Normal rand(1.2, 2.2) (`08-state.js:14`) ; Difficile rand(waitMin .5, waitMax .9). Colosse touché par une orbe/élan : hurt 1.0–1.1 (orbe : 1.1) ; par la bague : 1.25. Coup reçu : étourdissement fixe du Veilleur hitSw .3 (coup non dernier) / hitSwLast .55 / hitFl .9 (souffle) / hitFy .55 (fureur) — `00-core.js:47`. Raté : accroché = lift .55 + hold .22 + slam .16 (coup à +.93 s), puis release .6. Choix d'attaque : crochet d'abord, puis tirage au sort parmi crochet / marteau / souffle (pas 3 fois de suite). Fenêtre du souffle : flwin = .2×fm (fm = m en Facile → ×2, Normal ×1, Difficile fm:1).

**C1 · Phase II — la Fonderie (geste esquiver, grâce .05 ; PV Colosse 8 / 10 / 14)**

| sort | nom de code | geste | contre | prép. | fenêtre | durée | dégâts | Facile | Normal | Difficile | source | prov. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Coups de griffe / Rafale de griffes (Diff.) (impacts 0.9 · 1.65 ; Diff. 0.8 · 1.15 · 1.95 · 2.3) | `claws` | esquiver | — | 1er impact | act+grâce | dernier impact+.5 | 1 PV | 0.9 / 0.716 / 2.15 | 0.9 / 0.383 / 2.15 | 0.8 / 0.25 / 2.8 | 36-p2-foundry-logic.js:9 · 36-p2-foundry-logic.js:14 | N |
| Coup d'ailes / Barrage d'ailes (Diff.) (impacts 1 · 1.7 · 2.4 ; Diff. 0.95 · 1.5 · 1.85 · 2.6 · 2.95) | `wings` | esquiver | — | 1er impact | act+grâce | dernier impact+.5 | 1 PV | 1 / 0.716 / 2.9 | 1 / 0.383 / 2.9 | 0.95 / 0.25 / 3.45 | 36-p2-foundry-logic.js:9 · 36-p2-foundry-logic.js:14 | N |
| Lancer de débris / Débris et boule de feu (Diff.) (impacts 0.95 · 1.55 ; Diff. 0.95 · 1.6 · 2.2) | `rocks` | esquiver | — | 1er impact | act+grâce | dernier impact+.5 | 1 PV | 0.95 / 0.716 / 2.05 | 0.95 / 0.383 / 2.05 | 0.95 / 0.38 (+DG.wide .13 sur rochers) / 2.7 | 36-p2-foundry-logic.js:9 · 36-p2-foundry-logic.js:14 | N |
| Cri : éboulement de 5 chutes (Difficile seul ; chute = « fall », +DG.wide .13, étourdissement DG.fall .14) | `roar (qRoar)` | esquiver | — | .9+rand(0,.2) |  | prép + 5×rand(.55,.9) | 1 PV / chute | — | — | 0.9–1.1 / 0.38 / 3.65–5.6 | 36-p2-foundry-logic.js:100 · DG 36-p2-foundry-logic.js:6 | N |
| Queue (après rage) : coup de queue ajouté +.85 après le dernier impact ; 2e queue +.55 (Difficile, 2e rage) | `tail` | esquiver | — | dernier impact+.85 |  |  | 1 PV | +.85 / 0.716 | +.85 / 0.383 | +.85 puis +.55 / 0.25 | 36-p2-foundry-logic.js:92 | N |
| Rage (Facile/Normal) : rugissement qRage 1.6 (puis .8) avant une attaque + queue | `qRage(…,'rand')` | — | — |  |  | rugissement 1.6 (1ère), .8 ensuite | 1 PV | 1.6 / .8 | 1.6 / .8 | — | 36-p2-foundry-logic.js:66 · 36-p2-foundry-logic.js:79 | N |
| Dernier assaut (PV Colosse 1) : rugissement 1.3 puis chaîne griffes → ailes → débris (→ cri en Difficile), pause .55 entre | `chain` | esquiver | — |  |  | somme des 3–4 attaques + 2–3×.55 + queues | 1 PV | griffes+ailes+débris | griffes+ailes+débris | griffes+ailes+débris+cri | 36-p2-foundry-logic.js:69 · case 'gap' 36-p2-foundry-logic.js:218 | N |

Attente avant attaque : Facile/Normal rand(.8, 1.4) (`36-p2-foundry-logic.js:65`), Difficile rand(.5, .9) ; premier tour .6. Rages : Facile à PV 4, Normal à PV 5 (qRage) ; Difficile `DIFFS.hard.rages` = [10, 5] (cris qRoar « ENRAGEMENT » puis « RAGE », la 2e donne la double queue). Échec d'une attaque : Colosse « fail » 1.0 ; touché : « hurt » .55. Choix : griffes d'abord, puis hasard (pas 3 fois de suite).

**C1 · Phase III — le Clocher, première vie (geste bloquer, grâce .06 ; PV Colosse 8 / 10 / 12)**

| sort | nom de code | geste | contre | prép. | fenêtre | durée | dégâts | Facile | Normal | Difficile | source | prov. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Marteau de guerre / Bélier, combo et explosion (Diff.) | `greatsword` | bloquer | plant (coup .85 / fin 1.5) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 0.75 / 0.726 / 2.55 · 3 coups | 0.75 / 0.393 / 2.55 · 3 coups | 0.85 / 0.26 / 4.4 · 5 coups | 44-p3-belfry-logic.js:7 · Diff. 44-p3-belfry-logic.js:21 | N |
| Grêle de braise (Facile 3 blocs) / Bombes de braise (Diff.) | `avalanche` | bloquer | bat (coup .67 / fin 1.35) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 0.9 / 0.726 / 2 · 3 coups | 0.9 / 0.393 / 2.6 · 5 coups | 3.3 / 0.26 / 5.9 · 5 coups | 44-p3-belfry-logic.js:8 · Diff. 44-p3-belfry-logic.js:22 | N |
| Charge, piétinement, geyser (Facile sans geyser) / + recharge (Diff.) | `charge` | bloquer | bell (coup .85 / fin 1.45) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 1 / 0.726 / 2.25 · 2 coups | 1 / 0.393 / 3 · 3 coups | 1 / 0.26 / 5.1 · 4 coups | 44-p3-belfry-logic.js:9 · Diff. 44-p3-belfry-logic.js:23 | N |
| Crochet / Double crochet (Diff. ; Quatre crochets en rage « danse ») | `whip` | bloquer | plant (coup .85 / fin 1.5) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 0.75 / 0.726 / 1.25 · 1 coup | 0.75 / 0.393 / 1.25 · 1 coup | 0.92 / 0.26 / 2.02 · 2 coups | 44-p3-belfry-logic.js:10 · Diff. 44-p3-belfry-logic.js:69 | N |
| Combo de marteau (2 coups ; Diff. 3 coups) | `sword2` | bloquer | plant (coup .85 / fin 1.5) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 0.75 / 0.726 / 1.9 · 2 coups | 0.75 / 0.393 / 1.9 · 2 coups | 1.01 / 0.26 / 3.01 · 3 coups | 44-p3-belfry-logic.js:11 · Diff. 44-p3-belfry-logic.js:74 | N |
| Souffle de flamme (fenêtre propre BRW) | `breath` | bloquer | bat (coup .67 / fin 1.35) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 1 / 0.4 (BRW) / 1.5 · 1 coup | 0.9 / 0.2 (BRW) / 1.4 · 1 coup | 0.75 / 0.2 (BRW) / 1.25 · 1 coup | 44-p3-belfry-logic.js:12 · Diff. 44-p3-belfry-logic.js:78 | N |
| Griffes (Diff. rafale de 4) | `claws` | bloquer | bell (coup .85 / fin 1.45) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 0.8 / 0.726 / 1.8 · 2 coups | 0.8 / 0.393 / 1.8 · 2 coups | 0.8 / 0.26 / 2.8 · 4 coups | 44-p3-belfry-logic.js:13 · Diff. 44-p3-belfry-logic.js:79 | N |
| Chute de pierres / Pierres et boule de feu (Diff.) | `rocks` | bloquer | bat (coup .67 / fin 1.35) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 1 / 0.726 / 2.2 · 2 coups | 1 / 0.393 / 2.2 · 2 coups | 0.95 / 0.26 / 2.7 · 3 coups | 44-p3-belfry-logic.js:14 · Diff. 44-p3-belfry-logic.js:81 | N |
| Ondes d'ailes / Barrage d'ailes (Diff. 5) | `waves` | bloquer | bat (coup .67 / fin 1.35) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 1 / 0.726 / 2.5 · 3 coups | 1 / 0.393 / 2.5 · 3 coups | 0.95 / 0.26 / 3.45 · 5 coups | 44-p3-belfry-logic.js:15 · Diff. 44-p3-belfry-logic.js:80 | N |
| Cri : le Clocher tremble (Diff. : 5 chutes rand(.55,.9) ou 3 fixes 1.0/1.7/2.4) | `roar` | bloquer | bell (coup .85 / fin 1.45) | 1er coup | act+grâce | dernier coup+.5 | 1 PV | 1 / 0.726 / 1.5 · 1 coup | 1 / 0.393 / 1.5 · 1 coup | 0.95–1.1 / 0.26 / 3.65–5.2 · 5 chutes (ou fixes 1.0/1.7/2.4, durée 2.9) | 44-p3-belfry-logic.js:16 · Diff. 44-p3-belfry-logic.js:82 | N |

Première vie : réserve `BASE` = marteau de guerre, grêle, charge (Facile, Normal et Difficile avec ses variantes RATKH). Seconde vie (Normal, Difficile ; pas en Facile) : réserve complète `ALLK` / `ALLKH` (44-p3-belfry-logic.js:25). Premier tour : marteau de guerre. Colosse touché par le contre : étourdi R_T.stun .55 ; raté : « fail » .9 puis attente rand(.8,1.4). Coup reçu : étourdissement R_T.down .55 (crochet R_T.lasso 1.1), plancher R_T.min .22, raccourci à (écart − .2). Fenêtre du souffle BRW = .2×fm : Facile .4, Normal .2, Difficile .2 (LB.hero.stops avec win ; la grâce de récupération .06 s'applique encore, voir décisions). Contre : si aucune erreur, le Veilleur riposte (cn) ; PV Colosse −1.

**C1 · Phase III — rages (ULT) : attaque d'une réserve précédée d'un blast d'annonce ; coups de l'attaque décalés de `off`**

| sort | nom de code | geste | contre | prép. | fenêtre | durée | dégâts | Facile | Normal | Difficile | source | prov. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Râle d'agonie (1ère vie, toutes rages ; seconde vie au hasard) | `ULT.rale` | bloquer | bolt (coup 1.0 / fin 1.9) | blast annonce 1.1 (*) ; coups : 1.1* | act+grâce | off 1.9 + durée de l'attaque associée (dernier coup+.5) + .65×R.rage | 1 PV | prép 1.1 / 0.726 / off 1.9 + attaque | prép 1.1 / 0.393 / off 1.9 + attaque | prép 1.1 / 0.26 / off 1.9 + attaque | 44-p3-belfry-logic.js:28 | N |
| Fureur (seconde vie, au hasard) | `ULT.fureur` | bloquer | bolt (coup 1.0 / fin 1.9) | blast annonce 1.1 (*) ; coups : 1.1* · 2.0 · 2.9 · 3.8 | act+grâce | off 4.6 + durée de l'attaque associée (dernier coup+.5) + .65×R.rage | 1 PV | — (seconde vie absente) | prép 1.1 / 0.393 / off 4.6 + attaque | prép 1.1 / 0.26 / off 4.6 + attaque | 44-p3-belfry-logic.js:29 | N |
| Embrasement (seconde vie, au hasard) | `ULT.embrasement` | bloquer | bolt (coup 1.0 / fin 1.9) | blast annonce 1.1 (*) ; coups : 1.1* · vague 1.9 · vague 2.5 | act+grâce | off 3.2 + durée de l'attaque associée (dernier coup+.5) + .65×R.rage | 1 PV | — (seconde vie absente) | prép 1.1 / 0.393 / off 3.2 + attaque | prép 1.1 / 0.26 / off 3.2 + attaque | 44-p3-belfry-logic.js:30 | N |
| Fureur de braise (Diff., seconde vie, rage 8 PV) | `ULT.brasier` | bloquer | bolt (coup 1.0 / fin 1.9) | blast annonce 1.1 (*) ; coups : 1.1* · 2.2 · 2.9 · 3.4 | act+grâce | off 4.4 + durée de l'attaque associée (dernier coup+.5) + .65×R.rage | 1 PV | — | — (Difficile seul) | prép 1.1 / 0.26 / off 4.4 + attaque | 44-p3-belfry-logic.js:34 | N |
| Danse des chaînes (Diff., seconde vie, rage 5 PV) : quatre crochets | `ULT.danse` | bloquer | bolt (coup 1.0 / fin 1.9) | blast annonce 1.1 (*) ; coups : 1.1* | act+grâce | off 1.9 + durée de l'attaque associée (dernier coup+.5) + .65×R.rage | 1 PV | — | — (Difficile seul) | prép 1.1 / 0.26 / off 1.9 + attaque | 44-p3-belfry-logic.js:35 | N |
| Embrasement final (Diff., seconde vie, PV 1) : ondes, puis cri, puis charge | `ULT.dernier` | bloquer | bolt (coup 1.0 / fin 1.9) | blast annonce 1.1 (*) ; coups : 1.1* | act+grâce | off 1.9 + durée de l'attaque associée (dernier coup+.5) + .65×R.rage | 1 PV | — | — (Difficile seul) | prép 1.1 / 0.26 / off 1.9 + attaque | 44-p3-belfry-logic.js:36 | N |

Déclencheurs (`rNext`, 44-p3-belfry-logic.js:128) : PV Colosse ≤ 1 → rage finale ; ≤ `ru` (Facile 4, Normal 5, Difficile 8) → rage ; Difficile : ≤ `u2` (5) → rage en deux temps. Queue de rage : `R.rage` blasts de plus, un tous les .65 s après le dernier coup (R.rage = 1 à 3, voir `rUlt`, 44-p3-belfry-logic.js:112). Seconde vie Difficile (une rage par palier) : PV 8 → brasier (attaque tirée une fois et rejouée si ratée), PV 5 → danse (4 crochets), PV 1 → dernier (ondes + chaîne cri, charge, coups fixes). Le commentaire de `44-p3-belfry-logic.js:32` parle de paliers « 10, 5 et 1 PV » alors que `DIFFS.hard` donne 8 / 5 / 1 : à valider.

**C1 · Phase III — dernier assaut (FIN, scène chronométrée)**

`FIN` (`44-p3-belfry-logic.js:38`) : raise .5 · bell1 1.35 · fling 1.55 · leap [1.7, 2.1] · cut [2.3, 3.0] · charge 3.5 · strike 4.4 · exp 4.6 · gap .42 · collapse 6.9 · bell 8.4 · hero 9.9 · fade 12.2 · space 13.3 (s, depuis le début de la scène ; pas de difficulté appliquée). Déclenchée à PV Colosse 0 (`startFinale`, vraie fin ; Facile y va directement, sinon seconde vie d'abord).

## Partie 2 — Chapitre II : Silent Bells

### En-tête C2

| | Facile | Normal | Difficile | source |
|---|---|---|---|---|
| PV du boss (`boss`, « gardés de l'import jusqu'aux playtests ») | 6 | 8 | 10 | `02-core.js:35-37` |
| Seuils de rage (`u`) | [3] | [4] | [7, 4] | `02-core.js:35-37` |
| Nombre de rages / dernier assaut | 1 / à PV ≤ 1 | 1 / à PV ≤ 1 | 2 / à PV ≤ 1 | `64-prologue.js:130,138` |
| Rugissement de rage (`LB.BOSS_RULES.rageDur` / `rageDur2`) · `LB.BOSS_RULES.finalHp` | 1.6 / .8 · 1 | idem | idem | `shared/js/18-boss-diff.js` |
| Vitesse d'attaque `sp` | .85 | 1 | 1.18 | `02-core.js:35-37` |
| f avant rage (1 / sp) · après rage (1 / (sp × 1.1)) | 1.176 · 1.069 | 1 · .909 | .847 · .770 | `64-prologue.js:172` |
| PV rendus entre phases (`heal`) | tous | tous | tous | `02-core.js:35-37` |
| Phase III forme I : dernier assaut | aucun (`rageMarks`) | aucun | aucun | `64-prologue.js:131` |

**Riposte** (`R_CNT`, `16-update.js:38`, phase interne 1 / 2 / 3) : durée 1.05 / 1.05 / .95, impact à .42 / .40 / .32 ; pause avant la série suivante 1.45 (réussie) / .95 (ratée) ; dégâts au boss 1, 2 si tous les arrêts d'au moins 2 coups sont parfaits (`16-update.js:44`). Départ de partie : première série à +1.1 s (`72-flow.js`, `beginPlay`). Tout coup reçu : 1 PV (`12-hero-states.js:44`).

**Pluie d'éclats (RAIN, phase I)** : Facile/Normal [.32, .62] · Difficile [.55, .9] ; grâce +.13 s (Difficile) ; étourdissement d'un éclat .14 s ; provisoire (`64-prologue.js:143`). **Reflet esquivé** : `DG.backTurn` .35 · `DG.backWin` .45, provisoire (`12-hero-states.js:11`). **Sorts `SP`** : provisoires, « à régler en séance d'équilibrage » (`64-prologue.js:159-167`).

**C2 · Phase I — Voix Creuse (interne P2, esquiver, grâce .05)**

| sort | nom de code | geste | contre | prép. | fenêtre | durée | dégâts | Facile | Normal | Difficile | source | prov. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Orbe (réelle ou reflet) | `orb` | esquiver | — | 1.3f | act+grâce | 0.44f | 1 PV | 1.529 / 0.716 / 0.518 ⟹ 1.39 / 0.716 / 0.471 | 1.3 / 0.383 / 0.44 ⟹ 1.182 / 0.383 / 0.4 | 1.102 / 0.25 / 0.373 ⟹ 1.002 / 0.25 / 0.339 | 64-prologue.js:183 | N |
| Volée de 2 orbes | `volley(2,ill)` | esquiver | — | 1.3f | act+grâce | 1.78f | 1 PV / orbe réelle | 1.529 / 0.716 / 2.094 ⟹ 1.39 / 0.716 / 1.904 | 1.3 / 0.383 / 1.78 ⟹ 1.182 / 0.383 / 1.618 | 1.102 / 0.25 / 1.508 ⟹ 1.002 / 0.25 / 1.371 | 64-prologue.js:184 | N |
| Volée de 3 orbes | `volley(3,ill)` | esquiver | — | 1.3f | act+grâce | 2.22f | 1 PV / orbe réelle | 1.529 / 0.716 / 2.612 ⟹ 1.39 / 0.716 / 2.374 | 1.3 / 0.383 / 2.22 ⟹ 1.182 / 0.383 / 2.018 | 1.102 / 0.25 / 1.881 ⟹ 1.002 / 0.25 / 1.71 | 64-prologue.js:184 | N |
| Volée de 4 orbes | `volley(4,ill)` | esquiver | — | 1.3f | act+grâce | 2.66f | 1 PV / orbe réelle | 1.529 / 0.716 / 3.129 ⟹ 1.39 / 0.716 / 2.845 | 1.3 / 0.383 / 2.66 ⟹ 1.182 / 0.383 / 2.418 | 1.102 / 0.25 / 2.254 ⟹ 1.002 / 0.25 / 2.049 | 64-prologue.js:184 | N |
| Volée de 5 orbes | `volley(5,ill)` | esquiver | — | 1.3f | act+grâce | 3.1f | 1 PV / orbe réelle | 1.529 / 0.716 / 3.647 ⟹ 1.39 / 0.716 / 3.316 | 1.3 / 0.383 / 3.1 ⟹ 1.182 / 0.383 / 2.818 | 1.102 / 0.25 / 2.627 ⟹ 1.002 / 0.25 / 2.388 | 64-prologue.js:184 | N |
| Écho (3 orbes, 1 réelle ; ti 1.3 / 1.84 / 2.38) | `echo` | esquiver | — | 1.3f | act+grâce | 2.52f | 1 PV | 1.529 / 0.716 / 2.965 ⟹ 1.39 / 0.716 / 2.695 | 1.3 / 0.383 / 2.52 ⟹ 1.182 / 0.383 / 2.291 | 1.102 / 0.25 / 2.136 ⟹ 1.002 / 0.25 / 1.941 | 64-prologue.js:185 | N |
| Plainte | `wail` | esquiver | — | 1.9f | act+grâce | 1.3f | 1 PV | 2.235 / 0.716 / 1.529 ⟹ 2.032 / 0.716 / 1.39 | 1.9 / 0.383 / 1.3 ⟹ 1.727 / 0.383 / 1.182 | 1.61 / 0.25 / 1.102 ⟹ 1.464 / 0.25 / 1.002 | 64-prologue.js:188 | N |
| Rage « Écho » : écho + 2 éclats (ti 3.53 / 3.98) | `echoR (rage)` | esquiver | — | 1.3f | act+grâce | 4.38f | 1 PV | 1.39 / 0.716 / 4.684 | 1.182 / 0.383 / 3.982 | 1.002 / 0.25 / 3.374 | 64-prologue.js:187 · SP.echo 64-prologue.js:166 | O |
| Dernier assaut : echoR → volley(5,2) → plainte | `final` | esquiver | — | 1.3f | act+grâce | 8.78f | 1 PV | 1.39 / 0.716 / 9.39 | 1.182 / 0.383 / 7.982 | 1.002 / 0.25 / 6.764 | 64-prologue.js:191 | N |

**Séquences** (`64-prologue.js:192`) — avant rage : volley(2,0) · volley(3,1) · plainte · volley(3,0) · plainte+volley(2,1) · pluie(3). Après rage : volley(4,1) · volley(5,2) · echoR · echoR+plainte · volley(3,1)+echoR · plainte+volley(4,2) · pluie(5) · pluie(3)+volley(3,1). Rage : echoR. Dernier assaut (PV boss ≤ 1) : echoR, volley(5,2), plainte.

**Pluie d'éclats** (`rain(n)`, `64-prologue.js:189` ; RAIN `64-prologue.js:143`, provisoire O) : 1er éclat prép .95f ; durée = 1.3f + (n−1)·[lo,hi], l'espacement [lo,hi] n'est pas multiplié par f. Facile/Normal [.32,.62], Difficile [.55,.9] ; en Difficile grâce +.13 s (RAIN.grace) ; un éclat touché étourdit .14 s (RAIN.hurt). Durée n=3 / n=5 : Facile 2.169–2.769 / 2.809–4.009 ; Normal 1.94–2.54 / 2.58–3.78 ; Difficile 2.202–2.902 / 3.302–4.702 (avant rage ; après rage remplacer f0 par f1).
Un reflet esquivé revient en vraie attaque : DG.backTurn .35, DG.backWin .45 (`12-hero-states.js:11`, provisoire O).

**C2 · Phase II — Ancien de Rouille (interne P1, bloquer, grâce .06)**

| sort | nom de code | geste | contre | prép. | fenêtre | durée | dégâts | Facile | Normal | Difficile | source | prov. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Marteau-cloche | `slam` | bloquer | — | 0.95f | act+grâce | 1.4f | 1 PV | 1.118 / 0.726 / 1.647 ⟹ 1.016 / 0.726 / 1.497 | 0.95 / 0.393 / 1.4 ⟹ 0.864 / 0.393 / 1.273 | 0.805 / 0.26 / 1.186 ⟹ 0.732 / 0.26 / 1.079 | 64-prologue.js:239 | N |
| Balayage | `sweep` | bloquer | — | 0.72f | act+grâce | 1.17f | 1 PV | 0.847 / 0.726 / 1.376 ⟹ 0.77 / 0.726 / 1.251 | 0.72 / 0.393 / 1.17 ⟹ 0.655 / 0.393 / 1.064 | 0.61 / 0.26 / 0.992 ⟹ 0.555 / 0.26 / 0.901 | 64-prologue.js:240 | N |
| Chaîne n=3 (coups à .85 / 1.25 / 1.65) | `chain(3)` | bloquer | — | 0.85f | act+grâce | 2.2f | 1 PV / coup | 1 / 0.726 / 2.588 ⟹ 0.909 / 0.726 / 2.353 | 0.85 / 0.393 / 2.2 ⟹ 0.773 / 0.393 / 2 | 0.72 / 0.26 / 1.864 ⟹ 0.655 / 0.26 / 1.695 | 64-prologue.js:241 | N |
| Chaîne n=5 (pas .4) | `chain(5)` | bloquer | — | 0.85f | act+grâce | 3f | 1 PV / coup | 1 / 0.726 / 3.529 ⟹ 0.909 / 0.726 / 3.209 | 0.85 / 0.393 / 3 ⟹ 0.773 / 0.393 / 2.727 | 0.72 / 0.26 / 2.542 ⟹ 0.655 / 0.26 / 2.311 | 64-prologue.js:241 | N |
| Glas | `toll` | bloquer | — | 1.55f | act+grâce | 1.05f | 1 PV | 1.824 / 0.726 / 1.235 ⟹ 1.658 / 0.726 / 1.123 | 1.55 / 0.393 / 1.05 ⟹ 1.409 / 0.393 / 0.955 | 1.314 / 0.26 / 0.89 ⟹ 1.194 / 0.26 / 0.809 | 64-prologue.js:242 | N |
| Harpon (2 coups : 1.1 puis 1.8) | `harpoon` | bloquer | — | 1.1f | act+grâce | 2.6f | 1 PV / coup | 1.294 / 0.726 / 3.059 ⟹ 1.176 / 0.726 / 2.781 | 1.1 / 0.393 / 2.6 ⟹ 1 / 0.393 / 2.364 | 0.932 / 0.26 / 2.203 ⟹ 0.847 / 0.26 / 2.003 | 64-prologue.js:243 | N |
| Vague + poutre ×2 (coups 1.05 / 1.85 / 2.2) | `surge` | bloquer | — | 1.05f | act+grâce | 2.65f | 1 PV / coup | 1.235 / 0.726 / 3.118 ⟹ 1.123 / 0.726 / 2.834 | 1.05 / 0.393 / 2.65 ⟹ 0.955 / 0.393 / 2.409 | 0.89 / 0.26 / 2.246 ⟹ 0.809 / 0.26 / 2.042 | 64-prologue.js:247 · SP.wave 64-prologue.js:160 | O |
| Rage n=2 « Vague double » (coups 1.05 / 1.6 / 2.4 / 2.75) | `dwave (rage)` | bloquer | — | 1.05f | act+grâce | 3.2f | 1 PV / coup | 1.123 / 0.726 / 3.422 | 0.955 / 0.393 / 2.909 | 0.809 / 0.26 / 2.465 | 64-prologue.js:248 · SP.dwave 64-prologue.js:161 | O |
| Rage n=1 « Nuage de rouille » (contact à 2.15, lunge ×1.6) | `rust (rage)` | bloquer | — | 2.15f | act+grâce | 3.55f | 1 PV | 2.299 / 0.726 / 3.797 | 1.955 / 0.393 / 3.227 | 1.656 / 0.26 / 2.735 | 64-prologue.js:250 · SP.rust 64-prologue.js:162 | O |
| Dernier assaut : surge, slam, chain(3), toll, toll | `final` | bloquer | — | 1.05f | act+grâce | 8.35f | 1 PV / coup | 1.123 / 0.726 / 8.93 | 0.955 / 0.393 / 7.591 | 0.809 / 0.26 / 6.433 | 64-prologue.js:252 | N |

**Séquences** (`64-prologue.js:253`) — avant rage : slam · sweep · slam+sweep · chain(3) · toll · sweep+slam · harpoon · surge. Après rage (un toll est ajouté à chaque motif) : slam+chain3 · sweep+slam+chain3 · chain3+toll · chain5 · harpoon · surge+slam · harpoon+sweep · dwave · rust · rust+sweep. Rage n=1 → rust ; n=2 → dwave. Dernier assaut à PV boss ≤ 1.

**C2 · Phase III forme I — Phare (interne P3, tenir, grâce .06) — pas de dernier assaut**

| sort | nom de code | geste | contre | prép. | fenêtre | durée | dégâts | Facile | Normal | Difficile | source | prov. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Faisceau (dir −1), tenir ; ta 1.945, tb 2.227 | `sweep(-1)` | tenir / tap | — | 1.945f | 0.282f | 2.9f | 1 PV | 2.288 / 0.331 / 3.412 ⟹ 2.08 / 0.301 / 3.102 | 1.945 / 0.282 / 2.9 ⟹ 1.768 / 0.256 / 2.636 | 1.648 / 0.239 / 2.458 ⟹ 1.498 / 0.217 / 2.234 | 64-prologue.js:329 | N |
| Faisceau (dir +1), tenir ; ta 1.273, tb 1.555 | `sweep(+1)` | tenir / tap | — | 1.273f | 0.282f | 2.9f | 1 PV | 1.498 / 0.331 / 3.412 ⟹ 1.361 / 0.301 / 3.102 | 1.273 / 0.282 / 2.9 ⟹ 1.157 / 0.256 / 2.636 | 1.079 / 0.239 / 2.458 ⟹ 0.981 / 0.217 / 2.234 | 64-prologue.js:329 | N |
| Éclair | `bolt` | tap | — | 0.95f | act+grâce | 1.3f | 1 PV | 1.118 / 0.726 / 1.529 ⟹ 1.016 / 0.726 / 1.39 | 0.95 / 0.393 / 1.3 ⟹ 0.864 / 0.393 / 1.182 | 0.805 / 0.26 / 1.102 ⟹ 0.732 / 0.26 / 1.002 | 64-prologue.js:331 | N |
| Pic | `spike` | tap | — | 0.8f | act+grâce | 1.15f | 1 PV | 0.941 / 0.726 / 1.353 ⟹ 0.856 / 0.726 / 1.23 | 0.8 / 0.393 / 1.15 ⟹ 0.727 / 0.393 / 1.045 | 0.678 / 0.26 / 0.975 ⟹ 0.616 / 0.26 / 0.886 | 64-prologue.js:332 | N |
| Fouet (côté au hasard) | `whip` | tap | — | 0.9f | act+grâce | 1.2f | 1 PV | 1.059 / 0.726 / 1.412 ⟹ 0.963 / 0.726 / 1.283 | 0.9 / 0.393 / 1.2 ⟹ 0.818 / 0.393 / 1.091 | 0.763 / 0.26 / 1.017 ⟹ 0.693 / 0.26 / 0.924 | 64-prologue.js:333 | N |
| Morceau de tour (tl .6) | `chunk` | tap | — | 1.2f | act+grâce | 1.55f | 1 PV | 1.412 / 0.726 / 1.824 ⟹ 1.283 / 0.726 / 1.658 | 1.2 / 0.393 / 1.55 ⟹ 1.091 / 0.393 / 1.409 | 1.017 / 0.26 / 1.314 ⟹ 0.924 / 0.26 / 1.194 | 64-prologue.js:334 | N |
| Vague du Roi (tenir, comme le faisceau dir −1) | `kwave` | tenir / tap | — | 1.945f | 0.282f | 2.9f | 1 PV | 2.288 / 0.331 / 3.412 ⟹ 2.08 / 0.301 / 3.102 | 1.945 / 0.282 / 2.9 ⟹ 1.768 / 0.256 / 2.636 | 1.648 / 0.239 / 2.458 ⟹ 1.498 / 0.217 / 2.234 | 64-prologue.js:336 · SP.kwave 64-prologue.js:163 | O |
| Rage « Marée montante » : vague puis pics à 3.35 / 3.7 | `tide (rage)` | tenir puis 2 tap | — | 1.945f | 0.282f | 4.85f | 1 PV / coup | 2.08 / 0.301 / 5.187 | 1.768 / 0.256 / 4.409 | 1.498 / 0.217 / 3.737 | 64-prologue.js:338 · SP.tide 64-prologue.js:164 | O |

**Séquences** (`64-prologue.js:339`) — avant rage : bolt · sweep(−1) · spike+bolt · sweep(−1)+bolt · bolt+spike · whip · chunk · whip+bolt · kwave. Après rage : bolt+spike+bolt · sweep(−1)+sweep(+1) · sweep(−1) puis −0.15f puis spike · spike+sweep(+1)+bolt · bolt+bolt+sweep(−1) · whip+whip+chunk · sweep(−1)+chunk · tide · kwave+bolt. Fenêtre de tenue = tb−ta = 1.6f·(s1−s0) = 0.2816f (R=88). Le bouton tenu use l'endurance (drain .36/s, regen .38/s, brisée .9 s).

**C2 · Phase III forme II — Éclaté (interne P3b, tenir, grâce .06)**

| sort | nom de code | geste | contre | prép. | fenêtre | durée | dégâts | Facile | Normal | Difficile | source | prov. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Anneaux n=3 (pas .34, ti .95) | `ring(3)` | tap | — | 0.95f | act+grâce | 2.03f | 1 PV / anneau | 1.118 / 0.726 / 2.388 ⟹ 1.016 / 0.726 / 2.171 | 0.95 / 0.393 / 2.03 ⟹ 0.864 / 0.393 / 1.845 | 0.805 / 0.26 / 1.72 ⟹ 0.732 / 0.26 / 1.564 | 68-form2-logic.js:12 | N |
| Anneaux n=2 | `ring(2)` | tap | — | 0.95f | act+grâce | 1.69f | 1 PV / anneau | 1.118 / 0.726 / 1.988 ⟹ 1.016 / 0.726 / 1.807 | 0.95 / 0.393 / 1.69 ⟹ 0.864 / 0.393 / 1.536 | 0.805 / 0.26 / 1.432 ⟹ 0.732 / 0.26 / 1.302 | 68-form2-logic.js:12 | N |
| Anneaux n=5 | `ring(5)` | tap | — | 0.95f | act+grâce | 2.71f | 1 PV / anneau | 1.118 / 0.726 / 3.188 ⟹ 1.016 / 0.726 / 2.898 | 0.95 / 0.393 / 2.71 ⟹ 0.864 / 0.393 / 2.464 | 0.805 / 0.26 / 2.297 ⟹ 0.732 / 0.26 / 2.088 | 68-form2-logic.js:12 | N |
| Lune (tenir ; ta 1.687, tb 1.872) | `moon` | tenir / tap | — | 1.687f | 0.185f | 2.6f | 1 PV | 1.985 / 0.218 / 3.059 ⟹ 1.804 / 0.198 / 2.781 | 1.687 / 0.185 / 2.6 ⟹ 1.534 / 0.168 / 2.364 | 1.43 / 0.157 / 2.203 ⟹ 1.3 / 0.143 / 2.003 | 68-form2-logic.js:13 | N |
| Piège | `trap` | tap | — | 1.3f | act+grâce | 1.85f | 1 PV | 1.529 / 0.726 / 2.176 ⟹ 1.39 / 0.726 / 1.979 | 1.3 / 0.393 / 1.85 ⟹ 1.182 / 0.393 / 1.682 | 1.102 / 0.26 / 1.568 ⟹ 1.002 / 0.26 / 1.425 | 68-form2-logic.js:15 | N |
| Croix : 2 faisceaux (ta 1.5375 puis 3.0625) | `cross` | tenir ×2 | — | 1.538f | 0.2f | 3.75f | 1 PV / faisceau | 1.809 / 0.235 / 4.412 ⟹ 1.644 / 0.214 / 4.011 | 1.538 / 0.2 / 3.75 ⟹ 1.398 / 0.182 / 3.409 | 1.303 / 0.169 / 3.178 ⟹ 1.185 / 0.154 / 2.889 | 68-form2-logic.js:14 | N |
| Éclat (tenir ; ta 1.15, tb 1.5) | `burstOut` | tenir / tap | — | 1.15f | 0.35f | 2f | 1 PV | 1.353 / 0.412 / 2.353 ⟹ 1.23 / 0.374 / 2.139 | 1.15 / 0.35 / 2 ⟹ 1.045 / 0.318 / 1.818 | 0.975 / 0.297 / 1.695 ⟹ 0.886 / 0.27 / 1.541 | 68-form2-logic.js:16 | N |
| Reformation (tenir ta 2.195, tb 2.435, puis tap 3.25) | `reform` | tenir + tap | — | 2.195f | 0.24f | 3.95f | 1 PV / coup | 2.582 / 0.282 / 4.647 ⟹ 2.348 / 0.257 / 4.225 | 2.195 / 0.24 / 3.95 ⟹ 1.995 / 0.218 / 3.591 | 1.86 / 0.203 / 3.347 ⟹ 1.691 / 0.185 / 3.043 | 68-form2-logic.js:17 | N |
| Rage « Tempête de cloches » : 5 anneaux (ti .95 + .34i), piège tenu ta 4.01 / tb 4.51 | `storm (rage)` | 5 tap + tenir | — | 0.95f | act+grâce | 5.21f | 1 PV / coup | 1.016 / 0.726 / 5.572 | 0.864 / 0.393 / 4.736 | 0.732 / 0.26 / 4.014 | 68-form2-logic.js:19 · SP.storm 64-prologue.js:165 | O |
| Dernier assaut : implosion (ta 1.7, tb 2.3) | `implode` | tenir | — | 1.7f | 0.6f | 2.8f | 1 PV | 1.818 / 0.642 / 2.995 | 1.545 / 0.545 / 2.545 | 1.31 / 0.462 / 2.157 | 68-form2-logic.js:22 | N |

**Séquences** (`68-form2-logic.js:23`) — avant rage : ring(3) · moon · trap · ring(2)+trap · cross · burstOut · reform. Après rage : ring(5) · moon+ring(3) · trap+trap · cross+ring(2) · burstOut+moon · ring(3)+cross · reform+ring(2) · storm.

## Table comparative C1 / C2

| | C1 Ember Bridge | C2 Silent Bells |
|---|---|---|
| PV Veilleur (F/N/D) | 6 / 4 / 3 | 6 / 4 / 3 (même table partagée) |
| PV boss par phase (F/N/D) | I–II : 8 / 10 / 14 · III : 8 / 10 / 12 | 6 / 8 / 10 pour chacune des 3 phases (forme II : PV remis à neuf) |
| Fenêtre d'un tap (bloquer) F/N/D | .726 / .393 / .26 | .726 / .393 / .26 (identique) |
| Fenêtre d'un tap (esquiver) F/N/D | .716 / .383 / .25 | .716 / .383 / .25 (identique) |
| Fenêtres propres | souffle P1 : .43 / .23 / .23 (flwin×fm + .03) ; souffle P3 : .4 / .2 / .2 (BRW) ; chutes Diff. +.13 | tenue des faisceaux : .2816 f (R=88) ; lune .185 f ; croix .2 f ; éclat .35 f ; implosion .6 f ; reformation .24 f (× f) |
| Nombre de rages (hors dernier assaut) par phase, F / N / D | 1 / 1 / 2 | 1 / 1 / 2 |
| Dernier assaut | PV 1, toutes les phases (P1 : fureur 1, P2 : chaîne, P3 : ULT puis scène `FIN`) | PV 1 : phases I, II, forme II (aucun en forme I) |
| Rage : forme | séquences de jets/souffles/rochers (P1), queue de feu + cri (P2), ULT + queue de blasts (P3) | un sort unique par rage (écho, nuage de rouille, vague double, marée, tempête) |
| Durée moyenne d'une attaque, Normal, début → dernier impact | P1 1.48 · P2 1.87 · P3 (BASE) 2.22 / (réserve complète) 1.57 | motif avant rage, f=1 : Voix 2.15 · Ancien 1.64 · Phare 1.97 · Éclaté 2.26 |
| Durée moyenne, Normal, durée totale (C1 : P1 jusqu'à la fin bloquée, P2–P3 dernier coup + .5 ; C2 : avance du chrono du motif) | P1 2.65 · P2 2.37 · P3 (BASE) 2.72 | Voix 2.14 · Ancien 2.03 · Phare 2.38 · Éclaté 2.82 |
| Séquences / motifs (avant rage → après rage) | 3 attaques de base par phase ; Diff. : +double crochet, +souffles enchaînés, fureurs 5/6/1, cri, queue ×2, variantes RATKH ; P3 : 3 (1re vie) → 10 (2de vie) | motifs : Voix 6 → 8 · Ancien 8 → 10 · Phare 9 → 9 · Éclaté 7 → 8 ; difficulté = seulement `sp` (aucun motif propre à une difficulté) |
| Séquences de rage | F : 2 jets, 4 PV · N : 4 jets, 5 PV · D : jjjjjj (10) · jjbbjj (5) · jjbbrrr (1) | 1 sort par rage, 2 en Difficile (n=1 : rust/écho/marée/tempête · n=2 : dwave/écho/marée/tempête) |
| Pause entre attaques | rand(1.2, 2.2) / rand(.8, 1.4) ; D rand(.5, .9) | 1.45 après série réussie, .95 après échec (non aléatoire) |
| Éléments provisoires | aucun marqué | `RAIN`, `DG.back*`, tous les `SP` |

*Convention des moyennes C2 : durée d'un motif de la liste « avant rage » (rain(3) pris à l'espacement moyen .47) ; durée moyenne C1 : attaque unique, ce n'est pas la même unité qu'un motif C2 (un motif C2 enchaîne 1 à 3 sorts) : comparer avec prudence.*

## Valeurs non trouvées / non lues

- Durée du contre de la phase II C1 (`qCnStep`) et des étapes d'ouverture/fin de phase : non lues (hors des blocs demandés ; recherche : `grep` de `qCnStep`, non ouvert).
- Dégâts spécifiques par type de coup : non trouvé, tous les impacts retirent 1 PV (`DMG_*`=1 en C1, `hurt` −1 en C2).
- C2 : gestes exacts (tap ou tenu) de `bolt`, `spike`, `whip`, `chunk`, `toll`, `trap` : le code pose un seul `ti` ; classés « tap ». Recherche : lecture de P3 / P3b uniquement, pas du code de résolution.
- Effet de l'aide visuelle sur les fenêtres : non cherché.

## Décisions à valider

1. Le prompt demandait 4 fichiers au maximum, mais énumère davantage de sources : lecture limitée à des plages ciblées (00-core, 02-core, 16-hero en entier ; les autres par grep + plages).
2. Commentaire de `44-p3-belfry-logic.js:32` : « paliers 10, 5 et 1 PV » ≠ `DIFFS.hard` (ru 8, u2 5) : commentaire périmé ou valeur à corriger ?
3. Souffle P3 : `BRW` (.2) < action (.333 en Normal) alors que `stops` accepte aussi la grâce de récupération : deux fenêtres séparées par un trou ; voulu ?
4. C1 : la branche `rand(.32, .62)` du cri `qRoar` n'est jamais atteinte hors Difficile.
5. Nommage : les noms de phases C2 internes (P1 = Ancien, P2 = Voix) ne suivent pas l'ordre affiché ; la doc suit l'ordre affiché.
