/* Interactive demos */
const $ = (s, r = document) => r.querySelector(s);

/* 1. FPS: ball moves at fixed speed, but screen only "redraws" at chosen fps */
(function () {
  const el = $('#fps-demo'); if (!el) return;
  const stage = $('.stage', el), ball = $('.ball', el), out = $('#fps-out', el), btns = [...el.querySelectorAll('[data-fps]')];
  let fps = 60, last = 0, frames = 0, shown = 0, t0 = performance.now();
  const speed = 320; // px/s
  function set(f) { fps = f; btns.forEach(b => b.classList.toggle('on', +b.dataset.fps === f)); }
  btns.forEach(b => b.onclick = () => set(+b.dataset.fps));
  set(60);
  function tick(now) {
    if (now - last >= 1000 / fps - 1) {
      last = now; frames++;
      const w = stage.clientWidth - 34, p = ((now / 1000) * speed) % (2 * w);
      ball.style.transform = `translateX(${p < w ? p : 2 * w - p}px)`;
    }
    if (now - t0 >= 1000) { shown = frames; frames = 0; t0 = now; }
    out.innerHTML = `Ngân sách mỗi khung hình: <b>${(1000 / fps).toFixed(1)} ms</b> · đo được: <b>${shown}</b> khung/giây`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* 2. Perceived performance: spinner vs skeleton, same real wait */
(function () {
  const el = $('#perc'); if (!el) return;
  const a = $('#perc-a', el), b = $('#perc-b', el), t = $('#perc-t', el);
  const spin = '<div class="spinner"></div>';
  const skel = '<div class="sk" style="height:60px"></div><div class="sk"></div><div class="sk" style="width:70%"></div><div class="sk"></div>';
  const real = '<div class="real"><div class="line" style="height:60px"></div><div class="line"></div><div class="line" style="width:70%"></div><div class="line"></div></div>';
  function reset() { a.innerHTML = ''; b.innerHTML = ''; t.textContent = 'Nhấn "Tải dữ liệu" để bắt đầu'; }
  $('#perc-go', el).onclick = () => {
    a.innerHTML = spin; b.innerHTML = skel;
    const s = performance.now(), id = setInterval(() => {
      const d = performance.now() - s;
      if (d >= 3000) { clearInterval(id); a.innerHTML = real; b.innerHTML = real; t.textContent = 'Xong sau 3.0 s — thời gian thật hoàn toàn giống nhau.'; }
      else t.textContent = `Đang chờ… ${(d / 1000).toFixed(1)} s`;
    }, 100);
  };
  reset();
})();

/* 3. Re-render simulator mirroring the book's example */
(function () {
  const el = $('#rr'); if (!el) return;
  const cnt = { app: 0, t1: 0, t2: 0, b1: 0, b2: 0 };
  let count = 0, second = 0, optimized = false, commit = 0, prev = {};
  const log = $('.log', el), nodes = {};
  ['app', 't1', 't2', 'b1', 'b2'].forEach(k => nodes[k] = $('[data-n="' + k + '"]', el));
  const names = { app: 'App', t1: 'Text {count}', t2: 'Text {second}', b1: 'Button "Press one"', b2: 'Button "Press two"' };

  function paint(rendered, why) {
    commit++;
    Object.keys(nodes).forEach(k => {
      const n = nodes[k], did = rendered.has(k);
      if (did) cnt[k]++;
      n.classList.remove('flash', 'skip'); void n.offsetWidth;
      n.classList.add(did ? 'flash' : 'skip');
      $('.cnt', n).textContent = cnt[k];
      if (k === 't1') $('.v', n).textContent = count;
      if (k === 't2') $('.v', n).textContent = second;
    });
    const skipped = Object.keys(nodes).filter(k => !rendered.has(k) && k !== 'app').map(k => names[k]);
    const d = document.createElement('div');
    d.innerHTML = `<b>Commit #${commit}</b> · ${why} → render: ${[...rendered].map(k => names[k]).join(', ')}` +
      (skipped.length ? ` · <span style="color:var(--good)">bỏ qua: ${skipped.join(', ')}</span>` : '');
    log.prepend(d);
  }
  function press(which) {
    which === 1 ? count++ : second++;
    const r = new Set(['app', 't1', 't2']);
    if (!optimized) { r.add('b1'); r.add('b2'); }
    else {
      // useCallback deps: onPress of button one changes when `count` changes, button two when `second` changes
      if (which === 1) r.add('b1'); else r.add('b2');
    }
    paint(r, `nhấn "Press ${which === 1 ? 'one' : 'two'}"`);
  }
  $('#rr-1', el).onclick = () => press(1);
  $('#rr-2', el).onclick = () => press(2);
  const tog = $('#rr-opt', el);
  tog.onchange = () => { optimized = tog.checked; };
  $('#rr-reset', el).onclick = () => { Object.keys(cnt).forEach(k => cnt[k] = 0); count = second = commit = 0; log.innerHTML = ''; Object.values(nodes).forEach(n => { n.classList.remove('flash', 'skip'); $('.cnt', n).textContent = 0; }); $('.v', nodes.t1).textContent = 0; $('.v', nodes.t2).textContent = 0; };
})();

/* 4. JS thread vs frame budget */
(function () {
  const el = $('#thr'); if (!el) return;
  const sl = $('#thr-ms', el), hz = el.querySelectorAll('[data-hz]');
  let h = 60;
  function draw() {
    const ms = +sl.value, budget = 1000 / h, max = 200;
    $('#thr-v', el).textContent = ms + ' ms';
    const tl = $('.tl', el); tl.style.setProperty('--fw', (budget / max * tl.clientWidth) + 'px');
    $('.job', tl).style.width = (ms / max * 100) + '%';
    const lost = Math.max(0, Math.ceil(ms / budget) - 1);
    const n = Math.ceil(max / budget), dots = $('.dots', el); dots.innerHTML = '';
    const bad = Math.ceil(ms / budget);
    for (let i = 0; i < n; i++) { const d = document.createElement('i'); if (i < bad && ms > budget) d.className = 'x'; dots.appendChild(d); }
    const v = $('#thr-verdict', el);
    if (ms <= budget) { v.innerHTML = `<span class="pill" style="background:var(--good-soft);color:var(--good)">OK</span> ${ms} ms nằm trong ngân sách ${budget.toFixed(1)} ms — không rớt khung hình.`; }
    else v.innerHTML = `<span class="pill" style="background:var(--bad-soft);color:var(--bad)">JANK</span> Chặn JS thread ${ms} ms ≈ <b>${lost}</b> khung hình bị bỏ (ngân sách ${budget.toFixed(1)} ms ở ${h} Hz).`;
  }
  hz.forEach(b => b.onclick = () => { h = +b.dataset.hz; hz.forEach(x => x.classList.toggle('on', x === b)); draw(); });
  sl.oninput = draw; addEventListener('resize', draw); draw();
})();

/* 5. Flame chart (static, explorable) */
(function () {
  const el = $('#flame'); if (!el) return;
  const tip = $('.ftip', el);
  const info = {
    root: 'Toàn bộ lần ghi (recording). Chiều rộng = thời gian. Ở đây ≈ 12 giây.',
    ev: 'Hàm xử lý sự kiện (ví dụ onPress) – điểm vào của đoạn code chậm. Self time gần bằng 0: nó chỉ gọi hàm khác.',
    long: '<b>longRunningFunction</b> chiếm gần toàn bộ chiều rộng → đây là thủ phạm. Self time rất lớn: vòng <code>while</code> 1 tỷ lần chạy ngay trong hàm này.',
    idle: 'Phần còn lại: JS thread rảnh (idle). Không đáng quan tâm.',
    r1: 'Render React nhanh – thanh ngắn, màu xanh. Không phải vấn đề.'
  };
  el.querySelectorAll('.fb').forEach(b => b.onclick = () => tip.innerHTML = info[b.dataset.i] || '');
})();
