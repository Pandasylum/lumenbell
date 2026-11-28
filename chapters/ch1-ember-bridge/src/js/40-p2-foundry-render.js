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
  fdR(c,180,96,700,26,'#3a1c40');fdR(c,180,96,700,6,FD_BORD);fdR(c,180,118,700,5,'#1c0c24');for(let x=196;x<872;x+=38)fdRiv(c,x,109,3.5,'#b06a68');
  for(let x=190;x<842;x+=76)fdP(c,[[x,122],[x+10,122],[x+48,148],[x+38,148]],'#2c1536');fdR(c,180,146,700,7,'#2c1536');
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
  colGlow(c,946,500,190,'255,150,70',.3+.06*Math.sin(t*5));
  fdBrume(c,482,52,'236,140,110',.17,(t*.035)%1);fdBrume(c,552,44,'255,160,100',.22,1-(t*.05)%1);
  /* chaînes pendues au rail */
  [[420,150,92,0],[716,150,130,1.7],[1186,60,230,4.4]].forEach(([x,y,l,p])=>{const s=Math.sin(t*1.3+p)*9;c.save();c.globalAlpha=.9;fdChaine(c,[[x,y],[x,y+l*.35],[x+s*.5,y+l*.7],[x+s,y+l]],Math.round(l/17),10,'#4a2a44','rgba(255,150,100,.5)');c.restore()});
}
/* voile de chaleur, puis lueur du four qui découpe la silhouette du Colosse (repère écran) */
function fdRecul(){
  const g=ctx.createLinearGradient(150*FD.ZW,0,520*FD.ZW,0);g.addColorStop(0,'rgba(150,80,118,0)');g.addColorStop(1,'rgba(150,80,118,.34)');ctx.fillStyle=g;ctx.fillRect(150*FD.ZW,0,W,QLAKE);
  colGlow(ctx,700,QH[1]+10,300,'255,196,140',.5);colGlow(ctx,640,QLAKE+30,430,'255,120,50',.26);
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
  const p=.5+.5*Math.sin(t*6.283*.35);colGlow(ctx,132,572,52+10*p,'255,122,42',.34+.24*p);
  ctx.translate(132,574);ctx.scale(1.35,1.35);ctx.translate(-438,-578);
  fdP(ctx,[[430,568],[446,568],[443,590],[433,590]],'rgb('+(200+40*p|0)+','+(96+28*p|0)+',34)');fdP(ctx,[[427,563],[438,555],[449,563],[449,568],[427,568]],'#2a141c');fdP(ctx,[[430,590],[446,590],[448,595],[428,595]],'#2a141c');
  ctx.strokeStyle='#2a141c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(434,568);ctx.lineTo(435,590);ctx.moveTo(442,568);ctx.lineTo(441,590);ctx.stroke();
  ctx.restore();
}
function qBackground(){
  if(!FD.back)fdBuild();
  const t=reduce?0:Q.time;
  ctx.drawImage(FD.back,0,0,W,H);
  QR.geo=fdCrGeo(t);
  ctx.save();ctx.translate(0,QFLOOR-592*FD.ZW);ctx.scale(FD.ZW,FD.ZW);fdAmbiance(ctx,t);ctx.restore();
  fdRecul();
  /* chariot, câbles, creuset (selon son état) et sa coulée : après le voile de chaleur, pour que sa couleur ne change pas quand il passe devant le Colosse */
  ctx.save();ctx.translate(0,QFLOOR-592*FD.ZW);ctx.scale(FD.ZW,FD.ZW);fdCrBack(ctx,t);ctx.restore();
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

/* rocher lancé (phases II et III) : bloc de la pierre du Colosse, à facettes (face éclairée, face d'ombre, liseré chaud), veiné de braise quand il est brûlant ;
   aplats nets, ni flou ni ombre portée. r : rayon, rot : rotation, hot : veines de braise */
const QROCK=[[-1,-.3],[-.62,-.95],[.22,-1.06],[.95,-.5],[.92,.42],[.32,1],[-.62,.84],[-1.06,.22]];
function qrock(x,y,r,rot,hot){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(r,r);
  const S=QROCK,P=(pts,col)=>COLFX.poly(ctx,pts,col);
  P(S.map(q=>[q[0]*1.12,q[1]*1.12]),'#12040e');                                  /* contour sombre */
  P(S,'#2c1534');                                                                 /* masse */
  P([S[0],S[1],S[2],[.1,-.22],[-.42,-.05]],'#3e1d3c');                             /* face du dessus, éclairée */
  P([S[0],[-.42,-.05],[-.3,.5],S[6],S[7]],'rgba(178,82,92,.42)');                  /* face avant, reflet de braise */
  P([S[2],S[3],S[4],[.3,.3],[.1,-.22]],'rgba(7,0,18,.5)');                          /* face d'ombre */
  P([[.1,-.22],[.3,.3],S[5],[-.3,.5],[-.42,-.05]],'rgba(205,108,102,.16)');
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='rgba(255,170,130,.5)';ctx.lineWidth=.07;ctx.beginPath();ctx.moveTo(S[7][0],S[7][1]);ctx.lineTo(S[0][0],S[0][1]);ctx.lineTo(S[1][0],S[1][1]);ctx.lineTo(S[2][0],S[2][1]);ctx.stroke();   /* liseré */
  const V=[[-.5,-.62],[-.12,-.18],[-.3,.22],[.08,.66]],V2=[[-.12,-.18],[.5,-.4]],V3=[[-.3,.22],[-.74,.36]];
  (hot?[[.2,'#e9561b'],[.075,'#ffc27a']]:[[.11,'rgba(10,2,16,.75)']]).forEach(([w,col])=>{ctx.strokeStyle=col;ctx.lineWidth=w;
    [V,V2,V3].forEach(L=>{ctx.beginPath();L.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()})});
  ctx.restore();
}
/* traînée d'un rocher brûlant : braises découpées qui s'éteignent derrière lui (remplace les ronds flous) */
function qrockTrail(pts,r){pts.forEach((q,i)=>{const k=1-i/pts.length,s=r*(.5*k+.12);
  COLFX.poly(ctx,[[q[0],q[1]-s],[q[0]+s*.75,q[1]],[q[0],q[1]+s],[q[0]-s*.75,q[1]]],i%3===0?'#ffe08a':i%3===1?'#ff9a35':'#d4501f')})}
function wingAngle(){
  let ang=Math.sin(Q.time*2.3)*.07;
  const a=Q.atk,b=Q.boss;
  if(a&&a.kind==='wings'){
    const ws=a.hits.filter(h=>h.k==='wave'),last=ws[ws.length-1].at;
    const raise=clamp01(a.t/.5)*(1-clamp01((a.t-(last-.3))/.5));
    ang-=.4*fdE(raise);
    ws.forEach(h=>{const d=(a.t-(h.at-.55))/.16;ang+=.85*Math.exp(-d*d)})
  }
  if(b.s==='rage')ang-=.3*Math.sin(clamp01(b.t/b.dur)*3.14);
  if(Q.mode==='lake'&&Q.erupt)ang+=Math.sin(Q.time*14)*.4-.2;
  return ang;
}
/* ailes dans le style de la maquette (aile() de fonderie-reference) : deux sprites dessinés une fois (ombre portée, plans de lumière, nervures, fissures de braise), partagés par les phases I et II ;
   dessin par image : un drawImage et, en rage, des flammes aux pointes. */
const FD_WK=1.5,FD_WS={};
function fdWingSprite(loin){
  const k=loin?1:0;if(FD_WS[k])return FD_WS[k];
  const e=document.createElement('canvas');e.width=Math.round(380*FD_WK);e.height=Math.round(250*FD_WK);
  const c=e.getContext('2d');c.setTransform(FD_WK,0,0,FD_WK,10*FD_WK,194*FD_WK);
  const d='M0 -6L70 -96L148 -148L330 -178C318 -150 312 -118 322 -84C292 -96 262 -84 250 -46C228 -70 192 -66 176 -24C158 -48 122 -46 106 -6C90 -22 60 -20 44 12L6 44Z',p=new Path2D(d);
  c.fillStyle=loin?'#3a1430':'#521d37';c.fill(p);c.save();c.clip(p);
  [['M0 -6L70 -96L148 -148L330 -178L148 -118L74 -70Z',loin?'rgba(205,108,102,.22)':'rgba(178,82,92,.30)'],['M148 -148L250 -46C228 -70 192 -66 176 -24Z','rgba(7,0,18,.46)'],['M148 -148L106 -6C90 -22 60 -20 44 12Z','rgba(7,0,18,.3)']].forEach(([d2,col])=>{c.fillStyle=col;c.fill(new Path2D(d2))});c.restore();
  c.lineCap='round';c.lineJoin='round';
  [['M0 -6L70 -96L148 -148L330 -178',11],['M148 -148Q245 -130 322 -84',5.5],['M148 -148Q220 -110 250 -46',5],['M148 -148Q170 -90 176 -24',4.5],['M148 -148Q120 -90 106 -6',4]].forEach(([o,w])=>{const q=new Path2D(o);c.strokeStyle='#1a0820';c.lineWidth=w;c.stroke(q);c.strokeStyle=loin?'rgba(200,100,90,.35)':'rgba(240,140,100,.55)';c.lineWidth=w*.25;c.stroke(q)});
  [['M140 -146L146 -176L158 -150Z'],['M326 -178L352 -170L328 -166Z']].forEach(([o])=>{c.fillStyle='#2c1534';c.fill(new Path2D(o))});
  const f=new Path2D('M20 -4L52 -42L62 -34L92 -80M52 -42L66 -18');c.shadowColor='#ff4a12';c.shadowBlur=9*FD_WK;c.strokeStyle='#e9561b';c.lineWidth=2;c.stroke(f);c.shadowBlur=0;c.strokeStyle='#ffc27a';c.lineWidth=.72;c.stroke(f);
  return FD_WS[k]={e};
}
function drawWing(S,ang,sc,col,wo0,fire,side){
  const wo=Math.max(.001,wo0),sp=fdWingSprite(col==='#2a0c14'||col==='#220a11');
  ctx.save();ctx.translate(S[0],S[1]);ctx.scale(side||1,1);ctx.rotate(ang);ctx.scale(wo*sc,wo*sc);
  ctx.drawImage(sp.e,-10,-194,380,250);
  if(fire){const tw=R?R.time:Q?Q.time:G.time;[[148,-148],[330,-178],[322,-84],[250,-46],[176,-24]].forEach((q,j)=>qflame(q[0],q[1]+6,9,34+8*Math.sin(tw*9+j),j,j%2?'rgba(255,190,90,.85)':'rgba(255,100,40,.85)'))}
  ctx.restore();
}

/* ===== Le Colosse en vol : le même qu'en phase I (COLOSSE, lot 2) avec ailes, griffes aux deux mains, boule en bandoulière ; la queue garde la longueur de la phase I ===== */
/* es du jeu n'est pas borné (hors de 0 à 1 il explose) : tout lissage de ce fichier passe par fdE */
const fdE=u=>es(clamp01(u));
const FD_S=.85;            /* échelle de pose : le cœur du Colosse reste à (Q.bx-17, Q.by), comme les cibles du jeu */
const FD_HAM={P:[94,-256],a:-62,g:50,wN:0,wF:0,s:1,r:1}; /* masse dans le dos, boule en bandoulière */
const QR={q:null,kind:'',cr:0,rg:0,cnO:null,geo:null,front:null,coeur:null};
/* courbe par morceaux, adoucie : K = [[temps, valeur], ...] */
function fdKv(x,K){if(x<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++)if(x<=K[i][0])return K[i-1][1]+(K[i][1]-K[i-1][1])*fdE((x-K[i-1][0])/(K[i][0]-K[i-1][0]));return K[K.length-1][1]}
/* mémoire de l'attaque qui précède une riposte (Q.atk est vidé avant Q.cn) */
function fdRec(){
  if(QR.q!==Q){QR.q=Q;QR.kind='';QR.cr=0;QR.rg=0;QR.cnO=null;QR.geo=null;QR.rel={}}
  const a=Q.atk;if(a)QR.kind=a.kind; /* la riposte dépend de l'attaque initiale (a.kind), jamais de la queue qui la termine */
  /* riposte qui termine une rage : le numéro de la rage vient de la logique (Q.cn.rg) ; le dernier assaut garde la riposte ordinaire */
  const c=Q.cn;
  if(c&&QR.cnO!==c)QR.cnO=c;
  else if(!c&&QR.cnO){if(QR.rg)QR.cr=Math.min(2,QR.rg);QR.cnO=null}
  QR.rg=c?(c.rg||0):0;
}
/* ===== Le creuset du palan et les ripostes de fin de rage (maquette fonderie-creuset-reference-v4, scènes FS[5] et FS[6]) =====
   Fin de la 1re rage : le creuset avance, cogne le Colosse, le rayon sectionne un câble, la lave se verse sur lui ; le creuset revient vide, pendu à un seul câble.
   Fin de la 2e rage (Difficile) : le creuset vide arrive en pendouillant, le cogne, le rayon coupe le dernier câble, il lui tombe sur la tête et sombre avec lui.
   L'animation de la maquette (6 s) est resserrée dans la durée de la riposte du jeu (fdRef) ; dégâts, fenêtres et durées du jeu ne changent pas.
   Etat du creuset (QR.cr) : 0 plein au repos, 1 vide à un seul câble, 2 absent (reste le chariot et les bouts de chaîne) ; remis à neuf quand la phase recommence. */
const FD_XB=800; /* abscisse du chariot quand il cogne le Colosse (repère monde) */
const fdFY=()=>QFLOOR-592*FD.ZW;
const fdW=p=>[p[0]/FD.ZW,(p[1]-fdFY())/FD.ZW];
const fdG=p=>[p[0]*FD.ZW,fdFY()+p[1]*FD.ZW];
const fdLV=()=>(QLAKE-fdFY())/FD.ZW;
function fdCuve(c,plein){
  fdP(c,[[-66,-42],[66,-42],[50,46],[34,60],[-34,60],[-50,46]],'#4a2142');fdP(c,[[-66,-42],[-34,-42],[-24,60],[-34,60],[-50,46]],'rgba(255,150,100,.45)');fdP(c,[[34,-42],[66,-42],[50,46],[34,60],[24,60]],'rgba(20,6,26,.4)');
  [-24,22].forEach(y=>{fdR(c,-62+(y+42)*.17,y,124-(y+42)*.34,11,'#2a1232');fdR(c,-62+(y+42)*.17,y,124-(y+42)*.34,3,FD_BORD);[-34,0,34].forEach(x=>fdRiv(c,x,y+6,3,'#c8786a'))});
  fdR(c,-74,-54,148,13,'#33173a');fdR(c,-74,-54,148,4,FD_BORD);fdP(c,[[-74,-54],[-96,-44],[-74,-41]],'#33173a');
  if(plein){fdP(c,[[-90,-46],[-66,-56],[58,-56],[42,-48],[-60,-47]],'#ffc060');fdP(c,[[-60,-53],[40,-53],[26,-49],[-48,-49]],'#ffecb4')}
}
function fdLien(c,a,b){fdChaine(c,[a,[a[0]+(b[0]-a[0])/3,a[1]+(b[1]-a[1])/3],[a[0]+(b[0]-a[0])*2/3,a[1]+(b[1]-a[1])*2/3],b],Math.max(2,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/13)),9,'#5a3250','rgba(255,170,120,.85)')}
/* coulée du creuset plein dans la lave (repos seulement) */
function fdFilet(c,t){
  colGlow(c,514,300,90,'255,160,80',.55);
  [[11,'#d4602c'],[7,'#ff9a45'],[3,'#ffe6a8']].forEach(([w,col],j)=>{const p=[],q=[];for(let i=0;i<=14;i++){const u=i/14,x=502-46*Math.sqrt(u)+Math.sin(i*1.4-t*9+j)*1.6,y=292+(568-292)*u,ww=w*(1-u*.25);p.push([x-ww,y]);q.push([x+ww,y])}fdP(c,[...p,...q.reverse()],col)});
  [[44,7,'#ff9a45'],[24,4.5,'#ffe6a8']].forEach(([rx,ry,col])=>{c.fillStyle=col;c.beginPath();c.ellipse(456,568,rx+Math.sin(t*11)*3,ry,0,0,6.283);c.fill()});
  for(let i=0;i<9;i++){const u=(t*1.3+i*.11)%1,x=456+(i-4)*9*u,y=568-Math.sin(u*Math.PI)*(18+(i%3)*13);fdP(c,[[x,y-4],[x+3,y],[x,y+3],[x-3,y]],i%2?'#ffe08a':'#ff9a35')}
}
/* géométrie du chariot, des câbles et du creuset, scène 1 (t = temps de la maquette ; sw = balancement au repos) */
function fdCr1(t,sw){
  const B_=1.75,T=2.55,Y=300,S=.86;
  const X=fdKv(t,[[0,584],[1.05,584],[1.2,566],[B_,FD_XB],[B_+.2,FD_XB-26],[B_+.5,FD_XB],[4.2,FD_XB],[5.1,584]]);
  const bal=fdKv(t,[[0,-.3],[1.05,-.3],[1.2,-.12],[1.5,-.5],[B_,.24],[B_+.25,-.16],[B_+.48,.08],[T,0]]);
  const P=[X+52,Y-46],w=t-T,e=fdE((t-4.2)/.7);
  const tour=w>0?(-1.95*fdE(w/.32)+(w>.32?.24*Math.sin((w-.32)*8)*Math.exp(-(w-.32)*1.8):0))*(1-e)+(-.85+.22*Math.sin((t-4.2)*5.5)*Math.exp(-Math.max(0,t-4.2)*1.1)+(sw||0))*e:0;
  const rot=(x,y,a)=>[P[0]+(x-P[0])*Math.cos(a)-(y-P[1])*Math.sin(a),P[1]+(x-P[0])*Math.sin(a)+(y-P[1])*Math.cos(a)];
  const G_=rot(X-52,Y-46,tour),C=rot(X,Y,tour),bord=(dx,dy)=>[X+dx*Math.cos(bal)-dy*Math.sin(bal),Y+dx*Math.sin(bal)+dy*Math.cos(bal)];
  const A=[X-48,175],Bp=[X+48,175],cab=[[Bp,w<0?bord(52,-46):P,1]];
  if(w<0)cab.push([A,bord(-52,-46),1]);else{const s_=Math.sin(w*9)*.5*Math.exp(-w*1.5);cab.push([A,[X-48+Math.sin(s_)*34,175+Math.cos(s_)*34],0]);cab.push([G_,[G_[0],G_[1]+34],0])}
  return {X,Y,cab,cuve:{C,ang:w<0?bal:tour,S,plein:w<.4},devant:t>1.1&&t<90,filet:0,bec:rot(X-66*S-12,Y-40,tour),bump:[X+58,Y+6],cut:[X-50,Y-68]};
}
/* scène 2 : le creuset vide pend à un seul câble, arrive en pendouillant, cogne ; le rayon coupe le câble */
function fdCr2(t){
  const B_=1.75,T=2.5,S=.86;
  const X=fdKv(t,[[0,584],[1,584],[1.2,552],[B_,FD_XB],[B_+.22,FD_XB-30],[B_+.55,FD_XB]]);
  const phi=fdKv(t,[[0,0],[1,0],[1.2,.12],[1.45,-.55],[B_,.34],[B_+.25,-.2],[B_+.5,.1],[T,0]])+(t<1?.05*Math.sin(t*3.1):0);
  const Bp=[X+48,175],A=[X-48,175],P=[Bp[0]+Math.sin(phi)*102,Bp[1]+Math.cos(phi)*102],pend=-.85-phi;
  const centre=a=>[P[0]-52*Math.cos(a)-46*Math.sin(a),P[1]-52*Math.sin(a)+46*Math.cos(a)];
  const cab=[[A,[A[0],209],0],[Bp,t<T?P:[Bp[0]+Math.sin((t-T)*9)*8*Math.exp(-(t-T)*1.5),211],t<T?1:0]];
  return {X,Y:300,cab,cuve:t<T?{C:centre(pend),ang:pend,S,plein:false}:null,devant:t>1.1&&t<90,filet:0,centre,pend,bump:[X+58,306],cut:[X+49,219]};
}
function fdCrGeo(tt){
  if(QR.rg&&Q.cn)return QR.rg===1?fdCr1(fdRef(Q.cn)):fdCr2(fdRef(Q.cn));
  if(QR.cr===0){const g=fdCr1(0);g.filet=1;return g}
  return QR.cr===1?fdCr1(99,.02*Math.sin(tt*1.3)):fdCr2(99);
}
function fdCrDraw(c,g){
  const X=g.X;
  /* chariot : à cheval sur le rail (galets sur la semelle haute, deux flasques devant la poutre), caisson sous la poutre où les câbles s'attachent */
  [-40,40].forEach(d=>{fdRiv(c,X+d,92,9,'#2a1230');fdRiv(c,X+d,92,3,'#c8786a')});
  fdR(c,X-56,98,112,6,'#4a2448');[-56,48].forEach(d=>{fdR(c,X+d,98,8,66,'#4a2448');fdR(c,X+d,98,3,66,FD_BORD)});
  fdR(c,X-70,153,140,24,'#4a2448');fdR(c,X-70,153,140,5,FD_BORD);[-48,48].forEach(d=>{fdRiv(c,X+d,172,11,'#2a1230');fdRiv(c,X+d,172,4,'#c8786a')});
  g.cab.forEach(([a,b,riv])=>{fdLien(c,a,b);if(riv)fdRiv(c,b[0],b[1],8,'#1c0a22')});
  if(g.cuve){const q=g.cuve;c.save();c.translate(q.C[0],q.C[1]);c.rotate(q.ang);c.scale(q.S,q.S);fdCuve(c,q.plein);c.restore()}
}
/* derrière le Colosse : le chariot (un seul, sur le rail), ses câbles, le creuset s'il y est, sa coulée tant qu'il est plein */
function fdCrBack(c,t){const g=QR.geo||fdCr1(0);if(g.filet>0)fdFilet(c,t);if(!g.devant)fdCrDraw(c,g)}
/* temps de la maquette (s) pour la riposte en cours : en temps réel, la maquette démarre à 1,05 s (DG.rip : éclat de dégât à 2,8 s / 2,85 s de la maquette) */
function fdRef(c){return c.t+1.05}
/* pose du Colosse pendant ces deux ripostes (dy en pixels écran) */
function fdPoseRip(o,c){
  const t=fdRef(c),ch=COLFX.choc,B_=1.75;
  const bas=fdE((t-B_)/.26),tt=reduce?0:Q.time;
  if(QR.rg===1){
    const T=2.55,V=2.8,h=fdE((t-V)/.22)*(1-fdE((t-5)/.7)),froid=fdE((t-V-.1)/.5),leve=fdE((t-5)/.7);
    o.rage=1-froid;o.rageF=.8*(1-froid);o.fissure=Math.max(o.fissure*(1-froid),ch(t,V,1.4,.35));
    o.dy+=130*bas*(1-leve)+24*h-16*ch(t,B_,.3,.05);o.dx+=14*h+34*ch(t,B_,.55,.1);
    o.lean=.36*h+.2*ch(t,B_,.6,.1);o.tete=.5*h+.3*ch(t,B_,.6,.1)+(t>V&&t<V+1?Math.sin(tt*38)*.03*(1-(t-V)):0);
    o.flap=-.5*h;o.wA=-.85*h;o.wS=1-.1*h;o.off=[-62+28*h,92];o.nn=[0,-12*h];o.griffe=.55;
    o.eteint=.5*froid*(1-leve);o.flash=t>V&&t<V+.07?.5:0;
  }else{
    const T=2.5,V=2.85,h=fdE((t-V)/.2)*(1-fdE((t-4.85)/.8)),enf=fdE((t-V)/.55)*(1-fdE((t-4.75)/.9)),leve=fdE((t-5.05)/.8),froid=fdE((t-V-.1)/.5);
    o.rage=1-froid;o.rageF=.8*(1-froid);o.fissure=Math.max(o.fissure*(1-froid),ch(t,V,1.5,.4));
    o.dy+=130*bas*(1-leve)+75*enf-16*ch(t,B_,.3,.05);o.dx+=16*h+40*ch(t,B_,.8,.1);
    o.lean=.42*h+.24*ch(t,B_,.8,.1);o.tete=.62*h+.34*ch(t,B_,.8,.1)+(t>V&&t<V+1.1?Math.sin(tt*38)*.035*(1.1-(t-V)):0);
    o.flap=-.65*h;o.wA=-1*h;o.wS=1-.14*h;o.off=[-62+36*h,92+8*h];o.nn=[-8*h,-4*h];o.griffe=.55;
    o.eteint=.45*h;o.flash=t>V&&t<V+.08?.65:0;
  }
}
/* effets de la riposte (repère monde de la maquette) */
function fdRayon(c,from,to,u,big){if(u<=0||u>=1)return;const a=u<.7?1:1-(u-.7)/.3,l=Math.min(1,u/.12),x=from[0]+(to[0]-from[0])*l,y=from[1]+(to[1]-from[1])*l,dx=x-from[0],dy=y-from[1],L=Math.hypot(dx,dy)||1,n=[-dy/L,dx/L];c.save();c.globalAlpha=a;
  [[26,'rgba(255,214,110,.5)'],[16,'#ffe9a0'],[7,'#fffbea']].forEach(([w,col])=>{w*=big;COLFX.poly(c,[[from[0]+n[0]*3,from[1]+n[1]*3],[x+n[0]*w,y+n[1]*w],[x-n[0]*w,y-n[1]*w],[from[0]-n[0]*3,from[1]-n[1]*3]],col)});COLFX.etoile(c,from[0],from[1],26*big,8,u*9,'#fffbea',.4);c.restore()}
