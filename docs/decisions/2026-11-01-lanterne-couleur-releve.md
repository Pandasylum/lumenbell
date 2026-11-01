# 2026-11-01 · `engine/lantern-color` : relevé des couleurs de la lanterne et des tirs, palette « jaune neutre + tirs jaune-blanc » (validée par Kevin, appliquée)

Deux sessions (`CHANGEMENTS.md` E), branche `claude/lanterne-color-audit-5ie121` (prévue `engine/lantern-color`). 1re session : relevé et comparaison, rien d'appliqué (§ 1 à 5, état d'avant). 2e session : palette appliquée avec les décisions de Kevin (§ 6 et 7). Décision de Kevin : jaune neutre au repos ; quand le Veilleur tire, le jaune vire vers le jaune-blanc (plus vers le bleu-blanc, pour ne pas confondre avec le givre du chapitre IV). La lanterne reste la seule couleur claire de l'écran.

Images (non suivies, à regarder) : `build/out/cmp-lanterne/` : `ch1-p1-orbe.png`, `ch1-p3-eclats.png`, `ch2-p1-riposte.png`, `ch2-p3-garde-riposte.png` (avant à gauche, après à droite). Copies jetables dans `build/out/` (`test-apres.html`, `ch2-test-apres.html`), script de recoloration `recolor.py` copié dans le dossier des images. Même horloge à pas fixe et même graine que `tests/visual-shots.js`.

## 1. Relevé : lanterne (état d'avant)
| Fichier : ligne | Constante | Valeur | Usage |
|---|---|---|---|
| `shared/js/20-watcher.js:32` | `LB.WATCHER_T.lantern.idle` | `#ffd27a` | verre au repos |
| idem | `.lit` | `#fff4d6` | allumée (sceptre levé, garde, tir) |
| idem | `.recover` | `#c9a85a` | récupération (ambre sombre) |
| idem | `.dark` | `[58,48,34]` | verre éteint (`lamp` à 0, fin de phase I du Chapitre II) |
| `shared/js/16-hero.js:76` | `LB.DENY_COL` | `#ff6b6b` | rouge de `deny` (0,25 s), les deux chapitres |
| `shared/js/20-watcher.js:108` | halo de `drawLantern` | centre `255,245,215` ; milieu `150,220,255` ; bord `111,211,255` | **halo bleu** autour de la lanterne |
| `shared/js/20-watcher.js:197` | halo `aura` | `255,255,255` ; `150,220,255` ; `111,211,255` | cinématiques (levée du sceptre) |
| `shared/js/20-watcher.js:220` | boule du sceptre (mode `sa`) | `255,255,255` ; `190,234,255` ; `111,211,255` | contre à rayon court |

