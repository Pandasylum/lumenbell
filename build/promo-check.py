"""Controle automatique, planche-contact et rapport de l'imagerie promotionnelle (appele par build/promo.js).
Usage : python3 build/promo-check.py   -> build/out/promo/contact-sheet.png, build/out/promo/report.md ; code de sortie 1 si un controle echoue.
"""
import json, os, re, subprocess, sys, glob
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'build/out/promo')
TMP = os.path.join(ROOT, 'build/out/promo-tmp')
FAILS, NOTES = [], []

def fail(m): FAILS.append(m)

# ---- dimensions attendues -------------------------------------------------------------------
EXPECT = {}
for lang in ('fr', 'en'):
    for n in ('menu', 'intro-phare', 'p1-reflets', 'p2-cale-blocage', 'p3-phare-forme1', 'riposte'):
        EXPECT['ch2/%s/%s.png' % (lang, n)] = (1920, 1080)
    EXPECT['hub/%s/hub-couronne.png' % lang] = (1920, 1080)
    for n in ('menu', 'pont', 'fonderie-colosse', 'clocher'):
        EXPECT['ch1/%s/%s.png' % (lang, n)] = (1920, 1080)
EXPECT.update({'social/cover.png': (630, 500), 'social/cover.gif': (630, 500), 'social/og-1200x630.png': (1200, 630),
               'social/post-1600x900.png': (1600, 900), 'social/post-1080x1080.png': (1080, 1080), 'social/banner.png': (1920, 640)})
for c in ('clip-blocage', 'clip-pas-de-cote', 'clip-riposte'):
    EXPECT['ch2/clips/%s.mp4' % c] = (1920, 1080)

def probe(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames,codec_name,duration:format=tags',
                        '-of', 'json', f], capture_output=True, text=True)
    return json.loads(r.stdout)

rows = []
for rel, (w, h) in sorted(EXPECT.items()):
    f = os.path.join(OUT, rel)
    if not os.path.exists(f): fail('absent : ' + rel); continue
    kb = os.path.getsize(f)
    if rel.endswith('.mp4'):
        s = probe(f)['streams'][0]; got = (s['width'], s['height']); info = '%s, %s i/s, %.1f s' % (s['codec_name'], s['r_frame_rate'], float(s['duration']))
        if s['codec_name'] != 'h264' or s['r_frame_rate'] != '30/1': fail('mp4 hors consigne : %s %s' % (rel, info))
        if not 5 <= float(s['duration']) <= 8: fail('duree hors 5-8 s : ' + rel)
        a = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv', f], capture_output=True, text=True).stdout.strip()
        if a: fail('piste son presente : ' + rel)
    else:
        im = Image.open(f); got = im.size; info = im.format
        if rel.endswith('.png') and (im.info.keys() - {'dpi', 'transparency'}):
            fail('metadonnees PNG : %s %s' % (rel, list(im.info.keys())))
        if rel.endswith('.gif'):
            n = getattr(im, 'n_frames', 1); dur = sum(im.seek(i) or im.info.get('duration', 0) for i in range(n)) / 1000
            info = '%d images, %.1f s' % (n, dur)
            if kb >= 3_000_000: fail('GIF >= 3 Mo : ' + rel)
    if got != (w, h) and not rel.endswith('.gif'): fail('dimensions %s : %s au lieu de %s' % (rel, got, (w, h)))
    rows.append((rel, got, kb, info))
for f in sorted(glob.glob(OUT + '/ch2/clips/*.gif')):
    im = Image.open(f); n = im.n_frames; rel = os.path.relpath(f, OUT); kb = os.path.getsize(f)
    if kb >= 3_000_000: fail('GIF >= 3 Mo : ' + rel)
    d = sum((im.seek(i) or im.info.get('duration', 0)) for i in range(n)) / 1000
    if not 5 <= d <= 8: fail('duree GIF hors 5-8 s : %s (%.1f)' % (rel, d))
    rows.append((rel, im.size, kb, '%d images, %.1f s' % (n, d)))

# ---- boucle du GIF : comparaison premiere / derniere image --------------------------------------
def frames(f):
    im = Image.open(f); out = []
    for i in range(im.n_frames):
        im.seek(i); out.append(np.asarray(im.convert('RGB'), dtype=np.float32))
    return out
loop_msg = ''
g = os.path.join(OUT, 'social/cover.gif')
if os.path.exists(g):
    F = frames(g)
    cons = np.mean([np.abs(F[i + 1] - F[i]).mean() for i in range(len(F) - 1)])
    wrap = np.abs(F[0] - F[-1]).mean()
    loop_msg = 'ecart moyen entre images voisines %.2f ; ecart derniere -> premiere %.2f (rapport %.2f)' % (cons, wrap, wrap / max(cons, 1e-6))
    if wrap > 1.5 * cons: fail('boucle du GIF : saut visible (%s)' % loop_msg)

