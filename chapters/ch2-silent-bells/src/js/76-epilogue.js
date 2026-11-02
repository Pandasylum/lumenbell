/* ---------- Epilogue (docs/CH2-SPEC.md, outro) ---------- */
/* outro in the series frame (LB.cine), carton durations in CINE_D.outro (6 to 7 s, as in Chapter I). Cartons 1 to 4 have one
   shot each: 1 morning, the Lighthouse mute; 2 close-up of the bell, the word engraved; 3 the valley of Chapter I, the earth
   trembling, one tower going dark; 4 the forest, the Spire's light failing. Carton 5 announces the next chapter over the same
   forest: its caption is tinted with Chapter III's colour (CH_COL[3]). No glow under the waves any more (revisions of
   28 October): the only light left is the forest Spire's. Times inside a shot are counted from the shot's start (EPI_SHOTS). */
const ECAP_TXT=()=>[_('By morning, the Drowned Lighthouse still stands, mute. Its bell will never ring again.','Au matin, le Phare Noyé se dresse encore, muet. Sa cloche ne résonnera plus.'),
  _('On it, a single word is engraved: Crown.','Sur celle-ci, un seul mot est gravé : Couronne.'),
  _('And this time, the earth has not stopped trembling.',"Et cette fois, la terre n'a pas cessé de trembler."),
  _("In the heart of the forest, a Spire's light is failing.","Au cœur de la forêt, la lumière d'une Flèche faiblit."),
  _('To be continued.','À suivre.')];
const EPI_SHOTS=CINE_D.outro.slice(0,3).reduce((a,d)=>(a.push(a[a.length-1]+d),a),[0]);   // starts of shots 1 to 4
const EPI_TITLE=EPI_SHOTS[3]+CINE_D.outro[3];   // carton 5 (next chapter)
/* title of the next chapter (last card): layout of Chapter I's outro (small line at NT.y1, big title at NT.y2, centred, fades in
   NT.in s after NT.delay); in « LUMENBELL » only « LUMEN » takes the chapter colour, « BELL » stays cream (LB.TITLE_T.cream) */
