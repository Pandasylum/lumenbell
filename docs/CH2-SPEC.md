# Chapitre II · Silent Bells : cahier des charges de l'harmonisation

Décisions de Kevin, 27 octobre 2026. Elles priment sur le contenu actuel de `chapters/ch2-silent-bells/legacy/silent-bells.source.html` (version du 25 octobre, page complète autonome). Lore de référence : `docs/LORE.md` + ce fichier. En cas de doute : **ne pas deviner, proposer.**

## Règles qui s'appliquent (identiques au Chapitre I)
- Tout texte existe en FR et EN. **Aucun mot d'annonce à l'écran** (« Parfait ! », « Paré », « Esquivé », « Touché », « Contré », « Un reflet ! », « Trop tard », « FRAPPE ! », « TIENS ! », « Coup de grâce »…). Seules les onomatopées et les titres de phase s'affichent. Les phrases descriptives servent au lecteur d'écran.
- Ce qui se déduit du combat reste déduit : pas de texte qui explique l'image.
- Nom de la série : **Lumenbell**. « Ember Bridge · Chapitre II » disparaît ; le menu dit « Chapitre II · Silent Bells ».
- Le Veilleur ne parle pas ; sa lanterne s'appelle « sceptre-lanterne » / « lanterne », jamais « bâton ».
- Féminin de Veilleur : **Veilleure**.

Lore : voir `docs/LORE.md`, qui prime sur ce document.

## Pièces de l'Ancien → pièces de la tour (phase III)
L'Ancien peut être redessiné pour être plus esthétique, mais chaque pièce doit servir à la tour.

| Pièce de l'Ancien (phase II) | Rôle dans la tour (phase III) |
|---|---|
| Cloche de tête | Lanterne du sommet, la méduse brille dedans ; elle tombe quand la tour éclate |
| Cloches du torse | Étages de la tour |
| Épaules | Balcons |
| Bras | Arcs-boutants |
| Ancre | Plantée au pied de la tour, elle l'amarre |
| Chaînes | Amarres vers les récifs |

## La cloche
La cloche de tête du Roi est la cloche du Phare. Signes anguleux sur le bord (écriture ancienne inventée, dessinée une seule fois et réutilisée) ; le mot **Couronne** (EN : **Crown**) est gravé en clair au centre, visible en gros plan dans l'outro. Le joueur peut croire que c'est lié à la tête du Roi : fausse piste voulue.

## Mécaniques
- Phase I : esquiver sans mordre aux faux reflets (esquiver une illusion n'est pas une faute de série ; la faute n'existe que si le joueur reçoit le coup de retour, donc un dégât : validé le 30 octobre). Phase II : bloquer. Phase III : rester appuyé pour faire barrage, toucher pour la foudre et les pics.
- La riposte vient d'une **série réussie** (règle du Chapitre I), sans fenêtre « FRAPPE ! ». La contre-attaque avec jauge de fatigue (chaque attaque du boss la fait monter, point faible dévoilé, contre-attaque automatique) est **réservée à un chapitre suivant** : à ne pas implémenter, à ne pas supprimer des idées.
- Difficultés : mêmes valeurs que le Chapitre I pour le Veilleur (PV 6/4/3, Épreuve 4 PV, fenêtres de blocage ×2 / ×1 / ×0,6). PV des boss à ajuster après tests.

## Textes
Textes du chapitre (FR/EN) : voir `chapters/ch2-silent-bells/TEXTES.md` (généré depuis le jeu). Les nouveaux textes en attente d'application sont dans `CHANGEMENTS.md`, section A.

## Code couleur par chapitre
Chapitre I : braise, orange chaud. Chapitre II : marée, turquoise. Chapitre III : racines, vert mousse tirant sur le jaune (distinct du turquoise). Chapitre IV : givre, bleu-blanc pâle. Chapitre V : gris argenté. Chapitre VI : violet profond. Chapitre VII : blanc. Héros : jaune neutre. Le titre « à suivre » et le point de la Couronne dans le menu suivent ce code.

## Écarts techniques constatés à l'audit (à traiter dans cet ordre)
1. `_(fr, en)` à l'envers par rapport à Ember Bridge `_(en, fr)` : **inverser avant toute fusion**.
2. Clés de sauvegarde `pn-…` et `db-…` : à passer en `lb-…` communes (langue, son, musique, intro vue, progression, records), avec migration des anciennes clés.
3. Polices Google Fonts en ligne : les intégrer comme au Chapitre I (`build/fonts.css`), supprimer les `<link>` Google.
4. Menu propre avec lien vers l'ancien artefact du Chapitre I : à remplacer par le futur menu commun.
5. ~~Pas de crochets de test : prévoir un test de fumée (déblocage via `localStorage` `db-unl`).~~ **Remplacé** par la pratique décrite dans la section « Tests » de `chapters/ch2-silent-bells/NOTES.md` (copie de test à crochets, `dist` publié sans crochet).

