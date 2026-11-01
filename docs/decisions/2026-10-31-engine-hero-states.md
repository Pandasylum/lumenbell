# 2026-10-31 · `engine/hero-states` : une seule machine à états du Veilleur

Session 3 du plan de `docs/COMMUN.md` § 4. Branche `engine/hero-states-2` (publiée sous ce nom : `engine/hero-states` porte une première version sur une base en retard, à supprimer par Kevin). Les trois phases du Chapitre I et les trois phases du Chapitre II passent par `LB.hero` (`shared/js/16-hero.js`).

## 1. Décision de Kevin du 31 octobre : barre de récupération et lanterne (remplace le n° 1 du 28 octobre)
Le n° 1 du 28 octobre (`docs/decisions/2026-10-28-engine-shared.md`, § 1 : « barre de récupération toujours visible », seul retour d'un appui refusé) est **remplacé** par :
- **Appui refusé** : la lanterne du Veilleur passe au rouge (`LB.DENY_COL`, `#ff6b6b`, la couleur déjà utilisée en phase I du Chapitre I) pendant `deny` (0,25 s), **toujours, sans condition**, dans les trois phases des deux chapitres. C'est le seul retour d'un appui refusé. Une ligne dans le dessin existant de chaque phase (le dessin n'est pas refait : session 4).
- **Barre de récupération** (`LB.drawRecoveryBar`, sous les pieds) : plus jamais visible d'office. Elle ne s'affiche que si la case « Aide » est cochée, dans les trois phases des deux chapitres, comme repère d'aide, **pendant la récupération seulement** (elle ne se dessine plus pendant l'action, où un appui refusé la remplissait en rouge). Elle ne devient plus rouge. L'arc gris des phases II et III du Chapitre I est remplacé par cette barre. Au Chapitre II, la barre toujours visible disparaît : changement de rendu voulu.
- La disponibilité de la case « Aide » ne change pas (session 6) : elle reste masquée en Difficile et en Épreuve au Chapitre I.

## 2. Autres décisions du tableau du 28 octobre, codées ici
- **N° 2, Épreuve** (soin **remplacé** le 31 octobre, voir § 6 : +1 PV entre les phases) : 4 PV de départ (`LB.HERO_DIFF.trial`), à l'origine codé sans soin (Chapitre I : plus de +1 PV ; Difficile : 4 PV au lieu de 3). **Ouverte pendant les tests** : le Chapitre I n'est plus verrouillé par la vraie fin (`TRIAL_OPEN`, `00-core.js` ; `false` rétablit le verrou). Les textes de l'Épreuve devenus faux sont corrigés (§ 4). Le Chapitre II faisait déjà ainsi.
- **N° 4, phase I du Chapitre I** : une attaque bloquée renvoie à `ready` (`LB.hero.stopped`), comme partout ailleurs. Avant, le coup simple laissait le Veilleur finir son blocage puis sa récupération. **À valider en jeu** (ressenti du pont) : le Veilleur peut maintenant se relever tout de suite après un coup bloqué, y compris pour enchaîner un blocage.
- Pas faits ici : n° 3 (aide, session 6), n° 5 (respiration, session 4), n° 6 (titre, session 5), n° 8 (repère d'aide, session 6).

## 3. Ce qui est commun (`shared/js/16-hero.js`)
- `LB.HERO_T` par geste : `block`, `dodge`, `hold` (action 0,333 s, récupération 0,7 s, grâce 0,06 / 0,05 / 0,06 s, parfait 0,08 s, endurance et garde brisée pour `hold`), `deny` 0,25 s, `hurt` (base par geste 0,38 / 0,38 / 0,55 s, plancher 0,14 s, marge 0,2 s). `LB.HERO_DIFF` (`easy`, `normal`, `hard`, `trial`). `LB.diff.apply(nom, difficultéDuChapitre)` fusionne ; `LB.diff.use(d)` fixe la difficulté lue par `LB.hero` (m, rm).
- `LB.hero` : `create`, `press(p, geste, date)`, `release`, `step(p, dt, {gesture, held})`, `stops(p, {win, grace, graceAdd})`, `stopped`, `hurt(p, écart, {dur, min, g})`, `perfect(p, date)`, `dur(geste)`. États `ready`, `act`, `recover`, `hurt` ; `p.s`, `p.t`, `p.rd`, `p.rk`, `p.deny`, `p.at` gardés (dessin et tests).
- **Aucun timing ne change** : les valeurs sont celles de chaque chapitre. Attention, `T` et `DG` étaient inversés d'un chapitre à l'autre : le Chapitre II avait `T` = blocage (phase II) et `DG` = esquive (phase I), le Chapitre I `T` = blocage (phase I) et `DG` = esquive (phase II). Les trois geste-tables remplacent `T.barrier`/`recovery`, `DG.act`/`rec`/`grace`/`hurt`, `R_T.guard`/`rec`/`grace`. Ne restent dans les chapitres que des réglages d'attaque : Chapitre I `T.flwin` (fenêtre du souffle), `BRW`, `T.hitSw`, `T.hitSwLast`, `T.hitFl`, `T.hitFy` (étourdissements fixes de la phase I), `DG.drop`, `DG.fall`, `DG.wide` (marge de plus en Difficile), `R_T.down`, `R_T.min`, `R_T.lasso` ; Chapitre II `DG.backTurn`, `DG.backWin` (retour d'un reflet).
- **Réglages par attaque, jamais dans le Veilleur** : fenêtre courte du souffle (phases I et III du Chapitre I : `win`), marge de plus en Difficile contre chute et rocher (`graceAdd`), pluie de bris du Chapitre II (`graceAdd`, `dur`). Le relèvement après la prise (phase I) reste une animation (`p.s = 'down'`), hors règle de blocage ; `down` sert aussi à figer le Veilleur à terre à la défaite.
- Écarts de détail, tous sous le pas d'une image : la fenêtre d'arrêt a 0,002 s de tolérance partout (le Chapitre I phase I n'en avait pas) ; la phase I du Chapitre I n'exigeait pas d'être dans les 0,333 s de l'action (elle l'était toujours).

## 4. Vocabulaire bloquer / esquiver au Chapitre I (ferme `DEMANDES.md` du 28 octobre ; glossaire : À trancher n° 3, 4, 6)
Textes modifiés, tous FR + EN, sauf les onomatopées (aucun mot d'annonce à l'écran) :
| Où | Avant (EN / FR) | Après (EN / FR) |
|---|---|---|
| Bouton, phase III | Parry / Parer | Block / Bloquer |
| Mode d'emploi du menu | « One button: block, dodge, parry. » / « …bloquer, esquiver, parer. » | « One button: block, dodge. » / « Un seul bouton : bloquer, esquiver. » |
| Stats de fin et table de l'Épreuve | Parries / Parades | Blocks / Blocages |
| Aide, 3ᵉ défaite en Facile | …the right moment to parry. / …bon moment pour parer. | …to block. / …pour bloquer. |
| Lecteur d'écran | First hit parried / Premier coup paré ; Parry successful / Parade réussie ; Combo parried / Combo paré ; Hit, Breath, Rock, Fury parried / Coup, Souffle, Rocher paré, Fureur parée ; Perfect parry / Parade parfaite ; « …raises your guard to parry » / « …lève ta garde pour parer » | First hit blocked / Premier coup bloqué ; Block successful / Blocage réussi ; Combo blocked / Combo bloqué ; … blocked / … bloqué, Fureur bloquée ; Perfect block / Blocage parfait ; « …to block » / « …pour bloquer » |
| Menu de l'Épreuve (HTML de départ seulement ; `updBest` le remplace aussitôt par le record) | Hard · 3 lives | Hard · 4 lives |
| Note de l'Épreuve | You recover 1 life between phases. / Tu récupères 1 PV entre les phases. | No life is recovered between phases. / Aucun PV n'est récupéré entre les phases. |
- Les mots « PARRY ! », « PARADE ! », « DOUBLE / TRIPLE PARADE ! », « PARRIED ! » ne servaient que de clés à la table `ONO` (ils s'affichaient déjà `CLANG`) : les appels passent directement `CLANG`, sans mot.
- Noms de code : `parries` → `blocks` (phases I et III) et `dodges` (phase II : c'était un nombre d'esquives), `parrySuccess` → `blockSuccess`, `DMG_PARRY` → `DMG_BLOCK`. Aucun `parry` ne reste dans le code. « Ta garde est brisée » (Chapitre II) reste tel quel (glossaire n° 2). Le Chapitre II garde « Parfaits » / *Perfects* (autre compteur).
- `docs/TEXTES-CH1.md` est régénéré.

## 5. Mesures (méthode et chiffres : `NOTES.md`, rapport de session)
- Bots du Chapitre I (`tests/ch1-bot.js`, pas fixe 1/60 s, graine fixée dès le chargement) lancés **avant et après** sur les mêmes graines : 540 parties (Normal et Difficile, phases I à III, trois erreurs de timing, 30 graines par case) **identiques une à une**. Le bot n'appuie qu'une fois par menace, il ne peut donc pas voir la décision n° 4 ; elle est vérifiée à part (`tests/input.js`).
- Bots du Chapitre II (`tests/ch2-bot.js` 100 parties, `tests/ch2-input.js`) : sorties identiques à celles de `main`.

## 6. Décision de Kevin du 31 octobre (soir) : l'Épreuve rend 1 PV entre les phases (remplace le n° 2 du 28 octobre, « aucun soin »)
- `LB.HERO_DIFF.trial = {hp:4, heal:1}`, dans les deux chapitres. Le reste de l'Épreuve ne change pas : 4 PV au départ, une mort ramène à la phase I, ouverte pendant les tests (`TRIAL_OPEN`).
- **Règle d'origine du Chapitre I, reprise telle quelle** (relue dans `c8cac24`) : au passage d'une phase à la suivante, PV courants + 1, **plafonnés au maximum de la run, les 4 PV de départ** (`RUN.max`, Normal comme Difficile). Le soin se fait à l'entrée de la phase suivante (`beginP2`, `beginP3` ; au Chapitre II `enterPhase`). Au Chapitre II, `heal` numérique = ce nombre de PV, plafonné à `hpMax` ; `heal: true` (hors Épreuve) reste « PV pleins ».
- Textes (FR + EN), formulation d'origine du Chapitre I : « You recover 1 life between phases. » / « Tu récupères 1 PV entre les phases. » rétablie dans la note de l'Épreuve du Chapitre I ; le Chapitre II n'avait pas de note, seulement le sous-titre « Sans soin » / « No healing » (devenu faux), remplacé par la même phrase. Le mode d'emploi « bloquer, esquiver » est inchangé. Le texte « Aucun PV n'est récupéré… » du § 4 est annulé.
- Test : `tests/ch2-trial.js` (Chapitre II) et `tests/input.js` (Chapitre I) contrôlent +1 PV et le plafond. Bots : aucun changement (l'Épreuve n'y est pas jouée).
