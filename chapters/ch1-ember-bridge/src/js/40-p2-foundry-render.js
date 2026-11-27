/* ---------- rendu phase II ---------- */
function qp(pts,fill,stroke,lw){
  ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||2;ctx.lineJoin='round';ctx.stroke()}
}
function qflame(x,y,w,h,ph,col){
  const t=R?R.time:Q?Q.time:G.time;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-w,y);
  ctx.quadraticCurveTo(x+Math.sin(t*8+ph)*w*.6-w*.2,y-h*.55,x+Math.sin(t*6+ph)*w*.5,y-h);
  ctx.quadraticCurveTo(x+Math.sin(t*7+ph)*w*.4+w*.2,y-h*.5,x+w,y);ctx.closePath();ctx.fill();
}
/* Phase II : le fond de la Fonderie, sous le pont (1er novembre : plus de chute, le décor ne défile plus). */
function qScrollY(base,period){return (base%period+period)%period-60}
function qGear(x,y,r,a,col){
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=col;
  for(let i=0;i<10;i++){ctx.rotate(.628);ctx.fillRect(-r*.14,-r-8,r*.28,14)}
  ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.arc(0,0,r*.45,0,6.283,true);ctx.fill();
  ctx.restore();
}
/* ===== Phase II : la Fonderie au fond de la montagne (maquette fonderie-reference.js, 27/11) =====
   Décor fixe dessiné UNE fois dans trois calques en cache (fond, rebord, avant-plan) ; à chaque image : seulement les mouvements (roue, creuset et coulée,
   brumes, lave, braises, chaîne qui se balance, lanterne qui pulse). Aucun canvas créé par image, aucun filter, aucun shadowBlur par image.
   Le monde de la maquette (1230 x 692) est posé sur l'écran du jeu (ZW) ; le rebord est calé sur QFLOOR, la lave sur QLAKE : rien ne bouge côté jeu. */
const FD={S:1.25,ZW:.78,back:null,reb:null,front:null};
const FD_BORD='rgba(255,160,110,.55)';
function fdP(c,pts,col){c.fillStyle=col;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill()}
function fdR(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function fdRiv(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,6.283);c.fill()}
function fdOg(c,x,w,y,fl,bas,col){fdP(c,[[x,bas],[x,y],[x+w*.14,y-fl*.55],[x+w*.32,y-fl*.86],[x+w*.5,y-fl],[x+w*.68,y-fl*.86],[x+w*.86,y-fl*.55],[x+w,y],[x+w,bas]],col)}
function fdRnd(s){return()=>(s=(s*16807)%2147483647)/2147483647}
function fdLg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g}
function fdGlow(c,x,y,r,rgb,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(.35,'rgba('+rgb+','+a*.4+')');g.addColorStop(1,'rgba('+rgb+',0)');c.save();c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore()}
/* chaîne simple : maillons alternés de face et de profil, le long d'une courbe de Bézier */
function fdChaine(c,p,n,s,col,hi){const f=u=>{const v=1-u;return [0,1].map(k=>v*v*v*p[0][k]+3*v*v*u*p[1][k]+3*v*u*u*p[2][k]+u*u*u*p[3][k])};let q=f(0);
  for(let i=1;i<=n;i++){const r=f(i/n),plat=i%2;c.save();c.translate((q[0]+r[0])/2,(q[1]+r[1])/2);c.rotate(Math.atan2(r[1]-q[1],r[0]-q[0]));
    c.strokeStyle='#14091a';c.lineWidth=s*.72;c.beginPath();c.ellipse(0,0,s,plat?s*.66:s*.15,0,0,6.283);c.stroke();c.strokeStyle=col;c.lineWidth=s*.4;c.stroke();
    c.strokeStyle=hi;c.lineWidth=s*.13;c.beginPath();c.ellipse(0,-.6,s,plat?s*.66:s*.15,0,3.3,5.5);c.stroke();c.restore();q=r}}
