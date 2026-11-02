# 2026-11-02 · `hub/cleanup` : fond sonore du hub (variante c) et `CHAPTER.next` retirés

- **Variante c « nébuleuse » retenue** (décision de Kevin du 2 novembre) : c'est le fond sonore du hub par défaut, sans paramètre d'URL ; table `HUB_T.bed` (`site/src/js/10-hub.js`). Timings, volumes et cloches inchangés.
- **Variantes a et b retirées**, ainsi que la lecture de `?bed=` ; les tests `tests/hub.js` (3c) et `tests/hub-site.js` suivent.
- **`CHAPTER.next` retiré** des deux chapitres (`chapters/ch1-ember-bridge/src/js/00-core.js`, `chapters/ch2-silent-bells/src/js/02-core.js`) : plus aucun lecteur dans le code (grep).
