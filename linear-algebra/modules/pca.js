(function (root) {
  const core = root.LinAlgLab && root.LinAlgLab.matrix || (typeof module !== 'undefined' ? require('../core/matrix.js') : null);
  const presets = {
    default: [[-4, -3.1], [-2.6, -1.7], [-1, -0.9], [0.8, 0.5], [2.5, 2.1], [4, 3.4]],
    horizontal: [[-4, -0.4], [-2.4, 0.2], [-0.8, -0.1], [1, 0.3], [2.6, -0.2], [4, 0.1]],
    vertical: [[-0.3, -4], [0.2, -2.4], [-0.1, -0.8], [0.3, 1], [-0.2, 2.5], [0.1, 4]],
    outlier: [[-4, -3], [-2.2, -1.3], [-0.7, 0.1], [1, 1.8], [2.4, 2.9], [4, -2.8]],
    zero: [[1.2, -0.8], [1.200001, -0.799999], [1.199999, -0.800001], [1.2, -0.8], [1.200001, -0.8], [1.199999, -0.8]]
  };
  const state = { points: presets.default.map(([x, y]) => ({ x, y })), preset: 'default', dragging: null };
  let context;
  const cleanups = [];
  const byId = id => document.getElementById(id);
  const on = (node, event, handler, options) => {
    if (!node) return;
    node.addEventListener(event, handler, options);
    cleanups.push(() => node.removeEventListener(event, handler, options));
  };
  const language = () => context && context.state && context.state.lang || 'zh';
  const format = value => Math.abs(value) < 1e-9 ? '0' : Number(value.toFixed(3)).toString();
  const pointArray = points => points.map(point => Array.isArray(point) ? point.slice() : [point.x, point.y]);
  const matrixText = matrix => `[[${matrix[0].map(format).join(', ')}], [${matrix[1].map(format).join(', ')}]]`;
  const vectorText = vector => `[${vector.map(format).join(', ')}]`;

  function calculate(next = state) {
    const points = pointArray(next.points || next);
    return core.pca2d(points, 1e-9);
  }

  function setPreset(name) {
    if (!presets[name]) return;
    state.points = presets[name].map(([x, y]) => ({ x, y }));
    state.preset = name;
    state.dragging = null;
    redraw();
  }

  function metrics(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width;
    const height = rect.height || canvas.height;
    const chartHeight = Math.max(220, height - 72);
    const extent = Math.max(5, ...state.points.flatMap(point => [Math.abs(point.x), Math.abs(point.y)]).map(value => value + 1));
    return { width, height, chartHeight, extent, scale: Math.min(width, chartHeight) / (2 * extent), origin: { x: width / 2, y: chartHeight / 2 } };
  }

  function canvasPoint(canvas, event) {
    const raw = event.touches ? event.touches[0] : event;
    const rect = canvas.getBoundingClientRect();
    const { scale, origin } = metrics(canvas);
    return { x: (raw.clientX - rect.left - origin.x) / scale, y: (origin.y - (raw.clientY - rect.top)) / scale };
  }

  function toCanvas(point, metricsData) {
    return { x: metricsData.origin.x + point[0] * metricsData.scale, y: metricsData.origin.y - point[1] * metricsData.scale };
  }

  function drawPoint(ctx, position, color, radius = 6) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCanvas(data) {
    const canvas = byId('pcaCanvas');
    if (!canvas) return;
    const { ctx, width, height } = root.LinAlgLab.canvas.setupHiDPI(canvas);
    const chart = metrics(canvas);
    const palette = root.LinAlgLab.canvas.getActivePalette();
    const zh = language() === 'zh';
    ctx.clearRect(0, 0, width, height);
    root.LinAlgLab.canvas.drawGrid(ctx, width, chart.chartHeight, chart.origin, chart.scale, palette);

    if (data.classification !== 'zero-variance') {
      const mean = toCanvas(data.mean, chart);
      const axisLength = chart.extent * 0.9;
      [[data.components[0], '#06b6d4', 'PC₁'], [data.components[1], '#ec4899', 'PC₂']].forEach(([component, color, label]) => {
        const left = toCanvas([data.mean[0] - component[0] * axisLength, data.mean[1] - component[1] * axisLength], chart);
        const right = toCanvas([data.mean[0] + component[0] * axisLength, data.mean[1] + component[1] * axisLength], chart);
        ctx.setLineDash([7, 5]); ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(left.x, left.y); ctx.lineTo(right.x, right.y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = color; ctx.font = '600 12px Inter, sans-serif'; ctx.fillText(label, right.x + 5, right.y - 5);
      });
      data.points.forEach((point, index) => {
        const source = toCanvas(point, chart); const projection = toCanvas(data.projected[index], chart);
        ctx.setLineDash([4, 4]); ctx.strokeStyle = palette.guide; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(source.x, source.y); ctx.lineTo(projection.x, projection.y); ctx.stroke(); ctx.setLineDash([]);
        drawPoint(ctx, projection, '#10b981', 4);
      });
      drawPoint(ctx, mean, '#f59e0b', 7);
      ctx.fillStyle = '#f59e0b'; ctx.font = '600 12px Inter, sans-serif'; ctx.fillText(zh ? '均值 μ' : 'mean μ', mean.x + 9, mean.y - 9);
    }
    data.points.forEach((point, index) => {
      const position = toCanvas(point, chart);
      drawPoint(ctx, position, state.dragging === index ? '#f59e0b' : '#3b82f6', state.dragging === index ? 8 : 6);
      ctx.fillStyle = palette.tick; ctx.font = '600 11px Inter, sans-serif'; ctx.fillText(`P${index + 1}`, position.x + 8, position.y - 8);
    });

    const stripY = height - 31;
    ctx.strokeStyle = palette.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(22, stripY); ctx.lineTo(width - 22, stripY); ctx.stroke();
    ctx.fillStyle = palette.tick; ctx.font = '600 11px Inter, sans-serif'; ctx.fillText(zh ? '降维到 PC₁（1D）' : 'Projected onto PC₁ (1D)', 22, height - 50);
    if (data.scores) {
      data.scores.forEach((score, index) => {
        const x = Math.max(28, Math.min(width - 28, width / 2 + score[0] * chart.scale));
        drawPoint(ctx, { x, y: stripY }, '#10b981', 5);
        ctx.fillStyle = palette.tick; ctx.font = '600 10px Inter, sans-serif'; ctx.fillText(`P${index + 1}`, x - 7, stripY + 18);
      });
    }
  }

  function statusText(data) {
    const zh = language() === 'zh';
    if (data.classification === 'zero-variance') return zh ? '所有点重合，协方差为零；没有可区分的主方向。' : 'All points coincide, so covariance is zero and no principal direction can be distinguished.';
    if (data.classification === 'isotropic') return zh ? '两个方向的方差相同；PC₁ 可取当前显示的任一正交方向。' : 'Variance is equal in both directions; PC₁ may be any orthogonal direction, including the one shown.';
    return zh ? `PC₁ 保留 ${(data.explainedVariance[0] * 100).toFixed(1)}% 的总方差；绿色点是二维数据在 PC₁ 上的一维投影。` : `PC₁ retains ${(data.explainedVariance[0] * 100).toFixed(1)}% of total variance; green points are the 1D projections of the 2D data.`;
  }

  function redraw() {
    const data = calculate(); const zh = language() === 'zh'; const badge = byId('pcaBadge');
    if (!badge) return;
    byId('pcaMean').textContent = vectorText(data.mean);
    byId('pcaCovariance').textContent = matrixText(data.covariance);
    byId('pcaEigenvalues').textContent = `λ₁ = ${format(data.eigenvalues[0])}, λ₂ = ${format(data.eigenvalues[1])}`;
    byId('pcaExplained').textContent = data.classification === 'zero-variance' ? '—' : `${(data.explainedVariance[0] * 100).toFixed(1)}% / ${(data.explainedVariance[1] * 100).toFixed(1)}%`;
    byId('pcaDirection').textContent = data.components ? vectorText(data.components[0]) : '—';
    byId('pcaStatus').textContent = statusText(data);
    badge.textContent = data.classification === 'zero-variance' ? (zh ? '零方差' : 'Zero Variance') : (zh ? 'PCA：2D → 1D' : 'PCA: 2D → 1D');
    badge.style.cssText = data.classification === 'zero-variance'
      ? 'background:rgba(245,158,11,.15);color:#f59e0b;border-color:rgba(245,158,11,.4)'
      : 'background:rgba(6,182,212,.15);color:#06b6d4;border-color:rgba(6,182,212,.4)';
    document.querySelectorAll('[data-action="pca-preset"]').forEach(button => button.classList.toggle('active', button.dataset.preset === state.preset));
    drawCanvas(data);
  }

  function initDrag() {
    const canvas = byId('pcaCanvas');
    if (!canvas) return;
    const start = event => {
      const point = canvasPoint(canvas, event); const { scale } = metrics(canvas);
      const index = state.points.findIndex(candidate => Math.hypot(point.x - candidate.x, point.y - candidate.y) <= 12 / scale);
      if (index >= 0) { state.dragging = index; redraw(); }
    };
    const move = event => {
      if (state.dragging === null) return;
      event.preventDefault();
      const point = canvasPoint(canvas, event);
      state.points[state.dragging] = { x: Math.max(-5, Math.min(5, Number(point.x.toFixed(2)))), y: Math.max(-5, Math.min(5, Number(point.y.toFixed(2)))) };
      state.preset = 'custom'; redraw();
    };
    const end = () => { if (state.dragging !== null) { state.dragging = null; redraw(); } };
    on(canvas, 'mousedown', start); on(canvas, 'mousemove', move); on(root, 'mouseup', end);
    on(canvas, 'touchstart', start, { passive: true }); on(canvas, 'touchmove', move, { passive: false }); on(root, 'touchend', end);
  }

  function init(nextContext) {
    destroy(); context = nextContext; initDrag();
    document.querySelectorAll('[data-action="pca-preset"]').forEach(button => on(button, 'click', () => setPreset(button.dataset.preset)));
    redraw();
  }
  function refresh() { redraw(); }
  function destroy() { cleanups.splice(0).forEach(remove => remove()); state.dragging = null; }
  const api = { id: 'pca', init, redraw, refresh, destroy, calculate, setPreset };
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (root.LinAlgLab && root.LinAlgLab.modules) root.LinAlgLab.modules.register(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
