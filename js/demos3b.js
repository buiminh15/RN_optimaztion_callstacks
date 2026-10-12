/* Ch11: frame budget calc */
(function () {
  const el = document.getElementById('budget'); if (!el) return;
  const s = el.querySelector('#bg-ms');
  const f = () => { const ms = +s.value; el.querySelector('#bg-v').textContent = ms + ' ms';
    el.querySelector('#bg-60').textContent = Math.max(0, Math.floor(ms / (1000 / 60))); el.querySelector('#bg-120').textContent = Math.max(0, Math.floor(ms / (1000 / 120))); };
  s.oninput = f; f();
})();

/* Ch12: TTI pipeline */
(function () {
  const el = document.getElementById('tti'); if (!el) return;
  const st = [['Native process init', 300, 'var(--muted)'], ['Native app init', 250, '#8b5cf6'], ['JS bundle load', 700, 'var(--warn)'], ['Root view render', 200, 'var(--accent)'], ['React app render', 650, 'var(--good)']];
  const box = el.querySelector('#tti-s'), bar = el.querySelector('#tti-bar');
  box.innerHTML = st.map((s, i) => `<div class="row" style="margin:4px 0"><span style="width:150px;font-size:14px">${s[0]}</span><input type="range" min="50" max="2000" value="${s[1]}" data-i="${i}" style="flex:1"><b style="width:70px;text-align:right" id="tt${i}"></b></div>`).join('');
  function draw() {
    const tot = st.reduce((a, s) => a + s[1], 0), mx = st.reduce((a, s, i) => s[1] > st[a][1] ? i : a, 0);
    bar.innerHTML = st.map(s => `<div style="width:${s[1] / tot * 100}%;background:${s[2]};height:100%" title="${s[0]}"></div>`).join('');
    st.forEach((s, i) => el.querySelector('#tt' + i).textContent = s[1] + ' ms');
    el.querySelector('#tti-t').textContent = (tot / 1000).toFixed(2) + ' s'; el.querySelector('#tti-m').textContent = st[mx][0];
  }
  box.addEventListener('input', e => { st[+e.target.dataset.i][1] = +e.target.value; draw(); });
  draw();
})();

/* Ch13: ARC cycle */
(function () {
  const el = document.getElementById('arc'); if (!el) return;
  const q = s => el.querySelector(s);
  function reset() {
    const strong = el.querySelector('input[name=arc-m]:checked').value === 'strong';
    el._s = { a: 1 + (strong ? 1 : 0), b: 1, strong, dropped: false };
    draw(); q('#arc-t').textContent = 'Ban đầu: A được main giữ' + (strong ? ' và B giữ (strong)' : '') + '; B được A giữ.';
  }
  function draw(dead) {
    const s = el._s;
    q('#arc-a').textContent = dead && dead.a ? 0 : s.a; q('#arc-b').textContent = dead && dead.b ? 0 : s.b;
    ['A', 'B'].forEach(k => { const n = q('#arc-' + k); n.className = 'node' + (dead ? (dead[k.toLowerCase()] ? ' skip' : ' flash') : ''); q('#arc-s' + k.toLowerCase()).textContent = dead ? (dead[k.toLowerCase()] ? '— đã giải phóng ✔' : '— LEAK ✖') : ''; });
  }
  q('#arc-go').onclick = () => {
    const s = el._s; if (s.dropped) return; s.dropped = true; s.a--;
    const dead = { a: false, b: false };
    if (s.a === 0) { dead.a = true; s.b--; if (s.b === 0) dead.b = true; }
    draw(dead);
    q('#arc-t').textContent = dead.a ? 'A về 0 → bị giải phóng, nó thả B → B về 0 → giải phóng. Không leak.' : 'A vẫn còn count = ' + s.a + ' (do B giữ strong) và B còn count = ' + s.b + ' (do A giữ). Cả hai mồ côi nhưng không bao giờ được giải phóng → vòng tham chiếu = leak.';
  };
  q('#arc-r').onclick = reset;
  el.querySelectorAll('input[name=arc-m]').forEach(r => r.onchange = reset);
  reset();
})();
