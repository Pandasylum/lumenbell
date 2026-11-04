/* ---------- Hub de la série (site/index.html ; décision docs/decisions/2026-11-02-hub-site.md) ----------
   Écran de démarrage (un seul bouton : débloque le son, lance le fond sonore du hub), puis la figure : six tours en cercle (chapitres
   I à VI, I en haut, sens horaire), VII au centre (point blanc très faible qui bat, jamais cliquable). Aucun nom de la figure à
   l'écran ni dans les libellés. Une tour, quel que soit le mouvement : à jouer (point qui pulse + fin cercle autour ; le cercle
   reste quand la pulsation s'arrête), terminée (point plein, fixe, sans cercle), annoncée (anneau de sa couleur, « À venir »),
   fermée (cercle éteint, sans point, sans nom, rien au toucher). Ouverte : chapitre I, ou vraie fin du précédent mémorisée
   (lb-chN-end), la chaîne entière comptant (II terminé sans I terminé : II reste fermé). Toucher une tour ouverte : sa cloche,
   et une petite carte (nom en couleur, « Entrer ») ancrée sous la tour, avec une pointe vers elle (au-dessus si la place manque ;
   placeCard, table HUB_T.card) qui ne couvre jamais une autre tour ni le point central ; la tour choisie reste éclairée ;
   Entrer ouvre <chapitre>/index.html?from=hub (LB.HUB, shared/js/28-ui.js). Fond ou Échap : ferme la carte.
   Mouvement réduit : le hub suit seul la préférence du système (LB.motion, classe .lb-rm).
   Retour d'un chapitre (?back=N, lien « Chapitres » ou fin du chapitre) : sans écran de démarrage, le fond sonore repart.
   Tours fêtées (lb-hub-lit, liste des chapitres) : à l'arrivée, une tour terminée pas encore fêtée s'allume devant le joueur
   avec sa cloche, puis est marquée fêtée ; une tour déjà fêtée apparaît allumée, sans animation.
   Réglages (roue en haut à droite) : table SETTINGS_T ; réinitialisation : RESET_T. Fond sonore : HUB_T.bed (variante « nébuleuse », sans paramètre d'URL). Tout réglage est dans HUB_CH, HUB_T, SETTINGS_T et RESET_T ; un chapitre de plus
   = une entrée de plus dans HUB_CH. */
LB.setup({id:'hub',old:{'lb-ch1-end':['eb-end']}});
/* Chapitres du hub, un par tour (n de 1 à HUB_T.towers). path : page du chapitre, relative au hub ; soon : annoncé, pas encore
   jouable (carte « À venir », sans « Entrer ») ; bell : hauteur de sa cloche (Hz). Couleur : LB.CH_COL[n]. Une tour sans entrée
   reste fermée. */
