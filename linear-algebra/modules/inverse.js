(function (root) {
  const core = root.LinAlgLab && root.LinAlgLab.matrix || (typeof module !== 'undefined' ? require('../core/matrix.js') : null);
  const identity = [[1, 0], [0, 1]];
  const unitSquare = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const presets = {
    identity: [[1, 0], [0, 1]],
    rotation: [[0, -1], [1, 0]],
    shear: [[1, 1.2], [0, 1]],
    reflection: [[1, 0], [0, -1]],
    singular: [[1, 1], [2, 2]]
  };
  const state = { matrix: presets.rotation.map(row => row.slice()), preset: 'rotation' };
  const inputIds = ['invA11', 'invA12', 'invA21', 'invA22'];
  const cleanups = [];
  let context;

  const byId = id => root.document && root.document.getElementById(id);
  const clone = matrix => matrix.map(row => row.slice());
  const language = () => context && context.state && context.state.lang || 'zh';
  const format = value => {
    const rounded = Number(value.toFixed(2));
    return Object.is(rounded, -0) ? 0 : rounded;
  };
  const on = (node, event, handler, options) => {
    if (!node) return;
    node.addEventListener(event, handler, options);
    cleanups.push(() => node.removeEventListener(event, handler, options));
  };

  function stage(id, matrix) {
    if (!matrix) return { id, matrix: null, basis: null, square: null };
    return {
      id,
      matrix: clone(matrix),
      basis: [[1, 0], [0, 1]].map(vector => core.multiplyVector(matrix, vector)),
      square: unitSquare.map(vector => core.multiplyVector(matrix, vector))
    };
  }

  function calculate({ matrix }) {
    const result = core.inverse2x2(matrix);
    const adjugate = [[result.matrix[1][1], -result.matrix[0][1]], [-result.matrix[1][0], result.matrix[0][0]]];
    const forwardVerification = result.inverse ? core.multiply(result.matrix, result.inverse) : null;
    const reverseVerification = result.inverse ? core.multiply(result.inverse, result.matrix) : null;
    return {
      ...result,
      adjugate,
      forwardVerification,
      reverseVerification,
      stages: [
        stage('identity', identity),
        stage('transformed', result.matrix),
        stage('recovered', reverseVerification)
      ]
    };
  }

  function syncInputs() {
    inputIds.forEach((id, index) => {
      const input = byId(id);
      if (!input) return;
      input.value = String(format(state.matrix[Math.floor(index / 2)][index % 2]));
      input.removeAttribute('aria-invalid');
      input.removeAttribute('title');
    });
  }

  function read() {
    const inputs = inputIds.map(byId);
    if (inputs.some(input => !input)) return;
    const values = inputs.map(input => input.value.trim() === '' ? NaN : Number(input.value));
    const valid = values.every(Number.isFinite);
    const invalidTitle = language() === 'zh' ? '请输入有限数值。' : 'Please enter a finite number.';
    inputs.forEach(input => {
      if (valid) {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('title');
      } else {
        input.setAttribute('aria-invalid', 'true');
        input.title = invalidTitle;
      }
    });
    if (!valid) return;
    state.matrix = [[values[0], values[1]], [values[2], values[3]]];
    state.preset = 'custom';
    redraw();
  }

  function applyPreset(name) {
    if (!presets[name]) return;
    state.matrix = clone(presets[name]);
    state.preset = name;
    syncInputs();
    redraw();
  }

  function matrixText(matrix) {
    return `[[${matrix[0].map(format).join(', ')}], [${matrix[1].map(format).join(', ')}]]`;
  }

  function updateText(data) {
    const zh = language() === 'zh';
    const badge = byId('inverseBadge');
    const determinant = byId('inverseDeterminant');
    const adjugate = byId('inverseAdjugate');
    const inverse = byId('inverseMatrix');
    const verification = byId('inverseVerification');
    const callout = byId('inverseCalloutText');
    const recovery = byId('inverseRecoveryState');
    const isInvertible = data.classification === 'invertible';

    if (badge) badge.textContent = isInvertible
      ? (zh ? `可逆矩阵（det = ${format(data.determinant)}）` : `Invertible (det = ${format(data.determinant)})`)
      : (zh ? '奇异矩阵（不可逆）' : 'Singular (not invertible)');
    if (determinant) determinant.textContent = `det(A) = ${format(data.determinant)}`;
    if (adjugate) adjugate.textContent = `[[d, −b], [−c, a]] = ${matrixText(data.adjugate)}`;
    if (inverse) inverse.textContent = isInvertible
      ? `A⁻¹ = ${matrixText(data.inverse)}`
      : (zh ? 'A⁻¹ 不存在' : 'A⁻¹ does not exist');
    if (verification) verification.textContent = isInvertible
      ? `AA⁻¹ = ${matrixText(data.forwardVerification)}；A⁻¹A = ${matrixText(data.reverseVerification)}`
      : (zh ? '无法构造 AA⁻¹ 或 A⁻¹A。' : 'AA⁻¹ and A⁻¹A cannot be formed.');
    if (recovery) recovery.textContent = isInvertible
      ? (zh ? '逆变换将单位方形恢复到原始位置。' : 'The inverse returns the unit square to its original position.')
      : (zh ? '变换将平面压缩到低维空间，无法唯一恢复。' : 'The transformation collapses the plane to a lower-dimensional space, so recovery is not unique.');
    if (callout) callout.textContent = isInvertible
      ? (zh ? '先应用 A，再应用 A⁻¹；复合结果回到单位变换 I。' : 'Apply A, then A⁻¹; the composition returns to the identity I.')
      : (zh ? 'det(A) = 0：至少一个方向被压缩，因而不存在撤销该变换的唯一矩阵。' : 'det(A) = 0: at least one direction is collapsed, so no unique matrix can undo the transformation.');
    root.document.querySelectorAll('[data-inverse-preset]').forEach(button => button.classList.toggle('active', button.dataset.inversePreset === state.preset));
  }

  function stageTitle(id) {
    const zh = language() === 'zh';
    if (id === 'identity') return zh ? '原平面 I' : 'Original I';
    if (id === 'transformed') return zh ? '应用 A' : 'Apply A';
    return zh ? '应用 A⁻¹ 后' : 'After A⁻¹';
  }

  function drawStage(ctx, rect, data, title, palette) {
    ctx.save();
    ctx.fillStyle = palette.background;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeStyle = palette.guide;
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x + .5, rect.y + .5, rect.width - 1, rect.height - 1);
    ctx.font = '600 12px Inter, sans-serif';
    ctx.fillStyle = palette.tick;
    ctx.fillText(title, rect.x + 10, rect.y + 16);
    if (!data.matrix) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = '600 12px Inter, sans-serif';
      ctx.fillText(language() === 'zh' ? '不可唯一恢复' : 'No unique recovery', rect.x + 10, rect.y + 40);
      ctx.restore();
      return;
    }

    const padding = 24;
    const titleHeight = 24;
    const view = { x: rect.x + padding, y: rect.y + titleHeight, width: rect.width - padding * 2, height: rect.height - titleHeight - 16 };
    const points = [...data.basis, ...data.square];
    const maxCoordinate = Math.max(2.5, ...points.flatMap(point => point.map(value => Math.abs(value))));
    const scale = Math.max(12, Math.min(view.width, view.height) / (maxCoordinate * 2.65));
    const origin = { x: view.x + view.width / 2, y: view.y + view.height / 2 };
    const point = vector => ({ x: origin.x + vector[0] * scale, y: origin.y - vector[1] * scale });
    const transformed = vector => core.multiplyVector(data.matrix, vector);
    ctx.beginPath();
    ctx.rect(view.x, view.y, view.width, view.height);
    ctx.clip();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let index = -5; index <= 5; index++) {
      [[point(transformed([index, -5])), point(transformed([index, 5]))], [point(transformed([-5, index])), point(transformed([5, index]))]].forEach(([from, to]) => {
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      });
    }
    ctx.strokeStyle = palette.axis;
    ctx.lineWidth = 1.4;
    [[[-5, 0], [5, 0]], [[0, -5], [0, 5]]].forEach(([from, to]) => {
      const start = point(transformed(from)); const end = point(transformed(to));
      ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    });
    const square = data.square.map(point);
    ctx.beginPath();
    square.forEach((value, index) => index ? ctx.lineTo(value.x, value.y) : ctx.moveTo(value.x, value.y));
    ctx.closePath();
    ctx.fillStyle = 'rgba(59,130,246,.25)'; ctx.fill();
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.stroke();
    root.LinAlgLab.canvas.drawVector(ctx, origin, data.basis[0], scale, '#06b6d4', 2.5, 'e₁');
    root.LinAlgLab.canvas.drawVector(ctx, origin, data.basis[1], scale, '#10b981', 2.5, 'e₂');
    ctx.restore();
  }

  function draw(data) {
    const canvas = byId('inverseCanvas');
    if (!canvas) return;
    const availableWidth = canvas.parentElement && canvas.parentElement.clientWidth || canvas.clientWidth || canvas.width;
    const vertical = availableWidth < 540;
    canvas.style.height = vertical ? `${Math.max(560, Math.round(availableWidth * 2.25))}px` : '';
    const { ctx, width, height } = root.LinAlgLab.canvas.setupHiDPI(canvas);
    const palette = root.LinAlgLab.canvas.getActivePalette();
    ctx.clearRect(0, 0, width, height);
    const gap = 10;
    const rectangles = vertical
      ? data.stages.map((_, index) => ({ x: 0, y: index * (height + gap) / 3, width, height: (height - gap * 2) / 3 }))
      : data.stages.map((_, index) => ({ x: index * (width + gap) / 3, y: 0, width: (width - gap * 2) / 3, height }));
    data.stages.forEach((item, index) => drawStage(ctx, rectangles[index], item, stageTitle(item.id), palette));
  }

  function redraw() {
    const data = calculate(state);
    updateText(data);
    draw(data);
  }

  function refresh() { redraw(); }

  function init(nextContext) {
    destroy();
    context = nextContext;
    inputIds.forEach(id => on(byId(id), 'input', read));
    root.document.querySelectorAll('[data-inverse-preset]').forEach(button => on(button, 'click', () => applyPreset(button.dataset.inversePreset)));
    if (typeof root.addEventListener === 'function') on(root, 'resize', redraw);
    syncInputs();
    redraw();
  }

  function destroy() {
    cleanups.splice(0).forEach(remove => remove());
    context = null;
  }

  const api = { id: 'inverse', init, redraw, refresh, destroy, calculate, applyPreset };
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (root.LinAlgLab && root.LinAlgLab.modules) root.LinAlgLab.modules.register(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
