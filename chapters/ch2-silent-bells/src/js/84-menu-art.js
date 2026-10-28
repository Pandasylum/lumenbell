/* ---------- home menu illustration ---------- */
const MS=fresh('normal');MS.phase=3;MS.mode='menu';MS.form=1;MS.cineDone={};
function renderMenu(){
  const c=$('mc'),r=c.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,1.5),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));
  if(c.width!==w||c.height!==h){c.width=w;c.height=h}
  const sv=S,cx=ctx;S=MS;ctx=c.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#03070c';ctx.fillRect(0,0,w,h);
  const port=h>w*1.1,sc=port?w/W*1.08:Math.max(w/W,h*.82/H);ctx.setTransform(sc,0,0,sc,(w-W*sc)/2,(port?h*.48:h*.8)-GY*sc);
  bg3();ctx.fillStyle='#04121a';ctx.fillRect(-2000,GY,5000,2000);drawBoss3();ell(HX-40,GY+2,30,6,'rgba(0,0,0,.45)');heroShape(HX-40,GY,0,-1.42,0);
  ctx.setTransform(1,0,0,1,0,0);
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(3,7,12,.25)');g.addColorStop(.4,'rgba(3,7,12,.05)');g.addColorStop(.72,'rgba(3,7,12,.55)');g.addColorStop(1,'rgba(3,7,12,.92)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  S=sv;ctx=cx;
}

