# 2026-11-02 · Package Android appliqué (`apk/hub-package`)

Application de `2026-11-02-apk-hub-package.md`, côté workflow et config uniquement. Aucun fichier de jeu, chapitre ou `shared/` modifié.

## Ce qui a changé

- `apk/capacitor.config.json` : `appId` = `com.lumenbell.game`, `appName` = « LumenBell ». Le projet Android est généré en CI (`cap add android`) : applicationId, manifeste et package de `MainActivity` en découlent. Une étape vérifie qu'il ne reste aucune trace de `emberbridge`.
- Keystore, alias, Secrets : inchangés.
- Workflow : reconstruit `build.py`, `build_ch2.py`, `build_site.py`, puis copie `site/` entier dans `www` (sans `site/src` ni `NOTES.md`). Plus de chemin fixe vers un chapitre. CSP et minification passent sur toutes les pages HTML de `www`.
- WebView : `MainActivity` règle `setMediaPlaybackRequiresUserGesture(false)` et `setDomStorageEnabled(true)` (localStorage). Les pages se chargent en relatif (`ch1/index.html`, retour `../index.html`) : aucun chemin absolu trouvé.
- itch.io : le workflow publie `build/out/lumenbell-site.zip` comme artefact `lumenbell-itch`. Les anciens zips (`ember-bridge-itch.zip`, `silent-bells-itch.zip`) restent produits par leurs scripts, non supprimés.

## Récupérer les fichiers

Artefacts du run « Build Android » : `lumenbell-android` (Lumenbell.apk, Lumenbell.aab) et `lumenbell-itch`.

## À vérifier sur téléphone

- Désinstaller l'ancien APK, ou installer le nouveau à côté (appli distincte, progression non reprise).
- Musique du hub au démarrage, puis du chapitre après le hub, et retour au hub.
- Progression conservée entre deux lancements (localStorage), nom « LumenBell » sous l'icône.
- Non vérifié en local : build Android (non lancé, comme demandé). Seul `build_site.py` a été exécuté (3 fichiers assemblés).
