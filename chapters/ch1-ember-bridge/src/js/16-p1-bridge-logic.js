/* ---------- game logic ---------- */
function liftAmt(){
  if(G.pl.s==='final'){const t=G.pl.t;return 80*Math.sin(Math.PI*clamp01((t-2.9)/.7))-clamp01((t-3.3)/.5)*430}
  const b=G.boss;
  if(b.s==='lift')return b.t<.12?0:LIFT_MAX*eo(clamp01((b.t-.12)/.43));
  if(b.s==='hold')return LIFT_MAX;
  if(b.s==='slam')return LIFT_MAX*(1-ei(clamp01(b.t/.16)));
  return 0;
}
/* Le bouclier est levé (ou vient juste de retomber : tolérance de 0,06 s). */
function blocked(){const p=G.pl;return p.s==='barrier'||(p.s==='recover'&&p.t<.06)}
function resolveStrike(){
  const p=G.pl,b=G.boss;
  const warded=blocked();
  if(warded&&b.dbl){ /* chaîne double : premier coup paré, le second arrive 0,5 s plus tard */
    b.dbl=false;b.sk=.32;
    parrySuccess(BAR[0],BAR[1]);
    b.s='rewind';b.t=0;
    say(_('First hit parried.','Premier coup paré.'));
    return;
  }
  b.dbl=false;b.sk=0;
  if(warded){
    if(b.combo)startComboFlame('head');else{b.s='rebound';b.t=0}
    G.parries++;G.hitstop=.08;G.flash=.35;G.shake=Math.max(G.shake,reduce?0:5);thud(.4);
    ring(BAR[0],BAR[1]);
    burst(BAR[0],BAR[1],26,['#bfeaff','#6fd3ff','#ffffff']);
    float(_('PARRY!','PARADE !'),BAR[0]-30,BAR[1]-110,'#bfeaff');
    tone(880,.28,'square',.05,-260);tone(1400,.2,'sine',.04);
    say(_('Parry successful.','Parade réussie.'));
  }else{
    b.s='lift';b.t=0;p.s='grabbed';p.t=0;
    float(_('HOOKED!','ACCROCHÉ !'),PX,DECK-190,'#ff8a6b');
    tone(150,.2,'sawtooth',.06,-80);
    say(_('Caught by the hook.','Accroché par le crochet.'));
  }
}
function headHit(){
  const b=G.boss;
  G.bhp=Math.max(0,G.bhp-DMG_PARRY);G.recoil=1;G.shake=reduce?0:13;G.hitstop=.11;G.flash=.4;thud(1.2);ring(HEAD[0],HEAD[1]);
  burst(HEAD[0],HEAD[1],22,['#ffffff','#ffc15a','#ff7a2b']);
  tone(170,.25,'square',.08,-110);
  if(G.bhp<=0){b.s='dead';b.t=0;G.mode='won';G.endIn=1.4;say(_('The Colossus is on his knees. Phase I cleared.','Le Colosse est à genoux. Phase I terminée.'))}
  else{b.s='stagger';b.t=0;b.stagT=0}
}
function slamHit(){
  const b=G.boss,p=G.pl;
  G.php=Math.max(0,G.php-DMG_GRAB);G.grabs++;G.shake=reduce?0:15;G.hurt=.35;G.hitstop=.1;thud(1.3);
  dust(PX,DECK);tone(80,.35,'sine',.14,-40);burst(PX+10,DECK-60,24,['#ffc15a','#ff7a2b','#ffffff']);float(_('BOOM!','BOUM !'),PX,DECK-190,'#ff8a6b');
  p.s='down';p.t=0;p.downT=.9;b.s='release';b.t=0;
  if(G.php<=0){G.mode='lost';G.endIn=1.1;say(_('You are down. Defeat.','Tu es à terre. Défaite.'))}
}
function startAttack(){
  const b=G.boss,a=G.atk;
  if(DIFF.fury[G.bhp]){startFury(DIFF.fury[G.bhp]);return}
  const kinds=['whip','sword','flame'];
  let k=a.last===''?'whip':kinds[Math.floor(Math.random()*3)];
  if(k===a.last&&a.n>=2){const o=kinds.filter(x=>x!==k);k=o[Math.floor(Math.random()*2)]}
  /* Difficile : un crochet ou un marteau peut être suivi de souffles sans respiration ; le contre n'arrive qu'après les avoir parés. */
  let combo=false;
  if(DIFF.hard&&k!=='flame'){
    const c=DIFF.chain.find(x=>G.bhp<=x[0]);
    combo=!!c&&(a.plain>=2||Math.random()<c[1]);
  }
  a.n=(k===a.last)?a.n+1:1;a.last=k;
  b.t=0;clearMods(b);b.combo=combo;
  /* Difficile : « plain » compte les attaques simples d'affilée (crochet simple, souffle normal) pour que les variantes reviennent régulièrement. */
  const was=a.plain;
  a.plain=(k==='sword'||combo)?0:was+1;
  if(k==='whip'){
    b.s='windup';tone(110,.5,'sawtooth',.03,60);
    if(DIFF.hard&&(Math.random()<.5||was>=1)){b.dbl=true;dblTell()} /* chaîne double (garantie après une attaque « simple ») */
  }
  else if(k==='sword'){b.s='sw1w';G.sw.p1=false;G.sw.p2=false;G.sw.p3=false;tone(180,.6,'sawtooth',.04,140)}
  else{
    b.s='fl_in';tone(90,.6,'sawtooth',.05,90);
  }
  if(k==='whip'&&b.dbl)a.plain=0;
}
function parrySuccess(x,y){
  const p=G.pl;
  G.parries++;G.hitstop=.08;G.flash=.35;G.shake=Math.max(G.shake,reduce?0:5);thud(.4);
  ring(x,y);burst(x,y,26,['#bfeaff','#6fd3ff','#ffffff']);
  float(_('PARRY!','PARADE !'),x-30,y-110,'#bfeaff');
  tone(880,.28,'square',.05,-260);tone(1400,.2,'sine',.04);
  p.s='ready';p.t=0;
}
function resolveSword(n){
  const b=G.boss,p=G.pl,pt=n===2?VHIT:BAR;
  const warded=blocked();
  anvil();forgeSparks(G,warded?pt[0]:PX+10,warded?pt[1]:DECK-70,warded?16:10);
  G.sw['p'+n]=warded;
  G.kick=warded?1:0;
  if(warded){
    parrySuccess(pt[0],pt[1]);
    say([_('First','Premier'),_('Second','Second'),_('Third','Troisième')][n-1]+_(' hit parried.',' coup paré.'));
  }else{
    G.php=Math.max(0,G.php-DMG_SWORD);G.grabs++;
    G.shake=reduce?0:13;G.hurt=.3;G.hitstop=.07;thud(1);
    burst(PX+10,DECK-70,16,['#ffc15a','#ff7a2b','#ffffff']);dust(PX,DECK);
    float(_('HIT!','COUP !'),PX,DECK-190,'#ff8a6b');
    tone(90,.3,'sine',.12,-40);
    p.s='down';p.t=0;p.downT=n<(DIFF.hard?3:2)?.3:.55; /* un coup suit : on se relève assez vite pour parer */
    say(_(`Struck by the hammer.`,`Frappé par le marteau.`));
    if(G.php<=0){G.mode='lost';G.endIn=1.1;say(_('You are down. Defeat.','Tu es à terre. Défaite.'))}
  }
  const last=DIFF.hard?3:2;
  if(n===1){b.s='swgap';b.t=0}
  else if(n<last){b.s='sw3g';b.t=0}
  else if(G.sw.p1&&G.sw.p2&&(!DIFF.hard||G.sw.p3)){
    if(b.combo)startComboFlame('orb');else startOrb();
  }else{b.s='swrec';b.t=0}
}
/* Combo paré : le Veilleur lance l'orbe de lumière. */
function startOrb(){
  const b=G.boss,p=G.pl;
  b.s='orb';b.t=0;p.s='cast';p.t=0;
  float(DIFF.hard?_('TRIPLE PARRY!','TRIPLE PARADE !'):_('DOUBLE PARRY!','DOUBLE PARADE !'),PX+150,DECK-250,'#ffffff');
  tone(400,.6,'sine',.05,400);
  say(_('Combo parried. The Watcher hurls an orb of light.','Combo paré. Le Veilleur lance une orbe de lumière.'));
}
function orbHit(){
  const b=G.boss;
  G.bhp=Math.max(0,G.bhp-DMG_ORB);G.recoil=1;G.shake=reduce?0:12;G.hitstop=.12;G.flash=.6;
  ring(ORB_T[0],ORB_T[1]);
  burst(ORB_T[0],ORB_T[1],36,['#ffffff','#fff2b8','#bfeaff','#ffc15a']);
  tone(660,.5,'sine',.08,500);tone(200,.3,'square',.06,-120);thud(1.3);cry1(true);
  if(G.bhp<=0){b.s='dead';b.t=0;G.mode='won';G.endIn=1.4;say(_('The Colossus is on his knees. Phase I cleared.','Le Colosse est à genoux. Phase I terminée.'))}
  else{b.s='hurt';b.t=0;b.hurtT=1.1;say(_('Orb of light, dead center.','Orbe de lumière en plein cœur.'))}
}
function dblTell(){tone(1100,.08,'square',.045,-200);setTimeout(()=>tone(1100,.08,'square',.045,-200),110)}
/* Après un crochet ou un marteau paré : deux souffles sans respiration ; le contre (pend) n'est donné qu'une fois les deux parés. */
function startComboFlame(pend){
  const b=G.boss,p=G.pl;
  b.pend=pend;b.s='fl_in';b.t=0;b.fli=.35;b.dbf=true;b.second=false;
  p.s='ready';p.t=0;
  chainTell();
  say(pend==='head'?_('Hit parried. Flames follow!','Coup paré. Des souffles enchaînent !'):_('Combo parried. Flames follow!','Combo paré. Des souffles enchaînent !'));
}
function chainTell(){tone(1500,.14,'square',.05,-800);tone(950,.24,'sawtooth',.04,-350);G.flash=Math.max(G.flash,.2)}
function resolveFlame(){
  const b=G.boss,p=G.pl;
  const warded=p.s==='barrier'&&p.t<=T.flwin+.03;
  if(warded&&b.dbf&&!b.second){ /* premier souffle paré : le second arrive 0,3 s plus tard */
    b.second=true;b.s='fl_in';b.t=0;b.fli=.3;
    parrySuccess(BAR[0],BAR[1]);chainTell();
    say(_('Breath parried. A second breath is coming!','Souffle paré. Un second souffle arrive !'));
    return;
  }
  b.dbf=false;
  b.pend=null;
  if(warded){
    parrySuccess(BAR[0],BAR[1]);
    p.s='dash';p.t=0;b.s='fl_stab';b.t=0;
    tone(500,.3,'sawtooth',.05,300);
    say(_('Breath parried. The Watcher rushes the Colossus.','Souffle paré. Le Veilleur fonce sur le Colosse.'));
  }else{
    G.php=Math.max(0,G.php-DMG_FLAME);G.grabs++;
    G.shake=reduce?0:13;G.hurt=.4;G.hitstop=.08;thud(1.2);
    burst(PX+10,DECK-70,24,['#ffc15a','#ff7a2b','#ff4d1a']);
    float(_('BURNED!','BRÛLÉ !'),PX,DECK-190,'#ff8a6b');
    tone(120,.5,'sawtooth',.1,-60);
    p.s='down';p.t=0;p.downT=.9;b.s='fl_rec';b.t=0;
    say(_('Burned by the flame breath.','Brûlé par le souffle de flamme.'));
    if(G.php<=0){G.mode='lost';G.endIn=1.1;say(_('You are down. Defeat.','Tu es à terre. Défaite.'))}
  }
}
function legHit(){
  const b=G.boss;
  G.bhp=Math.max(0,G.bhp-DMG_STAB);G.recoil=.6;G.shake=reduce?0:11;G.hitstop=.1;G.flash=.3;G.wound=1.6;
  burst(BX-62,DECK-58,26,['#ffc15a','#ff7a2b','#ffffff']);
  tone(220,.25,'square',.08,-120);tone(90,.3,'sawtooth',.06,-40);cry1(false);
  for(let i=0;i<26;i++){const L=rand(.4,.9);G.sparks.push({x:BX-62+rand(-14,14),y:DECK-58,vx:rand(-120,60),vy:-rand(160,420),g:-40,life:L,max:L,col:['#ffc15a','#ff7a2b','#fff2b8'][i%3],sz:rand(4,9)})}
  if(G.bhp<=0){b.s='dead';b.t=0;G.mode='won';G.endIn=1.4;say(_('The Colossus is on his knees. Phase I cleared.','Le Colosse est à genoux. Phase I terminée.'))}
  else{b.s='hurt';b.t=0;b.hurtT=1;say(_(`The lantern flares: the Colossus's leg goes dark.`,`La lanterne éclate : la jambe du Colosse noircit.`))}
}
/* j = jet de feu, b = souffle, r = rocher. Normal : jets (+ rocher à 1 PV). Difficile : séquences propres à chaque rage. */
function furySeq(lvl){
  if(DIFF.hard)return {5:'jjjjjj',6:'jjbbjj',1:'jjbbrrr'}[lvl].split('');
  return ('j'.repeat(DIFF.jets)+(lvl===1?'r':'')).split('');
}
function startFury(lvl){
  const b=G.boss,seq=furySeq(lvl);
  G.fy={lvl,i:0,miss:0,seq,ok:seq.map(()=>false),rocks:0};
  b.s='fy_roar';b.t=0;b.fury=lvl;
  tone(70,1,'sawtooth',.08,40);
  say(_('The Colossus flies into a fury.','Le Colosse entre en fureur.'));
}
function hurtPlayer(label){
  const p=G.pl;
  G.php=Math.max(0,G.php-1);G.grabs++;G.shake=reduce?0:13;G.hurt=.35;G.hitstop=.07;thud(1);
  burst(PX+10,DECK-70,22,['#ffc15a','#ff7a2b','#ff4d1a']);dust(PX,DECK);
  float(ono(label)||'BAM',PX,DECK-190,'#ff8a6b');
  tone(110,.4,'sawtooth',.1,-60);
  p.s='down';p.t=0;p.downT=.55;
  say(_('Hit.','Touché.'));
  if(G.php<=0){G.mode='lost';G.endIn=1.1;say(_('You are down. Defeat.','Tu es à terre. Défaite.'))}
}
/* Étape suivante de la fureur (ou fin). */
function fyEnter(c){
  const b=G.boss,F=G.fy;
  b.t=0;clearMods(b);
  if(c==='j')b.s=F.i?'fy_gap':'fy_t';
  else if(c==='r'){b.s='rk_t';b.rki=F.rocks++%RKX.length}
  else{b.s='fl_in';b.fyb=true;b.fli=F.seq[F.i-1]==='b'?.3:.45;tone(90,.5,'sawtooth',.05,90)}
}
function fyDone(){
  const F=G.fy;
  F.i++;
  if(G.mode!=='play'||F.i>=F.seq.length)endFury();
  else fyEnter(F.seq[F.i]);
}
function resolveJet(){
  const F=G.fy;
  const warded=blocked();
  F.ok[F.i]=warded;
  G.jf={o:JET_O[F.i%4],t:.22};
  if(warded){parrySuccess(BAR[0],BAR[1])}
  else{F.miss++;hurtPlayer(_('BURNED!','BRÛLÉ !'))}
  fyDone();
}
function resolveFuryBreath(){
  const p=G.pl,F=G.fy;
  const warded=p.s==='barrier'&&p.t<=T.flwin+.03;
  F.ok[F.i]=warded;
  if(warded){parrySuccess(BAR[0],BAR[1]);float(_('PARRIED!','PARÉ !'),BAR[0]+60,BAR[1]-170,'#ffd166')}
  else{F.miss++;burst(PX+10,DECK-70,24,['#ffc15a','#ff7a2b','#ff4d1a']);hurtPlayer(_('BURNED!','BRÛLÉ !'))}
  fyDone();
}
function resolveRock(){
  const F=G.fy;
  const warded=blocked();
  F.ok[F.i]=warded;
  burst(RK[0],RK[1],warded?20:34,['#ff9a3c','#ffc15a','#6b5a63','#ffffff']);
  if(warded){parrySuccess(RK[0],RK[1]);say(_('Rock parried.','Rocher paré.'))}
  else{F.miss++;hurtPlayer(_('CRUSHED!','ÉCRASÉ !'))}
  fyDone();
}
function endFury(){
  const b=G.boss,p=G.pl,F=G.fy;
  if(G.mode!=='play'||F.miss>0){b.s='fy_fail';b.t=0;return}
  if(F.lvl===5||F.lvl===6){
    b.s='fy_cast';b.t=0;p.s='ring';p.t=0;p.fired=false;
    say(_('Fury parried. The Watcher raises his lantern.','Fureur parée. Le Veilleur lève sa lanterne.'));
  }else startFinal();
}
function startFinal(){
  const b=G.boss,p=G.pl;
  b.s='fin';b.t=0;p.s='final';p.t=0;p.fired=true;
  G.fin={a:false,b:false,c:false};
  G.mode='won';G.p2=true;G.endIn=3.9;
  say(_('The Watcher raises his lantern.','Le Veilleur lève sa lanterne.'));
}
function ringHit(){
  const b=G.boss;
  G.bhp=Math.max(0,G.bhp-1);G.recoil=1;G.shake=reduce?0:12;G.hitstop=.12;G.flash=.6;
  burst(BX-70,DECK-150,36,['#ffffff','#fff2b8','#bfeaff']);
  tone(660,.5,'sine',.08,500);thud(1.3);cry1(true);
  b.s='hurt';b.t=0;b.hurtT=1.25;b.fury=0;
  say(_("The lantern's halo strikes the Colossus.",'Le halo de la lanterne frappe le Colosse.'));
}
function bossStep(dt){
  const b=G.boss;b.t+=dt;
  switch(b.s){
    case 'idle':if(G.mode==='play'&&b.t>=b.wait)startAttack();break;
    case 'windup':if(b.t>=T.windup){b.s='strike';b.t=0;tone(260,.14,'sawtooth',.06,-160)}break;
    case 'rewind':if(b.t>=.18){b.s='strike';b.t=0;tone(260,.14,'sawtooth',.06,-160)}break;
    case 'strike':if(b.t>=(b.sk||T.strike))resolveStrike();break;
    case 'rebound':if(b.t>=T.rebound)headHit();break;
    case 'stagger':if(b.t>=(b.stagT||T.stagger))toIdle();break;
    case 'lift':if(b.t>=.55){b.s='hold';b.t=0}break;
    case 'hold':if(b.t>=.22){b.s='slam';b.t=0}break;
    case 'slam':if(b.t>=.16)slamHit();break;
    case 'release':if(b.t>=.6)toIdle();break;
    case 'sw1w':if(b.t>=T.sw1w){b.s='sw1';b.t=0;tone(300,.12,'sawtooth',.06,-180)}break;
    case 'sw1':if(b.t>=T.sw1)resolveSword(1);break;
    case 'swgap':if(b.t>=T.swgap){b.s='sw2w';b.t=0}break;
    case 'sw2w':if(b.t>=T.sw2w){b.s='sw2';b.t=0;tone(240,.14,'sawtooth',.06,-160)}break;
    case 'sw2':if(b.t>=T.sw2)resolveSword(2);break;
    case 'sw3g':if(b.t>=T.sw3g){b.s='sw3w';b.t=0}break;
    case 'sw3w':if(b.t>=T.sw3w){b.s='sw3';b.t=0;tone(300,.12,'sawtooth',.06,-180)}break;
    case 'sw3':if(b.t>=T.sw3)resolveSword(3);break;
    case 'swrec':if(b.t>=T.swrec)toIdle();break;
    case 'orb':if(b.t>=T.cast+T.orb)orbHit();break;
    case 'fl_in':if(b.t>=(b.fli||T.fli)){b.s='fl_out';b.t=0;tone(200,.25,'sawtooth',.07,-120)}break;
    case 'fl_out':if(b.t>=T.flo){if(b.fyb)resolveFuryBreath();else resolveFlame()}break;
    case 'fl_rec':if(b.t>=T.flrec)toIdle();break;
    case 'fl_stab':if(b.t>=T.dash+.1)legHit();break;
    case 'hurt':if(b.t>=b.hurtT)toIdle();break;
    case 'fy_roar':if(b.t>=1.0)fyEnter(G.fy.seq[0]);break;
    case 'fy_t':if(b.t>=T.fyt){b.s='fy_j';b.t=0;tone(220,.15,'sawtooth',.06,-120)}break;
    case 'fy_j':if(b.t>=.3)resolveJet();break;
    case 'fy_gap':if(b.t>=T.fyg){b.s='fy_t';b.t=0}break;
    case 'rk_t':if(b.t>=.5){b.s='rk_j';b.t=0;tone(150,.5,'sawtooth',.05,-80)}break;
    case 'rk_j':if(b.t>=.55)resolveRock();break;
    case 'fy_cast':if(b.t>=T.ringAt+.55)ringHit();break;
    case 'fy_fail':if(b.t>=.9)toIdle();break;
    case 'fin':{
      const F=G.fin;
      if(!F.a&&b.t>=.5){
        F.a=true;G.shake=reduce?0:8;G.flash=.35;
        dust(PX,DECK);burst(PX,DECK,24,['#ffffff','#fff2b8','#bfeaff']);
        tone(110,.5,'sine',.12,-50);tone(700,.6,'sine',.06,500);
      }
      if(!F.b&&b.t>=1.1){
        /* gros impact : le rayon explose sur le torse du Colosse, qui recule sous le choc */
        F.b=true;G.bhp=0;G.shake=reduce?0:26;G.flash=.95;
        const cx=BX-40,cy=DECK-200;
        burst(cx,cy,70,['#ffffff','#bfeaff','#6fd3ff','#ffc15a']);burst(cx+30,cy+40,40,['#ffffff','#fff2b8','#ffc15a','#ff7a2b']);burst(cx-10,cy-50,30,['#ffffff','#bfeaff']);
        boom(1.6,.28);tone(55,1.2,'sawtooth',.14,-20);tone(1200,.8,'sine',.06,-600);noise(.5,.2,5000,400);painCry(1.9,.2);
        float(_('BOOM!','BOUM !'),BX-160,DECK-320,'#ffffff');
      }
      if(!F.r&&b.t>=1.55){F.r=true;whoosh(.5,.08,true);painCry(.8,.1);say(_('Staggered, the Colossus raises his hammer.','Ébranlé, le Colosse lève son marteau.'))}
      if(!F.s&&b.t>=2.0){
        /* coup de marteau devant lui : le pont éclate et s'ouvre */
        F.s=true;G.shake=reduce?0:22;G.flash=.35;anvil();boom(1.1,.22);
        burst(HOLE_X,DECK,50,['#ffc15a','#ff7a2b','#9a8a9e','#ffffff']);forgeSparks(G,HOLE_X,DECK-6,44);dust(HOLE_X-60,DECK);dust(HOLE_X+60,DECK);
      }
      if(!F.j&&b.t>=2.25){F.j=true;whoosh(.6,.1,false);say(_(`The Colossus dives through the breach into the Foundry. The Watcher leaps after him.`,`Le Colosse plonge par la brèche dans la Fonderie. Le Veilleur saute à sa poursuite.`))}
      if(!F.c&&b.t>=2.75){F.c=true;boom(.8,.12)}
      break;}
  }
}
function pips(box,n,max,marks){
  if(box.children.length!==max){
    box.textContent='';
    for(let i=0;i<max;i++)box.appendChild(document.createElement('span'));
  }
  for(let i=0;i<max;i++){box.children[i].classList.toggle('on',i<n);box.children[i].classList.toggle('mark',marks.includes(i))}
}
let lastP=-1,lastB=-1,tries=[0,0,0,0],cntS=null;
function trStr(ph){const n=RUN.on?RUN.n:(tries[ph]||1);return ' · '+(n>1?_('Attempts ','Essais '):_('Attempt ','Essai '))+n}
function hud(){
  const S=R||Q||G;
  if(S!==cntS&&S.mode==='play'){cntS=S;tries[R?3:Q?2:1]++}
  if(S.php!==lastP){pips(el.hpP,S.php,DIFF.php,[]);$('hpPn').textContent=S.php+'/'+DIFF.php;lastP=S.php}
  const bmax=S===R?DIFF.rbhp:DIFF.bhp,bk=S===G?1:S===R?3:2;
  if(S.bhp!==lastB||S.mkBox!==bk){S.mkBox=bk;pips(el.hpB,S.bhp,bmax,S===G?DIFF.mk1:S===R?DIFF.mkR:DIFF.mk);$('hpBn').textContent=S.bhp+'/'+bmax;lastB=S.bhp}
}
function step(dt){
  G.time+=dt;
  for(const e of G.embers){e.y-=e.v*dt;e.x+=Math.sin(G.time*.8+e.ph)*8*dt;if(e.y<-10){e.y=H+10;e.x=rand(0,W)}}
  for(let i=G.sparks.length-1;i>=0;i--){const s=G.sparks[i];s.life-=dt;if(s.life<=0){G.sparks.splice(i,1);continue}s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt}
  for(let i=G.rings.length-1;i>=0;i--){G.rings[i].life-=dt;if(G.rings[i].life<=0)G.rings.splice(i,1)}
  for(let i=G.floats.length-1;i>=0;i--){G.floats[i].life-=dt;if(G.floats[i].life<=0)G.floats.splice(i,1)}
  G.shake=Math.max(0,G.shake-dt*45);G.flash=Math.max(0,G.flash-dt*2.2);G.hurt=Math.max(0,G.hurt-dt*1.6);G.recoil=Math.max(0,G.recoil-dt*3.5);G.kick=Math.max(0,G.kick-dt*5);G.wound=Math.max(0,G.wound-dt*.5);
  if(G.endIn>0){G.endIn-=dt;if(G.endIn<=0){if(G.mode==='won'&&G.p2&&RUN.on)beginP2(true);else showEnd()}}
  if(G.hitstop>0){G.hitstop-=dt;return}
  const p=G.pl;p.t+=dt;p.deny=Math.max(0,p.deny-dt);
  if(p.s==='barrier'&&p.t>=T.barrier){p.s='recover';p.t=0}
  else if(p.s==='recover'&&p.t>=T.recovery){p.s='ready';p.t=0}
  else if(p.s==='down'&&G.mode==='play'&&p.t>=(p.downT||.9)){p.s='ready';p.t=0}
  else if(p.s==='cast'&&p.t>=T.cast+T.orb){p.s='ready';p.t=0}
  else if(p.s==='dash'&&p.t>=T.dash){p.s='stab';p.t=0}
  else if(p.s==='stab'&&p.t>=.3){p.s='back';p.t=0}
  else if(p.s==='back'&&p.t>=T.back){p.s='ready';p.t=0}
  else if(p.s==='ring'&&p.t>=T.ringAt+.55){p.s='ready';p.t=0}
  if(p.s==='dash')p.x=PX+(STAB_X-PX)*eo(clamp01(p.t/T.dash));
  else if(p.s==='stab')p.x=STAB_X;
  else if(p.s==='back')p.x=STAB_X-(STAB_X-PX)*es(clamp01(p.t/T.back));
  else if(p.s==='final')p.x=p.t<2.9?PX:PX+(HOLE_X-PX)*es(clamp01((p.t-2.9)/.6));
  else p.x=PX;
  if(p.s==='dash')G.sparks.push({x:p.x,y:DECK-3,vx:rand(-60,-10),vy:-rand(10,60),g:200,life:.4,max:.4,col:'#9a8a9e',sz:rand(2,4)});
  if(p.s==='ring'&&!p.fired&&p.t>=T.ringAt){
    p.fired=true;G.ringFx={t:0};G.shake=reduce?0:9;G.flash=.3;dust(PX,DECK);
    tone(120,.4,'sine',.12,-60);tone(800,.5,'sine',.05,400);
  }
  if(G.ringFx){G.ringFx.t+=dt;if(G.ringFx.t>.8)G.ringFx=null}
  if(G.jf){G.jf.t-=dt;if(G.jf.t<=0)G.jf=null}
  if(G.mode==='intro')introStep(dt);
  bossStep(dt);
  hud();
}

