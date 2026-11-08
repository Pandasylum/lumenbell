/* ---------- cinematics: phase entries and exits ---------- */
const CINE_LEN={1:{in:7.8,out:7.8},2:{in:4.8,out:7.4},3:{in:13.8,out:12.8,p2:7.4}};
/* beats inside the cinematics (s): phase I end (internal 2): the lantern drops at `drop`, touches the water after `fall`,
   sinks `depth` units in `sink`; the hatch opens at `hatch`. Phase II entry (internal 1): the King hauls the anchor off the
   floor by its chain (`haul`) and slings it on his back (`lift`, until `slung`); before that the camera comes down through
   the hatch (`desc` s, from `descD` units above). Phase II end: the hull collapses from `collapse` (`collapseD`), the deck
   opens from `open` (`openD`), the moon lights the King from `moon`.
   Phase III entry: the Watcher already stands in the open hull; the camera starts close on him (`revealZ`, on (`revealX`,
   `revealY`)) and pulls back over `reveal` s. Phase III end: the camera closes in on the bell from `zoom` over `zoomD`, up to `zoomZ`. */
const CINE_P1={drop:3.1,fall:.65,sink:3.2,depth:70,hatch:5.5,snap:.45,dim:3.8,dimD:1.1};
const CINE_P2={haul:4.0,lift:4.35,slung:4.75,desc:1.8,descD:380,collapse:1.4,collapseD:2.2,open:2.4,openD:1.4,moon:3.6};
const CINE_P3={zoom:9.4,zoomD:2.6,zoomZ:2.1,reveal:3.2,revealZ:1.7,revealX:HX,revealY:GY-60,
  /* entry, first beam (it crosses the Watcher at about 12.7 s): the lantern pulses from `pulse` (the press), the dome is held from `on` to `off` (s of the cinematic) */
  guard:{pulse:11.5,on:11.95,off:13.2}};
/* the Watcher shows the gesture in the entry of phase III: pulse of the lantern then held dome while the beam passes (nothing is drawn after `off`) */
function cineGuard(t){const G=CINE_P3.guard,on=t>=G.on&&t<G.off;S.holding=on;S.domeT0=on?(S.domeT0==null?gt:S.domeT0):null;
  S.pulse=t>=G.pulse&&t<G.off?.5-.5*Math.cos(2*Math.PI*PULSE_FX.freq*(t-G.pulse)):0}
function once(k){if(S.cineDone[k])return false;S.cineDone[k]=1;return true}
function resetCine(s){s.hatchK=0;s.hatchSnap=0;s.lampDim=0;s.ripT=0;s.cine=null;s.zapT=0;s.walkLegs=null;s.bodyBob=0;s.impT=0;s.heroPose=null;s.ghost=0;s.noAnchor=false;s.noFace=false;s.heroDX=0;s.heroDY=0;s.tfT=null;s.threats=[];s.pat=null;s.holding=false;s.domeT0=null;s.pulse=0;s.cineDone={}}
function fadeAll(a,c){if(a<=0)return;ctx.fillStyle=`rgba(${c||'0,0,0'},${clamp(a,0,1)})`;ctx.fillRect(0,0,W,H)}
/* chapter colours (docs/CH2-SPEC.md): II tide turquoise, III roots moss green leaning yellow */
const CH_COL=LB.CH_COL;   // table commune (shared/js/24-cine.js)
/* title card of a cinematic: `cap` = cap height of the name (× its font size), `gap` = space between the eyebrow and the name (px) */
const TITLE_T={cap:.78,gap:14};
function title(t,t0,eye,name,col,ncol){if(t<t0)return;const a=clamp((t-t0)/.5,0,1);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';
  // the name first (its size may shrink to fit), then the eyebrow above it: its baseline clears the cap height of the name (TITLE_T.cap) whatever the size
  ctx.font='800 64px '+LB.FONT.display;let fs=64;{const mw=ctx.measureText(name.toUpperCase()).width;if(mw>W-120){fs=Math.floor(64*(W-120)/mw);ctx.font=`800 ${fs}px ${LB.FONT.display}`}}
  const y=H*.42+(1-a)*8;ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillText(name.toUpperCase(),W/2+3,y+3);ctx.fillStyle=ncol||'#f4eee4';ctx.fillText(name.toUpperCase(),W/2,y);
  ctx.font='700 16px '+LB.FONT.body;ctx.fillStyle=col;ctx.fillText(eye.toUpperCase().split('').join(String.fromCharCode(8202)),W/2,y-fs*TITLE_T.cap-TITLE_T.gap);
  ctx.fillStyle=col;ctx.fillRect(W/2-60*a,H*.42+18,120*a,3);ctx.restore()}
const FALL=(()=>{const R=mulberry(91);let rank=0;const ids=TOWER.map((p,i)=>i).filter(i=>!FIXED(TOWER[i].k)).sort((a,b)=>TOWER[a].e.y-TOWER[b].e.y);
  const out={};ids.forEach(i=>{const p=TOWER[i],dir=rank%2?1:-1;let x=clamp(p.e.x+dir*(50+rank*20)+(R()-.5)*20,380,945),y=GY-13,r=(R()-.5)*.5;
    if(p.k==='sbell'){y=GY-34;r=dir*Math.PI/2}else if(p.k==='seg'){y=GY-10;r=(R()-.5)*.3}else if(p.k==='head'){x=470;y=GY-38;r=-Math.PI/2}
    out[i]={x,y,r,ft:2.2+rank*.22};rank++});return out})();

