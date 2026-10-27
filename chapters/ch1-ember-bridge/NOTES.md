# Chapitre I – Ember Bridge (notes du dossier)

- **État** : v1.0 publié. Source actuelle : `legacy/ember-bridge.source.html` (fragment, sans doctype, IIFE unique). `dist/index.html` = référence construite par `python3 build/build.py`.
- **Prochaine étape prévue** : découper `legacy/` en fichiers (décor, boss, phases, cinématiques, textes, audio) assemblés par `build/build.py`, sans changer le jeu : le build doit rester byte-identique à `dist/index.html` à chaque étape.
- **Structure du code** : phases `G` (P1 pont), `Q` (P2 Fonderie, `drawLake`, `lakeY()`), `R` (P3 Clocher, `ringBell`, `FIN`, `finaleScore`) ; cinématiques `SC` (cartons `{d,en,fr}`) et `DRAW=[sStatue,sValley,sTowers,sSea,sDawn,sTitle]` ; panneaux `CARD1`, `LORE`, `showEnd`, `qEnd`, `rEnd` ; i18n `_(en,fr)`.
- **Textes** : `docs/TEXTES-CH1.md` (régénérable). Lore : `docs/LORE.md`.
- **Tests** : `tests/smoke.js` doit afficher `errs []`.
