/* ---------- update ---------- */
function update(dt){
  // the riposte's shock: decays run in real time; during the hitstop the game time stands still
  S.flashHit=Math.max(0,(S.flashHit||0)-dt*SHOCK.flashDecay);S.recoil=Math.max(0,(S.recoil||0)-dt*SHOCK.recoilDecay);
  if(S.rings){for(const r of S.rings)r.life-=dt;S.rings=S.rings.filter(r=>r.life>0)}
  if(S.hitstop>0&&(S.mode==='play'||S.mode==='ko')&&!S.paused){const d=Math.min(dt,S.hitstop);S.hitstop-=d;gt-=d;return}
  if(S.mode==='play'&&!S.paused){
    S.runT+=dt;
    plStep(dt);
    learnBeam(dt);
    if(!S.pat&&!S.cnt&&gt>=S.nextAt)spawn();
    for(const th of S.threats){
      if(th.done)continue;
      if(th.hold){
        if(gt>=th.ta&&gt<=th.tb){if(S.pl.s!=='act'){if(!th.safe){th.done=true;th.res='hit';th.okT=gt;th.pat.ok=false;hurt(th);if(S.mode!=='play')break}}else if(!th.held){th.held=true;burst(HX,GY-110,10,'#b8fff4',4,.4)}}
        else if(gt>th.tb){th.done=true;th.res='ok';th.okT=gt;S.holdEnd=th.tb;if(S.pl.s==='act')LB.hero.stopped(S.pl)}
        continue;
      }
      if(gt>=th.ti){
        th.done=true;th.okT=gt;const p=S.pl;
        if(th.real===false){if(p.s==='act'&&aimedAt(th))fooled(th);else{th.res='pass';burst(HX+20,GY-70,10,'#a49bbd',3,.5);play('fool')}}
        else if(stops(th)){success(th,LB.hero.perfect(p,gt));LB.hero.stopped(p)}
        else{th.res='hit';th.pat.ok=false;hurt(th);if(S.mode!=='play')break}
      }
    }
    if(S.mode==='play'&&S.pat&&S.pat.ths.every(t=>t.done))closePat();
    if(S.cnt&&!S.cnt.hit&&gt>=S.cnt.t+S.cnt.hitAt){S.cnt.hit=true;damageBoss(S.cnt.dmg)}
    counterVariantFx();
    if(S.cnt&&gt>=S.cnt.t+S.cnt.dur){S.cnt=null;S.bossHurtT=gt}
  }
  if(S.mode==='ko'&&gt>S.koT+2.6&&!S.koShown){S.koShown=true;phaseCleared()}
  if(S.mode==='dead'&&gt>S.deadT+1.1&&!S.deadShown){S.deadShown=true;deathCard()}
  S.threats=S.threats.filter(t=>gt<(t.tb||t.ti)+1.6);
  {const P=S.parts;let n=0;for(let i=0;i<P.length;i++){const p=P[i];if(gt-p.t0<p.life)P[n++]=p}P.length=n}   // in place: no array per frame
  S.pops=S.pops.filter(p=>gt-p.t0<1);
  S.shake*=Math.pow(.02,dt);
}
/* the first beam of the fight waits for the hold (BEACON_LEARN, Easy and Normal, first form of phase III): while it waits the time of every threat still to come stands
   still (the beam stays in front of the Watcher, the shadow of the dome is drawn by drawHero); released by the held dome, or by the safety delay (then launched again
   once). A released beam is `safe`: it crosses without damage. S.learn is renewed with each fight (resetPhaseState). */
