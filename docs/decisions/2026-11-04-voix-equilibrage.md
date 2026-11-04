# La Voix : équilibrage des impacts, de l'Echo et des orbes

Date : 2026-11-04 · branche `c2/voix-retouches` · périmètre : Chapitre II, boss La Voix

- Écart minimal entre impacts réels : Difficile 1,05 s, Normal 0,75 s, Facile 0,6 s.
- Volées : 2-3 orbes en Facile, 3-5 en Normal et Difficile. Pluie d'éclats : 2 en Facile, 3 sinon.
- Echo de rage : 1 orbe et 1 éclat par écho en Facile, 2 et 2 en Normal et Difficile. L'Echo ne vient que pendant les rages (rage 1, rage 2 en Difficile, rage finale), jamais dans la rotation normale.
- Echo : les clones tirent dans un ordre aléatoire, chaque tir est réel ou illusoire au hasard, au moins un réel par écho.
- Écho permanent en Difficile : une orbe 0,7 s après chaque sort, absent des rages.
- Les reflets qui reviennent (back) ne sont pas espacés : c'est une punition voulue. Leur dessin vise le point d'impact réel (HX+30).
- Orbes agrandies (rayon 17 px, halo 50) ; les illusoires ont un centre creux.

## Sorts, rage finale, écho permanent et ripostes (`c2/voix-sorts`)
- Plainte : une vague de larmes traverse le Veilleur, puis une Illusion apparaît à gauche et lance une seconde plainte dans l'autre sens avant de disparaître. Deux impacts réels, écart VX respecté.
- Pluie d'éclats : un miroir de la salle (un des éclats flottants du décor, il n'y a pas d'autre miroir dessiné) explose ; ses éclats volent 1,5 s, se stabilisent, puis foncent sur le Veilleur à la cadence de la pluie (2 en Facile, 3 sinon). Le miroir disparaît du décor le temps du sort.
- Danse des miroirs (rage finale, remplace l'écho + volée + plainte) : la volée passe par 1 miroir aléatoire en Facile, 2 en Normal et Difficile ; à la fin chaque miroir explose en 1 éclat (donc 1 éclat en Facile, 2 en Normal et Difficile au total). Rejouée tant que le boss n'est pas tombé.
- Écho permanent (Difficile) : son corps est dessiné à côté de la Voix (sprite des échos de rage) ; il s'efface pendant les rages et le dernier assaut.
- Ripostes par sort, même minutage et mêmes règles : volée = laser direct sur la Voix ; pluie = petit laser qui ricoche sur un miroir ; plainte = clochette du bâton et onde légère. Aucun texte.
- Rage : relance comme au Chapitre I (`2026-11-04-c2-rage-relance-c1.md`).
- Mesure : `ch2-bot --voix` Difficile, 20 parties, erreur 0,03 s : 18/20 (avant 19/20), 0,65 coup en moyenne (avant 0,8), écart minimal mesuré 1,05 s, aucun blocage.
