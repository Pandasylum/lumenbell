# 2026-11-01 · `ch1/foundry-floor` : application (K, L, G, D)

Session de code. Choix faits pendant l'application, à valider par Kevin.

## Choix faits
- **Plateforme** : le Veilleur se tient sur un bloc de pierre du pont, tombé sur le rebord au bord de la lave. La hauteur du bloc vaut la plongée d'esquive (`DG.drop`, inchangée) : l'esquive le fait descendre du bloc sur le rebord, devant le bloc, puis remonter.
- **Lanterne (section G)** : petite lanterne de Veilleur posée sur le rebord, à droite de l'anneau tombé, sous la chaîne rompue et les équerres. Orange, faible, pulsation lente ; ni texte, ni bruitage, ni zoom.
- **Fin de phase II** : le Colosse descend vers la lave, s'y enfonce (la lave passe devant lui), jaillit et s'envole vers la hotte du grand four. Même instant de plongeon qu'avant.
- **Défaite de phase II** : le Veilleur tombe du bloc sur le rebord et reste couché (plus de chute dans le vide).
- **Facile** : à 1 PV en phase III, la foudre mène directement à la vraie fin (pas de seconde vie, comme l'ancienne fuite qui arrivait au même moment). Les deux phrases de lecteur d'écran de la fuite disparaissent avec elle.
- **Genou** : « The Colossus is on his knees. Phase I cleared. » devient « Phase I cleared. » / « Phase I terminée. » ; le titre de l'ancienne carte (« plie un genou ») devient « Phase I cleared » / « Phase I terminée », comme la carte actuelle.

## À valider
- **Plongée d'esquive** : au point bas du tour complet (rotation autour des pieds), la lanterne et le haut du corps passent d'environ 40 px sous la surface du rebord. Proposition (non implémentée) : faire tourner le Veilleur autour de sa taille au lieu de ses pieds, ou remplacer le tour complet par un saut arrière accroupi (sans rotation) vers le rebord.
- **Ancienne carte de fin de phase I** (`showEnd` sans `G.p2`, probablement plus atteinte) : le titre répète la ligne du haut (« Phase I terminée » deux fois).
- **Facile sans seconde vie** : confirmer que la vraie fin doit suivre directement, plutôt qu'après la seconde vie de Normal.
