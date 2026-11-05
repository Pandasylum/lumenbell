// Imagerie promotionnelle de Lumenbell (Chapitres I et II, hub), faite de captures du jeu lui-meme (tout est dessine au canvas).
// Aucun fichier source du jeu ni dist n'est modifie : le Chapitre II est joue dans la copie de test a crochets de tests/ch2-lib.js
// (build/out/ch2-test.html), le Chapitre I dans celle de build/build_test.py (build/out/test.html), le hub dans site/index.html.
// Les sorties vont dans build/out/promo/ (ignore par git).
//
// Commande unique, tout regenerer :   node build/promo.js            (PW_CHROMIUM=/chemin/chromium si besoin ; ffmpeg et python3 + Pillow requis)
// Une etape seule :                   node build/promo.js shots | clips | social | check | sheet | report
//
// Determinisme : requestAnimationFrame absent (le test fait avancer le jeu lui-meme, pas fixe de 1/60 s), Math.random a graine fixe,
// performance.now / Date.now sur une horloge manuelle, animations CSS coupees a la capture ; le bot joue en parfait (appui 50 ms avant l'impact).
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'build/out/promo');
const TMP = path.join(ROOT, 'build/out/promo-tmp');
const launch = require(path.join(ROOT, 'tests/launch'));
const { testPage } = require(path.join(ROOT, 'tests/ch2-lib'));
const SEED = 20261105;

/* ---------------- cote page : horloge, graine, bot parfait, avance pas a pas ---------------- */
function pagePrelude(seed) {
  let s = seed >>> 0 || 1, s2 = 99, inRt = false;   // flux A : le jeu, pas a pas ; flux B : rappels en temps reel (minuteries, rAF natif), pour qu'ils ne decalent jamais le flux A
  Math.random = () => { if (inRt) { s2 = s2 * 1664525 + 1013904223 >>> 0; return s2 / 4294967296; } s = s * 1664525 + 1013904223 >>> 0; return s / 4294967296; };
  window.__seed = v => { s = v >>> 0 || 1; };
  const rt = cb => typeof cb === 'function' ? function () { const p = inRt; inRt = true; try { return cb.apply(this, arguments); } finally { inRt = p; } } : cb;
  for (const k of ['setTimeout', 'setInterval']) { const f = window[k]; window[k] = (cb, ...a) => f(rt(cb), ...a); }
  { const f = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => f(rt(cb)); }
  const D0 = Date.UTC(2026, 10, 5); window.__clk = 0;
  performance.now = () => window.__clk; Date.now = () => D0 + window.__clk;
}
/* Chapitre II : api page. T = window.__t (crochets de la copie de test) */
function pageApi2() {
  const T = window.__t, dt = 1 / 60; let held = false, tapUp = false;
  const B = window.__bot = { on: true, aim: 0.05, lead: 0.12 }; // aim : secondes avant l'impact (parfait : <= 0,08)
  function bot() {
    const S = T.S;
    if (S.mode === 'card' && B.cards) { T.go(); return; }
    if (S.mode === 'play' && !S.paused) {
      const t = T.gt; let wantHold = false, tap = false;
      for (const th of S.threats) {
        if (th.done) continue;
        if (th.hold) { if (t >= th.ta - B.lead && t <= th.tb + .04) wantHold = true; continue; }
        if (th.ti == null) continue;
        if (th._bp == null) th._bp = th.real === false ? Infinity : th.ti - B.aim;
        if (!th._pr && t >= th._bp) { th._pr = 1; tap = true; }
      }
      if (tapUp) { T.up(); held = false; tapUp = false; }
      if (tap) { if (held) T.up(); T.down(); held = true; tapUp = !wantHold; }
      else if (wantHold && !held) { T.down(); held = true; }
      else if (!wantHold && held) { T.up(); held = false; }
    } else if (held) { T.up(); held = false; tapUp = false; }
  }
  function snap() {
    const S = T.S;
    return { mode: S.mode, phase: S.phase, form: S.form || 1, hp: S.hp, hpMax: S.hpMax, boss: S.bossHp, bossMax: S.bossMax, hits: S.hits, perfects: S.perfects,
      gt: +T.gt.toFixed(3), cnt: S.cnt ? { k: S.cnt.k, spell: S.cnt.spell, p: +((T.gt - S.cnt.t) / S.cnt.dur).toFixed(3) } : null,
      pops: (S.pops || []).filter(p => T.gt - p.t0 < .6).map(p => p.txt), hd: !!S.holding, cn: window.__cn || 0,
      ca: (() => { const a = (S.pops || []).filter(p => p.txt === 'CLANG').map(p => T.gt - p.t0).filter(a => a >= 0); return a.length ? Math.min(...a) : null; })(),
      fk: (() => { const a = S.threats.filter(x => !x.done && x.real === false && x.ti != null).map(x => x.ti - T.gt).filter(a => a > 0); return a.length ? Math.min(...a) : null; })(),
      rt: (() => { const a = S.threats.filter(x => !x.done && x.real !== false && x.ti != null).map(x => x.ti - T.gt).filter(a => a > 0); return a.length ? Math.min(...a) : null; })(), pl: S.pl && S.pl.s, th: S.threats.filter(x => !x.done).map(x => x.k + (x.real === false ? '~' : '') + ':' + (x.ti != null ? +(x.ti - T.gt).toFixed(2) : '-')) };
  }
  window.__snap = snap;
  window.__frame = (n, o) => { for (let i = 0; i < n; i++) { if (!o || o.bot !== false) bot(); window.__clk += 1000 / 60; T.step(dt, true);
    if ((T.S.pops || []).some(p => p.txt === 'CLANG' && Math.abs(T.gt - p.t0) < 1e-6)) window.__cn = (window.__cn || 0) + 1; } return snap(); };
  /* avance jusqu'a ce que pred(S, T, snap) soit vrai ; renvoie {n, snap} (n = images jouees, -1 si max atteint) */
  window.__until = (src, max) => { const f = new Function('S', 'T', 'q', 'return (' + src + ')'); let n = 0; for (; n < max; n++) { const q = snap(); if (f(T.S, T, q)) return { n, snap: q }; window.__frame(1); } return { n: -1, snap: snap() }; };
}

