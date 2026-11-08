/* ---------- LB.drawWatcher : le Veilleur dessiné, commun à toute la série (session engine/watcher, 1er novembre 2026) ----------
   Un seul Veilleur, celui du Chapitre I : heaume à visière, manteau d'ordre, tabard à l'emblème de la lanterne, sceptre-lanterne
   avec sa petite cloche. Repère du Veilleur : origine aux pieds, x vers l'adversaire, y vers le bas ; manteau de -94 à 0,
   épaule (23, -78), main au repos (26, -62).
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
  lantern:{idle:'#ffe066',lit:'#fffbe3',recover:'#a88f4a',dark:[58,48,34]}
};
(function(){
  const W=LB.WATCHER_T,PI=Math.PI,cl=v=>v<0?0:v>1?1:v;
  const es=t=>t*t*(3-2*t);   /* lissage du Chapitre I */
  /* géométries du Chapitre I (repère du Veilleur) ; k = avancement de la pose, o = options */
  const staffIdle=()=>({staff:[[26,-2],[30,-140]],hand:[26,-62]});
  const staffUp=r=>({staff:[[26,-2-58*r],[30+18*r,-140-26*r]],hand:[26,-62-6*r]});
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
    hold:k=>({hand:[28,-94],sa:-1.5,L:76,glow:1,lit:1}),
    /* sceptre levé (garde de la phase III du Chapitre I, appel de la cloche, cinématiques) ; k = levée */
    raise:k=>({hand:[28,-62-32*k],sa:-.45-1.05*k,L:76,glow:k>0?1:.3,lit:k>0?1:0}),
    /* coup reçu : plié, sceptre baissé ; k = intensité */
    hurt:k=>({hand:[28,-62],sa:-.45+1.05*k,L:76,rot:.12*k,sy:1-.18*k,glow:.3}),
    /* à terre (défaite, prise relâchée) */
    down:k=>Object.assign(staffIdle(),{rot2:.12,sy:.82,glow:.25}),
    /* appel de la lumière (orbe, cloche) : comme la garde, lanterne allumée */
    cast:k=>Object.assign(staffUp(1),{glow:1,lit:1}),
    /* riposte : estoc du sceptre, lanterne en avant ; k = poussée */
    counter:k=>{const hand=[28+24*k,-60];return{hand,staff:[[hand[0]-34,hand[1]+6],[hand[0]+34,hand[1]-6]],glow:.6+.4*k,lit:1}},
    /* victoire : sceptre brandi au-dessus de la tête */
    victory:k=>({hand:[26,-100],sa:-1.45,L:76,glow:1,lit:1}),
    /* chute (fin de la phase II du Chapitre I) ; k = secondes écoulées */
    fall:k=>({hand:[34,-8],sa:-.12,L:80,body:{dy:44,s:.8},shoulder:[18.5,-18.5],armR:5.2,dx:-k*40,dy:k*140,rot:-k*5,glow:.35}),
    /* marche (arrivée sur le Clocher, prologue) : sceptre tenu devant, rebond des pas */
    walk:(k,o,t)=>({hand:[30,-68],sa:-.3,L:76,dy:-Math.abs(Math.sin(t*W.walk.f))*W.walk.bob,glow:.25})
  };
  /* corps : heaume, manteau, tabard, ceinture, épaulières (ex-drawWizard du Chapitre I) */
  function box(c,x,y,w,h,f,s){c.fillStyle=f;c.fillRect(x,y,w,h);if(s){c.strokeStyle=s;c.lineWidth=2;c.strokeRect(x,y,w,h)}}
  function poly(c,pts,f,s){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();
    c.fillStyle=f;c.fill();if(s){c.strokeStyle=s;c.lineWidth=2;c.stroke()}}
  LB.drawWatcherBody=(c,o)=>{
    const ctx=c,Wh=!!o.white,fl=o.fl||0;
    const cg=ctx.createLinearGradient(0,-96,0,0);if(Wh){cg.addColorStop(0,'#ffffff');cg.addColorStop(1,'#cfd7f2')}else{cg.addColorStop(0,'#3c4a6e');cg.addColorStop(1,'#1e2538')}
    ctx.beginPath();
    ctx.moveTo(-16,-92);ctx.quadraticCurveTo(-26,-50,-34,0);
    ctx.lineTo(-23,-5+fl);ctx.lineTo(-12,1-fl);ctx.lineTo(0,-5+fl);ctx.lineTo(12,1-fl);ctx.lineTo(23,-5+fl);ctx.lineTo(34,0);
    ctx.quadraticCurveTo(26,-50,16,-92);ctx.closePath();
    ctx.fillStyle=cg;ctx.fill();ctx.strokeStyle=Wh?'#8f9bc4':'#121726';ctx.lineWidth=2;ctx.stroke();
    /* tabard */
    ctx.beginPath();ctx.moveTo(-8,-88);ctx.lineTo(8,-88);ctx.lineTo(9,-8+fl*.4);ctx.lineTo(0,-2);ctx.lineTo(-9,-8+fl*.4);ctx.closePath();
    ctx.fillStyle=Wh?'#eef0f8':'#c9b98a';ctx.fill();ctx.strokeStyle=Wh?'#b9c2e0':'#8a7a5a';ctx.lineWidth=1.2;ctx.stroke();
    ctx.strokeStyle=Wh?'#9aa6cc':'#6b5036';ctx.lineWidth=1.8;
    ctx.beginPath();ctx.arc(0,-64,5,0,6.283);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-73);ctx.lineTo(0,-69);ctx.stroke();
    /* ceinture */
    box(ctx,-27,-44,54,6,Wh?'#d6dcef':'#4a3a2a',Wh?'#aab3d4':'#2a1e14');
    /* épaulières */
    for(const sx of[-1,1]){ctx.beginPath();ctx.ellipse(sx*15,-89,13,7,0,0,6.283);ctx.fillStyle=Wh?'#f2f5ff':'#5d6f96';ctx.fill();ctx.strokeStyle=Wh?'#8f9bc4':'#161b2b';ctx.lineWidth=1.5;ctx.stroke()}
    /* cape du heaume (nuque) */
    poly(ctx,[[-12,-112],[-28,-92],[-10,-94]],Wh?'#dfe5fa':'#2a3550');
    /* heaume */
    ctx.beginPath();ctx.moveTo(-15,-92);ctx.quadraticCurveTo(-19,-127,1,-128);ctx.quadraticCurveTo(20,-127,18,-92);ctx.closePath();
    ctx.fillStyle=Wh?'#f2f5ff':'#5d6f96';ctx.fill();ctx.strokeStyle=Wh?'#8f9bc4':'#161b2b';ctx.lineWidth=2;ctx.stroke();
    ctx.strokeStyle=Wh?'#e8dfc0':'#c9b98a';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-12,-119);ctx.quadraticCurveTo(1,-133,15,-119);ctx.stroke();
    ctx.strokeStyle=Wh?'#aab3d4':'#3a4a70';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-5,-99);ctx.lineTo(-5,-92);ctx.stroke();
    ctx.fillStyle=Wh?'#ffffff':'#bfeaff';ctx.fillRect(-1,-109,18,5);
  };
  /* verre éteint : mélange de la couleur vers W.lantern.dark (lamp = 1 : couleur intacte) */
  function dim(col,lamp){if(!(lamp<1))return col;const h=col.replace('#',''),n=parseInt(h.length===3?h.replace(/./g,'$&$&'):h,16),a=[n>>16&255,n>>8&255,n&255],d=W.lantern.dark,k=Math.max(0,lamp);
    return'rgb('+a.map((v,i)=>Math.round(d[i]+(v-d[i])*k)).join(',')+')'}
  /* lanterne : x, y = centre de la lumière ; ang oriente le haut ; g = intensité du halo (0 à 1) ; lamp = intensité de cinématique */
  LB.drawLantern=(c,x,y,g,col,ang,lamp)=>{
    const ctx=c,lp=lamp==null?1:lamp;
    ctx.save();ctx.translate(x,y);ctx.rotate(ang||0);
    const gl=Math.max(0,g)*(lp<1?Math.max(0,lp):1),rr=16+30*gl;
    if(lp>0){const rg=ctx.createRadialGradient(0,0,2,0,0,rr);
      rg.addColorStop(0,'rgba(255,245,215,'+(.35+.5*gl)*(lp<1?lp:1)+')');rg.addColorStop(.5,'rgba(255,226,140,'+(.12+.25*gl)*(lp<1?lp:1)+')');rg.addColorStop(1,'rgba(255,217,102,0)');
      ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,rr,0,6.283);ctx.fill()}
    poly(ctx,[[-9,-12],[0,-20],[9,-12]],'#6b5036');
    ctx.strokeStyle='#8a7a9a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-23,3,0,6.283);ctx.stroke();
    ctx.fillStyle=dim(col||W.lantern.idle,lp);ctx.fillRect(-8,-12,16,22);
    ctx.strokeStyle='#6b5036';ctx.lineWidth=2;ctx.strokeRect(-8,-12,16,22);
    ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-3,-12);ctx.lineTo(-3,10);ctx.moveTo(3,-12);ctx.lineTo(3,10);ctx.stroke();
    box(ctx,-10,10,20,4,'#4a3a2a','#2a1e14');
    /* petite cloche */
    ctx.strokeStyle='#8a7a9a';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(10,12);ctx.lineTo(14,16);ctx.stroke();
    ctx.beginPath();ctx.moveTo(10,26);ctx.quadraticCurveTo(10,16,14.5,16);ctx.quadraticCurveTo(19,16,19,26);ctx.closePath();
    ctx.fillStyle='#b8a46a';ctx.fill();ctx.strokeStyle='#6b5036';ctx.lineWidth=1;ctx.stroke();
    ctx.restore();
  };
  /* sceptre dans le repère de la main (axe x = direction du sceptre), lanterne au bout, à la distance L */
  LB.drawScepter=(c,L,g,col,lamp)=>{
    c.save();c.lineCap='round';c.strokeStyle='#8a7a9a';c.lineWidth=4;
    c.beginPath();c.moveTo(-18,0);c.lineTo(L-14,0);c.stroke();
    c.fillStyle='#6b5036';c.beginPath();c.arc(-18,0,3,0,6.283);c.fill();
    c.restore();
    LB.drawLantern(c,L,0,g,col,PI/2,lamp);
  };
  /* éclat de lanterne : rayon court entre deux points */
  LB.lanternBeam=(c,A,B,w,al)=>{
    c.save();c.lineCap='round';c.shadowColor='#ffd966';c.shadowBlur=24;
    c.strokeStyle='rgba(255,217,102,'+(.5*al)+')';c.lineWidth=w*1.8;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke();
    c.strokeStyle='rgba(255,255,255,'+al+')';c.lineWidth=w*.55;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke();
    c.shadowBlur=0;c.fillStyle='rgba(255,250,238,'+(.8*al)+')';c.beginPath();c.arc(B[0],B[1],w*.9,0,6.283);c.fill();
    c.restore();
  };
  /* bouclier de lumière (ellipse bleue du Chapitre I) devant le Veilleur : x, y = ses pieds ; t = temps écoulé dans l'action,
     act = durée de l'action (il s'affaiblit sur toute l'action) ; o.plain : sans contour ni lignes (garde de la phase III) */
  LB.drawBlock=(c,x,y,t,act,o)=>{
    const B=W.block,ramp=cl(t/B.ramp),a=(1-B.fade*t/act)*ramp,cx=x+82,cy=y-76,rx=34*(.6+.4*ramp),ry=92*(.8+.2*ramp);
    c.save();c.globalAlpha=a;
    const g=c.createRadialGradient(cx-18,cy,6,cx,cy,ry);
    g.addColorStop(0,'rgba(111,211,255,.06)');g.addColorStop(.7,'rgba(111,211,255,.2)');g.addColorStop(1,'rgba(191,234,255,.5)');
    c.fillStyle=g;c.shadowColor='#6fd3ff';c.shadowBlur=24;
    c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,6.283);c.fill();
    if(!(o&&o.plain)){
      c.shadowBlur=0;c.strokeStyle='#cdeeff';c.lineWidth=3;c.stroke();
      c.lineWidth=1;c.strokeStyle='rgba(205,238,255,.5)';
      for(const k of[.66,.33]){c.beginPath();c.ellipse(cx,cy,rx*k,ry,0,0,6.283);c.stroke()}
    }
    c.restore();
  };
  /* couleur du verre selon l'état du Veilleur (LB.hero) : rouge pendant un appui refusé, allumée, en récupération, au repos */
  LB.watcherLanternCol=(p,lit)=>p&&p.deny>0?LB.DENY_COL:lit?W.lantern.lit:p&&p.s==='recover'?W.lantern.recover:W.lantern.idle;
  function limb(c,a,b,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}
  /* lanterne simple des cinématiques lointaines : x, y = centre, s = échelle, g = intensité du halo */
  function flatLant(c,x,y,s,g){const P=(p,col)=>{c.fillStyle=col;c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill()};
    c.save();c.translate(x,y);c.scale(s,s);const rg=c.createRadialGradient(0,0,1,0,0,42);rg.addColorStop(0,'rgba(255,236,180,'+(.55*g)+')');rg.addColorStop(1,'rgba(255,200,110,0)');c.fillStyle=rg;c.beginPath();c.arc(0,0,42,0,6.283);c.fill();P([[-9,-12],[0,-20],[9,-12]],'#6b5036');c.fillStyle='#ffd27a';c.fillRect(-8,-12,16,22);c.strokeStyle='#6b5036';c.lineWidth=2;c.strokeRect(-8,-12,16,22);c.lineWidth=1.2;c.beginPath();c.moveTo(-3,-12);c.lineTo(-3,10);c.moveTo(3,-12);c.lineTo(3,10);c.stroke();c.fillStyle='#4a3a2a';c.fillRect(-10,10,20,4);c.restore()}
  /* silhouette lointaine des cinématiques (outro du Chapitre I) : aplats sans contour, lanterne simple */
  function flat(c,x,y,s,lamp){
    const P=(p,col)=>{c.fillStyle=col;c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill()};
    c.save();c.translate(x,y);c.scale(s,s);P([[-16,-92],[-34,0],[34,0],[16,-92]],'#2a3550');c.fillStyle='#c9b98a';c.fillRect(-8,-88,16,82);
    for(const sx of[-1,1]){c.fillStyle='#5d6f96';c.beginPath();c.ellipse(sx*15,-89,13,7,0,0,6.283);c.fill()}
    c.fillStyle='#5d6f96';c.beginPath();c.moveTo(-15,-92);c.quadraticCurveTo(-19,-127,1,-128);c.quadraticCurveTo(20,-127,18,-92);c.closePath();c.fill();c.fillStyle='#bfeaff';c.fillRect(-1,-109,18,5);
    c.strokeStyle='#8a7a9a';c.lineWidth=4;c.beginPath();c.moveTo(26,-2);c.lineTo(30,-140);c.stroke();c.restore();flatLant(c,x+30*s,y+(-152)*s,s,lamp);
    return{lx:x+30*s,ly:y+(-152)*s};
  }
  /* contre-jour, de dos (outro du Chapitre I : le Veilleur regarde le phare) : une seule encre, lanterne simple */
  function back(c,x,y,ink,lamp){
    c.fillStyle=ink;c.beginPath();c.moveTo(x-16,y-92);c.lineTo(x-30,y);c.lineTo(x+30,y);c.lineTo(x+16,y-92);c.closePath();c.fill();
    for(const sx of[-1,1]){c.beginPath();c.ellipse(x+sx*15,y-89,13,7,0,0,6.283);c.fill()}
    c.beginPath();c.moveTo(x-15,y-92);c.quadraticCurveTo(x-18,y-126,x,y-127);c.quadraticCurveTo(x+18,y-126,x+15,y-92);c.closePath();c.fill();
    c.strokeStyle=ink;c.lineWidth=4;c.beginPath();c.moveTo(x+24,y-2);c.lineTo(x+30,y-132);c.stroke();flatLant(c,x+31,y-146,.85,lamp);
    return{lx:x+31,ly:y-146};
  }
  LB.drawWatcher=(c,x,y,pose,t,opt)=>{
    const o=opt||{},k=o.k==null?1:o.k,P=LB.WATCHER_POSES[pose]||LB.WATCHER_POSES.idle,g=Object.assign({},P(k,o,t||0));
    for(const n in o)if(o[n]!==undefined&&n!=='k')g[n]=o[n];
    if(o.sa!=null||o.staffA!=null)g.staff=undefined;if(o.staff)g.sa=undefined;   /* la façon de tenir le sceptre donnée par le chapitre l'emporte */
    const X=x+(g.dx||0),Y=y+(g.dy||0);
    if(o.flat)return flat(c,X,Y,g.scale||1,g.lamp==null?1:g.lamp);
    if(o.ink)return back(c,X,Y,o.ink,g.lamp==null?1:g.lamp);
    /* sceptre tenu par son angle (Chapitre II) : la main suit, le bâton passe dans la main */
    if(g.staffA!=null&&!o.staff&&o.sa==null){const A=g.staffA,up=cl((-1.42-A)/.45),dx=Math.cos(A),dy=Math.sin(A),h=[26+dx*4,-62-6*up];
      g.hand=o.hand||h;g.staff=[[g.hand[0]-dx*60,g.hand[1]-dy*60],[g.hand[0]+dx*80,g.hand[1]+dy*80]];g.sa=undefined;
      if(o.glow==null)g.glow=up>.3?1:.25;if(o.lit==null)g.lit=up>.3?1:0}
    const br=W.breath,breathe=o.breath!=null?o.breath:pose==='idle',bob=breathe?Math.sin((t||0)*br.bobF)*br.bob*.5:0;
    const fl=o.fl!=null?o.fl:breathe?Math.sin((t||0)*br.flF)*br.fl:0;
    const col=g.lanternCol||(g.lit?W.lantern.lit:W.lantern.idle),glow=g.glow==null?.25:g.glow,lamp=g.lamp==null?1:g.lamp;
    const sh=g.shoulder||[23,-78],hand=g.hand||[26,-62],sc=g.scale||1;
    c.save();c.translate(X,Y);
    if(g.rot)c.rotate(g.rot);if(g.rot2)c.rotate(g.rot2);
    const sx=(g.sx==null?1:g.sx)*sc,sy=(g.sy==null?1:g.sy)*sc;if(sx!==1||sy!==1)c.scale(sx,sy);
    const au=g.aura||0;
    if(au>0){const r=70+60*au,gr=c.createRadialGradient(0,-10,6,0,-10,r);
      gr.addColorStop(0,'rgba(255,255,255,'+(.7*au)+')');gr.addColorStop(.5,'rgba(255,226,140,'+(.3*au)+')');gr.addColorStop(1,'rgba(255,217,102,0)');
      c.fillStyle=gr;c.beginPath();c.arc(0,-10,r,0,6.283);c.fill()}
    if(bob)c.translate(0,bob);
    /* corps (voile blanc : une seconde couche, opacité white) */
    const body=w=>{if(g.body){c.save();c.translate(0,g.body.dy||0);c.scale(g.body.s||1,g.body.s||1);LB.drawWatcherBody(c,{fl,white:w});c.restore()}else LB.drawWatcherBody(c,{fl,white:w})};
    const wv=g.white;if(wv===true||wv===1)body(true);else{body(false);if(wv>0){c.save();c.globalAlpha*=wv;body(true);c.restore()}}
    /* bras */
    limb(c,sh,hand,9,'#2a3550');c.fillStyle='#2a3550';c.beginPath();c.arc(sh[0],sh[1],g.armR||6.5,0,6.283);c.fill();
    const sa=g.staffAlpha==null?1:g.staffAlpha;if(sa<1){c.save();c.globalAlpha*=Math.max(0,sa)}
    let L=null;
    if(g.staff){
      /* bâton tenu : talon, main, lanterne au sommet */
      const [sb,st]=g.staff;
      c.strokeStyle='#8a7a9a';c.lineWidth=4;c.beginPath();c.moveTo(sb[0],sb[1]);c.lineTo(st[0],st[1]);c.stroke();
      c.fillStyle='#cdb69a';c.beginPath();c.arc(hand[0],hand[1],5,0,6.283);c.fill();
      LB.drawLantern(c,st[0],st[1],glow,col,Math.atan2(st[1]-sb[1],st[0]-sb[0])+PI/2,lamp);
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
      c.fillStyle='#cdb69a';c.beginPath();c.arc(hand[0],hand[1],5,0,6.283);c.fill();
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
