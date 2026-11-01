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

## e. Phare Noyé (Chapitre II, phase III) : tour d'avant C1

- Forme visuelle de la tour (formes I et II) restaurée depuis la version d'avant C1, référencée comme le commit `2b75101` (« les 2 lampes en haut »).
- **Validation à l'écran d'abord** : une comparaison en images (actuel / version d'avant C1) est produite avant toute modification.
- Conservés tels quels :
  - lueurs turquoise fixes, sans pulsation (`CHANGEMENTS.md` section C) ;
  - textes (section A) ;
  - Rémanence (section H) ;
  - titre de la forme II, « La Sans-Fond ».
- **Référence à vérifier** : le commit `2b75101` est le commit « états du Veilleur comme au Chapitre I » (27 octobre). Son message ne parle ni de lampes ni de la tour. La bonne version d'avant C1 reste à identifier avant la comparaison.
- **À signaler sans trancher** : si la version d'avant C1 contredit le tableau « Pièces de l'Ancien → pièces de la tour » de `docs/CH2-SPEC.md`, la session `ch2/phare-v1` le signale à Kevin.
- Application : session `ch2/phare-v1`. Suivi dans `CHANGEMENTS.md` section M.