/* registre de tous les textes dessines au canvas (controle des ecrans exclus) */
function hookText() { window.__drawn = {}; const P = CanvasRenderingContext2D.prototype;
  for (const k of ['fillText', 'strokeText']) { const f = P[k]; P[k] = function (t) { const s = String(t); window.__drawn[s] = 1; return f.apply(this, arguments); }; } }
/* ---------------- ouverture des pages ---------------- */
async function open2(b, { w, h, lang }) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, offline: true, locale: lang === 'fr' ? 'fr-FR' : 'en-US' });
  await ctx.addInitScript(pagePrelude, SEED);
  await ctx.addInitScript(hookText);
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto('file://' + testPage()); await pg.waitForTimeout(250);
  await pg.evaluate(pageApi2);
  await pg.evaluate(l => { document.querySelector('#langs button[data-lang=' + l + ']').click(); }, lang);
  await pg.evaluate(() => window.__seed(1)); // meme graine au depart de chaque langue
  return { pg, ctx, errs, lang };
}
const frame = (pg, n, o) => pg.evaluate(([n, o]) => window.__frame(n, o), [n, o || null]);
const until = async (pg, src, max) => { const r = await pg.evaluate(([s, m]) => window.__until(s, m), [src, max]); if (r.n < 0) throw new Error('condition jamais atteinte : ' + src + ' ' + JSON.stringify(r.snap)); return r; };
const snap = pg => pg.evaluate(() => window.__snap());
async function settle(pg) { await pg.evaluate(() => { document.activeElement && document.activeElement.blur(); }); await pg.mouse.move(0, 0); }
/* capture de la scene (le canvas du jeu, #stage 960 x 540 css, sans la bordure) en 1920 x 1080 */
async function shotStage(pg, file, clip) {
  await settle(pg);
  const el = pg.locator('#stage');
  if (clip) { const bb = await el.boundingBox(); await pg.screenshot({ path: file, animations: 'disabled', clip: { x: bb.x + clip.x, y: bb.y + clip.y, width: clip.w, height: clip.h } }); }
  else await el.screenshot({ path: file, animations: 'disabled' });
}
async function shotPage(pg, file) { await settle(pg); await pg.screenshot({ path: file, animations: 'disabled' }); }
const mk = d => fs.mkdirSync(d, { recursive: true });


