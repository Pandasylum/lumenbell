"""Fabrique la version de TEST du jeu (crochets window.__t pour les bots, intro desactivee).
Usage : python3 build/build_test.py  ->  build/out/test.html
"""
import sys
from pathlib import Path
sys.dont_write_bytecode=True
sys.path.insert(0,str(Path(__file__).resolve().parent))
from assemble import source
ROOT=Path(__file__).resolve().parent.parent
OUTF=ROOT/'build/out/test.html'
OUTF.parent.mkdir(parents=True,exist_ok=True)
s=source()
tail="requestAnimationFrame(frame);\n})();"
assert s.count(tail)==1
s=s.replace(tail,"function adv(dt){if(RUN.on&&!paused&&el.ov.hidden&&menuEl.hidden){const S=R||Q||G;if(S&&S.mode==='play'){RUN.t+=dt;RUN.pt[R?2:Q?1:0]+=dt}}if(!paused){if(R)rStep(dt);else if(Q)qStep(dt);else step(dt)}}\nrequestAnimationFrame(frame);\nwindow.__t={getG:()=>G,adv,getBRW:()=>BRW,getPaused:()=>paused,goPhase,getR:()=>R,getQ:()=>Q,start,press,rDamage,rLaunch,qLaunch,T,DIFFS,getDIFF:()=>DIFF,DG,musStep,mChoir,mtof,MLEAD3,MCH3,mVoice,mDrum,mNoise,menuStep,finaleScore,spaceStep,MUS,startFury,startFinal,startFinale,showMenu,hideMenu,FIN,RUN,applyDiff,LB,tone,noise,thud,boom,painCry,roar};\n})();")
s=s.replace('requestAnimationFrame(frame);\nwindow.__t','document.getElementById("gate").hidden=true;\nrequestAnimationFrame(frame);\nwindow.__t',1)
OUTF.write_text(s,encoding='utf-8')
s2=OUTF.read_text(encoding='utf-8');assert s2.count('seen=false; /*')==1;OUTF.write_text(s2.replace('seen=false; /*','seen=true; /*'),encoding='utf-8')

t=OUTF.read_text(encoding='utf-8');a="seen=LB.store.get(LB.key('intro'),'0')==='1';";assert t.count(a)==1;OUTF.write_text(t.replace(a,''),encoding='utf-8')
