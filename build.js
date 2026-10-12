// node build.js  → generates index.html and chuong-N.html from content/NN.html fragments
const fs = require('fs');
const P1 = 'Phần 1 · JavaScript', P2 = 'Phần 2 · Native', P3 = 'Phần 3 · Bundling';
const CH = [
 [1,'Mở đầu','Vì sao hiệu năng quan trọng?','Hiệu năng cảm nhận, TTI và FPS.',10],
 [2,P1,'JavaScript & React: profile và đo FPS','Mô hình luồng, re-render, DevTools, Perf Monitor, Flashlight.',25],
 [3,P1,'Săn memory leak trong JS','Garbage collector, 3 kiểu leak phổ biến, Allocation instrumentation.',15],
 [4,P1,'Uncontrolled Components','Vì sao TextInput controlled có thể nháy/lệch và cách bỏ prop value.',10],
 [5,P1,'Component chuyên dụng bậc cao','ScrollView → FlatList → FlashList, windowing và recycling.',15],
 [6,P1,'Atomic State Management','Giảm re-render bằng state nguyên tử (Jotai, Zustand…).',12],
 [7,P1,'Concurrent React','useTransition, useDeferredValue và ưu tiên cập nhật.',15],
 [8,P1,'React Compiler','Tự động memoize và cách bật trong app RN.',12],
 [9,P1,'Animation mượt không rớt khung','Reanimated, UI thread, worklet.',15],
 [10,P2,'Khác biệt giữa các nền tảng','iOS và Android: tại sao hiệu năng khác nhau.',15],
 [11,P2,'Profile phần native','Xcode Instruments và Android Studio Profiler.',15],
 [12,P2,'Đo TTI','Cách đo thời gian khởi động.',15],
 [13,P2,'Quản lý bộ nhớ native','Heap, stack, ARC và GC.',15],
 [14,P2,'Mô hình luồng TurboModules & Fabric','Luồng nào chạy gì trong New Architecture.',15],
 [15,P2,'View Flattening','Giảm độ sâu cây view.',8],
 [16,P2,'Dùng SDK native thay vì web','Vì sao nên bỏ giải pháp web-based.',8],
 [17,P2,'Làm native module nhanh hơn','Tối ưu code cầu nối JS ⇄ native.',12],
 [18,P2,'Săn memory leak native','Instruments và Android Studio.',15],
 [19,P3,'Phân tích kích thước JS bundle','Source map explorer, Expo Atlas…',10],
 [20,P3,'Phân tích kích thước app bundle','APK/IPA gồm những gì.',10],
 [21,P3,'Kích thước thật của thư viện bên thứ ba','Đo trước khi cài.',5],
 [22,P3,'Tránh barrel exports','Vì sao index.ts re-export làm phình bundle.',8],
 [23,P3,'Thử Tree Shaking','Metro & tree shaking thực nghiệm.',10],
 [24,P3,'Tải code từ xa khi cần','Re.Pack, Module Federation, code splitting.',10],
 [25,P3,'Thu nhỏ code với R8 (Android)','Shrink, obfuscate, optimize.',8],
 [26,P3,'Dùng thư mục native assets','Đưa ảnh/font ra khỏi JS bundle.',8],
 [27,P3,'Tắt nén JS bundle','Đổi kích thước để lấy tốc độ khởi động.',6],
 [28,'Phụ lục','Thư viện và công cụ','Bảng tra cứu mọi công cụ trong sách và quy trình tối ưu tổng hợp.',5],
].map(([n,part,title,desc,min])=>({n,part,title,desc,min,file:`chuong-${n}.html`,src:`content/${String(n).padStart(2,'0')}.html`}));

// one-time migration of the hand-written chapters 1 & 2 into fragments
for (const n of [1,2]) {
  const dst = `content/0${n}.html`;
  if (fs.existsSync(dst)) continue;
  const h = fs.readFileSync(`chuong-${n}.html`,'utf8');
  let a = h.match(/<article>([\s\S]*)<\/article>/)[1].replace(/<div class="chnav">[\s\S]*$/,'');
  fs.writeFileSync(dst, a.trim()+'\n');
}

function f2(){return fs.readdirSync("js").filter(x=>/^demos.*.js$/.test(x)).sort()}
const head = (title,extra='') => `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><link rel="stylesheet" href="css/style.css"></head><body>
<div id="progress"></div>`;
const foot = `<script src="js/app.js"></script>${f2().map(x=>`<script src="js/${x}"></script>`).join("")}</body></html>`;
const exists = c => fs.existsSync(c.src);
const top = cur => `<header class="topbar"><div class="in">
  <a class="brand" href="index.html">RN <span>Optimization</span></a>
  <select id="jump" aria-label="Chọn chương"><option value="index.html">☰ Mục lục</option>${CH.filter(exists).map(c=>`<option value="${c.file}"${cur&&cur.n===c.n?' selected':''}>${c.n}. ${c.title.replace(/&/g,'&amp;')}</option>`).join('')}</select>
  <button class="icon" id="theme" title="Đổi giao diện">◐</button></div></header>`;

const avail = CH.filter(exists);
for (const c of avail) {
  let body = fs.readFileSync(c.src,'utf8');
  const toc = [...body.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(m=>`<a href="#${m[1]}">${m[2].replace(/<[^>]+>/g,'').replace(/^\d+\.\s*/,'')}</a>`).join('');
  const i = avail.indexOf(c), p = avail[i-1], nx = avail[i+1];
  const nav = `<div class="chnav">${p?`<a href="${p.file}"><small>← Chương ${p.n}</small>${p.title}</a>`:'<a href="index.html"><small>←</small>Mục lục</a>'}${nx?`<a class="next" href="${nx.file}"><small>Chương ${nx.n} →</small>${nx.title}</a>`:'<a class="next" href="index.html"><small>Hết</small>Về mục lục</a>'}</div>`;
  fs.writeFileSync(c.file, `${head(`Chương ${c.n} – ${c.title}`)}${top(c)}<div class="layout"><aside class="toc"><h4>Trong chương</h4>${toc}</aside><article>${body}${nav}</article></div>${foot}`);
}
let idx = `${head('Học React Native Optimization 2025')}${top(null)}
<section class="hero"><span class="kicker">Học qua tương tác</span><h1>React Native Optimization<br>The Ultimate Guide 2025</h1>
<p class="lead">Bản học tiếng Việt cuốn sách của Callstack: mỗi khái niệm có sơ đồ hoặc demo bấm thử được, ví dụ code và bài kiểm tra nhanh.</p></section><main class="parts">`;
let last='';
for (const c of CH) {
  if (c.part!==last) { idx+=`<div class="ptitle">${c.part}</div>`; last=c.part; }
  idx += exists(c)
   ? `<a class="chcard" href="${c.file}"><span class="pill">Chương ${c.n} · ~${c.min} phút</span><h3>${c.title.replace(/&/g,'&amp;')}</h3><p>${c.desc}</p></a>`
   : `<a class="chcard soon" href="#"><span class="pill">Chương ${c.n} · sắp có</span><h3>${c.title.replace(/&/g,'&amp;')}</h3></a>`;
}
fs.writeFileSync('index.html', idx+`</main>${foot}`);
console.log('built', avail.length, 'chapters');