## 2. Relevé : tirs du Veilleur (état d'avant)
| Fichier : ligne | Constante (littérale) | Valeur | Usage |
|---|---|---|---|
| `shared/js/20-watcher.js:131-136` `LB.lanternBeam` | ombre, halo, cœur, pointe | `#6fd3ff` ; `111,211,255` ; `255,255,255` ; `235,250,255` | rayon de la lanterne, **les deux chapitres** (phases I et III Ch. I, phase II Ch. I via `drawCnFx`, coup final) |
| Ch.I `32-p1-bridge-render.js:531-557` `drawOrb` | traînée ; cœur ; halo | `220,245,255` ; `255,255,255`/`255,246,200` ; `111,211,255` | **orbe de la phase I** |
| Ch.I `32-p1-bridge-render.js:474-488` `drawRing` | anneaux ; halo | `#fff`, `111,211,255`, `#bfeaff` | halo de lumière du contre |
| Ch.I `32-p1-bridge-render.js:504-514` `drawCracks` | cœur, halo, bord | `255,255,255` ; `191,234,255` ; `111,211,255` | explosion du coup final de la phase I |
| Ch.I `40-p2-foundry-render.js:380-392` `drawCnFx` | ombre, halo, cœur | `#6fd3ff`, `111,211,255,.55`, `#fff` | grand rayon du contre de la phase II (plus `lanternBeam`) |
| Ch.I `56-p3-belfry-render.js:231-257` `batFx` | nova `111,211,255`/`235,250,255` ; **éclats** `150,220,255` + blanc ; cloche `235,250,255`, `#6fd3ff` | contre « lumière » de la phase III (éclats = variante B) |
| Ch.I `56-p3-belfry-render.js:258-279` `bellFx` | `235,250,255`, `#6fd3ff` | ondes de la clochette, écho de la grande cloche |
| Ch.I `56-p3-belfry-render.js:290-304` `drawCn3a` | `235,250,255`, `#bfeaff` | pointes au sol (contre « plant ») |
| Ch.I `56-p3-belfry-render.js:427-446` + `48-p3-belfry-poses.js:20-28` | `111,211,255`, `235,250,255`, `220,240,255`, `#bfeaff` | **foudre** (contre « bolt », finale) |
| Ch.I logique (`16:127,310`, `36:173,176,185,195`, `44:200,221`) | `#bfeaff`, `#6fd3ff`, `#fff2b8`, `#ffc15a` | éclats d'impact et étincelles de charge |
| Ch.II `44-counters-help-frame.js:4` (k=1, phase II) | `180,235,255` | arc de l'estoc |
| Ch.II `44-counters-help-frame.js:5` (k=2, **phase I**) | `200,240,255` | rayon de la riposte vers la Voix |
| Ch.II `44-counters-help-frame.js:6` (k=3, **phase III**) | `210,250,255` | foudre vers la lanterne du Phare |
| Ch.II `56-form2-render.js:102-125` `ecFinisher` | `200,240,255`, `235,252,255`, `190,240,255`, `160,235,255`, `220,250,255`, `#e8fdff` | finale : chaîne de foudre et pilier |
| Ch.II `28-hero-draw.js:27-29` | `127,214,255`, `180,240,255`, `#bff0ff` | **dôme de la garde tenue** (phase III) |

Le code de phase du Chapitre II est inversé par rapport à l'affichage : `S.phase` = 2 pour la phase I affichée, 1 pour la phase II (vérifié). Nombre du tableau : `k = S.cnt.k = S.phase`.

## 3. Écarts entre chapitres et dans le code
1. **Chapitre I : trois copies en dur** de `#fff4d6` / `#c9a85a` / `#ffd27a` (`32-p1-bridge-render.js:280`, `40-p2-foundry-render.js:334`, `56-p3-belfry-render.js:148`). Elles valent aujourd'hui la table `WATCHER_T.lantern`, mais n'y sont pas reliées : changer la table ne change **que le Chapitre II**. Le Chapitre II passe, lui, par `LB.watcherLanternCol` (`28-hero-draw.js:40`).
2. **Phase II du Chapitre I** : pas de cas « récupération » (seulement deny / allumée / repos) : la lanterne n'y passe jamais à l'ambre, contrairement aux phases I et III et au Chapitre II.
3. Même bleu-blanc dans les deux chapitres, mais **valeurs différentes** : le Chapitre I écrit `235,250,255`, `191,234,255`, `111,211,255` ; le Chapitre II `180,235,255` à `235,252,255` (une dizaine de variantes proches, toutes littérales). Aucune constante commune hormis `lanternBeam`.
4. **Bouclier** (`LB.drawBlock`, `20-watcher.js:144`, `#6fd3ff`/`#cdeeff`) et dôme de garde du Chapitre II : bleus, communs aux deux chapitres sauf que le dôme reste propre au Chapitre II. Pas des tirs.
5. Hors Veilleur : foudre du Phare noyé (`40-boss-drowned-beacon.js:195-200`, `220,250,255`) et étoiles d'étourdissement du Colosse (`#bfeaff`, `56-p3-belfry-render.js:286`) restent bleu-blanc ; barre de vie et barres d'aide du Chapitre I restent `#6fd3ff` (interface).

## 4. Palette proposée puis validée : jaune neutre + tirs jaune-blanc
Modification de Kevin appliquée : **le cœur des tirs est plus blanc** (halo jaune inchangé).
Principe : un seul jaune (teinte ≈ 48°), les tirs s'éclaircissent vers le blanc chaud au lieu de virer au bleu ; le cœur reste blanc pur (« le blanc ressort dans ses tirs »).

