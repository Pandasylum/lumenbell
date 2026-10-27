// Chapitre II : textes. Sans navigateur. Sortie attendue : errs []
// 1. definition _(en, fr) dans le dist ;
// 2. liste de reference : tous les appels _(en, fr) du dist, dans l'ordre, doivent redonner exactement
//    chapters/ch2-silent-bells/TEXTES.md (tableau lisible, relu et valide). Apres un changement de texte voulu :
//    node tests/ch2-texts.js --write, relire le diff de TEXTES.md, committer avec la source ;
// 3. FR et EN identiques en structure (chaine vide des deux cotes ou d'aucun, meme nombre de phrases,
//    de « · » et de « … », meme ponctuation finale).
const fs=require('fs'),path=require('path');const {ROOT,DIST,script,calls,lit}=require('./ch2-lib');
const REF=path.join(ROOT,'chapters/ch2-silent-bells/TEXTES.md');
const errs=[];
const code=script(fs.readFileSync(DIST,'utf8'));
if(!/const _=\(en,fr\)=>LANG==='fr'\?fr:en;/.test(code))errs.push('definition _(en,fr) absente du dist');
const C=calls(code);
for(const c of C)if(c.args.length!==2)errs.push('appel a '+c.args.length+' arguments: '+code.slice(c.at,c.at+60));
const cell=a=>{const v=lit(a);return v===null?'`'+a.replace(/`/g,"'")+'`':v===''?'*(vide)*':v.replace(/\|/g,'\\|').replace(/\n/g,' ')};
const md='# Textes du Chapitre II (EN / FR)\n\n'+
 'Genere par `node tests/ch2-texts.js --write` depuis `chapters/ch2-silent-bells/dist/index.html` : tous les appels `_(en, fr)`, dans l\'ordre du script. '+
 '`tests/ch2-texts.js` echoue si le jeu ne redonne pas exactement ce fichier. Texte en `code` : argument calcule (pas une chaine simple). '+
 'Les onomatopees (identiques dans les deux langues) ne passent pas par `_()`.\n\n'+
 '| # | Anglais | Français |\n|---|---|---|\n'+C.map((c,i)=>'| '+(i+1)+' | '+cell(c.args[0])+' | '+cell(c.args[1])+' |').join('\n')+'\n';
if(process.argv.includes('--write')){fs.writeFileSync(REF,md);console.log('ecrit',path.relative(ROOT,REF),C.length,'couples')}
else{const ref=fs.existsSync(REF)?fs.readFileSync(REF,'utf8'):'';
 if(ref!==md){const a=ref.split('\n'),b=md.split('\n');let n=0;
  for(let i=0;i<Math.max(a.length,b.length)&&n<12;i++)if(a[i]!==b[i]){errs.push('TEXTES.md ligne '+(i+1)+': attendu '+JSON.stringify(a[i])+' ; dist '+JSON.stringify(b[i]));n++}}}
// structure FR / EN
const shape=s=>{const t=s.replace(/[\s  »”"']+$/,'');return{empty:!s.trim(),dots:(s.match(/·/g)||[]).length,ell:(s.match(/…/g)||[]).length,
 sent:(t.match(/[.!?…](?=\s|$)/g)||[]).length,end:(t.match(/[.!?…:]$/)||[''])[0]}};
let nLit=0;
for(const c of C){const en=lit(c.args[0]),fr=lit(c.args[1]);if(en===null||fr===null)continue;nLit++;
 const a=shape(en),b=shape(fr);
 for(const k of ['empty','dots','ell','sent','end'])if(a[k]!==b[k]){errs.push('structure ('+k+'): '+JSON.stringify(en)+' / '+JSON.stringify(fr));break}}
console.log('couples',C.length,'dont',nLit,'litteraux ; reference',path.relative(ROOT,REF));
console.log('errs',errs);process.exitCode=errs.length?1:0;
