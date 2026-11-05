/* ---------- particles & pops ---------- */
/* Remanence (end of phase III): the turquoise light of the Bottomless evaporates, going up and brightening towards white
   (a particle goes from c to c2 over its life; no text, no sound). REMANENCE = number, spread, rise speed, life, colours. */
const REMANENCE={n:60,spread:30,up:[.7,1.5],life:3.8,c:[111,232,255],c2:[255,255,255]};
/* ceiling on live particles: far above any fight (about 400 at the most: two big bursts plus dust), it only guards against a pile-up.
   The random draws are made before the check, so the sequence is unchanged. */
const PARTS_MAX=1500;
function addPart(o){if(S.parts.length<PARTS_MAX)S.parts.push(o)}
function evaporate(x,y){const R=REMANENCE;for(let i=0;i<R.n;i++)addPart({x:x+(Math.random()-.5)*R.spread,y:y+(Math.random()-.5)*10,vx:(Math.random()-.5)*.14,vy:-(R.up[0]+Math.random()*(R.up[1]-R.up[0])),g:0,t0:gt,life:R.life*(.7+Math.random()*.5),c:R.c,c2:R.c2,r:1.8+Math.random()*2.4})}
function burst(x,y,n,col,spd,life,g){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(.3+Math.random())*spd;addPart({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(g?spd*.4:0),g:g||0,t0:gt,life:life*(.6+Math.random()*.6),c:col,r:1.5+Math.random()*2.2})}}
/* floating text: only onomatopoeia (same words in both languages, as in Ember Bridge); no announcement words */
/* onomatopoeia: no word on an ordinary riposte (as in Ember Bridge); the Voice only cries, by sound */
const ONO={block:'CLANG',final:'KRAKOOM',crush:'KRAAAK'};
function pop(txt,col,x,y){S.pops.push({txt,c:col,x:x||HX+10,y:y||GY-150,t0:gt})}

/* ---------- patterns ---------- */
function sched(list){const pat={ths:list,ok:true,perf:0,nReal:list.filter(t=>t.real!==false&&!t.hold).length};list.forEach(th=>{if(th.real===undefined)th.real=true;th.pat=pat;S.threats.push(th)});S.pat=pat;return pat}

