/* ---------- input: the Watcher's states, as in Ember Bridge ---------- */
/* ready -> action -> recover -> ready. A press only acts in ready; during the action or the recovery it starts nothing and
   only sets deny (the recovery bar turns red). Each attack is settled at its impact: it is stopped if the Watcher is in his
   action then, or within `grace` of his recovery; a stopped attack sends him back to ready, so a series can be chained.
   Durations in seconds, base values from Ember Bridge: the action lasts base x m, the recovery base x rm (DIFFS).
   T = block (phase II, the King, T.barrier / T.recovery), DG = side step (phase I, the Voice, DG.act / DG.rec),
   R_T = guard (phase III, R_T.guard / R_T.rec; the guard lasts as long as the button is held, against the beams, and wears
   the stamina out: drain / regen per second, broken = recovery when it runs out; a beam blocked to its end counts as a
   stopped attack). hurt / down = stun after a hit, cut short so that the next attack can still be stopped (one hit per
   mistake); backTurn / backWin = a reflection dodged turns round behind the Watcher (backTurn s) and comes back as a real
   attack after the action + the recovery + backWin s (PROVISIONAL), so it can be dodged again; perf = a stop pressed this close before impact is perfect
   (x m); deny = red bar after a refused press. */
const T={barrier:.333,recovery:.7,grace:.06,hurt:.38,perf:.08,deny:.25};
const DG={act:.333,rec:.7,grace:.05,hurt:.38,perf:.08,backTurn:.35,backWin:.45,deny:.25};
const R_T={guard:.333,rec:.7,grace:.06,down:.55,perf:.08,broken:.9,drain:.36,regen:.38,deny:.25};
function newPl(){return{s:'ready',t:0,deny:0,at:-9,rd:0,rk:''}}
/* durations for the current phase and difficulty */
function PT(){const d=S.d,m=d.m,rm=d.rm||1;
  if(S.phase===1)return{act:T.barrier*m,rec:T.recovery*rm,grace:T.grace,hurt:T.hurt,perf:T.perf*m,deny:T.deny};
  if(S.phase===2)return{act:DG.act*m,rec:DG.rec*rm,grace:DG.grace,hurt:DG.hurt,perf:DG.perf*m,deny:DG.deny};
  return{act:R_T.guard*m,rec:R_T.rec*rm,grace:R_T.grace,hurt:R_T.down,perf:R_T.perf*m,deny:R_T.deny,broken:R_T.broken}}
function down(){
  if(S.mode!=='play'||S.paused)return;
  ensureAudio();
  $('ward').classList.add('down');S.held=true;
  const p=S.pl;
  // the animation dates (guardT, dodgeT) only move when an action starts, never on a refused press
  if(p.s==='ready'){p.s='act';p.t=0;p.at=gt;S.guardT=gt;if(S.phase===2)S.dodgeT=gt;if(S.phase===3)play('shield')}
  else if(p.s==='act'||p.s==='recover')p.deny=PT().deny;
}
function up(){S.held=false;$('ward').classList.remove('down')}
function recover(p,d,k){p.s='recover';p.t=0;p.rd=d;p.rk=k}
/* is the attack stopped at its impact? */
function stops(th){const p=S.pl,c=PT(),gr=c.grace+(th&&th.k==='shard'&&S.d.m<1?RAIN.grace:0);return(p.s==='act'&&p.t<=c.act+.002)||(p.s==='recover'&&p.rk==='act'&&p.t<gr)}
/* the Watcher's state over time (phase III: the guard is held while the button is down) */
function plStep(dt){
  const p=S.pl,c=PT();p.t+=dt;p.deny=Math.max(0,p.deny-dt);
  const held=S.phase===3&&S.held;
  if(p.s==='act'){
    if(held&&p.t>c.act){S.stam-=dt*R_T.drain;if(S.stam<=0){S.stam=0;recover(p,c.broken,'broken');S.broken=gt+c.broken;say(_('Your guard is broken.','Ta garde est brisée.'))}}
    else if(p.t>=c.act)recover(p,c.rec,'act');
  }else if((p.s==='recover'||p.s==='hurt')&&p.t>=p.rd){p.s='ready';p.t=0}
  if(S.phase===3&&!(p.s==='act'&&held))S.stam=Math.min(1,S.stam+dt*R_T.regen);
  S.holding=S.phase===3&&p.s==='act';
}

function success(th,perfect){
  th.done=true;th.res='ok';th.okT=gt;th.perfect=perfect;S.okT=gt;
  if(perfect){th.pat.perf++;S.perfects++}
  const ph=S.phase;
  if(ph===1){burst(HX+55,GY-80,perfect?26:14,perfect?'#f2fffb':'#8fe8d8',perfect?7:5,.5);play('block',perfect);MUSIC.fx('clank');pop(ONO.block,perfect?'#f2fffb':'#bff3ea')}
  else if(ph===2){S.dodgeOk=gt;play('dodge',perfect)}
  else{burst(HX,GY-120,perfect?24:12,perfect?'#e8fdff':'#7fe8ff',6,.5);play('block',perfect)}
}
function hurt(th){
  if(S.mode!=='play')return;
  S.hp=Math.max(0,S.hp-1);S.hits++;S.hurtT=gt;S.shake=12;
  // stun, cut short so that the next attack can still be stopped (Ember Bridge: min(base, max(.14, gap - .2)))
  {let nx=99;for(const o of S.threats)if(o!==th&&!o.done&&o.real!==false){const at=o.hold?o.ta:o.ti;if(at!=null&&at>gt)nx=Math.min(nx,at-gt)}
   const p=S.pl;p.s='hurt';p.t=0;p.rd=Math.min(th&&th.k==='shard'?RAIN.hurt:PT().hurt,Math.max(.14,nx-.2));p.rk=''}
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
  tint:{2:['#ffffff','#dffcf6','#8fe8d8'],1:['#ffffff','#e2d2ff','#b48cff'],3:['#ffffff','#b8fff4','#4fe0cc']}};
function damageBoss(n){
  S.bossHp=Math.max(0,S.bossHp-n);S.bossFlash=gt;
  const F=S.bossHp<=0?SHOCK.final:SHOCK,col=SHOCK.tint[S.phase];
  S.shake=Math.max(S.shake,F.shake*2);S.hitstop=F.hitstop;S.flashHit=F.flash;S.recoil=1;
  play('thud',S.bossHp<=0?1.6:1.2);MUSIC.fx([null,'bellHit','crackGlass','creature'][S.phase]);
  const p=bossCore();col.forEach((c,i)=>burst(p.x,p.y,i?12:10,c,7,.7));(S.rings||(S.rings=[])).push({x:p.x,y:p.y,life:SHOCK.ringLife,c:col[2]});
  hud();
  if(S.bossHp<=0){S.mode='ko';S.koT=gt;S.threats=[];S.pat=null;S.cnt=null;S.holding=false;play('ko');
    say([null,_('The Rust King collapses.','Le Roi de Rouille s\'effondre.'),_('The Hollow Voice\'s mirror shatters.','Le miroir de la Voix Creuse éclate.'),_('The lantern goes dark.','La lanterne s\'éteint.')][S.phase]);
    }
}
function bossCore(){return S.phase===1?{x:700,y:GY-160}:S.phase===2?{x:730,y:150}:S.form===2?{x:LX,y:ECY}:{x:LX,y:LY}}

