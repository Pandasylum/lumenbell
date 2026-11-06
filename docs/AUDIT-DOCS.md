# Audit de cohérence des documents vivants (6 novembre 2026)

Session doc seule : aucun test, aucun build. Intouchés : `BIBLE.md`, `docs/LORE.md`, `docs/CH2-SPEC.md`, `archives/`, tout texte narratif ou de design. Portée : `CLAUDE.md`, `README.md`, `ROADMAP.md`, `DECISIONS.md`, `CHANGEMENTS.md`, `CHANGELOG.md`, `DEMANDES.md`, `NOTES.md`, `docs/COMMUN.md`, `docs/GLOSSAIRE.md`, `docs/BALANCE.md`, `docs/DEVLOG-NOTES.md`, `shared/NOTES.md`, `chapters/*/NOTES.md`. Méthode : script de repérage des liens `](…)` et des chemins entre apostrophes inverses (extensions de fichier ou `dossier/…`), puis tri à la main. Les noms de branche (`engine/cine`, `menu/common`…), les chemins relatifs au dossier du chapitre (`js/…`, `page/…`, `src/parts.txt`) et `tests.yml` / `android.yml` (abrégés de `.github/workflows/`) ne sont pas des cassés. Tous les chemins `archives/…` cités existent.

## 1. Liens et chemins

| Document | Ligne | Constat | Action |
|---|---|---|---|
| `chapters/ch2-silent-bells/NOTES.md` | 8 | `src/silent-bells.html` : retiré, mais la phrase le dit déjà | à laisser |
| `docs/COMMUN.md` | 5 | `chapters/ch2-silent-bells/src/silent-bells.html` n'existe plus (les numéros `ch2:NNN` renvoient à lui) | corrigé (6 nov., renvoi reformulé : page retirée le 28 octobre) |
| `DECISIONS.md` | 62 | même fichier, entrée datée du 27 octobre (historique) | à laisser |
| `CHANGEMENTS.md` | 169 | `build/out/phare-v1/comparaison-phase3.png` et `build/out/phare-v2/comparaison-tirs.png` : `build/out/` n'est pas versionné, fichiers introuvables | corrigé (mention « non versionné » ajoutée, 6 nov.) |
| `NOTES.md` | 14, 15, 17, 25 | `build/out/*.zip`, `test.html`, `ch2-test.html` : sorties générées, absentes du dépôt par construction | à laisser |
| `docs/BALANCE.md` | 46 | `waitMin/Max` : faux positif du script | à laisser |
| autres | — | aucun lien relatif ni chemin cassé | — |

Aucun fichier déplacé : aucune correction de chemin n'était nécessaire.

## 2. Index `DECISIONS.md` ↔ `docs/decisions/`

| Document | Ligne | Constat | Action |
|---|---|---|---|
| `DECISIONS.md` | 20 | `2026-10-30-voix.md` était listé en texte brut, sans lien vers le fichier | corrigé (lien ajouté) |
| `DECISIONS.md` | 11-137 | 46 fichiers dans `docs/decisions/`, chacun cité une fois dans l'index ; aucun lien vers un fichier absent | aucun écart |

## 3. Mots périmés (documents vivants, hors historique)

Hors `archives/`, `docs/decisions/` et journaux datés (`docs/DEVLOG-NOTES.md`, index de `DECISIONS.md`). `build.py`, `build_ch2.py` et `com.emberbridge` : aucune occurrence. `store/`, `promo` : seulement des mentions de retrait.

