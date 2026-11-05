"""Alias : construit le Chapitre II, Silent Bells (voir build/build_chapter.py, chapters/ch2-silent-bells/chapter.json).
Usage : python3 build/build_ch2.py
Sortie : chapters/ch2-silent-bells/dist/index.html, build/out/silent-bells-itch.zip
"""
import sys
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_chapter import build
build("ch2-silent-bells")
