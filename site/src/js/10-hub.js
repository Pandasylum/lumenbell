/* ---------- Hub de la série (site/index.html ; décision docs/decisions/2026-11-02-hub-site.md) ----------
   Écran de démarrage (un seul bouton : débloque le son, lance le bourdon du hub), puis la figure : six tours en cercle (chapitres
   I à VI, I en haut, sens horaire), VII au centre (point blanc très faible qui bat, jamais cliquable). Aucun nom de la figure à
   l'écran ni dans les libellés. Une tour : terminée (lumière stable), à jouer (pulsation douce), annoncée (anneau de sa couleur,
   « À venir »), fermée (anneau éteint, sans nom, rien au toucher). Ouverte : chapitre I, ou vraie fin du précédent mémorisée
   (lb-chN-end), la chaîne entière comptant (II terminé sans I terminé : II reste fermé). Toucher une tour ouverte : sa cloche,
   et une petite carte (« Chapitre N », nom, « Entrer ») ; Entrer ouvre <chapitre>/index.html?from=hub (LB.HUB, shared/js/28-ui.js).
   Retour d'un chapitre (?back=N) : sans écran de démarrage, le bourdon repart ; une tour terminée depuis la dernière visite
   s'allume avec sa cloche. Tout réglage est dans HUB_CH et HUB_T ; un chapitre de plus = une entrée de plus dans HUB_CH. */
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
  light:{dur:1.6,delay:.7},                  // tour qui s'allume au retour : durée du fondu, délai après l'arrivée (s)
  answer:{first:.5,gap:.6},                  // arrivée : délai avant la première tour qui répond, écart entre deux tours (s)
  ringDur:1.4,                               // éclat d'une tour qui sonne (s)
  title:{fs:'clamp(30px,8vw,64px)',low:'clamp(24px,7vh,40px)'},   // titre (paysage bas : low)
  name:'clamp(30px,8vw,46px)',cardW:'min(86vw,320px)',          // carte : nom du chapitre, largeur
  bell:{dur:3.6,vol:.07,partials:[[1,1,1],[2.0,.5,.7],[2.76,.32,.5],[4.07,.18,.35],[5.4,.1,.25]]},   // cloche : [rapport, niveau, durée relative]
  drone:{f:[55,82.41,110.2],vol:[.07,.045,.025],type:'sine',lp:380,lfo:.09,depth:.35,fade:3,out:.4},   // bourdon : fréquences, niveaux, filtre, souffle (Hz, part), fondu d'entrée / de sortie (s)
  motes:{n:18,dur:[12,10],delay:22,size:[1.5,2],dx:90,rise:'-75vh',peak:.5,col:'rgba(255,233,168,.9)',glow:'0 0 8px 2px rgba(255,214,120,.35)'},
  lowH:520                                   // paysage bas (px de haut) : titre réduit
};
const $=id=>document.getElementById(id);
const CH=n=>HUB_CH.find(c=>c.n===n)||null;
const rgbOf=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');
const sGet=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},sSet=(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}};
const LIT='lb-hub-lit';   // tours vues allumées à la dernière visite du hub (session) : celles qui s'y ajoutent s'allument devant le joueur
const reduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
/* ---------- état des tours ---------- */
function endSeen(n){return LB.store.get('lb-ch'+n+'-end','0')==='1'}
function states(){const st={};let prev=true;   // prev : la tour précédente est ouverte et terminée
  for(let n=1;n<=HUB_T.towers;n++){const c=CH(n),open=!!c&&prev;
    st[n]=!open?'closed':c.soon?'soon':endSeen(n)?'done':'play';prev=st[n]==='done'}
  return st}
