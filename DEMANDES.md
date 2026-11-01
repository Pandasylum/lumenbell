# Demandes au moteur / au héros

Une demande par entrée : date, chapitre demandeur, besoin, statut.

## 2026-10-27 · Chapitre II · clés de sauvegarde communes `lb-…` — fermée le 28 octobre
- Fermée → `shared/NOTES.md` (`LB.store`, `LB.key`). Texte intégral : [archives/DEMANDES-fermees.md](archives/DEMANDES-fermees.md#cles-sauvegarde).

## 2026-10-27 · Chapitre II · un seul Veilleur pour toute la série — fermée le 1er novembre
- Fermée par la session `engine/watcher` : `LB.drawWatcher` et la table de poses `LB.WATCHER_POSES` (`shared/js/20-watcher.js`), le Veilleur du Chapitre I, utilisé par les trois phases, l'intro et l'outro du Chapitre I et par les trois phases, le prologue, l'épilogue et le menu du Chapitre II ; intensité de la lanterne (`opt.lamp`, ex-`S.lampDim`). Voir `docs/decisions/2026-11-01-engine-watcher.md` et `shared/NOTES.md`.
- Besoin d'origine (27 octobre) : un seul Veilleur dessiné et animé, repris du Chapitre I, avec les poses de garde, de pas de côté, de coup reçu, de victoire et de cinématique (sceptre levé, marche, chute) ; le Chapitre II remplace sa copie (`drawWizard`, `heroShape`, `drawHero`, `proHero`).

## 2026-10-28 · Chapitre II · vocabulaire « bloquer » au lieu de « parer » — fermée le 31 octobre
- Fermée par la session `engine/hero-states` : le Chapitre I suit le vocabulaire (bouton « Bloquer » / « Block » en phases I et III, lecteur d'écran, aide, libellé de fin « Blocages », noms de code `blocks`, `dodges`, `blockSuccess`, `DMG_BLOCK`). Voir `docs/decisions/2026-10-31-engine-hero-states.md` et `docs/GLOSSAIRE.md` (À trancher n° 3, 4, 6). Reste ouvert : les mots « parade » de `BIBLE.md` et `docs/CH2-SPEC.md` (session « 00 · Direction »).
