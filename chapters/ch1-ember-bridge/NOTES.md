# Chapitre I – Ember Bridge (notes du dossier)

- **État** : v1.0 publié. Source découpée dans `src/` (27 octobre 2026, branche `ch1/split`) ; `legacy/` n'existe plus. `dist/index.html` = référence construite par `python3 build/build.py`, inchangée par le découpage.
- **Assemblage** : `build/assemble.py` colle les morceaux listés dans `src/parts.txt`, **dans cet ordre, octet pour octet, sans rien ajouter**. Le résultat est l'ancien fragment (sans doctype, une IIFE unique) ; `build.py` et `build_test.py` le transforment comme avant. Pas de modules JS : tous les fichiers JS partagent la portée de l'IIFE ouverte dans `00-core.js` et fermée dans `84-loop.js`.
- **Structure du code** : phases `G` (P1 pont), `Q` (P2 Fonderie, `drawLake`, `lakeY()`), `R` (P3 Clocher, `ringBell`, `FIN`, `finaleScore`) ; cinématiques `SC` (cartons `{d,en,fr}`) et `DRAW=[sStatue,sValley,sTowers,sSea,sDawn,sTitle]` ; panneaux `CARD1`, `LORE`, `showEnd`, `qEnd`, `rEnd` ; i18n `_(en,fr)`.
- **Textes** : `docs/TEXTES-CH1.md` (régénérable, colonne `fichier:ligne`). Lore : `docs/LORE.md`.
- **Tests** : `tests/smoke.js` doit afficher `errs []`.

## Carte de `src/`
| Fichier | Contenu |
|---|---|
| `page/head.html` | `<title>`, metas, liens Google Fonts (retirés par `build.py`), `<style>` ouvrant |
| `page/style.css` | Tout le CSS (entre `<style>` et `</style>`) |
| `page/body.html` | `</style>`, balisage HTML (menu, overlay `#ovDesc`, pause, cinématique), `<script>` ouvrant |
| `js/00-core.js` | Ouverture de l'IIFE, langue et `_()`, constantes, `DIFFS`, `RUN`, `T`, canvas, `el`, `LORE`, utilitaires, repères géométriques |
| `js/04-audio-sfx.js` | Contexte audio, `tone`, `noise`, bruitages, cris (`painCry`, `roar`) |
| `js/08-state.js` | `newGame`, `start`, `press`, intro de phase, `deathCard`, `showEnd` |
| `js/12-effects.js` | Étincelles, onomatopées (`ONO`, `ONOSZ`), cris du Colosse (`CRIES`, `MEGA`), `float` |
| `js/16-p1-bridge-logic.js` | Phase I : logique du combat, rages, `bossStep`, `hud`, `step` |
| `js/20-p1-bridge-decor.js` | Phase I : calques statiques du pont (`buildStatic`) |
| `js/24-hero-draw.js` | Veilleur : `drawWizard`, lanterne, sceptre, `lanternBeam` |
| `js/28-boss-body.js` | Colosse : chaîne, enclumes, masse rangée, **`demonBody`** (silhouette validée, partagée) |
| `js/32-p1-bridge-render.js` | Phase I : poses, attaques, effets, aides, `render` |
| `js/36-p2-foundry-logic.js` | Phase II : `Q`, `DG`, attaques, `lakeY`, `qEnd`, `qStep` |
| `js/40-p2-foundry-render.js` | Phase II : décor du puits, ailes, Colosse, Veilleur, lac (`drawLake`), `renderQ` |
| `js/44-p3-belfry-logic.js` | Phase III : `R`, `R_T`, `RATK`, `ULT`, `FIN`, fuite (Facile), `rEnd`, `rStep`, `rFinale` |
| `js/48-p3-belfry-poses.js` | Phase III : finale (`heroFin`, `finBoss`, ailes tombées), poses du Veilleur et du Colosse, masse |
| `js/52-p3-belfry-decor.js` | Phase III : tours, cloche (`ringBell`), fanal, beffroi, fond et sol |
| `js/56-p3-belfry-render.js` | Phase III : aura, fissures, Colosse, contres (cloche, éclats, rayon), fin vers la mer, `renderR` |
| `js/60-ui-menu.js` | `CARD1`, `goPhase`, entrées, pause, réessayer, plein écran, menu, difficultés (`applyDiff`) |
| `js/64-audio-music.js` | Musique synthétisée : combat, menu, finale, outro, `MUS`, `musTick` |
| `js/68-texts-ui.js` | Textes d'interface (`UIT`, `UIA`), `applyLang`, boutons de langue |
| `js/72-boot.js` | Démarrage (`buildStatic`, `newGame`, `showMenu`) |
| `js/76-cine-intro.js` | Cinématique d'intro (`CINE`, cartons `SC`, `DRAW`) |
| `js/80-cine-outro.js` | Outro de la vraie fin (`OUTRO`) |
| `js/84-loop.js` | Chapitre II verrouillé, record de l'Épreuve, écran de démarrage, boucle `frame`, **fermeture de l'IIFE** |
| `page/end.html` | `</script>` |

Les textes `_()` restent là où ils sont utilisés (le découpage n'a rien déplacé) : chercher dans `docs/TEXTES-CH1.md` pour trouver le fichier.

## Pièges du découpage
- **L'ordre de `parts.txt` est l'ordre d'exécution.** Une seule IIFE : déplacer un morceau peut casser une `const` utilisée avant sa déclaration (TDZ) même si le build « passe ». Ne pas réordonner sans raison.
- **Chaque morceau finit par un saut de ligne**, et tout fichier de `src/` doit être listé dans `parts.txt` : `assemble.py` refuse sinon (erreur claire plutôt que JS collé ou fichier ignoré).
- **Ancrages des scripts de build** : `build.py` cherche `<style>`/`</style>` et les 3 liens Google Fonts (`page/`) ; `build_test.py` cherche `requestAnimationFrame(frame);\n})();` (fin de `84-loop.js`), `seen=false; /*` et la lecture `eb-intro`. Ne pas modifier ces lignes sans adapter les scripts.
- Le texte d'ouverture de la phase I existe deux fois : `#ovDesc` dans `page/body.html` et `CARD1` dans `js/60-ui-menu.js`.
- `js/72-boot.js` finit par un commentaire « écran de démarrage » qui décrit en fait le code de `84-loop.js` : laissé tel quel pour rester octet pour octet identique.
- Les coupes sont faites sur les commentaires de section (`/* ---------- … */`) ; la ligne vide qui précède reste à la fin du morceau précédent.
