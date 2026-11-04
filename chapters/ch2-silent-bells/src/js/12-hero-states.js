/* ---------- input: the Watcher's states, shared with Ember Bridge (LB.hero, shared/js/16-hero.js) ---------- */
/* ready -> action -> recover -> ready. A press only acts in ready; during the action or the recovery it starts nothing and
   only sets deny (the Watcher's lantern turns red). Each attack is settled at its impact: it is stopped if the Watcher is in his
   action then, or within `grace` of his recovery; a stopped attack sends him back to ready, so a series can be chained.
   Durations (HERO_T) and difficulty (m, rm) are in LB: action = base x m, recovery = base x rm. The gesture depends on the phase:
   block (phase II, the King), dodge (phase I, the Voice), hold (phase III: the guard lasts as long as the button is held, against
   the beams, and wears the stamina out; a beam blocked to its end counts as a stopped attack). The stun after a hit is cut short
   so that the next attack can still be stopped (one hit per mistake). Only the reflections' return is chapter-specific:
   backTurn / backWin = a reflection dodged turns round behind the Watcher (backTurn s) and comes back as a real attack after
   the action + the recovery + backWin s (PROVISIONAL), so it can be dodged again. foolRec = share of the recovery kept after
   such a dodge (half; only in this case, local to this chapter): the reflection comes back right after that shortened recovery. */
const DG={backTurn:.35,backWin:.45,foolRec:.5};
const GESTURE={1:'block',2:'dodge',3:'hold'};   // internal phase number -> gesture (1 the King, 2 the Voice, 3 the Lighthouse)
const gest=()=>GESTURE[S.phase];
function newPl(){return LB.hero.create()}
/* durations for the current phase and difficulty (act, rec, grace, perf, hurt, broken) */
function PT(){return LB.hero.dur(gest())}
function down(){
  if(S.mode!=='play'||S.paused)return;
  ensureAudio();
  $('ward').classList.add('down');S.held=true;
  // the animation dates (guardT, dodgeT) only move when an action starts, never on a refused press
  if(LB.hero.press(S.pl,gest(),gt)){S.guardT=gt;if(S.phase===2)S.dodgeT=gt;if(S.phase===3)play('shield')}
}
function up(){S.held=false;LB.hero.release(S.pl);$('ward').classList.remove('down')}
/* is the attack stopped at its impact? (a shard of the rain gets a wider grace in Hard) */
function stops(th){return LB.hero.stops(S.pl,{graceAdd:th&&th.k==='shard'&&S.d.m<1?RAIN.grace:0})}
/* the Watcher's state over time (phase III: the guard is held while the button is down) */
function plStep(dt){
  const p=S.pl;
  if(LB.hero.step(p,dt,{gesture:gest(),held:S.held})==='broken'){S.broken=gt+PT().broken;say(_('Your guard is broken.','Ta garde est brisée.'))}
  // dodge aimed at a reflection (fooled): the recovery that follows this action is shortened (DG.foolRec); any other end of the action drops the mark
  if(p.fr){if(p.s==='recover'&&p.rk==='act'){p.rd*=DG.foolRec;p.fr=0}else if(p.s!=='act')p.fr=0}
  S.holding=S.phase===3&&p.s==='act';
}

function success(th,perfect){
  th.done=true;th.res='ok';th.okT=gt;th.perfect=perfect;S.okT=gt;
  if(perfect){th.pat.perf++;S.perfects++}
  const ph=S.phase;
  if(ph===1){burst(HX+55,GY-80,perfect?26:14,perfect?'#f2fffb':'#8fe8d8',perfect?7:5,.5);play('block',perfect);MUSIC.fx('clank');pop(ONO.block,perfect?'#f2fffb':'#bff3ea')}
  else if(ph===2){S.dodgeOk=gt;play('dodge',perfect)}
  else{burst(HX,GY-120,perfect?24:12,perfect?'#e8fdff':'#7fe8ff',6,.5);play('block',perfect);pop(ONO.block,perfect?'#e8fdff':'#a8f0ff')}
}
function hurt(th){
  if(S.mode!=='play')return;
  S.hp=Math.max(0,S.hp-1);S.hits++;S.hurtT=gt;S.shake=12;
  // stun, cut short so that the next attack can still be stopped (LB.hero.hurt: min(base, max(.14, gap - .2)))
  {let nx=99;for(const o of S.threats)if(o!==th&&!o.done&&o.real!==false){const at=o.hold?o.ta:o.ti;if(at!=null&&at>gt)nx=Math.min(nx,at-gt)}
   LB.hero.hurt(S.pl,nx,{g:gest(),dur:th&&th.k==='shard'?RAIN.hurt:undefined})}
  if(th&&th.k==='rafter')pop(ONO.crush,'#ff8a6b',HX-30,GY-190);
  burst(HX,GY-70,18,'#ff6a5a',5,.55);play('hurt');MUSIC.fx('chunk');hud();
  if(S.hp<=0){S.mode='dead';S.deadT=gt;S.holding=false;say(_('The Watcher falls. Defeat.','Le Veilleur tombe. Défaite.'))}
}
/* the riposte's impact, taken from Ember Bridge (36-p2-foundry-logic.js qDamage, and qFinalStep for the last blow of a
   phase): screen shake (Ember Bridge amplitude; this chapter shakes ±shake/2, hence x2 when applied), hitstop (game time
   stops, s), white flash (fading flashDecay per s), dull impact sound, a ring (ringLife s) and sparks tinted by phase
   (white turquoise for the Voice, violet for the King, turquoise for the tower), the boss pushed back recoilPx (recovering
   recoilDecay per s), then staggered `hurt` s once the riposte is over. All values taken from Ember Bridge. */
