const test = require('node:test');
const assert = require('node:assert/strict');
require('../core/matrix.js');
const span = require('../modules/span.js');
const transform = require('../modules/transform.js');
const composition = require('../modules/composition.js');
const inverse = require('../modules/inverse.js');
const systems = require('../modules/systems.js');
const qr = require('../modules/qr.js');
const regression = require('../modules/regression.js');
const pca = require('../modules/pca.js');
const eigen = require('../modules/eigen.js');
const projection = require('../modules/projection.js');
const svd = require('../modules/svd.js');

const closeTo = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

test('span and transform calculations cover independent and singular cases', () => {
  assert.deepEqual(span.calculate({ u: [2, 1], v: [-1, 2], c1: 1, c2: 1 }).result, [1, 3]);
  assert.equal(span.calculate({ u: [1, 2], v: [2, 4], c1: 0, c2: 0 }).determinant, 0);
  const singular = transform.calculate({ a: 1, b: 2, c: .5, d: 1 });
  assert.equal(singular.rank, 1);
  assert.equal(singular.determinant, 0);
});

test('matrix composition preserves inputs, respects order, and keeps rank-deficient stages finite', () => {
  const A = [[1, 2], [3, 4]];
  const B = [[2, 0], [0, 3]];
  const beforeA = A.map(row => row.slice());
  const beforeB = B.map(row => row.slice());
  const ba = composition.calculate({ A, B, order: 'BA' });
  const ab = composition.calculate({ A, B, order: 'AB' });

  assert.deepEqual(ba.product, [[2, 4], [9, 12]]);
  assert.deepEqual(ab.product, [[2, 6], [6, 12]]);
  assert.notDeepEqual(ba.product, ab.product);
  assert.deepEqual(ba.stages[1].basis, [[1, 3], [2, 4]]);
  assert.equal(ba.entryCalculations.length, 4);
  assert.deepEqual(ba.entryCalculations[0], {
    row: 0, column: 0, leftRow: [2, 0], rightColumn: [1, 3],
    terms: [{ left: 2, right: 1, product: 2 }, { left: 0, right: 3, product: 0 }], total: 2
  });
  assert.deepEqual(ab.entryCalculations[1], {
    row: 0, column: 1, leftRow: [1, 2], rightColumn: [0, 3],
    terms: [{ left: 1, right: 0, product: 0 }, { left: 2, right: 3, product: 6 }], total: 6
  });
  assert.deepEqual(A, beforeA);
  assert.deepEqual(B, beforeB);

  const identityFirst = composition.calculate({ A: [[1, 0], [0, 1]], B, order: 'BA' });
  assert.deepEqual(identityFirst.product, B);

  const rankDeficient = composition.calculate({ A: [[1, 2], [2, 4]], B: [[0, 0], [0, 0]], order: 'BA' });
  assert.deepEqual(rankDeficient.product, [[0, 0], [0, 0]]);
  assert.ok(rankDeficient.stages.flatMap(stage => [...stage.basis, ...stage.square]).flat().every(Number.isFinite));
  assert.ok(rankDeficient.entryCalculations.every(entry => entry.terms.every(term => Number.isFinite(term.product)) && Number.isFinite(entry.total)));

  const decimal = composition.calculate({ A: [[1.2, .5], [-.3, 2]], B: [[.25, 1.1], [2, -.4]], order: 'BA' });
  decimal.entryCalculations.forEach(entry => closeTo(entry.terms.reduce((sum, term) => sum + term.product, 0), entry.total));
  assert.throws(() => composition.calculate({ A: [[1, 0], [0, Infinity]], B, order: 'BA' }), /finite number/);
});

