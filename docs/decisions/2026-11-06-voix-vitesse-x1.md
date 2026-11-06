# La Voix : vitesse de boss = 1 (2026-11-06, `c2/voix-x1`)

## Décision
La Voix (phase I) n'a plus d'accélérateur de boss : `VOICE_SPEED` passe de 1,1 à 1. Le facteur `f` de `spawn()` vaut `1 / (RHY.sp × vitesse de la Voix × accélérateur de rage)`, les trois termes à 1.

## Option conservée
Le mécanisme reste en place comme option par boss (comme `RHY.rage` : défaut 1, aucun boss ne l'utilise), pour une future rage Berserker. Toute valeur différente de 1 doit être listée ici (écrire `VOICE_SPEED=<valeur>`) : `tests/ch2-smoke.js` échoue sinon.

## Rappel
Toute accélération passe par les attaques elles-mêmes (vitesse des projectiles, délais entre projectiles), sort par sort, jamais par un multiplicateur du boss entier.

Inchangés : planchers entre impacts, pauses, volées, pluies, écho, PV, seuils, fenêtres du Veilleur, récupération plus rapide après un reflet esquivé.