## Sorts et rages (décisions du 27 octobre, pour C1 puis session équilibrage)

**Vocabulaire (28 octobre) :** le Veilleur n'a plus d'épée, donc plus de « parade ». Un seul geste, **bloquer** (EN *block*), pour les phases où l'on faisait parer, et **esquiver** ; la phase III garde le blocage tenu (barrage), avec le bouton « Bloquer » / « Block » (validé le 30 octobre ; avant : « Garde » / « Guard »). Même principe, mêmes fonctions et mêmes états que le Chapitre I (`ready` → action → `recover`). Les noms dans le code et les textes (FR/EN, lecteur d'écran, aide, difficultés) suivent.

Seul l'aspect change ; les valeurs (timings, fenêtres) restent celles du code jusqu'à la session d'équilibrage.

### Phase I · La salle des reflets (la Voix Creuse) : esquive
- Gardés : orbe, volée, cri.
- **Rage = Échos** (trois sources, une seule vraie) ; les reflets se brisent un à un, avec un éclat qui part vers le Veilleur.

### Phase II · La cale (l'Ancien de Rouille) : blocage
- Gardés : ancre plongeante, balayage, glas (onde de la cloche de tête).
- **Harpon** : la seconde main de l'Ancien est un harpon (aller, puis retour). Le crochet à chaîne disparaît (différencier du Colosse).
- **Vague d'eau** (remplace piétinement et pierres) : il tape du pied, la vague naît sous son pied et grandit en avançant vers le Veilleur. Au mur du fond, la cale tremble et une poutre tombe du plafond (deux chutes = deux blocages, comme les anciennes pierres).
- **Rage = Nuage de rouille** : il secoue sa cloche, un nuage de poussière rouge descend et masque le décor (jamais le signal de blocage ; l'Ancien reste repérable à la lueur de sa cloche), avance, blocage au contact.
- **Rage = Double vague** : deux vagues décalées, la seconde plus grande, la poutre tombe après la seconde.

### Phase III · Les récifs (le Phare Noyé)
- Gardés : faisceau, foudre.
- **Pics de glace → pics de récif** : pointes de roche noire jaillissant du sol marin, un peu d'écume. Même timing, même effet.
- **Vague de l'Ancien reprise en forme I** (maintien).
- **Rage forme I = Marée montante** : la vague traverse les récifs, les pics jaillissent dans son sillage au retrait (maintenir pour la vague, tap pour les pics).
- **Rage forme II = Tempête de cloches** : anneaux tirés en alternance depuis les deux lanternes latérales, puis cloche-piège à la fin (tap, puis maintien). L'implosion reste la finale.
- Forme II inchangée sinon : anneaux, cloche-piège, ancre, lanternes, éclatement, reformation, implosion.

### Décor (C1)
Plus de forge, de neige, de lac gelé ni d'aurore : salle des reflets (eau-miroir), cale d'épave (ancre au sol avant l'arrivée du Roi), récifs. La lanterne turquoise de la gardienne tombe à l'eau quand le miroir éclate et coule en pulsant.

## Révisions du 28 octobre (retours après test des PR #5 à #7)

**Lore : la cale et le Phare.** Le Phare se dresse sur un récif, une épave est coincée dans ses fondations ; la trappe de la salle des reflets donne dans la cale de cette épave. Fin de phase II : le sol ne cède pas, c'est la coque qui s'effondre autour du Roi ; le plafond s'ouvre, la lune éclaire pour la première fois son corps de métal, et la lueur turquoise de son cœur se voit (dès le début de la phase II, fixe, aussi visible par les jointures). La phase III se déroule dans la coque éventrée, à l'air libre, parmi les récifs.

**Indices (rien d'écrit en plus).**
- Phase I : la trappe est visible dès le début (fermée, rouillée, enchaînée, reflétée dans l'eau), tintement sourd de cloche en dessous, rupture de la chaîne à la fin, la caméra descend par la trappe au début de la phase II (la trappe vue d'en dessous). À la fin, la lanterne du Veilleur (joueur) faiblit un instant.
- Phase II : le Roi porte les restes d'un Veilleur : lambeau de cape, cage de lanterne éteinte à la ceinture, anneau de chaîne au poignet.
- Phase III : un bâton de Veilleur sans lanterne, discret dans le décor (récif ou débris au pied de la tour).
- Outro : pas de lueur sous les vagues ; une seule lumière, celle de la Flèche de la forêt qui faiblit.

**Technique (session de chapitre).** Texte d'intro à la vitesse du Chapitre I (6 à 7 s par carton) ; orbes illusoires et clones pleins avec contour en pointillé ; récupération face aux pluies denses comparée à la pluie de pierres du Chapitre I ; rages (déclenchement, séquence, affichage dans la barre de vie) comme au Chapitre I ; carton de fin de phase I sur fond fixe (pas de début de combat derrière) ; intro et outro dans un module commun avec « Passer » et bouton de rejeu (session moteur).