| Ligne | Avant | Après |
|---|---|---|
| Repos `.idle` | `#ffd27a` | `#ffe066` |
| Allumée `.lit` | `#fff4d6` | `#fffbe3` |
| Récupération `.recover` | `#c9a85a` | `#a88f4a` |
| Deny `LB.DENY_COL` | `#ff6b6b` | inchangé (option : `#ff4d5e`, voir § 5) |
| Halo de lanterne / aura | `150,220,255` ; `111,211,255` | `255,226,140` ; `255,217,102` |
| Ombre, halo des tirs | `#6fd3ff`, `111,211,255` | `#ffd966`, `255,217,102` |
| Bord, éclats, traînées | `#bfeaff`, `191,234,255`, `150,220,255`, `220,245,255` | `#fff0b0`, `255,240,176`, `255,226,140`, `255,247,214` |
| Cœur, pointe, foudre blanche (**modifié**) | `255,255,255`, `235,250,255`, `210,250,255` à `235,252,255` | `255,255,255`, `255,250,238` (`#fffaee`) ; milieu de l'orbe `255,246,200` → `255,250,232` |
| Rayon et arc du Ch. II (corps du tir) | `180,235,255`, `200,240,255`, `190,240,255`, `160,235,255`, `#e8fdff` | `255,240,170`, `255,244,190`, `255,236,165`, `255,230,140`, `#fffbe8` |
| Dôme de garde (Ch. II), bouclier, barres d'aide | bleus | **inchangés** (décision de Kevin) |

