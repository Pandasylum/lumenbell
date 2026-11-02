# Site (hub + chapitres) – notes du dossier

- **Contenu** : `index.html` (hub, construit), `ch1/index.html` et `ch2/index.html` (copies exactes des `dist`), `src/` (source du hub, jamais publiée).
- **Build** : `python3 build/build.py`, `python3 build/build_ch2.py`, puis `python3 build/build_site.py` (assemble `src/parts.txt` avec `shared/` comme un chapitre, polices de `build/fonts.css`, copie les `dist`, zip `build/out/lumenbell-site.zip` sans `src/`). Reproductible : la CI (job `smoke`) vérifie `git diff site/`.
- **Réglages** : `src/js/10-hub.js`, tables `HUB_CH` (un chapitre de plus = une entrée ; `CHAPTERS` dans `build_site.py` pour copier son `dist`) et `HUB_T`. Aucune valeur en dur dans `src/page/style.css` (variables posées par le JS).
- **Interdit** : le nom de la figure (nom secret du lore) n'apparaît nulle part, ni à l'écran ni dans les libellés ; `build_site.py` et `tests/hub.js` le vérifient.
- **Sauvegarde lue** : `lb-ch1-end` (et l'ancienne `eb-end`), `lb-ch2-end`, `lb-lang`, `lb-snd`, `lb-mus` ; session : `lb-hub-lit` (tours vues allumées).
- **Tests** : `tests/hub.js`, `tests/hub-site.js`, garde de couleurs dans `tests/cine.js`, captures `node visual-shots.js --hub <dossier>`.
- Décision : `docs/decisions/2026-11-02-hub-site.md`.
