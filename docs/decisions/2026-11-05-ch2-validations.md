# 2026-11-05 · Chapitre II : validations de Kevin du 5 novembre (`ch2/validations-5nov`)

Textes validés par Kevin. Aucun changement de timing, d'équilibrage ni de silhouette.

## A. Textes
1. **Fin de phase II** : « Après des années d'attente, à la lueur de la lune, seul le silence lui répond. » / "After years of waiting, by the light of the moon, only silence answers him."
2. **Cartes de défaite** (`CHANGEMENTS.md` J c) : une par phase, surtitre « Défaite · Phase X », titre et corps affichés (comme au Chapitre I). Les anciens « Defeat » seul et « The Watcher is down. » disparaissent ; la phrase du lecteur d'écran « Le Veilleur tombe. Défaite. » reste. Tableau dans `docs/CH2-SPEC.md`. En Épreuve, la phrase « Épreuve : une chute te renvoie à la phase I. » est ajoutée à la suite du corps (à valider).
3. **Titre de la phase III** : « Cœur bleu » devient « Cœur turquoise » / "Turquoise heart".

## B. Image
4. **Rémanence** : la fêlure naît sur la cloche de tête gisant dans les décombres pendant l'évaporation du Lumen (table `CRACK_BORN`, 5,3 s à 7,8 s de la cinématique) ; avant, la cloche était déjà fêlée dès sa chute. Ni texte ni bruitage.
5. **« Couronne »** : le mot n'est plus gravé pendant l'animation de fin de phase III ni sur l'image de fin ; il ne reste qu'au gros plan de l'outro (carton 2). Signes anguleux du bord inchangés.

## C. Son
6. **Murmure** de la naissance de la forme II : synthèse existante (`FX.murmur`, `60-music.js`), grave, large et bas ; aucun texte.
7. **Lanterne du Veilleur** : pâlit un instant à la même seconde (table `LAMP_DIM_BIRTH`, via `S.lampDim` / `lamp`), rendu de la cinématique seulement.

## D. Non touché
Textes n° 11, 24, 31, 38, 39, 79, 81 de l'ancien `TEXTES.md`. Les épaules de l'Ancien sont déjà les phares du sommet : seuls les documents changent (`docs/LORE.md` § 9).

## Documents
`docs/LORE.md` (blocs fournis par le projet Lore), `docs/CH2-SPEC.md`, `docs/GLOSSAIRE.md`, `CHANGEMENTS.md` (section O ; J c en cours ; correction de K), `docs/decisions/2026-11-01-ch1-foundry-floor.md` § 3 (correction de documentation : la carte de défaite du Chapitre I est affichée).

## Moment exact de la naissance de la forme II
Cinématique `3:p2` (`ecTransition`), à 2,1 s : l'éclatement de la tour, où la Sans-Fond sort. Si Kevin entendait un autre instant, c'est la valeur `[2.1,'murmur']` de `CSFX['3:p2']` et `LAMP_DIM_BIRTH.t`.
