/* ---------- music & ambience (procedural, Web Audio) ---------- */
const MUSIC=(()=>{
  let ac=null,out,rev,cur=null,layers=[],bedLayers=[],bedId=null,bedTimer=null,timer=null,next=0,step=0,ARR=null;
  /* le contexte est celui de la série (LB.audio) ; la chaîne de la musique (out, compresseur, réverbération) est refaite s'il a été recréé */
  function init(){const c=LB.audio.ensure();if(!c)return false;if(ac===c)return true;ac=c;
    out=ac.createGain();out.gain.value=.5;const comp=ac.createDynamicsCompressor();comp.threshold.value=-20;comp.knee.value=6;comp.ratio.value=12;comp.attack.value=.003;comp.release.value=.25;const lim=ac.createGain();lim.gain.value=.9;out.connect(comp);comp.connect(lim);lim.connect(LB.audio.dest);
    rev=ac.createConvolver();const n=ac.sampleRate*3.8,b=ac.createBuffer(2,n,ac.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}rev.buffer=b;
    const rg=ac.createGain();rg.gain.value=.55;rev.connect(rg);rg.connect(out);return true}
  const nbuf=()=>LB.audio.noiseBuf(2); /* 2 s de bruit blanc, en cache dans LB.audio */
  function env(g,t,a,p,d){a=Math.max(a,.01);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(p,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
  /* far(): sounds played inside it go through a low-pass filter and a quieter bus (distance: the Illusion's / the echo's voice) */
  let dst=null,farV=1;
  function send(g,wet){if(wet){const w=ac.createGain();w.gain.value=wet*farV;g.connect(w);w.connect(rev)}}
  function far(t,o,fn){const lp=ac.createBiquadFilter(),g=ac.createGain();lp.type='lowpass';lp.frequency.value=o.lp;lp.Q.value=.7;g.gain.value=o.vol;lp.connect(g);g.connect(out);
    dst=lp;farV=o.vol;try{fn(t+o.delay)}finally{dst=null;farV=1}}
  /* dry(): sounds played inside it bypass the music bus (so they survive a hush) */
  function dry(fn){const g=ac.createGain();g.connect(LB.audio.dest);dst=g;try{fn()}finally{dst=null}}
  function duck(t,tc){out.gain.cancelScheduledValues(t);out.gain.setTargetAtTime(.0001,t,tc)}
  function osc(type,f,t,a,p,d,wet,f2,det){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+a+d);if(det)o.detune.value=det;env(g,t,a,p,d);o.connect(g);g.connect(dst||out);send(g,wet);o.start(t);o.stop(t+a+d+.1)}
  function nz(t,d,p,type,f,q,wet,f2,a){const s=ac.createBufferSource();s.buffer=nbuf();s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+(a||.005)+d);fl.Q.value=q||1;const g=ac.createGain();env(g,t,a||.005,p,d);s.connect(fl);fl.connect(g);g.connect(dst||out);send(g,wet);s.start(t);s.stop(t+(a||.005)+d+.1)}
  function lfo(rate,depth,target){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=rate;lg.gain.value=depth;l.connect(lg);lg.connect(target);l.start();return l}
  function layerNoise(type,f,q,vol,rate,depth,wet){const s=ac.createBufferSource();s.buffer=nbuf();s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ac.createGain();g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(vol,ac.currentTime+2.5);s.connect(fl);fl.connect(g);g.connect(out);send(g,wet);const l=rate?lfo(rate,depth,fl.frequency):null;s.start();(ARR||layers).push({g,stop:()=>{try{s.stop();l&&l.stop()}catch(e){}}})}
  function layerOsc(type,f,vol,lp,det,rate,depth,wet){const o=ac.createOscillator();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;const g=ac.createGain();g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(vol,ac.currentTime+3);const g2=ac.createGain();g2.gain.value=1;o.connect(fl);fl.connect(g);g.connect(g2);g2.connect(out);send(g2,wet);const l=rate?lfo(rate,depth,g2.gain):null;o.start();(ARR||layers).push({g,stop:()=>{try{o.stop();l&&l.stop()}catch(e){}}})}
  const R=a=>a[Math.floor(Math.random()*a.length)];
  const THEMES={
    /* home menu: a slow music box over a cold pad */
    4:{bpm:58,ambP:.04,vol:1.25,bed(){layerNoise('bandpass',500,2,.04,.04,200,.4)},
      start(){layerNoise('bandpass',520,2,.035,.04,220,.4);[146.8,174.6,220].forEach((f,i)=>layerOsc('triangle',f,.013,700,(i-1)*5,.05+i*.02,.5,.7))},
      step(s,t){const mel=[587.3,0,698.5,0,659.3,0,523.3,0,587.3,0,440,0,523.3,0,0,0,587.3,0,698.5,0,784,0,698.5,0,659.3,0,587.3,0,0,0,0,0];const n=mel[s%32];
        if(n){osc('sine',n,t,.004,.045,1.7,.8);osc('sine',n*2.01,t,.004,.01,.8,.8)}
        if(s%32===0)osc('sine',73.4,t,1.5,.06,4.5,.5);if(s%32===16)osc('sine',58.3,t,1.5,.05,4,.5);if(s%128===96)clang(t,146.8,.04,3)},
      amb(t){nz(t,1.8,.025,'lowpass',260,1,.5,110,.6)}},
    /* La Voix Creuse: glass, whispers, a choir that never resolves */
    2:{bpm:54,ambP:.05,bed(){layerNoise('bandpass',650,5,.06,.06,380,.4)},
      start(){layerNoise('bandpass',650,5,.05,.06,380,.4);[164.8,174.6,246.9,261.6].forEach((f,i)=>layerOsc('triangle',f,.022,900,(i-1.5)*9,.07+i*.03,.6,.7))},
      step(s,t){if(s%32===0)osc('sine',41.2,t,2.2,.2,6,.3);
        if(s%16===0||s%16===3)osc('sine',62,t,.005,.14,.35,0,38);
        if(Math.random()<.13){const f=R([1318.5,1396.9,1975.5,2093,2637]);osc('sine',f,t,.004,.05,2.8,.9);osc('sine',f*2.76,t,.004,.014,1.6,.9)}
        if(s%64===44)nz(t,1.4,.06,'bandpass',1900,9,.7,800,.35);
        if(s%128===96){osc('sawtooth',164.8,t,1.5,.03,2.5,.8);osc('sawtooth',174.6,t,1.5,.03,2.5,.8)}},
      amb(t){const r=Math.random();
        if(r<.4){for(let i=0;i<3;i++)osc('sine',2400+Math.random()*2200,t+i*.06,.002,.03,.6,.9)}
        else if(r<.7)nz(t,.9,.04,'bandpass',1200+Math.random()*1500,10,.8,600,.25);
        else osc('triangle',3100,t,.2,.012,1,.8,1900)}},
    /* Le Roi de Rouille: drums like footsteps, a tolling bell, the furnace drone */
    1:{bpm:64,ambP:.08,vol:1.6,bed(){layerNoise('lowpass',90,.7,.1,.03,25);layerOsc('sawtooth',36.7,.035,140)},
      start(){layerOsc('sawtooth',36.7,.075,150,-6,.05,.25);layerOsc('sawtooth',36.9,.055,130,7);layerOsc('triangle',55,.03,200,0,.04,.3);layerNoise('lowpass',85,.7,.1,.03,20)},
      step(s,t){const b=s%16;
        if(b===0||b===6||b===8){osc('sine',90,t,.004,.6,.6,.15,32);nz(t,.24,.16,'lowpass',260);FX.chainStep(t+.03)}
        if(b===12){nz(t,.5,.14,'lowpass',320,1.5,.3);osc('sine',120,t,.004,.16,.45,.3,70)}
        if(s%64===40){osc('triangle',73.4,t,.4,.06,1.8,.5);osc('triangle',103.8,t,.4,.05,1.8,.5)}
        if(s%64===51)FX.bellDull(t);if(s%128===24)FX.anchorDrag(t);
        if(s%128===112){for(let i=0;i<4;i++){osc('sine',90,t+i*.11,.004,.45,.45,.2,32);nz(t+i*.11,.22,.12,'lowpass',260)}}},
      amb(t){const r=Math.random();
        if(r<.45){const n=3+Math.floor(Math.random()*4);for(let i=0;i<n;i++){const tt=t+i*(.06+Math.random()*.05),f=1150+Math.random()*850;osc('sine',f,tt,.003,.011,.2,.65);osc('sine',f*1.5,tt,.003,.0025,.12,.65)}nz(t,.4+n*.05,.007,'bandpass',1500,6,.5)}
        else if(r<.75)nz(t,1.6,.1,'lowpass',110,1,.3,60,.6);
        else osc('sawtooth',62,t,.5,.025,1.4,.5,48)}},
    /* Le Phare Noyé: a cold pulse, an electric arpeggio, the ice groaning */
    3:{bpm:104,ambP:.05,bed(){layerNoise('bandpass',480,2,.07,.045,300,.35)},
      start(){layerNoise('bandpass',480,2,.06,.045,300,.35);layerOsc('sawtooth',55,.016,280);[110,130.8,155.6].forEach((f,i)=>layerOsc('sawtooth',f,.016,620,(i-1)*6,.08+i*.02,.5,.6))},
      step(s,t){if(s%2===0)osc('sine',55,t,.01,.17,.22,0);
        const arp=[440,523.3,659.3,466.2,440,523.3,698.5,466.2];osc('sine',arp[s%8]*(s%32<16?1:1.1225),t,.004,.032,.32,.6);
        if(s%16===8){nz(t,.12,.09,'highpass',3200);for(let i=0;i<3;i++)nz(t+.03*i,.02,.05,'highpass',5000)}
        if(s%64===0)nz(t,4,.045,'bandpass',200,3,.6,2200,3)},
      amb(t){const r=Math.random();
        if(r<.4){nz(t,.08,.16,'highpass',2200);osc('sine',85,t,.003,.12,.45,.7,38)}
        else if(r<.7){for(let i=0;i<5;i++)nz(t+Math.random()*.25,.015,.06,'highpass',4500)}
        else osc('sine',72,t,.6,.07,2,.8,48)}}
  };

  const tinkle=(t,n,spread,vol)=>{for(let i=0;i<n;i++){const f=2000+Math.random()*3000,tt=t+Math.random()*spread;osc('sine',f,tt,.002,vol||.04,.5+Math.random()*.6,.9);osc('sine',f*2.76,tt,.002,(vol||.04)*.3,.3,.9)}};
  const thump=(t,f,p,d)=>{osc('sine',f,t,.004,p,d,.25,f*.38);nz(t,d*.5,p*.35,'lowpass',380)};
  const clang=(t,base,p,d)=>{[[1,1],[2.43,.6],[3.71,.4],[5.2,.25]].forEach(([m,k])=>osc('sine',base*m,t,.003,p*k,d*(1.2-k*.4),.7))};
  const sweep=(t,f1,f2,d,p)=>nz(t,d,p,'bandpass',f1,2.5,.3,f2,d*.35);
  const FX={
    step:t=>{thump(t,72,.7,.7);nz(t+.05,.5,.06,'highpass',2500,1,.5);nz(t,1.2,.12,'lowpass',120,1,.3)},
    slam:t=>{thump(t,60,.9,1);clang(t,190,.12,1.8);nz(t,.35,.35,'lowpass',1500);nz(t,2.2,.22,'lowpass',110,1,.4);nz(t+.15,1.2,.06,'highpass',3000,1,.6)},
    whoosh:t=>sweep(t,300,2200,.45,.18),
    whooshDown:t=>sweep(t,2200,250,.9,.16),
    draw:t=>{for(let i=0;i<7;i++)osc('triangle',2000+Math.random()*1200,t+i*.07,.002,.04,.12,.4);nz(t,.5,.06,'bandpass',1400,4,.3)},
    heart:t=>{thump(t,52,.35,.35);thump(t+.26,48,.28,.35);osc('sine',1250,t,.3,.02,1.2,.8,1500)},
    glints:t=>tinkle(t,12,1.4,.03),
    swell:t=>{nz(t,.3,.08,'bandpass',400,3,.6,3200,1);osc('sine',300,t,1,.04,.3,.6,900)},
    crackGlass:t=>{for(let i=0;i<6;i++)nz(t+i*.07,.03,.12,'highpass',3500);tinkle(t,4,.4,.03)},
    shatter:t=>{nz(t,.9,.35,'highpass',2600,1,.6);tinkle(t,16,1,.05);thump(t,90,.3,.4)},
    sting:t=>{[73.4,77.8,110].forEach((f,i)=>osc('sawtooth',f,t,.05,.045,2.6,.7,null,i*4));thump(t,55,.5,1.2)},
    charge:t=>{osc('sawtooth',150,t,1.1,.035,.2,.4,900);for(let i=0;i<5;i++)osc('sine',600+i*240,t+i*.2,.15,.025,.6,.7,900+i*300);nz(t,1.1,.04,'bandpass',800,5,.5,4000,1)},
    throw:t=>{sweep(t,500,3000,.35,.2);osc('sine',900,t,.004,.06,.4,.5,1800)},
    impactLight:t=>{osc('sine',1500,t,.003,.12,.6,.8);nz(t,.2,.2,'highpass',2000);thump(t,110,.25,.3)},
    overload:t=>{nz(t,1.35,.12,'bandpass',300,4,.5,5000,1.3);osc('sine',200,t,1.3,.06,.1,.5,1400);osc('sawtooth',201,t,1.3,.025,.1,.5,1410);for(let i=0;i<14;i++)nz(t+.3+i*.07,.02,.07,'highpass',5000)},
    explosion:t=>{thump(t,48,1,1.6);nz(t,2,.5,'lowpass',1600,1,.5,200);nz(t,1,.3,'highpass',2500,1,.7);tinkle(t+.05,20,1.2,.05);osc('sine',2093,t,.003,.06,2.5,.9)},
    glassRain:t=>tinkle(t,30,2.4,.025),
    voice:t=>{[440,523.3].forEach(f=>osc('sine',f,t,.6,.03,2.2,.85));nz(t,1.6,.05,'bandpass',1100,10,.8,700,.4)},
    /* the wail of the Voice: she weeps and laments (sliding sobs, a low moan, a breath); the same wail, far and soft, when the Illusion or the echo throws it */
    wailCry:t=>{const k=.94+Math.random()*.12;   // soft and short, a slightly different pitch each time
      osc('triangle',587*k,t,.3,.03,1,.85,392*k);osc('triangle',592*k,t+.02,.3,.022,1,.85,395*k);osc('sine',220*k,t,.4,.02,1.1,.7,160*k);
      osc('sine',698*k,t+.4,.2,.025,.7,.85,466*k);nz(t,1,.022,'bandpass',1100*k,10,.8,650,.4)},
    wailEcho:t=>far(t,{vol:.35,lp:1100,delay:.22},FX.wailCry),
    /* Voice arrival: far, very sad weeping (sliding sobs, a low moan, breaths), no words */
    weepFar:t=>far(t,{vol:.6,lp:1300,delay:0},tt=>{[0,.85,1.7,2.5,3.2].forEach((d,i)=>{const f=560-i*34;osc('triangle',f,tt+d,.3,.05-i*.005,.9,.9,f*.66);osc('triangle',f+4,tt+d+.02,.3,.03,.9,.9,f*.66)});
      osc('sine',196,tt,.9,.035,3.6,.8,150);nz(tt,3.8,.04,'bandpass',1000,9,.8,600,.8)}),
    /* last lament of the Voice as she disappears: the wail, one more slide down, then a murmur without words that fades out */
    wailLast:t=>far(t,{vol:.7,lp:1200,delay:0},tt=>{FX.wailCry(tt);osc('triangle',440,tt+1.7,.4,.03,2.2,.9,262);osc('triangle',444,tt+1.72,.4,.02,2.2,.9,264);
      for(let i=0;i<5;i++)nz(tt+2.3+i*.55,1,.026-i*.005,'bandpass',620+i*55,7,.85,420,.45)}),
    /* the turquoise lantern falls into the water (muffled), then sinks pulsing: a dull beat that slows down */
    lanternSplash:t=>{nz(t,.4,.16,'lowpass',520,1,.4,170,.01);osc('sine',300,t,.004,.09,.3,.5,110);nz(t+.08,.3,.06,'lowpass',360,1,.35,140)},
    lanternSink:t=>{let d=0,g=.28;for(let i=0;i<7;i++){osc('sine',72,t+d,.01,.13*(1-i*.1),.4,.5,50);osc('sine',900,t+d,.02,.012*(1-i*.12),.6,.9,700);d+=g;g*=1.2}
      nz(t,d+.4,.025,'lowpass',240,1,.5,110,.4)},
    /* the hero lantern flame lowers */
    flameDim:t=>{nz(t,1.1,.07,'bandpass',1100,2,.4,180,.05);osc('sawtooth',140,t,.04,.02,1.1,.3,70);for(let i=0;i<4;i++)nz(t+i*.22,.03,.05,'highpass',3500)},
    /* the rusted chained hatch gives way: chain creaking, damp wood */
    hatchGroan:t=>{for(let i=0;i<6;i++){const f=420+Math.random()*180;osc('sawtooth',f,t+i*.12,.03,.022,.16,.3,f*.72)}
      osc('sawtooth',88,t,.4,.035,1,.3,64);nz(t,1.1,.12,'lowpass',320,1.5,.3,120,.3);nz(t+.5,.5,.05,'bandpass',900,6,.3,500,.1)},
    /* the hold: dripping water and echo */
    bilge:t=>{for(let i=0;i<5;i++){const f=900+Math.random()*700,tt=t+i*.5+Math.random()*.3;osc('sine',f,tt,.003,.035,.45,.97,f*.55)}nz(t,3,.04,'lowpass',210,1,.9,100,.8)},
    /* the Rust King: chains jingling at each step, the anchor dragged on the wood, the head bell dull and off the beat (no Lumen in it) */
    chainStep:t=>{for(let i=0;i<4;i++)clang(t+i*.05,260+Math.random()*120,.03,.55)},
    anchorDrag:t=>{nz(t,1.8,.08,'lowpass',260,1,.3,120,.5);nz(t,1.8,.04,'bandpass',700,5,.3,350,.4);osc('sawtooth',48,t,.4,.02,1.4,.2,40)},
    bellDull:t=>far(t,{vol:.55,lp:420,delay:.17},tt=>clang(tt,182,.09,1.7)),
    /* true silence: the ambience fades out */
    hush:t=>{bedStop();duck(t,.2)},
    /* only the hero lantern vibrates (dry, nothing answers) */
    lanternHum:t=>dry(()=>{osc('sine',880,t,.5,.028,2,0);osc('sine',884.5,t,.5,.022,2,0);osc('sine',1320,t+.2,.4,.008,1.6,0)}),
    /* the cracked bell: a single broken note (two close, out-of-tune partials that beat) */
    crackedBell:t=>{[[1,.1],[2.41,.05],[3.7,.025]].forEach(([m,p])=>{osc('sine',233*m,t,.004,p,3.2,.7);osc('sine',233*m*1.043,t+.01,.004,p*.8,2.2,.7,233*m*.98)});nz(t,.5,.03,'bandpass',2400,8,.5)},
    /* a distant tide */
    tideFar:t=>dry(()=>{[0,3.1].forEach(d=>nz(t+d,3.4,.05,'lowpass',280,1,0,130,1.5));nz(t,6,.006,'highpass',3000,1,0,null,2)}),
    /* the reflections of a rage arrive: a glassy pulse that comes back three times, each repeat farther and duller (echo timbre) */
    echoArrive:t=>{[0,.2,.42].forEach((d,i)=>far(t+d,{vol:.75-i*.25,lp:3600-i*1200,delay:0},tt=>{osc('sine',392,tt,.01,.06,.9,.8,330);osc('sine',784,tt,.01,.03,.7,.8,660);osc('sine',1081,tt,.005,.012,.5,.9)}));
      nz(t,.6,.05,'bandpass',900,3,.6,2600,.3)},
    rumble:t=>nz(t,2,.2,'lowpass',140,1,.4,60,1),
    chainSlip:t=>{for(let i=0;i<8;i++)osc('triangle',1800+Math.random()*1500,t+i*.05,.002,.04,.1,.4);nz(t,.6,.08,'bandpass',900,3,.3,300)},
    plant:t=>{thump(t,65,.8,.8);clang(t,170,.1,1.4);nz(t+.05,.6,.07,'highpass',2800,1,.5)},
    tollLast:t=>{[[1,.2,3.4],[2.4,.09,2.6],[3,.07,2.2],[4.2,.05,1.6]].forEach(([m,p,d])=>osc('sine',73.4*m,t,.006,p,d,.8,73.4*m*.8))},
    crackRun:t=>{for(let i=0;i<26;i++)nz(t+i*.04,.025,.08+Math.random()*.06,'highpass',2500+Math.random()*2500);osc('sine',60,t,.8,.12,.6,.4,90)},
    chunk:t=>{thump(t,80+Math.random()*30,.5,.6);nz(t,.6,.15,'lowpass',600);nz(t+.08,.4,.05,'highpass',2500,1,.4)},
    iceCrack:t=>{nz(t,.1,.3,'highpass',2200);osc('sine',85,t,.003,.25,.6,.8,38)},
    land:t=>{thump(t,90,.5,.5);nz(t,.4,.12,'highpass',1800,1,.3)},
    burst:t=>{nz(t,.6,.3,'bandpass',700,1.5,.5,180);osc('sine',320,t,.005,.2,.6,.5,70);nz(t,.1,.25,'highpass',3000)},
    /* birth of form II: a deep, wide, low murmur, no words (synthesised; nothing announced) */
    murmur:t=>{[46,55,62,73,82].forEach((f,i)=>osc('sine',f,t+i*.1,1.3,.06-i*.007,2.8,.85,f*.9,(i-2)*8));nz(t,3.8,.045,'bandpass',170,2,.85,95,1.5)},
    creature:t=>{osc('sine',260,t,.3,.05,1.4,.8,520,0);osc('sine',263,t+.05,.3,.04,1.3,.8,480)},
    jellyHit:t=>{osc('sine',210,t,.01,.07,.5,.7,70);osc('sine',140,t+.04,.01,.04,.45,.7,55);nz(t,.35,.09,'lowpass',700,1,.4,220,.3)},
    clank:t=>{clang(t,150+Math.random()*160,.07,.9);thump(t,120,.2,.25)},
    ignite:t=>{nz(t,.4,.2,'highpass',3000);[440,523.3,659.3].forEach((f,i)=>osc('sine',f,t+i*.08,.4,.05,2.4,.8));osc('sawtooth',55,t,.5,.03,2.5,.4)},
    beam:t=>{nz(t,1.4,.1,'bandpass',300,3,.4,2600,.6);osc('sine',110,t,.4,.05,1.2,.4,165)},
    thunder:t=>{nz(t,.12,.45,'highpass',1800);nz(t+.05,2.4,.35,'lowpass',500,1,.5,80);osc('sine',60,t,.004,.3,.8,.3,30)},
    scream:t=>{osc('sine',1400,t,.05,.07,1.2,.7,300);osc('sine',1430,t,.05,.05,1.2,.7,310);nz(t,1,.06,'bandpass',1800,6,.6,400)},
    fallWhine:t=>{osc('sine',800,t,.05,.05,1.5,.7,110)},
    dissolve:t=>{for(let i=0;i<10;i++)osc('sine',900+i*170,t+i*.12,.1,.025,1.4,.9,1300+i*200)},
    bellHit:t=>{const b=180+Math.random()*240;clang(t,b,.075,1.7);osc('sine',b*.5,t,.004,.04,1.2,.6)},
    bellBig:t=>{clang(t,110,.12,3.2);osc('sine',55,t,.005,.08,2.6,.7);clang(t+.18,112,.04,2.2)},
    bellMuffled:t=>{[[1,.12,2.6],[2.7,.04,1.4]].forEach(([m,p,d])=>osc('sine',98*m,t,.01,p,d,.6));nz(t,.8,.05,'lowpass',180,1,.4)},
    bellSoft:t=>{const b=420+Math.random()*380;clang(t,b,.03,1.4)},
    bellChime:t=>{[0,.09,.2].forEach((d,i)=>clang(t+d,520+i*130+Math.random()*60,.035,1.2))},
    bellCascade:t=>{for(let i=0;i<9;i++)clang(t+i*.06+Math.random()*.04,160+Math.random()*420,.05,1.5)},
    zap:t=>{nz(t,.06,.32,'highpass',2600);nz(t+.02,.6,.16,'lowpass',700,1,.4,120);osc('sine',1800,t,.003,.06,.25,.6,300)},
    refill:t=>{osc('sine',180,t,3.4,.05,.4,.6,720);osc('sine',270,t,3.4,.03,.4,.6,1080);nz(t,3.6,.03,'bandpass',500,4,.6,3000,3.4)},
    stars:t=>{[1046.5,1318.5,1568,2093,2637].forEach((f,i)=>osc('sine',f,t+i*.28,.01,.05,3,.9))}
  };
  function fx(name){if(!LB.audio.sound)return;if(!init())return;const f=FX[name];if(f)f(ac.currentTime+.02)}
  function bed(id){if(!LB.audio.music)return;if(!init())return;if(cur===id)return;bedStop();bedId=id;ARR=bedLayers;THEMES[id].bed();ARR=null;bedTimer=setInterval(()=>{if(Math.random()<.18)THEMES[id].amb(ac.currentTime+.05)},200)}
  function bedStop(){if(!ac)return;clearInterval(bedTimer);bedTimer=null;bedId=null;const t=ac.currentTime;bedLayers.forEach(L=>{L.g.gain.cancelScheduledValues(t);L.g.gain.setValueAtTime(L.g.gain.value,t);L.g.gain.linearRampToValueAtTime(0,t+1);setTimeout(L.stop,1200)});bedLayers=[]}
  function tick(){const th=THEMES[cur];if(!th)return;const spb=60/th.bpm/4;if(next<ac.currentTime){const miss=Math.ceil((ac.currentTime-next)/spb);next+=miss*spb;step+=miss}while(next<ac.currentTime+.6){th.step(step,next);if(Math.random()<th.ambP)th.amb(next+Math.random()*spb);next+=spb;step++}}
  function stop(){if(!ac)return;clearInterval(timer);timer=null;cur=null;out.gain.setTargetAtTime(.5,ac.currentTime+.6,.3);const t=ac.currentTime;layers.forEach(L=>{L.g.gain.cancelScheduledValues(t);L.g.gain.setValueAtTime(L.g.gain.value,t);L.g.gain.linearRampToValueAtTime(0,t+.8);setTimeout(L.stop,1000)});layers=[]}
  /* fadeStop(sec): the theme fades out smoothly, then stops (immediate stop if nothing plays) */
  function fadeStop(sec){if(!ac||cur==null){stop();return}clearInterval(timer);timer=null;const keep=cur,t=ac.currentTime;out.gain.cancelScheduledValues(t);out.gain.setTargetAtTime(.0001,t,sec/4);setTimeout(()=>{if(cur===keep&&timer===null)stop()},sec*1000+100)}
  function play(id){if(!LB.audio.music){stop();bedStop();return}if(!init())return;stop();bedStop();cur=id;step=0;next=ac.currentTime+.15;out.gain.setTargetAtTime(.5*(THEMES[id].vol||1),ac.currentTime,.3);THEMES[id].start();timer=setInterval(tick,100)}
  return{play,stop,fadeStop,fx,bed,bedStop,setMus(v){if(!v){stop();bedStop()}},get cur(){return cur},get bedId(){return bedId}};
})();