/* ---------------- Chapitre I : copie de test, horloge manuelle, bot du centre de fenetre ---------------- */
function prelude1(seed) {
  let s = seed >>> 0 || 1, s2 = 99, inRt = false; Math.random = () => { if (inRt) { s2 = s2 * 1664525 + 1013904223 >>> 0; return s2 / 4294967296; } s = s * 1664525 + 1013904223 >>> 0; return s / 4294967296; };
  window.__seed = v => { s = v >>> 0 || 1; };
  const rt = cb => typeof cb === 'function' ? function () { const p = inRt; inRt = true; try { return cb.apply(this, arguments); } finally { inRt = p; } } : cb;
  for (const k of ['setTimeout', 'setInterval']) { const f = window[k]; window[k] = (cb, ...a) => f(rt(cb), ...a); }
  let now = 0, id = 0; const q = new Map(); performance.now = () => now; const D0 = Date.UTC(2026, 10, 5); Date.now = () => D0 + now;
  window.requestAnimationFrame = cb => { q.set(++id, cb); return id; }; window.cancelAnimationFrame = i => q.delete(i);
  window.__adv = n => { for (let k = 0; k < n; k++) { window.__pre && window.__pre(); now += 1000 / 60; const cbs = [...q.values()]; q.clear(); for (const cb of cbs) cb(now); } };
}
function api1() {
  const T = window.__t, ACT = () => .333 * T.getDIFF().m, X = T.T; let lastImp = 1e9, pressed = false, thr = null, lead = 0; const B = window.__bot = { on: true };
  const imp = () => { const R = T.getR(), Q = T.getQ(), G = T.getG(), w = ACT();
    if (R) { if (R.mode !== 'play' || !R.atk) return null; const a = R.atk, h = a.hits.find(x => !x.done); if (!h) return null; return { t: h.at - a.t, id: a.hits.indexOf(h) + '/' + a.kind + '/' + a.t0, w: h.k === 'breath' ? T.getBRW() : w, g: .06 }; }
    if (Q) { if (Q.mode !== 'play' || !Q.atk) return null; const a = Q.atk, h = a.hits.find(x => !x.done); if (!h) return null; return { t: h.at - a.t, id: a.hits.indexOf(h) + '/' + a.kind + '/' + a.t0, w, g: .05 }; }
    if (G.mode !== 'play') return null; const b = G.boss, g = .06, fl = X.flwin + .03;
    switch (b.s) {
      case 'windup': return { t: X.windup - b.t + (b.sk || X.strike), w, g }; case 'rewind': return { t: .18 - b.t + (b.sk || X.strike), w, g }; case 'strike': return { t: (b.sk || X.strike) - b.t, w, g };
      case 'sw1w': return { t: X.sw1w - b.t + X.sw1, w, g }; case 'sw1': return { t: X.sw1 - b.t, w, g };
      case 'swgap': return { t: X.swgap - b.t + X.sw2w + X.sw2, w, g }; case 'sw2w': return { t: X.sw2w - b.t + X.sw2, w, g }; case 'sw2': return { t: X.sw2 - b.t, w, g };
      case 'sw3g': return { t: X.sw3g - b.t + X.sw3w + X.sw3, w, g }; case 'sw3w': return { t: X.sw3w - b.t + X.sw3, w, g }; case 'sw3': return { t: X.sw3 - b.t, w, g };
      case 'fl_in': return { t: (b.fli || X.fli) - b.t + X.flo, w: fl, g: 0 }; case 'fl_out': return { t: X.flo - b.t, w: fl, g: 0 };
      case 'fy_t': return { t: X.fyt - b.t + .3, w, g }; case 'fy_j': return { t: .3 - b.t, w, g }; case 'fy_gap': return { t: X.fyg - b.t + X.fyt + .3, w, g };
      case 'rk_t': return { t: .5 - b.t + .55, w, g }; case 'rk_j': return { t: .55 - b.t, w, g }; }
    return null; };
  window.__pre = () => { if (!B.on) return; const I = imp();
    if (I) { if (lastImp >= 1e9 || I.t > lastImp + 1e-6 || (I.id && I.id !== thr)) { pressed = false; lead = (I.w - I.g) / 2; } thr = I.id || thr; lastImp = I.t; if (!pressed && I.t <= lead) { pressed = true; T.press(); } }
    else { lastImp = 1e9; pressed = false; thr = null; } };
  window.__snap = () => { const R = T.getR(), Q = T.getQ(), G = T.getG(), S = R || Q || G; return { ph: R ? 2 : Q ? 1 : 0, mode: S && S.mode, php: S && S.php, bhp: S && S.bhp }; };
}
async function open1(b, { w, h, lang }) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, offline: true, locale: lang === 'fr' ? 'fr-FR' : 'en-US', reducedMotion: 'reduce' });
  await ctx.addInitScript(prelude1, 777); await ctx.addInitScript(hookText);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.join(ROOT, 'build/out/test.html')); await pg.waitForTimeout(200); await pg.evaluate(api1);
  await pg.evaluate(() => __adv(30));
  await pg.evaluate(l => document.querySelector('#langs button[data-lang=' + l + ']').click(), lang);
  return { pg, ctx, errs };
}

