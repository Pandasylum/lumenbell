// Etats du Veilleur (LB.hero), les deux chapitres : ready -> action -> recover -> ready, appui refuse (deny), coup recu, arret a l'impact.
// Usage : node tests/input.js [ch1|ch2|all]   (all par defaut). Sortie attendue : errs []
// Chapitre I (copie de test a crochets, pas fixe, voir ch1-bot.js ; CH1_TEST=<fichier> pour une autre copie) :
//  0. regles, phases I, II et III, Normal, sans attaque : un appui en ready lance l'action ; un appui pendant l'action ou la
//     recuperation ne relance rien (etat et temps inchanges) et met deny = 0,25 s ; action 0,333 s puis recuperation 0,7 s puis ready ;
//     coup recu : etourdissement raccourci pour pouvoir arreter l'attaque suivante (phases II et III) ;
//  1. phase I : un coup simple bloque renvoie a ready (le Colosse part en rebond), comme partout ailleurs ;
//  2. spam a l'aveugle (un appui toutes les 0,25 / 0,5 / 0,75 / 1 s) : le Veilleur meurt, Normal, phases I a III ;
//  3. joueur parfait (appui au milieu de la fenetre d'arret, erreur nulle) : aucun coup recu en phases II et III, Normal et Difficile ;
//     phase I : le bot ne joue pas les fureurs a la perfection, on verifie seulement qu'il bloque.
// Chapitre II : tests/ch2-input.js, lance tel quel (memes regles, memes mesures).
const {spawnSync}=require('child_process'),path=require('path');
const launch=require('./launch');const {open,run}=require('./ch1-bot');
const which=process.argv[2]||'all',errs=[],near=(a,b)=>Math.abs(a-b)<.02;
(async()=>{
 if(which==='ch1'||which==='all'){
  const b=await launch(),{pg,errs:perr}=await open(b);
  // 0. regles
  for(const ph of [1,2,3]){
   await pg.reload();await pg.waitForTimeout(150);
   const R=await pg.evaluate(ph=>{const T=window.__t;T.applyDiff('normal');T.goPhase(ph);if(ph===1||T.getPaused())T.start();
    const S=()=>T.getR()||T.getQ()||T.getG(),step=s=>{for(let i=0;i<Math.round(s*60);i++)T.adv(1/60)};
    for(let i=0;i<60*8&&S().mode!=='play';i++)T.adv(1/60);
    const o={mode:S().mode};{const b=S().boss;b.s='idle';b.t=0;b.wait=1e9}step(.2);   // le Colosse attend : aucune attaque pendant la mesure
    
    const st=()=>({s:S().pl.s,t:+S().pl.t.toFixed(3),deny:+S().pl.deny.toFixed(3)});
    T.press();o.press=st();
    step(.1);T.press();o.denyAct=st();
    step(.3);o.recover=st();T.press();o.denyRec=st();
    step(.75);o.ready=st();
    // coup recu : etourdissement raccourci par l'attaque suivante (phases II et III : table d'attaque, ecart 0,3 s)
    if(ph>1){const P=S();P.atk={kind:'x',t:0,hits:[{k:'fall',at:.3,ok:null,done:false},{k:'fall',at:9,ok:null,done:false}],end:9,miss:0,cn:null};
     T.LB.hero.hurt(P.pl,.3,{g:ph===2?'dodge':'block',min:ph===3?.22:.14});o.hurt={s:P.pl.s,rd:+P.pl.rd.toFixed(3)}}
    else{T.LB.hero.hurt(S().pl,99,{g:'block',dur:.3});o.hurt={s:S().pl.s,rd:+S().pl.rd.toFixed(3)}}
    return o},ph);
   console.log('regles phase',['','I','II','III'][ph],JSON.stringify(R));
   const tag='Ch1 phase '+['','I','II','III'][ph]+' : ';
   if(R.mode!=='play')errs.push(tag+'le combat ne demarre pas ('+R.mode+')');
   if(R.press.s!=='act'||R.press.t!==0)errs.push(tag+'appui en ready sans action '+JSON.stringify(R.press));
   if(R.denyAct.s!=='act'||!near(R.denyAct.deny,.25)||!near(R.denyAct.t,.1))errs.push(tag+'appui pendant l\'action : '+JSON.stringify(R.denyAct));
   if(R.recover.s!=='recover')errs.push(tag+'pas de recuperation apres l\'action : '+JSON.stringify(R.recover));
   if(R.denyRec.s!=='recover'||!near(R.denyRec.deny,.25)||R.denyRec.t!==R.recover.t)errs.push(tag+'appui pendant la recuperation : '+JSON.stringify(R.denyRec));
   if(R.ready.s!=='ready')errs.push(tag+'pas de retour a ready apres 0,333 + 0,7 s : '+JSON.stringify(R.ready));
   if(R.hurt.s!=='hurt'||(ph>1&&!near(R.hurt.rd,ph===3?.22:.14))||(ph===1&&!near(R.hurt.rd,.3)))errs.push(tag+'coup recu : '+JSON.stringify(R.hurt));
   // lisible par le dessin : le retour d'un appui refuse est la lanterne rouge (LB.DENY_COL), pas la barre
  }
  // 1. phase I : un coup bloque renvoie a ready
  {const rb=[];for(let seed=1;seed<=6;seed++){const r=await run(pg,{dk:'normal',phase:1,sigma:0,seed,maxT:120});rb.push(...r.rebound)}
   const bad=rb.filter(s=>s!=='ready').length;console.log('phase I, coup simple bloque -> etat du Veilleur au rebond :',JSON.stringify(rb.reduce((c,s)=>(c[s]=(c[s]||0)+1,c),{})));
   if(!rb.length)errs.push('Ch1 phase I : aucun coup simple bloque observe');
   if(bad)errs.push('Ch1 phase I : '+bad+'/'+rb.length+' coups bloques ne renvoient pas a ready')}
  // 2. spam a l'aveugle
  for(const ph of [1,2,3]){const out=[];
   for(const sp of [.25,.5,.75,1]){const r=await run(pg,{dk:'normal',phase:ph,spam:sp,sigma:0,aim:-1,seed:3,maxT:300});out.push(sp+' s : '+r.res+' en '+r.t+' s, boss '+r.boss);
    if(r.res!=='dead')errs.push('Ch1 spam '+sp+' s, phase '+['','I','II','III'][ph]+' : '+r.res+' (le Veilleur devrait mourir)')}
   console.log('spam normal phase',['','I','II','III'][ph],out.join(' ; '))}
  // 3. joueur parfait
  for(const dk of ['normal','hard'])for(const ph of [1,2,3]){const r=await run(pg,{dk,phase:ph,sigma:0,seed:4,maxT:400});
   console.log('joueur parfait',dk.padEnd(6),'phase',['','I','II','III'][ph],r.res,r.hits+' coups recus',r.blocks+' arrets');
   if(ph>1&&(r.hits||r.res!=='win'))errs.push('Ch1 joueur parfait : '+dk+' phase '+ph+' '+r.res+', '+r.hits+' coups');
   if(ph===1&&!r.blocks)errs.push('Ch1 joueur parfait : '+dk+' phase I : aucun blocage')}
  errs.push(...perr);await b.close();
 }
 if(which==='ch2'||which==='all'){
  const r=spawnSync('node',[path.join(__dirname,'ch2-input.js')],{encoding:'utf8',env:process.env});
  const out=r.stdout.trim().split('\n');console.log(out.slice(-3).join('\n'));
  if(r.status)errs.push('ch2-input.js : code '+r.status+' ('+out.slice(-1)[0]+')')}
 console.log('errs',errs);process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
