/* ---------- audio ---------- */
let AC=null,M,SG,MG;
function ensureAudio(){if(AC){if(AC.state==='suspended')AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();M=AC.createGain();M.gain.value=.75;M.connect(AC.destination);SG=AC.createGain();SG.connect(M);MG=AC.createGain();MG.gain.value=.3;MG.connect(M);applyVol()}catch(e){AC=null}}
function applyVol(){if(!AC)return;SG.gain.value=$('optSnd').checked?.9:0;MG.gain.value=$('optMus').checked?.3:0}
function tone(f,dur,type,vol,dest,when,f2){if(!AC)return;const t=when||AC.currentTime;const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);g.connect(dest||SG);o.start(t);o.stop(t+dur+.05)}
let NB=null;function nbuf(){if(!NB){NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return NB}
function noise(dur,vol,ft,ff,q,dest,when,ff2){if(!AC)return;const t=when||AC.currentTime;const s=AC.createBufferSource();s.buffer=nbuf();s.loop=true;const fl=AC.createBiquadFilter();fl.type=ft;fl.frequency.setValueAtTime(ff,t);if(ff2)fl.frequency.exponentialRampToValueAtTime(ff2,t+dur);fl.Q.value=q||1;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(fl);fl.connect(g);g.connect(dest||SG);s.start(t);s.stop(t+dur+.05)}
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
  shield(){tone(660,.15,'sine',.05);tone(990,.15,'sine',.03)},
  counter(){tone(330,.4,'triangle',.12,null,null,990);noise(.3,.12,'bandpass',2000,3)},
  ko(){tone(110,2,'sine',.3,null,null,40);noise(1.4,.25,'lowpass',900,1,null,null,100)},
  win(){[523,659,784,1046].forEach((f,i)=>tone(f,1.2,'sine',.12,null,AC?AC.currentTime+i*.12:0))}
};
function play(k,a){if(AC&&$('optSnd').checked)sfx[k](a)}
/* music */
const MUS=[null,{bpm:84,bass:[73.4,73.4,87.3,65.4],lead:'bell'},{bpm:96,bass:[82.4,87.3,82.4,61.7],lead:'choir'},{bpm:118,bass:[55,55,65.4,49],lead:'arp'}];
let mStep=0,mNext=0;
function musTick(){
  if(!AC||!$('optMus').checked||S.mode!=='play'||S.paused)return;
  const m=MUS[S.phase],bt=60/m.bpm;
  if(mNext<AC.currentTime)mNext=AC.currentTime+.05;
  while(mNext<AC.currentTime+.25){
    const t=mNext,beat=mStep%16,bar=Math.floor(mStep/16)%4,root=m.bass[bar];
    if(beat%4===0){tone(90,.25,'sine',.35,MG,t,38)}
    if(beat%8===6&&S.phase>1)noise(.12,.08,'highpass',5000,1,MG,t);
    if(beat===0||beat===8)tone(root,bt*3.6,'sawtooth',.07,MG,t);
    if(m.lead==='bell'&&(beat===0||beat===10))tone(root*4,1.4,'sine',.04,MG,t);
    if(m.lead==='choir'&&beat===0){[1,1.19,1.5].forEach(r=>tone(root*4*r,bt*3.8,'triangle',.025,MG,t))}
    if(m.lead==='arp'&&beat%2===0){const r=[1,1.5,2,2.4,3,2.4,2,1.5][(beat/2)%8];tone(root*4*r,bt*.45,'sine',.03,MG,t)}
    mNext+=bt/4;mStep++;
  }
}