/* calque en cache : repère « monde » de la maquette, posé sur l'écran (le rebord de la maquette, y = 592, tombe sur QFLOOR) */
function fdCalque(){const e=document.createElement('canvas');e.width=Math.round(W*FD.S);e.height=Math.round(H*FD.S);const c=e.getContext('2d');c.setTransform(FD.S*FD.ZW,0,0,FD.S*FD.ZW,0,FD.S*(QFLOOR-592*FD.ZW));return [e,c]}
const FD_WW=1230,FD_WH=692,FD_LAVE=600;
function fdBuild(){
  let [e,c]=fdCalque(),r=fdRnd(7);FD.back=e;
  /* fond : la roche de la montagne, éclairée par le bas */
  c.fillStyle=fdLg(c,0,-20,0,FD_LAVE,[[0,'#1a1030'],[.45,'#3a2046'],[.75,'#6a3250'],[1,'#c0604a']]);c.fillRect(-10,-30,FD_WW+20,FD_WH+60);
  for(let i=0;i<46;i++){const x=r()*1260-30,y=60+r()*380,w=40+r()*90,h=26+r()*46;fdP(c,[[x,y+h*.4],[x+w*.3,y],[x+w,y+h*.25],[x+w*.82,y+h],[x+w*.2,y+h*.9]],i%2?'rgba(24,10,40,.22)':'rgba(190,100,110,.10)')}
  /* tout au fond : galeries minuscules et leurs feux, passerelle */
  for(let x=14;x<FD_WW;x+=74){const w=34+r()*14,y=474+r()*14;fdOg(c,x,w,y,26,556,'#51284a');fdOg(c,x+w*.3,w*.4,y+34,13,540,'#e08a58')}
  for(let x=30;x<FD_WW;x+=112)fdR(c,x,360,9,196,'#5e3254');fdR(c,0,356,FD_WW,9,'#6e3a5a');fdR(c,0,338,FD_WW,3,'#6e3a5a');for(let x=8;x<FD_WW;x+=22)fdR(c,x,340,2,16,'#6e3a5a');
  c.fillStyle=fdLg(c,0,200,0,556,[[0,'rgba(150,84,124,.10)'],[.7,'rgba(180,98,118,.42)'],[1,'rgba(232,140,104,.55)']]);c.fillRect(0,0,FD_WW,556);
  /* ateliers lointains taillés dans la roche */
  [[196,96],[318,96],[666,110]].forEach(([x,w])=>{fdOg(c,x-10,w+20,448,92,FD_LAVE,'#8a4660');fdOg(c,x,w,452,78,FD_LAVE,'#331a3c');fdOg(c,x+w*.26,w*.48,516,34,556,'#e8804a');fdOg(c,x+w*.36,w*.28,524,22,556,'#ffc078');fdR(c,x+w*.22,556,w*.56,7,'#53284a')});
  /* le lac s'enfonce vers le fond : bandes de plus en plus fines et pâles */
  [[548,'#e9a070'],[556,'#e5875a'],[568,'#e07040'],[584,'#e4622c']].forEach(([y,col],j)=>{const p=[[0,FD_LAVE+20]];for(let x=0;x<=FD_WW+30;x+=30)p.push([x,y+Math.sin(x*.07+j*2)*(1+j)]);p.push([FD_WW,FD_LAVE+20]);fdP(c,p,col)});
  /* le haut fourneau, sa cheminée et sa gueule : derrière le Colosse */
  fdP(c,[[880,0],[1012,0],[1022,156],[870,156]],'#4a2444');fdP(c,[[880,0],[902,0],[894,156],[870,156]],FD_BORD);
  const four=[[870,150],[1022,150],[1110,300],[1132,FD_LAVE],[760,FD_LAVE],[782,300]];
  fdP(c,four,'#6a2f46');fdP(c,[[870,150],[896,150],[816,300],[798,FD_LAVE],[760,FD_LAVE],[782,300]],'rgba(255,150,100,.4)');fdP(c,[[1022,150],[1110,300],[1132,FD_LAVE],[1058,FD_LAVE],[1048,300],[992,150]],'rgba(24,8,30,.38)');
  c.save();c.beginPath();four.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.clip();for(let j=0;j<20;j++){const y=162+j*22;fdR(c,740,y,420,2.5,'rgba(28,8,26,.45)');for(let x=750+(j%2)*26;x<1150;x+=52)fdR(c,x,y,2.5,22,'rgba(28,8,26,.45)')}c.restore();
  [[162,858,1032],[300,776,1116],[430,764,1124]].forEach(([y,x0,x1])=>{fdR(c,x0,y,x1-x0,17,'#2c1532');fdR(c,x0,y,x1-x0,4,FD_BORD);for(let x=x0+14;x<x1;x+=42)fdRiv(c,x,y+10,3.5,'#c8786a')});
  [20,86].forEach(y=>{fdR(c,866,y,160,13,'#2c1532');fdR(c,866,y,160,3.5,FD_BORD)});
  fdOg(c,848,196,470,100,FD_LAVE,'#2c1532');fdOg(c,862,168,474,84,FD_LAVE,'#b8482c');fdOg(c,878,136,484,70,FD_LAVE,'#f07a30');fdOg(c,900,92,502,52,FD_LAVE,'#ffae48');fdOg(c,922,48,528,32,FD_LAVE,'#ffe09a');
  for(let x=884;x<1020;x+=34)fdR(c,x,398,7,FD_LAVE-398,'rgba(60,20,34,.85)');fdR(c,862,500,168,8,'#3c1830');
  /* le rail du pont roulant et son palan */
  fdR(c,180,96,628,26,'#3a1c40');fdR(c,180,96,628,6,FD_BORD);fdR(c,180,118,628,5,'#1c0c24');for(let x=196;x<800;x+=38)fdRiv(c,x,109,3.5,'#b06a68');
  for(let x=190;x<770;x+=76)fdP(c,[[x,122],[x+10,122],[x+48,148],[x+38,148]],'#2c1536');fdR(c,180,146,628,7,'#2c1536');
  fdR(c,536,122,96,34,'#4a2448');fdR(c,536,122,96,6,FD_BORD);fdRiv(c,554,156,13,'#2a1230');fdRiv(c,614,156,13,'#2a1230');fdRiv(c,554,156,4,'#c8786a');fdRiv(c,614,156,4,'#c8786a');
  /* piliers de fer qui portent le rail ; la roue du mécanisme est fixée au pilier de gauche (ambiance) */
  r=fdRnd(19);
  [[166,34],[776,32]].forEach(([x,w])=>{fdR(c,x,96,w,FD_LAVE-96,'#2a1438');fdR(c,x,96,7,FD_LAVE-96,FD_BORD);for(let y=130;y<560;y+=46){fdP(c,[[x+7,y],[x+w,y+40],[x+w,y+46],[x+7,y+6]],'#44204a');fdRiv(c,x+w*.5,y+23,3,'#a8606a')}fdR(c,x-8,FD_LAVE-22,w+16,22,'#1e0e2a')});
  /* voûte de roche et stalactites : on est sous la montagne */
  const v=[[-10,-30],[FD_WW+10,-30]];for(let x=FD_WW+10;x>=-10;x-=44)v.push([x,48+r()*30+(x>840&&x<1060?-34:0)]);fdP(c,v,'#160b26');
  for(let i=0;i<22;i++){const x=20+r()*1190,w=14+r()*22,h=24+r()*52;if(x>830&&x<1070)continue;fdP(c,[[x-w,40],[x+w,40],[x+w*.3,66+h*.4],[x,66+h],[x-w*.4,64+h*.3]],'#160b26');fdP(c,[[x-w*.4,64+h*.3],[x,66+h],[x-w*.1,60]],'rgba(255,150,110,.22)')}
  /* le mur où l'homme était enchaîné : plaque, équerres, scellement, pierre fendue */
  fdP(c,[[-10,250],[136,250],[150,272],[150,592],[-10,592]],'#3a1a2c');fdP(c,[[-10,250],[136,250],[150,272],[-10,272]],'#6a3444');
  for(let j=0;j<9;j++){const y=276+j*35;for(let i=-1;i<3;i++){const x=i*64+(j%2)*32,w=Math.min(60,146-x);if(w>8)fdP(c,[[Math.max(-8,x),y],[x+w,y],[x+w,y+30],[Math.max(-8,x),y+30]],(i+j)%3?'#42202f':'#321728')}}
  [[10,300],[122,300]].forEach(([x,y])=>{fdP(c,[[x,y],[x+16,y],[x+16,y+62],[x,y+62]],'#1d0b18');fdP(c,[[x+2,y+6],[x+14,y+6],[x+14,y+12],[x+2,y+12]],'#7a4250');fdP(c,[[x+2,y+48],[x+14,y+48],[x+14,y+54],[x+2,y+54]],'#7a4250')});
  fdP(c,[[46,310],[102,310],[114,326],[114,368],[102,382],[46,382],[34,368],[34,326]],'#1a0914');fdP(c,[[46,310],[102,310],[114,326],[34,326]],'#8a4a52');
  [[46,328],[102,328],[46,366],[102,366]].forEach(([x,y])=>fdRiv(c,x,y,4.5,'#b06a60'));
  c.strokeStyle='#14060f';c.lineWidth=2.5;c.beginPath();c.moveTo(34,326);c.lineTo(18,312);c.lineTo(22,296);c.moveTo(114,368);c.lineTo(132,384);c.lineTo(128,404);c.moveTo(60,382);c.lineTo(52,400);c.stroke();
  /* rebord (repère de l'écran) : pavés, bord éclairé par la lave, bloc du pont tombé où se tient le Veilleur */
  [e,c]=fdCalque();FD.reb=e;c.setTransform(FD.S,0,0,FD.S,0,0);
  const E=QEDGE,F=QFLOOR,L=QLAKE,top=QH[1]+44,x0=QH[0]-52,x1=QH[0]+64;
  fdP(c,[[-6,F],[E-20,F],[E,F+9],[E-12,L],[E+8,H+6],[-6,H+6]],'#26111f');
  fdP(c,[[E-20,F],[E,F+9],[E-12,L],[E+8,H+6],[E-34,H+6],[E-30,L]],'#8e3a2a');
  for(let j=0;j<5;j++){const y=F+7+j*17,lw=[48,58,44,62];let x=-((j*29)%40);for(let i=0;x<E-22-j*3;i++){const w=lw[(i+j)%4],xe=Math.min(x+w-4,E-22-j*3);if(xe>x+6)fdP(c,[[Math.max(0,x),y],[xe,y],[xe,y+13],[Math.max(0,x),y+13]],(i+j)%3?'#351827':'#41202f');x+=w}}
  fdP(c,[[-6,F],[E-20,F],[E,F+9],[E-20,F+3],[-6,F+3]],'#b8656a');
  fdP(c,[[x0+4,top],[x1-6,top-2],[x1,top+8],[x1+3,F],[x0-4,F],[x0,top+10]],'#3c1e30');fdP(c,[[x0+4,top],[x1-6,top-2],[x1,top+8],[x0,top+10]],'#8a4c4a');
  fdP(c,[[x0-4,top+10],[x0+44,top+10],[x0+40,F],[x0-4,F]],'rgba(7,0,18,.35)');
  c.strokeStyle='rgba(12,8,7,.7)';c.lineWidth=1.5;for(const yy of [top+36,top+73]){c.beginPath();c.moveTo(x0-1,yy);c.lineTo(x1+1,yy);c.stroke()}
  c.strokeStyle='#1d0c18';c.lineWidth=2;c.beginPath();c.moveTo(x1-24,top+4);c.lineTo(x1-30,top+18);c.lineTo(x1-22,top+34);c.stroke();
  /* avant-plan : deux masses de roche sombres, liseré de braise */
  [e,c]=fdCalque();FD.front=e;
  fdP(c,[[1120,FD_WH+20],[1134,650],[1160,632],[1174,600],[1196,590],[1210,612],[FD_WW+10,600],[FD_WW+10,FD_WH+20]],'#12081c');fdP(c,[[1160,632],[1174,600],[1196,590],[1184,622]],'rgba(255,130,80,.30)');
  fdP(c,[[610,FD_WH+20],[628,668],[668,652],[690,664],[726,660],[752,FD_WH+20]],'#12081c');fdP(c,[[628,668],[668,652],[690,664],[660,668]],'rgba(255,130,80,.30)');
}
/* mouvements du décor (repère monde de la maquette) : roue fixée au pilier, creuset au palan et sa coulée, brumes */
function fdBrume(c,y,h,col,a,off){for(let i=0;i<7;i++){const r=fdRnd(40+i*13+(y|0)),x=((r()*1500+off*1500)%1500)-140,w=160+r()*220;const g=c.createRadialGradient(0,0,0,0,0,w);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');c.save();c.translate(x,y+r()*18);c.scale(1,h/w);c.fillStyle=g;c.beginPath();c.arc(0,0,w,0,6.283);c.fill();c.restore()}}
function fdAmbiance(c,t){
  const gx=250,gy=262;
  fdP(c,[[198,gy-11],[gx,gy-9],[gx,gy+9],[198,gy+11]],'#3a1e44');fdP(c,[[198,gy+82],[198,gy+66],[gx-6,gy+4],[gx+6,gy+12]],'#3a1e44');fdR(c,198,gy-11,gx-198,3,FD_BORD);
  c.save();c.translate(gx,gy);c.rotate(t*.35);for(let i=0;i<12;i++){c.rotate(6.283/12);fdR(c,-9,-72,18,18,'#4a2650')}c.fillStyle='#4a2650';c.beginPath();c.arc(0,0,58,0,6.283);c.arc(0,0,38,0,6.283,true);c.fill();for(let i=0;i<4;i++){c.rotate(1.5708);fdR(c,-7,-42,14,42,'#4a2650')}c.restore();
  fdRiv(c,gx,gy,15,'#3a1e44');fdRiv(c,gx,gy,7,'#a8606a');c.strokeStyle=FD_BORD;c.lineWidth=3;c.beginPath();c.arc(gx,gy,57,.2,2.4);c.stroke();
  /* le creuset suspendu au palan verse le métal dans la lave */
  const bx=584,by=300+Math.sin(t*1.1)*2;fdGlow(c,bx-70,by,90,'255,160,80',.55);
  const bec=[bx-82,by-8];[[11,'#d4602c'],[7,'#ff9a45'],[3,'#ffe6a8']].forEach(([w,col],j)=>{const p=[],q=[];for(let i=0;i<=14;i++){const u=i/14,x=bec[0]-46*Math.sqrt(u)+Math.sin(i*1.4-t*9+j)*1.6,y=bec[1]+(568-bec[1])*u,ww=w*(1-u*.25);p.push([x-ww,y]);q.push([x+ww,y])}fdP(c,[...p,...q.reverse()],col)});
  c.save();c.translate(bx,by);c.rotate(-.3);
  fdP(c,[[-66,-42],[66,-42],[50,46],[34,60],[-34,60],[-50,46]],'#4a2142');fdP(c,[[-66,-42],[-34,-42],[-24,60],[-34,60],[-50,46]],'rgba(255,150,100,.45)');fdP(c,[[34,-42],[66,-42],[50,46],[34,60],[24,60]],'rgba(20,6,26,.4)');
  [-24,22].forEach(y=>{fdR(c,-62+(y+42)*.17,y,124-(y+42)*.34,11,'#2a1232');fdR(c,-62+(y+42)*.17,y,124-(y+42)*.34,3,FD_BORD);[-34,0,34].forEach(x=>fdRiv(c,x,y+6,3,'#c8786a'))});
  fdR(c,-74,-54,148,13,'#33173a');fdR(c,-74,-54,148,4,FD_BORD);fdP(c,[[-74,-54],[-96,-44],[-74,-41]],'#33173a');
  fdP(c,[[-90,-46],[-66,-56],[58,-56],[42,-48],[-60,-47]],'#ffc060');fdP(c,[[-60,-53],[40,-53],[26,-49],[-48,-49]],'#ffecb4');c.restore();
  [[bx-29,bx-51,by+10],[bx+31,bx+46,by-21]].forEach(([x0,x1,y1])=>{const y=160;fdChaine(c,[[x0,y],[x0+(x1-x0)/3,y+(y1-y)/3],[x0+(x1-x0)*2/3,y+(y1-y)*2/3],[x1,y1]],Math.round((y1-y)/13),9,'#5a3250','rgba(255,170,120,.85)');fdRiv(c,x1,y1,10,'#1c0a22');fdRiv(c,x1,y1,4,'#c8786a')});
  [[44,7,'#ff9a45'],[24,4.5,'#ffe6a8']].forEach(([rx,ry,col])=>{c.fillStyle=col;c.beginPath();c.ellipse(bec[0]-46,568,rx+Math.sin(t*11)*3,ry,0,0,6.283);c.fill()});
  for(let i=0;i<9;i++){const u=(t*1.3+i*.11)%1,x=bec[0]-46+(i-4)*9*u,y=568-Math.sin(u*Math.PI)*(18+(i%3)*13);fdP(c,[[x,y-4],[x+3,y],[x,y+3],[x-3,y]],i%2?'#ffe08a':'#ff9a35')}
  fdGlow(c,946,500,190,'255,150,70',.3+.06*Math.sin(t*5));
  fdBrume(c,482,52,'236,140,110',.17,(t*.035)%1);fdBrume(c,552,44,'255,160,100',.22,1-(t*.05)%1);
  /* chaînes pendues au rail */
  [[420,150,92,0],[716,150,130,1.7],[1186,60,230,4.4]].forEach(([x,y,l,p])=>{const s=Math.sin(t*1.3+p)*9;c.save();c.globalAlpha=.9;fdChaine(c,[[x,y],[x,y+l*.35],[x+s*.5,y+l*.7],[x+s,y+l]],Math.round(l/17),10,'#4a2a44','rgba(255,150,100,.5)');c.restore()});
}
/* voile de chaleur, puis lueur du four qui découpe la silhouette du Colosse (repère écran) */
function fdRecul(){
  const g=ctx.createLinearGradient(150*FD.ZW,0,520*FD.ZW,0);g.addColorStop(0,'rgba(150,80,118,0)');g.addColorStop(1,'rgba(150,80,118,.34)');ctx.fillStyle=g;ctx.fillRect(150*FD.ZW,0,W,QLAKE);
  fdGlow(ctx,700,QH[1]+10,300,'255,196,140',.5);fdGlow(ctx,640,QLAKE+30,430,'255,120,50',.26);
}
/* lave : bandes qui ondulent, croûtes, bulles (repère écran, ligne de la lave = QLAKE) */
function fdLava(t){
  ctx.save();ctx.beginPath();ctx.rect(QEDGE-60,0,W,H);ctx.clip();
  const band=(dy,amp,col,v,ph)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(QEDGE-60,H+4);for(let i=0;i<=26;i++){const x=QEDGE-60+i*40;ctx.lineTo(x,QLAKE+dy+Math.sin(i*1.7+t*v+ph)*amp+Math.sin(i*.8-t*v*.6)*amp*.6)}ctx.lineTo(W+8,H+4);ctx.closePath();ctx.fill()};
  band(0,3.5,'#ff9a35',2,0);band(7,3.5,'#e0561f',1.6,2);band(26,5,'#b53a1c',1.2,4);band(51,4,'#8e2418',.9,1);
  for(let i=0;i<9;i++){const x=((i*173+t*14*(i%2?1:.6))%1000)-40,y=QLAKE+14+(i*29)%46,w=26+(i*17)%32;fdP(ctx,[[x-w,y],[x-w*.5,y-5],[x+w*.3,y-6],[x+w,y-1],[x+w*.4,y+6],[x-w*.6,y+5]],'#3a1420');fdP(ctx,[[x-w,y],[x-w*.5,y-5],[x+w*.3,y-6],[x+w,y-1]],'#5e2228')}
  for(let i=0;i<7;i++){const u=(t*.7+i*.37)%1,x=QEDGE+((i*131)%560),r=2.5+u*7;if(u<.85){ctx.fillStyle='#ffd070';ctx.beginPath();ctx.arc(x,QLAKE+11+(i*23)%30,r,Math.PI,6.283);ctx.fill()}}
  ctx.restore();
}
/* chaîne rompue, anneau cédé, carcan ouvert, petite lanterne orange qui pulse : visibles tout le combat (repère monde) */
function fdRompu(c,x,y,r,rot,ep){c.save();c.translate(x,y);c.rotate(rot);c.lineCap='butt';[['#14070f',ep+5],['#8a5260',ep]].forEach(([col,w])=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(0,0,r,r*1.15,0,.62,6.283-.62);c.stroke()});c.strokeStyle='#f0b49a';c.lineWidth=ep*.24;c.beginPath();c.ellipse(0,-2,r,r*1.15,0,Math.PI,Math.PI*1.7);c.stroke();
  [.62,-.62].forEach(a=>{const px=Math.cos(a)*r,py=Math.sin(a)*r*1.15;fdP(c,[[px-ep*.5,py-2],[px,py+(a>0?-9:9)],[px+2,py],[px+ep*.55,py+(a>0?-5:5)],[px+ep*.5,py+3]],'#f0b49a')});c.restore()}
