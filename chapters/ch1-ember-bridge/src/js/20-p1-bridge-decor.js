/* ---------- static layers ---------- */
let bgFar,bgBridge,vig; /* calques hors écran, créés une fois par buildStatic (LB.cacheLayer ; taille tronquée comme avant : round:Math.floor) */
const LAYER={round:Math.floor};
/* Décor du pont (phase I) : ciel du soir, lune, crêtes, tours, pont à arches. Adapté de la maquette A9 (tablier à 424 → DECK).
   Fixe : bgFar, bgBridge. En direct, à bas coût : brume (sprite) et lueur des arches (sprite), mouvement réduit = brume fixe. */
const BRD=(()=>{
  const TAU=Math.PI*2,DY=DECK-424,FEET=H-DY; /* DY : décalage maquette → jeu ; FEET : pied des arches en coordonnées maquette */
  const rnd=s=>()=>(s=(s*16807)%2147483647)/2147483647;
  const P=d=>new Path2D(d);
  const lin=(c,x0,y0,x1,y1,st)=>{const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(q=>g.addColorStop(q[0],q[1]));return g};
  const glow=colGlow;
  const brush=(c,path,box,n,col,seed,ang,len,w)=>{const r=rnd(seed);c.save();c.clip(path);c.lineCap='round';for(let i=0;i<n;i++){const x=box[0]+r()*box[2],y=box[1]+r()*box[3],l=len*(.4+r()),a=ang+(r()-.5)*.5;c.strokeStyle=col;c.globalAlpha=.25+r()*.75;c.lineWidth=w*(.4+r());c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5+(r()-.5)*5,y+Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke()}c.restore()};
  const ridge=(c,base,amp,seed,col)=>{const r=rnd(seed),p=new Path2D();p.moveTo(0,H+30);let y=base,x=0;p.lineTo(0,y);while(x<W){const st=22+r()*46,ny=base+(r()-.6)*amp*2.6;p.quadraticCurveTo(x+st*.55,(y+ny)/2+(r()-.35)*10,x+st,ny);x+=st;y=ny}p.lineTo(W+40,H+30);p.closePath();c.fillStyle=col;c.fill(p)};
  const ARCH=[[[118,FEET],[150,466],[290,462],[316,FEET]],[[414,FEET],[442,462],[586,464],[614,FEET]],[[712,FEET],[746,462],[884,468],[902,FEET]]];
  const archPath=p=>{const t=new Path2D();t.moveTo(...p[0]);t.bezierCurveTo(...p[1],...p[2],...p[3]);t.closePath();return t};
  const ARCH_P=ARCH.map(archPath);
  /* brume : 2 bandes de 9 ellipses ; position/taille tirées une fois, seul le décalage x bouge */
  const mistBand=(y,h,a,seed)=>Array.from({length:9},(_,i)=>{const r=rnd(seed+i*7);return{x:r()*1200,y:y+(r()-.5)*h,w:110+r()*190,h:h*.55,a}});
  const MIST=[mistBand(352+DY,56,.34,100),mistBand(396+DY,46,.3,104)];
  let sprMist,sprGlow;
  function build(){
    /* ciel + lune + étoiles + crêtes + tours : tout en un calque fixe */
    bgFar=LB.cacheLayer(W,H,c=>{
      const r=rnd(5);
      c.fillStyle=lin(c,0,0,0,400,[[0,'#0d1229'],[.35,'#27264a'],[.62,'#55345a'],[.82,'#85485a'],[1,'#a85a5e']]);c.fillRect(0,0,W,H);
      for(let i=0;i<130;i++){const x=r()*W,y=r()*r()*230;c.fillStyle='rgba(255,235,215,'+(.15+r()*.6)+')';c.fillRect(x,y,r()<.9?1:2,1)}
      c.translate(0,DY);
      /* lune : volontairement sombre et mate, pour que la lanterne reste la lumière la plus vive */
      glow(c,662,196,330,'200,120,96',.28);
      const moon=new Path2D();moon.arc(662,196,142,0,TAU);
      c.fillStyle=lin(c,0,54,0,338,[[0,'#cf9d8c'],[.6,'#b27a7c'],[1,'#8c5672']]);c.fill(moon);
      brush(c,moon,[520,54,284,284],90,'rgba(150,96,110,.3)',9,0,60,9);
      const spire=(x,top,w,col,a)=>{c.fillStyle=col;c.fill(P('M'+(x-w)+' 420L'+(x-w*.78)+' '+(top+62)+'L'+(x-w*1.15)+' '+(top+56)+'L'+(x-w*.55)+' '+(top+42)+'Q'+(x-w*.15)+' '+(top+22)+' '+x+' '+top+'Q'+(x+w*.15)+' '+(top+22)+' '+(x+w*.55)+' '+(top+42)+'L'+(x+w*1.15)+' '+(top+56)+'L'+(x+w*.78)+' '+(top+62)+'L'+(x+w)+' 420Z'));
        glow(c,x,top+84,30,'255,205,130',a);c.fillStyle='rgba(255,214,150,'+(a+.2)+')';c.fill(P('M'+(x-4)+' '+(top+96)+'V'+(top+80)+'Q'+x+' '+(top+70)+' '+(x+4)+' '+(top+80)+'V'+(top+96)+'Z'))};
      spire(432,232,9,'#7a4a66',.2);ridge(c,318,26,3,'#7a4a66');spire(112,112,27,'#3d2b48',.5);ridge(c,356,22,8,'#58385a');ridge(c,390,16,13,'#3a2745');
    },LAYER);
    /* pont : arches (intérieur sombre, la lueur vit en direct), tablier à DECK, dalles à arête éclairée, parapet ébréché */
    bgBridge=LB.cacheLayer(W,H,c=>{
      const r=rnd(17);
      c.translate(0,DY);
      const body=P('M0 424H960V'+(FEET+30)+'H0Z');
      c.fillStyle=lin(c,0,424,0,FEET,[[0,'#392640'],[1,'#0e0914']]);c.fill(body);
      c.save();c.clip(body);let y=438;for(let row=0;row<6;row++){let x=-r()*50;const h=17+r()*5;while(x<W){const w=30+r()*52;c.fillStyle='rgba('+(r()<.5?'150,100,130':'20,10,28')+','+(.1+r()*.22)+')';c.beginPath();c.roundRect(x+1.5,y+1.5,w-3,h-3,4+r()*4);c.fill();x+=w}y+=h}c.restore();
      ARCH_P.forEach(t=>{c.fillStyle=lin(c,0,478,0,FEET,[[0,'#10071a'],[.6,'#3a1424'],[1,'#5a1c20']]);c.fill(t)});
      ARCH.forEach(p=>{const f=u=>{const v=1-u;return[0,1].map(k=>v*v*v*p[0][k]+3*v*v*u*p[1][k]+3*v*u*u*p[2][k]+u*u*u*p[3][k])};
        for(let i=0;i<13;i++){const u0=.02+i*.074,u1=u0+.068,a=f(u0),b=f(u1),n=(q,k)=>{const d=f(Math.min(1,k+.01)),e=f(Math.max(0,k-.01)),dx=d[0]-e[0],dy=d[1]-e[1],l=Math.hypot(dx,dy);return[q[0]+dy/l*15,q[1]-dx/l*15]},a2=n(a,u0),b2=n(b,u1);
          c.fillStyle=['#6a4050','#5a364a','#774a56'][r()*3|0];c.beginPath();c.moveTo(...a);c.lineTo(...a2);c.lineTo(...b2);c.lineTo(...b);c.fill();
          c.strokeStyle='rgba(255,196,150,.3)';c.lineWidth=1;c.beginPath();c.moveTo(...a2);c.lineTo(...b2);c.stroke();
          c.strokeStyle='rgba(255,130,60,.5)';c.lineWidth=1.6;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke()}});
      let x=-10;while(x<W){const w=40+r()*46;c.fillStyle=['#5a3a50','#4d3248','#654055'][r()*3|0];c.beginPath();c.roundRect(x+1,424+r()*2,w-2,14,3);c.fill();c.fillStyle='rgba(255,190,150,.28)';c.fillRect(x+4,425+r()*2,w-9,1.5);x+=w}
      for(let x=14;x<W;x+=92){if(r()<.2)continue;const h=18+r()*14,w=17+r()*10;c.fillStyle='#2e1f36';c.fill(P('M'+x+' 424L'+(x+2)+' '+(424-h)+'Q'+(x+w*.4)+' '+(424-h-6-r()*5)+' '+(x+w*.6)+' '+(424-h+r()*5)+'L'+(x+w)+' '+(424-h+2)+'L'+(x+w+3)+' 424Z'))}
    },LAYER);
    /* sprites des effets en direct (dessinés une fois) */
    sprMist=LB.cacheLayer(64,32,c=>{const g=c.createRadialGradient(32,16,0,32,16,32);g.addColorStop(0,'rgba(238,168,146,1)');g.addColorStop(1,'rgba(238,168,146,0)');c.translate(32,16);c.scale(1,.5);c.translate(-32,-16);c.fillStyle=g;c.fillRect(0,-16,64,64)},{k:1});
    sprGlow=LB.cacheLayer(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,150,60,1)');g.addColorStop(.4,'rgba(255,110,40,.4)');g.addColorStop(1,'rgba(255,90,30,0)');c.fillStyle=g;c.fillRect(0,0,128,128)},{k:1});
  }
  /* brume : entre le lointain et le pont ; t en [0,1[ (fixe si mouvement réduit) */
  function mist(t){
    ctx.save();
    MIST.forEach((band,bi)=>{const off=bi?1-t:t;band.forEach(m=>{const x=((m.x+off*1200)%1200)-120,w=m.w*2,h=m.h*2;ctx.globalAlpha=m.a;ctx.drawImage(sprMist,x-w/2,m.y-h/2,w,h)})});
    ctx.restore();
  }
  /* lueur chaude sous les arches : sprite additif, clippé à chaque arche, après le calque du pont */
  function archGlow(time){
    const h=reduce?.9:.9+.1*Math.sin(time*2.1*2);
    ctx.save();ctx.translate(0,DY);
    ARCH.forEach((p,i)=>{ctx.save();ctx.clip(ARCH_P[i]);ctx.globalCompositeOperation='screen';ctx.globalAlpha=.55*h;
      const cx=(p[0][0]+p[3][0])/2;ctx.drawImage(sprGlow,cx-150,FEET-110,300,190);ctx.restore()});
    ctx.restore();
  }
  return{build,mist,archGlow};
})();
function buildStatic(){
  BRD.build();
  vig=LB.cacheLayer(W,H,c=>{
    const vg=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.9);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');
    c.fillStyle=vg;c.fillRect(0,0,W,H);
  },LAYER);
}