function fdCharge(c,u,t,LF){if(u<=0||u>=1)return;COLFX.etoile(c,LF[0],LF[1],14+30*u,10,t*8,'rgba(255,214,110,.75)',.5);COLFX.etoile(c,LF[0],LF[1],8+14*u,8,-t*9,'#fffbea')}
function fdFume(c,x,y,u,n,seed,col){if(u<0)return;const r=fdRnd(seed);for(let i=0;i<n;i++){const v=u-i*.06;if(v<0||v>.9)continue;const px=x+(r()-.5)*50+v*18,py=y-v*120,rr=8+v*28;c.fillStyle='rgba('+col+','+(.85-v*.9)+')';c.beginPath();c.arc(px,py,rr,0,6.283);c.fill()}}
function fdFx1(c,t,tt,g,F,K,LF){
  const B_=1.75,T=2.55,V=2.8,X=g.X,Y=g.Y,LV=fdLV(),ec=reduce?()=>{}:COLFX.eclats,fu=reduce?()=>{}:fdFume,leve=fdE((t-5)/.7),w=t-T,ip=g.bump,cut=g.cut;
  if(t>1.3&&t<B_)for(let j=-1;j<=1;j++)fdEnt(c,X-170,Y+j*30,X-84,Y+j*28,5,'rgba(255,200,160,.55)');
  const v_=t-B_;if(v_>0&&v_<.26){COLFX.etoile(c,ip[0],ip[1],105*(1-v_*3),11,.3,'#ffe9a0',.38);COLFX.etoile(c,ip[0],ip[1],48*(1-v_*3),9,.4,'#fffbea',.4)}ec(c,ip[0],ip[1],v_,20,['#f0b49a','#ff9a35','#ffe08a'],400,90,LV+30,520);
  fdCharge(c,(t-2.05)/.45,tt,LF);fdRayon(c,LF,cut,(t-T+.05)/.4,.9);
  if(w>0&&w<.3)COLFX.etoile(c,cut[0],cut[1],56*(1-w*3),9,.3,'#ffe9a0',.4);ec(c,cut[0],cut[1],w,14,['#8a5260','#f0b49a','#ffe08a'],300,91,LV+30,520);
  /* la fonte : une nappe qui part du bec et s'écrase sur le Colosse */
  const u=t-T-.12,fin=Math.min(1,Math.max(0,(t-4.0)/.35));
  if(u>0&&fin<1){const bec=g.bec,cib=[F[0]-6,F[1]+10],th=Math.min(1,u/.16);
    [[46,'#d4501f'],[33,'#ff9a35'],[16,'#ffe6a8']].forEach(([ww,col],j)=>{const p=[],q=[];for(let i=0;i<=12;i++){const v=fin+(th-fin)*i/12,x=bec[0]+(cib[0]-bec[0])*Math.sqrt(v)+Math.sin(i*1.3-tt*17+j)*3,y=bec[1]+(cib[1]-bec[1])*v,l=ww*(.6+.65*v)*(1-fin*.6);p.push([x-l,y]);q.push([x+l,y])}COLFX.poly(c,[...p,...q.reverse()],col)})}
  /* nappes sur la tête et les épaules, puis croûte qui éclate quand il se redresse */
  const v=t-V;if(v>0){const a=1-leve,gel=fdE((v-.6)/.9),coul=gel<.5?'#ff9a35':'#3a2438',cl2=gel<.5?'#ffe6a8':'#6a4256',dr=fdE(v/1.1);c.save();c.globalAlpha=a;
    [[F,1],[[K[0]-92,K[1]-52],.7],[[K[0]+104,K[1]-46],.75]].forEach(([p,m],j)=>{const x=p[0],y=p[1],e=fdE((v-j*.07)/.25)*m;if(e<=0)return;
      COLFX.poly(c,[[x-48*e,y+8],[x-26*e,y-12*e],[x+8,y-17*e],[x+40*e,y-6*e],[x+52*e,y+12],[x+30*e,y+16+30*dr*e],[x+22*e,y+10],[x+4,y+18+62*dr*e],[x-8*e,y+12],[x-28*e,y+14+38*dr*e],[x-34*e,y+8]],coul);
      COLFX.poly(c,[[x-26*e,y-8*e],[x+8,y-14*e],[x+30*e,y-4*e],[x+2,y-2]],cl2)});c.restore();
    if(v<.25)COLFX.etoile(c,F[0],F[1],120*(1-v*2.6),12,tt*3,'#ffe9a0',.4);
    ec(c,F[0],F[1],v,34,['#ffe08a','#ff9a35','#d4501f'],460,93,LV+30,640);ec(c,F[0],F[1],v-.25,24,['#ff9a35','#d4501f'],360,94,LV+30,640);
    fu(c,F[0],F[1]-20,v-.45,9,41,'150,120,140');fu(c,K[0]+60,K[1],v-.8,8,42,'120,96,130')}
  if(t>5){ec(c,F[0],F[1],t-5,22,['#3a2438','#6a4256','#ff9a35'],320,95,LV+30,520);ec(c,K[0],K[1]-40,t-5.08,22,['#3a2438','#6a4256'],300,96,LV+30,520)}
}
function fdFx2(c,t,tt,g,F0,K,LF){
  const B_=1.75,T=2.5,V=2.85,Q_=3.85,X=g.X,LV=fdLV(),ec=reduce?()=>{}:COLFX.eclats,fu=reduce?()=>{}:fdFume,ip=g.bump,cut=g.cut,F=[F0[0]+4,F0[1]-26],H=g.centre(g.pend);
  let C=H,ang=g.pend;
  if(t>=T&&t<V){const u=(t-T)/(V-T);C=[H[0]+(F[0]-H[0])*u,H[1]+(F[1]-H[1])*u*u];ang=g.pend+(-2.85-g.pend)*(u*u*.4+u*.6)}
  else if(t>=V&&t<Q_){const r=t-V;C=[F[0],F[1]-26*Math.sin(Math.min(1,r/.3)*Math.PI)];ang=-2.85+.28*Math.sin(r*11)*Math.exp(-r*3)}
  else if(t>=Q_){const u=Math.min(1,(t-Q_)/.5),v=Math.min(1,Math.max(0,(t-Q_-.5)/.9));C=[F[0]-190*fdE(u)-14*v,F[1]+(LV-6-F[1])*u*u+110*v*v];ang=-2.85-1.5*u-.35*v}
  if(t>=T&&t<V)for(let j=-1;j<=1;j++)fdEnt(c,C[0]+j*30,C[1]-120,C[0]+j*28,C[1]-52,5,'rgba(255,200,160,.55)');
  if(t>1.3&&t<B_)for(let j=-1;j<=1;j++)fdEnt(c,X-170,300+j*30,X-80,300+j*28,5,'rgba(255,200,160,.55)');
  const v_=t-B_;if(v_>0&&v_<.26){COLFX.etoile(c,ip[0],ip[1],115*(1-v_*3),11,.3,'#ffe9a0',.38);COLFX.etoile(c,ip[0],ip[1],52*(1-v_*3),9,.4,'#fffbea',.4)}ec(c,ip[0],ip[1],v_,22,['#f0b49a','#ff9a35','#ffe08a'],420,190,LV+30,520);
  if(t>=T&&t<Q_+1.4){c.save();if(t>Q_+.3){c.beginPath();c.rect(-40,-80,1400,LV+80+8);c.clip()}c.translate(C[0],C[1]);c.rotate(ang);c.scale(.86,.86);fdCuve(c,false);c.restore()}
  fdCharge(c,(t-2.0)/.45,tt,LF);fdRayon(c,LF,cut,(t-T+.05)/.34,.9);
  if(t>=T&&t<T+.3)COLFX.etoile(c,cut[0],cut[1],50*(1-(t-T)*3),9,.3,'#ffe9a0',.4);ec(c,cut[0],cut[1]+2,t-T,14,['#8a5260','#f0b49a','#ffe08a'],300,191,LV+30,520);
  const v=t-V;if(v>0){if(v<.28){COLFX.etoile(c,F[0],F[1],170*(1-v*2.4),12,tt*2,'#ffe9a0',.38);COLFX.etoile(c,F[0],F[1]+20,80*(1-v*2.6),9,.4,'#fffbea',.4)}
    ec(c,F[0],F[1]+20,v,38,['#8a5260','#4a2142','#ff9a35','#ffe08a'],520,193,LV+30,700);fu(c,F[0]-60,F[1]+30,v-.05,7,51,'130,90,100');fu(c,F[0]+60,F[1]+30,v-.1,7,52,'130,90,100');
    for(let j=0;j<5;j++){const u=(v-.12-j*.05)/.75;if(u>0&&u<1){const x=K[0]-130+j*70;COLFX.poly(c,[[x-22,LV+8],[x+(j-2)*36*(1+u),LV-(170-Math.abs(j-2)*40)*Math.sin(u*Math.PI)],[x+22,LV+8]],j%2?'#ff9a35':'#d4501f')}}
    ec(c,K[0],LV,v-.15,30,['#ffe08a','#ff9a35','#d4501f'],460,194,LV+10,700)}
  const q=t-Q_-.45;if(q>0){const x=F[0]-195;for(let j=0;j<3;j++){const u=(q-j*.04)/.6;if(u>0&&u<1)COLFX.poly(c,[[x-18,LV+8],[x+(j-1)*50*(1+u),LV-(150-Math.abs(j-1)*50)*Math.sin(u*Math.PI)],[x+18,LV+8]],j%2?'#ff9a35':'#d4501f')}
    ec(c,x,LV,q,22,['#ffe08a','#ff9a35'],360,195,LV+10,700)}
}
/* croissant de lumière : arc extérieur et arc intérieur décalé vers l'arrière (a : sens du déplacement, R : rayon, ep : épaisseur relative) */
function fdCroissant(c,x,y,a,R,col,ep){const p=[];for(let i=0;i<=10;i++){const q=a-1.15+2.3*i/10;p.push([x+Math.cos(q)*R,y+Math.sin(q)*R])}
  const bx=x-Math.cos(a)*R*ep,by=y-Math.sin(a)*R*ep;for(let i=10;i>=0;i--){const q=a-1.15+2.3*i/10;p.push([bx+Math.cos(q)*R*.78,by+Math.sin(q)*R*.78])}COLFX.poly(c,p,col)}