function fdRebordAnim(t){
  ctx.save();ctx.translate(0,QFLOOR-592*FD.ZW);ctx.scale(FD.ZW,FD.ZW);
  const s=Math.sin(t*1.1)*4;
  ctx.strokeStyle='#14070f';ctx.lineWidth=15;ctx.beginPath();ctx.arc(74,350,19,0,6.283);ctx.stroke();ctx.strokeStyle='#7a4656';ctx.lineWidth=9;ctx.stroke();
  fdChaine(ctx,[[74,366],[70,412],[82+s*.5,444],[88+s,486]],7,14,'#7a4a5e','#f0b49a');fdRompu(ctx,89+s,506,15,Math.PI/2+.1,9);
  fdChaine(ctx,[[30,590],[52,578],[70,598],[104,590]],5,12,'#6a3e52','#e0a08a');fdRompu(ctx,40,574,25,-.5,13);
  /* petite lanterne orange à côté de la chaîne : faible, pulsation lente */
  const p=.5+.5*Math.sin(t*6.283*.35);fdGlow(ctx,132,572,52+10*p,'255,122,42',.34+.24*p);
  ctx.translate(132,574);ctx.scale(1.35,1.35);ctx.translate(-438,-578);
  fdP(ctx,[[430,568],[446,568],[443,590],[433,590]],'rgb('+(200+40*p|0)+','+(96+28*p|0)+',34)');fdP(ctx,[[427,563],[438,555],[449,563],[449,568],[427,568]],'#2a141c');fdP(ctx,[[430,590],[446,590],[448,595],[428,595]],'#2a141c');
  ctx.strokeStyle='#2a141c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(434,568);ctx.lineTo(435,590);ctx.moveTo(442,568);ctx.lineTo(441,590);ctx.stroke();
  ctx.restore();
}
function qBackground(){
  if(!FD.back)fdBuild();
  const t=reduce?0:Q.time;
  ctx.drawImage(FD.back,0,0,W,H);
  ctx.save();ctx.translate(0,QFLOOR-592*FD.ZW);ctx.scale(FD.ZW,FD.ZW);fdAmbiance(ctx,t);ctx.restore();
  fdRecul();
  /* braises qui montent du lac */
  for(let i=0;i<30;i++){const u=(t*(.12+(i%5)*.03)+i*.137)%1,x=QEDGE+((i*97)%560)+Math.sin(u*9+i)*12,y=QLAKE-u*340,r=(1-u)*(2+(i%3));if(r>.4)fdP(ctx,[[x,y-r*2],[x+r,y],[x,y+r],[x-r,y]],i%3?'#ff9a35':'#ffe08a')}
}
function drawLake(front){
  if(front){
    /* devant : la lave engloutit le Colosse à la fin (il passe derrière la lave), puis rebord, avant-plan et chaîne */
    fdLava(reduce?0:Q.time);
    if(Q.mode==='lake'&&Q.splash){ctx.save();ctx.beginPath();ctx.rect(QEDGE,QLAKE,W-QEDGE,H-QLAKE);ctx.clip();ctx.fillStyle='rgba(255,110,30,.7)';ctx.fillRect(QEDGE,QLAKE,W-QEDGE,H-QLAKE);ctx.restore()}
    ctx.drawImage(FD.reb,0,0,W,H);fdRebordAnim(reduce?0:Q.time);ctx.drawImage(FD.front,0,0,W,H);
  }
}

