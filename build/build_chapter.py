"""Construit le jeu d'un chapitre : morceaux de src/ (ordre : src/parts.txt, via assemble.py) -> build/out/chapters/<id>/index.html (intermediaire, hors git ; consomme par build_site.py) + zip itch.io.
Usage : python3 build/build_chapter.py <id>      ex. ch1-ember-bridge, ch2-silent-bells (dossier de chapters/)
Parametres : chapters/<id>/chapter.json = {id, title, dist, zip} (chemins relatifs a la racine).
Ecarts avec la source : meta propre a l'hebergeur d'artefacts retiree, polices Google remplacees par build/fonts.css inlinees,
commentaires JS/CSS/HTML retires de la sortie (build/strip.py ; les sources gardent les leurs).
"""
import json, re, sys, zipfile
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from assemble import source, chapters
from strip import strip_page
ROOT = Path(__file__).resolve().parent.parent


def cut(s, old, new):
    """Remplace old par new, en exigeant une occurrence unique (la source ne doit pas avoir bouge)."""
    assert s.count(old) == 1, (s.count(old), old[:80])
    return s.replace(old, new)


def build(cid):
    assert cid in chapters(), f"chapitre inconnu '{cid}' (connus : {chapters()})"
    cfg = json.loads((ROOT / "chapters" / cid / "chapter.json").read_text(encoding="utf-8"))
    assert cfg["id"] == cid, cfg
    dist, zpath, title = ROOT / cfg["dist"], ROOT / cfg["zip"], cfg["title"]
    fonts = (ROOT / "build/fonts.css").read_text(encoding="utf-8")
    s = source(cid)
    # meta retiree (propre a l'hebergeur d'artefacts, sans effet ailleurs)
    s = cut(s, '<meta name="claude:viewport-fit-sides" content="cover">\n', "")
    # polices integrees (hors connexion) a la place de Google Fonts
    s, n = re.subn(r'<link rel="preconnect"[^>]*>\s*|<link href="https://fonts\.googleapis\.com[^>]*>\s*', "", s)
    assert n == 3, n
    if s.startswith("<!doctype html>"):      # page complete (Chapitre II) : le <style> suit le <title>
        s = cut(s, f"<title>{title}</title>\n<style>\n", f"<title>{title}</title>\n<style>\n" + fonts + "\n")
        assert s.count("<script>") == 1 and s.count("</script>") == 1  # le jeu seul
        doc = s
    else:                                    # fragment (Chapitre I) : l'en-tete est ecrit ici
        s = s.replace("<style>", "<style>\n" + fonts + "\n", 1)
        i = s.index("</style>") + len("</style>")
        head = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        extra = '\n<style>html{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>'
        doc = head + s[:i] + extra + "\n</head>\n<body>\n" + s[i:].lstrip("\n") + "\n</body>\n</html>\n"
    assert "fonts.googleapis" not in doc and "fonts.gstatic" not in doc
    full = len(doc.encode("utf-8"))
    doc = strip_page(doc)
    dist.parent.mkdir(parents=True, exist_ok=True)
    dist.write_text(doc, encoding="utf-8")
    zpath.parent.mkdir(parents=True, exist_ok=True)
    # date fixe : le zip est identique d'un build a l'autre
    info = zipfile.ZipInfo("index.html", date_time=(1980, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    with zipfile.ZipFile(zpath, "w") as z:
        z.writestr(info, doc)
    print("OK", len(doc.encode("utf-8")), "octets (", full, "avant retrait des commentaires ) ->", dist)
    return dist


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage : python3 build/build_chapter.py <id>   (" + ", ".join(chapters()) + ")")
    build(sys.argv[1])
