const TOWERS=[[64,DECK-170,16],[906,DECK-190,14],[640,DECK-128,9],[338,DECK-118,8]];
const BELL=[480,DECK-268];
/* Fanal du Clocher : éteint pendant le combat, le Veilleur l'allume à la fin pour qu'il veille sur le Colosse pétrifié */
function drawFanal(x,by,lit,tm){
  ctx.fillStyle='#3a3f5e';ctx.fillRect(x-9,by-58,18,58);ctx.fillStyle='#4a5072';ctx.fillRect(x-13,by-62,26,6);ctx.fillRect(x-12,by-4,24,4);
  ctx.fillStyle='rgba(240,246,255,.85)';ctx.fillRect(x-13,by-64,26,2);
  if(lit>0){const r=30+60*lit,g=ctx.createRadialGradient(x,by-74,2,x,by-74,r);g.addColorStop(0,'rgba(255,214,130,'+(.55*lit)+')');g.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,by-74,r,0,6.283);ctx.fill();
    for(let i=-1;i<=1;i++)qflame(x+i*8,by-66,7,(20+12*Math.abs(Math.sin(tm*9+i*2)))*lit,i+1,i?'rgba(255,170,70,.9)':'rgba(255,224,150,.95)')}
  ctx.fillStyle='#241b2a';ctx.beginPath();ctx.moveTo(x-20,by-74);ctx.lineTo(x+20,by-74);ctx.lineTo(x+13,by-62);ctx.lineTo(x-13,by-62);ctx.closePath();ctx.fill();
  ctx.fillStyle=lit>0?'rgba(255,190,90,'+(.6+.3*lit)+')':'rgba(120,60,40,.6)';ctx.fillRect(x-17,by-76,34,3);
}
function bellAng(){if(R.bellAt==null)return 0;const a=R.time-R.bellAt;return (R.bellA||.3)*Math.exp(-a*.9)*Math.sin(a*5.2)}
function ringBell(amp,v){
  v=v==null?1:v;R.bellAt=R.time;R.bellA=amp;(R.bellW=R.bellW||[]).push(R.time);if(amp>.4)R.bellW.push(R.time+.35);
  tone(196,3.2,'sine',.16*v,0);tone(392,2.4,'sine',.08*v,0);tone(587,1.6,'triangle',.04*v,0);tone(784,1.1,'sine',.025*v,0);
}
function bellMouth(){const a=bellAng();return[BELL[0]-Math.sin(a)*112,BELL[1]+Math.cos(a)*112]}
function drawBelfry(){
  const [cx,py]=BELL,top=DECK-372;
  ctx.fillStyle='#2a2f4e';
  ctx.beginPath();ctx.moveTo(cx-118,DECK);ctx.lineTo(cx-118,py-34);ctx.quadraticCurveTo(cx,top-10,cx+118,py-34);ctx.lineTo(cx+118,DECK);ctx.lineTo(cx+86,DECK);ctx.lineTo(cx+86,py-20);ctx.quadraticCurveTo(cx,top+38,cx-86,py-20);ctx.lineTo(cx-86,DECK);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#3c4268';ctx.lineWidth=2;ctx.stroke();
  poly([[cx-140,py-58],[cx,top-56],[cx+140,py-58]],'#3c4268');
  ctx.fillStyle='rgba(240,246,255,.85)';ctx.beginPath();ctx.moveTo(cx-140,py-58);ctx.lineTo(cx,top-56);ctx.lineTo(cx+140,py-58);ctx.lineTo(cx+126,py-58);ctx.lineTo(cx,top-46);ctx.lineTo(cx-126,py-58);ctx.closePath();ctx.fill();
  ctx.fillStyle='#4a3626';ctx.fillRect(cx-90,py-12,180,10);
  const a=bellAng();
  ctx.save();ctx.translate(cx,py);ctx.rotate(a);
  ctx.fillStyle='#3a2a20';ctx.fillRect(-4,-4,8,18);
  const bg=ctx.createLinearGradient(-58,0,58,0);bg.addColorStop(0,'#7a5524');bg.addColorStop(.45,'#d9a24c');bg.addColorStop(1,'#6b4a1a');
  ctx.beginPath();ctx.moveTo(-26,14);ctx.quadraticCurveTo(-34,40,-40,80);ctx.quadraticCurveTo(-46,98,-60,108);ctx.lineTo(60,108);ctx.quadraticCurveTo(46,98,40,80);ctx.quadraticCurveTo(34,40,26,14);ctx.closePath();
  ctx.fillStyle=bg;ctx.fill();ctx.strokeStyle='#4a3010';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='rgba(255,226,150,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-41,84);ctx.lineTo(41,84);ctx.moveTo(-36,62);ctx.lineTo(36,62);ctx.stroke();
  ctx.strokeStyle='#6b4a1a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,48,7,0,6.283);ctx.stroke();ctx.beginPath();ctx.moveTo(0,36);ctx.lineTo(0,40);ctx.stroke();
  ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.arc(-Math.sin(-a*.6)*4,112,7,0,6.283);ctx.fill();
  ctx.restore();
}
function drawBellWaves(){
  if(!R.bellW)return;
  const m=bellMouth();
  R.bellW=R.bellW.filter(t0=>R.time-t0<2.2);
  ctx.save();
  for(const t0 of R.bellW){const u=(R.time-t0)/2.2;if(u<0)continue;
    ctx.strokeStyle='rgba(255,236,190,'+(.7*(1-u))+')';ctx.lineWidth=5*(1-u)+1;ctx.beginPath();ctx.ellipse(m[0],m[1]-50,30+620*u,20+380*u,0,0,6.283);ctx.stroke()}
  ctx.restore();
}
function r3Background(){
  const g=ctx.createLinearGradient(0,0,0,DECK);
  g.addColorStop(0,'#060a1a');g.addColorStop(.55,'#18204a');g.addColorStop(1,'#4b3a62');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,DECK);
  const tt=R.time;
  ctx.save();
  for(let k=0;k<2;k++){
    ctx.beginPath();ctx.moveTo(0,90+k*30);
    for(let x=0;x<=W;x+=30)ctx.lineTo(x,90+k*30+Math.sin(x*.012+tt*.4+k*2)*26);
    for(let x=W;x>=0;x-=30)ctx.lineTo(x,150+k*30+Math.sin(x*.01+tt*.35+k)*34);
    ctx.closePath();ctx.fillStyle=k?'rgba(120,220,200,.07)':'rgba(140,160,255,.07)';ctx.fill();
  }
  ctx.restore();
  for(const s of STARS){ctx.globalAlpha=.4+.5*Math.abs(Math.sin(tt*.8+s.p));ctx.fillStyle='#e8f0ff';ctx.fillRect(s.x,s.y,s.r,s.r)}
  ctx.globalAlpha=1;
  /* montagnes lointaines, très en contrebas : on est au sommet de la tour */
  ctx.fillStyle='#232c55';
  ctx.beginPath();[[0,340],[110,290],[210,322],[330,270],[440,318],[560,284],[690,326],[800,276],[900,312],[W,290],[W,DECK],[0,DECK]].forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(200,220,255,.45)';ctx.lineWidth=2;
  [[[330,270],[312,294],[326,286],[342,300]],[[800,276],[782,300],[796,292],[812,306]]].forEach(L=>{ctx.beginPath();L.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()});
  const fg=ctx.createLinearGradient(0,300,0,DECK);fg.addColorStop(0,'rgba(180,200,240,0)');fg.addColorStop(1,'rgba(180,200,240,.28)');
  ctx.fillStyle=fg;ctx.fillRect(0,300,W,DECK-300);
  /* tours de l'ordre, au loin, avec leur lanterne */
  TOWERS.forEach((T,i)=>{
    const [x,top,w]=T;ctx.fillStyle='#141a3a';ctx.fillRect(x-w/2,top,w,DECK-top);ctx.fillRect(x-w/2-3,top-6,w+6,6);
    poly([[x-w/2-4,top-6],[x,top-6-w*1.4],[x+w/2+4,top-6]],'#141a3a');
    const lit=R.towerAt&&R.towerAt[i]!=null?clamp01((R.time-R.towerAt[i])/.3):0,fl=lit?(1+1.4*Math.max(0,1-(R.time-R.towerAt[i])/1.4)):1;
    const lg=ctx.createRadialGradient(x,top+8,1,x,top+8,10+8*fl);lg.addColorStop(0,'rgba(255,215,130,'+(.55*fl)+')');lg.addColorStop(1,'rgba(255,200,110,0)');
    ctx.fillStyle=lg;ctx.beginPath();ctx.arc(x,top+8,10+8*fl,0,6.283);ctx.fill();
    ctx.fillStyle='#ffd27a';ctx.fillRect(x-2,top+5,4,6);
    if(lit&&R.time-R.towerAt[i]<1.6){const u=(R.time-R.towerAt[i])/1.6;ctx.strokeStyle='rgba(255,230,170,'+(1-u)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,top+8,8+50*u,0,6.283);ctx.stroke()}
  });
  drawBelfry();
  /* sol : dalles de la plateforme, couche de neige, créneaux aux bords */
  const gg=ctx.createLinearGradient(0,DECK,0,H);gg.addColorStop(0,'#b9c6de');gg.addColorStop(.12,'#6a7394');gg.addColorStop(1,'#2a2f4e');
  ctx.fillStyle=gg;ctx.fillRect(0,DECK,W,H-DECK);
  ctx.fillStyle='rgba(240,246,255,.92)';ctx.fillRect(0,DECK,W,5);
  ctx.strokeStyle='rgba(30,36,66,.55)';ctx.lineWidth=2;
  for(let r=0;r<4;r++){const y=DECK+22+r*32;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
    for(let x=(r%2)*60;x<W;x+=120){ctx.beginPath();ctx.moveTo(x,y-32+(r?0:10));ctx.lineTo(x,y);ctx.stroke()}}
  for(const side of [-1,1]){
    const x0=side<0?0:W-110;
    ctx.fillStyle='#3a3f5e';ctx.fillRect(x0,DECK-56,110,56);
    for(let i=0;i<3;i++){const mx=x0+(side<0?4+i*38:110-26-i*38);ctx.fillStyle='#3a3f5e';ctx.fillRect(mx,DECK-84,22,30);ctx.fillStyle='rgba(240,246,255,.9)';ctx.fillRect(mx,DECK-86,22,4)}
    ctx.fillStyle='rgba(240,246,255,.9)';ctx.fillRect(x0,DECK-58,110,3);
    ctx.strokeStyle='rgba(20,24,50,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x0,DECK-28);ctx.lineTo(x0+110,DECK-28);ctx.stroke();
  }
  drawFanal(150,DECK,R.fanalAt!=null?clamp01((R.time-R.fanalAt)/.6):0,R.time);

}
function r3Ground(){
  const bx=R.bx,pulse=.85+.15*Math.sin(R.time*2.1);
  const lg=ctx.createRadialGradient(bx,DECK,10,bx,DECK,300);
  lg.addColorStop(0,'rgba(255,130,40,'+(.55*pulse)+')');lg.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=lg;ctx.fillRect(0,DECK-120,W,H-DECK+120);
  const wet=Math.min(1,.35+R.parries*.08);
  ctx.fillStyle='rgba(30,50,90,'+(.5*wet)+')';
  ctx.beginPath();ctx.ellipse(bx,DECK+12,130+R.parries*6,14,0,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(255,140,50,'+(.25*pulse)+')';
  ctx.beginPath();ctx.ellipse(bx,DECK+10,90,9,0,0,6.283);ctx.fill();
  /* neige fondue à l'impact : une tache humide qui sèche et disparaît en quelques secondes */
  R.melts=R.melts.filter(m=>m.t<3.2);
  for(const m of R.melts){
    const u=Math.min(1,m.t/.5),f=1-clamp01((m.t-1.6)/1.6);
    ctx.fillStyle='rgba(40,48,80,'+(.45*u*f)+')';ctx.beginPath();ctx.ellipse(m.x,DECK+8,34*u+8,6*u+2,0,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(255,150,60,'+(.45*(1-u))+')';ctx.beginPath();ctx.ellipse(m.x,DECK+8,40*u,7*u,0,0,6.283);ctx.fill();
  }
}
function drawIce3(x,y,hot){
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(R.time*9+x)*.2);
  const g=ctx.createLinearGradient(-26,-30,26,30);g.addColorStop(0,'#eaf8ff');g.addColorStop(1,'#6fb4d8');
  qp([[-24,-6],[-12,-32],[16,-28],[28,-4],[14,26],[-14,28]],g,hot?'#ff7a2b':'#bfeaff',3);
  if(hot){ctx.shadowColor='#ff7a2b';ctx.shadowBlur=18;ctx.strokeStyle='rgba(255,200,100,.7)';ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;
    qflame(0,-26,10,34+8*Math.sin(R.time*10),1,'rgba(255,170,70,.9)');qflame(-14,-18,7,24,2,'rgba(255,110,40,.9)')}
  ctx.restore();
}
