# Décisions de design

Journal daté. Une décision validée n'est pas remise en question dans une autre session sans accord de Kevin.

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
- `dist/index.html` du Chapitre II = la source `legacy/` à l'identique, sauf : meta de l'hébergeur d'artefacts retirée, liens Google Fonts retirés, `build/fonts.css` inliné. Aucun changement de jeu, de texte ni de rendu ; l'harmonisation (`docs/CH2-SPEC.md`) est une session suivante.
- L'enveloppe de l'hébergeur (ligne 1 : `<head>` et style de base) est gardée telle quelle pour ne pas toucher au rendu ; la remise en ordre du `<head>` se fera avec l'harmonisation.
- Pas de version de test ni de crochets pour le Chapitre II : le test de fumée pilote le `dist` publié par le DOM (menu, frise des phases, clavier) et débloque les phases via `db-unl`.
- Zip itch.io du Chapitre II à date fixe (reproductible).

## 2026-10-27 – Chapitre II · écarts techniques (session 03, étape A)
- **Source éditable** : `chapters/ch2-silent-bells/src/silent-bells.html` ; `legacy/silent-bells.source.html` reste l'import d'origine, figé (référence des contrôles). Le build lit `src/`.
- **Fonction de texte** : `_(en, fr)` comme au Chapitre I. Inversion faite par script (`build/ch2_swap_args.py`, passe unique), contrôlée par `tests/ch2-texts.js`.
- **Clés de sauvegarde** : préfixe `lb-`. Communes à la série : `lb-lang`, `lb-snd`, `lb-mus`, `lb-help`. Propres à un chapitre : `lb-chN-…` (`lb-ch2-unl`, `lb-ch2-best-<mode>` ; à venir `lb-ch1-intro`, `lb-ch1-end`, `lb-ch1-best-<mode>`). Migration : lire la nouvelle clé, sinon l'ancienne (`pn-lang` puis `eb-lang` pour la langue ; `db-optSnd`, `db-optMus`, `db-optHelp`, `db-unl`, `db-best-<mode>`), puis écrire la nouvelle. Les anciennes clés ne sont pas effacées (le Chapitre I lit encore `eb-lang`). Le Chapitre II n'a pas de drapeau « intro vue » (le prologue se passe par Entrée) : aucun n'a été ajouté.
- **`<head>`** : l'enveloppe de l'hébergeur d'artefacts est retirée ; seule règle reprise dans les styles du jeu : les marges de zones sûres haut/bas (`html{padding-top/bottom:env(safe-area-inset-…)}`, comme au Chapitre I). Les autres règles de l'enveloppe étaient toutes écrasées par celles du jeu. `<html lang="fr">` (langue par défaut du chapitre, remise à jour par le script).
- **Lien du menu vers l'artefact du Chapitre I** : retiré, rien à la place (le menu commun viendra avec l'harmonisation).
- Aucun changement de jeu, de texte affiché ni de rendu, hormis le menu sans le lien (vérifié en image).

