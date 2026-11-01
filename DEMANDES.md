# Demandes au moteur / au héros

Une demande par entrée : date, chapitre demandeur, besoin, statut.

## 2026-10-27 · Chapitre II · clés de sauvegarde communes `lb-…` — fermée le 28 octobre
- Fermée → `shared/NOTES.md` (`LB.store`, `LB.key`). Texte intégral : [archives/DEMANDES-fermees.md](archives/DEMANDES-fermees.md#cles-sauvegarde).

## 2026-10-27 · Chapitre II · un seul Veilleur pour toute la série — ouverte
- **Besoin** : un seul Veilleur dessiné et animé pour tous les chapitres, repris du Chapitre I, avec les poses de garde, de pas de côté, de coup reçu et de victoire.
- **Aujourd'hui** : le Chapitre II a sa propre copie du Veilleur (`drawWizard`, `heroShape`, `drawHero`, `proHero` dans `chapters/ch2-silent-bells/src/js/28-hero-draw.js` et `64-prologue.js`), recopiée du Chapitre I puis adaptée ; les poses y sont pilotées par l'angle du sceptre-lanterne (`staffA`), l'inclinaison (`lean`) et les dates d'animation (`S.guardT`, `S.dodgeT`, `S.hurtT`). La session C1 (visuels du Chapitre II) n'a pas touché à son dessin.
- **À faire côté moteur / héros** : un module commun (dessin + animation + poses nommées : garde, pas de côté, coup reçu, victoire, et les poses des cinématiques : sceptre levé, marche, chute), utilisé par les deux chapitres ; le Chapitre II remplacera alors sa copie.
- **Ajout du 28 octobre** : une intensité de la lanterne (0 à 1, cristal et halo) pour la faire faiblir en cinématique ; le Chapitre II l'a ajoutée à sa copie (`S.lampDim` dans `heroShape`).

## 2026-10-28 · Chapitre II · vocabulaire « bloquer » au lieu de « parer » — fermée le 31 octobre
- Fermée par la session `engine/hero-states` : le Chapitre I suit le vocabulaire (bouton « Bloquer » / « Block » en phases I et III, lecteur d'écran, aide, libellé de fin « Blocages », noms de code `blocks`, `dodges`, `blockSuccess`, `DMG_BLOCK`). Voir `docs/decisions/2026-10-31-engine-hero-states.md` et `docs/GLOSSAIRE.md` (À trancher n° 3, 4, 6). Reste ouvert : les mots « parade » de `BIBLE.md` et `docs/CH2-SPEC.md` (session « 00 · Direction »).
