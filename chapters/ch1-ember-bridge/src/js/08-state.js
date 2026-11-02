/* ---------- state ---------- */
function makeEmbers(){return Array.from({length:70},()=>({x:rand(0,W),y:rand(0,H),v:rand(14,48),s:rand(1,2.6),ph:rand(0,6.28)}))}
function newGame(){
  const emb=G?G.embers:makeEmbers();
  G={mode:'title',time:0,php:startHP(),bhp:DIFF.bhp,blocks:0,grabs:0,
     boss:{s:'idle',t:0,wait:1.5},pl:Object.assign(LB.hero.create(),{x:PX}),
     sparks:[],rings:[],floats:[],trail:[],swTrail:[],sw:{p1:false,p2:false,p3:false},atk:{last:'',n:0,plain:0},kick:0,wound:0,p2:false,fy:null,jf:null,fin:null,ringFx:null,embers:emb,
     shake:0,flash:0,hurt:0,hitstop:0,recoil:0,endIn:0};
}
/* Remet à zéro les variantes d'attaque du Colosse (durées modifiées, double crochet, souffle enchaîné…). */
function clearMods(b){b.fli=0;b.fyb=false;b.sk=0;b.dbl=false;b.dbf=false;b.second=false;b.combo=false;b.pend=null}
function toIdle(){
  const b=G.boss;b.s='idle';b.t=0;b.fury=0;clearMods(b);
  b.wait=DIFF.hard?rand(DIFF.waitMin,DIFF.waitMax):rand(1.2,2.2);
}

function start(){
  el.go2.hidden=true;el.table.hidden=true;
  if(RUN.on&&!R&&!Q&&G&&G.mode==='lost'){restartRun();return}
  if(pendingLore){pendingLore=false;paused=false;el.ov.hidden=true;ensureAudio();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();return}
  if(R){
    if(R.mode==='lost'){if(RUN.on)restartRun();else beginP3(true);return}
    if(R.mode==='space'){showMenu(false);return}
    R=null;setPhaseUI(1);newGame();lastP=-1;lastB=-1;hud();
  }
  if(Q){
    if(Q.mode==='lost'){if(RUN.on)restartRun();else beginP2(true);return}
    if(Q.mode==='lake'){beginP3();return}
    Q=null;setPhaseUI(1);newGame();lastP=-1;lastB=-1;hud();
  }
  if(G.mode==='won'&&G.p2){beginP2();return}
  if(G.mode==='play'||G.mode==='intro')return;
  const fresh=G.mode==='title';
  if(!fresh)newGame();
  if(fresh){G.mode='intro';G.it=0;G.ix=530;G.sx=1;G.ib=0;G.ir=false;G.pl.x=-60}
  else{G.mode='play';G.boss.wait=1.2}
  el.ov.hidden=true;
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  ensureAudio();
  say(fresh?_('The Watcher takes his post on the bridge. The Colossus arrives.','Le Veilleur prend position sur le pont. Le Colosse arrive.'):_('Fight started.','Combat lancé.'));
}
function introStep(dt){
  G.it+=dt;const T=G.it,p=G.pl;
  if(!G.i0){G.i0=true;boom(1.6,.1);whoosh(1.2,.05,true)}
  if(T<2.2){const h=Math.floor(T*7.5/Math.PI);if(h!==G.ih){G.ih=h;footfall(false)}}
  if(T<1.9){const b=Math.floor(T/.42);if(b!==G.ibf){G.ibf=b;footfall(true);G.shake=reduce?0:Math.max(G.shake,3)}}
  /* le Veilleur arrive par la gauche et prend position ; le Colosse arrive par la droite */
  p.x=T<2.2?-60+(PX+60)*es(T/2.2):PX;
  G.ix=T<1.8?530*(1-eo(T/1.8)):0;
  G.sx=1;
  G.ib=T<2.2?Math.abs(Math.sin(T*7.5))*4*(1-es(clamp01((T-1.7)/.5))):0;
  if(T<2.2&&Math.random()<.25)G.sparks.push({x:p.x-14,y:DECK-2,vx:rand(-50,-10),vy:-rand(10,40),g:200,life:.35,max:.35,col:'#9a8a9e',sz:rand(2,3)});
  if(T<1.8&&Math.random()<.5)G.sparks.push({x:BX+G.ix+rand(-20,60),y:DECK-2,vx:rand(20,110),vy:-rand(10,70),g:200,life:.5,max:.5,col:'#9a8a9e',sz:rand(3,6)});
  if(T>=2.2&&!G.is){G.is=true;dust(PX,DECK);tone(200,.3,'sine',.06,-100);tone(660,.5,'sine',.04,200)}
  if(T>=3.0&&!G.ir){G.ir=true;G.shake=reduce?0:10;G.flash=.3;tone(70,.9,'sawtooth',.09,60);float(_('RAAAH!','RAAAH !'),BX-90,DECK-300,'#ffb347');roar();boom(.8,.14)}
  if(T>=4.0){G.mode='play';G.boss.wait=1.2;G.ix=0;G.sx=1;G.ib=0;say(_('Fight started.','Combat lancé.'))}
}
function press(){
  if(paused)return;
  if(R){rPress();return}
  if(Q){qPress();return}
  if(!G)return;
  if(G.mode==='title'){start();return}
  if(G.mode!=='play')return;
  ensureAudio();
  if(LB.hero.press(G.pl,'block'))tone(520,.14,'triangle',.05,320)
}
/* Carte de défaite (o : carte à montrer). Épreuve : tout reprendre. Facile : à la 3e défaite sans aide, la carte propose
   d'activer l'aide visuelle (LB.help, décision n° 3 du 28 octobre). */
function deathCard(o){
  if(RUN.on){o.go=_('Start over from Phase I','Reprendre à la phase I');o.desc+=_(' In the trial, one death sends you back to the very beginning, at full health.'," Dans l'épreuve, une mort te renvoie au tout début, en pleine forme.");return o}
  if(LB.help.defeat(DIFF.easy)){o.desc+=LB.tx(CHAPTER.help.offer);o.go2=LB.helpOffer();o.onGo2=()=>{LB.help.enable();start()}}
  return o;
}
function showEnd(){
  const win=G.mode==='won';
  const o={onGo:start,onMenu:toMenu,eye:win?(G.p2?_('Transition','Transition'):_('Phase I cleared','Phase I terminée')):_('Defeat','Défaite'),
  title:win?(G.p2?_('Phase I cleared','Phase I terminée'):_('Phase I cleared','Phase I terminée')):_('Crushed on the stone.','Écrasé sur la pierre.'),
  stats:_('Blocks ','Blocages ')+G.blocks+_(' · Hits taken ',' · Coups subis ')+G.grabs+trStr(1),
  desc:win?(G.p2?_('The Colossus smashes the bridge and dives through the breach into the foundry beneath the arch, as if he knew the way.',"Le Colosse fracasse le pont et plonge par la brèche dans la fonderie cachée sous l'arche, comme s'il en connaissait le chemin."):_(`Phase II will open with its upcoming attacks.`,`La phase II s'ouvrira avec ses prochaines attaques.`)):_(`The lantern rolls across the stones of the bridge and goes out. Nothing holds the Colossus back now: the road to the valleys lies open.`,`La lanterne roule sur les pierres du pont et s'éteint. Plus rien ne retient le Colosse : la route des vallées est ouverte.`),
  go:win?(G.p2?_('Start Phase II','Lancer la phase II'):_('Replay Phase I','Rejouer la phase I')):_('Retry','Réessayer')};
  LB.card.show(win?o:deathCard(o));
}

