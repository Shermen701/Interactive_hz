(function (root) {
  const core = root.LinAlgLab && root.LinAlgLab.matrix || (typeof module !== 'undefined' ? require('../core/matrix.js') : null);
  const presets = {
    identity: { a: 1, b: 0, c: 0, d: 1 },
    rotation: { a: Math.SQRT1_2, b: -Math.SQRT1_2, c: Math.SQRT1_2, d: Math.SQRT1_2 },
    shear: { a: 1, b: 1.2, c: 0, d: 1 },
    scale: { a: 2, b: 0, c: 0, d: .5 },
    singular: { a: 1, b: 2, c: .5, d: 1 },
    reflection: { a: -1, b: 0, c: 0, d: 1 }
  };
  const state = { a: 1.5, b: .5, c: 0, d: 1.2, preset: 'custom' };
  let context; const cleanups = [];
  const byId = id => document.getElementById(id);
  const on = (node, event, handler, options) => {
    if (!node) return;
    node.addEventListener(event, handler, options);
    cleanups.push(() => node.removeEventListener(event, handler, options));
  };
  const format = value => Number(value.toFixed(2));
  const language = () => context && context.state && context.state.lang || 'zh';

  function calculate(next = state) {
    const matrix = [[next.a, next.b], [next.c, next.d]];
    return { matrix, determinant: core.determinant(matrix), trace: next.a + next.d, rank: core.rank(matrix, .001) };
  }
  function syncInputs() {
    [['matA', state.a], ['matB', state.b], ['matC', state.c], ['matD', state.d]].forEach(([id, value]) => {
      const input = byId(id); if (input) input.value = format(value);
    });
  }
  function read() {
    const values = ['matA', 'matB', 'matC', 'matD'].map(id => Number(byId(id).value));
    if (values.some(value => !Number.isFinite(value))) return;
    [state.a, state.b, state.c, state.d] = values; state.preset = 'custom'; redraw();
  }
  function applyPreset(name) {
    if (!presets[name]) return;
    Object.assign(state, presets[name]); state.preset = name; syncInputs(); redraw();
  }
  const point = (x, y) => {
    const [nextX, nextY] = core.multiplyVector([[state.a, state.b], [state.c, state.d]], [x, y]);
    return { x: nextX, y: nextY };
  };
  function refresh() {
    const { determinant } = calculate(); const zh = language() === 'zh'; const badge = byId('transformBadge'); const callout = byId('transformCalloutText');
    if (!badge || !callout) return;
    const invertible = Math.abs(determinant) > .001;
    badge.textContent = invertible ? (zh ? `可逆矩阵 (det = ${determinant.toFixed(2)} ≠ 0)` : `Invertible (det = ${determinant.toFixed(2)} ≠ 0)`) : (zh ? '奇异矩阵 (det = 0，不可逆!)' : 'Singular Matrix (det = 0, Non-Invertible)');
    badge.style.cssText = invertible ? 'background:rgba(16,185,129,.15);color:#10b981;border-color:rgba(16,185,129,.4)' : 'background:rgba(244,63,94,.15);color:#f43f5e;border-color:rgba(244,63,94,.4)';
    if (!invertible) callout.textContent = zh ? 'det(A) = 0。线性变换将 2D 平面压缩到 1D 直线或 0D 原点（Rank < 2）。' : 'det(A) = 0. The transformation flattens the 2D plane onto a line or point (Rank < 2).';
    else if (determinant > 0) callout.textContent = zh ? `变换保持定向 (det > 0)。单位正方形面积缩放为 ${determinant.toFixed(2)} 倍。` : `Orientation preserving (det > 0). Unit-square area is scaled by ${determinant.toFixed(2)}x.`;
    else callout.textContent = zh ? `变换颠倒空间定向 (det < 0)。绝对面积缩放倍数为 ${Math.abs(determinant).toFixed(2)}。` : `Orientation reversing (det < 0). Absolute area scaling factor is ${Math.abs(determinant).toFixed(2)}x.`;
  }
  function redraw() {
    const canvas = byId('transformCanvas'); if (!canvas) return;
    const { ctx, width, height } = root.LinAlgLab.canvas.setupHiDPI(canvas); const origin = { x: width / 2, y: height / 2 }; const scale = 45; const palette = root.LinAlgLab.canvas.getActivePalette();
    ctx.clearRect(0, 0, width, height); root.LinAlgLab.canvas.drawGrid(ctx, width, height, origin, scale, palette);
    ctx.strokeStyle = 'rgba(6,182,212,.25)'; ctx.lineWidth = 1;
    for (let index = -6; index <= 6; index++) {
      const verticalStart = point(index, -6), verticalEnd = point(index, 6), horizontalStart = point(-6, index), horizontalEnd = point(6, index);
      [[verticalStart, verticalEnd], [horizontalStart, horizontalEnd]].forEach(([start, end]) => { ctx.beginPath(); ctx.moveTo(origin.x + start.x * scale, origin.y - start.y * scale); ctx.lineTo(origin.x + end.x * scale, origin.y - end.y * scale); ctx.stroke(); });
    }
    const square = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => point(x, y));
    ctx.beginPath(); square.forEach((value, index) => index ? ctx.lineTo(origin.x + value.x * scale, origin.y - value.y * scale) : ctx.moveTo(origin.x + value.x * scale, origin.y - value.y * scale)); ctx.closePath(); ctx.fillStyle = 'rgba(59,130,246,.25)'; ctx.fill(); ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.stroke();
    root.LinAlgLab.canvas.drawVector(ctx, origin, [state.a, state.c], scale, '#06b6d4', 3.5, 'T(î)');
    root.LinAlgLab.canvas.drawVector(ctx, origin, [state.b, state.d], scale, '#10b981', 3.5, 'T(ĵ)');
    const data = calculate(); byId('detCalcVal').textContent = data.determinant.toFixed(2); byId('traceCalcVal').textContent = data.trace.toFixed(2); byId('rankCalcVal').textContent = data.rank;
    document.querySelectorAll('[data-action="matrix-preset"]').forEach(button => button.classList.toggle('active', button.dataset.preset === state.preset)); refresh();
  }
  function init(nextContext) { destroy(); context = nextContext; ['matA', 'matB', 'matC', 'matD'].forEach(id => on(byId(id), 'input', read)); read(); }
  function destroy() { cleanups.splice(0).forEach(remove => remove()); }
  const api = { id: 'transform', init, redraw, refresh, destroy, calculate, applyPreset };
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (root.LinAlgLab && root.LinAlgLab.modules) root.LinAlgLab.modules.register(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
