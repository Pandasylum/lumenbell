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
