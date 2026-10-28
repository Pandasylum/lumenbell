# Chapitre II · Silent Bells : cahier des charges de l'harmonisation

Décisions de Kevin, 27 octobre 2026. Elles priment sur le contenu actuel de `chapters/ch2-silent-bells/legacy/silent-bells.source.html` (version du 25 octobre, page complète autonome). Lore de référence : `docs/LORE.md` + ce fichier. En cas de doute : **ne pas deviner, proposer.**

## Règles qui s'appliquent (identiques au Chapitre I)
- Tout texte existe en FR et EN. **Aucun mot d'annonce à l'écran** (« Parfait ! », « Paré », « Esquivé », « Touché », « Contré », « Un reflet ! », « Trop tard », « FRAPPE ! », « TIENS ! », « Coup de grâce »…). Seules les onomatopées et les titres de phase s'affichent. Les phrases descriptives servent au lecteur d'écran.
- Ce qui se déduit du combat reste déduit : pas de texte qui explique l'image.
- Nom de la série : **Lumenbell**. « Ember Bridge · Chapitre II » disparaît ; le menu dit « Chapitre II · Silent Bells ».
- Le Veilleur ne parle pas ; sa lanterne s'appelle « sceptre-lanterne » / « lanterne », jamais « bâton ».
- Féminin de Veilleur : **Veilleure**.

## Histoire du chapitre
Le Veilleur gagne tous les combats et perd quand même la tour : la mer garde ce qu'elle prend.
- Intro : la tour est muette ; on dit que sa gardienne veille encore.
- Phase I (la Voix Creuse) : la gardienne est tombée avant lui, corrompue ; il n'en reste qu'un reflet. Quand le miroir qui lui tient lieu de visage explose, **une lanterne de Veilleur tombe dans l'eau, flamme turquoise, et coule en pulsant**.
- Phase II (le Roi de Rouille) : le Lié de la tour, jamais rescellé. Il porte sur la tête la cloche du Phare. **Une ancre géante est dans la cale avant son arrivée ; il la saisit pour combattre.**
- Phase III (le Phare Noyé, deux formes) : un parasite de l'Umbryn, la Sans-Fond, bâtit la tour avec le corps du Roi. Forme I : la tour ; forme II : la méduse à découvert (la tour éclate). À la fin, la cloche gît dans les décombres.
- La lueur turquoise est le reste de Lumen de la gardienne, teinté par la mer ; jamais expliqué.

## Pièces du Roi → pièces de la tour (phase III)
Le Roi peut être redessiné pour être plus esthétique, mais chaque pièce doit servir à la tour.

| Pièce du Roi (phase II) | Rôle dans la tour (phase III) |
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
- Phase I : esquiver sans mordre aux faux reflets. Phase II : parer. Phase III : rester appuyé pour faire barrage, toucher pour la foudre et les pics.
- La riposte vient d'une **série réussie** (règle du Chapitre I), sans fenêtre « FRAPPE ! ». La contre-attaque avec jauge de fatigue (chaque attaque du boss la fait monter, point faible dévoilé, contre-attaque automatique) est **réservée à un chapitre suivant** : à ne pas implémenter, à ne pas supprimer des idées.
- Difficultés : mêmes valeurs que le Chapitre I pour le Veilleur (PV 6/4/3, Épreuve 4 PV, fenêtres de parade ×2 / ×1 / ×0,6). PV des boss à ajuster après tests.

## Textes validés (français ; l'anglais est à écrire dans le même esprit)
**Intro** : 1. « Sur la côte, la brume ne se lève plus. » 2. « Au large, le Phare Noyé se dresse, éteint. Aucune cloche ne lui répond. » 3. « Les navires ne reviennent plus. Les pêcheurs disent que la mer garde ce qu'elle prend. » 4. « On dit que sa gardienne veille encore là-haut. » 5. Titre : « Chapitre II · Silent Bells ».

**Phase I · La salle des reflets** (boss : la Voix Creuse) : entrée « Au pied du Phare, l'eau est un miroir. Une voix y répond au Veilleur. » ; fin « L'espace d'un instant, la lanterne du Veilleur faiblit. » (c'est la lanterne du joueur qui faiblit, pas la turquoise ; la trappe, la chute de la lanterne turquoise et le miroir brisé sont montrés, pas écrits)

**Phase II · La cale** (boss : le Roi de Rouille) : entrée « Sous le Phare, la coque d'un navire échoué. Elle sent le fer et le sel. » ; fin « La coque s'effondre autour du Roi. Pour la première fois, la lune se reflète sur son corps de métal. » (le sol ne cède pas : c'est le navire qui s'écroule, la lueur turquoise vient de son cœur et se voit)

