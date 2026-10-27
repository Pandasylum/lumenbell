# Lumenbell – consignes pour Claude Code

Jeu canvas HTML5, série de combats de boss. Lis d'abord `BIBLE.md`, `NOTES.md` et `DECISIONS.md`, puis le `NOTES.md` du dossier où tu travailles.

## Règles non négociables
1. **Le dépôt est la seule référence.** Pars toujours de la dernière version de la branche, jamais d'une copie ancienne.
2. **Un périmètre par session.** Ne modifie que le dossier qui t'est attribué. Tout besoin touchant le moteur ou le héros s'écrit dans `DEMANDES.md`.
3. **Tout texte en deux langues** : `_('anglais','français')` ou `{d,en,fr}`. Aucun mot d'annonce à l'écran (« Parade ! », « Touché ! »…). Ce qui se déduit du combat reste déduit (lore non explicite).
4. **Texte, lore ou design : proposer avant de modifier** quand l'utilisateur dit « on discute / ne modifie pas ». L'utilisateur est perfectionniste et itère beaucoup : c'est normal.
5. **Réglages de timing dans des tables** (`T`, `R_T`, `DG`, `DIFFS`…), jamais en dur. Ne touche pas à une phase non demandée.
6. **Rien n'est publié sans test** : `python3 build/build_test.py`, `node tests/smoke.js` (lire TOUTE la sortie, `errs []` attendu), vérification de syntaxe du fichier final. Une chaîne FR avec apostrophe dans une chaîne JS entre apostrophes casse tout le jeu : utiliser des guillemets doubles.
7. **Le build doit rester reproductible** : `python3 build/build.py` doit redonner exactement `chapters/ch1-ember-bridge/dist/index.html` tant qu'on n'a pas voulu le changer.
8. **Jamais de clés** (`*.jks`, mots de passe, base64 du keystore) dans le dépôt, les logs ou les messages.
9. Le feu de l'élément s'écrit « braise » (minuscule) ; « Braise » désigne l'élément, pas un nom propre.
10. Commits en français ou anglais, courts ; une branche par sujet (`engine/…`, `ch1/…`, `ch2/…`, `menu/…`), fusion vers `main` par pull request après les tests.

## Fin de session
Tests passés, `NOTES.md` et `DECISIONS.md` à jour, fichiers déposés sur la branche, résumé des changements.