function qrock(x,y,r,rot,hot){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  qp(ROCKP.map(q=>[q[0]*r,q[1]*r]),hot?'#40303a':'#1b1220',hot?'#ff7a2b':'#2c1d2c',hot?3:2);
  if(hot){ctx.strokeStyle='rgba(255,200,100,.6)';ctx.lineWidth=2;ctx.stroke()}
  ctx.restore();
}
function wingAngle(){
  let ang=Math.sin(Q.time*2.3)*.07;
  const a=Q.atk,b=Q.boss;
  if(a&&a.kind==='wings'){
    const ws=a.hits.filter(h=>h.k==='wave'),last=ws[ws.length-1].at;
    const raise=clamp01(a.t/.5)*(1-clamp01((a.t-(last-.3))/.5));
    ang-=.4*es(raise);
    ws.forEach(h=>{const d=(a.t-(h.at-.55))/.16;ang+=.85*Math.exp(-d*d)})
  }
  if(b.s==='rage')ang-=.3*Math.sin(clamp01(b.t/b.dur)*3.14);
  if(Q.mode==='lake'&&Q.erupt)ang+=Math.sin(Q.time*14)*.4-.2;
  return ang;
}
/* dmg (0 à 1) : aile abîmée après la foudre, bouts rongés, trous brûlés, une membrure brisée. */
const WING_OK=[[0,0],[200,-215],[250,-130],[345,-120],[285,-30],[330,60],[230,60],[250,140],[110,95]];
const WING_HURT=[[0,0],[170,-175],[235,-120],[300,-95],[262,-25],[290,40],[225,50],[200,112],[105,92]];
const WING_HOLES=[[[190,-120],[215,-100],[205,-70],[180,-85]],[[270,-20],[295,-5],[285,25],[258,10]],[[150,40],[175,50],[165,75],[140,62]]];
function drawWing(S,ang,sc,col,wo0,fire,side,dmg){
  const wo=Math.max(.001,wo0),dm=dmg||0;
  ctx.save();ctx.translate(S[0],S[1]);ctx.scale(side||1,1);ctx.rotate(ang);ctx.scale(wo*sc,wo*sc);
  const P=dm?WING_OK.map((p,i)=>[p[0]+(WING_HURT[i][0]-p[0])*dm*.75,p[1]+(WING_HURT[i][1]-p[1])*dm*.75]):WING_OK;
  qp(P,col,'rgba(255,110,40,.55)',3);
  if(dm){
    WING_HOLES.forEach((h,i)=>{
      const k=clamp01(dm*3-i*.9);if(k<=0)return;
      const cx=h.reduce((s,q)=>s+q[0],0)/4,cy=h.reduce((s,q)=>s+q[1],0)/4;
      qp(h.map(q=>[cx+(q[0]-cx)*k*1.7,cy+(q[1]-cy)*k*1.7]),'rgba(6,2,10,.92)','rgba(255,130,50,.9)',3);
    });
  }
  ctx.strokeStyle='#0f0813';ctx.lineWidth=7;ctx.lineCap='round';
  [1,3,5,7].forEach(i=>{const e=(i===3&&dm>.5)?[P[i][0]*.72,P[i][1]*.72]:P[i];ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(e[0],e[1]);ctx.stroke()});
  if(dm>.3&&fire){
    const tw=R?R.time:Q?Q.time:G.time;
    [[205,-70],[285,15],[160,65]].forEach((q,j)=>qflame(q[0],q[1],6,22+8*Math.sin(tw*9+j),j+3,j%2?'rgba(255,190,90,.85)':'rgba(255,100,40,.85)'));
  }
  if(fire){
    [1,3,5,7].forEach((i,j)=>qflame(P[i][0],P[i][1]+6,9,34+8*Math.sin((R?R.time:Q?Q.time:G.time)*9+j),j,j%2?'rgba(255,190,90,.85)':'rgba(255,100,40,.85)'));
  }
  ctx.restore();
}
/* ===== Le Colosse en vol : le même qu'en phase I (COLOSSE, lot 2) avec ailes, griffes aux deux mains, boule en bandoulière ; la queue garde la longueur de la phase I ===== */
const FD_S=.85;            /* échelle de pose : le cœur du Colosse reste à (Q.bx-17, Q.by), comme les cibles du jeu */
const FD_HAM={P:[94,-256],a:-62,g:50,wN:0,wF:0,s:1,r:1}; /* masse dans le dos, boule en bandoulière */
const QR={q:null,kind:'',tail:false,wd:0,lt:0};
/* courbe par morceaux, adoucie : K = [[temps, valeur], ...] */
function fdKv(x,K){if(x<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++)if(x<=K[i][0])return K[i-1][1]+(K[i][1]-K[i-1][1])*es((x-K[i-1][0])/(K[i][0]-K[i-1][0]));return K[K.length-1][1]}
/* mémoire de l'attaque qui précède une riposte (Q.atk est vidé avant Q.cn) */
function fdRec(){
  if(QR.q!==Q){QR.q=Q;QR.kind='';QR.tail=false;QR.wd=0;QR.lt=Q.time}
  const a=Q.atk;if(a){QR.kind=a.kind;QR.tail=a.hits.some(h=>h.k==='tail')}
}
/* griffes d'une main : trois lames, sur l'avant-bras */
function fdGriffes(c,E,Wr,k){if(k<=.02)return;const a=Math.atan2(Wr[1]-E[1],Wr[0]-E[0]);c.save();c.translate(Wr[0],Wr[1]);c.rotate(a);
  [[-14,-.3],[0,0],[14,.3]].forEach(([y,r])=>{c.save();c.translate(20,y);c.rotate(r);c.scale(k,1);COLFX.poly(c,[[-4,-6],[24,-6],[46,5],[22,2],[-4,6]],'#e7c9a2');COLFX.poly(c,[[-4,0],[24,0],[46,5],[22,2],[-4,6]],'#9a6a5e');c.restore()});c.restore()}
/* tornade de feu (maquette) : entonnoir, spires, langues, braises emportées */
function fdTornade(c,x,y,h,w,t,a){if(h<6)return;a=a==null?1:a;w*=1.5;h*=1.12;c.save();c.globalAlpha=a;const N=9,sx=u=>Math.sin(t*7-u*4.2)*w*.34*u,ww=u=>w*(.16+1.05*u*u+.2*u);
  const g=[],d=[];for(let i=0;i<=N;i++){const u=i/N;g.push([x+sx(u)-ww(u)*(i%2?.92:.74),y-u*h]);d.push([x+sx(u)+ww(u)*(i%2?.74:.92),y-u*h])}
  c.globalAlpha=a*.92;COLFX.poly(c,[...g,...d.slice().reverse()],'#8e2418');c.globalAlpha=a;
  for(let i=0;i<N;i++){const u=(i+.5)/N,cx=x+sx(u),cy=y-u*h,r=ww(u)*1.08,ep=h/N*.72,ph=Math.sin(t*15+i*1.9)*.28;
    const arc=(r_,dy,col,e,a0,a1)=>{const p=[];for(let k=0;k<=8;k++){const q=a0+(a1-a0)*k/8;p.push([cx+Math.cos(q)*r_,cy+dy+Math.sin(q)*r_*.26])}for(let k=8;k>=0;k--){const q=a0+(a1-a0)*k/8;p.push([cx+Math.cos(q)*r_,cy+dy+Math.sin(q)*r_*.26-e*Math.sin(k/8*Math.PI)])}COLFX.poly(c,p,col)};
    arc(r,0,i%2?'#d4501f':'#ff7a30',ep*1.5,-.15+ph,Math.PI+.15+ph);arc(r*.82,-ep*.14,'#ffb84a',ep,.35+ph*2,2.5+ph*2);if(i%2===0)arc(r*.6,-ep*.2,'#ffe08a',ep*.55,.7+ph*2,2.1+ph*2)}
  for(let i=0;i<5;i++){const k=(i-2)/2,tx=x+sx(1)+k*ww(1)*.9,hh=h*(.16+.1*Math.abs(Math.sin(t*11+i*1.7)));COLFX.poly(c,[[tx-w*.3,y-h+8],[tx+w*.15,y-h-hh*.45],[tx+w*.75+Math.sin(t*9+i)*w*.2,y-h-hh*.8],[tx+w*.3,y-h-hh*.25],[tx+w*.3,y-h+8]],i%2?'#ff9a35':'#d4501f')}
  for(let i=0;i<8;i++){const q=t*10+i*1.9,u=(i*.13+t*1.2)%1,r=ww(u)*1.45,px=x+sx(u)+Math.cos(q)*r,py=y-u*h+Math.sin(q)*r*.26;COLFX.poly(c,[[px,py-6],[px+4,py],[px,py+4],[px-4,py]],i%2?'#ffe08a':'#ff9a35')}c.restore()}
