// Chapitre II : etats du Veilleur (comme au Chapitre I : ready -> action -> recover -> ready), sur la copie de test a crochets.
// Sortie attendue : errs []
// 0. regles, phases I, II et III en Normal, sans attaque : un appui en ready lance l'action et date l'animation ; un appui
//    pendant l'action ou la recuperation ne relance rien (etat, duree et date d'animation inchanges) et met deny = 0,25 s ;
//    action 0,333 s puis recuperation 0,7 s puis ready ; phase III : la garde dure tant que le bouton est tenu, puis
//    recuperation au relachement ; reflet esquive : recuperation rallongee (0,7 + 0,6 s) ; coup recu : etourdissement
//    raccourci pour pouvoir arreter l'attaque suivante.
// 1. spam a l'aveugle (un appui toutes les 0,25 / 0,5 / 0,75 / 1 s, sans viser) : le Veilleur meurt, Normal et Difficile, phases I a III ;
// 2. un seul appui un peu trop tot (0,05 / 0,1 / 0,2 s avant l'ouverture de l'action, Normal, sinon jeu parfait) : au plus un coup ;
// 3. joueur parfait (appui 0,06 s avant chaque impact) : aucun coup recu, phase gagnee, Normal et Difficile.
const launch=require('./launch');const {open,run}=require('./ch2-bot');
const errs=[],PH=[[1,'I'],[2,'II'],[3,'III']],dist=H=>{const c={};H.forEach(h=>c[h]=(c[h]||0)+1);return JSON.stringify(c)};
// PH : numeros affiches (frise) ; interne : I = 2 (la Voix), II = 1 (le Roi)
const near=(a,b)=>Math.abs(a-b)<.02;
(async()=>{const b=await launch(),{pg,errs:perr}=await open(b);
 // 0. regles
 for(const [ph,nm] of PH){
  const R=await pg.evaluate(ph=>{const T=__t,o={};T.startRun('normal',true);T.jumpPhase(ph);
   for(let i=0;i<60*20&&T.S.mode!=='card';i++)T.step(1/60);T.go();
   const S=T.S,step=s=>{for(let i=0;i<Math.round(s*60);i++)T.step(1/60)},anim=()=>S.phase===2?S.dodgeT:S.guardT,st=()=>({s:S.pl.s,t:+S.pl.t.toFixed(3),deny:+S.pl.deny.toFixed(3),anim:anim()});
   S.threats=[];S.pat=null;S.nextAt=1e9;step(.1);
   T.down();T.up();o.press=st();o.pressAt=T.gt;
   step(.1);T.down();T.up();o.denyAct=st();
   step(.3);o.recover=st();T.down();T.up();o.denyRec=st();
   step(.75);o.ready=st();
   if(ph===3){T.down();step(1.2);o.held=st();T.up();step(1/60);o.released=st();step(.8)}
   S.pl.s='ready';S.pl.t=0;T.down();T.up();
   const g=T.gt;S.threats=[{k:'orb',t0:g,ti:g+.1,real:false,pat:{ths:[],ok:true}}];S.pat=null;step(.15);o.fool={s:S.pl.s,rd:+S.pl.rd.toFixed(3)};
   step(1.5);S.threats=[];const g2=T.gt;S.threats=[{k:'orb',t0:g2,ti:g2+.05,real:true,pat:{ths:[],ok:true}},{k:'orb',t0:g2,ti:g2+.45,real:true,pat:{ths:[],ok:true}}];
   step(.08);o.hurt={s:S.pl.s,rd:+S.pl.rd.toFixed(3),hits:S.hits};return o},ph);
  console.log('regles phase',nm.padEnd(3),JSON.stringify(R));
  const tag='phase '+nm+' : ';
  if(R.press.s!=='act'||!near(R.press.anim,R.pressAt))errs.push(tag+'appui en ready sans action ni animation '+JSON.stringify(R.press));
  if(R.denyAct.s!=='act'||R.denyAct.anim!==R.press.anim||!near(R.denyAct.deny,.25)||!near(R.denyAct.t,.1))errs.push(tag+'appui pendant l\'action : '+JSON.stringify(R.denyAct));
  if(R.recover.s!=='recover')errs.push(tag+'pas de recuperation apres l\'action : '+JSON.stringify(R.recover));
  if(R.denyRec.s!=='recover'||R.denyRec.anim!==R.press.anim||!near(R.denyRec.deny,.25)||R.denyRec.t!==R.recover.t)errs.push(tag+'appui pendant la recuperation : '+JSON.stringify(R.denyRec));
  if(R.ready.s!=='ready')errs.push(tag+'pas de retour a ready apres 0,333 + 0,7 s : '+JSON.stringify(R.ready));
  if(ph===3&&(R.held.s!=='act'||R.released.s!=='recover'))errs.push(tag+'garde tenue '+JSON.stringify(R.held)+' puis relachee '+JSON.stringify(R.released));
  if(ph===1&&(R.fool.s!=='recover'||!near(R.fool.rd,1.3)))errs.push(tag+'reflet esquive : '+JSON.stringify(R.fool)+' (recuperation de 1,3 s attendue)');
  if(R.hurt.s!=='hurt'||!(R.hurt.rd<=.38&&R.hurt.rd>=.14))errs.push(tag+'coup recu : '+JSON.stringify(R.hurt))}
 // 1. spam a l'aveugle
 for(const dk of ['normal','hard'])for(const [ph,nm] of PH){const out=[];
  for(const sp of [.25,.5,.75,1]){const r=await run(pg,{dk,phase:ph,spam:sp,seed:3,maxT:300});out.push(sp+' s : '+r.res+' en '+r.t+' s, boss '+r.boss);
   if(r.res!=='dead')errs.push('spam '+sp+' s, '+dk+', phase '+nm+' : '+r.res+' (le Veilleur devrait mourir)')}
  console.log('spam',dk.padEnd(6),'phase',nm.padEnd(3),out.join(' ; '))}
 // 2. un appui un peu trop tot
 let all=[];
 for(const [ph,nm] of PH){const H=[];for(const d of [.05,.1,.2])for(let n=1;n<=8;n++)H.push((await run(pg,{dk:'normal',phase:ph,sigma:0,aim:.06,seed:n,early:{n,d}})).hits);
  all=all.concat(H);console.log('un appui trop tot, Normal, phase',nm.padEnd(3),'PV perdus -> nombre de cas :',dist(H))}
 const bad=all.filter(h=>h>1).length;console.log('plus d\'un coup :',bad+'/'+all.length);
 if(bad)errs.push('un appui trop tot coute plus d\'un coup dans '+bad+' cas sur '+all.length);
 // 3. joueur parfait
 for(const dk of ['normal','hard'])for(const [ph,nm] of PH){const r=await run(pg,{dk,phase:ph,sigma:0,aim:.06,seed:4});
  console.log('joueur parfait',dk.padEnd(6),'phase',nm.padEnd(3),r.res,r.hits+' coups recus');
  if(r.hits||!['cleared','win'].includes(r.res))errs.push('joueur parfait : '+dk+' phase '+nm+' '+r.res+', '+r.hits+' coups')}
 errs.push(...perr);console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
