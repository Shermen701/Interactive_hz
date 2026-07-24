(function (root) {
  const chartState = { distribution: null, context: null };
  const state = { distributionId: 'binomial', params: {}, query: 0, bayes: { prior: 0.3, sensitivity: 0.9, falsePositive: 0.1 } };
  const listeners = [];
  const on = (element, event, handler) => { element.addEventListener(event, handler); listeners.push(() => element.removeEventListener(event, handler)); };
  const el = id => document.getElementById(id);
  const language = () => chartState.context.getState().lang;
  const copy = (value) => value[language()];
  const format = value => Number(value).toLocaleString(language() === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 4 });

  function renderShell() {
    const container = el('probability');
    container.innerHTML = `
      <div class="section-header"><div class="badge" id="probabilityBadge"></div><h2 id="probabilityTitle"></h2><p id="probabilitySubtitle"></p></div>
      <div class="cards-grid probability-intro-grid">
        <article class="card"><div class="card-header"><i data-lucide="waypoints" class="card-icon"></i><h3 id="bayesCardTitle"></h3></div><p id="bayesCardCopy" class="probability-card-copy"></p><div class="math-expr">$$P(A|B)=\\frac{P(B|A)P(A)}{P(B)}$$</div></article>
        <article class="card"><div class="card-header"><i data-lucide="chart-no-axes-combined" class="card-icon"></i><h3 id="distributionCardTitle"></h3></div><p id="distributionCardCopy" class="probability-card-copy"></p><div class="formula-note" id="distributionFormula"></div></article>
      </div>
      <section class="interactive-widget" aria-labelledby="bayesWidgetTitle"><div class="widget-header"><div><h3 id="bayesWidgetTitle"></h3><p id="bayesWidgetSubtitle"></p></div><div class="widget-badge" id="bayesPosteriorBadge"></div></div><div class="widget-body probability-widget-body"><div class="controls-panel" id="bayesControls"></div><div class="bayes-visual" id="bayesVisual" aria-live="polite"></div></div></section>
      <section class="interactive-widget" aria-labelledby="distributionWidgetTitle"><div class="widget-header"><div><h3 id="distributionWidgetTitle"></h3><p id="distributionWidgetSubtitle"></p></div><div class="widget-badge" id="distributionKindBadge"></div></div><div class="widget-body probability-widget-body"><div class="controls-panel"><div class="control-group"><label for="distributionSelect" id="distributionSelectLabel"></label><select id="distributionSelect" class="select-input"></select></div><div id="distributionControls"></div><div class="probability-result-grid"><div><span id="meanLabel"></span><strong id="distributionMean"></strong></div><div><span id="varianceLabel"></span><strong id="distributionVariance"></strong></div><div><span id="cdfLabel"></span><strong id="distributionCdf"></strong></div></div><p class="control-note" id="distributionExample"></p></div><div class="chart-panel"><div class="canvas-wrapper probability-canvas"><canvas id="distributionChart"></canvas></div></div></div></section>`;
  }

  function renderText() {
    const zh = language() === 'zh';
    const set = (id, text) => { el(id).textContent = text; };
    set('probabilityBadge', zh ? '模块 3 · 基础层' : 'Module 3 · Foundations');
    set('probabilityTitle', zh ? '概率与分布实验室' : 'Probability & Distribution Lab');
    set('probabilitySubtitle', zh ? '从条件概率到常用分布：用参数、图形和现实问题建立概率直觉。' : 'Build probability intuition from conditional events to common distributions through parameters, plots, and real examples.');
    set('bayesCardTitle', zh ? '条件概率与贝叶斯更新' : 'Conditional Probability & Bayes Updates');
    set('bayesCardCopy', zh ? '看到证据 B 后，如何更新事件 A 发生的可能性？' : 'How should evidence B update the probability that event A occurred?');
    set('distributionCardTitle', zh ? '统一分布探索器' : 'Unified Distribution Explorer');
    set('distributionCardCopy', zh ? '切换离散和连续分布，观察参数如何改变概率形状。' : 'Switch between discrete and continuous distributions to see how parameters shape probability.');
    set('bayesWidgetTitle', zh ? '贝叶斯诊断实验' : 'Bayesian Diagnostic Lab');
    set('bayesWidgetSubtitle', zh ? '改变先验概率、灵敏度和假阳性率，观察检测阳性后的真实概率。' : 'Adjust prevalence, sensitivity, and false-positive rate to see what a positive result means.');
    set('distributionWidgetTitle', zh ? '常见概率分布探索器' : 'Common Distribution Explorer');
    set('distributionWidgetSubtitle', zh ? '选择分布，调节参数，并读取概率、期望与方差。' : 'Choose a distribution, tune its parameters, and read probability, expectation, and variance.');
    set('distributionSelectLabel', zh ? '选择概率分布：' : 'Choose a distribution:');
    set('meanLabel', zh ? '期望 E[X]' : 'Mean E[X]'); set('varianceLabel', zh ? '方差 Var(X)' : 'Variance Var(X)'); set('cdfLabel', zh ? '累计概率 F(x)' : 'Cumulative probability F(x)');
    renderBayes(); renderDistribution();
    if (root.lucide) root.lucide.createIcons();
    if (root.renderMathInElement) root.renderMathInElement(el('probability'), { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
  }

  function sliderMarkup(id, label, value, min, max, step, suffix = '') {
    return `<div class="control-group"><label for="${id}">${label}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><span class="value-display" id="${id}Value">${format(value)}${suffix}</span></div>`;
  }
  function renderBayes() {
    const zh = language() === 'zh'; const { prior, sensitivity, falsePositive } = state.bayes;
    el('bayesControls').innerHTML = sliderMarkup('bayesPrior', zh ? 'P(A)：事件/患病的先验概率' : 'P(A): prior event probability', prior, 0, 1, 0.01) + sliderMarkup('bayesSensitivity', zh ? 'P(B|A)：检测灵敏度' : 'P(B|A): test sensitivity', sensitivity, 0, 1, 0.01) + sliderMarkup('bayesFalsePositive', zh ? 'P(B|¬A)：假阳性率' : 'P(B|¬A): false-positive rate', falsePositive, 0, 1, 0.01);
    ['bayesPrior', 'bayesSensitivity', 'bayesFalsePositive'].forEach((id, index) => on(el(id), 'input', event => { state.bayes[['prior', 'sensitivity', 'falsePositive'][index]] = Number(event.target.value); renderBayes(); }));
    const positive = prior * sensitivity + (1 - prior) * falsePositive;
    const posterior = root.StatLab.statistics.bayesPosterior(prior, sensitivity, falsePositive);
    const count = 1000; const truePositive = count * prior * sensitivity; const falsePositiveCount = count * (1 - prior) * falsePositive;
    el('bayesPosteriorBadge').textContent = `P(A|B) = ${format(posterior)}`;
    el('bayesVisual').innerHTML = `<div class="bayes-tree"><div class="bayes-node prior"><strong>${zh ? '起点' : 'Start'}</strong><span>${count} ${zh ? '人' : 'people'}</span></div><div class="bayes-branch"><span>${zh ? 'A：事件发生' : 'A: event'} ${format(prior)}</span><div class="bayes-node success"><strong>${zh ? '真阳性' : 'True positive'}</strong><span>${format(truePositive)} / ${count}</span></div></div><div class="bayes-branch"><span>${zh ? '¬A：事件未发生' : '¬A: no event'} ${format(1 - prior)}</span><div class="bayes-node warning"><strong>${zh ? '假阳性' : 'False positive'}</strong><span>${format(falsePositiveCount)} / ${count}</span></div></div></div><div class="bayes-explanation"><strong>${zh ? '阳性结果中真正发生 A 的比例：' : 'Share of positive results that are truly A:'}</strong><span>${format(posterior * 100)}%</span><p>${zh ? `P(B) = ${format(positive)}；所有概率均受 [0, 1] 范围约束。` : `P(B) = ${format(positive)}; all probabilities are constrained to [0, 1].`}</p></div>`;
  }

  function renderDistribution() {
    const config = root.StatLab.distributions[state.distributionId]; const stats = root.StatLab.statistics; const zh = language() === 'zh';
    el('distributionSelect').innerHTML = Object.entries(root.StatLab.distributions).map(([id, item]) => `<option value="${id}" ${id === state.distributionId ? 'selected' : ''}>${copy(item.name)}</option>`).join('');
    on(el('distributionSelect'), 'change', event => { state.distributionId = event.target.value; state.params = {}; state.query = 0; renderDistribution(); });
    el('distributionFormula').innerHTML = `<strong>${zh ? '公式：' : 'Formula:'}</strong> $${config.formula}$`;
    config.parameters.forEach(parameter => { if (state.params[parameter.key] === undefined) state.params[parameter.key] = parameter.value; });
    el('distributionControls').innerHTML = config.parameters.map(parameter => sliderMarkup(`param-${parameter.key}`, `${parameter.symbol} · ${copy(parameter.label)}`, state.params[parameter.key], parameter.min, parameter.max, parameter.step)).join('') + sliderMarkup('distributionQuery', zh ? '观察点 x / k' : 'Query point x / k', state.query, ...config.domain(state.params), config.kind === 'discrete' ? 1 : 0.1);
    config.parameters.forEach(parameter => on(el(`param-${parameter.key}`), 'input', event => { state.params[parameter.key] = Number(event.target.value); renderDistribution(); }));
    on(el('distributionQuery'), 'input', event => { state.query = Number(event.target.value); renderDistribution(); });
    const moments = config.stats(state.params); const [minimum, maximum] = config.domain(state.params);
    state.query = Math.max(minimum, Math.min(maximum, state.query));
    el('distributionMean').textContent = format(moments.mean); el('distributionVariance').textContent = format(moments.variance); el('distributionCdf').textContent = format(config.cdf(state.query, state.params, stats));
    el('distributionKindBadge').textContent = config.kind === 'discrete' ? (zh ? '离散概率质量' : 'Discrete probability mass') : (zh ? '连续概率密度' : 'Continuous probability density');
    el('distributionExample').textContent = `${zh ? '现实场景：' : 'Example: '}${copy(config.example)}`;
    drawDistribution(config, minimum, maximum);
  }
  function drawDistribution(config, minimum, maximum) {
    if (typeof root.Chart === 'undefined') { el('distributionChart').replaceWith(Object.assign(document.createElement('p'), { className: 'dependency-note', textContent: language() === 'zh' ? '图表组件未加载；你仍可阅读公式与数值结果。' : 'The chart library is unavailable; formulas and numeric results remain available.' })); return; }
    const stats = root.StatLab.statistics; const points = config.kind === 'discrete' ? Array.from({ length: maximum - minimum + 1 }, (_, i) => minimum + i) : Array.from({ length: 81 }, (_, i) => minimum + (maximum - minimum) * i / 80);
    const values = points.map(point => (config.kind === 'discrete' ? config.pmf(point, state.params, stats) : config.pdf(point, state.params, stats)));
    const theme = chartState.context.getTheme();
    const chartConfig = { type: config.kind === 'discrete' ? 'bar' : 'line', data: { labels: points.map(point => format(point)), datasets: [{ label: copy(config.name), data: values, borderColor: config.color, backgroundColor: `${config.color}33`, borderWidth: 2, borderRadius: config.kind === 'discrete' ? 4 : 0, fill: config.kind === 'continuous', pointRadius: 0, tension: 0.25 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: theme.tooltipBackground, titleColor: theme.text, bodyColor: theme.text } }, scales: { x: { ticks: { color: theme.muted, maxTicksLimit: 9 }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: theme.muted }, grid: { color: theme.grid } } } } };
    if (!chartState.distribution || chartState.distribution.config.type !== chartConfig.type) {
      if (chartState.distribution) chartState.distribution.destroy();
      chartState.distribution = new root.Chart(el('distributionChart').getContext('2d'), chartConfig);
      return;
    }
    chartState.distribution.data = chartConfig.data;
    chartState.distribution.options = chartConfig.options;
    chartState.distribution.update();
  }

  root.StatLab.modules.register({
    id: 'probability-lab',
    init(context) { chartState.context = context; renderShell(); renderText(); },
    refresh(context) { chartState.context = context; renderText(); },
    destroy() { listeners.splice(0).forEach(remove => remove()); if (chartState.distribution) chartState.distribution.destroy(); chartState.distribution = null; }
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
