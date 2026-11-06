// Controle statique de LB.BOSS_DIFF (shared/js/18-boss-diff.js) : forme de la table commune, aucun override non liste,
// et aucune copie locale des PV ou seuils de boss dans le script publie d'un chapitre (voir CLAUDE.md, « Difficulté et chapitres »).
// Usage : require('./boss-diff-static')(html, 'ch1'|'ch2') -> liste d'erreurs.
const fs=require('fs'),path=require('path');
module.exports=function(html,chap){
 const errs=[],E=m=>errs.push('boss-diff ('+chap+'): '+m);
 const src=fs.readFileSync(path.resolve(__dirname,'../shared/js/18-boss-diff.js'),'utf8');
 const LB={};try{new Function('LB',src)(LB)}catch(e){E('fichier commun illisible: '+e.message);return errs}
 const isN=v=>Number.isInteger(v)&&v>0,isR=(a,hp)=>Array.isArray(a)&&a.length>0&&a.every((x,i)=>isN(x)&&x<=hp&&(!i||x<a[i-1]));
 const B=LB.BOSS_DIFF;
 if(!B||Object.keys(B).sort().join()!=='easy,hard,normal')E('LB.BOSS_DIFF doit avoir easy, normal et hard');
 else for(const k of ['easy','normal','hard']){const d=LB.bossDiff(k,chap,'x'),o=B[k];
  if(!isN(o.hp))E(k+': hp invalide');
  else if(!isR(o.rages,o.hp)||!isR(o.rages3,o.hp3||o.hp))E(k+': rages ou rages3 invalide (entiers decroissants, <= PV)');
  if(o.hp3!==undefined&&!isN(o.hp3))E(k+': hp3 invalide');
  if(!isN(d.hp)||!isN(d.hp3)||!d.rages||!d.rages3||LB.rageHp(d,1)!==d.rages||LB.rageHp(d,3)!==d.rages3)E(k+': LB.bossDiff / LB.rageHp renvoient une forme inattendue')}
 if(Object.keys(LB.BOSS_OVERRIDE||{}).length)E('LB.BOSS_OVERRIDE non vide : lister chaque ecart dans docs/decisions, puis adapter ce test');
 if(!/LB\.BOSS_DIFF=\{/.test(html))E('LB.BOSS_DIFF absent du script publie');
 const rest=html.replace(/LB\.BOSS_DIFF=\{[\s\S]*?\n\};/,'');
 for(const m of rest.matchAll(/\b(?:bhp|rbhp|ru|u2|u3|boss3|hp3|rages3?)\s*:\s*[\[\d]|\bboss\s*:\s*\d|\bu\s*:\s*\[?\d/g))E('copie locale des PV ou seuils de boss: '+m[0]);
 for(const m of rest.matchAll(/\b(?:const|let|var)\s+rageHp\b|\bDIFFS?\.(?:bhp|rbhp|ru|u2?|rages)\b/g))E('ancienne lecture locale: '+m[0]);
 return errs};
