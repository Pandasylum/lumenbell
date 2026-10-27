/* ---------- effects ---------- */
function burst(x,y,n,cols){for(let i=0;i<n;i++){const a=rand(0,6.283),v=rand(80,360),L=rand(.3,.7);G.sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,g:520,life:L,max:L,col:cols[i%cols.length],sz:rand(2,5)})}}
function dust(x,y){for(let i=0;i<18;i++){const d=Math.random()<.5?-1:1,L=rand(.4,.8);G.sparks.push({x:x+rand(-20,20),y:y-2,vx:d*rand(40,220),vy:-rand(20,120),g:260,life:L,max:L,col:'#9a8a9e',sz:rand(3,6)})}}
function ring(x,y){G.rings.push({x,y,life:.35,max:.35})}
/* Texte flottant : seules les onomatopées (coups, cris) et les titres de phase s'affichent ; tout mot d'annonce (PARADE, ORBE, TOUCHÉ…) est supprimé pour garder un ton sombre. */
const ONO={};
(function(){
  const add=(v,list)=>list.forEach(k=>{ONO[k]=v});
  add('BAM',['HIT!','COUP !','TOUCHÉ !','RAMMED!','PERCUTÉ !']);
  add('FWOOOSH',['BURNED!','BRÛLÉ !']);
  add('KRAAAK',['CRUSHED!','ÉCRASÉ !']);
  add('BOOM',['EXPLOSION!','EXPLOSION !','BOOM!','BOUM !']);
  add('CHAK',['HOOKED!','ACCROCHÉ !']);
  add('SKRAAT',['CLAWED!','GRIFFÉ !']);
  add('CLANG',['PARRY!','PARADE !','PARRIED!','PARÉ !','DOUBLE PARRY!','DOUBLE PARADE !','TRIPLE PARRY!','TRIPLE PARADE !','DISARMED!','DÉSARMÉ !']);
  add('THUNK',['STUCK!','PLANTÉ !']);
  add('KRAKOOM',['FINAL BLOW!','COUP ULTIME !']);
  add('CRAAAC',['WING SHATTERED!','AILE BRISÉE !']);
  add('GRAAAH!',['GRAAAH!']);add('GRAAAH !',['GRAAAH !']);add('RAAAH!',['RAAAH!']);add('RAAAH !',['RAAAH !']);
  add('PHASE II',['PHASE II']);add('PHASE III',['PHASE III']);
  ['BAM','FWOOOSH','KRAAAK','BOOM','CHAK','SKRAAT','CLANG','THUNK','CRAAAC','KRAKOOM'].forEach(k=>{ONO[k]=k});
})();
function ono(t){return ONO[t]||null}
/* Taille des onomatopées : plus le coup est lourd, plus le mot est gros. */
const ONOSZ={BAM:44,FWOOOSH:46,KRAAAK:48,BOOM:52,CHAK:42,SKRAAT:46,CLANG:44,THUNK:42,CRAAAC:52,KRAKOOM:68};
/* Son d'impact : un coup sourd grave et un claquement de bruit ; p = puissance (0,3 léger, 1 lourd, 1,5 coup fatal). */
function thud(p){boom(.2+.12*p,.1+.05*p);noise(.09+.05*p,.14+.07*p,2400,240)}
/* Cris du Colosse quand il est touché : six voix différentes (texte et son), choisies selon la force du coup et sa vie restante, sans jamais répéter deux fois la même. */
const CRIES=[
  {t:['GRAAAH!','GRAAAH !'],f:95,s0:1.3,up:1.5,pk:.12,dn:.5,d:.95,v:.16,fa:900,fb:900,fc:220,q:1,vr:38,vd:30,r:.3},
  {t:['RAAAH!','RAAAH !'],f:150,s0:1,up:1.9,pk:.2,dn:.55,d:.8,v:.14,bp:1,fa:1100,fb:1600,fc:500,q:2.2,vr:9,vd:20,r:.5},
  {t:['HRRNGH!','HRRNGH !'],f:80,s0:1.2,up:1.1,pk:.08,dn:.7,d:.32,v:.14,fa:700,fb:700,fc:300,q:1,vr:55,vd:18,r:.6},
  {t:['KHAAAA!','KHAAAA !'],f:210,s0:1,up:1.2,pk:.15,dn:.8,d:.7,v:.07,bp:1,fa:2400,fb:2400,fc:900,q:1.2,vr:20,vd:8,r:1.5},
  {t:['GWOOOAR!','GWOOOAR !'],f:62,s0:1.6,up:1.2,pk:.25,dn:.4,d:1.25,v:.18,fa:700,fb:700,fc:150,q:1,vr:6,vd:10,r:.2},
  {t:['AARRGH!','AARRGH !'],f:190,s0:.9,up:2.1,pk:.35,dn:.5,d:1,v:.13,bp:1,fa:1300,fb:2100,fc:450,q:2.5,vr:13,vd:45,r:.5}
];
CRIES.forEach(c=>c.t.forEach(s=>{ONO[s]=s}));
let LASTCRY=-1;
function cryVoice(c){
  if(!prefs.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  try{
    const n=AC.currentTime,d=c.d,g=AC.createGain(),f=AC.createBiquadFilter(),lfo=AC.createOscillator(),lg=AC.createGain();
    f.type=c.bp?'bandpass':'lowpass';f.Q.value=c.q;
    f.frequency.setValueAtTime(c.fa,n);f.frequency.linearRampToValueAtTime(c.fb,n+d*c.pk);f.frequency.exponentialRampToValueAtTime(c.fc,n+d);
    g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(c.v,n+Math.min(.06,d*.15));g.gain.setValueAtTime(c.v,n+d*.3);g.gain.exponentialRampToValueAtTime(.0001,n+d);
    lfo.frequency.setValueAtTime(c.vr,n);lg.gain.setValueAtTime(c.vd*.5,n);lg.gain.linearRampToValueAtTime(c.vd,n+d);lfo.connect(lg);
    [[1,'sawtooth'],[1.5,'square'],[.5,'sawtooth']].forEach(([m,ty])=>{
      const o=AC.createOscillator(),fr=c.f*m;o.type=ty;
      o.frequency.setValueAtTime(fr*c.s0,n);o.frequency.exponentialRampToValueAtTime(fr*c.up,n+d*c.pk);o.frequency.exponentialRampToValueAtTime(fr*c.dn,n+d);
      lg.connect(o.frequency);o.connect(f);o.start(n);o.stop(n+d);
    });
    lfo.start(n);lfo.stop(n+d);f.connect(g);g.connect(AC.destination);
  }catch(e){}
  if(c.r)noise(c.d*.7,c.v*c.r,2600,700);
}
/* Joue un cri et renvoie son texte. heavy : coup lourd ; hp : PV restants du Colosse (≤ 3 : cris plus déchirés). */
function hurtCry(heavy,hp){
  const pool=hp!=null&&hp<=3?[5,4,1,2]:heavy?[0,1,4,5]:[2,1,0,3];
  let i;do{i=pool[Math.floor(Math.random()*pool.length)]}while(i===LASTCRY);
  LASTCRY=i;cryVoice(CRIES[i]);
  return _(CRIES[i].t[0],CRIES[i].t[1]);
}
/* Cri de la foudre : deux voix superposées (un beuglement grave et un hurlement déchiré), très long, bien plus fort que les autres. */
const MEGA={t:['GRAAAAAAAH!','GRAAAAAAAH !'],
  a:{f:70,s0:1.8,up:2.3,pk:.3,dn:.35,d:2.2,v:.24,fa:900,fb:1500,fc:200,q:1.4,vr:8,vd:35,r:.5},
  b:{f:200,s0:.9,up:2.2,pk:.35,dn:.5,d:1.7,v:.11,bp:1,fa:1300,fb:2300,fc:450,q:2.5,vr:13,vd:50,r:.6}};
MEGA.t.forEach(s=>{ONO[s]=s});
function megaCry(){cryVoice(MEGA.a);cryVoice(MEGA.b);LASTCRY=-1;return _(MEGA.t[0],MEGA.t[1])}
/* Cri du Colosse en phase I : toujours à côté de sa tête, jamais sur le point d'impact. */
function cry1(heavy){float(hurtCry(heavy,G.bhp),HEAD[0]-70,HEAD[1]-50,heavy?'#ffc15a':'#ffb347')}
function float(txt,x,y,col){txt=ono(txt);if(!txt)return;G.floats.push({txt,x,y,col,sz:ONOSZ[txt]||38,life:.9,max:.9})}

