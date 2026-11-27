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

**À valider** : vitesse des gestes raccourcis ; tête du marteau en partie hors écran au sommet de l'armement ; impact à PX+90 (avant la barrière de PX+116 : la tête passe la barrière quand le Veilleur pare).

Phases II et III inchangées (`demonBody`), rien dans `shared/`.
