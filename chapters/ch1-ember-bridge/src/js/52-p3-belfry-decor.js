/* ================= PHASE III : décor du sommet du Clocher (maquette validée colosse-clocher.js, lot 3) =================
   Plans de la maquette : CIEL (dégradé, étoiles, lune), LOIN (crêtes, tours de l'ordre : flèches de la phase I), brumes, BEFFROI et sa cloche,
   SOL (parapet, dalles en fuite, corniche, paroi), fanal, neige et vignettage. Le repère de la maquette (sol à 452) est décalé de DY3
   pour que sa plateforme tombe sur DECK : positions de jeu, timings, sons et logique ne bougent pas.
   Calques fixes cuits une fois par BEL3.build() à l'entrée de la phase (beginP3), jamais en combat ; ni filtre ni ombre portée ;
   mouvement réduit : nuages, brumes, neige et flammes du fanal figés. */
const DY3=DECK-452;                 /* maquette -> jeu (vertical) */
const BELL=[398,150+DY3];           /* la cloche de la maquette : pivot en BELL[1]-18 ; ondes, contres et final partent de là */
const FANAL3=[68,470+DY3];          /* fanal : socle posé au premier plan, à gauche */
/* tours de l'ordre (x, sommet, largeur ; repère maquette) : leurs silhouettes sont cuites dans le calque LOIN ; leurs lanternes répondent dans le final (58-p3-belfry-fin.js) */
const TOWERS3=[[74,226,9],[884,238,10],[596,300,5],[196,268,6]];
const BEL3=(()=>{
  const TAU=6.283185307179586,MW=960,MH=540;
  const rnd=s=>()=>(s=(s*16807)%2147483647)/2147483647;
  const P=d=>new Path2D(d);
  const lg=(c,x0,y0,x1,y1,st)=>{const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g};
  const path=(c,d,col)=>{c.fillStyle=col;c.fill(P(d))};
  const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  const tr=(c,d,col,w)=>{c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(P(d))};
  const poly=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill()};
  function glow(c,x,y,r,rgb,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(.35,'rgba('+rgb+','+(a*.4)+')');g.addColorStop(1,'rgba('+rgb+',0)');c.save();c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore()}
  function brush(c,pa,box,n,col,seed,ang,len,w){const r=rnd(seed);c.save();c.clip(pa);c.lineCap='round';for(let i=0;i<n;i++){const x=box[0]+r()*box[2],y=box[1]+r()*box[3],l=len*(.4+r()),a=ang+(r()-.5)*.5;c.strokeStyle=col;c.globalAlpha=.25+r()*.75;c.lineWidth=w*(.4+r());c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5+(r()-.5)*5,y+Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke()}c.restore()}
  function ridge(c,base,amp,seed,col){const r=rnd(seed),p=new Path2D();p.moveTo(0,MH);let y=base,x=0;p.lineTo(0,y);while(x<MW){const step=22+r()*46,ny=base+(r()-.6)*amp*2.6;p.quadraticCurveTo(x+step*.55,(y+ny)/2+(r()-.35)*10,x+step,ny);x+=step;y=ny}p.lineTo(MW+40,MH);p.closePath();c.fillStyle=col;c.fill(p);return p}
  const PIERRE='#2b2a4c',PIERRE_C='#47466e',PIERRE_O='#1a1934',NEIGE='#cfd8f2',LISERE='rgba(214,200,244,.55)';
  function bloc3(c,x,y,w,h,seed){const r=rnd(seed);rect(c,x,y,w,h,PIERRE);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();for(let j=0,yy=y;yy<y+h;j++,yy+=19){for(let xx=x-(j%2)*17;xx<x+w;xx+=34){rect(c,xx+1,yy+1,32,17,r()<.5?'rgba(120,112,170,.16)':'rgba(10,8,30,.2)')}}c.restore();rect(c,x+w-3,y,3,h,LISERE);rect(c,x,y,w*.28,h,'rgba(8,6,26,.35)')}
  /* calque plein écran dessiné dans le repère de la maquette (décalé de dx, DY3) */
  const calq=(fn,dx)=>LB.cacheLayer(W,H,c=>{c.translate(dx||0,DY3);fn(c)},LAYER);
  const blob=(rgb,a)=>LB.cacheLayer(64,64,c=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=g;c.fillRect(0,0,64,64)},LAYER);
  const MOON=[700,200];
  let L=null;
  /* nuages, brumes et neige : tirages de la maquette, faits une fois */
  const NUAGES=[0,1,2,3,4].map(i=>{const r=rnd(60+i),y=96+i*38+r()*10,x=r()*1300;return{y,x,v:5+i*2,a:.3+r()*.2}});
  const brume=y=>Array.from({length:9},(_,i)=>{const r=rnd(100+i*7+(y|0)),x=r()*1200,w=110+r()*190;return{x,w,dy:(r()-.5)}});
  const BR=[brume(388),brume(420)];
  const FL=(()=>{const r=rnd(77),a=[];for(let i=0;i<70;i++)a.push({x:r()*1000,vx:18+r()*30,y:r()*560,vy:12+r()*26,a:.2+r()*.55,s:.6+r()*1.5});return a})();
  const CL_D='M-24 14Q-34 40 -40 72Q-46 90 -62 102H62Q46 90 40 72Q34 40 24 14Q0 4 -24 14Z',CL_P=P(CL_D),CL_O=P('M-62 14H-18Q-30 60 -34 104H-62Z');
  function build(){
    if(L)return L;
    L={};
    /* plan 1 : ciel, étoiles, lune */
    L.ciel=calq(c=>{const r=rnd(5);
      c.fillStyle=lg(c,0,0,0,420,[[0,'#090e28'],[.36,'#1d2350'],[.66,'#4a3a68'],[.86,'#8a5a78'],[1,'#d3948a']]);c.fillRect(0,0,MW,MH);
      for(let i=0;i<170;i++){c.fillStyle='rgba(230,238,255,'+(.15+r()*.65)+')';c.fillRect(r()*MW,r()*r()*260,r()<.9?1:2,1)}
      /* lune sombre et mate, comme en phase I : la lanterne reste la lumière la plus vive */
      glow(c,MOON[0],MOON[1],330,'200,150,190',.28);
      const m=new Path2D();m.arc(MOON[0],MOON[1],150,0,TAU);c.fillStyle=lg(c,0,50,0,350,[[0,'#c8acc8'],[.6,'#a284a8'],[1,'#7a5a86']]);c.fill(m);
      brush(c,m,[550,50,300,300],110,'rgba(128,104,156,.26)',9,0,62,9)});
    /* plan 2 : crêtes et tours de l'ordre, chacune sur un éperon, le pied noyé dans les nuages */
    L.loin=calq(c=>{
      ridge(c,352,26,3,'#6a4a74');
      /* flèches de la phase I (même silhouette, même fenêtre en ogive, même lueur douce) : fenêtre centrée sur top+34, là où répond la lanterne du final */
      TOWERS3.forEach(([x,top,w])=>{const st=top-54,f=w>=9?.45:.3;
        path(c,'M'+(x-w)+' 470L'+(x-w*.78)+' '+(st+62)+'L'+(x-w*1.15)+' '+(st+56)+'L'+(x-w*.55)+' '+(st+42)+'Q'+(x-w*.15)+' '+(st+22)+' '+x+' '+st+'Q'+(x+w*.15)+' '+(st+22)+' '+(x+w*.55)+' '+(st+42)+'L'+(x+w*1.15)+' '+(st+56)+'L'+(x+w*.78)+' '+(st+62)+'L'+(x+w)+' 470Z','#372a52');
        glow(c,x,st+84,30,'255,205,130',f);path(c,'M'+(x-4)+' '+(st+96)+'V'+(st+80)+'Q'+x+' '+(st+70)+' '+(x+4)+' '+(st+80)+'V'+(st+96)+'Z','rgba(255,214,150,'+(f+.2)+')')});
      ridge(c,404,20,11,'#33254a')});
    /* plan 3 : le beffroi (arc ogival, pignon, poutre, piliers) ; la cloche est dessinée à part, elle bouge */
    L.beffroi=calq(c=>{
      path(c,'M304 128Q318 40 440 8Q562 40 576 128L542 132Q528 66 440 40Q352 66 338 132Z',PIERRE);
      path(c,'M440 8Q562 40 576 128L566 129Q552 52 440 18Z',LISERE);
      path(c,'M282 118L440 -22L598 118L576 128Q556 46 440 14Q324 46 304 128Z',PIERRE_O);
      path(c,'M440 -22L598 118L588 122L440 -9Z',NEIGE);path(c,'M440 -22L282 118L292 122L440 -9Z','rgba(207,216,242,.45)');
      rect(c,318,112,244,20,'#2a1b2c');rect(c,318,112,244,4,'rgba(255,196,150,.3)');
      [326,398,478,546].forEach(x=>{rect(c,x,109,9,26,'#150d1c');rect(c,x+7,109,2,26,'rgba(214,170,170,.5)')});
      path(c,'M338 132L370 132L338 176Z','#241828');path(c,'M542 132L510 132L542 176Z','#241828');
      [[300,31],[541,67]].forEach(([x,s])=>{bloc3(c,x,124,39,296,s);rect(c,x-7,118,53,13,PIERRE_C);rect(c,x-7,118,53,3,NEIGE);
        rect(c,x-6,404,51,12,PIERRE_C);rect(c,x-10,415,59,16,PIERRE);rect(c,x-10,415,59,3,LISERE)});
    },-42);
    /* plan 4 : la plateforme (dalles en fuite), parapet du fond, corniche, paroi de la tour (prolongée jusqu'au bas de l'écran) */
    L.sol=calq(c=>{const r=rnd(23),HAUT=404,BAS=496,EXT=Math.max(0,-DY3);
      [[0,214],[750,210]].forEach(([x0,w],k)=>{bloc3(c,x0,386,w,HAUT-386+2,40+k);rect(c,x0,384,w,3,NEIGE);for(let x=x0+8;x<x0+w-20;x+=46){const h=24+r()*8;bloc3(c,x,386-h,26,h,50+x);path(c,'M'+(x-1)+' '+(386-h)+'Q'+(x+13)+' '+(379-h)+' '+(x+27)+' '+(386-h)+'Z',NEIGE)}});
      rect(c,214,398,536,7,PIERRE_O);rect(c,214,397,536,2,'rgba(207,216,242,.5)');
      c.fillStyle=lg(c,0,HAUT,0,BAS,[[0,'#8d90bc'],[.25,'#5d6092'],[1,'#37375f']]);c.fillRect(0,HAUT,MW,BAS-HAUT);
      const VP=[480,262],rangs=[HAUT,413,425,440,459,483,BAS];
      for(let j=0;j<rangs.length-1;j++){const y0=rangs[j],y1=rangs[j+1],pas=44+j*17;
        for(let x=-((j*29)%pas)-pas*3;x<1150;x+=pas){const f=y=>VP[0]+(x-VP[0])*(y-VP[1])/(442-VP[1]),f2=y=>VP[0]+(x+pas-VP[0])*(y-VP[1])/(442-VP[1]);
          poly(c,[[f(y0)+1,y0+1],[f2(y0)-1,y0+1],[f2(y1)-1.5,y1-1],[f(y1)+1.5,y1-1]],['rgba(196,204,244,.10)','rgba(20,16,46,.16)','rgba(120,110,170,.12)'][r()*3|0]);
          c.strokeStyle='rgba(20,18,48,.55)';c.lineWidth=1+j*.22;c.beginPath();c.moveTo(f(y0),y0);c.lineTo(f(y1),y1);c.stroke()}
        rect(c,0,y1-1,MW,1+j*.22,'rgba(20,18,48,.55)');rect(c,0,y1+j*.22,MW,1,'rgba(220,226,255,.22)')}
      [[40,406,150],[276,431,52],[520,431,52],[900,408,120],[150,490,90],[800,492,130]].forEach(([x,y,w])=>{c.fillStyle='rgba(214,222,248,.8)';c.beginPath();c.ellipse(x,y,w*.5,3.2,0,0,TAU);c.fill()});
      rect(c,0,BAS,MW,13,'#6d70a0');rect(c,0,BAS,MW,3,NEIGE);rect(c,0,BAS+13,MW,4,PIERRE_O);
      bloc3(c,0,BAS+17,MW,30+EXT,77);
      for(let x=26;x<MW;x+=86){path(c,'M'+x+' '+(BAS+13)+'h26l-3 20q-3 9 -10 12q-7 -3 -10 -12Z',PIERRE_C);rect(c,x+23,BAS+13,2.5,18,LISERE)}
      c.fillStyle=lg(c,0,BAS+17,0,MH+EXT,[[0,'rgba(8,6,26,.15)'],[1,'rgba(8,6,26,.8)']]);c.fillRect(0,BAS+17,MW,26+EXT)});
    /* fanal éteint, posé sur son socle de pierre (premier plan sombre) */
    L.fanal=calq(c=>{const x=68,y=470;
      bloc3(c,x-24,y-14,48,26,91);rect(c,x-28,y-17,56,5,PIERRE_C);rect(c,x-28,y-18,56,2,NEIGE);
      path(c,'M'+(x-9)+' '+(y-17)+'L'+(x-6)+' '+(y-66)+'H'+(x+6)+'L'+(x+9)+' '+(y-17)+'Z','#231a34');rect(c,x+4,y-66,2,49,LISERE);
      path(c,'M'+(x-24)+' '+(y-82)+'H'+(x+24)+'L'+(x+14)+' '+(y-66)+'H'+(x-14)+'Z','#2c1d38')});
    /* vignettage et lueurs (beffroi, braise du Colosse sur les dalles), brumes */
    L.vig=LB.cacheLayer(W,H,c=>{const v=c.createRadialGradient(480,270,260,480,290,620);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(6,4,18,.6)');c.fillStyle=v;c.fillRect(0,0,W,H)},LAYER);
    L.voute=blob('150,120,170',.2);L.braise=blob('255,128,60',.42);
    L.brume=[blob('206,168,204',.42),blob('178,150,196',.55)];
    return L;
  }
  function brumes(c,k,y,h,off){const b=L.brume[k];for(const m of BR[k]){const x=((m.x+off*1200)%1200)-120,yy=y+DY3+m.dy*h,rx=m.w,ry=h*.55;c.drawImage(b,x-rx,yy-ry,2*rx,2*ry)}}
  /* la cloche de la maquette, pendue à sa poutre ; ang = bellAng() */
  function cloche(c,ang){c.save();c.translate(BELL[0],BELL[1]-18);c.rotate(ang);
    rect(c,-5,-6,10,22,'#2a1b24');
    c.fillStyle=lg(c,-60,0,60,0,[[0,'#46302c'],[.45,'#8a6038'],[.72,'#c8934c'],[1,'#e8c88a']]);c.fill(CL_P);
    c.save();c.clip(CL_P);c.fillStyle='rgba(20,8,30,.45)';c.fill(CL_O);rect(c,-62,66,124,5,'rgba(60,30,24,.55)');rect(c,-62,86,124,3,'rgba(255,226,170,.45)');c.restore();
    tr(c,'M-62 102H62','#f2d8a0',3);c.strokeStyle='#4a2c20';c.lineWidth=2;c.beginPath();c.arc(0,46,8,0,TAU);c.moveTo(0,32);c.lineTo(0,38);c.stroke();
    c.fillStyle='#2a1b24';c.beginPath();c.arc(-ang*14,107,8,0,TAU);c.fill();c.restore()}
  /* fanal : calque éteint (le final y dessine sa flamme, 58-p3-belfry-fin.js) */
  function fanal(c){c.drawImage(L.fanal,0,0,W,H);rect(c,FANAL3[0]-24,FANAL3[1]-84,48,3,'#6e5a82')}
  function draw(c,tm){build();
    c.drawImage(L.ciel,0,0,W,H);
    for(const n of NUAGES){const x=((n.x+tm*n.v)%1300)-250,y=n.y+DY3;c.fillStyle='rgba(72,54,106,'+n.a+')';c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+120,y-10,x+270,y);c.quadraticCurveTo(x+140,y+6,x,y);c.fill()}
    c.drawImage(L.loin,0,0,W,H);
    brumes(c,0,388,40,(tm*.012)%1);brumes(c,1,420,38,1-(tm*.016)%1);
    c.drawImage(L.beffroi,0,0,W,H);
    cloche(c,bellAng());
    c.drawImage(L.voute,398-200,250+DY3-240,400,480);
    c.drawImage(L.sol,0,0,W,H);
    c.save();c.beginPath();c.rect(0,404+DY3,W,92);c.clip();c.drawImage(L.braise,R.bx-240,DECK-53,480,106);c.restore();
    fanal(c)}
  /* neige qui tombe et vignettage (par-dessus tout, hors secousse pour le vignettage) */
  function neige(c,tm){for(const f of FL){const x=((f.x-tm*f.vx)%1000+1000)%1000-20,y=(f.y+tm*f.vy)%560;c.fillStyle='rgba(225,234,255,'+f.a+')';c.beginPath();c.arc(x,y,f.s,0,TAU);c.fill()}}
  function vig(c){build();c.drawImage(L.vig,0,0,W,H)}
  /* pour le final : le ciel et les crêtes seuls (plan large), la cloche qui pend à sa poutre (plan final) */
  function plans(c){build();c.drawImage(L.ciel,0,0,W,H);c.drawImage(L.loin,0,0,W,H)}
  function bell(c,ang){build();cloche(c,ang)}
  return{build,draw,neige,vig,plans,bell};
})();
function bellAng(){if(R.bellAt==null)return 0;const a=R.time-R.bellAt;return (R.bellA||.3)*Math.exp(-a*.9)*Math.sin(a*5.2)}
function ringBell(amp,v){
  v=v==null?1:v;R.bellAt=R.time;R.bellA=amp;(R.bellW=R.bellW||[]).push(R.time);if(amp>.4)R.bellW.push(R.time+.35);
  tone(196,3.2,'sine',.16*v,0);tone(392,2.4,'sine',.08*v,0);tone(587,1.6,'triangle',.04*v,0);tone(784,1.1,'sine',.025*v,0);
}
/* bouche de la cloche (pivot en BELL[1]-18, bord à 104 px) : départ des ondes */
function bellMouth(){const a=bellAng();return[BELL[0]-Math.sin(a)*104,BELL[1]-18+Math.cos(a)*104]}
function drawBellWaves(){
  if(!R.bellW)return;
  const m=bellMouth();
  R.bellW=R.bellW.filter(t0=>R.time-t0<2.2);
  ctx.save();
  for(const t0 of R.bellW){const u=(R.time-t0)/2.2;if(u<0)continue;
    ctx.strokeStyle='rgba(255,236,190,'+(.7*(1-u))+')';ctx.lineWidth=5*(1-u)+1;ctx.beginPath();ctx.ellipse(m[0],m[1]-50,30+620*u,20+380*u,0,0,6.283);ctx.stroke()}
  ctx.restore();
}
function r3Background(){BEL3.draw(ctx,reduce?0:R.time)}
/* au sol : flaque laissée par les blocs sous le Colosse, neige fondue aux impacts (la lueur de braise est dans BEL3.draw) */
function r3Ground(){
  const bx=R.bx;
  const wet=Math.min(1,.35+R.blocks*.08);
  ctx.fillStyle='rgba(30,50,90,'+(.5*wet)+')';
  ctx.beginPath();ctx.ellipse(bx,DECK+12,130+R.blocks*6,14,0,0,6.283);ctx.fill();
  /* neige fondue à l'impact : une tache humide qui sèche et disparaît en quelques secondes */
  R.melts=R.melts.filter(m=>m.t<3.2);
  for(const m of R.melts){
    const u=Math.min(1,m.t/.5),f=1-clamp01((m.t-1.6)/1.6);
    ctx.fillStyle='rgba(40,48,80,'+(.45*u*f)+')';ctx.beginPath();ctx.ellipse(m.x,DECK+8,34*u+8,6*u+2,0,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(255,150,60,'+(.45*(1-u))+')';ctx.beginPath();ctx.ellipse(m.x,DECK+8,40*u,7*u,0,0,6.283);ctx.fill();
  }
}
