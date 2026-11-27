/* ================= PHASE III : le Colosse du Clocher (rendu et poses seulement) =================
   Poses et effets de la maquette validée colosse-clocher.js (27/11) : le Colosse de la phase I (COLOSSE, 28-boss-body.js) remplace l'ancienne silhouette ;
   marteau à deux mains, boule enchaînée, griffes, charge-piétinement-geyser, souffle et vagues d'ailes en tornades de feu.
   Les images clés sont calées sur les instants d'impact du jeu (R.atk.hits) : timings, dégâts et positions de jeu ne bougent pas.
   Hors maquette (rage, contres, cloche, foudre, corne : lot 2), le Colosse suit les mains de l'ancienne pose (col3Fb). Aucun texte, aucun canvas créé,
   ni filtre ni ombre portée ; mouvement réduit : plus d'éclats, plus de vacillement, plus de mouvements de vie. */
const C3=1.1;        /* unités de pose -> monde (comme la phase I) */
const C3X=-20;       /* le repère du Colosse est à R.bx-20 : son cœur reste là où visent les contres */
const K3TAU=6.283185307179586;
const KNEEL3=76;     /* final : de combien le buste descend quand le Colosse met un genou à terre (px) */
const k3cl=u=>u<0?0:u>1?1:u,k3ez=u=>{u=k3cl(u);return u*u*(3-2*u)},k3l=(a,b,u)=>a+(b-a)*u;
const k3poly=COLFX.poly,k3star=COLFX.etoile,k3shards=COLFX.eclats,k3flame=COLFX.flamme;
const k3rnd=s=>()=>(s=(s*16807)%2147483647)/2147483647;
const k3mix=(p,q,u)=>{const o={};for(const k in p){const a=p[k],b=k in q?q[k]:a;o[k]=Array.isArray(a)?a.map((v,i)=>v+(b[i]-v)*u):typeof a==='number'?a+(b-a)*u:b}return o};
/* images clés : [temps, pose, accélération?] ; 'i' = le segment qui finit à cette clé accélère (coup, élan), 'o' = il ralentit sans s'arrêter (arrivée) ; sinon doux aux deux bouts */
const k3ease={i:u=>Math.pow(u,1.35),o:u=>1-Math.pow(1-u,1.5),l:u=>u};
const k3keys=(t,K)=>{if(t<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++)if(t<=K[i][0]){const u=k3cl((t-K[i-1][0])/(K[i][0]-K[i-1][0]));return k3mix(K[i-1][1],K[i][1],K[i][2]?k3ease[K[i][2]](u):k3ez(u))}return K[K.length-1][1]};
const k3val=(t,K)=>k3keys(t,K.map(([a,v])=>[a,{v}])).v;
const k3bump=(t,a,b,m=.12)=>k3ez((t-a)/m)*(1-k3ez((t-b)/m));
/* poses (unités de pose) : lean/drop/sx/dF/dN = buste, off/nn = mains lointaine et proche, P/a/g/wN/wF/s/r = marteau et boule (voir COLOSSE.draw),
   dx = décalage du corps (px), fx/fl/fa et nx/nl/na = jambes lointaine et proche (x, levée, angle), tx/ty = bout de la chaîne, wa/ws = ailes */
const K3B={lean:0,drop:0,sx:1,dF:0,dN:0,off:[-62,92],nn:[0,0],plie:0,tete:0,P:[24,-192],a:150,g:200,wN:1,wF:1,s:1,r:0,dx:0,jaw:0,wa:0,ws:1,griffe:0,yeux:.25,fx:0,fl:0,fa:0,nx:0,nl:0,na:0,tx:-34,ty:-128,heat:0};
const K3_GARDE={...K3B},K3_ARME={...K3B,lean:.22,sx:.92,dF:16,dN:-40,P:[-5,-285],a:50,g:205},
  K3_FRAPPE={...K3B,dx:56,lean:-.45,drop:22,sx:1.04,dF:16,dN:-60,P:[-135,-126],a:-201,g:205},
  K3_FRAPPE2={...K3B,dx:50,lean:-.38,drop:16,sx:1.03,dF:16,dN:-56,P:[-128,-118],a:-197,g:205},
  K3_DOS={...K3B,P:[94,-256],a:-62,g:50,wN:0,wF:0,r:1};     /* marteau rangé dans le dos, boule en bandoulière, mains libres */
