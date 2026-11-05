/* ---------- musique (générée en direct, aucun fichier audio) ---------- */
const mtof=m=>440*Math.pow(2,(m-69)/12);
const MCH=[{r:38,t:[50,53,57]},{r:34,t:[58,62,65]},{r:41,t:[53,57,60]},{r:36,t:[55,60,64]}]; /* ré mineur : Dm · Sib · Fa · Do */
const MLEAD=[[74,0,69,72,74,77,76,74],[74,0,70,74,77,76,74,70],[72,0,69,72,77,76,72,69],[67,0,72,76,79,0,76,72]];
/* Phase III : autre progression (Dm · Sib · Gm · La) et autre thème, plus tragique, avec un cor en contre-chant. */
const MCH3=[{r:38,t:[50,53,57]},{r:34,t:[58,62,65]},{r:31,t:[55,58,62]},{r:33,t:[57,61,64]}];
const MLEAD3=[[69,0,74,77,76,74,72,74],[70,74,77,74,79,77,74,70],[70,0,74,79,77,74,70,67],[69,73,76,0,79,76,73,69]];
const MHORN3=[[62,65],[65,62],[62,67],[64,61]];
function mVoice(c,dst,t,f,d,type,v,o){
  o=o||{};
  const os=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter(),a=o.a||.01;
  os.type=type;os.frequency.setValueAtTime(f,t);
  if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(20,f+o.slide),t+d);
  if(o.det)os.detune.value=o.det;
  fl.type='lowpass';fl.frequency.value=o.lp||2000;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);
  g.gain.setValueAtTime(v,t+Math.max(a,d*(o.sus||0)));g.gain.exponentialRampToValueAtTime(.0001,t+d);
  os.connect(fl);fl.connect(g);g.connect(dst);os.start(t);os.stop(t+d+.05);
}
/* Chœur synthétique : dents de scie désaccordées passées dans des filtres de voyelle (« aah » / « ooh »), avec vibrato. */
function mChoir(c,dst,t,f,d,v,vowel){
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.7,d*.4));g.gain.setValueAtTime(v,t+d*.72);g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(dst);
  const fm=vowel==='o'?[[330,1],[820,.45]]:[[720,1],[1150,.6],[2600,.14]];
  (vowel==='a'?[-8,8]:[-10,0,10]).forEach(dt=>{
    const os=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain();
    os.type='sawtooth';os.frequency.value=f;os.detune.value=dt;
    lfo.frequency.value=5+Math.random();lg.gain.value=f*.008;lfo.connect(lg);lg.connect(os.frequency);
    fm.forEach(([ff,q])=>{const bp=c.createBiquadFilter(),og=c.createGain();bp.type='bandpass';bp.frequency.value=ff;bp.Q.value=5;og.gain.value=q;os.connect(bp);bp.connect(og);og.connect(g)});
    os.start(t);os.stop(t+d+.05);lfo.start(t);lfo.stop(t+d+.05);
  });
}
function mNoise(c,dst,t,d,v,f0,f1){
  if(!c.__nb){const b=c.createBuffer(1,c.sampleRate,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;c.__nb=b}
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  src.buffer=c.__nb;src.loop=true;f.type='bandpass';f.Q.value=.8;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(f);f.connect(g);g.connect(dst);src.start(t);src.stop(t+d+.05);
}
function mDrum(c,dst,t,big){
  mVoice(c,dst,t,big?78:100,big?.55:.3,'sine',big?.36:.2,{slide:-48,lp:400});
  mNoise(c,dst,t,big?.3:.18,big?.2:.1,big?700:900,big?90:140);
}
function musStep(c,dst,t,s,lvl,bpm){
  const bar=Math.floor(s/8)%8,pos=s%8,ci=Math.floor(bar/2),ch=(lvl>=3?MCH3:MCH)[ci],e=60/bpm/2,bl=e*8;
  /* percussions de guerre */
  if(pos===0)mDrum(c,dst,t,true);
  if(pos===4)mDrum(c,dst,t,false);
  if(lvl>=2&&(pos===2||pos===6))mVoice(c,dst,t,150,.18,'sine',.1,{slide:-60,lp:500});
  if(lvl>=3&&(pos===5||pos===7))mVoice(c,dst,t,130,.15,'sine',.09,{slide:-50,lp:500});
  if(lvl>=4){ /* seconde partie de la phase III : le Colosse a tout récupéré, la musique s'emballe */
    if(pos===1||pos===3)mVoice(c,dst,t,140,.15,'sine',.1,{slide:-55,lp:500});
    if(pos===4)mNoise(c,dst,t,.14,.13,1600,600);
    if(pos===0||pos===4)mDrum(c,dst,t+e*.5,false);
  }
  if(lvl>=5){ /* approche de la fin : le Colosse enragé après avoir tout récupéré, tout devient héroïque */
    if(pos===0){mDrum(c,dst,t,true);if(bar%4===0)mNoise(c,dst,t,1.3,.12,3000,400)}
    if(pos===2||pos===6)mDrum(c,dst,t,false);
    if(pos===0)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n),bl*.98,'sawtooth',.018,{a:.3,lp:1100,sus:.8})); /* chœur de cuivres */
    if(pos%2===0)mVoice(c,dst,t,mtof(ch.r+12),e*1.5,'sawtooth',.035,{lp:420});
    const m5=MLEAD3[ci][(bar%2)*4+pos/2];
    if(pos%2===0&&m5){mVoice(c,dst,t,mtof(m5-12),e*3.4,'sawtooth',.022,{a:.03,lp:1800,sus:.3});mVoice(c,dst,t,mtof(m5-5),e*3.4,'sawtooth',.016,{a:.03,lp:1800,sus:.3})}
    if(pos===4)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+12),.6,'sawtooth',.024,{lp:1700,a:.012}));
    /* chœur : accord tenu (hommes « ooh », voix « aah ») + chant sur la mélodie */
    if(pos===0){ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n+(i?12:0)),bl*.98,.1,'o'));mChoir(c,dst,t,mtof(ch.r+12),bl*.98,.12,'o')}
    if(pos%4===0&&m5)mChoir(c,dst,t,mtof(m5),e*3.8,.09,'o');
  }
  if(lvl>=6){ /* dernière rage : encore plus épique, tambours serrés, lead doublé à l'octave, quinte aux cuivres */
    if(pos%2===1)mDrum(c,dst,t,false);
    if(pos===0&&bar%2===0)mNoise(c,dst,t,.9,.14,3500,500);
    if(pos===0)ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+7),bl*.98,'sawtooth',.016,{a:.25,lp:1300,sus:.8}));
    const m6=MLEAD3[ci][(bar%2)*4+pos/2];
    if(pos%2===0&&m6)mVoice(c,dst,t,mtof(m6+12),e*3,'square',.014,{a:.02,lp:2800,sus:.3});
    if(pos===0)ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n+12+(i?7:0)),bl*.98,.07,'o'));
    if(pos%2===0&&m6)mChoir(c,dst,t,mtof(m6),e*3.8,.1,'a'); /* voix « aah » sur la mélodie */
    if(pos===0)mChoir(c,dst,t,mtof(ch.t[2]+12),bl*.98,.06,'a'); /* note tenue au-dessus de l'accord */
    {const gal=[0,1,2,1][pos%4];mVoice(c,dst,t,mtof(ch.t[gal]),e*.7,'sawtooth',.02,{lp:1600,a:.004});if(pos%2===0)mVoice(c,dst,t,mtof(ch.t[gal]+12),e*.7,'sawtooth',.012,{lp:2200,a:.004})} /* cordes galopantes */
  }
  /* basse */
  if(pos===0)mVoice(c,dst,t,mtof(ch.r),bl*.98,'sawtooth',.075,{a:.05,lp:230,sus:.8});
  if(lvl>=2&&(pos%2===0||lvl>=4)&&pos!==0)mVoice(c,dst,t,mtof(ch.r),e*1.6,'sawtooth',.045,{lp:260});
  /* nappe de cordes */
  if(pos===0&&bar%2===0)ch.t.forEach(n=>[-8,8].forEach(dt=>mVoice(c,dst,t,mtof(n),bl*2,'sawtooth',.011,{a:.9,lp:850,det:dt,sus:.9})));
  /* arpège */
  const ar=lvl>=2?[0,1,2,1,2,1,0,1][pos]:[0,1,2,1][pos>>1];
  if(lvl>=2||pos%2===0)mVoice(c,dst,t,mtof(ch.t[ar]+12),e*1.4,'square',.022,{lp:1700,a:.005});
  /* mélodie */
  if(pos%2===0){
    const m=(lvl>=3?MLEAD3:MLEAD)[ci][(bar%2)*4+pos/2];
    if(m)mVoice(c,dst,t,mtof(m),e*3.4,lvl>=2?'sawtooth':'triangle',lvl>=2?.026:.05,{a:.03,lp:2300,sus:.3});
  }
  /* cor en contre-chant (phase III) */
  if(lvl>=3&&pos===0)mVoice(c,dst,t,mtof(MHORN3[ci][bar%2]),bl*.96,'sawtooth',.03,{a:.12,lp:850,sus:.7});
  /* coups de cuivres */
  if(lvl>=3&&pos===0&&(bar%4===0||lvl>=4))ch.t.forEach(n=>mVoice(c,dst,t,mtof(n+12),.8,'sawtooth',.026,{lp:1800,a:.012}));
}
/* Ambiance sombre du menu : bourdon grave, nappe mineure, cloches lointaines, battement sourd. */
const MAMB=[{r:26,t:[50,53,57],b:[74,77,81]},{r:22,t:[46,50,53],b:[70,74,77]},{r:31,t:[43,46,50],b:[67,70,74]},{r:33,t:[45,49,52],b:[73,76,81]}];
function menuStep(c,dst,t,s){
  const ch=MAMB[s%4],L=4;
  mVoice(c,dst,t,mtof(ch.r),L*2.2,'sawtooth',.05,{a:1.6,lp:140,sus:.7});
  mVoice(c,dst,t,mtof(ch.r),L*2.2,'sine',.09,{a:1.2,lp:200,sus:.7});
  ch.t.forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,t,mtof(n),L*2.4,'sawtooth',.008,{a:2,lp:650,det:dt,sus:.7})));
  mNoise(c,dst,t,L*1.8,.03,260,520);
  mVoice(c,dst,t+.2,52,1.1,'sine',.12,{slide:-18,lp:200}); /* battement sourd */
  mVoice(c,dst,t+1.15,52,.9,'sine',.07,{slide:-18,lp:200});
  const k=2+Math.floor(Math.random()*2);
  for(let i=0;i<k;i++){const m=ch.b[Math.floor(Math.random()*3)],tt=t+.8+Math.random()*(L-1.2);
    mVoice(c,dst,tt,mtof(m-24),4,'sine',.05,{a:.6,lp:700,sus:.3});mVoice(c,dst,tt,mtof(m-36),4.5,'sine',.06,{a:.8,lp:400,sus:.3})}
}
/* Finale (phase III) : les ailes brisées, le coup ultime, le Colosse terrassé puis pétrifié par la cloche. Partition calée sur FIN (secondes). */
function finaleScore(c,dst,t0,now){
  const ev=(t,fn)=>{if(t0+t>=now-.02)fn(t0+t)};
  const big=(t)=>ev(t,x=>mDrum(c,dst,x,true)),sm=(t)=>ev(t,x=>mDrum(c,dst,x,false));
  /* montée : bourdon, cordes qui enflent, roulement de timbales */
  ev(0,x=>{mVoice(c,dst,x,mtof(26),5,'sawtooth',.06,{a:1.2,lp:200,sus:.8});[50,57,62].forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,x,mtof(n),1.9,'sawtooth',.014,{a:1.6,lp:900,det:dt,sus:.9})))});
  [0,.5,.9,1.15,1.3].forEach(sm);
  /* la masse levée, la cloche répond (1,35 s) puis l'arme est arrachée (1,55 s) */
  ev(1.35,x=>[62,69,74].forEach(n=>[-7,7].forEach(dt=>mVoice(c,dst,x,mtof(n),1.2,'triangle',.02,{a:.05,lp:1800,det:dt,sus:.6}))));
  big(1.55);ev(1.55,x=>{mNoise(c,dst,x,.5,.18,3000,300);mVoice(c,dst,x,mtof(38),.9,'sine',.12,{slide:-14,lp:260,a:.02})});
  [1.9,2.05].forEach(sm);
  /* les deux ailes brisées (un tir de lanterne chacune) */
  [2.3,3.0].forEach(t=>{big(t);ev(t,x=>[50,53,57].forEach(n=>mVoice(c,dst,x,mtof(n+12),.9,'sawtooth',.04,{lp:1500,a:.01})))});
  ev(1.75,x=>[50,57,62].forEach(n=>[-9,9].forEach(dt=>mVoice(c,dst,x,mtof(n),2.0,'sawtooth',.014,{a:1.4,lp:900,det:dt,sus:.9}))));
  [2.65,2.8].forEach(sm);
  /* la charge */
  ev(3.5,x=>mVoice(c,dst,x,150,.95,'sawtooth',.05,{slide:480,lp:2600,a:.3,sus:.8}));
  [3.5,3.7,3.9,4.05,4.2,4.3].forEach(sm);
  /* le coup fatal */
  big(4.6);big(4.6);
  ev(4.6,x=>{mNoise(c,dst,x,1.3,.25,3000,200);[38,45,50,54,57].forEach(n=>mVoice(c,dst,x,mtof(n+12),2.6,'sawtooth',.036,{lp:2000,a:.02}));mVoice(c,dst,x,mtof(26),3,'sine',.16,{lp:200,a:.02})});
  [5.1,5.7,6.3].forEach(sm);
  ev(4.8,x=>[50,53,57].forEach(n=>[-8,8].forEach(dt=>mVoice(c,dst,x,mtof(n),2.4,'sawtooth',.012,{a:.9,lp:900,det:dt,sus:.9}))));
  /* l'effondrement, puis l'élégie */
  big(6.9);ev(6.9,x=>mVoice(c,dst,x,mtof(38),1.6,'sine',.15,{slide:-22,lp:200,a:.02}));
  ev(6.9,x=>[58,62,65].forEach(n=>[-7,7].forEach(dt=>mVoice(c,dst,x,mtof(n),3.3,'sawtooth',.01,{a:.9,lp:800,det:dt,sus:.9}))));
  [[7.2,74,1.3],[8.2,72,1.2],[9.0,69,1.3],[9.9,62,3]].forEach(([t,m,d])=>ev(t,x=>mVoice(c,dst,x,mtof(m),d,'triangle',.045,{a:.12,lp:1300,sus:.4})));
  [7.5,8.6,9.8].forEach(t=>ev(t,x=>mVoice(c,dst,x,52,1,'sine',.1,{slide:-18,lp:200})));
  ev(10,x=>{[50,53,57].forEach(n=>[-6,6].forEach(dt=>mVoice(c,dst,x,mtof(n),3.6,'sawtooth',.01,{a:.8,lp:700,det:dt,sus:.8})));mVoice(c,dst,x,mtof(26),3.6,'sine',.1,{a:.6,lp:200,sus:.7})});
}
/* Fin du chapitre (outro puis carte de fin) : paix et espoir. Ré majeur, boucle de 8 mesures (Ré · La · Si mineur · Sol · Ré · La · Sol · La),
   un thème qui monte doucement au piano, une harpe qui berce, une nappe de cordes et un chœur très doux, avec un écho. */
