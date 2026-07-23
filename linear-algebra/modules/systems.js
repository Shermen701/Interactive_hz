(function (root) {
  const core = root.LinAlgLab && root.LinAlgLab.matrix || (typeof module !== 'undefined' ? require('../core/matrix.js') : null);
  const defaults = { A: [[1, 1], [2, -1]], b: [3, 0] };
  const presets = {
    unique: { A: [[1, 1], [2, -1]], b: [3, 0] },
    inconsistent: { A: [[1, 1], [1, 1]], b: [2, 4] },
    infinite: { A: [[1, 1], [2, 2]], b: [2, 4] }
  };
  const state = { A: defaults.A.map(row => row.slice()), b: defaults.b.slice(), step: 0 };
  let context; const cleanups = []; const byId = id => document.getElementById(id);
  const on = (node, event, handler) => { if (!node) return; node.addEventListener(event, handler); cleanups.push(() => node.removeEventListener(event, handler)); };
  const copy = source => ({ A: source.A.map(row => row.slice()), b: source.b.slice() });
  const format = value => Math.abs(value) < 1e-9 ? '0' : Number(value.toFixed(3)).toString();
  const language = () => context && context.state && context.state.lang || 'zh';
  function calculate(next = state) {
    const A = next.A || [[next.a, next.b], [next.c, next.d]];
    const vector = next.b && Array.isArray(next.b) ? next.b : [next.e, next.f];
    return core.solveLinearSystem(A, vector, 1e-9);
  }
  function syncInputs() {
    [['sysA', 0, 0], ['sysB', 0, 1], ['sysC', 1, 0], ['sysD', 1, 1], ['sysE', 0], ['sysF', 1]].forEach(([id, row, column]) => {
      const input = byId(id); if (input) input.value = column === undefined ? state.b[row] : state.A[row][column];
    });
  }
  function read() {
    const values = ['sysA', 'sysB', 'sysC', 'sysD', 'sysE', 'sysF'].map(id => {
      const raw = byId(id).value.trim(); return raw === '' ? NaN : Number(raw);
    });
    if (values.some(value => !Number.isFinite(value))) return;
    state.A = [[values[0], values[1]], [values[2], values[3]]]; state.b = [values[4], values[5]]; state.step = 0; redraw();
  }
  function setPreset(name) { if (!presets[name]) return; const next = copy(presets[name]); state.A = next.A; state.b = next.b; state.step = 0; syncInputs(); redraw(); }
  function currentMatrix(result) { return state.step === 0 ? result.augmented : result.steps[Math.min(state.step, result.steps.length) - 1].matrix; }
  function renderMatrix(matrix) {
    return `<table class="system-matrix">${matrix.map(row => `<tr>${row.map((value, index) => `<td class="${index === 2 ? 'augmented-column' : ''}">${format(value)}</td>`).join('')}</tr>`).join('')}</table>`;
  }
  function operationText(step) {
    const zh = language() === 'zh'; if (!step) return zh ? '初始增广矩阵' : 'Initial augmented matrix';
    const row = step.row + 1;
    if (step.type === 'swap') return `R${row} ↔ R${step.otherRow + 1}`;
    if (step.type === 'scale') return `R${row} ← ${format(step.factor)}R${row}`;
    return `R${row} ← R${row} ${step.factor >= 0 ? '+' : '−'} ${format(Math.abs(step.factor))}R${step.sourceRow + 1}`;
  }
  function classificationText(result) {
    const zh = language() === 'zh';
    if (result.classification === 'unique') return zh ? `唯一解：x = ${format(result.solution[0])}，y = ${format(result.solution[1])}` : `Unique solution: x = ${format(result.solution[0])}, y = ${format(result.solution[1])}`;
    if (result.classification === 'infinite') return zh ? '无穷多解：方程约束线性相关，存在无穷多个满足条件的点。' : 'Infinitely many solutions: the equation constraints are dependent.';
    return zh ? '无解：方程组的约束彼此矛盾。' : 'No solution: the equation constraints are inconsistent.';
  }
  function equation(row, constant) { return `${format(row[0])}x ${row[1] >= 0 ? '+' : '−'} ${format(Math.abs(row[1]))}y = ${format(constant)}`; }
  function drawLine(ctx, origin, scale, row, constant, color, label, palette) {
    const [a, b] = row; const range = 6; if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9) return;
    let from; let to;
    if (Math.abs(b) > 1e-9) { from = [-range, (constant - a * -range) / b]; to = [range, (constant - a * range) / b]; }
    else { const x = constant / a; from = [x, -range]; to = [x, range]; }
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(origin.x + from[0] * scale, origin.y - from[1] * scale); ctx.lineTo(origin.x + to[0] * scale, origin.y - to[1] * scale); ctx.stroke(); ctx.fillStyle = color; ctx.font = '600 12px Inter, sans-serif'; ctx.fillText(label, origin.x + to[0] * scale - 46, origin.y - to[1] * scale - 8); ctx.strokeStyle = palette.reference;
  }
  function drawCanvas(result) {
    const canvas = byId('systemsCanvas'); if (!canvas) return; const { ctx, width, height } = root.LinAlgLab.canvas.setupHiDPI(canvas); const origin = { x: width / 2, y: height / 2 }; const scale = Math.min(width, height) / 12; const palette = root.LinAlgLab.canvas.getActivePalette();
    ctx.clearRect(0, 0, width, height); root.LinAlgLab.canvas.drawGrid(ctx, width, height, origin, scale, palette);
    drawLine(ctx, origin, scale, state.A[0], state.b[0], '#06b6d4', 'L₁', palette); drawLine(ctx, origin, scale, state.A[1], state.b[1], '#8b5cf6', 'L₂', palette);
    if (result.classification === 'unique') { const [x, y] = result.solution; ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(origin.x + x * scale, origin.y - y * scale, 6, 0, Math.PI * 2); ctx.fill(); ctx.font = '600 12px Inter, sans-serif'; ctx.fillText(`(${format(x)}, ${format(y)})`, origin.x + x * scale + 9, origin.y - y * scale - 9); }
  }
  function refresh() { redraw(); }
  function redraw() {
    const result = calculate(); const matrix = currentMatrix(result); const step = state.step ? result.steps[state.step - 1] : null; const zh = language() === 'zh';
    byId('systemsMatrixDisplay').innerHTML = renderMatrix(matrix); byId('systemsOperation').textContent = operationText(step); byId('systemsStatus').textContent = classificationText(result);
    byId('systemsRankA').textContent = result.rankA; byId('systemsRankAugmented').textContent = result.rankAugmented;
    byId('systemsEquationOne').textContent = equation(state.A[0], state.b[0]); byId('systemsEquationTwo').textContent = equation(state.A[1], state.b[1]);
    const badge = byId('systemsBadge'); const colors = { unique: '#10b981', infinite: '#f59e0b', inconsistent: '#f43f5e' }; const labels = { unique: zh ? '唯一解' : 'Unique Solution', infinite: zh ? '无穷多解' : 'Infinite Solutions', inconsistent: zh ? '无解' : 'No Solution' }; badge.textContent = labels[result.classification]; badge.style.cssText = `background:${colors[result.classification]}22;color:${colors[result.classification]};border-color:${colors[result.classification]}66`;
    byId('systemsNextBtn').disabled = state.step >= result.steps.length; byId('systemsAutoBtn').disabled = state.step >= result.steps.length; drawCanvas(result);
  }
  function init(nextContext) {
    destroy(); context = nextContext; ['sysA', 'sysB', 'sysC', 'sysD', 'sysE', 'sysF'].forEach(id => on(byId(id), 'input', read));
    on(byId('systemsNextBtn'), 'click', () => { const result = calculate(); state.step = Math.min(result.steps.length, state.step + 1); redraw(); });
    on(byId('systemsAutoBtn'), 'click', () => { state.step = calculate().steps.length; redraw(); }); on(byId('systemsResetBtn'), 'click', () => { state.step = 0; redraw(); });
    document.querySelectorAll('[data-action="system-preset"]').forEach(button => on(button, 'click', () => setPreset(button.dataset.preset))); syncInputs(); redraw();
  }
  function destroy() { cleanups.splice(0).forEach(remove => remove()); }
  const api = { id: 'systems', init, redraw, refresh, destroy, calculate, setPreset };
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (root.LinAlgLab && root.LinAlgLab.modules) root.LinAlgLab.modules.register(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
