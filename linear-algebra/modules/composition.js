(function (root) {
  const core = root.LinAlgLab && root.LinAlgLab.matrix || (typeof module !== 'undefined' ? require('../core/matrix.js') : null);
  const identity = [[1, 0], [0, 1]];
  const unitSquare = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const presets = {
    rotateShear: { A: [[0, -1], [1, 0]], B: [[1, 1], [0, 1]] },
    shearScale: { A: [[1, 1.2], [0, 1]], B: [[1.8, 0], [0, .6]] },
    nonCommuting: { A: [[2, 0], [0, 1]], B: [[1, 1], [0, 1]] },
    commutingScales: { A: [[2, 0], [0, .5]], B: [[.75, 0], [0, 1.5]] }
  };
  const state = { A: presets.rotateShear.A.map(row => row.slice()), B: presets.rotateShear.B.map(row => row.slice()), order: 'BA', preset: 'rotateShear' };
  const inputIds = { A: ['compA11', 'compA12', 'compA21', 'compA22'], B: ['compB11', 'compB12', 'compB21', 'compB22'] };
  let context;
  const cleanups = [];
  const byId = id => root.document && root.document.getElementById(id);
  const clone = matrix => matrix.map(row => row.slice());
  const format = value => Number(value.toFixed(2));
  const language = () => context && context.state && context.state.lang || 'zh';
  const on = (node, event, handler, options) => {
    if (!node) return;
    node.addEventListener(event, handler, options);
    cleanups.push(() => node.removeEventListener(event, handler, options));
  };

  function assert2x2(matrix, name) {
    if (!Array.isArray(matrix) || matrix.length !== 2 || matrix.some(row => !Array.isArray(row) || row.length !== 2)) throw new RangeError(`${name} must be a 2×2 matrix.`);
    matrix.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
      if (!Number.isFinite(value)) throw new RangeError(`${name}[${rowIndex}][${columnIndex}] must be a finite number.`);
    }));
    return clone(matrix);
  }

  function stage(id, matrix) {
    return {
      id,
      matrix: clone(matrix),
      basis: [[1, 0], [0, 1]].map(vector => core.multiplyVector(matrix, vector)),
      square: unitSquare.map(vector => core.multiplyVector(matrix, vector))
    };
  }

  function calculate({ A, B, order = 'BA' }) {
    const sourceA = assert2x2(A, 'A');
    const sourceB = assert2x2(B, 'B');
    if (order !== 'BA' && order !== 'AB') throw new RangeError('order must be either BA or AB.');
    const first = order === 'BA' ? sourceA : sourceB;
    const second = order === 'BA' ? sourceB : sourceA;
    const product = core.multiply(second, first);
    const firstName = order === 'BA' ? 'A' : 'B';
    const secondName = order === 'BA' ? 'B' : 'A';
    const entryCalculations = product.flatMap((resultRow, row) => resultRow.map((total, column) => {
      const leftRow = second[row].slice();
      const rightColumn = first.map(sourceRow => sourceRow[column]);
      const terms = leftRow.map((left, index) => ({ left, right: rightColumn[index], product: left * rightColumn[index] }));
      return { row, column, leftRow, rightColumn, terms, total };
    }));
    return {
      order,
      A: sourceA,
      B: sourceB,
      first: clone(first),
      second: clone(second),
      product,
      firstName,
      secondName,
      entryCalculations,
      stages: [stage('identity', identity), stage(firstName, first), stage(order, product)]
    };
  }

  function syncInputs() {
    ['A', 'B'].forEach(name => inputIds[name].forEach((id, index) => {
      const input = byId(id);
      if (input) {
        input.value = String(format(state[name][Math.floor(index / 2)][index % 2]));
        input.removeAttribute('aria-invalid');
        input.removeAttribute('title');
      }
    }));
  }

  function readMatrix(name) {
    const inputs = inputIds[name].map(byId);
    if (inputs.some(input => !input)) return null;
    const values = inputs.map(input => input.value.trim() === '' ? NaN : Number(input.value));
    const valid = values.every(Number.isFinite);
    inputs.forEach(input => {
      if (valid) {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('title');
      } else {
        input.setAttribute('aria-invalid', 'true');
        input.title = 'Please enter a finite number.';
      }
    });
    return valid ? [[values[0], values[1]], [values[2], values[3]]] : null;
  }

  function read() {
    const A = readMatrix('A');
    const B = readMatrix('B');
    if (!A || !B) return;
    state.A = A;
    state.B = B;
    state.preset = 'custom';
    redraw();
  }

  function applyPreset(name) {
    if (!presets[name]) return;
    state.A = clone(presets[name].A);
    state.B = clone(presets[name].B);
    state.preset = name;
    syncInputs();
    redraw();
  }

  function setOrder(order) {
    if (order !== 'BA' && order !== 'AB') return;
    state.order = order;
    redraw();
  }

  function matrixText(matrix) {
    return `[[${matrix[0].map(format).join(', ')}], [${matrix[1].map(format).join(', ')}]]`;
  }

  function matrixCardMarkup(name, matrix, result = false) {
    return `<div class="composition-matrix-card${result ? ' result' : ''}"><strong>${name}</strong><div class="composition-matrix-value"><span>${format(matrix[0][0])}</span><span>${format(matrix[0][1])}</span><span>${format(matrix[1][0])}</span><span>${format(matrix[1][1])}</span></div></div>`;
  }

  function updateDerivation(data) {
    const zh = language() === 'zh';
    const equation = byId('compositionEquation');
    const flow = byId('compositionMatrixFlow');
    const entries = byId('compositionEntryCalculations');
    const basisLink = byId('compositionBasisLink');
    if (equation) equation.textContent = `${data.order} = ${data.secondName} × ${data.firstName}`;
    if (flow) {
      const leftLabel = zh ? `左矩阵 ${data.secondName}` : `Left ${data.secondName}`;
      const rightLabel = zh ? `右矩阵 ${data.firstName}` : `Right ${data.firstName}`;
      const resultLabel = zh ? `结果 ${data.order}` : `Result ${data.order}`;
      flow.innerHTML = `${matrixCardMarkup(leftLabel, data.second)}<span class="composition-matrix-operator">×</span>${matrixCardMarkup(rightLabel, data.first)}<span class="composition-matrix-operator">=</span>${matrixCardMarkup(resultLabel, data.product, true)}`;
    }
    if (entries) {
      entries.innerHTML = data.entryCalculations.map(entry => {
        const terms = entry.terms.map(term => `${format(term.left)} × ${format(term.right)}`).join(' + ');
        return `<div class="composition-entry"><strong>c${entry.row + 1}${entry.column + 1}</strong> = ${terms} = <strong>${format(entry.total)}</strong></div>`;
      }).join('');
    }
    if (basisLink) {
      const firstColumn = `[${format(data.product[0][0])}, ${format(data.product[1][0])}]`;
      const secondColumn = `[${format(data.product[0][1])}, ${format(data.product[1][1])}]`;
      basisLink.textContent = zh
        ? `${data.order} 的第 1、2 列分别是最终基向量 ${data.order}e₁ = ${firstColumn}、${data.order}e₂ = ${secondColumn}。`
        : `Columns 1 and 2 of ${data.order} are the final basis vectors: ${data.order}e₁ = ${firstColumn}, ${data.order}e₂ = ${secondColumn}.`;
    }
  }

  function updateText(data) {
    const zh = language() === 'zh';
    const badge = byId('compositionBadge');
    const product = byId('compositionProduct');
    const callout = byId('compositionCalloutText');
    if (badge) badge.textContent = data.order === 'BA' ? 'A → B = BA' : 'B → A = AB';
    if (product) product.textContent = `${data.order} = ${matrixText(data.product)}`;
    if (callout) {
      callout.textContent = zh
        ? `从右向左读：先作用 ${data.firstName}，再作用 ${data.secondName}，所以结果矩阵是 ${data.order}。`
        : `Read right to left: ${data.firstName} acts first, then ${data.secondName}, so the result is ${data.order}.`;
    }
    updateDerivation(data);
    root.document.querySelectorAll('[data-composition-order]').forEach(button => button.classList.toggle('active', button.dataset.compositionOrder === state.order));
    root.document.querySelectorAll('[data-composition-preset]').forEach(button => button.classList.toggle('active', button.dataset.compositionPreset === state.preset));
  }

  function stageTitle(stageId, data) {
    const zh = language() === 'zh';
    if (stageId === 'identity') return zh ? '原平面 I' : 'Original I';
    if (stageId === data.firstName) return zh ? `先应用 ${data.firstName}` : `Apply ${data.firstName} first`;
    return zh ? `复合结果 ${data.order}` : `Composite ${data.order}`;
  }

  function drawStage(ctx, rect, stageData, title, palette) {
    const padding = 24;
    const titleHeight = 24;
    const view = { x: rect.x + padding, y: rect.y + titleHeight, width: rect.width - padding * 2, height: rect.height - titleHeight - 16 };
    const points = [...stageData.basis, ...stageData.square];
    const maxCoordinate = Math.max(2.5, ...points.flatMap(point => point.map(value => Math.abs(value))));
    const scale = Math.max(12, Math.min(view.width, view.height) / (maxCoordinate * 2.65));
    const origin = { x: view.x + view.width / 2, y: view.y + view.height / 2 };
    const point = vector => ({ x: origin.x + vector[0] * scale, y: origin.y - vector[1] * scale });
    const transformed = vector => core.multiplyVector(stageData.matrix, vector);

    ctx.save();
    ctx.fillStyle = palette.background;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeStyle = palette.guide;
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x + .5, rect.y + .5, rect.width - 1, rect.height - 1);
    ctx.beginPath();
    ctx.rect(view.x, view.y, view.width, view.height);
    ctx.clip();

    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let index = -5; index <= 5; index++) {
      const verticalStart = point(transformed([index, -5]));
      const verticalEnd = point(transformed([index, 5]));
      const horizontalStart = point(transformed([-5, index]));
      const horizontalEnd = point(transformed([5, index]));
      [[verticalStart, verticalEnd], [horizontalStart, horizontalEnd]].forEach(([start, end]) => {
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
      });
    }
    ctx.strokeStyle = palette.axis;
    ctx.lineWidth = 1.4;
    [[[-5, 0], [5, 0]], [[0, -5], [0, 5]]].forEach(([start, end]) => {
      const from = point(transformed(start)); const to = point(transformed(end));
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    });

    const square = stageData.square.map(point);
    ctx.beginPath();
    square.forEach((value, index) => index ? ctx.lineTo(value.x, value.y) : ctx.moveTo(value.x, value.y));
    ctx.closePath();
    ctx.fillStyle = 'rgba(59,130,246,.25)'; ctx.fill();
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.stroke();
    root.LinAlgLab.canvas.drawVector(ctx, origin, stageData.basis[0], scale, '#06b6d4', 2.5, 'e₁');
    root.LinAlgLab.canvas.drawVector(ctx, origin, stageData.basis[1], scale, '#10b981', 2.5, 'e₂');
    ctx.restore();

    ctx.font = '600 12px Inter, sans-serif';
    ctx.fillStyle = palette.tick;
    ctx.fillText(title, rect.x + 10, rect.y + 16);
  }

  function draw(data) {
    const canvas = byId('compositionCanvas');
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
    data.stages.forEach((item, index) => drawStage(ctx, rectangles[index], item, stageTitle(item.id, data), palette));
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
    ['A', 'B'].forEach(name => inputIds[name].forEach(id => on(byId(id), 'input', read)));
    root.document.querySelectorAll('[data-composition-order]').forEach(button => on(button, 'click', () => setOrder(button.dataset.compositionOrder)));
    root.document.querySelectorAll('[data-composition-preset]').forEach(button => on(button, 'click', () => applyPreset(button.dataset.compositionPreset)));
    if (typeof root.addEventListener === 'function') on(root, 'resize', redraw);
    syncInputs();
    redraw();
  }

  function destroy() {
    cleanups.splice(0).forEach(remove => remove());
    context = null;
  }

  const api = { id: 'composition', init, redraw, refresh, destroy, calculate, applyPreset, setOrder };
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (root.LinAlgLab && root.LinAlgLab.modules) root.LinAlgLab.modules.register(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