function readLit(){const v=sGet(LIT);if(v==null)return null;try{const a=JSON.parse(v);return Array.isArray(a)?a.filter(x=>Number.isInteger(x)):null}catch(e){return null}}
/* ---------- son : bourdon (bus musique) et cloches (bus effets) ---------- */
const drone={nodes:null,
  start(){if(this.nodes)return;const ctx=LB.audio.ensure();if(!ctx||!LB.audio.mus)return;
    try{const D=HUB_T.drone,t=ctx.currentTime,out=ctx.createGain(),lp=ctx.createBiquadFilter(),lfo=ctx.createOscillator(),lg=ctx.createGain(),osc=[];
      out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(1,t+D.fade);lp.type='lowpass';lp.frequency.value=D.lp;lp.connect(out);out.connect(LB.audio.mus);
      const breath=ctx.createGain();breath.gain.value=1-D.depth;breath.connect(lp);lfo.frequency.value=D.lfo;lg.gain.value=D.depth;lfo.connect(lg);lg.connect(breath.gain);lfo.start(t);
      D.f.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=D.type;o.frequency.value=f;g.gain.value=D.vol[i];o.connect(g);g.connect(breath);o.start(t);osc.push(o)});
      this.nodes={out,osc:osc.concat(lfo)}}catch(e){this.nodes=null}},
  stop(){const N=this.nodes,ctx=LB.audio.ctx;if(!N||!ctx)return;this.nodes=null;
    try{const t=ctx.currentTime;N.out.gain.cancelScheduledValues(t);N.out.gain.setTargetAtTime(0,t,HUB_T.drone.out/3);N.osc.forEach(o=>o.stop(t+HUB_T.drone.out))}catch(e){}}
};
function bell(n,delay){const c=CH(n),ctx=LB.audio.ctx;if(!c||!ctx)return;const B=HUB_T.bell,t=ctx.currentTime+(delay||0);
  for(const [k,v,d] of B.partials)LB.audio.tone(c.bell*k,B.dur*d,'sine',B.vol*v,null,t,0,{atk:.004,end:.0004,tail:.05})}
/* ---------- figure ---------- */
const pos=n=>{const a=-Math.PI/2+(n-1)*2*Math.PI/HUB_T.towers;return[50+HUB_T.r*100*Math.cos(a),50+HUB_T.r*100*Math.sin(a)]};
const tw={},seg={};let shown={},card=0,leaving=false;
function build(){const fig=$('fig'),wire=$('wire'),core=$('core');
  for(let n=1;n<=HUB_T.towers;n++){
    const [x2,y2]=pos(n%HUB_T.towers+1),[x1,y1]=pos(n),l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1.toFixed(3));l.setAttribute('y1',y1.toFixed(3));l.setAttribute('x2',x2.toFixed(3));l.setAttribute('y2',y2.toFixed(3));wire.appendChild(l);seg[n]=l;
    const b=document.createElement('button');b.type='button';b.className='tw';b.dataset.n=n;b.style.left=x1+'%';b.style.top=y1+'%';
    const col=LB.CH_COL[n];if(col){b.style.setProperty('--c',col);b.style.setProperty('--cr',rgbOf(col))}
    b.innerHTML='<span class="dot"></span>';b.addEventListener('click',e=>{e.stopPropagation();open(n)});fig.insertBefore(b,core);tw[n]=b}}
/* applique un état aux tours et au fil (st : n -> état) */
function apply(st){shown=st;
  for(let n=1;n<=HUB_T.towers;n++){const b=tw[n],s=st[n],on=s!=='closed',c=CH(n);
    for(const k of ['closed','play','done','soon'])b.classList.toggle(k,k===s);
    b.disabled=!on;b.tabIndex=on?0:-1;
    if(on){b.removeAttribute('aria-hidden');b.setAttribute('aria-label',LB.chapterName(n,c.title))}else{b.setAttribute('aria-hidden','true');b.removeAttribute('aria-label')}
    const l=seg[n],lit=s==='done';l.classList.toggle('on',lit);l.style.stroke=lit&&LB.CH_COL[n]?LB.CH_COL[n]:HUB_T.wire.col}}
