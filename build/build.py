"""Alias : construit le Chapitre I (voir build/build_chapter.py, chapters/ch1-ember-bridge/chapter.json).
Usage : python3 build/build.py
Sortie : chapters/ch1-ember-bridge/dist/index.html, build/out/ember-bridge-itch.zip
"""
import sys
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_chapter import build
build("ch1-ember-bridge")
