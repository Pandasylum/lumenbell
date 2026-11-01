# 2026-11-01 · `engine/cine` : intro et outro communes (`LB.cine`, `LB.title`)

Session 5 du plan de `docs/COMMUN.md` § 4 (branche `engine/cine`). Applique la décision n° 6 du 28 octobre (titre de fin d'intro comme au Chapitre I) ; le reste du § 1.6 de l'audit était recommandé « C1 ».

## 1. Ce qui est commun (`shared/js/24-cine.js`)
- **`LB.cine.create({key, scenes, onStart, onTick, onEnd})`** → `{play(done), replay(done), seen(), playing(), skip()}`. Cartons `{d, en, fr, draw}` (le Chapitre II passe `txt()` pour garder ses appels `_()`), `col` (teinte de la légende), `enter`, `cue`. Le cadre est celui du Chapitre I : canvas 960 × 540 plein écran, légende HTML sous l'image, bouton « Passer › » en bas à droite (couleur du chapitre), fondu au noir à chaque bout d'un carton.
- **`LB.CINE_T`** : fondu 0,8 s ; légende qui apparaît 0,5 s après le début du carton, en 0,6 s ; durée minimale d'un carton 6 s ; pas borné à 0,1 s ; touches Échap, Entrée, Espace. La durée de chaque carton reste dans la table du chapitre (Chapitre I : `SC[i].d`, inchangées ; Chapitre II : `CINE_D`).
- **Drapeau « intro vue »** par `LB.store` / `LB.key` : `lb-ch1-intro` (ancienne clé `eb-intro` toujours lue), `lb-ch2-intro` (nouveau), écrit à la fin ou au passage. Le chapitre décide de jouer avec `seen()` ; `replay` rejoue sans condition.
- **Rejeu** : `CINE.replay`, `PRO.replay` ; bouton « ▶ Intro » dans le menu des deux chapitres (Chapitre II : ajouté après le test de Kevin, voir § 6).
- **`LB.title(ctx, t, t0, {col, sub})`**, **`LB.TITLE_T`** : « LUMEN » couleur du chapitre + « BELL » crème, 96 px, halo de la couleur du chapitre ; ligne du chapitre en Big Shoulders 26 px crème dessous ; lignes de base 118 et 160 comme au Chapitre I, la seconde descendue si les boîtes mesurées l'exigent (placement mesuré du Chapitre II gardé : 8 unités d'écart minimum, réduction si trop large).
- Copies de test : `LB.cine.manual = true` coupe le rAF du module, `LB.cine.step(dt, dessiner)` le fait avancer au pas du test.

## 2. Chapitre I : identique au pixel
- `CINE` et `OUTRO` ne gardent que scènes, cartons, sons (`CUE`, `ENTER`) et l'appel `LB.title`. Boîte et style quittent `page/body.html` et `page/style.css` (créés par le module, mêmes règles).
- Preuve : `tests/visual-shots.js` (parcours, 126 images) : les 63 images du Chapitre I identiques à `main` ; `--cine` (cartons à 1 à 46 s de l'intro et de l'outro, titre compris, FR et EN au bureau, FR sur téléphone) : 63/63 identiques.

## 3. Chapitre II : seul le cadre change
- Prologue et épilogue passent du canvas du jeu au cadre commun (plein écran, légende HTML au lieu de la légende dessinée, « Passer › » du module). Les plans dessinés sont inchangés ; seuls sont retirés les creux au noir entre plans, les fondus de début et de fin, les légendes dessinées et le grand titre dessiné de l'outro.
- Durées (`CINE_D`) : intro `[6, 7, 7, 7, 6]` (plan du titre : 6 s au lieu de 4,6) ; outro `[7, 6, 6, 7, 7]` au lieu d'environ 4 s par carton (19 s → 33 s). Temps internes des plans recalés sur le début de chaque plan.
- Le prologue n'est plus rejoué à chaque partie (drapeau `lb-ch2-intro`).
- Titre : celui du Chapitre I (« LUMEN » turquoise, « BELL » crème, chapitre en Big Shoulders crème) à y = 118 au lieu de « LUMENBELL » crème à y = 194 et de la ligne du chapitre en DM Sans turquoise soulignée. Le haut du Phare passe derrière « BELL » (à regarder).
- Textes : aucun ajouté, aucun modifié (`TEXTES.md` identique).

## 4. Trois choix par défaut, à valider par Kevin
1. **Titre de fin d'outro** : le dernier carton annonce le chapitre suivant par sa légende, teintée de la couleur du chapitre suivant ; pas de grand titre dessiné en plus. Chapitre II : « Chapitre III. À suivre. » en vert mousse (`#b9cf5a`) sur le plan de la forêt. Chapitre I : inchangé pour rester identique au pixel (titre dessiné « LUMENBELL · CHAPITRE II / SILENT BELLS » en blanc froid sur la mer turquoise, légende crème) ; teindre aussi sa légende en turquoise `#4fe0cc` est une ligne (`col` du carton 6), à décider.
2. **Espace passe** les cinématiques communes (comme au Chapitre I ; il était bloqué au Chapitre II). Les cinématiques de phase du Chapitre II (`S.mode === 'cine'`) gardent Entrée / Échap seulement (hors périmètre : session `ch2/cinematics`).
3. **Mise en page commune** : celle du Chapitre I pour tout chapitre (plein écran noir, image 16:9, légende dessous, « Passer » en bas à droite). Au Chapitre II, le prologue couvre maintenant l'en-tête : on ne peut plus sauter de phase par la frise pendant le prologue (il faut d'abord le passer).

