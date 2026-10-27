"""Assemble la source du Chapitre I a partir de ses morceaux (sans modules JS).
La liste ordonnee des morceaux est dans chapters/ch1-ember-bridge/src/parts.txt
(un chemin par ligne, relatif a src/ ; lignes vides et '#' ignorees).
Les morceaux sont colles bout a bout, octet pour octet, sans rien ajouter :
chaque fichier doit donc finir par un saut de ligne (verifie ci-dessous ; un
editeur qui retire le dernier saut de ligne collerait deux lignes de JS).
Tout fichier de src/ doit figurer dans parts.txt (sinon il serait ignore en silence).
Les fins de ligne CRLF sont normalisees en LF a la lecture (read_text).
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
        t = p.read_text(encoding="utf-8")
        assert t.endswith("\n"), f"{line} doit finir par un saut de ligne"
        out.append((p.relative_to(ROOT).as_posix(), t))
    assert out, "parts.txt est vide"
    listed = {o[0] for o in out}
    stray = [f.relative_to(ROOT).as_posix() for f in SRC_DIR.rglob("*")
             if f.is_file() and f != MANIFEST and f.relative_to(ROOT).as_posix() not in listed]
    assert not stray, f"morceaux absents de parts.txt : {stray}"
    return out

def source():
    return "".join(t for _, t in parts())
