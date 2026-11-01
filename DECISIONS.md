# Décisions de design

Journal daté. Une décision validée n'est pas remise en question dans une autre session sans accord de Kevin.

## À valider (restés ouverts)
Trois points attendent encore Kevin ; les autres « à valider » des entrées archivées sont tranchés (bouton de la phase III, illusion, onomatopées, carte de défaite : validés le 30 octobre, `docs/decisions/2026-10-30-ch2-validations.md`).
- **Valeurs provisoires** pour la session d'équilibrage : table `SP` (nouveaux sorts), `DG.backWin` (retour de l'illusion), `HULL` (décor de la phase III), `SHOCK.form` (chocs par forme). Voir [sorts](archives/DECISIONS-2026-10-27-28.md#sorts), [deuxième passe](archives/DECISIONS-2026-10-27-28.md#deuxieme-passe), [retouches 3](archives/decisions/2026-10-28-ch2-retouches-3.md).
- **Difficile du Chapitre II « nettement plus dur »** (fenêtre asymétrique, deux rages, dernier assaut à 1 PV) : à reprendre en équilibrage. Voir [états du Veilleur](archives/DECISIONS-2026-10-27-28.md#etats-veilleur), [retouches](archives/DECISIONS-2026-10-27-28.md#retouches).
- **Hypothèses des sessions sans surveillance** (décors C1, sorts, intro/outro, retouches) : choix faits sans pouvoir demander, jamais confirmés en bloc.

## Index des fichiers de décision (`docs/decisions/`)
Les nouvelles décisions ont chacune leur fichier daté ; une ligne par fichier ici.
- [2026-10-28 · éléments communs : décisions de Kevin sur l'audit (barre de récupération, Épreuve, aide, phase I, respiration, titre, langue, repère d'aide, libellé de Difficile) et session `engine/shared` (`shared/`, `LB`, clés `lb-…` du Chapitre I, options mémorisées, Chapitre II en morceaux)](docs/decisions/2026-10-28-engine-shared.md)
- [2026-10-28 · `engine/audio` : `LB.audio` (contexte unique, `tone`/`noise` du Chapitre II, suspension en arrière-plan, réglages `lb-snd`/`lb-mus`), chapitres rebranchés sans changer les sons, lectures retenues](archives/decisions/2026-10-28-engine-audio.md)
- [2026-10-28 · Chapitre II, troisième passe de retouches (`ch2/retouches-3`) : entrée de la phase III sans chute, décor de la coque ouverte, onomatopées (CLANG dans les trois phases de blocage, aucun mot en phase I), chocs d'impact distincts par forme (`SHOCK.form`)](archives/decisions/2026-10-28-ch2-retouches-3.md)
- [2026-10-30 · Chapitre II, validations de Kevin : bouton de la phase III « Bloquer » / « Block », esquiver une illusion n'est pas une faute de série, onomatopées `CLANG` / `KRAKOOM` / `KRAAAK` validées, carte de défaite en simple texte (textes à fournir, projet Lore)](docs/decisions/2026-10-30-ch2-validations.md)
- [2026-10-31 · Chapitre II, application de `CHANGEMENTS.md` A, B, C, H, J(a), J(b) : textes, Ancien de Rouille, cœur turquoise fixe, Rémanence, bouton « Bloquer », illusions esquivées](docs/decisions/2026-10-31-ch2-lore-changements.md)
- [2026-10-30 · entrées Lore des 28 et 29 octobre : renvoi au journal de `docs/LORE.md` §15, pas de recopie ici](docs/decisions/2026-10-30-decisions-lore-renvoi.md)
- [2026-10-31 · `engine/hero-states` : une seule machine à états du Veilleur (`LB.hero`, `HERO_T`, `HERO_DIFF`), lanterne rouge pour un appui refusé et barre de récupération réduite à l'aide (remplace le n° 1 du 28 octobre), Épreuve à 4 PV sans soin et ouverte, coup bloqué → `ready` en phase I, vocabulaire bloquer / esquiver au Chapitre I ; **Épreuve : +1 PV entre les phases, plafond 4, deux chapitres (décision du soir, remplace « aucun soin »)**](docs/decisions/2026-10-31-engine-hero-states.md)
- 2026-10-30 · voix : berceuse du chapitre III en chant formantique sans paroles intelligibles (paroles écrites) ; voix du Roi Spectral (VI) enregistrée puis modulée, seule exception à « tout synthétisé »
- [2026-11-01 · menus : nom de l'Épreuve dans tous les menus (« Épreuve du feu », « Épreuve de l'eau », « Épreuve de la terre ») et sous-titres communs à tous les chapitres (Respire, À la loyale, Sans pitié, Challenge ultime) ; ferme À trancher 14 et 15 et la décision 9 du 28 octobre (session `menu/common`)](docs/decisions/2026-11-01-menus-epreuve-sous-titres.md)
- [2026-11-01 · `engine/watcher` : un seul Veilleur dessiné (`LB.drawWatcher`, table de poses, lanterne, bouclier, silhouettes communes), celui du Chapitre I ; respiration du Chapitre II (décision n° 5) au repos ; Chapitre I identique au pixel hors respiration ; le Chapitre II abandonne bâton à cristal, tête ronde et écharpe ; ferme `DEMANDES.md` « un seul Veilleur » et À trancher 16 ; points à valider § 5](docs/decisions/2026-11-01-engine-watcher.md)

## 2026-10-26 / 27 – Refonte du lore et des textes du Chapitre I
- Le secret (les Scellés sont d'anciens Veilleurs) n'est **jamais dit** ; un fragment par chapitre, davantage dans le premier.
- Intro : « membre d'un ordre qui protège les Flèches liées. Sa lanterne vit avec lui. » (ambivalence voulue). Carton 4 : « une chaîne cède » (jamais « brisée »). Carton 5 : « le feu atteindra les villages » (f minuscule : l'élément est la braise).
- Panneaux de phase épurés : ne pas redire ce que le combat montre. Entrée P1/P2/P3 et fins : voir `docs/TEXTES-CH1.md`.
- « Clocher des Veilleurs » ; le Colosse n'est **pas** dit « à genoux » dans les textes (le dessin le montre, statue agenouillée dans l'outro).
- La cloche sonne seule un peu avant l'impact d'entrée en P3 (le joueur s'interroge sur la raison du « dong »). Texte : « Un écho du passé résonne. »
- P2 : décor à base de mur de briques et terre ; support de chaîne avec chaîne d'homme rompue, second support vide (suggère la chaîne que porte le Colosse). Anneau de fer sur la corniche **visuel seulement**.
- L'anneau n'est mentionné qu'une fois en texte : panneau de fin P3, « un anneau de chaîne gravé d'un nom effacé ».
- Outro : durées augmentées pour les longs cartons (≤ 1 s), carton villages raccourci ; carton 4 sans mention de la lumière froide.
- Aucun mot d'annonce à l'écran ; textes toujours bilingues.

## 2026-10-27 – Organisation GitHub
- Dépôt privé unique `lumenbell`. Découpage d'abord en fichiers assemblés par script (pas de modules JS), puis éventuellement ES modules.
- Workflows : `tests.yml` (build reproductible + smoke) et `android.yml` (APK/AAB signés via Secrets).

## 2026-10-27 – Chapitre II · Silent Bells (voir `docs/CH2-SPEC.md`)
- Boss : trois boss distincts (la Voix Creuse, le Roi de Rouille, le Phare Noyé en deux formes). La Voix Creuse est la gardienne de la tour, tombée et corrompue ; indice : une lanterne turquoise tombe dans l'eau quand son miroir explose.
- Le Roi n'est pas rescellé (plus de gardienne pour tenir le fanal). Sa cloche de tête est la cloche du Phare ; gravure : signes anguleux + « Couronne » en clair (fausse piste : la tête du Roi).
- Mécaniques : reflets (I), parade (II), barrage (III) ; riposte par série réussie. Contre-attaque à jauge de fatigue : réservée à un chapitre suivant.
- Difficultés alignées sur Ember Bridge (Veilleur 6/4/3).
- Trois tours perdues sur six, jamais selon la performance ; ordre : Montagne, Phare Noyé, Givre, Racines, Tour vide, La brèche (Roi Sombre), Le cœur. Les lumières ne changent que le rendu de la fin.
- Intro, panneaux de phase et outro nouveaux et épurés ; code couleur par chapitre (braise, marée, givre).
- Féminin de Veilleur : Veilleure.

## 2026-10-27 – Chapitre II · import propre (technique)
- `dist/index.html` du Chapitre II vient de la source importée, sans l'hébergeur d'artefacts ni Google Fonts (polices inlinées) ; zip itch.io à date fixe. La puce « pas de crochets de test » a été remplacée par la pratique ultérieure (copie de test, voir `chapters/ch2-silent-bells/NOTES.md`). *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#import-propre).)*

## 2026-10-27 – Chapitre II · écarts techniques (session 03, étape A)
- Source éditable `chapters/ch2-silent-bells/src/silent-bells.html` ; fonction de texte `_(en, fr)` ; clés `lb-…` (référence : `shared/NOTES.md`) ; lien du menu vers le Chapitre I retiré. Aucun changement de jeu. *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#ecarts-techniques).)*

## 2026-10-27 – Chapitre II · gameplay et textes (session 03, étape B)
- `docs/CH2-SPEC.md` appliqué : mots d'annonce retirés, rages sans bandeau, difficultés alignées sur le Chapitre I, riposte automatique en phase III, cartes de phase, intro, outro et menu au format de la série. Onomatopées `CLANG` / `KRAKOOM` / `KRAAAK` et carte de défaite validées le 30 octobre (`docs/decisions/2026-10-30-ch2-validations.md`). *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#ch2-gameplay-textes).)*

## 2026-10-27 – Chapitre II · blocage des appuis et déblocage (session 03, étape B, suite)
- La table `INPUT` est remplacée par les états du Veilleur. Seule règle encore vraie : `UNLOCK_ALL = true` ouvre les trois phases dès le départ (déblocage progressif désactivé pour les tests, `lb-ch2-unl` toujours écrite ; suivi dans `ROADMAP.md`). *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#blocage-appuis).)*

## 2026-10-27 – Chapitre II · états du Veilleur comme au Chapitre I (session 03, étape B, suite)
- Machine à états `ready` → action → `recover` dans les trois phases, comme au Chapitre I ; un appui hors `ready` met seulement `deny` (0,25 s) ; un seul coup par erreur ; phase III : garde tenue tant que le bouton l'est. La pénalité des reflets a été remplacée par la deuxième passe (illusions). Durées dans `T`, `DG`, `R_T` ; Difficile « nettement plus dur » : à valider. *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#etats-veilleur).)*

## 2026-10-28 – Chapitre I · cartes de transition (session `ch1/texts`)
- **Principe** : le titre d'une carte de transition est neutre ; ce qui raconte va dans le texte, qu'on peut ne pas lire sans perdre le fil. Ce qui est déjà montré à l'écran n'est pas écrit.
- **Fin de phase I** : ligne du haut « Transition » (au lieu de « Transition · Phase II »), titre « Phase I terminée », texte « Le Colosse fracasse le pont et plonge par la brèche dans la fonderie cachée sous l'arche, comme s'il en connaissait le chemin. » La phrase sur le Veilleur qui saute à sa poursuite est supprimée.
- **Fin de phase II** : ligne du haut « Transition », titre « Phase II terminée », texte « Le grand four engloutit le Colosse. Ravivé, il jaillit du four et s'envole par la cheminée. » La phrase sur la passerelle est supprimée (montrée et sous-titrée à l'écran).
- Textes de défaite et vocabulaire « parer / parade » inchangés (ce dernier sera traité par la session moteur).

## 2026-10-28 – Audit des éléments communs (session `engine/audit`, propositions à valider)
- Livrable `docs/COMMUN.md` : référence par élément, forme du commun (`shared/*.js`, objet `LB`) et ordre des sessions moteur. Les questions posées sont tranchées dans `docs/decisions/2026-10-28-engine-shared.md`. *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#audit-communs).)*

## 2026-10-27 – Chapitre II · décors et personnages (session C1, étape 1, branche `ch2/visuals-fights`)
- Turquoise (`#4fe0cc`) pour l'interface du chapitre ; salle des reflets, cale et récifs ; Roi de Rouille refondu en tour (trois cloches, harpon) ; gravure de la cloche en signes anguleux. La lumière du Roi, d'abord ambre, est tranchée turquoise fixe le 29 octobre (`docs/LORE.md`, `CHANGEMENTS.md` C, pas encore dans le code). Carte du code : `chapters/ch2-silent-bells/NOTES.md`. *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#decors-c1).)*

## 2026-10-28 – Chapitre II · bloquer au lieu de parer (décision de Kevin, appliquée en session C1, étape 2)
- Plus de « parade » : bloquer (EN *block*) et esquiver. Bouton de la phase III « Bloquer » / « Block » (validé le 30 octobre, `CHANGEMENTS.md` J) ; le lecteur d'écran garde « Ta garde est brisée » volontairement (`docs/GLOSSAIRE.md`). Chapitre I non modifié : l'écart est dans `DEMANDES.md`. *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#bloquer).)*

## 2026-10-28 – Chapitre II · nouveaux sorts (session C1, étape 2, branche `ch2/spells`)
- Vague d'eau, double vague, nuage de rouille, vague du Roi, marée montante, tempête de cloches et écho sont codés, au timing des sorts qu'ils remplacent. Durées de la table `SP` provisoires : à valider en équilibrage. *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#sorts).)*

## 2026-10-28 – Chapitre II · intro et outro (session C1, étape 3, branche `ch2/visuals-cinematics`)
- Textes inchangés, scènes refaites sans mot d'annonce : intro en plans coupés par le noir, Phare de pierre ; outro avec la vallée du Chapitre I, une tour qui s'éteint, la forêt et « Chapitre III. À suivre. ». Rythme révisé ensuite (voir retouches). *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#intro-outro).)*

## 2026-10-28 – Chapitre II · retouches après test des PR #5 à #7 (branche `ch2/retouches`)
- Textes du cahier des charges mot pour mot ; intro à la vitesse du Chapitre I (`PRO_T`) ; cartons de fin de phase sur fond fixe ; trappe, descente, restes de Veilleur ; orbes illusoires en pointillé ; pluie de bris (`RAIN`) et rages (`DIFFS.u`, `RAGE`) comme au Chapitre I. Valeurs provisoires dans les tables ; Difficile à reprendre en équilibrage. *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#retouches).)*

## 2026-10-28 – Chapitre II · deuxième passe de retouches (branche `ch2/retouches`)
- `BAM` retiré ; choc de la riposte repris du Chapitre I (`SHOCK`) ; défaite en forme II : retour à la forme I de la phase III ; l'illusion esquivée revient (`DG.backWin` provisoire, `DG.fool` retiré). Esquiver une illusion n'est pas une faute de série (validé le 30 octobre, `CHANGEMENTS.md` J). *(Texte intégral : [archives/DECISIONS-2026-10-27-28.md](archives/DECISIONS-2026-10-27-28.md#deuxieme-passe).)*
