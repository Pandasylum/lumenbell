# 2026-11-27 · Colosse, Chapitre I phase I : boule à la chaîne et marteau à deux mains

Remplace les points « à valider » de [2026-11-27-colosse-torse.md](2026-11-27-colosse-torse.md).

**Deux armes, deux attaques**
- **Boule hérissée à la chaîne** : au poing au repos ; c'est l'arme des quatre poses (repos, armement, frappe, arrachement). La chaîne autour du corps (bandoulière) ne se déroule plus.
- **Marteau à deux mains** : rangé dans le dos, tête visible au-dessus de l'épaule ; c'est l'attaque au marteau (combo `sw*` et coup final de la phase).

**Attaque au marteau** : images clés de la référence validée `colosse-marteau.js`, dans l'ordre : boule passée en bandoulière, saisie par-dessus l'épaule, armement à deux mains, impact, arrachement, retour par-dessus l'épaule, rangement. Tables `MK`, `MK_SEQ`, `MK_HIT` (`chapters/ch1-ember-bridge/src/js/32-p1-bridge-render.js`).
- Bras de longueur fixe (68 / 66), coude toujours du même côté, mains sur le manche, jambes plantées.
- La tête du marteau atteint le Veilleur : impacts à PX+90 (coup bas : 1er et 3e coups ; coup haut : 2e), la pointe touche l'avant du Veilleur. Pour y arriver sans étirer les bras, le Colosse passe à l'échelle 1,1 (au lieu de 1,05).
- Combo : il reste à deux mains entre les coups (arrachement puis armement).
- Durées, moments d'impact et logique du jeu inchangés : les images clés sont calées sur les états. **Gestes raccourcis** faute de temps : sortie (bandoulière, saisie, armement) dans `sw1w` (0,75 s en Normal au lieu de 1,95 s dans la référence) ; rangement dans `swrec` (0,65 s au lieu d'environ 2,8 s) et dans `orb` (0,6 s) ; sortie du coup final en 0,35 s.

**Mise à jour (validée)**
- **Échelle 1,1 validée** ; elle est à reprendre en phases II et III (aujourd'hui inchangées).
- **Bloqué / touché** : quand le Veilleur bloque (parade réussie ou barrière levée pendant le coup), la pointe de la tête s'arrête sur la barrière (PX+116) sans la traverser ; quand il est touché, la tête l'atteint (centre à PX+90). Moments d'impact inchangés. Table `MK_HIT`.
- **Armement** : manche baissé derrière le dos (P [-5,-285], angle 50°) au lieu de la référence (P [0,-300], -15°), pour que la tête reste entière à l'écran, téléphone compris ; bras à longueurs fixes. Pendant le coup (0,26 s), l'arc passe brièvement au-dessus du cadre.

**À valider** : vitesse des gestes raccourcis.

Phases II et III inchangées (`demonBody`), rien dans `shared/`.
