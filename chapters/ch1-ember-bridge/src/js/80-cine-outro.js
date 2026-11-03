/* Outro de la vraie fin : le lore après la bataille, jusqu'au lien avec Silent Bells. Rejouable depuis le menu une fois débloquée. */
const OUTRO=(()=>{
  const cx=LB.cine.mount().cx;   /* cadre commun LB.cine (shared/js/24-cine.js) ; pas de drapeau : rejouée depuis le menu */
  const STR=Array.from({length:140},()=>({x:rand(0,960),y:rand(0,330),r:rand(.4,1.8),p:rand(0,6.3)}));
  const SNW=Array.from({length:90},()=>({x:rand(0,960),y:rand(0,540),v:rand(30,80),s:rand(1,3)}));
  const BUB=Array.from({length:34},(v,i)=>({x:rand(0,960),o:rand(0,340),r:rand(1.5,4)}));
  const SC=[
    {d:9.5,en:"The great bell has fallen silent. Atop the Bell Tower, the Ember Colossus is now only a statue of black stone, kneeling before the bell. Lit by the Watcher, the beacon now keeps watch over him.",fr:"La grande cloche s'est tue. Au sommet du Clocher, le Colosse de braise n'est plus qu'une statue de pierre noire, à genoux face à la cloche. Allumé par le Veilleur, le fanal veille désormais sur lui."},
    {d:6.5,en:"In the valleys, the villages are still asleep. They will never know what was at stake that night, above their roofs.",fr:"Dans les vallées, les villages dorment encore. Ils ne sauront jamais ce qui s'est joué cette nuit au-dessus de leurs toits."},
    {d:9.5,en:"One by one, the Bound Spires answered the call. From peak to peak, their bells carried the news across the mountains, and beneath every tower, the stone trembled.",fr:"Une à une, les Flèches liées ont répondu à l'appel. De sommet en sommet, leurs cloches ont porté la nouvelle à travers les montagnes, et sous chaque tour, la pierre a tremblé."},
    {d:8,en:"Every bell answered. Every one but one. Far out at sea, the Drowned Lighthouse stayed silent, as if the depths had imposed silence on it.",fr:"Toutes les cloches ont répondu. Toutes, sauf une. Au large, le Phare Noyé est resté muet, comme si les profondeurs lui avaient imposé le silence."},
    {d:6,en:"At dawn, lantern in hand, the Watcher set out for the coast.",fr:"À l'aube, lanterne à la main, le Veilleur s'est mis en route vers la côte."},
    {d:7,col:LB.CH_COL[2],en:"Chapter II · Silent Bells. To be continued.",fr:"Chapitre II · Silent Bells. À suivre."}
  ];
  const poly=(p,col)=>{cx.fillStyle=col;cx.beginPath();p.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));cx.closePath();cx.fill()};
  function sky(t,top,bot,hz){const g=cx.createLinearGradient(0,0,0,hz);g.addColorStop(0,top);g.addColorStop(1,bot);cx.fillStyle=g;cx.fillRect(0,0,960,hz);for(const s of STR){if(s.y>hz-10)continue;cx.globalAlpha=.3+.6*Math.abs(Math.sin(t*.8+s.p));cx.fillStyle='#eef2ff';cx.fillRect(s.x,s.y,s.r,s.r)}cx.globalAlpha=1}
  function snow(t,a){cx.fillStyle='rgba(240,246,255,'+a+')';for(const f of SNW){const y=(f.y+t*f.v)%540,x=(f.x+Math.sin(t+f.y)*14+960)%960;cx.fillRect(x,y,f.s,f.s)}}
  /* le Veilleur commun, en silhouette lointaine (LB.drawWatcher, opt.flat) */
  function watcher(x,y,s,bob){LB.drawWatcher(cx,x,y,'walk',0,{flat:true,dx:0,dy:-bob,scale:s})}
  function bell(x,y,s,a){cx.save();cx.translate(x,y);cx.rotate(a);cx.scale(s,s);const bg=cx.createLinearGradient(-60,0,60,0);bg.addColorStop(0,'#7a5524');bg.addColorStop(.45,'#d9a24c');bg.addColorStop(1,'#6b4a1a');cx.fillStyle=bg;cx.beginPath();cx.moveTo(-26,14);cx.quadraticCurveTo(-36,50,-60,108);cx.lineTo(60,108);cx.quadraticCurveTo(36,50,26,14);cx.closePath();cx.fill();cx.strokeStyle='rgba(255,226,150,.6)';cx.lineWidth=2;cx.beginPath();cx.moveTo(-40,84);cx.lineTo(40,84);cx.stroke();cx.restore()}
  function tower(x,top,w,lit){w*=2.2;cx.fillStyle='#141a3a';poly([[x-w/2,top],[x+w/2,top],[x+w*.75,540],[x-w*.75,540]],'#141a3a');cx.fillRect(x-w/2-3,top-4,w+6,5);poly([[x-w/2-4,top-4],[x,top-4-w*1.1],[x+w/2+4,top-4]],'#141a3a');cx.fillStyle='#0a0e24';cx.fillRect(x-w*.22,top+3,w*.44,w*.5);const r=10+22*lit,g=cx.createRadialGradient(x,top+10,1,x,top+10,r);g.addColorStop(0,'rgba(255,215,130,'+(.25+.6*lit)+')');g.addColorStop(1,'rgba(255,200,110,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,top+10,r,0,6.283);cx.fill();cx.fillStyle=lit>.1?'#ffd27a':'#6a5a3a';cx.fillRect(x-2,top+7,4,6)}
  function sStatue(p,t){
    sky(t,'#03050f','#18204a',380);poly([[0,340],[160,290],[330,320],[520,280],[700,322],[960,300],[960,380],[0,380]],'#232c55');
    cx.save();const z=1.12-.12*p;cx.translate(480,300);cx.scale(z,z);cx.translate(-480,-300);
    cx.fillStyle='#2a2f4e';cx.beginPath();cx.moveTo(362,380);cx.lineTo(362,206);cx.quadraticCurveTo(480,100,598,206);cx.lineTo(598,380);cx.lineTo(566,380);cx.lineTo(566,218);cx.quadraticCurveTo(480,150,394,218);cx.lineTo(394,380);cx.closePath();cx.fill();
    poly([[340,184],[480,70],[620,184]],'#3c4268');cx.fillStyle='rgba(240,246,255,.85)';cx.fillRect(340,182,280,4);
    cx.fillStyle='#4a3626';cx.fillRect(390,196,180,8);bell(480,204,.8,Math.sin(t*1.6)*.06*Math.exp(-t*.25));
    cx.fillStyle='#4a5272';cx.fillRect(-60,380,1080,200);cx.fillStyle='rgba(240,246,255,.9)';cx.fillRect(-60,380,1080,5);
    /* le Colosse pétrifié, à genoux face au beffroi, la tête baissée, la main ouverte tendue avec un anneau */
    cx.save();cx.translate(720,378);cx.scale(1.05,1.05);
    const SG='#3b3a40',SL='#4a4950',SD='#2a292e';
    poly([[50,-190],[104,-262],[76,-176]],SD);poly([[40,-176],[88,-226],[62,-160]],SD);
    poly([[40,-172],[58,-150],[44,-108],[28,-118]],SD);
    poly([[-26,-30],[66,-26],[70,0],[-26,0]],SD);
    poly([[18,-112],[58,-96],[0,-14],[-30,-32]],SG);
    poly([[8,-100],[68,-100],[46,-200],[-26,-194]],SG);
    poly([[-46,-210],[-8,-216],[-4,-186],[-40,-184]],SL);poly([[-42,-208],[-64,-240],[-30,-214]],SL);poly([[-10,-214],[2,-246],[-4,-210]],SL);
    poly([[-14,-182],[0,-168],[-52,-118],[-68,-128]],SG);
    poly([[-72,-126],[-52,-112],[-58,-102],[-78,-114]],SL);
    cx.strokeStyle='#9aa0ae';cx.lineWidth=2.5;cx.beginPath();cx.arc(-66,-106,6,0,6.283);cx.stroke();
    cx.strokeStyle='#1c1b20';cx.lineWidth=2;cx.beginPath();cx.moveTo(24,-170);cx.lineTo(34,-140);cx.lineTo(24,-120);cx.moveTo(-6,-196);cx.lineTo(-2,-186);cx.stroke();
    cx.fillStyle='rgba(240,246,255,.8)';cx.fillRect(-22,-194,56,3);cx.fillRect(-44,-212,34,3);cx.fillRect(-26,-32,90,3);
    cx.fillStyle='rgba(255,140,60,'+(.12+.08*Math.sin(t*2))+')';cx.beginPath();cx.arc(24,-150,6,0,6.283);cx.fill();cx.restore();
    {const fx=250,fy=380;cx.fillStyle='#3a3f5e';cx.fillRect(fx-10,fy-64,20,64);cx.fillStyle='#4a5072';cx.fillRect(fx-14,fy-68,28,6);
     const g=cx.createRadialGradient(fx,fy-82,2,fx,fy-82,90);g.addColorStop(0,'rgba(255,214,130,.6)');g.addColorStop(1,'rgba(255,170,80,0)');cx.fillStyle=g;cx.beginPath();cx.arc(fx,fy-82,90,0,6.283);cx.fill();
     for(let i=-1;i<=1;i++){const h=24+12*Math.abs(Math.sin(t*9+i*2));cx.fillStyle=i?'rgba(255,170,70,.9)':'rgba(255,224,150,.95)';cx.beginPath();cx.moveTo(fx+i*9-7,fy-72);cx.quadraticCurveTo(fx+i*9+Math.sin(t*7+i)*3,fy-72-h*.6,fx+i*9,fy-72-h);cx.quadraticCurveTo(fx+i*9+Math.sin(t*6+i)*3,fy-72-h*.5,fx+i*9+7,fy-72);cx.closePath();cx.fill()}
     poly([[fx-22,fy-82],[fx+22,fy-82],[fx+14,fy-68],[fx-14,fy-68]],'#241b2a')}
    cx.restore();snow(t,.85)}
  function sValley(p,t){
    sky(t,'#05081c','#24305a',300);poly([[0,300],[200,240],[400,280],[600,230],[800,270],[960,250],[960,540],[0,540]],'#1b2346');poly([[0,380],[960,360],[960,540],[0,540]],'#141a36');
    cx.strokeStyle='#0c1026';cx.lineWidth=14;cx.beginPath();cx.moveTo(380,300);cx.quadraticCurveTo(480,250,580,300);cx.stroke();cx.lineWidth=6;cx.beginPath();cx.moveTo(480,262);cx.lineTo(480,300);cx.stroke();
    for(let i=0;i<14;i++){const x=120+i*55+(i%3)*8,y=410+(i%4)*22,on=Math.sin(t*.7+i*1.7)>-.6;cx.fillStyle='#0d1229';cx.fillRect(x,y,34,24);poly([[x-4,y],[x+17,y-16],[x+38,y]],'#0d1229');if(on){cx.fillStyle='rgba(255,210,120,.85)';cx.fillRect(x+12,y+8,8,8)}
      cx.fillStyle='rgba(150,160,190,.18)';for(let k=0;k<3;k++){const yy=y-18-((t*14+k*20+x)%60);cx.beginPath();cx.arc(x+28+Math.sin(t+k+x)*4,yy,3+k,0,6.283);cx.fill()}}
    cx.fillStyle='rgba(255,255,255,.12)';cx.fillRect(0,390+Math.sin(t)*2,960,1)}
  function sTowers(p,t,s,st){
    sky(t,'#04061a','#1c2650',330);poly([[0,330],[90,250],[170,300],[260,210],[360,290],[470,230],[560,300],[690,200],[800,290],[900,240],[960,280],[960,540],[0,540]],'#1a2148');poly([[0,420],[150,370],[300,410],[480,360],[640,400],[800,370],[960,410],[960,540],[0,540]],'#121835');
    const T=[[260,212,14],[690,202,12],[470,232,10],[900,242,9],[90,252,9],[360,292,8]];
    T.forEach((q,i)=>{const at=.5+i*.75,lit=clamp01((s-at)/.4);tower(q[0],q[1],q[2],lit);
      if(s>=at&&!st['tw'+i]){st['tw'+i]=1;tone([392,440,330,494,294,523][i],1.6,'sine',.05,0)}
      if(s>at&&s<at+2){const u=(s-at)/2;cx.strokeStyle='rgba(255,230,170,'+(1-u)+')';cx.lineWidth=2;cx.beginPath();cx.arc(q[0],q[1]+10,10+70*u,0,6.283);cx.stroke()}})}
  function sSea(p,t,s,st){
    const HZ=318;sky(t,'#03050f','#1c2a4a',HZ);cx.fillStyle='#eef2ff';cx.beginPath();cx.arc(200,90,16,0,6.283);cx.fill();
    const sg=cx.createLinearGradient(0,HZ,0,540);sg.addColorStop(0,'#16223e');sg.addColorStop(1,'#04070f');cx.fillStyle=sg;cx.fillRect(0,HZ,960,540-HZ);
    cx.strokeStyle='rgba(200,215,255,.1)';cx.lineWidth=1.5;for(let i=0;i<12;i++){const y=HZ+10+i*i*1.4,o=(t*(10+i*2)+i*90)%960;cx.beginPath();cx.moveTo(o-160,y);cx.lineTo(o-90,y);cx.stroke()}
    const z=1+es(clamp01(s/5))*.9;cx.save();cx.translate(640,HZ+6);cx.scale(z*1.6,z*1.6);cx.rotate(.14);poly([[-11,0],[-7,-62],[7,-62],[11,0]],'#0b1022');cx.fillStyle='#0b1022';cx.fillRect(-10,-70,20,8);poly([[-9,-70],[0,-82],[9,-70]],'#0b1022');
    const on=(Math.sin(t*2.3)>-.2?1:0)*(.35+.25*Math.sin(t*1.7));if(on){const g=cx.createRadialGradient(0,-66,1,0,-66,40);g.addColorStop(0,'rgba(140,255,230,'+(.8*on)+')');g.addColorStop(1,'rgba(80,200,220,0)');cx.fillStyle=g;cx.beginPath();cx.arc(0,-66,40,0,6.283);cx.fill()}
    cx.fillStyle=on?'#aaffeb':'#1a2440';cx.fillRect(-4,-69,8,6);cx.restore();
    /* au premier plan, depuis le Clocher, le Veilleur de dos regarde le phare */
    cx.fillStyle='#232a4a';cx.fillRect(0,470,960,70);for(let x=0;x<960;x+=110){cx.fillRect(x+14,446,58,26)}cx.fillStyle='rgba(10,14,34,.45)';for(let x=0;x<960;x+=60)cx.fillRect(x,500,2,40);cx.fillRect(0,500,960,2);cx.fillStyle='rgba(235,243,255,.55)';for(let x=0;x<960;x+=110){cx.fillRect(x+14,444,58,3)}cx.fillRect(0,468,960,3);
    LB.drawWatcher(cx,250,468,'idle',t,{ink:'#070a18',dx:0,dy:0,lamp:.9+.1*Math.sin(t*3)});
    if(!st.muted&&s>3.2){st.muted=1;tone(147,2.4,'sine',.05,-20)}}
  function sDawn(p,t,s){
    const HZ=300,g=cx.createLinearGradient(0,0,0,HZ);g.addColorStop(0,'#1a2246');g.addColorStop(1,'#d9a07a');cx.fillStyle=g;cx.fillRect(0,0,960,HZ);
    cx.fillStyle='rgba(255,220,170,.6)';cx.beginPath();cx.arc(780,HZ,40+6*p,Math.PI,0);cx.fill();
    cx.fillStyle='#2a3a5a';cx.fillRect(0,HZ,960,540-HZ);cx.strokeStyle='rgba(255,220,180,.18)';cx.lineWidth=1.5;for(let i=0;i<10;i++){const y=HZ+8+i*i*2;cx.beginPath();cx.moveTo(700-i*20,y);cx.lineTo(860+i*20,y);cx.stroke()}
    cx.save();cx.translate(560,HZ+4);cx.rotate(.14);cx.fillStyle='#10182c';cx.fillRect(-5,-30,10,30);poly([[-5,-30],[0,-38],[5,-30]],'#10182c');cx.restore();
    poly([[0,400],[300,380],[520,430],[520,540],[0,540]],'#141a30');
    const x=110+es(clamp01(s/6))*300;watcher(x,400+(x-110)*.09,.8,Math.abs(Math.sin(s*6))*3)}
  function sTitle(p,t,s){
    cx.fillStyle='#02040a';cx.fillRect(0,0,960,540);const g=cx.createLinearGradient(0,200,0,540);g.addColorStop(0,'#02040a');g.addColorStop(1,'#06303a');cx.fillStyle=g;cx.fillRect(0,200,960,340);
    for(const b of BUB){const y=540-((t*30+b.o)%340);cx.fillStyle='rgba(140,255,230,.25)';cx.beginPath();cx.arc(b.x,y,b.r,0,6.283);cx.fill()}
    const yb=300+es(clamp01(s/4))*80;bell(480,yb-120,.7,Math.sin(t*.8)*.12);const k=.5+.5*Math.sin(t*2),gg=cx.createRadialGradient(480,yb,2,480,yb,120);gg.addColorStop(0,'rgba(120,255,225,'+(.25*k)+')');gg.addColorStop(1,'rgba(80,200,220,0)');cx.fillStyle=gg;cx.fillRect(300,yb-140,360,280);
    LB.nextCard(cx,s,{n:2,name:'Silent Bells',col:LB.CH_COL[2]})}
  const DRAW=[sStatue,sValley,sTowers,sSea,sDawn,sTitle];
  /* premier carton : la cloche qui s'est tue */
  const ENTER={0:()=>{tone(196,3,'sine',.07,0);tone(392,2.2,'sine',.03,0)}};
  return LB.cine.create({key:'outro',scenes:SC.map((s,i)=>Object.assign({draw:DRAW[i],enter:ENTER[i]},s))});
})();

