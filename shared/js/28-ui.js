/* ---------- Cadre commun des chapitres (session menu/common, 1er novembre 2026) ----------
   LB.menu (menu de la série), LB.gate (écran de démarrage), LB.card (cartes #ov), LB.pause, LB.input (entrées), LB.hud
   (barres, nom du boss, sourcil, frise), LB.cue (repère d'aide), LB.help (case « Aide »), LB.fs (plein écran), LB.MENU_T.
   Référence par élément (docs/COMMUN.md § 1) : le Chapitre I pour ce que le joueur voit (structure, ordre du titre, polices,
   tailles, écran de démarrage, boutons de rejeu, Entrée / Espace au menu, repère d'aide), le Chapitre II pour l'outillage
   (carte déclarative, relâchement, zones sûres). Le chapitre ne déclare qu'une table CHAPTER (docs/COMMUN.md § 3.1) :
   n, id, title, color (code couleur), color2 (clair : ligne du chapitre, note de l'Épreuve), rgb (halos), menu {bg, glowA,
   titleA, particles, t}, trial {name}, player, tag? (accroche), how? (mode d'emploi), next {n, title, col, rgb, hover, open?}, help {offer?},
   et les fonctions trialOpen(), endSeen(), best(n), fmt(t). Un texte est une fonction qui rend la chaîne déjà traduite
   (le chapitre y appelle sa fonction de texte) ou un objet {en, fr}. Le style (LB.UI_CSS) est créé ici avec les couleurs du chapitre.
   Les textes communs (difficultés, sous-titres, boutons) sont ici, en LB._(en, fr). Aucun mot d'annonce. */
/* Version du jeu, une seule pour la série, affichée au menu (« v1.0.0 ») : valeur du Chapitre I (CHANGELOG.md v1.0.0). */
LB.VERSION='1.0.0';
/* Règles de l'Épreuve, identiques dans tous les chapitres (texte d'origine du Chapitre I) : note du menu. Le nom de l'Épreuve est propre au chapitre. */
LB.TRIAL_RULES=[()=>LB._('The three phases in a row, with no pause and no visual help.',"Les trois phases d'affilée, sans pause et sans aide visuelle."),
 ()=>LB._('You recover 1 life between phases.','Tu récupères 1 PV entre les phases.'),
 ()=>LB._('A single death sends you back to Phase I.','Une seule mort te renvoie à la phase I.'),
 ()=>LB._('One stats table at the end of the run.',"Un seul tableau de stats à la fin de la run.")];
