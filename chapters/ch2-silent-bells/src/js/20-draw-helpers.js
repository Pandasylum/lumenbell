/* ---------- boss animation helpers ---------- */
function curAct(kinds,tail){let best=null;for(const th of S.threats){if(!kinds.includes(th.k)||th.t0>gt)continue;const end=(th.k==='toll'?th.tw:th.ti)+tail;if(gt>end)continue;if(!best||th.t0>best.t0||(th.t0===best.t0&&Math.abs(gt-th.ti)<Math.abs(gt-best.ti)))best=th}return best}

const ARM_REST=1.62,ARM_BACK=-1.9,BACK_DIR=2.11,TWO_PI=Math.PI*2;
/* the anchor lying in the hold before the King arrives (shaft from the ring at x ~ 638 to the crown near the Watcher) */
const ANCHOR_FLOOR={x:600,y:GY-40,a:Math.PI-.08};
function anim1raw(){
  const r={lunge:0,armA:ARM_REST+Math.sin(rt*1.3)*.04,clap:BACK_DIR,onBack:true,chain:null,toll:0,coil:0,larm:0};
  const cb=S.mode==='play'&&comboAct();if(cb){comboPose(r,cb);return r}   // the anchor combo (64-prologue.js)
  const th=curAct(['slam','sweep','chain','toll'],.75);
  if(!th||S.mode!=='play')return r;
  const p=clamp((gt-th.t0)/(th.ti-th.t0),0,1),af=gt-th.ti;
  if(th.k==='slam'||th.k==='sweep'){
    const slam=th.k==='slam',gEnd=slam?.18:.2,wEnd=slam?.72:.65;
    if(af<0&&p<gEnd){const e=eio(p/gEnd);r.armA=lerp(ARM_REST,ARM_BACK,e);return r}
    r.onBack=false;
    if(af<0&&p<wEnd){const e=eio((p-gEnd)/(wEnd-gEnd));
      if(slam){r.armA=lerp(ARM_BACK,-1.3,e);r.clap=lerp(BACK_DIR,-1.3,e);r.lunge=-30*e}
      else{r.armA=lerp(ARM_BACK,.1,e);r.clap=lerp(BACK_DIR,.1,e);r.lunge=20*e}
      return r}
    if(af<0){const e=ein((p-wEnd)/(1-wEnd));
      if(slam){r.armA=r.clap=lerp(-1.3,-3.5,e);r.lunge=lerp(-30,-175,e)}
      else{r.armA=r.clap=lerp(.1,2.7,e);r.lunge=lerp(20,-165,e)}
      return r}
    const hold=.22,ret=.5,e=eio(clamp((af-hold)/ret,0,1));
    if(af>hold+ret){r.onBack=true;r.armA=lerp(ARM_BACK,ARM_REST,clamp((af-hold-ret)/.2,0,1));return r}
    if(slam){r.armA=lerp(-3.5,ARM_BACK,e);r.clap=lerp(-3.5,BACK_DIR-TWO_PI,e);r.lunge=lerp(-175,0,e)}
    else{r.armA=lerp(2.7,ARM_BACK+TWO_PI,e);r.clap=lerp(2.7,BACK_DIR,e);r.lunge=lerp(-165,0,e)}
    return r;
  }
  if(th.k==='chain'){
    r.lunge=-50;r.coil=1;r.larm=1;
    let near=null;for(const c of S.threats)if(c.k==='chain'&&c.t0===th.t0&&gt>=c.ti-.2&&gt<=c.ti+.12){near=c;break}
    if(near){const k=gt<near.ti?eout(1-(near.ti-gt)/.2):1-(gt-near.ti)/.12;r.chain={k:clamp(k,0,1),ok:near.res==='ok'}}
    if(af>.3){const e=clamp((af-.3)/.4,0,1);r.lunge=lerp(-50,0,e);r.larm=1-e}
    return r;
  }
  if(th.k==='toll'){const q=clamp((gt-th.t0)/(th.tw-th.t0),0,1);r.toll=gt<th.tw?q:Math.max(0,1-(gt-th.tw)/.5)}
  return r;
}

/* ---------- drawing primitives ---------- */
function ell(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function glow(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1}
function chainLinks(x0,y0,x1,y1,sag,col){
  const n=Math.max(4,Math.round(Math.hypot(x1-x0,y1-y0)/11));ctx.strokeStyle=col;ctx.lineWidth=3.2;
  for(let i=0;i<n;i++){const t=(i+.5)/n,x=lerp(x0,x1,t),y=lerp(y0,y1,t)+Math.sin(t*Math.PI)*sag;const a=Math.atan2(y1-y0,x1-x0);ctx.save();ctx.translate(x,y);ctx.rotate(a+(i%2?Math.PI/2*.0:0));ctx.beginPath();if(i%2)ctx.ellipse(0,0,6.5,2.2,0,0,Math.PI*2);else ctx.ellipse(0,0,6.5,4.2,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
}
function bolt(x0,y0,x1,y1,seed,col,wd){const R=mulberry(Math.floor(seed*1e6));ctx.strokeStyle=col;ctx.lineWidth=wd;ctx.beginPath();ctx.moveTo(x0,y0);const n=9;for(let i=1;i<n;i++){const t=i/n;ctx.lineTo(lerp(x0,x1,t)+(R()-.5)*40,lerp(y0,y1,t)+(R()-.5)*10)}ctx.lineTo(x1,y1);ctx.stroke()}

