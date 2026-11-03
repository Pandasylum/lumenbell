# 2026-11-03 · `menu/outro-once` : l'outro ne se joue qu'une fois

Complète le § 10 de `2026-11-02-hub-fixes.md` (fin de chapitre → hub). Règle finale de Kevin ; elle remplace les précisions précédentes. Aucun nouveau texte.

## Règle
1. L'outro se joue une seule fois, à la première vraie fin hors Épreuve ; ensuite elle n'est plus lancée automatiquement nulle part (hub ou chapitre ouvert seul). Seul « ▶ Outro » du menu la rejoue.
2. Épreuve : aucune outro, aucun drapeau lu ni écrit ; les combats s'enchaînent.
3. Passer l'outro (Skip) = vue.
4. La carte de fin reste toujours. Depuis le hub : première fin = « Chapitres » seul ; fins suivantes = « Chapitres » et « Menu ». Chapitre ouvert seul : carte actuelle inchangée.
5. Drapeau `lb-chN-outro` (`LB.key('outro')`, `key:'outro'` sur les deux outros), écrit à la fin ou au passage. À ne pas confondre avec `lb-ch2-end` (vraie fin vue). Couvert par `RESET_T.prefix` (`lb-ch`, vérifié par grep).

## En-tête inerte
`LB.hdr` (`shared/js/28-ui.js`) pose `inert` sur l'en-tête (`.top` : frise, « Menu », roue) tant que `#ov`, `#pause` ou l'outro (`#cine`) est ouvert, et le retire à la fermeture. Valable pour toutes les cartes. Il observe l'attribut `hidden` (les chapitres le basculent aussi à la main). La roue reste utilisable en jeu ; elle ouvre le panneau et met en pause, donc l'en-tête devient inerte jusqu'à « Reprendre » (le focus ne revient pas à la roue à la fermeture du panneau pendant la pause).

## Mise en œuvre
- `LB.hubAgain(trial, cine)` : hors Épreuve et outro déjà vue (en Épreuve, `seen()` n'est pas lu). `LB.hubEnd(o, n, trial, again, menu)` : « Chapitres » depuis le hub ; « Menu » seulement si `again`.
- Chapitre I (`44-p3-belfry-logic.js`) et Chapitre II (`72-flow.js`) : outro sautée en Épreuve ou si déjà vue, la carte s'affiche directement.
- `tests/cine.js` attend `lb-chN-outro` (en-tête, outro des deux chapitres, épilogue du Chapitre II) ; pas de cas « Épreuve ».
