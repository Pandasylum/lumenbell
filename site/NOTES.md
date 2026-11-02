# Site (hub + chapitres) – notes du dossier

- **Contenu** : `index.html` (hub, construit), `ch1/index.html` et `ch2/index.html` (copies exactes des `dist`), `src/` (source du hub, jamais publiée).
- **Build** : `python3 build/build.py`, `python3 build/build_ch2.py`, puis `python3 build/build_site.py` (assemble `src/parts.txt` avec `shared/` comme un chapitre, polices de `build/fonts.css`, copie les `dist`, zip `build/out/lumenbell-site.zip` sans `src/`). Reproductible : la CI (job `smoke`) vérifie `git diff site/`.
- **Réglages** : `src/js/10-hub.js`, tables `HUB_CH` (un chapitre de plus = une entrée ; `CHAPTERS` dans `build_site.py` pour copier son `dist`), `HUB_T` (mise en page : titre, version, carte ; fonds sonores `beds`), `SETTINGS_T` (panneau de la roue : un réglage de plus = une entrée) et `RESET_T` (clés effacées par « Réinitialiser la progression »). Aucune valeur en dur dans `src/page/style.css` (variables posées par le JS).
- **Fond sonore à l'écoute** : `index.html?bed=a` (défaut), `?bed=b`, `?bed=c` ; retirer les deux variantes écartées une fois le choix fait.
- **Interdit** : le nom de la figure (nom secret du lore) n'apparaît nulle part, ni à l'écran ni dans les libellés ; `build_site.py` et `tests/hub.js` le vérifient.
- **Sauvegarde** : lue `lb-ch1-end` (et l'ancienne `eb-end`), `lb-ch2-end`, `lb-lang` ; réglages `lb-mus`, `lb-snd`, `lb-pref-motion` ; `lb-hub-lit` (localStorage : tours déjà fêtées). La réinitialisation efface `RESET_T`, garde langue et réglages.
- **Tests** : `tests/hub.js`, `tests/hub-site.js`, garde de couleurs dans `tests/cine.js`, captures `node visual-shots.js --hub <dossier>`.
- Décisions : `docs/decisions/2026-11-02-hub-site.md`, `docs/decisions/2026-11-02-hub-fixes.md` (correctifs après l'essai sur téléphone).