/* pose du Colosse : attaques (dessin seulement : les coups, les durées et les positions du jeu ne changent pas) */
function fdPose(){
  const t=Q.time,b=Q.boss,a=Q.atk,c=Q.cn,tt=reduce?0:t;
  const o={lean:Math.sin(tt*1.7)*.03,drop:2*Math.sin(tt*2.1),sx:1,dF:0,dN:0,off:[-62,92],nn:[0,0],tete:0,plie:0,dx:0,dy:0,jaw:0,griffe:.55,rage:0,fissure:0,flash:0,eteint:0,held:null,flap:0,rageF:0,tornade:0};
  if(Q.enraged){o.fissure=.4;o.rage=.45;o.rageF=.55}
  const hand=(side,x,y)=>{if(side==='A'){o.off[0]+=x;o.off[1]+=y}else{o.nn[0]+=x;o.nn[1]+=y}};
  if(a&&a.kind==='claws'){
    /* il fond sur le bloc, une main après l'autre : repli, coup, retour */
    let dive=0,side='A',best=0;
    a.hits.forEach((h,i)=>{if(!h.k.startsWith('claw'))return;const d=a.t-h.at,v=fdKv(d,[[-.9,0],[-.5,-.4],[-.2,-.5],[0,1],[.35,.25],[.75,0]]);if(Math.abs(v)>=best){best=Math.abs(v);dive=v;side=i%2?'B':'A'}});
    const p=Math.max(0,-dive),s=Math.max(0,dive);
    o.dx=-230*s+30*p;o.dy=10*s;o.lean=-.34*s+.26*p;o.tete=.2*s;o.griffe=.55+.75*Math.max(s,p);
    if(side==='A')hand('A',-60*s+80*p,-60*s-200*p);else hand('B',-130*s+16*p,-70*s-150*p);
  }else if(a&&a.kind==='wings'){
    /* il se ramasse, lève les ailes, les rabat : le corps suit chaque coup */
    const ws=a.hits.filter(h=>h.k==='wave');let sl=0;ws.forEach(h=>{const d=(a.t-(h.at-.55))/.16;sl=Math.max(sl,Math.exp(-d*d))});
    const up=fdKv(a.t,[[0,0],[.5,1],[ws[ws.length-1].at-.2,1],[ws[ws.length-1].at+.4,0]]);
    o.lean=.1*up-.2*sl;o.dx=-34*sl;o.flap=-.4*up;o.off=[-40,66];o.nn=[30,-30];
  }else if(a&&a.kind==='rocks'){
    /* une main arrache le bloc, le brandit, le lance */
    a.hits.forEach((h,i)=>{if(h.k!=='rock')return;const side=i%2?'B':'A',ts=h.at-1.0,te=h.at-.45,u=a.t;
      let k=0,f=0;if(u>=ts-.3&&u<te){k=es((u-(ts-.3))/.3);f=1}else if(u>=te&&u<te+.15)k=1-.4*((u-te)/.15);else if(u>=te+.15&&u<te+.55)k=.6*(1-es((u-te-.15)/.4));
      const th=u>=te&&u<te+.15?(u-te)/.15:u>=te+.15?1:0;
      if(k>0){hand(side,side==='A'?(-20-110*th)*k:(-50-110*th)*k,(-200+100*th)*k);o.lean+=(.14-.3*th)*k*.6;o.dx-=18*th*k}
      if(f&&u<te)o.held=side});
  }else if(a&&a.kind==='roar'){
    const cri=es((a.t-.15)/.2)*(1-es((a.t-(a.end-.3))/.3));
    o.jaw=14;o.lean=.17*cri;o.tete=.3*cri;o.sx=1+.07*cri;o.off=[-92,40];o.nn=[46,-62];o.flap=.8*cri;o.griffe=.9;
  }
  if(b.s==='rage'){
    const mont=es(b.t/.5),cri=es((b.t-.5)/.18)*(1-es((b.t-(b.dur-.45))/.4));
    o.plie=.5*mont*(1-es((b.t-.45)/.15));o.lean=-.16*mont*(1-cri)+.17*cri;o.tete=-.2*mont*(1-cri)+.3*cri;o.sx=1+.08*cri;o.jaw=14*cri;
    o.rage=es(b.t/.7);o.fissure=Math.max(o.fissure,o.rage);o.rageF=es((b.t-.45)/.25)*(1-.45*es((b.t-(b.dur-.4))/.4));
    o.off=[-62-30*cri,92-52*cri];o.nn=[34*cri,-56*cri];o.griffe=.55+.6*cri;
    o.tornade=es((b.t-.5)/.6)*(1-es((b.t-b.dur+.3)/.4));
  }
  if(c){
    /* riposte : le Colosse encaisse (même courbe que la phase I : montée en 80 ms, tenue, retour) */
    const hitT=c.k==='final'?1.55:{stab:.35,head:.55,beam:.85}[c.k],ch=COLFX.choc(c.t,hitT,c.k==='final'?1.2:.8,c.k==='final'?.7:.35),k=c.k==='final'?1.4:1;
    o.dx+=46*ch*k;o.dy+=14*ch*k;o.tete+=.34*ch*k;o.lean+=.2*ch*k;o.flash=c.t>hitT&&c.t<hitT+.07?.45:0;o.fissure=Math.max(o.fissure,COLFX.choc(c.t,hitT,1.1,.5)*(c.k==='final'?1:.7));
    hand('A',8*ch,10*ch);hand('B',30*ch,40*ch);
    if(c.k==='final'){const ex=es((c.t-1.55)/.5);o.fissure=Math.max(o.fissure,ex);o.eteint=es((c.t-2.6)/.5);o.flap=-.4*es((c.t-2.3)/.6)}
  }
  if(Q.mode==='lake'){o.eteint=Math.max(o.eteint,es(Q.lt/1.2)*.8);o.jaw=0;o.fissure=1;o.rage=.6;o.flap=Math.sin(tt*14)*.5}
  return o;
}
function qWingDmg(){
  const c=Q.cn,dt=Math.min(.1,Math.max(0,Q.time-QR.lt));QR.lt=Q.time;
  if(c&&c.k==='head'&&QR.kind==='wings'&&!QR.tail)QR.wd=Math.max(QR.wd,es((c.t-.5)/.5));
  else if(!c)QR.wd=Math.max(0,QR.wd-dt*.8);
  return QR.wd;
}
/* centre de l'aile proche (côté droit à l'écran) : cible du rayon qui la déchire */
function fdWingPt(){return[Q.bx+130,Q.by-70]}
function drawBoss2(){
  const t=Q.time,tt=reduce?0:t,b=Q.boss,P=fdPose(),s=FD_S;
  const X0=Q.bx+17+P.dx,Y0=Q.by+185*s+P.dy;
  const wa=wingAngle(),fire=Q.enraged,dmg=qWingDmg(),wo=Q.wo;
  const T2=tailTip(),tip=[(T2.tip[0]-X0)/s,(T2.tip[1]-Y0)/s];
  const R0=[30,-130];let tp=tip;
  if(Q.cn&&Q.cn.k!=='final'&&QR.tail){const u=es((Q.cn.t-.35)/.3);tp=[tip[0],tip[1]+((QLAKE-14-Y0)/s-tip[1])*u]} /* queue clouée au sol par le rayon */
  const qP=[R0,[R0[0]+(tp[0]-R0[0])*.35,R0[1]+(tp[1]-R0[1])*.3+36*(1-T2.strike)],[R0[0]+(tp[0]-R0[0])*.7,R0[1]+(tp[1]-R0[1])*.75+58*(1-T2.strike)],tp];
  QR.tipPx=[X0+tp[0]*s,Y0+tp[1]*s];
  ctx.save();
  if(P.rageF>.01){ctx.save();ctx.translate(X0,Y0);ctx.scale(s,s);COLFX.rageDerriere(ctx,tt,P.rageF);ctx.restore()}
  ctx.translate(X0,Y0);ctx.scale(s,s);
  COLOSSE.draw(ctx,{lean:P.lean,drop:P.drop,sx:P.sx,dF:P.dF,dN:P.dN,off:P.off,nn:P.nn,ham:FD_HAM,qP,look:-.05,eyes:Q.enraged?.5:.15,breath:tt,smoke:1,
    plie:P.plie,tete:P.tete,fissure:P.fissure,rage:P.rage,eteint:P.eteint,flash:P.flash,tip:null,sag:0,heat:0,t:tt,warm:Q.enraged?1.4:1,jaw:P.jaw,hurt:Q.recoil>.3,wound:0,
    back:applyM=>{
      ctx.save();applyM();ctx.scale(.92/s,.92/s);
      for(const sd of [-1,1]){
        drawWing([sd*55,-250],wa+.3+P.flap*.3,.85,'#2a0c14',wo,fire,sd,sd>0?dmg:0);
        drawWing([sd*65,-258],wa+P.flap*.3,1,'#4a1219',wo,fire,sd,sd>0?dmg:0);
      }
      ctx.restore()},
    front:rig=>{
      fdGriffes(ctx,rig.fa.E,rig.fa.W,P.griffe);fdGriffes(ctx,rig.na.E,rig.na.W,P.griffe);
      if(P.held){const h=P.held==='A'?rig.fa.W:rig.na.W;qrock(h[0]-8,h[1]-26,30,tt*3,true)}
    }});
  ctx.restore();
  if(P.rageF>.01){ctx.save();ctx.translate(X0,Y0);ctx.scale(s,s);COLFX.rageSol(ctx,tt,P.rageF);ctx.restore()}
  /* rage : tornades de feu aux ailes */
  if(P.tornade>.02&&!reduce){const g=P.tornade;fdTornade(ctx,Q.bx-250,Q.by+10,170*g,38*g,t);fdTornade(ctx,Q.bx+226,Q.by-6,160*g,36*g,t+2.1)}
  else if(P.tornade>.02){const g=P.tornade;fdTornade(ctx,Q.bx-250,Q.by+10,170*g,38*g,0);fdTornade(ctx,Q.bx+226,Q.by-6,160*g,36*g,0)}
  /* feu et lueur au bout de la queue */
  if(T2.fire>0&&!(Q.cn&&QR.tail&&Q.cn.t>.7)){const q=QR.tipPx,f=T2.fire;fdGlow(ctx,q[0],q[1],52*f,'255,200,100',.55);COLFX.flamme(ctx,q[0],q[1]+10,12,(46+10*Math.sin(tt*10))*f,-6,tt*14)}
}

