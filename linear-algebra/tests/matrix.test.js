const test = require('node:test');
const assert = require('node:assert/strict');
const matrix = require('../core/matrix.js');

const closeTo = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
const closeMatrix = (actual, expected, tolerance = 1e-8) => actual.forEach((row, rowIndex) => row.forEach((value, columnIndex) => closeTo(value, expected[rowIndex][columnIndex], tolerance)));

test('general matrix operations preserve dimensions and values', () => {
  assert.deepEqual(matrix.shape([[1, 2, 3], [4, 5, 6]]), { rows: 2, columns: 3 });
  assert.deepEqual(matrix.transpose([[1, 2, 3], [4, 5, 6]]), [[1, 4], [2, 5], [3, 6]]);
  assert.deepEqual(matrix.multiply([[1, 2, 3], [4, 5, 6]], [[7, 8], [9, 10], [11, 12]]), [[58, 64], [139, 154]]);
  assert.deepEqual(matrix.multiplyVector([[2, 0], [1, 3]], [4, 5]), [8, 19]);
  assert.throws(() => matrix.multiply([[1, 2]], [[1, 2]]), RangeError);
  assert.throws(() => matrix.assertMatrix([[1], [2, 3]]), TypeError);
  assert.throws(() => matrix.assertMatrix([[Infinity]]), RangeError);
});

test('determinant and rank use pivoting and numeric tolerance', () => {
  closeTo(matrix.determinant([[4, 7], [2, 6]]), 10);
  closeTo(matrix.determinant([[2, 1, 3], [0, 1, 4], [5, 2, 0]]), -11);
  assert.equal(matrix.rank([[1, 2], [2, 4 + 1e-12]], 1e-9), 1);
  assert.equal(matrix.rank([[1, 2], [2, 4.01]], 1e-9), 2);
  assert.equal(matrix.determinant([[1, 0], [0, 1e-12]], 1e-9), 0);
});

test('2x2 inverse classifies singular matrices and reconstructs identity on both sides', () => {
  const source = [[4, 7], [2, 6]];
  const before = source.map(row => row.slice());
  const result = matrix.inverse2x2(source);
  assert.equal(result.classification, 'invertible');
  assert.equal(result.determinant, 10);
  assert.deepEqual(result.matrix, before);
  closeMatrix(result.inverse, [[0.6, -0.7], [-0.2, 0.4]]);
  closeMatrix(matrix.multiply(source, result.inverse), [[1, 0], [0, 1]]);
  closeMatrix(matrix.multiply(result.inverse, source), [[1, 0], [0, 1]]);
  assert.deepEqual(source, before);

  const reflection = matrix.inverse2x2([[1, 0], [0, -1]]);
  assert.equal(reflection.classification, 'invertible');
  assert.deepEqual(reflection.inverse, [[1, 0], [0, -1]]);

  const singular = matrix.inverse2x2([[1, 1], [2, 2]]);
  assert.deepEqual(singular, { matrix: [[1, 1], [2, 2]], determinant: 0, classification: 'singular', inverse: null });
  assert.equal(matrix.inverse2x2([[1, 0], [0, 1e-12]], 1e-9).classification, 'singular');
  assert.throws(() => matrix.inverse2x2([[1]]), RangeError);
  assert.throws(() => matrix.inverse2x2([[1, 0], [0, 1]], -1), RangeError);
  assert.throws(() => matrix.inverse2x2([[1, Infinity], [0, 1]]), RangeError);
});

test('RREF records replayable elementary row operations and respects tolerance', () => {
  const reduced = matrix.rref([[0, 2, 4], [1, 1, 3]]);
  assert.deepEqual(reduced.matrix, [[1, 0, 1], [0, 1, 2]]);
  assert.deepEqual(reduced.pivots, [0, 1]);
  assert.ok(reduced.steps.some(step => step.type === 'swap'));
  assert.ok(reduced.steps.some(step => step.type === 'scale'));
  assert.ok(reduced.steps.some(step => step.type === 'replace'));
  assert.deepEqual(matrix.rref([[1, 1e-12]], 1e-9).matrix, [[1, 0]]);
  assert.throws(() => matrix.rref([[1]], -1), RangeError);
});