function fdRipFx(){
  const c0=Q.cn,g=QR.geo;if(!c0||!QR.rg||!g||!QR.front)return;
  const t=fdRef(c0),tt=reduce?0:Q.time;
  ctx.save();ctx.translate(0,fdFY());ctx.scale(FD.ZW,FD.ZW);
  if(g.devant)fdCrDraw(ctx,g);
  const F=fdW([QR.front[0],QR.front[1]]),K=fdW(QR.coeur),LF=fdW(qSwordTip());
  if(QR.rg===1)fdFx1(ctx,t,tt,g,F,K,LF);else fdFx2(ctx,t,tt,g,F,K,LF);
  ctx.restore();
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
  const o={lean:Math.sin(tt*1.7)*.03,drop:2*Math.sin(tt*2.1),sx:1,dF:0,dN:0,off:[-62,92],nn:[0,0],tete:0,plie:0,dx:0,dy:0,jaw:0,griffe:.55,rage:0,fissure:0,flash:0,eteint:0,held:null,heldK:1,rot:0,flap:0,rageF:0,tornade:0,wA:0,wS:1};
  if(Q.enraged){o.fissure=.4;o.rage=.45;o.rageF=.55}
  /* au repos il vit : il respire, tourne la tête, bouge les mains et les griffes, les ailes battent doucement */
  {const br=Math.sin(tt*1.9),sw=Math.sin(tt*1.15);o.sx=1+.012*br;o.dN=3*br;o.dF=-2.5*br;o.tete=.05*sw+.03*Math.sin(tt*2.7);
   o.off[0]+=4*Math.sin(tt*1.3);o.off[1]+=5*Math.sin(tt*1.7);o.nn[0]+=3*Math.sin(tt*1.5+1);o.nn[1]+=4*Math.sin(tt*1.9+2);o.griffe=.55+.1*Math.sin(tt*2.3);o.flap=.9*Math.sin(tt*2.4);o.drop=2*Math.sin(tt*2.1)+2.5*Math.sin(tt*2.4+1.2)}
  const hand=(side,x,y)=>{if(side==='A'){o.off[0]+=x;o.off[1]+=y}else{o.nn[0]+=x;o.nn[1]+=y}};
  if(a&&a.kind==='claws'){
    /* il fond sur le bloc, une main après l'autre : repli, coup, retour */
    /* chaque coup agit sur sa main ; le corps suit la plus forte des élans en cours (max continu : jamais de saut quand deux coups se recouvrent) */
    let S=0,Pl=0;
    a.hits.forEach((h,i)=>{if(!h.k.startsWith('claw'))return;const d=a.t-h.at,v=fdKv(d,[[-.9,0],[-.55,-.4],[-.3,-.5],[0,1],[.35,.25],[.75,0]]),p=Math.max(0,-v),s=Math.max(0,v);
      S=Math.max(S,s);Pl=Math.max(Pl,p);
      if(i%2===0)hand('A',-60*s+80*p,-60*s-200*p);else hand('B',-130*s+16*p,-70*s-150*p)});
    o.dx=-230*S+30*Pl;o.dy=10*S;o.lean=-.34*S+.26*Pl;o.tete=.2*S;o.griffe=.55+.75*Math.max(S,Pl);
  }else if(a&&a.kind==='wings'){
    /* il se ramasse, lève les ailes, les rabat : le corps suit chaque coup */
    const ws=a.hits.filter(h=>h.k==='wave');let sl=0;ws.forEach(h=>{const d=(a.t-(h.at-.55))/.16;sl=Math.max(sl,Math.exp(-d*d))});
    const up=fdKv(a.t,[[0,0],[.5,1],[ws[ws.length-1].at-.2,1],[ws[ws.length-1].at+.4,0]]);
    o.lean=.1*up-.2*sl;o.dx=-34*sl;o.flap=-.4*up;o.off=[-40,66];o.nn=[30,-30];
  }else if(a&&a.kind==='rocks'){
    /* une main arrache le bloc, le brandit, le lance */
    a.hits.forEach((h,i)=>{if(h.k!=='rock')return;const side=i%2?'B':'A',ts=h.at-1.0,te=h.at-.45,u=a.t;
      let k=0,f=0;if(u>=ts-.3&&u<te){k=fdE((u-(ts-.3))/.3);f=1}else if(u>=te&&u<te+.15)k=1-.4*((u-te)/.15);else if(u>=te+.15&&u<te+.55)k=.6*(1-fdE((u-te-.15)/.4));
      const th=u>=te&&u<te+.15?(u-te)/.15:u>=te+.15?1:0;
      if(k>0){hand(side,side==='A'?(-20-110*th)*k:(-50-110*th)*k,(-200+100*th)*k);o.lean+=(.14-.3*th)*k*.6;o.dx-=18*th*k}
      if(f&&u<te){o.held=side;o.heldK=fdE((u-(ts-.3))/.25)}});
  }else if(a&&a.kind==='roar'){
    const cri=fdE((a.t-.15)/.2)*(1-fdE((a.t-(a.end-.3))/.3));
    o.jaw=14;o.lean=.17*cri;o.tete=.3*cri;o.sx=1+.07*cri;o.off=[-92,40];o.nn=[46,-62];o.flap=.8*cri;o.griffe=.9;
  }
  if(b.s==='rage'){
    const mont=fdE(b.t/.5),cri=fdE((b.t-.5)/.18)*(1-fdE((b.t-(b.dur-.45))/.4));
    o.plie=.5*mont*(1-fdE((b.t-.45)/.15));o.lean=-.16*mont*(1-cri)+.17*cri;o.tete=-.2*mont*(1-cri)+.3*cri;o.sx=1+.08*cri;o.jaw=14*cri;
    o.rage=fdE(b.t/.7);o.fissure=Math.max(o.fissure,o.rage);o.rageF=fdE((b.t-.45)/.25)*(1-.45*fdE((b.t-(b.dur-.4))/.4));
    o.off=[-62-30*cri,92-52*cri];o.nn=[34*cri,-56*cri];o.griffe=.55+.6*cri;
    o.tornade=fdE((b.t-.5)/.6)*(1-fdE((b.t-b.dur+.3)/.4));
  }
  if(c&&QR.rg)fdPoseRip(o,c);
  else if(c){
    /* riposte : le Colosse encaisse (même courbe que la phase I : montée en 80 ms, tenue, retour) */
    const hitT=c.k==='final'?1.55:{stab:.35,head:.55,beam:.85}[c.k],ch=COLFX.choc(c.t,hitT,c.k==='final'?1.2:.8,c.k==='final'?.7:.35),k=c.k==='final'?1.4:1;
    o.dx+=46*ch*k;o.dy+=14*ch*k;o.tete+=.34*ch*k;o.lean+=.2*ch*k;o.flash=c.t>hitT&&c.t<hitT+.07?.45:0;o.fissure=Math.max(o.fissure,COLFX.choc(c.t,hitT,1.1,.5)*(c.k==='final'?1:.7));
    hand('A',8*ch,10*ch);hand('B',30*ch,40*ch);
    if(c.k==='final'){const ex=fdE((c.t-1.55)/.5);o.fissure=Math.max(o.fissure,ex);o.eteint=fdE((c.t-2.6)/.5);o.flap=-.4*fdE((c.t-2.3)/.6);
      /* sensation de dégât : il tremble, clignote, ses ailes claquent */
      const tr=COLFX.choc(c.t,1.55,1.3,.4);o.dx+=(reduce?0:Math.sin(c.t*70)*8*tr);o.dy+=reduce?0:Math.cos(c.t*63)*5*tr;if(c.t>1.6&&c.t<2.3&&Math.floor(c.t*9)%2)o.flash=Math.max(o.flash,.28);o.flap=-.9*tr;o.rageF=Math.max(o.rageF,.9*tr)}
  }
  if(Q.mode==='intro'){
    const t=Q.t,e=eo(clamp01(t/2.0));
    o.lean=-.16*(1-e);o.dy+=0;o.wA=-.12+.5*Math.sin(t*(11-3.5*clamp01(t/2.4)))*(1-clamp01((t-2.2)/.6));o.off=[-30,50];o.nn=[40,-30];o.griffe=.9;o.jaw=t>1.3&&t<1.9?14:0;o.tete=-.2*(1-e);o.rageF=.5*(1-e);
  }
  if(Q.mode==='lake'){
    /* fin : il plonge ailes repliées, légèrement penché ; il se pose doucement dans la lave (genoux fléchis) ; puis il se redresse, déploie les ailes et repart */
    const lt=Q.lt,sp=Q.splash,d=sp?lt-sp:0,fall=fdE(lt/1.4),e=Math.max(0,d-1.0);
    o.rot=-.45*fall*(1-fdE(d/.5)); /* il se redresse au contact : il s'enfonce debout, pas de travers */{const k=fdE(d/.4);o.wA=(-.35*(1-k)-.5*k)*fall*(1-fdE(e/.5))+(sp?0:.08*fall*Math.sin(tt*14))} /* en tombant les ailes se lèvent et frémissent ; elles se replient au contact */o.flap=Math.sin(tt*10)*.6*fdE((e-.15)/.3);
    o.plie=.3*fdE(d/.3)*(1-fdE((d-.6)/.4));o.eteint=.3*fall*(1-fdE(e/.4));
    o.fissure=1;o.rage=.5+.5*fdE(e/.5);o.rageF=Math.max(.3*fall,.8*fdE(e/.5));o.tete=.1*fall-.3*fdE(e/.6);o.griffe=.55;
    o.off=[-40,70];o.nn=[10,-10];
  }
  return o;
}
/* flamme qui part vers le bas (traînée d'un corps qui monte) */
function fdFlameDown(c,x,y,w,h,l,ph,a){c.save();c.translate(x,y);c.rotate(3.14159);COLFX.flamme(c,0,0,w,h,l,ph,a);c.restore()}
/* plaques d'armure arrachées par le coup ultime : elles volent, tournent et retombent */
function fdPlates(c,cx,cy,u){if(u<=0||u>=1)return;c.save();c.globalAlpha=1-u*u;
  for(let i=0;i<8;i++){const a=i*.8+.3,v=230+(i%3)*70,x=cx+Math.cos(a)*v*u,y=cy+Math.sin(a)*v*u*.8+640*u*u,r=a+u*(i%2?9:-9),L=12+(i%3)*5;
    COLFX.poly(c,[[x+Math.cos(r)*L,y+Math.sin(r)*L],[x+Math.cos(r+1.9)*L*.8,y+Math.sin(r+1.9)*L*.8],[x+Math.cos(r+3.5)*L,y+Math.sin(r+3.5)*L],[x+Math.cos(r+5)*L*.6,y+Math.sin(r+5)*L*.6]],'#2a1230');
    COLFX.poly(c,[[x+Math.cos(r)*L,y+Math.sin(r)*L],[x+Math.cos(r+1.9)*L*.8,y+Math.sin(r+1.9)*L*.8],[x,y]],'#ff9a35')}
  c.restore()}
