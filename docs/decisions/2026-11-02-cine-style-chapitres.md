# 2026-11-02 · Style des intros et outros de chaque chapitre (`outro/titre-lumen`)

Décisions de Kevin, valables pour tout chapitre, présent ou à venir.

## 1. Décisions
1. **Style « cartons `LB.cine` »** pour l'intro et l'outro de chaque chapitre : plans sobres, cartons `{d, en, fr, draw}`, fondus, aucun mot d'annonce, ce qui se montre n'est pas écrit, 6 à 7 s par carton.
2. **« LUMEN » coloré, « BELL » crème** dans toute intro ou outro, partout où « LUMENBELL » est écrit (comme dans le menu principal et dans `LB.title`). La couleur est celle du chapitre dont il s'agit (intro) ou du chapitre annoncé (outro).
3. **Cinématiques de phase** : elles gardent le style propre à leur chapitre et ne passent pas par `LB.cine`.

## 2. Ce qui change
- **Chapitre I** : la petite ligne « LUMENBELL · CHAPITRE II » de la fin de l'outro : « LUMEN » turquoise `#4fe0cc` (chapitre annoncé), « BELL · CHAPITRE II » crème (`LB.TITLE_T.cream`). Même police, taille, position. Aucun autre changement de plan, de texte ou de durée. Le rendu de l'outro change : voulu, plus d'identité au pixel pour cette carte.
- **Chapitre II** : le titre « à suivre » du dernier carton est rétabli (`nextTitle`, `76-epilogue.js`) : « LUMENBELL · CHAPITRE III » petit, « HOLLOW ROOTS » grand, vert mousse `CH_COL[3]`, « BELL » crème, mise en page de l'outro du Chapitre I. Légende réduite à « À suivre. » / « To be continued. » (l'ancienne doublait le titre) ; `docs/CH2-SPEC.md` (outro, carton 5, FR et EN) modifié sur demande de Kevin. `TEXTES.md` (régénéré) et la liste de `tests/ch2-announce.js` suivent. Le titre n'avait jamais été sur cette branche : il vient de `dd1680a` (PR #47, `LB.nextCard`), refait ici sans `shared/`. Premier carton de l'outro : 7 s → 6 s (`CINE_D.outro` : `[6, 6, 6, 7, 7]`, soit 32 s). Autres durées et textes inchangés.
- Rien dans `shared/`.

## 3. Points à valider
- **Carte « à suivre » commune (`LB.nextCard`, PR #47)** : elle écrit « LUMENBELL · CHAPITRE N+1 » en une seule couleur. Elle devra suivre la règle (« LUMEN » couleur, « BELL » crème) : modification de `shared/js/24-cine.js`, hors de cette session. La ligne du Chapitre I faite ici devra alors être remplacée par l'appel à cette fonction (conflit probable sur `80-cine-outro.js`).
- Le grand titre « SILENT BELLS » garde sa teinte actuelle (`#e8f6ff`) : le mot n'est pas « LUMENBELL ».
