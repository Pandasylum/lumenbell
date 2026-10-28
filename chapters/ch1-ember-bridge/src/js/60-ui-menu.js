/* ---------- navigation entre phases ---------- */
const CARD1={get eye(){return _('Phase I · The Bridge','Phase I · Le pont')},get title(){return _('The last watch.','La dernière veille.')},
  get desc(){return _("The Colossus has reached the bridge. Behind the Watcher lies nothing but the road to the valleys. A single rule: not one step back.","Le Colosse a atteint le pont. Derrière le Veilleur, il n'y a plus que la route des vallées. Une seule règle : ne pas reculer d'un pas.")},
  get go(){return _('Start','Commencer')}};
function goPhase(n){
  pendingLore=false; // une carte de lore laissée ouverte ne doit pas avaler le bouton « Commencer » suivant
  el.go2.hidden=true;hideMenu();el.ov.classList.remove('clear');
  if(n===1){
    R=null;Q=null;setPhaseUI(1);newGame();lastP=-1;lastB=-1;hud();
    el.eye.textContent=CARD1.eye;el.title.textContent=CARD1.title;el.desc.textContent=CARD1.desc;el.go.textContent=CARD1.go;
    el.stats.hidden=true;el.ov.hidden=false;
    say(_('Phase I.','Phase I.'));
    if(RUN.on)start();
  }else if(n===2){beginP2()}
  else{beginP3()}
}
document.querySelectorAll('#phases button').forEach(b=>b.addEventListener('click',()=>{
  goPhase(+b.dataset.ph);b.blur();
  try{if(!el.ov.hidden)el.go.focus({preventScroll:true})}catch(e){}
}));

