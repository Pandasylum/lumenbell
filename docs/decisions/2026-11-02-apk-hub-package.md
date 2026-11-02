# 2026-11-02 · Hub APK, site unique et package Android

Décision de Kevin du 2 novembre 2026. Session documentation seule : rien n'est codé ici. Application prévue en session `menu/crown`.

## Package Android
- `com.emberbridge.game` devient `com.lumenbell.game`.
- Le keystore ne change pas (aucune clé dans le dépôt).
- L'appli est distincte des installations précédentes : elle ne remplace pas l'APK Ember Bridge.

## Structure unique web + APK
- Dossier `site/` :
  - `site/index.html` : le hub (la Couronne). Écran de démarrage, puis choix du chapitre.
  - `site/ch1/index.html`, `site/ch2/index.html`, un dossier par chapitre à venir.
- Chaque chapitre reste un fichier autonome, `shared/` inliné.
- Workflow Android : copie `site/` entier dans `www` (plus de chemin fixe vers un chapitre).
- itch.io : reçoit le même `site/` en un zip.

## Ordre et déblocage
- Ordre : écran de démarrage, puis Couronne, puis menu du chapitre.
- Déblocage : chaque chapitre exige la vraie fin du précédent (clés `lb-…`).

## Son et geste
- Un seul bouton « Commencer », au niveau du hub. Il débloque le son et lance une musique dédiée au hub, synthétisée via `LB.audio` comme le reste.
- Les chapitres n'ont plus d'écran de démarrage quand on y arrive depuis le hub : le drapeau « geste déjà fait » est transmis à la navigation. Ils gardent cet écran seulement quand on les ouvre seuls (lien direct, tests).
- APK : WebView Capacitor réglée pour autoriser la lecture sans geste.
- Web : si le navigateur bloque l'audio après la navigation, repli sans bouton supplémentaire : la musique du chapitre démarre au premier appui (menu ou difficulté).
- Retour au hub depuis un chapitre : la musique du hub repart, sans nouvel écran.
- Premier essai sans bouton « Commencer » propre au chapitre. Kevin avisera si la musique ne part pas.

## À vérifier sur téléphone (premier APK hub)
- Le son démarre-t-il après le passage hub → chapitre ?
- Repli si non : WebView sans geste requis (déjà prévu côté APK), ou bouton « Commencer » propre au chapitre.
- La musique du hub part-elle au premier bouton et repart-elle au retour depuis un chapitre ?

## Application (session `menu/crown`)
- Hub `site/index.html`, script de build de `site/`, workflow Android, renommage du package en une seule fois.
