# 2026-11-27 · Coup de chaîne : la boule frappe directement (phases I et III)

Demande : la boule à pointes ne l'agrippe plus, elle frappe le Veilleur directement ; même geste en phase III ; pose cohérente ; le Colosse encaisse de façon vivante.

## Phase I (`16-p1-bridge-logic.js`, `32-p1-bridge-render.js`)
- Un coup de boule non bloqué appelle `ballHit` : dégâts (`DMG_GRAB`, inchangés), secousse, arrêt sur image et chute du Veilleur au moment de l'impact, comme l'ancien écrasement, mais sans soulèvement. Les états `lift`, `hold`, `slam` et `slamHit` n'existent plus ; l'état `grabbed` du Veilleur n'est plus utilisé. Bloqué : inchangé (rebond sur la tête).
- Pose : armement (boule balancée en arrière), frappe (inchangée), puis `release` : la boule finit sa course sur le Veilleur chaîne tendue, rebondit et revient au poing ; le buste se couche sur le coup (pose frappe), se redresse en tirant la chaîne (pose arrachement), puis revient au repos (même durée de 0,6 s).
- Retiré : « ACCROCHÉ ! » / « BOUM ! » à l'écran (règle : aucun mot d'annonce) et la phrase « Accroché par le crochet. » (le coup n'accroche plus). **Texte à proposer** si une phrase est voulue.

## Phase III (`48-p3-belfry-poses.js`, `56-p3-belfry-render.js`)
- Le crochet (`whip`) garde ses coups, ses instants et son étourdissement (`R_T.lasso`) : la boule se balance au-dessus de la main, part en ligne droite chaîne tendue et frappe le Veilleur à l'instant du coup, puis rebondit et revient. Le Veilleur est repoussé (recul et inclinaison), plus tiré en avant comme au lasso (`p.lasso` garde son nom : c'est l'étourdissement long du crochet).

## Le Colosse encaisse (phase I, `colReact`)
- Après l'impact, buste, tête et recul oscillent trois fois en s'amortissant ; amplitude propre à chaque coup (`wob` dans `COL_H` : tête 0,05, orbe 0,09, jambe 0,07, dernier coup 0,12). Les effets propres à chaque coup (éclats, étoile, fissures, éclair) restent ceux de `COL_H`.

## À valider
- Phrase éventuelle à l'écran ou en narration pour le coup de boule (rien n'est affiché pour l'instant).
- Le Veilleur « tombe » après un coup de boule non bloqué (même chute qu'après l'ancien écrasement) ; une simple projection serait une décision de gameplay.
- Pas de revue visuelle locale (CI seule).

## Enragement de la phase I
- Le cri d'enragement ne lance plus d'anneau de braise qui s'étend au sol (`COLFX.ondes`) : il ressemblait à une attaque à parer. À la place, une gerbe de flammes jaillit autour du Colosse (au sol, le long des flancs et au-dessus des épaules), monte en 0,22 s, tient, puis retombe en 0,45 s. `COLFX.ondes` n'est plus appelée (phase I) ; elle reste dans `COLFX`. Mouvement réduit : flammes figées, sans braises.

## Contre de la 1re rage, phase I (`drawRing`)
- Les anneaux de lumière à plat sous les pieds (ellipses au ras du pont) sont remplacés : la bague frappe le sol, une lame de lumière en croissant, debout et ouverte vers le Colosse, court sur le pont en grandissant (0,55 s, comme l'onde d'avant), laisse des filets de lumière qui jaillissent du sol, puis éclate sur lui (étoile et éclats de pierre). Instants et effets de jeu inchangés ; le Veilleur ne dessine plus son onde (déjà désactivée côté `fx`), `shared/` n'est pas touché.

