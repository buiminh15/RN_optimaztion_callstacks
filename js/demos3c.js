/* Ch17: sync vs async */
(function () {
  const el = document.getElementById('sync'); if (!el) return;
  const q = s => el.querySelector(s); let blocked = false, n = 0, busy = false;
  setInterval(() => { if (!blocked) q('#sy-c').textContent = ++n; }, 100);
  function run(sync) {
    if (busy) return; busy = true; blocked = sync;
    q('#sy-t').textContent = sync ? 'Sync: JS thread đứng chờ native → bộ đếm dừng, UI JS "treo".' : 'Async: native làm việc ở thread nền, JS tiếp tục chạy → bộ đếm không dừng.';
    const bar = q('#sy-nt'), jb = q('#sy-js'), t0 = performance.now();
    jb.style.width = sync ? '0' : '0'; bar.style.background = sync ? 'var(--bad)' : 'var(--accent)';
    const id = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / 2000);
      bar.style.width = p * 100 + '%'; jb.style.width = sync ? p * 100 + '%' : '0';
      if (p >= 1) { clearInterval(id); blocked = false; busy = false; }
    }, 40);
  }
  q('#sy-s').onclick = () => run(true); q('#sy-a').onclick = () => run(false);
})();

/* Ch18: Activity leak */
(function () {
  const el = document.getElementById('act'); if (!el) return;
  const q = s => el.querySelector(s); let acts, alloc, dealloc;
  const reset = () => { acts = [{ alive: true, held: false }]; alloc = 1; dealloc = 0; q('#ac-t').textContent = 'Activity đầu tiên đang chạy.'; draw(); };
  function draw() {
    q('#ac-h').innerHTML = acts.map(a => `<i style="width:26px;height:26px;border-radius:6px;background:${a.held ? 'var(--bad)' : a.current ? 'var(--accent)' : 'var(--good)'};opacity:${a.alive ? 1 : .25}" title="Activity"></i>`).join('');
    q('#ac-a').textContent = alloc; q('#ac-d').textContent = dealloc;
  }
  q('#ac-rot').onclick = () => {
    const fix = q('#ac-fix').checked, last = acts[acts.length - 1];
    last.destroyed = true; last.held = !fix; last.current = false;
    acts.push({ alive: true, held: false, current: true }); alloc++;
    q('#ac-t').textContent = 'Xoay: Activity cũ bị hủy' + (fix ? ' và gỡ listener → mồ côi.' : ' nhưng EventManager vẫn giữ → không thu được (đỏ).');
    draw();
  };
  q('#ac-gc').onclick = () => {
    const before = acts.length;
    acts = acts.filter(a => !(a.destroyed && !a.held) || (dealloc++, false));
    q('#ac-t').textContent = acts.filter(a => a.held).length ? `GC xong: ${acts.filter(a => a.held).length} Activity cũ vẫn bị giữ → LEAK.` : 'GC thu hết Activity đã hủy. Không leak.';
    draw();
  };
  q('#ac-r').onclick = reset; reset();
  acts[0].current = true; draw();
})();
