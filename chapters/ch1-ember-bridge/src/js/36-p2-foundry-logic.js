/* ================= PHASE II : la Fonderie ================= */
let Q=null;
const QH=[250,300],QB=[705,285];
const DG={act:.333,rec:.7,grace:.05,hurt:.38,drop:110};
const QA={
  claws:{hits:[{k:'clawA',at:.9},{k:'clawB',at:1.65}],cn:'stab',get name(){return _('Claw strikes','Coups de griffe')}},
  wings:{hits:[{k:'wave',at:1.0},{k:'wave',at:1.7},{k:'wave',at:2.4}],cn:'head',get name(){return _(`Wing strike`,`Coup d'ailes`)}},
  rocks:{hits:[{k:'rock',at:.95},{k:'rock',at:1.55}],cn:'beam',get name(){return _('Debris throw','Lancer de débris')}}
};
const QAH={
  claws:{hits:[{k:'clawA',at:.8},{k:'clawB',at:1.15},{k:'clawA',at:1.95},{k:'clawB',at:2.3}],cn:'stab',get name(){return _('Claw flurry','Rafale de griffes')}},
  wings:{hits:[{k:'wave',at:.95},{k:'wave',at:1.5},{k:'wave',at:1.85},{k:'wave',at:2.6},{k:'wave',at:2.95}],cn:'head',get name(){return _('Wing barrage','Barrage d\'ailes')}},
  rocks:{hits:[{k:'rock',at:.95},{k:'rock',at:1.6},{k:'fire',at:2.2}],cn:'beam',get name(){return _('Debris and fireball','Débris et boule de feu')}}
};
const ROCKP=Array.from({length:9},(_,i)=>{const a=i/9*6.283;return[Math.cos(a)*(.75+((i*37)%5)/10),Math.sin(a)*(.75+((i*53)%5)/10)]});
function qNew(){
  return{mode:'intro',t:0,time:0,lt:0,php:startHP(),bhp:DIFF.bhp,parries:0,taken:0,scroll:0,speed:900,
    pl:{s:'ready',t:0,deny:0},boss:{s:'idle',t:0,wait:.6,dur:1,after:''},atk:null,cn:null,chain:null,chainMiss:false,
    enraged:false,rn:0,rage2:false,last:'',n:0,sparks:[],floats:[],rings:[],exps:[],fbs:[],
    streaks:Array.from({length:40},()=>({x:rand(0,W),y:rand(0,H),v:rand(500,1000),l:rand(16,56)})),
    debris:Array.from({length:7},()=>({x:rand(60,W-60),y:rand(0,H),v:rand(180,420),r:rand(8,24),a:rand(0,6),w:rand(-3,3)})),
    shake:0,flash:0,hurt:0,hitstop:0,recoil:0,endIn:0,wo:0,bx:QB[0],by:QB[1],hx:QH[0],hy:QH[1],dropY:0,splash:0,ended:false,wing:false,fn:0};
}
function setPhaseUI(n){
  try{$('retryBtn').disabled=false;$('phases').style.display=RUN.on?'none':''}catch(e){}
  document.querySelectorAll('#phases li').forEach((li,i)=>{
    li.classList.toggle('on',i===n-1);
    if(i===n-1)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
  });
  $('hdEye').textContent=n===1?_('Phase I of III · On the bridge','Phase I sur III · Sur le pont'):n===2?_('Phase II of III · The Foundry','Phase II sur III · La Fonderie'):_('Phase III of III · The Bell Tower','Phase III sur III · Le Clocher');
  el.ward.textContent=n===1?_('Block','Bloquer'):n===2?_('Dodge','Esquiver'):_('Parry','Parer');
  cv.setAttribute('aria-label',n===1?_('Arena: the Watcher faces the Ember Colossus on a stone bridge','Arène du combat : le Veilleur face au Colosse de braise sur un pont de pierre'):n===2?_('Arena: the Watcher and the winged Ember Colossus fall down the Foundry shaft','Arène du combat : le Veilleur et le Colosse de braise ailé tombent dans le puits de la Fonderie'):_('Arena: the Watcher faces the Ember Colossus atop the snowy Watchers\' Bell Tower','Arène du combat : le Veilleur face au Colosse de braise au sommet enneigé du Clocher des Veilleurs'));
}
function beginP2(noLore){
  if(RUN.on&&G&&G.mode==='won'){RUN.cur=Math.min(RUN.max,G.php+1);RUN.st[1]={p:G.parries,h:G.grabs}}
  R=null;Q=qNew();setPhaseUI(2);lastP=-1;lastB=-1;
  el.ov.hidden=true;if(!noLore)showLore(2);
  say(_('Phase II. The Watcher and the Colossus fall into the Foundry. The button now dodges.','Phase II. Le Veilleur et le Colosse tombent dans la Fonderie. Le bouton sert maintenant à esquiver.'));
  hud();
}
function qBurst(x,y,n,cols){for(let i=0;i<n;i++){const a=rand(0,6.283),v=rand(80,380),L=rand(.3,.7);(R||Q).sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,g:300,life:L,max:L,col:cols[i%cols.length],sz:rand(2,5)})}}
function qFloat(txt,x,y,col,sz,life){txt=ono(txt);if(!txt)return;(R||Q).floats.push({txt,x,y,col,sz:ONOSZ[txt]||sz||26,life:life||.9,max:life||.9})}
function qFlameBurst(x,y,big,mega){
  (R||Q).fbs.push({x,y,t:0,big:big||1});
  /* Le cri (son et mot) part avec l'impact, à côté de la tête du Colosse ; la voix dépend de la force du coup et de sa vie restante. mega = cri de la foudre. */
  if(mega){qFloat(megaCry(),R.bx-224,DECK-330,'#fff2b8',52,1.7);return}
  const o=R||Q,hv=(big||1)>=1.3,hd=R?[R.bx-128,DECK-300]:[Q.bx-128,Q.by-130];
  qFloat(hurtCry(hv,o.bhp),hd[0],hd[1],hv?'#ffc15a':'#ffb347',hv?40:34,.9);
}
function qRing(x,y){(R||Q).rings.push({x,y,life:.35,max:.35})}

