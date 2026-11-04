/* ---------- flow ---------- */
let lastCard=null;
function setTheme(id){if(LB.audio.music)MUSIC.play(id);else MUSIC.stop()}
/* cards of the series (LB.card, declarative): kept in lastCard so that « Resume » from the menu shows it again */
function showCard(o){lastCard=o;LB.card.show(o)}
function hideCard(){LB.card.hide()}
function playCine(id,k,cb){
  MUSIC.stop();S.phase=id;resetCine(S);S.parts=[];S.pops=[];S.cine={k,t0:gt};S.cineCb=cb;S.mode='cine';S.paused=false;
  S.tfBurst=S.tfFlash=S.tfAnch=false;S.tfId=(S.tfId||0)+1;S.flashT=-9;S.shake=0;
  hideCard();hud();if(LB.audio.music)MUSIC.bed(id);$('skip').hidden=false;
}
function endCine(){if(S.mode!=='cine')return;const cb=S.cineCb;S.cineCb=null;resetCine(S);MUSIC.bedStop();$('skip').hidden=true;S.mode='card';cb&&cb()}
/* intro and outro in the series frame (LB.cine, shared/js/24-cine.js): the chapter draws the shot in the module's canvas
   (ctx swapped for the draw), the module draws the frame (cartons, fades, caption, Skip). Game time (gt, particles) runs
   with the game loop as before; only when the loop is stopped (menu open, replay) does it follow the module's time. */
function cineScene(fn,vig){return(p,t,lt,st,cx)=>{const g=ctx;ctx=cx;try{ctx.save();fn(t);ctx.restore();
  if(vig){const v=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.9);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)}}finally{ctx=g}}}
/* the prologue: played once (flag lb-ch2-intro, written at the end or on Skip), then only by PRO.replay */
const PRO=LB.cine.create({key:'intro',scenes:()=>CINE_D.intro.map((d,i)=>({d,txt:()=>i<4?PCAP_TXT()[i]:'',draw:cineScene(drawPrologue,true)})),
  onTick:t=>{if(!$('menu').hidden)gt=S.proT0+t}});   // menu open (replay): the game loop is stopped, game time follows the module's
function playPrologue(cb){MUSIC.stop();S.mode='prologue';S.proT0=gt;S.cineDone={};S.parts=[];S.pops=[];S.proCb=cb;hideCard();if(LB.audio.music)MUSIC.bed(2);$('skip').hidden=true;$('hdEye').textContent='Prologue';PRO.play(endPrologue)}
function endPrologue(){if(S.mode!=='prologue')return;const cb=S.proCb;S.proCb=null;MUSIC.bedStop();$('skip').hidden=true;S.mode='card';cb&&cb()}
/* replay from the menu (button ▶ Intro, as in Chapter I): the prologue plays over the menu even if seen; the game state
   (mode, game time, particles, a paused fight) is left as it was and restored at the end */
/* replay of the epilogue from the menu (button ▶ Outro, after the true ending, as in Chapter I): over the menu, game state kept */
function replayEpilogue(cb){if(EPI.playing())return;const keep={gt,t0:S.epT0,parts:S.parts,pops:S.pops,done:S.cineDone,shake:S.shake};
  S.epT0=gt;S.parts=[];S.pops=[];S.cineDone={};MUSIC.stop();MUSIC.bedStop();setTheme(4);
  EPI.replay(()=>{gt=keep.gt;S.epT0=keep.t0;S.parts=keep.parts;S.pops=keep.pops;S.cineDone=keep.done;S.shake=keep.shake;if(!$('menu').hidden)setTheme(4);cb&&cb()})}
function replayPrologue(cb){if(PRO.playing())return;const keep={gt,t0:S.proT0,parts:S.parts,pops:S.pops,done:S.cineDone};
  S.proT0=gt;S.parts=[];S.pops=[];S.cineDone={};MUSIC.stop();if(LB.audio.music)MUSIC.bed(2);
  PRO.replay(()=>{gt=keep.gt;S.proT0=keep.t0;S.parts=keep.parts;S.pops=keep.pops;S.cineDone=keep.done;MUSIC.bedStop();if(!$('menu').hidden)setTheme(4);cb&&cb()})}