const HUB_CH=[
  {n:1,title:'Ember Bridge',path:'ch1/index.html',bell:392},
  {n:2,title:'Silent Bells',path:'ch2/index.html',bell:329.63},
  {n:3,title:'Hollow Roots',soon:true,bell:293.66}
];
const HUB_T={
  towers:6,                                  // tours du cercle (chapitres I à VI)
  fig:{max:620,min:150},                     // côté de la figure (px) : la place restante, bornée
  pad:16,                                    // marge des bords (px)
  r:.39,                                     // rayon du cercle / côté de la figure
  dot:{k:.052,min:14,max:28},                // diamètre d'une tour / côté (bornes px)
  hit:56,touch:48,                           // zone tactile d'une tour, des boutons (px, ≥ 48)
  ring:{w:2,off:'rgba(255,255,255,.16)'},    // anneau d'une tour fermée
  glow:{blur:16,spread:3},                   // halo d'une tour allumée (px)
  core:{k:.026,min:6,col:'#ffffff',lo:.1,hi:.32,beat:1.6},   // VII : diamètre / côté, couleur, opacités, battement (s)
  pulse:{dur:3.4,lo:.4},                     // « à jouer » : pulsation douce (période s, opacité basse)
  wire:{w:1.2,off:.08,on:.5,col:'rgba(255,255,255,.5)'},     // fil entre les tours (px, opacités éteint / allumé, couleur éteinte)
  light:{dur:1.6,delay:.7,gap:.6},           // tour fêtée à l'arrivée : durée du fondu, délai après l'arrivée, écart entre deux tours (s)
  ringDur:1.4,                               // éclat d'une tour qui sonne (s)
  title:{fs:'clamp(30px,8vw,64px)',low:'clamp(24px,7vh,40px)',gap:12},   // titre (paysage bas : low) ; gap : marge mini au-dessus et au-dessous (px)
  ver:{right:0},                             // version : retrait du bord droit (px, dans la marge de l'écran), à la hauteur des langues
  /* carte d'entrée, ancrée sous la tour choisie (placeCard) : fs nom du chapitre ; tip côté de la pointe (px, carré tourné) ; gap écart
     entre le point de la tour et la pointe ; clear écart minimal aux tours, au centre, aux boutons et au titre ; edge marge des bords de
     l'écran ; step pas de glissement sur le côté ; tipMin la pointe reste à au moins tipMin du bord de la carte. Ordre : en dessous,
     sinon au-dessus ; d'abord sans toucher boutons ni titre, puis seulement sans toucher les tours et le centre. */
  card:{fs:'clamp(15px,4.4vw,18px)',tip:8,gap:2,clear:2,edge:10,step:4,tipMin:14},
  halo:{gap:3,w:1.5},                        // « à jouer » : écart et épaisseur du fin cercle autour du point (px), dans tous les modes
  set:{w:'min(92vw,380px)',gear:24,warn:'#ff8a7a'},   // réglages : largeur du panneau, dessin de la roue (px), couleur de la réinitialisation
  bell:{dur:3.6,vol:.07,partials:[[1,1,1],[2.0,.5,.7],[2.76,.32,.5],[4.07,.18,.35],[5.4,.1,.25]]},   // cloche : [rapport, niveau, durée relative]
  /* fond sonore (bus musique), variante « nébuleuse » (décision du 2 novembre : a et b retirées). Tout est synthétisé par LB.audio ; bande utile
     50 à 500 Hz (notes, souffle, scintillements) ; rien d'audible au-dessus de 1,2 kHz (passe-bas lp.hi ≤ 1200) hors les cloches, qui
     ne passent pas par ici. hp passe-haut (Hz) ; fade fondu d'entrée (s) ; lp passe-bas balayé {lo, hi Hz, period s, q} ;
     notes tenues [f Hz, niveau] chacune en len(detune) voix désaccordées (cents) ; swell houles lentes {period s (12 à 20), depth 0 à 1}
     : une houle commune (all) et une par note (periods) ; air souffle bruité très doux {vol, f Hz (passe-bas), period s, depth} ;
     echo écho long {t s de retard, fb rétroaction, damp Hz (adoucit chaque répétition), wet niveau} ;
     spark scintillements rares et doux {f [Hz], vol, first s, every [min, + aléa] s, atk, dec s}. */
  // « nébuleuse » : nappe grave-médium, houles et souffle plus présents, quelques scintillements très doux et rares
  bed:{hp:50,fade:9,lp:{lo:300,hi:900,period:29,q:.7},detune:[-7,7],notes:[[98,.03],[146.83,.024],[196,.018],[293.66,.01]],
       swell:{all:{period:14,depth:.6},periods:[12,15,17,20],depth:.8},air:{vol:.011,f:420,period:13,depth:.8},echo:{t:1.5,fb:.56,damp:450,wet:.65},
       spark:{f:[220,261.63,349.23,440],vol:.006,first:9,every:[12,14],atk:1.2,dec:5}},
  bedOut:.4,
  motes:{n:18,dur:[12,10],delay:22,size:[1.5,2],dx:90,rise:'-75vh',peak:.5,col:'rgba(255,233,168,.9)',glow:'0 0 8px 2px rgba(255,214,120,.35)'},
  lowH:520                                   // paysage bas (px de haut) : titre réduit
};
/* Réglages du hub (roue en haut à droite), un par ligne du panneau ; un réglage de plus = une entrée de plus, sans autre code.
   type toggle : oui / non (get, set) ; choice : une valeur parmi opts [valeur, en, fr] ; hold : appui maintenu `hold` s, jauge
   visible, jamais un simple clic (run). Musique et Bruitages : coupure du bus de LB.audio (lb-mus, lb-snd : les mêmes clés que les
   cases Son et Musique des chapitres). Pas de réglage de mouvement : le hub suit la préférence du système (LB.motion). */
