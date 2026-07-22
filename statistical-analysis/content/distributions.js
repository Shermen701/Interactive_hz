(function (root) {
  root.StatLab = root.StatLab || {};
  root.StatLab.distributions = {
    bernoulli: {
      kind: 'discrete', color: '#4f46e5', domain: () => [0, 1],
      name: { zh: '伯努利分布', en: 'Bernoulli Distribution' },
      summary: { zh: '一次只有成功或失败两种结果的试验。', en: 'One trial with only success or failure.' },
      example: { zh: '一次点击是否转化、一次投币是否正面。', en: 'A conversion click or a single coin toss.' }, formula: 'P(X=k)=p^k(1-p)^{1-k}',
      parameters: [{ key: 'p', symbol: 'p', min: 0.05, max: 0.95, step: 0.05, value: 0.5, label: { zh: '成功概率', en: 'Success probability' } }],
      stats: params => ({ mean: params.p, variance: params.p * (1 - params.p) }),
      pmf: (x, params, stats) => stats.bernoulliPmf(x, params.p), cdf: (x, params, stats) => x < 0 ? 0 : x < 1 ? stats.bernoulliPmf(0, params.p) : 1
    },
    binomial: {
      kind: 'discrete', color: '#0ea5e9', domain: params => [0, params.n],
      name: { zh: '二项分布', en: 'Binomial Distribution' },
      summary: { zh: 'n 次独立伯努利试验中成功次数的分布。', en: 'The number of successes in n independent Bernoulli trials.' },
      example: { zh: '20 位访客中完成注册的人数。', en: 'Registrations among 20 visitors.' }, formula: 'P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}',
      parameters: [{ key: 'n', symbol: 'n', min: 1, max: 40, step: 1, value: 12, label: { zh: '试验次数', en: 'Trials' } }, { key: 'p', symbol: 'p', min: 0.05, max: 0.95, step: 0.05, value: 0.5, label: { zh: '成功概率', en: 'Success probability' } }],
      stats: params => ({ mean: params.n * params.p, variance: params.n * params.p * (1 - params.p) }),
      pmf: (x, params, stats) => stats.binomialPmf(x, params.n, params.p), cdf: (x, params, stats) => stats.binomialCdf(x, params.n, params.p)
    },
    poisson: {
      kind: 'discrete', color: '#10b981', domain: params => [0, Math.max(12, Math.ceil(params.lambda * 3.5))],
      name: { zh: '泊松分布', en: 'Poisson Distribution' },
      summary: { zh: '固定时间或空间范围内稀有事件发生次数的分布。', en: 'Counts of events in a fixed time or space interval.' },
      example: { zh: '一分钟内收到的客服消息数量。', en: 'Support messages received in one minute.' }, formula: 'P(X=k)=\\frac{\\lambda^k e^{-\\lambda}}{k!}',
      parameters: [{ key: 'lambda', symbol: 'λ', min: 0.5, max: 12, step: 0.5, value: 4, label: { zh: '平均发生次数', en: 'Average rate' } }],
      stats: params => ({ mean: params.lambda, variance: params.lambda }),
      pmf: (x, params, stats) => stats.poissonPmf(x, params.lambda), cdf: (x, params, stats) => stats.poissonCdf(x, params.lambda)
    },
    normal: {
      kind: 'continuous', color: '#8b5cf6', domain: params => [params.mu - 4 * params.sigma, params.mu + 4 * params.sigma],
      name: { zh: '正态分布', en: 'Normal Distribution' },
      summary: { zh: '围绕均值对称、由均值和标准差决定形状的连续分布。', en: 'A continuous symmetric distribution defined by mean and standard deviation.' },
      example: { zh: '近似测量误差、标准化考试成绩。', en: 'Approximate measurement errors or standardized scores.' }, formula: 'f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
      parameters: [{ key: 'mu', symbol: 'μ', min: -5, max: 5, step: 0.5, value: 0, label: { zh: '均值', en: 'Mean' } }, { key: 'sigma', symbol: 'σ', min: 0.5, max: 4, step: 0.5, value: 1, label: { zh: '标准差', en: 'Standard deviation' } }],
      stats: params => ({ mean: params.mu, variance: params.sigma ** 2 }),
      pdf: (x, params, stats) => stats.normalPdf(x, params.mu, params.sigma), cdf: (x, params, stats) => stats.normalCdf(x, params.mu, params.sigma)
    },
    exponential: {
      kind: 'continuous', color: '#f59e0b', domain: params => [0, Math.max(6, 6 / params.lambda)],
      name: { zh: '指数分布', en: 'Exponential Distribution' },
      summary: { zh: '描述下一次随机事件发生前等待时间的连续分布。', en: 'A continuous distribution for waiting time until the next random event.' },
      example: { zh: '下一位顾客到达前的等待时间。', en: 'Waiting time until the next customer arrives.' }, formula: 'f(x)=\\lambda e^{-\\lambda x},\\quad x\\geq0',
      parameters: [{ key: 'lambda', symbol: 'λ', min: 0.2, max: 3, step: 0.2, value: 1, label: { zh: '事件速率', en: 'Event rate' } }],
      stats: params => ({ mean: 1 / params.lambda, variance: 1 / (params.lambda ** 2) }),
      pdf: (x, params, stats) => stats.exponentialPdf(x, params.lambda), cdf: (x, params, stats) => stats.exponentialCdf(x, params.lambda)
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
