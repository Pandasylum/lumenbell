# 2026-11-04 · `fix/ui-pause-gate-help` : l'aide visuelle est verrouillée en Difficile

Remplace « activable partout, Difficile compris » (décision n° 3 du 28 octobre, reprise le 1er novembre). Aucun nouveau texte : la case verrouillée réutilise celle de l'Épreuve.

## Règle
1. Difficile se comporte comme l'Épreuve : ligne « Aide visuelle » désactivée, décochée, affichée Off, sans toucher à `lb-help` (valeur rendue au retour en Facile ou Normal).
2. Même règle dans le menu du chapitre et dans la roue en jeu (`LB.settings`), dans les deux chapitres.
3. Aucun repère (`LB.cue`, barre ou cercle) en Difficile, même si `lb-help` vaut « oui » : `LB.help.on()` rend faux tant que l'aide est verrouillée.
4. Facile et Normal inchangés. La proposition « Activer l'aide visuelle » à la 3ᵉ défaite en Facile reste telle quelle.

## Mise en œuvre
- Point de règle unique : `LB.help.LOCKED(d)` (`shared/js/28-ui.js`) = difficulté `trial` ou `hard`. `LB.help.use(d)` l'applique ; `locked()` pilote la ligne de la roue (`off`).
- Chapitre II : drapeau `hard:true` sur `DIFFS.hard` et `DIFFS.th` (le Chapitre I l'a déjà).
- Tests : `help.js` (case Difficile désactivée, repère nul avec `lb-help` oui), `keys.js` (aide « disponible en Difficile » remplacée par « verrouillée, clé intacte »).