const SETTINGS_T=[
  {id:'mus',type:'toggle',label:['Music','Musique'],get:()=>LB.audio.music,set:v=>LB.audio.setMusic(v)},
  {id:'snd',type:'toggle',label:['Sound effects','Bruitages'],get:()=>LB.audio.sound,set:v=>LB.audio.setSound(v)},
  {id:'reset',type:'hold',label:['Reset progress','Réinitialiser la progression'],hint:['Hold to erase','Maintenir pour effacer'],hold:2,run:()=>reset()}
];
/* Clés effacées par « Réinitialiser la progression » (relevées par grep des clés lb-… et de leurs anciennes clés) : fins de chapitre,
   difficultés terminées et déblocages, records, drapeaux « intro vue », tours fêtées. Gardées : langue (lb-lang), réglages (lb-snd,
   lb-mus, lb-help) et leurs anciennes clés. keys : clés exactes ; prefix : début de clé. */
const RESET_T={
  keys:['lb-hub-lit',     // tours fêtées du hub
    'eb-end','eb-intro',  // anciennes clés du Chapitre I (lb-ch1-end, lb-ch1-intro), sinon recopiées à la lecture
    'db-unl'],            // ancienne clé du Chapitre II (lb-ch2-unl)
  prefix:['lb-ch',        // tout ce qui est propre à un chapitre : lb-chN-end, lb-chN-intro, lb-chN-unl, lb-chN-best-…
    'eb-best-','db-best-']   // anciens records des Chapitres I et II
};
const $=id=>document.getElementById(id);
const CH=n=>HUB_CH.find(c=>c.n===n)||null;
const tx=a=>LB._(a[0],a[1]);
const rgbOf=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');
const LIT='lb-hub-lit';   // tours déjà fêtées (localStorage, liste des numéros de chapitre)
const params=(()=>{try{return new URLSearchParams(location.search)}catch(e){return new Map()}})();
const backN=+params.get(LB.HUB.back)||0;
/* ---------- état des tours ---------- */
function endSeen(n){return LB.store.get('lb-ch'+n+'-end','0')==='1'}
/* ok(n) : la fin du chapitre n compte (sans : toutes les fins mémorisées) */
function states(ok){const st={};let prev=true;   // prev : la tour précédente est ouverte et terminée
  for(let n=1;n<=HUB_T.towers;n++){const c=CH(n),open=!!c&&prev;
    st[n]=!open?'closed':c.soon?'soon':endSeen(n)&&(!ok||ok(n))?'done':'play';prev=st[n]==='done'}
  return st}
