/* ---------- audio : un seul contexte pour toute la série ----------
   LB.audio.ctx : l'unique AudioContext (créé au premier ensure(), recréé s'il est fermé). Chaîne : sources → bus sfx / mus → master → sortie.
   Niveaux par chapitre : LB.setup({audio:{master,sfx,mus}}), 1 par défaut. LB.audio.dest = sortie brute (musique qui a sa propre chaîne).
   Réglages Son / Musique : lb-snd, lb-mus lus par LB.store (load, appelé par LB.setup), écrits par setSound / setMusic.
   Arrière-plan (onglet caché, écran verrouillé, page quittée) : le contexte est suspendu, relancé au retour ou au premier geste.
   Fichiers son : window.LB_SND = {nom: mp3 en base64}, écrit par build/build_chapter.py (absent des sources et des copies de test) ; LB.audio.add(nom, base64 | ArrayBuffer) en ajoute.
   Décodés une seule fois, au premier geste (ou à l'ajout s'il a déjà eu lieu) ; cache vidé si le contexte est recréé. Voir shared/NOTES.md (LB.audio.play). */
LB.audio=(()=>{
  let ctx=null,master=null,sfx=null,mus=null,bg=false;
  const nbs=new Map(); /* tampons de bruit blanc en cache, par durée (s) ; vidés si le contexte est recréé */
  const raw=new Map(),bufs=new Map(); /* fichiers son : nom -> données brutes ; nom -> AudioBuffer, false (illisible) ou null (décodage en cours), pour le contexte actuel */
  let gest=false; /* un vrai geste a eu lieu : le décodage peut commencer */
  const lv={master:1,sfx:1,mus:1},A={sound:true,music:true,stat:{tone:0,noise:0,made:0,file:0,dec:0}};
  /* smooth : le bus musique suit en fondu (constante de temps 0,12 s, celle de l'arrêt de la musique du Chapitre I) ; sinon il prend sa valeur d'un coup (création du contexte) */
  const apply=smooth=>{if(!ctx)return;master.gain.value=lv.master;sfx.gain.value=A.sound?lv.sfx:0;
    const m=A.music?lv.mus:0;if(smooth)mus.gain.setTargetAtTime(m,ctx.currentTime,.12);else mus.gain.value=m};
  function ensure(){
    try{
      if(bg&&!document.hidden)bg=false; /* garde-fou : l'arrière-plan ne peut pas durer quand la page est visible (un événement de retour perdu bloquerait le son) */
      if(ctx&&ctx.state==='closed'){ctx=null;nbs.clear();bufs.clear()}
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
      const t=when||ctx.currentTime,atk=o&&o.atk||0,end=o&&o.end||.0005;
      const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();
      s.buffer=noiseBuf(1);s.loop=true;fl.type=ft;fl.frequency.setValueAtTime(ff,t);if(ff2)fl.frequency.exponentialRampToValueAtTime(ff2,t+dur);fl.Q.value=q||1;
      if(atk>0){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+atk)}else g.gain.setValueAtTime(vol,t);
      g.gain.exponentialRampToValueAtTime(end,t+dur);
      s.connect(fl);fl.connect(g);g.connect(dest||sfx);s.start(t);s.stop(t+dur+.05);A.stat.noise++;
    }catch(e){}
  }
  /* tampon de bruit blanc mono de dur secondes (un seul par durée, partagé par les bruitages et les musiques) ; null sans contexte */
  function noiseBuf(dur){
    if(!ctx)return null;
    let b=nbs.get(dur);
    if(!b){b=ctx.createBuffer(1,Math.round(ctx.sampleRate*dur),ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;nbs.set(dur,b)}
    return b;
  }
  /* fichiers son : base64 -> ArrayBuffer (une copie neuve à chaque décodage : decodeAudioData consomme son tampon) */
  function bytes(d){
    if(typeof d!=='string')return d.slice(0);
    const b=atob(d),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer;
  }
  /* décode un fichier une fois pour le contexte actuel ; échec (absent, illisible, navigateur sans mp3) : false, sans erreur */
  function decode(n){
    if(!ctx||!gest||bufs.has(n)||!raw.has(n))return;
    const c=ctx;bufs.set(n,null);
    const done=b=>{if(c===ctx){bufs.set(n,b||false);if(b)A.stat.dec++}},fail=()=>done(false);
    try{const r=c.decodeAudioData(bytes(raw.get(n)),done,fail);if(r&&r.catch)r.catch(fail)}catch(e){fail()}
  }
  const decodeAll=()=>raw.forEach((d,n)=>decode(n));
  /* joue le fichier n ; o={vol (1), bus ('sfx' par défaut, 'mus', ou un nœud audio), when (instant du contexte), rate (vitesse : 2 = une octave plus haut), loop}
     renvoie {stop(when)} ou null (fichier absent, pas encore décodé ou illisible, réglage coupé, arrière-plan) */
  function play(n,o){
    o=o||{};
    if(!ctx||bg)return null;
    const bus=o.bus||'sfx';
    if(bus==='sfx'&&!A.sound||bus==='mus'&&!A.music)return null;
    const b=bufs.get(n);if(!b)return null;
    if(ctx.state!=='running')ensure();
    try{
      const t=Math.max(o.when||0,ctx.currentTime),s=ctx.createBufferSource(),g=ctx.createGain();
      s.buffer=b;s.loop=!!o.loop;if(o.rate)s.playbackRate.setValueAtTime(o.rate,t);
      g.gain.value=o.vol!=null?o.vol:1;
      s.connect(g);g.connect(bus==='sfx'?sfx:bus==='mus'?mus:bus);s.start(t);A.stat.file++;
      let end=false;
      return {stop(w){if(end||!ctx)return;end=true;try{const u=Math.max(w||0,ctx.currentTime);g.gain.setTargetAtTime(0,u,.015);s.stop(u+.1)}catch(e){}}};
    }catch(e){return null}
  }
  function add(n,d){if(!d)return;raw.set(n,d);bufs.delete(n);decode(n)}
  try{const L=window.LB_SND;if(L)for(const n in L)raw.set(n,L[n])}catch(e){}
  /* le navigateur n'autorise le son qu'après un vrai geste : on crée / relance le contexte à chacun d'eux tant qu'il ne tourne pas, et on joue un son muet pour l'amorcer */
  function unlock(){
    ensure();gest=true;decodeAll();
    try{if(ctx&&ctx.state==='running'&&!ctx.__u){ctx.__u=1;const b=ctx.createBuffer(1,1,22050),n=ctx.createBufferSource();n.buffer=b;n.connect(ctx.destination);n.start(0)}}catch(e){}
  }
  ['click','pointerup','mousedown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,()=>{if(!ctx||ctx.state!=='running'||!ctx.__u)unlock()},true));
  document.addEventListener('visibilitychange',()=>background(document.hidden));
  window.addEventListener('pagehide',()=>background(true));window.addEventListener('pageshow',()=>background(document.hidden));
  window.addEventListener('blur',()=>{if(document.hidden)background(true)});window.addEventListener('focus',()=>{if(!document.hidden)background(false)});
  Object.assign(A,{
    ensure,background,tone,noise,noiseBuf,play,add,
    has(n){return !!bufs.get(n)},names(){return [...raw.keys()]},
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
