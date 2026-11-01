# 2026-11-01 · Chapitre I : phase II au fond de la Fonderie (plus de chute)

Décision de Kevin du 1er novembre 2026. Textes validés avec le projet Lore. Application dans la session `ch1/foundry-floor` ; rien n'est codé dans cette session (documentation seule).

## 1. Déroulé de la phase II
- Le combat se joue **au fond de la Fonderie** : le Veilleur suit le Colosse par la brèche et combat sur une plateforme au bord de la lave.
- Le Colosse vole au-dessus de la lave.
- Plus de chute, plus de scène de passerelle.
- **Fin de phase II** : le grand four engloutit le Colosse, qui s'envole par la cheminée.
- Aucun impact sur le lore (`docs/LORE.md` § 15, entrée du 1er novembre 2026).

## 2. Lanterne et décor visibles pendant le combat
- Chaînes, supports, anneau et lanterne orange (`CHANGEMENTS.md` section G) sont visibles **pendant tout le combat de la phase II**, et plus seulement en fin de phase.
- Toutes les mécaniques restent, esquive comprise.
- **À valider** : si la plongée d'esquive est illisible sur la plateforme, proposer une pose alternative. Ne pas l'implémenter sans validation de Kevin.

## 3. Textes (lecteur d'écran uniquement, jamais affichés)

| Où | EN | FR |
|---|---|---|
| Carte de défaite, titre | "Struck down at the bottom of the Foundry." | « Terrassé au fond de la Fonderie. » |
| Carte de défaite, corps | "The Watcher collapses at the bottom of the Foundry, and his light goes out with him." | « Le Veilleur s'effondre au fond de la Fonderie, et sa lumière s'éteint avec lui. » |
| `36-p2-foundry-logic.js:32` | "Arena: the Watcher and the winged Ember Colossus face each other at the bottom of the Foundry" | « Arène du combat : le Veilleur et le Colosse de braise ailé s'affrontent au fond de la Fonderie » |
| `36-p2-foundry-logic.js:38` | "Phase II. The Foundry. The button now dodges." | « Phase II. La Fonderie. Le bouton sert maintenant à esquiver. » |
| `36-p2-foundry-logic.js:133` | "Struck down at the bottom of the Foundry. Defeat." | « Terrassé au fond de la Fonderie. Défaite. » |
| `36-p2-foundry-logic.js:238` (passerelle) | — | — (**supprimée**) |

Ne pas toucher : carte d'entrée (`00-core.js:57`), `36-p2:300` (transition), `36-p2:211`, `16-p1:319`.

## 4. Conséquences dans les autres documents
- `CHANGEMENTS.md`, section G : lanterne visible pendant tout le combat de la phase II ; la ligne « image de fin de phase II à peine plus longue (~1 s) » est retirée.
- `CHANGEMENTS.md`, section K : Chapitre I, phase II au fond de la Fonderie (À faire).
- `BIBLE.md`, tableau « Les trois phases », fin de phase II : « Le grand four engloutit le Colosse ; ravivé, il s'envole par la cheminée ».
- `docs/LORE.md` § 9 (ligne Chapitre I) et § 15 : lanterne visible pendant tout le combat de la phase II.

## 5. Points à valider
- Pose alternative si la plongée d'esquive est illisible sur la plateforme (non implémentée).
