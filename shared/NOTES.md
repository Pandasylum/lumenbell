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
| `js/12-audio.js` | `LB.audio` : contexte unique, `tone`, `noise`, réglages Son / Musique, suspension en arrière-plan |

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

## Audio (`LB.audio`)
- **Un seul `AudioContext`** pour la série (`LB.audio.ctx`, créé par `ensure()` au premier geste ou au premier son, recréé s'il est fermé). Chaîne : sources → bus `sfx` / `mus` → `master` → sortie. `LB.audio.dest` = sortie brute, pour une musique qui a sa propre chaîne (Chapitre II : `MUSIC`, avec compresseur et réverbération).
- **Niveaux par chapitre** : `LB.setup({…, audio:{master,sfx,mus}})`, 1 par défaut (Chapitre I : défauts ; Chapitre II : `.75`, `.9`, `.3`, ses anciens `M`, `SG`, `MG`). Son coupé → bus `sfx` à 0 ; Musique coupée → bus `mus` à 0.
- `tone(f,dur,type,vol,dest,when,f2,o)` et `noise(dur,vol,filtre,f,q,dest,when,f2,o)` : **signature du Chapitre II** (`dest` vide = bus `sfx`, `when` = date du contexte). `o={atk,end,tail}` règle l'enveloppe : défaut = Chapitre II ; le Chapitre I garde la sienne (`atk:0,end:.0001,tail:0` pour `tone` ; attaque `min(.03,d/3)` pour `noise`) dans ses petites fonctions `tone(f,d,type,v,slide)` / `noise(d,v,f0,f1)`, pour que les sons ne changent pas. Un son sans `dest` ne joue pas si Son est coupé.
- **Réglages** : `LB.audio.sound` / `music` lus par `LB.store` (`lb-snd`, `lb-mus`, avec migration des anciennes) à `LB.setup` ; `setSound(on)` / `setMusic(on)` les écrivent, règlent les bus et relancent le contexte. Les cases des chapitres n'appellent que ces deux fonctions.
- **Arrière-plan** : `visibilitychange`, `pagehide` / `pageshow`, `blur` / `focus` (si l'onglet est caché) suspendent puis relancent le contexte ; tant que la page est en arrière-plan, ni un son ni un geste ne le relance. Premier geste (`click`, `pointerup`, `mousedown`, `touchend`, `keydown`) : crée / relance le contexte et joue un son muet d'amorçage (déverrouillage iOS), comme avant au Chapitre I (le Chapitre II ne le faisait qu'au clic de « Jouer »).
- Si la page est visible, `ensure()` remet le drapeau d'arrière-plan à faux (un événement de retour perdu ne doit pas laisser le son coupé). Contexte créé avec `latencyHint:'playback'` (`interactive` craquait sur téléphone).
- `LB.audio.now()`, `.state`, `.bg`, `.stat` (compteurs `tone`, `noise`, `made`, pour les tests).
- Les chapitres n'ont plus ni `AudioContext` ni `.destination` (contrôlé par `tests/audio.js`).

## Tests
- `tests/audio.js` (CI) : contexte unique sur les deux `dist` et sur les copies de test, suspension / reprise (onglet caché, `pagehide` / `pageshow`, focus en arrière-plan), bruitages par `LB.audio.tone` / `noise`, musiques sur le contexte commun, réglages `lb-snd` / `lb-mus` relus ; `errs []` attendu.
- `tests/keys.js` (CI) : clés communes et migration sur les deux `dist`, langue par défaut, clés `eb-…` du Chapitre I, aide mémorisée, écriture dans les seules `lb-…`, choix vu d'un chapitre à l'autre.
- `tests/visual-shots.js` : captures déterministes des deux chapitres, comparaison au pixel (voir `NOTES.md` racine).

## À venir (plan de `docs/COMMUN.md` § 4)
`LB.hero` et `HERO_T` (3), `LB.drawWatcher` (4), `LB.cine` et `LB.title` (5), menu, HUD, cartes, entrées (6).
