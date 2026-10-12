/* Shared: theme, progress bar, TOC highlight, quiz */
(function () {
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  const tb = document.getElementById('theme');
  if (tb) tb.onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  };

  const bar = document.getElementById('progress');
  if (bar) addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + '%';
  }, { passive: true });

  const links = [...document.querySelectorAll('.toc a')];
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { links.forEach(l => l.classList.remove('on')); map.get(e.target.id)?.classList.add('on'); }
    }), { rootMargin: '-15% 0px -75% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  // Quiz: <div class="q" data-ans="1"> <p>…</p> <div class="opts"><button>…</button>…</div> <div class="exp">…</div></div>
  document.querySelectorAll('.q').forEach(q => {
    const ans = +q.dataset.ans, btns = [...q.querySelectorAll('.opts button')];
    btns.forEach((b, i) => b.onclick = () => {
      if (q.dataset.done) return;
      q.dataset.done = 1;
      b.classList.add(i === ans ? 'right' : 'wrong');
      btns[ans].classList.add('right');
      const e = q.querySelector('.exp'); if (e) e.style.display = 'block';
    });
  });
})();
// Tabs: <div data-tabs><div class="row"><button data-t="a">..</button></div><div data-p="a">..</div></div>
document.querySelectorAll('[data-tabs]').forEach(w => {
  const bs = [...w.querySelectorAll('[data-t]')], ps = [...w.querySelectorAll('[data-p]')];
  const show = k => { bs.forEach(b => b.classList.toggle('on', b.dataset.t === k)); ps.forEach(p => p.style.display = p.dataset.p === k ? '' : 'none'); };
  bs.forEach(b => b.onclick = () => show(b.dataset.t)); show(bs[0].dataset.t);
});
document.getElementById('jump')?.addEventListener('change', e => location.href = e.target.value);
