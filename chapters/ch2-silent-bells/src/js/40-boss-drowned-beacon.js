/* ---------- boss 3: the Drowned Beacon ---------- */
const LX=760,LY=GY-333;
function beaconState(){let charge=0,dim=0;for(const th of S.threats){if(th.k==='beam'&&gt>=th.t0&&gt<=th.ts+th.D)charge=Math.max(charge,gt<th.ts?(gt-th.t0)/(th.ts-th.t0):1);if((th.k==='bolt'||th.k==='spike')&&gt>=th.t0&&gt<=th.ti)charge=Math.max(charge,.5*(gt-th.t0)/(th.ti-th.t0))}
  if(S.cnt&&S.cnt.k===3)dim=1;return{charge,dim}}
const RIBS=(()=>{const R=mulberry(51);return[...Array(7)].map((_,i)=>({x:600+i*48+R()*10,h:40+R()*50,l:R()>.5?1:-1}))})();
/* ---- the King's body parts, drawn in local coordinates (the same drawings in the King and in the tower) ---- */
/* a bell of the torso, mouth at y = 0, crown at -h: verdigris bronze, rust, barnacles */
function bellBody(hw,h,seed){
  ctx.fillStyle=bronze(-hw,hw);ctx.beginPath();ctx.moveTo(-hw,0);ctx.quadraticCurveTo(-hw*.68,-h*.45,-hw*.6,-h);ctx.quadraticCurveTo(0,-h*1.28,hw*.6,-h);ctx.quadraticCurveTo(hw*.68,-h*.45,hw,0);ctx.closePath();ctx.fill();
  ctx.save();ctx.clip();const R=mulberry(seed);
  for(let i=0;i<6;i++){const x=(R()-.5)*hw*1.5,w=2+R()*5,y0=-h*(.5+R()*.6);const g=ctx.createLinearGradient(0,y0,0,0);g.addColorStop(0,'rgba(110,210,185,.32)');g.addColorStop(1,'rgba(110,210,185,0)');ctx.fillStyle=g;ctx.fillRect(x,y0,w,-y0)}
  for(let i=0;i<7;i++)ell((R()-.5)*hw*1.3,-R()*h*.9,5+R()*12,3+R()*6,'rgba(128,54,22,.55)');
  ctx.strokeStyle='rgba(8,14,10,.7)';ctx.lineWidth=2;for(const o of[.55,.68]){ctx.beginPath();ctx.moveTo(-hw*.66,-h*o);ctx.quadraticCurveTo(0,-h*o-8,hw*.66,-h*o);ctx.stroke()}
  ctx.restore();
  ctx.fillStyle='#0b1412';ctx.beginPath();ctx.moveTo(-hw-3,-9);jag(-hw-3,hw+3,2,Math.max(6,Math.round(hw/6)),6,mulberry(seed+1));ctx.lineTo(hw+3,-9);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(170,230,210,.14)';ctx.fillRect(-hw+4,-11,hw*2-8,2)}
function pTb0(){bellBody(104,54,3)}
function pTb1(heat){bellBody(88,50,8);
  // heart cage: lantern glow -> cyan parasite -> cold
  const hy=-26;ctx.fillStyle='#050807';ctx.beginPath();ctx.moveTo(-28,hy-30);jag(-28,30,hy-34,7,-8,mulberry(4));ctx.lineTo(34,hy+8);jag(34,-32,hy+26,8,8,mulberry(6));ctx.closePath();ctx.fill();
  if(heat>=0&&heat<1)glow(0,hy,46,'rgba(220,150,80,.95)',1-heat);
  if(heat>0)glow(0,hy,50,'rgba(90,220,255,.95)',heat*.6);
  ctx.strokeStyle='#0a110d';ctx.lineWidth=6;for(const x of[-16,0,16]){ctx.beginPath();ctx.moveTo(x,hy-32);ctx.lineTo(x,hy+26);ctx.stroke()}}
function pTb2(){bellBody(72,48,13)}
function pRing(){ctx.fillStyle=bronze(-23,23);rrect(-23,-13,46,26,5);ctx.fill();ctx.fillStyle='#0d1712';ctx.fillRect(-23,9,46,4);ctx.fillStyle='rgba(170,230,210,.18)';ctx.fillRect(-21,-11,42,2);ell(-8,-2,4,3,'rgba(128,54,22,.5)')}
function pSmallBell(){ctx.fillStyle=bronze(-34,34);ctx.beginPath();ctx.moveTo(-34,0);ctx.quadraticCurveTo(-30,-46,0,-50);ctx.quadraticCurveTo(30,-46,34,0);ctx.closePath();ctx.fill();ctx.fillStyle='#0d1712';ctx.fillRect(-36,-4,72,6);
  ell(-12,-24,6,9,'rgba(128,54,22,.5)');ctx.strokeStyle='rgba(110,210,185,.3)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,-42);ctx.lineTo(12,-8);ctx.stroke()}
/* the Lighthouse's bell (the King's head): angular signs round the waist, written once in RUNES and reused;
   o.word: the word engraved in clear in the middle (Crown), o.crack: cracked (from the end of phase III on) */
const RUNES=[[[0,0],[3,-8],[6,0]],[[0,-8],[0,0],[5,-4]],[[0,0],[5,-8],[5,0],[0,-8]],[[0,-8],[5,-8],[2,0]],[[0,-4],[3,-8],[6,-4],[3,0],[0,-4]],[[0,0],[0,-8],[5,-8],[5,-3]],[[0,-8],[6,0],[6,-8]],[[1,0],[5,-8],[1,-6],[6,-2]]];
function runes(x0,y,n,sc,seed){const R=mulberry(seed);ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=0;i<n;i++){const g=RUNES[Math.floor(R()*RUNES.length)];ctx.beginPath();g.forEach((p,j)=>{const x=x0+i*9*sc+p[0]*sc,yy=y+p[1]*sc;j?ctx.lineTo(x,yy):ctx.moveTo(x,yy)});ctx.stroke()}}
function pHead(heat,o){o=o||{};ctx.strokeStyle='#1c2b24';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,-58,10,Math.PI,0);ctx.stroke();
  ctx.fillStyle=bronze(-38,38);ctx.beginPath();ctx.moveTo(-38,0);ctx.quadraticCurveTo(-34,-40,-15,-52);ctx.quadraticCurveTo(0,-60,15,-52);ctx.quadraticCurveTo(34,-40,38,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#0d1712';ctx.fillRect(-40,-4,80,7);
  ctx.save();ctx.strokeStyle='rgba(6,12,10,.85)';ctx.lineWidth=1.3;runes(-31,-8,7,1,7);ctx.strokeStyle='rgba(170,230,210,.22)';ctx.lineWidth=.8;runes(-30.5,-8.6,7,1,7);ctx.restore();
  if(o.word){const w=o.word.toUpperCase();ctx.save();ctx.textAlign='center';ctx.font='700 9px '+LB.FONT.body;{const m=ctx.measureText(w).width;if(m>50)ctx.font=`700 ${Math.floor(9*50/m)}px ${LB.FONT.body}`}
    ctx.fillStyle='rgba(170,230,210,.35)';ctx.fillText(w,.6,-27.4);ctx.fillStyle='rgba(6,12,10,.9)';ctx.fillText(w,0,-28);ctx.restore()}
  if(o.crack){ctx.strokeStyle='#050a08';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(4,-55);ctx.lineTo(10,-46);ctx.lineTo(22,-39);ctx.lineTo(28,-25);ctx.lineTo(25,-13);ctx.lineTo(31,-2);ctx.stroke();ctx.strokeStyle='rgba(170,230,210,.3)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(5.5,-54);ctx.lineTo(11.5,-45);ctx.lineTo(23.5,-38);ctx.stroke()}}
function pSeg(){seg(-24,0,24,0,20)}
function pFist(){fist(0,0)}
/* the harpoon in the King's left hand: origin at the grip, tip pointing down (+y) */
function pHarp(){harpoon(0,72,Math.PI/2,112)}
const PDRAW={tb0:pTb0,tb1:pTb1,tb2:pTb2,ring:pRing,sbell:pSmallBell,head:pHead,seg:pSeg,fist:pFist,harp:pHarp};
/* the tower's lights (decision of Kevin, 3 November 2026): the Elder's two shoulder bells, carried to the summit, are the
   lighthouse's lamps; there is no other lantern. When the tower works they turn round it under the jellyfish and the light
   follows them. Correction of Kevin (3 November 2026): in form I they orbit only during the beam attack, the bell that
   casts the beam aimed at it, then ease back to their post; in form II they stay at their post and only their mouth pivots
   with the beam. SPIN: rendering only (rx/ry = orbit radii, y = drop below the jellyfish, d = depth scale, span = px of reef
   per unit of aim, pre = ease-in before a cinematic sweep, back = s of the easy return to the post, align = share of the
   tell over which the casting bell's mouth turns onto the beam).
   lampPoses keeps its old contract (index 0 = left, 1 = right at rest, point = middle of the mouth, s = side) so the beams,
   bolts and form II keep reading the bells from it */
const SPIN={rx:70,ry:12,y:24,d:.14,span:500,pre:.5,back:.8,align:.35};
const TAU=Math.PI*2;
/* orbit angle that aims the casting bell at the reef point bx (dir < 0: right bell, sweeping leftwards; dir > 0: left bell),
   the bell passing in front of the tower */
function aimA(dir,bx){const c=clamp((bx-LX)/SPIN.span,-1,1);return dir<0?Math.acos(c):-Math.acos(-c)}
/* one sweep: pre 0..1 (the tell), s 0..1 (the sweep, same bx as drawBeacon), post 0..1 (easy return to the post) */
function sweepA(dir,pre,s,post){const b0=dir<0?940:-60,b1=dir<0?-60:940;
  if(post>0){const Ae=aimA(dir,b1);return lerp(Ae,Math.round(Ae/TAU)*TAU,eio(clamp(post,0,1)))}
  if(s>0)return aimA(dir,lerp(b0,b1,s));
  return aimA(dir,b0)*eio(clamp(pre,0,1))}
/* the sweep being cast this frame, worked out afresh at each call (so the bells, the beam, its glow and the cone read the same
   angle and point in the same frame, whatever the drawing order): i = casting bell (0 left, 1 right), A = orbit angle,
   bx = reef point the beam aims at, w = 0..1 how far the casting bell's mouth is turned onto the beam (eased in over
   SPIN.align of the tell, out over the return). Reads the beam threats only, never writes them; spinMem keeps the end of
   the last sweep for the return; spinCine = a sweep played by a cinematic (drawBoss3(cine)), valid for its frame only */
let spinMem=null,spinCine=null;
function castOf(dir,pre,s,post){pre=clamp(pre,0,1);s=clamp(s,0,1);post=clamp(post,0,1);const b0=dir<0?940:-60,b1=dir<0?-60:940;
  return{i:dir<0?1:0,A:sweepA(dir,pre,s,post),bx:post>0?b1:s>0?lerp(b0,b1,s):b0,w:post>0?1-eio(post):s>0?1:eio(clamp(pre/SPIN.align,0,1))}}
function castNow(){
  if(spinCine&&spinCine.g===gt)return castOf(spinCine.dir,spinCine.pre,spinCine.s,spinCine.post);
  let C=null;
  for(const th of S.threats){if(th.k!=='beam'||gt<th.t0)continue;const e=th.ts+th.D;if(gt>e+SPIN.back)continue;spinMem={dir:th.dir,e};
    C=castOf(th.dir,gt<th.ts?(gt-th.t0)/(th.ts-th.t0):1,gt<th.ts?0:(gt-th.ts)/th.D,gt>e?(gt-e)/SPIN.back:0)}
  if(!C&&spinMem&&gt>=spinMem.e&&gt<spinMem.e+SPIN.back)C=castOf(spinMem.dir,1,1,(gt-spinMem.e)/SPIN.back);
  return C}
/* mouth angle (rotation of the bell, mouth at local +y) that points from (x, y) at the reef point bx */
const aimR=(x,y,bx)=>Math.atan2(-(bx-x),GY-y);
/* poses of the two bells. At the tower top (jx, jy = LX, LY, no spread) they follow the sweep: the casting bell's mouth
   turns onto the beam (r), m = unit direction of its mouth, cast = this bell casts now (w = how much) */
function lampPoses(jx,jy,k,spread){const sp=spread||0,kk=k||1,top=jx===LX&&jy===LY&&!sp,C=top?castNow():null,A=C?C.A:0;
  return[0,1].map(i=>{const a=A+(i?0:Math.PI),c=Math.cos(a),z=Math.sin(a),s=i?1:-1;
    const x=jx+c*SPIN.rx*kk+s*95*sp,y=jy+(SPIN.y+z*SPIN.ry)*kk-30*sp,r0=-c*Math.PI/2+s*.6*sp;
    const cast=!!C&&C.i===i,w=cast?C.w:0,r=cast?lerp(r0,aimR(x,y,C.bx),w):r0;
    return{x,y,r,s,c,z,sc:1+z*SPIN.d,m:{x:-Math.sin(r),y:Math.cos(r)},cast,w}})}
/* the bells are TOWER pieces (sbell): the old side-lantern hooks stay as no-ops for the callers of form II and the stills */
const LAMP_FLOOR=[],LAMP_REST=[{x:LX-380,y:GY-34,r:Math.PI/2},{x:LX+185,y:GY-34,r:-Math.PI/2}];
function drawLamps(){}
function lamps(){}
/* the turning bells at the summit, back half (z < 0) or front half; a soft cone leaves each mouth and turns with it */
function spinBells(front,on,charge){const Q=lampPoses(LX,LY,1);
  for(const q of Q){if((q.z>=0)!==front)continue;const dx=q.m.x,dy=q.m.y,L=150+charge*60,a=(.1+.18*charge)*on*(.55+.45*Math.abs(q.c));
    if(a>0){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(q.x,q.y,q.x+dx*L,q.y+dy*L);g.addColorStop(0,`rgba(220,252,255,${a})`);g.addColorStop(1,'rgba(110,230,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(q.x-dy*8,q.y+dx*8);ctx.lineTo(q.x+dx*L-dy*34,q.y+dy*L+dx*34);ctx.lineTo(q.x+dx*L+dy*34,q.y+dy*L-dx*34);ctx.lineTo(q.x+dy*8,q.y-dx*8);ctx.closePath();ctx.fill();ctx.restore()}
    ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);ctx.scale(q.sc,q.sc);if(q.z<0)ctx.globalAlpha*=.8+.2*(1+q.z);PDRAW.sbell();ctx.restore();
    glow(q.x,q.y,26,'rgba(200,250,255,.9)',(.25+.5*charge)*on)}}
/* pieces that stay on the reef when the tower bursts (the three torso bells, the right fist, the planted harpoon) */
const FIXED=k=>k==='fist'||k==='harp'||k.startsWith('tb');
/* start pose = standing King (centered on LX); end pose = the tower, from the reef up:
   torso bell, two leg rings, torso bell, two rings, torso bell, two rings, the head bell upside down (the lantern);
   shoulder bells = the lamps at the summit (see SPIN), arm segments = flying buttresses, anchor planted at the foot, chains = moorings to the reef */
const TOWER=(()=>{const X=LX,ty=GY-224,P=[];
  const ringS=[];for(let kk=0;kk<3;kk++)for(const sx of[-1,1])ringS.push({x:X+sx*38,y:GY-91+kk*30,r:0});
  const RE=[GY-66,GY-90,GY-165,GY-189,GY-262,GY-286],RT=[3.9,4.12,4.62,4.84,5.32,5.54];let ri=0;
  const ring=()=>{const i=ri++;P.push({k:'ring',s:ringS[i],e:{x:X,y:RE[i],r:0},t:RT[i],lift:90})};
  P.push({k:'tb0',s:{x:X,y:GY-98,r:0},e:{x:X,y:GY,r:0},t:3.4,lift:20});ring();ring();
  P.push({k:'tb1',s:{x:X,y:GY-140,r:0},e:{x:X,y:GY-103,r:0},t:4.4,lift:40});ring();ring();
  P.push({k:'tb2',s:{x:X,y:GY-180,r:0},e:{x:X,y:GY-202,r:0},t:5.1,lift:50});ring();ring();
  for(const s of[-1,1])P.push({k:'sbell',s:{x:X+s*80,y:ty+40,r:0},e:{x:LX+s*SPIN.rx,y:LY+SPIN.y,r:-s*Math.PI/2},t:5.8+(s>0?.15:0),lift:70});
  const st=[[86,ty+43,1.62,s=>({x:X+s*66,y:GY-150,r:s*1.05})],[82,ty+84,1.62,s=>({x:X+s*92,y:GY-58,r:s*1.2})]];
  for(const s of[-1,1])st.forEach((a,j)=>P.push({k:'seg',s:{x:X+s*(s>0?a[0]:a[0]+6),y:a[1],r:a[2]},e:a[3](s),t:6+j*.2+(s>0?.1:0),lift:60}));
  P.push({k:'head',s:{x:X-6,y:ty+6,r:-.2},e:{x:X,y:GY-359,r:Math.PI},t:6.6,d:1.1,lift:110});
  P.push({k:'fist',s:{x:X+76,y:ty+104,r:0},e:{x:945,y:GY+2,r:0},t:3.6,lift:120});
  P.push({k:'harp',s:{x:X-98,y:GY-118,r:.98},e:{x:590,y:GY-62,r:0},t:3.7,lift:120});
  return P})();
const ANCH={s:{x:LX+53,y:GY-224-56,a:2.11},e:{x:LX+118,y:GY-150,a:1.78},t:6.9,d:.8};
const HEART={x:LX,y:GY-160};
function piecePose(p,t){
  if(t==null)return{...p.e,f:1};
  const d=p.d||.9,e=eio(clamp((t-p.t)/d,0,1));
  const ex=t>2?eout(clamp((t-2)/.5,0,1)):0;
  const dx=p.s.x-HEART.x,dy=p.s.y-HEART.y,l=Math.hypot(dx,dy)||1;
  const wob=t>2.5&&e<1?Math.sin(t*5+p.s.x)*3:0;
  const sx=p.s.x+dx/l*30*ex+wob,sy=p.s.y+dy/l*30*ex+wob*.6-(t>2.5?Math.min(1,(t-2.5)/.8)*14:0);
  return{x:lerp(sx,p.e.x,e),y:lerp(sy,p.e.y,e)-Math.sin(Math.PI*e)*p.lift,r:lerp(p.s.r,p.e.r,e),f:e};
}
function drawPieces(t,heat,noS){
  const out=[];
  for(const p of TOWER){let q=piecePose(p,t);
    // the standing tower draws its bells where the light leaves from (lampPoses), not at a fixed pose
    if(t==null&&p.k==='sbell'){const l=lampPoses(LX,LY,1)[p.e.x<LX?0:1];q={x:l.x,y:l.y,r:l.r,f:1,sc:l.sc}}
    out.push(q);if(t==null&&S.hide&&S.hide.has(p))continue;if(noS&&p.k==='sbell')continue;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);if(q.sc)ctx.scale(q.sc,q.sc);PDRAW[p.k](heat);ctx.restore()}
  return out;
}
function anchorPose(t){if(t==null)return{...ANCH.e,f:1};const e=eio(clamp((t-ANCH.t)/ANCH.d,0,1));const ex=t>2?eout(clamp((t-2)/.5,0,1))*20:0;
  return{x:lerp(ANCH.s.x+ex,ANCH.e.x,e),y:lerp(ANCH.s.y-ex,ANCH.e.y,e)-Math.sin(Math.PI*e)*120,a:lerp(ANCH.s.a,ANCH.e.a+(e<1?-Math.PI*2*0:0),e),f:e}}
function drawAnchorAt(q){ctx.save();if(q.f>.8){ctx.beginPath();ctx.rect(0,0,W,GY+6);ctx.clip()}drawAnchor(q.x,q.y,Math.cos(q.a),Math.sin(q.a),0);ctx.restore()}
function tentacle(x0,y0,x1,y1,k,on,wd){const mx=(x0+x1)/2+Math.sin(rt*2+k)*30,my=(y0+y1)/2+Math.cos(rt*1.7+k)*20;
  ctx.strokeStyle='rgba(4,20,26,.85)';ctx.lineWidth=(wd||3)+3;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();
  ctx.strokeStyle=`rgba(111,232,255,${.55*on+.15})`;ctx.lineWidth=wd||3;ctx.stroke();
  for(let d=1;d<5;d++){const t=d/5,mt=1-t;ell(mt*mt*x0+2*mt*t*mx+t*t*x1,mt*mt*y0+2*mt*t*my+t*t*y1,1.6,1.6,`rgba(200,255,255,${.5*on})`)}}
function bindings(on,amt){
  // loops of tentacle wrapping the column at each joint
  ctx.save();ctx.lineCap='round';
  const ys=[GY-78,GY-177,GY-274,GY-340];
  ys.forEach((y,i)=>{if(amt<=i/ys.length)return;const w=i<3?27:40;
    ctx.strokeStyle='rgba(4,20,26,.85)';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(LX,y,w,6,0,0,Math.PI);ctx.stroke();
    ctx.strokeStyle=`rgba(111,232,255,${.6*on+.15})`;ctx.lineWidth=2.6;ctx.stroke()});
  // long tentacles running from the lantern down the tower into the ice
  for(let k=0;k<6;k++){if(amt<1)break;const side=k%2?1:-1,i=k>>1,sw=Math.sin(rt*1.3+k)*8;
    const p0=[LX+side*(10+i*8),LY+16],p1=[LX+side*(60+i*6),GY-320],p2=[LX+side*(50+i*10)+sw,GY-150],p3=[LX+side*(70+i*22)+sw,GY+2];
    ctx.strokeStyle='rgba(4,20,26,.9)';ctx.lineWidth=6-i;ctx.beginPath();ctx.moveTo(...p0);ctx.bezierCurveTo(...p1,...p2,...p3);ctx.stroke();
    ctx.strokeStyle=`rgba(111,232,255,${.5*on+.1})`;ctx.lineWidth=2.2-i*.3;ctx.stroke();
    for(let d=1;d<7;d++){const t=d/7,mt=1-t;ell(mt*mt*mt*p0[0]+3*mt*mt*t*p1[0]+3*mt*t*t*p2[0]+t*t*t*p3[0],mt*mt*mt*p0[1]+3*mt*mt*t*p1[1]+3*mt*t*t*p2[1]+t*t*t*p3[1],1.7,1.7,`rgba(200,255,255,${.5*on})`)}}
  ctx.restore();
}
function jelly(x,y,r,on,t){
  ctx.save();ctx.globalCompositeOperation='lighter';
  const jg=ctx.createRadialGradient(x,y-10,2,x,y-6,r*1.5);jg.addColorStop(0,`rgba(235,253,255,${.9*on+.1})`);jg.addColorStop(.45,`rgba(60,200,255,${.8*on+.1})`);jg.addColorStop(1,'rgba(40,160,255,0)');
  ctx.fillStyle=jg;ctx.beginPath();ctx.ellipse(x,y,r*1.3,r*1.05,0,Math.PI,0);
  for(let k=0;k<=10;k++){const q=k/10;ctx.lineTo(x+r*1.3-q*r*2.6,y+(k%2?10:2)+Math.sin(t*5+k)*3)}ctx.fill();
  ctx.strokeStyle=`rgba(255,255,255,${.5*on+.15})`;ctx.lineWidth=2;for(let k=0;k<4;k++){const a=k*Math.PI/2+t*.4;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*r*.28,y-r*.33+Math.sin(a)*r*.14,r*.2,r*.11,a,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
  ctx.strokeStyle=`rgba(200,250,255,${.6*on+.2})`;ctx.lineWidth=1;for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(x+k*r*.22,y-r*.95);ctx.quadraticCurveTo(x+k*r*.3,y-10,x+k*r*.36,y+4);ctx.stroke()}
}
function moorings(a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;chainLinks(LX-20,GY-150,590,GY-104,24,'#4a2a18');chainLinks(LX+20,GY-150,945,GY-2,30,'#4a2a18');ctx.restore()}
/* cine (optional): a sweep played by a cinematic, {dir, pre, s, post} as in sweepA; otherwise the bells follow the beam threats */
function drawBoss3(cine){
  const B=beaconState();const ko=S.mode==='ko'&&S.phase===3?clamp((gt-S.koT)/2,0,1):0;
  const on=(ko?Math.max(0,1-ko*1.6)*(Math.sin(gt*30)>0?1:.3):1)*(B.dim?.35:1);
  ell(LX,GY+8,150,18,'#050e12');
  for(const r of RIBS){ctx.strokeStyle='#0a1418';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(r.x,GY+4);ctx.quadraticCurveTo(r.x+r.l*10,GY-r.h,r.x+r.l*26,GY-r.h*.9);ctx.stroke()}
  glow(LX,LY,190+B.charge*90,'rgba(90,220,255,.5)',(.4+B.charge*.5)*on);
  ctx.save();if(hasFilter&&gt-S.bossFlash<.15)ctx.filter='brightness(1.9)';
  moorings(1);drawAnchorAt(anchorPose(null));
  spinCine=cine?{...cine,g:gt}:null;spinBells(false,on,B.charge);
  drawPieces(null,.85,true);
  bindings(on,1);
  for(const [side,ph] of[[-1,0],[1,1.7]]){const sw=Math.sin(rt*1.8+ph);ctx.strokeStyle=`rgba(111,232,255,${.45*on+.1})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(LX+side*20,LY+6);ctx.bezierCurveTo(LX+side*90,LY-30+sw*20,LX+side*140,LY+30-sw*30,LX+side*(170+sw*20),LY+80+sw*20);ctx.stroke()}
  jelly(LX,LY,36,on,rt);spinBells(true,on,B.charge);
  if(B.charge>.3&&Math.sin(gt*37)>.2){ctx.save();ctx.globalCompositeOperation='lighter';lampPoses(LX,LY,1).forEach((q,i)=>bolt(q.x,q.y,q.x+q.s*40,q.y-24,(gt*13|0)/13+i*.5,'rgba(220,250,255,.8)',1.5));ctx.restore()}
  if(ko>0){ctx.strokeStyle='rgba(200,250,255,.9)';ctx.lineWidth=2;for(const c of TCR){const n=Math.ceil(c.length*Math.min(1,ko*1.5));ctx.beginPath();for(let i=0;i<n;i++)i?ctx.lineTo(c[i][0],c[i][1]):ctx.moveTo(c[i][0],c[i][1]);ctx.stroke()}}
  for(let i=0;i<6;i++){const k=(rt*.05+i/6)%1;ell(LX-160+k*320,GY-6,70,14,`rgba(160,230,240,${.08*Math.sin(k*Math.PI)})`)}
  ctx.restore();
}
/* transformation: the jellyfish bursts out of the King and rebuilds his parts into the tower */
const TF_LEN=10;
function drawTransform(){
  const t=gt-S.tfT;spinCine=null;
  if(t<2){ // the King, shaking, heart turning blue
    S.shake=Math.max(S.shake,Math.min(1,t)*4);
    ctx.save();ctx.translate(60,0);drawBoss1();ctx.restore();
  }else{
    if(!S.tfBurst){S.tfBurst=true;S.flashT=gt;S.shake=14;burst(HEART.x,HEART.y,50,'#9ff2ff',9,1.2);burst(HEART.x,HEART.y,20,'#e0b080',6,.8)}
    // jellyfish position: out of the chest, up to hover, then down into the head cup
    const up=eio(clamp((t-2)/1,0,1)),down=eio(clamp((t-7.7)/.9,0,1));
    const hx=LX+Math.sin(t*1.3)*14*(1-down),hy=lerp(lerp(HEART.y,GY-360,up),LY,down),hr=lerp(lerp(12,30,up),36,down);
    moorings(clamp((t-7.6)/.8,0,1));
    const aq=anchorPose(t);drawAnchorAt(aq);
    if(aq.f>.98&&!S.tfAnch){S.tfAnch=true;S.shake=10;burst(aq.x-40,GY,26,'#dff8ff',6,.8,.4)}
    const qs=drawPieces(t,.85);
    // tentacles reaching for each piece while it moves (and holding it while it waits)
    TOWER.forEach((p,i)=>{const q=qs[i];const holding=t<p.t+(p.d||.9)+.15&&t>2.4;if(holding)tentacle(hx,hy+10,q.x,q.y-10,i,1,2.4)});
    if(t<ANCH.t+ANCH.d+.15&&t>2.4)tentacle(hx,hy+10,aq.x,aq.y,99,1,3);
    // place-impact sparks
    TOWER.forEach((p,i)=>{const f=clamp((t-p.t)/(p.d||.9),0,1);if(f>=1&&!p['_d'+S.tfId]){p['_d'+S.tfId]=1;burst(qs[i].x,qs[i].y,10,'#9ff2ff',4,.5)}});
    bindings(1,clamp((t-7.8)/.8,0,1));
    glow(hx,hy,100,'rgba(90,220,255,.8)',.6);jelly(hx,hy,hr,1,rt);
    if(t>8.6&&!S.tfFlash){S.tfFlash=true;S.flashT=gt;burst(LX,LY,50,'#e8fdff',9,1.2)}
  }
  const fk=gt-(S.flashT||-9);if(fk<.5){ctx.fillStyle=`rgba(220,250,255,${.55*(1-fk/.5)})`;ctx.fillRect(0,0,W,H)}
  const cap=t<2?_('The parasite wakes in his heart','Le parasite se réveille dans son cœur'):t<3.3?_('The jellyfish bursts from the Elder',"La méduse jaillit du corps de l'Ancien"):t<8.6?_('Its tentacles rebuild the pieces','Ses tentacules réassemblent les morceaux'):_('The Drowned Lighthouse lights up','Le Phare Noyé s\'allume');
  if(S.tfCap!==cap){S.tfCap=cap;say(cap+'.')}
}
function drawBeacon(){
  for(const th of S.threats){
    // the King's wave: it swells at the foot of the tower, rolls across the reef, then ebbs back
    if(th.k==='kwave'&&gt>=th.t0&&gt<=th.ts+th.D+1){
      if(gt<th.ts){const k=(gt-th.t0)/(th.ts-th.t0);drawWave(LX-110,10+70*eout(k),.5+.5*k);if(k>.5&&Math.random()<.4)burst(LX-110+Math.random()*80,GY-30,2,'#e6f8f2',3,.5,.3)}
      else if(gt<=th.ts+th.D){const s=(gt-th.ts)/th.D,bx=940-1000*s;drawWave(bx,96,1);if(Math.abs(bx-HX)<90&&S.holding)burst(HX+30+(Math.random()-.5)*60,GY-80-Math.random()*60,2,'#e6f8f2',4,.4)}
      else{const q=(gt-th.ts-th.D)/1;ctx.save();ctx.globalAlpha=1-q;ctx.scale(-1,1);drawWave(-lerp(-60,700,eio(q)),40*(1-q*.5),1);ctx.restore()}}
    if(th.k==='beam'&&gt>=th.t0&&gt<=th.ts+th.D+.1){
      let bx;if(gt<th.ts){bx=th.dir<0?940:-60;const k=(gt-th.t0)/(th.ts-th.t0);ctx.save();ctx.globalAlpha=.12+.25*k;beamShape(bx,.6,th.dir<0?1:-1);ctx.restore();continue}
      const s=(gt-th.ts)/th.D;bx=th.dir<0?940-1000*s:-60+1000*s;
      ctx.save();ctx.globalCompositeOperation='lighter';beamShape(bx,1,th.dir<0?1:-1);ctx.restore();
      if(Math.abs(bx-HX)<90&&S.holding){burst(HX+(Math.random()-.5)*120,GY-60-Math.random()*40,1,'#e8fdff',3,.3)}
    }
    if(th.k==='bolt'&&gt>=th.t0){const o=lampPoses(LX,LY,1)[th.seed<.5?0:1];
      if(!th.done){const k=clamp((th.ti-gt)/(th.ti-th.t0),0,1);ctx.strokeStyle=`rgba(180,250,255,${.85-k*.4})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(HX,GY,24+60*k,6+14*k,0,0,Math.PI*2);ctx.stroke();
        glow(o.x,o.y,60,'rgba(200,250,255,.9)',k<.25?.8:0)}
      else if(gt-th.okT<.22){ctx.save();ctx.globalCompositeOperation='lighter';
        if(th.res==='ok'){bolt(o.x,o.y,HX+6,GY-150,th.seed,'rgba(220,250,255,.95)',4);bolt(HX+6,GY-150,HX-140,GY-260,th.seed+.3,'rgba(160,240,255,.8)',2.5)}
        else bolt(o.x,o.y,HX,GY-40,th.seed,'rgba(220,250,255,.95)',4);
        ctx.restore()}
    }
    if(th.k==='spike'&&gt>=th.t0){
      if(!th.done)spikeTell(HX+8,clamp((gt-th.t0)/(th.ti-th.t0),0,1),th.seed);
      else if(gt-th.okT<.5){const e=(gt-th.okT)/.5;
        if(th.res==='hit')reefSpikes(HX,1,1-e);
        else if(e<.05){burst(HX+8,GY-10,14,'#e6f4f0',6,.6,.4);burst(HX+8,GY-6,10,'#2a3a3e',5,.6,.5)}}
    }
  }
}
/* reef spikes (were ice): black rock thrusting up from the sea floor, a little foam. Tell: the rock splits and foams
   under the Watcher (k 0..1); hit: the spikes (a = opacity) */
function spikeTell(x,k,seed){const R=mulberry(Math.floor(seed*1e6));ctx.lineWidth=2;
  for(let i=0;i<5;i++){const a=R()*Math.PI,ex=x+Math.cos(a)*70*k,ey=GY+6+Math.sin(a)*14*k;ctx.strokeStyle=`rgba(0,0,0,${.5+k*.4})`;ctx.beginPath();ctx.moveTo(x,GY+6);ctx.lineTo(ex,ey);ctx.stroke();
    ell(ex,ey,2+k*2,1+k,`rgba(225,245,240,${.3+k*.5})`)}
  for(let i=0;i<4;i++){const b=(gt*3+i*.25)%1;ell(x+(R()-.5)*50,GY+4-b*10*k,1.5,1.5,`rgba(225,245,240,${(1-b)*k*.8})`)}}
function reefSpikes(x,k,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;
  for(let i=-2;i<=2;i++){const bx=x+i*14,h=(70-Math.abs(i)*16)*k;ctx.beginPath();ctx.moveTo(bx-9,GY+4);ctx.lineTo(bx-2,GY+4-h*.6);ctx.lineTo(bx+1,GY+4-h);ctx.lineTo(bx+9,GY+4);ctx.closePath();
    ctx.fillStyle='#0b1214';ctx.fill();ctx.strokeStyle='rgba(120,220,205,.45)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(bx-2,GY+4-h*.6);ctx.lineTo(bx+1,GY+4-h);ctx.stroke();
    ell(bx+1,GY+4-h,3.5,2,'rgba(230,248,244,.85)');ell(bx-5,GY+2,6,2.5,'rgba(230,248,244,.5)')}
  ctx.restore()}
/* the tower's sweeping beam, from the mouth of the casting bell (side: 1 = right bell, the default, -1 = left bell), at its exact
   point and angle in this frame: the slit lies across the mouth, and fades in/out with the mouth turning onto the beam (w) */
function beamShape(bx,a,side){const o=lampPoses(LX,LY,1)[side<0?0:1];if(o.cast)a*=o.w;if(a<=0)return;const nx=-o.m.y*9,ny=o.m.x*9,g=ctx.createLinearGradient(o.x,o.y,bx,GY);g.addColorStop(0,`rgba(220,252,255,${.85*a})`);g.addColorStop(1,`rgba(110,230,255,${.28*a})`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(o.x+nx,o.y+ny);ctx.lineTo(o.x-nx,o.y-ny);ctx.lineTo(bx+80,GY+16);ctx.lineTo(bx-80,GY+16);ctx.closePath();ctx.fill();ell(bx,GY+4,90,12,`rgba(200,250,255,${.25*a})`)}

