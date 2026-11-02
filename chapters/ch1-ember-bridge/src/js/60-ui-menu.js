/* ---------- navigation entre phases ---------- */
const CARD1={get eye(){return _('Phase I · The Bridge','Phase I · Le pont')},get title(){return _('The last watch.','La dernière veille.')},
  get desc(){return _("The Colossus has reached the bridge. Behind the Watcher lies nothing but the road to the valleys. A single rule: not one step back.","Le Colosse a atteint le pont. Derrière le Veilleur, il n'y a plus que la route des vallées. Une seule règle : ne pas reculer d'un pas.")},
  get go(){return _('Start','Commencer')}};
function goPhase(n){
  pendingLore=false; // une carte de lore laissée ouverte ne doit pas avaler le bouton « Commencer » suivant
  el.go2.hidden=true;hideMenu();el.ov.classList.remove('clear');
  if(n===1){
    R=null;Q=null;setPhaseUI(1);newGame();lastP=-1;lastB=-1;hud();
    LB.card.show({eye:CARD1.eye,title:CARD1.title,desc:CARD1.desc,go:CARD1.go,onGo:start});
    say(_('Phase I.','Phase I.'));
    if(RUN.on)start();
  }else if(n===2){beginP2()}
  else{beginP3()}
}
document.querySelectorAll('#phases button').forEach(b=>b.addEventListener('click',()=>{
  goPhase(+b.dataset.ph);b.blur();
  try{if(!el.ov.hidden)el.go.focus({preventScroll:true})}catch(e){}
}));

/* ---------- input : entrées communes (LB.input, shared/js/28-ui.js) ---------- */
LB.card.setGo(start);
LB.help.mount();   /* aide visuelle : LB.help (lb-help) ; Musique, Bruitages, Aide : roue de réglages du menu (LB.settings) */
const pauseEl=$('pause');
const menuEl=$('menu');
function setPause(on){
  if(on){if(paused||!el.ov.hidden)return;paused=true;LB.pause.show()}
  else{LB.pause.hide();paused=false;if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}
}
LB.pause.bind({onResume:()=>setPause(false),onMenu:()=>{pauseEl.hidden=true;showMenu(false)}});
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
/* Menu commun (LB.menu) : scène du chapitre (page/body.html), braises, boutons de rejeu, plein écran, langues, difficultés,
   Épreuve du feu ; écran de démarrage (LB.gate). Les braises tirent Math.random ici, à la même place qu'avant. */
LB.menu.mount(CHAPTER,{
  onDiff:dk=>{applyDiff(dk);ensureAudio();if(CINE.seen())goPhase(1);else CINE.play(()=>goPhase(1))},
  onResume:()=>{hideMenu();try{if(!el.ov.hidden)el.go.focus({preventScroll:true})}catch(e){}},
  onIntro:()=>CINE.play(()=>{}),onOutro:()=>OUTRO.play(()=>{}),onLang:()=>applyLang()});
function showMenu(fromGame){
  el.table.hidden=true;paused=true;pauseEl.hidden=true;LB.menu.show(fromGame);
}
function toMenu(){LB.card.hide();showMenu(false)}   /* bouton « Menu » des cartes de défaite et de fin (LB.card, onMenu) */
function hideMenu(){paused=false;menuEl.hidden=true;pauseEl.hidden=true}
/* Épreuve du feu : Normal jouable, Difficile en attente de la phase III Difficile. */
const BASEW={flwin:T.flwin,breath:BRW}; /* fenêtres courtes du souffle (phases I et III), réglage d'attaque ; l'action et la récupération du Veilleur sont dans LB.hero */
const BASET=Object.assign({},T);
function restartRun(){
  RUN.n++;RUN.t=0;RUN.pt=[0,0,0];RUN.st={};resetRetryLabel();
  RUN.cur=RUN.max;pendingLore=false;pauseEl.hidden=true;paused=false;el.ov.hidden=true;
  goPhase(1);
}
function applyDiff(name){
  const d=DIFFS[name]||DIFFS.normal,fm=d.fm||d.m;
  DIFF=LB.diff.use(d);RUN.on=!!d.trial;RUN.max=d.hp;RUN.cur=d.hp;RUN.n=1;RUN.t=0;RUN.pt=[0,0,0];RUN.st={};RUN.name=name;resetRetryLabel();try{$('retryBtn').disabled=false}catch(e){}Object.assign(T,BASET,d.t||{});
  T.flwin=BASEW.flwin*fm;BRW=BASEW.breath*fm;
  LB.hud.track(R?3:Q?2:1,{trial:!!d.trial});   /* Épreuve : frise masquée, phases fermées */
  lastP=lastB=-1;
  LB.help.use(d);tries=[0,0,0,0];cntS=null;   /* aide mémorisée (lb-help), décochée et désactivée en Épreuve ; défaites remises à zéro */
}
$('menuBtn').addEventListener('click',e=>{showMenu(true);e.currentTarget.blur()});
/* Espace, flèche haut, W, Z, toucher : action ; relâchement ; P / Échap : pause ; R : réessayer (arène seule, sans carte) ;
   Entrée / Espace : carte, pause, menu (Normal) ; écran de démarrage : seul son bouton */
LB.input.bind({press,release:()=>{const S=R||Q||G;if(S&&S.pl)LB.hero.release(S.pl)},
  pause:()=>setPause(pauseEl.hidden),retry:()=>{if(el.ov.hidden)retryPhase()}});



