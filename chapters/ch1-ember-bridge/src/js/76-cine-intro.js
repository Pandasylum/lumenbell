/* ---------- cinématique d'introduction (cadre commun LB.cine, shared/js/24-cine.js ; drapeau « vue » lb-ch1-intro) ---------- */
const CINE=(()=>{
  const cx=LB.cine.mount().cx;
  const P=d=>new Path2D(d);
  const BRIDGE=P('M0 455 L960 455 L960 475 L900 475 Q860 475 860 505 L860 540 L760 540 L760 505 Q760 475 720 475 L560 475 Q520 475 520 505 L520 540 L420 540 L420 505 Q420 475 380 475 L200 475 Q160 475 160 505 L160 540 L60 540 L60 505 Q60 475 0 475Z');
  const COLOS=P('M640 455 L650 330 L615 300 L640 270 L625 215 L660 245 L690 205 L720 245 L760 215 L750 270 L785 300 L745 335 L760 455Z M655 215 L630 150 L668 200Z M745 210 L772 148 L735 198Z M615 300 L540 360 L560 372 L630 330Z M785 300 L850 270 L860 290 L790 330Z');
  const FAR=P('M0 400 L90 300 L160 350 L260 240 L350 340 L450 270 L560 350 L650 250 L760 340 L860 280 L960 360 L960 540 L0 540Z');
  const NEAR=P('M0 450 L120 380 L220 430 L340 360 L470 440 L600 370 L730 440 L850 380 L960 430 L960 540 L0 540Z');
  const VOLC=P('M-60 540 L200 340 L330 295 L420 205 L450 175 L480 155 L510 175 L540 205 L630 295 L760 340 L1020 540Z');
  const STARS=Array.from({length:110},()=>({x:rand(0,960),y:rand(0,330),r:rand(.5,1.5),p:rand(0,6.28)}));
  const EMB=Array.from({length:70},()=>({x:rand(0,960),v:rand(18,60),s:rand(1,3),p:rand(0,560),ph:rand(0,6.28)}));
  const HOUSES=[[40,60,44],[130,48,38],[215,70,52],[330,52,40],[430,64,48],[540,50,36],[640,72,54],[760,54,42],[850,66,48]];
  const CR=Array.from({length:16},(v,i)=>{let x=480+rand(-60,60),y=540;const pts=[[x,y]],a0=-Math.PI/2+rand(-1.1,1.1);let a=a0;for(let k=0;k<9;k++){a+=rand(-.5,.5);x+=Math.cos(a)*rand(40,80);y+=Math.sin(a)*rand(40,80)-10;pts.push([x,y])}return pts});
  const SC=[
    {d:6,en:'For a thousand winters, the mountain has burned beneath its stone.',fr:'Depuis mille hivers, la montagne brûle sous sa pierre.'},
    {d:7,en:'In the valleys below, the villages sleep, kept safe by a single stone bridge. Beneath its arch lies a foundry forgotten by all, even by those who keep watch.',fr:"Dans les vallées, les villages dorment, à l'abri d'un unique pont de pierre. Sous son arche dort une fonderie oubliée de tous, même de ceux qui veillent."},
    {d:7,en:'On the bridge, a lone silhouette: the Watcher, a member of an order sworn to protect the Bound Spires. His lantern lives with him.',fr:"Sur le pont, une seule silhouette : le Veilleur, membre d'un ordre qui protège les Flèches liées. Sa lanterne vit avec lui."},
    {d:7,en:'Tonight, a chain gives way beneath the mountain. The Ember Colossus climbs toward the light.',fr:"Cette nuit, une chaîne cède sous la montagne. Le Colosse de braise remonte vers la lumière."},
    {d:7,en:'If the Watcher falls, the fire will reach the villages.',fr:'Si le Veilleur tombe, le feu atteindra les villages.'}
  ];
  function sky(top,mid,bot){const g=cx.createLinearGradient(0,0,0,540);g.addColorStop(0,top);g.addColorStop(.6,mid);g.addColorStop(1,bot);cx.fillStyle=g;cx.fillRect(0,0,960,540)}
  function stars(t,a){cx.fillStyle='#f1e3cf';for(const s of STARS){cx.globalAlpha=a*(.35+.35*Math.sin(t*1.3+s.p));cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.283);cx.fill()}cx.globalAlpha=1}
  function embers(t,k){cx.fillStyle='#ffb060';for(const e of EMB){const y=540-((e.p+t*e.v)%580),x=e.x+Math.sin(t*.8+e.ph)*16;cx.globalAlpha=k*clamp01(Math.min(1,(540-y)/90))*clamp01(y/120+.2);cx.beginPath();cx.arc(x,y,e.s,0,6.283);cx.fill()}cx.globalAlpha=1}
  function glow(y,a,r){const g=cx.createRadialGradient(480,y,0,480,y,r);g.addColorStop(0,'rgba(255,122,43,'+a+')');g.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=g;cx.fillRect(-1500,-1500,4000,4000)}
  function cam(z,fx,fy,dx,dy){cx.translate(fx,fy);cx.scale(z,z);cx.translate(-fx+(dx||0),-fy+(dy||0))}
  function sMnt(p,t){
    cx.save();cam(1+.14*p,480,330,0,-30*p);
    sky('#08060d','#26100f','#6e2410');stars(t,1);
    cx.fillStyle='#1a0b10';cx.fill(FAR);
    glow(300,.35+.15*Math.sin(t*2),520);
    cx.fillStyle='#0d0710';cx.fill(VOLC);
    cx.save();cx.clip(VOLC);cx.strokeStyle='#ff9a3c';cx.shadowColor='#ff7a2b';cx.shadowBlur=10;
    for(let i=0;i<9;i++){cx.globalAlpha=.55+.4*Math.sin(t*1.7+i);cx.lineWidth=1.5+Math.sin(t*2+i)*.6;cx.beginPath();let x=480+(i-4)*14,y=165;cx.moveTo(x,y);for(let k=0;k<7;k++){x+=(i-4)*9+Math.sin(i*3+k*1.7)*14;y+=48;cx.lineTo(x,y)}cx.stroke()}
    cx.restore();
    const g=cx.createRadialGradient(480,158,0,480,158,90);g.addColorStop(0,'rgba(255,190,90,'+(.8+.15*Math.sin(t*3))+')');g.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=g;cx.fillRect(380,70,200,180);
    cx.fillStyle='#120810';cx.fill(NEAR);
    embers(t,1);cx.restore();
  }
  function sVal(p,t){
    cx.save();cam(1.08,480,300,-34*(p-.5),0);
    sky('#0a0710','#2a1013','#5a1e10');stars(t,.7);
    cx.save();cx.translate(-260,60);cx.scale(.6,.6);glow(300,.3,520);cx.fillStyle='#160a0f';cx.fill(VOLC);cx.restore();
    cx.fillStyle='#1b0c12';cx.fill(FAR);
    const g=cx.createLinearGradient(0,400,0,540);g.addColorStop(0,'#150a10');g.addColorStop(1,'#07050a');cx.fillStyle=g;cx.fillRect(-40,420,1040,140);
    for(const [x,w,h] of HOUSES){
      cx.fillStyle='#07050a';cx.fillRect(x,440-h+30,w,h);cx.beginPath();cx.moveTo(x-6,440-h+30);cx.lineTo(x+w/2,440-h-6+30);cx.lineTo(x+w+6,440-h+30);cx.fill();
      cx.fillStyle='rgba(255,193,90,'+(.65+.25*Math.sin(t*3+x))+')';cx.fillRect(x+w*.25,440-h*.55+30,w*.18,h*.22);cx.fillRect(x+w*.6,440-h*.55+30,w*.18,h*.22);
      cx.fillStyle='rgba(120,100,110,.25)';for(let s=0;s<4;s++){const yy=440-h-10-((t*18+s*22+x)%90)+30;cx.beginPath();cx.arc(x+w*.75+Math.sin(t+s+x)*6,yy,4+s*1.4,0,6.283);cx.fill()}
    }
    embers(t,.6);cx.restore();
  }
  function sBridge(p,t){
    cx.save();cam(1+.75*p,235,380,0,-20*p);
    sky('#08060d','#2a0f14','#7a2a10');stars(t,1);
    cx.fillStyle='rgba(241,227,207,.2)';cx.beginPath();cx.arc(170,110,34,0,6.283);cx.fill();
    cx.fillStyle='#1a0b10';cx.fill(FAR);glow(470,.75+.15*Math.sin(t*2.4),600);
    cx.fillStyle='#07050a';cx.fill(BRIDGE);
    LB.drawWatcherSil(cx,'#07050a',{sway:Math.sin(t*1.6)*.035,k:.7+.3*Math.sin(t*3.2),r:46,s:.3});
    embers(t,1);cx.restore();
  }
  function sWake(p,t){
    cx.save();
    if(!reduce&&p>.45&&p<.7){cx.translate(rand(-5,5)*(.7-p)*4,rand(-5,5)*(.7-p)*4)}
    cam(1+.1*p,480,300);
    sky('#050308','#1a0810','#4a1608');
    glow(520,.5+.4*p,640);
    const vis=clamp01(p*1.6);
    cx.strokeStyle='#ff9a3c';cx.shadowColor='#ff7a2b';cx.shadowBlur=12;cx.lineCap='round';
    for(const c of CR){const n=Math.floor(vis*(c.length-1)),f=vis*(c.length-1)-n;cx.lineWidth=2.6;cx.globalAlpha=.9;cx.beginPath();cx.moveTo(c[0][0],c[0][1]);for(let i=1;i<=n;i++)cx.lineTo(c[i][0],c[i][1]);if(n<c.length-1){const a=c[n],b=c[n+1];cx.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f)}cx.stroke()}
    cx.globalAlpha=1;cx.shadowBlur=0;
    const rise=es(clamp01((p-.3)/.6));
    cx.save();cx.globalAlpha=clamp01((p-.28)/.3);cx.translate(-250*1.25+0,(1-rise)*210-40);cx.scale(1.25,1.25);cx.translate(0,60);cx.fillStyle='#06040a';cx.fill(COLOS);
    cx.restore();
    const ea=clamp01((p-.5)/.12);cx.fillStyle='rgba(255,210,122,'+ea+')';cx.shadowColor='#ffb347';cx.shadowBlur=18;
    for(const ex of[690,722]){cx.beginPath();cx.ellipse((ex-250)*1.25-0,(232+60-40)*1.25-75*(1-rise)*0+(1-rise)*210-60,5.5,3.6,0,0,6.283);cx.fill()}
    cx.shadowBlur=0;embers(t,1.1);cx.restore();
    if(p>.45&&p<.62){cx.fillStyle='rgba(255,230,190,'+(.55*(1-(p-.45)/.17))+')';cx.fillRect(0,0,960,540)}
  }
  function sFace(p,t,lt){
    cx.save();cam(1.55-.55*p,480,330);
    sky('#08060d','#2a0f14','#7a2a10');stars(t,.9);
    cx.fillStyle='rgba(241,227,207,.16)';cx.beginPath();cx.arc(170,110,34,0,6.283);cx.fill();
    cx.fillStyle='#1a0b10';cx.fill(FAR);glow(470,.75+.15*Math.sin(t*2.2),620);
    cx.fillStyle='#07050a';cx.fill(BRIDGE);cx.fill(COLOS);
    LB.drawWatcherSil(cx,'#07050a',{k:.75+.25*Math.sin(t*3.1),r:40,s:.35});
    cx.fillStyle='#ffd27a';cx.shadowColor='#ffb347';cx.shadowBlur=16;cx.beginPath();cx.arc(690,232,4,0,6.283);cx.arc(722,232,4,0,6.283);cx.fill();cx.shadowBlur=0;
    const lg=cx.createRadialGradient(705,330,0,705,330,40);lg.addColorStop(0,'rgba(255,122,43,.5)');lg.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=lg;cx.fillRect(660,290,90,80);
    embers(t,1);cx.restore();
    LB.title(cx,lt,SC[4].d/2,{col:LB.CH_COL[1],sub:_('CHAPTER I · EMBER BRIDGE','CHAPITRE I · EMBER BRIDGE')});   /* titre commun (LB.title), à mi-carton */
  }
  const DRAW=[sMnt,sVal,sBridge,sWake,sFace];
  /* sons du carton : la braise qui s'ouvre (carton 4), le tintement de la lanterne (carton 3) */
  const CUE={2:[[.3,()=>{tone(660,.9,'sine',.04,200);tone(990,1.1,'sine',.025,0)}]],3:[[.45,()=>{boom(1.2,.12);roar()}]]};
  return LB.cine.create({key:'intro',scenes:SC.map((s,i)=>Object.assign({draw:DRAW[i],cue:CUE[i]},s))});
})();