const MSP=[
  {r:38,t:[54,57,62],m:[66,69,74,0]},{r:33,t:[52,57,61],m:[73,0,69,71]},
  {r:35,t:[54,59,62],m:[71,74,73,71]},{r:31,t:[55,59,62],m:[67,71,74,0]},
  {r:38,t:[54,57,62],m:[69,74,76,74]},{r:33,t:[52,57,61],m:[73,0,76,73]},
  {r:31,t:[55,59,62],m:[74,71,67,71]},{r:33,t:[52,57,61],m:[69,0,73,0]}];
function spaceStep(c,dst,t,s){
  const ch=MSP[s%8],L=4;
  /* basse et nappe de cordes */
  mVoice(c,dst,t,mtof(ch.r),L*1.5,'sine',.09,{a:1,lp:300,sus:.7});
  mVoice(c,dst,t,mtof(ch.r+7),L*1.5,'sine',.035,{a:1.2,lp:300,sus:.7});
  ch.t.forEach(n=>[-5,5].forEach(dt=>mVoice(c,dst,t,mtof(n),L*1.6,'triangle',.013,{a:1.4,lp:700,det:dt,sus:.7})));
  /* chœur très doux, une mesure sur deux */
  if(s%2===0)ch.t.forEach((n,i)=>mChoir(c,dst,t,mtof(n-(i?0:0)),L*1.9,.05,'o'));
  /* houle douce : trois notes longues qui se relaient, sans attaque (pas de carillon) */
  [0,1,2].forEach((k,i)=>mVoice(c,dst,t+i*1.1,mtof(ch.t[k]-12),2.6,'triangle',.03,{a:.9,lp:500,sus:.5}));
  /* thème de violoncelle : il monte doucement, comme un espoir */
  ch.m.forEach((m,i)=>{if(!m)return;const tt=t+i;
    mVoice(c,dst,tt,mtof(m-12),1.9,'sawtooth',.03,{a:.18,lp:650,sus:.5});
    mVoice(c,dst,tt,mtof(m-12),1.9,'sine',.05,{a:.15,lp:700,sus:.5})});
}
const MUS={cur:null,t:0,s:0,ctx:null,bus:{}};
function musKind(){
  const AC=LB.audio.ctx;
  if(!LB.audio.sound||!LB.audio.music||!AC||AC.state!=='running')return null;
  if(!menuEl.hidden)return 'menu';
  if(paused)return null;
  if(R&&R.mode==='finale')return 'finale';
  if(R&&R.mode==='space')return 'space';
  const S=R||Q||G;
  return S&&(S.mode==='play'||S.mode==='intro')&&el.ov.hidden?'game':null;
}
function musTick(){
  const ac0=LB.audio.ctx;if(!ac0)return; /* pas de contexte audio */
  const off=document.hidden||!LB.audio.sound;
  if(off&&MUS.ctx===ac0&&MUS.cur===null)return; /* sortie rapide : déjà en silence (onglet masqué ou son coupé) ; la bascule vers le silence se fait une fois par le chemin normal, la reprise repart de zéro comme avant */
  try{
    const k=off?null:musKind(),AC=ac0;
    if(MUS.ctx!==AC){
      MUS.ctx=AC;MUS.cur=null;
      const cp=AC.createDynamicsCompressor();cp.connect(LB.audio.mus);
      MUS.bus={};['game','menu','finale','space'].forEach(n=>{const g=AC.createGain();g.gain.value=0;g.connect(cp);MUS.bus[n]=g});
      {const sg=MUS.bus.space,d=AC.createDelay(1),fb=AC.createGain(),lp=AC.createBiquadFilter(); /* écho doux pour l'espace */
       d.delayTime.value=.6;fb.gain.value=.22;lp.type='lowpass';lp.frequency.value=800;sg.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(cp)}
    }
    if(k!==MUS.cur){
      const now=AC.currentTime;
      for(const n in MUS.bus){const g=MUS.bus[n].gain;g.cancelScheduledValues(now);g.setTargetAtTime(n===k?({menu:.4,game:.7,finale:.65,space:.45}[n]):0,now,n===k?.35:.12)}
      MUS.cur=k;MUS.t=now+.08;MUS.s=0;MUS.gt=null;
      if(k==='finale')finaleScore(AC,MUS.bus.finale,now+.05-(R.fin?R.fin.t:0),now);
    }
    if(!k)return;
    const now=AC.currentTime;
    if(k==='finale')return;
    if(k==='menu'){while(MUS.t<now+.6){menuStep(AC,MUS.bus.menu,MUS.t,MUS.s);MUS.t+=4;MUS.s++}}
    else if(k==='space'){while(MUS.t<now+.6){spaceStep(AC,MUS.bus.space,MUS.t,MUS.s);MUS.t+=4;MUS.s++}}
    else{const lvl=R?(R.healed?(R.u55?6:R.u5?5:4):3):Q?2:1,bpm=[0,100,112,124,142,150,160][lvl];
      {const gt=lvl>=6?.5:lvl>=5?.56:.7;if(MUS.gt!==gt){MUS.gt=gt;MUS.bus.game.gain.setTargetAtTime(gt,now,.3)}}
      if(R&&R.healed&&MUS.hR!==R){MUS.hR=R; /* le cri d'agonie : montée et gros coups */
        mVoice(AC,MUS.bus.game,now+.02,120,1.3,'sawtooth',.05,{slide:620,lp:2200,a:.4,sus:.8});mDrum(AC,MUS.bus.game,now+1.2,true);mDrum(AC,MUS.bus.game,now+1.2,true);mNoise(AC,MUS.bus.game,now+1.2,1,.18,2500,200)}
      if(R&&R.healed&&R.u5&&MUS.uR!==R){MUS.uR=R;
        mVoice(AC,MUS.bus.game,now+.02,100,1.4,'sawtooth',.05,{slide:700,lp:2200,a:.4,sus:.8});mDrum(AC,MUS.bus.game,now+1.3,true);mDrum(AC,MUS.bus.game,now+1.3,true);mNoise(AC,MUS.bus.game,now+1.3,1.2,.2,2500,200)}
      if(R&&R.healed&&R.u55&&MUS.vR!==R){MUS.vR=R; /* dernière rage : montée finale, tambours et choc */
        mVoice(AC,MUS.bus.game,now+.02,110,1.6,'sawtooth',.055,{slide:900,lp:2600,a:.5,sus:.8});for(let i=0;i<4;i++)mDrum(AC,MUS.bus.game,now+.9+i*.14,i>1);mDrum(AC,MUS.bus.game,now+1.5,true);mNoise(AC,MUS.bus.game,now+1.5,1.5,.22,3000,200)}
      while(MUS.t<now+.3){musStep(AC,MUS.bus.game,MUS.t,MUS.s%64,lvl,bpm);MUS.t+=60/bpm/2;MUS.s++}}
  }catch(e){}
}
setInterval(musTick,90);

