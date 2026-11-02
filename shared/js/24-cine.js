/* ---------- LB.cine : intro et outro des chapitres (session engine/cine, 1er novembre 2026) ----------
   Le cadre commun des cinématiques : canvas dédié 960 x 540 en plein écran (#cineC), légende HTML dessous (#cineCap),
   bouton « Passer » (#cineSkip), cartons enchaînés avec un fondu au noir à chaque bout, Échap / Entrée / Espace passent.
   Le chapitre ne donne que ses scènes : LB.cine.create({key, scenes, onStart, onTick, onEnd}) → {play(done), replay(done),
   seen(), playing(), skip()}.
   - scenes : tableau (ou fonction qui le rend au moment de jouer) de cartons {d, en, fr, draw} ; à la place de en/fr, txt()
     peut rendre le texte déjà traduit (le Chapitre II garde ainsi sa fonction de texte, relue par tests/ch2-texts.js) ; col = couleur de la
     légende (annonce du chapitre suivant) ; enter(st) au début du carton ; cue = [[p, fn], …] : fn une seule fois quand
     l'avancement p du carton dépasse le seuil. draw(p, t, lt, st, cx) : p avancement du carton (0 à 1), t temps depuis le
     début, lt temps dans le carton, st état de la lecture (drapeaux libres), cx contexte du canvas (repère 960 x 540).
   - key : drapeau « vue » (LB.key(key), par ex. lb-ch1-intro), écrit à la fin ou au passage ; sans key, aucun drapeau.
     testSeen : la copie de test du Chapitre I le pose pour ne jamais lire le drapeau (intro considérée vue).
   - play ne regarde pas le drapeau : c'est le chapitre qui décide (seen()) ; replay = play (rejeu depuis un menu).
   - Durées : LB.CINE_T (fondu, légende, durée minimale d'un carton) ; la durée de chaque carton est dans la table du chapitre.
   - Horloge : requestAnimationFrame (pas borné à dtMax). LB.cine.manual = true (copies de test) : plus de rAF, le test
     appelle LB.cine.step(dt, dessiner).
   - Le cadre (boîte, légende, bouton) est créé ici avec son style (LB.CINE_CSS) ; le bouton prend la classe « btn ghost »
     du chapitre (sa couleur). Le dessin ne doit jamais tirer Math.random hors des scènes qui le faisaient déjà. */
LB.CINE_T={fade:.8,capIn:.5,capFade:.6,min:6,dtMax:.1,keys:['Escape','Enter',' ']};
LB.CINE_CSS='.cine{position:fixed;inset:0;z-index:120;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:12px}\n'+
 '.cine[hidden]{display:none}\n'+
 '.cbox{width:min(100%,calc((100dvh - 120px)*16/9));aspect-ratio:16/9}\n'+
 '.cbox canvas{display:block;width:100%;height:100%}\n'+
 '.ccap{margin:0;min-height:3.2em;max-width:min(760px,100%);text-align:center;color:var(--fg);font-size:clamp(15px,2.4vw,22px);line-height:1.45;text-wrap:balance;opacity:0}\n'+
 '#cineSkip{position:absolute;right:14px;bottom:14px;padding:8px 18px;font-size:15px;min-height:40px}\n';
