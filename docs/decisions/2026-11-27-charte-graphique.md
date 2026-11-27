# Charte graphique (validée le 2026-11-27)

Vaut pour tout le jeu. Références : `da/maquette-a9.html` (pont) et `da/maquette-a10.html` (cale).
Un personnage simple et seul face à un décor immense, découpé par la lumière.

## Principes
1. Une grande source de lumière par décor, derrière la place du boss (lune, brèche).
2. Seul face à l'immense : Veilleur/Veilleure simple et neutre ; le décor et le boss portent la démesure.
3. La lanterne reste la lumière la plus vive, et la seule lumière chaude propre au joueur.
4. Le décor raconte l'univers, sans détail contrasté qui gêne la lecture du combat.
5. Tout reste dessiné par le code : ni sprite ni image de décor.

## Rendu
- Aplats mats, quelques plans nets, aucun contour noir.
- Un liseré de lumière sur le bord tourné vers la source.
- Touches peintes et grain léger, jamais de brillant.
- Personnages en trois quarts ; boss vu d'en bas.
- Plus un plan est loin, plus il se fond dans la couleur de la brume.

## Décors
Cinq plans : grande source, lointain, structure, sol, air.

| Plan | Pont (A9) | Cale (A10) |
|---|---|---|
| Grande source | lune, ciel du soir | brèche sur la mer |
| Lointain | crêtes, tour | fonds marins, Phare englouti |
| Structure | arches du pont | membrures, barrots, cloches |
| Sol | dalles à arête éclairée | planches et eau de cale |
| Air | brume, braises | brume, gouttes |

- La source éclaire la zone du boss ; le côté du Veilleur reste plus sombre.
- Une paroi fermée a besoin d'un relief ou d'un second repère.
- Chaque phase a un repère qui nomme le lieu.

## Couleurs
| Rôle | Pont, ch. I | Cale, ch. II |
|---|---|---|
| Haut du fond | `#0f1530` | `#04141c` |
| Milieu | `#6d3f5e` | `#0d4750` |
| Source | `#f3b072` | `#a6e3cc` |
| Matière | `#392640` | `#22262a` |
| Accent | `#e9561b` | `#6a3a24` |

Teintes de chapitre : braise (I), marée (II), mousse (III).
Lanterne partout : `#ffe066` et `#fffbe3`.
Couleurs de jeu inchangées ; le rouge n'est jamais le seul signal.

## Veilleur, lanterne, boss
- Veilleur/Veilleure : capuche, mantelet, cape bleu nuit, tabard crème, visière lumineuse.
- Lanterne : anneau, toit de laiton, cage vitrée, flamme vacillante, clochette sur un bras en dessous.
- Boss : reconnaissable en ombre noire ; masse sombre, un foyer principal, fissures secondaires.
- Colosse : voir `2026-11-27-direction-artistique.md`.
- Autres boss : redessinés un par un, maquette validée avant tout code.
- Armes : elles menacent par la masse, les pointes et la lumière.

## Interface
Big Shoulders Display (titres), DM Sans (texte, boutons). Cadre fin, fond sombre translucide.
Mentions 14 px minimum, cibles tactiles 44 px minimum.

## Contraintes
Aucun timing, aucune valeur de jeu, aucun texte ne change.
Plans fixes dessinés une seule fois ; le mouvement réduit coupe les particules.

## Lots
1. Essai en jeu : le pont, décor seul (à l'œil + fluidité sur téléphone).
2. Veilleur et lanterne (shared/, Opus avec accord ; deux chapitres, keys, audio).
3. Colosse et ses animations d'attaque.
4. Chapitre II : décors et boss.
5. Interface, puis Chapitre III dès la fiche.

## Reste ouvert
- Brèche et Phare englouti de la cale : à voir dans le projet Lore.
- Fluidité sur téléphone : non mesurée (lot 1).

## Effets, impacts et rayons (ajout du 2026-11-27, Chapitre I)
- **Lumière du Veilleur** : toujours des aplats nets, d'or `#ffe9a0` et de crème `#fffbea` (halo `rgba(255,214,110,.55)`), jamais de dégradé ni de flou. Rayon = coin de lumière qui s'élargit vers sa cible ; coup de lumière = étoile à branches ; vague = croissant. Chapitre I, phases I à III : un seul dessin (`lanternBeam`, `24-hero-draw.js`) ; `LB.lanternBeam` (dégradé) reste réservé au Chapitre II.
- **Feu** : flammes découpées à quatre tons (`COLFX.flamme`), jamais de dégradé radial.
- **Impacts** : étoile d'impact, éclats en triangles, fumée en aplats ; plus d'anneau qui s'étend (il ressemble à une attaque à parer). Phases II et III partagent `drawFx2`.
- **Bleu** : réservé au bouclier, à l'esquive et à la barre de récupération (signaux de jeu), jamais à un impact.
- Lot concerné : « Colosse et ses animations d'attaque » (lot 3).