function tailTip(){
  const x=Q.bx,y=Q.by,a=Q.atk;
  let tip=[x+175+Math.sin(Q.time*2)*16,y+135+Math.cos(Q.time*2.3)*14],fire=Q.enraged?.5:0,strike=0;
  if(a){
    const th=a.hits.filter(x=>x.k==='tail'),h=th.find(x=>a.t<x.at+.4)||th[th.length-1]||a.hits[a.hits.length-1];
    if(h.k==='tail'){
      const d=a.t-h.at,up=[x+130,y-170],hit=[QH[0]+30,QH[1]+10];
      if(d>-.55&&d<=-.14){tip=lerp2(tip,up,es(clamp01((d+.55)/.4)));fire=1}
      else if(d>-.14&&d<=0){tip=lerp2(up,hit,ei(clamp01((d+.14)/.14)));fire=1;strike=1}
      else if(d>0&&d<.4){tip=lerp2(hit,tip,es(d/.4));fire=1-d/.4*.5;strike=1-d/.4}
    }
  }
  return{tip,fire,strike};
}
/* entaille : fuseau effilé (trait de lame ou de lumière) */
function fdEnt(c,x0,y0,x1,y1,w,col){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,mx=(x0+x1)/2,my=(y0+y1)/2;COLFX.poly(c,[[x0,y0],[mx+nx*w,my+ny*w],[x1,y1],[mx-nx*w*.35,my-ny*w*.35]],col)}
/* trois entailles de griffes sur le bloc du Veilleur */
function fdTrois(c,x,y,sens,u){if(u<=0||u>=1)return;c.save();c.globalAlpha=u<.5?1:1-(u-.5)*2;const e=Math.min(1,u*3.5),L=130;
  for(let i=0;i<3;i++){const ox=i*24-24,x0=x+ox+L*.45*sens,y0=y-L*.5+i*7,x1=x0+((x+ox-L*.45*sens)-x0)*e,y1=y0+((y+L*.5+i*7)-y0)*e;fdEnt(c,x0,y0,x1,y1,13,'#d4501f');fdEnt(c,x0,y0,x1,y1,7,'#ffb84a');fdEnt(c,x0,y0,x1,y1,2.4,'#fff6d8')}c.restore()}
function fdPuff(c,x,y,u,n,seed){if(u<0||reduce)return;const r=fdRnd(seed);for(let i=0;i<n;i++){const v=u-i*.06;if(v<0||v>.9)continue;const px=x+(r()-.5)*40+v*14,py=y-v*100,rr=7+v*22;c.fillStyle='rgba(84,58,88,'+(.8-v*.9)+')';c.beginPath();c.arc(px,py,rr,0,6.283);c.fill()}}
/* les coups du Colosse : griffes, tornades de feu des ailes, débris, boule de feu, cri et ses chutes */
function drawHits2(){
  const a=Q.atk;if(!a)return;
  const tt=reduce?0:Q.time,gy=QH[1]+46;
  if(a.kind==='roar'&&!reduce){ctx.fillStyle='rgba(120,95,100,.55)';for(let i=0;i<16;i++){const x=(i*61+Math.sin(Q.time*3+i)*20+30)%W,y=(Q.time*(260+i*14)+i*47)%(H*.7);ctx.fillRect(x,y,3+i%3,3+i%3)}}
  for(const h of a.hits){
    const d=a.t-h.at;
    if(h.k==='clawA'||h.k==='clawB'){
      if(d<-.1||d>.6)continue;
      fdTrois(ctx,QH[0]+22,QH[1]+10,h.k==='clawA'?1:-1,(d+.06)/.5);
      if(!reduce&&d>=0)COLFX.eclats(ctx,QH[0]+10,gy,d,14,['#ffe08a','#ff9a35','#8a4c4a'],260,51+(h.k==='clawA'?0:1),gy+8,520);
    }else if(h.k==='wave'){
      /* tornade de feu qui roule sur le sol jusqu'au bloc, puis le dépasse */
      if(d<-.55||d>.55)continue;
      const u=Math.min(1,(d+.55)/.55),v=Math.max(0,d/.55),x=d<0?(Q.bx-110)+(QH[0]+30-(Q.bx-110))*(u*u*.35+u*.65):(QH[0]+30)-(QH[0]-80)*v,
        hh=d<0?150*es(u*1.8):150*(1-v*.75),ww=d<0?34*es(u*1.8):34*(1-v*.6);
      fdTornade(ctx,x,gy+4,hh,ww,tt+h.at,d<0?1:1-v*v);
      if(!reduce)COLFX.eclats(ctx,x+14,gy+4,(Q.time*2.2)%.5,6,['#ff9a35','#ffe08a'],150,60,gy+8,420);
    }else if(h.k==='rock'){
      if(d<-.45||d>.5)continue;
      const e0=[QH[0]+30,QH[1]+20];
      if(d<0){
        const u=(d+.45)/.45,s0=[Q.bx-120,Q.by-90];
        for(let i=4;i>=1;i--){const uu=Math.max(0,u-i*.07),q=lerp2(s0,e0,uu);q[1]-=60*Math.sin(Math.PI*uu);ctx.fillStyle='rgba(255,140,50,'+(.28-i*.05)+')';ctx.beginPath();ctx.arc(q[0],q[1],24-i*3,0,6.283);ctx.fill()}
        const pos=lerp2(s0,e0,u);pos[1]-=60*Math.sin(Math.PI*u);qrock(pos[0],pos[1],26,tt*14,true);qflame(pos[0]+10,pos[1]-18,10,34,3,'rgba(255,170,70,.85)');
      }else{
        /* le bloc se fracasse sur celui du Veilleur */
        if(d<.14)COLFX.etoile(ctx,e0[0],e0[1],80*(1-d*5),9,.3,'#ff9a35',.45);
        if(!reduce)COLFX.eclats(ctx,e0[0],e0[1],d,26,['#7a4048','#2a1224','#ff9a35','#4a2438'],320,70,gy+8,520);
        fdPuff(ctx,e0[0],e0[1]+6,d,5,17);
      }
    }else if(h.k==='fall'){
      if(d<-.8||d>.5)continue;
      const x=QH[0]+26,gyy=QH[1]-6;
      if(d>=-.42&&d<=.02){
        const u=clamp01((d+.42)/.42),y=d<0?-50+(gyy+50)*u*u:gyy+d*1100;
        for(let i=3;i>=1;i--){ctx.fillStyle='rgba(255,140,50,'+(.22-i*.05)+')';ctx.beginPath();ctx.arc(x,y-i*26,26-i*4,0,6.283);ctx.fill()}
        qrock(x,y,28,tt*7+x,true);
      }
      if(d>.0&&!reduce)COLFX.eclats(ctx,x,gy,d,16,['#7a4048','#2a1224','#ff9a35'],260,100,gy+8,520);
      if(d<-.12){ /* flèche : orange, puis rouge quand il faut esquiver */
        const red=d>=-.3,al=red?.95:.35+.35*Math.abs(Math.sin(Q.time*18));
        ctx.save();ctx.fillStyle=red?'rgba(255,45,40,'+al+')':'rgba(255,150,50,'+al+')';ctx.beginPath();ctx.moveTo(x-12,26);ctx.lineTo(x+12,26);ctx.lineTo(x,52);ctx.closePath();ctx.fill();ctx.restore();
      }
    }else if(h.k==='fire'){
      /* boule de feu (Difficile) : même style que les tornades, aplats découpés */
      if(d<-.32||d>.04)continue;
      const u=clamp01((d+.32)/.32),s0=[Q.bx-62,Q.by-98],e0=[QH[0]+26,QH[1]-2],pos=lerp2(s0,e0,u);
      for(let i=5;i>=1;i--){const q=lerp2(s0,e0,Math.max(0,u-i*.06));ctx.fillStyle='rgba(255,150,50,'+(.34-i*.05)+')';ctx.beginPath();ctx.arc(q[0],q[1],15-i*2,0,6.283);ctx.fill()}
      fdGlow(ctx,pos[0],pos[1],40,'255,170,80',.6);
      COLFX.flamme(ctx,pos[0]+8,pos[1]+4,14,38,-10,tt*14);
      ctx.fillStyle='#ffe9a0';ctx.beginPath();ctx.arc(pos[0],pos[1],9,0,6.283);ctx.fill();ctx.fillStyle='#fffbea';ctx.beginPath();ctx.arc(pos[0]-2,pos[1]-2,4,0,6.283);ctx.fill();
    }
  }
}

