/* ---------- LB.drawWatcher : le Veilleur dessiné, commun à toute la série (session engine/watcher, 1er novembre 2026) ----------
   Un seul Veilleur, celui du Chapitre I, redessiné le 27 novembre 2026 (maquette A9) : de trois quarts, capuche-heaume à visière
   lumineuse, mantelet, cape bleu nuit, tabard crème à l'emblème de la lanterne ; sceptre-lanterne (anneau, toit de laiton, cage
   vitrée, flamme, clochette pendue à un bras sous le socle). Repère du Veilleur : origine aux pieds, x vers l'adversaire, y vers le bas ; manteau de -94 à 0,
   épaule (23, -78), main au repos (46, -66) : garde de combat de la maquette A9, bâton planté un peu en avant (talon (34, 0),
   lanterne (60, -140)), la même dans toutes les phases sauf indication contraire.
   LB.drawWatcher(ctx, x, y, pose, t, opt) : pose = nom de LB.WATCHER_POSES ; t = horloge du chapitre (s), pour la respiration
   et la marche ; opt.k = avancement de la pose (0 à 1, 1 par défaut ; secondes écoulées pour fall).
   La pose donne la géométrie ; tout champ de opt la remplace (un chapitre qui chorégraphie lui-même une riposte ou une
   cinématique passe ses valeurs) :
     dx, dy        décalage des pieds ;  rot, rot2  rotations (rot2 après rot) ;  sx, sy  échelle (après les rotations)
     scale         échelle d'ensemble (cinématiques, silhouettes lointaines)
     body          {dy, s} : sous-repère du corps seul (le bras et le sceptre restent à l'échelle 1 : phase II du Chapitre I)
     shoulder, armR, hand   épaule, rayon de l'épaule, main
     sceptre, trois façons de le tenir :
       staff  [sb, st]  bâton tenu dans la main, du talon sb à la lanterne st (au repos, garde)
       sa, L           sceptre dans le repère de la main, angle sa, lanterne à la distance L (sceptre levé, contres)
       staffA          angle du bâton, la main suit (cinématiques du Chapitre II, ex-heroShape) ; up = levée (0 à 1)
     glow          intensité de la lanterne (0 à 1) ; lanternCol  couleur du verre (sinon : lit ? allumée : repos)
     lamp          intensité de la lanterne pour les cinématiques (0 à 1, 1 par défaut : verre et halo s'éteignent)
     aura          halo autour du Veilleur et boule au bout du sceptre (contres de la phase II du Chapitre I)
     beam          {len, w, al} : rayon court au bout du sceptre (mode sa)
     white         Veilleur blanc (vrai) ou voile blanc (0 à 1) ;  fl  pans du manteau (sinon respiration ou 0)
     breath        respiration (balancement et pans, décision n° 5 du 28 octobre) : vraie par défaut pour idle seulement
     staffAlpha    opacité du sceptre (0 à 1)
     flat          silhouette lointaine (aplats, lanterne simple) ;  ink  contre-jour de dos, d'une seule encre
     inFrame(ctx, g)  dessin du chapitre dans le repère du Veilleur, après lui (rayon d'un contre, anneau de prise)
   Renvoie {lx, ly} : centre de la lanterne dans le repère de l'appelant (départ des tirs). */
LB.WATCHER_T={
  breath:{bob:1.2,bobF:2,fl:1.5,flF:4},            /* respiration : balancement (px, appliqué à moitié) et pans (px), fréquences (rad/s) */
  walk:{bob:4,f:9.8},                               /* marche : rebond (px), fréquence */
  raise:.08,                                        /* montée du sceptre (s) au début d'une garde */
  block:{ramp:.07,fade:.45},                        /* bouclier : apparition (s), affaiblissement sur la durée de l'action */
  lantern:{idle:'#ffe066',lit:'#fffbe3',recover:'#a88f4a',dark:[58,48,34]},
  flame:{f1:31,f2:57,a1:.12,a2:.06,fs:19,sway:1.2},   /* flamme : vacillement (rad/s, amplitudes) et balancement de la pointe (px) ; fixe en mouvement réduit */
  bell:{f:12.6,a:.16}                               /* clochette : balancement (rad/s, rad) ; immobile en mouvement réduit */
};
/* garde de combat (maquette A9), la même dans toutes les phases sauf indication contraire : main, bâton planté (talon, lanterne)
   et angle du sceptre tenu en main (sa) qui place la lanterne au même endroit. Les chapitres qui chorégraphient eux-mêmes partent d'ici. */