| Document | Ligne | Constat | Action |
|---|---|---|---|
| `docs/COMMUN.md` | 82 | « Écran de démarrage » : décrit `#gate` / Commencer du Chapitre I, retiré le 5 novembre | corrigé (6 nov.) |
| `docs/COMMUN.md` | 164 | API commune cite `LB.gate.mount()` (retiré) | corrigé (6 nov.) |
| `docs/COMMUN.md` | 181, 196 | `LB.gate` dans le plan de session 6 « faite le 1er novembre » (historique) | à laisser |
| `shared/NOTES.md` | 83 | `LB.gate` : signalé « retiré le 5 novembre » | à laisser |
| `shared/NOTES.md` | 104 | `LB.gate.focus()` dans une entrée datée du 2 novembre (hub) | à laisser |
| `shared/NOTES.md` | 79 | « Commencer » = clé de texte commune encore utilisée par le hub | à laisser |
| `chapters/ch2-silent-bells/NOTES.md` | 185 | « écran de démarrage (Commencer + langues…) » présenté comme « Nouveau pour le joueur » ; périmé depuis le 5 novembre | corrigé (6 nov., phrase de retrait) |
| `chapters/ch2-silent-bells/NOTES.md` | 3, 10 | `…/legacy/silent-bells.source.html` : chemin sous `archives/`, existe | à laisser |
| `chapters/ch1-ember-bridge/NOTES.md` | 3 | « `legacy/` n'existe plus » | à laisser |
| `NOTES.md` | 15 | `archives/chapters/ch2-silent-bells/legacy/` : chemin valide | à laisser |
| `ROADMAP.md` | 16 | « Commencer », `store/`, promo : ligne « Fait » du 5 novembre | à laisser |
| `README.md` | 35 | `archives/docs/AUDIT-2026-10-30.md` : chemin valide, rangé en archive | à laisser |
| `docs/DEVLOG-NOTES.md` | 6, 95, 110, 132, 190, 192, 218, 222, 225 | « Commencer » / audit du 30 octobre : journal daté | à laisser |
| `DECISIONS.md` | 32, 125, 135, 136 | `com.lumenbell.game`, « Commencer », `store/`, `legacy/` : index d'entrées historiques | à laisser |

## 4. Règles et commandes

| Document | Ligne | Constat | Action |
|---|---|---|---|
| `docs/GLOSSAIRE.md` | 15, 20, 76, 178 | renvois `CLAUDE.md:18` (braise, règle 13), `:12` (deux langues, règle 7), `:6` (GLOSSAIRE, règle 1) : toujours exacts | aucun écart |
| `README.md` | 31 | `docs/GLOSSAIRE.md` : exact | aucun écart |
| tous | — | aucun « règle N » de `CLAUDE.md` cité ailleurs dans les documents vivants (seul renvoi : « Difficulté et chapitres », `DECISIONS.md:133`) | aucun écart |
| `CLAUDE.md` | 18-19 | règles 18 et 19 : `build_chapter.py`, `build_site.py`, `ch2-smoke`, `ch2-bot`, `visual-shots`, `trial-*`, `boss-diff-static.js` existent | aucun écart |
| `CLAUDE.md` | 15 | périmètres `shared ch2 hub` = défaut de `workflow_dispatch` dans `.github/workflows/tests.yml` | aucun écart |
| `README.md`, `NOTES.md` | — | `build_chapter.py`, `build_site.py`, `build_test.py`, `extract_texts.py`, `node smoke.js`, `npm ci` (scripts `smoke`, `bot`, `fonts` de `tests/package.json`) : tous valides | aucun écart |
| `NOTES.md` | 19, 26, 28 | décrivent la CI comme « cible » alors que `tests.yml` la met déjà en œuvre | ligne 26 corrigée (6 nov., `paths-ignore` réel) ; ligne 28 laissée : à valider, elle contredit `tests.yml` (périmètres automatiques sur PR, un seul job, pas de `trial-*` ni `visual-shots` dans le workflow) |
| `CLAUDE.md` | 18 vs 30 | `d.sp` / `RHY` / `64-prologue.js` cités ; non vérifié dans le code (hors périmètre) | à laisser |

## 5. Doublons et contradictions (liste seule)

