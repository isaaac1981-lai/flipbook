/* 立體書（demo/立體書.html）：把紙卡擺好、翻書動畫、視角、時段光線。
   座標一律用場景 px（書頁 1175×762，書脊在前頁的 y=0）。 */
(function(){
"use strict";
const H = 762, SCENE_W = 1500;
const COT = 0.445;                                   // 俯角 66° 時，離書脊 d 的東西看起來會低 d×COT
const DEPTH = { r1:8, r2:16, r3:26, girl:34, counter:56, awning:78 };
const ROW   = { '上':'r1', '中':'r2', '下':'r3' };
const TIMES = ['day','night'], TIME_NAME = { day:'白天', night:'夜晚' };
const $ = s => document.querySelector(s);
const stage = $('#stage'), pop = $('#pop'), book = $('#book'), bp = $('#bp'), cast = $('#cast');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q = new URLSearchParams(location.search);       // ?pose=closed|half|open、?time=day|night、?page=2：定格檢查用
const cards = [];
const PAGES = window.POPUP_PAGES || [], ART = window.POPUP_ART || {}, N = 1 + PAGES.length;
const walls = { 1: $('.wall[data-page="1"]') }, floors = { 1: $('.floor[data-page="1"]') };
const wallHome = walls[1].parentNode, floorHome = floors[1].parentNode, turner = $('#turner');
let page = 1;

/* ── 擺紙卡 ── */
function register(el, layer, height, pg){
  const d = typeof layer === 'number' ? layer : DEPTH[layer];
  cards.push({ el, page: pg || 1, up: 0, down: 0, animal: !!el.querySelector('.work'),
    over: Math.min(8, Math.atan(d / height) * 57.3 * .8) });       // 最多能過頭幾度而不會戳到後頁
}
document.querySelectorAll('.pcard[data-layer]').forEach(el => {     // 女孩、櫃台、遮雨棚（位置寫在 HTML 的 data-*）
  const D = el.dataset, d = DEPTH[D.layer], w = +D.w, h = +D.h;
  const height = H - (+D.top) + (+D.raise || 0);
  el.style.cssText += `left:${D.left}px;width:${w}px;height:${height}px;top:${d - height}px`;
  const img = el.querySelector('.face img.piece'); img.style.width = w + 'px'; img.style.height = h + 'px';
  const rear = el.querySelector('.rear'); rear.src = img.getAttribute('src'); rear.style.cssText += `width:${w}px;height:${h}px`;
  register(el, D.layer, height);
});
document.querySelectorAll('.pcard.prop').forEach(el => {              // 前頁上的小東西：位置寫在 data-*，背面自動做一份剪影
  const D = el.dataset, d = +D.depth, w = +D.w, h = +D.h;
  el.style.cssText += `left:${D.left}px;width:${w}px;height:${h}px;top:${d - h}px`;
  const rear = el.querySelector('.face svg, .face img').cloneNode(true);
  rear.setAttribute('class', 'rear'); rear.removeAttribute('aria-label'); el.prepend(rear);
  rear.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  el.querySelectorAll('.work').forEach(b => b.addEventListener('click', () => { b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); }));
  register(el, d, h);
});
(function bulbs(){                                                  // 遮雨棚底下的一串小燈泡，掛在波浪的每個尖角上
  const xs = [113, 202.5, 290.5, 380, 470.5, 562.5, 654, 743.5, 830.5, 913, 997.5], y0 = 186, sag = 26;
  let d = '', b = '';
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], c = xs[i + 1], m = (a + c) / 2;
    d += `M${a} ${y0}Q${m} ${y0 + sag * 2} ${c} ${y0}`;
    b += `<rect x="${m - 3.5}" y="${y0 + sag - 3}" width="7" height="6" rx="1.5"/><circle cx="${m}" cy="${y0 + sag + 8.5}" r="6.5"/>`;
  }
  $('#wire').innerHTML = `<path class="ink thin" style="stroke-width:3" d="${d}"/>`;
  $('#bulbs').innerHTML = b;
})();

const hop = btn => btn.addEventListener('click', () => { btn.classList.remove('hop'); void btn.offsetWidth; btn.classList.add('hop'); });

