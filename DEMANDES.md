# Demandes au moteur / au héros

Une demande par entrée : date, chapitre demandeur, besoin, statut.

## 2026-10-27 · Chapitre II · clés de sauvegarde communes `lb-…` — ouverte
- **Besoin** : le Chapitre I utilise encore `eb-lang`, `eb-intro`, `eb-end`, `eb-best-tn`, `eb-best-th`. Le Chapitre II est passé aux clés communes : `lb-lang`, `lb-snd`, `lb-mus`, `lb-help` (communes à la série) et `lb-ch2-…` (propres au chapitre : `lb-ch2-unl`, `lb-ch2-best-<mode>`).
- **À faire côté moteur** : migrer le Chapitre I vers `lb-lang` et `lb-ch1-intro`, `lb-ch1-end`, `lb-ch1-best-<mode>` (et `lb-snd`/`lb-mus`/`lb-help` si ces options deviennent persistantes), avec la même règle qu'au Chapitre II : lire la nouvelle clé, sinon l'ancienne, puis écrire la nouvelle ; ne pas effacer les anciennes.
- **En attendant** : le Chapitre II lit `eb-lang` en dernier recours pour la langue (après `lb-lang` et `pn-lang`) ; le Chapitre I ne voit pas un choix de langue fait dans le Chapitre II.
