/* ---------- Part 3 demos ---------- */

/* Ch19: pipeline web vs Hermes */
(function () {
  const el = document.getElementById('pipe'); if (!el) return;
  const steps = [['Tải xuống JS', 'web'], ['Nạp vào bộ nhớ', 'web'], ['Parse', 'web'], ['Thực thi', 'both']];
  const draw = m => {
    el.querySelector('#pi-s').innerHTML = steps.map((s, i) => { const skip = m === 'rn' && s[1] === 'web'; return `<div class="node ${skip ? 'skip' : 'flash'}" style="font-family:var(--font)"><span class="cnt">${skip ? 'bỏ qua' : 'phải làm'}</span><b>${i + 1}. ${s[0]}</b>${skip ? ' <span class="muted">— đã nằm sẵn trong app / làm lúc build</span>' : ''}</div>`; }).join('');
    el.querySelector('#pi-n').textContent = m === 'web' ? 'Trình duyệt phải tải, nạp, parse rồi mới chạy → tối ưu kích thước JS ban đầu rất quan trọng.' : 'Hermes đã biên dịch trước sang bytecode: chỉ còn bước thực thi. Tối ưu nên nhắm vào lượng JS chạy trên đường khởi tạo.';
    el.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === m));
  };
  el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => draw(b.dataset.m)); draw('web');
})();

/* Ch20: size vs conversion */
(function () {
  const el = document.getElementById('sz'); if (!el) return;
  const r = el.querySelector('#sz-r');
  const f = () => { el.querySelector('#sz-v').textContent = '+' + r.value + ' MB'; el.querySelector('#sz-l').textContent = '≈ ' + (r.value / 6).toFixed(1) + '%'; };
  r.oninput = f; f();
})();

/* Ch21: tool picker */
(function () {
  const el = document.getElementById('pk'); if (!el) return;
  const O = [['Kiểm tra nhanh một package trước khi cài', 'Dùng <b>bundlephobia.com</b>.'], ['Bundlephobia không chạy / bị sập', 'Dùng <b>pkg-size.dev</b>.'], ['Muốn thấy kích thước ngay khi gõ import', 'Cài <b>Import Cost</b> cho VS Code (nhớ rằng package có code native thường lỗi).'], ['Cần con số chính xác trong app của tôi', 'Phân tích bundle thật bằng <b>source-map-explorer / Expo Atlas</b> (Chương 19).']];
  const b = el.querySelector('#pk-b');
  O.forEach(o => { const x = document.createElement('button'); x.className = 'btn ghost'; x.textContent = o[0]; x.onclick = () => { b.querySelectorAll('button').forEach(y => y.classList.toggle('on', y === x)); el.querySelector('#pk-r').innerHTML = '👉 ' + o[1]; }; b.appendChild(x); });
})();

/* Ch22: barrel */
(function () {
  const el = document.getElementById('barrel'); if (!el) return;
  const M = [['Button', 8], ['Card', 14], ['Modal', 22], ['Sidebar', 35], ['Tooltip', 12], ['Chart', 90]];
  const sel = new Set(['Button']);
  const c = el.querySelector('#br-c');
  M.forEach(m => { const l = document.createElement('label'); l.style.cssText = 'cursor:pointer;margin-right:12px'; l.innerHTML = `<input type="checkbox" ${sel.has(m[0]) ? 'checked' : ''}> ${m[0]}`; l.firstChild.onchange = e => { e.target.checked ? sel.add(m[0]) : sel.delete(m[0]); draw(); }; c.appendChild(l); });
  function draw() {
    const all = M.reduce((a, m) => a + m[1], 0), used = M.filter(m => sel.has(m[0])).reduce((a, m) => a + m[1], 0);
    el.querySelector('#br-a').innerHTML = M.map(m => `<span class="pill" style="margin:2px;${sel.has(m[0]) ? '' : 'background:var(--bad-soft);color:var(--bad)'}">${m[0]}</span>`).join('');
    el.querySelector('#br-b').innerHTML = M.filter(m => sel.has(m[0])).map(m => `<span class="pill" style="margin:2px">${m[0]}</span>`).join('') || '<span class="muted">(không có gì)</span>';
    el.querySelector('#br-as').textContent = all + ' kB'; el.querySelector('#br-bs').textContent = used + ' kB';
  }
  draw();
})();
