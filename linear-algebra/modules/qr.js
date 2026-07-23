(function (root) {
  const core = root.LinAlgLab && root.LinAlgLab.matrix || (typeof module !== 'undefined' ? require('../core/matrix.js') : null);
  const presets = {
    default: { u: [3, 1], v: [1, 3] },
    orthogonal: { u: [3, 0], v: [0, 2] },
    dependent: { u: [2, 1], v: [4, 2] }
  };
  const state = { u: presets.default.u.slice(), v: presets.default.v.slice(), preset: 'default', step: 0, dragging: null, autoTimer: null };
  let context;
  const cleanups = [];
  const byId = id => document.getElementById(id);
  const on = (node, event, handler, options) => {
    if (!node) return;
    node.addEventListener(event, handler, options);
    cleanups.push(() => node.removeEventListener(event, handler, options));
  };
  const format = value => Math.abs(value) < 1e-9 ? '0' : Number(value.toFixed(3)).toString();
  const vectorText = vector => vector ? `[${vector.map(format).join(', ')}]` : '—';
  const matrixText = matrix => matrix ? `[[${matrix[0].map(format).join(', ')}], [${matrix[1].map(format).join(', ')}]]` : '—';
  const language = () => context && context.state && context.state.lang || 'zh';
  const maxStep = 3;

  function calculate(next = state) {
    const matrix = Array.isArray(next) ? next : next.matrix || [[next.u[0], next.v[0]], [next.u[1], next.v[1]]];
    return core.qr2x2(matrix, 1e-9);
  }

  function clearAuto() {
    if (state.autoTimer !== null) root.clearInterval(state.autoTimer);
    state.autoTimer = null;
  }

  function syncControls() {
    const values = { qru: state.u, qrv: state.v };
    Object.entries(values).forEach(([prefix, vector]) => {
      ['x', 'y'].forEach((axis, index) => {
        const slider = byId(`${prefix}${axis.toUpperCase()}Slider`);
        const value = byId(`${prefix}${axis.toUpperCase()}Val`);
        if (slider) slider.value = vector[index];
        if (value) value.textContent = vector[index].toFixed(1);
      });
    });
  }

  function updateVector(name, vector) {
    state[name] = vector.map(value => Math.max(-4, Math.min(4, Number(value.toFixed(1)))));
    state.preset = 'custom';
    state.step = 0;
    clearAuto();
    syncControls();
    redraw();
  }

  function read() {
    const next = {
      u: [Number(byId('qruXSlider').value), Number(byId('qruYSlider').value)],
      v: [Number(byId('qrvXSlider').value), Number(byId('qrvYSlider').value)]
    };
    updateVector('u', next.u);
    state.v = next.v.map(value => Math.max(-4, Math.min(4, Number(value.toFixed(1)))));
    syncControls();
    redraw();
  }

  function setPreset(name) {
    if (!presets[name]) return;
    clearAuto();
    state.u = presets[name].u.slice();
    state.v = presets[name].v.slice();
    state.preset = name;
    state.step = 0;
    state.dragging = null;
    syncControls();
    redraw();
  }

  function nextStep() {
    clearAuto();
    state.step = Math.min(maxStep, state.step + 1);
    redraw();
  }

  function resetSteps() {
    clearAuto();
    state.step = 0;
    redraw();
  }

  function autoComplete() {
    clearAuto();
    if (state.step >= maxStep) state.step = 0;
    redraw();
    state.autoTimer = root.setInterval(() => {
      state.step = Math.min(maxStep, state.step + 1);
      redraw();
      if (state.step >= maxStep) clearAuto();
    }, 750);
  }

  function statusText(data) {
    const zh = language() === 'zh';
    if (data.classification !== 'independent') {
      if (data.reason === 'first-vector-zero') return zh ? '无法开始：第一个向量为零，不能归一化得到 q₁。' : 'Cannot start: the first vector is zero, so q₁ cannot be normalized.';
      return zh ? '线性相关：第二个正交残差为零，无法得到完整的二维标准正交基。' : 'Linearly dependent: the second orthogonal residual is zero, so no full 2D orthonormal basis exists.';
    }
    const messages = [
      zh ? '第 0 步：把 u 和 v 作为矩阵 A 的两列。' : 'Step 0: use u and v as the two columns of A.',
      zh ? `第 1 步：归一化 u，得到 q₁ = u / ‖u‖。` : 'Step 1: normalize u to obtain q₁ = u / ‖u‖.',
      zh ? '第 2 步：从 v 减去它在 q₁ 上的投影，得到与 q₁ 正交的残差 u₂。' : 'Step 2: subtract the projection of v onto q₁ to obtain the orthogonal residual u₂.',
      zh ? '第 3 步：归一化 u₂ 得到 q₂，并组装 A = QR。' : 'Step 3: normalize u₂ to obtain q₂, then assemble A = QR.'
    ];
    return messages[state.step];
  }

  function drawCanvas(data) {
    const canvas = byId('qrCanvas');
    if (!canvas) return;
    const { ctx, width, height } = root.LinAlgLab.canvas.setupHiDPI(canvas);
    const origin = { x: width / 2, y: height / 2 };
    const scale = Math.min(width, height) / 12;
    const palette = root.LinAlgLab.canvas.getActivePalette();
    ctx.clearRect(0, 0, width, height);
    root.LinAlgLab.canvas.drawGrid(ctx, width, height, origin, scale, palette);
    root.LinAlgLab.canvas.drawVector(ctx, origin, state.u, scale, '#3b82f6', 3.5, 'u');
    root.LinAlgLab.canvas.drawVector(ctx, origin, state.v, scale, '#f59e0b', 3.5, 'v');
    if (state.step >= 1 && data.q1) root.LinAlgLab.canvas.drawVector(ctx, origin, data.q1, scale, '#06b6d4', 3, 'q₁');
    if (state.step >= 2 && data.projection) {
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = palette.guide;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(origin.x + data.projection[0] * scale, origin.y - data.projection[1] * scale);
      ctx.lineTo(origin.x + state.v[0] * scale, origin.y - state.v[1] * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      root.LinAlgLab.canvas.drawVector(ctx, origin, data.projection, scale, '#10b981', 3, 'proj');
      root.LinAlgLab.canvas.drawVector(ctx, { x: origin.x + data.projection[0] * scale, y: origin.y - data.projection[1] * scale }, data.residual, scale, '#f43f5e', 3, 'u₂');
    }
    if (state.step >= 3 && data.q2) root.LinAlgLab.canvas.drawVector(ctx, origin, data.q2, scale, '#8b5cf6', 3, 'q₂');
  }

  function redraw() {
    const data = calculate();
    const zh = language() === 'zh';
    const badge = byId('qrBadge');
    if (!badge) return;
    const r11 = data.q1 ? core.norm(data.u) : null;
    const r12 = data.q1 ? core.dot(data.q1, data.v) : null;
    const r22 = data.residual ? core.norm(data.residual) : null;
    byId('qrNormU').textContent = r11 === null ? '—' : format(r11);
    byId('qrProjectionCoeff').textContent = r12 === null ? '—' : format(r12);
    byId('qrResidualNorm').textContent = r22 === null ? '—' : format(r22);
    byId('qrQtQ').textContent = matrixText(data.orthogonality);
    byId('qrR').textContent = matrixText(data.R);
    byId('qrReconstruction').textContent = data.reconstruction ? matrixText(data.reconstruction) : (zh ? '无完整 QR 分解' : 'No full QR factorization');
    byId('qrStatus').textContent = statusText(data);
    badge.textContent = data.classification === 'independent' ? (zh ? `QR：第 ${state.step} 步 / 3` : `QR: Step ${state.step} / 3`) : (zh ? '秩亏：无法完成 QR' : 'Rank Deficient');
    badge.style.cssText = data.classification === 'independent'
      ? 'background:rgba(6,182,212,.15);color:#06b6d4;border-color:rgba(6,182,212,.4)'
      : 'background:rgba(245,158,11,.15);color:#f59e0b;border-color:rgba(245,158,11,.4)';
    document.querySelectorAll('[data-action="qr-preset"]').forEach(button => button.classList.toggle('active', button.dataset.preset === state.preset));
    byId('qrNextBtn').disabled = state.step >= maxStep;
    drawCanvas(data);
  }

  function canvasPoint(canvas, event) {
    const raw = event.touches ? event.touches[0] : event;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width || canvas.width, rect.height || canvas.height) / 12;
    return { x: (raw.clientX - rect.left - rect.width / 2) / scale, y: (rect.height / 2 - (raw.clientY - rect.top)) / scale };
  }

  function initDrag() {
    const canvas = byId('qrCanvas');
    if (!canvas) return;
    const start = event => {
      const point = canvasPoint(canvas, event);
      if (Math.hypot(point.x - state.u[0], point.y - state.u[1]) < 0.55) state.dragging = 'u';
      else if (Math.hypot(point.x - state.v[0], point.y - state.v[1]) < 0.55) state.dragging = 'v';
    };
    const move = event => {
      if (!state.dragging) return;
      event.preventDefault();
      const point = canvasPoint(canvas, event);
      updateVector(state.dragging, [point.x, point.y]);
    };
    const end = () => { if (state.dragging) { state.dragging = null; redraw(); } };
    on(canvas, 'mousedown', start); on(canvas, 'mousemove', move); on(root, 'mouseup', end);
    on(canvas, 'touchstart', start, { passive: true }); on(canvas, 'touchmove', move, { passive: false }); on(root, 'touchend', end);
  }

  function init(nextContext) {
    destroy();
    context = nextContext;
    ['qruXSlider', 'qruYSlider', 'qrvXSlider', 'qrvYSlider'].map(byId).forEach(node => on(node, 'input', read));
    document.querySelectorAll('[data-action="qr-preset"]').forEach(button => on(button, 'click', () => setPreset(button.dataset.preset)));
    on(byId('qrNextBtn'), 'click', nextStep);
    on(byId('qrAutoBtn'), 'click', autoComplete);
    on(byId('qrResetBtn'), 'click', resetSteps);
    initDrag();
    syncControls();
    redraw();
  }

  function refresh() { redraw(); }
  function destroy() { clearAuto(); cleanups.splice(0).forEach(remove => remove()); state.dragging = null; }
  const api = { id: 'qr', init, redraw, refresh, destroy, calculate, setPreset };
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (root.LinAlgLab && root.LinAlgLab.modules) root.LinAlgLab.modules.register(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