const COL3={last:null,lastT:-9,f:{x0:0,y0:DECK,bx:0,flip:false},k:null,m:{},mouth:null};
/* pose -> monde (le Colosse retourné pour la charge Difficile se reflète autour de R.bx, comme l'ancien corps) */
const col3W=p=>{const f=COL3.f,m=C3*(f.m||1);return f.flip?[2*f.bx-(f.x0+p[0]*m),f.y0+p[1]*C3]:[f.x0+p[0]*m,f.y0+p[1]*C3]};   /* f.m : pivot du coup de queue (face x écrasement) */
/* ---- poses d'attaque : chacune rend une pose complète d'après R.atk, calée sur les impacts ---- */
function col3Hammer(a){
  /* garde, armé, frappe, combo : 2 coups (combo) ou 3 coups ; les coups Difficile sont recalés sur les images de base (swq) */
  const two=a.kind==='sword2'&&!a.hard3,H=two?[.75,1.4]:[.75,1.4,2.05],q=a.hard3?swq(a):a.pt;
  const ks=[[0,K3_DOS],[.22,K3_GARDE,'i']];
  H.forEach((T,i)=>{const F=i%2?K3_FRAPPE2:K3_FRAPPE;ks.push([T-.14,K3_ARME,'l'],[T,F,'i'],[T+.14,F])});
  ks.push([H[H.length-1]+.5,K3_ARME]);
  return {...k3keys(q,ks)};
}
function col3Stab(a){
  /* seconde vie, Difficile : coup de bélier du marteau (à l'horizontale), combo, puis marteau planté et explosion */
  const q=a.pt,PULL={...K3B,lean:.28,sx:.92,drop:4,dF:14,dN:-34,P:[64,-150],a:180,g:205},
    THR={...K3B,dx:44,lean:-.42,drop:14,sx:1.04,dF:16,dN:-56,P:[-128,-140],a:180,g:205},
    PLANT={...K3B,dx:20,lean:-.32,drop:18,sx:1.02,dF:14,dN:-44,P:[-62,-160],a:-220,g:205};
  const ks=[[0,K3_DOS],[.2,K3_GARDE,'i'],[.5,PULL,'l'],[.62,PULL],[.85,THR,'i'],[1.1,THR],[1.7,K3_ARME]];
  [1.95,2.45,2.95].forEach((T,i)=>{const F=i%2?K3_FRAPPE2:K3_FRAPPE;ks.push([T-.14,K3_ARME,'l'],[T,F,'i'],[T+.12,F])});
  ks.push([3.35,K3_ARME],[3.9,PLANT],[4.2,PLANT],[4.7,K3_ARME]);
  const o={...k3keys(q,ks)};
  o.heat=k3bump(q,3.35,3.95,.2);   /* la tête du marteau se charge avant l'explosion */
  return o;
}
function col3Whip(a){
  /* il décroche la boule de sa bandoulière, la fait tournoyer au-dessus de lui, puis la lance ; elle rebondit et revient à la bandoulière.
     Temps canonique : le coup tombe à .75 (recalé par aq en Difficile, comme l'ancienne pose). */
  const q=DIFF.hard?aq(a,'whip',.75):a.pt,D=K3_DOS,TX=(PX+6-(R.bx+C3X))/C3,TY=-72/C3;
  const tirer={...D,lean:.16,off:[34,-74],tx:46,ty:-300,s:0},jet={...D,lean:-.3,drop:10,off:[-120,20],tx:TX,ty:TY,s:0,dN:-20};
  const o={...k3keys(q,[[0,{...D,s:1}],[.15,{...D,s:0,off:[-40,10],tx:-90,ty:-110}],[.45,tirer],[.75,jet],[1,{...jet,off:[-60,60],tx:-100,ty:-250,lean:-.1}],[1.25,{...D,s:1}]])};
  if(q>.1&&q<.5){const an=(q-.1)*15,k=k3bump(q,.12,.45,.08);o.tx=k3l(o.tx,30+Math.cos(an)*130,k);o.ty=k3l(o.ty,-285+Math.sin(an)*46,k)}
  if(q>=.45&&q<.76){const u=k3ez((q-.45)/.3);o.tx=k3l(46,TX,u);o.ty=k3l(-300,TY,u)-90*Math.sin(u*Math.PI)}
  if(q>=.75&&q<1){const u=k3ez((q-.75)/.25);o.tx=k3l(TX,-100,u);o.ty=k3l(TY,-250,u)-50*Math.sin(u*Math.PI)}
  o.heat=q>.1&&q<.8?1:0;
  return o;
}
const col3BreathQ=a=>(a.hq||a.cf!=null)?aq(a,'breath',1.0):a.pt;
function col3Breath(a){
  const q=col3BreathQ(a),D=K3_DOS,asp={...D,lean:.2,tete:.3,off:[-40,70]},cra={...D,lean:-.24,tete:-.16,jaw:12,off:[-84,60],nn:[20,-10]};
  return {...k3keys(q,[[0,D],[.4,asp],[.65,cra],[1.4,cra],[1.9,D]])};
}
function col3Claws(a){
  /* griffes sorties, il avance d'un pas, lève la patte puis tranche : une levée juste avant chaque coup */
  const t=a.t,C=a.hits.filter(h=>h.k==='claw').map(h=>h.at),C0=C[0],Cl=C[C.length-1],D=K3_DOS,
    leve={...D,lean:.2,off:[14,-100],nn:[-34,-214],tete:.1,jaw:8},coupe={...D,lean:-.38,drop:16,off:[-128,50],nn:[-158,-34],tete:-.12,jaw:12};
  const ks=[[0,D]];C.forEach(T=>ks.push([T-.25,leve],[T,coupe]));ks.push([Cl+.45,{...D,lean:-.1,off:[-90,60],nn:[-50,10]}]);
  const o={...k3keys(t,ks)};
  o.dx=-168*k3val(t,[[0,0],[C0-.25,0],[C0,1],[Cl+.2,1],[Cl+.5,0]]);
  o.griffe=k3val(t,[[0,0],[C0-.62,0],[C0-.46,1.3],[C0-.35,1],[Cl+.35,1],[Cl+.5,0]]);
  o.yeux=.25+.6*k3bump(t,C0-.6,Cl+.2,.12);
  return o;
}
function col3Waves(a){
  const W=a.hits.filter(h=>h.k==='wave').map(h=>h.at-(a.off||0)),base={...K3_DOS,off:[-30,62],nn:[44,-44]};
  return {...k3keys(a.pt,[[0,K3_DOS],[W[0]-.65,base],[W[W.length-1]+.2,base],[W[W.length-1]+.5,K3_DOS]])};
}
/* battement des ailes à chaque tornade (superposé à toute pose) : le buste se renverse ailes levées et plonge au coup d'aile */
function col3WaveFlap(a){
  const W=a.hits.filter(h=>h.k==='wave');if(!W.length)return null;
  const t=a.t,first=W[0].at,last=W[W.length-1].at;let w=0;
  W.forEach(h=>{const v=k3val(t-h.at,[[-.78,0],[-.55,-1],[-.34,1.1],[-.12,0]]);if(Math.abs(v)>Math.abs(w))w=v});
  const act=k3bump(t,first-.95,last+.15,.25);
  return {wa:w*.3,ws:1+.4*act,lean:.16*Math.max(0,-w)-.2*Math.max(0,w),tete:-.1*act,jaw:10*act,drop:8*Math.max(0,w)};
}
function col3Charge(a){
  /* il gratte la pierre, court (vraie course : jambes, bras), pied levé haut puis écrasé ; Difficile : traverse, se retourne, recharge.
     Sa position vient de R.bx (chargeX / chargeXH) : seuls les membres bougent ici. */
  const q=a.pt,off=a.off||0,hard=!!a.h,D=K3_DOS,m=COL3.m;
  const PREP={...D,lean:-.18,drop:14,off:[-30,86],nn:[26,6],tete:-.2,jaw:7},CORS={...D,lean:-.42,drop:6,tete:-.24,jaw:12,sx:1.04},DOSUP={...D,lean:.05},
    REAR={...D,lean:.2,off:[-90,20],nn:[10,-60],tete:.1},SLAM={...D,lean:-.2,drop:18,off:[-96,60],nn:[-30,0]};
  const winds=hard?[[0,.35],[2.6,2.95]]:[[0,.35]],runs=hard?[[.35,1.45],[2.95,3.7]]:[[.35,1.02]];
  const hq=k=>a.hits.filter(h=>h.k===k).map(h=>h.at-off),stomps=hq('stomp'),gey=hq('geyser'),sl=stomps.map(x=>x-.34);
  gey.forEach(g=>{if(!stomps.some(s=>g-s>0&&g-s<1))sl.push(g-.34)});sl.sort((x,y)=>x-y);
  const ev=[...winds.map(w=>[w[0],'w',w]),...runs.map(r=>[r[0],'r',r]),...sl.map(s=>[s-.3,'s',s])].sort((x,y)=>x[0]-y[0]),ks=[[0,D]];let last=0;
  ev.forEach(([,k,v])=>{
    if(k==='w'){ks.push([Math.max(last+.05,v[0]+.1),PREP],[v[1],PREP]);last=v[1]}
    else if(k==='r'){ks.push([Math.max(last+.05,v[0]+.08),CORS],[v[1],CORS]);last=v[1]}
    else{ks.push([Math.max(last+.08,v-.3),REAR],[v,SLAM],[v+.35,DOSUP]);last=v+.35}
  });
  const o={...k3keys(q,ks)};
  /* il gratte la pierre avant de partir */
  winds.forEach(w=>{if(q>w[0]+.05&&q<w[1]){const s=Math.sin((q-w[0])*21);o.na=.3*s;o.nl=Math.max(0,s)*26}});
  /* course : jambes et bras en opposition, le buste rebondit */
  let court=0,rs=0;runs.forEach(([r0,r1])=>{const c=k3bump(q,r0+.08,r1,.08);if(c>court){court=c;rs=r0+.08}});
  if(court>0){const p=(q-rs)*K3TAU*2.9,s=Math.sin(p),cs=Math.cos(p);
    o.na=.62*s*court;o.fa=-.62*s*court;o.nl=Math.max(0,cs)*52*court;o.fl=Math.max(0,-cs)*52*court;o.drop+=(Math.abs(cs)*-13+9)*court;
    o.off=[k3l(o.off[0],-66+92*s,court),k3l(o.off[1],52-34*cs,court)];o.nn=[k3l(o.nn[0],-70-92*s,court),k3l(o.nn[1],-52+34*cs,court)]}
  /* recul à petits pas après le choc (Normal : il revient à sa place) */
  if(!hard){const bk=k3bump(q,1.02,1.5,.08);if(bk>0){const p=(q-1.02)*K3TAU*2.2,s=Math.sin(p),cs=Math.cos(p);o.na+=.25*s*bk;o.fa-=.25*s*bk;o.nl+=Math.max(0,cs)*14*bk;o.fl+=Math.max(0,-cs)*14*bk}}
  /* le pied levé très haut, puis écrasé */
  sl.forEach(T=>{const lev=k3val(q,[[T-.36,0],[T-.14,1],[T-.06,1],[T,0]]);o.nl+=96*lev;o.na+=.42*lev});
  m.court=court;m.winds=winds;m.runs=runs;m.sl=sl;m.q=q;
  return o;
}
/* ===== rage : coup de queue en pivot (maquette validée colosse-queue-onde.js, 27/11) =====
   Coups 'blast' avec flap (espacés de .65 s, 1 à 3) : il se ramasse, pivote (de face, écrasé, de dos, retourné en miroir) et frappe avec sa vraie queue,
   ras du sol puis de haut en bas, en alternance ; après le dernier il se retourne et retombe lourdement. Tout est calé sur les impacts (F). */
