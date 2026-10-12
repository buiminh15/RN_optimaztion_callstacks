/* Ch23: tree shaking demo + benchmark */
(function () {
  const el = document.getElementById('ts');
  if (el) {
    const F = [['add', 'a + b'], ['subtract', 'a - b'], ['multiply', 'a * b'], ['divide', 'a / b']];
    const sel = new Set(['add']), c = el.querySelector('#ts-c');
    F.forEach(f => { const l = document.createElement('label'); l.style.cssText = 'cursor:pointer;margin-right:12px'; l.innerHTML = `<input type="checkbox" ${sel.has(f[0]) ? 'checked' : ''}> import { ${f[0]} }`; l.firstChild.onchange = e => { e.target.checked ? sel.add(f[0]) : sel.delete(f[0]); draw(); }; c.appendChild(l); });
    const line = (f, dead) => `<span style="${dead ? 'opacity:.4;text-decoration:line-through' : ''}">export const ${f[0]} = (a, b) =&gt; ${f[1]};</span>`;
    function draw() {
      el.querySelector('#ts-src').innerHTML = F.map(f => line(f, false)).join('\n');
      const kept = F.filter(f => sel.has(f[0]));
      el.querySelector('#ts-out').innerHTML = kept.length ? kept.map(f => `<span class="s">export const ${f[0]} = (a, b) =&gt; ${f[1]};</span>`).join('\n') + '\n<span class="c">// ' + (F.length - kept.length) + ' hàm không dùng đã bị loại</span>' : '<span class="c">// (cả module bị loại)</span>';
    }
    draw();
  }
  const b = document.getElementById('bm');
  if (b) {
    const D = [['Development', 38.49, 49.04], ['Production', 35.63, 38.48], ['Prod Minified', 15.54, 13.36], ['Prod (HBC)', 21.79, 19.35], ['Prod Minified (HBC)', 21.62, 19.05]];
    const mx = 50;
    b.querySelector('#bm-c').innerHTML = D.map(d => { const diff = ((d[2] / d[1] - 1) * 100).toFixed(1); return `<div style="margin:10px 0"><div style="font-size:14px"><b>${d[0]}</b> <span class="muted">(${diff > 0 ? '+' : ''}${diff}%)</span></div>
      <div class="bar" style="height:16px;margin:3px 0"><i style="width:${d[1] / mx * 100}%;background:var(--warn)"></i></div><span class="muted" style="font-size:12px">Metro ${d[1]} MB</span>
      <div class="bar" style="height:16px;margin:3px 0"><i style="width:${d[2] / mx * 100}%;background:var(--accent)"></i></div><span class="muted" style="font-size:12px">Re.Pack ${d[2]} MB</span></div>`; }).join('');
  }
})();

/* Ch24: chunk loading */
(function () {
  const el = document.getElementById('chunk'); if (!el) return;
  const v = el.querySelector('#ck-v');
  const base = () => v.innerHTML = '<div class="node skip"><b>main.bundle</b> — đã nằm trong app, đã nạp</div><div class="node" style="opacity:.55;border-style:dashed"><b>settings.chunk.bundle</b> — chưa tải (trên CDN)</div>';
  el.querySelector('#ck-open').onclick = () => {
    v.innerHTML = '<div class="node skip"><b>main.bundle</b> — đã nạp</div><div class="node flash"><b>settings.chunk.bundle</b> — <i>Suspense fallback: &lt;LoadingSpinner /&gt;</i> … đang tải từ https://my-cdn.com/assets/settings</div>';
    setTimeout(() => v.innerHTML = '<div class="node skip"><b>main.bundle</b> — đã nạp</div><div class="node skip"><b>settings.chunk.bundle</b> — đã tải &amp; nạp ✔ (lần sau dùng cache)</div>', 1200);
  };
  el.querySelector('#ck-reset').onclick = base; base();
})();

/* Ch25: R8 */
(function () {
  const el = document.getElementById('r8d'); if (!el) return;
  const m = el.querySelector('#r8-m'), s = el.querySelector('#r8-s');
  const draw = () => {
    let sz = 9.5; if (m.checked) sz = 6.3; if (m.checked && s.checked) sz = 5.9;
    el.querySelector('#r8-b').style.width = sz / 10 * 100 + '%'; el.querySelector('#r8-v').textContent = sz.toFixed(1) + ' MB';
    el.querySelector('#r8-d').textContent = sz < 9.5 ? '(−' + Math.round((1 - sz / 9.5) * 100) + '%)' : '';
    if (s.checked && !m.checked) s.checked = false, draw();
  };
  m.onchange = s.onchange = draw; draw();
})();

/* Ch26: density */
(function () {
  const el = document.getElementById('den'); if (!el) return;
  const D = [['mdpi', 1], ['xhdpi', 2], ['xxhdpi', 3]], b = el.querySelector('#den-b');
  const li = (name, on) => `<div class="node ${on ? 'skip' : ''}" style="${on ? '' : 'opacity:.5'}">${name}</div>`;
  D.forEach(d => { const x = document.createElement('button'); x.className = 'btn ghost'; x.textContent = `Thiết bị ${d[0]} (${d[1]}x)`; x.onclick = () => {
    b.querySelectorAll('button').forEach(y => y.classList.toggle('on', y === x));
    el.querySelector('#den-a').innerHTML = ['image.jpg', 'image@2x.jpg', 'image@3x.jpg'].map((n, i) => li(n, i + 1 === d[1]) ).join('') + '<div class="muted" style="font-size:13px">Cả 3 đều nằm trong app → 2 file lãng phí.</div>';
    el.querySelector('#den-n').innerHTML = li(`drawable-${d[0]}/image.jpg`, true) + '<div class="muted" style="font-size:13px">Chỉ file đúng mật độ được tải xuống.</div>'; }; b.appendChild(x); });
  b.children[2].click();
})();