LB.cine=(()=>{
  const T=LB.CINE_T,c01=v=>v<0?0:v>1?1:v;
  let box=null,cvs=null,cx=null,cap=null,sk=null,K=1,cur=null;
  function mount(){
    if(box)return{cx,K};
    const st=document.createElement('style');st.textContent=LB.CINE_CSS;document.head.appendChild(st);
    box=document.createElement('div');box.className='cine';box.id='cine';box.hidden=true;
    box.innerHTML='<div class="cbox"><canvas id="cineC" aria-hidden="true"></canvas></div><p class="ccap" id="cineCap" aria-live="polite"></p><button type="button" class="btn ghost" id="cineSkip">Skip ›</button>';
    document.body.appendChild(box);
    cvs=box.querySelector('canvas');cap=box.querySelector('.ccap');sk=box.querySelector('button');cx=cvs.getContext('2d');
    const coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
    K=Math.min(2,coarse?1.25:(window.devicePixelRatio||1));cvs.width=960*K;cvs.height=540*K;
    sk.addEventListener('click',()=>{if(cur)cur.skip()});
    window.addEventListener('keydown',e=>{if(!cur)return;e.stopImmediatePropagation();e.preventDefault();if(T.keys.includes(e.key))cur.skip()},true);
    return{cx,K};
  }
  function create(o){
    mount();
    const key=o.key?LB.key(o.key):null;
    let seen=o.testSeen?true:key?LB.store.get(key,'0')==='1':false,st=null;
    const dur=s=>Math.max(T.min,s.d);
    function advance(dt){
      st.t+=dt;if(o.onTick)o.onTick(st.t,dt);
      const sc=st.sc;let acc=0,i=0;for(;i<sc.length;i++){if(st.t<acc+dur(sc[i]))break;acc+=dur(sc[i])}
      if(i>=sc.length){finish();return false}
      const s=sc[i],d=dur(s),lt=st.t-acc;st.lt=lt;st.p=lt/d;st.al=Math.min(1,lt/T.fade,(d-lt)/T.fade);
      if(st.i!==i){st.i=i;cap.textContent=s.txt?s.txt():LB._(s.en,s.fr);cap.style.color=s.col||'';if(s.enter)s.enter(st)}
      if(s.cue)s.cue.forEach(([at,fn],k)=>{const n='cue'+i+'-'+k;if(!st[n]&&st.p>at){st[n]=1;fn(st)}});
      cap.style.opacity=String(c01(Math.min(lt-T.capIn,d-T.capIn-lt)/T.capFade));
      return true;
    }
    function render(){
      cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1;cx.fillStyle='#000';cx.fillRect(0,0,960,540);
      st.sc[st.i].draw(st.p,st.t,st.lt,st,cx);
      cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1-st.al;cx.fillStyle='#000';cx.fillRect(0,0,960,540);cx.globalAlpha=1;
    }
    function frame(now){
      if(!st)return;
      const dt=Math.min(T.dtMax,(now-st.last)/1000);st.last=now;
      if(!advance(dt))return;
      render();st.raf=requestAnimationFrame(frame);
    }
    function finish(){
      if(!st)return;const d=st.done;cancelAnimationFrame(st.raf);st=null;cur=null;box.hidden=true;
      if(key){seen=true;LB.store.set(key,'1')}
      try{o.onEnd&&o.onEnd()}catch(e){}
      try{d&&d()}catch(e){}
    }
    function play(done){
      if(st||cur)return;LB.audio.ensure();cvs.width=960*K;cvs.height=540*K;
      sk.textContent=LB._('Skip ›','Passer ›');cap.textContent='';cap.style.opacity='0';cap.style.color='';
      box.hidden=false;st={t:0,i:-1,last:performance.now(),done,raf:0,sc:typeof o.scenes==='function'?o.scenes():o.scenes};cur=self;
      if(o.onStart)o.onStart(st);
      try{sk.focus({preventScroll:true})}catch(e){}
      if(!LB.cine.manual)st.raf=requestAnimationFrame(frame);
    }
    const self={play,replay:play,seen:()=>seen,playing:()=>!!st,skip:finish,
      step(dt,draw){if(st&&advance(dt)&&draw!==false)render()}};
    return self;
  }
  return{create,mount,manual:false,active:()=>cur,skip:()=>{if(cur)cur.skip()},step:(dt,draw)=>{if(cur)cur.step(dt,draw)}};
})();

/* ---------- LB.title : titre de fin d'intro (décision n° 6 du 28 octobre : comme au Chapitre I) ----------
   « LUMEN » couleur du chapitre + « BELL » crème, 96 px, halo de la couleur du chapitre ; ligne du chapitre en Big Shoulders
   26 px crème dessous. LB.title(ctx, t, t0, {col, sub}) : apparaît en TITLE_T.in secondes à partir de t0. Placement :
   le nom a sa ligne de base à y ; la ligne du chapitre à y + subDy, plus bas si les boîtes mesurées (measureText)
   l'exigent pour garder gap entre les deux (police de repli plus haute) ; nom réduit s'il dépasse maxW. */
/* LB.BRAND : règle de couleur unique du mot « LUMENBELL » (titre d'intro, carton « à suivre », menu des deux chapitres) :
   « LUMEN » = LB.CH_COL du chapitre (couleur du chapitre au menu), « BELL » = bell (crème). Aucune autre couleur en dur pour ce mot ; garde dans tests/cine.js.
   Hub (site/) : « LUMEN » = lantern (jaune de la lanterne du Veilleur au repos, LB.WATCHER_T.lantern.idle, une seule source), « BELL » = bell. */