/* le Colosse et son monde : entrée (descente en battant des ailes, traînée de feu, souffle des ailes, atterrissage du Veilleur), chute (traînée, éclaboussure de lave, vapeur),
   sortie (jaillissement du four, colonnes de feu, traînée vers la cheminée). Aplats nets, aucun flou ; mouvement réduit : pas d'éclats. */
function fdBossFx(P,X0,Y0,s,tt){
  const cx=X0-20*s,cy=Y0-185*s,LV=QLAKE;
  if(Q.mode==='intro'){
    const t=Q.t,sp=1-eo(clamp01(t/2.0));
    if(sp>.03)for(let i=0;i<10;i++)COLFX.flamme(ctx,cx+(i-5)*22+Math.sin(tt*9+i)*6,cy-70-i*34*sp,16,(60+50*sp),(i%2?6:-6),tt*13+i,sp*(1-i/12));
    [.9,1.25,1.7,2.25].forEach((b,k)=>{const u=(t-b)/.45;if(u>0&&u<1&&!reduce)COLFX.eclats(ctx,cx,LV,u*.5,10,['#ff9a35','#8a4c4a'],200,41+k,LV+4,420)}); /* chaque battement soulève des braises */
    if(t>=1.35&&t<1.85){const u=(t-1.35)/.5;COLFX.etoile(ctx,cx,cy,170*(1-u*.7),14,.2,'rgba(255,214,110,.6)',.4);COLFX.etoile(ctx,cx,cy,80*(1-u),14,.5,'#fffbea',.4)}
    if(t>=2.0&&t<2.9&&!reduce){COLFX.eclats(ctx,QH[0]-10,QH[1]+46,t-2.0,16,['#8a4c4a','#3c1e30','#ff9a35'],190,31,QH[1]+50,420);fdPuff(ctx,QH[0]+10,QH[1]+46,t-2.0,6,23)}
  }
  if(Q.mode==='lake'){
    const lt=Q.lt,sp=Q.splash,d=sp?lt-sp:0;
    if(sp){
      /* contact : une seule couronne douce de gouttes de lave */
      for(let j=0;j<6;j++){const u=(d-j*.04)/.7;if(u>0&&u<1){const x=cx-90+j*36;COLFX.poly(ctx,[[x-10,LV+6],[x+(j-2.5)*14,LV-(70+(j%2)*25)*Math.sin(u*Math.PI)],[x+10,LV+6]],j%2?'#ff9a35':'#d4501f')}}
      if(d>=1.0){const e=d-1.0,k=fdE(e/.5);
        /* il ressort : une colonne de feu sous lui, la lave ruisselle de son corps, quelques flammes dans son sillage, un peu de fumée à la cheminée */
        const pa=1-fdE((e-.5)/.7),pw=60*(1-fdE(e/1.2)*.6);
        if(pa>0){ctx.save();ctx.globalAlpha=pa;COLFX.poly(ctx,[[cx-pw,LV+6],[cx-pw*.5,cy+60],[cx+pw*.5,cy+60],[cx+pw,LV+6]],'#ff9a35');COLFX.poly(ctx,[[cx-pw*.45,LV+6],[cx-pw*.2,cy+60],[cx+pw*.2,cy+60],[cx+pw*.45,LV+6]],'#ffe08a');ctx.restore()}
        for(let i=0;i<7;i++){const f=Math.min(1,e/.9),x=cx+(i-3)*24,y=cy+70+f*(110+i*12)*(i%2?1:.8),a=1-fdE((e-.2-i*.05)/.7);if(a>0&&e>i*.04){ctx.save();ctx.globalAlpha=a;COLFX.poly(ctx,[[x-4,y],[x,y-14],[x+4,y],[x,y+8]],'#ff9a35');ctx.restore()}}
        for(let i=0;i<4;i++)fdFlameDown(ctx,cx+(i-1.5)*24,Y0+20+i*12,12,70*k*(1-i/5),(i%2?5:-5),tt*13+i,k*(1-i/5));
        fdPuff(ctx,738,6,e-.6,6,77);fdPuff(ctx,722,6,e-.8,6,78)}
    }
  }
}
/* il vole : jambes pendantes qui balancent un peu, plus nettement à l'entrée */
function fdLegs(tt){const k=Q.mode==='intro'?1.6:1,w=Math.sin(tt*2.4);return {f:[-5-4*k*w,(16+6*w)*k,.05],n:[5+3*k*w,(14+6*Math.sin(tt*2.4+1))*k,-.04]}}
function drawBoss2(){
  const t=Q.time,tt=reduce?0:t,b=Q.boss,P=fdPose(),s=FD_S;
  const X0=Q.bx+17+P.dx,Y0=Q.by+185*s+P.dy;
  QR.front=[X0-40*s,Y0-248*s];QR.coeur=[X0-20*s,Y0-185*s];
  const wa=wingAngle(),fire=Q.enraged,wo=Q.mode==='intro'?1:(Q.mode==='lake'&&(!Q.splash||Q.lt-Q.splash<1.0))?(Q.splash?1-.7*fdE((Q.lt-Q.splash)/.5):1):Q.wo; /* à la chute les ailes restent ouvertes (elles se replient seulement dans la lave) */
  const T2=tailTip(),fol=1-T2.strike,tip=[(T2.tip[0]+P.dx*fol-X0)/s,(T2.tip[1]+P.dy*fol-Y0)/s];
  const R0=[30,-130];let tp=tip;
  const qP=[R0,[R0[0]+(tp[0]-R0[0])*.35,R0[1]+(tp[1]-R0[1])*.3+36*(1-T2.strike)],[R0[0]+(tp[0]-R0[0])*.7,R0[1]+(tp[1]-R0[1])*.75+58*(1-T2.strike)],tp];
    ctx.save();
  if(P.rot){const Cx=X0-20*s,Cy=Y0-185*s;ctx.translate(Cx,Cy);ctx.rotate(P.rot);ctx.translate(-Cx,-Cy)}
  if(P.rageF>.01){ctx.save();ctx.translate(X0,Y0);ctx.scale(s,s);COLFX.rageDerriere(ctx,tt,P.rageF);ctx.restore()}
  ctx.translate(X0,Y0);ctx.scale(s,s);
  COLOSSE.draw(ctx,{lean:P.lean,drop:P.drop,sx:P.sx,dF:P.dF,dN:P.dN,off:P.off,nn:P.nn,ham:FD_HAM,qP,look:-.05,eyes:Q.enraged?.5:.15,breath:tt,smoke:1,legs:fdLegs(tt),
    plie:P.plie,tete:P.tete,fissure:P.fissure,rage:P.rage,eteint:P.eteint,flash:P.flash,tip:null,sag:0,heat:0,t:tt,warm:Q.enraged?1.4:1,jaw:P.jaw,hurt:Q.recoil>.3,wound:0,
    back:applyM=>{
      ctx.save();applyM();ctx.scale(.92/s,.92/s);
      for(const sd of [-1,1]){
        drawWing([sd*55,-250],wa+.3+P.flap*.3+P.wA,.85*P.wS,'#2a0c14',wo,fire,sd);
        drawWing([sd*65,-258],wa+P.flap*.3+P.wA,P.wS,'#4a1219',wo,fire,sd);
      }
      ctx.restore()},
    front:rig=>{
      fdGriffes(ctx,rig.fa.E,rig.fa.W,P.griffe);fdGriffes(ctx,rig.na.E,rig.na.W,P.griffe);
      if(P.held){const h=P.held==='A'?rig.fa.W:rig.na.W,k=.35+.65*P.heldK;QR.rel[P.held]=[X0+h[0]*s-8,Y0+h[1]*s-26];qrock(h[0]-8,h[1]-26,30*k,tt*3,true)}
    }});
  ctx.restore();
  if(P.rageF>.01){ctx.save();ctx.translate(X0,Y0);ctx.scale(s,s);COLFX.rageSol(ctx,tt,P.rageF);ctx.restore()}
  /* rage : tornades de feu aux ailes */
  if(P.tornade>.02&&!reduce){const g=P.tornade;fdTornade(ctx,Q.bx-250,Q.by+10,170*g,38*g,t);fdTornade(ctx,Q.bx+226,Q.by-6,160*g,36*g,t+2.1)}
  else if(P.tornade>.02){const g=P.tornade;fdTornade(ctx,Q.bx-250,Q.by+10,170*g,38*g,0);fdTornade(ctx,Q.bx+226,Q.by-6,160*g,36*g,0)}
  fdBossFx(P,X0,Y0,s,tt);
  /* feu et lueur au bout de la queue */
  if(T2.fire>0){const q=[X0+tp[0]*s,Y0+tp[1]*s],f=T2.fire;colGlow(ctx,q[0],q[1],52*f,'255,200,100',.55);COLFX.flamme(ctx,q[0],q[1]+10,12,(46+10*Math.sin(tt*10))*f,-6,tt*14)}
}

