"""Chapitre II : inverse l'ordre des arguments de la fonction de texte, _(fr, en) -> _(en, fr) (ordre du Chapitre I).
Usage : python3 build/ch2_swap_args.py ENTREE SORTIE
Outil de migration (passe unique, 27 octobre 2026) : a servi a creer chapters/ch2-silent-bells/src/silent-bells.html
depuis legacy/silent-bells.source.html. Ne modifie que le <script> : chaque appel _(a,b) devient _(b,a), la definition
devient const _=(en,fr)=>... Le controle est tests/ch2-texts.js (couples (fr, en) identiques avant et apres).
"""
import re, sys
from pathlib import Path

CALL = re.compile(r"(?<![\w$.])_\(")
OLD_DEF = "const _=(fr,en)=>LANG==='fr'?fr:en;"
NEW_DEF = "const _=(en,fr)=>LANG==='fr'?fr:en;"


def skip_string(s, i):
    """s[i] ouvre une chaine ' \" ou ` ; renvoie l'indice juste apres la fermeture."""
    q = s[i]; i += 1
    while s[i] != q:
        if s[i] == "\\":
            i += 1
        elif q == "`" and s.startswith("${", i):
            raise ValueError("gabarit avec ${} dans un argument de _() : a traiter a la main")
        i += 1
    return i + 1


def args_of(s, i):
    """s[i] suit '_(' ; renvoie (liste des arguments bruts, indice apres ')')."""
    out, depth, start = [], 0, i
    while True:
        c = s[i]
        if c in "'\"`":
            i = skip_string(s, i); continue
        if s.startswith("//", i) or s.startswith("/*", i):
            raise ValueError("commentaire dans un appel de _() a l'indice %d" % i)
        if c in "([{":
            depth += 1
        elif c in ")]}":
            if depth == 0:
                out.append(s[start:i]); return out, i + 1
            depth -= 1
        elif c == "," and depth == 0:
            out.append(s[start:i]); start = i + 1
        i += 1


def swap(code):
    """Inverse les deux arguments de chaque appel _(), appels imbriques compris. Renvoie (code, nombre d'appels)."""
    res, i, n = [], 0, 0
    while True:
        m = CALL.search(code, i)
        if not m:
            res.append(code[i:]); return "".join(res), n
        res.append(code[i:m.end()])
        args, j = args_of(code, m.end())
        assert len(args) == 2, ("appel de _() a %d argument(s)" % len(args), code[m.start():m.start() + 80])
        a, b = (swap(x) for x in args)
        n += 1 + a[1] + b[1]
        # espaces de tete/queue conserves a leur place : _(a, b) -> _(b, a)
        la, lb = a[0], b[0]
        pa, pb = len(la) - len(la.lstrip()), len(lb) - len(lb.lstrip())
        sa, sb = len(la.rstrip()), len(lb.rstrip())
        res.append(la[:pa] + lb.strip() + la[sa:] + "," + lb[:pb] + la.strip() + lb[sb:] + ")")
        i = j


def main(src, dst):
    s = Path(src).read_text(encoding="utf-8")
    assert s.count("<script>") == 1 and s.count("</script>") == 1
    a = s.index("<script>") + len("<script>"); b = s.index("</script>")
    code = s[a:b]
    assert code.count(OLD_DEF) == 1, "definition _(fr,en) introuvable (deja inversee ?)"
    expected = len(CALL.findall(code))
    code, n = swap(code.replace(OLD_DEF, NEW_DEF))
    assert n == expected, (n, expected)
    Path(dst).write_text(s[:a] + code + s[b:], encoding="utf-8")
    print("OK", n, "appels de _() inverses ->", dst)


if __name__ == "__main__":
    main(*sys.argv[1:3])
