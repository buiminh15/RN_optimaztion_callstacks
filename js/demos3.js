/* ---------- Part 2 demos ---------- */

/* Ch10: boot sequence stepper */
(function () {
  const el = document.getElementById('boot'); if (!el) return;
  const steps = [
    ['OS', 'Khởi tạo process + sandbox bảo mật (có thể đã warm/prewarm)'],
    ['Main thread', 'Application.onCreate → Activity.onCreate: code native khởi tạo'],
    ['Main thread', 'Khởi tạo lõi RN: React renderer C++, JSI, Hermes, Yoga'],
    ['JS thread (mqt_v_js)', 'Tạo JS thread; nạp bundle HBC vào bộ nhớ'],
    ['JS thread (mqt_v_js)', 'Chạy native module đánh dấu eager (C++ TurboModules, Interop Layer)'],
    ['JS thread (mqt_v_js)', 'Chạy JavaScript của app: React render ra cây view'],
    ['Native modules thread (mqt_v_native)', 'TurboModule khởi tạo lười khi JS gọi tới'],
    ['Main thread', 'Fabric nhận cây view → layout, vẽ → UI hiện ra']
  ];
  const l = el.querySelector('#bt-l'); let i = 0;
  const draw = () => l.innerHTML = steps.slice(0, i).map((s, k) => `<div class="node ${k === i - 1 ? 'flash' : ''}" style="font-family:var(--font)"><span class="cnt">${k + 1}</span><b>${s[0]}</b> — ${s[1]}</div>`).join('');
  el.querySelector('#bt-n').onclick = () => { if (i < steps.length) { i++; draw(); } };
  el.querySelector('#bt-r').onclick = () => { i = 0; draw(); };
  draw();
})();

/* Ch14: thread explorer */
(function () {
  const el = document.getElementById('thr14'); if (!el) return;
  const rows = [
    ['init (override)', 'Main thread', 'JS thread (mqt_v_js)', 'iOS giả định bạn có thể dùng UIKit nên gọi trên main queue.'],
    ['init + needsEagerInit=true', '— (chỉ Android)', 'Turbo Modules thread (mqt_v_native)', 'Nếu cần truy cập JS instance, dùng JavaScript CallInvoker.'],
    ['Hàm sync (multiply)', 'JS thread', 'JS thread', 'JS phải đợi kết quả → chặn JS thread; đừng làm việc nặng ở đây.'],
    ['Hàm async (multiplyOnBackgroundThread)', 'Turbo Modules thread', 'Turbo Modules thread', 'Thread dùng chung — nếu bận, tạo thread riêng.'],
    ['invalidate', 'Turbo Modules thread', 'pool-2-thread-1 (ReactHost)', 'iOS cần RCTInvalidating. Xảy ra khi RN instance bị phá (reload).'],
    ['Native view: init', 'Main thread', 'Main thread', 'OS yêu cầu thao tác view trên main thread.'],
    ['Native view: updateProps', 'Main thread', 'Main thread', 'Dù JS đổi props trên JS thread.'],
    ['Yoga: measure', 'JS thread', 'JS thread', 'Thao tác trên Yoga tree chạy ở JS thread.']
  ];
  const b = el.querySelector('#t14-b');
  rows.forEach((r, i) => { const x = document.createElement('button'); x.className = 'btn ghost'; x.textContent = r[0]; x.onclick = () => { b.querySelectorAll('button').forEach(y => y.classList.toggle('on', y === x)); el.querySelector('#t14-i').textContent = r[1]; el.querySelector('#t14-a').textContent = r[2]; el.querySelector('#t14-n').textContent = r[3]; }; b.appendChild(x); });
  b.firstChild.click();
})();

/* Ch15: view flattening */
(function () {
  const el = document.getElementById('flat'); if (!el) return;
  // [label, layoutOnly, depth]
  const T = [['Screen', false, 0], ['Container', true, 1], ['Row', true, 2], ['Text "A"', false, 3], ['Wrapper', true, 2], ['Image', false, 3], ['Card (có background)', false, 1], ['Spacer', true, 2], ['Text "B"', false, 3]];
  const on = el.querySelector('#fl-on'), col = el.querySelector('#fl-col');
  function draw() {
    const flat = on.checked;
    el.querySelector('#fl-js').innerHTML = T.map(n => `<div class="node" style="margin-left:${n[2] * 14}px;${n[1] ? 'border-style:dashed' : ''}">${n[0]}${n[1] ? ' <span class="muted">(layout-only)</span>' : ''}</div>`).join('');
    const nat = T.filter(n => !flat || !n[1] || (col.checked && n[0] === 'Container'));
    el.querySelector('#fl-nat').innerHTML = nat.map(n => `<div class="node skip" style="margin-left:${(flat ? n[2] - T.filter(m => m[1] && m[2] < n[2] && T.indexOf(m) < T.indexOf(n) && !(col.checked && m[0] === 'Container') && inPath(m, n)).length : n[2]) * 14}px">${n[0]}</div>`).join('');
    el.querySelector('#fl-nj').textContent = T.length; el.querySelector('#fl-nn').textContent = nat.length;
  }
  // m is an ancestor of n if it precedes n and has smaller depth with no shallower node between
  function inPath(m, n) { const a = T.indexOf(m), b = T.indexOf(n); for (let i = a + 1; i < b; i++) if (T[i][2] <= m[2]) return false; return true; }
  on.onchange = col.onchange = draw; draw();
})();

/* Ch16: Intl polyfills */
(function () {
  const el = document.getElementById('intl'); if (!el) return;
  const A = [['Intl.Collator', true, null], ['Intl.DateTimeFormat', true, 'intl-datetimeformat'], ['Intl.NumberFormat', true, 'intl-numberformat'], ['Intl.getCanonicalLocales()', true, 'intl-getcanonicallocales'], ['Intl.Locale', false, 'intl-locale'], ['Intl.PluralRules', false, 'intl-pluralrules'], ['Intl.RelativeTimeFormat', false, 'intl-relativetimeformat'], ['Intl.DisplayNames', false, 'intl-displaynames']];
  const t = el.querySelector('#in-t'); let removed = new Set();
  const draw = () => {
    t.innerHTML = '<table class="cmp"><tr><th>API</th><th>Hermes (1/2025)</th><th>Polyfill</th></tr>' + A.map((a, i) => `<tr><td><code>${a[0]}</code></td><td>${a[1] ? '✅ có' : '❌ chưa'}</td><td>${a[2] ? `<button class="btn ghost ${removed.has(i) ? 'on' : ''}" data-i="${i}" style="padding:3px 10px;font-size:13px">${removed.has(i) ? 'đã gỡ' : 'đang import'}</button>` : '—'}</td></tr>`).join('') + '</table>';
    const left = A.filter((a, i) => a[2] && !removed.has(i)).map(a => a[2]);
    el.querySelector('#in-n').textContent = left.length ? left.join(', ') : '(không còn)';
    t.querySelectorAll('button').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (!A[i][1]) { el.querySelector('#in-n').textContent = 'Hermes chưa hỗ trợ API này — vẫn cần giữ polyfill.'; return; } removed.has(i) ? removed.delete(i) : removed.add(i); draw(); });
  };
  draw();
})();
