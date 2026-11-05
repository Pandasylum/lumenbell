/* ---------- audio : tout passe par LB.audio (shared/js/12-audio.js), un seul contexte pour la série ----------
   tone et noise gardent leur signature et leur enveloppe d'origine (E_TONE, noise ci-dessous) ; le contexte, la suspension en arrière-plan et le déverrouillage sont communs. */
const ensureAudio=LB.audio.ensure;
const E_TONE={atk:0,end:.0001,tail:0};
function tone(f,d,type,v,slide){LB.audio.tone(f,d,type,v||.05,null,null,slide?Math.max(30,f+slide):0,E_TONE)}
const say=t=>{el.live.textContent=t};
function noise(d,v,f0,f1){LB.audio.noise(d,v,'bandpass',f0,.9,null,null,Math.max(30,f1),{atk:Math.min(.03,d/3),end:.0001})}
function footfall(big){tone(big?58:90,big?.22:.1,'sine',big?.16:.08,-30);noise(big?.16:.07,big?.1:.05,big?500:900,big?120:300)}
function anvil(){tone(1320,.6,'triangle',.06,0);tone(1985,.4,'sine',.04,0);tone(160,.14,'square',.06,-60)}
function forgeSparks(S,x,y,n){for(let i=0;i<(n||24);i++){const a=rand(-3.0,-.15),v=rand(160,520),L=rand(.25,.7);S.sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:900,life:L,max:L,col:i%3?'#ffd27a':(i%2?'#ffffff':'#ff9a3c'),sz:rand(2,4.5)})}}
function boom(d,v){tone(55,d,'sine',v,-20);noise(d,v*.9,900,50)}
function whoosh(d,v,up){noise(d,v,up?400:2800,up?2800:400)}
/* Cri de douleur du Colosse : hurlement qui monte puis s'effondre en gémissement tremblant */
function painCry(d,v){
  const AC=LB.audio.ctx;if(!LB.audio.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  d=d||1.7;v=v||.17;
  try{
    const n=AC.currentTime,g=AC.createGain(),f=AC.createBiquadFilter(),f2=AC.createBiquadFilter(),lfo=AC.createOscillator(),lg=AC.createGain();
    f.type='bandpass';f.Q.value=2.2;f.frequency.setValueAtTime(1100,n);f.frequency.linearRampToValueAtTime(1500,n+.2);f.frequency.exponentialRampToValueAtTime(420,n+d);
    f2.type='lowpass';f2.frequency.value=2600;
    g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v,n+.05);g.gain.setValueAtTime(v,n+d*.35);g.gain.exponentialRampToValueAtTime(.0001,n+d);
    lfo.frequency.setValueAtTime(7,n);lfo.frequency.linearRampToValueAtTime(11,n+d);lg.gain.setValueAtTime(10,n);lg.gain.linearRampToValueAtTime(26,n+d);lfo.connect(lg);
    [[180,'sawtooth'],[186,'sawtooth'],[90,'square']].forEach(([fr,ty])=>{
      const o=AC.createOscillator();o.type=ty;
      o.frequency.setValueAtTime(fr,n);o.frequency.exponentialRampToValueAtTime(fr*1.7,n+.16);o.frequency.exponentialRampToValueAtTime(fr*.42,n+d);
      lg.connect(o.frequency);o.connect(f);o.start(n);o.stop(n+d);
    });
    f.connect(f2);f2.connect(g);g.connect(LB.audio.sfx);lfo.start(n);lfo.stop(n+d);
  }catch(e){}
  noise(d*.6,v*.5,2400,600);
}
function roar(){
  const AC=LB.audio.ctx;if(!LB.audio.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  try{
    const n=AC.currentTime,d=.9,g=AC.createGain(),f=AC.createBiquadFilter(),lfo=AC.createOscillator(),lg=AC.createGain();
    f.type='lowpass';f.frequency.setValueAtTime(900,n);f.frequency.exponentialRampToValueAtTime(220,n+d);
    g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.16,n+.06);g.gain.exponentialRampToValueAtTime(.0001,n+d);
    lfo.frequency.value=38;lg.gain.value=30;lfo.connect(lg);
    [95,142,71].forEach((fr,i)=>{
      const o=AC.createOscillator();o.type=i?'square':'sawtooth';
      o.frequency.setValueAtTime(fr*1.5,n);o.frequency.exponentialRampToValueAtTime(fr*.55,n+d);
      lg.connect(o.frequency);o.connect(f);o.start(n);o.stop(n+d);
    });
    lfo.start(n);lfo.stop(n+d);f.connect(g);g.connect(LB.audio.sfx);
  }catch(e){}
}