const Q3T={gath:.16,piv:.26,lead:.21,back:.18,piv2:.26};   /* ramassé, pivot, fin du pivot avant le 1er impact, départ du retour après le dernier, retour */
/* queue retournée : repère de pose, x positif = vers le Veilleur (le corps est en miroir) ; A = ras du sol, B = de haut en bas */
const Q3R=[[40,-120],[-90,-50],[-60,10],[-190,-24]],Q3F=[[40,-120],[80,10],[10,10],[-80,-30]],
  Q3A=[[-.33,[[40,-130],[-120,-110],[-180,-180],[-170,-250]]],[-.17,[[40,-110],[-110,-30],[-170,-20],[-215,-60]]],[0,[[40,-110],[110,40],[220,20],[305,-44]],1],[.19,[[40,-130],[130,-60],[170,-110],[215,-170]]]],
  Q3B=[[-.45,[[40,-150],[-40,-240],[-90,-330],[-30,-390]]],[-.2,[[40,-160],[20,-330],[90,-430],[150,-390]]],[0,[[40,-180],[170,-300],[270,-210],[302,-62]],1],[.2,[[40,-130],[150,-110],[250,10],[270,-10]]]];
function col3QZ(a){
  const F=a.hits.filter(h=>h.flap).map(h=>h.at);if(!F.length)return null;
  const P1=F[0]-Q3T.lead,P0=P1-Q3T.piv,HL=F[F.length-1],R0=HL+Q3T.back,R1=R0+Q3T.piv2;
  const ks=[[P1,Q3A[0][1]]];
  F.forEach((H,i)=>{const K=i%2?Q3B:Q3A;K.forEach(([d,p,imp])=>{if(i===0&&d<-.3)return;ks.push([H+(i===0&&d<0?Math.max(d,-.12):d),p,imp])})});
  ks.push([R0+.08,Q3F]);
  return {F,P0,P1,HL,R0,R1,s0:P0-Q3T.gath,ks};
}
/* points de la queue retournée à l'instant t ; fx : facteur qui pose la pointe sur la garde au moment de l'impact */
function col3QPts(Z,t,fx){const K=Z.ks;let P=K[K.length-1][1];
  if(t<=K[0][0])P=K[0][1];else for(let i=1;i<K.length;i++)if(t<=K[i][0]){let u=k3cl((t-K[i-1][0])/(K[i][0]-K[i-1][0]));u=K[i][2]?u*u:k3ez(u);P=K[i-1][1].map((p,j)=>[k3l(p[0],K[i][1][j][0],u),k3l(p[1],K[i][1][j][1],u)]);break}
  return P.map((p,i)=>i?[p[0]*fx,p[1]]:p)}
/* pivot (de face, écrasé, de dos, retourné) : u de 0 à 1 sur la durée d ; sens 1 = il se détourne, -1 = il revient */
function col3Tourn(t,a0,d,sens){const u=(t-a0)/d;if(u<0||u>1)return null;
  if(u<.28)return {face:sens>0?1:-1,etr:1-.42*k3ez(u/.28)};
  if(u<.72)return {dos:sens,etr:.82+.18*Math.sin((u-.28)/.44*Math.PI),v:(u-.28)/.44};
  return {face:sens>0?-1:1,etr:.58+.42*k3ez((u-.72)/.28)}}
