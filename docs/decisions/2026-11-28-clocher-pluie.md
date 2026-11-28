# 2026-11-28 · Phase III du Chapitre I : grêle de braise, bombes, chute de pierres, cri (lot 4)

Mise en jeu de la maquette validée `clocher-pluie.js` (hors dépôt). Rendu seulement : timings, impacts, positions et rythme des bombes (`bombPos`, `bombL`), logique, sons et textes inchangés.

## Ce qui change
- **Poses** (`54-p3-belfry-colosse.js`, `col3Pluie`, appelée par `col3Atk`) : grêle (il inspire puis appelle le feu au ciel), bombes (il crache chaque cœur au rythme de `bombL`), pierres (il arrache un bloc du dallage, le hisse à deux mains, le lance), boule de feu (il crache), cri (il se ramasse puis hurle, le corps secoué). Les ailes de ces poses sont celles de la maquette.
- **Dessins** (`56-p3-belfry-render.js`, `drawHits3a`) : nuée de cendre et pluie oblique d'éclats de braise, cœurs de braise posés qui clignotent puis éclatent en colonne de feu, trou dans le dallage, bloc lancé en cloche puis gravats, boule de feu en éclat de braise, ondes du cri, ruissellement de la voûte, dalle fendue, maçonnerie qui tombe droit.
- **Secousses** de la maquette (11 pour bombes et chutes, 8 sinon, 4 pendant le cri), posées par le rendu, nulles en mouvement réduit.
- **Rages** : poses et dessins calés en temps de pose (`a.pt` avec `h.at - a.off`, `bombL` en `a.pt`) ; seuls les coups ice, bomb, rock, fire et fall comptent, et la fin de l'attaque ne compte qu'eux. Le cri et les coups de queue gardent leur dessin ; le cri enchaîné de l'Embrasement final suit le même chemin.
- **État propre au dessin** (trou, blocs en main) rangé sur l'attaque (`a.c3`) : il repart à chaque attaque.
- **Mouvement réduit** : flammes, nuée, poussière et clignotement figés ; ni éclats ni gravats ; les projectiles bougent toujours (lecture du coup).
- **Retirés** (code mort vérifié par recherche dans tout le dépôt) : `drawBombs`, `drawIce3` (`52-p3-belfry-decor.js`), anciennes pierres, boule de feu et chute de `drawHitsX`.

## Décisions à valider
- **Dôme** : la maquette dessinait le dôme de la garde pendant toute l'attaque (parade automatique). En jeu, le dôme reste celui de la garde réellement tenue (`LB.drawBlock`) ; seul l'éclat bleu sur son bord, à l'impact, est gardé, et seulement pour un coup paré.
- **Décor du fond, cohérence des phases (la phase I prime)** : les tours de l'ordre de la phase III reprennent la silhouette des flèches de la phase I (pointe en ogive, corniche, fenêtre en ogive, lueur douce), sans éperon ni liseré clair ; fenêtre centrée là où répond la lanterne du final (`R.towerAt`, inchangé). La lune de la phase III devient sombre et mate comme en phase I (la lanterne reste la lumière la plus vive). La phase II (intérieur de la Fonderie) n'a ni tour ni lune : rien à aligner.
