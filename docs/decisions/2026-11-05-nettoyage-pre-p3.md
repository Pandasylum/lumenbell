# Nettoyage du dépôt avant le Chapitre III (5 novembre 2026)

**Contexte.** Le dépôt était encombré (code mort, reliquats de l'écran « Commencer », supports promotionnels et doublons) avant d'ouvrir le Chapitre III.

**Décisions.**
- Archivage dans `archives/`, ignoré par la CI.
- Suppression de `store/` et de `build/promo*` ; les supports itch.io sont sauvegardés hors dépôt.
- Code mort et reliquats « Commencer » supprimés.
- Conservés car référencés : `docs/CH2-SPEC.md`, `site/`, `dist/`.
- `legacy/silent-bells.source.html` (import d'origine du Chapitre II, figé) archivé dans `archives/chapters/ch2-silent-bells/legacy/`. Seul un commentaire de `build/build_ch2.py` le citait ; aucun build ni test ne le lit.

Détail et inventaire : [docs/AUDIT-NETTOYAGE.md](docs/AUDIT-NETTOYAGE.md).
