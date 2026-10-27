/* ---------- boot ---------- */
buildStatic();
newGame();
hud();
el.ov.hidden=true;
showMenu(false);
/* écran de démarrage : un clic obligatoire, qui débloque le son et lance la musique du menu */
/* ---------- cinématique d'introduction (canvas dédié, passable) ---------- */
const CINE=(()=>{
  const box=$('cine'),cvs=$('cineC'),cap=$('cineCap'),sk=$('cineSkip'),cx=cvs.getContext('2d');
  const K=Math.min(2,COARSE?1.25:(window.devicePixelRatio||1));cvs.width=960*K;cvs.height=540*K;
  const P=d=>new Path2D(d);
  const BRIDGE=P('M0 455 L960 455 L960 475 L900 475 Q860 475 860 505 L860 540 L760 540 L760 505 Q760 475 720 475 L560 475 Q520 475 520 505 L520 540 L420 540 L420 505 Q420 475 380 475 L200 475 Q160 475 160 505 L160 540 L60 540 L60 505 Q60 475 0 475Z');
  const WATCH=P('M205 455 L215 392 Q205 380 213 366 Q222 354 234 366 Q242 380 232 392 L242 455Z');
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
  let st=null,seen=false; /* vue une fois (Passer ou fin) : mémorisé dans le navigateur quand c'est possible, sinon jusqu'au prochain chargement */
  try{seen=localStorage.getItem('eb-intro')==='1'}catch(e){}
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
    cx.save();cx.translate(225,455);cx.transform(1,0,Math.sin(t*1.6)*.035,1,0,0);cx.translate(-225,-455);cx.fill(WATCH);cx.restore();
    cx.strokeStyle='#07050a';cx.lineWidth=4;cx.beginPath();cx.moveTo(250,455);cx.lineTo(250,334);cx.stroke();
    const k=.7+.3*Math.sin(t*3.2),g=cx.createRadialGradient(250,323,0,250,323,46*k);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(.3,'rgba(255,200,110,.45)');g.addColorStop(1,'rgba(255,190,90,0)');cx.fillStyle=g;cx.fillRect(190,263,120,120);
    cx.fillStyle='#07050a';cx.beginPath();cx.moveTo(242,314);cx.lineTo(250,306);cx.lineTo(258,314);cx.closePath();cx.fill();cx.fillRect(241,331,18,4);
    cx.fillStyle='#ffd27a';cx.fillRect(243,314,14,17);cx.fillStyle='#07050a';cx.fillRect(247,314,1.5,17);cx.fillRect(251.5,314,1.5,17);
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
  function sFace(p,t){
    cx.save();cam(1.55-.55*p,480,330);
    sky('#08060d','#2a0f14','#7a2a10');stars(t,.9);
    cx.fillStyle='rgba(241,227,207,.16)';cx.beginPath();cx.arc(170,110,34,0,6.283);cx.fill();
    cx.fillStyle='#1a0b10';cx.fill(FAR);glow(470,.75+.15*Math.sin(t*2.2),620);
    cx.fillStyle='#07050a';cx.fill(BRIDGE);cx.fill(WATCH);cx.fill(COLOS);
    cx.strokeStyle='#07050a';cx.lineWidth=4;cx.beginPath();cx.moveTo(250,455);cx.lineTo(250,334);cx.stroke();
    const k=.75+.25*Math.sin(t*3.1),g=cx.createRadialGradient(250,323,0,250,323,40*k);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(.35,'rgba(255,200,110,.45)');g.addColorStop(1,'rgba(255,190,90,0)');cx.fillStyle=g;cx.fillRect(190,263,120,120);
    cx.fillStyle='#07050a';cx.beginPath();cx.moveTo(242,314);cx.lineTo(250,306);cx.lineTo(258,314);cx.closePath();cx.fill();cx.fillRect(241,331,18,4);
    cx.fillStyle='#ffd27a';cx.fillRect(243,314,14,17);cx.fillStyle='#07050a';cx.fillRect(247,314,1.5,17);cx.fillRect(251.5,314,1.5,17);
    cx.fillStyle='#ffd27a';cx.shadowColor='#ffb347';cx.shadowBlur=16;cx.beginPath();cx.arc(690,232,4,0,6.283);cx.arc(722,232,4,0,6.283);cx.fill();cx.shadowBlur=0;
    const lg=cx.createRadialGradient(705,330,0,705,330,40);lg.addColorStop(0,'rgba(255,122,43,.5)');lg.addColorStop(1,'rgba(255,122,43,0)');cx.fillStyle=lg;cx.fillRect(660,290,90,80);
    embers(t,1);cx.restore();
    const ta=clamp01((p-.5)/.25);
    if(ta>0){cx.save();cx.globalAlpha=ta;cx.textAlign='center';cx.fillStyle='#f0e8df';cx.shadowColor='rgba(255,122,43,.85)';cx.shadowBlur=30;cx.font='800 96px '+DISPLAY;cx.textAlign='left';if(cx.letterSpacing!==undefined)cx.letterSpacing='4px';const w1=cx.measureText('LUMEN').width,w2=cx.measureText('BELL').width,x0=480-(w1+w2)/2;cx.fillStyle='#ff7a2b';cx.fillText('LUMEN',x0,118);cx.fillStyle='#f0e8df';cx.fillText('BELL',x0+w1,118);cx.shadowBlur=0;cx.textAlign='center';if(cx.letterSpacing!==undefined)cx.letterSpacing='3px';cx.fillStyle='rgba(240,232,223,.88)';cx.font='700 26px '+DISPLAY;cx.fillText(_('CHAPTER I · EMBER BRIDGE','CHAPITRE I · EMBER BRIDGE'),480,160);cx.restore()}
  }
  const DRAW=[sMnt,sVal,sBridge,sWake,sFace];
  function frame(now){
    if(!st)return;
    const dt=Math.min(.1,(now-st.last)/1000);st.last=now;st.t+=dt;
    let acc=0,i=0;for(;i<SC.length;i++){if(st.t<acc+SC[i].d)break;acc+=SC[i].d}
    if(i>=SC.length){finish();return}
    const s=SC[i],lt=st.t-acc,p=lt/s.d,al=Math.min(1,lt/.8,(s.d-lt)/.8);
    if(st.i!==i){st.i=i;cap.textContent=_(s.en,s.fr);
      if(i===3)st.roar=false}
    if(i===3&&!st.roar&&p>.45){st.roar=true;boom(1.2,.12);roar()}
    if(i===2&&!st.chime&&p>.3){st.chime=true;tone(660,.9,'sine',.04,200);tone(990,1.1,'sine',.025,0)}
    cap.style.opacity=String(clamp01(Math.min(lt-.5,s.d-.5-lt)/.6));
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1;cx.fillStyle='#000';cx.fillRect(0,0,960,540);
    DRAW[i](p,st.t);
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1-al;cx.fillStyle='#000';cx.fillRect(0,0,960,540);cx.globalAlpha=1;
    st.raf=requestAnimationFrame(frame);
  }
  function finish(){
    if(!st)return;const d=st.done;cancelAnimationFrame(st.raf);st=null;box.hidden=true;
    seen=true;try{localStorage.setItem('eb-intro','1')}catch(e){}
    try{d&&d()}catch(e){}
  }
  function play(done){
    if(st)return;ensureAudio();
    sk.textContent=_('Skip ›','Passer ›');cap.textContent='';cap.style.opacity='0';
    box.hidden=false;st={t:0,i:-1,last:performance.now(),done,raf:0};
    try{sk.focus({preventScroll:true})}catch(e){}
    st.raf=requestAnimationFrame(frame);
  }
  sk.addEventListener('click',finish);
  window.addEventListener('keydown',e=>{if(!st)return;e.stopImmediatePropagation();e.preventDefault();if(e.key==='Escape'||e.key==='Enter'||e.key===' ')finish()},true);
  return{play,seen:()=>seen};
})();
$('introBtn').addEventListener('click',e=>{e.currentTarget.blur();CINE.play(()=>{})});
/* Outro de la vraie fin : le lore après la bataille, jusqu'au lien avec Silent Bells. Rejouable depuis le menu une fois débloquée. */
const OUTRO=(()=>{
  const box=$('cine'),cvs=$('cineC'),cap=$('cineCap'),sk=$('cineSkip'),cx=cvs.getContext('2d');
  let st=null;
  const STR=Array.from({length:140},()=>({x:rand(0,960),y:rand(0,330),r:rand(.4,1.8),p:rand(0,6.3)}));
  const SNW=Array.from({length:90},()=>({x:rand(0,960),y:rand(0,540),v:rand(30,80),s:rand(1,3)}));
  const BUB=Array.from({length:34},(v,i)=>({x:rand(0,960),o:rand(0,340),r:rand(1.5,4)}));
  const SC=[
    {d:9.5,en:"The great bell has fallen silent. Atop the Bell Tower, the Ember Colossus is now only a statue of black stone, kneeling before the bell. Lit by the Watcher, the beacon now keeps watch over him.",fr:"La grande cloche s'est tue. Au sommet du Clocher, le Colosse de braise n'est plus qu'une statue de pierre noire, à genoux face à la cloche. Allumé par le Veilleur, le fanal veille désormais sur lui."},
    {d:6.5,en:"In the valleys, the villages are still asleep. They will never know what was at stake that night, above their roofs.",fr:"Dans les vallées, les villages dorment encore. Ils ne sauront jamais ce qui s'est joué cette nuit au-dessus de leurs toits."},
    {d:9.5,en:"One by one, the Bound Spires answered the call. From peak to peak, their bells carried the news across the mountains, and beneath every tower, the stone trembled.",fr:"Une à une, les Flèches liées ont répondu à l'appel. De sommet en sommet, leurs cloches ont porté la nouvelle à travers les montagnes, et sous chaque tour, la pierre a tremblé."},
    {d:8,en:"Every bell answered. Every one but one. Far out at sea, the Drowned Beacon stayed silent, as if the depths had imposed silence on it.",fr:"Toutes les cloches ont répondu. Toutes, sauf une. Au large, le Phare Noyé est resté muet, comme si les profondeurs lui avaient imposé le silence."},
    {d:6,en:"At dawn, lantern in hand, the Watcher set out for the coast.",fr:"À l'aube, lanterne à la main, le Veilleur s'est mis en route vers la côte."},
    {d:7,en:"Chapter II · Silent Bells. To be continued.",fr:"Chapitre II · Silent Bells. À suivre."}
  ];
  const poly=(p,col)=>{cx.fillStyle=col;cx.beginPath();p.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));cx.closePath();cx.fill()};
  function sky(t,top,bot,hz){const g=cx.createLinearGradient(0,0,0,hz);g.addColorStop(0,top);g.addColorStop(1,bot);cx.fillStyle=g;cx.fillRect(0,0,960,hz);for(const s of STR){if(s.y>hz-10)continue;cx.globalAlpha=.3+.6*Math.abs(Math.sin(t*.8+s.p));cx.fillStyle='#eef2ff';cx.fillRect(s.x,s.y,s.r,s.r)}cx.globalAlpha=1}
  function snow(t,a){cx.fillStyle='rgba(240,246,255,'+a+')';for(const f of SNW){const y=(f.y+t*f.v)%540,x=(f.x+Math.sin(t+f.y)*14+960)%960;cx.fillRect(x,y,f.s,f.s)}}
  function lant(x,y,s,g){cx.save();cx.translate(x,y);cx.scale(s,s);const rg=cx.createRadialGradient(0,0,1,0,0,42);rg.addColorStop(0,'rgba(255,236,180,'+(.55*g)+')');rg.addColorStop(1,'rgba(255,200,110,0)');cx.fillStyle=rg;cx.beginPath();cx.arc(0,0,42,0,6.283);cx.fill();poly([[-9,-12],[0,-20],[9,-12]],'#6b5036');cx.fillStyle='#ffd27a';cx.fillRect(-8,-12,16,22);cx.strokeStyle='#6b5036';cx.lineWidth=2;cx.strokeRect(-8,-12,16,22);cx.lineWidth=1.2;cx.beginPath();cx.moveTo(-3,-12);cx.lineTo(-3,10);cx.moveTo(3,-12);cx.lineTo(3,10);cx.stroke();cx.fillStyle='#4a3a2a';cx.fillRect(-10,10,20,4);cx.restore()}
  function watcher(x,y,s,bob){cx.save();cx.translate(x,y-bob);cx.scale(s,s);poly([[-16,-92],[-34,0],[34,0],[16,-92]],'#2a3550');cx.fillStyle='#c9b98a';cx.fillRect(-8,-88,16,82);
    for(const sx of[-1,1]){cx.fillStyle='#5d6f96';cx.beginPath();cx.ellipse(sx*15,-89,13,7,0,0,6.283);cx.fill()}
    cx.fillStyle='#5d6f96';cx.beginPath();cx.moveTo(-15,-92);cx.quadraticCurveTo(-19,-127,1,-128);cx.quadraticCurveTo(20,-127,18,-92);cx.closePath();cx.fill();cx.fillStyle='#bfeaff';cx.fillRect(-1,-109,18,5);
    cx.strokeStyle='#8a7a9a';cx.lineWidth=4;cx.beginPath();cx.moveTo(26,-2);cx.lineTo(30,-140);cx.stroke();cx.restore();lant(x+30*s,y-bob+(-152)*s,s,1)}
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
  function sTowers(p,t,s){
    sky(t,'#04061a','#1c2650',330);poly([[0,330],[90,250],[170,300],[260,210],[360,290],[470,230],[560,300],[690,200],[800,290],[900,240],[960,280],[960,540],[0,540]],'#1a2148');poly([[0,420],[150,370],[300,410],[480,360],[640,400],[800,370],[960,410],[960,540],[0,540]],'#121835');
    const T=[[260,212,14],[690,202,12],[470,232,10],[900,242,9],[90,252,9],[360,292,8]];
    T.forEach((q,i)=>{const at=.5+i*.75,lit=clamp01((s-at)/.4);tower(q[0],q[1],q[2],lit);
      if(s>=at&&!st['tw'+i]){st['tw'+i]=1;tone([392,440,330,494,294,523][i],1.6,'sine',.05,0)}
      if(s>at&&s<at+2){const u=(s-at)/2;cx.strokeStyle='rgba(255,230,170,'+(1-u)+')';cx.lineWidth=2;cx.beginPath();cx.arc(q[0],q[1]+10,10+70*u,0,6.283);cx.stroke()}})}
  function sSea(p,t,s){
    const HZ=318;sky(t,'#03050f','#1c2a4a',HZ);cx.fillStyle='#eef2ff';cx.beginPath();cx.arc(200,90,16,0,6.283);cx.fill();
    const sg=cx.createLinearGradient(0,HZ,0,540);sg.addColorStop(0,'#16223e');sg.addColorStop(1,'#04070f');cx.fillStyle=sg;cx.fillRect(0,HZ,960,540-HZ);
    cx.strokeStyle='rgba(200,215,255,.1)';cx.lineWidth=1.5;for(let i=0;i<12;i++){const y=HZ+10+i*i*1.4,o=(t*(10+i*2)+i*90)%960;cx.beginPath();cx.moveTo(o-160,y);cx.lineTo(o-90,y);cx.stroke()}
    const z=1+es(clamp01(s/5))*.9;cx.save();cx.translate(640,HZ+6);cx.scale(z*1.6,z*1.6);cx.rotate(.14);poly([[-11,0],[-7,-62],[7,-62],[11,0]],'#0b1022');cx.fillStyle='#0b1022';cx.fillRect(-10,-70,20,8);poly([[-9,-70],[0,-82],[9,-70]],'#0b1022');
    const on=(Math.sin(t*2.3)>-.2?1:0)*(.35+.25*Math.sin(t*1.7));if(on){const g=cx.createRadialGradient(0,-66,1,0,-66,40);g.addColorStop(0,'rgba(140,255,230,'+(.8*on)+')');g.addColorStop(1,'rgba(80,200,220,0)');cx.fillStyle=g;cx.beginPath();cx.arc(0,-66,40,0,6.283);cx.fill()}
    cx.fillStyle=on?'#aaffeb':'#1a2440';cx.fillRect(-4,-69,8,6);cx.restore();
    /* au premier plan, depuis le Clocher, le Veilleur de dos regarde le phare */
    cx.fillStyle='#232a4a';cx.fillRect(0,470,960,70);for(let x=0;x<960;x+=110){cx.fillRect(x+14,446,58,26)}cx.fillStyle='rgba(10,14,34,.45)';for(let x=0;x<960;x+=60)cx.fillRect(x,500,2,40);cx.fillRect(0,500,960,2);cx.fillStyle='rgba(235,243,255,.55)';for(let x=0;x<960;x+=110){cx.fillRect(x+14,444,58,3)}cx.fillRect(0,468,960,3);
    {const wx=250,wy=468,c0='#070a18';cx.fillStyle=c0;cx.beginPath();cx.moveTo(wx-16,wy-92);cx.lineTo(wx-30,wy);cx.lineTo(wx+30,wy);cx.lineTo(wx+16,wy-92);cx.closePath();cx.fill();
     for(const sx of[-1,1]){cx.beginPath();cx.ellipse(wx+sx*15,wy-89,13,7,0,0,6.283);cx.fill()}
     cx.beginPath();cx.moveTo(wx-15,wy-92);cx.quadraticCurveTo(wx-18,wy-126,wx,wy-127);cx.quadraticCurveTo(wx+18,wy-126,wx+15,wy-92);cx.closePath();cx.fill();
     cx.strokeStyle=c0;cx.lineWidth=4;cx.beginPath();cx.moveTo(wx+24,wy-2);cx.lineTo(wx+30,wy-132);cx.stroke();lant(wx+31,wy-146,.85,.9+.1*Math.sin(t*3))}
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
    const a=clamp01((s-1)/1.5);cx.globalAlpha=a;cx.fillStyle='#e8f6ff';cx.textAlign='center';cx.font='700 22px '+DISPLAY;cx.fillText(_('LUMENBELL · CHAPTER II','LUMENBELL · CHAPITRE II'),480,118);cx.font='800 62px '+DISPLAY;cx.fillText('SILENT BELLS',480,182);cx.globalAlpha=1;cx.textAlign='start'}
  const DRAW=[sStatue,sValley,sTowers,sSea,sDawn,sTitle];
  function frame(now){
    if(!st)return;
    const dt=Math.min(.1,(now-st.last)/1000);st.last=now;st.t+=dt;
    let acc=0,i=0;for(;i<SC.length;i++){if(st.t<acc+SC[i].d)break;acc+=SC[i].d}
    if(i>=SC.length){finish();return}
    const s=SC[i],lt=st.t-acc,p=lt/s.d,al=Math.min(1,lt/.8,(s.d-lt)/.8);
    if(st.i!==i){st.i=i;cap.textContent=_(s.en,s.fr);if(i===0){tone(196,3,'sine',.07,0);tone(392,2.2,'sine',.03,0)}}
    cap.style.opacity=String(clamp01(Math.min(lt-.5,s.d-.5-lt)/.6));
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1;cx.fillStyle='#000';cx.fillRect(0,0,960,540);
    DRAW[i](p,st.t,lt);
    cx.setTransform(K,0,0,K,0,0);cx.globalAlpha=1-al;cx.fillStyle='#000';cx.fillRect(0,0,960,540);cx.globalAlpha=1;
    st.raf=requestAnimationFrame(frame);
  }
  const K=Math.min(2,COARSE?1.25:(window.devicePixelRatio||1));
  function finish(){if(!st)return;const d=st.done;cancelAnimationFrame(st.raf);st=null;box.hidden=true;try{d&&d()}catch(e){}}
  function play(done){
    if(st)return;ensureAudio();cvs.width=960*K;cvs.height=540*K;
    sk.textContent=_('Skip ›','Passer ›');cap.textContent='';cap.style.opacity='0';
    box.hidden=false;st={t:0,i:-1,last:performance.now(),done,raf:0};
    try{sk.focus({preventScroll:true})}catch(e){}
    st.raf=requestAnimationFrame(frame);
  }
  sk.addEventListener('click',()=>{if(st)finish()});
  window.addEventListener('keydown',e=>{if(!st)return;e.stopImmediatePropagation();e.preventDefault();if(e.key==='Escape'||e.key==='Enter'||e.key===' ')finish()},true);
  return{play,playing:()=>!!st};
})();
$('outroBtn').addEventListener('click',e=>{e.currentTarget.blur();OUTRO.play(()=>{})});