test('inverse module exposes formula data, two-sided verification, and singular recovery state', () => {
  const source = [[4, 7], [2, 6]];
  const before = source.map(row => row.slice());
  const result = inverse.calculate({ matrix: source });
  assert.equal(result.classification, 'invertible');
  assert.equal(result.determinant, 10);
  assert.deepEqual(result.adjugate, [[6, -7], [-2, 4]]);
  closeTo(result.inverse[0][0], .6);
  closeTo(result.inverse[0][1], -.7);
  closeTo(result.inverse[1][0], -.2);
  closeTo(result.inverse[1][1], .4);
  assert.deepEqual(result.stages.map(stage => stage.id), ['identity', 'transformed', 'recovered']);
  assert.ok(result.stages.flatMap(stage => [...stage.basis, ...stage.square]).flat().every(Number.isFinite));
  result.forwardVerification.forEach((row, rowIndex) => row.forEach((value, columnIndex) => closeTo(value, rowIndex === columnIndex ? 1 : 0)));
  result.reverseVerification.forEach((row, rowIndex) => row.forEach((value, columnIndex) => closeTo(value, rowIndex === columnIndex ? 1 : 0)));
  assert.deepEqual(source, before);

  const singular = inverse.calculate({ matrix: [[1, 1], [2, 2]] });
  assert.equal(singular.classification, 'singular');
  assert.equal(singular.inverse, null);
  assert.equal(singular.forwardVerification, null);
  assert.equal(singular.reverseVerification, null);
  assert.equal(singular.stages[2].matrix, null);
  assert.throws(() => inverse.calculate({ matrix: [[1, 0], [0, Infinity]] }), /finite number/);
});

test('eigen probe identifies an eigenvector and projection handles a zero target', () => {
  const probe = eigen.calculate({ a: 2, b: 0, c: 3, angle: 0 });
  closeTo(probe.error, 0);
  const zero = projection.calculate({ u: [0, 0], v: [2, 3] });
  assert.deepEqual(zero.projection, [0, 0]);
  assert.deepEqual(zero.perpendicular, [2, 3]);
});

test('SVD module calculation remains valid for default and degenerate matrices', () => {
  const normal = svd.calculate({ a: 1.8, b: .6, c: .4, d: 1.2 });
  assert.ok(normal.singularValues[0] >= normal.singularValues[1]);
  const degenerate = svd.calculate({ a: 0, b: 0, c: 0, d: 0 });
  assert.deepEqual(degenerate.singularValues, [0, 0]);
});

test('linear-systems module delegates to the common solver for all solution types', () => {
  const unique = systems.calculate({ A: [[1, 1], [2, -1]], b: [3, 0] });
  assert.equal(unique.classification, 'unique');
  assert.deepEqual(unique.solution, [1, 2]);
  assert.equal(systems.calculate({ A: [[1, 1], [2, 2]], b: [2, 4] }).classification, 'infinite');
  assert.equal(systems.calculate({ A: [[1, 1], [1, 1]], b: [2, 4] }).classification, 'inconsistent');
});

test('QR module calculation handles default, orthogonal, dependent, and zero-first inputs', () => {
  const standard = qr.calculate({ u: [3, 1], v: [1, 3] });
  assert.equal(standard.classification, 'independent');
  closeTo(standard.orthogonality[0][0], 1);
  closeTo(standard.orthogonality[1][1], 1);
  closeTo(standard.orthogonality[0][1], 0);
  const orthogonal = qr.calculate({ u: [3, 0], v: [0, 2] });
  assert.deepEqual(orthogonal.R, [[3, 0], [0, 2]]);
  const dependent = qr.calculate({ u: [2, 1], v: [4, 2] });
  assert.equal(dependent.classification, 'dependent');
  assert.equal(dependent.q2, null);
  assert.equal(qr.calculate({ u: [0, 0], v: [1, 2] }).reason, 'first-vector-zero');
});

test('regression module fits line data and reports a non-unique vertical design', () => {
  const exact = regression.calculate([{ x: -1, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 7 }]);
  assert.equal(exact.classification, 'unique');
  closeTo(exact.slope, 2);
  closeTo(exact.intercept, 1);
  closeTo(exact.sse, 0);
  closeTo(exact.residualDotOne, 0);
  closeTo(exact.residualDotX, 0);
  const vertical = regression.calculate([{ x: 1, y: -2 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }]);
  assert.equal(vertical.classification, 'infinite');
  assert.equal(vertical.slope, null);
});

test('PCA module calculates principal directions for presets and zero variance', () => {
  const diagonal = pca.calculate([[-4, -3], [-2, -1], [0, 0], [2, 2], [4, 3]]);
  assert.equal(diagonal.classification, 'ok');
  assert.equal(diagonal.points.length, 5);
  assert.ok(diagonal.explainedVariance[0] > diagonal.explainedVariance[1]);
  assert.ok(diagonal.scores.every(score => score.length === 2));

  const vertical = pca.calculate([[0, -4], [0, -2], [0, 0], [0, 2], [0, 4], [0, 5]]);
  assert.ok(Math.abs(vertical.components[0][1]) > 0.99);
  const zero = pca.calculate([[1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1]]);
  assert.equal(zero.classification, 'zero-variance');
  assert.equal(zero.projected, null);
});
