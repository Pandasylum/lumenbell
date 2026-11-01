// Chapitre I : bots a pas fixe (1/60 s), sur la copie de test a crochets (build/out/test.html, ou CH1_TEST=<fichier>
// pour comparer avant / apres sur la meme graine). Le bot joue comme un joueur a un seul bouton : il appuie avant l'impact de
// chaque attaque (au milieu de la fenetre d'arret, plus une erreur gaussienne sigma, en secondes) ; aucun rendu, aucune
// boucle requestAnimationFrame (le test avance le temps lui-meme par __t.adv). Math.random est remplace par un generateur a
// graine : deux executions sur la meme graine donnent les memes parties tant que la logique n'a pas change.
// Usage : node tests/ch1-bot.js [parties] [--out fichier.json] [--check]
//   Phases I, II et III, Normal et Difficile, sigma 40 / 70 / 100 ms en Normal, 20 / 40 / 70 ms en Difficile ; une ligne par case : victoires, temps moyen d'une
//   victoire, coups recus en moyenne (victoires), et causes d'echec. --out ecrit les parties une a une (comparaison fine).
//   --check (CI) : le bot doit gagner au moins 90 % des parties en Normal, sigma 40 ms, dans chaque phase.
const path=require('path'),fs=require('fs');const launch=require('./launch');
const FILE=process.env.CH1_TEST||path.resolve(__dirname,'../build/out/test.html');

// s'execute dans la page
function sim(o){
  const T=window.__t;let seed=o.seed>>>0||1;let calls=0;const rnd=()=>{calls++;seed=seed*1664525+1013904223>>>0;return seed/4294967296};
  Math.random=rnd;
  const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  T.applyDiff(o.dk);T.goPhase(o.phase);if(o.phase===1||T.getPaused())T.start();
  const dt=1/60,X=T.T,ACT=.333*T.getDIFF().m;const rb=[],tr=[];let f=0,res=null,thr=null,thrId=0,lastImp=1e9,pressed=false,lead=0;
  const cur=()=>T.getR()||T.getQ()||T.getG();
  // temps (s) avant le prochain impact + largeur de la fenetre d'arret avant l'impact (fl = fenetre courte) ; null = rien a venir
  const imp=()=>{
    const R=T.getR(),Q=T.getQ(),G=T.getG();
    if(R){if(R.mode!=='play'||!R.atk)return null;const a=R.atk,h=a.hits.find(x=>!x.done);if(!h)return null;
      return{t:h.at-a.t,k:h.k,id:a.hits.indexOf(h)+'/'+a.kind+'/'+a.t0,w:h.k==='breath'?T.getBRW():ACT,g:.06}}
    if(Q){if(Q.mode!=='play'||!Q.atk)return null;const a=Q.atk,h=a.hits.find(x=>!x.done);if(!h)return null;
      return{t:h.at-a.t,k:h.k,id:a.hits.indexOf(h)+'/'+a.kind+'/'+a.t0,w:ACT,g:.05}}
    if(G.mode!=='play')return null;const b=G.boss,w=ACT,g=.06,fl=X.flwin+.03;
    switch(b.s){
      case 'windup':return{t:X.windup-b.t+(b.sk||X.strike),w,g};
      case 'rewind':return{t:.18-b.t+(b.sk||X.strike),w,g};
      case 'strike':return{t:(b.sk||X.strike)-b.t,w,g};
      case 'sw1w':return{t:X.sw1w-b.t+X.sw1,w,g};case 'sw1':return{t:X.sw1-b.t,w,g};
      case 'swgap':return{t:X.swgap-b.t+X.sw2w+X.sw2,w,g};case 'sw2w':return{t:X.sw2w-b.t+X.sw2,w,g};case 'sw2':return{t:X.sw2-b.t,w,g};
      case 'sw3g':return{t:X.sw3g-b.t+X.sw3w+X.sw3,w,g};case 'sw3w':return{t:X.sw3w-b.t+X.sw3,w,g};case 'sw3':return{t:X.sw3-b.t,w,g};
      case 'fl_in':return{t:(b.fli||X.fli)-b.t+X.flo,w:fl,g:0,fl:1};case 'fl_out':return{t:X.flo-b.t,w:fl,g:0,fl:1};
      case 'fy_t':return{t:X.fyt-b.t+.3,w,g};case 'fy_j':return{t:.3-b.t,w,g};case 'fy_gap':return{t:X.fyg-b.t+X.fyt+.3,w,g};
      case 'rk_t':return{t:.5-b.t+.55,w,g};case 'rk_j':return{t:.55-b.t,w,g};
    }
    return null};
  const done=()=>{const R=T.getR(),Q=T.getQ(),G=T.getG();
    if(R)return R.mode==='lost'?'dead':['won','finale','space','fake','flee'].includes(R.mode)?'win':null;
    if(Q)return Q.mode==='lost'?'dead':Q.mode==='lake'?'win':null;
    return G.mode==='lost'?'dead':G.mode==='won'?'win':null};
  while(!res){
    res=done();if(res)break;
    if(f*dt>(o.maxT||400)){res='timeout';break}
    const I=imp();
    if(I){
      // nouvelle menace : t remonte (ou autre identifiant) -> tirage de l'instant d'appui
      if(lastImp>=1e9||I.t>lastImp+1e-6||(I.id&&I.id!==thr)){thrId++;pressed=false;
        const center=(I.w-I.g)/2;lead=(o.aim!=null?o.aim:center)-gauss()*o.sigma}
      thr=I.id||thr;lastImp=I.t;
      if(!pressed&&I.t<=lead){pressed=true;T.press()}
    }else{lastImp=1e9;pressed=false;thr=null}
    if(o.spam&&f%Math.round(o.spam*60)===0)T.press();
    T.adv(dt);f++;
    if(o.trace){const S=cur();tr.push([f,S.pl.s,+S.pl.t.toFixed(3),S.php,(S.boss||{}).s,S.atk&&S.atk.hits?S.atk.hits.filter(h=>h.done).length:-1,+((S.atk&&S.atk.t)||0).toFixed(3),+((S.boss&&S.boss.t)||0).toFixed(3),calls].join(' '))}
    {const g=T.getG();if(!T.getR()&&!T.getQ()&&g.boss.s==='rebound'&&g.boss.t<=dt*1.01)rb.push(g.pl.s)}   // phase I : un coup bloque envoie le Colosse en rebond ; le Veilleur doit alors etre a ready
  }
  const R=T.getR(),Q=T.getQ(),G=T.getG(),S=R||Q||G;
  return{res,phase:o.phase,t:+(f*dt).toFixed(1),hits:R?R.taken:Q?Q.taken:G.grabs,blocks:S.blocks!=null?S.blocks:S.dodges!=null?S.dodges:S.parries,hp:S.php,boss:S.bhp,mode:S.mode,rebound:rb,trace:o.trace?tr:undefined};
}