| Documents | Constat | Action |
|---|---|---|
| `CLAUDE.md` r.10 · `NOTES.md` 19, 26, 28 · `README.md` 14 | règle des tests/CI écrite dans trois documents, formulations différentes (liste des fichiers de `tests/` complétée dans `NOTES.md:19` le 6 nov.) | à valider : copies non identiques à `CLAUDE.md` (règle 19), aucune remplacée par un renvoi |
| `CLAUDE.md` « Difficulté » · `docs/BALANCE.md` · `shared/NOTES.md` | règles de difficulté et `BOSS_DIFF` exprimées à plusieurs endroits ; contradictions : `docs/BALANCE.md:9` (durées multipliées par `f = 1/(sp×(1+.1×stage))`) et `BIBLE.md:36-39` (PV Colosse 8/10/14) contre `CLAUDE.md` (pas d'accélération par rage, PV via `LB.BOSS_DIFF`) | à valider, rien modifié |
| `CLAUDE.md` r.2 · `CHANGEMENTS.md` 25 | statuts : « Fait (PR fusionnée) » identiques ; mais le tableau contient aussi « Fait » seul, « Fait à la fusion de la PR », « Fait\t<date>\t<PR> » | à valider |
| `docs/COMMUN.md` · `shared/NOTES.md` | inventaire du cadre commun (`LB.menu`, `LB.card`, `LB.pause`…) décrit deux fois, `COMMUN.md` corrigé pour `LB.gate` (6 nov.) ; détails non identiques, aucun renvoi posé | à valider |
| `CHANGEMENTS.md` | 4 mentions « À faire » et 5 « En cours » (sections F, J, O, lignes 96, 160) pour des périmètres qui ne sont plus tous actifs | à valider |

## 6. Taille et croissance

| Document | Lignes | Constat | Action |
|---|---|---|---|
| `docs/DEVLOG-NOTES.md` | 254 | journal sans limite, +1 section par session | à valider (archivage par mois) |
| `CHANGEMENTS.md` | 214 | sections « Fait » conservées, sans archivage | à valider |
| `docs/BALANCE.md` | 237 | tables de valeurs, dupliquent le code | à laisser |
| `chapters/ch2-silent-bells/NOTES.md` | 200 | une section par passe | à valider |
| `docs/COMMUN.md` | 201 | audit initial + plan de sessions terminées | à valider |
| `docs/GLOSSAIRE.md` | 178 | stable | à laisser |
| `DECISIONS.md` | 137 | index de 46 lignes + 14 entrées historiques | à laisser |
| `shared/NOTES.md` | 108 | une section par session | à laisser |
| `chapters/ch1-ember-bridge/NOTES.md` | 94 | stable | à laisser |
| `NOTES.md` | 66 | sous la limite | à laisser |
| `README.md` / `ROADMAP.md` / `CLAUDE.md` / `CHANGELOG.md` / `DEMANDES.md` | 50 / 36 / 32 / 8 / 6 | courts | à laisser |

## Classement final

**À corriger tout de suite**
- Ligne manquante de lien dans l'index de `DECISIONS.md` (voix) : corrigé.
- Passe du 6 novembre : `docs/COMMUN.md` 5, 82, 164 ; `chapters/ch2-silent-bells/NOTES.md` 185 ; `NOTES.md` 19, 26 ; `CHANGEMENTS.md` 169 : corrigés.

**À valider**
- `NOTES.md` 28 : règle de quota décrite en « cible », en désaccord avec `tests.yml`.
- `CHANGEMENTS.md` : statuts non uniformes ; « À faire » / « En cours » résiduels (sections F, J, O).
- Doublons du § 5 (règle des tests/CI, difficulté, cadre commun).
- Croissance : `docs/DEVLOG-NOTES.md` (254) et `CHANGEMENTS.md` (214).

**À laisser**
- Occurrences historiques de « Commencer », `LB.gate`, `store/`, `legacy/` (journaux, index, entrées datées) ; abréviations `tests.yml` / `android.yml` ; sorties `build/out/` générées.
