/* StatLab shared statistics utilities. Works in browsers and Node.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.StatLab = root.StatLab || {};
  root.StatLab.statistics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SQRT_2PI = Math.sqrt(2 * Math.PI);

  function assertFinite(value, name) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number.`);
  }

  function assertProbability(value, name = 'probability') {
    assertFinite(value, name);
    if (value < 0 || value > 1) throw new RangeError(`${name} must be between 0 and 1.`);
  }

  function assertPositive(value, name) {
    assertFinite(value, name);
    if (value <= 0) throw new RangeError(`${name} must be greater than 0.`);
  }

  function assertNonNegativeInteger(value, name) {
    if (!Number.isInteger(value) || value < 0) throw new RangeError(`${name} must be a non-negative integer.`);
  }

  function mean(values) {
    if (!Array.isArray(values) || values.length === 0) throw new RangeError('values must be a non-empty array.');
    values.forEach((value, index) => assertFinite(value, `values[${index}]`));
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function variance(values, sample = true) {
    if (!Array.isArray(values) || values.length < (sample ? 2 : 1)) throw new RangeError('Not enough values to calculate variance.');
    const average = mean(values);
    return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - (sample ? 1 : 0));
  }

  function logGamma(z) {
    const coefficients = [676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
    let value = 0.9999999999998099;
    const adjusted = z - 1;
    coefficients.forEach((coefficient, index) => { value += coefficient / (adjusted + index + 1); });
    const t = adjusted + coefficients.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (adjusted + 0.5) * Math.log(t) - t + Math.log(value);
  }

  function logCombination(n, k) {
    assertNonNegativeInteger(n, 'n');
    assertNonNegativeInteger(k, 'k');
    return k > n ? -Infinity : logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
  }

  function combination(n, k) { return Math.exp(logCombination(n, k)); }
  function normalPdf(x, mu = 0, sigma = 1) {
    assertFinite(x, 'x'); assertFinite(mu, 'mu'); assertPositive(sigma, 'sigma');
    return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * SQRT_2PI);
  }
  function normalCdf(x, mu = 0, sigma = 1) {
    assertFinite(x, 'x'); assertFinite(mu, 'mu'); assertPositive(sigma, 'sigma');
    const z = Math.abs((x - mu) / sigma);
    const t = 1 / (1 + 0.2316419 * z);
    const density = 0.3989423 * Math.exp(-z * z / 2);
    const probability = density * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return (x - mu) / sigma >= 0 ? 1 - probability : probability;
  }
  function binomialPmf(k, n, p) {
    assertNonNegativeInteger(k, 'k'); assertNonNegativeInteger(n, 'n'); assertProbability(p, 'p');
    if (k > n) return 0;
    if (p === 0) return k === 0 ? 1 : 0;
    if (p === 1) return k === n ? 1 : 0;
    return Math.exp(logCombination(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  }
  function binomialCdf(k, n, p) {
    assertNonNegativeInteger(n, 'n'); assertProbability(p, 'p');
    if (k < 0) return 0;
    return Array.from({ length: Math.min(n, Math.floor(k)) + 1 }, (_, index) => binomialPmf(index, n, p)).reduce((sum, value) => sum + value, 0);
  }
  function bernoulliPmf(k, p) { return binomialPmf(k, 1, p); }
  function poissonPmf(k, lambda) {
    assertNonNegativeInteger(k, 'k'); assertPositive(lambda, 'lambda');
    return Math.exp(k * Math.log(lambda) - lambda - logGamma(k + 1));
  }
  function poissonCdf(k, lambda) {
    if (k < 0) return 0;
    return Array.from({ length: Math.floor(k) + 1 }, (_, index) => poissonPmf(index, lambda)).reduce((sum, value) => sum + value, 0);
  }
  function exponentialPdf(x, lambda) {
    assertFinite(x, 'x'); assertPositive(lambda, 'lambda');
    return x < 0 ? 0 : lambda * Math.exp(-lambda * x);
  }
  function exponentialCdf(x, lambda) {
    assertFinite(x, 'x'); assertPositive(lambda, 'lambda');
    return x <= 0 ? 0 : 1 - Math.exp(-lambda * x);
  }
  function inverseCdf(cdf, low, high, probability) {
    assertProbability(probability); assertFinite(low, 'low'); assertFinite(high, 'high');
    let left = low; let right = high;
    for (let index = 0; index < 80; index++) {
      const middle = (left + right) / 2;
      if (cdf(middle) < probability) left = middle; else right = middle;
    }
    return (left + right) / 2;
  }
  function bayesPosterior(prior, likelihood, falsePositiveRate) {
    assertProbability(prior, 'prior'); assertProbability(likelihood, 'likelihood'); assertProbability(falsePositiveRate, 'falsePositiveRate');
    const evidence = prior * likelihood + (1 - prior) * falsePositiveRate;
    return evidence === 0 ? 0 : prior * likelihood / evidence;
  }
  function sampleUniform(random = Math.random) {
    const value = random();
    assertProbability(value, 'random value');
    return value;
  }
  function sampleBernoulli(p, random = Math.random) { assertProbability(p, 'p'); return sampleUniform(random) < p ? 1 : 0; }

  return { assertProbability, mean, variance, logGamma, logCombination, combination, normalPdf, normalCdf, bernoulliPmf, binomialPmf, binomialCdf, poissonPmf, poissonCdf, exponentialPdf, exponentialCdf, inverseCdf, bayesPosterior, sampleUniform, sampleBernoulli };
});