/* ── 第二頁之後：照 pages.js 的資料把牆面、地面、紙卡做出來 ── */
function placeholder(c){                                            // 還沒有圖：虛線框＋名稱
  const h = c.h || c.w;
  return `<svg class="ph lit" viewBox="0 0 ${c.w} ${h}" role="img" aria-label="${c.label}（圖待補）"><rect x="6" y="6" width="${c.w - 12}" height="${h - 12}" rx="14"/>
    <text x="${c.w / 2}" y="${h / 2 - 4}">${c.label}</text><text class="sub" x="${c.w / 2}" y="${h / 2 + 24}">照片轉線稿後放這裡</text></svg>`;
}
PAGES.forEach((P, i) => {
  const n = i + 2;
  const wall = document.createElement('div'); wall.className = 'wall'; wall.dataset.page = n; wall.hidden = true;
  wall.innerHTML = `<svg class="lit" viewBox="0 0 1175 762" aria-hidden="true">${P.wall}</svg>`
    + (P.bulb ? `<svg class="lampglow" viewBox="0 0 1175 762" aria-hidden="true">${P.bulb}</svg>` : '')
    + `<div class="glow room"${P.glow ? ` style="background:${P.glow}"` : ''}></div>`;
  const floor = document.createElement('div'); floor.className = 'floor'; floor.dataset.page = n; floor.hidden = true;
  floor.innerHTML = `<svg class="lit" viewBox="0 0 1175 762" aria-hidden="true">${P.floor}</svg><div class="contact"></div><div class="spill room"></div>`;
  wallHome.appendChild(wall); floorHome.appendChild(floor); walls[n] = wall; floors[n] = floor;
  for (const c of P.cards) {
    const art = c.t === 'art' ? ART[c.key] : null, lift = c.lift || 0;
    let inner, h = c.h;
    if (c.t === 'img') inner = `<img class="lit" src="${c.src}" alt="">`;
    else if (c.t === 'art') { inner = art ? `<img class="lit" src="assets/popup/art/${c.key}.png" alt="${c.label}">` : placeholder(c); if (art) h = c.w * art.h / art.w; }
    else inner = `<svg class="lit" viewBox="${c.vb}" aria-hidden="true">${c.body}</svg>` + (c.glow ? `<svg class="lampglow" viewBox="${c.vb}" aria-hidden="true">${c.glow}</svg>` : '');
    const el = document.createElement('div');
    el.className = 'pcard flow'; el.style.cssText = `left:${c.x}px;width:${c.w}px;bottom:${H - c.d}px;visibility:hidden`;
    el.innerHTML = `<div class="face">${c.hop ? `<button type="button" class="work" aria-label="${c.label}">${inner}</button>` : inner}<span class="leg" style="height:${lift}px"></span></div>`;
    const rear = el.querySelector('.face img, .face svg').cloneNode(true);
    rear.setAttribute('class', 'rear'); rear.removeAttribute('aria-label'); rear.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
    if (h) rear.style.height = h + 'px';
    el.prepend(rear);
    el.querySelectorAll('.work').forEach(hop);
    book.appendChild(el);
    register(el, c.d, lift + (h || c.w), n);
  }
});

window.Popup = {
  /* 第一頁層架上的作品：有填「層架」的才上架，一隻一張紙卡 */
  build(WORKS){
    for (const [id, w] of Object.entries(WORKS)) {
      const layer = ROW[w.shelf]; if (!layer) continue;
      const d = DEPTH[layer], leg = H - (w.b - 40) + d * COT, src = `assets/line/${id}.png`;
      const el = document.createElement('div');
      el.className = 'pcard animal';
      el.style.cssText = `left:${w.x - 55}px;width:${w.w}px;bottom:${H - d}px`;
      el.innerHTML = `<img class="rear" src="${src}" alt="" style="width:100%">
        <div class="face"><button type="button" class="work" data-id="${id}" aria-label="${w.name}"><img class="lit" src="${src}" alt=""></button><span class="leg" style="height:${leg}px"></span></div>`;
      hop(el.querySelector('.work'));
      book.insertBefore(el, $('#card-girl'));
      register(el, layer, leg + 120);
    }
    start();
  }
};

