// Chapitre II : blocage des appuis (table INPUT) sur la copie de test a crochets. Sortie attendue : errs []
// 0. regles : un appui sans effet bloque 0,7 s les appuis qui reussissent ; un appui pendant ce blocage le prolonge de 0,25 s ;
//    en phase III, la garde (S.holding) reste possible pendant le blocage ; un appui pendant un faisceau ou dans la seconde qui
//    le precede n'est pas un rate ; un coup recu solde le blocage en cours.
// 1. appuis repetes toutes les 0,25 s (garde des faisceaux tenue) : le Veilleur subit des degats en Normal et Difficile, phases I a III ;
// 2. un seul appui un peu trop tot (Normal, sinon jeu parfait) : PV perdus, au plus un coup dans au moins 90 % des cas ;
// 3. joueur parfait : aucun coup recu, phase gagnee, en Normal et Difficile.
const launch=require('./launch');const {open,run}=require('./ch2-bot');
const errs=[],PH=[[2,'I'],[1,'II'],[3,'III']],dist=H=>{const c={};H.forEach(h=>c[h]=(c[h]||0)+1);return JSON.stringify(c)};
(async()=>{const b=await launch(),{pg,errs:perr}=await open(b);
 // 0. regles
 const R=await pg.evaluate(()=>{const T=__t,o={};T.startRun('normal',true);T.jumpPhase(3);
  for(let i=0;i<60*20&&T.S.mode!=='card';i++)T.step(1/60);T.go();
  const step=s=>{for(let i=0;i<Math.round(s*60);i++)T.step(1/60)};
  step(.05);T.S.threats=[];T.S.pat={ths:[],ok:true};                 // aucune attaque : appui dans le vide
  T.down();T.up();o.whiff={by:T.S.lockBy,dt:+(T.S.lock-T.gt).toFixed(3)};
  step(.1);const l0=T.S.lock;T.down();o.extend=+(T.S.lock-l0).toFixed(3);o.holdDuringLock=T.S.holding;T.up();
  T.S.lock=0;T.S.lockBy='';const g=T.gt;T.S.threats=[{k:'beam',hold:true,t0:g,ts:g+1,ta:g+.6,tb:g+1.2,D:1,dir:-1,real:true,pat:T.S.pat}];
  T.down();T.up();o.beforeBeam=T.S.lockBy;return o});
 console.log('regles',JSON.stringify(R));
 if(R.whiff.by!=='whiff'||R.whiff.dt!==.7)errs.push('appui dans le vide : blocage '+JSON.stringify(R.whiff)+' (0,7 s attendu)');
 if(R.extend!==.25)errs.push('appui pendant le blocage : +'+R.extend+' s (0,25 attendu)');
 if(!R.holdDuringLock)errs.push('phase III : garde impossible pendant le blocage');
 if(R.beforeBeam)errs.push('appui 0,6 s avant un faisceau compte comme un rate ('+R.beforeBeam+')');
 // 1. appuis repetes
 for(const dk of ['normal','hard'])for(const [ph,nm] of PH){const r=await run(pg,{dk,phase:ph,spam:.25,spamGuard:true,seed:3,maxT:120});
  console.log('appuis toutes les 0,25 s',dk.padEnd(6),'phase',nm.padEnd(3),r.res,r.hits+' coups recus, boss',r.boss+'/'+(dk==='hard'?10:8),'('+r.t+' s)');
  if(!(r.hits>0))errs.push('appuis repetes sans degats : '+dk+' phase '+nm)}
 // 2. un appui un peu trop tot
 let all=[];
 for(const [ph,nm] of PH){const H=[];for(const d of [.05,.1,.2])for(let n=1;n<=8;n++)H.push((await run(pg,{dk:'normal',phase:ph,sigma:0,seed:n,early:{n,d}})).hits);
  all=all.concat(H);console.log('un appui trop tot (0,05 / 0,1 / 0,2 s avant la fenetre), Normal, phase',nm.padEnd(3),'PV perdus -> nombre de cas :',dist(H))}
 const ok=all.filter(h=>h<=1).length;console.log('au plus un coup :',ok+'/'+all.length);
 if(ok<.9*all.length)errs.push('un appui trop tot coute plus d\'un coup dans '+(all.length-ok)+' cas sur '+all.length);
 // 3. joueur parfait
 for(const dk of ['normal','hard'])for(const [ph,nm] of PH){const r=await run(pg,{dk,phase:ph,sigma:0,seed:4});
  console.log('joueur parfait',dk.padEnd(6),'phase',nm.padEnd(3),r.res,r.hits+' coups recus');
  if(r.hits||!['cleared','win'].includes(r.res))errs.push('joueur parfait : '+dk+' phase '+nm+' '+r.res+', '+r.hits+' coups')}
 errs.push(...perr);console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