LB.BRAND={bell:'#f0e8df',lantern:LB.WATCHER_T.lantern.idle};
LB.TITLE_T={in:1.75,size:96,sub:26,y:118,subDy:42,gap:8,maxW:840,ls:4,subLs:3,glow:.85,blur:30,subCol:'rgba(240,232,223,.88)'};
LB.rgba=(hex,a)=>'rgba('+[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',')+','+a+')';
LB.title=(c,t,t0,o)=>{
  const T=LB.TITLE_T,a=(t-t0)/T.in,ta=a<0?0:a>1?1:a;if(!(ta>0))return;
  c.save();c.globalAlpha=ta;c.shadowColor=LB.rgba(o.col,T.glow);c.shadowBlur=T.blur;c.textAlign='left';
  const ls=c.letterSpacing!==undefined,font=s=>'800 '+s+'px '+LB.FONT.display;
  c.font=font(T.size);if(ls)c.letterSpacing=T.ls+'px';
  let w1=c.measureText('LUMEN').width,w2=c.measureText('BELL').width;
  if(w1+w2>T.maxW){c.font=font(Math.floor(T.size*T.maxW/(w1+w2)));w1=c.measureText('LUMEN').width;w2=c.measureText('BELL').width}
  const x0=480-(w1+w2)/2,desc=c.measureText('LUMENBELL').actualBoundingBoxDescent||0;
  c.fillStyle=o.col;c.fillText('LUMEN',x0,T.y);c.fillStyle=LB.BRAND.bell;c.fillText('BELL',x0+w1,T.y);
  c.shadowBlur=0;c.textAlign='center';if(ls)c.letterSpacing=T.subLs+'px';c.fillStyle=T.subCol;c.font='700 '+T.sub+'px '+LB.FONT.display;
  const U=o.sub.toUpperCase(),asc=c.measureText(U).actualBoundingBoxAscent||T.sub*.72;
  c.fillText(U,480,Math.max(T.y+T.subDy,T.y+desc+T.gap+asc));c.restore();
};

/* ---------- LB.nextCard : carton « à suivre » de fin d'outro, SEULE implémentation (décision du 2 novembre, 2026-11-02-cine-style-chapitres.md) ----------
   Même rendu pour toute la série : une ligne centrée en y1, « LUMEN » couleur du chapitre suivant puis « BELL · CHAPITRE N » crème
   (LB.BRAND.bell) ; le nom du chapitre en grand dessous, couleur du chapitre suivant, centré en y2. Seuls changent le numéro, le nom,
   la couleur et le décor. Aucun chapitre ne redessine ce carton : un seul appel LB.nextCard par chapitre (garde dans tests/cine.js).
   LB.nextCard(ctx, s, {n, name, col, decor}) : s = secondes depuis le début du carton ; n = numéro du chapitre suivant ;
   col = couleur du chapitre suivant (LB.CH_COL[n]) ; decor(ctx) = plan de fond dessiné avant le texte (facultatif).
   Légende HTML (LB.cine, même forme pour tous) : « Chapitre N · Nom. À suivre. » / « Chapter N · Name. To be continued. », teintée LB.CH_COL[n].
   Toutes les valeurs sont dans LB.NEXT_T. */
LB.CH_COL={1:'#ff7a2b',2:'#4fe0cc',3:'#b9cf5a'};   /* code couleur par chapitre (docs/GLOSSAIRE.md, CH_COL) ; IV et suivants s'ajoutent ici */
/* teinte dérivée d'un chapitre (lien « chapitre suivant » du menu) : « r,g,b » et version éclaircie au survol */
LB.chRgb=n=>{const h=LB.CH_COL[n]||'#8a8a9a';return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',')};
LB.chHover=n=>{const h=LB.CH_COL[n]||'#8a8a9a';return'#'+[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*.45+255*.55).toString(16).padStart(2,'0')).join('')};
LB.NEXT_T={delay:1,in:1.5,y1:118,y2:182,size1:22,size2:62,x:480,ls1:2,ls2:2,
  head:'LUMEN',tail:['BELL · CHAPTER ','BELL · CHAPITRE '],roman:['','I','II','III','IV','V','VI','VII']};
LB.nextCard=(c,s,o)=>{
  const T=LB.NEXT_T;if(o.decor)o.decor(c);
  const a=Math.max(0,Math.min(1,(s-T.delay)/T.in)),R=T.roman[o.n],ls=c.letterSpacing!==undefined;
  c.save();c.globalAlpha=a;c.textAlign='left';
  c.font='700 '+T.size1+'px '+LB.FONT.display;if(ls)c.letterSpacing=T.ls1+'px';
  const tail=LB._(T.tail[0],T.tail[1])+R,w1=c.measureText(T.head).width,w2=c.measureText(tail).width,x0=T.x-(w1+w2)/2;
  c.fillStyle=o.col;c.fillText(T.head,x0,T.y1);c.fillStyle=LB.BRAND.bell;c.fillText(tail,x0+w1,T.y1);
  c.textAlign='center';c.fillStyle=o.col;c.font='800 '+T.size2+'px '+LB.FONT.display;if(ls)c.letterSpacing=T.ls2+'px';
  c.fillText(o.name.toUpperCase(),T.x,T.y2);c.restore();
};
