# Notes de travail (racine)

## Règles
1. **Une seule référence** : le dépôt. Jamais de travail sur une copie ancienne ni dans un dossier qu'on ne possède pas.
2. **Tout réglage de timing est dans une table** (`T`, `R_T`, `DG`, `DIFFS`…). Une modification de Normal ne doit pas bouger Facile ni Difficile sans que ce soit dit.
3. **Aucune modification d'une phase non demandée.**
4. **Les contres suivent la règle de la bible** (cloche, éclats, rayon au sol).
5. **Décision de design validée → `DECISIONS.md`** avec sa date.
6. **Rien n'est publié sans test** : bots Normal/Difficile, syntaxe, coup d'œil en image pour le visuel. Le ressenti (musique, timing) se juge sur téléphone.
7. **Les clés de signature ne quittent jamais l'ordinateur de Kevin ni les Secrets GitHub.**

## Outillage
- `python3 build/build.py` : construit `dist/index.html` (polices inlinées, doctype) et `build/out/ember-bridge-itch.zip`. Doit rester identique à la référence v1.0.
- `python3 build/build_test.py` : `build/out/test.html` avec crochets `window.__t` (le fichier de test désactive la lecture du drapeau d'intro).
- `tests/` : `smoke.js` (3 phases × 3 difficultés), `bot.js`, `trial-play.js`, `trial-end.js` (Épreuve du feu), `fonts-offline.js`, `menu-title.js`. `launch.js` lit `PW_CHROMIUM`.
- Captures d'écran : utiliser une horloge simulée, sinon le rendu varie.
- Mesure de fluidité : ~60 fps (P2 lac un peu plus lourd). Un « lag » vu dans l'aperçu Claude n'est pas celui du jeu.

## Pièges connus
- **Apostrophe dans une chaîne JS** : `'S'il tombe'` casse tout le jeu (SyntaxError, écran vide). Utiliser des guillemets doubles. Toujours lire la sortie complète du smoke test et vérifier la syntaxe du fichier final.
- Le texte d'ouverture de la phase I existe deux fois (HTML statique `#ovDesc` et code) : modifier les deux.
- Noms d'attaques « Marteau de guerre » / « Combo de marteau » pas encore renommés (masse).
- Le crochet et la queue se chevauchaient en phase II ; crochet à la hanche gauche.
- Non vérifiés sur appareil : APK minifié avec CSP, pause/reprise audio native.
- Le workflow Android cherche l'`index.html` à un chemin explicite (`chapters/ch1-ember-bridge/dist/index.html`), pas par `find`.

## Fonctionnement des sessions
Une session = un périmètre = une branche. Elle lit `BIBLE.md`, ce fichier et le `NOTES.md` de son dossier, travaille, teste, met à jour notes et décisions, dépose sur sa branche. Kevin fusionne par pull request ; le workflow reconstruit zip itch.io et APK/AAB. Si une session n'accède pas au dépôt, lui joindre un zip de son dossier.