LB.ROMAN=['','I','II','III','IV','V','VI','VII'];
/* « Chapitre N · Titre » et son cadenas : libellés communs (le chapitre ne donne que n et title) */
LB.chapterName=(n,title)=>LB._('Chapter '+LB.ROMAN[n]+' · '+title,'Chapitre '+LB.ROMAN[n]+' · '+title);
LB.chapterLock=n=>LB._('🔒 Chapter '+LB.ROMAN[n],'🔒 Chapitre '+LB.ROMAN[n]);
LB.MENU_T={
  /* placement commun à tous les chapitres (aucune position propre à un chapitre) : largeur de la carte et des difficultés, lignes réservées
     de l'accroche et du mode d'emploi (px ; réservées même si le chapitre n'en a pas, pour que les boutons restent au même endroit) */
  cardW:'min(94vw,580px)',btnFs:'min(18px,2.8vw)',   // police du nom d'une difficulté : ne passe jamais à la ligne (4 colonnes jusqu'à 480 px)
  nextW:'min(100%,366px)',nextFs:'clamp(11px,3.7vw,15px)',tagH:42,howH:18,   // largeur adaptable de la carte, largeur du bouton du chapitre suivant et sa police (ne passe jamais à la ligne)
  btnH:44,btnHLow:34,     // hauteur mini des boutons du haut du menu (Intro, Outro, plein écran) : écran tactile, puis paysage bas
  raise:'-9vh',raiseLow:'-4vh',raiseMinH:700,tinyH:340,          // remontée du titre (paysage bas : raiseLow)
  glow:3.2,glowMin:.55,blink:5,          // scintillement des braises / de la mer (.lava), clignement des yeux (.eye)
  /* particules du menu : nombre, durée [min, + aléa] s, avance max s, taille [min, + aléa] px, dérive x px, montée, opacité au pic */
  embers:{id:'mEmbers',cls:'mem',key:'mrise',n:26,dur:[5,7],delay:10,size:[2,3],dx:160,rise:'-80vh',peak:.9,w:4,col:'#ffb060',glow:'0 0 8px 2px rgba(255,122,43,.8)'},
  spray:{id:'mSnow',cls:'msn',key:'mfall',n:34,dur:[7,8],delay:12,size:[1.5,2.5],dx:120,rise:'-45vh',peak:.7,w:3,col:'#e8f8ff',glow:'0 0 6px 1px rgba(159,242,255,.6)'}
};
LB.tx=o=>o==null?'':typeof o==='function'?o():typeof o==='string'?o:LB._(o.en,o.fr);
LB.UI_CSS=C=>{const M=Object.assign({},LB.MENU_T,(C.menu&&C.menu.t)||{}),P=M[C.menu.particles],c=C.color,c2=C.color2,rgb=C.rgb,N=C.next;
 return '.bar span i{font-style:normal}\n'+
 '.card .stats{color:var(--fg);font-variant-numeric:tabular-nums}\n'+
 '.card .how2{color:var(--fg);font-size:13px;border-left:3px solid '+c+';padding-left:10px}\n'+
 '.ov.menu{position:fixed;inset:0;z-index:50;padding:24px;place-items:start center;background:radial-gradient(ellipse 80% 70% at 50% 110%,rgba('+rgb+','+C.menu.glowA+'),transparent 62%),'+C.menu.bg+'}\n'+
 '.mem-wrap{position:absolute;inset:0;overflow:hidden;pointer-events:none}\n'+
 '.mscene{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}\n'+
 '.mscene .eye{animation:mblink '+M.blink+'s infinite}\n'+
 '.mscene .lava{animation:mglow '+M.glow+'s ease-in-out infinite alternate}\n'+
 '.'+P.cls+'{position:absolute;bottom:-10px;width:'+P.w+'px;height:'+P.w+'px;border-radius:50%;background:'+P.col+';box-shadow:'+P.glow+';opacity:0;pointer-events:none;animation:'+P.key+' linear infinite}\n'+
 '@keyframes '+P.key+'{0%{transform:translate(0,0);opacity:0}10%{opacity:'+P.peak+'}100%{transform:translate(var(--dx),'+P.rise+');opacity:0}}\n'+
 '@keyframes mglow{from{opacity:'+M.glowMin+'}to{opacity:1}}\n'+
 '@keyframes mblink{0%,92%,100%{opacity:1}95%{opacity:.15}}\n'+
 '@media (prefers-reduced-motion:reduce){.'+P.cls+',.mscene .eye,.mscene .lava{animation:none}.'+P.cls+'{display:none}}\n'+
 '.mcard{margin-block:auto;position:relative;z-index:1;display:grid;padding:8px 0;gap:12px;justify-items:center;text-align:center;width:'+M.cardW+'}\n'+
 '.mcard h2{margin:0;font-family:var(--font-display);font-weight:800;font-size:clamp(40px,9vw,88px);line-height:.92;letter-spacing:.01em;text-wrap:balance;color:var(--fg);text-shadow:0 0 40px rgba('+rgb+','+C.menu.titleA+')}\n'+
 '.mcard h2 span{color:'+c+';text-shadow:0 0 40px rgba('+rgb+',.8)}\n'+
 '.mcard h2 i{font-style:normal;color:'+LB.BRAND.bell+'}\n'+
 '.ov.menu .mcard .eyebrow,.ov.menu .mcard h2,.ov.menu .mcard .tag{transform:translateY('+M.raise+')}\n'+
 '@media (max-height:'+M.raiseMinH+'px){.ov.menu .mcard .eyebrow,.ov.menu .mcard h2,.ov.menu .mcard .tag{transform:none}}   /* écran bas : pas de remontée, le titre ne sort jamais de l\'écran */\n'+
 '.mcard .eyebrow.chap{font-size:16px;letter-spacing:.2em;color:'+c2+';margin-top:-4px}\n'+
 '.mcard .tag{margin:0;color:var(--muted);font-size:14px;max-width:46ch;min-height:'+M.tagH+'px}\n'+
 '.mcard .how{margin:0;font-size:12px;color:var(--muted);min-height:'+M.howH+'px}\n'+
 '.gate{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:rgba(8,6,13,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}\n'+
 '.gate[hidden]{display:none}\n'+
 '.gate .btn{padding:14px 44px;font-size:24px;letter-spacing:.12em;box-shadow:0 0 36px rgba('+rgb+',.45)}\n'+
 '.mcard .tnote{width:100%;max-width:420px;box-sizing:border-box;text-align:left;padding:12px 16px;background:rgba(22,17,29,.8);border:1px solid var(--line);border-left:3px solid '+c+';font-size:13px;line-height:1.45;color:var(--muted)}\n'+
 '.mcard .tnote[hidden]{display:none}\n'+
 '.mcard .tnote b{display:block;margin-bottom:6px;font-family:var(--font-display);font-size:18px;letter-spacing:.06em;text-transform:uppercase;color:'+c2+'}\n'+
 '.mcard .tnote ul{margin:0;padding-left:18px;display:grid;gap:3px}\n'+
 '.btn.big{font-size:24px;padding:12px 38px}\n'+
 '.mph{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;width:100%}\n'+
 '.mph button{min-width:0;display:grid;gap:0;justify-items:center;padding:8px 6px;background:rgba(22,17,29,.8);border:1px solid var(--line);color:var(--fg);cursor:pointer;font:inherit}\n'+
 '.mph button b{font-family:var(--font-display);font-weight:800;font-size:'+M.btnFs+';line-height:1;white-space:nowrap;color:'+c+';text-transform:uppercase;letter-spacing:.05em}\n'+
 '.mph button span{font-size:12px;color:var(--muted)}\n'+
 '.mph button:hover:not(:disabled){border-color:'+c+';background:rgba('+rgb+',.1)}\n'+
 '.mph button[aria-pressed="true"]{border-color:'+c+';background:rgba('+rgb+',.16)}\n'+
 '.mph button:disabled{opacity:.45;cursor:not-allowed}\n'+
 '.mph[hidden]{display:none}\n'+
 '@media (max-width:560px){.mcard .tag,.mcard .how{display:none}.mcard{gap:8px}.mcard h2{font-size:34px}.btn.big{font-size:20px;padding:8px 26px}}\n'+
 '@media (max-width:480px){.mph{gap:6px;grid-template-columns:repeat(2,minmax(0,1fr));max-width:340px}.mph button b{font-size:17px;letter-spacing:.04em}.mph button span{font-size:11px}.ov.menu{padding:16px 12px}.mcard h2{font-size:clamp(34px,11vw,48px)}}\n'+
 '@media (max-height:520px) and (orientation:landscape){.ov.menu{padding-block:8px}.mcard{gap:6px;padding:0}.mcard .tnote{padding:6px 12px;font-size:11px;line-height:1.3}.mcard .tnote b{margin-bottom:2px;font-size:14px}.mcard .tnote ul{gap:1px}.ver{margin:0}.ov.menu .mcard .tag,.ov.menu .mcard .how{display:none}.ov.menu .mcard .eyebrow,.ov.menu .mcard h2{transform:none}.mcard h2{font-size:clamp(30px,9vh,52px)}}\n'+
 '@media (max-height:'+M.tinyH+'px) and (orientation:landscape){.ov.menu{padding-block:4px}.mcard{gap:4px;padding:0}.mcard .tnote{line-height:1.2}.mcard h2{font-size:26px;line-height:.85}.mcard .eyebrow.chap{font-size:13px;margin-top:0}.mcard .tnote{padding:4px 10px}.mcard .tnote b{font-size:12px}.mcard .tnote ul{padding-left:14px}}\n'+
 '.fsm{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));left:max(12px,env(safe-area-inset-left,0px));z-index:3;background:rgba(10,7,16,.6)}.fsm span{font-size:13px}@media (max-width:480px){.fsm span{display:none}}\n'+
 '.fsb[hidden]{display:none}\n'+
 '#mphT{grid-template-columns:repeat(3,minmax(0,1fr));max-width:440px}\n'+
 '@media (max-width:480px){#mphT{grid-template-columns:repeat(2,minmax(0,1fr));max-width:340px}#mphT #mBackT{grid-column:1/-1}}\n'+
 '@media (pointer:coarse){.fsb{display:none!important}#introBtn{top:calc(12px + env(safe-area-inset-top,0px))!important}#outroBtn{top:calc(56px + env(safe-area-inset-top,0px))!important}}\n'+
 '.mfoot{display:flex;width:100%;justify-content:center;margin-top:2px}\n'+
 '.mlink{display:flex;align-items:center;justify-content:center;gap:8px;width:'+M.nextW+';box-sizing:border-box;white-space:nowrap;font-family:var(--font-display);font-weight:700;font-size:'+M.nextFs+';letter-spacing:.08em;text-transform:uppercase;color:'+N.col+';text-decoration:none;border:1px solid rgba('+N.rgb+',.5);padding:7px 14px;background:rgba(4,22,24,.55)}\n'+
 '.mlink{font-family:inherit;cursor:default}\n'+
 '.ver{margin:6px 0 0;font-size:11px;letter-spacing:.14em;color:var(--muted);opacity:.6;text-align:center}\n'+
 '.mlink.lock{color:var(--muted);border-color:var(--line);background:rgba(10,7,16,.5);opacity:.75}\n'+
 '.mlink.lock:hover{background:rgba(10,7,16,.5);color:var(--muted)}\n'+
 '.mph button[aria-disabled=true]{opacity:.45;cursor:not-allowed}\n'+
 '.mlink:hover{background:rgba('+N.rgb+',.18);color:'+N.hover+'}\n'+
 '.mlink small{font-size:.7333em;letter-spacing:.12em;color:var(--muted);border:1px solid var(--line);padding:1px .55em}\n'+
 '#introBtn{position:absolute;top:calc(56px + env(safe-area-inset-top,0px));left:max(12px,env(safe-area-inset-left,0px));z-index:3;background:rgba(10,7,16,.6)}\n'+
 '#outroBtn{position:absolute;top:calc(100px + env(safe-area-inset-top,0px));left:max(12px,env(safe-area-inset-left,0px));z-index:3;background:rgba(10,7,16,.6)}\n'+
 '.langs{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:max(12px,env(safe-area-inset-right,0px));display:flex;gap:6px;z-index:3}\n'+
 '.langs button{font-family:inherit;font-weight:700;font-size:13px;line-height:1;letter-spacing:.12em;padding:7px 11px;min-width:42px;color:var(--fg);background:rgba(10,7,16,.6);border:1px solid rgba(241,227,207,.3);border-radius:4px;cursor:pointer}\n'+
 '.langs button[aria-pressed="true"]{border-color:'+c+';background:rgba('+rgb+',.22);color:#fff}\n'+
 '.langs button:focus-visible{outline:2px solid '+c+';outline-offset:2px}\n'+
 '@media (pointer:coarse){.langs button{min-height:40px}.ov.menu .mbtn{min-height:'+M.btnH+'px}}\n'+
 '@media (max-height:520px) and (orientation:landscape){.ov.menu .mbtn{min-height:'+M.btnHLow+'px;padding-block:2px}}\n'};