LB.WATCHER_REST={hand:[46,-66],staff:[[34,0],[60,-140]],sa:-1.39};
(function(){
  const W=LB.WATCHER_T,PI=Math.PI,cl=v=>v<0?0:v>1?1:v;
  const es=t=>t*t*(3-2*t);   /* lissage du Chapitre I */
  /* géométries du Chapitre I (repère du Veilleur) ; k = avancement de la pose, o = options */
  const RS=LB.WATCHER_REST,staffIdle=()=>({staff:[RS.staff[0].slice(),RS.staff[1].slice()],hand:RS.hand.slice()});
  const staffUp=r=>({staff:[[34,-58*r],[60-2*r,-140-26*r]],hand:[46-8*r,-66-8*r]});
  LB.WATCHER_POSES={
    /* debout, lanterne au bout du bâton planté (phase I du Chapitre I) ; respire */
    idle:k=>Object.assign(staffIdle(),{glow:.25}),
    /* garde : la lanterne monte et s'embrase (blocage de la phase I) ; k = montée (0 à 1) */
    block:k=>Object.assign(staffUp(k),{glow:1,lit:1}),
    /* pas de côté (esquive de la phase I du Chapitre II) : recul et inclinaison ; k = amplitude */
    dodgeSide:k=>Object.assign(staffIdle(),{dx:-48*k,rot:-.18*k,glow:.25}),
    /* plongée d'esquive (phase II du Chapitre I) : chute, recul, tour complet ; k = avancement de l'action, o.drop = profondeur */
    dodgeDown:(k,o)=>{const off=k<.27?es(k/.27):k<.73?1:1-es((k-.73)/.27);
      return{hand:[34,-8],sa:-.12,L:80,body:{dy:44,s:.8},shoulder:[18.5,-18.5],armR:5.2,dy:(o.drop||0)*off,dx:-20*off,rot:-6.283*es(k),glow:.35}},
    /* garde tenue (phase III du Chapitre II) : sceptre levé, lanterne allumée */
    hold:k=>({hand:[36,-92],sa:-1.5,L:76,glow:1,lit:1}),
    /* sceptre levé (garde de la phase III du Chapitre I, appel de la cloche, cinématiques) ; k = levée */
    raise:k=>({hand:[RS.hand[0]-14*k,RS.hand[1]-28*k],sa:RS.sa-.11*k,L:76,glow:k>0?1:.3,lit:k>0?1:0}),
    /* coup reçu : plié, sceptre baissé ; k = intensité */
    hurt:k=>({hand:[RS.hand[0]-6*k,RS.hand[1]+4*k],sa:RS.sa+2*k,L:76,rot:.12*k,sy:1-.18*k,glow:.3}),
    /* à terre (défaite, prise relâchée) */
    down:k=>Object.assign(staffIdle(),{rot2:.12,sy:.82,glow:.25}),
    /* appel de la lumière (orbe, cloche) : comme la garde, lanterne allumée */
    cast:k=>Object.assign(staffUp(1),{glow:1,lit:1}),
    /* riposte : estoc du sceptre, lanterne en avant ; k = poussée */
    counter:k=>{const hand=[40+16*k,-62];return{hand,staff:[[hand[0]-34,hand[1]+6],[hand[0]+34,hand[1]-6]],glow:.6+.4*k,lit:1}},
    /* victoire : sceptre brandi au-dessus de la tête */
    victory:k=>({hand:[32,-102],sa:-1.45,L:76,glow:1,lit:1}),
    /* chute (fin de la phase II du Chapitre I) ; k = secondes écoulées */
    fall:k=>({hand:[34,-8],sa:-.12,L:80,body:{dy:44,s:.8},shoulder:[18.5,-18.5],armR:5.2,dx:-k*40,dy:k*140,rot:-k*5,glow:.35}),
    /* marche (arrivée sur le Clocher, prologue) : sceptre tenu devant, rebond des pas */
    walk:(k,o,t)=>({hand:[40,-66],sa:-.3,L:76,dy:-Math.abs(Math.sin(t*W.walk.f))*W.walk.bob,glow:.25})
  };
  /* ---- DA « maquette A9 » (docs/decisions/da/maquette-a9.html) : de trois quarts, tourné vers l'adversaire ; aplats mats,
     quelques plans nets, aucun contour noir, un seul liseré de lumière du côté de la lanterne (en haut à droite).
     Téléphone : aucun filter ni shadowBlur, aucun canvas créé ; chemins (Path2D) et dégradés fixes mis en cache. */
  const PC=new Map(),Pd=d=>{let p=PC.get(d);if(!p){if(PC.size>400)PC.clear();p=new Path2D(d);PC.set(d,p)}return p};
  const GC=new WeakMap(),grad=(c,k,f)=>{let m=GC.get(c);if(!m){m={};GC.set(c,m)}return m[k]||(m[k]=f())};
  const lin=(c,x0,y0,x1,y1,st)=>{const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g};
  /* mouvement réduit (préférence du système, lue une fois puis suivie) : flamme fixe, clochette immobile */
  let RM=null;const still=()=>{if(RM===null){RM=false;try{const q=matchMedia('(prefers-reduced-motion: reduce)');RM=q.matches;const f=()=>{RM=q.matches};
    if(q.addEventListener)q.addEventListener('change',f);else if(q.addListener)q.addListener(f)}catch(e){}}return RM};
  let clk=0;   /* horloge du dernier Veilleur dessiné (s) : flamme et clochette */
  /* couleurs : #rgb, #rrggbb ou rgb()/rgba() -> [r, g, b] */
  const RGB=new Map(),rgbOf=col=>{let v=RGB.get(col);if(v)return v;const s=String(col).trim();
    if(s[0]==='#'){const h=s.slice(1),n=parseInt(h.length<6?h.slice(0,3).replace(/./g,'$&$&'):h.slice(0,6),16);v=[n>>16&255,n>>8&255,n&255]}
    else{const m=s.match(/[\d.]+/g);v=m&&m.length>2?[+m[0],+m[1],+m[2]]:rgbOf(W.lantern.idle)}
    if(RGB.size>200)RGB.clear();RGB.set(col,v);return v};
  const mixA=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k],css=a=>'rgb('+Math.round(a[0])+','+Math.round(a[1])+','+Math.round(a[2])+')';
  /* verre éteint : mélange de la couleur vers W.lantern.dark (lamp = 1 : couleur intacte) */
  function dim(col,lamp){if(!(lamp<1))return col;return css(mixA(W.lantern.dark,rgbOf(col),Math.max(0,lamp)))}
  /* palettes : nuit (habituelle) et blanche (Veilleur blanc, voile blanc) */
  const PAL={
    n:{c0:'#2b346c',c1:'#161a40',robe:'#222a5a',far:'#171c42',boot:'#171a38',lit:'rgba(116,132,208,.36)',sh:'rgba(5,4,24,.55)',
       t0:'#fbeecb',t1:'#bb9e8a',tsh:'rgba(120,80,90,.24)',fold:'rgba(140,102,72,.5)',emb:'#6a4428',belt:'#40261f',beltHi:'rgba(255,196,130,.55)',
       buckle:'#dcae5c',pouch:'#33201f',mant:'#2d356a',hem:'rgba(190,150,200,.5)',hood:'#1d2146',hoodSh:'rgba(4,3,18,.6)',trim:'#3b4280',
       visor:'#ffedae',vg:'255,229,138',arm:'#242b58',armLit:'rgba(130,142,215,.6)',cuff:'#40261f',rim:'255,227,160'},
    w:{c0:'#ffffff',c1:'#cfd7f2',robe:'#e9edfa',far:'#c6cfec',boot:'#b9c2e0',lit:'rgba(255,255,255,.55)',sh:'rgba(120,132,186,.3)',
       t0:'#ffffff',t1:'#dfe3f2',tsh:'rgba(150,160,200,.22)',fold:'rgba(160,170,210,.5)',emb:'#9aa6cc',belt:'#d6dcef',beltHi:'rgba(255,255,255,.7)',
       buckle:'#f4ecd0',pouch:'#c3cbe6',mant:'#f2f5ff',hem:'rgba(170,180,220,.6)',hood:'#e6ebfa',hoodSh:'rgba(130,140,190,.35)',trim:'#ffffff',
       visor:'#ffffff',vg:'255,255,255',arm:'#dfe5fa',armLit:'rgba(255,255,255,.7)',cuff:'#c3cbe6',rim:'255,255,255'}};
  /* tracés du corps (repère du Veilleur, pieds en 0) ; la cape seule bouge avec les pans (f) */
  const B9={
    robe:'M-14 -90Q2 -96 16 -90C19 -64 23 -38 30 -13Q20 -8 12 -9Q0 -4 -17 -7C-13 -34 -15 -62 -14 -90Z',
    robeSh:'M-14 -90L-3 -90C-2 -58 -4 -30 -8 -6L-17 -7C-13 -34 -15 -62 -14 -90Z',robeLit:'M15 -90C19 -64 23 -38 30 -13L23 -11C18 -36 13 -62 9 -90Z',
    farBoot:'M7 -22L9 -9Q8 -4 14 -4L28 -4Q28 -10 18 -11L17 -22Z',
    boot:'M-14 -19L-14 -6Q-23 -4 -21 1L-2 1L-1 -18Z',bootLit:'M-14 -6Q-23 -4 -21 1L-12 1Q-12 -4 -4 -6Z',
    tab:'M0 -89Q8 -86 15 -89C17 -64 20 -40 27 -13L19 -18L12 -10C11 -36 7 -62 0 -89Z',tabSh:'M0 -89Q2.5 -88 5 -88C8 -62 10 -36 12 -10C11 -36 7 -62 0 -89Z',
    fold:'M7 -85C11 -60 13 -38 18 -19',emb:'M9.6 -70.5a3.8 3.8 0 1 0 .1 0M10 -70.5V-76',
    belt:'M-14 -57Q3 -47 19 -55L20 -49Q3 -40 -13 -50Z',beltHi:'M-14 -57Q3 -47 19 -55L19 -53Q3 -45 -14 -55Z',
    buckle:'M7 -50.5L14 -52L15 -45.5L8 -44Z',pouch:'M-9 -50Q-12 -40 -16 -34Q-11 -31 -6 -35Q-4 -43 -3 -49Z',
    mant:'M-17 -91C-4 -99 15 -98 23 -87C22 -81 18 -78 13 -80Q0 -70 -15 -74C-23 -77 -23 -86 -17 -91Z',
    mantLit:'M-17 -91C-4 -99 15 -98 23 -87Q4 -94 -18 -84Z',mantSh:'M8 -94L24 -86L14 -79L6 -80Z',hem:'M-15 -75Q0 -71 13 -80',
    hood:'M-11 -92C-15 -119 -3 -130 8 -130C23 -128 29 -113 25 -93Q15 -84 4 -85Q-7 -86 -11 -92Z',
    hoodLit:'M-9 -96C-12 -116 -3 -126 8 -127Q-2 -113 -1 -96Q-3 -90 -7 -91Z',hoodSh:'M7 -125C20 -123 26 -112 23 -94Q14 -87 5 -88C1 -103 1 -115 7 -125Z',
    trim:'M-10 -94Q-16 -126 7 -130.5Q23 -130 27.5 -113',visor:'M9 -112L23 -110.5L22 -106.5L10 -107.5Z',
    back:'M-14 -94C-16 -120 -6 -131 1 -131C8 -131 18 -120 15 -94C22 -92 27 -86 26 -80C30 -50 33 -24 36 0L-34 0C-30 -24 -27 -50 -25 -80C-26 -86 -21 -92 -14 -94Z'};
  const capeD=f=>'M6 -100C-14 -98 -25 -84 -31 -64C-37 -44 '+(-43+f)+' -24 '+(-48+f*1.6)+' '+(-5+f*.6)+'Q'+(-40+f*.6)+' '+(-1-f*.5)+' -31 -2Q-25 '+(-3+f*.5)+' -19 -1L8 -6C13 -34 18 -68 15 -95Z',
    capeLit=f=>'M-4 -92C-18 -70 -32 -40 '+(-46+f*1.6)+' '+(-6+f*.6)+'L'+(-39+f)+' -4C-29 -34 -16 -62 -1 -84Z',
    capeSh='M2 -70C-6 -46 -16 -22 -24 -2L-12 -3C-6 -24 0 -46 5 -62Z';
  /* mantelet (aussi redessiné sur la naissance du bras, qui sort dessous) */
  function mantle(c,P){pc(c,B9.mant,P.mant,[B9.mantLit,P.lit,B9.mantSh,P.sh]);tr(c,B9.hem,P.hem,1)}
  /* pièce : aplat, puis ses plans nets dans sa forme */
  function pc(c,d,fill,planes){const p=Pd(d);c.fillStyle=fill;c.fill(p);if(planes){c.save();c.clip(p);for(let i=0;i<planes.length;i+=2){c.fillStyle=planes[i+1];c.fill(Pd(planes[i]))}c.restore()}}
  function tr(c,d,col,w){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(Pd(d))}
  const RIM=[1.3,-.9];   /* décalage du liseré : vers la lanterne */
  /* corps : cape, bottes, robe, tabard, ceinture, mantelet, capuche-heaume et visière. o.fl = pans, o.white = palette blanche,
     o.rim = force du liseré (0 à 1), o.flat = silhouette lointaine (aplats seuls) */
  LB.drawWatcherBody=(c,o)=>{
    const Wh=!!o.white,P=Wh?PAL.w:PAL.n,f=Math.round(Math.max(-12,Math.min(12,o.fl||0))*4)/4,cape=capeD(f),fla=!!o.flat,rim=Wh||fla?0:(o.rim||0);
    const cg=grad(c,Wh?'cw':'cn',()=>lin(c,8,-96,-50,-8,[[0,P.c0],[1,P.c1]])),tg=grad(c,Wh?'tw':'tn',()=>lin(c,24,-89,2,-10,[[0,P.t0],[1,P.t1]]));
    if(rim>0){c.save();c.translate(RIM[0],RIM[1]);c.fillStyle='rgba('+P.rim+','+Math.min(1,rim)+')';
      for(const d of[cape,B9.farBoot,B9.robe,B9.boot,B9.mant,B9.hood])c.fill(Pd(d));c.restore()}
    if(fla){for(const [d,col] of[[cape,cg],[B9.farBoot,P.far],[B9.robe,P.robe],[B9.boot,P.boot],[B9.tab,tg],[B9.belt,P.belt],[B9.mant,P.mant],[B9.hood,P.hood],[B9.visor,P.visor]])pc(c,d,col);return}
    pc(c,cape,cg,[capeLit(f),P.lit,capeSh,P.sh]);
    pc(c,B9.farBoot,P.far);
    pc(c,B9.robe,P.robe,[B9.robeSh,P.sh,B9.robeLit,P.lit]);
    pc(c,B9.boot,P.boot,[B9.bootLit,P.lit]);
    pc(c,B9.tab,tg,[B9.tabSh,P.tsh]);tr(c,B9.fold,P.fold,.9);tr(c,B9.emb,P.emb,1.6);
    pc(c,B9.belt,P.belt,[B9.beltHi,P.beltHi]);pc(c,B9.buckle,P.buckle);pc(c,B9.pouch,P.pouch);
    mantle(c,P);
    hood(c,P);
  };
  /* capuche-heaume et visière (lueur douce en dégradé fixe, plus faible que la lanterne) */
  function hood(c,P){
    pc(c,B9.hood,P.hood,[B9.hoodLit,P.lit,B9.hoodSh,P.hoodSh]);tr(c,B9.trim,P.trim,3);
    c.fillStyle=grad(c,P===PAL.w?'vw':'vn',()=>{const g=c.createRadialGradient(16,-107,1,16,-107,11);g.addColorStop(0,'rgba('+P.vg+',.42)');g.addColorStop(1,'rgba('+P.vg+',0)');return g});
    c.fillRect(5,-118,22,22);
    c.fillStyle=P.visor;c.fill(Pd(B9.visor));c.fillRect(14.6,-108,2.5,13);
  }
  /* bras proche (de l'épaule à la main, coude plié selon la distance), liseré compris ; r = rayon de l'épaule */
  function sleeve(c,sh,h,r,P,rim){
    /* l'épaule d'ancrage (sh) est au bord du mantelet ; le bras droit (le plus proche, vue de trois quarts) sort dessous, en arrière sur le flanc (S), et passe devant le torse, et le coude se plie
       comme un bras de deux segments de 23 px (à l'échelle de r) : coude sous la ligne épaule-main quand la main est devant */
    const k=r/6.5;sh=[sh[0]-16*k,sh[1]-2*k];
    const dx=h[0]-sh[0],dy=h[1]-sh[1],l=Math.hypot(dx,dy)||1,s2=23*k,b=Math.min(12*k,Math.sqrt(Math.max(0,s2*s2-l*l/4))),
      mx=(sh[0]+h[0])/2-dy/l*b*2,my=(sh[1]+h[1])/2+dx/l*b*2,w=9*k;
    const path=()=>{c.beginPath();c.moveTo(sh[0],sh[1]);c.quadraticCurveTo(mx,my,h[0],h[1])};
    const q=t=>{const u=1-t;return[u*u*sh[0]+2*u*t*mx+t*t*h[0],u*u*sh[1]+2*u*t*my+t*t*h[1]]};
    c.lineCap='round';c.lineJoin='round';
    if(rim>0){c.save();c.translate(RIM[0],RIM[1]);c.strokeStyle='rgba('+P.rim+','+Math.min(1,rim)+')';c.lineWidth=w;path();c.stroke();c.restore()}
    c.strokeStyle=P.arm;c.lineWidth=w;path();c.stroke();
    c.save();c.translate(w*.2,-w*.2);c.strokeStyle=P.armLit;c.lineWidth=w*.18;path();c.stroke();c.restore();
    const a=q(.76),z=q(.9);c.strokeStyle=P.cuff;c.lineWidth=w*1.1;c.lineCap='butt';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(z[0],z[1]);c.stroke();c.lineCap='round';
    return sh;
  }
  /* main fermée sur le sceptre ; a = direction du sceptre */
  function fist(c,h,a){c.save();c.translate(h[0],h[1]);c.rotate(a);
    c.fillStyle='#d4ac86';c.beginPath();c.ellipse(0,0,4.4,5.2,0,0,6.283);c.fill();
    c.fillStyle='rgba(255,226,180,.55)';c.beginPath();c.ellipse(1.2,-2.4,2.4,1.6,0,0,6.283);c.fill();
    c.strokeStyle='rgba(90,48,40,.6)';c.lineWidth=.8;c.beginPath();c.moveTo(-1.6,-3.6);c.lineTo(-1.6,3.6);c.moveTo(1.2,-3.4);c.lineTo(1.2,3.4);c.stroke();
    c.restore()}
  /* hampe : bois sombre, liseré chaud côté lanterne, talon de laiton (de a à b) */
  function pole(c,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l*1.1,ny=dx/l*1.1;
    c.lineCap='round';c.strokeStyle='#4a2f2a';c.lineWidth=4.4;c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();
    c.strokeStyle='rgba(255,214,150,.7)';c.lineWidth=1.1;c.beginPath();c.moveTo(ax+nx+dx*.04,ay+ny+dy*.04);c.lineTo(bx+nx,by+ny);c.stroke();
    c.fillStyle='#c79a55';c.beginPath();c.arc(ax,ay,2.5,0,6.283);c.fill()}
  /* lanterne : x, y = centre de la lumière ; ang oriente le haut ; g = intensité du halo (0 à 1) ; lamp = intensité de cinématique.
     Anneau, toit de laiton, cage vitrée de trois quarts, flamme vacillante, clochette pendue (par gravité) à un bras sous le socle. */
  LB.drawLantern=(c,x,y,g,col,ang,lamp)=>{
    const lp=lamp==null?1:lamp,l1=lp<1?Math.max(0,lp):1,gl=Math.max(0,g)*l1,A=rgbOf(col||W.lantern.idle),D=W.lantern.dark,rm=still(),F=W.flame;
    const tone=a=>css(l1<1?mixA(D,a,l1):a);
    c.save();c.translate(x,y);c.rotate(ang||0);
    if(lp>0){const rr=16+30*gl,R=rr*1.7,rg=c.createRadialGradient(0,0,2,0,0,R);
      rg.addColorStop(0,'rgba(255,245,215,'+(.35+.5*gl)*l1+')');rg.addColorStop(.3,'rgba(255,226,140,'+(.12+.25*gl)*l1+')');
      rg.addColorStop(.6,'rgba(255,217,102,'+(.07*gl)*l1+')');rg.addColorStop(1,'rgba(255,217,102,0)');
      c.fillStyle=rg;c.beginPath();c.arc(0,0,R,0,6.283);c.fill()}
    c.scale(.82,.82);
    const laiton=grad(c,'laiton',()=>lin(c,-14,-22,14,16,[[0,'#d9a55a'],[.5,'#7a5230'],[1,'#3a2420']]));
    /* verre : cœur clair, couleur d'état, bord plus sombre */
    const v=c.createRadialGradient(0,2,1,0,1,17);v.addColorStop(0,tone(mixA(A,[255,255,240],.7)));v.addColorStop(.45,tone(A));v.addColorStop(1,tone(mixA(A,[110,46,22],.42)));
    c.fillStyle=v;c.fill(Pd('M-11.5 -12Q0 -8 11.5 -12L8.5 12Q0 15.5 -8.5 12Z'));
    c.fillStyle='rgba(150,70,30,.26)';c.fill(Pd('M5 -10L11.5 -12L8.5 12L4 13.5Z'));
    /* flamme */
    if(l1>.05){const h=rm?1:1+F.a1*Math.sin(clk*F.f1)+F.a2*Math.sin(clk*F.f2),q=rm?0:Math.round(Math.sin(clk*F.fs)*F.sway*10)/10,
        fp=Pd('M'+q+' -17C'+(3+q*.5)+' -11 5.5 -6 4.5 -2.5C3 2 -3 2 -4.5 -2.5C-5.5 -6 -2 -10 '+q+' -17Z');
      c.save();c.translate(-.5,7);c.scale(.6+.4*l1,h*(.4+.6*l1));
      c.save();c.scale(1.45,1.25);c.fillStyle='rgba('+css(mixA(A,[255,255,255],.5)).slice(4,-1)+',.45)';c.fill(fp);c.restore();
      c.fillStyle=css(mixA(A,[255,253,235],.85));c.fill(fp);c.restore()}
    /* montants de la cage */
    const la=.3+.7*l1;
    tr(c,'M-11.5 -12L-8.5 12M11.5 -12L8.5 12','#4a2f22',2.2);tr(c,'M-5 -10.4L-3.8 13.8M5 -10.4L4 13.6','#5a3a24',1.3);
    c.globalAlpha*=la;tr(c,'M-12 -11L-9.2 11','rgba(255,224,150,.8)',.8);c.globalAlpha/=la;
    /* toit, bouton, anneau */
    c.fillStyle=laiton;c.fill(Pd('M-15 -12Q-8 -15 -4.5 -22L4.5 -22Q8 -15 15 -12Q0 -6.5 -15 -12Z'));
    c.globalAlpha*=la;tr(c,'M-15 -12Q0 -6.5 15 -12','#ffe9ae',1.2);tr(c,'M-14 -12.8Q-7.5 -15.5 -4.3 -21.5','rgba(255,232,170,.85)',1);c.globalAlpha/=la;
    tr(c,'M1 -22Q3 -15 5 -9.6','rgba(40,20,24,.45)',1.4);
    c.fillStyle=laiton;c.fill(Pd('M-4.5 -22Q0 -27 4.5 -22Z'));c.strokeStyle='#c79a55';c.lineWidth=1.8;c.beginPath();c.arc(0,-28.5,3.8,0,6.283);c.stroke();
    /* socle */
    c.fillStyle=laiton;c.fill(Pd('M-11 11Q0 16 11 11L8 16.5Q0 20 -8 16.5Z'));c.globalAlpha*=la;tr(c,'M-11 11Q0 16 11 11','#ffe9ae',1);c.globalAlpha/=la;
    c.fillStyle=laiton;c.fill(Pd('M-3.5 17.5H3.5L2 22H-2Z'));
    /* bras et clochette : elle pend vers le bas de l'écran quel que soit l'angle, et se balance (immobile en mouvement réduit) */
    tr(c,'M7 16Q15 20 19 14','#8a6236',1.8);c.translate(19,14.5);
    let hang=0;if(c.getTransform){const m=c.getTransform(),dt=m.a*m.d-m.b*m.c;if(dt)hang=Math.atan2(m.c/dt,m.a/dt)}
    c.rotate(hang+(rm?0:Math.sin(clk*W.bell.f)*W.bell.a));tr(c,'M0 0V4','#c79a55',1.2);
    c.fillStyle=grad(c,'cloche',()=>lin(c,-6,0,6,0,[[0,'#ffe9ae'],[.45,'#dcae5c'],[1,'#7a5230']]));c.fill(Pd('M-4.5 12C-4 2 4 2 4.5 12L6.5 14.5H-6.5Z'));
    tr(c,'M-6.5 14.5H6.5','#6a4426',1);c.fillStyle='#4a2f22';c.beginPath();c.arc(0,16,1.4,0,6.283);c.fill();
    c.restore();
  };
  /* sceptre dans le repère de la main (axe x = direction du sceptre), lanterne au bout, à la distance L */
  LB.drawScepter=(c,L,g,col,lamp)=>{
    c.save();pole(c,-18,0,L-17,0);c.restore();
    LB.drawLantern(c,L,0,g,col,PI/2,lamp);
  };
  /* éclat de lanterne : rayon court entre deux points (halo en traits larges et pâles, sans shadowBlur) */
  LB.lanternBeam=(c,A,B,w,al)=>{
    const ln=(col,lw)=>{c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke()};
    c.save();c.lineCap='round';
    ln('rgba(255,200,110,'+(.14*al)+')',w*4.4);ln('rgba(255,217,102,'+(.5*al)+')',w*1.8);ln('rgba(255,251,227,'+al+')',w*.55);
    c.fillStyle='rgba(255,226,140,'+(.25*al)+')';c.beginPath();c.arc(B[0],B[1],w*2,0,6.283);c.fill();
    c.fillStyle='rgba(255,250,238,'+(.8*al)+')';c.beginPath();c.arc(B[0],B[1],w*.9,0,6.283);c.fill();
    c.restore();
  };
  /* bouclier de lumière (ellipse bleue du Chapitre I) devant le Veilleur : x, y = ses pieds ; t = temps écoulé dans l'action,
     act = durée de l'action (il s'affaiblit sur toute l'action) ; o.plain : sans liseré ni plans (garde de la phase III).
     Halo en dégradé (plus de shadowBlur), plans nets et liseré sur la face tournée vers l'adversaire. */
  LB.drawBlock=(c,x,y,t,act,o)=>{
    const B=W.block,ramp=cl(t/B.ramp),a=(1-B.fade*t/act)*ramp,cx=x+82,cy=y-76,rx=34*(.6+.4*ramp),ry=92*(.8+.2*ramp);
    c.save();c.globalAlpha=a;
    c.save();c.translate(cx,cy);c.scale((rx+14)/(ry+14),1);
    const hg=c.createRadialGradient(0,0,ry*.6,0,0,ry+14);hg.addColorStop(0,'rgba(111,211,255,.22)');hg.addColorStop(1,'rgba(111,211,255,0)');
    c.fillStyle=hg;c.beginPath();c.arc(0,0,ry+14,0,6.283);c.fill();c.restore();
    const g=c.createRadialGradient(cx-18,cy,6,cx,cy,ry);
    g.addColorStop(0,'rgba(111,211,255,.06)');g.addColorStop(.7,'rgba(111,211,255,.2)');g.addColorStop(1,'rgba(191,234,255,.5)');
    c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,6.283);c.fill();
    if(!(o&&o.plain)){
      c.fillStyle='rgba(205,238,255,.22)';c.beginPath();c.ellipse(cx,cy,rx,ry,0,-PI/2,PI/2);c.ellipse(cx,cy,rx*.55,ry,0,PI/2,-PI/2,true);c.fill();
      c.strokeStyle='#cdeeff';c.lineWidth=2.6;c.beginPath();c.ellipse(cx,cy,rx,ry,0,-PI/2,PI/2);c.stroke();
      c.strokeStyle='rgba(205,238,255,.55)';c.lineWidth=1.2;c.beginPath();c.ellipse(cx,cy,rx,ry,0,PI/2,PI*1.5);c.stroke();
      c.strokeStyle='rgba(205,238,255,.45)';c.lineWidth=1;c.beginPath();c.ellipse(cx,cy,rx*.33,ry,0,-PI/2,PI/2);c.stroke();
    }
    c.restore();
  };
  /* couleur du verre selon l'état du Veilleur (LB.hero) : rouge pendant un appui refusé, allumée, en récupération, au repos */
  LB.watcherLanternCol=(p,lit)=>p&&p.deny>0?LB.DENY_COL:lit?W.lantern.lit:p&&p.s==='recover'?W.lantern.recover:W.lantern.idle;
  /* lanterne simple des cinématiques lointaines : x, y = centre, s = échelle, g = intensité du halo (même forme, aplats) */
  function flatLant(c,x,y,s,g){
    c.save();c.translate(x,y);c.scale(s,s);const rg=c.createRadialGradient(0,0,1,0,0,42);rg.addColorStop(0,'rgba(255,236,180,'+(.55*g)+')');rg.addColorStop(1,'rgba(255,200,110,0)');
    c.fillStyle=rg;c.beginPath();c.arc(0,0,42,0,6.283);c.fill();c.scale(.82,.82);
    c.fillStyle='#ffd27a';c.fill(Pd('M-11.5 -12Q0 -8 11.5 -12L8.5 12Q0 15.5 -8.5 12Z'));
    tr(c,'M-11.5 -12L-8.5 12M11.5 -12L8.5 12M-4.5 -10.4L-3.5 13.8M4.5 -10.4L3.5 13.6','#5a3a24',1.6);
    c.fillStyle='#9a6e3a';c.fill(Pd('M-15 -12Q-8 -15 -4.5 -22L4.5 -22Q8 -15 15 -12Q0 -6.5 -15 -12Z'));c.fill(Pd('M-11 11Q0 16 11 11L8 16.5Q0 20 -8 16.5Z'));
    c.strokeStyle='#9a6e3a';c.lineWidth=1.8;c.beginPath();c.arc(0,-26,3.4,0,6.283);c.stroke();c.restore()}
  /* silhouette lointaine des cinématiques (outro du Chapitre I) : aplats sans contour, lanterne simple */
  function flat(c,x,y,s,lamp){
    c.save();c.translate(x,y);c.scale(s,s);LB.drawWatcherBody(c,{flat:true});
    c.lineCap='round';c.strokeStyle='#4a2f2a';c.lineWidth=4;c.beginPath();c.moveTo(26,-2);c.lineTo(30,-140);c.stroke();c.restore();flatLant(c,x+30*s,y+(-152)*s,s,lamp);
    return{lx:x+30*s,ly:y+(-152)*s};
  }
  /* contre-jour, de dos (outro du Chapitre I : le Veilleur regarde le phare) : capuche, mantelet et cape d'une seule encre, lanterne simple */
  function back(c,x,y,ink,lamp){
    c.save();c.translate(x,y);c.fillStyle=ink;c.fill(Pd(B9.back));c.restore();
    c.lineCap='round';c.strokeStyle=ink;c.lineWidth=4;c.beginPath();c.moveTo(x+24,y-2);c.lineTo(x+30,y-132);c.stroke();flatLant(c,x+31,y-146,.85,lamp);
    return{lx:x+31,ly:y-146};
  }
  LB.drawWatcher=(c,x,y,pose,t,opt)=>{
    const o=opt||{},k=o.k==null?1:o.k,P=LB.WATCHER_POSES[pose]||LB.WATCHER_POSES.idle,g=Object.assign({},P(k,o,t||0));
    clk=t||0;
    for(const n in o)if(o[n]!==undefined&&n!=='k')g[n]=o[n];
    if(o.sa!=null||o.staffA!=null)g.staff=undefined;if(o.staff)g.sa=undefined;   /* la façon de tenir le sceptre donnée par le chapitre l'emporte */
    const X=x+(g.dx||0),Y=y+(g.dy||0);
    if(o.flat)return flat(c,X,Y,g.scale||1,g.lamp==null?1:g.lamp);
    if(o.ink)return back(c,X,Y,o.ink,g.lamp==null?1:g.lamp);
    /* sceptre tenu par son angle (Chapitre II) : la main suit, le bâton passe dans la main */
    if(g.staffA!=null&&!o.staff&&o.sa==null){const A=g.staffA,up=cl((-1.42-A)/.45),dx=Math.cos(A),dy=Math.sin(A),h=[RS.hand[0]-1+dx*4,RS.hand[1]-8*up];
      g.hand=o.hand||h;g.staff=[[g.hand[0]-dx*60,g.hand[1]-dy*60],[g.hand[0]+dx*80,g.hand[1]+dy*80]];g.sa=undefined;
      if(o.glow==null)g.glow=up>.3?1:.25;if(o.lit==null)g.lit=up>.3?1:0}
    const br=W.breath,breathe=o.breath!=null?o.breath:pose==='idle',bob=breathe?Math.sin((t||0)*br.bobF)*br.bob*.5:0;
    const fl=o.fl!=null?o.fl:breathe?Math.sin((t||0)*br.flF)*br.fl:0;
    const col=g.lanternCol||(g.lit?W.lantern.lit:W.lantern.idle),glow=g.glow==null?.25:g.glow,lamp=g.lamp==null?1:g.lamp;
    const sh=g.shoulder||[23,-78],hand=g.hand||[26,-62],sc=g.scale||1;
    /* liseré : suit la lanterne (plus vif quand elle s'embrase, absent quand elle s'éteint) */
    const rim=(.35+.65*cl(glow))*cl(lamp)*(g.staffAlpha==null?1:cl(g.staffAlpha));
    c.save();c.translate(X,Y);
    if(g.rot)c.rotate(g.rot);if(g.rot2)c.rotate(g.rot2);
    const sx=(g.sx==null?1:g.sx)*sc,sy=(g.sy==null?1:g.sy)*sc;if(sx!==1||sy!==1)c.scale(sx,sy);
    const au=g.aura||0;
    if(au>0){const r=70+60*au,gr=c.createRadialGradient(0,-10,6,0,-10,r);
      gr.addColorStop(0,'rgba(255,255,255,'+(.7*au)+')');gr.addColorStop(.5,'rgba(255,226,140,'+(.3*au)+')');gr.addColorStop(1,'rgba(255,217,102,0)');
      c.fillStyle=gr;c.beginPath();c.arc(0,-10,r,0,6.283);c.fill()}
    if(bob)c.translate(0,bob);
    /* corps (voile blanc : une seconde couche, opacité white) */
    const body=w=>{if(g.body){c.save();c.translate(0,g.body.dy||0);c.scale(g.body.s||1,g.body.s||1);LB.drawWatcherBody(c,{fl,white:w,rim});c.restore()}else LB.drawWatcherBody(c,{fl,white:w,rim})};
    const wv=g.white,wa=wv===true?1:+wv||0;if(wa>=1)body(true);else{body(false);if(wa>0){c.save();c.globalAlpha*=wa;body(true);c.restore()}}
    /* bras proche (même voile) */
    const ar=g.armR||6.5;
    /* le bras sort de sous le mantelet : le mantelet est repeint sur la naissance du bras (disque autour de l'épaule), dans le repère du corps */
    const root=(S,Pl)=>{c.save();c.beginPath();c.arc(S[0],S[1],11*ar/6.5,0,6.283);c.clip();if(g.body){c.translate(0,g.body.dy||0);c.scale(g.body.s||1,g.body.s||1)}mantle(c,Pl);hood(c,Pl);c.restore()};
    if(wa<1)root(sleeve(c,sh,hand,ar,PAL.n,rim),PAL.n);if(wa>0){c.save();if(wa<1)c.globalAlpha*=wa;root(sleeve(c,sh,hand,ar,PAL.w,0),PAL.w);c.restore()}
    const sa=g.staffAlpha==null?1:g.staffAlpha;if(sa<1){c.save();c.globalAlpha*=Math.max(0,sa)}
    let L=null;
    if(g.staff){
      /* bâton tenu : talon, main, lanterne au sommet (la hampe s'arrête sous le socle) */
      const [sb,st]=g.staff,ang=Math.atan2(st[1]-sb[1],st[0]-sb[0]),ux=Math.cos(ang),uy=Math.sin(ang);
      pole(c,sb[0],sb[1],st[0]-ux*16,st[1]-uy*16);
      fist(c,hand,ang);
      LB.drawLantern(c,st[0],st[1],glow,col,ang+PI/2,lamp);
      L=st;
    }else{
      /* sceptre dans la main, angle sa */
      const Ln=g.L||76,a=g.sa==null?-.45:g.sa;
      c.save();c.translate(hand[0],hand[1]);c.rotate(a);
      LB.drawScepter(c,Ln,glow,col,lamp);
      if(au>0){const gr=36*au,og=c.createRadialGradient(Ln,0,0,Ln,0,gr*2);
        og.addColorStop(0,'rgba(255,255,255,1)');og.addColorStop(.4,'rgba(255,240,176,.7)');og.addColorStop(1,'rgba(255,217,102,0)');
        c.fillStyle=og;c.beginPath();c.arc(Ln,0,gr*2,0,6.283);c.fill()}
      if(g.beam&&g.beam.al>0){c.save();c.globalCompositeOperation='lighter';LB.lanternBeam(c,[Ln+8,0],[Ln+8+g.beam.len,0],g.beam.w,g.beam.al);c.restore()}
      c.restore();
      fist(c,hand,a);
      L=[hand[0]+Math.cos(a)*Ln,hand[1]+Math.sin(a)*Ln];
    }
    if(sa<1)c.restore();
    if(o.inFrame)o.inFrame(c,g);
    c.restore();
    /* centre de la lanterne dans le repère de l'appelant */
    const ly0=L[1]+bob,r=(g.rot||0)+(g.rot2||0),cs=Math.cos(r),sn=Math.sin(r),u=L[0]*sx,v=ly0*sy;
    return{lx:X+u*cs-v*sn,ly:Y+u*sn+v*cs};
  };
})();
/* Orbe du Chapitre II (déplacée du Chapitre II, tracé inchangé) : halo, étincelles de charge, corps, contour pointillé. x, y = centre, r = rayon.
   o.real  orbe réelle (disque et cœur clair) ou illusoire (anneau creux, halo plus pâle) ;  o.ch  en charge devant le visage (halo o.halo,
   couleur o.col, étincelles o.spark du type), sinon en vol : violet habituel ;  o.t  horloge du chapitre (s) ;  o.dash  opacité du contour
   pointillé (0 = aucun). L'alpha global d'origine est conservé : le halo le remet à 1. */
