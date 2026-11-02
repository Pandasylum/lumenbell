# 2026-11-02 · `engine/next-card` : un seul module de carton « à suivre »

**Règle : un seul module de carton à suivre, `LB.nextCard` (`shared/js/24-cine.js`).** Aucun chapitre ne redessine « LUMENBELL · CHAPITRE » ; chaque chapitre n'a qu'un appel `LB.nextCard(ctx, s, {n, name, col, decor})`. Le décor (plan de fond) reste celui du chapitre.

- **Rendu commun** (celui du Chapitre I pour tous) : une ligne centrée en y1, « LUMEN » couleur du chapitre suivant (`LB.CH_COL[n]`) puis « BELL · CHAPITRE N » crème (`LB.TITLE_T.cream`) ; le nom du chapitre en grand dessous, couleur du chapitre suivant, centré en y2. Positions, tailles, délai, fondu et couleurs : table `LB.NEXT_T`.
- **Légende HTML identique pour tous** : « Chapitre N · Nom. À suivre. » / « Chapter N · Name. To be continued. », teintée de `LB.CH_COL[n]`.
- **Garde** (`tests/cine.js`) : échoue si « LUMENBELL » / « CHAPITRE » / « CHAPTER » est dessiné hors de `24-cine.js`, ou si un chapitre a plus d'un appel ; rend les derniers cartons des Chapitres I et II (mêmes position, polices, centrage ; LUMEN = `CH_COL[n]`, BELL crème ; légendes du même format). `tests/ch2-announce.js` autorise « BELL · CHAPITRE III » / « BELL · CHAPTER III ».
- **À valider** : le crème couvre « BELL · CHAPITRE N » (et non seulement « · CHAPITRE N »), pour garder « LUMENBELL » lisible avec « BELL » crème comme au titre.
- Pas touché : la PR n° 48 (abandonnée) n'est pas reprise.
