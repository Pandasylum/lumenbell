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
Une ligne '@gate <blocs>' (CSS) ou '@gate-js <blocs>' (chaine JS de LB.UI_CSS) est remplacee par les regles de shared/css/gate.css
(source unique de l'ecran de demarrage) ; le build echoue si une de ces regles est recopiee a la main ailleurs (voir gate_expand).
Les chapitres ne sont pas listes ici : chapters() les decouvre par chapters/*/src/parts.txt (un nouveau chapitre n'exige aucune edition).
Usage : from assemble import source, parts, chapters   (source('ch2-silent-bells') pour le Chapitre II ; sans argument : le premier chapitre)
"""
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SHARED_DIR = ROOT / "shared"

def chapters():
    """Identifiants des chapitres, decouverts par chapters/*/src/parts.txt, tries par nom (ch1-..., ch2-..., ch3-...)."""
    return sorted(p.parent.parent.name for p in (ROOT / "chapters").glob("*/src/parts.txt"))

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
GATE_CSS = SHARED_DIR / "css" / "gate.css"

def _no_stray(base, listed):
    stray = [f.relative_to(ROOT).as_posix() for f in base.rglob("*")
             if f.is_file() and f.name != "parts.txt" and f.name != "NOTES.md"
             and SVG_DIR not in f.parents and f != GATE_CSS
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

def _gate_blocks():
    """Blocs de shared/css/gate.css : {nom: [lignes]}."""
    blocks, cur = {}, None
    for line in GATE_CSS.read_text(encoding="utf-8").splitlines():
        m = re.fullmatch(r"/\*@(\w+)\*/", line)
        if m:
            cur = blocks.setdefault(m.group(1), [])
        elif cur is not None and line.strip():
            cur.append(line)
    return blocks

def gate_expand(items, rgb=None):
    """Injecte shared/css/gate.css dans une liste ordonnee [(chemin, texte)] (chapitre ou hub), puis verifie qu'aucune regle n'en a ete recopiee.
    rgb : 'r,g,b' a mettre dans le halo ; par defaut celui de la table CHAPTER du chapitre (verifie contre sa couleur hexa)."""
    blocks = _gate_blocks()
    if rgb is None:
        whole = "".join(t for _, t in items)
        m = re.search(r"const CHAPTER=\{.*?\n\s*color:'(#[0-9a-fA-F]{6})',color2:'[^']*',rgb:'(\d+,\d+,\d+)'", whole, re.S)
        assert m, "table CHAPTER (color, rgb) introuvable : la couleur de l'ecran de demarrage en vient"
        assert m.group(2) == ",".join(str(int(m.group(1)[i:i + 2], 16)) for i in (1, 3, 5)), \
            f"CHAPTER : rgb '{m.group(2)}' ne correspond pas a color '{m.group(1)}'"
        rgb = m.group(2)
    glow = "".join(blocks["glow"]).replace("@RGB@", rgb)
    used = {}
    def rules(names, where):
        out = []
        for n in names:
            assert n in blocks and n != "glow", f"{where} : bloc inconnu '{n}' (blocs de shared/css/gate.css : {sorted(blocks)})"
            for l in blocks[n]:
                out.append(l.replace("@GLOW@", glow))
                k = l.split("{")[0] + "{"
                used[k] = used.get(k, 0) + 1
        return out
    res = []
    for name, text in items:
        outl = []
        for line in text.split("\n"):
            w = line.split()
            ind = line[:len(line) - len(line.lstrip())]
            if len(w) >= 2 and w[0] == "@gate":
                outl += [ind + l for l in rules(w[1:], name)]
            elif len(w) >= 2 and w[0] == "@gate-js":
                outl += [ind + "'" + l.replace("\\", "\\\\").replace("'", "\\'").replace(glow, glow.replace(rgb, "'+rgb+'")) + "\\n'+" for l in rules(w[1:], name)]
            else:
                outl.append(line)
        res.append((name, "\n".join(outl)))
    # garde-fou : chaque regle de gate.css n'apparait qu'autant de fois qu'on l'a injectee (une copie a la main, meme identique, fait echouer)
    whole = "".join(t for _, t in res)
    assert "@gate" not in whole and "@GLOW@" not in whole and "@RGB@" not in whole, "repere @gate non resolu"
    for l in sorted({l.split("{")[0] + "{" for b in blocks.values() for l in b if "{" in l}):
        n = len(re.findall(r"(?m)^\s*'?" + re.escape(l), whole))
        assert n == used.get(l, 0), (f"regle '{l}...' de l'ecran de demarrage presente {n} fois pour {used.get(l, 0)} injection(s) : "
            "une copie recopiee a la main diverge de shared/css/gate.css ; la remplacer par une ligne '@gate <blocs>' (ou '@gate-js' dans LB.UI_CSS)")
    return res

def shared_parts():
    """Morceaux communs (shared/parts.txt), dans l'ordre."""
    out = [_read(p, "shared/" + line) for line, p in _listed(SHARED_DIR)]
    _no_stray(SHARED_DIR, {o[0] for o in out})
    return out

def parts(chapter=None):
    """Liste ordonnee de (chemin relatif a la racine, texte) pour un chapitre."""
    chapter = chapter or chapters()[0]
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
    return gate_expand(out)

def source(chapter=None):
    return "".join(t for _, t in parts(chapter))