LB.ui=(()=>{
  const $=id=>document.getElementById(id),mk=(tag,attrs,html)=>{const e=document.createElement(tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;return e};
  let styled=false;
  /* style commun, une seule fois, avec les couleurs du chapitre (après le style de la page : les règles du menu l'emportent comme avant) */
  function style(C){if(styled)return;styled=true;const st=document.createElement('style');st.textContent=LB.UI_CSS(C);document.head.appendChild(st)}
  return{$,mk,style};
})();

/* ---------- LB.card : carte de l'arène (#ov), déclarative ----------
   show({eye, title, stats, table, desc, how, go, onGo, go2, onGo2, clear}) ; table = lignes [libellé, valeur, record?].
   hide(), visible(), go() (le bouton principal), el (éléments). Le bouton reçoit le focus (Entrée / Espace le pressent). */
LB.card=(()=>{
  const el={};let onGo=null,onGo2=null;
  function mount(stage,before){
    if(el.ov)return el;
    const ov=LB.ui.mk('div',{class:'ov',id:'ov',hidden:''},'<div class="card"><p class="eyebrow" id="ovEye"></p><h2 id="ovTitle"></h2><p class="stats" id="ovStats" hidden></p><div class="rtab" id="ovTable" hidden></div><p id="ovDesc"></p><p class="how2" id="ovHow" hidden></p><button class="btn" id="go" type="button"></button><button class="btn ghost" id="go2" type="button" hidden></button></div>');
    stage.insertBefore(ov,before||null);
    Object.assign(el,{ov,eye:ov.querySelector('#ovEye'),title:ov.querySelector('#ovTitle'),stats:ov.querySelector('#ovStats'),table:ov.querySelector('#ovTable'),
      desc:ov.querySelector('#ovDesc'),how:ov.querySelector('#ovHow'),go:ov.querySelector('#go'),go2:ov.querySelector('#go2')});
    el.go.addEventListener('click',()=>{if(onGo)onGo()});
    el.go2.addEventListener('click',()=>{if(onGo2)onGo2()});
    return el;
  }
  function table(rows){el.table.innerHTML='';for(const r of rows){const d=document.createElement('div');if(r[2])d.className='rec';d.innerHTML='<small></small><b></b>';d.firstChild.textContent=r[0];d.lastChild.textContent=r[1];el.table.appendChild(d)}}
  function show(o){
    el.eye.textContent=o.eye||'';el.title.textContent=o.title||'';
    el.stats.hidden=!o.stats;el.stats.textContent=o.stats||'';
    el.table.hidden=!o.table;el.table.innerHTML='';if(o.table)table(o.table);
    el.desc.textContent=o.desc||'';el.how.hidden=!o.how;el.how.textContent=o.how||'';
    el.go.textContent=o.go||'';onGo=o.onGo||null;
    el.go2.hidden=!o.go2;el.go2.textContent=o.go2||'';onGo2=o.onGo2||null;
    el.ov.classList.toggle('clear',!!o.clear);el.ov.hidden=false;
    try{el.go.focus({preventScroll:true})}catch(e){}
  }
  return{el,mount,show,hide(){if(el.ov)el.ov.hidden=true},visible(){return!!el.ov&&!el.ov.hidden},go(){if(onGo)onGo()},setGo(f){onGo=f},setGo2(f){onGo2=f}};
})();

/* ---------- LB.pause : carte de pause (Reprendre, Menu) ---------- */
LB.pause=(()=>{
  let ov=null,h={};
  function mount(stage,after,hh){
    h=hh||{};if(ov)return ov;
    ov=LB.ui.mk('div',{class:'ov',id:'pause',hidden:''},'<div class="card"><p class="eyebrow">Pause</p><h2 id="pTitle">Fight paused</h2><button class="btn" id="pResume" type="button">Resume</button><button class="btn ghost" id="pMenu" type="button">Menu</button></div>');
    stage.insertBefore(ov,after?after.nextSibling:null);
    ov.querySelector('#pResume').addEventListener('click',()=>{if(h.onResume)h.onResume()});
    ov.querySelector('#pMenu').addEventListener('click',()=>{if(h.onMenu)h.onMenu()});
    return ov;
  }
  function lang(){if(!ov)return;ov.querySelector('#pTitle').textContent=LB._('Fight paused','Combat en pause');ov.querySelector('#pResume').textContent=LB._('Resume','Reprendre')}
  return{mount,lang,bind(hh){h=hh},show(){ov.hidden=false;try{ov.querySelector('#pResume').focus({preventScroll:true})}catch(e){}},hide(){if(ov)ov.hidden=true},
    visible(){return!!ov&&!ov.hidden},resume(){if(h.onResume)h.onResume()},get el(){return ov}};
})();

/* ---------- LB.fs : plein écran (boutons .fsb : en-tête et menu) ; masqués si l'API manque (iPhone) ---------- */
LB.fs={bind(){const de=document.documentElement,rq=de.requestFullscreen||de.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen,
  isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement),btns=document.querySelectorAll('.fsb');
 if(!rq){btns.forEach(b=>b.hidden=true);return}
 btns.forEach(b=>{if(b.dataset.fs)return;b.dataset.fs='1';b.addEventListener('click',e=>{e.currentTarget.blur();try{const r=isFs()?ex.call(document):rq.call(de);if(r&&r.catch)r.catch(()=>{})}catch(x){}})})},
 lang(){document.querySelectorAll('.fsb').forEach(b=>{const t=LB._('Fullscreen','Plein écran');b.setAttribute('aria-label',t);b.title=t})}};

