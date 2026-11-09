# 2026-11-08 · `chore/build-site-seul` : seul `site/` est généré et commité

- **Contexte** : chaque chapitre existait en double, `chapters/<chapitre>/dist/index.html` et `site/ch1|ch2/index.html`, avec deux scripts à relancer et deux contrôles de reproductibilité en CI.
- **Décision** : seul `site/` est généré et commité ; `build_chapter.py` produit un build intermédiaire dans `build/out/chapters/<chapitre>/` (ignoré par git), que `build_site.py` appelle puis recopie. Les `dist/` de chapitres sont supprimés.
- **Conséquences** : tests, CI (`tests.yml`, artefact `jeu-apercu`) et docs pointent vers `site/` ; Android utilisait déjà `site/` ; régénérer ne demande que `python3 build/build_site.py`.
- Le jeu produit est octet pour octet identique à l'ancien (`site/` inchangé).
