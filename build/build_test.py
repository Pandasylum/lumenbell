"""Fabrique la version de TEST du jeu (crochets window.__t pour les bots, intro desactivee : testSeen, le drapeau lb-ch1-intro n'est pas lu).
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
s=s.replace(tail,"function adv(dt){if(RUN.on&&!paused&&el.ov.hidden&&menuEl.hidden){const S=R||Q||G;if(S&&S.mode==='play'){RUN.t+=dt;RUN.pt[R?2:Q?1:0]+=dt}}if(!paused){if(R)rStep(dt);else if(Q)qStep(dt);else step(dt)}}\nrequestAnimationFrame(frame);\nwindow.__t={getG:()=>G,adv,getBRW:()=>BRW,getPaused:()=>paused,goPhase,showEnd,setPause,getR:()=>R,getQ:()=>Q,start,press,rDamage,rLaunch,qLaunch,T,DIFFS,getDIFF:()=>DIFF,DG,musStep,mChoir,mtof,MLEAD3,MCH3,mVoice,mDrum,mNoise,menuStep,finaleScore,spaceStep,MUS,startFury,startFinal,startFinale,showMenu,hideMenu,FIN,RUN,applyDiff,LB,CINE,OUTRO,tone,noise,thud,boom,painCry,roar};\n})();")
OUTF.write_text(s,encoding='utf-8')
s2=OUTF.read_text(encoding='utf-8');a="LB.cine.create({key:'intro',";assert s2.count(a)==1;OUTF.write_text(s2.replace(a,"LB.cine.create({key:'intro',testSeen:true,"),encoding='utf-8')