/* ---------- LB.gate : écran de démarrage (Commencer + langues) ; le clic débloque le son (comme au Chapitre I) ---------- */
LB.gate=(()=>{
  let g=null,h={};
  function mount(stage,before,hh){
    h=hh||{};if(g)return g;
    g=LB.ui.mk('div',{class:'gate',id:'gate'},'<div class="langs" id="gateLangs" role="group" aria-label="Language">'+LB.LANGS.map(l=>'<button type="button" data-lang="'+l+'" aria-pressed="false">'+l.toUpperCase()+'</button>').join('')+'</div><button class="btn big" id="gateBtn" type="button">Start</button>');
    stage.insertBefore(g,before||null);
    g.querySelector('#gateBtn').addEventListener('click',()=>{LB.audio.ensure();g.hidden=true;try{document.querySelector('#menu [data-diff=normal]').focus({preventScroll:true})}catch(e){}if(h.onStart)h.onStart()});
    return g;
  }
  return{mount,visible(){return!!g&&!g.hidden},focus(){try{g.querySelector('#gateBtn').focus({preventScroll:true})}catch(e){}},get el(){return g}};
})();

/* ---------- LB.menu : menu de la série ----------
   mount(C, h) : construit autour de la scène SVG du chapitre (déjà dans #menu, classe .mscene) les particules, « ▶ Intro »,
   « ▶ Outro » (après la vraie fin), plein écran, langues, puis la carte : « Lumen|bell », la ligne du chapitre dessous, accroche,
   Reprendre, les quatre difficultés, le sous-menu de l'Épreuve (Normal, Difficile, Retour) et sa note, mode d'emploi, version,
   chapitre suivant ; aussi l'écran de démarrage (LB.gate), la carte (LB.card) et la pause (LB.pause) s'ils manquent.
   h : {onDiff(dk), onIntro(), onOutro(), onResume(), onLang(), onStart()}. show(reprendre), hide(), visible(), lang(),
   update() (verrou de l'Épreuve, records, « ▶ Outro », chapitre suivant), trial(on). */