const doneOf=st=>Object.keys(st).map(Number).filter(n=>st[n]==='done');
function readLit(){const v=LB.store.get(LIT,null);if(v==null)return[];try{const a=JSON.parse(v);return Array.isArray(a)?a.filter(x=>Number.isInteger(x)):[]}catch(e){return[]}}
/* ---------- son : fond sonore (bus musique, HUB_T.bed) et cloches (bus effets) ---------- */
const bed={nodes:null,timer:0,
  start(){if(this.nodes)return;const ctx=LB.audio.ensure();if(!ctx||!LB.audio.mus)return;
    try{const B=HUB_T.bed,t=ctx.currentTime,src=[],node=(type,f,q)=>{const x=ctx.createBiquadFilter();x.type=type;x.frequency.value=f;if(q)x.Q.value=q;return x},
        out=ctx.createGain(),bus=ctx.createGain(),lp=node('lowpass',(B.lp.lo+B.lp.hi)/2,B.lp.q),hp=node('highpass',B.hp);
      out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(1,t+B.fade);out.connect(LB.audio.mus);
      /* bus -> passe-bas balayé -> passe-haut -> sortie, et l'écho (retard à rétroaction adouci) en parallèle */
      bus.connect(lp);lp.connect(hp);hp.connect(out);
      const sw=ctx.createOscillator(),sg=ctx.createGain();sw.frequency.value=1/B.lp.period;sg.gain.value=(B.lp.hi-B.lp.lo)/2;sw.connect(sg);sg.connect(lp.frequency);sw.start(t);src.push(sw);
      const E=B.echo,dl=ctx.createDelay(Math.ceil(E.t)+1),fb=ctx.createGain(),dm=node('lowpass',E.damp),wet=ctx.createGain();dl.delayTime.value=E.t;fb.gain.value=E.fb;wet.gain.value=E.wet;
      hp.connect(dl);dl.connect(dm);dm.connect(fb);fb.connect(dl);dm.connect(wet);wet.connect(out);
      /* houle : le niveau de g monte et descend toutes les `period` s (entre base·(1-depth) et base) */
      const swell=(g,base,period,depth)=>{g.gain.value=base*(1-depth/2);const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=1/period;lg.gain.value=base*depth/2;l.connect(lg);lg.connect(g.gain);l.start(t);src.push(l)};
      const master=ctx.createGain();swell(master,1,B.swell.all.period,B.swell.all.depth);master.connect(bus);
      B.notes.forEach(([f,v],i)=>{const g=ctx.createGain();swell(g,v/B.detune.length,B.swell.periods[i%B.swell.periods.length],B.swell.depth);g.connect(master);
        for(const c of B.detune){const o=ctx.createOscillator();o.type='sine';o.frequency.value=f;o.detune.value=c;o.connect(g);o.start(t);src.push(o)}});
      {const A=B.air,len=ctx.sampleRate*4,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);let last=0;   // bruit brun : que du grave
        for(let i=0;i<len;i++){last=(last+.02*(Math.random()*2-1))/1.02;d[i]=last*3.5}
        const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=buf;s.loop=true;swell(g,A.vol,A.period,A.depth);const nl=node('lowpass',A.f);s.connect(nl);nl.connect(g);g.connect(master);s.start(t);src.push(s)}
      this.nodes={out,bus:master,src};if(B.spark)this.spark(B.spark,B.spark.first)}catch(e){this.nodes=null}},
  spark(F,wait){clearTimeout(this.timer);this.timer=setTimeout(()=>{const N=this.nodes,ctx=LB.audio.ctx;if(!N||!ctx)return;
    try{const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),a=t+F.atk,e=a+F.dec;o.type='sine';o.frequency.value=F.f[Math.floor(Math.random()*F.f.length)];
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(F.vol,a);g.gain.exponentialRampToValueAtTime(.0001,e);o.connect(g);g.connect(N.bus);o.start(t);o.stop(e+.1)}catch(x){}
    this.spark(F,F.every[0]+Math.random()*F.every[1])},wait*1000)},
  stop(){clearTimeout(this.timer);const N=this.nodes,ctx=LB.audio.ctx;if(!N||!ctx)return;this.nodes=null;
    try{const t=ctx.currentTime;N.out.gain.cancelScheduledValues(t);N.out.gain.setTargetAtTime(0,t,HUB_T.bedOut/3);N.src.forEach(o=>o.stop(t+HUB_T.bedOut))}catch(e){}}
};
function bell(n,delay){const c=CH(n),ctx=LB.audio.ctx;if(!c||!ctx)return;const B=HUB_T.bell,t=ctx.currentTime+(delay||0);
  for(const [k,v,d] of B.partials)LB.audio.tone(c.bell*k,B.dur*d,'sine',B.vol*v,null,t,0,{atk:.004,end:.0004,tail:.05})}
/* ---------- figure ---------- */
const pos=n=>{const a=-Math.PI/2+(n-1)*2*Math.PI/HUB_T.towers;return[50+HUB_T.r*100*Math.cos(a),50+HUB_T.r*100*Math.sin(a)]};
const tw={},seg={};let shown={},card=0,leaving=false,feast=0;
function build(){const fig=$('fig'),wire=$('wire'),core=$('core');
  for(let n=1;n<=HUB_T.towers;n++){
    const [x2,y2]=pos(n%HUB_T.towers+1),[x1,y1]=pos(n),l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1.toFixed(3));l.setAttribute('y1',y1.toFixed(3));l.setAttribute('x2',x2.toFixed(3));l.setAttribute('y2',y2.toFixed(3));wire.appendChild(l);seg[n]=l;
    const b=document.createElement('button');b.type='button';b.className='tw';b.dataset.n=n;b.style.left=x1+'%';b.style.top=y1+'%';
    const col=LB.CH_COL[n];if(col){b.style.setProperty('--c',col);b.style.setProperty('--cr',rgbOf(col))}
    b.innerHTML='<span class="halo"></span><span class="dot"></span>';b.addEventListener('click',e=>{e.stopPropagation();open(n)});fig.insertBefore(b,core);tw[n]=b}}