function heroPose(){
  const p=Q.pl,c=Q.cn;
  let x=Q.hx,y=Q.hy,rot=0,sa=-.12,glow=0;
  const chestT=[Q.bx-120,Q.by-8];
  if(c){
    const t=c.t;
    if(c.k==='stab'){
      /* pas en avant (28 px, 1er novembre : la robe reste sur le bloc), rayon droit sur le torse */
      const adv=t<.3?eo(t/.3):t<.7?1:1-es(clamp01((t-.7)/.45));x+=28*adv;rot=-.04*adv;
    }else if(c.k==='head'){
      /* le Veilleur reste sur son bloc : seul son rayon monte vers la tête (1er novembre) */
      glow=t>=.3&&t<.85?.6:0;
    }else if(c.k==='beam'){
      glow=clamp01(t/.75);
      if(t>1.3)glow=Math.max(0,1-(t-1.3)/.3);
    }else if(c.k==='final'){
      /* coup ultime : le Veilleur reste au sol, un pas en avant sur son bloc ; seul le rayon vise (1er novembre) */
      if(t<1.1){glow=t/1.1}
      else{const u=es(clamp01((t-1.1)/.45));x+=28*u;glow=t<1.55?1:Math.max(.5,1-(t-1.55)/3)}
    }
    const tgt=qBeamTarget(c);if(tgt)sa=Math.atan2(tgt[1]-(y+WH[1]),tgt[0]-(x+WH[0]));else sa=-.7;
  }else if(qSideK()>0){
    /* esquive : pas de côté sur le bloc (pose dodgeSide du Chapitre II), inclinaison autour des pieds (corps décalé de 44 px) */
    const k=qSideK(),r=DG.side.rot*k;x+=DG.side.dx*k+44*Math.sin(r);y+=44-44*Math.cos(r);rot=r;
  }else if(p.s==='hurt'){
    const u=Math.min(1,p.t/p.rd);x-=34*(1-u);rot=-.35*(1-u);
  }else if(p.s==='down'){
    /* défaite : le Veilleur s'effondre du bloc sur le rebord (DG.drop plus bas) */
    x-=Math.min(p.t,.8)*40;y+=Math.min(DG.drop,p.t*140);rot=-Math.min(1.45,p.t*5);
  }
  /* fin : le Veilleur revient debout sur son bloc et regarde le Colosse plonger, puis s'envoler */
  if(Q.mode==='lake'){const e=es(clamp01(Q.lt/.6));x+=(Q.hx-x)*e;y+=(Q.hy-y)*e;sa=-1.15;glow=Q.erupt?.8:.35;rot=0}
  return{x,y,rot,sa,glow};
}
const WH=[34,-8];
/* avancement du pas de côté (0 à 1 à 0, sur DG.side.dur depuis l'appui) ; 0 hors esquive, pendant un coup reçu, un contre ou la défaite */
function qSideAge(){const p=Q.pl;return p.s==='act'?p.t:Q.time-Q.sideT}
function qSideK(){const p=Q.pl,g=qSideAge();return Q.cn||p.s==='hurt'||p.s==='down'||Q.mode==='lake'||g<0||g>=DG.side.dur?0:Math.sin(Math.PI*g/DG.side.dur)}
/* intensité du rayon de contre (phase II) à l'instant t */
function qBeamAl(c){const t=c.t;if(c.k==='stab')return t>=.28&&t<.62?(t<.35?(t-.28)/.07:1-(t-.35)/.27):0;if(c.k==='head')return t>=.48&&t<.85?(t<.55?(t-.48)/.07:1-(t-.55)/.3):0;if(c.k==='final')return t>=1.45&&t<3.5?Math.min(1,(t-1.45)/.1)*(t<3.2?1:1-(t-3.2)/.3):0;return 0}
function qSwordTip(){const h=heroPose();return[h.x+WH[0]+Math.cos(h.sa)*80,h.y+WH[1]+Math.sin(h.sa)*80]}
function drawHero2(){
  const h=heroPose(),t=Q.time,p=Q.pl,c=Q.cn;
  /* le Veilleur commun (LB.drawWatcher), corps réduit pendant la chute dans le puits ; la phase donne sa géométrie */
  const c2=Q.cn,hitk=c2?qBeamAl(c2):0;
  const sk=qSideK(),pose=c?'counter':sk>0?'dodgeSide':p.s==='hurt'?'hurt':p.s==='down'?'fall':'idle';
  const opt={k:sk,dx:0,dy:0,rot:h.rot,rot2:0,sx:1,sy:1,breath:false,fl:3*Math.sin(t*14),
    body:{dy:44,s:.8},shoulder:[18.5,-18.5],armR:5.2,hand:WH,sa:h.sa,L:80,aura:h.glow,
    glow:Math.max(.35,h.glow,hitk),lanternCol:LB.watcherLanternCol(Q.pl,h.glow>0||hitk>0)};
  /* image rémanente du pas de côté, vers sa place de départ, comme au Chapitre II */
  if(sk>0&&qSideAge()<DG.side.ghost){ctx.save();ctx.globalAlpha=DG.side.ga;LB.drawWatcher(ctx,h.x+DG.side.gx,h.y,pose,t,Object.assign({},opt,{aura:0}));ctx.restore()}
  LB.drawWatcher(ctx,h.x,h.y,pose,t,opt);
}
function drawFx2(){
  const S=R||Q;
  for(const s of S.sparks){
    ctx.globalAlpha=clamp01(s.life/s.max);ctx.fillStyle=s.col;ctx.fillRect(s.x-s.sz/2,s.y-s.sz/2,s.sz,s.sz);
  }
  ctx.globalAlpha=1;
  for(const r of S.rings){
    const u=1-r.life/r.max;
    ctx.strokeStyle='rgba(191,234,255,'+(1-u)+')';ctx.lineWidth=5*(1-u)+1;
    ctx.beginPath();ctx.arc(r.x,r.y,18+120*u,0,6.283);ctx.stroke();
  }
  for(const f of S.fbs){
    const u=f.t/.7,al=Math.max(0,1-u*u);
    ctx.save();ctx.translate(f.x,f.y);
    const gg=ctx.createRadialGradient(0,0,0,0,0,110*f.big);
    gg.addColorStop(0,'rgba(255,230,150,'+(.9*al)+')');gg.addColorStop(1,'rgba(255,100,30,0)');
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,110*f.big,0,6.283);ctx.fill();
    ctx.globalAlpha=al;
    for(let i=0;i<11;i++){
      const a=-3.14+(i/10)*3.14+Math.sin(i*5.3)*.12,len=(50+70*((i*7)%5)/4)*f.big*eo(clamp01(u*1.6));
      ctx.save();ctx.rotate(a+1.5708);
      qflame(0,-8,11*f.big,len,i,i%2?'rgba(255,214,110,.95)':'rgba(255,110,40,.95)');
      ctx.restore();
    }
    ctx.restore();
  }
  for(const e of S.exps){
    const u=e.t/.9,rr=(30+300*eo(u))*e.s,al=Math.max(0,1-u*1.1);
    const g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,rr);
    g.addColorStop(0,'rgba(255,255,255,'+al+')');g.addColorStop(.5,'rgba(190,234,255,'+(al*.6)+')');g.addColorStop(1,'rgba(111,211,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,rr,0,6.283);ctx.fill();
  }
  ctx.textAlign='center';
  for(const f of S.floats){
    const u=1-f.life/f.max;
    ctx.globalAlpha=clamp01(f.life/f.max*1.6);
    ctx.font='800 '+Math.round(f.sz*(1+.45*Math.max(0,1-u*7)))+'px '+DISPLAY;ctx.fillStyle=f.col;
    ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.7)';ctx.strokeText(f.txt,f.x+f.sz*2,f.y-26*u);
    ctx.fillText(f.txt,f.x+f.sz*2,f.y-26*u);
  }
  ctx.globalAlpha=1;ctx.textAlign='start';
}
function drawHints2(){
  if(!LB.help.on()||Q.mode!=='play')return;
  const p=Q.pl,a=Q.atk;
  if(a&&p.s!=='counter'){
    const h=a.hits.find(x=>!x.done);
    if(h){
      LB.cue(ctx,{x:QH[0],y:QH[1]-95,cx:QH[0],cy:QH[1]-10,r:70,tt:h.at-a.t,act:HD('dodge').act,easy:DIFF.easy});
    }
  }
  LB.drawRecoveryBar(ctx,QH[0],QH[1]+44,p); /* barre de récupération sous les pieds : repère d'aide, jamais rouge (la lanterne l'est) */
}


