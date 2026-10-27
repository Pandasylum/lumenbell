/* ---------- audio ---------- */
let bgOff=false;
function bgAudio(off){bgOff=off;try{if(AC){if(off){if(AC.state==='running')AC.suspend().catch(()=>{})}else ensureAudio()}}catch(e){}}
function ensureAudio(){
  try{
    if(AC&&AC.state==='closed')AC=null;
    if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(C){try{AC=new C({latencyHint:"playback"})}catch(e){AC=new C()}}}
    if(AC&&!bgOff&&AC.state!=='running'&&AC.resume)AC.resume().catch(()=>{}); /* suspended, ou « interrupted » sur Safari */
  }catch(e){}
}
/* Le navigateur coupe le son quand l'onglet passe en arrière-plan ou après une inactivité : on le relance à la moindre interaction. */
/* Déverrouillage : le navigateur n'autorise le son qu'après un vrai geste ; on crée / relance le contexte à chacun d'eux tant qu'il ne tourne pas, et on joue un son muet pour l'amorcer. */
function unlockAudio(){
  ensureAudio();
  try{if(AC&&AC.state==='running'&&!AC.__u){AC.__u=1;const b=AC.createBuffer(1,1,22050),n=AC.createBufferSource();n.buffer=b;n.connect(AC.destination);n.start(0)}}catch(e){}
}
['click','pointerup','mousedown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,()=>{if(!AC||AC.state!=='running'||!AC.__u)unlockAudio()},true));
document.addEventListener('visibilitychange',()=>bgAudio(document.hidden));
window.addEventListener('pagehide',()=>bgAudio(true));window.addEventListener('pageshow',()=>bgAudio(document.hidden));
window.addEventListener('blur',()=>{if(document.hidden)bgAudio(true)});window.addEventListener('focus',()=>{if(!document.hidden)bgAudio(false)});
function tone(f,d,type,v,slide){
  if(!prefs.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  try{
    const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;
    o.type=type||'sine';
    o.frequency.setValueAtTime(f,n);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),n+d);
    g.gain.setValueAtTime(v||.05,n);
    g.gain.exponentialRampToValueAtTime(.0001,n+d);
    o.connect(g);g.connect(AC.destination);
    o.start();o.stop(n+d);
  }catch(e){}
}
const say=t=>{el.live.textContent=t};
let NB=null;
function noise(d,v,f0,f1){
  if(!prefs.sound||!AC)return;
  if(AC.state!=='running')ensureAudio();
  try{
    if(!NB){NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}
    const n=AC.currentTime,src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
    src.buffer=NB;src.loop=true;f.type='bandpass';f.Q.value=.9;
    f.frequency.setValueAtTime(f0,n);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),n+d);
    g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v,n+Math.min(.03,d/3));g.gain.exponentialRampToValueAtTime(.0001,n+d);
    src.connect(f);f.connect(g);g.connect(AC.destination);src.start(n);src.stop(n+d+.05);
  }catch(e){}
}
function footfall(big){tone(big?58:90,big?.22:.1,'sine',big?.16:.08,-30);noise(big?.16:.07,big?.1:.05,big?500:900,big?120:300)}
function anvil(){tone(1320,.6,'triangle',.06,0);tone(1985,.4,'sine',.04,0);tone(160,.14,'square',.06,-60)}
function forgeSparks(S,x,y,n){for(let i=0;i<(n||24);i++){const a=rand(-3.0,-.15),v=rand(160,520),L=rand(.25,.7);S.sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:900,life:L,max:L,col:i%3?'#ffd27a':(i%2?'#ffffff':'#ff9a3c'),sz:rand(2,4.5)})}}
function boom(d,v){tone(55,d,'sine',v,-20);noise(d,v*.9,900,50)}
function whoosh(d,v,up){noise(d,v,up?400:2800,up?2800:400)}
/* Cri de douleur du Colosse : hurlement qui monte puis s'effondre en gémissement tremblant */
function painCry(d,v){
  if(!prefs.sound||!AC)return;
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
    f.connect(f2);f2.connect(g);g.connect(AC.destination);lfo.start(n);lfo.stop(n+d);
  }catch(e){}
  noise(d*.6,v*.5,2400,600);
}
function roar(){
  if(!prefs.sound||!AC)return;
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
    lfo.start(n);lfo.stop(n+d);f.connect(g);g.connect(AC.destination);
  }catch(e){}
}

