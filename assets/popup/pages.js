/* 立體書第二頁之後的內容（第一頁「小店」寫在 立體書.html 裡）。
   每一頁：title 標題、text 書下方那行字（取自 內容/文案/品牌故事.txt）、
           wall 後頁的畫、floor 前頁的畫、cards 會立起來的紙卡。
   座標：書頁 1175×762。wall 的 y=762 是書脊；floor 的 y=0 是書脊。
   紙卡：x 左邊位置、d 離書脊多遠、w 寬、lift 離地多高。
     img  現成的線稿圖
     art  要從實體照片轉成線稿的圖；檔案放 內容/立體書/<頁>/<名稱>.png，
          執行 python3 工具/立體書素材.py 之後自動換上，還沒有檔案時顯示虛線框
     svg  直接畫的小東西
   實拍照（工作室、市集）不轉線稿：放 內容/立體書/<頁>/照片-<名稱>.jpg，工具會轉成暖色單色調，貼在牆上。
   目前有位置的：03-工作室/照片-工作室、05-市集/照片-市集（沒有檔案時牆面照原本的畫）。 */
(function(){
"use strict";
let uid = 0;
const cut = (shapes, extra = '') => { const id = 'pg' + (++uid); return `<defs><g id="${id}">${shapes}</g></defs><use href="#${id}" class="pe"/><use href="#${id}" class="pi"/>${extra}`; };
const tuft = (x, y, k = 1) => `<path d="M${x - 4} ${y}c${-4 * k} ${-30 * k} ${-12 * k} ${-52 * k} ${-26 * k} ${-66 * k}M${x} ${y}c0 ${-36 * k} ${2 * k} ${-62 * k} ${6 * k} ${-84 * k}M${x + 4} ${y}c${6 * k} ${-28 * k} ${16 * k} ${-46 * k} ${30 * k} ${-56 * k}"/>`;
const sign = (txt) => ({ t:'svg', vb:'0 0 260 96', w:250, h:92, body: cut('<path d="M40 82v12M220 82v12" fill="none"/><rect x="8" y="8" width="244" height="74" rx="10"/>', `<text class="tx" x="130" y="54" text-anchor="middle">${txt}</text>`) });
const title = (t) => `<g class="wall-ttl"><text class="ttl" x="64" y="98">${t}</text><path class="ink thin" d="M66 122h74"/></g>`;
/* 實拍照：貼在牆上的一張相片（白邊＋紙膠帶）。檔案放 內容/立體書/<頁>/照片-<名稱>.jpg，沒有檔案就回傳空字串，牆面照原本的畫 */
const ART = window.POPUP_ART || {};
const photo = (key, x, y, w, h, r) => { const a = ART[key]; if (!a) return ''; const m = 14;
  return `<g class="wall-photo" transform="rotate(${r} ${x + w / 2} ${y + h / 2})"><rect class="frame" x="${x}" y="${y}" width="${w}" height="${h + 26}" rx="3"/>
    <image href="assets/popup/art/${key}.${a.ext || 'png'}" x="${x + m}" y="${y + m}" width="${w - m * 2}" height="${h - m * 2}" preserveAspectRatio="xMidYMid slice"/>
    <rect class="dk" x="${x + w / 2 - 34}" y="${y - 11}" width="68" height="22" rx="3" opacity=".8" transform="rotate(-3 ${x + w / 2} ${y})"/></g>`; };
const sheet = (x, y, r, href, w = 170, h = 210) => `<g transform="rotate(${r} ${x + w / 2} ${y + h / 2})"><rect class="ink thin" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/><rect class="dk" x="${x + w / 2 - 22}" y="${y - 9}" width="44" height="18" rx="3" opacity=".85"/><image href="${href}" x="${x + 22}" y="${y + 30}" width="${w - 44}" height="${h - 60}" preserveAspectRatio="xMidYMid meet"/></g>`;
const table = (w, scallops) => { let s = ''; const n = scallops, sw = (w - 40) / n; for (let i = 0; i < n; i++) s += `q${sw / 2} 30 ${sw} 0`; return cut(`<path d="M52 60v120M${w - 52} 60v120" fill="none"/><path d="M20 62${s}V26H20Z"/><rect x="8" y="8" width="${w - 16}" height="22" rx="6"/>`); };

/* 社群影片最後停在封面時，下面那行字。之後可以換成 IG 帳號或「哪裡買」 */
window.POPUP_END = '兒子負責畫，媽媽負責捏陶、上色和排版。';

window.POPUP_PAGES = [
/* ───────── 第二頁：從一隻四隻腳的孔雀開始 ───────── */
{ id:'02-孔雀', title:'從一隻四隻腳的孔雀開始', text:'大兒子五歲那年，畫了一隻有四隻腳的孔雀。',
  wall:`${title('從一隻四隻腳的孔雀開始')}
    ${sheet(96, 190, -4, 'assets/line/zebra.png')}${sheet(312, 214, 3, 'assets/line/giraffe.png')}${sheet(528, 184, -2, 'assets/line/elephant.png')}
    <g class="ink"><rect x="800" y="170" width="290" height="270" rx="8"/><path d="M945 170v270M800 305h290" class="ink thin"/>
      <path d="M786 150h318M800 170c10 110-10 200-34 290M1090 170c-10 110 10 200 34 290"/></g>
    <path class="ink fat" d="M-6 716c200-4 400 4 600 0s400-4 587 2"/>`,
  floor:`<g class="ink"><path d="M-6 190c300 5 600-5 1187 0M-6 380c400-5 800 5 1187 0M-6 570c300 5 700-4 1187 1"/>
      <path class="ink thin" d="M260 6v182M700 6v182M980 192v186M120 192v186M520 384v184M860 384v184M300 574v186M740 574v186"/></g>
    <g class="ink thin"><ellipse cx="560" cy="330" rx="330" ry="150"/><ellipse cx="560" cy="330" rx="296" ry="126" stroke-dasharray="14 16"/></g>
    <g class="chalk" style="stroke-width:12"><path d="M168 470l52-18M236 520l44 28M930 520l56 6M1010 470l-38-34"/></g>
    <g class="ink thin"><rect x="330" y="560" width="150" height="150" rx="4" transform="rotate(-12 405 635)"/><path d="M366 610c20-30 40 30 60 0s20 40 40 10M372 660c30 10 50-20 80 0"/>
      <rect x="800" y="590" width="140" height="130" rx="4" transform="rotate(9 870 655)"/><path d="M836 640a26 30 0 1 0 .1 0M862 700l-10-26M880 698l6-28"/></g>`,
  cards:[
    { t:'img', src:'assets/line/peacock-first.png', label:'長子畫的四隻腳孔雀', x:300, d:150, w:250, hop:1 },
    { t:'img', src:'assets/line/peacock.png', label:'次子畫的孔雀', x:590, d:230, w:220, hop:1 },
    { t:'svg', vb:'0 0 420 150', x:40, d:120, w:330, h:118, lift:210,
      body: cut('<path d="M24 12h372a14 14 0 0 1 14 14v62a14 14 0 0 1-14 14H150l-34 38 4-38H24a14 14 0 0 1-14-14V26a14 14 0 0 1 14-14Z"/>', '<text class="tx" x="210" y="66" text-anchor="middle" style="font-size:25px">為什麼媽媽不做我的畫？</text>') },
    { t:'art', key:'02-孔雀/三色孔雀', label:'三色孔雀陶偶', x:830, d:300, w:290, h:290 },
    { t:'svg', vb:'0 0 170 120', x:70, d:360, w:160, h:113,
      body: cut('<rect x="10" y="84" width="150" height="26" rx="4"/><rect x="16" y="62" width="140" height="24" rx="4"/><path d="M30 14h112l10 50H22Z"/>', '<path class="chalk" style="stroke-width:3.5" d="M52 30c12-10 22 14 36 2s18 10 30 0M56 48c16 6 34-8 56 0"/>') },
  ] },

/* ───────── 第三頁：媽媽是陶藝家 ───────── */
{ id:'03-工作室', title:'媽媽是陶藝家顏亦慈', text:'兒子畫圖；媽媽捏陶、上色、決定圖要放在器物的哪裡。',
  wall:`${title('媽媽是陶藝家顏亦慈')}
    <g class="ink"><path d="M70 372h590M70 560h590"/><path class="ink thin" d="M110 372v34l34-34M620 372v34l-34-34M110 560v34l34-34M620 560v34l-34-34"/>
      <path d="M118 368c-8-40 4-70 34-70s42 30 34 70ZM138 298v-26h28v26"/>
      <path d="M250 368c-36 0-40-58 0-58h70c40 0 36 58 0 58Z"/><path d="M392 368v-76h70v76ZM462 310c36-4 36 44 0 40"/>
      <path d="M532 368c-18-30-18-64 0-92h54c18 28 18 62 0 92Z"/>
      <path d="M112 556l-8-64h96l-8 64ZM270 556c-30-20-34-66-6-88 10-22 8-42 0-58h50c-8 16-10 36 0 58 28 22 24 68-6 88Z"/>
      <path d="M392 556a60 22 0 0 0 120 0 60 22 0 0 0-120 0M560 556v-70h64v70ZM560 506h64"/></g>
    ${photo('03-工作室/照片-工作室', 752, 150, 360, 270, 2.5) || `<g class="ink thin"><rect x="760" y="170" width="340" height="230" rx="8"/><path d="M820 190v70a14 14 0 0 0 28 0v-70M900 190v96M888 286h24l-12 34ZM970 190v60l-14 50h28l-14-50M1040 190v80a12 20 0 0 0 0 40 12 20 0 0 0 0-40"/></g>`}
    <path class="ink fat" d="M-6 716c200-4 400 4 600 0s400-4 587 2"/>`,
  floor:`<g class="ink"><path d="M-6 190c300 4 600-4 1187 0M-6 380c400-4 800 4 1187 0M-6 570c300 4 700-4 1187 1"/>
      <path class="ink thin" d="M196 6c-8 250-20 500-40 754M392 6c-4 250-10 500-20 754M588 6v754M784 6c4 250 10 500 20 754M980 6c8 250 20 500 40 754"/></g>
    <g class="dk"><path d="M250 470c20-14 44 0 40 18s-36 22-48 8-6-18 8-26ZM300 520a9 9 0 1 0 .1 0M840 610c24-10 40 8 30 24s-40 12-44-4 4-16 14-20ZM800 650a7 7 0 1 0 .1 0M905 596a6 6 0 1 0 .1 0"/></g>
    <g class="ink thin"><ellipse cx="520" cy="650" rx="74" ry="62"/><ellipse cx="520" cy="650" rx="54" ry="44"/></g>`,
  cards:[
    { t:'art', key:'03-工作室/媽媽與兒子', label:'媽媽與兒子', x:380, d:120, w:360, h:240 },
    { t:'svg', vb:'0 0 210 180', x:96, d:240, w:200, h:171,
      body: cut('<path d="M40 104v64M170 104v64" fill="none"/><rect x="14" y="88" width="182" height="22" rx="6"/><ellipse cx="105" cy="84" rx="62" ry="10"/><path d="M72 80c-10-34 6-66 33-66s43 32 33 66Z"/>', '<path class="chalk" style="stroke-width:3" d="M80 40c16 6 34 6 50 0M76 60c18 6 40 6 58 0"/>') },
    { t:'svg', vb:'0 0 240 340', x:890, d:70, w:226, h:320, glow:'<rect x="74" y="150" width="92" height="64" rx="8"/>',
      body: cut('<path d="M96 60V14h48v46" /><rect x="14" y="60" width="212" height="270" rx="14"/>', '<rect class="pi" x="46" y="112" width="148" height="150" rx="10"/><path class="chalk" d="M46 290h148M210 150v60"/>') },
    { t:'art', key:'03-工作室/畫稿與陶作', label:'畫稿與陶作', x:600, d:440, w:330, h:248 },
    { t:'img', src:'assets/line/monkey.png', label:'次子畫的台灣獼猴', x:330, d:420, w:140, hop:1 },
    Object.assign(sign('兒子畫圖・媽媽捏陶'), { x:60, d:520 }),
  ] },

/* ───────── 第四頁：龍蝦，是一句謝謝 ───────── */
{ id:'04-龍蝦', title:'龍蝦，是一句謝謝', text:'「蝦」的台語聽起來像「謝」，有感謝和富足的意思。',
  wall:`${title('龍蝦，是一句謝謝')}
    <g class="ink"><rect x="90" y="190" width="270" height="290" rx="8"/><path class="ink thin" d="M225 190v290M90 335h270"/><path d="M76 500h298"/></g>
    <g class="ink"><path class="ink thin" d="M588 0v150"/><path d="M506 250c0-60 36-100 82-100s82 40 82 100Z"/></g>
    <text class="big" x="800" y="350">蝦</text><path class="ink" d="M905 320h64M950 300l22 20-22 20"/><text class="big" x="990" y="350">謝</text>
    <text class="tx" x="905" y="410" text-anchor="middle" style="font-size:22px">台語聽起來一樣</text>
    <path class="ink fat" d="M-6 716c200-4 400 4 600 0s400-4 587 2"/>`,
  glow:'radial-gradient(ellipse 34% 52% at 50% 46%,#b98a3c,#5d431a 55%,#000 100%)',
  bulb:'<circle cx="588" cy="262" r="14"/>',
  floor:`<g class="ink"><path d="M-6 150c300 4 600-4 1187 0"/><rect x="170" y="200" width="840" height="400" rx="10"/></g>
    <g class="ink thin"><path d="M170 300h840M170 400h840M170 500h840M290 200v400M410 200v400M530 200v400M650 200v400M770 200v400M890 200v400"/></g>
    <g class="dk"><path d="M170 200h120v100H170ZM410 200h120v100H410ZM650 200h120v100H650ZM890 200h120v100H890ZM290 300h120v100H290ZM530 300h120v100H530ZM770 300h120v100H770ZM170 400h120v100H170ZM410 400h120v100H410ZM650 400h120v100H650ZM890 400h120v100H890ZM290 500h120v100H290ZM530 500h120v100H530ZM770 500h120v100H770Z" opacity=".12"/></g>
    <g class="ink">${tuft(80, 720)}${tuft(1090, 700)}</g>`,
  cards:[
    { t:'img', src:'assets/line/lobster.png', label:'品牌的龍蝦', x:940, d:100, w:180, hop:1 },
    { t:'svg', vb:'0 0 720 190', x:230, d:250, w:700, h:185, body: table(720, 8) },
    { t:'art', key:'04-龍蝦/龍蝦盤與畫稿', label:'龍蝦盤與畫稿', x:330, d:242, w:330, h:248, lift:178 },
    { t:'svg', vb:'0 0 150 110', x:730, d:242, w:140, h:103, lift:178,
      body: cut('<path d="M14 62a61 20 0 0 0 122 0 61 20 0 0 0-122 0Z"/><path d="M26 66c8 26 30 34 49 34s41-8 49-34"/>', '<path class="chalk" style="stroke-width:3.5" d="M56 44c-8-10 8-14 0-26M76 44c-8-10 8-14 0-26M96 44c-8-10 8-14 0-26"/>') },
    { t:'svg', vb:'0 0 140 220', x:150, d:400, w:130, h:204, body: cut('<path d="M24 120v90M116 120v90M24 20v100" fill="none"/><path d="M24 20h92v62H24Z"/><rect x="14" y="110" width="112" height="20" rx="6"/>') },
    { t:'svg', vb:'0 0 140 220', x:900, d:400, w:130, h:204, body: cut('<path d="M24 120v90M116 120v90M116 20v100" fill="none"/><path d="M24 20h92v62H24Z"/><rect x="14" y="110" width="112" height="20" rx="6"/>') },
    Object.assign(sign('我家的咖哩盤'), { x:470, d:560, w:210, h:78 }),
  ] },

/* ───────── 第五頁：帶著作品去擺攤 ───────── */
{ id:'05-市集', title:'帶著作品去擺攤', text:'2019 年 7 月第一次擺攤，五歲的兒子會自己跟客人介紹哪一張圖是他畫的。',
  wall:`${title('帶著作品去擺攤')}
    ${ART['05-市集/照片-市集']
      ? `<g class="ink thin"><rect x="56" y="200" width="640" height="270" rx="8"/><circle cx="82" cy="226" r="6"/><circle cx="670" cy="226" r="6"/><circle cx="82" cy="444" r="6"/><circle cx="670" cy="444" r="6"/></g>
         <image href="assets/popup/banner.png" x="74" y="212" width="604" height="246" preserveAspectRatio="xMidYMid meet"/>${photo('05-市集/照片-市集', 744, 176, 372, 280, -2.5)}`
      : `<g class="ink thin"><rect x="120" y="170" width="935" height="372" rx="8"/><circle cx="150" cy="198" r="7"/><circle cx="1025" cy="198" r="7"/><circle cx="150" cy="514" r="7"/><circle cx="1025" cy="514" r="7"/></g>
         <image href="assets/popup/banner.png" x="140" y="184" width="895" height="344" preserveAspectRatio="xMidYMid meet"/>`}
    <path class="ink fat" d="M-6 716c200-4 400 4 600 0s400-4 587 2"/>`,
  floor:`<g class="ink">${tuft(90, 150)}${tuft(1080, 170)}${tuft(330, 420)}${tuft(1010, 690, 1.2)}${tuft(150, 690, 1.1)}${tuft(700, 330)}</g>
    <g class="ink thin"><ellipse cx="560" cy="560" rx="70" ry="44"/><ellipse cx="640" cy="670" rx="80" ry="48"/><ellipse cx="470" cy="700" rx="56" ry="36"/><ellipse cx="820" cy="610" rx="50" ry="32"/></g>`,
  cards:[
    { t:'svg', vb:'0 0 800 190', x:190, d:210, w:790, h:188, body: table(800, 9) },
    { t:'art', key:'05-市集/蒸籠虎爺', label:'蒸籠裡的虎爺', x:230, d:202, w:240, h:240, lift:180 },
    { t:'art', key:'05-市集/三色虎爺', label:'碗裡的三色虎爺', x:500, d:202, w:180, h:180, lift:180 },
    { t:'art', key:'05-市集/陶偶合照', label:'陶偶合照', x:700, d:202, w:260, h:147, lift:180 },
    { t:'art', key:'05-市集/斑馬陶偶', label:'斑馬陶偶', x:50, d:400, w:230, h:172 },
    { t:'art', key:'05-市集/鳥盤', label:'鳥盤', x:930, d:400, w:190, h:190 },
    { t:'img', src:'assets/line/giraffe.png', label:'長頸鹿', x:1080, d:120, w:62, hop:1 },
    { t:'img', src:'assets/line/turtle.png', label:'烏龜', x:330, d:520, w:170, hop:1 },
    Object.assign(sign('謝謝光臨'), { x:640, d:480, w:190, h:70 }),
  ] },
];
})();