async function open(b){const ctx=await b.newContext({viewport:{width:1100,height:760}});
  await ctx.addInitScript(()=>{window.requestAnimationFrame=()=>0;let s=12345;Math.random=()=>{s=s*1664525+1013904223>>>0;return s/4294967296}});   // graine fixee des le chargement : l'etat initial du jeu (flocons, braises) en depend
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await pg.goto('file://'+FILE);await pg.waitForTimeout(250);return{pg,ctx,errs}}
async function run(pg,o){await pg.reload();await pg.waitForTimeout(150);return pg.evaluate(sim,o)}
module.exports={open,run,FILE};

if(require.main===module)(async()=>{
  const N=+process.argv.find(a=>/^\d+$/.test(a))||20,outI=process.argv.indexOf('--out'),OUT=outI>0?process.argv[outI+1]:null;
  const b=await launch(),{pg,errs}=await open(b);const all=[];
  console.log('Chapitre I, bots a pas fixe, '+N+' parties par case ; sigma = erreur de timing (ecart-type) ; fichier '+path.basename(FILE));
  for(const dk of ['normal','hard'])for(const ph of [1,2,3])for(const sigma of dk==='hard'?[.02,.04,.07]:[.04,.07,.1]){
    let w=0,ts=[],hits=[],blk=[],why={};
    for(let i=0;i<N;i++){const r=await run(pg,{dk,phase:ph,sigma,seed:2000+i});all.push({dk,ph,sigma,seed:2000+i,...r});why[r.res]=(why[r.res]||0)+1;if(r.res==='win'){w++;ts.push(r.t);hits.push(r.hits)}blk.push(r.blocks)}
    const avg=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'-';
    if(process.argv.includes('--check')&&dk==='normal'&&sigma<.05&&w<.9*N)errs.push('phase '+ph+' Normal, sigma '+sigma+' : '+w+'/'+N+' victoires (90 % attendus)');
    console.log(dk.padEnd(6),'phase',ph,'sigma',sigma.toFixed(2),'victoires',(w+'/'+N).padEnd(6),'temps moyen',avg(ts).padStart(5)+' s','coups recus (victoires)',avg(hits).padStart(4),'blocages',avg(blk).padStart(5),JSON.stringify(why))}
  if(OUT)fs.writeFileSync(OUT,JSON.stringify(all,null,1));
  console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',['exception: '+e.message]);process.exit(1)});
