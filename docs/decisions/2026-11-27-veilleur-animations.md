# 2026-11-27 · Veilleur : cape large, repos vivant, élan et retombée, gestes de lumière

**Décision.** Le Veilleur commun (`shared/js/20-watcher.js`, `LB.drawWatcher`) suit la référence validée `veilleur-reference.js` (perso, brasV, lampe, tableau V des courbes et effets), dans les deux chapitres.

- **Cape large** de la maquette : la pointe part vers x = −110 (−48 avant), deux pans animés par le vent. Le dessin seul change : la zone de jeu, la position et les fenêtres du Veilleur sont les mêmes.
- **Repos vivant** (pose `idle`, comme la respiration d'avant) : respiration du haut du corps, regard qui se tourne puis revient, cape au vent, hampe qui oscille, lanterne qui se balance, flamme qui vacille, éclat de visière. Boucle de 4,4 s (`W.idle.loop`).
- **Bloquer** (`block`, `hold`) : élan d'appui (le Veilleur se tasse, se penche, porte la lanterne en avant). **Esquiver** (`dodgeSide`, `dodgeDown`) : ramassé, saut, réception tassée, poussière. **Retour au repos** : retombée, fondu de 0,3 s depuis la dernière image.
- **Calage** : l'animation lit seulement la pose, son avancement `k` et l'horloge que le chapitre donne déjà. États, timings, fenêtres et logique de `LB.hero` inchangés ; aucun chapitre modifié. Réglages dans `LB.WATCHER_T` (`idle`, `wind`, `arm`, `anim`, `moves`).
- **Gestes de lumière exposés, non branchés** : poses `orb` (orbe), `lunge` (élan), `ring` (bague), `halo`, avec `k` = secondes écoulées ; `W.moves` donne l'instant d'effet `T` et la durée. Effets de la référence dessinés (sauf `opt.fx === false`) ; secousse d'écran suggérée renvoyée dans `shake`. Option `opt.choc` (choc reçu sur la garde, `LB.watcherChoc`) prête, non branchée.
- **Bras** : deux segments de 23 px (à l'échelle), épaule fixe au bord du mantelet (10, −76), le coude plie ; une main hors d'atteinte s'arrête au bout du bras tendu.
- **Mouvement réduit** : ni repos vivant, ni élan, ni vent, ni retombée, ni particules ni secousse ; les gestes de lumière gardent leurs courbes.
- **Téléphone** : ni `filter` ni `shadowBlur`, aucun canvas créé ; seuls des chemins (Path2D) et des dégradés sont construits à chaque image.

**À valider** : la boucle du regard (4,4 s, celle de la planche, peut-être trop fréquente en combat) ; l'élan de garde porte la lanterne d'environ 30 px en avant (départ des tirs `lx, ly` déplacé d'autant) ; la garde de la phase III du Chapitre I (`raise`, partagée avec les cinématiques) n'a pas d'élan ; la couleur des poussières (pierre du pont) sert aussi au Chapitre II ; la glissade au choc de la planche attend que les chapitres passent `opt.choc`.