/* applique un état aux tours et au fil (st : n -> état) */
function apply(st){shown=st;
  for(let n=1;n<=HUB_T.towers;n++){const b=tw[n],s=st[n],on=s!=='closed',c=CH(n);
    for(const k of ['closed','play','done','soon'])b.classList.toggle(k,k===s);
    b.disabled=!on;b.tabIndex=on?0:-1;
    if(on){b.removeAttribute('aria-hidden');b.setAttribute('aria-label',LB.chapterName(n,c.title))}else{b.setAttribute('aria-hidden','true');b.removeAttribute('aria-label')}
    const l=seg[n],lit=s==='done';l.classList.toggle('on',lit);l.style.stroke=lit&&LB.CH_COL[n]?LB.CH_COL[n]:HUB_T.wire.col}}
function chime(n,delay){bell(n,delay);const b=tw[n];if(!b||LB.motion.reduced())return;setTimeout(()=>{b.classList.remove('ring');void b.offsetWidth;b.classList.add('ring')},(delay||0)*1000)}
/* arrivée (après « Commencer » ou au retour d'un chapitre) : les tours terminées pas encore fêtées s'allument devant le joueur avec
   leur cloche, puis sont marquées fêtées (lb-hub-lit) ; celles déjà fêtées sont déjà allumées, sans animation */
function feastStates(){const lit=readLit();return states(n=>lit.includes(n))}
function celebrate(){const now=states(),before=feastStates(),fresh=doneOf(now).filter(n=>before[n]!=='done'),id=++feast;
  LB.store.set(LIT,JSON.stringify(doneOf(now)));
  if(!fresh.length){apply(now);return}
  apply(before);setTimeout(()=>{if(id!==feast||leaving)return;apply(now);if(card)open(card,true);fresh.forEach((n,i)=>chime(n,i*HUB_T.light.gap))},HUB_T.light.delay*1000)}
/* ---------- carte ---------- */
function open(n,quiet){const s=shown[n],c=CH(n);if(!c||s==='closed'||leaving)return;
  const hc=$('hcard'),col=LB.CH_COL[n]||'#8a8a9a';if(card&&tw[card])tw[card].classList.remove('sel');card=n;tw[n].classList.add('sel');if(!quiet)chime(n,0);
  hc.style.setProperty('--c',col);hc.style.setProperty('--cr',rgbOf(col));
  $('hcName').textContent=c.title;
  hc.classList.toggle('soon',!!c.soon);$('hcSoon').hidden=!c.soon;$('hcSoon').textContent=LB._('Coming soon','À venir');
  $('hcGo').hidden=!!c.soon;$('hcGo').disabled=false;hc.setAttribute('aria-label',LB.chapterName(n,c.title));hc.hidden=false;placeCard();
  if(!quiet)try{(c.soon?hc:$('hcGo')).focus({preventScroll:true})}catch(e){}}
function close(focus){if(!card)return;const n=card;card=0;tw[n].classList.remove('sel');$('hcard').hidden=true;if(focus)try{tw[n].focus({preventScroll:true})}catch(e){}}
function enter(){const c=CH(card);if(!c||c.soon||leaving)return;leaving=true;$('hcGo').disabled=true;bed.stop();
  location.href=c.path+'?from='+LB.HUB.from}
/* ---------- réglages (SETTINGS_T) ---------- */
let setOpen=false;
function setRows(){const box=$('hsRows');box.innerHTML='';
  for(const S of SETTINGS_T){const row=document.createElement('div');row.className='hsrow';row.dataset.id=S.id;
    if(S.type==='hold'){row.innerHTML='<button type="button" class="hshold" id="hs-'+S.id+'"><i class="gauge"></i><b></b><small></small></button>';hold(row.firstChild,S)}
    else{row.innerHTML='<span id="hsl-'+S.id+'"></span><div class="hsopts" role="group" aria-labelledby="hsl-'+S.id+'"></div>';
      const g=row.lastChild,opts=S.type==='toggle'?[[true,'On','Oui'],[false,'Off','Non']]:S.opts;
      for(const o of opts){const b=document.createElement('button');b.type='button';b.dataset.v=String(o[0]);b.addEventListener('click',()=>{S.set(o[0]);setSync()});g.appendChild(b)}}
    box.appendChild(row)}}