const SHOCK={shake:13,hitstop:.11,flash:.4,flashDecay:2.2,ringLife:.35,recoilPx:20,recoilDecay:3.5,hurt:.55,
  final:{shake:16,hitstop:.14,flash:.8},
  /* the Voice's three ripostes (volley / rain / wail), kept sober: a very short stop, a light shake and flash (not the last blow),
     plus a spell-specific impact on her (sound `fx`, `n` warm sparks of colour `col`); timing and riposte rules unchanged */
  voice:{shake:6,hitstop:.06,flash:.3},
  hit:{volley:{fx:'impactLight',col:'#fff4be',n:10},rain:{fx:'glints',col:'#fff4be',n:12},wail:{fx:'bellChime',col:'#fff1c8',n:8}},
  tint:{2:['#ffffff','#dffcf6','#8fe8d8'],1:['#ffffff','#e2d2ff','#b48cff'],3:['#ffffff','#b8fff4','#4fe0cc']},
  /* phase III, per form (sound `snd` with `body`, bell or wet fx `fx`, particles `tint` n each of speed `spd`, life `life`, gravity `g`):
     form I = the tower made of the King, rusted metal and bell (metal sparks, bell ring); form II = the jellyfish's own
     matter, soft and gelatinous (dull wet sound, translucent splashes that fall back) */
  form:{1:{snd:'thud',fx:'bellHit',tint:['#ffffff','#ffd9a0','#ff9a4a'],n:[10,16,10],spd:9,life:.6,g:.5},
        2:{snd:'squelch',fx:'jellyHit',tint:['rgba(210,250,255,.55)','rgba(120,225,255,.45)','rgba(90,190,235,.4)'],n:[8,14,14],spd:5,life:.9,g:.9}}};
function damageBoss(n){
  S.bossHp=Math.max(0,S.bossHp-n);S.bossFlash=gt;
  const F=S.bossHp<=0?SHOCK.final:S.phase===2&&S.cnt?SHOCK.voice:SHOCK,col=SHOCK.tint[S.phase],VH=S.phase===2&&S.cnt?SHOCK.hit[S.cnt.spell]:null;
  S.shake=Math.max(S.shake,F.shake*2);S.hitstop=F.hitstop;S.flashHit=F.flash;S.recoil=1;
  const FM=S.phase===3?SHOCK.form[S.form===2?2:1]:null,pw=S.bossHp<=0?1.6:1.2;
  play(FM?FM.snd:'thud',pw);MUSIC.fx(FM?FM.fx:[null,'bellHit','crackGlass'][S.phase]);
  const p=bossCore();if(FM)FM.tint.forEach((c,i)=>burst(p.x,p.y,FM.n[i],c,FM.spd,FM.life,FM.g));else col.forEach((c,i)=>burst(p.x,p.y,i?12:10,c,7,.7));(S.rings||(S.rings=[])).push({x:p.x,y:p.y,life:SHOCK.ringLife,c:col[2]});
  if(VH){MUSIC.fx(VH.fx);burst(p.x,p.y,VH.n,VH.col,6,.6)}
  hud();
  if(S.bossHp<=0){if(S.phase===2)MUSIC.fx('murmur');S.mode='ko';S.koT=gt;S.threats=[];S.pat=null;S.cnt=null;S.holding=false;play('ko');
    say([null,_('The Rust Elder collapses.',"L'Ancien de Rouille s'effondre."),_('The Hollow Voice\'s mirror shatters.','Le miroir de la Voix Creuse éclate.'),_('The lantern goes dark.','La lanterne s\'éteint.')][S.phase]);
    }
}
function bossCore(){return S.phase===1?{x:700,y:GY-160}:S.phase===2?{x:730,y:150}:S.form===2?{x:LX,y:ECY}:{x:LX,y:LY}}