## 5. Risques de confusion et de contraste (mesurés : ΔE CIE76, contraste WCAG)
- **Rouge de deny** `#ff6b6b` (teinte 0°) contre ambre de récupération `#a88f4a` (44°) : ΔE 57 ; contre repos `#ffe066` : ΔE 73. Distinct, mieux qu'avant (ancien repos/récupération : ΔE 17 seulement ; nouveaux : 37).
- **Récupération contre repos** : l'ancien couple `#ffd27a`/`#c9a85a` était trop proche (ΔE 17) ; `#a88f4a` donne 37 (`#b8872f`, essayé, donnait 34 mais se rapproche de la braise). À valider à l'écran : une lanterne mi-éteinte reste peu lisible sur fond sombre.
- **Chapitre I, braise** : **risque principal.** Halo `#ffd966` contre braise claire `#ffc15a` (étincelles, pointes de flamme) : ΔE 13 (contraste 1,2) ; bord `#fff0b0` : ΔE 33. Avec le bleu, ΔE 77 à 94. Sur le Colosse (`#ff7a2b`) : halo ΔE 51. Sur les images, l'orbe se confond davantage avec la lueur du Colosse ; le cœur blanc tient. Le repos `#ffe066` est aussi proche de la braise claire (ΔE 17 ; ancien `#ffd27a` : 13) et des yeux du Colosse `#ffd27a` (`28-boss-body.js:95`) : l'écart existe déjà, il ne se creuse pas.
- **Deny contre braise vive** `#ff7a2b` : ΔE 36, contraste 1,1 (déjà vrai aujourd'hui) ; `#ff4d5e` (teinte 354°, plus cramoisi) : ΔE 40, `#ff3b5c` : 44. Gain faible : à décider avec les images.
- **Chapitre II, turquoise** : **mieux qu'avant.** Halo jaune sur l'arche `#0e2d31` : ΔE 98 (bleu : 69) ; sur la tour `#407b81` : 82 (bleu : 39) ; sur les hublots `#96f0e1` : 69 (bleu : 33). Seul point faible : bord `#fff0b0` sur hublot clair (ΔE 43, contraste 1,2). Le jaune additionné au turquoise (`lighter`) tire le rayon vers le vert-jaune au milieu (image `ch2-p1-riposte`).
- **Foudre du Phare noyé** reste bleu-blanc : elle se distingue maintenant de la foudre du Veilleur (jaune-blanc), ce qui aide la lecture.
- **Garde composée** (image `ch2-p3-garde-riposte`) : dôme tenu et riposte à la fois, ce qui ne se produit pas en jeu ; seulement pour comparer les deux effets sur une image.

## 6. Lignes changées (2e session ; l'ancienne liste de la 1re session, dôme de garde exclu)
1. `shared/js/20-watcher.js:32` : `idle` `#ffd27a`→`#ffe066`, `lit` `#fff4d6`→`#fffbe3`, `recover` `#c9a85a`→`#a88f4a`.
2. `shared/js/20-watcher.js:108` (halo) et `:197` (aura) : `150,220,255`→`255,226,140`, `111,211,255`→`255,217,102` ; `:220` (boule) : `190,234,255`→`255,240,176`, `111,211,255`→`255,217,102`.
3. `shared/js/20-watcher.js:132-136` (`lanternBeam`) : `#6fd3ff`→`#ffd966`, `111,211,255`→`255,217,102`, `235,250,255`→`255,251,230`.
4. Chapitre I : remplacer les trois copies en dur (`32-p1-bridge-render.js:280`, `40-p2-foundry-render.js:334`, `56-p3-belfry-render.js:148`) par `LB.watcherLanternCol` (mêmes valeurs que la table ; ajoute l'ambre de récupération à la phase II, **changement de comportement à valider**), ou à défaut les trois valeurs ci-dessus.
5. Chapitre I, tirs : `32-p1-bridge-render.js` (`drawOrb` 531-557, `drawRing` 474-488, `drawCracks` 504-514), `40-p2-foundry-render.js:380-392`, `56-p3-belfry-render.js` (`batFx`, `bellFx`, `drawCn3a`, `drawBoltCn`) et `48-p3-belfry-poses.js:20-28` (`drawBolt`) : le tableau de correspondance du § 4 (`#6fd3ff`→`#ffd966`, `#bfeaff`→`#fff0b0`, `111,211,255`→`255,217,102`, `191,234,255`→`255,240,176`, `150,220,255`→`255,226,140`, `235,250,255`→`255,251,230`, `220,245,255`→`255,247,214`), plus les palettes d'impact (`16-p1-bridge-logic.js:127,310`, `36-p2-foundry-logic.js:173,176,185,195`, `44-p3-belfry-logic.js:200,221`). **Non touchés** : `CLANG` et éclats de blocage (`16:28,84`, `44:164,165`), bouclier, barres d'aide.
6. Chapitre II : `44-counters-help-frame.js:4-6`, `56-form2-render.js:102-125` (**pas** `28-hero-draw.js:27-29`, dôme gardé bleu) : correspondance du § 4 (`180,235,255`→`255,240,170`, `200,240,255`→`255,244,190`, `210,250,255`→`255,248,210`, `220,250,255`→`255,250,225`, `235,252,255`→`255,252,235`, `127,214,255`→`255,217,102`, `180,240,255`→`255,236,160`, `190,240,255`→`255,236,165`, `160,235,255`→`255,230,140`, `#e8fdff`→`#fffbe8`, `#bff0ff`→`#fff0b0`).
7. `LB.DENY_COL` : **inchangé** `#ff6b6b` (décision de Kevin).
8. Non fait : regrouper les valeurs de tirs dans une table commune (`LB.WATCHER_T.shot`) ; les tirs restent des littéraux dans les fonctions de dessin (hors périmètre de la session).

## 7. Décisions de Kevin (2e session)
1. Palette du § 4 avec **un cœur plus blanc** : cœur `#fffaee` (`255,250,238`). C'est le blanc le plus chaud testé qui garde un écart net avec la braise claire `#ffc15a` : ΔE 57 (blanc pur 63 ; `#fffbe6`, première proposition, 53 ; ancien bleu-blanc `#ebfaff` 67). Le halo reste `#ffd966` (ΔE 13 contre la braise claire, inchangé). Contre la braise vive `#ff7a2b` : cœur ΔE 80.
2. Chapitre I : les trois copies en dur de la lanterne passent par `LB.watcherLanternCol` (`32-p1-bridge-render.js`, `40-p2-foundry-render.js`, `56-p3-belfry-render.js`). L'ordre de priorité de la phase III est conservé à l'identique (récupération avant allumée). **La phase II prend l'ambre de récupération** (`#a88f4a`) des phases I et III : à juger en jeu.
3. Rouge de deny inchangé ; bouclier, dôme de garde, barres d'aide bleus ; timings et silhouette du Colosse intouchés ; aucun nouveau texte.