function setSync(){for(const S of SETTINGS_T){const row=document.querySelector('.hsrow[data-id="'+S.id+'"]');if(!row)continue;
  if(S.type==='hold'){row.querySelector('b').textContent=tx(S.label);row.querySelector('small').textContent=tx(S.hint);continue}
  row.firstChild.textContent=tx(S.label);const v=String(S.get()),opts=S.type==='toggle'?[[true,'On','Oui'],[false,'Off','Non']]:S.opts;
  row.querySelectorAll('.hsopts button').forEach((b,i)=>{b.textContent=LB._(opts[i][1],opts[i][2]);b.setAttribute('aria-pressed',String(b.dataset.v===v))})}}
/* appui maintenu : la jauge se remplit en S.hold s ; relâcher (ou perdre le doigt, le focus) avant la fin annule ; un clic ne fait rien */
function hold(b,S){let t0=0,raf=0,on=false;const p=v=>b.style.setProperty('--p',v.toFixed(3));
  const stop=()=>{if(!on)return;on=false;cancelAnimationFrame(raf);b.classList.remove('on');p(0)};
  const tick=()=>{if(!on)return;const k=Math.min(1,(performance.now()-t0)/(S.hold*1000));p(k);if(k>=1){stop();S.run();return}raf=requestAnimationFrame(tick)};
  const go=()=>{if(on)return;on=true;t0=performance.now();b.classList.add('on');raf=requestAnimationFrame(tick)};
  b.addEventListener('pointerdown',e=>{if(e.button)return;e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(x){}go()});
  for(const ev of ['pointerup','pointercancel','lostpointercapture','blur'])b.addEventListener(ev,stop);
  b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)go()}});
  b.addEventListener('keyup',e=>{if(e.key==='Enter'||e.key===' ')stop()});
  b.addEventListener('contextmenu',e=>e.preventDefault())}
function settings(on){if(on===setOpen)return;setOpen=on;$('hset').hidden=!on;$('setBtn').setAttribute('aria-expanded',String(on));
  if(on){close(false);setSync();try{$('hsClose').focus({preventScroll:true})}catch(e){}}else try{$('setBtn').focus({preventScroll:true})}catch(e){}}
/* efface la progression (RESET_T), garde la langue et les réglages ; le hub se réaffiche à l'état vierge */
function reset(){const hit=k=>RESET_T.keys.includes(k)||RESET_T.prefix.some(p=>k.startsWith(p));
  try{const ks=[];for(let i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));ks.filter(hit).forEach(k=>localStorage.removeItem(k))}catch(e){}
  try{sessionStorage.removeItem(LIT)}catch(e){}   // ancienne place des tours vues allumées
  feast++;settings(false);close(false);apply(states());try{tw[home()].focus({preventScroll:true})}catch(e){}}
