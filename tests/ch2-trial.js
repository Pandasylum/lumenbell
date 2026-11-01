// Chapitre II : PV du Veilleur par difficulte (6 / 4 / 3, Epreuve 4 PV pour tout le parcours) et Epreuve :
// PV conserves d'une phase a l'autre avec +1 PV rendu entre les phases (plafond : 4 PV de depart), une chute renvoie a la phase I avec 4 PV. Hors Epreuve, PV rendus entre les phases.
// Sur la copie de test a crochets (ch2-lib.js) avec le bot de ch2-bot.js. Sortie attendue : errs []
const launch=require('./launch');const {open,run,go}=require('./ch2-bot');
const errs=[];
(async()=>{const b=await launch(),{pg,errs:perr}=await open(b);
 // [PV, multiplicateur de l'action m (x2 / x1 / x0,6), multiplicateur de la recuperation rm (x1,2 en Difficile, comme au Chapitre I)]
 const want={easy:[6,2,1],normal:[4,1,1],hard:[3,.6,1.2],tn:[4,1,1],th:[4,.6,1.2]};
 const d=await pg.evaluate(()=>Object.fromEntries(Object.entries(__t.DIFFS).map(([k,v])=>[k,[v.hp,v.m,v.rm,!!v.trial,v.heal]])));
 console.log('DIFFS [PV, m, rm, epreuve, soin]',JSON.stringify(d));
 for(const k in want){if(d[k][0]!==want[k][0])errs.push(k+': PV '+d[k][0]+' au lieu de '+want[k][0]);if(d[k][1]!==want[k][1]||d[k][2]!==want[k][2])errs.push(k+': m '+d[k][1]+' rm '+d[k][2]+' au lieu de '+want[k][1]+' / '+want[k][2])}
 if(!d.tn[3]||!d.th[3]||d.tn[4]!==1||d.th[4]!==1)errs.push('Epreuve : drapeaux trial/heal (heal = 1 attendu)');
 for(const dk of ['tn','th','normal']){
  // phase I (interne 2) gagnee, puis arret au debut de la phase II (interne 1)
  const r1=await run(pg,{dk,sigma:.03,seed:5,miss:1,untilPhase:1});
  const end=r1.hpAt.ko21,start=r1.hpAt[11];
  console.log(dk,'phase I',r1.res,'PV fin phase I',end+'/'+r1.hpMax,'PV debut phase II',start);
  if(r1.res!=='phase')errs.push(dk+': phase II non atteinte ('+r1.res+')');
  if(r1.hpMax!==want[dk][0])errs.push(dk+': PV max '+r1.hpMax);
  if(!(end<r1.hpMax))errs.push(dk+': au moins un coup recu attendu en phase I (PV '+end+')');
  if(dk==='normal'){if(start!==r1.hpMax)errs.push('normal: PV non rendus entre les phases')}
  else if(start!==Math.min(r1.hpMax,end+1))errs.push(dk+': PV '+end+' -> '+start+' entre les phases (+1 PV, plafond '+r1.hpMax+' attendus)');
  // chute en phase II
  const r2=await run(pg,{cont:true,sloppy:true,sigma:.25,seed:9});
  if(r2.res!=='dead')errs.push(dk+': pas de chute ('+r2.res+')');
  const after=await go(pg);console.log(dk,'apres la chute',JSON.stringify(after));
  if(dk!=='normal'&&(after.phase!==2||after.hp!==4||!after.trial))errs.push(dk+': apres la chute, phase '+after.phase+' PV '+after.hp+' (attendu phase I, 4 PV)');
  if(dk==='normal'&&(after.phase!==1||after.hp!==4))errs.push('normal: apres la chute, phase '+after.phase+' PV '+after.hp+' (attendu meme phase, PV pleins)')}
 errs.push(...perr);console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
