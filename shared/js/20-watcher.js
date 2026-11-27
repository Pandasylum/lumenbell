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
     breath        repos vivant (respiration, regard, cape, hampe, lanterne, flamme, visière ; décision n° 5 du 28 octobre, référence du
                   27 novembre) : vrai par défaut pour idle seulement ; false fige aussi le vent dans la cape
     staffAlpha    opacité du sceptre (0 à 1)
     flat          silhouette lointaine (aplats, lanterne simple) ;  ink  contre-jour de dos, d'une seule encre
     inFrame(ctx, g)  dessin du chapitre dans le repère du Veilleur, après lui (rayon d'un contre, anneau de prise)
     anim          false : ni suivi ni retombée ; objet : remplace des valeurs des courbes du corps (x, y, sx, sy, lean, souffle, tete,
                   bras, bx, by, cape, capeUp, vent, lampe, flamme, clin)
     choc          choc reçu sur la garde (0 à 1, LB.watcherChoc aide à le calculer) : recul, cape soulevée ; non branché
     fx            false : sans les effets des gestes de lumière (orb, lunge, ring, halo)
     id            identifiant du Veilleur pour le suivi des poses, si deux Veilleurs partagent un canvas et une position
   Animation (référence validée du 27 novembre) : elle se cale sur la pose et l'horloge déjà données, sans rien changer aux états
   de LB.hero. Repos vivant ; garde (block, hold) : élan d'appui ; esquive (dodgeSide, dodgeDown) : ramassé, saut, réception ;
   retour au repos : retombée (fondu depuis la dernière image). Mouvement réduit : ni repos vivant, ni élan, ni vent, ni particules.
   Renvoie {lx, ly, shake} : centre de la lanterne dans le repère de l'appelant (départ des tirs), secousse d'écran suggérée (px). */
LB.WATCHER_T={
  walk:{bob:4,f:9.8},                               /* marche : rebond (px), fréquence */
  raise:.08,                                        /* montée du sceptre (s) au début d'une garde */
  block:{ramp:.07,fade:.45},                        /* bouclier : apparition (s), affaiblissement sur la durée de l'action */
  lantern:{idle:'#ffe066',lit:'#fffbe3',recover:'#a88f4a',dark:[58,48,34]},
  flame:{f1:31,f2:57,a1:.12,a2:.06,fs:19,sway:1.2},   /* flamme : vacillement (rad/s, amplitudes) et balancement de la pointe (px) ; fixe en mouvement réduit */
  bell:{f:12.6,a:.16},                              /* clochette : balancement (rad/s, rad) ; immobile en mouvement réduit */
  /* animation (référence validée du 27 novembre, docs/decisions/2026-11-27-veilleur-animations.md) : elle se cale sur les poses et
     l'horloge que le chapitre donne déjà, sans toucher aux états, fenêtres ni durées de LB.hero */
  idle:{loop:4.4},                                  /* repos vivant : boucle du regard et de l'éclat de visière (s) */
  wind:{f:5.2,ph:1.9},                              /* vent dans la cape : fréquence (rad/s), déphasage des deux pans */
  arm:{len:23,pivot:[12,-76]},                      /* bras : deux segments fixes (px, à l'échelle de armR), pivot du geste près de l'épaule */
  anim:{rise:.1,crouch:.08,into:.06,fall:.3,land:.26,dust:.8,guard:{block:1,hold:.5}},
    /* élan d'une garde (rise), ramassé d'une esquive (crouch), fondu vers une garde ou une esquive (into), retombée vers le repos (fall),
       tassement de réception (land), poussière (dust) ; guard = force de l'élan par pose de garde (s) */
  moves:{orb:{T:1.1,dur:2.4},lunge:{T:.68,dur:2.2},ring:{T:.85,dur:2.2},halo:{T:.9,dur:2.6}}
    /* poses orbe, élan, bague, halo : T = instant où la lumière part ou frappe, dur = durée totale (s, depuis le début de la pose) */
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
    walk:(k,o,t)=>({hand:[40,-66],sa:-.3,L:76,dy:-Math.abs(Math.sin(t*W.walk.f))*W.walk.bob,glow:.25}),
    /* gestes de lumière de la référence (exposés, branchés par les chapitres) ; k = secondes écoulées depuis le début du geste,
       W.moves donne l'instant d'effet T et la durée. Le corps suit les courbes de MOVES, les effets sont dessinés sauf opt.fx === false. */
    orb:k=>Object.assign(staffIdle(),{glow:.25}),     /* orbe : lève la lanterne, rassemble la lumière, la lance */
    lunge:k=>Object.assign(staffIdle(),{glow:.25}),   /* élan : fonce lanterne en avant, revient d'un bond */
    ring:k=>Object.assign(staffIdle(),{glow:.25}),    /* bague : lève la hampe et la frappe au sol (onde) */
    halo:k=>Object.assign(staffIdle(),{glow:.25})     /* halo : se dresse, toute la lumière s'ouvre */
  };
  /* ---- courbes du corps (référence validée, tableau V) : décalage x, y ; échelles sx, sy ; penché lean (depuis les pieds) ;
     souffle (haut du corps) ; tete (inclinaison) ; bras (rotation du geste autour du pivot), bx, by (déplacement de la main et du bâton) ;
     cape (ampleur), capeUp (soulèvement), vent (force du vent) ; lampe (balancement de la lanterne) ; flamme (éclat) ; clin (éclat de visière) */
  const Z0={x:0,y:0,sx:1,sy:1,lean:0,souffle:0,tete:0,bras:0,bx:0,by:0,cape:0,capeUp:0,vent:1,lampe:0,flamme:1,clin:0};
  const ez=u=>es(cl(u)),arc=u=>Math.sin(cl(u)*PI);
  /* réaction : monte en 80 ms, tient (hold), revient en d */
  const choc=(t,t0,d,hold)=>{const u=t-t0,h=hold==null?.2:hold;if(u<0)return 0;if(u<.08)return u/.08;if(u<.08+h)return 1;return Math.pow(1-cl((u-.08-h)/d),2)};
  LB.watcherChoc=choc;
  const A0=()=>Object.assign({},Z0);
  /* repos vivant : respiration, regard, cape, hampe, lanterne, flamme, éclat de visière */
  function idleA(t){const o=A0(),r=Math.sin(t*2.9),L=W.idle.loop,tt=((t%L)+L)%L;
    o.souffle=r*1.5;o.sy=1+.008*r;o.tete=.07*(ez((tt-1.2)/.4)-ez((tt-2.6)/.4))+.012*Math.sin(t*2.9-.8);o.bras=.028*Math.sin(t*1.45);o.by=.8*Math.sin(t*2.9-.5);
    o.vent=1.5+.8*Math.sin(t*1.1);o.cape=.04*Math.sin(t*2.2);o.lampe=.09*Math.sin(t*2.9-1.2);o.flamme=1+.07*Math.sin(t*11)+.05*Math.sin(t*23);o.clin=arc((tt-3.1)/.35);return o}
  /* garde : appui planté (a = élan, 0 à 1), choc reçu (h, 0 à 1, passé par le chapitre dans opt.choc) */
  function guardA(a,h){const o=A0();
    o.sy=1-.07*a;o.lean=.06*a-.14*h;o.x=-13*Math.min(1,h*1.5);o.bras=.28*a-.1*h;o.bx=5*a;o.tete=.08*a-.14*h;o.capeUp=.1*h;o.cape=.12*h;o.vent=1+2.5*h;o.flamme=1+.5*a+.8*h;o.lampe=-.2*h;return o}
  /* esquive : ramassé (acc), en l'air (air) */
  function dodgeA(acc,air){const o=A0();
    o.y=-22*air;o.sy=1-.18*acc+.07*air;o.sx=1+.1*acc-.05*air;o.lean=-.1*air+.05*acc;o.cape=-.22*air;o.capeUp=-.22*air;o.vent=1+2*air;o.lampe=.35*air;o.bras=.14*air;o.tete=.08*acc;return o}
  const MOVES={
    orb:t=>{const o=A0(),T=W.moves.orb.T,arm=ez(t/.55)*(1-ez((t-.9)/.14)),jet=ez((t-.95)/.16)*(1-ez((t-1.6)/.55)),rec=choc(t,T,.45,0);
      o.bras=-.34*arm+.46*jet;o.by=-9*arm;o.bx=-4*arm+9*jet;o.lean=-.09*arm+.13*jet-.05*rec;o.sy=1+.04*arm-.06*jet;o.tete=-.12*arm+.08*jet;o.x=-5*rec;
      o.capeUp=.14*arm-.08*jet;o.cape=.14*jet;o.vent=1+1.8*(arm+jet);o.flamme=1+.9*arm+.5*jet;o.lampe=.2*jet-.1*arm;o.arm=arm;return o},
    lunge:t=>{const o=A0(),acc=ez(t/.35)*(1-ez((t-.45)/.1)),go=ez((t-.45)/.2),ret=ez((t-1.15)/.55),vit=go*(1-ez((t-.8)/.2)),b=arc((t-1.15)/.55);
      o.sy=1-.16*acc-.06*vit;o.sx=1+.08*acc+.06*vit;o.lean=-.08*acc+.26*vit;o.x=-8*acc+150*go*(1-ret);o.y=-22*b;o.bras=-.2*acc+.62*vit;o.bx=-4*acc+8*vit;
      o.cape=.42*vit-.14*b;o.capeUp=.12*vit;o.vent=1+3*vit;o.flamme=1+vit;o.lampe=-.15*vit;o.tete=.06*vit;o.vit=vit;return o},
    ring:t=>{const o=A0(),T=W.moves.ring.T,leve=ez(t/.55)*(1-ez((t-.74)/.11)),bas=ez((t-.74)/.11)*(1-ez((t-1.5)/.5)),h=choc(t,T,.4,0);
      o.by=-22*leve+3*bas;o.bras=-.14*leve+.04*bas;o.sy=1+.05*leve-.11*bas;o.sx=1+.06*bas;o.tete=-.1*leve+.14*bas;o.lean=-.04*leve+.06*bas;
      o.capeUp=-.05*leve+.28*h;o.cape=.2*h;o.vent=1+3*h;o.flamme=1+.4*leve+1.2*h;o.lampe=.18*Math.sin((t-T)*26)*h;o.shake=8*choc(t,T,.2,0);return o},
    halo:t=>{const o=A0(),T=W.moves.halo.T,m=ez(t/.7),p=ez((t-.85)/.15),fin=1-ez((t-1.9)/.55);
      o.by=-24*m*fin;o.bx=-5*m*fin;o.bras=-.2*m*fin;o.sy=1+.07*m*fin;o.lean=-.1*m*fin-.06*choc(t,T,.6,.2);o.tete=-.18*m*fin;o.capeUp=(.12*m+.18*p)*fin;
      o.cape=.18*p*fin;o.vent=1+3*p*fin;o.flamme=1+(m+p)*fin;o.x=-6*choc(t,T,.7,.3);o.clin=p*fin;o.shake=6*choc(t,T,.4,0);o.r0=ez((t-.2)/.8)*fin;o.p=p;return o}
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
  /* cape large de la maquette (pointe vers x = -110) ; w, v = les deux pans du vent. Chemins neufs à chaque image quand le vent souffle
     (Path2D seulement, aucun canvas), mis en cache au repos */
  const q8=n=>Math.round(n*8)/8,
    capeD=(w,v)=>'M6 -102C-16 -100 -29 -84 -40 -65C-56 -46 '+(-80+v*6)+' '+(-45+w*5)+' '+(-110+w*8)+' '+(-52+v*8)+'C'+(-96+w*4)+' '+(-33+v*3)+' '+(-81+v*4)+' -25 '+(-94+v*6)+' '+(-12+w*3)+'C-66 -14 -46 -7 -30 -3L8 -6C13 -34 18 -68 15 -95Z',
    capeLit=(w,v)=>'M-4 -94C-28 -68 -54 -50 '+(-104+w*8)+' '+(-52+v*8)+'C-72 -40 -36 -52 -8 -76Z',
    capeSh=(w,v)=>'M-4 -72C-20 -44 -42 -25 '+(-88+v*6)+' '+(-15+w*4)+'C-62 -11 -38 -15 -30 -19C-17 -31 -6 -48 1 -61Z',
    capeLit2='M-2 -58C-8 -34 -18 -14 -32 -3L-17 -3C-8 -21 -1 -38 3 -52Z';
  function capeP(w,v){w=q8(w);v=q8(v);const mk=!w&&!v?Pd:d=>new Path2D(d);return[mk(capeD(w,v)),mk(capeLit(w,v)),mk(capeSh(w,v))]}
  /* repère de la cape (ampleur, soulèvement, souffle) et du haut du corps (souffle, inclinaison de la tête) */
  function capeT(c,A){c.translate(6,-96+(A.souffle||0));if(A.capeUp)c.rotate(A.capeUp);if(A.cape)c.scale(1+A.cape,1);c.translate(-6,96)}
  function hautT(c,A){if(A.souffle)c.translate(0,A.souffle);if(A.tete){c.translate(5,-90);c.rotate(A.tete);c.translate(-5,90)}}
  /* mantelet (aussi redessiné sur la naissance du bras, qui sort dessous) */
  function mantle(c,P){pc(c,B9.mant,P.mant,[B9.mantLit,P.lit,B9.mantSh,P.sh]);tr(c,B9.hem,P.hem,1)}
  /* pièce : aplat, puis ses plans nets dans sa forme */
  function pc(c,d,fill,planes){const p=Pd(d);c.fillStyle=fill;c.fill(p);if(planes){c.save();c.clip(p);for(let i=0;i<planes.length;i+=2){c.fillStyle=planes[i+1];c.fill(Pd(planes[i]))}c.restore()}}
  function tr(c,d,col,w){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(Pd(d))}
  const RIM=[1.3,-.9];   /* décalage du liseré : vers la lanterne */
  /* corps : cape, bottes, robe, tabard, ceinture, mantelet, capuche-heaume et visière. o.fl = pans (sans vent), o.white = palette blanche,
     o.rim = force du liseré (0 à 1), o.flat = silhouette lointaine (aplats seuls). Animation (LB.drawWatcher) : o.cw, o.cv = pans du vent,
     o.cape, o.capeUp, o.souffle, o.tete, o.clin (voir les courbes du corps) */
  LB.drawWatcherBody=(c,o)=>{
    const Wh=!!o.white,P=Wh?PAL.w:PAL.n,fla=!!o.flat,rim=Wh||fla?0:(o.rim||0),f=Math.max(-12,Math.min(12,o.fl||0))/5,
      CP=capeP(o.cw!=null?o.cw:f,o.cv!=null?o.cv:f),A={souffle:o.souffle||0,tete:o.tete||0,cape:o.cape||0,capeUp:o.capeUp||0};
    const cg=grad(c,Wh?'cw':'cn',()=>lin(c,8,-96,-100,-20,[[0,P.c0],[1,P.c1]])),tg=grad(c,Wh?'tw':'tn',()=>lin(c,24,-89,2,-10,[[0,P.t0],[1,P.t1]]));
    if(rim>0){c.save();c.translate(RIM[0],RIM[1]);c.fillStyle='rgba('+P.rim+','+Math.min(1,rim)+')';
      c.save();capeT(c,A);c.fill(CP[0]);c.restore();
      for(const d of[B9.farBoot,B9.robe,B9.boot])c.fill(Pd(d));
      c.save();hautT(c,A);c.fill(Pd(B9.mant));c.fill(Pd(B9.hood));c.restore();c.restore()}
    c.save();capeT(c,A);c.fillStyle=cg;c.fill(CP[0]);
    if(!fla){c.save();c.clip(CP[0]);c.fillStyle=P.lit;c.fill(CP[1]);c.fillStyle=P.sh;c.fill(CP[2]);c.fillStyle=P.lit;c.fill(Pd(capeLit2));c.restore()}
    c.restore();
    if(fla){for(const [d,col] of[[B9.farBoot,P.far],[B9.robe,P.robe],[B9.boot,P.boot],[B9.tab,tg],[B9.belt,P.belt]])pc(c,d,col);
      c.save();hautT(c,A);for(const [d,col] of[[B9.mant,P.mant],[B9.hood,P.hood],[B9.visor,P.visor]])pc(c,d,col);c.restore();return}
    pc(c,B9.farBoot,P.far);
    pc(c,B9.robe,P.robe,[B9.robeSh,P.sh,B9.robeLit,P.lit]);
    pc(c,B9.boot,P.boot,[B9.bootLit,P.lit]);
    pc(c,B9.tab,tg,[B9.tabSh,P.tsh]);tr(c,B9.fold,P.fold,.9);tr(c,B9.emb,P.emb,1.6);
    pc(c,B9.belt,P.belt,[B9.beltHi,P.beltHi]);pc(c,B9.buckle,P.buckle);pc(c,B9.pouch,P.pouch);
    c.save();hautT(c,A);mantle(c,P);hood(c,P,o.clin||0);c.restore();
  };
  /* capuche-heaume et visière (lueur douce en dégradé fixe, plus faible que la lanterne) ; cl = éclat de visière (0 à 1, sans flou) */
  function hood(c,P,cl){
    pc(c,B9.hood,P.hood,[B9.hoodLit,P.lit,B9.hoodSh,P.hoodSh]);tr(c,B9.trim,P.trim,3);
    const vg=grad(c,P===PAL.w?'vw':'vn',()=>{const g=c.createRadialGradient(16,-107,1,16,-107,11);g.addColorStop(0,'rgba('+P.vg+',.42)');g.addColorStop(1,'rgba('+P.vg+',0)');return g});
    c.fillStyle=vg;c.fillRect(5,-118,22,22);
    c.fillStyle=P.visor;c.fill(Pd(B9.visor));c.fillRect(14.6,-108,2.5,13);
    if(cl>.01){c.save();c.globalAlpha*=Math.min(1,cl);c.fillStyle=vg;c.fillRect(5,-118,22,22);c.fillStyle='#fffbea';c.fill(Pd('M8 -113L26 -111L23 -106L9 -107Z'));c.fillRect(14.2,-109,3.4,15);c.restore()}
  }
  /* bras proche, de l'épaule S à la main h : deux segments de longueur fixe (W.arm.len, à l'échelle de r = rayon de l'épaule), l'épaule ne
     bouge pas, le coude plie (sous la ligne épaule-main quand la main est devant). Il sort de sous le mantelet, en arrière sur le flanc, et
     passe devant le torse. Main hors d'atteinte : elle s'arrête au bout du bras tendu. Renvoie l'épaule S, le coude E et la main H. */
  function sleeve(c,S,h,r,P,rim){
    const k=r/6.5,L=W.arm.len*k,dx=h[0]-S[0],dy=h[1]-S[1],a=Math.atan2(dy,dx),d=Math.min(2*L-.1,Math.max(.5,Math.hypot(dx,dy))),b=Math.acos(d/(2*L)),
      E=[S[0]+L*Math.cos(a+b),S[1]+L*Math.sin(a+b)],H=[S[0]+d*Math.cos(a),S[1]+d*Math.sin(a)],w=10*k;
    const path=(ox,oy)=>{c.beginPath();c.moveTo(S[0]+ox,S[1]+oy);c.lineTo(E[0]+ox,E[1]+oy);c.lineTo(H[0]+ox,H[1]+oy)};
    c.lineCap='round';c.lineJoin='round';
    if(rim>0){c.strokeStyle='rgba('+P.rim+','+Math.min(1,rim)+')';c.lineWidth=w;path(RIM[0],RIM[1]);c.stroke()}
    c.strokeStyle=P.arm;c.lineWidth=w;path(0,0);c.stroke();
    c.strokeStyle=P.armLit;c.lineWidth=1.6*k;path(0,-3.4*k);c.stroke();
    /* poignet : bande en travers de l'avant-bras, près de la main */
    const fl=Math.hypot(H[0]-E[0],H[1]-E[1])||1,ux=(H[0]-E[0])/fl,uy=(H[1]-E[1])/fl,cx=H[0]-7*k*ux,cy=H[1]-7*k*uy,n=4.3*k;
    c.strokeStyle=P.cuff;c.lineWidth=5*k;c.beginPath();c.moveTo(cx+uy*n,cy-ux*n);c.lineTo(cx-uy*n,cy+ux*n);c.stroke();
    return{S,E,H};
  }
  /* main fermée sur le sceptre ; a = direction du sceptre */
  /* main fermée sur le sceptre, vue de dos : a = direction du sceptre (vers la lanterne), E = coude (l'avant-bras arrive de là).
     Poignet du côté de l'avant-bras, doigts qui font le tour du bâton de l'autre côté, pouce replié vers la lanterne. */
  function fist(c,h,a,E){const n=[-Math.sin(a),Math.cos(a)],e=E?[h[0]-E[0],h[1]-E[1]]:n,sd=(e[0]*n[0]+e[1]*n[1])>0?-1:1;
    c.save();c.translate(h[0],h[1]);c.rotate(a);
    c.fillStyle='#d4ac86';c.beginPath();c.ellipse(0,sd*.6,4.4,5.4,0,0,6.283);c.fill();
    c.fillStyle='#b88e6c';c.beginPath();c.ellipse(-.4,-sd*3.2,4,1.9,0,0,6.283);c.fill();   /* doigts repliés derrière le bâton */
    c.strokeStyle='rgba(90,48,40,.6)';c.lineWidth=.8;c.beginPath();
    for(const x of[-1.5,1.3]){c.moveTo(x,-sd*1.4);c.lineTo(x,-sd*4.6)}c.stroke();
    c.fillStyle='rgba(255,226,180,.55)';c.beginPath();c.ellipse(1.2,sd*2,2.2,1.5,0,0,6.283);c.fill();
    c.fillStyle='#e2bf98';c.beginPath();c.ellipse(3.4,sd*.9,2.5,1.5,sd*.5,0,6.283);c.fill();   /* pouce, vers la lanterne */
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
  /* sceptre dans le repère de la main (axe x = direction du sceptre), lanterne au bout, à la distance L ; sw = balancement de la lanterne (rad) */
  LB.drawScepter=(c,L,g,col,lamp,sw)=>{
    c.save();pole(c,-18,0,L-17,0);c.restore();
    LB.drawLantern(c,L,0,g,col,PI/2+(sw||0),lamp);
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
  /* ---- effets de la référence (étoiles, éclats, onde, halo, traits de vitesse) : aplats sans flou ni canvas, mesurés à l'échelle 2,65
     de la référence et ramenés au Veilleur (ZR) ; dessinés dans le repère des pieds de départ (x, y de l'appel, échelle scale), sol en y = 0 */
  const ZR=1/2.65;
  function star(c,x,y,r,n,rot,col,k){if(!(r>0))return;k=k==null?.42:k;c.fillStyle=col;c.beginPath();
    for(let i=0;i<n*2;i++){const a=rot+i*PI/n,d=i%2?r*k:r*(i%4?1:.72),px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(i)c.lineTo(px,py);else c.moveTo(px,py)}c.closePath();c.fill()}
  /* éclats projetés : t = secondes depuis le choc (vie W.anim.dust), v = vitesse, gv = gravité */
  function shards(c,x,y,t,n,cols,v,seed,gv){const D=W.anim.dust;if(t<0||t>D)return;let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;
    for(let i=0;i<n;i++){const a=-PI*.5+(r()-.5)*4,sp=v*(.4+r()),px=x+Math.cos(a)*sp*t,py=Math.min(1.5,y+Math.sin(a)*sp*t+gv*t*t),d=(3+r()*7)*ZR*(1-t/D),q=r()*6+t*9;
      c.fillStyle=cols[i%cols.length];c.beginPath();c.moveTo(px+Math.cos(q)*d,py+Math.sin(q)*d);c.lineTo(px+Math.cos(q+2.2)*d,py+Math.sin(q+2.2)*d);
      c.lineTo(px+Math.cos(q+4)*d*.7,py+Math.sin(q+4)*d*.7);c.closePath();c.fill()}}
  /* derrière le Veilleur : anneaux du halo autour de la lanterne (Lx, Ly) */
  function fxBack(c,pose,A,t,Lx,Ly){
    if(pose!=='halo'||!(A.r0>0))return;const R=[[162,.16],[113,.24],[72,.4],[38,.8]];
    for(let i=0;i<4;i++){const rr=R[i][0]*A.r0*(1+.5*A.p);if(rr<=2)continue;c.fillStyle='rgba(255,226,130,'+R[i][1]+')';c.beginPath();
      for(let j=0;j<20;j++){const q=j*PI/10+t*(i%2?.5:-.5),px=Lx+Math.cos(q)*rr,py=Ly+Math.sin(q)*rr;if(j)c.lineTo(px,py);else c.moveTo(px,py)}c.closePath();c.fill()}}
  /* devant le Veilleur : lumière rassemblée puis lancée (orbe), traits de vitesse et éclair (élan), onde au sol et éclats (bague) ;
     fx = pieds du Veilleur ; rm = mouvement réduit (ni particules ni éclats) */
  function fxFront(c,pose,A,t,Lx,Ly,fx,rm){
    if(pose==='orb'){const arm=A.arm;
      if(t<.98){if(!rm){let s=4;const r=()=>(s=(s*16807)%2147483647)/2147483647;
          for(let i=0;i<16;i++){const a=r()*2*PI,ph=(t*1.6+r())%1,d=(1-ph)*190*ZR;star(c,Lx+Math.cos(a)*d,Ly+Math.sin(a)*d,(9*ph+2)*ZR,4,a,'rgba(255,230,140,'+arm*ph+')',.35)}}
        if(arm>.05){star(c,Lx,Ly,76*ZR*arm,6,t*5,'rgba(255,214,110,.5)',.55);star(c,Lx,Ly,44*ZR*arm,6,-t*4,'#ffe58a',.62)}}
      else{const u=cl((t-.98)/.4);if(u<1){const px=Lx+u*u*800*ZR;
        for(let i=1;i<6;i++)star(c,px-i*34*ZR,Ly,(26-i*4)*ZR,4,i+t*9,'rgba(255,224,130,'+(.85-i*.14)+')',.35);
        star(c,px,Ly,70*ZR,6,t*8,'#f2b640',.58);star(c,px,Ly,36*ZR,6,-t*8,'#fffbea',.7)}}}
    else if(pose==='lunge'){const vit=A.vit;
      if(vit>.05){c.fillStyle='rgba(255,232,150,.7)';for(let i=0;i<7;i++){const yy=(-330+i*46)*ZR,x0=fx-170*ZR;
        c.beginPath();c.moveTo(x0,yy);c.lineTo(x0-(180+(i%3)*90)*ZR*vit,yy+5*ZR);c.lineTo(x0,yy+11*ZR);c.closePath();c.fill()}}
      const u=t-W.moves.lunge.T;if(u>0&&u<.22){star(c,Lx+40*ZR,Ly,120*ZR*(1-u*3),10,.2,'#ffe58a',.4);star(c,Lx+40*ZR,Ly,60*ZR*(1-u*3),10,.5,'#fffbea')}}
    else if(pose==='ring'){const T=W.moves.ring.T,u=cl((t-T)/.7),x0=fx+34;
      if(t>T&&u<1){const S=[['#ffe9a0',18],['#fffbea',6],['#d9a23c',3]];c.save();c.globalAlpha*=1-u*u;
        for(let i=0;i<3;i++){const rx=(40+u*700-i*12)*ZR;c.strokeStyle=S[i][0];c.lineWidth=S[i][1]*ZR;c.beginPath();c.ellipse(x0,4*ZR,rx,rx*.12,0,0,2*PI);c.stroke()}c.restore()}
      if(!rm)shards(c,x0,0,t-T,18,['#ffe58a','#654055'],340*ZR,17,800*ZR)}
  }
  /* ---- mémoire d'animation par Veilleur dessiné (canvas, puis opt.id ou position x) : pose en cours et son début, dernière image (pour
     la retombée, seulement entre repos, garde et esquive), sens de l'esquive, poussières. Elle ne lit que pose, k et l'horloge t ; rien n'est lu par la logique du jeu. */
  const MEM=new WeakMap(),AUTO={idle:1,block:1,hold:1,dodgeSide:1,dodgeDown:1},DODGE={dodgeSide:1,dodgeDown:1};
  function slot(c,id){let m=MEM.get(c);if(!m){m=new Map();MEM.set(c,m)}let s=m.get(id);
    if(!s){if(m.size>8)m.clear();s={pose:'',t0:0,lt:-1e9,lk:0,dir:0,fin:null,bl:null,ev:[]};m.set(id,s)}return s}
  const nr=a=>a-2*PI*Math.round(a/(2*PI)),mx=(a,b,e)=>a+(b-a)*e,mx2=(a,b,e)=>[a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e],
    MIXN=['souffle','tete','cape','capeUp','vent','lampe','flamme','clin','X','Y','SX','SY','ar','bs','bdy'],MIX2=['S','h','sb','st'];
  /* courbes du corps de la pose (repos, garde, esquive, geste de lumière) ; s = mémoire (poses suivies) */
  function curves(pose,k,t,o,s,rm,u){
    const mv=MOVES[pose];if(mv)return mv(k);
    const br=o.breath!=null?o.breath:pose==='idle';
    if(rm)return Object.assign(A0(),{vent:0});
    if(!s)return br?idleA(t):Object.assign(A0(),{vent:br===false?0:1});
    if(pose==='block'||pose==='hold')return guardA(ez(u/W.anim.rise)*(W.anim.guard[pose]||1),+o.choc||0);
    const acc=arc(u/(2*W.anim.crouch));
    if(pose==='dodgeSide')return dodgeA(acc,arc(k)*(s.dir<0?.35:1));
    if(pose==='dodgeDown'){const A=dodgeA(acc,0),f=arc(k);A.cape=-.22*f;A.capeUp=-.22*f;A.vent=1+2*f;return A}
    return br===false?Object.assign(A0(),{vent:0}):idleA(t);
  }
  LB.drawWatcher=(c,x,y,pose,t,opt)=>{
    const o=opt||{},k=o.k==null?1:o.k,P=LB.WATCHER_POSES[pose]||LB.WATCHER_POSES.idle,g=Object.assign({},P(k,o,t||0));
    t=t||0;clk=t;
    for(const n in o)if(o[n]!==undefined&&n!=='k')g[n]=o[n];
    if(o.sa!=null||o.staffA!=null)g.staff=undefined;if(o.staff)g.sa=undefined;   /* la façon de tenir le sceptre donnée par le chapitre l'emporte */
    if(o.flat)return flat(c,x+(g.dx||0),y+(g.dy||0),g.scale||1,g.lamp==null?1:g.lamp);
    if(o.ink)return back(c,x+(g.dx||0),y+(g.dy||0),o.ink,g.lamp==null?1:g.lamp);
    /* sceptre tenu par son angle (Chapitre II) : la main suit, le bâton passe dans la main */
    if(g.staffA!=null&&!o.staff&&o.sa==null){const A=g.staffA,up=cl((-1.42-A)/.45),dx=Math.cos(A),dy=Math.sin(A),h=[RS.hand[0]-1+dx*4,RS.hand[1]-8*up];
      g.hand=o.hand||h;g.staff=[[g.hand[0]-dx*60,g.hand[1]-dy*60],[g.hand[0]+dx*80,g.hand[1]+dy*80]];g.sa=undefined;
      if(o.glow==null)g.glow=up>.3?1:.25;if(o.lit==null)g.lit=up>.3?1:0}
    /* suivi de la pose : changement (fondu, retombée, poussière), sens d'une esquive de côté */
    const rm=still();let s=null;
    if(o.anim!==false){s=slot(c,o.id!=null?o.id:Math.round(x/64));const nf=t>s.lt+1e-6;
      if(t<s.lt-1e-6||t-s.lt>.25){s.pose=pose;s.t0=t;s.bl=null;s.ev.length=0;s.dir=0;s.lk=k}
      else if(nf&&pose!==s.pose){
        if(s.fin&&!rm&&AUTO[s.pose]){s.bl={f:s.fin,t0:t,d:pose==='idle'?W.anim.fall:W.anim.into,land:!!DODGE[s.pose]&&pose==='idle'};if(s.bl.land)s.ev.push([t,s.fin.fx])}
        if(DODGE[pose]&&!rm)s.ev.push([t,s.fin?s.fin.fx:0]);
        s.pose=pose;s.t0=t;s.dir=0;s.lk=k}
      else if(nf&&pose==='dodgeSide'){const dk=k-s.lk;if(dk>1e-4)s.dir=1;else if(dk<-1e-4){if(s.dir===1&&s.fin&&!rm)s.ev.push([t,s.fin.fx]);s.dir=-1}s.lk=k}
      s.lt=Math.max(s.lt,t);while(s.ev.length&&t-s.ev[0][0]>W.anim.dust)s.ev.shift()}
    const A=curves(pose,k,t,o,s&&AUTO[pose]?s:null,rm,s?t-s.t0:0);
    if(o.anim&&typeof o.anim==='object')Object.assign(A,o.anim);
    /* géométrie finale : le geste (bras, bx, by) tourne la main et le bâton autour du pivot, le souffle lève le haut du corps ;
       l'épaule reste fixe (bord du mantelet), le bras s'y accroche */
    const sc=g.scale||1,bd=g.body,bs=bd?(bd.s||1):1,bdy=bd?(bd.dy||0):0,ar=g.armR||6.5,ka=ar/6.5,pv=[W.arm.pivot[0]*bs,W.arm.pivot[1]*bs+bdy],
      cb=Math.cos(A.bras),sn=Math.sin(A.bras),M=p=>{const dx=p[0]-pv[0],dy=p[1]-pv[1];return[pv[0]+dx*cb-dy*sn+A.bx,pv[1]+dx*sn+dy*cb+A.by+A.souffle]},sh=g.shoulder||[23,-78];
    const F={X:x+(g.dx||0)+A.x*sc,Y:y+(g.dy||0)+A.y*sc,R:nr((g.rot||0)+(g.rot2||0)+A.lean),SX:(g.sx==null?1:g.sx)*sc*A.sx,SY:(g.sy==null?1:g.sy)*sc*A.sy,
      S:[sh[0]-13*ka,sh[1]+2*ka+A.souffle],ar,bs,bdy,h:M(g.hand||[26,-62])};
    for(const n of MIXN.slice(0,8))F[n]=A[n];
    if(g.staff){F.sb=M(g.staff[0]);F.st=M(g.staff[1])}
    else{const a=(g.sa==null?-.45:g.sa)+A.bras,Ln=g.L||76,ux=Math.cos(a),uy=Math.sin(a);F.sa=a;F.Ln=Ln;F.sb=[F.h[0]-ux*18,F.h[1]-uy*18];F.st=[F.h[0]+ux*Ln,F.h[1]+uy*Ln]}
    /* retombée : fondu depuis la dernière image de la pose précédente (bâton tenu), tassement à la réception d'une esquive */
    let G=F;
    if(s&&s.bl){const b=s.bl,f=b.f,e=ez((t-b.t0)/b.d);
      if(e<1){G={R:f.R+nr(F.R-f.R)*e};for(const n of MIXN)G[n]=mx(f[n],F[n],e);for(const n of MIX2)G[n]=mx2(f[n],F[n],e)}
      const r=b.land?arc((t-b.t0)/W.anim.land):0;
      if(r>0){if(G===F)G=Object.assign({},F);G.SY*=1-.14*r;G.SX*=1+.08*r;G.cape+=.2*r;G.capeUp+=.1*r;G.lampe-=.22*r}
      if(e>=1&&(!b.land||t-b.t0>=W.anim.land))s.bl=null}
    G.fx=(G.X-x)/sc;if(s)s.fin=G;
    const col=g.lanternCol||(g.lit?W.lantern.lit:W.lantern.idle),glow=g.glow==null?.25:g.glow,lamp=g.lamp==null?1:g.lamp,gl=glow*Math.max(0,Math.min(2,G.flamme));
    /* liseré : suit la lanterne (plus vif quand elle s'embrase, absent quand elle s'éteint) */
    const rim=(.35+.65*cl(glow))*cl(lamp)*(g.staffAlpha==null?1:cl(g.staffAlpha));
    const L=G.st,u0=L[0]*G.SX,v0=L[1]*G.SY,cr=Math.cos(G.R),sr=Math.sin(G.R),lx=G.X+u0*cr-v0*sr,ly=G.Y+u0*sr+v0*cr;
    const fxOn=MOVES[pose]&&o.fx!==false,fxF=fn=>{c.save();c.translate(x,y);if(sc!==1)c.scale(sc,sc);fn((lx-x)/sc,(ly-y)/sc);c.restore()};
    if(fxOn)fxF((Lx,Ly)=>fxBack(c,pose,A,k,Lx,Ly));
    /* pans de la cape : vent (fréquence W.wind) ou pans donnés par le chapitre (opt.fl) */
    const vt=G.vent,cw=o.fl!=null?undefined:Math.sin(t*W.wind.f)*vt,cv=o.fl!=null?undefined:Math.sin(t*W.wind.f+W.wind.ph)*vt;
    c.save();c.translate(G.X,G.Y);if(G.R)c.rotate(G.R);if(G.SX!==1||G.SY!==1)c.scale(G.SX,G.SY);
    const au=g.aura||0;
    if(au>0){const r=70+60*au,gr=c.createRadialGradient(0,-10,6,0,-10,r);
      gr.addColorStop(0,'rgba(255,255,255,'+(.7*au)+')');gr.addColorStop(.5,'rgba(255,226,140,'+(.3*au)+')');gr.addColorStop(1,'rgba(255,217,102,0)');
      c.fillStyle=gr;c.beginPath();c.arc(0,-10,r,0,6.283);c.fill()}
    /* corps (voile blanc : une seconde couche, opacité white) */
    const sub=G.bdy!==0||G.bs!==1,bo={fl:o.fl,cw,cv,rim,souffle:G.souffle,tete:G.tete,cape:G.cape,capeUp:G.capeUp,clin:G.clin};
    const body=w=>{bo.white=w;if(sub){c.save();c.translate(0,G.bdy);c.scale(G.bs,G.bs);LB.drawWatcherBody(c,bo);c.restore()}else LB.drawWatcherBody(c,bo)};
    const wv=g.white,wa=wv===true?1:+wv||0;if(wa>=1)body(true);else{body(false);if(wa>0){c.save();c.globalAlpha*=wa;body(true);c.restore()}}
    /* le bras sort de sous le mantelet : le mantelet est repeint sur la naissance du bras (disque autour de l'épaule), dans le repère du corps */
    const root=(S,Pl)=>{c.save();c.beginPath();c.arc(S[0],S[1],11*G.ar/6.5,0,6.283);c.clip();if(sub){c.translate(0,G.bdy);c.scale(G.bs,G.bs)}hautT(c,G);mantle(c,Pl);hood(c,Pl,0);c.restore()};
    const sa=g.staffAlpha==null?1:g.staffAlpha;if(sa<1){c.save();c.globalAlpha*=Math.max(0,sa)}
    let fa=0;
    if(G.sa==null){
      /* bâton tenu : talon, main, lanterne au sommet (la hampe s'arrête sous le socle) */
      const sb=G.sb,st=G.st,ang=Math.atan2(st[1]-sb[1],st[0]-sb[0]),ux=Math.cos(ang),uy=Math.sin(ang);
      pole(c,sb[0],sb[1],st[0]-ux*16,st[1]-uy*16);fa=ang;
      LB.drawLantern(c,st[0],st[1],gl,col,ang+PI/2+G.lampe,lamp);
    }else{
      /* sceptre dans la main, angle sa */
      const Ln=G.Ln,a=G.sa;
      c.save();c.translate(G.h[0],G.h[1]);c.rotate(a);
      LB.drawScepter(c,Ln,gl,col,lamp,G.lampe);
      if(au>0){const gr=36*au,og=c.createRadialGradient(Ln,0,0,Ln,0,gr*2);
        og.addColorStop(0,'rgba(255,255,255,1)');og.addColorStop(.4,'rgba(255,240,176,.7)');og.addColorStop(1,'rgba(255,217,102,0)');
        c.fillStyle=og;c.beginPath();c.arc(Ln,0,gr*2,0,6.283);c.fill()}
      if(g.beam&&g.beam.al>0){c.save();c.globalCompositeOperation='lighter';LB.lanternBeam(c,[Ln+8,0],[Ln+8+g.beam.len,0],g.beam.w,g.beam.al);c.restore()}
      c.restore();fa=a;
    }
    if(sa<1)c.restore();
    /* le bras passe devant le bâton (il le tient de la main droite, côté spectateur), puis le poing */
    let arm=null;if(wa<1){arm=sleeve(c,G.S,G.h,G.ar,PAL.n,rim);root(arm.S,PAL.n)}if(wa>0){c.save();if(wa<1)c.globalAlpha*=wa;arm=sleeve(c,G.S,G.h,G.ar,PAL.w,0);root(arm.S,PAL.w);c.restore()}
    if(sa<1){c.save();c.globalAlpha*=Math.max(0,sa)}fist(c,arm.H,fa,arm.E);if(sa<1)c.restore();
    if(o.inFrame)o.inFrame(c,g);
    c.restore();
    if(fxOn)fxF((Lx,Ly)=>fxFront(c,pose,A,k,Lx,Ly,(G.X-x)/sc,rm));
    if(s&&s.ev.length&&!rm)fxF(()=>{for(const e of s.ev)shards(c,e[1],0,t-e[0],12,['#a57d94','#654055'],240*ZR,7,700*ZR)});
    /* centre de la lanterne dans le repère de l'appelant ; shake = secousse d'écran suggérée (px, bague et halo ; 0 en mouvement réduit) */
    return{lx,ly,shake:rm?0:(A.shake||0)*ZR*sc};
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
