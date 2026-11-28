/* ===== Colosse A9 (phase I, pont) : dessin de la référence validée colosse-a9.js (27/11).
   Coordonnées de pose : maquette x0.8, origine entre les pieds. Chaque pièce rigide (jambes, torse, épaules, tête, mâchoire,
   bandoulière, segments de bras, poing, boule) est peinte une seule fois dans un calque en cache, avec ses ombres, flous et son
   liseré ; à chaque image on ne fait que les poser. Le buste se penche et pivote autour de la taille (PY), les jambes restent
   plantées ; les bras gardent des longueurs fixes (L1, L2) et plient toujours du même côté. Les phases I, II et III l'utilisent (l'ancienne silhouette demonBody est retirée).
   Ripostes (référence ripostes-reference.js, 27/11) : queue toujours visible dont la racine suit le bassin (queueAccrochee) ; fissures peintes
   DANS chaque pièce (calques cuits : torse, jambes, épaules, tête, bras), jamais par-dessus l'ensemble, donc la chaîne et la tête passent devant
   celles du torse ; jambes qui ploient (plie), tête inclinée (tete), teintes sur la silhouette (flash, eteint). */
const COLOSSE=(()=>{
  const TAU=6.283185307179586,P=d=>new Path2D(d),P2=P;
  let K=1; /* pixels par unité de maquette pendant la mise en cache */
  const CH='#2a1230',CH_F='#1d0c25',CL='rgba(178,82,92,.30)',CL2='rgba(205,108,102,.22)',OM='rgba(7,0,18,.46)',FER='#35223f',FER_C='rgba(176,128,150,.45)';
  function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(...s));return g}
  function glow(c,x,y,r,rgb,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(.35,`rgba(${rgb},${a*.4})`);g.addColorStop(1,`rgba(${rgb},0)`);c.save();c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore()}
  function pc(c,d,fill,plans=[],ao=8){const p=P(d);c.save();c.globalCompositeOperation='source-atop';c.shadowColor='rgba(5,0,14,.9)';c.shadowBlur=ao*K;c.shadowOffsetY=2.5*K;c.fillStyle='rgba(8,0,18,.75)';c.fill(p);c.restore();
    c.fillStyle=fill;c.fill(p);c.save();c.clip(p);plans.forEach(([d2,col,f])=>{c.save();if(f)c.filter=`blur(${f*K}px)`;c.fillStyle=col;c.fill(P(d2));c.restore()});c.restore();return p}
  function tr(c,d,col,w){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(P(d))}
  function feu(c,d,w,hot){const p=P(d);c.save();c.lineCap='round';c.lineJoin='round';c.shadowColor='#ff4a12';c.shadowBlur=9*K*hot;c.strokeStyle='#e9561b';c.lineWidth=w*hot;c.stroke(p);c.shadowBlur=0;c.strokeStyle='#ffc27a';c.lineWidth=w*.36;c.stroke(p);c.restore()}
  /* chaîne (dessinée à chaque image : traits simples, sans ombre) */
  function chaine(c,p,n,s,col,hi){const f=u=>{const v=1-u;return [0,1].map(k=>v*v*v*p[0][k]+3*v*v*u*p[1][k]+3*v*u*u*p[2][k]+u*u*u*p[3][k])};let q=f(0);for(let i=1;i<=n;i++){const r=f(i/n),plat=i%2;c.save();c.translate((q[0]+r[0])/2,(q[1]+r[1])/2);c.rotate(Math.atan2(r[1]-q[1],r[0]-q[0]));
    c.strokeStyle='#14091a';c.lineWidth=s*.72;c.beginPath();c.ellipse(0,0,s,plat?s*.66:s*.15,0,0,TAU);c.stroke();c.strokeStyle=col;c.lineWidth=s*.4;c.stroke();c.strokeStyle=hi;c.lineWidth=s*.13;c.beginPath();c.ellipse(0,-.6,s,plat?s*.66:s*.15,0,Math.PI*1.05,Math.PI*1.75);c.stroke();c.restore();q=r}}

  /* ---- pièces de la référence (coordonnées de maquette, origine entre les pieds) ---- */
  function jambeL(c){const hot=1;
   /* ---- jambe lointaine : plus haute sur le sol, plus sombre ---- */
   pc(c,'M-46 -148C-68 -132 -86 -110 -91 -94C-96 -78 -84 -66 -70 -69C-54 -75 -40 -96 -18 -118L-10 -142Z',CH_F,[['M-46 -146C-66 -130 -84 -110 -88 -94L-72 -92C-64 -108 -46 -126 -30 -138Z',CL2]]);
   pc(c,'M-90 -84C-92 -68 -84 -48 -81 -30L-49 -30C-47 -48 -51 -68 -62 -83C-72 -96 -88 -97 -90 -84Z',CH_F,[['M-90 -82C-90 -66 -83 -48 -80 -30L-70 -30C-72 -50 -78 -66 -78 -88Z',CL2]]);
   pc(c,'M-82 -40L-100 -34L-118 -20L-120 -8L-40 -8L-42 -24L-50 -40Z',CH_F,[['M-82 -40L-100 -34L-118 -20L-98 -22L-70 -34Z',CL],['M-60 -40L-40 -8L-62 -8L-70 -30Z',OM]]);
   ['M-120 -8L-118 -22L-102 -24L-98 -8Z','M-96 -8L-97 -23L-80 -25L-76 -8Z'].forEach(d=>pc(c,d,'#2a1230',[[d,'rgba(170,80,92,.16)']],5));
   pc(c,'M-84 -42Q-66 -50 -48 -42L-48 -32Q-66 -40 -83 -32Z',FER,[['M-84 -42Q-66 -50 -48 -42L-48 -39Q-66 -47 -84 -39Z',FER_C]],5);
   pc(c,'M-86 -96Q-102 -102 -114 -96Q-100 -88 -90 -74Z',FER,[['M-86 -96Q-102 -102 -114 -96L-90 -90Z',FER_C]],4);
   feu(c,'M-62 -122L-72 -100L-66 -88M-74 -70L-68 -52L-72 -36',2.6,hot);
   }
  function jambeP(c){const hot=1;
   /* ---- jambe proche : devant, plus grande ---- */
   pc(c,'M8 -148C13 -118 26 -96 39 -70C46 -56 67 -54 75 -67C84 -80 78 -104 62 -128L50 -152Z',CH,[['M8 -148C13 -118 26 -96 39 -70L54 -68C46 -92 34 -118 30 -146Z',CL],['M52 -150L80 -90L74 -62L58 -80L62 -110Z',OM]]);
   pc(c,'M41 -73C47 -56 62 -45 66 -26L105 -24C103 -46 93 -67 77 -79C63 -92 39 -88 41 -73Z',CH,[['M42 -72C48 -56 62 -44 66 -26L80 -26C76 -46 62 -58 58 -80Z',CL],['M84 -76L108 -22L92 -22L80 -50Z',OM]]);
   pc(c,'M66 -38L48 -33L29 -14L28 6L121 6L119 -14L103 -38Z',CH,[['M66 -38L48 -33L29 -14L52 -17L80 -33Z',CL],['M92 -38L121 6L96 6L84 -24Z',OM]],10);
   ['M28 6L30 -13L51 -19L56 6Z','M58 6L56 -19L78 -22L83 6Z','M85 6L82 -20L99 -18L108 6Z'].forEach((d,i)=>pc(c,d,i<2?'#351636':'#26102e',[[d,`rgba(180,84,92,${.22-i*.07})`]],6));
   tr(c,'M30 -12L50 -18M58 -18L77 -21','rgba(255,160,110,.5)',1.2);
   pc(c,'M62 -42Q84 -52 107 -40L107 -28Q84 -39 63 -29Z',FER,[['M62 -42Q84 -52 107 -40L107 -37Q84 -49 62 -39Z',FER_C]],6);
   pc(c,'M44 -84Q57 -97 71 -83L66 -64Q55 -55 46 -65Z',FER,[['M44 -84Q57 -97 71 -83L66 -80Q56 -90 48 -80Z',FER_C]],6);
   pc(c,'M47 -82Q32 -88 20 -77Q36 -73 47 -64Z',FER,[['M47 -82Q32 -88 20 -77L40 -79Z',FER_C]],4);
   feu(c,'M34 -124L48 -108L44 -96M70 -58L78 -46L76 -32',3,hot);
  }
  function torse(c){const hot=1,t=0;/* ---- bassin : ceinture de forge, courbée car vue d'en bas ---- */
   pc(c,'M-53 -164Q-2 -182 53 -158L48 -128Q30 -141 14 -134L-8 -104L-27 -137Q-40 -140 -50 -131Z',FER,[['M-53 -164Q-2 -182 53 -158L52 -150Q-2 -172 -52 -154Z',FER_C],['M18 -166L54 -156L48 -128L14 -134Z',OM]],10);
   tr(c,'M-51 -143Q-4 -160 49 -138','rgba(10,2,16,.8)',2.4);
   [[-40,-150],[-24,-155],[17,-155],[36,-149]].forEach(([x,y])=>{c.fillStyle='#b98a86';c.beginPath();c.arc(x,y,2.4,0,TAU);c.fill()});
   c.save();c.shadowColor='#ff5a1f';c.shadowBlur=7*K;c.fillStyle='#ff8a35';c.fill(P('M-9 -146L-1 -134L-9 -116L-18 -134Z'));c.restore();
   /* ---- torse : face éclairée + flanc dans l'ombre = trois quarts ---- */
   pc(c,'M-84 -301C-101 -292 -105 -267 -97 -243L-77 -201C-66 -184 -56 -170 -51 -156Q-4 -172 49 -150C55 -170 61 -185 75 -203L99 -248C114 -273 113 -297 92 -308L40 -324L-30 -320Z',
    lg(c,-90,-320,40,-150,[[0,'#3a1838'],[1,'#22102a']]),
    [['M30 -322L94 -308C114 -297 114 -273 99 -248L75 -203L49 -150L10 -164L30 -218L22 -264Z',OM],
     ['M-90 -280L-38 -296L-32 -245C-48 -258 -72 -256 -89 -240Z',CL],['M-26 -296L26 -299L31 -244C14 -258 -10 -258 -25 -242Z','rgba(160,70,88,.24)'],
     ['M-72 -228Q-54 -240 -36 -233L-33 -211Q-50 -220 -66 -207Z',CL2],['M-25 -233Q0 -242 21 -229L18 -206Q0 -220 -21 -210Z','rgba(160,70,88,.17)'],
     ['M-62 -200Q-47 -210 -32 -204L-29 -183Q-43 -191 -52 -181Z',CL2],['M-21 -204Q-1 -212 17 -201L13 -179Q-2 -189 -19 -182Z','rgba(160,70,88,.15)']]);
   tr(c,'M-89 -240C-72 -256 -48 -258 -32 -245M-25 -242C-10 -258 14 -258 31 -244','rgba(8,0,16,.75)',3.4);
   tr(c,'M-90 -279L-39 -295M-25 -295L24 -298','rgba(255,160,120,.35)',1.2);
   tr(c,'M-66 -207Q-50 -220 -33 -211M-21 -210Q0 -220 18 -206M-52 -181Q-43 -191 -29 -183M-19 -182Q-2 -189 13 -179','rgba(8,0,16,.7)',2.4);
   tr(c,'M30 -320L22 -264L30 -218L12 -166','rgba(255,150,110,.16)',1.4);
   glow(c,-30,-256,52,'255,96,34',.55*hot);
   feu(c,'M-30 -308L-37 -283L-22 -267L-34 -246L-23 -225L-30 -200L-21 -174',5.2,hot);
   feu(c,'M-37 -283L-56 -272L-66 -258L-84 -256M-22 -267L-4 -273L7 -262L24 -265M-34 -246L-48 -237L-52 -224',2.8,hot);
   /* ---- cou ---- */
   c.save();c.globalCompositeOperation='source-atop';c.filter=`blur(${7*K}px)`;c.fillStyle='rgba(5,0,14,.85)';c.beginPath();c.ellipse(-46,-250,52,22,0,0,TAU);c.fill();c.restore();
   pc(c,'M-70 -292L4 -304L12 -262L-52 -250Z',CH_F,[['M-24 -300L12 -300L12 -262L-20 -256Z',OM]],12);
   }
  function sangle(c){const t=0;/* ---- bandoulière et crochet ---- */
   chaine(c,[[78,-292],[50,-224],[-6,-176],[-55,-162]],12,9.5,'#7a5a72','#f0b49a');
   const s=Math.sin(t*TAU)*2.5;chaine(c,[[-55,-162],[-58,-154],[-59+s,-148],[-59+s,-138]],2,8,'#7a5a72','#f0b49a');
   const h=`M${-59+s} -140v9c14 6 13 23 -1 24c-8 1 -14 -5 -13 -13`;tr(c,h,'#14091a',8);tr(c,h,'#7a5a72',4.6);tr(c,h,'rgba(255,190,150,.8)',1.2);
   }
  function paulL(c){/* ---- épaule lointaine : enclume ---- */
   pc(c,'M-52 -313L-119 -316C-134 -316 -152 -305 -170 -291C-148 -290 -133 -288 -122 -280C-114 -273 -114 -265 -120 -257L-123 -250L-64 -252L-70 -260C-79 -268 -79 -278 -70 -287C-66 -292 -60 -293 -52 -294Z',lg(c,0,-316,0,-250,[[0,'#432c4c'],[1,'#1b0d24']]),
    [['M-52 -313L-119 -316L-160 -298L-119 -303L-52 -301Z',FER_C],['M-123 -262L-64 -264L-64 -250L-123 -250Z',OM]],14);
   tr(c,'M-120 -303L-54 -301','rgba(10,2,16,.7)',2);
   }
  function corneL(c){const corne=(d,g,anneaux)=>{pc(c,d,g,[],9);anneaux.forEach(a=>{tr(c,a,'rgba(10,2,16,.75)',2.6);c.save();c.translate(1.5,-2);tr(c,a,'rgba(255,196,160,.28)',1.1);c.restore()})};
   corne('M-58 -340C-76 -346 -93 -348 -101 -358C-108 -368 -111 -381 -106 -396C-127 -381 -137 -359 -127 -340C-117 -321 -98 -315 -75 -317Z',lg(c,-132,-396,-70,-325,[[0,'#8a6274'],[.45,'#3d1f3a'],[1,'#25102a']]),
    ['M-84 -345Q-90 -332 -88 -318','M-100 -354Q-114 -346 -120 -334','M-107 -370Q-120 -368 -131 -362']);
   }
  function tete(c,brise){const hot=1;const corne=(d,g,anneaux)=>{pc(c,d,g,[],9);anneaux.forEach(a=>{tr(c,a,'rgba(10,2,16,.75)',2.6);c.save();c.translate(1.5,-2);tr(c,a,'rgba(255,196,160,.28)',1.1);c.restore()})};
   /* ---- tête : mâchoire carrée, arcade lourde, deux crocs ---- */
   pc(c,'M-17 -339L-66 -342C-81 -337 -91 -327 -93 -314L-97 -298L-90 -286L-89 -272C-87 -261 -81 -255 -70 -253L-47 -250C-35 -253 -23 -263 -15 -276L-3 -300C-1 -320 -6 -333 -17 -339Z',
    lg(c,-96,-342,-4,-250,[[0,'#432041'],[1,'#1e0c26']]),
    [['M-93 -314L-56 -324L-48 -294L-55 -251L-70 -253L-89 -272L-90 -286L-97 -298Z',CL],['M-28 -340L-2 -300L-15 -276L-47 -250L-42 -298Z',OM],['M-66 -342L-28 -340L-34 -326L-62 -326Z',CL2]],14);
   tr(c,'M-56 -322L-48 -292L-55 -254','rgba(255,150,110,.2)',1.2);
   c.fillStyle='#0d0314';c.fill(P('M-99 -310L-74 -291L-65 -290L-28 -318L-30 -295L-55 -280L-69 -280L-96 -293Z'));
   c.save();c.shadowColor='#ff8a1c';c.shadowBlur=13*K;c.fillStyle='#ffd24a';c.fill(P('M-94 -302L-75 -289L-79 -286.5L-91 -294Z'));c.fill(P('M-65 -287L-34 -309L-39 -296L-55 -285.5Z'));c.fillStyle='#fff7d4';c.fill(P('M-60 -288.5L-44 -300L-49 -291Z'));c.fill(P('M-86 -295L-78 -290L-81 -289Z'));c.restore();
   /* arcade : un V lourd qui écrase les yeux, hérissé */
   pc(c,'M-102 -324L-91 -318L-89 -328L-80 -313L-70 -306L-52 -318L-47 -331L-40 -323L-30 -334L-24 -327L-5 -330L-11 -311L-31 -314L-66 -288L-74 -289L-99 -309Z',lg(c,0,-334,0,-290,[[0,'#5a3050'],[1,'#1a0920']]),[['M-70 -306L-66 -288L-74 -289L-76 -303Z',OM]],8);
   tr(c,'M-99 -310L-74 -290L-66 -289L-31 -314L-12 -312','rgba(255,140,80,.75)',1.3);
   tr(c,'M-101 -322L-91 -317L-89 -326L-80 -312L-70 -305L-52 -317L-47 -329L-40 -321L-30 -332L-24 -325L-8 -328','rgba(255,176,130,.55)',1.2);
   tr(c,'M-72 -304L-70 -291M-64 -308L-66 -294','rgba(8,0,16,.75)',1.8);
   /* museau court et large, deux narines de braise : plus de nez pointu */
   pc(c,'M-84 -283L-72 -287L-61 -283L-58 -275L-68 -272L-73 -277L-78 -272L-88 -275Z',"#3d1b3e",[['M-84 -283L-72 -287L-72 -279L-86 -276Z',CL],['M-67 -285L-61 -283L-58 -275L-68 -272Z',OM]],6);
   c.save();c.shadowColor='#ff5a1f';c.shadowBlur=5*K;c.strokeStyle='#ff8a35';c.lineWidth=1.7;c.lineCap='round';c.stroke(P('M-83 -276L-78 -278M-68 -278L-63 -276'));c.restore();
   /* gueule ouverte, commissures tirées vers le bas */
   const gueule='M-96 -255L-91 -266L-80 -271L-68 -265L-55 -272L-40 -270L-28 -257L-36 -249L-52 -246L-72 -245L-87 -248Z';
   c.save();c.shadowColor='#ff5a1f';c.shadowBlur=9*K;c.fillStyle=lg(c,0,-272,0,-245,[[0,'#2a0612'],[.45,'#a5260f'],[1,'#ffab3c']]);c.fill(P(gueule));c.restore();
   tr(c,'M-96 -255L-91 -266L-80 -271L-68 -265L-55 -272L-40 -270L-28 -257','rgba(255,140,84,.6)',1.3);
   /* crocs serrés en haut, défenses qui remontent */
   c.fillStyle='#d9bfa8';['M-90 -267L-86 -257L-84 -269Z','M-82 -271L-76 -268L-81 -252Z','M-75 -269L-72 -262L-69 -266Z','M-63 -268L-60 -261L-57 -271Z','M-51 -272L-44 -271L-46 -254Z','M-40 -270L-37 -263L-34 -264Z'].forEach(d=>c.fill(P(d)));
   /* balafres de braise sur la joue */
   feu(c,'M-36 -296L-27 -283L-31 -276L-20 -266',2.2,hot);
   /* ---- corne proche : large, coudée, comme au jeu ; brisée (phase III, seconde vie) : un moignon à la cassure de braise ---- */
   if(brise)corneBrisee(c);
   else corne('M-26 -341C-2 -347 21 -346 35 -358C48 -369 57 -384 62 -404C78 -380 77 -349 57 -330C39 -313 15 -307 -8 -308C-19 -319 -23 -331 -26 -341Z',lg(c,66,-404,-22,-318,[[0,'#a47c8a'],[.4,'#4a2642'],[1,'#2a1230']]),
    ['M-4 -343Q4 -328 0 -309','M18 -345Q30 -330 28 -313','M39 -362Q54 -352 59 -334','M53 -382Q66 -376 74 -366']);
   }
  /* moignon de la grande corne (maquette colosse-clocher.js, COL_B) */
  function corneBrisee(c){pc(c,'M-26 -341C-14 -345 -2 -346 10 -347L6 -337L19 -343L17 -331L31 -334L24 -321C12 -312 2 -309 -8 -308C-19 -319 -23 -331 -26 -341Z','#3a1e38',[['M-26 -341L10 -347L6 -337L-20 -330Z',CL]],9);
   feu(c,'M10 -346L6 -337L19 -342L17 -331L30 -333',3,1)}
  function machoire(c){ /* mâchoire en avant */
   pc(c,'M-97 -256L-87 -249L-72 -246L-52 -247L-36 -250L-27 -259L-31 -244L-47 -233L-60 -237L-72 -231L-90 -238Z',CH,[['M-97 -256L-87 -249L-72 -246L-72 -231L-90 -238Z',CL],['M-46 -248L-27 -259L-31 -244L-47 -233Z',OM]],7);
   tr(c,'M-96 -254L-90 -238L-72 -232L-60 -237L-47 -234L-31 -244L-28 -256','rgba(255,150,96,.7)',1.6);
   c.fillStyle='#d9bfa8';['M-74 -245L-70 -254L-67 -246Z','M-64 -246L-60 -253L-57 -246Z'].forEach(d=>c.fill(P(d)));
   c.fillStyle=lg(c,0,-278,0,-246,[[0,'#ecd6bb'],[1,'#85625f']]);c.fill(P('M-96 -250Q-101 -264 -97 -279Q-91 -265 -87 -249Z'));c.fill(P('M-39 -248Q-30 -261 -27 -279Q-22 -262 -28 -250Z'));
   }
  function paulR(c){const hot=1;/* ---- épaule proche : la grande enclume ---- */
   pc(c,'M50 -320L151 -330C169 -330 188 -319 204 -305C182 -302 164 -300 151 -289C140 -280 140 -270 148 -259L153 -251L70 -249L75 -258C87 -270 87 -281 78 -291C72 -299 61 -300 50 -299Z',lg(c,0,-330,0,-249,[[0,'#4a3052'],[1,'#190b22']]),
    [['M50 -320L151 -330L192 -312L150 -314L50 -305Z',FER_C],['M70 -263L150 -266L153 -249L70 -249Z',OM],['M150 -290L204 -305L151 -310L120 -300Z','rgba(8,0,16,.3)']],18);
   tr(c,'M52 -305L150 -314L194 -309','rgba(10,2,16,.75)',2.2);tr(c,'M51 -319L151 -329C168 -329 186 -319 201 -307','rgba(255,196,160,.65)',1.4);
   [[66,-312],[142,-320]].forEach(([x,y])=>{c.fillStyle='#c79a90';c.beginPath();c.arc(x,y,3,0,TAU);c.fill()});
   feu(c,'M92 -284L106 -278L104 -268L118 -262',2.4,hot);}
  function os(c,A,B,w1,w2,fill,hi,galbe){const an=Math.atan2(B[1]-A[1],B[0]-A[0]),len=Math.hypot(B[0]-A[0],B[1]-A[1]);c.save();c.translate(...A);c.rotate(an);
   const d='M0 '+(-w1)+'C'+len*.3+' '+(-w1-galbe)+' '+len*.7+' '+(-w2-galbe*.5)+' '+len+' '+(-w2)+'A'+w2+' '+w2+' 0 0 1 '+len+' '+w2+'C'+len*.7+' '+(w2+galbe*.5)+' '+len*.3+' '+(w1+galbe)+' 0 '+w1+'A'+w1+' '+w1+' 0 0 1 0 '+(-w1)+'Z';
   pc(c,d,fill,[['M0 '+(-w1-galbe)+'H'+(len+w2)+'V'+(-w2*.35)+'L0 '+(-w1*.35)+'Z',hi],['M0 '+(w1*.45)+'L'+(len+w2)+' '+(w2*.45)+'V'+(w2+galbe+4)+'H0Z',OM]],10);c.restore();return [an,len]}
  function boule(c){c.save();for(let i=0;i<9;i++){c.save();c.rotate(i*TAU/9+.2);const l=i%3?38:45;pc(c,'M18 -10Q30 -5 '+l+' 0Q30 5 18 10Z','#2c1534',[],3);c.restore()}
   pc(c,'M0 -25C15 -25 25 -14 25 0C25 14 14 25 0 25C-15 25 -25 15 -25 0C-25 -15 -15 -25 0 -25Z','#3a1b38',[['M-22 -11L-6 -24L2 -6L-13 7Z',CL],['M8 -24L25 -4L18 17L6 4Z',OM]],10);feu(c,'M-10 -16L1 -3L-5 8L4 21M1 -3L15 -9',3,1);c.restore()}

  const L1=68,L2=66,PY=-124;
  /* ---- queue : courbe effilée, pointe en lame (la lame est cuite : SP.tip). Au sol, derrière les jambes, la pointe relevée ;
     la racine suit le bassin (même transformation que le torse) : jamais détachée. COLQ.sx resserre la queue pour que la lame reste dans le cadre. ---- */
  const COLQ={sx:.82};
  const queueSol=o=>[[30,-130],[150-(o.lean||0)*40,-56],[120,18],[232+(o.rage||0)*6,-26-(o.rage||0)*34]].map((q,i)=>i?[30+(q[0]-30)*COLQ.sx,q[1]]:q);
  const queueAccrochee=(P,pt)=>{const r=pt(8,-142),s=pt(P[0][0],P[0][1]),dx=s[0]-P[0][0],dy=s[1]-P[0][1];return [r,[P[1][0]+dx,P[1][1]+dy],P[2],P[3]]};
  function plg(c,pts,col){c.fillStyle=col;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill()}
  function queue(c,P){const f=u=>{const v=1-u;return [0,1].map(k=>v*v*v*P[0][k]+3*v*v*u*P[1][k]+3*v*u*u*P[2][k]+u*u*u*P[3][k])};
    const N=14,h=[],b=[],m=[];
    for(let i=0;i<=N;i++){const u=i/N,p=f(u),q=f(Math.min(1,u+.01)),p0=f(Math.max(0,u-.01)),a=Math.atan2(q[1]-p0[1],q[0]-p0[0]),w=24*(1-u)+6;m.push(p);h.push([p[0]-Math.sin(a)*w,p[1]+Math.cos(a)*w]);b.push([p[0]+Math.sin(a)*w,p[1]-Math.cos(a)*w])}
    plg(c,[...h,...b.slice().reverse()],CH);plg(c,[...b,...m.slice().reverse()],CL2);
    c.lineCap='round';
    for(let i=2;i<N;i+=2){c.strokeStyle='#14081c';c.lineWidth=3;c.beginPath();c.moveTo(h[i][0],h[i][1]);c.lineTo(b[i][0],b[i][1]);c.stroke();
      const a=b[i],n=b[i+1];plg(c,[a,[(a[0]+n[0])/2+(b[i][0]-h[i][0])*.7,(a[1]+n[1])/2+(b[i][1]-h[i][1])*.7],n],'#3a1b38')}
    c.strokeStyle='rgba(255,138,72,.55)';c.lineWidth=1.2;c.beginPath();b.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();
    const e=f(1),e0=f(.95);c.save();c.translate(e[0],e[1]);c.rotate(Math.atan2(e[1]-e0[1],e[0]-e0[0]));img(c,SP.tip);c.restore()}
  /* fissure peinte dans une pièce : tracé de braise (feu) coupé par la silhouette cuite de la pièce (destination-in), donc jamais en dehors */
  function bakeCrack(base,fn,sh){const R=SP.R,b=base.box,e=mk(base.e.width,base.e.height),x=e.getContext('2d');x.setTransform(R,0,0,R,-b[0]*R,-b[1]*R);if(sh)x.scale(sh,sh);fn(x);
    x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='destination-in';x.drawImage(base.e,0,0);return {e,box:b}}
  /* veines sur un bras, dans le repère du segment (0,0)->(len,0) : zigzag qui suit l'axe */
  const veineD=(len,u)=>'M'+len*u[0]+' '+u[1]+'L'+len*u[2]+' '+u[3]+'L'+len*u[4]+' '+u[5]+'L'+len*u[6]+' '+u[7];
  /* bras à deux segments de longueur fixe : la main demandée est ramenée à la portée, le coude plie toujours du même côté */
  function ik(S,H,side){const dx=H[0]-S[0],dy=H[1]-S[1];let d=Math.hypot(dx,dy);const a=Math.atan2(dy,dx);d=Math.min(L1+L2-1,Math.max(Math.abs(L1-L2)+8,d));const b=Math.acos((L1*L1+d*d-L2*L2)/(2*L1*d));const e=a+side*b;const E=[S[0]+L1*Math.cos(e),S[1]+L1*Math.sin(e)];const W=[S[0]+d*Math.cos(a),S[1]+d*Math.sin(a)];return [E,W]}

  /* ---- calques en cache ---- */
  let SP=null;
  const mk=(w,h)=>{const e=document.createElement('canvas');e.width=Math.max(1,Math.ceil(w));e.height=Math.max(1,Math.ceil(h));return e};
  function bake(box,fn,rim,sh){const R=SP.R,e=mk(box[2]*R,box[3]*R),x=e.getContext('2d');x.setTransform(R,0,0,R,-box[0]*R,-box[1]*R);fn(x);
    if(rim){const m=mk(e.width,e.height),y=m.getContext('2d');y.drawImage(e,0,0);y.globalCompositeOperation='destination-out';y.drawImage(e,sh[0]*R,sh[1]*R);y.globalCompositeOperation='source-in';y.fillStyle=rim;y.fillRect(0,0,m.width,m.height);
      x.setTransform(1,0,0,1,0,0);x.drawImage(m,0,0)}
    return {e,box}}
  function build(){
    const R=Math.min(3.2,1.1*Math.max(1,typeof dpr==='number'?dpr:1));SP={R};K=.8*R;
    const RIM='rgba(255,138,72,.9)',S3=[3,1],Mq=f=>x=>{x.scale(.8,.8);f(x)};
    SP.legF=bake([-108,-134,112,140],Mq(jambeL),RIM,S3);
    SP.legN=bake([-4,-134,112,148],Mq(jambeP),RIM,S3);
    SP.torso=bake([-96,-272,200,200],Mq(torse),RIM,S3);
    SP.sangle=bake([-72,-252,154,180],Mq(sangle),RIM,S3);
    SP.paulL=bake([-146,-262,112,72],Mq(paulL),'rgba(255,160,110,.8)',S3);
    SP.corneL=bake([-118,-326,80,82],Mq(corneL),RIM,S3);
    SP.head=bake([-94,-338,168,164],Mq(tete),RIM,S3);
    SP.jaw=bake([-88,-230,76,52],Mq(machoire),RIM,S3);
    SP.paulR=bake([30,-274,144,84],Mq(paulR),RIM,S3);
    /* vue de dos (coup de queue en pivot, maquette colosse-queue-onde.js) : mêmes matières, mêmes liserés */
    SP.torsoD=bake([-96,-272,200,200],Mq(torseDos),RIM,S3);
    SP.headD=bake([-130,-338,168,164],Mq(teteDos),RIM,S3);
    /* grande corne brisée (phase III, seconde vie) : cuite avec le reste, jamais en combat */
    SP.headB=bake([-94,-338,168,164],Mq(x=>tete(x,true)),RIM,S3);
    SP.headDB=bake([-130,-338,168,164],Mq(x=>teteDos(x,true)),RIM,S3);
    /* bras : repère local le long du segment ; liseré du côté du plan éclairé */
    SP.up=[0,1].map(f=>bake([-28,-33,118,66],x=>os(x,[0,0],[L1,0],25,18,f?'#2a1230':'#341636',CL,5),f?RIM:'rgba(208,122,114,.8)',[0,3]));
    SP.fore=[0,1].map(f=>bake([-21,-28,112,56],x=>os(x,[0,0],[L2,0],18,22,f?'#2c1332':'#391838',CL,4),f?RIM:'rgba(208,122,114,.8)',[0,3]));
    SP.fist=bake([-30,-28,62,56],x=>{pc(x,'M-26 -23Q-18 0 -26 23L-8 22Q0 0 -8 -22Z',FER,[['M-26 -23L-8 -22L-6 -12L-23 -12Z',FER_C]],6);
      pc(x,'M-7 -18C6 -24 24 -21 28 -10L29 11C24 22 6 24 -7 18Q-2 0 -7 -18Z','#3c1b42',[['M-7 -18C6 -24 24 -21 28 -10L18 -9L-5 -9Z',CL],['M-5 10L29 10C24 22 6 24 -7 18Z',OM]],8);
      tr(x,'M17 -20Q22 -12 17 -7Q23 0 17 6Q22 13 16 21','rgba(10,2,16,.8)',2)},RIM,[0,3]);
    SP.ball=bake([-50,-50,100,100],boule,RIM,S3);
    /* marteau à deux mains (colosse-marteau.js) : repère de la tête, manche vers l'arrière */
    const HL=238;
    SP.ham=bake([-HL-14,-54,HL+14+50,108],c=>{
      pc(c,'M'+(-HL)+' -8H-6V8H'+(-HL)+'Z','#2a1a26',[['M'+(-HL)+' -8H-6V-3H'+(-HL)+'Z','rgba(255,180,140,.35)']],4);
      [-HL+4,-HL+58,-HL+100,-70].forEach(x=>pc(c,'M'+x+' -10h13v20h-13Z',FER,[['M'+x+' -10h13v6h-13Z',FER_C]],3));
      pc(c,'M'+(-HL-10)+' 0L'+(-HL+4)+' -13V13Z',FER,[],3);
      pc(c,'M-26 -44L-18 -50H20L28 -44V44L20 50H-18L-26 44Z','#3a2038',[['M-26 -44L-18 -50H-6V50H-18L-26 44Z',CL],['M12 -50H20L28 -44V44L20 50H12Z',OM],['M-26 -44L-18 -50H20L28 -44Z',FER_C]],10);
      [-36,28].forEach(y=>pc(c,'M-29 '+y+'H31v9H-29Z',FER,[['M-29 '+y+'H31v3H-29Z',FER_C]],4));
      pc(c,'M28 -20L46 0L28 20Z','#2c1534',[['M28 -20L46 0H28Z','rgba(214,140,140,.5)']],3);
      feu(c,'M-8 -26L4 -10L-5 4L8 24M4 -10L17 -16M-5 4L-17 12',3.2,1)},'rgba(255,160,90,.9)',[2,2]);
    /* fissures cuites dans chaque pièce (largeur moyenne ; l'intensité règle l'opacité au dessin) */
    const FW=4.6,Mf=(d,w)=>x=>feu(x,d,w||FW,1),Mm=d=>x=>feu(x,d,FW,1);
    const T1='M-30 -308L-37 -283L-22 -267L-34 -246L-23 -225L-30 -200L-21 -174M-37 -283L-66 -258M-22 -267L24 -265M-34 -246L-60 -222M-23 -225L10 -212L26 -190';
    SP.torsoC=bakeCrack(SP.torso,Mm(T1),.8);
    SP.torsoDC=bakeCrack(SP.torsoD,Mq(x=>feu(x,'M-3 -318L-40 -292L-46 -268L-80 -250M-3 -250L40 -236L48 -214L76 -204M-3 -204L-34 -170',5,1)),1);
    SP.torsoR=bakeCrack(SP.torso,Mm('M104 -300L112 -262L100 -240L128 -204L150 -182L146 -150M-96 -296L-120 -250L-114 -232L-140 -206M-30 -174L-6 -150L30 -142'),.8);
    SP.headC=bakeCrack(SP.head,Mf('M-52 -330L-60 -314L-50 -304L-57 -293M-100 -284L-90 -272L-97 -260',3.4),.8);
    SP.headBC=bakeCrack(SP.headB,Mf('M-52 -330L-60 -314L-50 -304L-57 -293M-100 -284L-90 -272L-97 -260',3.4),.8);
    SP.paulRC=bakeCrack(SP.paulR,Mm('M104 -300L112 -262L100 -240'),.8);
    SP.paulLC=bakeCrack(SP.paulL,Mm('M-96 -296L-120 -250L-114 -232'),.8);
    SP.legNC=bakeCrack(SP.legN,Mf('M34 -124L52 -100L44 -72L70 -50L72 -24',6),.8);
    SP.legFC=bakeCrack(SP.legF,Mf('M-62 -122L-80 -90L-66 -62L-84 -30',6),.8);
    SP.upC=[0,1].map(f=>bakeCrack(SP.up[f],x=>feu(x,veineD(L1,[.2,-4,.45,7,.62,-3,.9,5]),FW*.8,1)));
    SP.foreC=[0,1].map(f=>bakeCrack(SP.fore[f],x=>feu(x,veineD(L2,[.12,-5,.4,6,.58,-4,.8,3]),FW*.8,1)));
    /* pointe de la queue : lame, repère de la queue (x vers l'avant) */
    SP.tip=bake([-8,-26,64,52],x=>{pc(x,'M-6 -10L14 -24L52 0L14 24L-6 10L6 0Z','#3a1b38',[['M-6 -10L14 -24L52 0H6Z',CL]],5);feu(x,'M6 0L34 0M18 -10L24 0',2.4,1)},RIM,S3);
    SP.glow=bake([-64,-64,128,128],x=>{const g=x.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,'rgba(255,150,60,1)');g.addColorStop(.35,'rgba(255,110,40,.4)');g.addColorStop(1,'rgba(255,90,30,0)');x.fillStyle=g;x.fillRect(-64,-64,128,128)});
  }
  const img=(c,s)=>c.drawImage(s.e,s.box[0],s.box[1],s.box[2],s.box[3]);
  function seg(c,s,A,an){c.save();c.translate(A[0],A[1]);c.rotate(an);img(c,s);c.restore()}
  /* bras : épaule, coude, poignet (aucun étirement) */
  function bras(c,S,H,far,vn){const [E,W]=ik(S,H,-1),a1=Math.atan2(E[1]-S[1],E[0]-S[0]),a2=Math.atan2(W[1]-E[1],W[0]-E[0]);
    seg(c,SP.up[far],S,a1);seg(c,SP.fore[far],E,a2);
    if(vn>.01){c.save();c.globalAlpha=Math.min(1,vn);seg(c,SP.upC[far],S,a1);seg(c,SP.foreC[far],E,a2);c.restore()} /* veines de rage, dans chaque segment */
    /* coude : plaque de fer, pointe à l'extérieur du pli */
    const ux=2*E[0]-(S[0]+W[0]),uy=2*E[1]-(S[1]+W[1]),m=Math.hypot(ux,uy)||1,n=[ux/m,uy/m];
    c.fillStyle=FER;c.beginPath();c.arc(E[0],E[1],15,0,TAU);c.fill();c.beginPath();c.moveTo(E[0]-n[1]*12,E[1]+n[0]*12);c.lineTo(E[0]+n[0]*30,E[1]+n[1]*30);c.lineTo(E[0]+n[1]*12,E[1]-n[0]*12);c.fill();
    c.strokeStyle=FER_C;c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(E[0]-n[1]*12,E[1]+n[0]*12);c.lineTo(E[0]+n[0]*30,E[1]+n[1]*30);c.stroke();
    seg(c,SP.fist,W,a2);
    c.strokeStyle='#e9561b';c.lineWidth=3;c.lineJoin='round';c.beginPath();c.moveTo(S[0]*.4+E[0]*.6,S[1]*.4+E[1]*.6);c.lineTo(E[0],E[1]);c.lineTo(E[0]*.5+W[0]*.5+4,E[1]*.5+W[1]*.5-3);c.stroke();
    return {S,E,W,an:a2}}
  /* couronne de flammes (sans ombre portée : un halo en cache la remplace) */
  function couronne(c,ph,warm,fz){fz=fz==null?1:fz;
    [[-68,-334,11,50,-18,1],[-52,-338,16,86,-22,2],[-32,-338,18,74,-28,3],[-12,-336,13,54,-22,4]].forEach(([x,y,wd,h,l,k])=>{const q=Math.sin(ph*TAU*2+k*1.7)*5,e=(1+.12*Math.sin(ph*TAU*3+k))*Math.min(1.5,.75+.25*warm)*fz;
      [[1,'#c8421c'],[.64,'#f57c28'],[.3,'#ffd27a']].forEach(([s,col])=>{c.fillStyle=col;c.beginPath();c.moveTo(x-wd*s,y);c.bezierCurveTo(x-wd*1.1*s,y-h*.4*s,x+l*.2-wd*.3,y-h*.55*s,x+(l+q)*s,y-h*e*s);c.bezierCurveTo(x+l*.45*s+wd*.3,y-h*.55*s,x+wd*1.15*s,y-h*.35*s,x+wd*s,y);c.fill()})})}
  function halo(c,x,y,r,a){if(a<=0)return;c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.min(1,a);c.drawImage(SP.glow.e,x-r,y-r,2*r,2*r);c.restore()}
  /* ---- vue de dos : mêmes silhouettes, mêmes matières et mêmes liserés que la face ---- */
  const SIL_T='M-84 -301C-101 -292 -105 -267 -97 -243L-77 -201C-66 -184 -56 -170 -51 -156Q-4 -172 49 -150C55 -170 61 -185 75 -203L99 -248C114 -273 113 -297 92 -308L40 -324L-30 -320Z';
  function torseDos(c){
   pc(c,'M-53 -164Q-2 -182 53 -158L48 -128Q30 -141 14 -134L-2 -118L-27 -137Q-40 -140 -50 -131Z',FER,[['M-53 -164Q-2 -182 53 -158L52 -150Q-2 -172 -52 -154Z',FER_C],['M18 -166L54 -156L48 -128L14 -134Z',OM]],10);
   tr(c,'M-51 -143Q-4 -160 49 -138','rgba(10,2,16,.8)',2.4);
   [[-40,-150],[-22,-156],[18,-155],[36,-149]].forEach(([x,y])=>{c.fillStyle='#b98a86';c.beginPath();c.arc(x,y,2.4,0,TAU);c.fill()});
   pc(c,SIL_T,lg(c,-90,-320,60,-150,[[0,'#3a1838'],[1,'#22102a']]),
    [['M30 -322L94 -308C114 -297 114 -273 99 -248L75 -203L49 -150L16 -164L26 -236Z',OM],
     ['M-90 -292L-34 -312L-8 -270L-22 -226L-62 -222L-92 -250Z',CL],['M82 -300L34 -312L6 -270L18 -228L56 -224L92 -256Z','rgba(160,70,88,.2)'],
     ['M-60 -212L-12 -222L-6 -184L-40 -176Z',CL2],['M58 -212L8 -222L4 -184L36 -176Z','rgba(160,70,88,.14)']]);
   /* omoplates et muscles du dos */
   tr(c,'M-88 -290C-52 -296 -22 -276 -10 -250C-14 -228 -40 -216 -66 -222M82 -296C46 -298 16 -278 6 -252C10 -230 34 -218 58 -224M-58 -214C-34 -208 -14 -196 -8 -176M52 -214C28 -208 10 -196 4 -176','rgba(8,0,16,.75)',3.4);
   tr(c,'M-86 -293C-52 -300 -24 -280 -11 -255M80 -299C48 -301 20 -283 8 -258','rgba(255,160,120,.35)',1.3);
   glow(c,-3,-240,62,'255,96,34',.5);
   feu(c,'M-14 -300L-34 -276L-52 -272L-66 -258M-34 -276L-30 -252L-48 -236M10 -298L30 -280L52 -278L70 -262M30 -280L26 -256L42 -238M-24 -206L-34 -190M18 -204L32 -188',3.4,1);
   /* échine : plaques d'enclume en chevrons, braise entre elles */
   feu(c,'M-3 -318L-3 -168',5,1);
   for(let i=0;i<7;i++){const y=-316+i*23,w=19-i*1.4;pc(c,`M${-3-w} ${y+8}L-3 ${y-12}L${-3+w} ${y+8}L${-3+w*.7} ${y+19}L-3 ${y+12}L${-3-w*.7} ${y+19}Z`,FER,[[`M${-3-w} ${y+8}L-3 ${y-12}L-3 ${y+2}Z`,FER_C],[`M-3 ${y-12}L${-3+w} ${y+8}L${-3+w*.7} ${y+19}L-3 ${y+12}Z`,OM]],6)}
  }
  function teteDos(c,brise){const corne=(d,g,anneaux)=>{pc(c,d,g,[],9);anneaux.forEach(a=>{tr(c,a,'rgba(10,2,16,.75)',2.6);c.save();c.translate(1.5,-2);tr(c,a,'rgba(255,196,160,.28)',1.1);c.restore()})};
   const CD='M-26 -341C-2 -347 21 -346 35 -358C48 -369 57 -384 62 -404C78 -380 77 -349 57 -330C39 -313 15 -307 -8 -308C-19 -319 -23 -331 -26 -341Z',AN=['M-4 -343Q4 -328 0 -309','M18 -345Q30 -330 28 -313','M39 -362Q54 -352 59 -334','M53 -382Q66 -376 74 -366'];
   /* les deux grandes cornes, la même que de face, en miroir */
   [-1,1].forEach(s=>{c.save();c.translate(-48,0);c.scale(s,1);c.translate(34,2);if(brise&&s<0){corneBrisee(c);c.restore();return}corne(CD,lg(c,66,-404,-22,-318,[[0,'#a47c8a'],[.4,'#4a2642'],[1,'#2a1230']]),AN);c.restore()});
   pc(c,'M-76 -340L-20 -340C-8 -330 -3 -316 -5 -300L-16 -284C-24 -276 -34 -272 -48 -272C-62 -272 -72 -276 -80 -284L-91 -300C-93 -316 -88 -330 -76 -340Z',lg(c,-96,-342,-4,-250,[[0,'#432041'],[1,'#1e0c26']]),
    [['M-76 -340L-48 -334L-52 -274L-74 -280L-91 -300Z',CL],['M-30 -340L-5 -300L-16 -284L-44 -274L-36 -296Z',OM],['M-70 -340L-26 -340L-34 -324L-62 -324Z',CL2]],14);
   tr(c,'M-82 -318Q-48 -300 -14 -318M-80 -294Q-48 -282 -16 -294','rgba(8,0,16,.75)',3);
   tr(c,'M-82 -321Q-48 -303 -14 -321','rgba(255,160,120,.35)',1.2);
   feu(c,'M-48 -332L-52 -310L-43 -296L-50 -284L-48 -276',3.4,1);
  }
  function dosCore(c,o,g){const A=g.A,pt=g.pt,s=o.dos,applyM=()=>c.transform(A[0],A[1],A[2],A[3],A[4],A[5]);
   const ra=Math.min(1,Math.max(0,((o.rage||0)-.35)*3));
   c.save();
   const LG=o.legs||{f:[0,0,0],n:[0,0,0]};
   c.save();if(o.plie)c.scale(1,1-.2*o.plie);
   /* les mêmes jambes, vues de l'arrière : pieds écartés vers l'extérieur */
   [[SP.legF,LG.f,SP.legFC,1,-6],[SP.legN,LG.n,SP.legNC,1,2]].forEach(([sp,q,ov,m,dx])=>{c.save();c.translate(dx,-q[1]*.55);c.scale(m,1);img(c,sp);if(ra>0){c.globalAlpha=ra;img(c,ov)}c.restore()});
   c.restore();
   const bras_=(m)=>{c.save();c.scale(m,1);const S=pt(m<0?-70:-70,-215);const H=[S[0]-34-(o.ouvre||0)*20,S[1]+104-(o.ouvre||0)*34];bras(c,S,H,0,ra);c.restore()};
   bras_(1);bras_(-1);
   c.save();applyM();halo(c,-3,-190,100,.3);img(c,SP.torsoD);c.globalAlpha=Math.min(1,(o.rage||0)*1.4);img(c,SP.torsoDC);c.restore();
   /* bandoulière et marteau sanglé en travers du dos */
   c.save();applyM();chaine(c,[[s*70,-250],[s*30,-205],[-s*20,-165],[-s*52,-135]],12,8,'#7a5a72','#f0b49a');
   c.translate(s*60,-222);c.rotate((s>0?-52:-128)*Math.PI/180);c.translate(112,0);c.scale(.86,.86);img(c,SP.ham);c.restore();
   c.save();applyM();img(c,SP.paulL);img(c,SP.paulR);c.restore();
   /* nuque et tête vues de dos, mêmes flammes */
   c.save();applyM();c.translate(36,-16);
   c.save();c.scale(.8,.8);halo(c,-48,-352,76,.5);c.translate(-8,0);couronne(c,o.t*.55,o.warm||1);c.translate(16,0);couronne(c,o.t*.55+.4,o.warm||1);c.restore();
   img(c,o.brise?SP.headDB:SP.headD);c.restore();
   /* la queue : la même que de face, qui part du bassin et fouette devant */
   if(o.qD){const R=pt(0,-134);queue(c,[R,...o.qD]);
    /* plaques du bassin qui recouvrent la racine de la queue */
    c.save();c.translate(R[0],R[1]);const pl=(pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.closePath();c.fill()};
    pl([[-37,-10],[-16,-30],[16,-30],[37,-10],[26,16],[0,28],[-26,16]],'#14081c');pl([[-33,-10],[-14,-27],[14,-27],[33,-10],[23,13],[0,24],[-23,13]],FER);pl([[-33,-10],[-14,-27],[14,-27],[0,-12]],FER_C);pl([[0,-12],[33,-10],[23,13],[0,24]],OM);pl([[0,-8],[8,4],[0,17],[-8,4]],'#ff8a35');c.restore()}
   c.restore();
   return {pt,coeur:pt(-3,-185),gueule:pt(0,-230),head:pt(0,-260),fa:{W:pt(-100,-110),E:pt(-100,-160)},na:{W:pt(100,-110),E:pt(100,-160)},applyM,far:pt(-70,-215),near:pt(70,-215)}}

  /* o : lean, drop, sx, dF, dN (buste) ; off (main lointaine depuis l'épaule) ; nn (décalage de la main proche) ; tip, sag (bout de la chaîne de la boule et mou, unités de pose) ;
     plie (jambes fléchies, 0 à 1) ; brise (grande corne brisée, phase III) ; tete (inclinaison de la tête, rad) ; fissure, rage (0 à 1 : fissures peintes dans chaque pièce) ; flash (0 à 1, éclair sur la silhouette),
     eteint (0 à 1, la silhouette s'assombrit) ;
     ham : marteau à deux mains { P main proche, a angle du manche (degrés), g tête -> main proche, wN / wF mains sur le manche,
     s boule en bandoulière, r : P et a dans le repère du buste } (absent : rangé dans le dos) ; t, warm, jaw, hurt, wound ; back(applyM), front(rig) */
  const STOW={P:[94,-256],a:-62,g:50,wN:0,wF:0,s:0,r:1},D=Math.PI/180;
  /* repère du buste : penché et pivoté autour de la taille (PY), descendu par drop et par les jambes qui ploient */
  function frame(o){const dr=o.drop+(o.plie||0)*26,co=Math.cos(o.lean),si=Math.sin(o.lean),A=[o.sx*co,o.sx*si,-si,co,si*PY,PY+dr-co*PY];
    return {A,pt:(x,y)=>[A[0]*x+A[2]*y+A[4],A[1]*x+A[3]*y+A[5]]}}
  let LAY=null; /* calque de teinte, créé à la première teinte puis réutilisé (flash, eteint) */
  function draw(c,o){
    if(!SP)build();
    const g=frame(o),A=g.A;
    /* ailes et traînée : derrière, sur le contexte du jeu (jamais teintées) */
    if(o.back){c.save();o.back((dx=0)=>{c.transform(A[0],A[1],A[2],A[3],A[4],A[5]);if(dx)c.translate(dx,0)});c.restore()}
    const fl=o.flash||0,et=o.eteint||0;
    if(!(fl>.01||et>.01))return core(c,o,g);
    /* teinte : le Colosse est dessiné dans un calque, la teinte ne couvre que sa silhouette (source-atop) */
    const cv=c.canvas,T=c.getTransform();
    if(!LAY)LAY=document.createElement('canvas');
    if(LAY.width!==cv.width||LAY.height!==cv.height){LAY.width=cv.width;LAY.height=cv.height}
    const x=LAY.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,LAY.width,LAY.height);x.setTransform(T.a,T.b,T.c,T.d,T.e,T.f);
    const rig=core(x,o,g);
    x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-atop';
    if(et>.01){x.fillStyle='rgba(30,22,48,'+.5*Math.min(1,et)+')';x.fillRect(0,0,LAY.width,LAY.height)}
    if(fl>.01){x.fillStyle='rgba(255,246,214,'+Math.min(1,fl)+')';x.fillRect(0,0,LAY.width,LAY.height)}
    x.globalCompositeOperation='source-over';
    c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(LAY,0,0);c.restore();
    return rig}
  function core(c,o,g){
    if(o.dos)return dosCore(c,o,g);   /* vue de dos pendant le pivot du coup de queue */
    const A=g.A,pt=g.pt;
    const applyM=(dx=0)=>{c.transform(A[0],A[1],A[2],A[3],A[4],A[5]);if(dx)c.translate(dx,0)};
    const mix=(p,q,u)=>[p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u];
    const far=pt(-70+o.dF,-215),near=pt(70+o.dN,-215),hd=(o.dF+o.dN)/2;
    /* marteau : main proche sur le manche, main lointaine plus près de la tête */
    const hm=o.ham||STOW,r=hm.r||0,Pr=pt(hm.P[0],hm.P[1]),P=mix(hm.P,Pr,r),an=hm.a*D+o.lean*r,dir=[Math.cos(an),Math.sin(an)];
    const head=[P[0]+dir[0]*hm.g,P[1]+dir[1]*hm.g],surF=[P[0]+dir[0]*45,P[1]+dir[1]*45];
    const nn=o.nn||[0,0],Hr=[near[0]+42-o.lean*70+nn[0],near[1]+113+o.lean*20+nn[1]],Hn=mix(Hr,P,hm.wN),H=mix([far[0]+o.off[0],far[1]+o.off[1]],surF,hm.wF);
    const act=hm.wN>0,dos=hm.wN<.999||(hm.a>-100&&hm.wF<.5)||(hm.a>-60&&head[0]>40); /* tête derrière le dos : marteau derrière le corps */
    const fl=.85+.15*Math.sin(o.t*9),warm=o.warm||1,ph=o.t*.55;
    const lk=(o.look||0)+(o.tete||0),PV=[-36,-206],headM=()=>{applyM(hd);c.translate(PV[0],PV[1]);c.rotate(lk);c.translate(-PV[0],-PV[1])};
    const hpt=(x,y)=>{const cx=x-PV[0],cy=y-PV[1],cl=Math.cos(lk),sn=Math.sin(lk);return pt(PV[0]+cx*cl-cy*sn+hd,PV[1]+cx*sn+cy*cl)};
    /* fissures : dans chaque pièce, opacité = intensité (fissure ou rage) ; épaules et bras à partir de .35 de rage, jambes à partir de .7 */
    const rg=o.rage||0,ca=Math.min(1,Math.max(o.fissure||0,rg)*1.5),ra=Math.min(1,Math.max(0,(rg-.35)*3)),rl=Math.min(1,Math.max(0,(rg-.7)*4)),
      cr=(sp,a)=>{if(a>.01){c.save();c.globalAlpha=Math.min(1,a);img(c,sp);c.restore()}};
    const sl=pt(-34,-128),s=hm.s||0,tip=o.tip?mix(o.tip,sl,s):sl,behind=s<.5&&tip[0]>-20&&tip[1]<-150;
    const marteau=()=>{c.save();c.translate(head[0],head[1]);c.rotate(an);img(c,SP.ham);c.restore()};
    /* boule : au poing au bout de sa chaîne, ou rangée en bandoulière pendant l'attaque au marteau */
    const boule_=W=>{
      if(s>=.999){c.save();c.translate(sl[0],sl[1]);c.rotate(o.lean);c.scale(.85,.85);img(c,SP.ball);c.restore();return}
      const sg=(o.sag*(1-s)+4*s)*1.3;
      chaine(c,[W,[(W[0]*2+tip[0])/3,(W[1]*2+tip[1])/3+sg],[(W[0]+tip[0]*2)/3,(W[1]+tip[1]*2)/3+sg],tip],Math.max(4,Math.round(Math.hypot(tip[0]-W[0],tip[1]-W[1])/15)),9,'#6c4e68','#f0b49a');
      if(o.heat>.5&&s<.1)halo(c,tip[0],tip[1],56,.5*o.heat);
      c.save();c.translate(tip[0],tip[1]);c.rotate(tip[0]*.012*(1-s)+o.lean*s);const k=1-.15*s;c.scale(k,k);img(c,SP.ball);c.restore()};
    const Wf=ik(far,H,-1)[1];
    c.save();
    /* queue : toujours visible, tout au fond, la racine suit le bassin */
    queue(c,queueAccrochee(o.qP||queueSol(o),pt)); /* o.qP : queue pilotée par la phase II (même courbe, même forme) */
    if(dos)marteau();
    if(behind)boule_(Wf);
    /* jambes : o.legs = {f:[x, lever, angle], n:[...]} en unités de pose (pas lourds) ; la lointaine derrière */
    const LG=o.legs||{f:[0,0,0],n:[0,0,0]};
    /* chaque jambe pivote autour de sa hanche (elle reste attachée au bassin) ; le pied lointain reste à gauche du proche (jamais croisées) */
    const LL=120,HF=[-40,-118],HN=[34,-118];
    let aF=Math.asin(Math.max(-.38,Math.min(.38,-LG.f[0]/LL))),aN=Math.asin(Math.max(-.38,Math.min(.38,-LG.n[0]/LL)));
    const gap=(HN[0]-LL*Math.sin(aN))-(HF[0]-LL*Math.sin(aF));if(gap<34){const k=(34-gap)/(2*LL);aF+=k;aN-=k}
    c.save();if(o.plie)c.scale(1,1-.2*o.plie); /* il ploie sur ses jambes : elles se raccourcissent, les pieds restent au sol */
    const kn=o.kneel||0;
    [[SP.legF,LG.f,HF,aF,SP.legFC],[SP.legN,LG.n,HN,aN,SP.legNC]].forEach(([sp,q,hip,an,ov])=>{
      if(kn>.001){ /* genou à terre (final) : le même sprite de jambe, articulé au genou. Jambe lointaine devant : cuisse en avant, tibia à la verticale ; jambe proche : cuisse verticale, genou au sol, tibia et pied couchés derrière */
        const near=sp===SP.legN,b=sp.box,dk=o.kdk*kn,ky=near?-56:-60,kx=near?46:-66,p1=near?0:1.15*kn,p2=near?-1.5*kn:0,co=Math.cos(p1),si=Math.sin(p1),
          hn=[hip[0],hip[1]+dk],vx=kx-hip[0],vy=ky-hip[1],kk=[hn[0]+vx*co-vy*si,hn[1]+vx*si+vy*co-(near?22*kn:0)];
        c.save();c.translate(hn[0],hn[1]);c.rotate(p1);c.translate(-hip[0],-hip[1]);c.beginPath();c.rect(b[0],b[1],b[2],ky-b[1]);c.clip();img(c,sp);c.restore();
        c.save();c.translate(kk[0],kk[1]);c.rotate(p2);c.translate(-kx,-ky);c.beginPath();c.rect(b[0],ky,b[2],b[1]+b[3]-ky);c.clip();img(c,sp);c.restore();
        return}
      c.save();c.translate(hip[0],hip[1]-q[1]*.55);c.rotate(an+q[2]);c.translate(-hip[0],-hip[1]);img(c,sp);cr(ov,rl);c.restore()});
    c.restore();
    if(o.wound>0){c.save();c.strokeStyle='rgba(255,220,140,'+Math.min(1,o.wound)+')';c.lineWidth=3.5;c.lineCap='round';c.beginPath();c.moveTo(-63,-61);c.lineTo(-40,-61);c.moveTo(-63,-61);c.lineTo(-53,-77);c.moveTo(-63,-61);c.lineTo(-53,-45);c.stroke();c.restore()}
    c.save();applyM();halo(c,-24,-205,90,.3*warm*fl*(1-(o.out||0)));img(c,SP.torso);cr(SP.torsoC,ca);cr(SP.torsoR,ra);c.restore();
    let na=act?null:bras(c,near,Hn,0,ra);
    c.save();headM();img(c,SP.corneL);c.restore();
    c.save();applyM(o.dN);img(c,SP.paulR);cr(SP.paulRC,Math.min(ra,ca));c.restore();
    if(act)na=bras(c,near,Hn,0,ra);
    const fa=bras(c,far,H,1,ra); /* main arrière : le bras lointain et sa main passent DERRIÈRE le manche (dessinés avant le marteau, la main n'est pas redessinée après) */
    if(!dos)marteau();
    if(act)seg(c,SP.fist,na.W,na.an);
    c.save();applyM(o.dF);img(c,SP.paulL);cr(SP.paulLC,Math.min(ra,ca));c.restore();
    /* tête : couronne derrière, gueule qui s'ouvre (jaw), yeux blancs quand il est touché */
    c.save();headM();c.scale(.8,.8);
    halo(c,-40,-350,70,.45*warm*fl*(1-(o.out||0)));if((o.out||0)<.98)couronne(c,ph,warm,1-(o.out||0));
    c.scale(1.25,1.25);img(c,o.brise?SP.headB:SP.head);cr(o.brise?SP.headBC:SP.headC,ca);c.scale(.8,.8);
    const j=o.jaw||0;
    if(j>0){c.fillStyle='rgba(255,160,60,.95)';c.beginPath();c.moveTo(-95,-254);c.lineTo(-29,-258);c.lineTo(-31,-246+j);c.lineTo(-90,-240+j);c.closePath();c.fill()}
    const ey=o.eyes||0;if(ey>.02&&!o.hurt){halo(c,-64,-296,26+30*ey,.7*ey);halo(c,-86,-296,18+22*ey,.6*ey);c.save();c.globalAlpha=Math.min(1,ey);c.fillStyle='#fff7d4';c.fill(P2('M-94 -302L-75 -289L-79 -286.5L-91 -294Z'));c.fill(P2('M-65 -287L-34 -309L-39 -296L-55 -285.5Z'));c.restore()}
    if(o.hurt){c.fillStyle='#ffffff';c.fill(P2('M-94 -302L-75 -289L-79 -286.5L-91 -294Z'));c.fill(P2('M-65 -287L-34 -309L-39 -296L-55 -285.5Z'))}
    c.translate(0,j);c.scale(1.25,1.25);img(c,SP.jaw);
    c.restore();
    c.save();applyM();img(c,SP.sangle);c.restore();
    /* le poing proche, serré sur le manche, passe devant (le lointain reste derrière) */
    if(!dos&&hm.wF>.9)seg(c,SP.fist,na.W,na.an);
    if(!behind)boule_(fa.W);
    /* souffle : fumée et braises qui sortent des naseaux et de la gueule au rythme de la respiration (o.breath = phase) */
    if(o.breath!=null){const N=[hpt(-64,-222),hpt(-52,-222),hpt(-50,-200)];c.save();
      for(let i=0;i<12;i++){const age=((o.t*.55)+i/12)%1,te=o.t-age/.55,env=Math.max(0,-Math.sin(te*2.2));if(env<.05)continue;
        const n=N[i%3],x=n[0]-age*(16+i%4*5)+Math.sin(te*3+i)*3,y=n[1]-age*(34+i%3*8),r=2.5+age*11;
        c.fillStyle='rgba(72,52,80,'+(.42*(1-age)*env*(o.smoke||1))+')';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
        if(i%4===0){c.fillStyle='rgba(255,'+(140+i*8)+',60,'+(.8*(1-age)*env)+')';c.fillRect(x+r*.4,y-r*.3,1.6,1.6)}}
      c.restore()}
    const mouth=hpt(-49.6,-200+j*.4);
    const rig={far,near,fa,na,mouth,head,P,dir,applyM,pt,coeur:pt(-20,-185),gueule:pt(-58,-207)};
    if(o.front)o.front(rig);
    c.restore();
    return rig}
  /* ---- ailes de la phase III (maquette colosse-clocher.js) : intactes, puis rongées (trous brûlés au liseré de braise, membrane déchirée, os à nu).
     Quatre calques (lointaine / proche x intacte / rongée) cuits par ailes3() à l'entrée de la phase III, jamais en combat. Repère : racine en (0, 0),
     l'aile s'étend vers x positif ; dessinés à (-20, -200, 420, 280) en unités de pose. ---- */
  const AILES3={};
  function aileBase(c,loin){pc(c,'M0 -6L70 -96L148 -148L330 -178C318 -150 312 -118 322 -84C292 -96 262 -84 250 -46C228 -70 192 -66 176 -24C158 -48 122 -46 106 -6C90 -22 60 -20 44 12L6 44Z',loin?'#331432':'#4a1c3a',
    [['M0 -6L70 -96L148 -148L330 -178L148 -118L74 -70Z',loin?CL2:CL],['M148 -148L250 -46C228 -70 192 -66 176 -24Z',OM],['M148 -148L106 -6C90 -22 60 -20 44 12Z','rgba(7,0,18,.3)']],8)}
  function aileOs(c,loin){[['M0 -6L70 -96L148 -148L330 -178',11],['M148 -148Q245 -130 322 -84',5.5],['M148 -148Q220 -110 250 -46',5],['M148 -148Q170 -90 176 -24',4.5],['M148 -148Q120 -90 106 -6',4]].forEach(([d,w])=>{tr(c,d,'#1a0820',w);tr(c,d,loin?'rgba(150,130,196,.4)':'rgba(214,180,236,.55)',w*.25)});
    pc(c,'M140 -146L146 -176L158 -150Z','#2c1534',[],3);pc(c,'M326 -178L352 -170L328 -166Z','#2c1534',[],2)}
  function aileCuite(loin,ronge){
    const R=Math.min(2.4,SP.R),e=mk(420*R,280*R),c=e.getContext('2d');c.setTransform(R,0,0,R,20*R,200*R);
    aileBase(c,loin);
    if(ronge){
      const trou=(x,y,r,s)=>{const q=()=>(s=(s*16807)%2147483647)/2147483647,p=[];for(let i=0;i<11;i++){const a=i*TAU/11,d=r*(.55+q()*.7);p.push([x+Math.cos(a)*d,y+Math.sin(a)*d*.85])}return p};
      const T=[[96,-62,17,3],[196,-96,22,8],[262,-100,14,15],[142,-62,11,21],[62,-34,9,27],[228,-140,12,33],[322,-84,38,41],[250,-46,34,47],[176,-24,30,53],[106,-6,25,59],[296,-70,27,63],[206,-42,21,69],[300,-176,16,71]].map(v=>trou(...v));
      const chemin=p=>{c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath()};
      /* liseré de braise, puis le trou */
      c.save();c.globalCompositeOperation='source-atop';c.lineJoin='round';T.forEach(p=>{chemin(p);c.strokeStyle='#12040e';c.lineWidth=13;c.stroke();c.strokeStyle='#e9561b';c.lineWidth=5;c.stroke();c.strokeStyle='#ffc27a';c.lineWidth=1.6;c.stroke()});c.restore();
      c.save();c.globalCompositeOperation='destination-out';c.fillStyle='#000';T.forEach(p=>{chemin(p);c.fill()});c.restore()}
    aileOs(c,loin);
    return e}
  function ailes3(){if(!SP)build();for(const l of [0,1])for(const r of [0,1]){const k=l+'|'+r;if(!AILES3[k])AILES3[k]=aileCuite(!!l,!!r)}return AILES3}
  /* aile cuite : loin (lointaine), ronge (rongée) ; cuit à la volée seulement si ailes3() n'a pas été appelée */
  function aile(loin,ronge){const k=(loin?1:0)+'|'+(ronge?1:0);return AILES3[k]||ailes3()[k]}
  return {draw,ik,L1,L2,ailes3,aile};
})();

