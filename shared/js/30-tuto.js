/* ---------- Onglet Tuto : contenu partagé (décision du 8 novembre 2026, docs/decisions/2026-11-08-onglet-tuto-hub.md) ----------
   Quatre entrées, une par geste. Une entrée n'existe qu'après la première réussite du geste, puis reste (clé commune lb-tuto, liste des
   identifiants). Les gestes sont détectés ici seulement : LB.hero.stopped (16-hero.js) appelle LB.tuto.note('block' | 'dodge' | 'hold') ;
   le seul signal propre à un chapitre est 'still' (cible à ne pas esquiver laissée passer). note() écrit puis émet l'événement unique
   EV (window, detail {id}). Version 2 : animations rejouées par le moteur, à la demande (accordéon).
   LB.tuto.mount(el) monte le bloc (rendu + données), se rafraîchit à l'événement et renvoie la fonction de rendu (à rappeler au
   changement de langue). Monté pour l'instant dans le hub uniquement : aucun montage dans les menus des chapitres. */
LB.TUTO_T={ids:['block','dodge','hold','still'],ev:'lb-gesture',none:'—',
  /* mise en scène des animations (v2) : repère monde w × h, pieds du Veilleur en (hx, fy), taille CSS du canvas ; coup : départ xs, vitesse v (px/s),
     rayon orbR, hauteur oy ; bodyX = x du corps touché par le coup qui passe ; glide = durée de la glisse sur le dôme ; fade = extinction du coup
     arrêté ; melt = dissipation de l'orbe illusoire, stillR = son rayon ; boucle loop (s) ; still = décalage après l'impact de l'image fixe (prefers-reduced-motion). Les durées de geste viennent de LB.HERO_T. */
  anim:{w:340,h:226,css:272,hx:60,fy:200,xs:350,v:200,orbR:9,oy:70,bodyX:90,glide:.6,fade:.25,loop:2.6,melt:.5,stillR:17,still:{block:.04,dodge:.4,hold:.3,still:.25}}};
