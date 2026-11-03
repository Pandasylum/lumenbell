# 2026-11-03 · `menu/outro-once` : l'outro n'enchaîne qu'une fois depuis le hub

Complète le § 10 de `2026-11-02-hub-fixes.md` (fin de chapitre → hub). Aucun nouveau texte.

## Comportement (chapitre ouvert depuis le hub, vraie fin, hors Épreuve)
- Nouveau drapeau « outro vue » `lb-chN-outro` (`LB.key('outro')`), écrit par `LB.cine` à la fin ou au passage de l'outro (`key:'outro'` sur les deux outros). À ne pas confondre avec `lb-ch2-end` (vraie fin vue).
- Outro jamais vue : la vraie fin enchaîne l'outro ; la dernière carte n'a que « Chapitres » (retour au hub), sans « Menu ».
- Outro déjà vue : la vraie fin ne la relance plus ; la carte porte « Chapitres » et « Menu ». L'outro reste rejouable par « ▶ Outro » au menu.
- Chapitre ouvert seul, ou Épreuve : comportement inchangé (outro à chaque vraie fin, cartes d'avant).

## Mise en œuvre
- `LB.hubEnd(o, n, trial, again, menu)` (`shared/js/28-ui.js`) : `again` = outro déjà vue avant cette fin ; sans `again`, `onMenu` est retiré, avec `again`, `menu` est rendu.
- L'état « déjà vue » est lu avant de jouer l'outro (le drapeau s'écrit à la fin) : `R.outroAgain` (Chapitre I, `44-p3-belfry-logic.js`), `S.epAgain` (Chapitre II, `72-flow.js`).
- Réinitialisation : `RESET_T.prefix` du hub contient `lb-ch`, qui prend `lb-ch1-outro` et `lb-ch2-outro` (aucun changement).

## À valider
- Un joueur qui passe l'outro (Skip) l'a « vue » : le drapeau s'écrit aussi au passage, comme pour l'intro.
- Une outro vue en Épreuve ou hors hub compte aussi comme vue.
