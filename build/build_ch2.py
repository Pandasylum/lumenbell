"""Construit le jeu du Chapitre II (Silent Bells).
Usage : python3 build/build_ch2.py
Entree : chapters/ch2-silent-bells/src/silent-bells.html (legacy/silent-bells.source.html = import d'origine, fige)
Sortie : chapters/ch2-silent-bells/dist/index.html, build/out/silent-bells-itch.zip
Seuls ecarts avec la source (voir chapters/ch2-silent-bells/NOTES.md) : meta propre a l'hebergeur
d'artefacts retiree, polices Google remplacees par build/fonts.css inlinees.
"""
import sys, zipfile
from pathlib import Path
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "chapters/ch2-silent-bells/src/silent-bells.html"
DIST = ROOT / "chapters/ch2-silent-bells/dist/index.html"
OUT = ROOT / "build/out"

def cut(s, old, new):
    """Remplace old par new, en exigeant une occurrence unique (la source ne doit pas avoir bouge)."""
    assert s.count(old) == 1, (s.count(old), old[:80])
    return s.replace(old, new)

s = SRC.read_text(encoding="utf-8")
assert s.startswith("<!doctype html>\n<html lang=\"fr\">\n<head>\n")
# meta retiree (propre a l'hebergeur d'artefacts, sans effet ailleurs)
s = cut(s, '<meta name="claude:viewport-fit-sides" content="cover">\n', "")
# polices integrees (hors connexion) a la place de Google Fonts
s = cut(s, '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
           '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
           '<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800'
           '&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">\n', "")
fonts = (ROOT / "build/fonts.css").read_text(encoding="utf-8")
s = cut(s, "<title>Silent Bells</title>\n<style>\n", "<title>Silent Bells</title>\n<style>\n" + fonts + "\n")
assert "fonts.googleapis" not in s and "fonts.gstatic" not in s
assert s.count("<script>") == 1 and s.count("</script>") == 1
DIST.parent.mkdir(parents=True, exist_ok=True)
DIST.write_text(s, encoding="utf-8")
OUT.mkdir(parents=True, exist_ok=True)
# date fixe : le zip est identique d'un build a l'autre
info = zipfile.ZipInfo("index.html", date_time=(1980, 1, 1, 0, 0, 0))
info.compress_type = zipfile.ZIP_DEFLATED
info.external_attr = 0o644 << 16
with zipfile.ZipFile(OUT / "silent-bells-itch.zip", "w") as z:
    z.writestr(info, s)
print("OK", len(s.encode("utf-8")), "octets ->", DIST)