const col3QFx=x0=>Math.max(.6,(x0-(GUARD[0]+4))/C3/304);
function col3Queue(a,base,ob){
  const Z=col3QZ(a);if(!Z||COL3.f.flip)return null;
  const t=a.t;if(t<Z.s0)return null;
  const D=K3_DOS,ram={...D,lean:.14,plie:.65,drop:10,sx:.96,off:[-100,40],nn:[40,-20],tete:.12},tou={...D,lean:-.2,plie:.45,drop:8,off:[-90,10],nn:[-10,-70],tete:-.1,jaw:9},
    hau={...D,lean:.1,plie:.2,off:[-80,0],nn:[20,-90],jaw:6},cou={...D,lean:-.34,plie:.8,drop:20,off:[-110,70],nn:[-30,10],tete:-.14,jaw:13},atr={...D,plie:.9,drop:22,lean:-.1};
  const ks=[[Z.P0,ram],[Z.P1,tou]];
  Z.F.forEach((H,i)=>{if(i%2)ks.push([H-.38,hau],[H-.2,hau]);else if(i)ks.push([H-.3,tou]);ks.push([H,cou,'i'],[H+.18,cou])});
  ks.push([Z.R0+.06,ram],[Z.R1,atr,'i'],[Z.R1+.4,D]);
  let o=k3keys(t,ks);const w=k3ez((t-Z.s0)/Q3T.gath);if(w<1)o=k3mix(base,o,w);
  o={...o,wa:ob.wa,ws:ob.ws};
  /* petits élans du corps : il recule en se ramassant, se jette vers le Veilleur à chaque impact */
  o.dx=(o.dx||0)*(1-w)+12*k3bump(t,Z.s0,Z.P0+.1,.1)-Z.F.reduce((m,H)=>m+12*k3val(t-H,[[-.2,0],[0,1],[.3,0]]),0);
  /* il décolle les pieds pendant le pivot et retombe lourdement après le retour */
  const saut=Math.max(k3bump(t,Z.P0+.03,Z.P0+.2,.07),k3bump(t,Z.R0+.03,Z.R0+.2,.07));o.nl=(o.nl||0)+34*saut;o.fl=(o.fl||0)+18*saut;
  const st=col3Tourn(t,Z.P0,Q3T.piv,1)||col3Tourn(t,Z.R0,Q3T.piv2,-1)||{face:t>Z.P0&&t<Z.R0?-1:1,etr:1};
  o.face=st.face||1;o.etr=st.etr;o.dos=st.dos||0;o.qP=null;o.qD=null;
  if(o.face<0)o.qP=col3QPts(Z,t,col3QFx(R.bx+C3X+o.dx));
  else if(!o.dos&&t<Z.P0+.1){const k=k3ez((t-Z.s0)/(Z.P0-Z.s0+.05));o.qP=[[30,-130],[150,-60-120*k],[130+60*k,18-190*k],[232-40*k,-26-200*k]]}   /* la queue se dresse avant le pivot */
  if(o.dos){const v=o.dos>0?st.v:1-st.v;o.qD=[[k3l(110,-110,v),30],[k3l(250,-250,v),10],[k3l(300,-310,v),-60-50*Math.sin(v*Math.PI)]]}
  o.Z=Z;return o;
}
/* pointe de la queue dans le monde à l'instant t (traînée de feu) */
function col3QTip(Z,t,x0){const p=col3QPts(Z,t,col3QFx(x0))[3];return [x0-p[0]*C3,DECK+p[1]*C3]}
/* ===== onde de flammes (maquette validée) : il aspire le feu, abat ses poings, la vague court sur les dalles jusqu'à la garde =====
   Coups 'blast' sans flap (et pré-coups des ultimes). Temps de la maquette m : aspiration .25, poings abattus 1.65 (IMP), vague à la garde 2.1 (VG) = l'impact du jeu.
   Préparation raccourcie quand le coup précédent est proche (trajet de la vague raccourci sous 1,2 s de marge). */
