# Demandes fermées

Entrées de `DEMANDES.md` déplacées telles quelles une fois fermées.

<a id="cles-sauvegarde"></a>
## 2026-10-27 · Chapitre II · clés de sauvegarde communes `lb-…` — **fermée le 28 octobre** (session `engine/shared`)
- **Besoin** : le Chapitre I utilise encore `eb-lang`, `eb-intro`, `eb-end`, `eb-best-tn`, `eb-best-th`. Le Chapitre II est passé aux clés communes : `lb-lang`, `lb-snd`, `lb-mus`, `lb-help` (communes à la série) et `lb-ch2-…` (propres au chapitre : `lb-ch2-unl`, `lb-ch2-best-<mode>`).
- **À faire côté moteur** : migrer le Chapitre I vers `lb-lang` et `lb-ch1-intro`, `lb-ch1-end`, `lb-ch1-best-<mode>` (et `lb-snd`/`lb-mus`/`lb-help` si ces options deviennent persistantes), avec la même règle qu'au Chapitre II : lire la nouvelle clé, sinon l'ancienne, puis écrire la nouvelle ; ne pas effacer les anciennes.
- **En attendant** : le Chapitre II lit `eb-lang` en dernier recours pour la langue (après `lb-lang` et `pn-lang`) ; le Chapitre I ne voit pas un choix de langue fait dans le Chapitre II.
- **Fait** : sauvegarde et langue communes dans `shared/` (`LB.store`, `LB.key`, `LB.lang`, voir `shared/NOTES.md`). Le Chapitre I lit et écrit `lb-lang`, `lb-snd`, `lb-mus`, `lb-help`, `lb-ch1-intro`, `lb-ch1-end`, `lb-ch1-best-<mode>`, avec lecture des anciennes `eb-…` (et `pn-lang`, `db-opt…`, communes aux deux chapitres) ; anciennes clés jamais effacées. Son, Musique et Aide sont mémorisés dans les deux chapitres. Test : `tests/keys.js`.

## 2026-10-27 · Chapitre II · clés de sauvegarde communes `lb-…` — fermée le 28 octobre
- Fermée → `shared/NOTES.md` (`LB.store`, `LB.key`). Texte intégral : [archives/DEMANDES-fermees.md](archives/DEMANDES-fermees.md#cles-sauvegarde).

## 2026-10-27 · Chapitre II · un seul Veilleur pour toute la série — fermée le 1er novembre
- Fermée par la session `engine/watcher` : `LB.drawWatcher` et la table de poses `LB.WATCHER_POSES` (`shared/js/20-watcher.js`), le Veilleur du Chapitre I, utilisé par les trois phases, l'intro et l'outro du Chapitre I et par les trois phases, le prologue, l'épilogue et le menu du Chapitre II ; intensité de la lanterne (`opt.lamp`, ex-`S.lampDim`). Voir `docs/decisions/2026-11-01-engine-watcher.md` et `shared/NOTES.md`.
- Besoin d'origine (27 octobre) : un seul Veilleur dessiné et animé, repris du Chapitre I, avec les poses de garde, de pas de côté, de coup reçu, de victoire et de cinématique (sceptre levé, marche, chute) ; le Chapitre II remplace sa copie (`drawWizard`, `heroShape`, `drawHero`, `proHero`).

## 2026-10-28 · Chapitre II · vocabulaire « bloquer » au lieu de « parer » — fermée le 31 octobre
- Fermée par la session `engine/hero-states` : le Chapitre I suit le vocabulaire (bouton « Bloquer » / « Block » en phases I et III, lecteur d'écran, aide, libellé de fin « Blocages », noms de code `blocks`, `dodges`, `blockSuccess`, `DMG_BLOCK`). Voir `docs/decisions/2026-10-31-engine-hero-states.md` et `docs/GLOSSAIRE.md` (À trancher n° 3, 4, 6). Reste ouvert : les mots « parade » de `BIBLE.md` et `docs/CH2-SPEC.md` (session « 00 · Direction »).

## 2026-11-01 · moteur (`engine/cine`) · bouton « ▶ Intro » du Chapitre II — fermée le 1er novembre
- Fermée par la même session (`engine/cine`, correction après le test de Kevin) : `#introBtn` dans le menu du Chapitre II, `replayPrologue()`. **Repris par le menu commun le 1er novembre** (session `menu/common`, `LB.menu` : « ▶ Intro » dans les deux chapitres, « ▶ Outro » après la vraie fin dans les deux chapitres, `docs/decisions/2026-11-01-menu-common.md`).

