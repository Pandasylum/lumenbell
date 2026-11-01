"""Assemble la source d'un chapitre a partir de ses morceaux (sans modules JS).
La liste ordonnee des morceaux est dans chapters/<chapitre>/src/parts.txt
(un chemin par ligne, relatif a src/ ; lignes vides et '#' ignorees).
La ligne '@shared' insere a cet endroit les morceaux communs a la serie, listes
dans shared/parts.txt (chemins relatifs a shared/), dans le meme ordre pour chaque chapitre.
Les morceaux sont colles bout a bout, octet pour octet, sans rien ajouter :
chaque fichier doit donc finir par un saut de ligne (verifie ci-dessous ; un
editeur qui retire le dernier saut de ligne collerait deux lignes de JS).
Tout fichier de src/ (et de shared/) doit figurer dans sa liste (sinon il serait ignore en silence).
Les fins de ligne CRLF sont normalisees en LF a la lecture (read_text).
Une ligne '@svg <fichier> <encre>' dans une page (HTML) est remplacee par le fragment shared/svg/<fichier>, chaque ligne
precedee de l'indentation du repere, {ink} remplace par <encre> (dessin commun a la serie : le Veilleur des menus).
Usage : from assemble import source, parts   (source(CH2) pour le Chapitre II)
"""
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
CH1 = "ch1-ember-bridge"
CH2 = "ch2-silent-bells"
SHARED_DIR = ROOT / "shared"

def _listed(base):
    """Morceaux listes dans base/parts.txt : liste de (ligne, chemin absolu)."""
    out = []
    for line in (base / "parts.txt").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            out.append((line, (base / line).resolve()))
    return out

def _read(p, name):
    t = p.read_text(encoding="utf-8")
    assert t.endswith("\n"), f"{name} doit finir par un saut de ligne"
    return (p.relative_to(ROOT).as_posix(), t)

SVG_DIR = SHARED_DIR / "svg"

def _no_stray(base, listed):
    stray = [f.relative_to(ROOT).as_posix() for f in base.rglob("*")
             if f.is_file() and f.name != "parts.txt" and f.name != "NOTES.md"
             and SVG_DIR not in f.parents
             and f.relative_to(ROOT).as_posix() not in listed]
    assert not stray, f"morceaux absents de {base.relative_to(ROOT).as_posix()}/parts.txt : {stray}"

def _svg(text, name):
    """Remplace les lignes '@svg <fichier> <encre>' par le fragment commun shared/svg/<fichier>."""
    if "@svg " not in text:
        return text
    out = []
    for line in text.split("\n"):
        w = line.strip().split(" ")
        if len(w) == 3 and w[0] == "@svg":
            frag = (SVG_DIR / w[1]).read_text(encoding="utf-8")
            assert frag.endswith("\n"), f"shared/svg/{w[1]} doit finir par un saut de ligne"
            ind = line[:len(line) - len(line.lstrip())]
            out += [ind + l.replace("{ink}", w[2]) for l in frag[:-1].split("\n")]
        else:
            out.append(line)
    return "\n".join(out)

def shared_parts():
    """Morceaux communs (shared/parts.txt), dans l'ordre."""
    out = [_read(p, "shared/" + line) for line, p in _listed(SHARED_DIR)]
    _no_stray(SHARED_DIR, {o[0] for o in out})
    return out

def parts(chapter=CH1):
    """Liste ordonnee de (chemin relatif a la racine, texte) pour un chapitre."""
    src_dir = ROOT / "chapters" / chapter / "src"
    out, own = [], set()
    for line, p in _listed(src_dir):
        if line == "@shared":
            out += shared_parts()
            continue
        o = _read(p, line)
        o = (o[0], _svg(o[1], o[0]))
        out.append(o)
        own.add(o[0])
    assert own, "parts.txt est vide"
    _no_stray(src_dir, own)
    return out

def source(chapter=CH1):
    return "".join(t for _, t in parts(chapter))
