const test = require('node:test');
const assert = require('node:assert/strict');
const stats = require('../core/statistics.js');

const closeTo = (actual, expected, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

test('descriptive statistics calculate expected values', () => {
  assert.equal(stats.mean([1, 2, 3]), 2);
  assert.equal(stats.variance([1, 2, 3]), 1);
  assert.equal(stats.variance([1, 2, 3], false), 2 / 3);
});

test('common PMF/PDF/CDF values match known values', () => {
  closeTo(stats.bernoulliPmf(1, 0.3), 0.3);
  closeTo(stats.binomialPmf(2, 4, 0.5), 0.375);
  closeTo(stats.binomialCdf(2, 4, 0.5), 0.6875);
  closeTo(stats.poissonPmf(3, 2), 0.1804470443, 1e-8);
  closeTo(stats.exponentialCdf(1, 1), 1 - Math.exp(-1));
  closeTo(stats.normalCdf(0), 0.5, 1e-6);
});

test('distribution moments and quantiles are numerically stable', () => {
  closeTo(stats.normalPdf(0), 0.3989422804, 1e-7);
  closeTo(stats.inverseCdf(stats.normalCdf, -8, 8, 0.975), 1.95996, 2e-4);
  closeTo(stats.combination(5, 2), 10);
});

test('Bayes posterior handles typical and extreme cases', () => {
  closeTo(stats.bayesPosterior(0.01, 0.99, 0.05), 0.1666666667, 1e-8);
  assert.equal(stats.bayesPosterior(0, 1, 0.2), 0);
  assert.equal(stats.bayesPosterior(1, 1, 0), 1);
});

test('random samplers accept injectable deterministic generators', () => {
  assert.equal(stats.sampleUniform(() => 0.25), 0.25);
  assert.equal(stats.sampleBernoulli(0.3, () => 0.29), 1);
  assert.equal(stats.sampleBernoulli(0.3, () => 0.3), 0);
});

test('invalid parameters fail clearly', () => {
  assert.throws(() => stats.binomialPmf(1, 3, 1.1), RangeError);
  assert.throws(() => stats.exponentialPdf(1, 0), RangeError);
  assert.throws(() => stats.mean([]), RangeError);
  assert.throws(() => stats.bayesPosterior(-0.1, 0.8, 0.1), RangeError);
});
