# 2026-11-03 · `ch2/phare-refonte` : refonte du Phare Noyé (phase III)

Décision de Kevin (3 novembre 2026).

- Le Phare est reconstruit avec les seules pièces de l'Ancien de Rouille, sans rien ajouter ; l'Ancien peut être légèrement modifié si besoin.
- Les deux phares (lanternes) posés sur la plage sont retirés.
- Les cloches d'épaules montent au sommet et deviennent les phares. Quand elles fonctionnent, elles tournent autour du Phare et la lumière les suit (un phare, ça tourne).
- Correction de Kevin après essai (3 novembre 2026), remplace la rotation permanente :
  - partie 1 du combat : les cloches tournent autour du Phare pour accompagner le faisceau, seulement pendant l'attaque des faisceaux ; hors attaque, immobiles à leur poste au sommet ; à la fin de l'attaque, retour doux à leur poste ;
  - partie 2 : plus de rotation autour du Phare ; les cloches restent fixes à leur poste, seul leur côté lumineux pivote avec le faisceau, au même angle, comme la tête d'un projecteur ;
  - scène du rallumage : les cloches sont dessinées à l'angle réel d'où repart la lumière.
- Les éclairs partent de ces cloches, annoncés par un crépitement.
- Un volume au centre est bien, mais pas obligatoire.
- Rendu seulement : aucun timing, dégât, hitbox ni trajectoire d'attaque ne change. Aucun texte nouveau, aucun lore.

Réglages de rendu : table `SPIN` dans `chapters/ch2-silent-bells/src/js/40-boss-drowned-beacon.js` (rayons de l'orbite, profondeur, visée, durée du retour au poste).

Note : remplace l'idée de revenir à la tour d'avant C1 (2b75101) ; `docs/LORE.md` §9 (même tableau) à voir dans le projet Lore ; `CHANGEMENTS.md` A, C et H à réconcilier à l'audit de cohérence.
