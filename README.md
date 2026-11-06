# Lumenbell

Série de combats de boss à un seul bouton en HTML5 canvas (960 × 540) : le Veilleur, sa lanterne, des créatures plus grandes que lui. Sorties : itch.io (zip HTML5) et Android (APK/AAB via Capacitor).

- **Chapitre I – Ember Bridge** : v1.0, terminé. `chapters/ch1-ember-bridge/`
- **Chapitre II – Silent Bells** : importé, en cours d'harmonisation (voir `ROADMAP.md`). `chapters/ch2-silent-bells/`

## Démarrage rapide

```bash
python3 build/build_chapter.py ch1-ember-bridge # construit chapters/ch1-ember-bridge/dist/index.html + build/out/ember-bridge-itch.zip
python3 build/build_test.py     # construit build/out/test.html (avec les crochets window.__t)
cd tests && npm install && npx playwright install chromium
node smoke.js                   # 3 phases x 3 difficultés, doit afficher "errs []"
```

Variable `PW_CHROMIUM` : chemin d'un Chromium déjà installé (sinon celui de Playwright).

## Où est quoi

| Dossier / fichier | Rôle |
|---|---|
| `CLAUDE.md` | Consignes lues automatiquement par Claude Code |
| `BIBLE.md` | Ce qui ne change pas (univers, héros, règles, ton) |
| `NOTES.md` | Règles de travail, outillage, pièges connus (un `NOTES.md` par chapitre et par dossier : `chapters/*/`, `shared/`) |
| `DECISIONS.md` | Décisions de design en vigueur (une ligne par sujet) |
| `DEMANDES.md` | Ce qu'un chapitre demande au moteur/héros |
| `CHANGEMENTS.md` | Ce qu'il faut apporter comme modification au chapitre I et II pour rendre cohérent avec le lore |
| `ROADMAP.md`, `CHANGELOG.md` | Suite prévue, versions |
| `docs/LORE.md` | Lore et arc long terme (secret, vocabulaire) |
| `docs/GLOSSAIRE.md` | Vocabulaire et termes officiels |
| `docs/CH2-SPEC.md` | Cahier des charges du Chapitre II (lu par les tests) |
| `docs/COMMUN.md` | Éléments communs entre chapitres : inventaire restant, API commune, plan des sessions moteur |
| `docs/decisions/` | Décisions détaillées datées (une par fichier) |
| `archives/docs/AUDIT-2026-10-30.md` | Audit de la documentation (30 octobre 2026) |
| `docs/DEVLOG-NOTES.md` | Notes de communication : ce que le joueur verra |
| `docs/TEXTES-CH1.md` | Tous les textes FR/EN du Chapitre I (extrait auto) |
| `chapters/ch2-silent-bells/` | Chapitre II : `src/`, `dist/`, `TEXTES.md` (textes validés, testés), `NOTES.md` |
| `shared/` | Code commun aux chapitres (`LB.*` : langue, clés, audio), collé à la ligne `@shared` ; voir `shared/NOTES.md` |
| `archives/` | Texte intégral des entrées archivées (décisions, demandes fermées, inventaire commun) ; ne se lit que sur demande |
| `chapters/ch1-ember-bridge/src/` | Source découpée (ordre d'assemblage : `src/parts.txt`) |
| `chapters/ch1-ember-bridge/dist/` | Jeu construit (référence v1.0) |
| `build/` | Scripts de construction |
| `tests/` | Bots et tests (Playwright) |
| `apk/` | Projet Capacitor (Android) |
| `.github/workflows/` | `tests.yml` (tests) et `android.yml` (APK/AAB) |

## Secrets (jamais dans le dépôt)

GitHub → Settings → Secrets and variables → Actions : `KEYSTORE_B64` (keystore en base64, une ligne) et `KEY_PASS`. Alias de clé : `ember`.