LB.drawOrb=(c,x,y,r,o)=>{
  const R=r*50/17*(o.ch?o.halo:1),g=c.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,o.ch?o.col:'rgba(176,124,255,.95)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.globalAlpha=o.real?.85:.45;c.fillStyle=g;c.fillRect(x-R,y-R,R*2,R*2);c.globalAlpha=1;
  if(o.ch&&o.spark){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=o.col;c.lineWidth=1.4;c.beginPath();
    for(let k=0;k<o.spark;k++){const a=o.t*(9+k)+k*2.4,l0=r+3,l1=r+5+7*Math.abs(Math.sin(o.t*23+k*5));c.moveTo(x+Math.cos(a)*l0,y+Math.sin(a)*l0);c.lineTo(x+Math.cos(a)*l1,y+Math.sin(a)*l1)}c.stroke();c.restore()}
  const disc=(q,f)=>{c.beginPath();c.ellipse(x,y,Math.abs(q),Math.abs(q),0,0,Math.PI*2);c.fillStyle=f;c.fill()};
  if(o.real){disc(r,'#c9a8ff');disc(r*.5,'#fbf6ff')}
  else{c.save();c.strokeStyle='#c9a8ff';c.lineWidth=3;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.restore()}
  if(o.dash>0){c.save();c.globalAlpha*=o.dash;c.setLineDash([6,5]);c.lineDashOffset=-o.t*12;c.strokeStyle='#f4ecff';c.lineWidth=3;c.beginPath();c.arc(x,y,r+3,0,Math.PI*2);c.stroke();c.restore()}
};
/* Dôme de la garde tenue (déplacé du Chapitre II, phase III ; rayon 136 depuis le 8 novembre pour envelopper la tête du Veilleur (92 avant : la tête, à ~130 px, dépassait) ; utilisé aussi par l'onglet Tuto). LB.DOME_FX : rayon r, délai puis
   fondu d'apparition (delay, fade, en s depuis le début du maintien), remplissage fill, trait line / lineA, couleur d'alerte de fatigue amber. LB.domeAlpha(t)
   donne l'opacité t secondes après le début du maintien. LB.drawDome(c, x, y, o) : (x, y) = pieds du Veilleur ; o.a  opacité (0..1) ; o.warn  fatigue
   (tremblement et contour ambré, o.t = horloge du chapitre) ; o.r rayon de remplacement, o.jx/jy tremblement fourni. */
