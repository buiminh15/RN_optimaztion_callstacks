/* ---------- Ch9: UI-thread vs JS-thread animation analogy ---------- */
(function () {
  const el = document.getElementById('anim'); if (!el) return;
  const css = el.querySelector('#an-css'), js = el.querySelector('#an-js'), stage = css.parentElement;
  const w = () => stage.clientWidth - 34;
  let anim = null;
  function setCss() {
    if (!css.animate) return;
    if (anim) anim.cancel();
    anim = css.animate([{ transform: 'translateX(0px)' }, { transform: 'translateX(' + w() + 'px)' }], { duration: 1800, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
  }
  setCss(); addEventListener('resize', setCss);
  function tick(t) {
    const p = (t % 3600) / 1800, x = p < 1 ? p : 2 - p, e = x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    js.style.transform = `translateX(${e * w()}px)`; requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  el.querySelector('#an-block').onclick = () => setTimeout(() => { const t = performance.now(); while (performance.now() - t < 1500); }, 30);
})();