**Phase III · Les récifs** (boss : le Phare Noyé ; forme II : l'Éclaté) : entrée « La mer s'est retirée. Les navires qu'elle a pris dorment sur le récif. » ; forme II « La tour éclate. Au milieu des débris, la méduse, à découvert. » ; fin « Dans les décombres, la cloche du Phare, fêlée et muette. »

**Outro** (6 cartons, même construction que celui du Chapitre I : `SC` avec durées + dessins) :
1. « Au matin, le Phare Noyé se dresse encore, muet. Sa cloche ne résonnera plus. »
2. Gros plan de la cloche : « Sur celle-ci, un seul mot est gravé : Couronne. »
3. « Et cette fois, la terre n'a pas cessé de trembler. » Image : la vallée et les tours du Chapitre I, fissures, une tour éteinte, les autres vacillent.
4. « Au cœur de la forêt, la lumière d'une Flèche faiblit. » (indice de la tour suivante : les Racines ; la Flèche liée de la forêt commence à faiblir ; plus de lueur turquoise sous les vagues)
5. « Chapitre III. À suivre. », titre teinté de la couleur du chapitre suivant.

À supprimer de l'ancienne version : « Le Roi n'est plus le Roi », « Fais taire le glas », « Ne crois pas ce que tu vois », « Éteins le phare », les modes d'emploi dans les cartes de phase, l'intro « étoiles / bâton », « marais des Cloches », « lac gelé », la fonderie, « les villages avaient fondu leurs cloches ».

## Textes validés (anglais)
Titres et boss : Phase I · The Mirror Hall (The Hollow Voice) ; Phase II · The Hold (The Rust King) ; Phase III · The Reefs (The Drowned Lighthouse ; forme II : The Shattered). « Crown » traduit « Couronne ». Le féminin de la gardienne n'apparaît pas en anglais (« its keeper »), il se voit à l'image.

**Intro** : 1. "On the coast, the mist no longer lifts." 2. "Out at sea, the Drowned Lighthouse stands dark. No bell answers it." 3. "The ships no longer return. The fishermen say the sea keeps what it takes." 4. "They say its keeper still watches up there." 5. Title: "Chapter II · Silent Bells".

**Phase I** : entrée "At the foot of the Lighthouse, the water is a mirror. A voice answers the Watcher there." ; fin "For a moment, the Watcher's lantern dims."

**Phase II** : entrée "Beneath the Lighthouse, the hull of a stranded ship. It smells of iron and salt." ; fin "The hull collapses around the King. For the first time, the moon gleams on his body of metal."

**Phase III** : entrée "The sea has drawn back. The ships it took sleep on the reef." ; forme II "The tower bursts. Among the debris, the jellyfish, laid bare." ; fin "In the wreckage, the Lighthouse's bell, cracked and silent."

**Outro** : 1. "By morning, the Drowned Lighthouse still stands, mute. Its bell will never ring again." 2. "On it, a single word is engraved: Crown." 3. "And this time, the earth has not stopped trembling." 4. "In the heart of the forest, a Spire's light is failing." 5. "Chapter III. To be continued."

## Code couleur par chapitre
Chapitre I : braise, orange chaud. Chapitre II : marée, turquoise. Chapitre III : racines, vert mousse tirant sur le jaune (distinct du turquoise). Chapitre IV : givre, bleu-blanc pâle. Le titre « à suivre » et le point de la Couronne dans le menu suivent ce code.

## La Couronne et les tours (ordre définitif)
Six tours en cercle, une au centre (la clé, le dénouement). Chaque lumière perdue fragilise le sceau et l'ancre que la Couronne représente. Trois pertes sur six. **Les pertes ne dépendent jamais de la performance** (les chapitres se rejouent à volonté).

| Ch. | Tour | Sort |
|---|---|---|
| I | Montagne | Gardée |
| II | Phare Noyé | Perdue |
| III | Racines | Au choix (le village ou la tour ; le choix se rejoue à chaque passage, le dernier fait foi) ; fragment : la berceuse du village |
| IV | Givre | Perdue ; fragment : page des carnets de la Forge (« se disent aussi les Liés »), le milieu du jeu |
| V | Tour vide | Perdue ; fragment : deux lanternes, un seul lit |
| VI | La brèche (le Roi Sombre) | Gardée ; fragment : sa lanterne de Veilleur éteinte à la ceinture |
| VII | Le cœur | Dénouement |

La fin : les lumières ne changent que le rendu (image, ton), jamais le choix de l'issue (cloche, rayon, éclats). Idée de menu : la Couronne (six points autour d'un septième, allumés / éteints / fragiles).

## Écarts techniques constatés à l'audit (à traiter dans cet ordre)
1. `_(fr, en)` à l'envers par rapport à Ember Bridge `_(en, fr)` : **inverser avant toute fusion**.
2. Clés de sauvegarde `pn-…` et `db-…` : à passer en `lb-…` communes (langue, son, musique, intro vue, progression, records), avec migration des anciennes clés.
3. Polices Google Fonts en ligne : les intégrer comme au Chapitre I (`build/fonts.css`), supprimer les `<link>` Google.
4. Menu propre avec lien vers l'ancien artefact du Chapitre I : à remplacer par le futur menu commun.
5. Pas de crochets de test : prévoir un test de fumée (déblocage via `localStorage` `db-unl`).