LB.menu=(()=>{
  let C=null,h={},m=null,card=null;const $=LB.ui.$;
  const DK=['easy','normal','hard'];
  const TX={easy:()=>LB._('Easy','Facile'),normal:()=>LB._('Normal','Normal'),hard:()=>LB._('Hard','Difficile'),
    sEasy:()=>LB._('Breathe','Respire'),sNormal:()=>LB._('Fair and square','À la loyale'),sHard:()=>LB._('No mercy','Sans pitié'),sTrial:()=>LB._('Ultimate challenge','Challenge ultime')};
  function particles(){const M=Object.assign({},LB.MENU_T,(C.menu&&C.menu.t)||{}),P=M[C.menu.particles],w=LB.ui.mk('div',{class:'mem-wrap',id:P.id,'aria-hidden':'true'});
    for(let i=0;i<P.n;i++){const e=document.createElement('i');e.className=P.cls;e.style.left=(Math.random()*100)+'%';e.style.setProperty('--dx',((Math.random()-.5)*P.dx)+'px');
      e.style.animationDuration=(P.dur[0]+Math.random()*P.dur[1])+'s';e.style.animationDelay=(-Math.random()*P.delay)+'s';const z=P.size[0]+Math.random()*P.size[1];e.style.width=e.style.height=z+'px';w.appendChild(e)}
    return w}
  function mount(CH,hh){
    C=CH;h=hh||{};if(m)return m;
    LB.ui.style(C);
    m=$('menu');const stage=m.parentNode;
    if(!LB.card.el.ov)LB.card.mount(stage,m);
    LB.gate.mount(stage,m,{onStart:()=>{if(h.onStart)h.onStart()}});
    if(!LB.pause.el)LB.pause.mount(stage,m);
    m.appendChild(particles());
    m.appendChild(LB.ui.mk('button',{type:'button',class:'mbtn',id:'introBtn'},'▶ Intro'));
    m.appendChild(LB.ui.mk('button',{type:'button',class:'mbtn',id:'outroBtn',hidden:''},'▶ Outro'));
    m.appendChild(LB.ui.mk('button',{type:'button',class:'mbtn fsb fsm','aria-label':'Fullscreen',title:'Fullscreen'},'⛶ <span>Fullscreen</span>'));
    m.appendChild(LB.ui.mk('div',{class:'langs',id:'langs',role:'group','aria-label':'Language'},LB.LANGS.map(l=>'<button type="button" data-lang="'+l+'" aria-pressed="false">'+l.toUpperCase()+'</button>').join('')));
    const b=(dk,pr)=>'<button type="button" data-diff="'+dk+'"'+(pr?' aria-pressed="true"':'')+'><b></b><span></span></button>';
    card=LB.ui.mk('div',{class:'mcard'},'<h2><span>Lumen</span><i>bell</i></h2><p class="eyebrow chap" id="mEye"></p><p class="tag"></p>'+
      '<button class="btn ghost" id="mResume" type="button" hidden>Resume</button>'+
      '<div class="mph" id="mphM" role="group" aria-label="Choose difficulty">'+b('easy')+b('normal',1)+b('hard')+b('trial')+'</div>'+
      '<div class="mph" id="mphT" role="group" aria-label="Trial" hidden>'+b('tn')+b('th')+'<button type="button" id="mBackT"><b></b><span></span></button></div>'+
      '<div class="tnote" id="trialNote" hidden><b></b><ul>'+LB.TRIAL_RULES.map(()=>'<li></li>').join('')+'</ul></div>'+
      '<p class="how"></p><p class="ver" aria-label="Version '+LB.VERSION+'">v'+LB.VERSION+'</p>'+
      '<div class="mfoot"><button type="button" class="mlink" id="mNext" aria-disabled="true"><span class="nm"></span> <small class="soon"></small></button></div>');
    m.appendChild(card);
    /* scène : cadrée sur le bas en paysage, entière en portrait (comme au Chapitre I) */
    const sv=m.querySelector('.mscene');if(sv){const fit=()=>sv.setAttribute('preserveAspectRatio',innerWidth/innerHeight<1.2?'xMidYMax meet':'xMidYMax slice');fit();addEventListener('resize',fit)}
    m.querySelectorAll('.mph button').forEach(bt=>bt.addEventListener('click',()=>{
      if(bt.disabled||!bt.dataset.diff)return;
      if(bt.dataset.diff==='trial'&&!C.trialOpen()){bt.blur();return}   /* verrouillée : aucun message, le cadenas suffit */
      if(bt.dataset.diff==='trial'){trial(true);return}
      m.querySelectorAll('.mph button').forEach(o=>o.setAttribute('aria-pressed',String(o===bt)));
      if(h.onDiff)h.onDiff(bt.dataset.diff);
    }));
    $('mBackT').addEventListener('click',()=>trial(false));
    $('mResume').addEventListener('click',()=>{if(h.onResume)h.onResume()});
    $('introBtn').addEventListener('click',e=>{e.currentTarget.blur();if(h.onIntro)h.onIntro()});
    $('outroBtn').addEventListener('click',e=>{e.currentTarget.blur();if(h.onOutro)h.onOutro()});
    $('mNext').addEventListener('click',e=>e.currentTarget.blur());   /* chapitre suivant : « À venir » suffit, aucun message */
    document.querySelectorAll('#langs button,#gateLangs button').forEach(bt=>bt.addEventListener('click',()=>{LB.lang.set(bt.dataset.lang);lang();if(h.onLang)h.onLang();bt.blur()}));
    LB.fs.bind();
    lang();
    return m;
  }
  /* records de l'Épreuve, verrou, « ▶ Outro », chapitre suivant */
  function update(){if(!m)return;
    for(const n of ['tn','th']){const sp=m.querySelector('#mphT [data-diff='+n+'] span'),v=+C.best(n)||0;sp.textContent=v?'🏆 '+C.fmt(v):LB._('No record yet','Pas encore de record')}
    const ok=C.endSeen(),tok=C.trialOpen(),tb=m.querySelector('#mphM [data-diff=trial]'),nm=LB.tx(C.trial.name);
    $('outroBtn').hidden=!ok;
    tb.setAttribute('aria-disabled',String(!tok));   /* Épreuve : ouverte pendant les tests (TRIAL_OPEN), sinon débloquée par la vraie fin */
    tb.querySelector('b').textContent=tok?nm:'🔒 '+nm;tb.querySelector('span').textContent=tok?TX.sTrial():LB._('To unlock','À débloquer');
    {const b=$('mNext'),op=!!C.next.open&&C.next.open();   /* chapitre suivant : toujours non cliquable ; cadenas tant qu'il n'est pas ouvert */
     b.classList.toggle('lock',!op);b.querySelector('.nm').textContent=op?LB.chapterName(C.next.n,C.next.title):LB.chapterLock(C.next.n);b.querySelector('.soon').textContent=LB._('Coming soon','À venir')}
  }
  function lang(){if(!m)return;
    document.documentElement.lang=LB.lang.cur;
    update();
    $('mEye').textContent=LB.chapterName(C.n,C.title);
    m.querySelector('.mcard .tag').textContent=LB.tx(C.tag);
    $('mResume').textContent=LB._('Resume','Reprendre');
    const gb=$('gateBtn');if(gb)gb.textContent=LB._('Start','Commencer');
    for(const dk of DK){const bt=m.querySelector('#mphM [data-diff='+dk+']');bt.querySelector('b').textContent=TX[dk]();bt.querySelector('span').textContent=TX['s'+dk[0].toUpperCase()+dk.slice(1)]()}
    m.querySelector('#mphT [data-diff=tn] b').textContent=TX.normal();m.querySelector('#mphT [data-diff=th] b').textContent=TX.hard();
    $('mBackT').querySelector('b').textContent=LB._('‹ Back','‹ Retour');$('mBackT').querySelector('span').textContent=LB._('Difficulties','Difficultés');
    $('trialNote').querySelector('b').textContent=LB.tx(C.trial.name);
    $('trialNote').querySelectorAll('li').forEach((li,i)=>li.textContent=LB.TRIAL_RULES[i]());
    m.querySelector('.mcard .how').textContent=LB.tx(C.how);
    m.querySelector('.fsm span').textContent=LB._('Fullscreen','Plein écran');
    $('introBtn').textContent='▶ Intro';$('outroBtn').textContent='▶ Outro';
    $('mphM').setAttribute('aria-label',LB._('Choose difficulty','Choisir la difficulté'));$('mphT').setAttribute('aria-label',LB.tx(C.trial.name));
    document.querySelectorAll('#langs,#gateLangs').forEach(e=>e.setAttribute('aria-label',LB._('Language','Langue')));
    document.querySelectorAll('#langs button,#gateLangs button').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.lang===LB.lang.cur)));
    LB.fs.lang();LB.pause.lang();
  }
  function trial(on){update();$('mphM').hidden=on;$('mphT').hidden=!on;$('trialNote').hidden=!on;
    try{(on?$('mphT').querySelector('button'):$('mphM').querySelector('[data-diff=normal]')).focus({preventScroll:true})}catch(e){}}
  function show(resume){m.hidden=false;LB.card.el.ov&&LB.card.el.ov.classList.remove('clear');
    $('mphM').hidden=false;$('mphT').hidden=true;$('trialNote').hidden=true;$('mResume').hidden=!resume;
    try{(resume?$('mResume'):m.querySelector('[data-diff=normal]')).focus({preventScroll:true})}catch(e){}}
  return{mount,show,hide(){if(m)m.hidden=true},visible(){return!!m&&!m.hidden},lang,update,trial,get C(){return C}};
})();

