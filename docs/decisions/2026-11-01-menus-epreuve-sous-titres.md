# 2026-11-01 · Menus : nom de l'Épreuve et sous-titres des difficultés

Décision de Kevin du 1er novembre 2026, validée telle quelle. Documentation seulement : rien n'est codé ici. Le travail part dans la session `menu/common` (table `CHAPTER`, sous-titres communs).

1. **Nom de l'Épreuve dans tous les menus** : « Épreuve » + l'élément du chapitre.
   - Chapitre I : **Épreuve du feu**.
   - Chapitre II : **Épreuve de l'eau**.
   - Chapitre III : **Épreuve de la terre**.

2. **Sous-titres des difficultés, identiques dans tous les chapitres** :
   - Facile · *Respire*
   - Normal · *À la loyale*
   - Difficile · *Sans pitié*
   - Épreuve · *Challenge ultime*

3. **Remplace** :
   - « Le vrai combat » (Normal, Chapitre I) → « À la loyale ».
   - « Respirer » (Facile, Chapitre II) → « Respire », comme au Chapitre I.
   - « Le Colosse déchaîné » (Difficile, Chapitre I) → « Sans pitié ».
   - « Sans pitié » propre au Chapitre II → devient le libellé commun de Difficile.
   - « Épreuve / Sans soin » (Chapitre II) → « Épreuve · Challenge ultime ».

4. **Ferme** :
   - les points 14 et 15 de « À trancher » dans `docs/GLOSSAIRE.md` (nom de l'Épreuve, sous-titres) ;
   - l'ancienne décision 9 de `docs/decisions/2026-10-28-engine-shared.md` (libellé de Difficile propre au chapitre) : ce libellé devient commun à tous les chapitres.

5. **À appliquer** : session `menu/common`, table `CHAPTER` et sous-titres communs. Aucun texte de menu n'est modifié par ce fichier. **Appliqué le 1er novembre** (`docs/decisions/2026-11-01-menu-common.md`), avec l'anglais provisoire Breathe, Fair and square, No mercy, Ultimate challenge, Trial by Fire, Trial by Water, à valider.

## Reste ouvert

- Textes anglais des sous-titres (projet Lore).
- Nom de l'Épreuve du Chapitre III (« Épreuve de la terre » est la forme française décidée ; le nom anglais reste à fournir).