/* ---------- textes ---------- */
function lang(){document.documentElement.lang=LB.lang.cur;
  $('gateBtn').textContent=LB._('Start','Commencer');$('hcGo').textContent=LB._('Enter','Entrer');
  $('fig').setAttribute('aria-label',LB._('Chapters','Chapitres'));$('langs').setAttribute('aria-label',LB._('Language','Langue'));
  const st=LB._('Settings','Réglages');$('setBtn').setAttribute('aria-label',st);$('setBtn').title=st;$('hsTitle').textContent=st;$('hsClose').setAttribute('aria-label',LB._('Close','Fermer'));
  document.querySelectorAll('#langs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===LB.lang.cur)));
  setSync();apply(shown);if(card)open(card,true);layout()}
/* ---------- mise en page (HUB_T) : figure aussi grande que la place restante (la carte ne la déplace pas) ; titre centré entre le haut
   de la zone sûre et le haut de la tour I, sur le même axe vertical que la figure ---------- */
function layout(){const R=document.documentElement.style,T=HUB_T,w=$('figwrap'),low=innerHeight<=T.lowH&&innerWidth>innerHeight;
  R.setProperty('--titleFs',low?T.title.low:T.title.fs);
  const sat=parseFloat(getComputedStyle($('hhead')).paddingTop)||0,th=$('brand').offsetHeight,wt=w.getBoundingClientRect().top;
  const top=Math.max(0,sat+th+2*T.title.gap-wt),W=w.clientWidth,H=w.clientHeight-top;
  const s=Math.max(T.fig.min,Math.min(T.fig.max,W,H)),dot=Math.round(Math.max(T.dot.min,Math.min(T.dot.max,s*T.dot.k))),fy=top+Math.max(H,s)/2;
  R.setProperty('--s',s+'px');R.setProperty('--dot',dot+'px');R.setProperty('--core',Math.max(T.core.min,Math.round(s*T.core.k))+'px');
  R.setProperty('--fx',W/2+'px');R.setProperty('--fy',fy+'px');
  const towerTop=wt+fy-T.r*s-dot/2;R.setProperty('--titleTop',Math.round((towerTop-sat-th)/2)+'px');
  if(card)placeCard()}
/* carte d'entrée : sous la tour choisie (pointe vers elle), sinon au-dessus ; dans l'écran ; jamais sur une tour ni sur le point central.
   Pour chaque côté, on cherche la position la plus proche de la tour (la carte glisse de côté, la pointe restant sur la carte) qui ne
   recouvre ni les disques des tours et du centre, ni (en priorité) les boutons et le titre. */
function placeCard(){const hc=$('hcard'),T=HUB_T.card;if(!card||hc.hidden)return;
  const wr=$('figwrap').getBoundingClientRect(),dr=tw[card].querySelector('.dot').getBoundingClientRect(),W=innerWidth,H=innerHeight,m=T.edge,
    tip=T.tip*Math.SQRT1_2,sat=parseFloat(getComputedStyle($('hhead')).paddingTop)||0,tx=dr.left+dr.width/2,ty=dr.top+dr.height/2,tr=dr.width/2,
    cw=hc.offsetWidth,ch=hc.offsetHeight,
    discs=[...document.querySelectorAll('.tw .dot,#core')].map(e=>{const q=e.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2,r:q.width/2}}),
    rg=document.createRange();rg.selectNodeContents($('brand'));
    const boxes=[...document.querySelectorAll('#langs button,#ver,#setBtn'),rg].map(e=>e.getBoundingClientRect()),
    hitC=(r,c)=>{const dx=Math.max(r.l-c.x,0,c.x-r.r),dy=Math.max(r.t-c.y,0,c.y-r.b);return dx*dx+dy*dy<(c.r+T.clear)*(c.r+T.clear)},
    hitB=(r,o)=>r.l<o.right+T.clear&&r.r>o.left-T.clear&&r.t<o.bottom+T.clear&&r.b>o.top-T.clear,
    lo=m,hi=Math.max(lo,W-m-cw),ideal=Math.min(hi,Math.max(lo,tx-cw/2)),
    lefts=[ideal];for(let l=lo;l<hi;l+=T.step)lefts.push(l);lefts.push(hi);lefts.sort((a,b)=>Math.abs(a+cw/2-tx)-Math.abs(b+cw/2-tx));
  const find=(side,avoid)=>{const t=side==='below'?ty+tr+T.gap+tip:ty-tr-T.gap-tip-ch;if(t<sat+m||t+ch>H-m)return null;
    for(const l of lefts){if(tx<l+T.tipMin||tx>l+cw-T.tipMin)continue;const r={l,t,r:l+cw,b:t+ch};
      if(discs.some(c=>hitC(r,c))||(avoid&&boxes.some(o=>hitB(r,o))))continue;return{l,t,side}}return null};
  const at=find('below',true)||find('above',true)||find('below',false)||find('above',false)||{l:ideal,t:ty+tr+T.gap+tip,side:'below'};
  hc.style.left=Math.round(at.l-wr.left)+'px';hc.style.top=Math.round(at.t-wr.top)+'px';hc.classList.toggle('up',at.side==='above');
  hc.style.setProperty('--tipX',Math.round(Math.min(cw-T.tipMin,Math.max(T.tipMin,tx-at.l)))+'px')}
function vars(){const R=document.documentElement.style,T=HUB_T,M=T.motes,set=(k,v)=>R.setProperty('--'+k,v);
  set('lantern',LB.BRAND.lantern);set('lanternRgb',rgbOf(LB.BRAND.lantern));set('bell',LB.BRAND.bell);
  set('pad',T.pad+'px');set('hit',T.hit+'px');set('touch',T.touch+'px');set('ringW',T.ring.w+'px');set('ringOff',T.ring.off);
  set('glowB',T.glow.blur+'px');set('glowS',T.glow.spread+'px');set('pulseDur',T.pulse.dur+'s');set('pulseLo',T.pulse.lo);
  set('coreCol',T.core.col);set('coreLo',T.core.lo);set('coreHi',T.core.hi);set('beat',T.core.beat+'s');
  set('wireW',T.wire.w+'px');set('wireOff',T.wire.off);set('wireOn',T.wire.on);set('lightDur',T.light.dur+'s');set('ringDur',T.ringDur+'s');
  set('nameFs',T.card.fs);set('tipS',T.card.tip+'px');set('cardEdge',T.card.edge+'px');set('verR',T.ver.right+'px');
  set('haloGap',T.halo.gap+'px');set('haloW',T.halo.w+'px');set('setW',T.set.w);set('gearS',T.set.gear+'px');set('warn',T.set.warn);set('warnRgb',rgbOf(T.set.warn));
  set('moteCol',M.col);set('moteGlow',M.glow);set('motePeak',M.peak);set('moteRise',M.rise)}