/* ---------- LB.input : entrées communes ----------
   Action : Espace, flèche haut, W, Z, toucher l'arène ou le bouton d'action ; relâchement (touche, doigt, perte du focus) pour
   tous ; P / Échap : pause ; R : réessayer ; Entrée / Espace : carte, pause (reprendre) et menu (Normal) ; écran de démarrage :
   seul son bouton agit ; case à cocher focalisée : rien. bind({press, release, pause, retry, skip}) : skip(e) rend true si le
   chapitre a pris la touche (cinématique propre au chapitre). */
LB.input=(()=>{
  const ACT=[' ','Spacebar','ArrowUp','w','W','z','Z'];let h={},bound=false;
  function bind(hh){h=hh;if(bound)return;bound=true;
    const cv=document.getElementById('c'),ward=document.getElementById('ward'),rel=()=>{if(h.release)h.release()};
    for(const t of [cv,ward]){if(!t)continue;
      t.addEventListener('pointerdown',e=>{e.preventDefault();try{t.setPointerCapture(e.pointerId)}catch(x){}if(h.press)h.press()});
      t.addEventListener('pointerup',rel);t.addEventListener('pointercancel',rel);t.addEventListener('lostpointercapture',rel)}
    if(ward){ward.addEventListener('click',e=>{if(e.detail===0&&h.press)h.press()});ward.addEventListener('contextmenu',e=>e.preventDefault())}
    window.addEventListener('blur',rel);
    window.addEventListener('keyup',e=>{if(ACT.includes(e.key)||e.key==='Enter')rel()});   /* Entrée : bouton d'action focalisé (clic clavier) */
    window.addEventListener('keydown',e=>{
      if(LB.gate.visible())return;   /* écran de démarrage : seul le bouton agit */
      const k=e.key,a=document.activeElement;
      if(a&&a.tagName==='INPUT')return;
      if(h.skip&&h.skip(e))return;
      if(e.repeat){if(ACT.includes(k)&&!LB.menu.visible())e.preventDefault();return}
      if(k==='r'||k==='R'){if(!LB.menu.visible()&&h.retry){e.preventDefault();h.retry()}return}
      if(k==='p'||k==='P'||k==='Escape'){if(!LB.menu.visible()&&h.pause){e.preventDefault();h.pause()}return}
      const ok=k===' '||k==='Enter';
      if(LB.pause.visible()){if(ok&&a!==document.getElementById('pMenu')){e.preventDefault();LB.pause.resume()}return}
      if(LB.menu.visible()){const mn=document.getElementById('menu');if(ok&&!mn.contains(a)){e.preventDefault();mn.querySelector('#mphM [data-diff=normal]').click()}return}
      if(LB.card.visible()){if(ok&&a!==LB.card.el.go){e.preventDefault();LB.card.el.go.click()}return}
      if(ACT.includes(k)){e.preventDefault();if(h.press)h.press()}
    });
  }
  return{bind,ACT};
})();