LB.tuto={
  /* [titre, texte] d'une entrée dans la langue courante */
  text(id){return{
    block:[LB._('Block','Bloquer'),LB._("One press, at the exact instant: the blow stops dead.","Un seul appui, à l'instant juste : le coup s'arrête net.")],
    dodge:[LB._('Dodge','Esquiver'),LB._("One press, at the exact instant: you slip out of its path.","Un seul appui, à l'instant juste : tu glisses hors de sa trajectoire.")],
    hold:[LB._('Hold','Tenir'),LB._("Keep pressing: your block holds, a dome wraps around you.","Maintiens l'appui : ton blocage tient, un dôme t'enveloppe.")],
    still:[LB._('Stand still','Rester en place'),LB._("Sometimes dodging is a misjudgment: know when to stand still.","Parfois, l'esquive est une erreur de jugement : sache rester en place.")]
  }[id]},
  seen(){try{const a=JSON.parse(LB.store.get(LB.key('tuto'),'[]'));return Array.isArray(a)?a.filter(x=>LB.TUTO_T.ids.includes(x)):[]}catch(e){return[]}},
  /* première réussite d'un geste : mémorise puis signale (une seule fois par entrée) */
  note(id){if(!LB.TUTO_T.ids.includes(id))return;const a=LB.tuto.seen();if(a.includes(id))return;a.push(id);
    LB.store.set(LB.key('tuto'),JSON.stringify(a));
    try{window.dispatchEvent(new CustomEvent(LB.TUTO_T.ev,{detail:{id}}))}catch(e){}},
  /* ---------- Version 2 : animations rejouées par le moteur, à la demande (accordéon, une seule ouverte) ----------
     Aucun canvas ni boucle tant qu'aucune entrée n'est dépliée ; un seul canvas (créé à l'ouverture, détruit à la fermeture) et une seule boucle,
     arrêtée à la fermeture, panneau masqué ou onglet caché. Scènes dessinées avec LB.drawWatcher, LB.drawBlock et LB.HERO_T (aucun timing de jeu
     nouveau). Les quatre entrées ont une scène ; 'still' utilise LB.drawOrb (shared/js/20-watcher.js, ex-Chapitre II). */
  scene:{
    block(c,u){const T=LB.TUTO_T.anim,H=LB.HERO_T.block,ti=LB.tuto._ti(),tp=ti-H.perf,a=u>=tp&&u<tp+H.act;
      LB.drawWatcher(c,T.hx,T.fy,a?'block':'idle',u,{k:Math.min(1,(u-tp)/LB.WATCHER_T.raise)});
      if(a)LB.drawBlock(c,T.hx,T.fy,u-tp,H.act);
      if(u<ti+T.fade)LB.tuto._orb(c,T.xs-T.v*Math.min(u,ti),T.fy-T.oy,u<ti?1:1-(u-ti)/T.fade)},
    dodge(c,u){const T=LB.TUTO_T.anim,H=LB.HERO_T.dodge,ti=(T.xs-T.bodyX)/T.v,tp=ti-H.perf,e=t=>t*t*(3-2*t),w=u-tp,
        k=w<0?0:w<H.act?e(w/H.act):Math.max(0,1-e((w-H.act)/H.rec));
      LB.drawWatcher(c,T.hx,T.fy,'dodgeSide',u,{k});
      LB.tuto._orb(c,T.xs-T.v*u,T.fy-T.oy,1)},
    hold(c,u){const T=LB.TUTO_T.anim,H=LB.HERO_T.hold,ti=LB.tuto._ti(),tp=ti-H.perf,a=u>=tp;
      LB.drawWatcher(c,T.hx,T.fy,a?'hold':'idle',u);
      if(a)LB.drawBlock(c,T.hx,T.fy,Math.min(u-tp,H.act),H.act,{plain:true});
      if(u<ti)LB.tuto._orb(c,T.xs-T.v*u,T.fy-T.oy,1);
      else{const ph=Math.min(1,(u-ti)/T.glide),th=-Math.PI*.9*ph,r=T.orbR;   /* glisse le long de l'ellipse du dôme */
        if(ph<1)LB.tuto._orb(c,T.hx+82+(34+r)*Math.cos(th),T.fy-76+(92+r)*Math.sin(th),1-Math.max(0,ph-.7)/.3)}}
    ,
    /* orbe illusoire (LB.drawOrb, partagée avec le Chapitre II) : arrive, le Veilleur ne bouge pas (idle), l'orbe se dissipe devant lui */
    still(c,u){const T=LB.TUTO_T.anim,ti=(T.xs-T.bodyX)/T.v,p=Math.max(0,Math.min(1,(u-ti)/T.melt));
      LB.drawWatcher(c,T.hx,T.fy,'idle',u);
      if(p<1){const x=T.xs-T.v*Math.min(u,ti);LB.drawOrb(c,x,T.fy-T.oy,T.stillR*(1-p),{real:false,ch:false,t:u,dash:1-p})}}
  },
  _ti(){const T=LB.TUTO_T.anim;return(T.xs-T.hx-82-34-T.orbR)/T.v},   /* instant où le coup touche le bord de la garde */
  _orb(c,x,y,al){const R=LB.TUTO_T.anim.orbR;c.save();c.globalAlpha=Math.max(0,al);const g=c.createRadialGradient(x,y,1,x,y,R*2.4);
    g.addColorStop(0,'rgba(255,244,214,1)');g.addColorStop(.35,'rgba(255,170,90,.9)');g.addColorStop(1,'rgba(255,120,60,0)');
    c.fillStyle=g;c.beginPath();c.arc(x,y,R*2.4,0,6.283);c.fill();c.restore()},
  frame(id,c,u){const T=LB.TUTO_T.anim;c.clearRect(0,0,T.w,T.h);c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=2;
    c.beginPath();c.moveTo(0,T.fy+1);c.lineTo(T.w,T.fy+1);c.stroke();LB.tuto.scene[id](c,u)},
  _a:null,   /* animation ouverte : {id, cvs, ctx, raf, t0} ; une seule à la fois */
  open(id,host){LB.tuto.stop();const T=LB.TUTO_T.anim,cvs=document.createElement('canvas'),d=LB.dpr,k=T.css/T.w;
    cvs.width=Math.round(T.w*k*d);cvs.height=Math.round(T.h*k*d);cvs.style.width=T.css+'px';cvs.style.height=Math.round(T.h*k)+'px';cvs.setAttribute('aria-hidden','true');
    host.appendChild(cvs);const c=cvs.getContext('2d'),a=LB.tuto._a={id,cvs,c,raf:0,t0:0,still:false};c.setTransform(k*d,0,0,k*d,0,0);
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){a.still=true;LB.tuto.frame(id,c,LB.tuto._still(id));return}   // image fixe
    LB.tuto._run()},
  _still(id){const T=LB.TUTO_T.anim,ti=id==='dodge'||id==='still'?(T.xs-T.bodyX)/T.v:LB.tuto._ti();return ti+T.still[id]},
  _run(){const a=LB.tuto._a,T=LB.TUTO_T.anim;if(!a||a.raf||document.hidden)return;
    const f=ts=>{if(LB.tuto._a!==a)return;
      if(!a.cvs.getClientRects().length){LB.tuto.stop();return}   // panneau masqué : on ferme tout
      if(!a.t0)a.t0=ts;LB.tuto.frame(a.id,a.c,((ts-a.t0)/1000)%T.loop);a.raf=requestAnimationFrame(f)};
    a.raf=requestAnimationFrame(f)},
  /* ferme l'animation ouverte : boucle arrêtée, canvas détruit, ligne repliée */
  stop(){const a=LB.tuto._a;if(!a)return;LB.tuto._a=null;if(a.raf)cancelAnimationFrame(a.raf);a.cvs.remove();
    const li=a.cvs.closest&&a.cvs.closest('li');if(li){const b=li.querySelector('button');if(b)b.setAttribute('aria-expanded','false');li.classList.remove('lbt-open')}},
  toggle(id,li){const was=LB.tuto._a&&LB.tuto._a.id===id;LB.tuto.stop();if(was)return;
    li.querySelector('button').setAttribute('aria-expanded','true');li.classList.add('lbt-open');LB.tuto.open(id,li.querySelector('.lbt-anim'))},
  render(el){const a=LB.tuto.seen(),cur=LB.tuto._a&&LB.tuto._a.cvs.getClientRects().length?LB.tuto._a.id:null;LB.tuto.stop();el.textContent='';
    for(const id of LB.TUTO_T.ids){const li=document.createElement('li');li.dataset.id=id;
      if(a.includes(id)){const t=LB.tuto.text(id);
        if(LB.tuto.scene[id]){
          const b=document.createElement('button'),h=document.createElement('span'),p=document.createElement('span'),ic=document.createElement('span'),sr=document.createElement('span'),an=document.createElement('div');
          b.type='button';b.setAttribute('aria-expanded','false');h.className='lbt-h';p.className='lbt-p';h.textContent=t[0];p.textContent=t[1];
          ic.className='lbt-ic';ic.setAttribute('aria-hidden','true');ic.textContent='▶';
          sr.className='lbt-sr';sr.textContent=LB._('Watch the animation','Voir l’animation');
          const tx=document.createElement('span');tx.className='lbt-tx';tx.append(h,p,sr);b.append(tx,ic);an.className='lbt-anim';li.append(b,an);
          b.addEventListener('click',()=>LB.tuto.toggle(id,li))}
        else{const h=document.createElement('h3'),p=document.createElement('p');h.textContent=t[0];p.textContent=t[1];li.append(h,p)}}
      else{li.className='lbt-none';li.setAttribute('aria-hidden','true');li.textContent=LB.TUTO_T.none}   // rien ne se déduit à l'avance
      el.appendChild(li)}
    if(cur){const li=el.querySelector('li[data-id="'+cur+'"]');if(li&&li.querySelector('button'))LB.tuto.toggle(cur,li)}},   // la langue change : la scène ouverte reste
  mount(el){
    if(!document.getElementById('lbTutoCss')){const s=document.createElement('style');s.id='lbTutoCss';
      s.textContent='.lbtuto{list-style:none;margin:0;padding:0;display:grid;gap:12px}.lbtuto li{display:grid;gap:2px}'
        +'.lbtuto h3,.lbtuto .lbt-h{margin:0;font-family:var(--font-display,inherit);font-weight:700;font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:var(--lantern,#ffd28a)}'
        +'.lbtuto p,.lbtuto .lbt-p{margin:0;font-size:15px;line-height:1.4;color:var(--fg,#eee)}.lbtuto .lbt-none{color:var(--muted,#888);font-size:18px;line-height:1.4}'
        +'.lbtuto button{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;position:relative;width:100%;min-height:44px;cursor:pointer;-webkit-tap-highlight-color:transparent}'
        +'.lbtuto button:focus-visible{outline:2px solid var(--lantern,#ffd28a);outline-offset:2px}'
        +'.lbtuto .lbt-tx{flex:1;display:grid;gap:2px;text-align:left}.lbtuto .lbt-h,.lbtuto .lbt-p{display:block}'
        +'.lbtuto .lbt-ic{flex:none;font-size:14px;color:var(--lantern,#ffd28a);transition:transform .15s}.lbtuto .lbt-open .lbt-ic{transform:rotate(90deg)}'
        +'.lbtuto .lbt-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
        +'.lbtuto .lbt-anim canvas{display:block;max-width:100%;height:auto;margin:6px auto 0}';
      document.head.appendChild(s);
      document.addEventListener('visibilitychange',()=>{const a=LB.tuto._a;if(!a)return;if(document.hidden){if(a.raf){cancelAnimationFrame(a.raf);a.raf=0}}else if(!a.raf&&!a.still)LB.tuto._run()})}
    el.classList.add('lbtuto');const r=()=>LB.tuto.render(el);r();window.addEventListener(LB.TUTO_T.ev,r);return r}
};