const ONDE={imp:1.65,vg:2.1,prep:1.4,trav:.45,full:1.85};
function col3OndeM(a,h){
  let prev=0;for(const x of a.hits){if(x===h)break;prev=x.at}
  const A=Math.min(ONDE.full,h.at-prev-.05),tr=A>=1.2?ONDE.trav:Math.max(.22,A*.38),Lp=Math.max(.1,A-tr),d=a.t-h.at;
  return d>=0?ONDE.vg+d:d>=-tr?ONDE.vg+d*(ONDE.vg-ONDE.imp)/tr:ONDE.imp+(d+tr)*ONDE.prep/Lp;
}
const col3IsOnde=(a,h)=>h.k==='blast'&&!h.flap&&!(a.h&&a.kind==='greatsword'&&!h.pre);
function col3Onde(a){
  let h=null,m=-9,pn=false;
  for(const x of a.hits){if(!col3IsOnde(a,x))continue;const mm=col3OndeM(a,x);if(mm>=.15&&mm<3.3){pn=h!=null&&m>=ONDE.imp;h=x;m=mm}}   /* le dernier coup entamé ; s'il suit un coup déjà abattu, il repart de la pose basse */
  if(!h)return null;
  const D=K3_DOS,haut={...D,lean:.22,plie:0,sx:.95,off:[-20,-110],nn:[-60,-230],tete:.28,jaw:12},bas={...D,lean:-.46,plie:1,drop:30,sx:1.06,off:[-118,150],nn:[-118,92],tete:-.1,jaw:15};
  const o={...k3keys(m,[[0,pn?bas:D],[.3,{...D,plie:.5,drop:8,lean:-.12,off:[-40,80]}],[1.1,haut],[1.45,haut],[ONDE.imp,bas,'i'],[2.5,bas],[3.3,D]])};
  o.wa=-.3*k3bump(m,1,1.45)+.35*k3bump(m,ONDE.imp,2,.08);o.ws=1+.28*k3bump(m,.8,1.6);o.yeux=.5+.5*k3bump(m,.3,1.9);
  o.m=m;
  if(!reduce&&m>.3&&m<1.45)o.dx=Math.sin(R.time*60)*3*k3ez((m-.3)/1);   /* il tremble en aspirant le feu */
  return o;
}
/* pose d'après l'ancienne pose (mains, rugissement, entrée, chute, final) : attaques absentes de la maquette, mêmes mains qu'avant */
function col3Fb(ob){
  const fin=R.mode==='finale',c=fin?Math.cos(-ob.lean):1,sn=fin?Math.sin(-ob.lean):0;
  const loc=h=>{const dx=h[0]-ob.x,dy=h[1]-DECK;return fin?[dx*c-dy*sn,dx*sn+dy*c]:[dx,dy]};
  const h0=loc(ob.hands[0]),h1=loc(ob.hands[1]);
  const o={...K3_DOS,off:[-62+(h0[0]+128)/C3,92+(h0[1]+66)/C3],nn:[(h1[0]-128)/C3,(h1[1]+66)/C3],lean:fin?0:ob.lean,jaw:ob.jaw,wa:ob.wa,ws:ob.ws,yeux:ob.jaw>8?.6:.25,warm:ob.warm};
  if(ob.kd&&ob.kd.on){
    /* final : le corps entier tombe en avant (rotation autour des pieds, voir drawBoss3), bras tendus devant pour se rattraper, puis il se redresse sur les genoux, la tête basse ; le feu s'éteint */
    const f=ob.kd,k=f.k,r=f.r,L2=(a,b,u)=>a+(b-a)*u;
    Object.assign(o,{kneel:k,kdk:KNEEL3/C3,drop:KNEEL3/C3*k,out:f.out,lean:-.17*f.bow,tete:-.15*r*(1-k)+.85*f.bow,yeux:.25*(1-f.out),jaw:6*r*(1-k),
      off:[L2(L2(-62,-75,r),-32,k),L2(L2(92,-70,r),94,k)],nn:[L2(L2(0,-95,r),-50,k),L2(L2(0,-60,r),-4,k)],ws:1+.5*r,wa:.25*r});
  }
  if(ob.sword&&ob.sword.l>1){
    /* la masse brandie au final : les deux poings sur le manche */
    const X0=ob.x+C3X,s=ob.sword;
    Object.assign(o,{P:[(s.h[0]-X0)/C3,(s.h[1]-DECK)/C3],a:s.a*180/Math.PI,g:Math.max(1,(s.l-17)/C3),wN:1,wF:1,s:1,r:0,heat:s.heat});
  }else if(ob.nostow){o.P=[0,3000];o.r=0}   /* la masse a été jetée : plus rien dans le dos */
  return o;
}
/* préchauffage (entrée de la phase III) : une image quasi invisible de chaque pose du marteau, pour que le premier coup ne paie ni l'envoi des calques au processeur graphique ni la compilation du dessin */
function col3Warm(c){
  if(COL3.warm)return;COL3.warm=1;
  [K3_GARDE,K3_ARME,K3_FRAPPE,K3_FRAPPE2,K3_DOS].forEach(o=>{c.save();c.globalAlpha=.02;c.translate(8,H-8);c.scale(.12,.12);
    COLOSSE.draw(c,{lean:o.lean,drop:o.drop,sx:o.sx,dF:o.dF,dN:o.dN,off:o.off,nn:o.nn,plie:0,tete:0,jaw:0,t:0,warm:1,eyes:.25,legs:{f:[0,0,0],n:[0,0,0]},tip:[o.tx,o.ty],heat:0,sag:20,ham:{P:o.P,a:o.a,g:o.g,wN:o.wN,wF:o.wF,s:o.s,r:o.r}});c.restore()});
  c.save();c.globalAlpha=.02;c.translate(8,H-8);c.scale(-.12,.12);COLOSSE.draw(c,{...K3_DOS,dos:1,qD:[[0,30],[0,10],[0,-110]],plie:0,tete:0,jaw:0,t:0,warm:1,legs:{f:[0,0,0],n:[0,0,0]},ham:{P:K3_DOS.P,a:K3_DOS.a,g:K3_DOS.g,wN:0,wF:0,s:1,r:1}});c.restore();
}
/* mouvements de vie : respiration, poids qui passe d'une épaule à l'autre, mains qui flottent, tête qui cherche, yeux qui palpitent */
function col3Life(o,t){
  if(reduce)return;
  const s=Math.sin;
  o.lean+=.01*s(t*.7);o.sx+=.006*s(t*2.2);o.dF+=2*s(t*.9);o.dN+=2*s(t*.9+1.3);
  o.off=[o.off[0]+2*s(t*1.3),o.off[1]+3*s(t*1.7+1)];o.nn=[o.nn[0]+2*s(t*1.1+2),o.nn[1]+3*s(t*1.5)];
  o.tete+=.06*s(t*.8)+.03*s(t*2.3);o.jaw+=Math.max(0,s(t*2.2))*2.5;o.yeux+=.06*s(t*3.1);o.wa+=.05*s(t*1.3);
}
function col3Atk(a){
  const q=a.pt,K=(a.cf!=null&&q>=a.cf)?'breath':a.kind;
  if(q<0)return null;
  if(K==='charge')return col3Charge(a);
  if(a.h&&K==='greatsword')return col3Stab(a);
  if(K==='greatsword'||K==='sword2')return col3Hammer(a);
  if(K==='whip')return col3Whip(a);
  if(K==='breath')return col3Breath(a);
  if(a.kind==='claws')return col3Claws(a);
  if(a.kind==='waves')return col3Waves(a);
  return null;
}
/* pose finale du Colosse pour cette image : { o: paramètres COLOSSE, ported: pose de la maquette } */
function col3Pose(ob){
  const a=R.atk,t=R.time,fin=R.mode==='finale';
  COL3.m={};
  const fb=col3Fb(ob);
  let po=a&&!fin?col3Atk(a):null;
  const idle=!a&&R.mode==='play'&&R.boss.s!=='heal'&&R.boss.s!=='dead';
  if(idle)col3Life(fb,t);
  let rk=0;
  if(a)a.hits.forEach(h=>{if(h.pre)rk=Math.max(rk,k3cl(a.t/.5)*(1-k3ez((a.t-h.at-.15)/.5)))});   /* le rugissement avant une rage : mains levées, gueule ouverte */
  let o;
  if(po){COL3.last=po;COL3.lastT=t;o=rk>.02?k3mix(po,fb,rk):po}
  else if(!a&&COL3.last&&R.mode==='play'&&t-COL3.lastT<.5)o=k3mix(COL3.last,fb,k3ez((t-COL3.lastT)/.45));   /* fin d'attaque : retour doux à la garde */
  else o=fb;
  if(po&&!a.hits.some(h=>h.k==='wave')){o.wa=ob.wa;o.ws=ob.ws}
  const on=a&&!fin?col3Onde(a):null;
  if(on){const pw=po?k3ez((on.m-2.25)/.35):0;o=rk>.02?k3mix(on,fb,rk*.35):on;if(pw>0)o=k3mix(o,po,pw);COL3.last=o;COL3.lastT=t;po=o}   /* l'attaque qui suit reprend la main en douceur */   /* onde de flammes : il aspire le feu, abat ses poings */
  const qz=a&&!fin?col3Queue(a,o,ob):null;
  if(qz){o=qz;COL3.last=qz;COL3.lastT=t;po=qz}   /* coup de queue en pivot (rage) */
  const wv=a&&!fin?col3WaveFlap(a):null;
  if(wv){o.wa=wv.wa;o.ws=wv.ws;o.lean+=wv.lean;o.tete+=wv.tete;o.jaw=Math.max(o.jaw,wv.jaw);o.drop+=wv.drop}
  o.ported=!!po;
  return o;
}
/* ---- effets portés de la maquette (aplats nets : ni flou ni ombre portée ; mouvement réduit : plus d'éclats ni de vacillement) ---- */
function k3glow(c,x,y,r,rgb,al){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+rgb+','+al+')');g.addColorStop(.35,'rgba('+rgb+','+al*.4+')');g.addColorStop(1,'rgba('+rgb+',0)');c.save();c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore()}
function k3contact(c,p,u,r,seed,cols){if(u<0)return;cols=cols||['#ffe9a0','#dcae5c','#fff6d8'];
  if(u<.2){k3star(c,p[0],p[1],r*(1-u*3),8,.3,'#ffe9a0',.4);k3star(c,p[0],p[1],r*.5*(1-u*4),8,.7,'#fffbea',.4)}
  if(!reduce)k3shards(c,p[0],p[1],u,18,cols,250,seed,DECK+5)}
