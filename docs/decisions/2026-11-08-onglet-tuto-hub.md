# Onglet « Tutoriel » du hub (2026-11-08)

Décision validée : un onglet « Tuto » dans le hub. **Version 1 : texte seul.** Version 2 (plus tard) : animations rejouées par le moteur.

## Textes validés (EN / FR)
| Entrée | Titre | Texte | Déblocage |
|---|---|---|---|
| Bloquer | Block / Bloquer | "One press, at the exact instant: the blow stops dead." / « Un seul appui, à l'instant juste : le coup s'arrête net. » | premier blocage réussi (tap) |
| Esquiver | Dodge / Esquiver | "One press, at the exact instant: you slip out of its path." / « Un seul appui, à l'instant juste : tu glisses hors de sa trajectoire. » | première esquive réussie |
| Tenir | Hold / Tenir | "Keep pressing: your block holds, a dome wraps around you." / « Maintiens l'appui : ton blocage tient, un dôme t'enveloppe. » | premier maintien réussi (dôme) |
| Rester en place | Stand still / Rester en place | "Sometimes dodging is a misjudgment: know when to stand still." / « Parfois, l'esquive est une erreur de jugement : sache rester en place. » | première cible à ne pas esquiver (aujourd'hui l'orbe illusoire, Chapitre II phase I) laissée passer sans esquive |

Le libellé du bouton et le titre du panneau : « Tutoriel » en FR, « Tutorial » en EN (mis à jour le 2026-11-08, ex-« Tuto »).

## Emplacement du bouton
Pastille centrée juste au-dessus des boutons EN / FR (mobile et ordinateur), même style : icône de livre + libellé « Tutoriel » / « Tutorial ». Cible tactile ≥ 44 px, liseré doré au survol et au focus. Plus d'icône isolée en haut à gauche. Le panneau s'ouvre centré au-dessus de la pastille, largeur bornée à l'écran, croix de fermeture conservée.

Au retry de la P3, aucune attente ; le rappel est dans l'onglet Tutoriel.

## Mécanique
- **Bloc unique réutilisable** : `LB.tuto` (`shared/js/30-tuto.js`) porte les données des 4 entrées, le rendu et son style. `LB.tuto.mount(el)` le monte. Monté pour l'instant **uniquement dans le hub** ; aucun montage dans les menus des chapitres.
- **Détection dans `shared/`, une seule fois** : `LB.hero.stopped` (`16-hero.js`) signale `block` / `dodge` (geste de la garde) ou `hold` (paramètre `held`, vrai quand le dôme tenu réussit). Aucune détection dupliquée dans les chapitres ; le seul appel propre au Chapitre II est `LB.tuto.note('still')` quand un orbe illusoire passe sans esquive (`16-update.js`), et `stopped(p,true)` pour le dôme. En phase III du Chapitre II, un tap reste un blocage (`block`), pas un maintien.
- **Événement unique** : `lb-gesture` sur `window` (`detail.id`), émis par `LB.tuto.note` à la première réussite de chaque geste ; le bloc monté se rafraîchit.
- **Stockage** : clé commune `lb-tuto` (`LB.COMMON`), liste JSON des identifiants, via `LB.store` comme le reste de la progression du hub. Effacée par la réinitialisation de la progression (`RESET_T`). Aucun timing modifié.

## États
- Entrée non débloquée : une ligne neutre « — », sans titre ni texte (rien ne se déduit à l'avance), masquée aux lecteurs d'écran.
- **État vide de l'onglet** (aucun geste réussi) : les quatre lignes « — », sans phrase d'explication.

## Exception à BIBLE.md:16
BIBLE.md:16 interdit tout mot d'annonce à l'écran en combat. L'onglet Tuto est dans le hub, hors combat : exception voulue, limitée à ce panneau. Aucun texte nouveau en combat. Vocabulaire du glossaire : bloquer / esquiver, jamais « parer ».

## Phasage
- **V1** (cette décision) : texte seul.
- **V2** : animations des gestes rejouées par le moteur dans le même bloc ; montage éventuel ailleurs à décider à part.

## 2026-11-08 · feat/tuto-animations (version 2 faite)
- **Animations rejouées par le moteur**, sans GIF, vidéo ni asset : chaque entrée débloquée (sauf « Rester en place ») porte une icône ▶ à droite ; toute la ligne est un bouton (≥ 44 px, libellé lecteur d'écran « Voir l'animation » / « Watch the animation », aucun mot ajouté à l'écran).
- **Accordéon** : un clic déplie sous le texte une scène en boucle d'environ 2,6 s ; un second clic ou l'ouverture d'une autre entrée la replie. Une seule ouverte à la fois, aucune par défaut. Entrées non débloquées inchangées (« — »).
- **Fonctions réutilisées (shared/)** : `LB.drawWatcher` (poses `block`, `dodgeSide`, `hold`, `idle`), `LB.drawBlock` (bouclier ; dôme = option `plain`, comme la phase III du Chapitre I). Durées de geste lues dans `LB.HERO_T` (act, rec, perf) ; la mise en scène (vitesse du coup, boucle) est dans `LB.TUTO_T.anim`, aucun timing de jeu modifié.
- **Coup entrant** : simple halo ambré dessiné dans le bloc (aucune fonction partagée de projectile n'existe).
- **Sans animation** : « Rester en place » reste en texte seul, l'orbe illusoire n'étant dessiné que dans le Chapitre II (rien dupliqué).
- **Performance** : aucun canvas ni boucle tant qu'une entrée n'est pas dépliée ; un seul canvas (créé à l'ouverture, détruit à la fermeture), une seule boucle `requestAnimationFrame`, arrêtée au repli, panneau masqué (détecté dans la boucle) ou onglet caché ; résolution plafonnée par `LB.dpr` (`LB.DPR_COARSE_MAX` inchangée). `prefers-reduced-motion` : image fixe à l'ouverture, sans boucle.
