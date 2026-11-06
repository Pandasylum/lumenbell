// Controle statique de LB.BOSS_DIFF (shared/js/18-boss-diff.js) : forme de la table commune, aucun override non liste,
// de LB.BOSS_RULES / LB.rageState / LB.healFor (dernier assaut, rugissement, relance de rage, plafonnement du soin), et aucune copie locale des PV ou seuils de boss dans le script publie d'un chapitre (voir CLAUDE.md, « Difficulté et chapitres »).
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
 const R=LB.BOSS_RULES,RS=LB.rageState;
 if(!R||R.finalHp!==1||R.rageDur!==1.6||R.rageDur2!==.8)E('LB.BOSS_RULES doit valoir finalHp 1, rageDur 1,6, rageDur2 0,8');
 if(!RS||!LB.healFor||LB.healFor(true,4,1)!==4||LB.healFor(1,4,3)!==4||LB.healFor(1,4,2)!==3||LB.healFor(2,4,4)!==4||LB.healFor(0,4,2)!==2)E('LB.healFor: plafonnement du soin inattendu');
 else{const S=Object.assign({bossHp:5},RS.fresh());
  if(RS.check(S,[5],true)!==1||S.rageNext!==1||RS.check(S,[5],true)!==0)E('LB.rageState: la premiere rage doit partir une seule fois par attente');
  S.rageNext=0;if(RS.check(S,[5],true)!==1)E('LB.rageState: une rage dont le contre a echoue doit repartir');
  S.rageNext=0;S.bossHp=4;if(RS.check(S,[5],true)!==0)E('LB.rageState: boss touche, les attaques normales doivent reprendre');
  S.bossHp=1;S.finalDone=true;if(RS.check(S,[5],true)!==0||S.finalDone!==false||!RS.isFinal(S,true)||RS.isFinal(S,false))E('LB.rageState: dernier assaut')}
 const own=rest.replace(/LB\.BOSS_RULES=[\s\S]*?LB\.healFor=[^\n]*\n/,'');
 if(own===rest)E('bloc LB.BOSS_RULES absent du script publie');
 for(const m of own.matchAll(/\bqRage\(\s*[^,)]*\b(?:1\.6|0?\.8)\b|\?\s*0?\.8\s*:\s*1\.6\b/g))E('duree de rugissement recodee (LB.BOSS_RULES.rageDur / rageDur2): '+m[0]);
 for(const m of own.matchAll(/\b(?:bhp|bossHp)\s*(?:<=\s*1|===?\s*1|<\s*2)\b/g))E('dernier assaut recode (LB.BOSS_RULES.finalHp): '+m[0]);
 for(const m of own.matchAll(/Math\.min\([^;\n()]*\.heal\b|\bheal\s*===\s*true/g))E('plafonnement du soin recode (LB.healFor): '+m[0]);
 return errs};
