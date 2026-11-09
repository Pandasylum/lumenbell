"""Assemble le site complet du jeu (web, itch.io, APK) : le hub et les chapitres, chacun autonome.
Usage : python3 build/build_site.py   (lance build_chapter.py de chaque chapitre, puis recopie leurs sorties intermediaires tel quel)
Entree : site/src/ (morceaux du hub, ordre : site/src/parts.txt, '@shared' = shared/parts.txt, comme un chapitre),
         build/fonts.css (polices inlinees), build/out/chapters/<chapitre>/index.html (intermediaire, ignore par git)
Sortie : site/index.html (hub), site/ch1/index.html, site/ch2/index.html, build/out/lumenbell-site.zip (sans site/src)
Reproductible : meme entree, memes octets (zip a date fixe) ; l'empreinte du site est affichee a la fin.
Un chapitre de plus : une ligne dans CHAPTERS (et son entree dans HUB_CH, site/src/js/10-hub.js).
"""
import hashlib, re, sys, zipfile
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from strip import strip_page
from build_chapter import build as build_chapter
from assemble import ROOT, _listed, _read, _svg, _no_stray, shared_parts, gate_expand
SITE = ROOT / "site"
SRC = SITE / "src"
OUT = ROOT / "build/out"
# dossier du site -> id du chapitre (build_chapter.build le construit en intermediaire)
CHAPTERS = [("ch1", "ch1-ember-bridge"), ("ch2", "ch2-silent-bells")]

def hub_source():
    out, own = [], set()
    for line, p in _listed(SRC):
        if line == "@shared":
            out += shared_parts()
            continue
        o = _read(p, line)
        out.append((o[0], _svg(o[1], o[0])))
        own.add(o[0])
    _no_stray(SRC, own)
    # ecran de demarrage : regles de shared/css/gate.css ; le halo du bouton lit --lanternRgb (posee ci-dessous depuis LB.WATCHER_T)
    return "".join(t for _, t in gate_expand(out, rgb="var(--lanternRgb)"))

s = hub_source()
assert s.startswith("<!doctype html>\n<html lang=\"en\">\n<head>\n")
assert s.count("<style>\n") == 1 and s.count("<script>") == 1 and s.count("</script>") == 2  # le jeu + le petit script de langue <script id="fpLang"> (premier rendu)
assert "fonts.googleapis" not in s and "fonts.gstatic" not in s
# couleur de la lanterne pour le premier rendu : lue dans la table (une seule source), jamais ecrite en dur dans le CSS
_lt = re.search(r"lantern:\{idle:'(#[0-9a-fA-F]{6})'", (ROOT / "shared/js/20-watcher.js").read_text(encoding="utf-8")).group(1)
s = s.replace("__LANTERN_RGB__", ",".join(str(int(_lt[i:i + 2], 16)) for i in (1, 3, 5))).replace("__LANTERN__", _lt)
assert "__LANTERN" not in s
s = s.replace("<style>\n", "<style>\n" + (ROOT / "build/fonts.css").read_text(encoding="utf-8") + "\n", 1)
low = s.lower()
assert "couronne" not in low and "crown" not in low, "nom secret du lore dans le hub"
s = strip_page(s)  # commentaires JS/CSS/HTML retires de la sortie (les sources gardent les leurs)
files = {"index.html": s}
for d, cid in CHAPTERS:
    files[d + "/index.html"] = build_chapter(cid).read_text(encoding="utf-8")
for rel, text in files.items():
    f = SITE / rel
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(text, encoding="utf-8")
OUT.mkdir(parents=True, exist_ok=True)
h = hashlib.sha256()
with zipfile.ZipFile(OUT / "lumenbell-site.zip", "w") as z:
    for rel in sorted(files):
        b = files[rel].encode("utf-8")
        h.update(rel.encode() + b"\0" + b + b"\0")
        info = zipfile.ZipInfo(rel, date_time=(1980, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info, b)
print("OK", len(files), "fichiers ->", SITE, "| empreinte", h.hexdigest())