/* Ch27: mmap */
(function () {
  const el = document.getElementById('mm'); if (!el) return;
  const c = el.querySelector('#mm-c');
  const draw = () => {
    const off = c.checked;
    el.querySelector('#mm-i').textContent = (off ? 82.0 : 75.9).toFixed(1) + ' MB'; el.querySelector('#mm-id').textContent = off ? '+6,1 MB (+8%)' : 'bundle đang bị nén';
    el.querySelector('#mm-t').textContent = (off ? 2.35 : 2.8).toFixed(2) + ' s'; el.querySelector('#mm-td').textContent = off ? '−450 ms (−16%)' : 'Hermes không mmap được bundle';
    el.querySelector('#mm-n').textContent = off ? 'Bundle không nén → Hermes dùng memory mapping, chỉ đọc phần bytecode cần.' : 'Bundle bị nén → bỏ qua mmap, phải giải nén/đọc cả file.';
  };
  c.onchange = draw; draw();
})();

/* Ch28: reference table */
(function () {
  const el = document.getElementById('ref-l'); if (!el) return;
  const R = [
    ['Animation & điều hướng', [['React Native Reanimated', 'Thư viện animation hiệu năng cao (worklet, UI thread)', 9], ['React Navigation', 'Điều hướng, hỗ trợ chuyển cảnh animation', '9, 16']]],
    ['State & React Compiler', [['React Compiler', 'Tự động memoize lúc build', 8], ['Jotai', 'Atomic state tối giản', 6], ['Zustand', 'Quản lý state nhỏ gọn hơn Redux', 6], ['Recoil', 'State của Meta, reactive mịn', 6]]],
    ['Danh sách & cuộn', [['FlashList', 'Thay thế FlatList hiệu năng cao của Shopify', 5], ['Legend List', 'Lựa chọn mới thay FlatList cho New Architecture', 5], ['RecyclerListView', 'Nền tảng của FlashList', 5]]],
    ['Profile & debug', [['React Native DevTools', 'Debug/profile có sẵn của RN', '2, 3'], ['Chrome DevTools', 'Profile bộ nhớ/hiệu năng trên trình duyệt', 3], ['Flashlight', 'Đo FPS/CPU/RAM trên Android', 2], ['Xcode Instruments', 'Profile CPU/bộ nhớ trên iOS', '11, 18'], ['Android Studio Profiler', 'CPU/bộ nhớ/mạng/pin trên Android', '11, 18'], ['Perfetto', 'Tracing hệ thống Android', 11], ['react-native-performance', 'Ghi marker để đo TTI', 12]]],
    ['Engine & layout', [['Hermes', 'JS engine nhẹ, tối ưu cho RN', '10, 19'], ['Yoga', 'Layout engine đa nền tảng (Flexbox)', 14]]],
    ['Thu nhỏ code Android', [['R8', 'Shrink/optimize/obfuscate, thay ProGuard', 25]]],
    ['Tách code & tải từ xa', [['Re.Pack', 'Bundler dựa trên Webpack/Rspack cho RN', '23, 24'], ['Module Federation', 'Microfrontend, nạp code động', 24], ['Zephyr Cloud', 'Quản lý/triển khai microfrontend', 24]]],
    ['Tree shaking', [['Rspack', 'Bundler hiệu năng cao giống Webpack', 23], ['Terser', 'Minify JavaScript', 23], ['metro-serializer-esbuild', 'Tree shaking trong Metro qua ESBuild', '22, 23']]],
    ['Phân tích bundle & app size', [['source-map-explorer', 'Phân tích JS bundle qua source map', 19], ['Expo Atlas', 'Trực quan hóa JS bundle cho Expo', 19], ['webpack-bundle-analyzer', 'Trực quan bundle Webpack/Rspack', 19], ['bundle-stats', 'Báo cáo phân tích bundle bằng CLI', 19], ['Statoscope', 'Phân tích sâu Webpack/Rspack', 19], ['Rsdoctor', 'Phân tích bundle Rspack', 19], ['Emerge Tools', 'Dịch vụ trả phí phân tích kích thước app', 20], ['Ruler', 'Gradle plugin của Spotify đo kích thước APK/AAB', 20]]],
    ['Kích thước thư viện', [['Bundlephobia', 'Kích thước minified/gzip của package npm', 21], ['pkg-size.dev', 'Giống Bundlephobia (dự phòng)', 21], ['Import Cost (VS Code)', 'Hiển thị kích thước import ngay trong editor', 21]]],
    ['Native module', [['React Native Builder Bob', 'Dựng khung thư viện RN hỗ trợ New Architecture', 17], ['Ninja', 'Hệ thống build nhanh cho code native', 17]]]
  ];
  const q = document.getElementById('ref-q');
  const link = c => String(c).split(',').map(x => `<a href="chuong-${x.trim()}.html">Ch.${x.trim()}</a>`).join(', ');
  function draw() {
    const k = q.value.trim().toLowerCase();
    el.innerHTML = R.map(([g, items]) => { const it = items.filter(i => !k || (g + i[0] + i[1]).toLowerCase().includes(k)); return it.length ? `<h3 style="margin:1em 0 .3em">${g}</h3><table class="cmp">${it.map(i => `<tr><td style="width:32%"><b>${i[0]}</b></td><td>${i[1]}</td><td style="width:90px">${link(i[2])}</td></tr>`).join('')}</table>` : ''; }).join('') || '<p class="muted">Không tìm thấy.</p>';
  }
  q.oninput = draw; draw();
})();
