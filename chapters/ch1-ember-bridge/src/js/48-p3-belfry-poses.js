/* ---------- rendu phase III ---------- (le final : 58-p3-belfry-fin.js) */
function heroX3(){
  const p=R.pl;
  if((p.s==='down'||p.s==='hurt')&&p.lasso){const d=p.rd||R_T.lasso,k=es(clamp01(p.t/.3))*(1-es(clamp01((p.t-(d-.35))/.35)));return PX-30*k}
  if(p.s==='down'||p.s==='hurt')return PX-24*(1-clamp01(p.t/.5));
  return PX;
}
function heroPose3(){
  if(R.mode==='intro'){
    const T=R.t;
    /* il arrive en marchant ; au choc du Colosse, il lève sa lanterne qui s'embrase */
    const up=es(clamp01((T-1.1)/.25))*(1-es(clamp01((T-2.4)/.6)));
    return{x:R.introHx,y:T<1.7?-Math.abs(Math.sin(T*9.8))*4:0,hand:[30,-68-26*up],sa:-.3-1.0*up,rot:0,sy:1,glow:Math.max(.25,up)};
  }
  const p=R.pl,c=R.cn;
  /* repos = garde commune (LB.WATCHER_REST, maquette A9) ; chaque contre part du repos, atteint son geste (valeurs absolues) et y revient */
  const H0=LB.WATCHER_REST.hand,A0=LB.WATCHER_REST.sa,mh=lerp2,ma=k3l;
  let hand=H0.slice(),sa=A0,rot=0,sy=1,glow=0;
  const x=heroX3();
  if(c){
    const t=c.t;
    if(c.k==='plant'){
      /* contre des armes (maquette colosse-clocher.js) : sceptre pointé, le rayon part de la lanterne */
      const T=R_CN.plant.hit,tir=k3bump(t,T-.55,T+.45,.18);hand=mh(hand,[36,-76],tir);sa=ma(sa,-.12,tir);glow=tir;
    }else if(c.k==='bat'){
      /* cinq comètes : sceptre pointé vers le Colosse */
      const u=es(clamp01(t/.22)),v=es(clamp01((t-.6)/.5)),w=u*(1-v);
      hand=mh(H0,[30,-68],w);sa=ma(A0,-.15,w)+(t>.2&&t<.6&&!reduce?Math.sin(t*60)*.03:0);
    }else if(c.k==='bell'){
      const u=es(clamp01(t/.2)),v=es(clamp01((t-.85)/.5)),w=u*(1-v);
      hand=mh(H0,[28,-92],w);hand[1]+=t>.1&&t<.5?Math.sin(t*55)*2.5:0;sa=ma(A0,-1.15,w);glow=.9*(1-v)
    }else if(c.k==='bolt'){
      const u=es(clamp01(t/.25));hand=mh(H0,[28,-92],u);sa=ma(A0,-1.15,u);glow=1;
      if(t>1.5){const v=es(clamp01((t-1.5)/.4));hand=mh([28,-92],H0,v);sa=ma(-1.15,A0,v);glow=1-v}
    }
  }else if((p.s==='down'||p.s==='hurt')&&p.lasso){
    const d=p.rd||R_T.lasso,k=es(clamp01(p.t/.3))*(1-es(clamp01((p.t-(d-.35))/.35)));
    rot=.5*k;hand=[10,-60];sa=.3; /* frappé par la boule : repoussé, plus tiré par un lasso */
  }   /* garde et coup reçu : posture de la phase I, dessinée par drawHero3 (garde commune) */
  return{x,hand,sa,rot,sy,glow};
}
function bossPose3(){
  const b=R.boss,x=R.bx,a=R.atk,t=R.time;
  const rest=[[x-128,DECK-66+Math.sin(t*2)*3],[x+128,DECK-66+Math.sin(t*2+1)*3]];
  const o={x,dy:Math.sin(t*1.6)*2,lean:0,jaw:0,warm:R.rage>0?1.5:1,hands:rest,sword:null,wa:0,ws:1};
  if(R.mode==='intro'){
    const T=R.t;
    o.jaw=(T>2.9&&T<3.6)?14:0;o.warm=T>2.9?1.4:1.25;
    /* il arrive en vol, ailes déployées et battantes, se pose puis replie ses ailes */
    if(T<1.1){const u=T/1.1;o.dy=-520*(1-es(u));o.wa=.6+.35*Math.sin(T*18);o.ws=1.9;o.lean=-.08;
      o.hands=rest.map(h=>[h[0]+(h[0]<x?-40:40),h[1]-30])}
    else{const v=clamp01((T-1.1)/1.4),f=1-es(clamp01((T-1.1)/.8));o.dy=24*(1-es(v));o.lean=.16*(1-es(v));o.wa=.6*f;o.ws=1+.9*f;
      const k=1-es(clamp01((T-1.1)/1.2));o.hands=rest.map(h=>[h[0]+(h[0]<x?-30:30)*k,h[1]+40*k])}
  }
  if(b.s==='hurt'||b.s==='fail'){o.jaw=b.s==='hurt'?8:0}
  if(b.s==='dead'){o.dy=Math.min(70,b.t*45);o.warm=Math.max(.2,1-b.t*.4);o.lean=.05*Math.min(1,b.t)}
  if(b.s==='heal'){
    const k=clamp01(b.t/.5)*(1-clamp01((b.t-2.9)/.5));
    o.warm=1.6+.8*k;o.jaw=(b.t>.5&&b.t<2.9)?16:6;o.wa=.6*k;o.ws=1+.9*k;o.lean=-.06*k;
    o.hands=[lerp2(rest[0],[x-120,DECK-330],k),lerp2(rest[1],[x+120,DECK-330],k)];
  }
  if(a){
    o.warm=Math.max(o.warm,1.25);
    let sp=0;
    a.hits.forEach(h=>{
      if(h.k!=='blast'&&h.k!=='wave'&&h.k!=='stomp')return;
      if(a.h&&a.kind==='greatsword'&&h.k==='blast'&&!h.pre&&!h.flap)return;
      const d=a.t-h.at;
      if(h.pre){
        const k=clamp01(a.t/.5)*(1-es(clamp01((d-.15)/.5)));
        o.wa+=.6*k;o.ws+=.9*k;if(k>.3)o.jaw=Math.max(o.jaw,14);o.warm=Math.max(o.warm,1.4+.5*k);
        o.hands=[lerp2(o.hands[0],[x-120,DECK-330],k),lerp2(o.hands[1],[x+120,DECK-330],k)];
        if(a.t>=.5&&!a.roared){a.roared=true;roar();R.shake=reduce?0:10;R.flash=.35}
      }else{
        sp=Math.max(sp,es(clamp01((d+.6)/.35))*(1-es(clamp01((d-.15)/.4))));
      }
    });
    if(sp>0){o.wa+=.6*sp;o.ws+=.9*sp}
    if(a.pt>=0){
      const q=a.pt,K=(a.cf!=null&&q>=a.cf)?'breath':a.kind;
      if(a.h&&a.kind==='avalanche'){
        let u=0;
        for(let i=0;i<5;i++){
          const L=bombL(i),T=L-.55,d=q-T;
          const b2=d<-.25?0:d<0?eo((d+.25)/.25):1-es(clamp01(d/.35));if(b2>u)u=b2;
          if(q>=T&&!a['th'+i]){a['th'+i]=1;qBurst(x+30,DECK-390,12,['#bfeaff','#ffffff','#ff9a3c']);tone(110,.2,'sawtooth',.05,-40)}
          if(q>=L&&!a['ld'+i]){a['ld'+i]=1;const P=bombPos(i);R.shake=reduce?0:Math.max(R.shake,4);tone(80,.2,'sine',.1,-30);qBurst(P[0],DECK-16,10,['#bfeaff','#ffffff'])}
        }
        o.hands=[rest[0],lerp2(rest[1],[x+50,DECK-395],u)];o.lean=-.05*u;
      }else if(a.h&&a.kind==='charge'){
        const dir=q>=1.5&&q<3.75?-1:1;o.flip=dir<0;
        const wind=q<.35||(q>=2.6&&q<2.95),run=(q>=.35&&q<1.5)||(q>=2.95&&q<3.7);
        if(wind||run){
          o.hands=[[o.x+30,DECK-150],[o.x+150,DECK-150]];o.lean=wind?.08:.14;o.jaw=wind?6:12;
          if(Math.random()<(wind?.5:.8))R.steam.push({x:o.x+dir*(wind?-60:20),y:DECK-4,vx:wind?dir*-1*rand(10,60):dir*rand(20,80),vy:-rand(20,80),life:.8,max:.8,s:rand(8,18)});
        }else if(q>=1.5&&q<2.6){
          o.lean=.14*(1-es(clamp01((q-1.5)/.4)));
          if(q>=1.65&&q<2.0)o.dy+=-16*es((q-1.65)/.35);
          else if(q>=2.0&&q<2.2)o.dy+=-16*(1-ei(clamp01((q-2.0)/.05)))+5*Math.sin(Math.PI*clamp01((q-2.05)/.15));
          if(q>=2.05&&!a.stomped){a.stomped=true;R.shake=reduce?0:9;tone(70,.4,'sine',.14,-30);
            for(let i=0;i<12;i++)R.steam.push({x:o.x+62+rand(-30,30),y:DECK-4,vx:rand(-90,90),vy:-rand(20,90),life:.7,max:.7,s:rand(10,20)})}
        }else if(q>=3.7){
          o.lean=0;
          if(q>=4.1&&q<4.95){const u=q<4.4?eo((q-4.1)/.3):1-es(clamp01((q-4.7)/.2));o.hands=[lerp2(rest[0],[o.x-110,DECK-300],u),lerp2(rest[1],[o.x+110,DECK-300],u)];o.jaw=10}
        }
      }else if(K==='greatsword'||K==='sword2'){
        /* la pose du marteau est dans 54-p3-belfry-colosse.js ; ici, seul le son de la charge avant l'explosion */
        if(a.h&&a.kind==='greatsword'&&q>=3.35&&q<4.0&&!a.chg){a.chg=true;tone(160,.55,'sawtooth',.05,520)}
      }else if(a.kind==='avalanche'){
        const u=q<.25?eo(q/.25):1-es(clamp01((q-.45)/.4));
        o.hands=[rest[0],lerp2(rest[1],[x+50,DECK-395],u)];o.lean=-.05*u;
        if(q>.3&&!a.smashed){a.smashed=true;R.shake=reduce?0:7;qBurst(x+30,DECK-390,22,['#bfeaff','#ffffff','#ff9a3c']);tone(110,.3,'sawtooth',.08,-40)}
      }else if(a.kind==='charge'){
        if(q<1.0){
          const u=clamp01(q/.35);
          o.hands=[[o.x+30,DECK-150],[o.x+150,DECK-150]];o.lean=q<.35?.08*u:.14;o.jaw=q<.35?6:12;
          if(q<.35&&Math.random()<.5)R.steam.push({x:o.x-60,y:DECK-4,vx:rand(-60,-10),vy:-rand(20,70),life:.8,max:.8,s:rand(8,16)});
          if(q>=.35&&Math.random()<.8)R.steam.push({x:o.x-20,y:DECK-4,vx:rand(20,80),vy:-rand(20,80),life:.7,max:.7,s:rand(10,18)});
        }else{
          o.lean=.14*(1-es(clamp01((q-1.0)/.4)));
          if(q>=1.35&&q<1.7)o.dy+=-16*es((q-1.35)/.35);
          else if(q>=1.7&&q<1.9)o.dy+=-16*(1-ei(clamp01((q-1.7)/.05)))+5*Math.sin(Math.PI*clamp01((q-1.75)/.15));
          if(q>=1.75&&!a.stomped){a.stomped=true;R.shake=reduce?0:9;tone(70,.4,'sine',.14,-30);
            for(let i=0;i<12;i++)R.steam.push({x:o.x-62+rand(-30,30),y:DECK-4,vx:rand(-90,90),vy:-rand(20,90),life:.7,max:.7,s:rand(10,20)})}
          if(q>=2.0&&q<2.8&&!DIFF.easy){
            const u=q<2.3?eo((q-2.0)/.3):1-es(clamp01((q-2.6)/.2));
            o.hands=[lerp2(rest[0],[o.x-110,DECK-300],u),lerp2(rest[1],[o.x+110,DECK-300],u)];o.jaw=10;
          }
        }
      }else if(K==='breath'){
        const bq=a.hq||a.cf!=null?aq(a,'breath',1.0):q;
        o.warm=1.3+.4*es(clamp01(bq/.6)); /* le reste du souffle (pose, jet) est dans 54-p3-belfry-colosse.js */
      }else if(a.kind==='rocks'){
        let ri=0;
        a.hits.forEach(h=>{
          if(h.k!=='rock')return;
          const d=a.t-h.at,idx=(ri%2===0)?1:0;ri++;
          const HOLD=[x+(idx?40:-40),DECK-345],THR=[x-190,DECK-230];
          let tg=null;
          if(d>=-.95&&d<-.45)tg=lerp2(rest[idx],HOLD,es(clamp01((d+.95)/.35)));
          else if(d>=-.45&&d<-.3)tg=lerp2(HOLD,THR,eo((d+.45)/.15));
          else if(d>=-.3&&d<.25)tg=lerp2(THR,rest[idx],es((d+.3)/.55));
          if(tg)o.hands[idx]=tg;
        });
        a.hits.forEach(h=>{if(h.k!=='fire')return;const d=a.t-h.at;
          if(d>-.7&&d<.35){const k=es(clamp01((d+.7)/.4))*(1-es(clamp01((d-.05)/.3)));o.jaw=Math.max(o.jaw,14*k);o.warm=Math.max(o.warm,1.4+.4*k);o.lean=.05*k;
            o.hands=[lerp2(o.hands[0],[x-80,DECK-150],k),lerp2(o.hands[1],[x+80,DECK-150],k)]}});
      }else if(a.roar){
        const last=a.hits[a.hits.length-1].at-(a.off||0),k=es(clamp01(q/.5))*(1-es(clamp01((q-(last+.1))/.4)));
        o.jaw=Math.max(o.jaw,14*k);o.warm=Math.max(o.warm,1.4+.4*k);o.wa+=.6*k;o.ws+=.9*k;
        o.hands=[lerp2(o.hands[0],[x-120,DECK-330],k),lerp2(o.hands[1],[x+120,DECK-330],k)];
        if(q>=.3&&!a.roared){a.roared=true;roar();R.shake=reduce?0:8;R.flash=Math.max(R.flash,.2)}
      }
    }
  }
  return o;
}