/* ---------- LB.hud : barres de vie, nom du boss, sourcil de phase, bouton d'action, frise ----------
   pips(boîte, n, max, repères) ; marks(rages, final) : repères de rage calculés (case du PV où part chaque rage, et celle du
   dernier assaut à `final` PV, 1 par défaut ; null : sans dernier assaut) ; player(n, max) ; boss(n, max, repères) ;
   set({boss, head, ward}) ; track(n, {trial, unl}) : phase en cours, frise masquée en Épreuve, phases au-delà de unl fermées. */
LB.hud={
  pips(box,n,max,marks){
    if(box.children.length!==max){box.textContent='';for(let i=0;i<max;i++)box.appendChild(document.createElement('span'))}
    for(let i=0;i<max;i++){box.children[i].classList.toggle('on',i<n);box.children[i].classList.toggle('mark',!!marks&&marks.includes(i))}
  },
  marks(rages,final){return[...(final===null?[]:[(final||1)-1]),...rages.map(x=>x-1)]},
  player(n,max){LB.hud.pips(document.getElementById('hpP'),n,max,[]);document.getElementById('hpPn').textContent=n+'/'+max},
  boss(n,max,marks){LB.hud.pips(document.getElementById('hpB'),n,max,marks);document.getElementById('hpBn').textContent=n+'/'+max},
  set(o){const s=(id,v)=>{if(v==null)return;const e=document.getElementById(id);if(e&&e.textContent!==v)e.textContent=v};
    /* nom dans la barre : #nmP / #nmB (Chapitre II), sinon le texte en tête de la barre (Chapitre I : « nom » + espace, puis le compteur) */
    const nm=(id,sel,v)=>{if(v==null)return;if(document.getElementById(id))return s(id,v);const t=(document.querySelector(sel)||{}).firstChild;if(t&&t.nodeType===3&&t.textContent!==v+' ')t.textContent=v+' '};
    nm('nmB','.bars .bar.boss > span',o.boss);nm('nmP','.bars .bar:not(.boss) > span',o.player);s('hdEye',o.head);s('ward',o.ward)},
  track(n,o){o=o||{};const ol=document.getElementById('phases');if(!ol)return;ol.style.display=o.trial?'none':'';
    ol.querySelectorAll('li').forEach((li,i)=>{const on=i===n-1,b=li.querySelector('button');li.classList.toggle('on',on);if(on)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
      if(b){b.disabled=!!o.trial||(o.unl!=null&&i+1>o.unl);b.title=o.trial?LB._('Not available in the trial',"Indisponible dans l'épreuve"):''}})}
};