/* ===== Effets du Colosse réutilisables (référence ripostes-reference.js, 27/11) : dégâts, éclats, flammes de rage =====
   Écrits pour les phases II et III, NON branchés dans ce lot (seule la phase I les appelle). Aplats nets : aucun flou, aucune ombre portée,
   aucun canvas créé ; chaque fonction reçoit le contexte et des coordonnées dans le repère courant. Mouvement réduit : l'appelant ne lance pas
   les éclats et passe t = 0 aux flammes (elles ne vacillent plus). Les flammes de rage se dessinent dans le repère des pieds du Colosse, en
   unités de pose (REF : les tracés de la référence sont en pixels de maquette, 1,25 par unité de pose). */
const COLFX=(()=>{
  const TAU=6.283185307179586,cl=v=>v<0?0:v>1?1:v,sm=u=>{u=cl(u);return u*u*(3-2*u)},REF=.8;
  const rnd=s=>()=>(s=(s*16807)%2147483647)/2147483647;
  /* réaction de dégâts : monte en 80 ms, tient (hold), revient en d ; t = secondes depuis l'impact t0 */
  function choc(t,t0,d,hold){const u=t-t0,h=hold==null?.2:hold;if(u<0)return 0;if(u<.08)return u/.08;if(u<.08+h)return 1;return Math.pow(1-cl((u-.08-h)/d),2)}
  function poly(c,pts,col){c.fillStyle=col;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill()}
  /* étoile à n branches (éclair d'impact) */
  function etoile(c,x,y,r,n,rot,col,k){if(!(r>0))return;k=k==null?.42:k;const p=[];for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,d=i%2?r*k:r*(i%4?1:.72);p.push([x+Math.cos(a)*d,y+Math.sin(a)*d])}poly(c,p,col)}
  /* éclats projetés : t = secondes depuis l'impact (0,8 s de vie), v = vitesse, sol = hauteur du sol, g = gravité ; col = une couleur ou une liste */
  function eclats(c,x,y,t,n,col,v,seed,sol,g){if(t<0||t>.8)return;g=g==null?500:g;const r=rnd(seed);
    for(let i=0;i<n;i++){const a=-Math.PI*.5+(r()-.5)*4,s=v*(.4+r()),px=x+Math.cos(a)*s*t,py=Math.min(sol==null?1e9:sol,y+Math.sin(a)*s*t+g*t*t),d=(3+r()*7)*(1-t/.8),q=r()*6+t*9;
      c.fillStyle=Array.isArray(col)?col[i%col.length]:col;c.beginPath();c.moveTo(px+Math.cos(q)*d,py+Math.sin(q)*d);c.lineTo(px+Math.cos(q+2.2)*d,py+Math.sin(q+2.2)*d);c.lineTo(px+Math.cos(q+4)*d*.7,py+Math.sin(q+4)*d*.7);c.closePath();c.fill()}}
  /* flamme découpée, trois tons et un cœur clair, sans flou : (x, y) pied, w largeur, h hauteur, l inclinaison, ph phase du vacillement */
  function flamme(c,x,y,w,h,l,ph,a){if(h<2)return;c.save();c.globalAlpha=a==null?1:a;
    [[1,'#8e2418'],[.7,'#d4501f'],[.38,'#ff9a35'],[.16,'#ffe08a']].forEach(([s,col],j)=>{const q=Math.sin(ph+j)*w*.5,hh=h*(s*.75+.25),ww=w*s;
      c.fillStyle=col;c.beginPath();c.moveTo(x-ww,y);c.lineTo(x-ww*.85+q*.2,y-hh*.38);c.lineTo(x-ww*.25,y-hh*.34);c.lineTo(x+l*s+q,y-hh);c.lineTo(x+ww*.3+l*.4*s,y-hh*.55);c.lineTo(x+ww*.95,y-hh*.62);c.lineTo(x+ww*.7,y-hh*.3);c.lineTo(x+ww,y);c.closePath();c.fill()});
    c.restore()}
  /* flammes de rage : derrière le Colosse (x, y du haut du torse, w, h, inclinaison), puis petites flammes devant, au ras du sol */
  const DERRIERE=[[-92,-300,24,96,-34],[-54,-330,30,150,-40],[0,-338,34,178,-14],[52,-334,30,146,22],[96,-318,24,112,40],[130,-276,20,84,44],[-120,-250,18,70,-40]];
  const SOL=[-170,-128,-92,88,124,170];
  /* f : intensité des flammes (0 à 1) ; t : horloge du vacillement (0 : figées) ; c : repère des pieds, unités de pose */
  function rageDerriere(c,t,f){if(!(f>.01))return;c.save();c.scale(REF,REF);DERRIERE.forEach(([x,y,w,h,l],i)=>flamme(c,x,y+40,w,h*f,l,t*13+i*1.7));c.restore()}
  function rageSol(c,t,f){if(!(f>.01))return;c.save();c.scale(REF,REF);SOL.forEach((x,i)=>flamme(c,x,2,11+(i%3)*3,(34+(i%3)*18)*f*(.8+.2*Math.sin(t*15+i)),x<0?-9:9,t*16+i));c.restore()}
  /* ondes de braise au sol à l'éclat du cri : u = secondes depuis le cri (deux anneaux décalés de .18 s, .8 s chacun) */
  function ondes(c,u){c.save();c.scale(REF,REF);for(let i=0;i<2;i++){const v=(u-i*.18)/.8;if(v>0&&v<1){const r=80+v*430;c.strokeStyle='rgba(255,150,60,'+(1-v)+')';c.lineWidth=12*(1-v)+2;c.beginPath();c.ellipse(0,3,r,r*.09,0,0,TAU);c.stroke()}}c.restore()}
  /* jet de flammes (souffle, jets de fureur) : cône découpé en dents de scie, quatre tons du rouge sombre au jaune, front large et franc,
     langues qui s'échappent des bords, braises devant ; aplats nets (ni flou ni ombre). o départ, f front, wd demi-largeur au front, t horloge (0 : figé), a opacité */
  function jet(c,o,f,wd,t,a){const dx=f[0]-o[0],dy=f[1]-o[1],L=Math.hypot(dx,dy);if(L<4)return;const n=[-dy/L,dx/L],u=[dx/L,dy/L];
    c.save();c.globalAlpha=cl(a==null?1:a);
    [[1,'#8e2418'],[.76,'#d4501f'],[.5,'#ff9a35'],[.24,'#ffe08a']].forEach(([w,col],j)=>{const N=11,l=1-j*.05,h=[],b=[];
      for(let i=0;i<=N;i++){const v=i/N*l,ww=(4+v*wd)*w*(i%2?1:.64)*(1+.1*Math.sin(t*23+i*1.7+j)),x=o[0]+dx*v,y=o[1]+dy*v+Math.sin(t*19-i*1.3)*6*v;h.push([x+n[0]*ww,y+n[1]*ww]);b.push([x-n[0]*ww,y-n[1]*ww])}
      const ex=o[0]+dx*l,ey=o[1]+dy*l,fw=wd*w;
      poly(c,[...h,[ex+u[0]*fw*.3+n[0]*fw*.55,ey+u[1]*fw*.3+n[1]*fw*.55],[ex+u[0]*fw*.5,ey+u[1]*fw*.5],[ex+u[0]*fw*.3-n[0]*fw*.55,ey+u[1]*fw*.3-n[1]*fw*.55],...b.reverse()],col)});
    for(let i=0;i<6;i++){const v=.3+i*.12,sd=i%2?1:-1,ww=(4+v*wd)*.9,x=o[0]+dx*v+n[0]*ww*sd,y=o[1]+dy*v+n[1]*ww*sd,q=.6+.4*Math.sin(t*17+i*2.3),k=(9+wd*.3*v)*q;
      poly(c,[[x-u[0]*9,y-u[1]*9],[x+n[0]*k*sd-u[0]*k*.8,y+n[1]*k*sd-u[1]*k*.8],[x+u[0]*7,y+u[1]*7]],i%3?'#d4501f':'#ff9a35')}
    const r=rnd(7);for(let i=0;i<7;i++){const v=(r()+t*2.6)%1,x=f[0]+u[0]*(10+v*wd*.9)+n[0]*(r()-.5)*wd*1.4,y=f[1]+u[1]*(10+v*wd*.9)+n[1]*(r()-.5)*wd*1.4-v*12,s=3.5*(1-v)+1;
      poly(c,[[x,y-s],[x+s*.7,y],[x,y+s],[x-s*.7,y]],i%2?'#ffe08a':'#ff9a35')}
    c.restore()}
  return {choc,poly,etoile,eclats,flamme,rageDerriere,rageSol,ondes,jet};
})();