/* ripostes après esquive parfaite (dessin seulement, dans les durées du jeu : estoc .35 / fin 1.15, tête .55 / 1.45, rayon .85 / 1.65, coup ultime 1.55) :
   griffes = éclat à bout portant ; ailes = aile déchirée par le rayon ; débris = bloc renvoyé au bâton ; cri = rayon dans la gueule (le jeu n'a pas de riposte au cri) ;
   attaque finie par la queue = queue clouée et éteinte ; coup ultime = la lumière sort par les fissures */
function drawCnFx(){
  const c=Q.cn;if(!c)return;
  const tt=reduce?0:Q.time,tip=qSwordTip(),to=qBeamTarget(c),tail=c.k!=='final'&&QR.tail;
  {const al=qBeamAl(c);if(al>0){const w=c.k==='final'?26*(1+.08*Math.sin(tt*50)):16;lanternBeam(tip,to,w,al)}}
  if(c.k==='beam'&&!tail){
    /* le bloc arraché par le Colosse est cueilli au bâton, puis renvoyé à la figure */
    const o0=[tip[0]+30,tip[1]-6];
    if(c.t>=.3&&c.t<.62)qrock(o0[0],o0[1],18*es((c.t-.3)/.2),tt*8,true);
    else if(c.t>=.62&&c.t<.88){const w=(c.t-.62)/.26,p=lerp2(o0,to,w*w);for(let i=4;i>=1;i--){const q=lerp2(o0,to,Math.max(0,w-i*.07)**2);ctx.fillStyle='rgba(255,214,110,'+(.3-i*.05)+')';ctx.beginPath();ctx.arc(q[0],q[1],20-i*3,0,6.283);ctx.fill()}qrock(p[0],p[1],26,tt*11,true)}
    if(c.t>=.75&&c.t<1.35){
      const u=(c.t-.75)/.6,wd=34*(1-u*.6)*(1+.1*Math.sin(tt*60));
      ctx.save();ctx.lineCap='round';
      ctx.strokeStyle='rgba(255,217,102,.25)';ctx.lineWidth=wd*2.4;ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(to[0],to[1]);ctx.stroke();
      ctx.strokeStyle='rgba(255,217,102,.55)';ctx.lineWidth=wd*1.6;ctx.stroke();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=wd*.6;ctx.stroke();ctx.restore();
    }
  }
  if(c.k==='stab'&&!tail&&c.t>=.3&&c.t<.8){
    /* éclat à bout portant : l'estoc touche la poitrine, la griffe saute */
    const u=(c.t-.35)/.45;
    if(c.t<.62){COLFX.etoile(ctx,to[0],to[1],90*(1-Math.max(0,u)*.6),10,.2,'#ffd66a',.4);COLFX.etoile(ctx,to[0],to[1],48*(1-Math.max(0,u)),10,.5,'#fffbea')}
    if(!reduce&&u>0)COLFX.eclats(ctx,to[0],to[1],u*.8,22,['#ffe58a','#6a3a50','#ff9a35','#2c1534'],300,9,null,500);
  }
  if(c.k==='head'&&QR.kind==='wings'&&!tail&&c.t>=.5){
    /* le rayon déchire l'aile proche : entaille, trous brûlés (drawWing, dmg), débris et fumée */
    const wp=fdWingPt(),u=(c.t-.5)/.65,e=es(u*1.7);
    if(u<1){ctx.save();ctx.globalAlpha=1-u*u;const A=[wp[0]-70,wp[1]+62],B=[A[0]+(wp[0]+86-A[0])*e,A[1]+(wp[1]-66-A[1])*e];fdEnt(ctx,A[0],A[1],B[0],B[1],24,'#ff9a35');fdEnt(ctx,A[0],A[1],B[0],B[1],13,'#ffe58a');fdEnt(ctx,A[0],A[1],B[0],B[1],5,'#fffbea');ctx.restore()}
    if(!reduce){COLFX.eclats(ctx,wp[0],wp[1],c.t-.55,22,['#6a3050','#3a1430','#ff9a35','#ffe58a'],270,88,null,260);fdPuff(ctx,wp[0],wp[1],c.t-.6,7,12)}
  }
  if(tail&&c.t>=.35&&c.t<1.6){
    /* la queue est clouée au sol par un trait de lumière, et son feu s'éteint */
    const q=QR.tipPx||to,u=(c.t-.35)/.4,pin=es(u),al=c.t<1.2?1:1-(c.t-1.2)/.4;
    ctx.save();ctx.globalAlpha=al;
    if(c.t<.7)COLFX.etoile(ctx,q[0],q[1],70*(1-u),9,.3,'#ffe9a0',.4);
    COLFX.poly(ctx,[[q[0]-4,q[1]-70*pin],[q[0]+4,q[1]-70*pin],[q[0]+2,q[1]+10],[q[0]-2,q[1]+10]],'#ffe9a0');COLFX.poly(ctx,[[q[0]-1.5,q[1]-70*pin],[q[0]+1.5,q[1]-70*pin],[q[0]+1,q[1]+8],[q[0]-1,q[1]+8]],'#fffbea');
    ctx.restore();
    if(!reduce){COLFX.eclats(ctx,q[0],q[1],c.t-.4,16,['#ff9a35','#ffe08a','#8a4c4a'],220,81,q[1]+6,480);fdPuff(ctx,q[0],q[1]-4,c.t-.75,8,29)}
  }
  if(c.k==='final'&&c.t>=1.55&&c.t<3.6){
    /* la lumière ressort par les fissures du Colosse */
    const jet=es((c.t-1.6)/.4)*(1-es((c.t-3.0)/.5)),cx=Q.bx-20,cy=Q.by-4;
    if(jet>0){
      [[0,-1],[0,-70],[-30,-30],[22,18],[10,-96],[-52,4],[34,-52]].forEach(([hx,hy],i)=>{const a=i*6.283/7+.5+Math.sin(tt*3+i)*.07,L=(120+(i%3)*60)*jet,x=cx+hx*.8,y=cy+hy*.8;
        ctx.save();ctx.globalAlpha=.75;fdEnt(ctx,x,y,x+Math.cos(a)*L,y+Math.sin(a)*L,11,'#ffe9a0');ctx.globalAlpha=1;fdEnt(ctx,x,y,x+Math.cos(a)*L*.7,y+Math.sin(a)*L*.7,4,'#fffbea');ctx.restore()});
      COLFX.etoile(ctx,cx,cy,40+30*jet+Math.sin(tt*30)*6,10,tt*4,'#fffbea',.4);
    }
  }
}
function qBeamTarget(c){
  if(c.k!=='final'&&QR.tail&&QR.tipPx)return QR.tipPx;
  if(c.k==='head'&&QR.kind==='wings')return fdWingPt();
  return c.k==='head'?[Q.bx,Q.by-92]:c.k==='beam'?[Q.bx-30,Q.by-4]:c.k==='final'?[Q.bx-20,Q.by-4]:[Q.bx-30,Q.by-4];
}
function renderQ(){
  qLayout();
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(Q.shake>0&&!reduce)ctx.translate(rand(-1,1)*Q.shake,rand(-1,1)*Q.shake);
  fdRec();
  qBackground();
  /* rage : voile sombre pendant le cri */
  if(Q.boss.s==='rage'){const b=Q.boss,v=.45*es(b.t/.5)*(1-es((b.t-(b.dur-.4))/.4));if(v>.01){ctx.fillStyle='rgba(40,4,14,'+v+')';ctx.fillRect(-20,-20,W+40,H+40)}}
  ctx.save();ctx.translate(0,qDive());
  drawBoss2();
  drawHits2();
  ctx.restore();
  drawLake(true);
  drawHero2();
  drawCnFx();
  drawHints2();
  drawFx2();
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(Q.flash>0){ctx.fillStyle='rgba(255,255,255,'+Q.flash+')';ctx.fillRect(0,0,W,H)}
  if(Q.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(Q.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  let fade=0;
  if(Q.mode==='intro')fade=1-clamp01(Q.t/.7);
  if(Q.mode==='lake'&&Q.splash)fade=clamp01((Q.lt-Q.splash-1.9)/.9);
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,W,H)}
}