function qPress(){
  if(Q.mode!=='play')return;
  ensureAudio();
  const p=Q.pl;
  if(p.s==='ready'){p.s='dodge';p.t=0;tone(420,.16,'triangle',.05,-200)}
  else if(p.s==='dodge'||p.s==='recover')p.deny=.25;
}
function qPick(){
  const kinds=['claws','wings','rocks'];
  let k=Q.last===''?'claws':kinds[Math.floor(Math.random()*3)];
  if(k===Q.last&&Q.n>=2){const o=kinds.filter(x=>x!==k);k=o[Math.floor(Math.random()*2)]}
  Q.n=(k===Q.last)?Q.n+1:1;Q.last=k;
  return k;
}
function qIdle(){const b=Q.boss;b.s='idle';b.t=0;b.wait=DIFF.hard?rand(DIFF.waitMin,DIFF.waitMax):rand(.8,1.4)}
function qTurn(){
  const b=Q.boss;
  if(Q.bhp===1){
    Q.chain=DIFF.q2?['claws','wings','rocks','roar']:['claws','wings','rocks'];Q.chainMiss=false;
    qRage(1.3,'chain');
  }else if(DIFF.q2){
    const n=DIFF.rages.filter(x=>Q.bhp<=x).length;
    if(n>Q.rn){Q.rn=n;if(n>=2)Q.rage2=true;qRoar(n>=2?_('RAGE!','RAGE !'):_('ENRAGED','ENRAGEMENT'),n)}
    else qLaunch(qPick());
  }else if(Q.bhp===DIFF.u){
    qRage(Q.enraged?.8:1.6,'rand');
  }else qLaunch(qPick());
}
function qRage(dur,after){
  const b=Q.boss;
  b.s='rage';b.t=0;b.dur=dur;b.after=after;Q.enraged=true;
  Q.shake=reduce?0:10;Q.flash=.35;
  tone(70,dur,'sawtooth',.09,60);tone(140,dur*.8,'square',.04,100);
  say(Q.bhp===1?(DIFF.q2?_('Final assault: claws, wings, debris, then a final roar.','Dernier assaut : griffes, ailes, débris, puis un dernier cri.'):_('Final assault: the Colossus will chain his three attacks.','Dernier assaut : le Colosse va enchaîner ses trois attaques.')):_('The Colossus enrages. A flaming tail will end each attack.','Le Colosse s\'enrage. Une queue enflammée terminera chaque attaque.'));
}
function qLaunch(kind){
  if(kind==='roar'){qRoar();return}
  const d=(DIFF.q2?QAH:QA)[kind],b=Q.boss;
  const hits=d.hits.map(h=>({k:h.k,at:h.at,ok:null,done:false}));
  const nt=Q.enraged?(DIFF.q2&&Q.rage2?2:1):0;
  let L=hits[hits.length-1].at;
  if(nt>=1){L+=.85;hits.push({k:'tail',at:L,ok:null,done:false})}
  if(nt>=2){L+=.55;hits.push({k:'tail',at:L,ok:null,done:false})}
  Q.atk={kind,t:0,hits,end:L+.5,miss:0,cn:d.cn};
  b.s='atk';b.t=0;
  tone(120,.6,'sawtooth',.04,80);
  say(d.name+(nt>1?_(', tail sweep to follow.',', balayage de queue à suivre.'):nt?_(', tail strike to follow.',', coup de queue à suivre.'):'.'));
}
/* Cri du Colosse (Difficile, phase II) : un éboulement de 6 rochers à rythme aléatoire. */
function qRoar(label,n){
  const b=Q.boss;Q.enraged=true;
  Q.shake=reduce?0:10;Q.flash=label?.35:.2;
  tone(70,3.4,'sawtooth',.09,60);tone(140,2.8,'square',.04,100);
  const hits=[];let tt=.9+rand(0,.2);
  for(let i=0;i<5;i++){hits.push({k:'fall',at:tt,ok:null,done:false});tt+=rand(DIFF.hard?.55:.32,DIFF.hard?.9:.62)}
  Q.atk={kind:'roar',t:0,hits,end:tt,miss:0,cn:null};
  b.s='atk';b.t=0;
  say(n>=2?_('The Colossus roars again. His tail will now sweep twice after each attack. Debris rains down!','Le Colosse rugit à nouveau. Sa queue balaiera deux fois après chaque attaque. Des débris pleuvent !'):n===1?_('The Colossus roars: the bridge debris rains down!','Le Colosse rugit : les débris du pont pleuvent d\'en haut !'):_('A final roar: the bridge debris rains down!','Un dernier cri : les débris du pont pleuvent d\'en haut !'));
}
function qResolve(h){
  const p=Q.pl,a=Q.atk;
  /* Difficile : les rochers (cris et attaque) laissent une marge de plus pour esquiver, car leur rythme est irrégulier */
  const gr=DIFF.hard&&(h.k==='fall'||h.k==='rock')?DG.grace+.13:DG.grace;
  const ok=p.s==='dodge'||(p.s==='recover'&&p.t<gr);
  h.ok=ok;
  if(ok){
    Q.parries++;Q.flash=Math.max(Q.flash,.15);
    {const u=p.s==='dodge'?p.t/DG.act:1,off=u<.27?es(u/.27):u<.73?1:1-es((u-.73)/.27);p.ox=-20*off;p.oy=DG.drop*off;p.s='ready';p.t=0}
    qBurst(QH[0],QH[1]+DG.drop*.6,14,['#bfeaff','#ffffff','#6fd3ff']);
    tone(900,.18,'square',.04,-300);
  }else{
    a.miss++;
    qHurt(h.k);
  }
}
function qHurt(k){
  const p=Q.pl;
  Q.php=Math.max(0,Q.php-1);Q.taken++;Q.shake=reduce?0:13;Q.hurt=.35;Q.hitstop=.07;thud(1);
  qBurst(QH[0],QH[1],26,['#ff8a4a','#ffc15a','#ff5252']);
  qFloat(k==='rock'||k==='fall'?_('CRUSHED!','ÉCRASÉ !'):_('HIT!','TOUCHÉ !'),QH[0]-30,QH[1]-120,'#ff8a6b');
  tone(90,.3,'sawtooth',.1,-40);
  if(Q.php<=0){p.s='down';p.t=0;Q.mode='lost';Q.endIn=1.3;say(_('You are swept away by the fall. Defeat.','Tu es emporté par la chute. Défaite.'))}
  else{
    /* enchaînement : l'étourdissement s'arrête assez tôt pour esquiver le coup suivant */
    const a=Q.atk,nx=a&&a.hits.find(x=>!x.done),gap=nx?nx.at-a.t:99,base=k==='fall'?.14:DG.hurt;
    p.s='hurt';p.t=0;p.hs=Math.min(base,Math.max(.14,gap-.2));say(_('Hit.','Touché.'))
  }
}
function qAtkStep(dt){
  const a=Q.atk;a.t+=dt;
  for(const h of a.hits){if(!h.done&&a.t>=h.at){h.done=true;qResolve(h);if(Q.mode!=='play')return}}
  if(a.t>=a.end)qAtkEnd();
}
function qAtkEnd(){
  const a=Q.atk,b=Q.boss,ok=a.miss===0||a.kind==='roar'; /* un caillou touché coûte une vie mais ne casse pas la chaîne finale */
  Q.atk=null;
  if(Q.chain){
    if(!ok)Q.chainMiss=true;
    if(Q.chainMiss){Q.chain=null;b.s='fail';b.t=0;return}
    if(Q.chain.length){b.s='gap';b.t=0;return}
    Q.chain=null;qFinal();return;
  }
  if(a.kind==='roar'){qIdle();return}
  if(ok)qCounter(a.cn);else{b.s='fail';b.t=0}
}
function qCounter(k){
  const b=Q.boss,p=Q.pl;
  Q.cn={k,t:0,hit:false};b.s='cn';b.t=0;p.s='counter';p.t=0;
  tone(300,.4,'triangle',.05,300);
  say(_('Perfect dodge. Riposte!','Esquive parfaite. Riposte !'));
}
function qFinal(){
  const b=Q.boss,p=Q.pl;
  Q.cn={k:'final',t:0};b.s='cn';b.t=0;p.s='counter';p.t=0;
  say(_('Chain dodged. The Watcher gathers himself.','Enchaînement esquivé. Le Veilleur se concentre.'));
}
function qDamage(k){
  Q.bhp=Math.max(0,Q.bhp-1);Q.recoil=1;Q.shake=reduce?0:13;Q.hitstop=.11;Q.flash=.4;thud(1.2);
  const tg=k==='head'?[Q.bx,Q.by-92]:[Q.bx-30,Q.by-4];
  qBurst(tg[0],tg[1],30,['#ffffff','#bfeaff','#ffc15a']);qRing(tg[0],tg[1]);
  tone(170,.25,'square',.08,-110);tone(900,.2,'sine',.05);
  qFlameBurst(tg[0],tg[1],k==='beam'?1.3:1);
  if(k==='beam'){Q.exps.push({x:tg[0],y:tg[1],t:0,s:.8});qRing(tg[0],tg[1]);qBurst(tg[0],tg[1],30,['#ffffff','#bfeaff','#6fd3ff'])}
  say(_('Riposte landed.','Riposte réussie.'));
}
function qCnStep(dt){
  const c=Q.cn,b=Q.boss,p=Q.pl;c.t+=dt;
  if(c.k==='final'){qFinalStep(c);return}
  const sp={stab:{hit:.35,end:1.15},head:{hit:.55,end:1.45},beam:{hit:.85,end:1.65}}[c.k];
  if(c.k==='beam'&&c.t<.75&&Math.random()<.6){
    const a=rand(0,6.283),r=rand(40,80),tip=qSwordTip();
    Q.sparks.push({x:tip[0]+Math.cos(a)*r,y:tip[1]+Math.sin(a)*r,vx:-Math.cos(a)*r*4,vy:-Math.sin(a)*r*4,g:0,life:.25,max:.25,col:'#bfeaff',sz:2.5});
  }
  if(!c.hit&&c.t>=sp.hit){c.hit=true;qDamage(c.k)}
  if(c.t>=sp.end){Q.cn=null;p.s='ready';p.t=0;b.s='hurt';b.t=0}
}
function qFinalStep(c){
  const chest=[Q.bx-20,Q.by-4];
  if(!c.a&&c.t>=.15){c.a=true;tone(500,.9,'sine',.05,600)}
  if(c.t<1.1&&Math.random()<.7){
    const a=rand(0,6.283),r=rand(70,130);
    Q.sparks.push({x:Q.hx+Math.cos(a)*r,y:Q.hy+Math.sin(a)*r,vx:-Math.cos(a)*r*3.5,vy:-Math.sin(a)*r*3.5,g:0,life:.3,max:.3,col:Math.random()<.5?'#ffffff':'#bfeaff',sz:3});
  }
  if(!c.b&&c.t>=1.55){
    c.b=true;Q.bhp=0;Q.recoil=1;Q.shake=reduce?0:16;Q.hitstop=.14;Q.flash=.8;thud(1.6);qFloat(_('FINAL BLOW!','COUP ULTIME !'),chest[0]-120,chest[1]-90,'#ffc15a');
    qBurst(chest[0],chest[1],44,['#ffffff','#fff2b8','#bfeaff']);
    tone(70,.7,'sawtooth',.1,-30);tone(900,.5,'sine',.06,500);
    qFlameBurst(chest[0],chest[1],1.5);
    say(_(`The lantern's beam pierces the Colossus's chest.`,`Le rayon de la lanterne transperce le torse du Colosse.`));
  }
  [1.95,2.55,3.15].forEach((tt,i)=>{
    if(!c['e'+i]&&c.t>=tt){
      c['e'+i]=true;Q.exps.push({x:chest[0],y:chest[1],t:0,s:1+i*.45});
      Q.flash=.75;Q.shake=reduce?0:14+i*4;Q.hitstop=.06;
      qBurst(chest[0],chest[1],30,['#ffffff','#fff2b8','#bfeaff']);
      tone(120+i*40,.6,'sine',.12,-60);tone(700+i*150,.5,'sine',.06,500);
      qRing(chest[0],chest[1]);qFlameBurst(chest[0],chest[1],1.3+i*.35);
    }
  });
  if(!c.d&&c.t>=3.9){c.d=true;Q.mode='lake';Q.lt=0;say(_('The Colossus plunges toward the great furnace.','Le Colosse plonge vers le grand four.'))}
}
function qBoss(dt){
  const b=Q.boss;b.t+=dt;
  switch(b.s){
    case 'idle':if(b.t>=b.wait)qTurn();break;
    case 'rage':if(b.t>=b.dur){if(b.after==='chain'){qChainNext()}else qLaunch(qPick())}break;
    case 'atk':qAtkStep(dt);break;
    case 'gap':if(b.t>=.55)qChainNext();break;
    case 'cn':qCnStep(dt);break;
    case 'fail':if(b.t>=1.0)qIdle();break;
    case 'hurt':if(b.t>=.55)qIdle();break;
  }
}
function qChainNext(){const k=Q.chain.shift();Q.last=k;qLaunch(k)}
function lakeY(){return H+80-(H+80-340)*ei(clamp01((Q.lt-.4)/1.8))}
function qLayout(){
  const t=Q.t;
  let bx=QB[0],by=QB[1],hx=QH[0],hy=QH[1];
  if(Q.mode==='intro'){
    const eb=1-eo(clamp01(t/2.0)),eh=1-eo(clamp01((t-.2)/1.9));
    bx+=90*eb;by-=560*eb;hx-=60*eh;hy-=620*eh;
  }
  by+=Math.sin(Q.time*2)*7;hy+=Math.sin(Q.time*2.6+1)*5;
  bx+=Q.recoil*20;
  by+=Q.dropY;
  /* fin de phase II : le Veilleur se rattrape sur une passerelle au-dessus du métal en fusion, le Colosse plonge seul */
  if(Q.mode==='lake'){const cy=lakeY()-40;if(Q.landed||hy+44>=cy){hy=cy-44;if(!Q.landed){Q.landed=Q.lt||.001;qBurst(hx,cy,22,['#ffd27a','#ff9a3c','#9a8a9e']);forgeSparks(Q,hx+10,cy,20);Q.shake=reduce?0:Math.max(Q.shake,10);anvil();say(_('The Watcher catches himself on a catwalk, above the molten metal.','Le Veilleur se rattrape sur une passerelle, au-dessus du métal en fusion.'))}}}
  Q.bx=bx;Q.by=by;Q.hx=hx;Q.hy=hy;
}
function qEnd(){
  const win=Q.mode==='lake';
  if(win&&RUN.on){setTimeout(()=>beginP3(true),0);return} /* épreuve : pas de carte entre les phases */
  el.eye.textContent=win?_('Transition · Phase III','Transition · Phase III'):_('Defeat · Phase II','Défaite · Phase II');
  el.title.textContent=win?_(`The great furnace swallows the Colossus.`,`Le grand four engloutit le Colosse.`):_('Swept away by the fall.','Emporté par la chute.');
  el.stats.textContent=_('Dodges ','Esquives ')+Q.parries+_(' · Hits taken ',' · Coups subis ')+Q.taken+trStr(2);
  el.stats.hidden=false;
  el.desc.textContent=win?_(`The Watcher barely catches himself on a catwalk. Rekindled, the Colossus bursts from the furnace and flies up the chimney.`,`Le Veilleur se rattrape de justesse sur une passerelle. Ravivé, le Colosse jaillit du four et s'envole par la cheminée.`):_(`Nothing holds the Watcher anymore. He vanishes into the depths of the Foundry, and his light goes out with him.`,`Rien ne retient plus le Veilleur. Il disparaît dans les profondeurs de la Fonderie, et sa lumière s'éteint avec lui.`);
  el.go.textContent=win?_('Start Phase III','Lancer la phase III'):_('Retry Phase II','Réessayer la phase II');
  if(!win)deathCard();
  el.ov.hidden=false;
  try{el.go.focus({preventScroll:true})}catch(e){}
}
function qStep(dt){
  Q.time+=dt;Q.t+=dt;
  for(const s of Q.streaks){s.y-=s.v*dt*(Q.speed/320);if(s.y<-80){s.y=H+rand(0,80);s.x=rand(0,W)}}
  for(const d of Q.debris){d.y-=d.v*dt*(Q.speed/320);d.a+=d.w*dt;if(d.y<-60){d.y=H+rand(20,120);d.x=rand(60,W-60)}}
  Q.scroll+=Q.speed*dt;
  for(let i=Q.sparks.length-1;i>=0;i--){const s=Q.sparks[i];s.life-=dt;if(s.life<=0){Q.sparks.splice(i,1);continue}s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt}
  for(let i=Q.rings.length-1;i>=0;i--){Q.rings[i].life-=dt;if(Q.rings[i].life<=0)Q.rings.splice(i,1)}
  for(let i=Q.floats.length-1;i>=0;i--){Q.floats[i].life-=dt;if(Q.floats[i].life<=0)Q.floats.splice(i,1)}
  for(let i=Q.exps.length-1;i>=0;i--){Q.exps[i].t+=dt;if(Q.exps[i].t>.9)Q.exps.splice(i,1)}
  for(let i=Q.fbs.length-1;i>=0;i--){Q.fbs[i].t+=dt;if(Q.fbs[i].t>.7)Q.fbs.splice(i,1)}
  Q.shake=Math.max(0,Q.shake-dt*45);Q.flash=Math.max(0,Q.flash-dt*2.2);Q.hurt=Math.max(0,Q.hurt-dt*1.6);Q.recoil=Math.max(0,Q.recoil-dt*3.5);
  if(Q.endIn>0){Q.endIn-=dt;if(Q.endIn<=0)qEnd()}
  qLayout();
  if(Q.hitstop>0){Q.hitstop-=dt;hud();return}
  const p=Q.pl;p.t+=dt;p.deny=Math.max(0,p.deny-dt);
  if(p.oy){p.oy*=Math.max(0,1-dt*14);p.ox*=Math.max(0,1-dt*14);if(p.oy<1)p.oy=p.ox=0}
  if(Q.mode==='intro'){
    Q.speed=320+580*(1-clamp01(Q.t/2.6));
    Q.wo=es(clamp01((Q.t-1.0)/1.0));
    /* battements d'ailes : un souffle grave + un claquement sourd, de plus en plus lents */
    const FL=[.9,1.25,1.7,2.25];while(Q.fn<FL.length&&Q.t>=FL[Q.fn]){noise(.4,.24,700,140);boom(.3,.08);Q.fn++}
    if(!Q.wing&&Q.t>=1.35){Q.wing=true;Q.shake=reduce?0:12;Q.flash=.35;tone(90,.7,'sawtooth',.09,60);qFloat(_('PHASE II','PHASE II'),W/2-110,120,'#ffc15a',54,1.8);qBurst(Q.bx+60,Q.by-60,30,['#ffc15a','#ff7a2b'])}
    if(Q.t>=2.7){Q.mode='play';Q.boss.wait=.6;Q.wo=1}
    hud();return;
  }
  if(Q.mode!=='lake'){Q.speed=320}
  if(p.s==='dodge'&&p.t>=DG.act){p.s='recover';p.t=0}
  else if(p.s==='recover'&&p.t>=DG.rec){p.s='ready';p.t=0}
  else if(p.s==='hurt'&&p.t>=(p.hs||DG.hurt)){p.s='ready';p.t=0}
  if(Q.mode==='play')qBoss(dt);
  if(Q.mode==='lake'){
    Q.lt+=dt;
    Q.wo=1-.75*es(clamp01(Q.lt/1.0));
    if(!Q.splash&&lakeY()<=Q.by+150){
      Q.splash=Q.lt;
      qBurst(QB[0]-40,lakeY(),70,['#fff2b8','#ffc15a','#ff7a2b','#ffffff']);
      qRing(QB[0]-40,lakeY());Q.flash=.6;Q.shake=reduce?0:18;
      tone(60,.9,'sine',.15,-30);tone(300,.5,'sawtooth',.04,-200);
    }
    if(Q.splash){
      const d=Q.lt-Q.splash;Q.speed=Math.max(0,Q.speed-900*dt);
      if(d<1.0)Q.dropY=d*240;
      else{
        /* ravivé par le métal en fusion, il jaillit du four, ailes déployées, et s'envole vers la cheminée */
        const e=d-1.0;Q.dropY=240-e*e*620-e*180;Q.wo=Math.min(1.25,.25+e*3);
        if(!Q.erupt){Q.erupt=true;Q.flash=.7;Q.shake=reduce?0:22;roar();boom(1.2,.2);qBurst(QB[0]-20,lakeY(),80,['#fff2b8','#ffc15a','#ff7a2b','#ffffff']);qRing(QB[0]-20,lakeY());forgeSparks(Q,QB[0]-20,lakeY(),50);
          say(_('The Colossus bursts from the furnace, wings spread!','Le Colosse jaillit du four, ailes déployées !'))}
        if(Math.random()<.6)Q.sparks.push({x:Q.bx+rand(-60,60),y:Q.by+rand(20,120),vx:rand(-40,40),vy:rand(60,200),g:300,life:.6,max:.6,col:Math.random()<.5?'#ffc15a':'#ff7a2b',sz:rand(3,6)});
      }
    }
    else Q.speed=320+600*clamp01(Q.lt/1.4);
    if(!Q.ended&&Q.splash&&Q.lt-Q.splash>2.8){Q.ended=true;qEnd()}
  }
  hud();
}

