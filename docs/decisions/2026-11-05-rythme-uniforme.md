# Chapitre II : rythme interne uniforme (2026-11-05, `c2/rythme-uniforme`)

## Décision
Règle du Chapitre I appliquée aux trois boss du Chapitre II (Voix, Ancien de Rouille, Phare) : la difficulté ne multiplie plus le rythme interne des attaques. Le facteur `f` de `spawn()` vaut `1 / (RHY.sp × vitesse de la Voix × (1 + 0,1 × rage))` avec `RHY.sp = 1` (le Normal) pour les trois difficultés ; l'ancien `d.sp` (0,85 / 1 / 1,18) n'y entre plus. Les durées en Normal sont inchangées.

Inchangés : plancher entre sorts (1,05 / 0,75 / 0,6 s), pauses entre attaques, volées, pluies, écho de rage, écho permanent, PV et seuils, fenêtres du Veilleur.

## Ancien de Rouille en Difficile (valeurs validées, secondes réelles)
Doubles blocages 0,35 s ; vague puis 1re poutre 0,8 s ; échos du Glas 0,5 s ; préparatifs à 100 % ; balayage : coups 1-2 à 0,70 s, 2-3 à 1,00 s, 3-4 à 0,85 s (`SP.sweep.d.hard`). L'ancien drapeau `real` du balayage disparaît (devenu inutile).

## Garde-fou
`tests/ch2-smoke.js` : contrôle statique, échoue si `d.sp` est lu dans le script, si `f` ne vient plus de `RHY.sp`, ou si `f` multiplie un plancher/écart (`VX.gap`, `SP.floor`, `gap`). Règle ajoutée à `CLAUDE.md` (« Difficulté et chapitres »).

## Décisions à valider
- Facteur de rage ×1,1 neutralisé en Difficile seulement (secondes réelles) ; gardé en Facile et Normal.
- Facile prend désormais le rythme du Normal (plus de ralentissement ×1/0,85).

## Reste à voir
- Cible du Difficile à remesurer avec le bot (`ch2-bot`).
- Roi de rouille (phase II du Phare) non examiné.
- Aucune valeur Normal jugée trop courte pour le Difficile sans mesure ; à confirmer par le bot et à la main.
