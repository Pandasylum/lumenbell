# 2026-11-09 · `ch2/p3-implosion-charge` : charge lisible de l'implosion (dernier assaut, forme II du Phare)

**Décision de Kevin** : l'implosion (`implode`) a un temps de charge lisible, puis l'explosion.

- Charge de `t0` à `tb` : les morceaux de la tour convergent vers le centre, la tour se contracte, la lueur monte avec un plancher dès le début, le tremblement croît ; un bref instant immobile (`quiet`) précède l'explosion.
- À `tb` : flash, onde qui traverse l'écran jusqu'au Veilleur (impact visible sur lui), gerbe, tremblement d'écran, en plus de l'effet existant (craquement de la cloche).
- Constantes nommées `IMPLODE_FX` (`68-form2-logic.js`), valeurs provisoires, à régler à l'œil.
- **Aucun changement** de timing (`ta`, `tb`, préparation, fenêtre de maintien), de difficulté, de PV ni de texte. `ta` à `tb` est bien la fenêtre de maintien (dessinée comme telle par l'aide de la fenêtre) ; `BEACON_FX.glas` ne définit pas `ta`/`tb`, ils restent dans `glas()`.
- Ordre de dessin : lueurs et onde en `lighter` après `drawEcl`. Les drapeaux d'effet (`bf`, `hf`) vivent sur la menace, recréée à chaque retry de phase.
