/* ---------- drawing helpers ---------- */
function drawWizard(o){
  const W=!!o.white;
  /* Le Veilleur : heaume à visière, manteau d'ordre, tabard à l'emblème de la lanterne */
  const cg=ctx.createLinearGradient(0,-96,0,0);if(W){cg.addColorStop(0,'#ffffff');cg.addColorStop(1,'#cfd7f2')}else{cg.addColorStop(0,'#3c4a6e');cg.addColorStop(1,'#1e2538')}
  ctx.beginPath();
  ctx.moveTo(-16,-92);ctx.quadraticCurveTo(-26,-50,-34,0);
  ctx.lineTo(-23,-5+o.fl);ctx.lineTo(-12,1-o.fl);ctx.lineTo(0,-5+o.fl);ctx.lineTo(12,1-o.fl);ctx.lineTo(23,-5+o.fl);ctx.lineTo(34,0);
  ctx.quadraticCurveTo(26,-50,16,-92);ctx.closePath();
  ctx.fillStyle=cg;ctx.fill();ctx.strokeStyle=W?'#8f9bc4':'#121726';ctx.lineWidth=2;ctx.stroke();
  /* tabard */
  ctx.beginPath();ctx.moveTo(-8,-88);ctx.lineTo(8,-88);ctx.lineTo(9,-8+o.fl*.4);ctx.lineTo(0,-2);ctx.lineTo(-9,-8+o.fl*.4);ctx.closePath();
  ctx.fillStyle=W?'#eef0f8':'#c9b98a';ctx.fill();ctx.strokeStyle=W?'#b9c2e0':'#8a7a5a';ctx.lineWidth=1.2;ctx.stroke();
  ctx.strokeStyle=W?'#9aa6cc':'#6b5036';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.arc(0,-64,5,0,6.283);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-73);ctx.lineTo(0,-69);ctx.stroke();
  /* ceinture */
  box(-27,-44,54,6,W?'#d6dcef':'#4a3a2a',W?'#aab3d4':'#2a1e14');
  /* épaulières */
  for(const sx of[-1,1]){ctx.beginPath();ctx.ellipse(sx*15,-89,13,7,0,0,6.283);ctx.fillStyle=W?'#f2f5ff':'#5d6f96';ctx.fill();ctx.strokeStyle=W?'#8f9bc4':'#161b2b';ctx.lineWidth=1.5;ctx.stroke()}
  /* cape du heaume (nuque) */
  poly([[-12,-112],[-28,-92],[-10,-94]],W?'#dfe5fa':'#2a3550');
  /* heaume */
  ctx.beginPath();ctx.moveTo(-15,-92);ctx.quadraticCurveTo(-19,-127,1,-128);ctx.quadraticCurveTo(20,-127,18,-92);ctx.closePath();
  ctx.fillStyle=W?'#f2f5ff':'#5d6f96';ctx.fill();ctx.strokeStyle=W?'#8f9bc4':'#161b2b';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle=W?'#e8dfc0':'#c9b98a';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-12,-119);ctx.quadraticCurveTo(1,-133,15,-119);ctx.stroke();
  ctx.strokeStyle=W?'#aab3d4':'#3a4a70';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-5,-99);ctx.lineTo(-5,-92);ctx.stroke();
  ctx.fillStyle=W?'#ffffff':'#bfeaff';ctx.fillRect(-1,-109,18,5);
}
/* Lanterne-sceptre : x,y = centre de la lumière ; ang oriente le haut de la lanterne ; g = intensité (0 à 1) */
function drawLantern(x,y,g,col,ang){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang||0);
  const gl=Math.max(0,g),rr=16+30*gl;
  const rg=ctx.createRadialGradient(0,0,2,0,0,rr);
  rg.addColorStop(0,'rgba(255,245,215,'+(.35+.5*gl)+')');rg.addColorStop(.5,'rgba(150,220,255,'+(.12+.25*gl)+')');rg.addColorStop(1,'rgba(111,211,255,0)');
  ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,rr,0,6.283);ctx.fill();
  poly([[-9,-12],[0,-20],[9,-12]],'#6b5036');
  ctx.strokeStyle='#8a7a9a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-23,3,0,6.283);ctx.stroke();
  ctx.fillStyle=col||'#ffd27a';ctx.fillRect(-8,-12,16,22);
  ctx.strokeStyle='#6b5036';ctx.lineWidth=2;ctx.strokeRect(-8,-12,16,22);
  ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-3,-12);ctx.lineTo(-3,10);ctx.moveTo(3,-12);ctx.lineTo(3,10);ctx.stroke();
  box(-10,10,20,4,'#4a3a2a','#2a1e14');
  /* petite cloche */
  ctx.strokeStyle='#8a7a9a';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(10,12);ctx.lineTo(14,16);ctx.stroke();
  ctx.beginPath();ctx.moveTo(10,26);ctx.quadraticCurveTo(10,16,14.5,16);ctx.quadraticCurveTo(19,16,19,26);ctx.closePath();
  ctx.fillStyle='#b8a46a';ctx.fill();ctx.strokeStyle='#6b5036';ctx.lineWidth=1;ctx.stroke();
  ctx.restore();
}
/* Sceptre dans le repère de la main (axe x = direction du sceptre), lanterne au bout, à la distance L */
function drawScepter(L,g,col){
  ctx.save();ctx.lineCap='round';ctx.strokeStyle='#8a7a9a';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(L-14,0);ctx.stroke();
  ctx.fillStyle='#6b5036';ctx.beginPath();ctx.arc(-18,0,3,0,6.283);ctx.fill();
  ctx.restore();
  drawLantern(L,0,g,col,Math.PI/2);
}
/* Éclat de lanterne : rayon court entre deux points */
function lanternBeam(A,B,w,al){
  ctx.save();ctx.lineCap='round';ctx.shadowColor='#6fd3ff';ctx.shadowBlur=24;
  ctx.strokeStyle='rgba(111,211,255,'+(.5*al)+')';ctx.lineWidth=w*1.8;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,'+al+')';ctx.lineWidth=w*.55;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();
  ctx.shadowBlur=0;ctx.fillStyle='rgba(235,250,255,'+(.8*al)+')';ctx.beginPath();ctx.arc(B[0],B[1],w*.9,0,6.283);ctx.fill();
  ctx.restore();
}
