# 2026-11-01 · `engine/watcher` : un seul Veilleur dessiné pour toute la série

Session 4 du plan de `docs/COMMUN.md` § 4 (branche de la session : `claude/watcher-shared-drawing-4b4myw`, prévue `engine/watcher`). Ferme la demande « un seul Veilleur pour toute la série » (`DEMANDES.md`, 27 octobre) et le point 16 de « À trancher » (`docs/GLOSSAIRE.md`). Applique la décision n° 5 du 28 octobre (respiration).

## 1. Ce qui est commun (`shared/js/20-watcher.js`, `shared/svg/watcher-menu.svg`)
- **Le Veilleur du Chapitre I, tel quel** : heaume à visière, manteau d'ordre, tabard à l'emblème de la lanterne, ceinture, épaulières, sceptre-lanterne avec sa petite cloche. Le dessin a été déplacé sans retouche (`LB.drawWatcherBody`, ex-`drawWizard`).
- `LB.drawWatcher(ctx, x, y, pose, t, opt)` et la table `LB.WATCHER_POSES` : `idle`, `block`, `dodgeSide`, `dodgeDown`, `hold`, `raise` (sceptre levé), `hurt`, `down`, `cast`, `counter`, `victory`, `fall`, `walk`. Chaque pose donne une géométrie (main, bâton ou sceptre, inclinaison, lanterne) ; `opt` remplace n'importe quel champ : un chapitre qui chorégraphie lui-même une riposte, une finale ou une cinématique passe ses valeurs (`hand`, `sa`, `staff`, `staffA`, `rot`, `sy`…). Options demandées : `white`, `scale`, `lanternCol`, `glow`, `lamp` (intensité de la lanterne 0 à 1, verre et halo : l'ancien `S.lampDim` du Chapitre II). Le dessin renvoie le centre de la lanterne (départ des tirs).
- `LB.drawLantern`, `LB.drawScepter`, `LB.lanternBeam`, `LB.drawBlock` (ellipse bleue du Chapitre I, qui s'affaiblit sur la durée de l'action ; `plain` = sans contour, garde de la phase III du Chapitre I), `LB.watcherLanternCol` (rouge pendant `deny`, allumée, ambre en récupération, repos).
- **Silhouettes** : `LB.WATCHER_SIL` + `LB.drawWatcherSil` (intro du Chapitre I) et le fragment `shared/svg/watcher-menu.svg`, inséré dans le menu des deux chapitres par `build/assemble.py` (ligne `@svg <fichier> <encre>`). Les silhouettes lointaines de l'outro du Chapitre I sont dans le module (`opt.flat`, `opt.ink`).
- Réglages dans la table `LB.WATCHER_T` (respiration, marche, montée du sceptre 0,08 s, bouclier 0,07 s / 0,45, couleurs de la lanterne).

## 2. Respiration (décision n° 5 du 28 octobre)
- Celle du Chapitre II, gardée : balancement de 0,6 px (`bob` 1,2 × 0,5, 2 rad/s) et pans du manteau (1,5 px, 4 rad/s), dans `LB.WATCHER_T.breath`.
- **Chapitre I** : pose `idle` seulement, Veilleur debout et immobile (phase I hors intro et hors prise, phase III en combat). **Pas en phase II** : le Veilleur y tombe dans le puits, ses pans claquent déjà au vent (3 px, 14 rad/s), inchangés.
- **Chapitre II** : au repos et dans les poses de cinématique tenues par l'angle du bâton (`S.heroPose`) ; plus pendant la garde, l'esquive, le coup reçu.

## 3. Chapitre I : rebranché, inchangé au pixel hors respiration
- `drawPlayer` (phase I), `drawHero2` (phase II), `drawHero3` (phase III), `drawBarrier`, l'outro (`watcher`, Veilleur de dos face au phare) et les deux silhouettes de l'intro passent par le module ; `24-hero-draw.js` ne garde qu'un raccourci `lanternBeam`. Les phases gardent leur chorégraphie (positions, contres, finale, fuite), passée en options.
- Preuve : captures de `main` contre le nouveau `dist` avec la respiration neutralisée (`tests/visual-shots.js --no-breath`) : **126 images sur 126 identiques au pixel**. Avec la respiration, seules diffèrent les images où le Veilleur est au repos (boîte autour du Veilleur, phases I et III, pause).
- Aucune pose du Chapitre I n'a dû être laissée hors du module : la plongée d'esquive de la phase II (`dodgeDown` : chute de `DG.drop`, recul, tour complet) et la chute (`fall`) y sont, avec le corps réduit (0,8) de la phase II.

## 4. Chapitre II : le Veilleur du Chapitre I remplace sa copie
- Abandonnés : tête ronde, visage sombre à deux yeux, écharpe blanche, sacoche, bâton à cristal en losange, `drawWizard`, `wizPoly`, `proHero`. `heroShape(x, y, pose, opt, tint)` ne fait plus que choisir la pose et poser `S.orbX` / `S.orbY` (centre de la lanterne, départ des ripostes).
- Poses : esquive (phase I) = `dodgeSide` avec son image rémanente ; blocage (phase II) = `block` + **bouclier du Chapitre I** pendant toute l'action (`LB.drawBlock`, remplace l'arc bleu de 0,26 s) ; garde tenue (phase III) = `hold`, dôme gardé ; garde brisée et coup reçu = `hurt` (le voile rouge du coup reçu est gardé) ; ripostes : `counter` (phase II, estoc en avant pendant la ruée) et `cast` (phases I et III) ; défaite = `down` couché ; cinématiques (`S.heroPose`) = angle du bâton ; prologue = `walk` puis `idle` ; épilogue = `idle`.
- Lanterne du Chapitre I et ses couleurs (ambre au repos, blanc chaud allumée, ambre sombre en récupération, rouge pendant `deny`) ; `S.lampDim` → `lamp`. **Couleur des tirs inchangée** (CHANGEMENTS.md E : validation visuelle d'abord, hors session).
- Menu : la silhouette retrouve la lanterne (fragment commun) à la place de l'œil turquoise.
- Barre d'endurance de la phase III remontée de `y − 150` à `y − 206` (hauteur du repère d'aide du Chapitre I) : à `y − 150` elle couvrait la lanterne du nouveau Veilleur.

## 5. À valider par Kevin
1. Respiration absente de la phase II du Chapitre I (Veilleur en chute) : la garder ainsi ?
2. Chapitre II : lanterne ambre en récupération (comme au Chapitre I), voile rouge du coup reçu gardé, estoc à la place du coup de bâton balancé pendant la riposte de la phase II, barre d'endurance remontée.
3. Lanterne ambre du Chapitre I au Chapitre II alors que ses tirs restent bleu-blanc : à trancher avec CHANGEMENTS.md E (jaune neutre, tirs jaune-blanc).

## 6. Tests
- `tests/visual-shots.js` étendu : `--poses <dossier>` (planches de toutes les poses et des variantes, dessinées par le module de chaque chapitre, plus les poses en scène des deux chapitres, prologue, épilogue, défaite, outro) et `--no-breath` (respiration neutralisée). Les deux planches sont identiques d'un chapitre à l'autre.
- Bots et tests d'états identiques à `main` (même graine) ; build reproductible ; suite des deux chapitres verte (détail : rapport de session et `NOTES.md`).