## 2026-10-27 – Chapitre II · gameplay et textes (session 03, étape B)
Application de `docs/CH2-SPEC.md` ; choix faits là où le cahier des charges ne tranchait pas (à valider par Kevin) :
- **Onomatopées** : comme la table `ONO` du Chapitre I, parade → `CLANG` (phase II), coup porté au boss → `BAM`, coup final de la forme II → `KRAKOOM` (le coup final du Chapitre I), Veilleur écrasé par un débris qui tombe dans la cale (phase II) → `KRAAAK` (l'écrasement du Chapitre I). Esquives (phase I) et contres de la phase III : aucun mot, le son suffit. Le compteur « ×1…×7 » du coup final est retiré.
- **Rages et derniers assauts** (« Miroir brisé », « Cœur bleu », « Double orbite », « Dernier assaut ») : plus de bandeau écrit ; le son reste, le nom et la phrase vont au lecteur d'écran.
- **Difficultés** : la fenêtre « parfait » suit le même multiplicateur que la fenêtre de parade (×2 / ×1 / ×0,6). Difficile passe de 0,155 s à 0,12 s et de 5 à 3 PV : nettement plus dur (mesures dans `chapters/ch2-silent-bells/NOTES.md`).
- **Phase III** : riposte automatique après une série sans faute, même règle de dégâts qu'aux phases I et II ; durée et instant d'impact de l'ancienne contre-attaque gardés pour l'animation (`R_CNT[3]`).
- **Cartes** : sourcil = titre de phase, titre = nom du boss, texte = panneau du cahier des charges en entier. Carte de fin de phase III ajoutée avant l'outro (comme le panneau de fin du Chapitre I). Défaite : « Le Veilleur est à terre. » gardé, conseil « Respire, observe les signes… » retiré, note d'Épreuve (« une chute te renvoie à la phase I ») gardée. « Le Veilleur reprend son souffle. » / « Épreuve : pas de soin. » retirés des cartes de fin de phase.
- **Intro** : titre final « Lumenbell » en grand, « Chapitre II · Silent Bells » en dessous, en petit et en turquoise (décision de Kevin, même construction qu'au Chapitre I). **Outro** : carton 6 en vert mousse `#b9cf5a` (code couleur du Chapitre III). Durées des cartons dans des tables ; scènes inchangées.
- **Menu** : « Chapitre II · Silent Bells » en sourcil, « Lumenbell » en titre (Lumen en turquoise, comme au Chapitre I) ; plus de sous-titre « Le Phare Noyé », d'accroche ni de mode d'emploi. Libellés des difficultés (« Respirer », « Le vrai combat »…) gardés.
- Phrases pour le lecteur d'écran (`say`, descriptions `aria`) : gardées et mises à jour (« lac gelé » → « récifs »), hors cahier des charges car invisibles.

## 2026-10-27 – Chapitre II · blocage des appuis et déblocage (session 03, étape B, suite)
- *(Remplacé le 27 octobre par les états du Veilleur, ci-dessous.)* **Blocage des appuis** (défaut : on pouvait marteler le bouton ; en phase III, marteler en tenant la garde battait le boss sans coup reçu). Table `INPUT` : un appui sans effet bloque 0,7 s les appuis qui réussissent ; un appui pendant ce blocage le prolonge de 0,25 s ; un appui réussi ne bloque jamais ; la pénalité du reflet reste (elle vaut 0,6 s dans le code, pas 0,55 s : la valeur 0,55 était celle d'une définition morte retirée à l'étape B) ; phase III comprise, la garde restant possible pendant le blocage ; un appui pendant un faisceau ou dans la seconde qui le précède n'est pas un raté.
- *(Remplacé, ci-dessous.)* **Choix ajouté** pour qu'une erreur ne coûte qu'un coup : le coup reçu solde le blocage en cours (il le remplace par le blocage après coup), et ce blocage après coup passe de 0,3 s à 0,1 s. Sans cela, un seul appui trop tôt coûtait 2 ou 3 coups dans 18 cas sur 72 (mesure sur l'ancien code, où même un simple oubli enchaînait souvent un deuxième coup dans les séries serrées).
- **Déblocage progressif des phases et des difficultés : idée à étendre à toute la série plus tard (écran commun), désactivé pour les tests.** `UNLOCK_ALL = true` : les trois phases s'ouvrent dès le départ dans la frise, comme au Chapitre I ; difficultés et Épreuve étaient déjà toutes ouvertes. Le code du déblocage (`lb-ch2-unl`, toujours écrite à chaque phase gagnée) est gardé : `UNLOCK_ALL = false` le réactive.

## 2026-10-27 – Chapitre II · états du Veilleur comme au Chapitre I (session 03, étape B, suite)
- **La table `INPUT` disparaît** (0,7 s de blocage, +0,25 s, 0,1 s après un coup, pas de faute pendant un faisceau) : avec elle, l'animation d'esquive se rejouait à chaque appui (`S.dodgeT` mis à jour avant le test de blocage) et le spam semblait esquiver tout le temps.
- **Même principe que le Chapitre I, dans les trois phases** : machine à états `ready` → action → `recover` → `ready` (parade en phase II, pas de côté en phase I, garde en phase III) ; un appui n'agit qu'en `ready`, sinon il met seulement `deny` = 0,25 s (barre de récupération sous le Veilleur, rouge pendant `deny`) ; animation dessinée à partir de l'état (dates d'animation fixées au seul passage à l'action) ; chaque attaque est jugée à son impact selon l'état ; durées dans `T`, `DG`, `R_T` avec les valeurs du Chapitre I (action 0,333 s × m, récupération 0,7 s × rm, rm = 1,2 en Difficile comme au Chapitre I), à régler dans la session d'équilibrage.
- **Un seul coup par erreur**, par la machine à états : une attaque arrêtée renvoie à `ready` (série enchaînée), et l'étourdissement après un coup s'arrête 0,2 s avant l'attaque suivante (règle `qHurt` du Chapitre I).
- **Reflets** : esquiver un reflet reste une faute, réglée par une récupération rallongée (`DG.fool` = 0,6 s, la valeur de la pénalité précédente). Un appui ne compte comme visant un reflet que s'il est plus proche de lui que de toute vraie attaque à venir.
- **Choix pour la phase III** : la garde dure tant que le bouton est tenu (le barrage), puis récupération au relâchement ; un faisceau bloqué jusqu'au bout compte comme une attaque arrêtée et renvoie à `ready`, sinon un joueur parfait ne pouvait pas enchaîner « reformation puis dispersion » en Difficile (0,69 s d'écart, 0,84 s de récupération). Un tap n'est arrêté que par une garde fraîche (moins de 0,333 s × m), pas par une garde tenue depuis longtemps.
- **Conséquence mesurée** : la fenêtre n'est plus symétrique (avant : ±0,2 s autour de l'impact ; maintenant : action lancée dans les 0,333 s × m avant l'impact, 0,05 à 0,06 s de grâce après). Difficile devient nettement plus dur ; on n'y touche pas avant la session d'équilibrage (décision de Kevin).
- **Onomatopées** : `KRAKOOM` rétabli pour le coup final de la forme II ; `KRAAAK` pour le Veilleur écrasé par un débris dans la cale.
