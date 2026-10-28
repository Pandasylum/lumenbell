/* ---------- combat sound effects: wind-ups, releases and impacts ---------- */
const SFX_START={wave:'rumble',rafter:'fallWhine',kwave:'swell',sring:'bellSoft',slam:'draw',sweep:'draw',chain:'chainSlip',stomp:'rumble',rock:'fallWhine',shard:'glints',wail:'voice',back:'swell',beam:'beam',lbeam:'beam',bolt:'charge',spike:'iceCrack',ring:'bellSoft',moon:'chainSlip',trap:'swell',burst:'overload',reform:'clank',implode:'overload'};
const SFX_MID={sring:'whoosh',orb:'throw',toll:'tollLast',ring:'whoosh',trap:'whooshDown',chunk:'clank',shard:'whoosh',sweep:'whoosh',slam:'whoosh'};
const SFX_HIT={wave:'plant',sring:'clank',slam:'slam',sweep:'plant',chain:'clank',bolt:'thunder',spike:'crackGlass',ring:'clank',hpBack:'clank'};
function combatSfx(){
  if(S.mode!=='play'||S.paused)return;
  for(const th of S.threats){
    if(!th.a0&&gt>=th.t0){th.a0=1;const n=SFX_START[th.k];if(n&&th.real!==false)MUSIC.fx(n)}
    const mt=th.k==='toll'?th.tw:(th.k==='slam'||th.k==='sweep')?th.ti-.3:th.tl;
    if(mt!=null&&!th.a1&&gt>=mt){th.a1=1;const n=SFX_MID[th.k];if(n)MUSIC.fx(n)}
    if(!th.hold&&th.ti!=null&&!th.a2&&gt>=th.ti&&th.real!==false){th.a2=1;const n=SFX_HIT[th.k];if(n)MUSIC.fx(n)}
  }
}
function counterFx(){MUSIC.fx([null,'impactLight','throw','thunder'][S.phase])}

/* ---------- per-frame game logic on top of the engine ---------- */
function gameUpdate(dt){
  if(S.mode==='cine'&&S.cine&&gt-S.cine.t0>=CINE_LEN[S.phase][S.cine.k])endCine();
  if(S.mode==='prologue'&&gt-S.proT0>=PRO_LEN)endPrologue();
  if(S.mode==='epilogue'&&gt-S.epT0>=EPI_LEN)endEpilogue();
  combatSfx();
  // phase I: the muffled bell under the hatch
  if(S.phase===2&&(S.mode==='play'||(S.mode==='cine'&&S.cine&&S.cine.k==='in'))&&!S.paused){if(!S.hatchRing||gt-S.hatchRing>HATCH.toll){S.hatchRing=gt;MUSIC.fx('bellMuffled')}}
  if(S.mode==='play'&&S.phase===1)S.parasite=S.rageN?.6+.15*Math.sin(gt*3):0;
  if(S.phase===3&&S.form===2&&(S.mode==='play'||S.mode==='ko')&&!S.paused){
    S.ecPhi+=(S.bossHp<=S.bossMax/2?1.05:.7)*dt;
  }
  if(S.mode==='ko'&&!S.koShown&&gt>S.koT+.45){S.koShown=true;phaseCleared()}
}

