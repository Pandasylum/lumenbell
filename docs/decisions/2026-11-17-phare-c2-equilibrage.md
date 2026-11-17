# Phare Noyé (Chapitre II) : cloches des rages, combos – 17 novembre 2026

Périmètre : Chapitre II, boss Phare uniquement. Aucune accélération globale, aucun multiplicateur de boss (`RHY.rage[3]` reste 1) ; Chapitre I et `shared/` inchangés. Le rythme interne des attaques reste celui du Normal.

## Cloches de la rage 1 de la partie 2
- Le Phare lance les petites cloches depuis sa position (le cœur de la tour) ; après l'impact (paré ou non) chaque cloche lui revient, puis il la relance (boucle lancer / retour / relance).
- Lisibilité : la cloche est brandie avec une lueur avant le lancer (bleu clair), traînée courte à l'aller (bleu clair) et au retour (or, trajet en arc).
- Nombre de cloches (`PHARE_DIFF.rain`) : Facile 6 (inchangé), Normal 5, Difficile 5 (une de moins).
- Les chutes du glas final gardent leur chute verticale.

## Échos
- Aucun écho de cloche n'existait dans le code de la partie 2 du Phare : rien à retirer, rien d'ajouté. L'Écho de rage (Voix) et la Voix ne changent pas. À valider : si « échos des cloches » visait un autre élément (par ex. les ondes sonores `sonic`), à préciser.

## Combos (`PHARE_COMBO`, `40-boss-drowned-beacon.js`)
Un combo = une série de sorts différents tirés au hasard dans le pool des sorts simples, un seul contre pour la série. Un tirage « 2 ou 3 » se fait à pile ou face ; le combo existe toujours.

| Difficulté | Partie | Avant rage | Après rage |
|---|---|---|---|
| Normal | 1 | aucun combo | combo de 2, 1 fois sur 2 |
| Normal | 2 | combo de 2, 100 % | toujours un combo : 50 % de 2, 50 % de 3 |
| Difficile | 1 | combo de 2, 100 % | combo de 2, 100 % |
| Difficile | 2 | toujours un combo : 50 % de 2, 50 % de 3 | combo de 3, 100 % |
| Facile | 1 et 2 | aucun combo (non précisé : à valider) | aucun combo |

Les anciens duos et trios écrits à la main sont remplacés par ce tirage ; le tableau l'emporte sur les valeurs existantes. « Après rage » = au moins une rage passée.

## Complément du 17 novembre 2026
- Échos (ondes sonores, `sonic`) des cloches retirés en partie 2 : ni dans la rotation (après rage), ni dans la rage 2 Difficile (la grosse cloche seule). Les cloches ne changent pas. Les ondes ne viennent pas de `shared/` et ne servent pas au Chapitre I.
