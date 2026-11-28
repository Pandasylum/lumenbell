# Chapitre II, phase I : la salle des reflets

Validé par Kevin (2026-11-27). Référence : `da/maquette-a11.html`, variante miroir.

- Décor « grand miroir » : miroir fêlé en ogive, grande source derrière la Voix.
- Voix Creuse : silhouette et proportions du jeu conservées, reconstruite (bras levé, griffes longues, robe fendue sur un vide, ourlet en pointes, fêlures qui palpitent).
- Rejetés : voix sombre à capuche, créature de verre, grande arche à la lune.

Implémentation (décor seul, `bg2`) : le miroir est centré sur x=735 (place de la Voix) au lieu de 676, et le mur (piliers, arches, voûte) suit de +59. Le sol de la maquette (G=424) est ramené au sol du jeu (GY). Les plans fixes sont mis en cache ; la brume et les gouttes bougent. La trappe, les éclats et le reflet (`mirrorFloor`) gardent leur code. Aucun timing, valeur de jeu ni texte ne change.
