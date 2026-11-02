// Chapitre II : aucun mot d'annonce a l'ecran (« Parfait ! », « Paré », « Esquivé », « Touché », « Contré », « Un reflet ! »,
// « Trop tard », « FRAPPE ! », « TIENS ! », « Coup de grâce »..., FR et EN). Seuls s'affichent les onomatopees et les
// titres ; les phrases descriptives vont au lecteur d'ecran (say), qui n'est pas controle ici.
// 1. statique : premiers arguments de pop(), fillText(), strokeText(), caption(), title(), bossBar() dans le dist ;
// 2. en jeu (copie de test a crochets) : tout texte dessine sur le canvas pendant un parcours complet (prologue,
//    phases I a III, forme II, fin, outro) avec un joueur parfait, puis chaque phase avec un bot maladroit (blessures,
//    reflets touches, garde brisee, defaite), en Normal et en Difficile, FR et EN.
// 3. aucun texte hors du cahier des charges sur le canvas : chaque texte dessine est un texte valide de docs/CH2-SPEC.md
//    (intro, outro, titres de phase, noms de boss, titre du chapitre, mot grave sur la cloche), le nom de la serie (entier, ou « LUMEN » et
//    « BELL » dessines bout a bout par LB.title) ou une onomatopee (ONO), ou une
//    ligne d'un de ces textes coupe en deux (legendes trop longues), ou le titre « à suivre » de l'outro (LB.nextCard :
//    « LUMENBELL · CHAPITRE III » / « CHAPTER III », « HOLLOW ROOTS »).
// Sortie attendue : errs []
const fs=require('fs');const launch=require('./launch');const {DIST,script,specTexts}=require('./ch2-lib');const {open,run}=require('./ch2-bot');
const {banned}=require('./ch2-lib');   // liste BAN commune (ch2-lib.js, reprise par announce.js)
const errs=[];
// 1. statique
{const code=script(fs.readFileSync(DIST,'utf8'));let n=0;
 for(const m of code.matchAll(/(?<![\w$.])(pop|fillText|strokeText|caption|title|bossBar)\(([^;]*?)(?:\)|,)/g)){n++;const b=banned(m[2]);if(b)errs.push('statique '+m[1]+'('+m[2].slice(0,60)+') : '+b)}
 console.log('statique',n,'appels lus')}
// 2. en jeu
(async()=>{const b=await launch(),{pg,errs:perr}=await open(b);
 const seen={};
 for(const lang of ['fr','en'])for(const dk of ['normal','hard']){
  await pg.evaluate(l=>{document.querySelector('#langs button[data-lang='+l+']').click()},lang);
  const R=[];
  R.push(['parcours',await run(pg,{dk,sigma:0,aim:.06,seed:7,prologue:true,drawEvery:6})]);
  for(const ph of [1,2,3])R.push(['maladroit phase '+['','I','II','III'][ph],await run(pg,{dk,phase:ph,sigma:.12,sloppy:true,seed:11+ph,drawEvery:4})]);
  console.log(lang,dk,R.map(([k,r])=>k+': '+r.res+' (phase '+r.phase+'.'+r.form+', '+r.t+' s, '+r.hits+' coups)').join(' ; '));
  if(R[0][1].res!=='win')errs.push(lang+' '+dk+': parcours complet non gagne ('+R[0][1].res+')');
  const d=await pg.evaluate(()=>{const d=window.__drawn;window.__drawn={};return d});
  for(const k in d)seen[k]=(seen[k]||0)+d[k]}
 for(const k in seen){const b2=banned(k);if(b2)errs.push('affiche : '+JSON.stringify(k)+' ('+seen[k]+' images) : '+b2)}
 {const sp=specTexts(),ONO=['CLANG','BAM','KRAKOOM','KRAAAK'],ok=[...sp.pairs,...sp.titles,...sp.bosses,sp.engraving].flat().concat('Lumenbell','Lumen','Bell',ONO,'LUMENBELL · CHAPITRE III','LUMENBELL · CHAPTER III','BELL · CHAPITRE III','BELL · CHAPTER III','HOLLOW ROOTS').map(x=>x.toUpperCase());
  for(const k in seen){const t=k.replace(/\u200a/g,'').toUpperCase().trim();if(!t)continue;
   if(!ok.some(x=>x===t||(t.length>12&&(x.startsWith(t+' ')||x.endsWith(' '+t)))))errs.push('texte hors cahier des charges : '+JSON.stringify(k))}}
 console.log('textes dessines :',Object.keys(seen).sort().map(k=>JSON.stringify(k.replace(/ /g,''))).join(', '));
 errs.push(...perr);console.log('errs',errs);await b.close();process.exitCode=errs.length?1:0})().catch(e=>{console.log('errs',errs.concat('exception: '+e.message));process.exit(1)});
