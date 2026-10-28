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
const CINE_P3={zoom:9.4,zoomD:2.6,zoomZ:2.1,reveal:3.2,revealZ:1.7,revealX:HX,revealY:GY-60};
function once(k){if(S.cineDone[k])return false;S.cineDone[k]=1;return true}
function resetCine(s){s.hatchK=0;s.hatchSnap=0;s.lampDim=0;s.ripT=0;s.cine=null;s.zapT=0;s.walkLegs=null;s.bodyBob=0;s.impT=0;s.heroPose=null;s.ghost=0;s.noAnchor=false;s.noFace=false;s.parasite=0;s.heroDX=0;s.heroDY=0;s.tfT=null;s.threats=[];s.pat=null;s.holding=false;s.cineDone={}}
function startCine(p,k){const s=p.s;resetCine(s);if(MUSIC.cur!==s.phase)MUSIC.bed(s.phase);s.demo=false;s.parts=[];s.pops=[];s.cine={k,t0:gt};s.tfBurst=s.tfFlash=s.tfAnch=false;s.tfId=(s.tfId||0)+1;s.flashT=-9}
function fadeAll(a,c){if(a<=0)return;ctx.fillStyle=`rgba(${c||'0,0,0'},${clamp(a,0,1)})`;ctx.fillRect(0,0,W,H)}
/* chapter colours (docs/CH2-SPEC.md): II tide turquoise, III roots moss green leaning yellow */
const CH_COL={2:'#4fe0cc',3:'#b9cf5a'};
function title(t,t0,eye,name,col,ncol){if(t<t0)return;const a=clamp((t-t0)/.5,0,1);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';
  ctx.font='700 16px '+LB.FONT.body;ctx.fillStyle=col;ctx.fillText(eye.toUpperCase().split('').join(String.fromCharCode(8202)),W/2,H*.42-46+(1-a)*8);
  ctx.font='800 64px '+LB.FONT.display;{const mw=ctx.measureText(name.toUpperCase()).width;if(mw>W-120)ctx.font=`800 ${Math.floor(64*(W-120)/mw)}px ${LB.FONT.display}`}ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillText(name.toUpperCase(),W/2+3,H*.42+3+(1-a)*8);ctx.fillStyle=ncol||'#f4eee4';ctx.fillText(name.toUpperCase(),W/2,H*.42+(1-a)*8);
  ctx.fillStyle=col;ctx.fillRect(W/2-60*a,H*.42+18,120*a,3);ctx.restore()}
/* end of the intro: the series name large, the chapter below it, small, in the chapter colour (as in Ember Bridge).
   Vertical layout from the measured glyph boxes, so the two lines never touch whatever the font fallback. */
const SERIES_T={size:96,sub:17,gap:22,y:.36};   // y: baseline of the name (fraction of the height), above the Watcher's lantern
function seriesTitle(t,t0,name,sub,col){if(t<t0)return;const a=clamp((t-t0)/.5,0,1),dy=(1-a)*8;ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';
  const N=name.toUpperCase(),U=sub.toUpperCase().split('').join(String.fromCharCode(8202));
  ctx.font=`800 ${SERIES_T.size}px ${LB.FONT.display}`;{const mw=ctx.measureText(N).width;if(mw>W-120)ctx.font=`800 ${Math.floor(SERIES_T.size*(W-120)/mw)}px ${LB.FONT.display}`}
  const mN=ctx.measureText(N),yN=H*SERIES_T.y+dy;
  ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillText(N,W/2+3,yN+3);ctx.fillStyle='#f4eee4';ctx.fillText(N,W/2,yN);
  ctx.font=`700 ${SERIES_T.sub}px ${LB.FONT.body}`;const mS=ctx.measureText(U),yS=yN+(mN.actualBoundingBoxDescent||0)+3+SERIES_T.gap+(mS.actualBoundingBoxAscent||SERIES_T.sub*.72);
  ctx.fillStyle=col;ctx.fillText(U,W/2,yS);ctx.fillRect(W/2-60*a,yS+(mS.actualBoundingBoxDescent||4)+12,120*a,3);ctx.restore()}
function caption(txt,a){if(a<=0)return;ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.textAlign='center';ctx.font='italic 500 22px '+LB.FONT.body;
  // too wide for the screen: two lines, cut at the space nearest the middle
  let L=[txt];if(ctx.measureText(txt).width>W-120){let c=-1;for(let i=0;i<txt.length;i++)if(txt[i]===' '&&(c<0||Math.abs(i-txt.length/2)<Math.abs(c-txt.length/2)))c=i;if(c>0)L=[txt.slice(0,c),txt.slice(c+1)]}
  L.forEach((l,i)=>{const y=H*.78+(i-(L.length-1)/2)*28;ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillText(l,W/2+2,y+2);ctx.fillStyle='#efe7ff';ctx.fillText(l,W/2,y)});ctx.restore()}
const FALL=(()=>{const R=mulberry(91);let rank=0;const ids=TOWER.map((p,i)=>i).filter(i=>!FIXED(TOWER[i].k)).sort((a,b)=>TOWER[a].e.y-TOWER[b].e.y);
  const out={};ids.forEach(i=>{const p=TOWER[i],dir=rank%2?1:-1;let x=clamp(p.e.x+dir*(50+rank*20)+(R()-.5)*20,380,945),y=GY-13,r=(R()-.5)*.5;
    if(p.k==='sbell'){y=GY-34;r=dir*Math.PI/2}else if(p.k==='seg'){y=GY-10;r=(R()-.5)*.3}else if(p.k==='head'){x=470;y=GY-38;r=-Math.PI/2}
    out[i]={x,y,r,ft:2.2+rank*.22};rank++});return out})();