const LEARN_KEYS=['t0','ts','ta','tb','ti'];
function learnBeam(dt){
  const Z=BEACON_LEARN,L=S.learn;
  if(!L||S.phase!==3||S.form!==1||S.d.trial||!Z.on[vdk()]||L.ok)return;
  if(!L.th){
    if(L.misses>Z.retries)return;
    const th=S.threats.find(o=>o.k==='beam'&&o.hold&&!o.done&&!o.safe&&o.real!==false);
    if(!th||gt<th.ta-Z.lead)return;
    L.th=th;L.t=0}
  const th=L.th;
  if(th.done){L.th=null;return}
  L.t+=dt;
  if(S.holding&&domeAlpha()>=1){th.safe=true;L.th=null;L.ok=true;return}   // the dome is up: the beam moves on and glides over it
  if(L.t>=Z.timeout){   // safety: it passes without damage, and is launched again once
    th.safe=true;L.th=null;L.misses++;
    if(L.misses<=Z.retries){const c=Object.assign({},th),off=th.ts+th.D+Z.retryGap-th.t0;for(const k of LEARN_KEYS)if(c[k]!=null)c[k]+=off;
      c.done=false;c.safe=false;c.held=false;delete c.res;delete c.okT;th.pat.ths.push(c);S.threats.push(c)}
    return}
  for(const o of S.threats)if(!o.done)for(const k of LEARN_KEYS)if(o[k]!=null)o[k]+=dt;   // time stands still
}
/* riposte after a clean series, in every phase (rule of Ember Bridge): dur = length of the Watcher's counter, hitAt = moment
   the boss is hit (s, internal phase number: 1 the King, 2 the Voice, 3 the Lighthouse); next = pause before the next series */
const R_CNT={harpoon:{dur:1.6,hitAt:.65},1:{dur:1.05,hitAt:.42},2:{dur:1.05,hitAt:.4},3:{dur:.95,hitAt:.32},next:1.45,nextFail:.95};
/* a press dodges a reflection only if it was aimed at it: closer to it than to any real attack still to come */
function aimedAt(f){const a=S.pl.at,d=Math.abs(a-f.ti);return!S.threats.some(o=>!o.done&&o!==f&&o.real!==false&&!o.hold&&o.ti!=null&&Math.abs(a-o.ti)<d)}
/* the Finish (phase II): the Watcher's charged bell and the Elder's bell resonate, he rings louder and louder and falls at the last stroke (times: SP.finish) */
function finishStart(){const F=SP.finish,last=F.first+(F.strikes-1)*F.step;S.cnt={t:gt,dmg:1,dur:last+F.hit+F.tail,hitAt:last+F.hit,k:1,spell:'finish'};S.nextAt=gt+99;MUSIC.fx('swell')}
function closePat(){
  const p=S.pat;S.pat=null;
  // final assault of phase II (glas): no riposte; the Finish comes once enough glas are countered (total count), otherwise the glas start again
  if(p.spell==='glas'&&S.phase===1){if((S.glasN||0)>=SP.glas.need[vdk()])finishStart();else S.nextAt=gt+(p.ok?R_CNT.next:R_CNT.nextFail);return}
  if(p.ok&&S.finalDone&&(VOICE_FX.direct&&S.phase===2||BEACON_FX.direct&&S.phase===3&&S.form===2)){damageBoss(1);return}   // Ultimate rage of the Voice: the finish chains the end animation, no riposte shot before
  if(p.ok){
    const allPerf=p.nReal>=2&&p.perf>=p.nReal,c=S.phase===1&&p.spell==='harpoon'?R_CNT.harpoon:R_CNT[S.phase];   // harpoon: slower, so that the ray is seen climbing the chain
   
    S.cnt={t:gt,dmg:allPerf?2:1,dur:c.dur,hitAt:c.hitAt,k:S.phase,spell:p.spell,side:p.side,ri:p.ri};S.nextAt=gt+R_CNT.next;play('counter');counterFx();
    say(S.phase===1?_('Series blocked. The Watcher counters.','Série bloquée. Le Veilleur riposte.'):S.phase===2?_('Volley dodged. The Watcher sends the light back.','Volée esquivée. Le Veilleur renvoie la lumière.'):_('Attacks countered. The Watcher sends the lightning back.','Attaques contrées. Le Veilleur renvoie la foudre.'));
  }else S.nextAt=gt+R_CNT.nextFail;
}