function k3pas(c,x,u,force,seed){if(u<0||u>.8)return;force=force||1;
  for(let i=0;i<7;i++){const k=(i-3)/3,px=x+k*(26+u*150*force),r=(9+i%3*5)*force*(1+u),p=[];
    for(let j=0;j<7;j++){const an=j*.9+i;p.push([px+Math.cos(an)*r*(j%2?.8:1.2),DECK+2-r*.35-u*22+Math.sin(an)*r*.5*(j%2?.8:1)])}
    k3poly(c,p,'rgba(150,140,186,'+.75*(1-u/.8)+')')}
  if(!reduce)k3shards(c,x,DECK-4,u,Math.round(9*force),['#9a9cc8','#4a4a74','#d5dcf6'],210*force,seed,DECK+6)}
function k3slash(c,x0,y0,x1,y1,w,col){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,mx=(x0+x1)/2,my=(y0+y1)/2;k3poly(c,[[x0,y0],[mx+nx*w,my+ny*w],[x1,y1],[mx-nx*w*.35,my-ny*w*.35]],col)}
function k3trois(c,x,y,sens,u){if(u<=0||u>=1)return;const L=190;c.save();c.globalAlpha=u<.5?1:1-(u-.5)*2;const e=k3cl(u*3.5);
  for(let i=0;i<3;i++){const ox=i*32-32,x0=x+ox+L*.45*sens,y0=y-L*.5+i*8,x1=k3l(x0,x+ox-L*.45*sens,e),y1=k3l(y0,y+L*.5+i*8,e);
    k3slash(c,x0,y0,x1,y1,19,'#d4501f');k3slash(c,x0,y0,x1,y1,10,'#ffb84a');k3slash(c,x0,y0,x1,y1,3,'#fff6d8')}
  c.restore()}
/* griffes d'une main : de l'avant-bras vers le poignet (dans le repère de pose, appelé depuis COLOSSE.draw) */
function k3griffes(c,E,W,k){const an=Math.atan2(W[1]-E[1],W[0]-E[0]);c.save();c.translate(W[0],W[1]);c.rotate(an);
  [[-17,-.34,.92],[0,0,1.12],[17,.34,.92]].forEach(([y,r,l])=>{c.save();c.translate(16,y);c.rotate(r);c.scale(k*l*1.5,Math.min(1,k)*1.25);
    k3poly(c,[[-6,-7],[22,-8],[42,-2],[52,12],[34,4],[14,3],[-6,7]],'#14060f');k3poly(c,[[-3,-5],[22,-6],[40,-1],[50,10],[34,1],[14,0],[-3,0]],'#f4ddb8');k3poly(c,[[-3,0],[14,0],[34,1],[50,10],[34,4],[14,3],[-3,5]],'#a8705c');c.restore()});
  c.restore()}
function k3souffle(c,t,g,bout,k){if(k<=.02)return;COLFX.jet(c,g,[k3l(g[0],bout[0],k),k3l(g[1],bout[1],k)],58,t,1)}   /* le jet découpé commun (phases I et III) */
/* tornade de feu : la même qu'à la Fonderie */
function k3tornade(c,x,y,h,w,t,a){if(h<6)return;w*=1.5;h*=1.12;c.save();c.globalAlpha=a;const N=9,sx=u=>Math.sin(t*7-u*4.2)*w*.34*u,ww=u=>w*(.16+1.05*u*u+.2*u),g=[],d=[];
  for(let i=0;i<=N;i++){const u=i/N;g.push([x+sx(u)-ww(u)*(i%2?.92:.74),y-u*h]);d.push([x+sx(u)+ww(u)*(i%2?.74:.92),y-u*h])}
  c.globalAlpha=a*.92;k3poly(c,[...g,...d.slice().reverse()],'#8e2418');c.globalAlpha=a;
  for(let i=0;i<N;i++){const u=(i+.5)/N,cx=x+sx(u),cy=y-u*h,r=ww(u)*1.08,ep=h/N*.72,ph=Math.sin(t*15+i*1.9)*.28;
    const arc=(r_,dy,col,e,a0,a1)=>{const p=[];for(let k=0;k<=8;k++){const q=k3l(a0,a1,k/8);p.push([cx+Math.cos(q)*r_,cy+dy+Math.sin(q)*r_*.26])}for(let k=8;k>=0;k--){const q=k3l(a0,a1,k/8);p.push([cx+Math.cos(q)*r_,cy+dy+Math.sin(q)*r_*.26-e*Math.sin(k/8*Math.PI)])}k3poly(c,p,col)};
    arc(r,0,i%2?'#d4501f':'#ff7a30',ep*1.5,-.15+ph,Math.PI+.15+ph);arc(r*.82,-ep*.14,'#ffb84a',ep,.35+ph*2,2.5+ph*2);if(i%2===0)arc(r*.6,-ep*.2,'#ffe08a',ep*.55,.7+ph*2,2.1+ph*2)}
  for(let i=0;i<5;i++){const k=(i-2)/2,tx=x+sx(1)+k*ww(1)*.9,hh=h*(.16+.1*Math.abs(Math.sin(t*11+i*1.7)));
    k3poly(c,[[tx-w*.3,y-h+8],[tx+w*.15,y-h-hh*.45],[tx+w*.75+Math.sin(t*9+i)*w*.2,y-h-hh*.8],[tx+w*.3,y-h-hh*.25],[tx+w*.3,y-h+8]],i%2?'#ff9a35':'#d4501f')}
  for(let i=0;i<8;i++){const q=t*10+i*1.9,u=(i*.13+t*1.2)%1,r=ww(u)*1.45,px=x+sx(u)+Math.cos(q)*r,py=y-u*h+Math.sin(q)*r*.26;k3poly(c,[[px,py-6],[px+4,py],[px,py+4],[px-4,py]],i%2?'#ffe08a':'#ff9a35')}
  c.restore()}
