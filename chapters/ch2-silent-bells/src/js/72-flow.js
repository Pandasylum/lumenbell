/* ---------- flow ---------- */
let lastCard=null,onGo=null,onGo2=null;
function setTheme(id){if($('optMus').checked)MUSIC.play(id);else MUSIC.stop()}
function showCard(o){lastCard=o;
  $('ovEye').textContent=o.eye||'';$('ovTitle').textContent=o.title||'';$('ovDesc').textContent=o.desc||'';
  const how=$('ovHow');how.hidden=!o.how;how.textContent=o.how||'';
  const tb=$('ovTable');tb.hidden=!o.table;tb.innerHTML='';if(o.table)for(const r of o.table){const d=document.createElement('div');if(r[2])d.className='rec';d.innerHTML='<small></small><b></b>';d.firstChild.textContent=r[0];d.lastChild.textContent=r[1];tb.appendChild(d)}
  $('go').textContent=o.go;onGo=o.onGo;const g2=$('go2');g2.hidden=!o.go2;g2.textContent=o.go2||'';onGo2=o.onGo2||null;
  $('ov').hidden=false;setTimeout(()=>{try{$('go').focus({preventScroll:true})}catch(e){}},30);
}
function hideCard(){$('ov').hidden=true}
function playCine(id,k,cb){
  MUSIC.stop();S.phase=id;resetCine(S);S.parts=[];S.pops=[];S.cine={k,t0:gt};S.cineCb=cb;S.mode='cine';S.paused=false;
  S.tfBurst=S.tfFlash=S.tfAnch=false;S.tfId=(S.tfId||0)+1;S.flashT=-9;S.shake=0;
  hideCard();hud();if($('optMus').checked)MUSIC.bed(id);$('skip').hidden=false;
}
function endCine(){if(S.mode!=='cine')return;const cb=S.cineCb;S.cineCb=null;resetCine(S);MUSIC.bedStop();$('skip').hidden=true;S.mode='card';cb&&cb()}
function playPrologue(cb){MUSIC.stop();S.mode='prologue';S.proT0=gt;S.cineDone={};S.parts=[];S.pops=[];S.proCb=cb;hideCard();if($('optMus').checked)MUSIC.bed(2);$('skip').hidden=false;$('hdEye').textContent='Prologue'}
function endPrologue(){if(S.mode!=='prologue')return;const cb=S.proCb;S.proCb=null;MUSIC.bedStop();$('skip').hidden=true;S.mode='card';cb&&cb()}
function resetPhaseState(){Object.assign(S,{angerShown:false,rageN:0,rageNext:0,roarT:-9,roarD:0,finalDone:false,hide:null,walkLegs:null,bodyBob:0,threats:[],pat:null,cnt:null,koShown:false,koBurst:false,deadShown:false,broken:0,ecPhi:0,holding:false,pl:newPl(),post:null,rust:null,still:0,hitstop:0,flashHit:0,recoil:0,rings:[],bossHurtT:null})}
function enterPhase(id,o){o=o||{};
  S.phase=id;S.form=1;S.bossMax=S.d.boss;S.bossHp=S.bossMax;if(S.d.heal||o.first)S.hp=S.hpMax;resetPhaseState();
  hud();playCine(id,'in',()=>introCard(id));
}
function introCard(id){S.mode='card';const P=PH[id];showCard({eye:P.eye(),title:P.boss(),desc:P.desc(),go:_('Start','Commencer'),onGo:beginPlay})}
function beginPlay(){hideCard();S.mode='play';S.paused=false;S.nextAt=gt+1.1;setTheme(S.phase);try{$('ward').focus({preventScroll:true})}catch(e){};hud();say(PH[S.phase].head())}
function phaseCleared(){
  MUSIC.stop();const id=S.phase;
  if(id===3&&S.form===1){playCine(3,'p2',()=>{S.form=2;S.bossHp=S.bossMax;resetPhaseState();hud();beginPlay()});return}
  LB.store.set(LB.key('unl'),String(Math.max(+LB.store.get(LB.key('unl'),1),Math.min(3,gpOf(id)+1))));
  if(id===3){playCine(3,'out',()=>clearedCard(3));return}
  playCine(id,'out',()=>clearedCard(id));
}
function clearedCard(id){S.mode='card';S.still=id;const next=ORDER[gpOf(id)];
  showCard({eye:[null,_('Phase II cleared','Phase II terminée'),_('Phase I cleared','Phase I terminée'),_('Phase III cleared','Phase III terminée')][id],title:PH[id].boss(),desc:PH[id].end(),
    go:_('Continue','Continuer'),onGo:id===3?()=>playEpilogue(victory):()=>enterPhase(next),go2:id===3?null:_('Menu','Menu'),onGo2:showMenu});
}
function fmt(t){const m=Math.floor(t/60),s=Math.floor(t%60);return m+':'+String(s).padStart(2,'0')}
function victory(){S.mode='won';if(MUSIC.cur!==4)setTheme(4);
  const t=S.runT,key=LB.key('best-'+S.dk),rec=+LB.store.get(key,0);let isRec=false;
  if(S.full&&(!rec||t<rec)){LB.store.set(key,String(t));isRec=true}
  const best=S.full?(isRec?t:rec):rec;
  showCard({eye:_('Victory','Victoire')+' · '+S.d[LB.lang.cur],title:_('Chapter II · Silent Bells','Chapitre II · Silent Bells'),
    table:[[_('Time','Temps'),fmt(t)],[_('Hits taken','Coups reçus'),S.hits],[_('Perfects','Parfaits'),S.perfects],[_('Best','Record'),best?fmt(best):'—',true]],
    desc:(isRec?_('New record. ','Nouveau record. '):'')+(S.full?'':_('Records only count for runs started from the beginning.','Le record ne compte que pour une partie lancée depuis le début.')),
    go:_('Play again','Rejouer'),onGo:()=>startRun(S.dk),go2:_('Menu','Menu'),onGo2:showMenu});
}
function deathCard(){MUSIC.stop();const tr=S.d.trial;
  showCard({eye:_('Defeat','Défaite'),title:_('The Watcher is down.','Le Veilleur est à terre.'),
    desc:tr?_('Trial: one fall sends you back to Phase I.','Épreuve : une chute te renvoie à la phase I.'):'',
    go:tr?_('Restart','Recommencer'):_('Retry phase','Réessayer la phase'),onGo:()=>tr?startRun(S.dk,true):retryPhase(),go2:_('Menu','Menu'),onGo2:showMenu});
}
/* retry: from the start of the phase; in phase III that is form I, even after a defeat in form II (as in Ember Bridge) */
function retryPhase(){S.hp=S.hpMax;S.bossHp=S.bossMax;resetPhaseState();S.form=1;S.mode='card';hud();beginPlay()}
function startRun(dk,noPro){
  S=fresh(dk);S.full=true;S.phase=2;S.form=1;S.cineDone={};
  $('optHelp').checked=dk==='easy'?true:DIFFS[dk].trial?false:$('optHelp').checked;$('optHelp').disabled=!!DIFFS[dk].trial;
  hideMenu();hud();
  if(noPro)enterPhase(2,{first:true});else playPrologue(()=>enterPhase(2,{first:true}));
}
function jumpPhase(gp){if(S.d.trial||S.mode==='menu')return;const id=ORDER[gp-1],dk=S.dk;$('pause').hidden=true;S=fresh(dk);S.full=false;S.cineDone={};enterPhase(id,{first:true})}
function showMenu(){
  const wasPlay=S.mode==='play';if(wasPlay)S.paused=true;
  if(S.mode==='cine'||S.mode==='prologue'||S.mode==='epilogue'||S.mode==='won'||S.mode==='dead'){S.mode='menu';lastCard=null}
  $('mResume').hidden=!(wasPlay||(S.mode==='card'&&lastCard));
  hideCard();$('pause').hidden=true;$('skip').hidden=true;$('menu').hidden=false;$('mphM').hidden=false;$('mphT').hidden=true;
  MUSIC.bedStop();setTheme(4);
}
function hideMenu(){$('menu').hidden=true}
function setPause(p){if(S.mode!=='play')return;S.paused=p;$('pause').hidden=!p;if(p){up();MUSIC.stop();try{$('pResume').focus({preventScroll:true})}catch(e){}}else setTheme(S.phase)}