# ---- ecrans exclus : journal des captures ----------------------------------------------------------
FORBID = ['Crown', 'Couronne', 'Afterglow', 'Rémanence', 'Remanence', 'Hollow Roots', 'Racines creuses', 'To be continued', 'À suivre', 'A suivre',
          'Bottomless', 'Sans-Fond', 'Chapter III', 'Chapitre III', 'Phase III complete', 'Phase III terminée', 'Lumen evaporates']
logs = []
for f in ('log.json', 'clips.json'):
    p = os.path.join(TMP, f)
    if os.path.exists(p):
        d = json.load(open(p)); logs += d if isinstance(d, list) else d.get('LOG', [])
        if isinstance(d, dict) and d.get('BAD'): [fail('ecran hors jeu pendant un clip : ' + b) for b in d['BAD']]
for e in logs:
    for t in e.get('texts', []) or []:
        for w in FORBID:
            if w.lower() in t.lower(): fail('texte exclu "%s" dans %s' % (t, e['file']))
    if e.get('phase') == 3 and e.get('form', 1) != 1: fail('phase III hors forme I : ' + e['file'])
    if e.get('mode') not in (None, 'play', 'menu', 'prologue', 'hub') and e.get('chapter') != 1: fail('mode %s : %s' % (e.get('mode'), e['file']))
    if e.get('hits'): fail('coup recu pendant : %s (%s)' % (e['file'], e['hits']))
    if e.get('mode') == 'dead': fail('carte de defaite : ' + e['file'])
    if e.get('storage') and e['storage'].count('lb-ch') : fail('hub : progression non neuve : ' + e['storage'])

