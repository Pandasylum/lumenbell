# Plafond du rapport de pixels sur tactile (2026-11-08)

- **Cause** : sur téléphone, `LB.dpr` (`shared/js/00-lb.js`), les cinématiques (`shared/js/24-cine.js`) et le Chapitre II (`DPR_MAX`) plafonnaient à 1,25. Le canvas est rendu en trop basse résolution puis agrandi : image pixelisée.
- **Valeur** : 1,5 sur tactile (`pointer:coarse`). Desktop inchangé (plafond 2).
- **Raison de la baisse** (1,75 → 1,5) : lag constaté sur mobile à 1,75. 1,5 garde une image nettement plus nette que 1,25 tout en restant fluide.
- **Constante unique** : `LB.DPR_COARSE_MAX` (`shared/js/00-lb.js`). `LB.dpr`, les cinématiques (`K = LB.dpr`) et `DPR_MAX` du Chapitre II la lisent ; aucune copie locale.
- **Coût GPU** : environ 1,44 fois plus de pixels que 1,25 (1,5² / 1,25² = 1,44). Le plafond reste sous 2 pour limiter chauffe et perte d'images par seconde sur les téléphones modestes.
- **Évolution** : remonter (1,75, puis 2) se fait en changeant cette seule constante, si les téléphones testés tiennent le rythme.
- **Effet de bord** : les cinématiques tactiles suivent maintenant `window.devicePixelRatio` (avant : 1,25 fixe) ; un écran à rapport 1 reste à 1.
