/* ---------- still backgrounds behind the end-of-phase cards (internal phase id): the scene as its closing cinematic
   left it, never the start of the fight ---------- */
function drawStill(id){
  if(id===2){S.hatchK=1;S.hatchSnap=1;bg2();const vp=voicePos(0),q=lanternPos(60,vp.x,vp.y-96);keeperLantern(q.x,q.y,q.a,rt);
    ell(HX,GY+2,30,6,'rgba(0,0,0,.45)');heroShape(HX,GY,0,-1.42,0);mirrorFloor();
    ctx.save();ctx.globalCompositeOperation='lighter';glow(q.x,q.y,70,'rgba(79,224,204,.9)',.4+.2*Math.sin(rt*3.4));ctx.restore()}
  else if(id===1)kingEndStill();
  else{bg3();base();const O=ecPose(0);
    TOWER.forEach((p,i)=>{if(FIXED(p.k)){const o=O[i];drawP(p.k,o.x,o.y,o.r)}else if(i!==EHEAD){const F=EFALL[i];drawP(p.k,F.x,F.y,F.r)}});
    drawAnchorQ({x:LX+135,y:GY-120,a:1.78,sc:1,clip:true});
    ctx.save();ctx.translate(BELL_REST.x,BELL_REST.y);ctx.rotate(BELL_REST.r);pHead(.85,bellMarks());ctx.restore();
    const hx=BELL_REST.x-78;ell(hx,GY+2,30,6,'rgba(0,0,0,.45)');heroShape(hx,GY,0,-1.42,0)}}
/* ---- phase II end: the hull collapsing, the opened deck, the moon ---- */
/* debris of the hull falling around the King (planks of the deck and broken frames): x, start delay, size, spin, rest pose */
const DEBRIS=(()=>{const R=mulberry(313);return[...Array(14)].map((_,i)=>{const side=i%3===2;return{x:side?(R()<.5?40+R()*120:820+R()*120):360+R()*560,d:i*.11+R()*.2,w:side?18:60+R()*70,h:side?110+R()*60:12+R()*6,r0:(R()-.5)*.6,spin:(R()-.5)*3,rx:0,ry:GY-(side?20:7),rr:side?(R()<.5?-1.35:1.35):(R()-.5)*.25,frame:side}})})();
function hullDebris(tc){for(const d of DEBRIS){const q=clamp((tc-d.d)/.9,0,1);if(q<=0)continue;const e=ein(q),y=lerp(-60,d.ry,e),r=q<1?d.r0+d.spin*q:d.rr;
    if(q>=1&&once('db'+d.x.toFixed(0))){S.shake=Math.max(S.shake,5);burst(d.x,GY,8,'#6a5a48',4,.7,.3)}
    ctx.save();ctx.translate(d.x,y);ctx.rotate(r);ctx.fillStyle=d.frame?'#120d09':'#2a2017';ctx.fillRect(-d.w/2,-d.h/2,d.w,d.h);ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=1.5;ctx.strokeRect(-d.w/2,-d.h/2,d.w,d.h);
    ctx.fillStyle='#2a2017';ctx.beginPath();ctx.moveTo(d.w/2,-d.h/2);ctx.lineTo(d.w/2+8,0);ctx.lineTo(d.w/2,d.h/2);ctx.fill();ctx.restore()}}
/* the hole torn in the deck and the hull's side: the night sky, the moon, the reefs outside (k 0..1) */
function hullHole(k){ctx.beginPath();ctx.moveTo(300,-2);const R=mulberry(29),n=9;for(let i=0;i<=n;i++){const x=lerp(300,W+2,i/n),y=k*(160+Math.sin(i*1.7)*40+R()*40);ctx.lineTo(x,y)}ctx.lineTo(W+2,-2);ctx.closePath()}
function hullSky(k){ctx.save();hullHole(k);ctx.clip();
  const g=ctx.createLinearGradient(0,0,0,240);g.addColorStop(0,'#05101a');g.addColorStop(1,'#163038');ctx.fillStyle=g;ctx.fillRect(0,0,W,260);
  for(const s of STARS){if(s.y<200){ctx.globalAlpha=.4+.3*Math.sin(rt*1.5+s.o);ctx.fillStyle='#e8f6f2';ctx.fillRect(s.x,s.y,s.r,s.r)}}ctx.globalAlpha=1;
  glow(MOON.x,MOON.y,120,'rgba(220,235,255,.8)',.45);ell(MOON.x,MOON.y,MOON.r,MOON.r,'#e8eef4');ell(MOON.x-8,MOON.y-5,6,5,'rgba(170,185,200,.5)');ell(MOON.x+9,MOON.y+8,4,3,'rgba(170,185,200,.45)');
  ctx.fillStyle='#071014';ctx.fillRect(0,220,W,60);
  ctx.restore();
  ctx.strokeStyle='#0d0907';ctx.lineWidth=6;hullHole(k);ctx.stroke()}
/* the moonlight falling through the hole onto the King */
function moonCone(a){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(MOON.x,MOON.y,700,GY);g.addColorStop(0,`rgba(210,225,255,${.22*a})`);g.addColorStop(1,`rgba(180,205,240,${.08*a})`);
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(MOON.x-30,MOON.y+20);ctx.lineTo(MOON.x+30,MOON.y+20);ctx.lineTo(840,GY+6);ctx.lineTo(560,GY+6);ctx.closePath();ctx.fill();ell(700,GY+4,150,14,`rgba(200,220,255,${.12*a})`);ctx.restore()}
/* the King on his knees (sink 0..45) */
function kingKneel(sink){ctx.save();ctx.translate(700,GY);ctx.rotate(.08*sink/45);ctx.translate(-700,-GY);ctx.translate(0,sink);drawBoss1();ctx.restore()}
/* moonlight on his metal: cold highlights along the bells, and his heart's turquoise glow */
function moonOnKing(sink,a){ctx.save();ctx.translate(700,GY);ctx.rotate(.08*sink/45);ctx.translate(0,sink-GY);ctx.globalCompositeOperation='lighter';
  ctx.strokeStyle=`rgba(220,235,255,${.55*a})`;ctx.lineWidth=2.5;
  for(const [hw,y,h] of[[104,-98,54],[88,-140,50],[72,-180,48]]){ctx.beginPath();ctx.moveTo(hw*.62,y-h*.98);ctx.quadraticCurveTo(hw*.7,y-h*.45,hw*.98,y-2);ctx.stroke()}
  ctx.beginPath();ctx.arc(-6,-224-40,30,-1.2,-.2);ctx.stroke();
  glow(0,-166,120,'rgba(79,224,204,.9)',.55*a);ctx.restore()}
function kingEndStill(){bg1();hullSky(1);hullDebris(9);drawAnchorAt({x:878,y:GY-150,a:1.95,f:1});S.parasite=1;S.noAnchor=true;moonCone(1);kingKneel(45);moonOnKing(45,1);S.noAnchor=false;
  ell(HX,GY+2,30,6,'rgba(0,0,0,.45)');heroShape(HX,GY,0,-1.42,0)}