test('linear-system solver classifies unique, infinite, and inconsistent systems', () => {
  const unique = matrix.solveLinearSystem([[1, 1], [2, -1]], [3, 0]);
  assert.equal(unique.classification, 'unique');
  closeMatrix([unique.solution], [[1, 2]]);
  assert.equal(unique.rankA, 2);
  assert.equal(unique.rankAugmented, 2);

  const infinite = matrix.solveLinearSystem([[1, 1], [2, 2]], [2, 4]);
  assert.equal(infinite.classification, 'infinite');
  const inconsistent = matrix.solveLinearSystem([[1, 1], [1, 1]], [2, 4]);
  assert.equal(inconsistent.classification, 'inconsistent');
  assert.equal(matrix.solveLinearSystem([[1, 1], [2, 2 + 1e-12]], [2, 4], 1e-9).classification, 'infinite');
  assert.throws(() => matrix.solveLinearSystem([[1, 2]], [1, 2]), RangeError);
});

test('least squares returns coefficients, residuals, SSE, and handles rank-deficient designs', () => {
  const exact = matrix.leastSquares([[-2, 1], [0, 1], [3, 1]], [-3, 1, 7]);
  assert.equal(exact.classification, 'unique');
  closeMatrix([exact.coefficients], [[2, 1]]);
  closeTo(exact.sse, 0);
  closeTo(exact.r2, 1);

  const noisy = matrix.leastSquares([[-1, 1], [0, 1], [1, 1]], [-1.1, 0.2, 0.9]);
  closeMatrix([noisy.coefficients], [[1, 0]], 1e-8);
  closeTo(noisy.sse, 0.06, 1e-8);
  assert.ok(noisy.r2 > 0 && noisy.r2 < 1);

  const degenerate = matrix.leastSquares([[1, 1], [1, 1]], [2, 3]);
  assert.equal(degenerate.classification, 'infinite');
  assert.equal(degenerate.coefficients, null);
  assert.equal(matrix.leastSquares([[1, 1], [1 + 1e-12, 1]], [2, 2], 1e-9).classification, 'infinite');
});

test('2x2 QR decomposition reconstructs independent columns and rejects rank-deficient input', () => {
  const source = [[3, 1], [1, 3]];
  const decomposition = matrix.qr2x2(source);
  assert.equal(decomposition.classification, 'independent');
  assert.deepEqual(decomposition.steps.map(step => step.id), ['source', 'normalize-first', 'subtract-projection', 'normalize-second', 'factorize']);
  closeMatrix(matrix.multiply(decomposition.Q, decomposition.R), source);
  closeMatrix(decomposition.reconstruction, source);
  closeMatrix(decomposition.orthogonality, [[1, 0], [0, 1]]);
  closeTo(matrix.dot(decomposition.q1, decomposition.q2), 0);
  closeTo(Math.abs(matrix.determinant(decomposition.Q)), 1);

  const orthogonal = matrix.qr2x2([[3, 0], [0, 2]]);
  assert.deepEqual(orthogonal.R, [[3, 0], [0, 2]]);
  const dependent = matrix.qr2x2([[2, 4], [1, 2]]);
  assert.equal(dependent.classification, 'dependent');
  assert.equal(dependent.q2, null);
  assert.equal(dependent.R, null);
  assert.equal(matrix.qr2x2([[1, 1 + 1e-12], [0, 1e-12]], 1e-9).classification, 'dependent');
  assert.equal(matrix.qr2x2([[0, 1], [0, 2]]).reason, 'first-vector-zero');
  assert.throws(() => matrix.qr2x2([[1]]), RangeError);
  assert.throws(() => matrix.qr2x2([[1, 0], [0, 1]], -1), RangeError);
});

