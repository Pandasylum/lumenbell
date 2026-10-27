"""Assemble la source du Chapitre I a partir de ses morceaux (sans modules JS).
La liste ordonnee des morceaux est dans chapters/ch1-ember-bridge/src/parts.txt
(un chemin par ligne, relatif a src/ ; lignes vides et '#' ignorees).
Les morceaux sont colles bout a bout, octet pour octet, sans rien ajouter :
chaque fichier doit donc finir par un saut de ligne (sauf choix contraire voulu).
Usage : from assemble import source, parts
"""
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "chapters/ch1-ember-bridge/src"
MANIFEST = SRC_DIR / "parts.txt"

def parts():
    """Liste ordonnee de (chemin relatif a la racine, texte)."""
    out = []
    for line in MANIFEST.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        p = (SRC_DIR / line).resolve()
        out.append((p.relative_to(ROOT).as_posix(), p.read_text(encoding="utf-8")))
    assert out, "parts.txt est vide"
    return out

def source():
    return "".join(t for _, t in parts())