function chime(n,delay){bell(n,delay);const b=tw[n];if(!b||reduced())return;setTimeout(()=>{b.classList.remove('ring');void b.offsetWidth;b.classList.add('ring')},(delay||0)*1000)}
/* ---------- carte ---------- */
function open(n){const s=shown[n],c=CH(n);if(!c||s==='closed'||leaving)return;
  const hc=$('hcard'),col=LB.CH_COL[n]||'#8a8a9a';card=n;chime(n,0);
  hc.style.setProperty('--c',col);hc.style.setProperty('--cr',rgbOf(col));
  $('hcEye').textContent=LB._('Chapter ','Chapitre ')+LB.ROMAN[n];$('hcName').textContent=c.title;
  $('hcSoon').hidden=!c.soon;$('hcSoon').textContent=LB._('Coming soon','À venir');
  $('hcGo').hidden=!!c.soon;$('hcGo').disabled=false;hc.setAttribute('aria-label',LB.chapterName(n,c.title));hc.hidden=false;
  try{(c.soon?hc:$('hcGo')).focus({preventScroll:true})}catch(e){}}
function close(focus){if(!card)return;const n=card;card=0;$('hcard').hidden=true;if(focus)try{tw[n].focus({preventScroll:true})}catch(e){}}
function enter(){const c=CH(card);if(!c||c.soon||leaving)return;leaving=true;$('hcGo').disabled=true;
  sSet(LIT,JSON.stringify(Object.keys(shown).map(Number).filter(n=>shown[n]==='done')));drone.stop();
  location.href=c.path+'?from='+LB.HUB.from}
