# La Voix : équilibrage des impacts, de l'Echo et des orbes

Date : 2026-11-04 · branche `c2/voix-retouches` · périmètre : Chapitre II, boss La Voix

- Écart minimal entre impacts réels : Difficile 1,05 s, Normal 0,75 s, Facile 0,6 s.
- Volées : 2-3 orbes en Facile, 3-5 en Normal et Difficile. Pluie d'éclats : 2 en Facile, 3 sinon.
- Echo de rage : 1 orbe et 1 éclat par écho en Facile, 2 et 2 en Normal et Difficile. L'Echo ne vient que pendant les rages (rage 1, rage 2 en Difficile, rage finale), jamais dans la rotation normale.
- Echo : les clones tirent dans un ordre aléatoire, chaque tir est réel ou illusoire au hasard, au moins un réel par écho.
- Écho permanent en Difficile : une orbe 0,7 s après la fin de chaque sort (volée, plainte, pluie, écho de rage, danse des miroirs), rages et dernier assaut compris ; jamais pendant une plainte ; trop près d'un impact réel (écart VX), elle est décalée, jamais supprimée.
- Les reflets qui reviennent (back) ne sont pas espacés : c'est une punition voulue. Leur dessin vise le point d'impact réel (HX+30).
- Orbes agrandies (rayon 17 px, halo 50) ; les illusoires ont un centre creux.

## Sorts, rage finale, écho permanent et ripostes (`c2/voix-sorts`)
- Plainte : une vague de larmes traverse le Veilleur, puis une Illusion apparaît à gauche et lance une seconde plainte dans l'autre sens avant de disparaître. Deux impacts réels, écart VX respecté.
- Pluie d'éclats : un miroir de la salle (un des éclats flottants du décor, il n'y a pas d'autre miroir dessiné) explose ; ses éclats volent 1,5 s, se stabilisent, puis foncent sur le Veilleur à la cadence de la pluie (2 en Facile, 3 sinon). Le miroir disparaît du décor le temps du sort.
- Danse des miroirs (rage finale, remplace l'écho + volée + plainte) : la volée passe par 1 miroir aléatoire en Facile, 2 en Normal et Difficile ; à la fin chaque miroir explose en 1 éclat (donc 1 éclat en Facile, 2 en Normal et Difficile au total). Rejouée tant que le boss n'est pas tombé.
- Écho permanent (Difficile) : son corps (sprite des échos de rage, emplacement à part de ceux des deux reflets) reste visible et actif tout le combat, rages et dernier assaut compris.
- Ripostes par sort, même minutage et mêmes règles : volée = laser direct sur la Voix ; pluie = petit laser qui ricoche sur un miroir ; plainte = clochette du bâton et onde légère. Aucun texte.
- Rage : relance comme au Chapitre I (`2026-11-04-c2-rage-relance-c1.md`).
- Mesure (avant l'écho permanent aux rages) : `ch2-bot --voix` Difficile, 20 parties, erreur 0,03 s : 18/20, 0,65 coup en moyenne, écart minimal 1,05 s, aucun blocage.

## Retouches de la branche `c2/voix-sorts` (écho, récupération, plainte, vitesse)
- Écho permanent (Difficile) : actif tout le combat, rages et dernier assaut compris. Si le sort de la Voix était une plainte, il lance une plainte de lui-même (la même vague, depuis sa main) à la place de son orbe, 0,7 s après la fin du lancer, jamais pendant une plainte de la Voix ; l'écart VX le décale, ne le supprime pas. Pour les autres sorts, il garde l'orbe.
- Récupération après un appui sur une illusion (fooled) : réduite de moitié (`DG.foolRec`), uniquement dans ce cas, locale au Chapitre II. Le reflet qui revient (back) est recalé pour arriver juste après cette récupération réduite, `backWin` inchangé.
- Plainte : vague plus rapide (durée de course x0,85, `SP.wail.run`) ; hitbox et règles de blocage inchangées. Le dessin est aligné : à l'instant `ti`, le bord d'attaque de la vague touche le Veilleur (même point d'impact que le reflet, HX+30 ; vague de l'Illusion à l'arrière, HX-30), sans toucher à `ti`.
- Éclats de miroir dessinés environ 30 % plus gros (`SP.mirror.draw` = 1,3), hitbox inchangée.
- Sons de la plainte : la Voix pleure et se lamente (`wailCry`) ; la même plainte, plus lointaine et plus douce (retard, filtre passe-bas, volume réduit : `wailEcho`), quand l'Illusion ou l'écho la relance. Synthèse du Chapitre II uniquement.
- Contres de la Voix (laser, laser qui ricoche, clochette) : le choc existant du Chapitre I est conservé (arrêt sur image 110 ms, tremblement fort, flash, étincelles, son) ; on y ajoute un son d'impact et des étincelles chaudes propres à chaque sort (`SHOCK.hit`). Minutage et règles de riposte inchangés.
- Vitesse d'attaque de la Voix +10 % (`VOICE_SPEED` = 1,1, à côté de la table DIFFS, lue seulement par la Voix) : exception du Chapitre II par rapport au Chapitre I, pour les trois difficultés. Les écarts entre impacts réels (VX.gap) sont en secondes absolues et restent respectés.
- Mesure après ces retouches (un seul run) : `ch2-bot --voix` Difficile, 20 parties, erreur 0,03 s : 16/20, 1,25 coup en moyenne (avant : 18/20, 0,65), écart minimal 1,05 s, aucun blocage. Survie en baisse : réglage à valider (vitesse +10 %, plainte plus rapide, écho qui lance une plainte). La durée moyenne d'une rage n'est pas sortie par le bot (non mesurée).
- Pluie d'éclats : le miroir explose avec violence (léger tremblement) ; pendant le vol les fragments sont projetés en 2 ou 3 points aléatoires de la salle (changements de direction successifs, `SP.mirror.turns` / `area`), puis se stabilisent au-dessus du miroir et foncent sur le Veilleur dans un ordre d'arrivée aléatoire. Vol réduit d'environ 15 % (1,5 s -> 1,275 s, `SP.mirror.fly`). L'écart VX entre impacts réels et la hitbox ne changent pas. Même comportement pour les éclats de la danse des miroirs (rage finale).
- Ambiance sonore du lore : pleurs au début du combat et murmure à sa mort essayés puis retirés à la demande (aucun son ajouté à l'arrivée ni à la mort de la Voix).
- Arrivée des échos de rage : une impulsion de verre qui revient trois fois, chaque retour plus lointain et plus sourd (`echoArrive`, timbre en écho).
- Mesure après la pluie dispersée et la danse alignée (un run) : `ch2-bot --voix` Difficile, 20 parties, erreur 0,03 s : 17/20, 1,30 coup en moyenne, écart minimal 1,05 s, `errs []`. À comparer à 18/20 et 0,65 coup d'origine (16/20 et 1,25 coup au run précédent).
