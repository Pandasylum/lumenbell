/* ---------- hero ---------- */
function drawHero(){
  let ox=0,lean=0,staffA=-1.42,tint=0,guard=0,dome=0;
  const ph=S.phase;
  const hk=gt-S.hurtT;if(hk<.4){ox=-16*(1-hk/.4);tint=1-hk/.4;lean=-.12*(1-hk/.4)}
  if(ph===1){const g=gt-S.guardT;if(g<.26&&S.mode==='play'){guard=1-g/.26;staffA=lerp(-1.42,-.35,Math.min(1,guard*2))}}
  if(ph===2){const g=gt-S.dodgeT;if(g<.38){const k=Math.sin(Math.PI*g/.38);ox-=48*k;lean=-.18*k}}
  if(ph===3&&S.holding){dome=1;staffA=-1.05}
  if(ph===3&&gt<S.broken){lean=-.08;staffA=-2.1}
  if(S.cnt){const k=(gt-S.cnt.t)/S.cnt.dur;
    if(S.cnt.k===1){const out=k<.35?eout(k/.35):k<.6?1:1-eio((k-.6)/.4);ox+=360*out;staffA=k<.3?-2.4:k<.55?lerp(-2.4,.3,(k-.3)/.25):.3}
    else{staffA=lerp(-1.42,-.9,Math.min(1,k*4));lean=.06}}
  if(S.heroPose){staffA=S.heroPose.staffA;lean=S.heroPose.lean||0}
  const x=HX+ox,y=GY;
  if(S.ghost){for(let i=1;i<4;i++){ctx.globalAlpha=.2/i;heroShape(x-i*34,y,lean,staffA,0)}ctx.globalAlpha=1}
  // afterimages (dodge)
  if(ph===2&&gt-S.dodgeT<.3){ctx.globalAlpha=.25;heroShape(x+24,y,lean,staffA,0);ctx.globalAlpha=1}
  if(S.cnt&&S.cnt.k===1){const k=(gt-S.cnt.t)/S.cnt.dur;if(k<.4){for(let i=1;i<4;i++){ctx.globalAlpha=.18/i;heroShape(x-i*40,y,lean,staffA,0)}ctx.globalAlpha=1}}
  ell(x,y+2,30,6,'rgba(0,0,0,.45)');
  heroShape(x,y,lean,staffA,tint);
  // ph1 barrier arc
  if(guard>0){ctx.save();ctx.globalAlpha=guard;ctx.strokeStyle='#7fd6ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x+26,y-70,58,-1.15,1.15);ctx.stroke();ctx.globalAlpha=guard*.25;ctx.lineWidth=12;ctx.stroke();ctx.restore()}
  if(dome){const flick=S.pl.stam<.25?(Math.sin(gt*40)>0?.5:1):1;ctx.save();ctx.globalAlpha=.9*flick;
    const g=ctx.createRadialGradient(x,y-40,10,x,y-40,82);g.addColorStop(0,'rgba(127,214,255,0)');g.addColorStop(.8,'rgba(127,214,255,.14)');g.addColorStop(1,'rgba(180,240,255,.4)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,92,Math.PI,0);ctx.fill();ctx.strokeStyle='#bff0ff';ctx.lineWidth=2.5;ctx.stroke();ctx.restore()}
  // recovery bar under the Watcher: a help cue, only with the Help box ticked (the lantern turns red for a refused press)
  if(S.mode==='play'&&!S.cine&&$('optHelp').checked)LB.drawRecoveryBar(ctx,x,y,S.pl);
  // stamina bar
  if(ph===3&&S.mode==='play'&&!S.cine){const w=60;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-w/2,y-150,w,6);ctx.fillStyle=gt<S.broken?'#ff8a7a':S.pl.stam<.3?'#ffd27a':'#7fd6ff';ctx.fillRect(x-w/2,y-150,w*S.pl.stam,6)}
}
/* the Watcher, same skin as Ember Bridge */
function wizPoly(pts,f,s){ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fillStyle=f;ctx.fill();if(s){ctx.strokeStyle=s;ctx.lineWidth=2;ctx.stroke()}}
function drawWizard(o){
  const cg=ctx.createLinearGradient(0,-100,0,0);if(o.white){cg.addColorStop(0,'#ffffff');cg.addColorStop(1,'#cfd7f2')}else{cg.addColorStop(0,'#4a5c84');cg.addColorStop(1,'#222a40')}
  ctx.beginPath();
  ctx.moveTo(-17,-94);ctx.quadraticCurveTo(-30,-50,-36,0);
  ctx.lineTo(-24,-4+o.fl);ctx.lineTo(-14,2-o.fl);ctx.lineTo(-4,-3+o.fl);ctx.lineTo(8,3-o.fl);ctx.lineTo(20,-4+o.fl);ctx.lineTo(36,0);
  ctx.quadraticCurveTo(28,-50,17,-94);ctx.closePath();
  ctx.fillStyle=cg;ctx.fill();ctx.strokeStyle=o.white?'#8f9bc4':'#161b2b';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=o.white?'#e8dfc0':'#6b5036';ctx.fillRect(-26,-52,12,14);ctx.strokeStyle=o.white?'#b9ad88':'#3a2a1a';ctx.lineWidth=2;ctx.strokeRect(-26,-52,12,14);
  ctx.fillStyle=o.white?'#f2f5ff':'#3a4a70';ctx.beginPath();ctx.arc(0,-104,19,0,6.283);ctx.fill();
  wizPoly([[-14,-114],[-30,-98],[-14,-90]],o.white?'#dfe5fa':'#33415f');
  ctx.fillStyle='#07070c';ctx.beginPath();ctx.ellipse(5,-102,11,13,0,0,6.283);ctx.fill();
  ctx.fillStyle='#dff3ff';ctx.beginPath();ctx.arc(3,-103,1.8,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(11,-103,1.8,0,6.283);ctx.fill();
  wizPoly([[-5,-95],[16,-95],[21,-80],[15,-60],[8+o.fl*.5,-44],[2,-58],[-7,-72]],o.white?'#ffffff':'#e8e4dc',o.white?'#c8cfe6':'#a39d92');
  ctx.strokeStyle='#e8e4dc';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-1,-109);ctx.lineTo(7,-112);ctx.moveTo(9,-112);ctx.lineTo(17,-109);ctx.stroke();
}
function heroShape(x,y,lean,staffA,tint){
  ctx.save();ctx.translate(x,y);ctx.rotate(lean);
  const bob=Math.sin(rt*2)*1.2;
  ctx.save();ctx.translate(0,bob*.5);drawWizard({fl:Math.sin(rt*4)*1.5});ctx.restore();
  // arm, hand, staff and crystal, as in Ember Bridge (the staff angle drives the pose)
  const up=clamp((-1.42-staffA)/.45,0,1),dx=Math.cos(staffA),dy=Math.sin(staffA);
  const hand=[26+dx*4,-62-6*up+bob*.5],sb=[hand[0]-dx*60,hand[1]-dy*60],st=[hand[0]+dx*80,hand[1]+dy*80];
  ctx.lineCap='round';
  ctx.strokeStyle='#323f5e';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(23,-78+bob*.5);ctx.lineTo(hand[0],hand[1]);ctx.stroke();ctx.fillStyle='#323f5e';ctx.beginPath();ctx.arc(23,-78+bob*.5,6.5,0,6.283);ctx.fill();
  ctx.strokeStyle='#6e5238';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(sb[0],sb[1]);ctx.lineTo(st[0],st[1]);ctx.stroke();
  ctx.fillStyle='#cdb69a';ctx.beginPath();ctx.arc(hand[0],hand[1],5,0,6.283);ctx.fill();
  const lit=up>.3||S.holding;
  const dm=S.lampDim||0;   // the lantern dims (end of phase I), 0..1
  ctx.save();ctx.translate(st[0],st[1]);ctx.rotate(staffA+Math.PI/2);ctx.shadowColor=lit?'#6fd3ff':'#2d6f8f';ctx.shadowBlur=(lit?22:8)*(1-dm);ctx.fillStyle=dm>0?lerpC(lit?[216,244,255]:[127,198,230],[38,58,70],dm):lit?'#d8f4ff':'#7fc6e6';
  if(S.mode==='play'&&S.pl.deny>0){ctx.shadowColor=LB.DENY_COL;ctx.fillStyle=LB.DENY_COL}   // refused press: the lantern turns red
  ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(8,0);ctx.lineTo(0,10);ctx.lineTo(-8,0);ctx.closePath();ctx.fill();ctx.restore();
  ctx.restore();
  const c=Math.cos(lean),s=Math.sin(lean);S.orbX=x+st[0]*c-st[1]*s;S.orbY=y+st[0]*s+st[1]*c;
  if(tint>0){ctx.save();ctx.globalAlpha=tint*.5;ctx.fillStyle='#ff4a3a';ctx.beginPath();ctx.ellipse(x,y-60,32,66,0,0,Math.PI*2);ctx.fill();ctx.restore()}
}