/* geyser : colonne de feu qui crève les dalles (u : 0 à 1 sur toute sa vie) */
function k3geyser(c,x,u,t){if(u<0||u>1)return;const monte=k3ez(u/.14),tombe=k3ez((u-.72)/.28),H=330*monte*(1-tombe*.85),W=62*(1-tombe*.6);if(H<4)return;const y=DECK+4;
  k3glow(c,x,y-90,230,'255,130,50',.55*(1-tombe));
  [[1,'#8e2418',1],[.76,'#d4501f',.94],[.52,'#ff9a35',.86],[.28,'#ffe08a',.74],[.1,'#fff6d8',.55]].forEach(([w,col,hk],j)=>{const g=[],d=[],N=11;
    for(let i=0;i<=N;i++){const v=i/N,wd=W*w*(1.35-.75*v+.5*v*v)*(i%2?1.16:.82),q=Math.sin(t*23-i*1.7+j)*9*v;g.push([x-wd+q,y-v*H*hk]);d.push([x+wd+q,y-v*H*hk-9])}
    k3poly(c,[...g,[x+Math.sin(t*17+j)*14,y-H*hk-40*w*monte],...d.reverse()],col)});
  [[-1,.8,'#d4501f'],[-.5,1,'#ff9a35'],[0,.9,'#ffe08a'],[.55,1.04,'#ff9a35'],[1,.78,'#d4501f']].forEach(([k,h,col],i)=>{const bx=x+k*W*.7,by=y-H*(.76-Math.abs(k)*.1),hh=H*(h-.58)*(1+.3*Math.sin(t*19+i*2.1)),q=Math.sin(t*15+i)*12;
    k3poly(c,[[bx-19,by+34],[bx-9+q*.4,by-hh*.5],[bx+k*26+q,by-hh],[bx+8+q*.3,by-hh*.42],[bx+19,by+34]],col)});
  for(let i=0;i<7;i++){const k=(i-3)/3;k3flame(c,x+k*W*1.6,y+3,13,(58-Math.abs(k)*28)*monte*(1-tombe)*(1+.25*Math.sin(t*19+i)),k*26,t*15+i)}
  const r=k3rnd(88);for(let i=0;i<22;i++){const v=(r()+t*2.2)%1,px=x+(r()-.5)*W*3.4,py=y-v*(H+60);k3poly(c,[[px,py-7],[px+4,py],[px,py+4],[px-4,py]],i%2?'#ffe08a':'#ff9a35')}}
/* annonce du geyser : une tache de braise qui bouillonne sous les pieds du Veilleur (u : 0 à 1, de plus en plus large, vive et agitée) */
function k3boue(c,x,u,t){if(u<=0)return;u=k3cl(u);const y=DECK+6,rx=16+44*u,ry=3.5+8*u,r=k3rnd(17);
  c.save();c.fillStyle='rgba(34,8,14,'+(.55+.3*u)+')';c.beginPath();c.ellipse(x,y,rx*1.18,ry*1.25,0,0,K3TAU);c.fill();
  c.fillStyle='#8e2418';c.beginPath();c.ellipse(x,y,rx,ry,0,0,K3TAU);c.fill();
  c.fillStyle='#d4501f';c.beginPath();c.ellipse(x,y,rx*.78,ry*.76,0,0,K3TAU);c.fill();
  c.fillStyle=u>.7?'#fff0c0':'#ff9a35';c.beginPath();c.ellipse(x,y,rx*.46,ry*.44,0,0,K3TAU);c.fill();
  c.strokeStyle='#ffb84a';c.lineWidth=2;c.lineCap='round';
  for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(x+i*rx*.34,y+ry*.5);c.lineTo(x+i*rx*.62,y+ry+3+Math.abs(i)*2);c.stroke()}
  for(let i=0;i<9;i++){const ph=(t*2.6+i*.37+r())%1,bx=x+(r()-.5)*rx*1.5,by=y-ph*(8+16*u),br=1.5+(2+3*u)*Math.sin(ph*Math.PI);
    c.fillStyle=i%2?'#ffe08a':'#ffb84a';c.beginPath();c.arc(bx,by,br,0,K3TAU);c.fill()}
  for(let i=0;i<5;i++){const k=(i-2)/2;k3flame(c,x+k*rx*.7,y,4+3*u,(8+22*u)*(.75+.25*Math.sin(t*14+i*1.9)),k*6,t*12+i)}
  c.restore()}
/* fente de braise qui court dans le dallage, du pied du Colosse vers le Veilleur */
function k3fente(c,x0,x1,u,al){if(u<=0||al<=0)return;const r=k3rnd(31),N=12,p=[];for(let i=0;i<=N;i++)p.push([k3l(x0,x1,i/N),DECK+6+(i&&i<N?(r()-.5)*15:0)]);
  const n=Math.max(1,Math.ceil(k3cl(u)*N));c.save();c.globalAlpha=al;c.lineJoin='miter';
  [[11,'#12040e'],[6,'#e9561b'],[2.2,'#ffe08a']].forEach(([w,col])=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();p.slice(0,n+1).forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke()});
  for(let i=2;i<n;i+=3){c.strokeStyle='#e9561b';c.lineWidth=3;c.beginPath();c.moveTo(p[i][0],p[i][1]);c.lineTo(p[i][0]+(r()-.5)*40,p[i][1]+(i%2?14:-11));c.stroke()}
  c.restore()}
function k3fumee(c,x,y,u,n,seed){if(u<0)return;const r=k3rnd(seed);for(let i=0;i<n;i++){const v=u-i*.09;if(v<0||v>1)continue;const px=x+(r()-.5)*40+v*14,py=y-v*92,R_=7+v*24,p=[];
  for(let j=0;j<7;j++){const an=j*.9+i;p.push([px+Math.cos(an)*R_*(j%2?.8:1),py+Math.sin(an)*R_*(j%2?.8:1)])}k3poly(c,p,'rgba(78,64,104,'+(.8-v*.8)+')')}}
