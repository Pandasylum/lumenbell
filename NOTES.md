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
- `build/assemble.py` : assemble la source d'un chapitre depuis `chapters/<chapitre>/src/parts.txt` ; la ligne `@shared` y insère les morceaux de `shared/parts.txt`. Refuse un morceau sans saut de ligne final ou un fichier non listé.
- `python3 build/build.py` : assemble `chapters/ch1-ember-bridge/src/` (ordre : `src/parts.txt`, via `build/assemble.py`) et construit `dist/index.html` (polices inlinées, doctype) et `build/out/ember-bridge-itch.zip`. Doit rester identique à la référence v1.0.
- `python3 build/build_ch2.py` : construit `chapters/ch2-silent-bells/dist/index.html` (morceaux de `src/`, ordre `src/parts.txt`, via `build/assemble.py` ; meta de l'hébergeur et liens Google retirés, polices inlinées, rien d'autre) et `build/out/silent-bells-itch.zip`. `legacy/` reste l'import d'origine, figé. Doit redonner exactement le `dist` suivi (vérifié en CI). Écarts avec la source : `chapters/ch2-silent-bells/NOTES.md`.
- `python3 build/extract_texts.py` : régénère `docs/TEXTES-CH1.md` (colonne `fichier:ligne`).
- `python3 build/build_test.py` : `build/out/test.html` avec crochets `window.__t` (le fichier de test désactive la lecture du drapeau d'intro).
- `tests/` : `smoke.js` (3 phases × 3 difficultés), `bot.js`, `trial-play.js`, `trial-end.js` (Épreuve du feu), `fonts-offline.js`, `menu-title.js`. `launch.js` lit `PW_CHROMIUM`.
- `tests/audio.js` (CI) : `LB.audio` sur les deux chapitres (contexte unique, suspension / reprise, bruitages et musiques par `LB.audio`, réglages `lb-snd` / `lb-mus`) ; `errs []` attendu. Les copies de test exposent `LB` dans `window.__t`.
- `tests/keys.js` (CI) : clés communes aux deux chapitres sur les deux `dist` (migration depuis `eb-…`, `pn-…`, `db-…`, langue de l'appareil par défaut, aide mémorisée au Chapitre I, écriture dans les seules `lb-…`, choix vu d'un chapitre à l'autre) ; `errs []` attendu.
- `tests/visual-shots.js` : captures déterministes des deux chapitres (horloge à pas fixe, voir plus bas), 102 images : `node visual-shots.js <dossier> [ch1.html ch2.html]`, puis `node visual-shots.js --compare <avant> <après>`. Pour un changement qui ne doit pas changer l'aspect : capturer l'ancien `dist` (copié depuis `main`) et le nouveau. **Bruit connu** : quelques dizaines de pixels peuvent différer d'une exécution à l'autre sur `ch1-old-menu` et `ch2-phone-fr-menu` ; comparer aussi deux captures du même fichier avant de conclure.
- `tests/ch2-smoke.js` : Chapitre II sur `dist/index.html` (syntaxe, déblocage par l'ancienne clé `db-unl=3` migrée, Normal et Difficile, phases I à III, hors ligne, **aucun appel réseau externe** : contrôle statique + interception de toute requête) ; `errs []` attendu.
- `tests/ch2-texts.js` : couples `_(en, fr)` du Chapitre II égaux à la liste validée `chapters/ch2-silent-bells/TEXTES.md` (régénérer avec `--write` après un changement voulu), structure FR/EN, textes du cahier des charges mot pour mot. `tests/ch2-keys.js` : clés `lb-…` et migration des anciennes. `tests/ch2-trial.js` : PV par difficulté et Épreuve. `tests/ch2-input.js` : états du Veilleur comme au Chapitre I (appui refusé, date d'animation, spam, appui trop tôt, joueur parfait). `tests/ch2-title.js` : titre de fin d'intro sans chevauchement, de 360 px au bureau. `tests/ch2-announce.js` : aucun mot d'annonce ni texte hors cahier des charges dessiné à l'écran. `tests/ch2-bot.js` : bot de la phase III (taux de victoire). Ces trois derniers utilisent une copie de test à crochets fabriquée par `tests/ch2-lib.js` (`build/out/ch2-test.html`, non suivie).
- CI : artefact **`jeu-apercu`** (les deux `dist/index.html`, 14 jours) téléchargeable depuis chaque exécution du workflow Tests.
- Vérification de syntaxe du fichier final (le Chapitre II la fait dans `ch2-smoke.js`) : `node -e 'const h=require("fs").readFileSync("chapters/ch1-ember-bridge/dist/index.html","utf8");for(const m of h.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(m[1]);console.log("syntaxe OK")'`.
- Captures d'écran : utiliser une horloge simulée, sinon le rendu varie. `page.clock` de Playwright ne suffit pas (origine décalée de 1 à 2 ms d'une exécution à l'autre) : remplacer `requestAnimationFrame`, `performance.now` et `Date.now` par un pas fixe de 1/60 s piloté par le test, fixer `Math.random`, couper l'audio, `animations:'disabled'`, et ramener la souris dans un coin avant chaque capture (sinon un survol change selon la mise en page). Voir le Chapitre II `NOTES.md`.
- Mesure de fluidité : ~60 fps (P2 lac un peu plus lourd). Un « lag » vu dans l'aperçu Claude n'est pas celui du jeu.

## Pièges connus
- **Apostrophe dans une chaîne JS** : `'S'il tombe'` casse tout le jeu (SyntaxError, écran vide). Utiliser des guillemets doubles. Toujours lire la sortie complète du smoke test et vérifier la syntaxe du fichier final.
- Le texte d'ouverture de la phase I existe deux fois (HTML statique `#ovDesc` dans `src/page/body.html` et `CARD1` dans `src/js/60-ui-menu.js`) : modifier les deux.
- Noms d'attaques « Marteau de guerre » / « Combo de marteau » pas encore renommés (masse).
- Le crochet et la queue se chevauchaient en phase II ; crochet à la hanche gauche.
- Non vérifiés sur appareil : APK minifié avec CSP, pause/reprise audio native (le comportement navigateur est testé par `tests/audio.js`), latence et coupures éventuelles de la musique (contexte commun en `latencyHint:'playback'` ; `interactive` craquait sur téléphone, voir la décision) ; musique du Chapitre II à réécouter après la régression du 28 octobre.
- **À traiter par la session `engine/tests`** : `tests/keys.js`, contrôle « relit le choix de l'autre chapitre » (`ch1`/`ch2 relit le choix de …`), échoue de façon intermittente, aussi sur `main` (4 échecs sur 6 essais le 28 octobre ; course entre l'écriture de `localStorage` et la relecture dans une seconde page `file://`). Non corrigé par `engine/audio`.
- **Playwright** : `npm install` peut installer une version plus récente que le Chromium déjà présent (« Executable doesn't exist ») ; lancer les tests avec `PW_CHROMIUM=/chemin/vers/chrome` plutôt que retélécharger. `tests/package-lock.json` est suivi (Playwright figé, 1.64.1 au 27 octobre 2026) ; la CI installe avec `npm ci`. Pour changer de version : `npm install playwright@x.y.z` dans `tests/`, puis committer le lockfile.
- **Source du Chapitre I découpée** : l'ordre de `src/parts.txt` est l'ordre d'exécution (une seule IIFE) ; chaque morceau finit par un saut de ligne. Détails : `chapters/ch1-ember-bridge/NOTES.md`.
- **Fonction de texte** : `_(anglais, français)` dans les deux chapitres (le Chapitre II a été inversé le 27 octobre 2026).
- **Clés de sauvegarde** : `lb-…` dans les deux chapitres, par `LB.store` / `LB.key` (`shared/`, voir `shared/NOTES.md`) ; anciennes clés `eb-…`, `pn-…`, `db-…` lues si la nouvelle manque, jamais effacées. Ne plus appeler `localStorage` directement dans un chapitre.
- **Code commun `shared/`** : collé dans l'IIFE de chaque chapitre à la ligne `@shared` de son `parts.txt` ; un changement dans `shared/` change les deux `dist` (reconstruire et tester les deux). Le chapitre appelle `LB.setup` avant toute lecture ; `_` = `LB._`, langue courante = `LB.lang.cur`. Langue par défaut : celle de l'appareil, sinon anglais (les deux chapitres).
- **Audio commun** : `LB.audio` (`shared/js/12-audio.js`, voir `shared/NOTES.md`) ; un seul contexte, `tone`/`noise` à la signature du Chapitre II, suspension en arrière-plan. Les chapitres n'écrivent plus `AudioContext` ni `.destination`. Test : `tests/audio.js`. Étape 2 faite (`docs/decisions/2026-10-28-engine-audio.md`).
- **Éléments communs** : inventaire des écarts entre chapitres, API commune proposée et plan des sessions moteur dans `docs/COMMUN.md` (audit du 28 octobre 2026). À lire avant toute session `engine/…` ou `menu/…`.
- **Tables `T` et `DG` inversées d'un chapitre à l'autre** : au Chapitre I, `T` = blocage (phase I) et `DG` = esquive (phase II) ; au Chapitre II, `T` = parade de la phase II (le Roi) et `DG` = esquive de la phase I (la Voix). Toujours vérifier la phase avant de régler une valeur.
- **Barre de récupération du Chapitre I** : dessinée seulement avec l'aide visuelle et seulement en phase I (`32-p1-bridge-render.js`, dans `drawHints`) ; au Chapitre II elle est toujours visible. Ne pas « corriger » un chapitre sur l'autre avant la décision (voir `docs/COMMUN.md` § 5).
- Le Veilleur du Chapitre II n'est pas celui du Chapitre I (pas de heaume ni de tabard, bâton à cristal au lieu du sceptre-lanterne), malgré le commentaire « same skin as Ember Bridge ». Prévu dans la session `engine/watcher`.
- Chapitre II : `renderMenu` lit un canvas `#mc` absent du HTML et n'est jamais appelé (code mort).
- Le workflow Android cherche l'`index.html` à un chemin explicite (`chapters/ch1-ember-bridge/dist/index.html`), pas par `find`.

## Fonctionnement des sessions
Une session = un périmètre = une branche. Elle lit `BIBLE.md`, ce fichier et le `NOTES.md` de son dossier, travaille, teste, met à jour notes et décisions, dépose sur sa branche. Kevin fusionne par pull request ; le workflow reconstruit zip itch.io et APK/AAB. Si une session n'accède pas au dépôt, lui joindre un zip de son dossier.