/* ---------- input ---------- */
cv.addEventListener('pointerdown',e=>{e.preventDefault();press()});
el.ward.addEventListener('pointerdown',e=>{e.preventDefault();press()});
el.ward.addEventListener('click',e=>{if(e.detail===0)press()});
el.go.addEventListener('click',start);
el.help.checked=prefs.help;el.snd.checked=prefs.sound;$('optMus').checked=prefs.music;
el.help.addEventListener('change',()=>{prefs.help=el.help.checked;LB.store.set(LB.key('help'),prefs.help?'1':'0')});
el.snd.addEventListener('change',()=>{prefs.sound=el.snd.checked;LB.store.set(LB.key('snd'),prefs.sound?'1':'0');if(prefs.sound)ensureAudio()});
$('optMus').addEventListener('change',()=>{prefs.music=$('optMus').checked;LB.store.set(LB.key('mus'),prefs.music?'1':'0');if(prefs.music)ensureAudio()});
const pauseEl=$('pause');
const menuEl=$('menu');
function setPause(on){
  if(on){if(paused||!el.ov.hidden)return;paused=true;pauseEl.hidden=false;try{$('pResume').focus({preventScroll:true})}catch(e){}}
  else{pauseEl.hidden=true;paused=false;if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}
}
$('pResume').addEventListener('click',()=>setPause(false));
$('pMenu').addEventListener('click',()=>{pauseEl.hidden=true;showMenu(true)});
$('pauseBtn').addEventListener('click',e=>{setPause(true);e.currentTarget.blur()});
/* Épreuve : Réessayer = abandonner la run (compte comme une défaite), avec confirmation pour éviter les faux appuis. */
let abandonT=0,abandonTm=0;
function resetRetryLabel(){abandonT=0;clearTimeout(abandonTm);try{$('retryBtn').textContent=_('Retry','Réessayer')}catch(e){}}
function abandonRun(){
  if(abandonT){resetRetryLabel();restartRun();return}
  abandonT=1;$('retryBtn').textContent=_('Give up?','Abandonner ?');
  say(_('Press Retry again to give up the run and start over from Phase I.','Rappuie sur Réessayer pour abandonner la run et repartir de la phase I.'));
  abandonTm=setTimeout(resetRetryLabel,3000);
}
/* Réessayer : relance la phase en cours, sans carte ni lore. */
function retryPhase(){
  if(!menuEl.hidden)return;
  if(RUN.on){abandonRun();return}
  pendingLore=false;pauseEl.hidden=true;paused=false;el.ov.hidden=true;el.go2.hidden=true;el.ov.classList.remove('clear');
  ensureAudio();
  if(R)beginP3(true);
  else if(Q)beginP2(true);
  else{newGame();G.mode='play';G.boss.wait=1.2;lastP=lastB=-1;hud();say(_('Phase I. New attempt.','Phase I. Nouvel essai.'))}
}
$('retryBtn').addEventListener('click',e=>{e.currentTarget.blur();retryPhase()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true)});
/* Plein écran : API standard (ou préfixée Safari) ; bouton masqué si indisponible (iPhone). */
{const de=document.documentElement,rq=de.requestFullscreen||de.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen,
  isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement),
  btns=document.querySelectorAll('.fsb');
 if(!rq){btns.forEach(b=>b.hidden=true)}
 else btns.forEach(b=>b.addEventListener('click',e=>{e.currentTarget.blur();try{const r=isFs()?ex.call(document):rq.call(de);if(r&&r.catch)r.catch(()=>{})}catch(x){}}));
}
function showMenu(fromGame){
  $('ovTable').hidden=true;paused=true;pauseEl.hidden=true;menuEl.hidden=false;el.ov.classList.remove('clear');
  $('mphM').hidden=false;$('mphT').hidden=true;$('trialNote').hidden=true;
  $('mResume').hidden=!fromGame;
  try{(fromGame?$('mResume'):document.querySelector('#menu [data-diff=normal]')).focus({preventScroll:true})}catch(e){}
}
function hideMenu(){paused=false;menuEl.hidden=true;pauseEl.hidden=true}
$('mResume').addEventListener('click',()=>{hideMenu();try{if(!el.ov.hidden)el.go.focus({preventScroll:true})}catch(e){}});
(function(){const sv=document.querySelector('.mscene');function fit(){const r=innerWidth/innerHeight;sv.setAttribute('preserveAspectRatio',r<1.2?'xMidYMax meet':'xMidYMax slice')}fit();addEventListener('resize',fit)})();
(function(){const w=$('mEmbers');for(let i=0;i<26;i++){const e=document.createElement('i');e.className='mem';e.style.left=(Math.random()*100)+'%';e.style.setProperty('--dx',((Math.random()-.5)*160)+'px');e.style.animationDuration=(5+Math.random()*7)+'s';e.style.animationDelay=(-Math.random()*10)+'s';const z=2+Math.random()*3;e.style.width=e.style.height=z+'px';w.appendChild(e)}})();
/* Épreuve du feu : Normal jouable, Difficile en attente de la phase III Difficile. */
const BASEW={barrier:T.barrier,flwin:T.flwin,dodge:DG.act,guard:R_T.guard,breath:BRW,rec:T.recovery,drec:DG.rec,rrec:R_T.rec};
const BASET=Object.assign({},T);
function restartRun(){
  RUN.n++;RUN.t=0;RUN.pt=[0,0,0];RUN.st={};resetRetryLabel();
  RUN.cur=RUN.max;pendingLore=false;pauseEl.hidden=true;paused=false;el.ov.hidden=true;
  goPhase(1);
}
function applyDiff(name){
  const d=DIFFS[name]||DIFFS.normal,m=d.m,fm=d.fm||m,rm=d.rm||1;
  DIFF=d;RUN.on=!!d.trial;RUN.max=d.php;RUN.cur=d.php;RUN.n=1;RUN.t=0;RUN.pt=[0,0,0];RUN.st={};RUN.name=name;resetRetryLabel();try{$('retryBtn').disabled=false;$('phases').style.display=RUN.on?'none':''}catch(e){}Object.assign(T,BASET,d.t||{});
  T.barrier=BASEW.barrier*m;T.flwin=BASEW.flwin*fm;DG.act=BASEW.dodge*m;R_T.guard=BASEW.guard*m;BRW=BASEW.breath*fm;
  T.recovery=BASEW.rec*rm;DG.rec=BASEW.drec*rm;R_T.rec=BASEW.rrec*rm;
  document.querySelectorAll('#phases button').forEach((b,i)=>{b.disabled=!!d.trial;b.title=d.trial?_('Not available in the trial','Indisponible dans l\'épreuve'):''});
  lastP=lastB=-1;
  prefs.help=el.help.checked=!d.noHelp&&LB.store.get(LB.key('help'),'0')==='1';deaths=0; /* aide mémorisée (lb-help), toujours coupée là où elle est masquée */tries=[0,0,0,0];cntS=null;
  el.help.closest('label').hidden=!!d.noHelp;
}
function trialMenu(on){updBest();$('mphM').hidden=on;$('mphT').hidden=!on;$('trialNote').hidden=!on;try{(on?$('mphT').querySelector('button'):$('mphM').querySelector('[data-diff=normal]')).focus({preventScroll:true})}catch(e){}}
$('mBackT').addEventListener('click',()=>trialMenu(false));
document.querySelectorAll('#menu .mph button').forEach(b=>b.addEventListener('click',()=>{
  if(b.disabled||!b.dataset.diff)return;
  if(b.dataset.diff==='trial'&&!endSeen()){b.blur();return} /* verrouillée : aucun message, le cadenas suffit */
  if(b.dataset.diff==='trial'){trialMenu(true);return}
  applyDiff(b.dataset.diff);
  document.querySelectorAll('#menu .mph button').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));
  ensureAudio();
  if(CINE.seen())goPhase(1);else CINE.play(()=>goPhase(1));
}));
$('menuBtn').addEventListener('click',e=>{showMenu(true);e.currentTarget.blur()});
window.addEventListener('keydown',e=>{
  if(e.repeat)return;
  if(!$('gate').hidden)return; /* écran de démarrage : seul le bouton agit */
  const k=e.key;
  if(document.activeElement&&document.activeElement.tagName==='INPUT')return;
  if((k==='r'||k==='R')&&menuEl.hidden&&el.ov.hidden){e.preventDefault();retryPhase();return}
  if((k==='p'||k==='P'||k==='Escape')&&menuEl.hidden){e.preventDefault();setPause(pauseEl.hidden);return}
  if(!pauseEl.hidden){if((k===' '||k==='Enter')&&document.activeElement!==$('pMenu')){e.preventDefault();setPause(false)}return}
  if(!menuEl.hidden){
    if((k===' '||k==='Enter')&&!menuEl.contains(document.activeElement)){e.preventDefault();document.querySelector('#menu [data-diff=normal]').click()}
    return;
  }
  if(!el.ov.hidden){
    if((k===' '||k==='Enter')&&document.activeElement!==el.go){e.preventDefault();el.go.click()}
    return;
  }
  if(k===' '||k==='Spacebar'||k==='ArrowUp'||k==='w'||k==='W'||k==='z'||k==='Z'){e.preventDefault();press()}
});



