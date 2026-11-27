function bodyChain(t,hk){
  hk=hk||0;if(hk>=1)return;
  ctx.save();ctx.lineCap='round';
  const link=(x,y,a)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle='#9a8aa8';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,9,5.5,0,0,6.283);ctx.stroke();ctx.restore()};
  const A=[70,-228],B=[-62,-118],n=9;
  for(let i=0;i<=Math.round(n*(1-hk));i++){const k=i/n;link(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,Math.atan2(B[1]-A[1],B[0]-A[0])+(i%2?1.5708:0))}
  /* crochet qui pend à la ceinture (il le décroche pour lancer l'attaque) */
  if(hk<.5){ctx.strokeStyle='#8a7a9a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-62,-118);ctx.lineTo(-58,-100);ctx.arc(-52,-92,8,3.3,-0.35,true);ctx.stroke();}
  ctx.restore();
}
function bodyAnvils(t){
  ctx.save();
  for(const sd of[-1,1]){ctx.save();ctx.scale(sd,1);
    qp([[96,-262],[150,-266],[176,-250],[150,-246],[140,-232],[112,-232],[104,-246]],'#3a2d44','#5a4666',2.5);
    ctx.strokeStyle='rgba(255,122,43,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(112,-256);ctx.lineTo(150,-258);ctx.stroke();
    ctx.restore()}
  ctx.restore();
}
/* La masse, quand le Colosse ne s'en sert pas : accrochée dans son dos, la tête dépasse derrière l'épaule */
function stowMace(t,a){
  if(a<=.02)return;
  ctx.save();ctx.globalAlpha=a;ctx.translate(34,-112);ctx.rotate(-1.16);drawHammer(245,.25,t,9);ctx.restore();
}
function demonBody(o){
  const t=o.t,warm=o.warm||1,jaw=o.jaw||0,fl=.8+.2*Math.sin(t*9);
  const FA=['rgba(255,196,90,.92)','rgba(255,106,40,.92)'];
  stowMace(t,o.stow==null?0:o.stow);
  let g=ctx.createRadialGradient(0,-290,10,0,-290,160);
  g.addColorStop(0,'rgba(255,140,50,'+Math.min(.55,.3*warm)+')');g.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-290,160,0,6.283);ctx.fill();
  for(let i=0;i<9;i++){
    const k=Math.abs(i-4),h=(50+34*Math.abs(Math.sin(t*6+i*1.7)))*warm*(1-k*.09);
    qflame(-72+i*18,-306+k*4,13,h,i,FA[i%2]);
  }
  for(const sd of [-1,1]){
    ctx.save();ctx.scale(sd,1);
    qp([[22,-152],[72,-152],[68,-96],[56,-62],[64,-24],[22,-24],[26,-62],[18,-96]],'#1b1421','#3a2d44',2.5);
    qp([[16,-24],[68,-24],[76,0],[12,0]],'#120d17','#3a2d44',2);
    qp([[62,-100],[88,-92],[66,-78]],'#3a2d44','#4a3a55',1.5);
    ctx.strokeStyle='rgba(255,122,43,'+(.85*fl)+')';ctx.lineWidth=3;ctx.lineCap='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=8*warm;
    ctx.beginPath();ctx.moveTo(44,-142);ctx.lineTo(40,-112);ctx.lineTo(47,-82);ctx.lineTo(41,-50);ctx.stroke();
    ctx.restore();
    qflame(sd*44,-22,11,(26+12*Math.abs(Math.sin(t*8+sd)))*warm,sd+2,FA[(sd+1)/2]);
  }
  if(o.wound>0){
    ctx.save();ctx.shadowColor='#ffb04a';ctx.shadowBlur=14;ctx.lineCap='round';
    ctx.strokeStyle='rgba(255,220,140,'+clamp01(o.wound)+')';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-72,-70);ctx.lineTo(-46,-70);ctx.moveTo(-72,-70);ctx.lineTo(-60,-88);ctx.moveTo(-72,-70);ctx.lineTo(-60,-52);ctx.stroke();
    ctx.restore();
  }
  qp([[-68,-162],[68,-162],[56,-122],[-56,-122]],'#1a1421','#3a2d44',2.5);
  qp([[-20,-160],[20,-160],[0,-124]],'#2b2233','#5a4666',2);
  const pg=ctx.createRadialGradient(0,-148,2,0,-148,26);pg.addColorStop(0,'rgba(255,220,140,'+Math.min(1,.8*fl*warm)+')');pg.addColorStop(1,'rgba(255,100,30,0)');
  ctx.fillStyle=pg;ctx.beginPath();ctx.arc(0,-148,26,0,6.283);ctx.fill();
  const tg=ctx.createLinearGradient(0,-242,0,-150);tg.addColorStop(0,'#35293d');tg.addColorStop(1,'#16101b');
  qp([[-104,-238],[104,-238],[76,-190],[56,-150],[-56,-150],[-76,-190]],tg,'#0d0911',3);
  ctx.strokeStyle='#0d0911';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,-234);ctx.lineTo(0,-178);
  ctx.moveTo(-72,-216);ctx.quadraticCurveTo(-38,-168,0,-184);ctx.moveTo(72,-216);ctx.quadraticCurveTo(38,-168,0,-184);
  for(let i=0;i<3;i++){ctx.moveTo(-26,-170+i*10);ctx.lineTo(-4,-170+i*10);ctx.moveTo(4,-170+i*10);ctx.lineTo(26,-170+i*10)}
  ctx.stroke();
  const hg=ctx.createRadialGradient(0,-198,4,0,-198,86);
  hg.addColorStop(0,'rgba(255,200,110,'+Math.min(.8,.5*warm)+')');hg.addColorStop(.4,'rgba(255,110,40,'+Math.min(.5,.3*warm)+')');hg.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,-198,86,0,6.283);ctx.fill();
  ctx.save();
  ctx.strokeStyle='rgba(255,'+(130+Math.round(70*fl))+',50,'+Math.min(1,.8*fl*warm)+')';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=12*warm;
  [[[-6,-232],[4,-212],[-8,-196],[6,-180]],[[4,-212],[30,-206],[48,-190]],[[-8,-196],[-34,-190],[-50,-176]],[[-60,-228],[-48,-212],[-52,-196]],[[62,-226],[50,-208],[56,-194]],[[6,-180],[-4,-164],[8,-152]]].forEach(L=>{
    ctx.beginPath();L.forEach((q,n)=>n?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  });
  ctx.restore();
  qp([[-30,-258],[30,-258],[42,-232],[-42,-232]],'#1a1421','#3a2d44',2);
  for(const sd of [-1,1]){
    ctx.save();ctx.scale(sd,1);
    const brk=o.hornCut&&sd===1;
    if(brk){qp([[30,-298],[38,-320],[64,-340],[94,-346],[104,-338],[96,-330],[102,-322],[94,-316],[66,-296]],'#3a2a3c','#5a4666',2.5);
      ctx.save();ctx.strokeStyle='rgba(255,150,60,.85)';ctx.lineWidth=3;ctx.shadowColor='#ff7a2b';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(94,-346);ctx.lineTo(104,-338);ctx.lineTo(96,-330);ctx.lineTo(102,-322);ctx.lineTo(94,-316);ctx.stroke();ctx.restore();}
    else qp([[30,-298],[38,-320],[64,-340],[100,-348],[134,-390],[124,-338],[98,-316],[66,-296]],'#3a2a3c','#5a4666',2.5);
    ctx.strokeStyle='#241a2a';ctx.lineWidth=3;ctx.beginPath();
    ctx.moveTo(58,-318);ctx.lineTo(66,-298);ctx.moveTo(84,-330);ctx.lineTo(90,-312);if(!brk){ctx.moveTo(108,-352);ctx.lineTo(112,-332)}ctx.stroke();
    ctx.restore();
  }
  qp([[-42,-300],[-32,-324],[0,-332],[32,-324],[42,-300],[36,-272],[22,-254],[-22,-254],[-36,-272]],'#2e2336','#0d0911',3);
  qp([[-46,-298],[0,-289],[46,-298],[42,-310],[0,-301],[-42,-310]],'#130e18');
  if(jaw>0){
    ctx.save();ctx.shadowColor='#ffb04a';ctx.shadowBlur=18;
    qp([[-22,-268],[22,-268],[18,-254+jaw],[-18,-254+jaw]],'rgba(255,160,60,.95)');
    ctx.restore();
  }
  ctx.save();ctx.translate(0,jaw);
  qp([[-26,-266],[26,-266],[22,-252],[0,-243],[-22,-252]],'#241a2a','#0d0911',2);
  qp([[-14,-266],[-10,-277],[-6,-266]],'#eadbc8');qp([[6,-266],[10,-277],[14,-266]],'#eadbc8');
  ctx.restore();
  qp([[-18,-268],[-14,-258+jaw*.3],[-10,-268]],'#eadbc8');qp([[10,-268],[14,-258+jaw*.3],[18,-268]],'#eadbc8');
  ctx.save();ctx.shadowColor='#ffb347';ctx.shadowBlur=16;
  const ec=o.hurt?'#ffffff':'#ffd27a';
  qp([[-36,-292],[-8,-285],[-10,-277],[-34,-283]],ec);qp([[36,-292],[8,-285],[10,-277],[34,-283]],ec);
  ctx.restore();
  ctx.strokeStyle='#0d0911';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,-274);ctx.lineTo(-3,-266);ctx.moveTo(5,-274);ctx.lineTo(3,-266);ctx.stroke();
  [-26,-9,9,26].forEach((x,i)=>qflame(x,-324,8,(30+22*Math.abs(Math.sin(t*8+i*2)))*warm,i,FA[i%2]));
  for(const sd of [-1,1]){
    ctx.save();ctx.scale(sd,1);
    qp([[58,-242],[102,-258],[136,-238],[132,-206],[98,-196],[60,-208]],'#261d2e','#5a4666',3);
    qp([[136,-238],[154,-276],[118,-252]],'#3a2d44','#5a4666',2);
    qp([[110,-254],[114,-292],[90,-258]],'#3a2d44','#5a4666',2);
    qp([[134,-212],[166,-216],[136,-230]],'#3a2d44','#5a4666',2);
    ctx.strokeStyle='rgba(255,122,43,'+(.85*fl)+')';ctx.lineWidth=3;ctx.lineCap='round';ctx.shadowColor='#ff7a2b';ctx.shadowBlur=8*warm;
    ctx.beginPath();ctx.moveTo(72,-232);ctx.lineTo(100,-224);ctx.lineTo(122,-226);ctx.stroke();
    ctx.restore();
    qflame(sd*98,-258,11,(28+16*Math.abs(Math.sin(t*7+sd*3)))*warm,sd+4,FA[(sd+1)/2]);
  }
  bodyAnvils(t);bodyChain(t,o.hk);
}