/* ---------- textes ---------- */
function lang(){document.documentElement.lang=LB.lang.cur;
  $('gateBtn').textContent=LB._('Start','Commencer');$('hcGo').textContent=LB._('Enter','Entrer');
  $('fig').setAttribute('aria-label',LB._('Chapters','Chapitres'));$('langs').setAttribute('aria-label',LB._('Language','Langue'));
  $('fsBtn').querySelector('span').textContent=LB._('Fullscreen','Plein écran');LB.fs.lang();
  document.querySelectorAll('#langs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===LB.lang.cur)));
  apply(shown);if(card)open(card)}
/* ---------- mise en page : figure aussi grande que la place restante, jamais de débordement ---------- */
function layout(){const R=document.documentElement.style,w=$('figwrap'),T=HUB_T,low=innerHeight<=T.lowH&&innerWidth>innerHeight;
  R.setProperty('--titleFs',low?T.title.low:T.title.fs);
  const s=Math.max(T.fig.min,Math.min(T.fig.max,w.clientWidth,w.clientHeight));
  R.setProperty('--s',s+'px');R.setProperty('--dot',Math.round(Math.max(T.dot.min,Math.min(T.dot.max,s*T.dot.k)))+'px');
  R.setProperty('--core',Math.max(T.core.min,Math.round(s*T.core.k))+'px')}
function vars(){const R=document.documentElement.style,T=HUB_T,M=T.motes,set=(k,v)=>R.setProperty('--'+k,v);
  set('lantern',LB.BRAND.lantern);set('lanternRgb',rgbOf(LB.BRAND.lantern));set('bell',LB.BRAND.bell);
  set('pad',T.pad+'px');set('hit',T.hit+'px');set('touch',T.touch+'px');set('ringW',T.ring.w+'px');set('ringOff',T.ring.off);
  set('glowB',T.glow.blur+'px');set('glowS',T.glow.spread+'px');set('pulseDur',T.pulse.dur+'s');set('pulseLo',T.pulse.lo);
  set('coreCol',T.core.col);set('coreLo',T.core.lo);set('coreHi',T.core.hi);set('beat',T.core.beat+'s');
  set('wireW',T.wire.w+'px');set('wireOff',T.wire.off);set('wireOn',T.wire.on);set('lightDur',T.light.dur+'s');set('ringDur',T.ringDur+'s');
  set('nameFs',T.name);set('cardW',T.cardW);
  set('moteCol',M.col);set('moteGlow',M.glow);set('motePeak',M.peak);set('moteRise',M.rise)}
function motes(){const M=HUB_T.motes,w=$('motes');
  for(let i=0;i<M.n;i++){const e=document.createElement('i');e.className='mote';e.style.left=(Math.random()*100)+'%';e.style.setProperty('--dx',((Math.random()-.5)*M.dx)+'px');
    e.style.animationDuration=(M.dur[0]+Math.random()*M.dur[1])+'s';e.style.animationDelay=(-Math.random()*M.delay)+'s';const z=M.size[0]+Math.random()*M.size[1];e.style.width=e.style.height=z+'px';w.appendChild(e)}}
/* ---------- clavier : flèches (tour suivante / précédente, sens horaire), Entrée (native), Échap (ferme la carte) ---------- */
function focusables(){const o=[];for(let n=1;n<=HUB_T.towers;n++)if(shown[n]!=='closed')o.push(n);return o}
function home(){const o=focusables();return o.find(n=>shown[n]==='play')||o[0]||1}
function keys(e){if(!$('gate').hidden||leaving)return;const k=e.key;
  if(k==='Escape'){if(card){e.preventDefault();close(true)}return}
  const f={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[k];if(!f)return;e.preventDefault();
  const o=focusables();if(!o.length)return;const a=document.activeElement,cur=a&&a.classList&&a.classList.contains('tw')?+a.dataset.n:card||0;
  if(card)close(false);
  const i=o.indexOf(cur),n=i<0?home():o[(i+f+o.length)%o.length];try{tw[n].focus({preventScroll:true})}catch(x){}}
/* ---------- démarrage ---------- */
const params=(()=>{try{return new URLSearchParams(location.search)}catch(e){return new Map()}})();
const backN=+params.get(LB.HUB.back)||0;
function arrive(){   // après « Commencer » : bourdon, puis les tours terminées répondent l'une après l'autre
  drone.start();const A=HUB_T.answer;let i=0;
  for(let n=1;n<=HUB_T.towers;n++)if(shown[n]==='done')chime(n,A.first+A.gap*i++);
  sSet(LIT,JSON.stringify(focusables().filter(n=>shown[n]==='done')));
  try{tw[home()].focus({preventScroll:true})}catch(e){}}
function back(){   // retour d'un chapitre : bourdon sans nouvel écran ; tours terminées depuis la dernière visite : elles s'allument avec leur cloche
  drone.start();const now=states(),lit=readLit(),fresh=lit?Object.keys(now).map(Number).filter(n=>now[n]==='done'&&!lit.includes(n)):[];
  if(fresh.length){const before={};let prev=true;
    for(let n=1;n<=HUB_T.towers;n++){const c=CH(n),open=!!c&&prev;before[n]=!open?'closed':c.soon?'soon':now[n]==='done'&&!fresh.includes(n)?'done':'play';prev=before[n]==='done'}
    apply(before);setTimeout(()=>{apply(now);fresh.forEach((n,i)=>chime(n,i*HUB_T.answer.gap))},HUB_T.light.delay*1000)}
  else apply(now);
  sSet(LIT,JSON.stringify(Object.keys(now).map(Number).filter(n=>now[n]==='done')));
  try{tw[backN&&now[backN]!=='closed'?backN:home()].focus({preventScroll:true})}catch(e){}}
vars();motes();build();apply(states());
$('langs').innerHTML=LB.LANGS.map(l=>'<button type="button" data-lang="'+l+'" aria-pressed="false">'+l.toUpperCase()+'</button>').join('');
document.querySelectorAll('#langs button').forEach(b=>b.addEventListener('click',()=>{LB.lang.set(b.dataset.lang);lang();b.blur()}));
$('ver').textContent='v'+LB.VERSION;$('ver').setAttribute('aria-label','Version '+LB.VERSION);
$('hcGo').addEventListener('click',e=>{e.stopPropagation();enter()});
$('hcard').addEventListener('click',e=>e.stopPropagation());
$('hub').addEventListener('click',e=>{if(card&&!e.target.closest('.tw,.hcard,.hfoot'))close(false)});
$('gateBtn').addEventListener('click',()=>{LB.audio.ensure();$('gate').hidden=true;arrive()});
document.addEventListener('keydown',keys);
addEventListener('resize',layout);
addEventListener('pageshow',e=>{if(e.persisted){leaving=false;$('hcGo').disabled=false;if($('gate').hidden){drone.nodes=null;drone.start()}}});   // retour arrière du navigateur (page gardée en mémoire)
LB.fs.bind();lang();layout();
if(backN){$('gate').hidden=true;back()}else{try{$('gateBtn').focus({preventScroll:true})}catch(e){}}