function motes(){const M=HUB_T.motes,w=$('motes');
  for(let i=0;i<M.n;i++){const e=document.createElement('i');e.className='mote';e.style.left=(Math.random()*100)+'%';e.style.setProperty('--dx',((Math.random()-.5)*M.dx)+'px');
    e.style.animationDuration=(M.dur[0]+Math.random()*M.dur[1])+'s';e.style.animationDelay=(-Math.random()*M.delay)+'s';const z=M.size[0]+Math.random()*M.size[1];e.style.width=e.style.height=z+'px';w.appendChild(e)}}
/* ---------- clavier : flèches (tour suivante / précédente, sens horaire), Entrée (native), Échap (ferme la carte, les réglages) ---------- */
function focusables(){const o=[];for(let n=1;n<=HUB_T.towers;n++)if(shown[n]!=='closed')o.push(n);return o}
function home(){const o=focusables();return o.find(n=>shown[n]==='play')||o[0]||1}
function keys(e){if(!$('gate').hidden||leaving)return;const k=e.key;
  if(setOpen){if(k==='Escape'){e.preventDefault();settings(false)}
    else if(k==='Tab'){const f=[...$('hset').querySelectorAll('button')],i=f.indexOf(document.activeElement);e.preventDefault();try{f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}catch(x){}}
    return}
  if(k==='Escape'){if(card){e.preventDefault();close(true)}return}
  const f={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[k];if(!f)return;e.preventDefault();
  const o=focusables();if(!o.length)return;const a=document.activeElement,cur=a&&a.classList&&a.classList.contains('tw')?+a.dataset.n:card||0;
  if(card)close(false);
  const i=o.indexOf(cur),n=i<0?home():o[(i+f+o.length)%o.length];try{tw[n].focus({preventScroll:true})}catch(x){}}
/* ---------- démarrage ---------- */
function arrive(){bed.start();celebrate();try{tw[home()].focus({preventScroll:true})}catch(e){}}   // après « Commencer »
function back(){bed.start();celebrate();try{tw[backN&&states()[backN]!=='closed'?backN:home()].focus({preventScroll:true})}catch(e){}}   // retour d'un chapitre, sans écran
vars();motes();build();apply(feastStates());setRows();
$('langs').innerHTML=LB.LANGS.map(l=>'<button type="button" data-lang="'+l+'" aria-pressed="false">'+l.toUpperCase()+'</button>').join('');
document.querySelectorAll('#langs button').forEach(b=>b.addEventListener('click',()=>{LB.lang.set(b.dataset.lang);lang();b.blur()}));
$('ver').textContent='v'+LB.VERSION;$('ver').setAttribute('aria-label','Version '+LB.VERSION);
$('hcGo').addEventListener('click',e=>{e.stopPropagation();enter()});
$('hcard').addEventListener('click',e=>e.stopPropagation());
$('hub').addEventListener('click',e=>{if(card&&!e.target.closest('.tw,.hcard,.hfoot,.gear,.hset'))close(false)});
$('setBtn').addEventListener('click',e=>{e.stopPropagation();settings(!setOpen)});
$('hsClose').addEventListener('click',()=>settings(false));
$('hset').addEventListener('click',e=>{if(e.target===$('hset'))settings(false)});
$('gateBtn').addEventListener('click',()=>{LB.audio.ensure();$('gate').hidden=true;LB.lift();arrive()});
document.addEventListener('keydown',keys);
addEventListener('resize',layout);
addEventListener('pageshow',e=>{if(e.persisted){leaving=false;$('hcGo').disabled=false;if($('gate').hidden){bed.nodes=null;bed.start()}}});   // retour arrière du navigateur (page gardée en mémoire)
lang();
if(backN){$('gate').hidden=true;LB.lift();back()}else{try{$('gateBtn').focus({preventScroll:true})}catch(e){}}