/* ---------------- journal des captures (controle des ecrans exclus) ---------------- */
const LOG = [];
const log = (file, extra) => LOG.push(Object.assign({ file: path.relative(OUT, file) }, extra));
async function drawnTexts(pg) { return pg.evaluate(() => Object.keys(window.__drawn || {})); }

/* ---------------- utilitaires image (Pillow) ---------------- */
function py(code, args) { const r = cp.spawnSync('python3', ['-I', '-c', code, ...args], { encoding: 'utf8' }); if (r.status) throw new Error(r.stderr); return r.stdout; }
const CLEAN = `
import sys
from PIL import Image
src,dst=sys.argv[1],sys.argv[2]
im=Image.open(src).convert('RGB')
if len(sys.argv)>4:   # la boite de l'element peut depasser d'une ligne (arrondi) : on garde le coin haut-gauche W x H
    W,H=int(sys.argv[3]),int(sys.argv[4]);im=im.crop((0,0,W,H))
im.save(dst,'PNG',optimize=True)   # sans aucune metadonnee
`;
function clean(src, dst, exact) { mk(path.dirname(dst)); py(CLEAN, [src, dst].concat(exact ? ['1920', '1080'] : [])); }
const CROP = `
import sys
from PIL import Image
src,dst,x,y,w,h,W,H=sys.argv[1:9]
x,y,w,h,W,H=map(int,(x,y,w,h,W,H))
im=Image.open(src).convert('RGB').crop((x,y,x+w,y+h))
if (W,H)!=(w,h): im=im.resize((W,H),Image.LANCZOS)
im.save(dst,'PNG',optimize=True)
`;
function crop(src, dst, x, y, w, h, W, H) { mk(path.dirname(dst)); py(CROP, [src, dst, x, y, w, h, W || w, H || h].map(String)); }