## Sorts et rages (décisions du 27 octobre, pour C1 puis session équilibrage)

**Vocabulaire (28 octobre) :** le Veilleur n'a plus d'épée, donc plus de « parade ». Un seul geste, **bloquer** (EN *block*), pour les phases où l'on faisait parer, et **esquiver** ; la phase III garde le blocage tenu (barrage). Même principe, mêmes fonctions et mêmes états que le Chapitre I (`ready` → action → `recover`). Les noms dans le code et les textes (FR/EN, lecteur d'écran, aide, difficultés) suivent.

Seul l'aspect change ; les valeurs (timings, fenêtres) restent celles du code jusqu'à la session d'équilibrage.

### Phase I · La salle des reflets (la Voix Creuse) : esquive
- Gardés : orbe, volée, cri.
- **Rage = Échos** (trois sources, une seule vraie) ; les reflets se brisent un à un, avec un éclat qui part vers le Veilleur.

### Phase II · La cale (le Roi de Rouille) : blocage
- Gardés : ancre plongeante, balayage, glas (onde de la cloche de tête).
- **Harpon** : la seconde main du Roi est un harpon (aller, puis retour). Le crochet à chaîne disparaît (différencier du Colosse).
- **Vague d'eau** (remplace piétinement et pierres) : il tape du pied, la vague naît sous son pied et grandit en avançant vers le Veilleur. Au mur du fond, la cale tremble et une poutre tombe du plafond (deux chutes = deux blocages, comme les anciennes pierres).
- **Rage = Nuage de rouille** : il secoue sa cloche, un nuage de poussière rouge descend et masque le décor (jamais le signal de blocage ; le Roi reste repérable à la lueur de sa cloche), avance, blocage au contact.
- **Rage = Double vague** : deux vagues décalées, la seconde plus grande, la poutre tombe après la seconde.

### Phase III · Les récifs (le Phare Noyé)
- Gardés : faisceau, foudre.
- **Pics de glace → pics de récif** : pointes de roche noire jaillissant du sol marin, un peu d'écume. Même timing, même effet.
- **Vague du Roi reprise en forme I** (maintien).
- **Rage forme I = Marée montante** : la vague traverse les récifs, les pics jaillissent dans son sillage au retrait (maintenir pour la vague, tap pour les pics).
- **Rage forme II = Tempête de cloches** : anneaux tirés en alternance depuis les deux lanternes latérales, puis cloche-piège à la fin (tap, puis maintien). L'implosion reste la finale.
- Forme II inchangée sinon : anneaux, cloche-piège, ancre, lanternes, éclatement, reformation, implosion.

### Décor (C1)
Plus de forge, de neige, de lac gelé ni d'aurore : salle des reflets (eau-miroir), cale d'épave (ancre au sol avant l'arrivée du Roi), récifs. La lanterne turquoise de la gardienne tombe à l'eau quand le miroir éclate et coule en pulsant.

## Révisions du 28 octobre (retours après test des PR #5 à #7)

**Lore : la cale et le Phare.** Le Phare se dresse sur un récif, une épave est coincée dans ses fondations ; la trappe de la salle des reflets donne dans la cale de cette épave. Fin de phase II : le sol ne cède pas, c'est la coque qui s'effondre autour du Roi ; le plafond s'ouvre, la lune éclaire pour la première fois son corps de métal, et la lueur turquoise de son cœur se voit. La phase III se déroule dans la coque éventrée, à l'air libre, parmi les récifs.

**Indices (rien d'écrit en plus).**
- Phase I : la trappe est visible dès le début (fermée, rouillée, enchaînée, reflétée dans l'eau), tintement sourd de cloche en dessous, rupture de la chaîne à la fin, la caméra descend par la trappe au début de la phase II (la trappe vue d'en dessous). À la fin, la lanterne du Veilleur (joueur) faiblit un instant.
- Phase II : le Roi porte les restes d'un Veilleur : lambeau de cape, cage de lanterne éteinte à la ceinture, anneau de chaîne au poignet.
- Phase III : un bâton de Veilleur sans lanterne, discret dans le décor (récif ou débris au pied de la tour).
- Outro : pas de lueur sous les vagues ; une seule lumière, celle de la Flèche de la forêt qui faiblit.

**Technique (session de chapitre).** Texte d'intro à la vitesse du Chapitre I (6 à 7 s par carton) ; orbes illusoires et clones pleins avec contour en pointillé ; récupération face aux pluies denses comparée à la pluie de pierres du Chapitre I ; rages (déclenchement, séquence, affichage dans la barre de vie) comme au Chapitre I ; carton de fin de phase I sur fond fixe (pas de début de combat derrière) ; intro et outro dans un module commun avec « Passer » et bouton de rejeu (session moteur).
