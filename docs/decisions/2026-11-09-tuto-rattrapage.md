# 2026-11-09 · `fix/tuto-perdu-apres-maj` : rattrapage de l'onglet Tuto à l'ouverture du hub

Décision validée par Kevin le 9 novembre 2026.
- Au démarrage du hub (et à l'ouverture de l'onglet, avant le rendu), les gestes forcément réussis pour finir un chapitre sont notés s'ils manquent.
- Chapitre I terminé : `block` et `dodge`. Chapitre II terminé : `block`, `dodge`, `hold`, `still`.
- État « terminé » : celui que le hub lit déjà (`endSeen`). Écriture par `LB.tuto.note()` seulement ; aucune entrée retirée, aucune clé touchée.
- Exception limitée à « rien ne se déduit à l'avance » (décision du 8 novembre) : uniquement ces gestes.
- « Réinitialiser la progression » inchangée. Table `TUTO_CATCH` dans `site/src/js/10-hub.js`. Aucun texte modifié.
