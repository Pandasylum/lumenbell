/* ---------- audio : tout passe par LB.audio (shared/js/12-audio.js), un seul contexte pour la série ---------- */
const ensureAudio=LB.audio.ensure,tone=LB.audio.tone,noise=LB.audio.noise;
/* sounds of the Lighthouse's guard (phase III), synthesised, to tune by ear. snap = the dry crack of a tap; hum = the continuous drone of the held dome,
   a loop of oscillators (no sample): it fades in over `in` s and out over `out` s, and is stopped as soon as the dome is gone (humStep, every frame). */
const GUARD_SND={snap:{vol:.2},hum:{f:[82,123.5,165.5],vol:.055,lp:520,in:.15,out:.1}};
const sfx={
  block(p){tone(p?1046:880,.5,'sine',.22);tone(p?1568:1318,.35,'sine',.1);tone(2217,.2,'triangle',.05);if(p)tone(2093,.6,'sine',.07)},
  dodge(p){noise(.22,.25,'bandpass',600,2,null,null,2600);if(p)tone(1760,.25,'sine',.06)},
  hurt(){noise(.3,.4,'lowpass',700);tone(160,.35,'sawtooth',.12,null,null,60)},
  whiff(){tone(200,.08,'square',.05)},
  fool(){tone(2600,.25,'triangle',.08);tone(3150,.2,'triangle',.06);noise(.2,.12,'highpass',4000)},
  bossHit(){tone(80,.5,'sine',.4,null,null,40);noise(.25,.3,'lowpass',1200)},
  thud(p){tone(55,.2+.12*p,'sine',.3+.1*p,null,null,35);noise(.09+.05*p,.14+.07*p,'lowpass',2400,1,null,null,240)},
  squelch(p){tone(150,.3+.1*p,'sine',.24,null,null,48);noise(.22,.22,'lowpass',520,1,null,null,160)},
  toll(){[196,392,466,587,784].forEach((f,i)=>tone(f*(1+i*.002),1.6-i*.2,'sine',[.18,.1,.06,.05,.03][i]))},
  charge(){tone(220,.8,'sawtooth',.04,null,null,880)},
  bolt(){noise(.35,.35,'highpass',1800);tone(60,.4,'sine',.25,null,null,30)},
  snap(p){const Z=GUARD_SND.snap;noise(.05,Z.vol,'highpass',3200,1);tone(1900,.04,'square',Z.vol*.5,null,null,700);tone(300,.07,'triangle',Z.vol*.6,null,null,110);if(p)tone(3100,.05,'sine',Z.vol*.35)},
  shield(){tone(660,.15,'sine',.05);tone(990,.15,'sine',.03)},
  counter(){tone(330,.4,'triangle',.12,null,null,990);noise(.3,.12,'bandpass',2000,3)},
  ko(){tone(110,2,'sine',.3,null,null,40);noise(1.4,.25,'lowpass',900,1,null,null,100)},
  win(){[523,659,784,1046].forEach((f,i)=>tone(f,1.2,'sine',.12,null,LB.audio.ctx?LB.audio.now()+i*.12:0))}
};
function play(k,a){if(LB.audio.ctx&&LB.audio.sound)sfx[k](a)}
/* the hum of the held dome: one voice at most; stopped (faded out, oscillators stopped) as soon as `on` is false, the sound is off or the context was replaced */
let hum=null;
function humSet(on){
  const A=LB.audio,c=A.ctx,Z=GUARD_SND.hum;
  if(hum&&(hum.c!==c||!on||!A.sound)){const h=hum;hum=null;
    try{const t=h.c.currentTime;h.g.gain.cancelScheduledValues(t);h.g.gain.setValueAtTime(h.g.gain.value,t);h.g.gain.linearRampToValueAtTime(0,t+Z.out);h.os.forEach(o=>o.stop(t+Z.out+.02))}catch(e){}}
  if(!on||hum||!c||!A.sound||!A.sfx||c.state!=='running')return;
  try{const t=c.currentTime,g=c.createGain(),lp=c.createBiquadFilter(),os=Z.f.map((f,i)=>{const o=c.createOscillator();o.type=i?'sine':'sawtooth';o.frequency.value=f*(1+i*.002);o.detune.value=i*3;o.connect(lp);o.start(t);return o});
    lp.type='lowpass';lp.frequency.value=Z.lp;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(Z.vol,t+Z.in);lp.connect(g);g.connect(A.sfx);hum={c,g,os}}catch(e){hum=null}}
function humStep(){humSet($('menu').hidden&&S.mode==='play'&&!S.paused&&domeAlpha()>0)}
/* music */
const MUS=[null,{bpm:84,bass:[73.4,73.4,87.3,65.4],lead:'bell'},{bpm:96,bass:[82.4,87.3,82.4,61.7],lead:'choir'},{bpm:118,bass:[55,55,65.4,49],lead:'arp'}];
let mStep=0,mNext=0;
function musTick(){
  if(!LB.audio.ctx||!LB.audio.music||S.mode!=='play'||S.paused)return;
  const m=MUS[S.phase],bt=60/m.bpm;
  if(mNext<LB.audio.now())mNext=LB.audio.now()+.05;
  while(mNext<LB.audio.now()+.25){
    const t=mNext,beat=mStep%16,bar=Math.floor(mStep/16)%4,root=m.bass[bar];
    if(beat%4===0){tone(90,.25,'sine',.35,LB.audio.mus,t,38)}
    if(beat%8===6&&S.phase>1)noise(.12,.08,'highpass',5000,1,LB.audio.mus,t);
    if(beat===0||beat===8)tone(root,bt*3.6,'sawtooth',.07,LB.audio.mus,t);
    if(m.lead==='bell'&&(beat===0||beat===10))tone(root*4,1.4,'sine',.04,LB.audio.mus,t);
    if(m.lead==='choir'&&beat===0){[1,1.19,1.5].forEach(r=>tone(root*4*r,bt*3.8,'triangle',.025,LB.audio.mus,t))}
    if(m.lead==='arp'&&beat%2===0){const r=[1,1.5,2,2.4,3,2.4,2,1.5][(beat/2)%8];tone(root*4*r,bt*.45,'sine',.03,LB.audio.mus,t)}
    mNext+=bt/4;mStep++;
  }
}