/* ===== Colosse A9 (phase I, pont) : dessin de la référence validée colosse-a9.js (27/11).
   Coordonnées de pose : maquette x0.8, origine entre les pieds. Chaque pièce rigide (jambes, torse, épaules, tête, mâchoire,
   bandoulière, segments de bras, poing, boule) est peinte une seule fois dans un calque en cache, avec ses ombres, flous et son
   liseré ; à chaque image on ne fait que les poser. Le buste se penche et pivote autour de la taille (PY), les jambes restent
   plantées ; les bras gardent des longueurs fixes (L1, L2) et plient toujours du même côté. demonBody (phases II et III) n'y touche pas. */
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
  function tete(c){const hot=1;const corne=(d,g,anneaux)=>{pc(c,d,g,[],9);anneaux.forEach(a=>{tr(c,a,'rgba(10,2,16,.75)',2.6);c.save();c.translate(1.5,-2);tr(c,a,'rgba(255,196,160,.28)',1.1);c.restore()})};
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
   /* ---- corne proche : large, coudée, comme au jeu ---- */
   corne('M-26 -341C-2 -347 21 -346 35 -358C48 -369 57 -384 62 -404C78 -380 77 -349 57 -330C39 -313 15 -307 -8 -308C-19 -319 -23 -331 -26 -341Z',lg(c,66,-404,-22,-318,[[0,'#a47c8a'],[.4,'#4a2642'],[1,'#2a1230']]),
    ['M-4 -343Q4 -328 0 -309','M18 -345Q30 -330 28 -313','M39 -362Q54 -352 59 -334','M53 -382Q66 -376 74 -366']);
   }
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
    SP.glow=bake([-64,-64,128,128],x=>{const g=x.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,'rgba(255,150,60,1)');g.addColorStop(.35,'rgba(255,110,40,.4)');g.addColorStop(1,'rgba(255,90,30,0)');x.fillStyle=g;x.fillRect(-64,-64,128,128)});
  }
  const img=(c,s)=>c.drawImage(s.e,s.box[0],s.box[1],s.box[2],s.box[3]);
  function seg(c,s,A,an){c.save();c.translate(A[0],A[1]);c.rotate(an);img(c,s);c.restore()}
  /* bras : épaule, coude, poignet (aucun étirement) */
  function bras(c,S,H,far){const [E,W]=ik(S,H,-1),a1=Math.atan2(E[1]-S[1],E[0]-S[0]),a2=Math.atan2(W[1]-E[1],W[0]-E[0]);
    seg(c,SP.up[far],S,a1);seg(c,SP.fore[far],E,a2);
    /* coude : plaque de fer, pointe à l'extérieur du pli */
    const ux=2*E[0]-(S[0]+W[0]),uy=2*E[1]-(S[1]+W[1]),m=Math.hypot(ux,uy)||1,n=[ux/m,uy/m];
    c.fillStyle=FER;c.beginPath();c.arc(E[0],E[1],15,0,TAU);c.fill();c.beginPath();c.moveTo(E[0]-n[1]*12,E[1]+n[0]*12);c.lineTo(E[0]+n[0]*30,E[1]+n[1]*30);c.lineTo(E[0]+n[1]*12,E[1]-n[0]*12);c.fill();
    c.strokeStyle=FER_C;c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(E[0]-n[1]*12,E[1]+n[0]*12);c.lineTo(E[0]+n[0]*30,E[1]+n[1]*30);c.stroke();
    seg(c,SP.fist,W,a2);
    c.strokeStyle='#e9561b';c.lineWidth=3;c.lineJoin='round';c.beginPath();c.moveTo(S[0]*.4+E[0]*.6,S[1]*.4+E[1]*.6);c.lineTo(E[0],E[1]);c.lineTo(E[0]*.5+W[0]*.5+4,E[1]*.5+W[1]*.5-3);c.stroke();
    return {S,E,W,an:a2}}
  /* couronne de flammes (sans ombre portée : un halo en cache la remplace) */
  function couronne(c,ph,warm){
    [[-68,-334,11,50,-18,1],[-52,-338,16,86,-22,2],[-32,-338,18,74,-28,3],[-12,-336,13,54,-22,4]].forEach(([x,y,wd,h,l,k])=>{const q=Math.sin(ph*TAU*2+k*1.7)*5,e=(1+.12*Math.sin(ph*TAU*3+k))*Math.min(1.5,.75+.25*warm);
      [[1,'#c8421c'],[.64,'#f57c28'],[.3,'#ffd27a']].forEach(([s,col])=>{c.fillStyle=col;c.beginPath();c.moveTo(x-wd*s,y);c.bezierCurveTo(x-wd*1.1*s,y-h*.4*s,x+l*.2-wd*.3,y-h*.55*s,x+(l+q)*s,y-h*e*s);c.bezierCurveTo(x+l*.45*s+wd*.3,y-h*.55*s,x+wd*1.15*s,y-h*.35*s,x+wd*s,y);c.fill()})})}
  function halo(c,x,y,r,a){if(a<=0)return;c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.min(1,a);c.drawImage(SP.glow.e,x-r,y-r,2*r,2*r);c.restore()}

  /* o : lean, drop, sx, dF, dN (buste) ; off (main lointaine depuis l'épaule) ; tip, sag (bout de la chaîne de la boule et mou, unités de pose) ;
     ham : marteau à deux mains { P main proche, a angle du manche (degrés), g tête -> main proche, wN / wF mains sur le manche,
     s boule en bandoulière, r : P et a dans le repère du buste } (absent : rangé dans le dos) ; t, warm, jaw, hurt, wound ; back(applyM), front(rig) */
  const STOW={P:[94,-256],a:-62,g:50,wN:0,wF:0,s:0,r:1},D=Math.PI/180;
  function draw(c,o){
    if(!SP)build();
    const co=Math.cos(o.lean),si=Math.sin(o.lean),A=[o.sx*co,o.sx*si,-si,co,si*PY,PY+o.drop-co*PY];
    const pt=(x,y)=>[A[0]*x+A[2]*y+A[4],A[1]*x+A[3]*y+A[5]];
    const applyM=(dx=0)=>{c.transform(A[0],A[1],A[2],A[3],A[4],A[5]);if(dx)c.translate(dx,0)};
    const mix=(p,q,u)=>[p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u];
    const far=pt(-70+o.dF,-215),near=pt(70+o.dN,-215),hd=(o.dF+o.dN)/2;
    /* marteau : main proche sur le manche, main lointaine plus près de la tête */
    const hm=o.ham||STOW,r=hm.r||0,Pr=pt(hm.P[0],hm.P[1]),P=mix(hm.P,Pr,r),an=hm.a*D+o.lean*r,dir=[Math.cos(an),Math.sin(an)];
    const head=[P[0]+dir[0]*hm.g,P[1]+dir[1]*hm.g],surF=[P[0]+dir[0]*45,P[1]+dir[1]*45];
    const Hr=[near[0]+42-o.lean*70,near[1]+113+o.lean*20],Hn=mix(Hr,P,hm.wN),H=mix([far[0]+o.off[0],far[1]+o.off[1]],surF,hm.wF);
    const act=hm.wN>0,dos=hm.wN<.999||(hm.a>-100&&hm.wF<.5)||(hm.a>-60&&head[0]>40); /* tête derrière le dos : marteau derrière le corps */
    const fl=.85+.15*Math.sin(o.t*9),warm=o.warm||1,ph=o.t*.55;
    const lk=o.look||0,PV=[-36,-206],headM=()=>{applyM(hd);c.translate(PV[0],PV[1]);c.rotate(lk);c.translate(-PV[0],-PV[1])};
    const hpt=(x,y)=>{const cx=x-PV[0],cy=y-PV[1],cl=Math.cos(lk),sn=Math.sin(lk);return pt(PV[0]+cx*cl-cy*sn+hd,PV[1]+cx*sn+cy*cl)};
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
    if(o.back){c.save();o.back(applyM);c.restore()}
    if(dos)marteau();
    if(behind)boule_(Wf);
    /* jambes : o.legs = {f:[x, lever, angle], n:[...]} en unités de pose (pas lourds) ; la lointaine derrière */
    const LG=o.legs||{f:[0,0,0],n:[0,0,0]};
    /* chaque jambe pivote autour de sa hanche (elle reste attachée au bassin) ; le pied lointain reste à gauche du proche (jamais croisées) */
    const LL=120,HF=[-40,-118],HN=[34,-118];
    let aF=Math.asin(Math.max(-.38,Math.min(.38,-LG.f[0]/LL))),aN=Math.asin(Math.max(-.38,Math.min(.38,-LG.n[0]/LL)));
    const gap=(HN[0]-LL*Math.sin(aN))-(HF[0]-LL*Math.sin(aF));if(gap<34){const k=(34-gap)/(2*LL);aF+=k;aN-=k}
    [[SP.legF,LG.f,HF,aF],[SP.legN,LG.n,HN,aN]].forEach(([sp,q,hip,an])=>{c.save();c.translate(hip[0],hip[1]-q[1]*.55);c.rotate(an+q[2]);c.translate(-hip[0],-hip[1]);img(c,sp);c.restore()});
    if(o.wound>0){c.save();c.strokeStyle='rgba(255,220,140,'+Math.min(1,o.wound)+')';c.lineWidth=3.5;c.lineCap='round';c.beginPath();c.moveTo(-63,-61);c.lineTo(-40,-61);c.moveTo(-63,-61);c.lineTo(-53,-77);c.moveTo(-63,-61);c.lineTo(-53,-45);c.stroke();c.restore()}
    c.save();applyM();halo(c,-24,-205,90,.3*warm*fl);img(c,SP.torso);c.restore();
    let na=act?null:bras(c,near,Hn,0);
    c.save();headM();img(c,SP.corneL);c.restore();
    c.save();applyM(o.dN);img(c,SP.paulR);c.restore();
    if(act)na=bras(c,near,Hn,0);
    if(!dos)marteau();
    const fa=bras(c,far,H,1);
    if(act)seg(c,SP.fist,na.W,na.an);
    c.save();applyM(o.dF);img(c,SP.paulL);c.restore();
    /* tête : couronne derrière, gueule qui s'ouvre (jaw), yeux blancs quand il est touché */
    c.save();headM();c.scale(.8,.8);
    halo(c,-40,-350,70,.45*warm*fl);couronne(c,ph,warm);
    c.scale(1.25,1.25);img(c,SP.head);c.scale(.8,.8);
    const j=o.jaw||0;
    if(j>0){c.fillStyle='rgba(255,160,60,.95)';c.beginPath();c.moveTo(-95,-254);c.lineTo(-29,-258);c.lineTo(-31,-246+j);c.lineTo(-90,-240+j);c.closePath();c.fill()}
    const ey=o.eyes||0;if(ey>.02&&!o.hurt){halo(c,-64,-296,26+30*ey,.7*ey);halo(c,-86,-296,18+22*ey,.6*ey);c.save();c.globalAlpha=Math.min(1,ey);c.fillStyle='#fff7d4';c.fill(P2('M-94 -302L-75 -289L-79 -286.5L-91 -294Z'));c.fill(P2('M-65 -287L-34 -309L-39 -296L-55 -285.5Z'));c.restore()}
    if(o.hurt){c.fillStyle='#ffffff';c.fill(P2('M-94 -302L-75 -289L-79 -286.5L-91 -294Z'));c.fill(P2('M-65 -287L-34 -309L-39 -296L-55 -285.5Z'))}
    c.translate(0,j);c.scale(1.25,1.25);img(c,SP.jaw);
    c.restore();
    c.save();applyM();img(c,SP.sangle);c.restore();
    /* les deux poings serrés sur le manche passent devant */
    if(!dos&&hm.wF>.9){seg(c,SP.fist,fa.W,fa.an);seg(c,SP.fist,na.W,na.an)}
    if(!behind)boule_(fa.W);
    /* souffle : fumée et braises qui sortent des naseaux et de la gueule au rythme de la respiration (o.breath = phase) */
    if(o.breath!=null){const N=[hpt(-64,-222),hpt(-52,-222),hpt(-50,-200)];c.save();
      for(let i=0;i<12;i++){const age=((o.t*.55)+i/12)%1,te=o.t-age/.55,env=Math.max(0,-Math.sin(te*2.2));if(env<.05)continue;
        const n=N[i%3],x=n[0]-age*(16+i%4*5)+Math.sin(te*3+i)*3,y=n[1]-age*(34+i%3*8),r=2.5+age*11;
        c.fillStyle='rgba(72,52,80,'+(.42*(1-age)*env*(o.smoke||1))+')';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
        if(i%4===0){c.fillStyle='rgba(255,'+(140+i*8)+',60,'+(.8*(1-age)*env)+')';c.fillRect(x+r*.4,y-r*.3,1.6,1.6)}}
      c.restore()}
    const mouth=hpt(-49.6,-200+j*.4);
    const rig={far,near,fa,na,mouth,head,P,dir,applyM};
    if(o.front)o.front(rig);
    c.restore();
    return rig}
  return {draw,ik,L1,L2};
})();
