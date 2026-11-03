# 2026-11-02 · Package Android, hub unique web + APK, ordre et déblocage

Décision de Kevin du 2 novembre 2026. Rien n'est codé ici : l'application se fait en session `menu/crown` (hub, script de build `site/`, workflow Android, renommage du package en une seule fois).

## 1. Package Android

- Le package passe de `com.emberbridge.game` à `com.lumenbell.game`.
- Le keystore ne change pas (même signature).
- C'est une appli distincte des installations précédentes : elle ne remplace pas l'ancien APK sur les téléphones.

## 2. Structure unique web + APK

- Un dossier `site/` contient tout le jeu :
  - `site/index.html` : le hub (la Couronne), avec l'écran de démarrage puis le choix du chapitre ;
  - `site/ch1/index.html` : Chapitre I ;
  - `site/ch2/index.html` : Chapitre II ;
  - un dossier par chapitre à venir.
- Chaque chapitre reste un fichier autonome (`shared/` inliné dedans).
- Le workflow Android copie `site/` entier dans `www` : plus de chemin fixe vers un chapitre.
- itch.io reçoit le même `site/` en un zip.

## 3. Ordre et déblocage

- Ordre des écrans : écran de démarrage, puis la Couronne (hub), puis le menu du chapitre.
- Déblocage : chaque chapitre exige la vraie fin du précédent (clés `lb-…`, déjà utilisées par `shared/`).

## 4. Son et musique

- Un seul bouton « Commencer », au niveau du hub. Il débloque le son et lance une musique dédiée au hub, synthétisée via `LB.audio` comme le reste.
- Les chapitres n'ont plus d'écran de démarrage quand on y arrive depuis le hub : le drapeau « geste déjà fait » est transmis à la navigation.
- Les chapitres ne gardent leur écran de démarrage que lorsqu'ils sont ouverts seuls (lien direct, tests).
- APK : la WebView Capacitor est réglée pour autoriser la lecture sans geste.
- Web, repli : si le navigateur bloque l'audio après la navigation, pas de bouton supplémentaire ; la musique du chapitre démarre au premier appui (menu / difficulté).
- Retour au hub depuis un chapitre : la musique du hub repart, sans nouvel écran.
- Test d'abord sans bouton « Commencer » de chapitre. Kevin avisera si la musique ne part pas.

## À vérifier sur téléphone

- Démarrage du son après le passage hub → chapitre. Repli si ça ne part pas : WebView sans geste requis (déjà prévu côté APK), ou bouton « Commencer » propre au chapitre.
- Premier APK hub : vérifier la musique du hub et son retour après un chapitre.

## Suivi

- `ROADMAP.md`, section Fait : hub = `site/`, musique dédiée du hub.
- `ROADMAP.md`, renommage LumenBell : « nom de package Android » tranché (`com.lumenbell.game`, appliqué en session `menu/crown`).
