// Chapitre II : controle de l'inversion _(fr, en) -> _(en, fr).
// Extrait les couples (fr, en) de l'import d'origine (legacy, _(fr,en)) et du dist (_(en,fr)) : la liste doit etre
// identique, dans le meme ordre, au caractere pres. Verifie aussi la definition de _ dans le dist.
// Extracteur independant de build/ch2_swap_args.py. Sortie attendue : errs []
const fs=require('fs'),path=require('path');
const R=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const LEGACY='chapters/ch2-silent-bells/legacy/silent-bells.source.html',DIST='chapters/ch2-silent-bells/dist/index.html';
const errs=[];
const script=h=>{const m=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];if(m.length!==1)errs.push('scripts: '+m.length);return m[0][1]};
// liste des appels _(a,b) (imbriques compris, dans l'ordre d'apparition) : [arg1, arg2] bruts, sans espaces autour
function calls(code){const out=[];const re=/(?<![\w$.])_\(/g;let m;
 const parse=i=>{const args=[];let d=0,st=i;
  for(;;){const c=code[i];
   if(c==="'"||c==='"'||c==='`'){const q=c;i++;while(code[i]!==q){if(code[i]==='\\')i++;i++}i++;continue}
   if('([{'.includes(c))d++;
   else if(')]}'.includes(c)){if(!d){args.push(code.slice(st,i).trim());return args}d--}
   else if(c===','&&!d){args.push(code.slice(st,i).trim());st=i+1}
   i++}};
 while((m=re.exec(code))){const a=parse(m.index+2);if(a.length!==2)errs.push('appel a '+a.length+' arguments: '+code.slice(m.index,m.index+60));out.push(a)}
 return out}
const before=calls(script(R(LEGACY))).map(([fr,en])=>[fr,en]);
const distCode=script(R(DIST));
const after=calls(distCode).map(([en,fr])=>[fr,en]);
if(!/const _=\(en,fr\)=>LANG==='fr'\?fr:en;/.test(distCode))errs.push('definition _(en,fr) absente du dist');
if(before.length!==after.length)errs.push('nombre de couples: '+before.length+' avant, '+after.length+' apres');
for(let i=0;i<Math.max(before.length,after.length);i++){const a=JSON.stringify(before[i]),b=JSON.stringify(after[i]);if(a!==b){errs.push('couple '+i+': '+a+' devenu '+b);if(errs.length>10)break}}
console.log('couples (fr, en)',before.length,'avant,',after.length,'apres');
console.log('errs',errs);process.exitCode=errs.length?1:0;
