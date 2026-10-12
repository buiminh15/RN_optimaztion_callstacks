/* Demos for chapters 3+ (each block guards on its own element id) */

/* ---------- Ch3: GC simulator ---------- */
(function () {
  const el = document.getElementById('gc'); if (!el) return;
  let items = [], id = 0;
  const heap = el.querySelector('#gc-heap'), m = el.querySelector('#gc-m i'), t = el.querySelector('#gc-t');
  function draw(msg) {
    heap.innerHTML = items.map(o => `<i style="width:22px;height:22px;border-radius:5px;background:${o.held ? 'var(--bad)' : 'var(--good)'}" title="${o.held ? 'còn được tham chiếu' : 'không ai tham chiếu'}"></i>`).join('');
    m.style.width = Math.min(100, items.length * 4) + '%'; m.parentElement.classList.toggle('bad', items.length > 15);
    t.textContent = msg || `${items.length} object trong heap · đỏ = còn bị giữ (không thể thu) · xanh = mồ côi (GC thu được)`;
  }
  const add = held => { for (let i = 0; i < 3; i++) items.push({ id: id++, held }); draw(); };
  el.querySelector('#gc-bad').onclick = () => add(true);
  el.querySelector('#gc-good').onclick = () => add(false);
  el.querySelector('#gc-run').onclick = () => { const b = items.length; items = items.filter(o => o.held); draw(`GC thu ${b - items.length} object. Còn lại ${items.length} object bị giữ — đó là leak.`); };
  el.querySelector('#gc-reset').onclick = () => { items = []; draw(); };
  draw();
})();

/* ---------- Ch4: typing race ---------- */
(function () {
  const el = document.getElementById('race'); if (!el) return;
  const steps = [
    ['1', 'T', 'Native → JS: onChangeText("T")'],
    ['2', 'T', 'JS → native: set value="T" (đồng bộ ổn)'],
    ['3', 'TE', 'Người dùng gõ E → onChangeText("TE")'],
    ['4', 'TES', 'Người dùng gõ S (JS còn bận) → onChangeText("TES")'],
    ['5', 'TE', '⚠ JS mới đồng bộ thao tác 3: set value="TE" → ô nhập quay ngược TES → TE!'],
    ['6', 'TET', 'Người dùng gõ chữ T (tưởng đang là TES) → onChangeText("TET")'],
    ['7', 'TES', '⚠ JS đồng bộ thao tác 4: set value="TES"'],
    ['8', 'TET', 'JS đồng bộ thao tác 6: set value="TET" — kết quả cuối sai (người dùng định gõ TEST)']
  ];
  let i = 0; const v = el.querySelector('#race-v'), d = el.querySelector('#race-d'), l = el.querySelector('#race-l');
  el.querySelector('#race-n').onclick = () => {
    if (i >= steps.length) return; const s = steps[i++];
    v.textContent = s[1]; d.innerHTML = `<b>Thao tác ${s[0]}</b><br>${s[2]}`;
    const row = document.createElement('div'); row.textContent = `#${s[0]}  ${s[1].padEnd(4)} ← ${s[2]}`; l.appendChild(row);
    if (i === steps.length) d.innerHTML += '<br><b style="color:var(--bad)">Mong đợi: TEST · Thực tế: TET</b>';
  };
  el.querySelector('#race-r').onclick = () => { i = 0; v.innerHTML = '&nbsp;'; d.textContent = 'Nhấn "Bước tiếp".'; l.innerHTML = ''; };
})();

/* ---------- Ch5: list virtualization (real DOM) ---------- */
(function () {
  const el = document.getElementById('virt'); if (!el) return;
  const box = el.querySelector('#virt-l'), H = 30, VIEW = 220, BUF = 3;
  const ui = k => el.querySelector('#v-' + k);
  let mode = 'scroll', N = 5000, created = 0, destroyed = 0, sp, nodes = new Map(), pool = [];
  function stats(ms) { ui('alive').textContent = box.querySelectorAll('.it').length; ui('created').textContent = created; ui('destroyed').textContent = destroyed; if (ms != null) ui('time').textContent = ms.toFixed(0) + ' ms'; }
  function mk() { created++; const d = document.createElement('div'); d.className = 'it'; return d; }
  function setup() {
    box.innerHTML = ''; nodes = new Map(); pool = []; created = destroyed = 0; box.scrollTop = 0;
    const t0 = performance.now();
    if (mode === 'scroll') {
      const f = document.createDocumentFragment();
      for (let i = 0; i < N; i++) { const d = mk(); d.textContent = 'Item ' + (i + 1); f.appendChild(d); }
      box.appendChild(f); stats(performance.now() - t0); return;
    }
    sp = document.createElement('div'); sp.style.cssText = `height:${N * H}px;position:relative`; box.appendChild(sp);
    render(); stats(performance.now() - t0);
  }
  function render() {
    if (mode === 'scroll') return;
    const first = Math.max(0, Math.floor(box.scrollTop / H) - BUF), last = Math.min(N - 1, Math.ceil((box.scrollTop + VIEW) / H) + BUF);
    for (const [i, d] of nodes) if (i < first || i > last) {
      nodes.delete(i);
      if (mode === 'flash') pool.push(d); else { d.remove(); destroyed++; }
    }
    for (let i = first; i <= last; i++) if (!nodes.has(i)) {
      const d = mode === 'flash' && pool.length ? pool.pop() : mk();
      d.textContent = 'Item ' + (i + 1); d.style.cssText = `position:absolute;left:0;right:0;top:${i * H}px;height:${H}px`;
      if (!d.parentNode) sp.appendChild(d); nodes.set(i, d);
    }
    stats();
  }
  box.addEventListener('scroll', render, { passive: true });
  el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; el.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); setup(); });
  el.querySelector('#virt-n').onchange = e => { N = +e.target.value; setup(); };
  setup();
})();