LB.DOME_FX={r:136,delay:.12,fade:.15,fill:.12,line:1.6,lineA:.85,amber:'255,190,90'};
LB.domeAlpha=t=>Math.max(0,Math.min(1,(t-LB.DOME_FX.delay)/LB.DOME_FX.fade));
LB.drawDome=(c,x,y,o)=>{
  const Z=LB.DOME_FX,warn=!!o.warn,jx=warn?Math.sin(o.t*70)*2.2:0,jy=warn?Math.cos(o.t*83)*1.4:0;
  c.save();c.globalAlpha=o.a;
  c.fillStyle=`rgba(127,214,255,${Z.fill})`;c.beginPath();c.arc(x+jx,y+jy,Z.r,Math.PI,0);c.fill();
  c.strokeStyle=warn?`rgba(${Z.amber},${Z.lineA})`:`rgba(191,240,255,${Z.lineA})`;c.lineWidth=Z.line;c.stroke();c.restore();
};
/* Silhouette du Veilleur des menus et des cinématiques (même tracé dans tous les chapitres) : le corps (chemin SVG, repère
   de l'écran 960 × 540, pieds en y = 455), repris par le fragment shared/svg/watcher-menu.svg des menus. drawWatcherSil la
   dessine sur un canvas : corps (sway = balancement, cisaillement depuis les pieds), bâton, halo (k, r, s = second arrêt), toit,
   socle et verre de la lanterne, dans l'encre ink. */
