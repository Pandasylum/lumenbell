# Demandes au moteur / au héros

Une demande par entrée : date, chapitre demandeur, besoin, statut.

## 2026-11-02 · hub (`site/`) · reprendre `LB.SETTINGS_T` et `LB.settings` — à faire
- Demande de `menu/chapter-settings` : `SETTINGS_T` du hub (`site/src/js/10-hub.js`) répète les lignes Musique et Bruitages de `LB.SETTINGS_T` (`shared/js/28-ui.js`), et le panneau du hub (CSS `hset…`) répète celui de `LB.settings`. Faire lire au hub les lignes communes (puis ajouter « Réinitialiser » seul), pour qu'il n'y ait qu'une copie. Périmètre `site/` non touché par cette session.

## 2026-11-27 · Chapitre I phase II (direction artistique) · riposte au cri et éclat sur la queue — à faire
- Le cri (`roar`) n'a aucune riposte dans `36-p2-foundry-logic.js` (`qAtkEnd` appelle `qIdle`) : la riposte visuelle « rayon dans la gueule » ne peut pas se jouer. Après une attaque finie par la queue, `qDamage` pose l'éclat sur la poitrine alors que le rayon vise le bout de la queue. Besoin moteur, hors périmètre visuel.