function resetPhaseState(){Object.assign(S,{shardGone:null,peA:0,angerShown:false,rageN:0,rageHp0:null,rageNext:0,roarT:-9,roarD:0,finalDone:false,hide:null,walkLegs:null,bodyBob:0,threats:[],pat:null,cnt:null,koShown:false,koBurst:false,deadShown:false,broken:0,ecPhi:0,holding:false,pl:newPl(),post:null,rust:null,still:0,hitstop:0,flashHit:0,recoil:0,rings:[],bossHurtT:null})}
function enterPhase(id,o){o=o||{};
  S.phase=id;S.form=1;S.bossMax=id===3?S.d.boss3:S.d.boss;S.bossHp=S.bossMax;if(o.first||S.d.heal===true)S.hp=S.hpMax;else if(S.d.heal)S.hp=Math.min(S.hpMax,S.hp+S.d.heal);   // heal true = full refill; a number = that many HP, capped at the starting HP (trial: +1)
 resetPhaseState();
  hud();playCine(id,'in',()=>introCard(id));
}
function introCard(id){S.mode='card';const P=PH[id];showCard({eye:P.eye(),title:P.boss(),desc:P.desc(),go:_('Start','Commencer'),onGo:beginPlay})}
function beginPlay(){hideCard();S.mode='play';if(S.phase===2)MUSIC.fx('voiceWeep');S.paused=false;S.nextAt=gt+1.1;setTheme(S.phase);try{$('ward').focus({preventScroll:true})}catch(e){};hud();say(PH[S.phase].head())}
function phaseCleared(){
  MUSIC.stop();const id=S.phase;
  if(id===3&&S.form===1){playCine(3,'p2',()=>{S.form=2;S.bossHp=S.bossMax;resetPhaseState();hud();beginPlay()});return}
  LB.store.set(LB.key('unl'),String(Math.max(+LB.store.get(LB.key('unl'),1),Math.min(3,gpOf(id)+1))));
  if(id===3){playCine(3,'out',()=>clearedCard(3));return}
  playCine(id,'out',()=>clearedCard(id));
}
function clearedCard(id){S.mode='card';S.still=id;const next=ORDER[gpOf(id)];
  showCard({eye:[null,_('Phase II cleared','Phase II terminée'),_('Phase I cleared','Phase I terminée'),_('Phase III cleared','Phase III terminée')][id],title:PH[id].boss(),desc:PH[id].end(),
    go:_('Continue','Continuer'),onGo:id===3?()=>{S.epAgain=LB.hubAgain(S.d.trial,EPI);if(S.d.trial||S.epAgain)victory();else playEpilogue(victory)}:()=>enterPhase(next),onMenu:id===3?null:showMenu});
}
function fmt(t){const m=Math.floor(t/60),s=Math.floor(t%60);return m+':'+String(s).padStart(2,'0')}
function victory(){S.mode='won';if(MUSIC.cur!==4)setTheme(4);
  LB.store.set(LB.key('end'),'1');LB.menu.update();   // true ending seen (lb-ch2-end): « ▶ Outro » in the menu, Trial opened if TRIAL_OPEN is false
  const t=S.runT,key=LB.key('best-'+S.dk),rec=+LB.store.get(key,0);let isRec=false;
  if(S.full&&(!rec||t<rec)){LB.store.set(key,String(t));isRec=true}
  const best=S.full?(isRec?t:rec):rec;
  showCard(LB.hubEnd({eye:_('Victory','Victoire')+' · '+S.d[LB.lang.cur],title:_('Chapter II · Silent Bells','Chapitre II · Silent Bells'),
    table:[[_('Time','Temps'),fmt(t)],[_('Hits taken','Coups reçus'),S.hits],[_('Perfects','Parfaits'),S.perfects],[_('Best','Record'),best?fmt(best):'—',true]],
    desc:(isRec?_('New record. ','Nouveau record. '):'')+(S.full?'':_('Records only count for runs started from the beginning.','Le record ne compte que pour une partie lancée depuis le début.')),
    go:_('Play again','Rejouer'),onGo:()=>startRun(S.dk),onMenu:showMenu},2,S.d.trial,S.epAgain,showMenu));   // from the hub, outside the Trial: « Chapters » goes back to the hub
}
function deathCard(){MUSIC.stop();const tr=S.d.trial;
  const o={eye:_('Defeat','Défaite'),title:_('The Watcher is down.','Le Veilleur est à terre.'),
    desc:tr?_('Trial: one fall sends you back to Phase I.','Épreuve : une chute te renvoie à la phase I.'):'',
    go:tr?_('Restart','Recommencer'):_('Retry phase','Réessayer la phase'),onGo:()=>tr?startRun(S.dk,true):retryPhase(),onMenu:showMenu};
  // Easy: on the 3rd defeat without help, the card offers to enable it (LB.help, decision 3 of 28 October), on a line under the buttons
  if(!tr&&LB.help.defeat(S.dk==='easy')){o.go2=LB.helpOffer();o.onGo2=()=>{LB.help.enable();retryPhase()}}
  showCard(o);
}
/* retry: from the start of the phase; in phase III that is form I, even after a defeat in form II (as in Ember Bridge) */
function retryPhase(){S.hp=S.hpMax;S.bossHp=S.bossMax;resetPhaseState();S.form=1;S.mode='card';hud();beginPlay()}
function startRun(dk,noPro){
  S=fresh(dk);S.full=true;S.phase=2;S.form=1;S.cineDone={};
  hideMenu();hud();
  if(noPro||PRO.seen())enterPhase(2,{first:true});else playPrologue(()=>enterPhase(2,{first:true}));
}
function jumpPhase(gp){if(S.d.trial||S.mode==='menu')return;const id=ORDER[gp-1],dk=S.dk;$('pause').hidden=true;S=fresh(dk);S.full=false;S.cineDone={};enterPhase(id,{first:true})}
function showMenu(){
  const wasPlay=S.mode==='play';if(wasPlay)S.paused=true;
  if(S.mode==='cine'||S.mode==='prologue'||S.mode==='epilogue'||S.mode==='won'||S.mode==='dead'){S.mode='menu';lastCard=null}
  const resume=wasPlay||(S.mode==='card'&&!!lastCard);
  hideCard();LB.pause.hide();$('skip').hidden=true;LB.menu.show(resume);
  MUSIC.bedStop();setTheme(4);
}
function hideMenu(){LB.menu.hide()}
function setPause(p){if(S.mode!=='play')return;S.paused=p;if(p){up();MUSIC.stop();LB.pause.show()}else{LB.pause.hide();setTheme(S.phase)}}

