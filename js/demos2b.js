/* ---------- Ch6: atoms vs central state ---------- */
(function () {
  const el = document.getElementById('atoms'); if (!el) return;
  const names = ['TodoList (root)', 'Filter: all', 'Filter: active', 'Filter: completed', 'TodoItem 1', 'TodoItem 2', 'TodoItem 3'];
  const kind = ['root', 'f', 'f', 'f', 't', 't', 't'];
  let mode = 'central', cnt = names.map(() => 1);
  const tree = el.querySelector('#at-tree'), msg = el.querySelector('#at-msg');
  function draw(hit) {
    tree.innerHTML = names.map((n, i) => `<div class="node ${hit ? (hit[i] ? 'flash' : 'skip') : ''}" style="margin-left:${i === 0 ? 0 : 20}px"><span class="cnt">${cnt[i]}</span>${n}</div>`).join('');
  }
  function act(what) {
    const hit = kind.map(k => mode === 'central' ? true : what === 'filter' ? true : k !== 'f');
    hit.forEach((h, i) => { if (h) cnt[i]++; });
    draw(hit);
    msg.textContent = mode === 'central'
      ? 'State nằm trong App → mọi thành phần đều re-render, dù không phụ thuộc phần state vừa đổi.'
      : what === 'filter' ? 'Atom filter đổi → các FilterMenuItem (đọc filter) và danh sách (dùng kết quả lọc) render lại.'
        : 'Atom todos đổi → chỉ danh sách và các TodoItem render lại. Ba FilterMenuItem đứng yên, không cần memo.';
  }
  el.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; el.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b)); reset(); });
  const reset = () => { cnt = names.map(() => 1); draw(); msg.textContent = 'Bấm "Đổi filter" hoặc "Tick một todo".'; };
  el.querySelector('#at-f').onclick = () => act('filter');
  el.querySelector('#at-t').onclick = () => act('todo');
  el.querySelector('#at-r').onclick = reset;
  reset();
})();

/* ---------- Ch7: deferred value + batching ---------- */
(function () {
  const el = document.getElementById('defer');
  if (el) {
    let on = false, tm, renders = 0;
    const inp = el.querySelector('#df-in'), now = el.querySelector('#df-now'), slow = el.querySelector('#df-slow'), st = el.querySelector('#df-st'), slowc = el.querySelector('#df-slowc'), info = el.querySelector('#df-fps');
    const busy = ms => { const t = performance.now(); while (performance.now() - t < ms); };
    function renderSlow(v) { busy(150); renders++; slow.textContent = v; st.textContent = 'đã cập nhật'; slowc.style.opacity = 1; info.textContent = `SlowComponent đã render ${renders} lần.`; }
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { on = b.dataset.d === 'on'; el.querySelectorAll('[data-d]').forEach(x => x.classList.toggle('on', x === b)); renders = 0; info.textContent = ''; });
    inp.addEventListener('input', () => {
      const v = inp.value; now.textContent = v;
      if (!on) { renderSlow(v); return; }           // mỗi phím chặn 150 ms
      st.textContent = 'đang chờ (giá trị cũ)…'; slowc.style.opacity = .55;
      clearTimeout(tm); tm = setTimeout(() => renderSlow(v), 120);  // render bị hủy/gộp nếu gõ tiếp
    });
  }
  const b = document.getElementById('batch');
  if (b) {
    const r = b.querySelector('#b-r'), s = b.querySelector('#b-s'); let n = 0;
    const go = batched => { n = 0; r.textContent = 0; s.innerHTML = ''; setTimeout(() => {
      const paint = t => { n++; r.textContent = n; s.innerHTML += `render #${n}: ${t}<br>`; };
      if (batched) paint('qty=2, cart=open');
      else { paint('qty=2, cart=closed <span style="color:var(--bad)">(dở dang)</span>'); paint('qty=2, cart=open'); }
    }, 300); };
    b.querySelector('#b-off').onclick = () => go(false); b.querySelector('#b-on').onclick = () => go(true);
  }
})();

/* ---------- Ch8: compiler cache ---------- */
(function () {
  const el = document.getElementById('cc'); if (!el) return;
  let slot0, slot1, v = 'a', hit = 0, miss = 0, k = 0;
  const q = s => el.querySelector(s);
  function render() {
    if (slot0 !== v) { slot1 = `<TextInput …> #${++k}`; slot0 = v; miss++; q('#cc-res').innerHTML = `<b style="color:var(--warn)">MISS</b> — value đổi ($[0] !== value) → tạo element mới và lưu lại.`; }
    else { hit++; q('#cc-res').innerHTML = `<b style="color:var(--good)">HIT</b> — value giữ nguyên → dùng lại $[1], không tạo element mới.`; }
    q('#cc-0').textContent = JSON.stringify(slot0); q('#cc-1').textContent = JSON.stringify(slot1); q('#cc-h').textContent = hit; q('#cc-m').textContent = miss;
  }
  q('#cc-same').onclick = render;
  q('#cc-new').onclick = () => { v = String.fromCharCode(v.charCodeAt(0) + 1); render(); };
  q('#cc-r').onclick = () => { slot0 = slot1 = undefined; v = 'a'; hit = miss = k = 0; q('#cc-res').textContent = '—'; q('#cc-0').textContent = q('#cc-1').textContent = 'undefined'; q('#cc-h').textContent = q('#cc-m').textContent = 0; };
})();