function tailTip(){
  const x=Q.bx,y=Q.by,a=Q.atk;
  let tip=[x+175+Math.sin(Q.time*2)*16,y+135+Math.cos(Q.time*2.3)*14],fire=Q.enraged?.5:0,strike=0;
  if(a){
    const th=a.hits.filter(x=>x.k==='tail'),h=th.find(x=>a.t<x.at+.4)||th[th.length-1]||a.hits[a.hits.length-1];
    if(h.k==='tail'){
      const d=a.t-h.at,up=[x+130,y-170],hit=[QH[0]+30,QH[1]+10];
      if(d>-.55&&d<=-.14){tip=lerp2(tip,up,fdE(clamp01((d+.55)/.4)));fire=1}
      else if(d>-.14&&d<=0){tip=lerp2(up,hit,ei(clamp01((d+.14)/.14)));fire=1;strike=1}
      else if(d>0&&d<.4){tip=lerp2(hit,tip,fdE(d/.4));fire=1-d/.4*.5;strike=1-d/.4}
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
        hh=d<0?150*fdE(u*1.8):150*(1-v*.75),ww=d<0?34*fdE(u*1.8):34*(1-v*.6);
      fdTornade(ctx,x,gy+4,hh,ww,tt+h.at,d<0?1:1-v*v);
      if(!reduce)COLFX.eclats(ctx,x+14,gy+4,(Q.time*2.2)%.5,6,['#ff9a35','#ffe08a'],150,60,gy+8,420);
    }else if(h.k==='rock'){
      if(d<-.45||d>.5)continue;
      const e0=[QH[0]+30,QH[1]+20],rl=QR.rel&&QR.rel[a.hits.indexOf(h)%2?'B':'A'];
      if(d<0){
        const u=(d+.45)/.45,s0=rl?[rl[0],rl[1]]:[Q.bx-120,Q.by-90];
        {const T=[];for(let i=1;i<=5;i++){const uu=Math.max(0,u-i*.06),q=lerp2(s0,e0,uu);q[1]-=60*Math.sin(Math.PI*uu);T.push(q)}qrockTrail(T,22)}
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
        qrockTrail([1,2,3,4].map(i=>[x+(i%2?5:-5),y-i*22]),22);
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
      colGlow(ctx,pos[0],pos[1],40,'255,170,80',.6);
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
      const adv=t<.3?eo(t/.3):t<.7?1:1-fdE(clamp01((t-.7)/.45));x+=28*adv;rot=-.04*adv;
    }else if(c.k==='head'){
      /* le Veilleur reste sur son bloc : seul son rayon monte vers la tête (1er novembre) */
      glow=t>=.3&&t<.85?.6:0;
    }else if(c.k==='beam'){
      glow=clamp01(t/.75);
      if(t>1.3)glow=Math.max(0,1-(t-1.3)/.3);
    }else if(c.k==='final'){
      /* coup ultime : le Veilleur reste au sol, un pas en avant sur son bloc ; seul le rayon vise (1er novembre) */
      if(t<1.1){glow=t/1.1}
      else{const u=fdE(clamp01((t-1.1)/.45));x+=28*u;glow=t<1.55?1:Math.max(.5,1-(t-1.55)/3)}
    }
    if(QR.rg){x=Q.hx;rot=0;glow=clamp01((c.t-.9)/.5)*(c.t<2.3?1:Math.max(0,1-(c.t-2.3)/.5))}
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
  if(Q.mode==='lake'){const e=fdE(clamp01(Q.lt/.6));x+=(Q.hx-x)*e;y+=(Q.hy-y)*e;sa=-1.15;glow=Q.erupt?.8:.35;rot=0}
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
  let sn=0;for(const s of S.sparks){if(S===Q&&Q.mode==='lake'&&(sn++%3))continue; /* fin de phase II : une étincelle sur trois */
    ctx.globalAlpha=clamp01(s.life/s.max);ctx.fillStyle=s.col;ctx.fillRect(s.x-s.sz/2,s.y-s.sz/2,s.sz,s.sz);
  }
  ctx.globalAlpha=1;
  /* effets d'impact dans la DA actuelle : aplats nets (étoiles d'or et de crème, flammes découpées), plus d'anneaux, de dégradés ni de bleu ; mêmes effets pour les phases II et III */
  for(const r of S.rings){
    const u=1-r.life/r.max;
    ctx.save();ctx.globalAlpha=1-u;COLFX.etoile(ctx,r.x,r.y,24+90*u,8,u*1.5,'#ffe9a0',.38);COLFX.etoile(ctx,r.x,r.y,10+40*u,8,-u,'#fffbea',.4);ctx.restore();
  }
  for(const f of S.fbs){
    const u=f.t/.7,al=Math.max(0,1-u*u),tm=reduce?0:f.t;
    ctx.save();ctx.translate(f.x,f.y);
    ctx.globalAlpha=al;COLFX.etoile(ctx,0,0,70*f.big*(1-u*.5),10,u,'rgba(255,214,110,.6)',.4);COLFX.etoile(ctx,0,0,34*f.big*(1-u),10,-u,'#fffbea',.4);
    for(let i=0;i<11;i++){
      const a=-3.14+(i/10)*3.14+Math.sin(i*5.3)*.12,len=(50+70*((i*7)%5)/4)*f.big*eo(clamp01(u*1.6));
      ctx.save();ctx.rotate(a+1.5708);
      COLFX.flamme(ctx,0,-8,11*f.big,len,0,i*1.7+tm*12);
      ctx.restore();
    }
    ctx.restore();
  }
  for(const e of S.exps){
    const u=e.t/.9,rr=(30+300*eo(u))*e.s,al=Math.max(0,1-u*1.1);
    ctx.save();ctx.globalAlpha=al;COLFX.etoile(ctx,e.x,e.y,rr*.8,12,u*2,'rgba(255,214,110,.55)',.4);COLFX.etoile(ctx,e.x,e.y,rr*.5,12,-u,'#ffe9a0',.4);COLFX.etoile(ctx,e.x,e.y,rr*.25,10,u,'#fffbea',.45);ctx.restore();
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
  const c=Q.cn;if(!c||QR.rg)return; /* fin de rage : la riposte du creuset a ses propres effets (fdRipFx) */
  const tt=reduce?0:Q.time,tip=qSwordTip(),to=qBeamTarget(c);
  {const al=qBeamAl(c);if(al>0&&!(c.k==='head'&&QR.kind==='wings')){const w=c.k==='final'?26*(1+.08*Math.sin(tt*50)):16;lanternBeam(tip,to,w,al)}}
  if(c.k==='beam'){
    /* contre des débris : la lumière monte vers la voûte, puis trois colonnes tombent d'en haut sur le Colosse, au moment de l'éclat de dégât */
    if(c.t>=.2&&c.t<.62){const u=fdE((c.t-.2)/.3);ctx.save();ctx.globalAlpha=u<1?1:Math.max(0,1-(c.t-.5)/.12);COLFX.poly(ctx,[[tip[0]-4,tip[1]],[tip[0]-2,tip[1]-(tip[1]+10)*u],[tip[0]+2,tip[1]-(tip[1]+10)*u],[tip[0]+4,tip[1]]],'#ffe9a0');ctx.restore()}
    for(let k=0;k<3;k++){const t0=.5+k*.1,u=(c.t-t0)/.45;if(u<=0||u>=1)continue;const x=to[0]+(k-1)*62,fall=fdE(u/.35),a=u<.5?1:1-(u-.5)/.5,w=22*(1-u*.4),yb=to[1]+34-Math.abs(k-1)*20;
      ctx.save();ctx.globalAlpha=a;COLFX.poly(ctx,[[x-w,-10],[x+w,-10],[x+w*.7,yb*fall],[x-w*.7,yb*fall]],'rgba(255,214,110,.55)');COLFX.poly(ctx,[[x-w*.55,-10],[x+w*.55,-10],[x+w*.4,yb*fall],[x-w*.4,yb*fall]],'#ffe9a0');COLFX.poly(ctx,[[x-w*.2,-10],[x+w*.2,-10],[x+w*.15,yb*fall],[x-w*.15,yb*fall]],'#fffbea');ctx.restore();
      if(u>.3){const v=(u-.3)/.7;COLFX.etoile(ctx,x,yb,70*(1-v),10,.2,'#ffe58a',.4);if(!reduce)COLFX.eclats(ctx,x,yb,v*.8,10,['#7a4048','#ffe58a','#4a2438'],260,71+k,null,500)}}
  }
  if(c.k==='stab'&&c.t>=.35&&c.t<1.1){
    /* contre des griffes : la lumière frappe la main, les griffes éclatent et volent */
    const u=(c.t-.35)/.7,H=[to[0]-70,to[1]+40];ctx.save();ctx.globalAlpha=1-u*u;
    for(let i=0;i<3;i++){const a=-2.4+i*.55,x=H[0]+Math.cos(a)*170*u,y=H[1]+Math.sin(a)*170*u+420*u*u,r=a+u*(i%2?11:-11);
      COLFX.poly(ctx,[[x+Math.cos(r)*24,y+Math.sin(r)*24],[x+Math.cos(r+2.6)*7,y+Math.sin(r+2.6)*7],[x+Math.cos(r+3.7)*6,y+Math.sin(r+3.7)*6]],'#e7c9a2');COLFX.poly(ctx,[[x+Math.cos(r)*24,y+Math.sin(r)*24],[x+Math.cos(r+2.6)*7,y+Math.sin(r+2.6)*7],[x,y]],'#9a6a5e')}
    ctx.restore()}
  if(c.k==='head'&&QR.kind==='wings'&&c.t>=.55&&c.t<1.3){
    /* contre des ailes : le souffle de la lame rabat les ailes, une gerbe de flammes jaillit des pointes */
    const u=(c.t-.55)/.75,g=1-u;[[Q.bx-235,Q.by-70],[Q.bx+215,Q.by-80]].forEach(([x,y],i)=>{COLFX.flamme(ctx,x,y,18,(110+40*i)*g,i?12:-12,tt*14+i,Math.max(0,g));COLFX.flamme(ctx,x+(i?24:-24),y+26,12,70*g,i?10:-10,tt*16+i,Math.max(0,g))})}
  if(c.k==='stab'&&c.t>=.3&&c.t<.8){
    /* éclat à bout portant : l'estoc touche la poitrine, la griffe saute */
    const u=(c.t-.35)/.45;
    if(c.t<.62){COLFX.etoile(ctx,to[0],to[1],90*(1-Math.max(0,u)*.6),10,.2,'#ffd66a',.4);COLFX.etoile(ctx,to[0],to[1],48*(1-Math.max(0,u)),10,.5,'#fffbea')}
    if(!reduce&&u>0)COLFX.eclats(ctx,to[0],to[1],u*.8,22,['#ffe58a','#6a3a50','#ff9a35','#2c1534'],300,9,null,500);
  }
  if(c.k==='head'&&QR.kind==='wings'&&c.t>=.1&&c.t<.8){
    /* contre des ailes : une lame de lumière en croissant part de la lanterne, fend les flammes et vient frapper la tête */
    const u=Math.min(1,(c.t-.1)/.45),e=fdE(u),dx=to[0]-tip[0],dy=to[1]-tip[1],an=Math.atan2(dy,dx),al=c.t<.55?1:Math.max(0,1-(c.t-.55)/.25);
    ctx.save();
    for(let i=4;i>=0;i--){const v=Math.max(0,e-i*.07),x=tip[0]+dx*v,y=tip[1]+dy*v,R=24+70*v;ctx.globalAlpha=al*(i?.18:1);fdCroissant(ctx,x,y,an,R,'rgba(255,214,110,.6)',.5);if(!i){fdCroissant(ctx,x,y,an,R*.86,'#ffe9a0',.42);fdCroissant(ctx,x,y,an,R*.6,'#fffbea',.3)}}
    ctx.restore();
    if(c.t>.5){COLFX.etoile(ctx,to[0],to[1],80*Math.max(0,1-(c.t-.5)*3.3),10,.2,'#ffd66a',.4);if(!reduce)COLFX.eclats(ctx,to[0],to[1],c.t-.52,16,['#ffe58a','#fffbea','#ff9a35'],260,88,null,420)}
  }
  if(c.k==='final'&&c.t>=1.55&&c.t<3.6){
    /* le coup ultime : plaques d'armure arrachées, flammes qui sortent des fissures, arc de lumière à l'impact */
    {const u=(c.t-1.55)/1.2,cx=Q.bx-20,cy=Q.by-4;fdPlates(ctx,cx,cy,u);
     const jf=Math.max(0,1-(c.t-1.6)/1.6);[[-30,-60],[20,-20],[-60,10],[35,50],[-10,-110],[60,-80]].forEach(([x,y],i)=>COLFX.flamme(ctx,cx+x,cy+y,10,70*jf,(i%2?8:-8),tt*15+i,jf));
     if(c.t<1.95){const v=(c.t-1.55)/.4;COLFX.etoile(ctx,cx,cy,260*(1-v*.6),16,.1,'rgba(255,214,110,.5)',.4)}}
    /* la lumière ressort par les fissures du Colosse */
    const jet=fdE((c.t-1.6)/.4)*(1-fdE((c.t-3.0)/.5)),cx=Q.bx-20,cy=Q.by-4;
    if(jet>0){
      [[0,-1],[0,-70],[-30,-30],[22,18],[10,-96],[-52,4],[34,-52]].forEach(([hx,hy],i)=>{const a=i*6.283/7+.5+Math.sin(tt*3+i)*.07,L=(120+(i%3)*60)*jet,x=cx+hx*.8,y=cy+hy*.8;
        ctx.save();ctx.globalAlpha=.75;fdEnt(ctx,x,y,x+Math.cos(a)*L,y+Math.sin(a)*L,11,'#ffe9a0');ctx.globalAlpha=1;fdEnt(ctx,x,y,x+Math.cos(a)*L*.7,y+Math.sin(a)*L*.7,4,'#fffbea');ctx.restore()});
      COLFX.etoile(ctx,cx,cy,40+30*jet+Math.sin(tt*30)*6,10,tt*4,'#fffbea',.4);
    }
  }
}
function qBeamTarget(c){
  if(QR.rg&&QR.geo&&QR.front)return c.dmg?QR.front:fdG(QR.geo.cut); /* fin de rage : le rayon vise le câble, l'éclat de dégât la tête où tombe la lave */
  return c.k==='head'?[Q.bx,Q.by-92]:c.k==='beam'?[Q.bx-30,Q.by-4]:c.k==='final'?[Q.bx-20,Q.by-4]:[Q.bx-30,Q.by-4];
}
function renderQ(){
  qLayout();
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(Q.shake>0&&!reduce){const sk=Q.mode==='lake'?.35:1;ctx.translate(rand(-1,1)*Q.shake*sk,rand(-1,1)*Q.shake*sk)} /* fin de phase II : secousse adoucie */
  if(Q.cn&&Q.cn.k==='final'&&!reduce){const k=COLFX.choc(Q.cn.t,1.55,1,.2)*7;ctx.translate(rand(-1,1)*k,rand(-1,1)*k)} /* le coup ultime secoue l'écran en plus */
  fdRec();
  qBackground();
  /* rage : voile sombre pendant le cri */
  if(Q.boss.s==='rage'){const b=Q.boss,v=.45*fdE(b.t/.5)*(1-fdE((b.t-(b.dur-.4))/.4));if(v>.01){ctx.fillStyle='rgba(40,4,14,'+v+')';ctx.fillRect(-20,-20,W+40,H+40)}}
  ctx.save();ctx.translate(0,qDive());
  drawBoss2();
  ctx.restore();
  drawLake(true);
  drawHits2();
  drawHero2();
  drawCnFx();
  fdRipFx();
  drawHints2();
  drawFx2();
  ctx.restore();
  ctx.drawImage(vig,0,0,W,H);
  if(Q.flash>0){ctx.fillStyle='rgba(255,255,255,'+Q.flash*(Q.mode==='lake'?.22:1)+')';ctx.fillRect(0,0,W,H)}
  if(Q.hurt>0){ctx.fillStyle='rgba(255,40,30,'+(Q.hurt*.45)+')';ctx.fillRect(0,0,W,H)}
  let fade=0;
  if(Q.mode==='intro')fade=1-clamp01(Q.t/.7);
  if(Q.mode==='lake'&&Q.splash)fade=clamp01((Q.lt-Q.splash-1.9)/.9);
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,W,H)}
}