/* ---------- LB.help : case « Aide » (décision n° 3 du 28 octobre) ----------
   Décochée par défaut, mémorisée (lb-help), activable dans toutes les difficultés ; désactivée (et décochée, sans toucher à
   lb-help) en Épreuve. use(d) au choix de la difficulté ; defeat(facile) : true à la 3e défaite en Facile sans aide (le chapitre
   propose alors « Activer l'aide visuelle » sur la carte de défaite) ; enable() coche et mémorise ; on() : l'aide est active. */
LB.help=(()=>{
  let box=null,deaths=0;const stored=()=>LB.store.get(LB.key('help'),'0')==='1';
  return{
    mount(){box=document.getElementById('optHelp');if(!box)return;box.checked=stored();box.addEventListener('change',()=>{LB.store.set(LB.key('help'),box.checked?'1':'0')})},
    on(){return!!box&&box.checked&&!box.disabled},
    use(d){deaths=0;if(!box)return;if(d&&d.trial){box.disabled=true;box.checked=false}else{box.disabled=false;box.checked=stored()}},
    defeat(easy){if(!easy||LB.help.on())return false;return++deaths===3},
    enable(){if(!box)return;box.disabled=false;box.checked=true;LB.store.set(LB.key('help'),'1')},
    get deaths(){return deaths}
  };
})();
LB.helpOffer=()=>LB._('Enable visual help',"Activer l'aide visuelle");

/* ---------- LB.cue : repère d'aide (décision n° 8 du 28 octobre : celui du Chapitre I) ----------
   Normal et Difficile : barre au-dessus de la tête, orange à l'approche, bleue pendant la fenêtre d'action ; Facile : cercle
   qui se resserre autour du Veilleur pendant la fenêtre. LB.cue(ctx, {x, y, cx, cy, r, tt, act, easy}) : x, y = barre (centre,
   haut) ; cx, cy, r = cercle (rayon à l'ouverture) ; tt = temps jusqu'à l'impact ; act = durée de l'action. Le Chapitre II garde
   ses aides propres : demi-cercle des faisceaux (hold), pointillé des reflets (fake). Table LB.CUE_T. */
LB.CUE_T={lead:.8,bar:{w:68,h:6},shrink:20,open:'#6fd3ff',near:'rgba(255,122,43,.85)',ring:'rgba(111,211,255,.9)'};
LB.cue=function(ctx,o){const T=LB.CUE_T,tt=o.tt,act=o.act;
  if(!o.easy){if(tt>0&&tt<=act+T.lead)LB.cue.bar(ctx,o.x,o.y,tt<=act?tt/act:1-(tt-act)/T.lead,tt<=act);return}
  if(tt<=act&&tt>0){ctx.strokeStyle=T.ring;ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.cx,o.cy,o.r-T.shrink*(1-tt/act),0,6.283);ctx.stroke()}};
LB.cue.bar=function(ctx,cx,y,k,open){const T=LB.CUE_T,w=T.bar.w,h=T.bar.h,x=cx-w/2;
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x-1,y-1,w+2,h+2);
  ctx.fillStyle=open?T.open:T.near;ctx.fillRect(x,y,w*(k<0?0:k>1?1:k),h)};
/* cercle d'approche (phase I du Chapitre I) : orange qui se resserre, puis bleu lumineux pendant la fenêtre */
LB.cue.ring=function(ctx,cx,cy,r,open){const T=LB.CUE_T;
  ctx.save();ctx.lineWidth=open?5:3;ctx.strokeStyle=open?T.open:T.near;if(open){ctx.shadowColor=T.open;ctx.shadowBlur=12}
  ctx.beginPath();ctx.arc(cx,cy,r,0,6.283);ctx.stroke();ctx.restore()};
