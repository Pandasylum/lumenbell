# Commun à la série (notes du dossier)

- **Créé** le 28 octobre 2026 (session `engine/shared`, première du plan de `docs/COMMUN.md` § 4).
- **Principe** : pas de modules JS. Les morceaux de `shared/js/`, dans l'ordre de `shared/parts.txt`, sont collés par `build/assemble.py` à la ligne `@shared` du `src/parts.txt` de chaque chapitre, c'est-à-dire **dans l'IIFE du chapitre**, juste après son ouverture (`js/00-open.js`). Un seul nom ajouté à la portée du chapitre : `LB`.
- Le chapitre appelle `LB.setup({…})` en tête (`js/00-core.js` au Chapitre I, `js/02-core.js` au Chapitre II), **avant toute lecture de clé ou de texte**.
- Un changement ici change les deux `dist` : reconstruire les deux (`build/build.py`, `build/build_ch2.py`), tests des deux chapitres, comparaison d'images (`tests/visual-shots.js`).

## Contenu
| Fichier | Contenu |
|---|---|
| `js/00-lb.js` | `const LB={}` ; `LB.FONT` (`display` : Big Shoulders Display, `body` : DM Sans, piles de repli des canvas) |
| `js/04-store.js` | `LB.COMMON`, `LB.OLD_KEYS`, `LB.key(nom)`, `LB.store.get(clé, défaut)` / `LB.store.set(clé, valeur)`, `LB.setup({id, old, oldPrefix})` |
| `js/08-lang.js` | `LB.LANGS` (ordre des boutons : EN, FR), `LB.lang.cur`, `LB.lang.init()`, `LB.lang.set(l)`, `LB._(en, fr)` |

## Clés de sauvegarde
- `LB.key('lang'|'snd'|'mus'|'help')` → `lb-lang`, `lb-snd`, `lb-mus`, `lb-help` (communes à la série) ; tout autre nom → `lb-<id>-<nom>` (`lb-ch1-intro`, `lb-ch2-unl`…).
- Lecture : la nouvelle clé, sinon les anciennes dans l'ordre : `LB.OLD_KEYS` (communes : `lb-lang` ← `pn-lang`, `eb-lang` ; `lb-snd` ← `db-optSnd` ; `lb-mus` ← `db-optMus` ; `lb-help` ← `db-optHelp`), puis `old` du chapitre, puis `oldPrefix` du chapitre ; la première trouvée est recopiée dans la nouvelle. **Les anciennes clés ne sont jamais effacées ni écrites.**
- `LB.setup` migre au démarrage toutes les clés connues (et chaque ancienne clé à préfixe présente), puis fixe la langue.

| Chapitre | `id` | `old` | `oldPrefix` |
|---|---|---|---|
| I | `ch1` | `lb-ch1-intro` ← `eb-intro`, `lb-ch1-end` ← `eb-end` | `lb-ch1-best-` ← `eb-best-` |
| II | `ch2` | `lb-ch2-unl` ← `db-unl` | `lb-ch2-best-` ← `db-best-` |

## Langue
- Choix mémorisé (`lb-lang`) prioritaire, sinon la langue de l'appareil (`navigator.languages[0]` commençant par « fr » → français), sinon anglais. Décision du 28 octobre (ex-Chapitre II : français par défaut).
- Le chapitre lit `LB.lang.cur` et appelle `LB.lang.set(l)` au clic d'un bouton de langue, puis son propre `applyLang()`. `const _=LB._;` en tête du chapitre.

## Tests
- `tests/keys.js` (CI) : clés communes et migration sur les deux `dist`, langue par défaut, clés `eb-…` du Chapitre I, aide mémorisée, écriture dans les seules `lb-…`, choix vu d'un chapitre à l'autre.
- `tests/visual-shots.js` : captures déterministes des deux chapitres, comparaison au pixel (voir `NOTES.md` racine).

## À venir (plan de `docs/COMMUN.md` § 4)
`LB.audio` (session 2), `LB.hero` et `HERO_T` (3), `LB.drawWatcher` (4), `LB.cine` et `LB.title` (5), menu, HUD, cartes, entrées (6).