/* ---------------- Chapitre II : les captures ---------------- */
async function stage2(b, lang) {
  const dir = path.join(OUT, 'ch2', lang), tmp = path.join(TMP, 'ch2-' + lang); mk(dir); mk(tmp);
  const save = (pgFile, name) => { clean(pgFile, path.join(dir, name), name !== 'menu.png' && name !== 'intro-phare.png'); };
  // 1. menu et 2. intro (viewport 960 x 540 : le menu remplit la fenetre, l'intro est lue dans le canvas du cadre commun)
  { const { pg, ctx, errs } = await open2(b, { w: 960, h: 540, lang });
    await pg.evaluate(() => { __bot.cards = false; }); await frame(pg, 90, { bot: false });
    const f = path.join(tmp, 'menu.png'); await shotPage(pg, f); save(f, 'menu.png'); log(path.join(dir, 'menu.png'), { mode: 'menu' });
    await pg.evaluate(() => { __t.startRun('normal', false); });
    await frame(pg, 600, { bot: false }); // 10 s : plan du Phare au large
    const d = await pg.evaluate(() => document.getElementById('cineC').toDataURL('image/png'));
    const g = path.join(tmp, 'intro-phare.png'); fs.writeFileSync(g, Buffer.from(d.split(',')[1], 'base64')); save(g, 'intro-phare.png');
    log(path.join(dir, 'intro-phare.png'), { mode: 'prologue', t: 10 });
    if (lang === 'en') { fs.copyFileSync(g, path.join(TMP, 'intro-phare-raw.png')); }
    if (errs.length) throw new Error(errs.join(';')); await ctx.close(); }
  // 3 a 6 : les phases, bot parfait, Normal, aide desactivee, PV pleins
  const specs = [
    { ph: 1, name: 'p1-reflets.png', pred: "q.mode==='play'&&q.form===1&&q.phase===2&&q.gt>20&&q.fk!=null&&q.fk>.3&&q.fk<.45" },
    { ph: 2, name: 'p2-cale-blocage.png', pred: "q.mode==='play'&&q.phase===1&&q.cn>=3&&q.ca!=null&&q.ca>=.1&&q.ca<=.16" },
    { ph: 3, name: 'p3-phare-forme1.png', pred: "q.mode==='play'&&q.phase===3&&q.form===1&&q.hd&&!q.cnt&&q.boss>=q.bossMax-2&&q.cn>=1" },
    { ph: 3, name: 'riposte.png', pred: "q.mode==='play'&&q.phase===3&&q.form===1&&q.cnt&&q.cnt.k===3&&q.cnt.p>=.42&&q.boss>=q.bossMax-2" },
  ];
  for (const sp of specs) {
    const { pg, ctx, errs } = await open2(b, { w: 1280, h: 1000, lang });
    await pg.addStyleTag({ content: '.stage{border:0!important}' });
    await pg.evaluate(ph => { __t.startRun('normal', true); __t.jumpPhase(ph); __bot.cards = true; }, sp.ph);
    const r = await until(pg, sp.pred, 60 * 90);
    const f = path.join(tmp, sp.name); await shotStage(pg, f); save(f, sp.name);
    const q = r.snap; log(path.join(dir, sp.name), { mode: q.mode, phase: q.phase, form: q.form, hp: q.hp + '/' + q.hpMax, boss: q.boss + '/' + q.bossMax, gt: q.gt, frames: r.n, hits: q.hits, texts: await drawnTexts(pg) });
    if (errs.length) throw new Error(errs.join(';')); await ctx.close();
  }
}
async function hub(b, lang) {
  const ctx = await b.newContext({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2, locale: lang === 'fr' ? 'fr-FR' : 'en-US', reducedMotion: 'reduce' });
  await ctx.addInitScript(prelude1, 1234); const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.join(ROOT, 'site/index.html')); await pg.evaluate(() => __adv(30));
  await pg.evaluate(l => { const b = document.querySelector('#langs button[data-lang=' + l + ']'); b && b.click(); }, lang);
  await pg.evaluate(() => document.getElementById('gateBtn').click()); await pg.evaluate(() => { document.activeElement && document.activeElement.blur(); __adv(120); });
  const f = path.join(TMP, 'hub-' + lang + '.png'); await shotPage(pg, f); clean(f, path.join(OUT, 'hub', lang, 'hub-couronne.png'));
  log(path.join(OUT, 'hub', lang, 'hub-couronne.png'), { mode: 'hub', storage: await pg.evaluate(() => JSON.stringify(localStorage)) });
  if (errs.length) throw new Error(errs.join(';')); await ctx.close();
}
async function stage1(b, lang) {
  const dir = path.join(OUT, 'ch1', lang), tmp = path.join(TMP, 'ch1-' + lang); mk(dir); mk(tmp);
  { const { pg, ctx } = await open1(b, { w: 960, h: 540, lang }); await pg.evaluate(() => __adv(60)); const f = path.join(tmp, 'menu.png'); await shotPage(pg, f); clean(f, path.join(dir, 'menu.png')); log(path.join(dir, 'menu.png'), { mode: 'menu' }); await ctx.close(); }
  // pont (phase I), Fonderie (phase II), Clocher (phase III) : instants fixes, bot parfait
  for (const [ph, name, secs] of [[1, 'pont.png', 11], [2, 'fonderie-colosse.png', 6], [3, 'clocher.png', 12]]) {
    const { pg, ctx, errs } = await open1(b, { w: 1280, h: 1000, lang });
    await pg.addStyleTag({ content: '.stage{border:0!important}' });
    await pg.evaluate(ph => { __t.applyDiff('normal'); __t.goPhase(ph); if (ph === 1 || __t.getPaused()) __t.start(); }, ph);
    await pg.evaluate(n => __adv(n), secs * 60);
    const f = path.join(tmp, name); await shotStage(pg, f); clean(f, path.join(dir, name), true);
    const s = await pg.evaluate(() => __snap()); log(path.join(dir, name), Object.assign({ chapter: 1, ph, secs, texts: await drawnTexts(pg) }, s));
    if (errs.length) throw new Error(errs.join(';')); await ctx.close();
  }
}


