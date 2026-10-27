#!/usr/bin/env python3
"""Regenere docs/TEXTES-CH1.md depuis la source du Chapitre I (morceaux de src/, voir src/parts.txt)."""
import re, sys, pathlib
sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from assemble import parts
R = pathlib.Path(__file__).resolve().parent.parent
Q = r"""(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`)"""
rows = []
for k, (path, src) in enumerate(parts()):
    name = path.split('chapters/ch1-ember-bridge/', 1)[-1]
    for m in re.finditer(r"\b_\(\s*"+Q+r"\s*,\s*"+Q+r"\s*\)", src):
        g = m.groups(); en = next(x for x in g[:3] if x is not None); fr = next(x for x in g[3:] if x is not None)
        rows.append((k, src.count('\n', 0, m.start())+1, name, '_()', en, fr, ''))
    for m in re.finditer(r"\{[^{}]*?\bd:\s*([\d.]+)[^{}]*?\ben:\s*"+Q+r"\s*,\s*fr:\s*"+Q+r"[^{}]*?\}", src):
        g = m.groups(); en = next(x for x in g[1:4] if x is not None); fr = next(x for x in g[4:] if x is not None)
        rows.append((k, src.count('\n', 0, m.start())+1, name, 'SC', en, fr, g[0]))
rows.sort()
esc = lambda s: s.replace("\\'", "'").replace('|', '\\|').replace('\\n', ' ⏎ ')
out = ["# Textes du Chapitre I (EN / FR)\n",
 "Extrait automatiquement des morceaux de `chapters/ch1-ember-bridge/src/` (ordre : `src/parts.txt`). **Référence de lecture, pas source de vérité** : la source de vérité est le code. Régénérer avec `python3 build/extract_texts.py`.\n",
 "Règle : tout texte existe dans les deux langues. `SC` = carton d'intro/outro (durée en secondes).\n",
 "| Fichier:ligne | Type | Durée | Anglais | Français |", "|---|---|---|---|---|"]
out += [f"| {n}:{l} | {t} | {d} | {esc(en)} | {esc(fr)} |" for _, l, n, t, en, fr, d in rows]
(R/'docs/TEXTES-CH1.md').write_text('\n'.join(out)+'\n', encoding='utf-8')
print(len(rows), 'textes')
