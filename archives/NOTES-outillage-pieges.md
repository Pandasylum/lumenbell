# Archive de NOTES.md (outillage et pièges)

Texte déplacé ou remplacé le 31 octobre 2026, sans réécriture.

<a id="outillage-ch2"></a>
## Outillage : descriptif des tests du Chapitre II (remplacé par une ligne dans `NOTES.md:Outillage`)
- `tests/ch2-smoke.js` : Chapitre II sur `dist/index.html` (syntaxe, déblocage par l'ancienne clé `db-unl=3` migrée, Normal et Difficile, phases I à III, hors ligne, **aucun appel réseau externe** : contrôle statique + interception de toute requête) ; `errs []` attendu.
- `tests/ch2-texts.js` : couples `_(en, fr)` du Chapitre II égaux à la liste validée `chapters/ch2-silent-bells/TEXTES.md` (régénérer avec `--write` après un changement voulu), structure FR/EN, textes du cahier des charges mot pour mot. `tests/ch2-keys.js` : clés `lb-…` et migration des anciennes. `tests/ch2-trial.js` : PV par difficulté et Épreuve. `tests/ch2-input.js` : états du Veilleur comme au Chapitre I (appui refusé, date d'animation, spam, appui trop tôt, joueur parfait). `tests/ch2-title.js` : titre de fin d'intro sans chevauchement, de 360 px au bureau. `tests/ch2-announce.js` : aucun mot d'annonce ni texte hors cahier des charges dessiné à l'écran. `tests/ch2-bot.js` : bot de la phase III (taux de victoire). Ces trois derniers utilisent une copie de test à crochets fabriquée par `tests/ch2-lib.js` (`build/out/ch2-test.html`, non suivie).

<a id="barre-recuperation"></a>
## Pièges : barre de récupération (puce déjà retirée de `NOTES.md` avant cette session)
Tranchée le 28 octobre 2026 (toujours visible) : `docs/decisions/2026-10-28-engine-shared.md`, §1 n° 1. Le texte de la puce n'est plus dans le dépôt courant ; il reste dans l'historique git.

<a id="veilleur-ch2"></a>
## Pièges : Veilleur du Chapitre II (puce retirée de `NOTES.md` le 31 octobre 2026, couverte par `DEMANDES.md`)
- Le Veilleur du Chapitre II n'est pas celui du Chapitre I (pas de heaume ni de tabard, bâton à cristal au lieu du sceptre-lanterne), malgré le commentaire « same skin as Ember Bridge ». Prévu dans la session `engine/watcher`.
