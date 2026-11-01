# 2026-11-01 · Chapitre I, phase II : esquive en pas de côté, contres au sol (session `ch1/dodge-side`)

Décisions de Kevin du 1er novembre 2026, validées. Périmètre : Chapitre I, phase II (`chapters/ch1-ember-bridge/`). Rendu seulement : aucun timing ni réglage d'équilibrage ne change (`LB.HERO_T`, `DIFFS` intacts).

## Décisions
1. **Esquive harmonisée avec le Chapitre II** : au Chapitre I phase II, l'esquive devient le pas de côté léger du Chapitre II (pose `dodgeSide` de `LB.drawWatcher`, 0,38 s, image rémanente), à la place de la plongée `dodgeDown` avec tour complet. Le Veilleur ne descend plus de son bloc (sinon il tombe du caillou) : le pas de côté reste sur le bloc, sans toucher le vide ni la lave.
2. **Contre qui frappe la tête du Colosse** : le Veilleur reste au sol, sur son bloc. Seul son rayon (`lanternBeam`) s'oriente vers la tête.
3. **Finish (COUP ULTIME)** : même règle, le Veilleur reste au sol (plus de flottement), seul le rayon vise.

## Application
- **Pas de côté** : recul vers la gauche, loin du Colosse (sens du Chapitre II), avec l'inclinaison de la pose autour des pieds et l'image rémanente vers sa place de départ. Réglages de dessin dans la table `DG.side` (`36-p2-foundry-logic.js`) : durée 0,38 s, recul 18 px, inclinaison 0,18 rad, image rémanente 0,3 s (opacité 0,25). La pose suit l'appui ; un arrêt réussi ne la coupe pas, un coup reçu l'interrompt.
- **Bloc trop étroit pour l'amplitude du Chapitre II** : le Chapitre II recule de 48 px (corps à l'échelle 1, soit environ 38 px au corps réduit 0,8 de la phase II). Le bloc ne laisse qu'environ 19 px à gauche du Veilleur avant que la robe déborde, et 31 px à droite. Choix : le recul vers la gauche, le plus lisible (on s'écarte du coup), réduit à 18 px. **Signalé** : le pas est plus court qu'au Chapitre II ; l'inclinaison et l'image rémanente le rendent lisible.
- **Contre sur la tête** : plus de montée de 120 px ; le rayon part de la lanterne et monte vers la tête.
- **Finish** : plus d'oscillation verticale ni de montée ; le pas en avant passe de 50 à 28 px pour que la robe reste sur le bloc.
- **Estoc** (contre `stab`, ajouté le 1er novembre après validation de Kevin) : le pas en avant passe de 60 à 28 px (comme le Finish) et le petit saut de 6 px est retiré, pour que la robe reste sur le bloc jusqu'au plein élan. Dessin seulement : les dégâts, la fenêtre (`sp.stab`) et la cible du rayon ne lisent que la position du Colosse, pas celle du Veilleur ; seul le point de départ dessiné du rayon suit le Veilleur.
- Étincelles d'une esquive réussie : au niveau du Veilleur sur son bloc (plus au point bas de la plongée). Même nombre de tirages aléatoires : parties du bot identiques.
- Inchangés : `DG.drop` (hauteur du bloc, rebord `QFLOOR`, chute de la défaite), la pose `dodgeDown` du module commun (non renommée, non supprimée, désormais inutilisée), la silhouette du Colosse, les autres phases.
- Lecteur d'écran : aucun texte ne décrivait l'esquive comme un plongeon ; rien à corriger, rien d'ajouté à l'écran.

## Conséquence
- Le point « À valider » **Plongée d'esquive** de `docs/decisions/2026-11-01-ch1-foundry-floor-application.md` (lanterne et haut du corps sous la surface du rebord au point bas du tour complet) est **refermé** : la plongée n'est plus utilisée en phase II. Les propositions d'alors (rotation autour de la taille, saut arrière accroupi) sont abandonnées.

## À valider par Kevin
- Amplitude du pas de côté réduite à 18 px par la largeur du bloc (voir plus haut). Autre possibilité : élargir le bloc vers la gauche (décor seulement) pour retrouver l'amplitude du Chapitre II.

## Tests
- Build reproductible (nouveau `dist` = référence), `build_test.py`, `smoke.js` (`errs []`), syntaxe du fichier final, `input.js ch1` (`errs []`).
- `ch1-bot.js` avant/après sur la même graine : 360 parties identiques (JSON identique), vérifié de nouveau après l'estoc.
- `visual-shots.js` : 122 images identiques sur 126 ; les 4 écarts sont l'esquive de la phase II (`p2-b` en trois tailles, `p2-deny-act`). Planches de poses : 37 sur 38 identiques, écart `ch1-p2-dodge` seulement.
- Captures de la phase II image par image (esquive, contre sur la tête, estoc, rayon, Finish) : seules l'esquive, le contre sur la tête, le Finish et l'estoc diffèrent (estoc : seul le Veilleur bouge, le Colosse est inchangé) ; aucune image ne montre le Veilleur hors du bloc pendant l'esquive, le contre sur la tête ni le Finish.
