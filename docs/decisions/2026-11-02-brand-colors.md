# 2026-11-02 · `engine/brand-colors` : une seule règle de couleur pour « LUMENBELL »

**Règle : « LUMEN » en couleur du chapitre, « BELL » en crème, partout pareil.** La table commune `LB.BRAND` (`shared/js/24-cine.js`, à côté de `LB.TITLE_T`) porte le crème (`bell:'#f0e8df'`, ancienne valeur de `LB.TITLE_T.cream`, qui disparaît ainsi que `LB.NEXT_T.cream`). « LUMEN » prend la couleur du chapitre (`LB.CH_COL`, couleur du chapitre au menu).

- **Trois lecteurs de la table** : `LB.title` (titre d'intro), `LB.nextCard` (ligne « LUMENBELL · CHAPITRE N »), menu (`shared/js/28-ui.js` : `<h2><span>Lumen</span><i>bell</i></h2>`, la règle CSS de `i` lit `LB.BRAND.bell`).
- **Menu** : « bell » était en `var(--fg)`. Chapitre I : `--fg` = `#f0e8df`, aucun changement. Chapitre II : `--fg` = `#ece6dc` → `#f0e8df` (écart de quelques unités, quasi invisible). Texte et halo du titre inchangés.
- **Garde** (`tests/cine.js`, § 5) : échoue si le titre d'intro, le carton « à suivre » ou le menu d'un des deux chapitres s'écarte de la paire (LUMEN = chapitre, BELL = crème), si le crème est écrit en dur sur une ligne « LUMEN/BELL » hors `LB.BRAND`, ou si « LUMEN »/« BELL » est dessiné hors de `24-cine.js`.
- **Build** : les deux `dist` ne changent que par ces trois titres.
- **À valider** : Chapitre I n'a pas d'entrée dans `LB.CH_COL` (son orange `#ff7a2b` est encore écrit dans l'appel `LB.title` du chapitre et dans la couleur du menu) ; non touché (hors `shared/`).
