# 2026-11-02 · engine/tests (CI et keys.js)
- `tests.yml` : `input.js` ajouté ; `cine.js` et `menu-layout.js` y étaient déjà. `ch1-bot.js` reste hors CI (trop long). Filtre de chemins inchangé.
- `keys.js` : la course venait du script d'initialisation du test, qui vidait le stockage vu par la 2e page `file://` avant la propagation de l'écriture.
- Correction (test seul) : pas de script d'init pour ce cas, puis attente que `lb-*` soit visible dans la 2e page, puis rechargement.
- Vérification : 3 exécutions locales de `keys.js`, `errs []` à chaque fois. Le reste est validé par la CI de la PR.
- Aucun code de jeu, aucun `dist` modifié.