test('2D PCA centers data, orders components, and handles zero variance', () => {
  const horizontal = matrix.pca2d([[-3, -0.1], [-1, 0.2], [1, -0.2], [3, 0.1]]);
  assert.equal(horizontal.classification, 'ok');
  closeMatrix([horizontal.mean], [[0, 0]]);
  assert.ok(horizontal.eigenvalues[0] >= horizontal.eigenvalues[1]);
  assert.ok(horizontal.explainedVariance[0] > 0.99);
  assert.ok(Math.abs(horizontal.components[0][0]) > 0.99);
  horizontal.projected.forEach((point, index) => {
    const reconstruction = point.map((value, axis) => value - horizontal.mean[axis]);
    closeTo(matrix.dot(horizontal.residuals[index], horizontal.components[0]), 0);
    closeTo(reconstruction[0] * horizontal.components[0][1] - reconstruction[1] * horizontal.components[0][0], 0);
  });

  const vertical = matrix.pca2d([[0, -3], [0, -1], [0, 1], [0, 3]]);
  assert.ok(Math.abs(vertical.components[0][1]) > 0.99);
  assert.equal(vertical.scores.length, 4);
  assert.equal(vertical.projected.length, 4);

  const isotropic = matrix.pca2d([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
  assert.equal(isotropic.classification, 'isotropic');
  closeTo(isotropic.explainedVariance[0], 0.5);
  closeTo(isotropic.explainedVariance[1], 0.5);

  const zero = matrix.pca2d([[2, -1], [2, -1], [2, -1]]);
  assert.equal(zero.classification, 'zero-variance');
  assert.equal(zero.components, null);
  assert.deepEqual(zero.explainedVariance, [0, 0]);
  assert.throws(() => matrix.pca2d([[1, 2]]), RangeError);
  assert.throws(() => matrix.pca2d([[1, 2], [3]]), RangeError);
  assert.throws(() => matrix.pca2d([[1, 2], [3, 4]], -1), RangeError);
});

test('vector norms and projections reject invalid targets', () => {
  assert.equal(matrix.dot([1, 2, 3], [4, 5, 6]), 32);
  closeTo(matrix.norm([3, 4]), 5);
  closeMatrix([matrix.projection([2, 3], [1, 0])], [[2, 0]]);
  assert.throws(() => matrix.projection([1, 2], [0, 0]), RangeError);
});

test('symmetric eigenpairs and 2x2 SVD reconstruct the source matrix', () => {
  const eigen = matrix.symmetricEigen2x2(2, 1, 3);
  eigen.vectors.forEach((vector, index) => {
    const transformed = matrix.multiplyVector([[2, 1], [1, 3]], vector);
    closeMatrix([transformed], [vector.map(value => value * eigen.values[index])]);
  });
  const source = [[1.8, 0.6], [0.4, 1.2]];
  const decomposition = matrix.svd2x2(source);
  assert.ok(decomposition.singularValues[0] >= decomposition.singularValues[1]);
  assert.ok(decomposition.singularValues[1] >= 0);
  closeMatrix(matrix.multiply(matrix.multiply(decomposition.U, decomposition.S), matrix.transpose(decomposition.V)), source, 1e-7);
});

test('2x2 SVD completes an orthogonal basis for rank-deficient and zero matrices', () => {
  const rankOne = matrix.svd2x2([[1, 1], [1, 1]]);
  closeMatrix(matrix.multiply(matrix.transpose(rankOne.U), rankOne.U), [[1, 0], [0, 1]], 1e-8);
  closeMatrix(matrix.multiply(matrix.transpose(rankOne.V), rankOne.V), [[1, 0], [0, 1]], 1e-8);
  closeMatrix(matrix.multiply(matrix.multiply(rankOne.U, rankOne.S), matrix.transpose(rankOne.V)), [[1, 1], [1, 1]], 1e-8);

  const zero = matrix.svd2x2([[0, 0], [0, 0]]);
  assert.deepEqual(zero.singularValues, [0, 0]);
  closeMatrix(matrix.multiply(matrix.transpose(zero.U), zero.U), [[1, 0], [0, 1]]);
  closeMatrix(matrix.multiply(matrix.transpose(zero.V), zero.V), [[1, 0], [0, 1]]);
});