/* ---------------- clips, GIF, MP4 ---------------- */
const sh = (cmd, args) => { const r = cp.spawnSync(cmd, args, { encoding: 'utf8' }); if (r.status) throw new Error(cmd + ' : ' + r.stderr.slice(-600)); return r; };
const FF = ['-hide_banner', '-loglevel', 'error', '-y'];
const size = f => fs.statSync(f).size;
/* capture une sequence : avance (bot parfait) jusqu'a startPred, puis une image toutes les `step` images de jeu pendant secs secondes */
async function sequence(b, o) {
  const { pg, ctx, errs } = await open2(b, { w: 1280, h: 1000, lang: 'en' });
  await pg.addStyleTag({ content: '.stage{border:0!important}' });
  await pg.evaluate(ph => { __t.startRun('normal', true); __t.jumpPhase(ph); __bot.cards = true; }, o.ph);
  const r = await until(pg, o.start, 60 * 120); const dir = path.join(TMP, o.name); fs.rmSync(dir, { recursive: true, force: true }); mk(dir);
  const n = Math.round(o.secs * 60 / o.step); const first = r.snap;
  for (let i = 0; i < n; i++) {
    await settle(pg); const el = pg.locator('#stage'); const f = path.join(dir, String(i).padStart(4, '0') + '.png');
    if (o.clip) { const bb = await el.boundingBox(); await pg.screenshot({ path: f, animations: 'disabled', clip: { x: bb.x + o.clip.x, y: bb.y + o.clip.y, width: o.clip.w, height: o.clip.h } }); }
    else await el.screenshot({ path: f, animations: 'disabled' });
    const q = await frame(pg, o.step); if (q.mode !== 'play' || (q.phase === 3 && q.form !== 1)) BAD.push(o.name + ' @' + q.gt + ' ' + q.mode + ' form ' + q.form);
  }
  const last = await snap(pg); const texts = await drawnTexts(pg);
  if (errs.length) throw new Error(errs.join(';')); await ctx.close();
  LOG.push({ file: o.name, mode: last.mode, phase: first.phase, form: last.form, boss: last.boss + '/' + last.bossMax, hp: last.hp + '/' + last.hpMax, hits: last.hits, gtStart: first.gt, gtEnd: last.gt, frames: n, texts });
  return { dir, n, first, last };
}
function gifFrom(dir, out, fps, w, h, colors, dither, pre) {
  const vf = `${pre || ''}scale=${w}:${h}:flags=lanczos,split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=diff[p];[b][p]paletteuse=dither=${dither}:diff_mode=rectangle`;
  sh('ffmpeg', [...FF, '-framerate', String(fps), '-i', path.join(dir, '%04d.png'), '-vf', vf, '-loop', '0', '-map_metadata', '-1', '-fflags', '+bitexact', out]);
}
/* GIF sous 3 Mo : echelle de repli (taille, couleurs, images/s) jusqu'a passer sous le seuil */
function gifUnder(dir, out, fps, w, h, limit, pre) {
  const ladder = [[w, 128, 'bayer:bayer_scale=5', fps], [w, 96, 'bayer:bayer_scale=5', fps], [w, 64, 'bayer:bayer_scale=5', fps], [Math.round(w * .85) & ~1, 64, 'bayer:bayer_scale=5', fps], [Math.round(w * .85) & ~1, 48, 'none', Math.min(fps, 15)]];
  for (const [ww, col, di, ff] of ladder) { const hh = Math.round(h * ww / w) & ~1; gifFrom(dir, out, ff, ww, hh, col, di, pre); const sz = size(out); LADDER.push(path.basename(out) + ' : ' + ww + 'x' + hh + ' ' + col + ' couleurs ' + ff + ' i/s -> ' + (sz / 1e6).toFixed(2) + ' Mo'); if (sz < limit) return { w: ww, h: hh, colors: col, fps: ff, bytes: sz }; }
  throw new Error('GIF trop lourd : ' + out);
}
const LADDER = [], BAD = [];
async function clips(b) {
  const OC = path.join(OUT, 'ch2', 'clips'); mk(OC);
  const specs = [
    { name: 'clip-blocage', ph: 2, start: "q.mode==='play'&&q.phase===1&&q.cn===0&&q.rt!=null&&q.rt>1.2&&q.rt<1.35", secs: 7 },
    { name: 'clip-pas-de-cote', ph: 1, start: "q.mode==='play'&&q.phase===2&&q.gt>5&&q.rt!=null&&q.rt>1.2&&q.rt<1.3", secs: 7 },
    { name: 'clip-riposte', ph: 3, start: "q.mode==='play'&&q.phase===3&&q.form===1&&q.gt>=14.2", secs: 7 },
  ];
  for (const sp of specs) {
    const r = await sequence(b, Object.assign({ step: 2 }, sp));       // 30 images/s
    sh('ffmpeg', [...FF, '-framerate', '30', '-i', path.join(r.dir, '%04d.png'), '-vf', 'crop=1920:1080:0:0', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-an', '-movflags', '+faststart', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:v', '+bitexact', path.join(OC, sp.name + '.mp4')]);
    // GIF : une image sur deux (15 i/s), 640 x 360
    const gdir = r.dir + '-g'; fs.rmSync(gdir, { recursive: true, force: true }); mk(gdir);
    for (let i = 0, k = 0; i < r.n; i += 2, k++) fs.copyFileSync(path.join(r.dir, String(i).padStart(4, '0') + '.png'), path.join(gdir, String(k).padStart(4, '0') + '.png'));
    gifUnder(gdir, path.join(OC, sp.name + '.gif'), 15, 640, 360, 2.9e6, 'crop=1920:1080:0:0,');
  }
}
const LOOP = `
import sys,glob,os
from PIL import Image
import numpy as np
d,out,X=sys.argv[1],sys.argv[2],int(sys.argv[3])
N=int(sys.argv[4])
fs=sorted(glob.glob(d+'/*.png'))[:N];F=[np.asarray(Image.open(f).convert('RGB'),dtype=np.float32) for f in fs]
L=len(F)-X
os.makedirs(out,exist_ok=True)
for i in range(L):
    a=F[i]
    if i<X:
        k=i/X;a=F[L+i]*(1-k)+F[i]*k   # fondu enchaine : la fin se fond dans le debut, la boucle est continue
    Image.fromarray(np.clip(a+.5,0,255).astype('uint8')).save('%s/%04d.png'%(out,i))
print(L)
`;
async function cover(b) {
  const srcDir = path.join(TMP, 'cover-src');
  let dir = srcDir;
  if (!(process.env.PROMO_REUSE && fs.existsSync(srcDir))) dir = (await sequence(b, { name: 'cover-src', ph: 2, start: "q.mode==='play'&&q.phase===1&&q.cn>=1&&q.rt!=null&&q.rt>1.2&&q.rt<1.35", secs: 6, step: 3, clip: { x: 140, y: 0, w: 680, h: 540 } })).dir;
  const X = 10, ldir = path.join(TMP, 'cover-loop'); const OC = path.join(OUT, 'social'); mk(OC); const out = path.join(OC, 'cover.gif');
  // 20 i/s, fondu enchaine de 0,5 s ; la duree (5,5 puis 5, 4,5, 4 s) diminue avant la palette, la taille 630 x 500 et la cadence restent
  for (const n of [120, 110, 100, 90]) for (const col of [96, 64, 48]) {
    fs.rmSync(ldir, { recursive: true, force: true }); py(LOOP, [dir, ldir, String(X), String(n)]);
    gifFrom(ldir, out, 20, 630, 500, col, 'bayer:bayer_scale=5'); const sz = size(out); LADDER.push('cover.gif : 630x500 ' + col + ' couleurs 20 i/s ' + ((n - X) / 20) + ' s -> ' + (sz / 1e6).toFixed(2) + ' Mo');
    if (sz < 2.9e6) { COVER.res = { n: n - X, colors: col, bytes: sz }; return COVER.res; }
  }
  throw new Error('cover.gif trop lourd');
}
const COVER = {};


