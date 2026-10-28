# Demandes au moteur / au héros

Une demande par entrée : date, chapitre demandeur, besoin, statut.

## 2026-10-27 · Chapitre II · clés de sauvegarde communes `lb-…` — ouverte
- **Besoin** : le Chapitre I utilise encore `eb-lang`, `eb-intro`, `eb-end`, `eb-best-tn`, `eb-best-th`. Le Chapitre II est passé aux clés communes : `lb-lang`, `lb-snd`, `lb-mus`, `lb-help` (communes à la série) et `lb-ch2-…` (propres au chapitre : `lb-ch2-unl`, `lb-ch2-best-<mode>`).
- **À faire côté moteur** : migrer le Chapitre I vers `lb-lang` et `lb-ch1-intro`, `lb-ch1-end`, `lb-ch1-best-<mode>` (et `lb-snd`/`lb-mus`/`lb-help` si ces options deviennent persistantes), avec la même règle qu'au Chapitre II : lire la nouvelle clé, sinon l'ancienne, puis écrire la nouvelle ; ne pas effacer les anciennes.
- **En attendant** : le Chapitre II lit `eb-lang` en dernier recours pour la langue (après `lb-lang` et `pn-lang`) ; le Chapitre I ne voit pas un choix de langue fait dans le Chapitre II.

## 2026-10-27 · Chapitre II · un seul Veilleur pour toute la série — ouverte
- **Besoin** : un seul Veilleur dessiné et animé pour tous les chapitres, repris du Chapitre I, avec les poses de garde, de pas de côté, de coup reçu et de victoire.
- **Aujourd'hui** : le Chapitre II a sa propre copie du Veilleur (`drawWizard`, `heroShape`, `drawHero`, `proHero` dans `chapters/ch2-silent-bells/src/silent-bells.html`), recopiée du Chapitre I puis adaptée ; les poses y sont pilotées par l'angle du sceptre-lanterne (`staffA`), l'inclinaison (`lean`) et les dates d'animation (`S.guardT`, `S.dodgeT`, `S.hurtT`). La session C1 (visuels du Chapitre II) n'a pas touché à son dessin.
- **À faire côté moteur / héros** : un module commun (dessin + animation + poses nommées : garde, pas de côté, coup reçu, victoire, et les poses des cinématiques : sceptre levé, marche, chute), utilisé par les deux chapitres ; le Chapitre II remplacera alors sa copie.
- **Ajout du 28 octobre** : une intensité de la lanterne (0 à 1, cristal et halo) pour la faire faiblir en cinématique ; le Chapitre II l'a ajoutée à sa copie (`S.lampDim` dans `heroShape`).

## 2026-10-28 · Chapitre II · vocabulaire « bloquer » au lieu de « parer » — ouverte
- **Besoin** : le Veilleur n'a plus d'épée (cahier des charges du Chapitre II, « Sorts et rages », 28 octobre) : un seul geste, **bloquer** (EN *block*), et **esquiver**. Le Chapitre II est passé à ce vocabulaire (bouton « Bloquer » / « Block », lecteur d'écran, notes).
- **Écart avec le Chapitre I** (non modifié par la session du Chapitre II) : textes `_('Parry','Parer')` (bouton de la phase II, `36-p2-foundry-logic.js`), lecteur d'écran « Premier coup paré », « Parade réussie », « Combo paré »…, « Coup paré » (`16-p1-bridge-logic.js`, `44-p3-belfry-logic.js`), mots d'annonce « PARADE ! », « DOUBLE / TRIPLE PARADE ! » (`12-effects.js`, `16-…`, `44-…`), libellé « Parades » des records (`08-state.js`), noms de code `parry`, `parried`, `parrySuccess`. La bible parle aussi de « Fenêtres de parade » et de « combo paré ».
- **À faire côté moteur / Chapitre I** : décider si le Chapitre I suit le même vocabulaire, et le nom commun des fonctions et des états (blocage / esquive) pour le futur moteur commun (voir l'audit des éléments communs dans `ROADMAP.md`).
