# 2026-11-06 · Règles de rage communes (`shared/boss-rules`)

## Décision
- `LB.BOSS_RULES` (`shared/js/18-boss-diff.js`) : `finalHp` 1, `rageDur` 1,6 s, `rageDur2` 0,8 s. Valeurs inchangées.
- `LB.rageState` : la relance de rage du Chapitre II (`rageN`, `rageHp0`, `rageNext`, `finalDone`, leur remise à zéro) est déplacée dans `shared/`. Comportement identique : une rage dont le contre a échoué repart à chaque attaque, les seuils passés ne repartent jamais, le dernier assaut repart tant que le boss n'est pas tombé.
- `LB.healFor(soin, pvDépart, pv)` : `true` = tous les PV de départ, un nombre = ce nombre, plafonné aux PV de départ. Utilisé par `72-flow.js` (Ch2) et par l'Épreuve du Ch1.

## Périmètre
`shared/`, Chapitre I (littéraux seulement : `bhp` de dernier assaut, durées de `qRage`, plafonnement du soin), Chapitre II. Supprimés : `RAGE`, `FINAL_AT`, la logique de relance du Ch2 et le plafonnement recodé de `72-flow.js`.

## Chapitre I non réécrit
`Q.rn`, `qRage`, `R.u5`, `R.u55`, `R.rk5` restent tels quels : le Chapitre I est la référence. Seuls les littéraux ont été remplacés (y compris les trois `Q.bhp===1` de `40-p2-foundry-render.js`, qui désignent le même dernier assaut).

## Reste propre à chaque chapitre
Pauses entre attaques (`waitMin/waitMax`, Ch1), planchers entre impacts (`VX.gap`, `SP.floor`, Ch2), écho de rage et écho permanent (Ch2), `RHY`, `VOICE_SPEED`.

## Garde-fou
`tests/boss-diff-static.js` : forme de `LB.BOSS_RULES`, `healFor`, `rageState`, et motifs qui échouent si un chapitre recode `.8:1.6`, `qRage(<littéral>)`, `bhp/bossHp <= 1`, ou `Math.min(… .heal)` / `heal===true`. Motif écarté car fragile : `dur:1.6` (faux positif sur `R_CNT` du Ch2).