/* ---------------- reseaux : recadrages des captures (aucun texte ajoute) ---------------- */
function social() {
  const S = path.join(OUT, 'social'); mk(S); const E = f => path.join(OUT, 'ch2', 'en', f);
  crop(E('p2-cale-blocage.png'), path.join(S, 'og-1200x630.png'), 0, 36, 1920, 1008, 1200, 630);
  crop(E('p3-phare-forme1.png'), path.join(S, 'post-1600x900.png'), 0, 0, 1920, 1080, 1600, 900);
  crop(E('p1-reflets.png'), path.join(S, 'post-1080x1080.png'), 400, 0, 1080, 1080, 1080, 1080);
  crop(path.join(TMP, 'intro-phare-raw.png'), path.join(S, 'banner.png'), 0, 140, 1920, 640, 1920, 640);   // 3:1 ; la source fait 1920 px de large
  crop(E('menu.png'), path.join(S, 'cover.png'), 280, 0, 1360, 1080, 630, 500);                      // titre du menu, meme recadrage 680 x 540 que le GIF
}

module.exports = { social, clips, cover, ROOT, OUT, TMP, SEED, launch, open2, open1, frame, until, snap, shotStage, shotPage, settle, mk, pagePrelude, pageApi2, stage2, stage1, hub, LOG, log, clean, crop, py };

