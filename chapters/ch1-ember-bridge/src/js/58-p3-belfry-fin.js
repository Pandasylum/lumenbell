/* ================= FIN DU CHAPITRE I : cinématique, plan large des Flèches, plan final =================
   Portage de la maquette validée par Kevin le 28/11/2026 (« Ok go », v5) : docs/decisions/da/ch1-fin.js. Mêmes temps (table FIN, 44-p3-belfry-logic.js), mêmes poses, même ordre.
   Tout est une fonction pure du temps R.fin.t (puis de FIN.fin + R.st au plan final) : aucun état de dessin n'est gardé d'une image à l'autre ; les sons sont dans rFinale.
   Les aides de dessin sont celles du Clocher (k3*, COLFX, BEL3) ; le Colosse, ses ailes et le marteau sont les dessins actuels (COLOSSE.aile, COLOSSE.marteauSeul) : les ailes
   coupées et le marteau lâché restent au sol. Aucun mot d'annonce. Le repère de la maquette (sol à 452) est décalé de DY3, comme tout le décor de la phase III.
   Mouvement réduit : ni secousse, ni éclairs, ni clignotement du Colosse. La statue du plan final est calculée UNE FOIS (bake), puis simplement posée à chaque image. */
const FINCINE=(()=>{
const {foudre:T_F,genou:GENOU,jet:JET,saut:SAUT,coupe:COUPE,charge:CHARGE,coup:COUP,chute:CHUTE,faisc:FAISC,feu:FEU,pierre:PIERRE_T,glas:GLAS,large:LARGE,fin:FIN_T}=FIN;
const KD=58;                                  /* de combien le buste descend quand le Colosse met un genou à terre (unités de pose) */
const BX3=BX+C3X,DECK3=DECK,PX3=PX,CS=C3;     /* repère du Colosse : ses pieds, le sol, le Veilleur, l'échelle de pose */
const ez=k3ez,cl=k3cl,lerp=k3l,bosse=k3bump,cles=k3keys,choc=COLFX.choc,poly=COLFX.poly,etoile=COLFX.etoile,glow=colGlow,TAU=K3TAU;
const GARDE=K3B,SONNE=K3_SONNE,DOS=K3_DOS;
const rnd=k3rnd;
const FANAL=[68,376+DY3];                     /* le fanal : foyer de la flamme */
const FL_=reduce?.3:1;                        /* intensité des éclairs et flashs blancs */
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const path=(c,d,col)=>{c.fillStyle=col;c.fill(new Path2D(d))};
const lg=(c,x0,y0,x1,y1,st)=>{const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g};
const brush=(c,pa,box,n,col,seed,ang,len,w)=>{const r=rnd(seed);c.save();c.clip(pa);c.lineCap='round';for(let i=0;i<n;i++){const x=box[0]+r()*box[2],y=box[1]+r()*box[3],l=len*(.4+r()),a=ang+(r()-.5)*.5;c.strokeStyle=col;c.globalAlpha=.25+r()*.75;c.lineWidth=w*(.4+r());c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5+(r()-.5)*5,y+Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke()}c.restore()};
const ridge=(c,base,amp,seed,col)=>{const r=rnd(seed),p=new Path2D();p.moveTo(0,540);let y=base,x=0;p.lineTo(0,y);while(x<960){const st=22+r()*46,ny=base+(r()-.6)*amp*2.6;p.quadraticCurveTo(x+st*.55,(y+ny)/2+(r()-.35)*10,x+st,ny);x+=st;y=ny}p.lineTo(1000,540);p.closePath();c.fillStyle=col;c.fill(p)};
/* brumes : des bouffées de brume qui dérivent ; y dans le repère de la maquette + dy (DY3 hors plan final) */
const BLOBS={},PUFFS={};
const blob=rgb=>BLOBS[rgb]||(BLOBS[rgb]=LB.cacheLayer(64,64,c=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba('+rgb+',1)');g.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=g;c.fillRect(0,0,64,64)},LAYER));
const mist=(c,y,h,rgb,a,off,dy)=>{const P=PUFFS[y]||(PUFFS[y]=Array.from({length:9},(_,i)=>{const r=rnd(100+i*7+(y|0)),x=r()*1200,w=110+r()*190;return{x,w,d:(r()-.5)}})),b=blob(rgb);c.save();c.globalAlpha=a;
  for(const m of P){const x=((m.x+off*1200)%1200)-120,yy=y+dy+m.d*h,rx=m.w,ry=h*.55;c.drawImage(b,x-rx,yy-ry,2*rx,2*ry)}c.restore()};
const ombre=(c,x,rx,a)=>{c.fillStyle='rgba(3,2,10,'+a+')';c.beginPath();c.ellipse(x,DECK3+3,rx,Math.max(4,rx*.15),0,0,TAU);c.fill()};
/* la neige et le vignettage, par-dessus tout */
const air=(c,t)=>{BEL3.neige(c,reduce?0:t);BEL3.vig(c)};

/* ---- la chute du Colosse : il tombe en avant d'un bloc, reste étalé, tente de se relever (un premier essai échoue), finit à genoux ; le feu s'éteint ---- */
function chute(t){const T=t-CHUTE;if(T<0)return {on:false,th:0,lift:0,k:0,r:0,bow:0,out:0};
 const K=[[0,0],[.55,-1.45],[.95,-1.35],[1.3,-.85],[1.55,-1.15],[2.3,-.1],[2.6,0]];let th=0;
 for(let i=1;i<K.length;i++)if(T<=K[i][0]){let u=(T-K[i-1][0])/(K[i][0]-K[i-1][0]);u=i===1?u*u:ez(u);th=K[i-1][1]+(K[i][1]-K[i-1][1])*u;break}
 return {on:true,th,lift:-64*Math.sin(Math.min(Math.abs(th),1.5708)),k:ez((T-1.9)/.7),r:ez(T/.25)*(1-ez((T-1.6)/.5)),bow:ez((T-2.3)/.8),out:ez((T-1.5)/1.8)}}
/* les poses du Colosse à l'instant t : garde de rage, choc de la foudre, genou, coups de lanterne, chute */
function poseFin(t){
 const rage={...GARDE,tombe:1,rage:1,fl:.55,fissure:.55,eteint:0,yeux:.9};
 const choc_={...SONNE,tombe:1,lean:.34,tete:.62,plie:1,drop:14,off:[-96,40],nn:[70,-40],jaw:16,fissure:1};
 const genou={...DOS,tombe:1,fissure:1,kneel:1,drop:KD,lean:-.06,tete:.42,off:[-46,96],nn:[-30,10],jaw:7,eteint:.25,yeux:.6};
 const tenu={P:[-60,-150],a:165,g:200,wN:1,wF:1,s:1,r:0};   /* la masse tenue à deux mains devant lui */
 const o={kneel:0,...cles(t,[[0,{...rage,kneel:0}],[T_F,{...rage,kneel:0}],[T_F+.02,{...choc_,kneel:0}],[GENOU,{...choc_,kneel:0}],[3,genou],[CHUTE,genou]])};
 if(t<JET){const q=ez((t-T_F)/.25);['P','a','g','wN','wF','s','r'].forEach(n=>o[n]=Array.isArray(tenu[n])?tenu[n].map((v,i)=>lerp(GARDE[n][i],v,q)):lerp(GARDE[n],tenu[n],q))}
 if(t>T_F&&t<GENOU+.15){o.flash=reduce?.4:Math.sin((t-T_F)*46)>0?.75:.12;if(!reduce)o.dx+=Math.sin(t*70)*7}
 o.rage=t<T_F+.12?1:0;o.fl=t<T_F+.12?.55:0;
 for(const c of [...COUPE,COUP]){const h=choc(t,c,.55,.2);if(t>c){o.lean+=.16*h;o.dx+=18*h;o.tete+=.2*h;if(t<c+.08)o.flash=.5}}
 if(t>COUP&&t<CHUTE){if(!reduce)o.dx+=Math.sin(t*64)*4;o.jaw=16}
 const f=chute(t);
 if(f.on){const L=(p,q,u)=>p+(q-p)*u,k=Math.max(f.k,1-ez((t-CHUTE)/.35)),r=f.r;
  Object.assign(o,{lean:-.17*f.bow,tete:-.15*r*(1-k)+.85*f.bow,yeux:.25*(1-f.out),jaw:6*r*(1-k),plie:0,sx:1,dF:0,dN:0,drop:KD*k,flash:0,
   off:[L(L(-62,-75,r),-32,k),L(L(92,-70,r),94,k)],nn:[L(L(0,-95,r),-50,k),L(L(0,-60,r),-4,k)],eteint:.2+.35*f.out,fissure:1-f.out*.8,kneel:k,out:f.out,w:0})}
 return {o,f}}
/* une aile coupée : elle tombe, se couche et RESTE au sol (le dessin actuel de l'aile rongée) */
function aileSol(c,t,sd,o){const T=COUPE[sd<0?0:1];if(t<T)return false;const u=cl((t-T)/.85),e=u*u;
 const x0=BX3+sd*34*CS,y0=DECK3+(-238+o.drop)*CS,x1=sd<0?BX3-70:BX3+70,y1=DECK3-(sd<0?30:24);
 c.save();c.translate(lerp(x0,x1,ez(u)),lerp(y0,y1,e)-40*Math.sin(u*Math.PI));c.scale(sd,1);c.rotate(lerp(.65,sd<0?.12:.2,ez(u)));
 const k=(sd>0?.66:.68)*CS*.92;c.scale(k,k*lerp(R.healed?.9:1,.34,e));c.drawImage(COLOSSE.aile(sd<0,!!R.healed),-20,-200,420,280);c.restore();
 k3pas(c,x1+sd*70,t-T-.85,1.2,60+sd);return true}
/* la masse lâchée : elle vole, tombe, rebondit et RESTE au sol (le sprite actuel du marteau) */
function marteauLibre(c,t){if(t<JET)return;const u=cl((t-JET)/.55),X=440,Y=DECK3-18,D0=[BX3-253*CS,DECK3-98*CS];let x,y,a;
 if(u<1){x=lerp(D0[0],X,u);y=lerp(D0[1],Y,u*u);a=lerp(2.88,Math.PI+.08,u)}
 else{const v=t-JET-.55;x=X-10*ez(v/.3);y=Y-(v<.28?20*Math.sin(v/.28*Math.PI):0);a=Math.PI+.08}
 c.save();c.translate(x,y);c.rotate(a);c.scale(CS*.82,CS*.82);COLOSSE.marteauSeul(c);c.restore();
 k3pas(c,X,t-JET-.55,1.5,81);k3contact(c,[X,Y],t-JET-.55,60,82)}
/* le Colosse : dessin commun à la scène, à la pierre et à la statue ; renvoie ses points (monde) */
function dessineCol(c,t,o,f){c.save();
 if(f.on){c.translate(BX3,DECK3);c.rotate(f.th);c.translate(-BX3,-DECK3+f.lift)}
 c.translate(BX3+o.dx,DECK3);c.scale(CS,CS);const s=reduce?0:Math.sin(t*2.2)*(1-(f.out||0));
 const rig=COLOSSE.draw(c,{lean:o.lean+.012*s,drop:o.drop+1.4*s,sx:o.sx,dF:o.dF,dN:o.dN,off:o.off,nn:o.nn,plie:o.plie,tete:o.tete,jaw:o.jaw,flash:o.flash,fissure:o.fissure,rage:o.rage,eteint:o.eteint,t:reduce?0:(t<PIERRE_T?t:PIERRE_T),
  brise:t>=T_F+.05||(R.hornAt!=null&&R.time>=R.hornAt+CN3.brise),enclume:COL3.foudre1!=null&&R.time>=COL3.foudre1+CN3.enclume,warm:Math.max(.05,1-(o.out||0)),kneel:o.kneel||0,kdk:KD,out:o.out||0,sansMarteau:t>=JET,
  ham:t<JET?{P:o.P,a:o.a,g:o.g,wN:o.wN,wF:o.wF,s:o.s,r:o.r}:{P:[94,-256],a:-62,g:50,wN:0,wF:0,s:1,r:1},tip:[o.tx,o.ty],sag:20,
  back:()=>{const g=new DOMMatrix().translate(0,-124+o.drop+o.plie*26).rotate(o.lean*180/Math.PI).scale(o.sx,1).translate(0,124);
   const rg=!!R.healed,tb=rg?1:0;   /* ailes rongées et retombées après le regain de vie (le cas de la maquette) ; intactes en Facile, sans seconde vie */
   [1,-1].forEach(sd=>{if(t>=COUPE[sd<0?0:1])return;c.save();const p=g.transformPoint(new DOMPoint(sd*34,-238));c.translate(p.x,p.y);c.scale(sd,1);c.rotate(.14+(reduce?0:Math.sin(t*1.7)*.05)+tb*(sd>0?.5:.62));const k=sd>0?.66:.68;c.scale(k,k*(1-.1*tb));c.drawImage(COLOSSE.aile(sd<0,rg),-20,-200,420,280);c.restore()});
   if(o.rage>0)COLFX.rageDerriere(c,reduce?0:t,o.fl)}});
 c.restore();
 const base=new DOMMatrix();if(f.on){base.translateSelf(BX3,DECK3).rotateSelf(f.th*180/Math.PI).translateSelf(-BX3,-DECK3+f.lift)}
 const W_=p=>{const q=base.transformPoint(new DOMPoint(BX3+o.dx+p[0]*CS,DECK3+p[1]*CS));return [q.x,q.y]};
 return {W:W_,rig,coeur:W_(rig.coeur),tete:W_(rig.pt(-34,-272)),corne:W_(rig.pt(36,-300)),marteau:W_(rig.head),loin:W_(rig.fa.W),proche:W_(rig.na.W),torse:W_(rig.pt(-36,-186))}}
/* la lumière du fanal fige le Colosse : la pierre noire se répand en cercle depuis sa poitrine, anneau de lumière sur son bord */
function colossePierre(c,t,o,f){
 const pk=cl((t-PIERRE_T)/1.5);if(pk<=0)return dessineCol(c,t,o,f);
 let k;const cp=[BX3-30,DECK3-170],rr=ez(pk)*520;
 c.save();c.beginPath();c.rect(-40,-40,1040,620);c.arc(cp[0],cp[1],rr,0,TAU);c.clip('evenodd');k=dessineCol(c,t,o,f);c.restore();
 if(OFF.width!==cv.width||OFF.height!==cv.height){OFF.width=cv.width;OFF.height=cv.height}
 OFFX.setTransform(1,0,0,1,0,0);OFFX.clearRect(0,0,OFF.width,OFF.height);OFFX.setTransform(c.getTransform());k=dessineCol(OFFX,t,o,f);
 c.save();c.beginPath();c.arc(cp[0],cp[1],rr,0,TAU);c.clip();c.setTransform(1,0,0,1,0,0);c.filter='grayscale(1) brightness(1.05) contrast(1.05)';c.drawImage(OFF,0,0);c.filter='none';c.restore();
 if(pk<1){c.strokeStyle='rgba(255,240,190,'+.85*(1-pk)+')';c.lineWidth=5*(1-pk)+1;c.beginPath();c.arc(cp[0],cp[1],rr,0,TAU);c.stroke()}
 return k}
/* le Veilleur : il saute sur le Colosse, tire dans les ailes, frappe au cœur, retombe, allume le fanal puis se retire */
function heros(c,t,k){let x=PX3,y=0,hand=[28,-94],sa=-1.5,saut=false,perche=false;
 const q0=ez((t-T_F)/.35);   /* du geste du contre (sceptre levé, lanterne vive) à la garde de la maquette, sans saut */
 sa=lerp(-1.15,-1.5,q0);
 const dest=[k.coeur[0]-62,k.coeur[1]+34-DECK3];
 if(t<SAUT[0]){}
 else if(t<SAUT[1]){const u=(t-SAUT[0])/(SAUT[1]-SAUT[0]);x=lerp(PX3,dest[0],ez(u));y=dest[1]*ez(u)-150*Math.sin(Math.PI*u);hand=[30,-72];sa=.15-.95*ez(u);saut=true}
 else if(t<CHUTE){x=dest[0];y=dest[1];hand=[30,-72];sa=-.8;perche=true;
  [[COUPE[0],-2.2],[COUPE[1],-.3]].forEach(([T,ang])=>{const d=t-T;if(d>-.35&&d<.4){const q=d<.1?ez((d+.35)/.3):1-ez((d-.1)/.3);sa=-.8+(ang+.8)*q}});
  if(t>=CHARGE&&t<COUP){hand=[14,-112];sa=-1.7;y-=34*ez((t-CHARGE)/.45)}else if(t>=COUP){hand=[34,-42];sa=.55;y+=8*choc(t,COUP,.3,0)}}
 else if(t<CHUTE+.8){const u=(t-CHUTE)/.8;x=lerp(BX3-90,PX3-40,ez(u));y=-170*(1-u*u)-90*Math.sin(Math.PI*u);hand=[30,-72];sa=-.6;saut=u<.95}
 else{x=PX3-40;if(t<FEU+.4){const q=bosse(t,FAISC-.35,FEU+.1,.22);hand=[lerp(28,-26,q),-94];sa=lerp(-1.5,-1.9,q)}else x=lerp(PX3-40,PX3-96,ez((t-FEU-.4)/1.4))}
 if(!perche)ombre(c,x,34*Math.max(.2,1+y/400),.6);
 LB.drawWatcher(c,x,DECK3+y,'idle',t,{hand,sa,sy:1,rot:0,glow:t>JET&&t<FEU+.4?1:lerp(1,.4,q0),L:76,anim:false,id:1,lit:true,breath:!saut});
 return {x,y,lant:[x+(sa<-1.65?-30:100),DECK3+y-(sa<-1.65?140:sa>.2?40:88)]}}
/* le fanal s'allume */
function fanalFeu(c,t){const u=cl((t-FEU)/.6);if(u<=0)return;glow(c,FANAL[0],FANAL[1],260*u,'255,214,120',.75*u);[[1,'#e9761f'],[.68,'#ffb84a'],[.38,'#fff0b8']].forEach(([k,col])=>{const w=15*u*k,h=46*u*k*(1+(reduce?0:.1*Math.sin(t*13+k*7))),x=FANAL[0],y=FANAL[1]+10,q=reduce?0:Math.sin(t*9)*3*k;poly(c,[[x-w,y-h*.22],[x-w*.55,y-h*.62],[x+q,y-h],[x+w*.6,y-h*.55],[x+w,y-h*.22],[x+w*.5,y],[x-w*.5,y]],col)})}
/* l'anneau du Veilleur à la main de pierre : le nom effacé n'est plus que quelques entailles */
function anneau(c,p){c.save();c.translate(p[0]-4,p[1]+4);c.lineWidth=9;c.strokeStyle='#0d0718';c.beginPath();c.ellipse(0,0,19,12,-.2,0,TAU);c.stroke();c.lineWidth=5;c.strokeStyle='#b7a6bc';c.stroke();c.lineWidth=1.6;c.strokeStyle='#fff0c8';c.beginPath();c.ellipse(0,0,19,12,-.2,3.4,5.6);c.stroke();
 c.strokeStyle='#3a2a44';c.lineWidth=1.2;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*4,9);c.lineTo(i*4+2,13);c.stroke()}
 glow(c,0,0,46,'255,226,150',.45);c.restore()}
/* arcs électriques sur le corps (points du Colosse dans le monde) */
const arcsCorps=(c,k,al,t)=>k3arcs(c,[k.tete,k.corne,k.torse,k.coeur,k.loin,k.proche,k.marteau],al,reduce?0:t);

/* ---- plan 1 : la scène, de la foudre à l'anneau dans la main de pierre ---- */
function scene(c,t){
 const {o,f}=poseFin(t),tm=reduce?0:t;
 const sec=reduce?0:Math.max(26*choc(t,T_F,.6,.1),14*choc(t,T_F+.2,.4,0),9*choc(t,JET+.55,.25,0),...COUPE.map(a=>10*choc(t,a,.25,0)),18*choc(t,COUP,.4,0),20*choc(t,CHUTE+.55,.35,0),12*choc(t,CHUTE+1.55,.3,0),5*bosse(t,.3,1.5),...[0,1,2,3,4].map(i=>9*choc(t,COUP+.2+i*.2,.2,0)),10*choc(t,2.75,.25,0));
 c.save();c.translate(Math.sin(t*91)*sec,Math.cos(t*77)*sec*.7);
 BEL3.draw(c,tm);
 const or_=bosse(t,.2,T_F+1,.5);if(or_)k3orage(c,tm,or_);
 fanalFeu(c,t);
 ombre(c,BX3+o.dx-(f.on?40*f.r:0),150,.5);
 aileSol(c,t,-1,o);aileSol(c,t,1,o);
 const k=colossePierre(c,t,o,f);
 const h=heros(c,t,k);
 marteauLibre(c,t);
 /* la cloche sonne, puis la foudre pleine, comme aux rages */
 k3ondesCloche(c,t-T_F+R_CN.bolt.hit-R_CN.bolt.ring,k.tete,1.35);   /* les ondes du contre continuent là où elles en étaient à la foudre */
 k3acouphene(c,k.tete,bosse(t,.8,T_F-.15,.2),tm);
 k3solFendu(c,BX3,t-T_F,t<CHUTE?1-ez((t-3.4)/1):0);k3foudre(c,t-T_F,k.tete);k3foudre(c,t-T_F-.2,k.coeur);arcsCorps(c,k,t>T_F?1-ez((t-T_F-.5)/1):0,t);
 const u=t-T_F;if(u>0&&u<2.5){k3eclats(c,k.coeur[0],k.coeur[1],u,36,['#cfd8ff','#6a3050','#2c1534','#ff9a35','#ffffff'],430,71,DECK3+5);[[-110,-200],[110,-210],[0,-120],[150,-90]].forEach(([x,y],i)=>k3fumee(c,BX3+x,DECK3+y,u-.4-i*.17,6,80+i))}
 /* le genou touche la pierre */
 k3pas(c,BX3-70,t-2.75,1.6,95);
 const tir=(T,cible)=>{k3charge(c,h.lant,(t-T+.4)/.35,tm);k3rayon(c,h.lant,cible,(t-T+.07)/.45,.9);k3contact(c,cible,t-T,90,35,['#fffbea','#ff9a35','#6a3050','#2c1534'])};
 tir(COUPE[0],k.W([-150,-290]));tir(COUPE[1],k.W([150,-290]));
 if(t>CHARGE&&t<COUP)etoile(c,h.lant[0],h.lant[1],14+44*ez((t-CHARGE)/.6),10,t*8,'#fffbea',.5);
 k3rayon(c,h.lant,k.coeur,(t-COUP+.05)/.7,1.9);k3contact(c,k.coeur,t-COUP,180,41,['#fffbea','#ffe58a','#ff9a35','#2c1534']);
 for(let i=0;i<5;i++){const T=COUP+.2+i*.2,p=[[-30,-190],[40,-230],[-60,-120],[20,-270],[0,-170]][i];k3contact(c,k.W(p),t-T,80+i*12,50+i,['#fffbea','#ffc15a','#ff7a2b','#6a3050']);k3fumee(c,...k.W(p),t-T-.1,4,90+i)}
 k3pas(c,BX3-290,t-CHUTE-.55,2,91);k3pas(c,BX3-130,t-CHUTE-.55,1.4,92);
 /* le Veilleur allume le fanal, la lumière du fanal fige le Colosse */
 if(t>FAISC&&t<FEU+.35)k3rayon(c,h.lant,FANAL,(t-FAISC)/(FEU+.35-FAISC),.55);
 if(t>PIERRE_T-.5&&t<PIERRE_T+1){const v=ez((t-PIERRE_T+.5)/.45),al=t<PIERRE_T+.5?1:1-(t-PIERRE_T-.5)/.5;c.save();c.globalAlpha=al*.85;const A=FANAL,B_=[lerp(A[0],k.coeur[0],v),lerp(A[1],k.coeur[1],v)];poly(c,[[A[0],A[1]-5],[B_[0],B_[1]-22],[B_[0],B_[1]+22],[A[0],A[1]+5]],'rgba(255,226,150,.55)');poly(c,[[A[0],A[1]-2],[B_[0],B_[1]-7],[B_[0],B_[1]+7],[A[0],A[1]+2]],'#fffbea');c.restore()}
 if(t>PIERRE_T+1.5)anneau(c,k.loin);
 /* une fois figé, un glas : l'onde reste autour de la cloche, rien ne part vers le Colosse ; les tours voisines s'éclairent à chaque écho */
 {const g=t-GLAS;if(g>0&&g<2.4)for(let i=0;i<4;i++){const v=(g-i*.28)/1.4;if(v>0&&v<1){c.strokeStyle='rgba(255,226,150,'+.6*(1-v)+')';c.lineWidth=11*(1-v)+2;c.beginPath();c.arc(BELL[0],BELL[1]+60,46+v*250,0,TAU);c.stroke()}}}
 [[74,260],[884,272],[196,302],[596,334]].forEach(([x,y],i)=>{const q=choc(t,GLAS+FIN.echo[0]+i*FIN.echo[1],.9,.25);if(t>GLAS+FIN.echo[0]+i*FIN.echo[1]&&q>0)glow(c,x,y+DY3,70,'255,214,130',.8*q)});
 c.restore();air(c,t);
 const ecl=t>T_F&&t<T_F+.07?.42:t>T_F+.2&&t<T_F+.25?.25:0;if(ecl&&!reduce)rect(c,0,0,960,540,'rgba(228,234,255,'+ecl+')');
 [JET,...COUPE,COUP,CHUTE+.55].forEach(T=>{const v=t-T;if(v>0&&v<.18)rect(c,0,0,960,540,'rgba(255,255,255,'+.35*FL_*(1-v/.18)+')')})}

/* ---- plan 2 : plan large, les Flèches répondent une à une ; au large, le Phare Noyé reste éteint ---- */
const FLECHES=[[74,226,9],[884,238,10],[196,268,6],[596,300,5]];
function large(c,t){const u=t-LARGE;c.save();const z=1.06-.06*ez(u/3.8);c.translate(480,300+DY3);c.scale(z,z);c.translate(-480,-300-DY3);
 BEL3.plans(c);
 FLECHES.forEach(([x,top,w])=>{rect(c,x-w*.3,top+27+DY3,w*.6,w,'#241a38');rect(c,x-w*1.2,top+22+DY3,w*2.4,24,'rgba(55,42,82,.75)')});
 FLECHES.forEach(([x,top,w],i)=>{const a=ez((u-FIN.spires[0]-i*FIN.spires[1])/.4);if(a<=0)return;const y=top+34+DY3;glow(c,x,y,20+w*9,'255,214,130',.95*a);etoile(c,x,y,w*1.5*a*(1+.6*choc(u,FIN.spires[0]+i*FIN.spires[1],.35,0)),8,t,'#ffe9a8',.4);rect(c,x-w*.3,top+28+DY3,w*.6,w,'#fff3c8')});
 mist(c,388,40,'206,168,204',.5,((reduce?0:t)*.012)%1,DY3);mist(c,424,44,'178,150,196',.65,1-((reduce?0:t)*.016)%1,DY3);
 c.fillStyle=lg(c,0,420+DY3,0,540+DY3,[[0,'rgba(38,30,70,.7)'],[1,'#0d0a20']]);c.fillRect(-40,420+DY3,1040,200);
 /* le Phare Noyé : silhouette éteinte, les pieds dans la brume */
 c.save();c.translate(0,DY3);
 path(c,'M716 452L727 316H749L760 452Z','#141026');path(c,'M723 316h30v-7h-30Z','#141026');path(c,'M728 309v-20h20v20Z','#1c1834');path(c,'M724 289L738 270L752 289Z','#141026');rect(c,733,294,10,11,'#2f3552');rect(c,746,318,2,130,'rgba(200,190,240,.35)');
 c.restore();
 mist(c,456,26,'90,80,130',.6,((reduce?0:t)*.01)%1,DY3);c.restore();air(c,t)}

/* ---- plan 3 : plan final « cinéma », de l'anneau dans la main jusqu'au grand plan, contre une lune immense ---- */
const LUNE=[628,262],SS=1.16,SPX=648,SOLF=452;
/* la statue, calculée UNE FOIS : le Colosse de pierre, son liseré de lune, le marteau tombé et l'ombre au sol, dans un seul calque posé à chaque image */
const BK={cv:null,x:240,y:-80,w:720,h:570,main:null};
function bake(){
 if(BK.cv)return;
 const B=Math.min(2.25,Math.max(1.5,dpr*1.1)),W_=Math.ceil(BK.w*B),H_=Math.ceil(BK.h*B),{o,f}=poseFin(PIERRE_T+2.4);
 const ST=document.createElement('canvas');ST.width=W_;ST.height=H_;const sx=ST.getContext('2d');
 sx.setTransform(B,0,0,B,-BK.x*B,-BK.y*B);sx.translate(SPX,SOLF);sx.scale(SS,SS);sx.translate(-BX3,-DECK3);
 const k=dessineCol(sx,PIERRE_T+2.4,o,f);
 BK.main=[SPX+(k.loin[0]-BX3)*SS,SOLF+(k.loin[1]-DECK3)*SS];
 const cv_=document.createElement('canvas');cv_.width=W_;cv_.height=H_;const b=cv_.getContext('2d');
 /* de haut en bas : la statue grise, puis (en dessous) son liseré, l'ombre au sol et le marteau tombé */
 b.setTransform(1,0,0,1,0,0);b.filter='grayscale(1) brightness(.75) contrast(1.35)';b.drawImage(ST,0,0);b.filter='none';
 sx.setTransform(1,0,0,1,0,0);sx.globalCompositeOperation='source-in';sx.fillStyle='#e6d2f4';sx.fillRect(0,0,W_,H_);sx.globalCompositeOperation='source-over';
 b.globalCompositeOperation='destination-over';
 b.drawImage(ST,-2.6*B,-2.2*B);b.drawImage(ST,2.2*B,-1.8*B);
 b.setTransform(B,0,0,B,-BK.x*B,-BK.y*B);
 b.fillStyle='rgba(3,2,10,.7)';b.beginPath();b.ellipse(SPX,SOLF+3,190,8,0,0,TAU);b.fill();
 b.save();b.translate(424,SOLF-16);b.rotate(Math.PI+.06);b.scale(.78,.78);b.filter='brightness(.5)';COLOSSE.marteauSeul(b);b.filter='none';b.restore();
 b.globalCompositeOperation='source-over';
 ST.width=1;ST.height=1;   /* le calque de travail est rendu */
 BK.cv=cv_}
function ombre_(c,x,y){c.fillStyle='rgba(3,2,10,.65)';c.beginPath();c.ellipse(x,y+3,34,5,0,0,TAU);c.fill()}
function tableau(c,t){bake();const u=t-FIN_T,v=ez((u-.7)/4.8),z=lerp(3.6,1,v),tm=reduce?0:t;
 const MAIN=BK.main,cx_=lerp(MAIN[0],480,v),cy=lerp(MAIN[1],316,v);
 rect(c,0,0,960,540,'#05040d');c.save();c.translate(480,270);c.scale(z,z);c.translate(-cx_,-cy);
 /* ciel et lune immense */
 c.fillStyle=lg(c,0,0,0,470,[[0,'#040716'],[.45,'#141a42'],[.75,'#4a3566'],[1,'#c8848a']]);c.fillRect(-100,-100,1160,740);
 const r=rnd(5);for(let i=0;i<190;i++){c.fillStyle='rgba(230,238,255,'+(.2+r()*.7)*(.75+.25*Math.sin(tm*1.7+i))+')';c.fillRect(r()*960,r()*r()*300,r()<.9?1.2:2.2,1.2)}
 glow(c,LUNE[0],LUNE[1],470,'232,206,232',.65);
 const m=new Path2D();m.arc(LUNE[0],LUNE[1],212,0,TAU);c.fillStyle=lg(c,0,50,0,474,[[0,'#fffaff'],[.55,'#e8d2ec'],[1,'#c18fac']]);c.fill(m);brush(c,m,[416,50,424,424],150,'rgba(140,110,166,.2)',9,0,86,12);
 /* rayons de lune, très lents */
 c.save();c.translate(LUNE[0],LUNE[1]);c.rotate(tm*.012);for(let i=0;i<9;i++){c.rotate(TAU/9);poly(c,[[0,0],[760,-34],[760,34]],'rgba(236,214,244,.045)')}c.restore();
 /* chaînes de crêtes, Flèches allumées, Phare Noyé muet, mer de nuages */
 ridge(c,388,30,3,'#5e4066');
 [[78,262,8],[168,306,5],[356,338,4],[884,276,9]].forEach(([x,top,w])=>{path(c,'M'+(x-w*4)+' 470L'+(x-w)+' '+(top+70)+'L'+(x-w*.8)+' '+(top+14)+'L'+x+' '+(top-w*2.4)+'L'+(x+w*.8)+' '+(top+14)+'L'+(x+w)+' '+(top+70)+'L'+(x+w*4)+' 470Z','#2b2048');glow(c,x,top+24,22+w*5,'255,214,130',.85);rect(c,x-w*.25,top+19,w*.5,w*1.1,'#fff0c0')});
 path(c,'M416 440L421 360H431L436 440Z M418 360h16v-14h-16Z M416 346L426 335L436 346Z','#221a3c');
 mist(c,404,46,'214,170,200',.55,(tm*.014)%1,0);mist(c,440,40,'150,120,180',.7,1-(tm*.019)%1,0);
 ridge(c,452,12,11,'#171030');
 /* le sommet du Clocher en contre-jour */
 c.fillStyle=lg(c,0,SOLF,0,540,[[0,'#171232'],[1,'#05040d']]);c.fillRect(-100,SOLF,1160,300);rect(c,-100,SOLF,1160,2.5,'rgba(222,208,246,.75)');
 for(let x=-20;x<1000;x+=74){rect(c,x,SOLF+13,40,30,'rgba(6,4,18,.7)');rect(c,x,SOLF+13,40,1.5,'rgba(190,170,230,.3)')}
 /* la cloche, grande, en amorce à gauche : le Colosse lui fait face (la cloche du jeu est dessinée à sa place, décalée de DY3) */
 c.save();c.translate(-80,-42);path(c,'M200 -60H232V560H200Z','#07050f');path(c,'M232 92H520V112H232Z','#07050f');path(c,'M232 112L292 112L232 188Z','#07050f');rect(c,232,92,288,2,'rgba(222,208,246,.4)');
 c.translate(0,-DY3);BEL3.bell(c,.05*Math.exp(-u*.35)*Math.sin(u*3));c.restore();
 /* le fanal et sa lumière, seule couleur chaude du premier plan */
 const F=[146,SOLF];glow(c,F[0],F[1]-84,250,'255,190,100',.7+.05*Math.sin(tm*9));
 path(c,'M'+(F[0]-10)+' '+F[1]+'L'+(F[0]-6)+' '+(F[1]-62)+'H'+(F[0]+6)+'L'+(F[0]+10)+' '+F[1]+'Z M'+(F[0]-26)+' '+(F[1]-80)+'H'+(F[0]+26)+'L'+(F[0]+14)+' '+(F[1]-62)+'H'+(F[0]-14)+'Z','#0b0816');
 [[1,'#e9761f'],[.68,'#ffb84a'],[.38,'#fff0b8']].forEach(([k_,col])=>{const w=19*k_,h=62*k_*(1+.12*Math.sin(tm*11+k_*7)),x=F[0],y=F[1]-78,q=Math.sin(tm*8)*4*k_;poly(c,[[x-w,y-h*.22],[x-w*.55,y-h*.62],[x+q,y-h],[x+w*.6,y-h*.55],[x+w,y-h*.22],[x+w*.5,y],[x-w*.5,y]],col)});
 /* le marteau tombé, la statue (un seul calque, calculé une fois), l'anneau, le Veilleur */
 c.drawImage(BK.cv,BK.x,BK.y,BK.w,BK.h);
 anneau(c,BK.main);
 etoile(c,BK.main[0]+8,BK.main[1]-8,11*choc(t,FIN_T+1.2,.9,.4)+7*Math.max(0,Math.sin(u*1.4-5))**12,4,.2,'#fffbea',.18);
 c.save();c.translate(262,SOLF);c.scale(1.12,1.12);c.translate(-262,-SOLF);ombre_(c,262,SOLF);
 LB.drawWatcher(c,262,SOLF,'idle',t,{hand:[28,-94],sa:-1.5,sy:1,rot:0,glow:.55,L:76,anim:false,id:1,lit:true,breath:true});c.restore();
 /* braises */
 const q=rnd(41);for(let i=0;i<26;i++){const k_=(q()+tm*(.03+q()*.04))%1,x=SPX-170+q()*340+Math.sin(tm+i)*14,y=SOLF-k_*300;c.fillStyle='rgba(255,170,90,'+.7*(1-k_)+')';c.fillRect(x,y,2,2)}
 c.restore();air(c,t);
 /* format scope */
 const b=69*ez(u/1.2);rect(c,0,0,960,b,'#000');rect(c,0,540-b,960,b,'#000')}

/* l'image à l'instant t (secondes depuis le début du final) : scène, plan large, plan final, avec un fondu au noir entre les plans */
function render(c,t){c.setTransform(dpr,0,0,dpr,0,0);c.save();
 if(t<LARGE)scene(c,t);else if(t<FIN_T)large(c,t);else tableau(c,t);
 const v=t<LARGE?cl((t-LARGE+.5)/.5):t<LARGE+.6?1-(t-LARGE)/.6:t<FIN_T?cl((t-FIN_T+.6)/.6):1-cl((t-FIN_T)/.8);
 if(v>0)rect(c,0,0,960,540,'rgba(4,3,12,'+v+')');c.restore()}
return {render,bake}})();
