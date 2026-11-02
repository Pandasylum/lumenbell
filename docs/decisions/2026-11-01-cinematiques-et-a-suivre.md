# 2026-11-01 · `ch2/cinematics` : style des cinématiques du Chapitre II et carte « à suivre » commune

Décisions de Kevin (1er novembre), enregistrées telles quelles.

## 1. Décisions
1. **Style** : les cinématiques du Chapitre II suivent celles du Chapitre I : plans sobres, cadre et rythme de `LB.cine`, cartons `{d, en, fr, draw}`, fondus, aucun mot d'annonce, ce qui se montre n'est pas écrit, mêmes durées (6 à 7 s par carton).
2. **Carte « à suivre »** : même rendu pour toute la série, celui du Chapitre I (« LUMENBELL · CHAPITRE N+1 » en petit, nom du chapitre en grand dessous, même police, taille et position, légende dessous). Seuls changent le nom, la couleur et le décor.

## 2. Ce qui a été fait
- **`LB.nextCard(ctx, s, {n, name, col, decor})`** (`shared/js/24-cine.js`) : reprend exactement la mise en page de la fin de l'outro du Chapitre I (Big Shoulders 700 22 px à y 118, 800 62 px à y 182, centré à 480, apparition après 1 s en 1,5 s). Réglages dans la table `LB.NEXT_T` ; numéros romains jusqu'à VII.
- **`LB.CH_COL`** : table commune des couleurs de chapitre (II `#4fe0cc`, III `#b9cf5a`), la seule source ; le `CH_COL` du Chapitre II la pointe. Les chapitres suivants ajoutent leur ligne ici.
- **Chapitre I** : seule la carte de fin change : elle passe par `LB.nextCard`, texte et légende teintés du turquoise du Chapitre II (avant : blanc bleuté `#e8f6ff`). Décor, position et textes inchangés ; le reste de l'intro et de l'outro n'est pas touché. Personne d'autre ne l'avait encore teintée.
- **Chapitre II** : le dernier carton de l'épilogue (forêt) dessine « LUMENBELL · CHAPITRE III » / « HOLLOW ROOTS » en vert mousse avec la même fonction ; légende existante (« Chapitre III · Hollow Roots. À suivre. ») conservée. Aucun texte nouveau.
- Déjà conformes (session `engine/cine`) : intro et outro du Chapitre II sont dans `LB.cine`, durées `CINE_D` de 6 à 7 s, titre d'intro par `LB.title`.

## 3. À faire plus tard (cinématiques de phase)
Trappe, descente, fin de phase II, transformation, fin de phase III : elles tournent dans la boucle du jeu (`S.cine`, `52-cine-phases.js`, `skip` du jeu), avec le héros, les particules et la caméra du combat. Les passer par `LB.cine` n'est pas simple (elles partagent l'état du combat) : **rien n'a été forcé**.

## 4. Points à valider
- **Teinte du Chapitre I** : le texte de la carte (titre et légende) est turquoise ; faut-il garder la légende crème et ne teinter que le titre ?
- **Halo** : pas de halo sous le titre « à suivre » (le Chapitre I n'en avait pas) ; `LB.title`, lui, en a un.
- **Titre de l'intro** : le haut du Phare passe-t-il derrière « BELL » ? Non vérifié (aucune capture lancée, rien corrigé) : à regarder sur `jeu-apercu`.
- Tests : `build.py`, `build_ch2.py`, `build_test.py` (requis par `smoke.js`), `smoke.js` et `cine.js` : `errs []`. Pas de `ch2-texts` (aucun texte changé), pas de captures.
