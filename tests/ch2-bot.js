// Chapitre II : bot de simulation (sur la copie de test a crochets, voir ch2-lib.js), temps a pas fixe de 1/60 s.
// Le bot joue comme un joueur a un seul bouton : il appuie a l'instant d'impact de chaque attaque reelle avec une
// erreur de timing gaussienne (sigma, en secondes), ne touche pas aux faux reflets et reste appuye pendant les
// faisceaux (des `lead` secondes avant jusqu'a la fin du passage). Mode `sloppy` : appuie aussi sur les reflets,
// tient la garde trop longtemps et rate des coups (pour declencher tous les cas : blessure, reflet, garde brisee).
// Option miss : nombre de premieres attaques reelles laissees passer volontairement (coups recus).
// Usage : node tests/ch2-bot.js [parties] [--check]  -> mesures de la phase III (formes I et II) en Normal et Difficile.
// --check (CI) : echoue si le bot gagne moins de 90 % des parties en Normal avec une erreur de timing de 40 ou 70 ms
// (la phase III doit rester gagnable sans contre-attaque a frapper).
const path=require('path');const launch=require('./launch');const {testPage}=require('./ch2-lib');

// s'execute dans la page
function sim(o){
  const T=window.__t;let seed=o.seed>>>0||1;const rnd=()=>{seed=seed*1664525+1013904223>>>0;return seed/4294967296};
  Math.random=rnd;
  const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  if(o.cont){}else if(o.phase){T.startRun(o.dk,true);T.jumpPhase(o.phase)}else T.startRun(o.dk,!o.prologue);
  const dt=1/60;let f=0,held=false,tapUp=false,cards=0,res=null;const startPh=T.S.phase;
  const log={forms:[],deaths:0,hpAt:{}},g0=T.gt;
  while(!res){
    const S=T.S;
    if(S.mode==='won'){res='win';break}
    if(o.untilPhase&&S.phase===o.untilPhase&&S.mode==='play'){log.hpAt[S.phase*10+(S.form||1)]=S.hp;res='phase';break}
    if(S.mode==='dead'&&S.deadShown){res='dead';break}
    if(o.untilEpilogue&&S.mode==='epilogue'){res='epilogue';break}
    if(o.untilCard&&S.mode==='card'&&document.getElementById('ovEye').textContent.includes(o.untilCard)){res='card';break}
    if(S.mode==='card'){if(o.phase&&S.phase!==startPh){res='cleared';break}
      if(++cards>40){res='cards';break}T.go();continue}
    if(S.mode==='menu'){res='menu';break}
    if(T.gt-g0>(o.maxT||900)){res='timeout';break}
    if(S.mode==='play'&&!S.paused){
      const t=T.gt;let wantHold=false,tap=false;
      for(const th of S.threats){if(th.done)continue;
        if(th.hold){if(th._lead==null)th._lead=(o.lead||.12)+Math.abs(gauss())*.05+(o.sloppy?.6:0);
          if(t>=th.ta-th._lead&&t<=th.tb+.04)wantHold=true;continue}
        if(th.ti==null)continue;
        if(th._bp==null&&th.real!==false&&o.miss>0){o.miss--;th._bp=Infinity}
        if(th._bp==null){const fake=th.real===false;th._bp=fake?(o.sloppy&&rnd()<.5?th.ti+gauss()*o.sigma:Infinity):(o.sloppy&&rnd()<.25?Infinity:th.ti+gauss()*o.sigma)}
        if(!th._pr&&t>=th._bp){th._pr=1;tap=true}}
      if(o.sloppy&&S.phase===3&&rnd()<.002)wantHold=true;
      if(tapUp){T.up();held=false;tapUp=false}
      if(tap){if(held)T.up();T.down();held=true;tapUp=!wantHold}
      else if(wantHold&&!held){T.down();held=true}
      else if(!wantHold&&held&&!o.sloppy){T.up();held=false}
      else if(!wantHold&&held&&o.sloppy&&rnd()<.02){T.up();held=false}
    }else if(held){T.up();held=false;tapUp=false}
    const pf=S.phase*10+(S.form||1);if(log.forms[log.forms.length-1]!==pf&&S.mode==='play'){log.forms.push(pf);log.hpAt[pf]=S.hp}
    if(S.mode==='ko')log.hpAt['ko'+pf]=S.hp;
    T.step(dt,o.drawEvery&&f%o.drawEvery===0);f++;
  }
  const S=T.S;return{res,t:+S.runT.toFixed(1),hits:S.hits,hp:S.hp,hpMax:S.hpMax,boss:S.bossHp,phase:S.phase,form:S.form||1,forms:log.forms,hpAt:log.hpAt,mode:S.mode,trial:!!S.d.trial};
}

async function open(b){const ctx=await b.newContext({viewport:{width:1100,height:760},offline:true});
  await ctx.addInitScript(()=>{window.__drawn={};const P=CanvasRenderingContext2D.prototype;
    for(const k of ['fillText','strokeText']){const f=P[k];P[k]=function(t){const s=String(t);window.__drawn[s]=(window.__drawn[s]||0)+1;return f.apply(this,arguments)}}});
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await pg.goto('file://'+testPage());await pg.waitForTimeout(200);return{pg,ctx,errs}}
async function run(pg,o){return pg.evaluate(sim,o)}
module.exports={open,run,go:pg=>pg.evaluate(()=>{__t.go();const S=__t.S;return{phase:S.phase,mode:S.mode,hp:S.hp,hpMax:S.hpMax,trial:!!S.d.trial}})};

if(require.main===module)(async()=>{
  const N=+process.argv[2]||40,b=await launch(),{pg,errs}=await open(b);
  console.log('Phase III (formes I et II, depuis la frise), '+N+' parties par case ; sigma = erreur de timing du bot (ecart-type)');
  for(const dk of ['normal','hard'])for(const sigma of [.04,.07,.1]){
    let w=0,ts=[],hits=[],why={};
    for(let i=0;i<N;i++){const r=await run(pg,{dk,phase:3,sigma,seed:1000+i});why[r.res]=(why[r.res]||0)+1;if(r.res==='win'){w++;ts.push(r.t);hits.push(r.hits)}}
    const avg=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'-';
    if(process.argv.includes('--check')&&dk==='normal'&&sigma<.08&&w<.9*N)errs.push('phase III Normal, sigma '+sigma+' : '+w+'/'+N+' victoires (90 % attendus)');
    console.log(dk.padEnd(6),'sigma',sigma.toFixed(2),'victoires',w+'/'+N,'temps moyen',avg(ts)+' s','coups recus (victoires)',avg(hits),JSON.stringify(why))}
  console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',['exception: '+e.message]);process.exit(1)});