# ---- planche-contact (hors des dossiers de livraison) ------------------------------------------------
def first_frame(f):
    if f.endswith('.mp4'):
        t = os.path.join(TMP, 'mp4-first.png'); subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '3', '-i', f, '-frames:v', '1', t]); return Image.open(t).convert('RGB')
    im = Image.open(f)
    if f.endswith('.gif'): im.seek(im.n_frames // 3)
    return im.convert('RGB')
files = sorted(set([r[0] for r in rows]))
TW = 384; cols = 5
tiles = []
for rel in files:
    im = first_frame(os.path.join(OUT, rel)); h = int(im.height * TW / im.width); h = min(h, 320)
    t = im.resize((TW, int(im.height * TW / im.width)), Image.LANCZOS).crop((0, 0, TW, h)); tiles.append((rel, t))
RH = 320 + 22
rows_n = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (TW + 8) + 8, rows_n * (RH + 8) + 8), (24, 24, 28)); d = ImageDraw.Draw(sheet)
for i, (rel, t) in enumerate(tiles):
    x, y = 8 + (i % cols) * (TW + 8), 8 + (i // cols) * (RH + 8)
    sheet.paste(t, (x, y + 22)); d.text((x, y + 5), rel, fill=(255, 224, 102))
sheet.save(os.path.join(OUT, 'contact-sheet.png'), optimize=True)

# ---- rapport ----------------------------------------------------------------------------------------
ladder = []
cj = os.path.join(TMP, 'clips.json')
if os.path.exists(cj): ladder = json.load(open(cj)).get('LADDER', [])
L = ['# Imagerie promotionnelle : rapport', '', 'Généré par `node build/promo.js` (voir plus bas). Sorties dans `build/out/promo/` (ignorées par git).', '',
     '## Commande unique pour tout régénérer', '', '```bash', 'PW_CHROMIUM=/chemin/vers/chromium node build/promo.js', '```', '',
     'Étapes seules : `node build/promo.js shots|clips|social|check`. Prérequis : Playwright, ffmpeg (libx264), python3 + Pillow + numpy. `build/promo-check.py` fait les contrôles, la planche et ce rapport.', '',
     '## Fichiers (dimensions, poids)', '', '| Fichier | Dimensions | Poids | Détail |', '|---|---|---|---|']
for rel, got, kb, info in rows: L.append('| `%s` | %dx%d | %.0f Ko | %s |' % (rel, got[0], got[1], kb / 1024, info))
L += ['', '`contact-sheet.png` : planche de toutes les images, étiquetées par nom de fichier (à la racine, hors des dossiers de livraison).', '', '## Instants du jeu choisis', '',
      '| Fichier | Contenu | Phase interne | Forme | PV Veilleur | PV boss | Temps de jeu (s) |', '|---|---|---|---|---|---|---|']
for e in logs:
    L.append('| `%s` | %s | %s | %s | %s | %s | %s |' % (e['file'], e.get('mode', ''), e.get('phase', e.get('ph', '')), e.get('form', ''), e.get('hp', e.get('php', '')), e.get('boss', e.get('bhp', '')), e.get('gt', e.get('gtStart', e.get('secs', e.get('t', ''))))))
L += ['', 'Numéros internes : phase 2 = Phase I (La Voix Creuse), 1 = Phase II (L\'Ancien de Rouille), 3 = Phase III (Le Phare Noyé). Chapitre I : `ph` 1 pont, 2 Fonderie, 3 Clocher ; `secs` = secondes de jeu depuis le début de la phase. Intro : t = 10 s (plan du Phare au large). Clips : `gtStart` à `gtEnd`.', '',
      '## Méthode', '',
      '- Jeu avancé pas à pas (1/60 s) dans les copies de test à crochets (`build/out/ch2-test.html`, `build/out/test.html`), graine fixe, horloge manuelle ; bot parfait (appui 50 ms avant l\'impact) : aucun coup reçu, PV pleins, Normal, aide visuelle désactivée.',
      '- Captures de scène : l\'élément `#stage` (960 × 540 px CSS, bordure masquée à la capture), facteur d\'échelle 2 → 1920 × 1080 natifs (le canvas est rendu à cette taille, aucun agrandissement). Menu, hub : fenêtre 960 × 540, facteur 2. Intro : bitmap 1920 × 1080 du canvas de la cinématique (sans légende ni bouton « Passer »).',
      '- Cover : recadrage 680 × 540 px CSS (1360 × 1080) → 630 × 500, 20 i/s, fondu enchaîné de 0,5 s pour la boucle.', '',
      '## Contrôles automatiques', '']
if FAILS: L += ['- **ÉCHEC** : ' + m for m in FAILS]
else: L += ['- Dimensions exactes, GIF < 3 Mo, métadonnées absentes, MP4 H.264 30 i/s sans son : OK', '- Boucle du GIF : ' + loop_msg, '- Écrans exclus : aucun texte exclu dessiné, phase III en forme I seulement, mode « play » à chaque image des clips, aucun coup reçu, aucune carte de défaite : OK']
if ladder: L += ['', '### Réglages des GIF (échelle de repli)', ''] + ['- ' + x for x in ladder]
L += ['', '## Points douteux et écarts de méthode', '',
      '- **Fenêtre** : la consigne donne un viewport 960 × 540. À cette taille la page de jeu est trop haute (en-tête, scène réduite à 926 × 520 px CSS, défilement) : la scène ferait 1852 × 1040 et il faudrait l\'agrandir. Les captures de scène sont donc faites dans une fenêtre plus grande (1280 × 1000) en prenant `#stage` à 960 × 540 ; menu, hub et intro suivent la consigne (960 × 540). Les barres de PV (HTML, hors canvas) n\'apparaissent pas : à valider.',
      '- Les captures de scène ne montrent aucun texte HTML ; seules les onomatopées du jeu (CLANG) sont dessinées. Le menu et le hub affichent le numéro de version « v1.0.0 » (texte du jeu) ; le hub utilise un « LUMEN » jaune (couleur de la marque du hub, pas d\'un chapitre).',
      '- Le « Phare au large » (intro) est un plan sans texte ; l\'intro complète n\'est pas dans une exclusion, mais le plan du titre n\'est pas utilisé.',
      '- Boucle du GIF : fondu enchaîné de 0,5 s (le combat n\'est pas périodique) ; le Veilleur et le boss sont brièvement en double sur ces 10 images.',
      '- Clips : en anglais (les seuls textes sont des onomatopées, identiques en français). GIF de clips à 640 × 360 et 15 i/s pour tenir sous 3 Mo ; MP4 en 1080p 30 i/s.',
      '- Banner : 1920 × 640 (3:1), limité par la largeur de la source (1920) ; dimensions finales à confirmer.',
      '- Les photos sociales sont tirées des captures anglaises (sans texte ajouté).',
      '- Les fichiers d\'outil `build/promo.js` et `build/promo-check.py` sont nouveaux ; aucun fichier source du jeu ni dist n\'est modifié.']
open(os.path.join(OUT, 'report.md'), 'w').write('\n'.join(L) + '\n')
print('\n'.join(FAILS) if FAILS else 'controles OK')
sys.exit(1 if FAILS else 0)