const NT={delay:1,in:1.5,y1:118,y2:182,s1:22,s2:62,x:480};
function nextTitle(s){
  const a=clamp((s-NT.delay)/NT.in,0,1);if(a<=0)return;
  const col=CH_COL[3],L=_('LUMENBELL · CHAPTER III','LUMENBELL · CHAPITRE III');
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='left';ctx.font=`700 ${NT.s1}px ${LB.FONT.display}`;
  const w=ctx.measureText(L).width,w1=ctx.measureText(L.slice(0,5)).width,w2=ctx.measureText(L.slice(5,9)).width,x0=NT.x-w/2;
  ctx.fillStyle=col;ctx.fillText(L.slice(0,5),x0,NT.y1);ctx.fillStyle=LB.TITLE_T.cream;ctx.fillText(L.slice(5,9),x0+w1,NT.y1);ctx.fillStyle=col;ctx.fillText(L.slice(9),x0+w1+w2,NT.y1);
  ctx.textAlign='center';ctx.font=`800 ${NT.s2}px ${LB.FONT.display}`;ctx.fillText('HOLLOW ROOTS',NT.x,NT.y2);ctx.restore();
}
/* shot 4: the forest Spire (x, top), its light fading from SPIRE.a0 to SPIRE.a1 over the shot, with flickers */
const SPIRE={x:500,top:170,a0:.9,a1:.25,fade:6};
/* shot 3: the valley's towers (x, height); TOWER_OUT goes dark at EPI_DARK; the earth cracks along VCRACKS */
const VTOW=[[150,150],[300,110],[470,170],[640,120],[800,140]],TOWER_OUT=3,EPI_DARK=EPI_SHOTS[2]+1.3;
const VCRACKS=(()=>{const R=mulberry(808);return[...Array(5)].map((_,i)=>{const pts=[];let x=80+i*190,y=430;for(let k=0;k<7;k++){pts.push([x,y]);x+=(R()-.5)*60;y+=14+R()*10}return{pts,t0:EPI_SHOTS[2]+.6+i*.45}})})();
const EFXL=[[.2,'swell'],[EPI_SHOTS[1],'glints'],[EPI_SHOTS[2],'rumble'],[EPI_DARK,'crackRun'],[EPI_SHOTS[2]+2.1,'rumble'],[EPI_SHOTS[3],'glints'],[EPI_SHOTS[3]+2.3,'heart'],[EPI_TITLE+.6,'sting']];
function drawEpilogue(t){
  const shot=EPI_SHOTS.filter(s=>t>=s).length-1,ts=t-EPI_SHOTS[shot];
  ctx.save();
  if(shot===0){ // the morning: the Lighthouse stands, mute; the Watcher on the reef, the bell at his feet
    const g=ctx.createLinearGradient(0,0,0,320);g.addColorStop(0,'#1c2a3a');g.addColorStop(.6,'#6a6670');g.addColorStop(1,'#d8a882');ctx.fillStyle=g;ctx.fillRect(0,0,W,320);
    glow(W*.2,300,260,'rgba(255,200,140,.8)',.35);mist(250,3,.12,6);
    seaBand(318,'#4a6068','#0d1c20',.18);
    lighthouse(690,330,.85,0);
    ctx.fillStyle='#0a1114';ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,GY-6);ctx.quadraticCurveTo(300,GY-20,560,GY+4);ctx.quadraticCurveTo(620,GY+40,680,H);ctx.fill();
    for(const [x,y,r,k] of[[400,GY-4,.4,'ring'],[460,GY-2,-.3,'seg'],[250,GY-6,.2,'ring']])drawP(k,x,y,r);
    drawP('head',330,GY-6,-.28,.85);
    LB.drawWatcher(ctx,220,GY,'idle',rt)}
  else if(shot===1){ // close-up of the bell: the signs, the crack, the word
    const g=ctx.createRadialGradient(W/2,H*.45,40,W/2,H*.45,520);g.addColorStop(0,'#2a3a3c');g.addColorStop(1,'#05090a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#070c0d';ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,380);ctx.quadraticCurveTo(480,350,W,390);ctx.lineTo(W,H);ctx.fill();
    const z=4.2+.35*eio(clamp(ts/4,0,1));ctx.save();ctx.translate(W/2,372);ctx.scale(z,z);ctx.rotate(-.12);pHead(.85,bellMarks());ctx.restore();
    glow(W/2+60,200,160,'rgba(255,210,160,.6)',.18+.08*Math.sin(t*1.3))}
  else if(shot===2){ // the valley of Chapter I: the earth does not stop trembling, one tower goes dark, the others falter
    if(ts<3.9)S.shake=Math.max(S.shake||0,2+3*Math.abs(Math.sin(t*3)));
    const sx=(Math.random()-.5)*(S.shake||0),sy=(Math.random()-.5)*(S.shake||0);ctx.translate(sx,sy);
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0c14');g.addColorStop(.7,'#1e1c22');g.addColorStop(1,'#120e0c');ctx.fillStyle=g;ctx.fillRect(-20,-20,W+40,H+40);
    ctx.fillStyle='#0d0f14';ctx.beginPath();ctx.moveTo(-20,330);[[120,220],[260,280],[420,190],[560,260],[720,200],[880,270],[980,240]].forEach(p=>ctx.lineTo(p[0],p[1]));ctx.lineTo(980,H);ctx.lineTo(-20,H);ctx.fill();
    ctx.fillStyle='#14120f';ctx.beginPath();ctx.moveTo(-20,H);ctx.lineTo(-20,400);ctx.quadraticCurveTo(480,360,980,410);ctx.lineTo(980,H);ctx.fill();
    // the stone bridge of Chapter I, small, down in the valley
    ctx.fillStyle='#0a0908';ctx.fillRect(380,384,200,10);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(390+i*64,394);ctx.quadraticCurveTo(422+i*64,372,454+i*64,394);ctx.lineTo(454+i*64,410);ctx.lineTo(390+i*64,410);ctx.fill()}
    VTOW.forEach(([x,h],i)=>{const base=i%2?330:300,top=base-h,sway=Math.sin(t*9+i)*1.5;ctx.fillStyle='#08090c';ctx.beginPath();ctx.moveTo(x-9,base);ctx.lineTo(x-5+sway,top);ctx.lineTo(x+5+sway,top);ctx.lineTo(x+9,base);ctx.closePath();ctx.fill();
      let a;if(i===TOWER_OUT)a=t<EPI_DARK?.9:Math.max(0,.9-(t-EPI_DARK)/.8)*(Math.sin(t*40)>0?1:.3);else a=.55+.35*Math.sin(t*(5+i)+i*2)*Math.sin(t*13+i);
      if(a>0){ctx.save();ctx.globalCompositeOperation='lighter';glow(x+sway,top-6,34,i===0?'rgba(255,170,90,.9)':'rgba(230,225,200,.9)',a);ell(x+sway,top-6,2.5,3,`rgba(255,250,235,${a})`);ctx.restore()}});
    for(const c of VCRACKS){const k=clamp((t-c.t0)/.6,0,1);if(k<=0)continue;const n=Math.max(2,Math.ceil(c.pts.length*k));ctx.strokeStyle='#020202';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<n;i++)i?ctx.lineTo(c.pts[i][0],c.pts[i][1]):ctx.moveTo(c.pts[i][0],c.pts[i][1]);ctx.stroke();
      if(k<1&&Math.random()<.5)burst(c.pts[n-1][0],c.pts[n-1][1],2,'#6a5a48',3,.6,.3)}}
  else{ // the forest: a Bound Spire among the trees, its light failing; the title of the next chapter
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#05070a');g.addColorStop(1,'#0b0e0a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const P=SPIRE,dim=lerp(P.a0,P.a1,eio(clamp(ts/P.fade,0,1))),fl=dim*Math.max(.15,.75+.25*Math.sin(t*7)*Math.sin(t*3.1)-(Math.sin(t*2.3)>.92?.6:0));
    const light=()=>{const sg=ctx.createLinearGradient(P.x-16,0,P.x+16,0);sg.addColorStop(0,'#0c110c');sg.addColorStop(.45,'#263022');sg.addColorStop(1,'#0a0e0a');ctx.fillStyle=sg;ctx.beginPath();ctx.moveTo(P.x-16,H);ctx.lineTo(P.x-7,P.top+18);ctx.lineTo(P.x,P.top);ctx.lineTo(P.x+7,P.top+18);ctx.lineTo(P.x+16,H);ctx.closePath();ctx.fill();
      ctx.save();ctx.globalCompositeOperation='lighter';glow(P.x,P.top+8,130,'rgba(185,207,90,.9)',.55*fl);ell(P.x,P.top+8,3,4,`rgba(240,245,210,${.9*fl})`);ctx.restore()};
    const R=mulberry(616);for(let layer=0;layer<3;layer++){if(layer===1)light();ctx.fillStyle=['#0b0f0c','#070a08','#030504'][layer];for(let i=0;i<8;i++){const x=R()*W,w=10+layer*12+R()*14;if(layer&&Math.abs(x-P.x)<40)continue;  // the Spire stays visible between the near trunks
      ctx.fillRect(x-w/2,0,w,H);ctx.beginPath();ctx.moveTo(x-w/2,H-60);ctx.quadraticCurveTo(x-w*1.6,H-10,x-w*2,H);ctx.lineTo(x+w*2,H);ctx.quadraticCurveTo(x+w*1.6,H-10,x+w/2,H-60);ctx.fill()}}
    mist(420,4,.08,6);
    nextTitle(t-EPI_TITLE)}   // title of the next chapter over the forest (layout of Chapter I's last card)
    LB.nextCard(ctx,t-EPI_TITLE,{n:3,name:'Hollow Roots',col:CH_COL[3]})}   // next-chapter card over the forest (same layout as Chapter I)
  ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';for(const p of S.parts){const q=gt-p.t0,k=1-q/p.life;ctx.globalAlpha=k;ctx.fillStyle=p.c;ctx.fillRect(p.x+p.vx*q*30,p.y+p.vy*q*30+p.g*q*q*300,p.r,p.r)}ctx.restore();
  EFXL.forEach((c,i)=>{if(t>=c[0]&&once('efx'+i))MUSIC.fx(c[1])});
}
/* the epilogue in the series frame; no "seen" flag: it follows the victory every time */
const EPI=LB.cine.create({scenes:()=>CINE_D.outro.map((d,i)=>({d,txt:()=>ECAP_TXT()[i],col:i===4?CH_COL[3]:'',draw:cineScene(drawEpilogue)})),
  onTick:t=>{if(!$('menu').hidden)gt=S.epT0+t}});
function playEpilogue(cb){MUSIC.stop();MUSIC.bedStop();S.mode='epilogue';S.epT0=gt;S.cineDone={};S.parts=[];S.pops=[];S.epCb=cb;resetCine(S);S.cineDone={};hideCard();setTheme(4);$('skip').hidden=true;$('hdEye').textContent=_('Epilogue','Épilogue');EPI.play(endEpilogue)}
function endEpilogue(){if(S.mode!=='epilogue')return;const cb=S.epCb;S.epCb=null;$('skip').hidden=true;S.mode='card';cb&&cb()}


