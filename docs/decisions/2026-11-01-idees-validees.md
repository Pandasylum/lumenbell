# 2026-11-01 · Idées validées par Kevin (documentation seule)

Décisions de Kevin du 1er novembre 2026. Cette session ne code rien et ne touche ni `docs/LORE.md` ni `BIBLE.md`. Chaque point s'applique dans la session indiquée, et sa section de `CHANGEMENTS.md` porte le statut.

## a. Nom « LumenBell » partout

- Remplacer « Lumenbell » par « LumenBell » dans tous les textes affichés, les documents, le titre de page, le nom d'app Android et le titre de fin d'intro.
- Inchangés : clés `lb-…`, noms de dossiers, nom du dépôt, noms de code.
- Application : session dédiée, après la session `ch1/foundry-floor`. Suivi dans `ROADMAP.md`.
- **Reste à cadrer** (pas tranché ici) :
  - écriture visuelle du titre : « LUMEN » en couleur, « BELL » en crème ;
  - nom de package Android `com.emberbridge.game` : inchangé pour l'instant.

## b. Fausse fin du Chapitre I supprimée en Facile

- La vraie fin s'affiche partout, dans toutes les difficultés.
- Raison : le mode Facile ne doit pas bloquer la suite. La vraie fin déverrouille l'Épreuve du feu et le Chapitre II.
- Les textes de la fausse fin sont retirés (« Il s'est enfui. », « Fin ? », « Refais tout le combat en Normal pour connaître la vraie fin. »).
- Application : session `ch1/foundry-floor`, `CHANGEMENTS.md` section L.

## c. Esquive au sol revue

- L'esquive au sol doit être cohérente avec la phase II au fond de la Fonderie (`docs/decisions/2026-11-01-ch1-foundry-floor.md`).
- Application : session `ch1/foundry-floor`.
- Si une pose alternative est nécessaire, elle est proposée à Kevin et non implémentée (voir `docs/decisions/2026-11-01-ch1-foundry-floor.md` § 5).

## d. Cinématiques du Chapitre II refaites dans l'esprit du Chapitre I

- Application : session `ch2/cinematics`, après `engine/cine`.

## e. Phare Noyé (Chapitre II, phase III) : sommet de la tour d'avant C1

- Le sommet de la tour (formes I et II) retrouve les deux blocs sombres encadrant la méduse, tels que dans le commit `2b75101` (27 octobre, avant C1). Ces blocs ont été supprimés par `0bad679` (PR #5).
- **Périmètre : sommet seulement.** Le reste de la tour (pièces de l'Ancien → tour, étages, balcons, amarres) reste celui de C1.
- Étape 1 (comparaison en images) déjà faite par Kevin.
- Conservés tels quels :
  - lueurs turquoise fixes, sans pulsation (`CHANGEMENTS.md` section C) ;
  - textes (section A) ;
  - Rémanence (section H) ;
  - titre de la forme II, « La Sans-Fond ».
- Application : session `ch2/phare-v1`. Suivi dans `CHANGEMENTS.md` section M.
