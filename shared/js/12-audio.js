/* ---------- audio : un seul contexte pour toute la série ----------
   LB.audio.ctx : l'unique AudioContext (créé au premier ensure(), recréé s'il est fermé). Chaîne : sources → bus sfx / mus → master → sortie.
   Niveaux par chapitre : LB.setup({audio:{master,sfx,mus}}), 1 par défaut. LB.audio.dest = sortie brute (musique qui a sa propre chaîne).
   Réglages Son / Musique : lb-snd, lb-mus lus par LB.store (load, appelé par LB.setup), écrits par setSound / setMusic.
   Arrière-plan (onglet caché, écran verrouillé, page quittée) : le contexte est suspendu, relancé au retour ou au premier geste. */
LB.audio=(()=>{
  let ctx=null,master=null,sfx=null,mus=null,bg=false,nb=null;
  const lv={master:1,sfx:1,mus:1},A={sound:true,music:true,stat:{tone:0,noise:0,made:0}};
  /* smooth : le bus musique suit en fondu (constante de temps 0,12 s, celle de l'arrêt de la musique du Chapitre I) ; sinon il prend sa valeur d'un coup (création du contexte) */
  const apply=smooth=>{if(!ctx)return;master.gain.value=lv.master;sfx.gain.value=A.sound?lv.sfx:0;
    const m=A.music?lv.mus:0;if(smooth)mus.gain.setTargetAtTime(m,ctx.currentTime,.12);else mus.gain.value=m};
  function ensure(){
    try{
      if(bg&&!document.hidden)bg=false; /* garde-fou : l'arrière-plan ne peut pas durer quand la page est visible (un événement de retour perdu bloquerait le son) */
      if(ctx&&ctx.state==='closed'){ctx=null;nb=null}
      if(!ctx){
        const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
        try{ctx=new C({latencyHint:'playback'})}catch(e){ctx=new C()}
        try{master=ctx.createGain();master.connect(ctx.destination);sfx=ctx.createGain();sfx.connect(master);mus=ctx.createGain();mus.connect(master);apply();A.stat.made++}
        catch(e){ctx=null;return null}
      }
      if(!bg&&ctx.state!=='running'&&ctx.resume)ctx.resume().catch(()=>{}); /* suspended, ou « interrupted » sur Safari */
    }catch(e){}
    return ctx;
  }
  /* off=true : le contexte est suspendu et reste coupé tant qu'on n'est pas revenu */
  function background(off){bg=off;try{if(ctx){if(off){if(ctx.state==='running')ctx.suspend().catch(()=>{})}else ensure()}}catch(e){}}
  /* enveloppe par défaut = celle du Chapitre II ; o={atk,end,tail} pour une enveloppe plus ancienne (Chapitre I) */
  function tone(f,dur,type,vol,dest,when,f2,o){
    if(!ctx||(!dest&&!A.sound))return;
    if(ctx.state!=='running')ensure();
    try{
      const t=when||ctx.currentTime,atk=o&&o.atk!=null?o.atk:.006,end=o&&o.end||.0005,tail=o&&o.tail!=null?o.tail:.05;
      const os=ctx.createOscillator(),g=ctx.createGain();
      os.type=type||'sine';os.frequency.setValueAtTime(f,t);if(f2)os.frequency.exponentialRampToValueAtTime(f2,t+dur);
      if(atk>0){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+atk)}else g.gain.setValueAtTime(vol,t);
      g.gain.exponentialRampToValueAtTime(end,t+dur);
      os.connect(g);g.connect(dest||sfx);os.start(t);os.stop(t+dur+tail);A.stat.tone++;
    }catch(e){}
  }
  function noise(dur,vol,ft,ff,q,dest,when,ff2,o){
    if(!ctx||(!dest&&!A.sound))return;
    if(ctx.state!=='running')ensure();
    try{
      if(!nb){nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
      const t=when||ctx.currentTime,atk=o&&o.atk||0,end=o&&o.end||.0005;
      const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();
      s.buffer=nb;s.loop=true;fl.type=ft;fl.frequency.setValueAtTime(ff,t);if(ff2)fl.frequency.exponentialRampToValueAtTime(ff2,t+dur);fl.Q.value=q||1;
      if(atk>0){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+atk)}else g.gain.setValueAtTime(vol,t);
      g.gain.exponentialRampToValueAtTime(end,t+dur);
      s.connect(fl);fl.connect(g);g.connect(dest||sfx);s.start(t);s.stop(t+dur+.05);A.stat.noise++;
    }catch(e){}
  }
  /* le navigateur n'autorise le son qu'après un vrai geste : on crée / relance le contexte à chacun d'eux tant qu'il ne tourne pas, et on joue un son muet pour l'amorcer */
  function unlock(){
    ensure();
    try{if(ctx&&ctx.state==='running'&&!ctx.__u){ctx.__u=1;const b=ctx.createBuffer(1,1,22050),n=ctx.createBufferSource();n.buffer=b;n.connect(ctx.destination);n.start(0)}}catch(e){}
  }
  ['click','pointerup','mousedown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,()=>{if(!ctx||ctx.state!=='running'||!ctx.__u)unlock()},true));
  document.addEventListener('visibilitychange',()=>background(document.hidden));
  window.addEventListener('pagehide',()=>background(true));window.addEventListener('pageshow',()=>background(document.hidden));
  window.addEventListener('blur',()=>{if(document.hidden)background(true)});window.addEventListener('focus',()=>{if(!document.hidden)background(false)});
  Object.assign(A,{
    ensure,background,tone,noise,
    config(o){Object.assign(lv,o||{});apply()},
    load(){A.sound=LB.store.get(LB.key('snd'),'1')==='1';A.music=LB.store.get(LB.key('mus'),'1')==='1';apply()},
    setSound(on){A.sound=!!on;LB.store.set(LB.key('snd'),A.sound?'1':'0');apply();if(A.sound)ensure()},
    setMusic(on){A.music=!!on;LB.store.set(LB.key('mus'),A.music?'1':'0');apply(true);if(A.music)ensure()},
    now(){return ctx?ctx.currentTime:0}
  });
  /* défini à part : Object.assign recopierait la valeur des accesseurs au lieu de les garder */
  Object.defineProperties(A,{ctx:{get:()=>ctx},dest:{get:()=>ctx&&ctx.destination},sfx:{get:()=>sfx},mus:{get:()=>mus},master:{get:()=>master},
    state:{get:()=>ctx?ctx.state:'none'},bg:{get:()=>bg}});
  return A;
})();
