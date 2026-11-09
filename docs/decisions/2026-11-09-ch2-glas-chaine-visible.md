# 2026-11-09 · `ch2/glas-chaine-visible` : chaîne du décor du Glas de l'Ancien de Rouille plus lisible

- La chaîne qui tombe (`dchain`, `drawDChain`) reçoit un contour sombre, un liseré clair et une ombre au sol qui grandit pendant la chute, comme la planche (`drawRafter`). La chaîne passe de `#4a2a18` à `#8a6a48`, le maillon de `#2a1810` à `#4a3320`.
- Constante nommée `DCHAIN_FX` (`64-prologue.js`), valeurs provisoires, à régler à l'œil.
- Ordre de dessin vérifié : `drawKingFx` (donc `drawDChain`) est appelé après `drawRustHaze` ; la chaîne n'est pas recouverte par le voile, aucun changement d'ordre.
- Aucun changement de timing (`SP.glas.chain`), de fenêtre de blocage, de difficulté ni de texte.