## 5. Tests
- Nouveaux : `tests/title.js` (titre des deux chapitres, de 360 px au bureau, FR / EN ; `ch2-title.js` le lance pour la CI) ; `tests/cine.js` (Échap, Entrée, Espace, bouton ; drapeau vu / non vu, rechargement, partie suivante, ancienne clé `eb-intro`, outro sans drapeau et rejouable, intro jouée jusqu'au bout, rejeu, dernier carton teinté) ; `visual-shots.js --cine`.
- Adaptés : `ch2-lib.js` (mode manuel), `ch2-smoke.js` (passe le prologue avant la frise), `build/build_test.py` (`testSeen`).
- Bots et états : `ch1-bot.js` (30 parties par case, 540 en tout) et `input.js all` identiques à `main`. `ch2-bot.js 100` : chaque partie est identique à `main` quand elle est jouée dans une page neuve ; enchaînées dans une même page (usage du script), l'épilogue joué après chaque victoire dure 33 s au lieu de 19 et décale le temps absolu du jeu des parties suivantes (arrondis) : Normal σ 100 ms 40/100 au lieu de 41/100, toutes les autres cases identiques, `--check` vert.
- `tests/keys.js` : l'instabilité connue (« relit le choix de l'autre chapitre ») ne s'est pas produite sur 3 exécutions ; non corrigée (session `engine/tests`).
- `tests/cine.js` n'est pas dans `tests.yml` (hors périmètre de la session) : à ajouter (`node cine.js` après `node keys.js`).

## 6. Correction après le test de Kevin (1er novembre, même branche)
Symptômes sur le `dist`, profil réel : l'intro ne se lance pas ; pas de bouton de rejeu dans le menu.
- **Diagnostic** (Playwright, `dist`, profil vierge puis drapeau posé, bureau et téléphone) : le module est bien branché dans les deux chapitres et le drapeau est lu dans le bon sens. Profil vierge : Normal joue l'intro (Chapitres I et II), le drapeau `lb-chN-intro` est écrit à la fin ou au passage. Drapeau posé : l'intro ne se rejoue plus, comme voulu.
- **Cause de (1)** : pas un défaut du module : le profil réel avait déjà le drapeau (Chapitre I : `lb-ch1-intro`, ou l'ancienne `eb-intro`, posé depuis longtemps ; Chapitre II : `lb-ch2-intro`, posé dès le premier prologue vu ou passé). Les deux `dist` ouverts en local partagent le même stockage `file://`.
- **Cause de (2)** : bouton absent du HTML du menu du Chapitre II (la session l'avait renvoyé à la session 6) ; au Chapitre I, le bouton existe et est visible en haut à gauche du menu. Sans bouton, un prologue vu ne pouvait plus être revu au Chapitre II : **défaut corrigé** : `#introBtn` « ▶ Intro » dans le menu du Chapitre II (`page/body.html`, `page/style.css`, en haut à gauche, face aux langues), `replayPrologue()` (`72-flow.js`) joue le prologue par-dessus le menu et rend ensuite l'état de la partie (temps, particules, partie en pause) tel quel.
- Chapitre I non modifié (source et `dist` identiques au commit précédent). Test ajouté à `tests/cine.js` : drapeau posé → bouton visible, cliquable, rejoue l'intro, retour au menu, partie en pause gardée (Chapitre II) ; « profil vierge → intro jouée » y était déjà.

## 7. Titre du Chapitre III dans l'annonce de fin (1er novembre, même session, reprise sur `main`)
- La session 5 était déjà fusionnée (PR #38) ; seule la reprise du titre restait à faire. Kevin fixe le titre du Chapitre III : **Hollow Roots** (`docs/LORE.md` : tableau du § 9, titre de section du Chapitre III, journal du § 15, remplacements fournis mot pour mot ; rien d'autre dans `LORE.md`).
- Dernier carton de l'épilogue du Chapitre II : « Chapitre III · Hollow Roots. À suivre. » / « Chapter III · Hollow Roots. To be continued. », même forme que le carton 6 de l'outro du Chapitre I (« Chapitre II · Silent Bells. À suivre. »). Couleur, durée et plan inchangés. `TEXTES.md`, `docs/CH2-SPEC.md` (cartons de l'outro) et `tests/cine.js` suivent.
- Chapitre I : `dist` inchangé. Chapitre II : nouveau `dist` de référence ; seule la légende du carton 5 de l'épilogue change (comparaison `visual-shots --cine`).
- **Reste à valider** : `docs/LORE.md` § 9 (outro du Chapitre II) cite encore « Chapitre III. À suivre. », et le § 9 garde « Racines » pour la tour (tableaux du § 5, du § 6 et du § 8) ; `ROADMAP.md` dit « chapitre III (Racines) ». Non modifiés (hors remplacements demandés).