if (require.main === module) (async () => {
  const what = process.argv[2] || 'all'; const b = await launch();
  try {
    if (what === 'all' || what === 'shots') {
      cp.spawnSync('python3', [path.join(ROOT, 'build/build_test.py')], { stdio: 'inherit' });
      fs.rmSync(TMP, { recursive: true, force: true }); mk(TMP);
      for (const lang of ['fr', 'en']) { await stage2(b, lang); await hub(b, lang); await stage1(b, lang); }
      fs.writeFileSync(path.join(TMP, 'log.json'), JSON.stringify(LOG, null, 1)); LOG.length = 0;
    }
    if (what === 'all' || what === 'clips') { mk(TMP); await clips(b); await cover(b); fs.writeFileSync(path.join(TMP, 'clips.json'), JSON.stringify({ LOG: LOG, LADDER, BAD, COVER: COVER.res }, null, 1)); }
    if (what === 'all' || what === 'social') social();
  } finally { await b.close(); }
  if (what === 'all' || what === 'check') { /* controle, planche et rapport : build/promo-check.py */ const r = cp.spawnSync('python3', ['-I', path.join(ROOT, 'build/promo-check.py')], { stdio: 'inherit' }); process.exitCode = r.status; }
})().catch(e => { console.error(e); process.exit(1); });