/* ── 動畫：pose 連封面一起（翻開／闔起整本書），poseCards 只動這一頁的紙卡（翻頁用） ── */
const cl = t => Math.max(0, Math.min(1, t));
const eio = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const back = t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
function setCards(mode, u, pa){
  for (const c of cards) {
    if (c.page !== page) { c.el.style.visibility = 'hidden'; continue; }
    let a, s = 1;
    if (mode === 'open') {
      const e = back(cl((u - c.up) / .27));
      a = e <= 1 ? 90 * e : 90 + (e - 1) / .1 * c.over;
      if (c.animal) s = .62 + .38 * e;
    } else {
      const t = cl((u - c.down) / .4);
      a = 90 * (1 - t * t * t);
    }
    if (pa < 90) a = Math.min(a, pa);                              // 紙卡不會比後頁先立起來，不然會穿過去
    c.el.style.transform = `translateZ(.6px) rotateX(${a - 180}deg)`;
    c.el.style.visibility = a > .4 ? 'visible' : 'hidden';
    if (c.animal) c.el.querySelector('.work').style.scale = s === 1 ? '' : s;
  }
}
function pose(mode, u){
  // open：後頁在前 56.5%（約 1.3 秒）立起；28% 起每張紙卡各自在隨機的時間點彈起
  // close：紙卡隨機先後倒下，接著後頁闔上
  const pa = mode === 'open' ? 90 * eio(cl(u / .565)) : 90 * (1 - eio(cl((u - .32) / .68)));
  bp.style.transform = `translateZ(2px) rotateX(${pa - 180}deg)`;
  setCards(mode, u, pa);
  cast.style.opacity = Math.pow(cl(pa / 90), 1.6);
  cast.style.transform = `translateZ(-29px) skewX(-36deg) scaleY(${Math.max(.02, Math.sin(pa * Math.PI / 180))})`;
}
const poseCards = (mode, u) => setCards(mode, mode === 'open' ? .26 + .74 * u : .7 * u, 90);
let run = 0, isOpen = false;
function shuffle(){                                                 // 每次都重新抽：誰先彈、誰後彈
  const mine = cards.filter(c => c.page === page), n = mine.length, slots = mine.map((_, i) => i);
  for (let i = n - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [slots[i], slots[k]] = [slots[k], slots[i]]; }
  mine.forEach((c, i) => {
    c.up = .28 + (slots[i] + Math.random() * .8) / n * .44;         // 28%–72% 之間，一張一個時段，不會擠在同一刻
    c.down = Math.random() * .3;
  });
}
function play(mode, dur, fn){
  const id = ++run, f = fn || pose;
  if (mode === 'open') shuffle();
  return new Promise(done => {
    const t0 = performance.now();
    (function step(now){
      if (id !== run) return done(false);
      const u = cl((now - t0) / dur); f(mode, u);
      if (u < 1) requestAnimationFrame(step); else { if (f === pose) isOpen = mode === 'open'; done(true); }
    })(t0);
  });
}
const tween = (dur, fn) => new Promise(done => { const t0 = performance.now(); (function s(now){ const u = cl((now - t0) / dur); fn(u); u < 1 ? requestAnimationFrame(s) : done(); })(t0); });
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ── 翻頁 ── */
const CAP1 = $('#caption').innerHTML;
const FIRST = { title:'小孩畫畫，媽媽制器', text:'兒子負責畫，媽媽負責捏陶、上色和排版。' };
function setPage(n){
  page = n;
  for (let i = 1; i <= N; i++) { walls[i].hidden = i !== n; floors[i].hidden = i !== n; }
  $('#caption').innerHTML = n === 1 ? CAP1 : `<b>${PAGES[n - 2].title}</b>${PAGES[n - 2].text}`;
  $('#caption').classList.toggle('story', n > 1);
  const P = n === 1 ? FIRST : PAGES[n - 2];                         // 社群版型的大標題和內文
  $('#fm-no').textContent = `${String(n).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
  $('#fm-title').textContent = P.title; $('#fm-text').textContent = P.text;
  document.querySelectorAll('#pages button').forEach(b => b.setAttribute('aria-current', String(+b.dataset.p === n)));
  $('#page-prev').disabled = n <= 1; $('#page-next').disabled = n >= N;
}
async function turn(to){
  if (busy || to === page || to < 1 || to > N) return;
  if (RM || Q.get('pose')) { setPage(to); shuffle(); pose('open', 1); return; }
  busy = true;
  await play('close', 620, poseCards);                              // 1. 這一頁的紙卡倒下
  const lo = Math.min(page, to), hi = Math.max(page, to), fwd = to > page;
  // 2. 翻那一張：往後翻是地面掀起來變成下一頁的牆；往前翻是牆放下來變回上一頁的地面
  turner.querySelector('.tu').appendChild(floors[lo]); turner.querySelector('.td').appendChild(walls[hi]);
  for (let i = 1; i <= N; i++) { walls[i].hidden = i !== lo && i !== hi; floors[i].hidden = i !== lo && i !== hi; }
  turner.style.visibility = 'visible';
  await tween(950, u => { const a = 90 * (fwd ? eio(u) : 1 - eio(u)); turner.style.transform = `translate3d(0,1.5px,1px) rotateX(${a}deg)`; });
  floorHome.appendChild(floors[lo]); wallHome.appendChild(walls[hi]);
  turner.style.visibility = 'hidden';
  setPage(to);
  await play('open', 1750, poseCards);                              // 3. 新一頁的紙卡隨機彈起
  busy = false;
  if (queued) { const q = queued; queued = null; cycle(q); }
}
$('#pages').innerHTML = Array.from({ length: N }, (_, i) => `<button type="button" data-p="${i + 1}" aria-label="第 ${i + 1} 頁">${i + 1}</button>`).join('');
document.querySelectorAll('#pages button').forEach(b => b.addEventListener('click', () => turn(+b.dataset.p)));
$('#page-prev').addEventListener('click', () => turn(page - 1));
$('#page-next').addEventListener('click', () => turn(page + 1));
document.addEventListener('keydown', e => { if (e.key === 'ArrowRight') turn(page + 1); else if (e.key === 'ArrowLeft') turn(page - 1); });

/* ── 時段光線 ── */
let time = 'day', busy = false, queued = null;
function applyTime(t){
  time = t; stage.dataset.time = t;
  document.querySelectorAll('.times .dot').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
  $('#time-now').textContent = TIME_NAME[t];
}
async function cycle(next){                                         // 紙卡倒下 → 書闔起 → 換光線 → 再翻開
  if (busy) { if (next) queued = next; return; }
  if (RM || Q.get('pose')) { if (next) applyTime(next); return; }
  busy = true;
  if (isOpen) await play('close', 1100);
  if (next) { applyTime(next); await wait(320); } else await wait(160);
  await play('open', 2300);
  busy = false;
  if (queued && queued !== time) { const q = queued; queued = null; cycle(q); } else queued = null;
}
document.querySelectorAll('.times .dot').forEach(b => b.addEventListener('click', () => { if (b.dataset.t !== time) cycle(b.dataset.t); }));
$('#replay').addEventListener('click', () => cycle());

function tick(){                                                    // 右上角：HH:MM · 早安／午安／晚安
  const d = new Date(), h = d.getHours();
  $('#clock').textContent = `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} · ${h >= 5 && h < 11 ? '早安' : h >= 11 && h < 18 ? '午安' : '晚安'}`;
}
tick(); setInterval(tick, 15000);

/* ── 視角：閒置時輕輕搖，滑鼠移入就跟著指標轉 ── */
let rz = 0, tilt = 66, trz = 0, ttilt = 66, hover = false;
const view = () => { book.style.transform = `translateZ(-360px) rotateX(${tilt}deg) rotateZ(${rz}deg)`; };
function frame(now){
  if (!hover) { trz = 3 * Math.sin(now / 1900); ttilt = 66 + .8 * Math.sin(now / 2700); }
  rz += (trz - rz) * .07; tilt += (ttilt - tilt) * .07; view();
  requestAnimationFrame(frame);
}
let swipe = null;                                                   // 手機：左右滑翻頁，滑的時候書跟著手指轉一點
pop.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') swipe = { x: e.clientX, y: e.clientY, dx: 0, dy: 0 }; });
const endSwipe = e => {
  if (!swipe) return;
  const s = swipe; swipe = null; hover = false;
  if (e.type === 'pointerup' && Math.abs(s.dx) > 46 && Math.abs(s.dx) > Math.abs(s.dy) * 1.4) turn(page + (s.dx < 0 ? 1 : -1));
};
pop.addEventListener('pointerup', endSwipe); pop.addEventListener('pointercancel', endSwipe);
pop.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') {
    if (!swipe) return;
    swipe.dx = e.clientX - swipe.x; swipe.dy = e.clientY - swipe.y;
    if (Math.abs(swipe.dx) > 8) { hover = true; trz = Math.max(-9, Math.min(9, swipe.dx / pop.clientWidth * -26)); ttilt = 66; }
    return;
  }
  const r = pop.getBoundingClientRect(); hover = true;
  trz = (cl((e.clientX - r.left) / r.width) - .5) * -18;            // rotateZ ±9°
  ttilt = 71 - cl((e.clientY - r.top) / r.height) * 10;             // 俯角 61–71°
});
pop.addEventListener('pointerleave', () => { hover = false; });
const fit = () => { pop.style.setProperty('--k', pop.clientWidth / SCENE_W); };
new ResizeObserver(fit).observe(pop); fit();

const egg = $('#egg');
egg.addEventListener('click', () => { egg.classList.remove('found'); void egg.offsetWidth; egg.classList.add('found'); });
const girl = $('#girl');
girl.addEventListener('click', e => { e.stopPropagation(); girl.classList.remove('sway'); void girl.offsetWidth; girl.classList.add('sway'); });

/* ── 社群版型：?format=reel｜post｜square，&auto=1 自動從封面翻到最後一頁（錄影用），&hold=4 每頁停幾秒，&guide=1 安全區 ── */
const FORMATS = { reel:[1080, 1920], post:[1080, 1350], square:[1080, 1080] };
const fmt = FORMATS[Q.get('format')] ? Q.get('format') : null;
if (fmt) {
  const [fw, fh] = FORMATS[fmt];
  document.body.classList.add('fmt'); stage.dataset.format = fmt;
  stage.style.setProperty('--fw', fw + 'px'); stage.style.setProperty('--fh', fh + 'px');
  const scale = () => stage.style.setProperty('--fk', Math.min(innerWidth / fw, innerHeight / fh));
  addEventListener('resize', scale); scale();
  if (Q.get('guide')) {
    const g = $('#fm-guide'); g.hidden = false;
    g.innerHTML = fmt === 'reel'
      ? `<i style="left:0;right:0;top:0;height:220px">上方 220：帳號列、相機</i><i style="left:0;right:0;bottom:0;height:380px">下方 380：帳號、文案、音樂</i>
         <i style="right:0;width:130px;top:1000px;height:540px">按讚<br>留言<br>分享</i><i class="crop" style="left:0;right:0;top:285px;height:1350px">個人頁格狀預覽只看得到這一塊（4:5）</i>`
      : fmt === 'post' ? `<i class="crop" style="left:0;right:0;top:135px;height:1080px">舊版格狀預覽裁成 1:1 時看得到的範圍</i>` : '';
  }
}
async function autoplay(){
  const hold = Math.max(1, +Q.get('hold') || 4) * 1000;
  do {
    delete document.documentElement.dataset.done;
    $('#fm-no').textContent = ''; $('#fm-text').textContent = '翻開看看';          // 封面
    await wait(1000);
    setPage(1);
    busy = true; await play('open', 2300); busy = false;
    await wait(hold);
    for (let n = 2; n <= N; n++) { await turn(n); await wait(hold); }
    busy = true; await play('close', 1500); busy = false;           // 闔上，停在封面
    $('#fm-no').textContent = ''; $('#fm-title').textContent = FIRST.title; $('#fm-text').textContent = (window.POPUP_END || FIRST.text);
    await wait(1800);
    document.documentElement.dataset.done = '1';
    if (Q.get('loop')) { setPage(1); pose('open', 0); }
  } while (Q.get('loop'));
}

function start(){
  const h = new Date().getHours();
  applyTime(TIMES.includes(Q.get('time')) ? Q.get('time') : h >= 6 && h < 18 ? 'day' : 'night');
  setPage(Math.max(1, Math.min(N, +Q.get('page') || 1)));
  view();
  const fixed = Q.get('pose'); shuffle();
  if (RM || fixed) {                                                // 不播動畫：直接擺好
    pose('open', fixed === 'closed' ? 0 : fixed === 'half' ? .42 : 1); isOpen = fixed !== 'closed';
    return;
  }
  pose('open', 0);
  requestAnimationFrame(frame);
  if (Q.get('auto')) { autoplay(); return; }
  setTimeout(() => { busy = true; play('open', 2300).then(() => { busy = false; if (queued) { const q = queued; queued = null; cycle(q); } }); }, 350);
}
})();
