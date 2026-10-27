"""Construit le jeu du Chapitre I : morceaux de src/ (voir src/parts.txt) -> dist/index.html (+ zip itch.io).
Usage : python3 build/build.py
Sortie : chapters/ch1-ember-bridge/dist/index.html, build/out/ember-bridge-itch.zip
"""
import re, sys, zipfile
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from assemble import source
ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "chapters/ch1-ember-bridge/dist/index.html"
OUT = ROOT / "build/out"
s = source()
assert not s.lstrip().lower().startswith("<!doctype")
# meta retiree (propre a l'hebergeur d'artefacts)
s = s.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
# polices integrees (hors connexion) a la place de Google Fonts
s, n = re.subn(r'<link rel="preconnect"[^>]*>\s*|<link href="https://fonts\.googleapis\.com[^>]*>\s*', "", s)
assert n == 3, n
s = s.replace("<style>", "<style>\n" + (ROOT / "build/fonts.css").read_text(encoding="utf-8") + "\n", 1)
i = s.index("</style>") + len("</style>")
head = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
extra = '\n<style>html{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>'
doc = head + s[:i] + extra + "\n</head>\n<body>\n" + s[i:].lstrip("\n") + "\n</body>\n</html>\n"
DIST.parent.mkdir(parents=True, exist_ok=True)
DIST.write_text(doc, encoding="utf-8")
OUT.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUT / "ember-bridge-itch.zip", "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("index.html", doc)
print("OK", len(doc), "octets ->", DIST)