/* Chapitre II : verrouillé tant que la vraie fin n'a pas été vue (mémorisé dans le navigateur, quand c'est possible) */
function endSeen(){try{return localStorage.getItem('eb-end')==='1'}catch(e){return false}}
/* Épreuve du feu : meilleur temps affiché sous chaque difficulté (mémorisé dans le navigateur) */
function updBest(){for(const n of ['tn','th']){const sp=document.querySelector('#mphT [data-diff='+n+'] span');if(!sp)continue;let v=0;try{v=parseFloat(localStorage.getItem('eb-best-'+n))||0}catch(e){}sp.textContent=v?'🏆 '+fmtT(v):_('No record yet','Pas encore de record')}}
function updNext(){const b=$('mNext'),ok=endSeen();try{$('outroBtn').hidden=!ok}catch(e){}
  const tb=document.querySelector('#mphM [data-diff=trial]');tb.setAttribute('aria-disabled',String(!ok)); /* Épreuve du feu : débloquée par la vraie fin */
  tb.querySelector('b').textContent=ok?_('Trial by Fire','Épreuve du feu'):_('🔒 Trial by Fire','🔒 Épreuve du feu');
  tb.querySelector('span').textContent=ok?_('Ultimate challenge','Challenge ultime'):_('To unlock','À débloquer');b.classList.toggle('lock',!ok);
  b.querySelector('.nm').textContent=ok?_('Chapter II · Silent Bells','Chapitre II · Silent Bells'):_('🔒 Chapter II','🔒 Chapitre II');
  b.querySelector('.soon').textContent=_('Coming soon','À venir')}
$('mNext').addEventListener('click',e=>e.currentTarget.blur()); /* Chapitre II : « À venir » suffit, aucun message */
$('gateBtn').addEventListener('click',()=>{ensureAudio();$('gate').hidden=true;try{$('menu').querySelector('[data-diff=normal]').focus({preventScroll:true})}catch(e){}});
try{$('gateBtn').focus({preventScroll:true})}catch(e){}
let last=performance.now();
function frame(now){
  perfWatch(now-last);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(RUN.on&&!paused&&el.ov.hidden&&menuEl.hidden){const S=R||Q||G;if(S&&S.mode==='play'){RUN.t+=dt;RUN.pt[R?2:Q?1:0]+=dt}}
  if(R){if(!paused)rStep(dt);renderR()}else if(Q){if(!paused)qStep(dt);renderQ()}else{if(!paused)step(dt);render()}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
