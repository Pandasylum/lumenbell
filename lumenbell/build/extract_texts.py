#!/usr/bin/env python3
"""Regenere docs/TEXTES-CH1.md depuis la source du Chapitre I."""
import re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
src = (R/'chapters/ch1-ember-bridge/legacy/ember-bridge.source.html').read_text(encoding='utf-8')
Q = r"""(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`)"""
rows = []
for m in re.finditer(r"\b_\(\s*"+Q+r"\s*,\s*"+Q+r"\s*\)", src):
    g = m.groups(); en = next(x for x in g[:3] if x is not None); fr = next(x for x in g[3:] if x is not None)
    rows.append((src.count('\n', 0, m.start())+1, '_()', en, fr, ''))
for m in re.finditer(r"\{[^{}]*?\bd:\s*([\d.]+)[^{}]*?\ben:\s*"+Q+r"\s*,\s*fr:\s*"+Q+r"[^{}]*?\}", src):
    g = m.groups(); en = next(x for x in g[1:4] if x is not None); fr = next(x for x in g[4:] if x is not None)
    rows.append((src.count('\n', 0, m.start())+1, 'SC', en, fr, g[0]))
rows.sort()
esc = lambda s: s.replace("\\'", "'").replace('|', '\\|').replace('\\n', ' ⏎ ')
out = ["# Textes du Chapitre I (EN / FR)\n",
 "Extrait automatiquement de `chapters/ch1-ember-bridge/legacy/ember-bridge.source.html`. **Référence de lecture, pas source de vérité** : la source de vérité est le code. Régénérer avec `python3 build/extract_texts.py`.\n",
 "Règle : tout texte existe dans les deux langues. `SC` = carton d'intro/outro (durée en secondes).\n",
 "| Ligne | Type | Durée | Anglais | Français |", "|---|---|---|---|---|"]
out += [f"| {l} | {t} | {d} | {esc(en)} | {esc(fr)} |" for l, t, en, fr, d in rows]
(R/'docs/TEXTES-CH1.md').write_text('\n'.join(out)+'\n', encoding='utf-8')
print(len(rows), 'textes')
