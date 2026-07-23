(function (root) {
  const core = root.LinAlgLab && root.LinAlgLab.matrix || (typeof module !== 'undefined' ? require('../core/matrix.js') : null);
  const presets = {
    default: [[-4, -3.8], [-2, -1.4], [0, 0.7], [2, 2.5], [4, 4.9]],
    positive: [[-4, -3], [-2, -1], [0, 1], [2, 3], [4, 5]],
    negative: [[-4, 4.5], [-2, 2.4], [0, 0.4], [2, -1.8], [4, -3.7]],
    outlier: [[-4, -3], [-2, -1], [0, 1], [2, 3], [4, -1]]
  };
  const state = { points: presets.default.map(([x, y]) => ({ x, y })), preset: 'default', dragging: null };
  let context; const cleanups = []; const byId = id => document.getElementById(id);
  const on = (node, event, handler, options) => { if (!node) return; node.addEventListener(event, handler, options); cleanups.push(() => node.removeEventListener(event, handler, options)); };
  const format = value => Math.abs(value) < 1e-9 ? '0' : Number(value.toFixed(3)).toString();
  const language = () => context && context.state && context.state.lang || 'zh';
  const copyPoints = points => points.map(([x, y]) => ({ x, y }));
  function calculate(next = state) {
    const source = next.points || next; const points = source.map(point => Array.isArray(point) ? { x: point[0], y: point[1] } : { x: point.x, y: point.y }); const design = points.map(point => [point.x, 1]); const observations = points.map(point => point.y); const result = core.leastSquares(design, observations, 1e-9);
    if (result.classification !== 'unique') return { ...result, points, slope: null, intercept: null, residualDotX: null, residualDotOne: null };
    return { ...result, points, slope: result.coefficients[0], intercept: result.coefficients[1], residualDotX: core.dot(result.residual, points.map(point => point.x)), residualDotOne: result.residual.reduce((sum, value) => sum + value, 0) };
  }
  function setPreset(name) { if (!presets[name]) return; state.points = copyPoints(presets[name]); state.preset = name; state.dragging = null; redraw(); }
  function metrics(canvas) { const rect = canvas.getBoundingClientRect(); const width = rect.width || canvas.width; const height = rect.height || canvas.height; const extent = Math.max(6, ...state.points.flatMap(point => [Math.abs(point.x), Math.abs(point.y)]) .map(value => value + 1)); return { width, height, extent, scale: Math.min(width, height) / (2 * extent), origin: { x: width / 2, y: height / 2 } }; }
  function canvasPoint(canvas, event) { const raw = event.touches ? event.touches[0] : event; const rect = canvas.getBoundingClientRect(); const { scale, origin } = metrics(canvas); return { x: (raw.clientX - rect.left - origin.x) / scale, y: (origin.y - (raw.clientY - rect.top)) / scale }; }
  function drawCanvas(data) {
    const canvas = byId('regressionCanvas'); if (!canvas) return; const { ctx, width, height } = root.LinAlgLab.canvas.setupHiDPI(canvas); const { scale, origin, extent } = metrics(canvas); const palette = root.LinAlgLab.canvas.getActivePalette();
    ctx.clearRect(0, 0, width, height); root.LinAlgLab.canvas.drawGrid(ctx, width, height, origin, scale, palette);
    if (data.classification === 'unique') {
      const x1 = -extent; const x2 = extent; const y1 = data.slope * x1 + data.intercept; const y2 = data.slope * x2 + data.intercept;
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(origin.x + x1 * scale, origin.y - y1 * scale); ctx.lineTo(origin.x + x2 * scale, origin.y - y2 * scale); ctx.stroke();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = palette.guide; ctx.lineWidth = 1.5;
      data.points.forEach((point, index) => { const fitted = data.fitted[index]; ctx.beginPath(); ctx.moveTo(origin.x + point.x * scale, origin.y - point.y * scale); ctx.lineTo(origin.x + point.x * scale, origin.y - fitted * scale); ctx.stroke(); }); ctx.setLineDash([]);
    }
    data.points.forEach((point, index) => { const active = state.dragging === index; ctx.fillStyle = active ? '#f59e0b' : '#06b6d4'; ctx.beginPath(); ctx.arc(origin.x + point.x * scale, origin.y - point.y * scale, active ? 8 : 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = palette.tick; ctx.font = '600 11px Inter, sans-serif'; ctx.fillText(`P${index + 1}`, origin.x + point.x * scale + 8, origin.y - point.y * scale - 8); });
  }
  function statusText(data) {
    const zh = language() === 'zh'; if (data.classification !== 'unique') return zh ? '拟合不唯一：所有点的 x 坐标相同，无法确定一条唯一的回归直线。' : 'Fit is not unique: identical x coordinates cannot determine one regression line.';
    return zh ? `残差正交性：Σrᵢ = ${format(data.residualDotOne)}，Σxᵢrᵢ = ${format(data.residualDotX)}。` : `Residual orthogonality: Σrᵢ = ${format(data.residualDotOne)}, Σxᵢrᵢ = ${format(data.residualDotX)}.`;
  }
  function redraw() {
    const data = calculate(); const zh = language() === 'zh'; const badge = byId('regressionBadge'); const model = byId('regressionModel');
    if (data.classification === 'unique') {
      model.textContent = `ŷ = ${format(data.slope)}x ${data.intercept >= 0 ? '+' : '−'} ${format(Math.abs(data.intercept))}`;
      byId('regressionSse').textContent = format(data.sse); byId('regressionR2').textContent = format(data.r2); byId('regressionNormalEquation').textContent = `[[${format(data.normalMatrix[0][0])}, ${format(data.normalMatrix[0][1])}], [${format(data.normalMatrix[1][0])}, ${format(data.normalMatrix[1][1])}]] [m, b]ᵀ = [${format(data.normalVector[0])}, ${format(data.normalVector[1])}]ᵀ`;
      badge.textContent = zh ? '最小二乘拟合' : 'Least-Squares Fit'; badge.style.cssText = 'background:rgba(16,185,129,.15);color:#10b981;border-color:rgba(16,185,129,.4)';
    } else {
      model.textContent = zh ? 'ŷ = 无唯一拟合' : 'ŷ = no unique fit'; byId('regressionSse').textContent = '—'; byId('regressionR2').textContent = '—'; byId('regressionNormalEquation').textContent = zh ? '法方程的系数矩阵秩不足。' : 'The normal-equation coefficient matrix is rank-deficient.';
      badge.textContent = zh ? '拟合不唯一' : 'Fit Not Unique'; badge.style.cssText = 'background:rgba(245,158,11,.15);color:#f59e0b;border-color:rgba(245,158,11,.4)';
    }
    byId('regressionStatus').textContent = statusText(data); document.querySelectorAll('[data-action="regression-preset"]').forEach(button => button.classList.toggle('active', button.dataset.preset === state.preset)); drawCanvas(data);
  }
  function initDrag() {
    const canvas = byId('regressionCanvas'); if (!canvas) return;
    const start = event => { const point = canvasPoint(canvas, event); const { scale } = metrics(canvas); const index = state.points.findIndex(candidate => Math.hypot(point.x - candidate.x, point.y - candidate.y) <= 12 / scale); if (index >= 0) { state.dragging = index; redraw(); } };
    const move = event => { if (state.dragging === null) return; event.preventDefault(); const point = canvasPoint(canvas, event); state.points[state.dragging] = { x: Math.max(-5, Math.min(5, Number(point.x.toFixed(2)))), y: Math.max(-5, Math.min(5, Number(point.y.toFixed(2)))) }; state.preset = 'custom'; redraw(); };
    const end = () => { if (state.dragging !== null) { state.dragging = null; redraw(); } };
    on(canvas, 'mousedown', start); on(canvas, 'mousemove', move); on(root, 'mouseup', end); on(canvas, 'touchstart', start, { passive: true }); on(canvas, 'touchmove', move, { passive: false }); on(root, 'touchend', end);
  }
  function init(nextContext) { destroy(); context = nextContext; initDrag(); document.querySelectorAll('[data-action="regression-preset"]').forEach(button => on(button, 'click', () => setPreset(button.dataset.preset))); redraw(); }
  function refresh() { redraw(); }
  function destroy() { cleanups.splice(0).forEach(remove => remove()); state.dragging = null; }
  const api = { id: 'regression', init, redraw, refresh, destroy, calculate, setPreset };
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (root.LinAlgLab && root.LinAlgLab.modules) root.LinAlgLab.modules.register(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
