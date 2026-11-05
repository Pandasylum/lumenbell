"""Retire les commentaires des SORTIES (jamais des sources) : JS, CSS et HTML d'une page assemblee.
Methode prudente : un vrai balayage a etats (pas une regex).
 - JS : on ne retire que les lignes entieres '//' et les blocs '/* ... */' hors chaines, expressions regulieres et gabarits ;
   un commentaire '//' en fin de ligne est laisse tel quel.
 - CSS : blocs '/* ... */' hors chaines.
 - HTML : '<!-- ... -->' hors <script>/<style> (un '<!--' dans un script reste du JS).
Les URL ('http://...') sont dans des chaines : jamais touchees.
Usage : from strip import strip_page   (appele par build_chapter.py et build_site.py)
"""
import re

_KW = {"return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await"}


def _ws_join(out, tail):
    """Evite de coller deux jetons quand un bloc /* */ au milieu d'une ligne disparait."""
    return " " if out and tail and not out[-1].isspace() and not tail[0].isspace() else ""


def strip_js(src):
    out = []            # morceaux du resultat
    i, n = 0, len(src)
    prev = ""           # dernier caractere significatif (hors blancs et commentaires)
    word = ""           # dernier mot (pour 'return /re/')
    tpl = []            # pile des gabarits : accolades ouvertes dans chaque ${ }
    line_start = True   # que des blancs depuis le debut de la ligne ?

    def regex_allowed():
        if prev == "" or prev in "(,=:[!&|?{};+-*%<>~^":
            return True
        if prev == "}":
            return True
        return word in _KW and (prev.isalpha() or prev == "_" or prev == "$")

    def flush_str(q, j):
        """Copie une chaine '...' ou "..." a partir de j (apres l'ouvrante), renvoie l'indice apres la fermante."""
        while j < n:
            c = src[j]
            if c == "\\":
                j += 2
                continue
            j += 1
            if c == q or c == "\n":
                break
        return j

    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""
        if c == "\n":
            out.append(c); i += 1; line_start = True; continue
        if c in " \t\r":
            out.append(c); i += 1; continue
        # commentaire //
        if c == "/" and nxt == "/":
            j = src.find("\n", i)
            j = n if j < 0 else j
            if line_start:      # ligne entiere : on la retire (blancs de tete compris)
                cut = len(out)
                while cut > 0 and out[cut - 1] in (" ", "\t", "\r"):
                    cut -= 1
                del out[cut:]
                i = j + 1 if j < n else j       # saute aussi le saut de ligne
                line_start = True
                continue
            out.append(src[i:j]); i = j; continue    # fin de ligne : laisse (preuve impossible sans analyseur complet)
        # commentaire /* */
        if c == "/" and nxt == "*":
            j = src.find("*/", i + 2)
            assert j >= 0, "commentaire /* non ferme"
            j += 2
            before_blank = line_start
            # reste de la ligne apres le bloc
            k = src.find("\n", j)
            k = n if k < 0 else k
            rest_blank = src[j:k].strip() == ""
            if before_blank and rest_blank:
                cut = len(out)
                while cut > 0 and out[cut - 1] in (" ", "\t", "\r"):
                    cut -= 1
                del out[cut:]
                i = k + 1 if k < n else k
                line_start = True
                continue
            sp = _ws_join("".join(out[-1:]), src[j:j + 1])
            out.append(sp)
            i = j
            continue
        line_start = False
        # chaines
        if c in "'\"":
            j = flush_str(c, i + 1)
            out.append(src[i:j]); i = j; prev = c; word = ""; continue
        # gabarit : on copie jusqu'a ${ ou `, avec pile pour les ${ } imbriques
        if c == "`":
            j = i + 1
            while j < n:
                d = src[j]
                if d == "\\":
                    j += 2; continue
                if d == "`":
                    j += 1; break
                if d == "$" and src[j + 1:j + 2] == "{":
                    tpl.append(0); j += 2
                    out.append(src[i:j]); i = j
                    break
                j += 1
            else:
                raise AssertionError("gabarit non ferme")
            if tpl and src[i - 1] == "{" and src[i - 2] == "$":
                prev = "{"; word = ""     # on est de nouveau en code (dans ${ })
                continue
            out.append(src[i:j]); i = j; prev = "`"; word = ""; continue
        if tpl:
            if c == "{":
                tpl[-1] += 1
            elif c == "}":
                if tpl[-1] == 0:
                    tpl.pop()
                    # reprise du gabarit apres la fermante de ${ }
                    j = i + 1
                    while j < n:
                        d = src[j]
                        if d == "\\":
                            j += 2; continue
                        if d == "`":
                            j += 1; break
                        if d == "$" and src[j + 1:j + 2] == "{":
                            tpl.append(0); j += 2
                            break
                        j += 1
                    else:
                        raise AssertionError("gabarit non ferme")
                    out.append(src[i:j]); i = j; prev = "`" if src[j - 1] == "`" else "{"; word = ""
                    continue
                tpl[-1] -= 1
        # expression reguliere
        if c == "/" and regex_allowed():
            j, cls = i + 1, False
            while j < n:
                d = src[j]
                if d == "\\":
                    j += 2; continue
                if d == "\n":
                    raise AssertionError("regex non fermee ligne : " + src[i:i + 60])
                if d == "[":
                    cls = True
                elif d == "]":
                    cls = False
                elif d == "/" and not cls:
                    j += 1; break
                j += 1
            while j < n and (src[j].isalnum() or src[j] == "_"):
                j += 1
            out.append(src[i:j]); i = j; prev = ")"; word = ""; continue
        # mot / autre
        if c.isalnum() or c in "_$":
            j = i
            while j < n and (src[j].isalnum() or src[j] in "_$"):
                j += 1
            word = src[i:j]; prev = src[j - 1]
            out.append(word); i = j; continue
        out.append(c); prev = c; word = ""; i += 1
    return "".join(out)


def strip_css(src):
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c in "'\"":
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == "\\" else 1
            out.append(src[i:j + 1]); i = j + 1
        elif src.startswith("/*", i):
            j = src.find("*/", i + 2)
            assert j >= 0, "commentaire CSS non ferme"
            j += 2
            ls = src.rfind("\n", 0, i) + 1
            le = src.find("\n", j)
            le = n if le < 0 else le
            if src[ls:i].strip() == "" and src[j:le].strip() == "":
                cut = len(out)
                while cut > 0 and out[cut - 1] in (" ", "\t"):
                    cut -= 1
                del out[cut:]
                i = le + 1 if le < n else le
            else:
                out.append(_ws_join("".join(out[-1:]), src[j:j + 1])); i = j
        else:
            out.append(c); i += 1
    return "".join(out)


def _strip_html(h):
    h = re.sub(r"(?m)^[ \t]*<!--.*?-->[ \t]*\n", "", h, flags=re.S)   # commentaire seul sur sa ligne
    return re.sub(r"<!--.*?-->", "", h, flags=re.S)


def strip_page(doc):
    """Page complete : <style> et <script> traites par langage, le reste (HTML) sans <!-- -->."""
    parts, i = [], 0
    for m in re.finditer(r"(<style[^>]*>)(.*?)(</style>)|(<script[^>]*>)(.*?)(</script>)", doc, re.S):
        html = doc[i:m.start()]
        parts.append(_strip_html(html))
        if m.group(1):
            parts += [m.group(1), strip_css(m.group(2)), m.group(3)]
        else:
            parts += [m.group(4), strip_js(m.group(5)), m.group(6)]
        i = m.end()
    parts.append(_strip_html(doc[i:]))
    return "".join(parts)