/* effets des coups portés, dans le monde ; appelé avec le reste des coups (drawHits3), après le dessin du Colosse */
function col3Fx(){
  const a=R.atk,k=COL3.k;if(!a||!k||R.mode==='finale')return;
  const c=ctx,t=a.t,tm=reduce?0:R.time,f=COL3.f,m=COL3.m,off=a.off||0,G3=[PX+118,DECK-66],dir=f.flip?-1:1,ox=f.flip?2*f.bx-f.x0:f.x0;
  let wi=0,ci=0,ri=0;
  a.hits.forEach(h=>{
    const d=t-h.at;
    if(h.k==='gs'||h.k==='stab'){k3contact(c,G3,d,56,5+wi);k3pas(c,PX+128,d,1.1,8+wi);wi++}
    else if(h.k==='wave'){
      const dep=h.at-.5,u=(t-dep)/.5,v=(t-h.at)/.4,j=wi++;if(u<0||v>1)return;
      const gx=PX+128,x=t<h.at?k3l(f.x0-150,gx,u*u*.4+u*.6):k3l(gx,gx+40,v);
      k3tornade(c,x,DECK+6,t<h.at?170*k3ez(u*1.7):170*(1-v),34*(t<h.at?k3ez(u*1.8):1-v*.6),tm+j,t<h.at?1:1-v*v);
      if(!reduce)k3shards(c,x+16,DECK,(R.time*2.2+j*.3)%.5,7,['#ff9a35','#ffe08a'],170,60+j,DECK+6);
      k3contact(c,[PX+118,DECK-70],d,70,30+j,['#ff9a35','#ffe08a','#fff6d8']);
    }else if(h.k==='claw'){
      const j=ci++;k3trois(c,PX+128,DECK-80,j%2?-1:1,(d+.07)/.5);k3contact(c,[PX+116,DECK-70],d,50,21+j);
      if(d>0&&d<1.4){c.save();c.globalAlpha=1-d/1.4;[0,1,2].forEach(i=>k3slash(c,PX+108+i*24+j*8,DECK+4,PX+86+i*24+j*8,DECK+30,4.5,'#ff9a35'));c.restore()}
    }else if(h.k==='whip'){k3contact(c,[PX+10,DECK-72],d,60,5+wi);wi++}
    else if(h.k==='breath'){k3contact(c,[PX+104,DECK-80],d,60,9)}
    else if(h.k==='ram'){const mir=!!a.h&&ri++>0;k3contact(c,[PX+(mir?12:122),DECK-84],d,110,23)}
    else if(h.k==='geyser'){
      const g=d+.1,x=PX+14;
      if(d<0)k3boue(c,x,(d+.7)/.6,tm);
      k3geyser(c,x,g/.62,tm);
      if(g>0){if(!reduce){k3shards(c,x,DECK-6,g,24,['#8d90bc','#37375f','#ff9a35','#ffe08a'],380,24,DECK+6);k3shards(c,x,DECK-6,g-.25,18,['#8d90bc','#ff9a35','#ffe08a'],330,25,DECK+6)}k3fumee(c,x,DECK-150,(d-.1)/.7,8,26)}
    }
  });
  /* souffle : le jet part de la gueule vers le Veilleur (temps canonique du souffle) */
  if((a.kind==='breath'||a.cf!=null&&a.pt>=a.cf)&&a.pt>=0){const bq=col3BreathQ(a);k3souffle(c,tm,k.gueule,[PX+96,DECK-82],k3bump(bq,.6,1.35,.2))}
  /* charge : fente de braise, poussière des pas, traits de vitesse, coup de pied */
  if(a.kind==='charge'&&m.sl){
    const q=m.q,st=a.hits.filter(h=>h.k==='stomp'),ge=a.hits.filter(h=>h.k==='geyser');
    const fs=st.map(s=>{const g=ge.find(g=>g.at-s.at>0&&g.at-s.at<1);return {s:s.at-.34,e:g?g.at+.45:s.at+.35}});
    ge.forEach(g=>{if(!st.some(s=>g.at-s.at>0&&g.at-s.at<1))fs.push({s:g.at-.34,e:g.at+.45})});
    const foot=col3W([50,0])[0];
    fs.forEach(F=>{const u=(t-F.s)/.34;if(u>0)k3fente(c,foot,PX+8,u,1-k3ez((t-(F.e-.3))/.3))});
    m.sl.forEach((Ts,i)=>{const s=q-Ts;if(s>0){k3pas(c,ox+70*dir,s,1.8,70+i);
      if(s<.55){const v=s/.55;c.strokeStyle='rgba(255,170,90,'+(1-v)+')';c.lineWidth=12*(1-v)+2;c.beginPath();c.ellipse(ox+70*dir,DECK+4,30+v*340,(30+v*340)*.11,0,0,K3TAU);c.stroke()}}});
    m.winds.forEach((w,i)=>{[.1,.27].forEach((dt,j)=>{if(!reduce)k3shards(c,ox+70*dir,DECK-2,q-(w[0]+dt),9,['#ff9a35','#ffe08a','#9a9cc8'],190,40+i*2+j,DECK+6)})});
    m.runs.forEach(([r0,r1],i)=>{
      for(let n=0;;n++){const ts=r0+.16+n*.17;if(ts>r1)break;const xs=(a.h?chargeXH:chargeX)(ts)+(f.flip?20:-20)+(n%2?-1:1)*50*dir;k3pas(c,xs,q-ts,1.1,50+n+i*9)}});
    if(m.court>.05){c.save();c.globalAlpha=m.court;
      for(let i=0;i<9;i++){const y=DECK-270+i*31,x=ox+80*dir+(i*37)%60*dir;k3poly(c,[[x,y],[x+(120+(i*29)%110)*dir,y+3],[x,y+6]],i%2?'rgba(255,150,70,.75)':'rgba(214,214,255,.5)')}
      c.restore();if(!reduce)k3shards(c,ox+120*dir,DECK-90,(R.time*2.6)%.5,10,['#ff9a35','#ffe08a'],200,60,DECK+6)}
  }
  /* seconde vie, Difficile : le marteau chargé avant l'explosion */
  if(a.h&&a.kind==='greatsword'&&a.pt>=3.35&&a.pt<4){const hd=k.head,u=k3cl((a.pt-3.35)/.55);k3glow(c,hd[0],hd[1],60+40*u,'255,170,70',.35+.4*u)}
}