LB.WATCHER_SIL={body:'M205 455 L215 392 Q205 380 213 366 Q222 354 234 366 Q242 380 232 392 L242 455Z'};
LB.drawWatcherSil=(c,ink,o)=>{
  if(!LB.WATCHER_SIL.path)LB.WATCHER_SIL.path=new Path2D(LB.WATCHER_SIL.body);
  c.fillStyle=ink;
  if(o.sway!=null){c.save();c.translate(225,455);c.transform(1,0,o.sway,1,0,0);c.translate(-225,-455);c.fill(LB.WATCHER_SIL.path);c.restore()}
  else c.fill(LB.WATCHER_SIL.path);
  c.strokeStyle=ink;c.lineWidth=4;c.beginPath();c.moveTo(250,455);c.lineTo(250,334);c.stroke();
  const k=o.k,g=c.createRadialGradient(250,323,0,250,323,o.r*k);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(o.s,'rgba(255,200,110,.45)');g.addColorStop(1,'rgba(255,190,90,0)');c.fillStyle=g;c.fillRect(190,263,120,120);
  c.fillStyle=ink;c.beginPath();c.moveTo(242,314);c.lineTo(250,306);c.lineTo(258,314);c.closePath();c.fill();c.fillRect(241,331,18,4);
  c.fillStyle='#ffd27a';c.fillRect(243,314,14,17);c.fillStyle=ink;c.fillRect(247,314,1.5,17);c.fillRect(251.5,314,1.5,17);
};
