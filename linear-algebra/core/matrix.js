/* LinAlgLab numerical core. UMD keeps the learning site dependency-free and testable in Node. */
(function (root, factory) {
  const api = factory();
  root.LinAlgLab = root.LinAlgLab || {};
  root.LinAlgLab.matrix = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const EPSILON = 1e-10;
  const isFiniteNumber = value => typeof value === 'number' && Number.isFinite(value);
  const fail = (message, ErrorType = TypeError) => { throw new ErrorType(message); };

  function assertMatrix(matrix, name = 'matrix') {
    if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0]) || matrix[0].length === 0) fail(`${name} must be a non-empty rectangular matrix.`);
    const columns = matrix[0].length;
    matrix.forEach((row, rowIndex) => {
      if (!Array.isArray(row) || row.length !== columns) fail(`${name} must be rectangular (row ${rowIndex}).`);
      row.forEach((value, columnIndex) => { if (!isFiniteNumber(value)) fail(`${name}[${rowIndex}][${columnIndex}] must be a finite number.`, RangeError); });
    });
    return { rows: matrix.length, columns };
  }

  function assertVector(vector, name = 'vector') {
    if (!Array.isArray(vector) || vector.length === 0) fail(`${name} must be a non-empty vector.`);
    vector.forEach((value, index) => { if (!isFiniteNumber(value)) fail(`${name}[${index}] must be a finite number.`, RangeError); });
    return vector.length;
  }

  const clone = matrix => { assertMatrix(matrix); return matrix.map(row => row.slice()); };
  const shape = matrix => assertMatrix(matrix);
  const identity = size => {
    if (!Number.isInteger(size) || size < 1) fail('identity size must be a positive integer.', RangeError);
    return Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => row === column ? 1 : 0));
  };
  const transpose = matrix => {
    const { rows, columns } = assertMatrix(matrix);
    return Array.from({ length: columns }, (_, column) => Array.from({ length: rows }, (_, row) => matrix[row][column]));
  };
  const multiply = (left, right) => {
    const leftShape = assertMatrix(left, 'left matrix');
    const rightShape = assertMatrix(right, 'right matrix');
    if (leftShape.columns !== rightShape.rows) fail(`Cannot multiply ${leftShape.rows}×${leftShape.columns} by ${rightShape.rows}×${rightShape.columns}.`, RangeError);
    return Array.from({ length: leftShape.rows }, (_, row) => Array.from({ length: rightShape.columns }, (_, column) => {
      let total = 0;
      for (let index = 0; index < leftShape.columns; index++) total += left[row][index] * right[index][column];
      return total;
    }));
  };
  const multiplyVector = (matrix, vector) => {
    const { columns } = assertMatrix(matrix);
    if (assertVector(vector) !== columns) fail('Matrix and vector dimensions must agree.', RangeError);
    return matrix.map(row => row.reduce((total, value, index) => total + value * vector[index], 0));
  };
  const dot = (left, right) => {
    if (assertVector(left, 'left vector') !== assertVector(right, 'right vector')) fail('Vector dimensions must agree.', RangeError);
    return left.reduce((total, value, index) => total + value * right[index], 0);
  };
  const norm = vector => Math.sqrt(dot(vector, vector));
  const projection = (vector, onto, tolerance = EPSILON) => {
    if (assertVector(vector, 'vector') !== assertVector(onto, 'target vector')) fail('Vector dimensions must agree.', RangeError);
    const squaredNorm = dot(onto, onto);
    if (squaredNorm <= tolerance) fail('Cannot project onto the zero vector.', RangeError);
    const factor = dot(vector, onto) / squaredNorm;
    return onto.map(value => factor * value);
  };
  function echelon(matrix, tolerance = EPSILON) {
    if (!isFiniteNumber(tolerance) || tolerance < 0) fail('tolerance must be a non-negative finite number.', RangeError);
    const output = clone(matrix); const { rows, columns } = shape(output); let pivotRow = 0;
    for (let column = 0; column < columns && pivotRow < rows; column++) {
      let bestRow = pivotRow;
      for (let row = pivotRow + 1; row < rows; row++) if (Math.abs(output[row][column]) > Math.abs(output[bestRow][column])) bestRow = row;
      if (Math.abs(output[bestRow][column]) <= tolerance) continue;
      [output[pivotRow], output[bestRow]] = [output[bestRow], output[pivotRow]];
      for (let row = pivotRow + 1; row < rows; row++) {
        const factor = output[row][column] / output[pivotRow][column];
        output[row][column] = 0;
        for (let nextColumn = column + 1; nextColumn < columns; nextColumn++) output[row][nextColumn] -= factor * output[pivotRow][nextColumn];
      }
      pivotRow++;
    }
    return { matrix: output, pivots: pivotRow };
  }
  const rank = (matrix, tolerance = EPSILON) => echelon(matrix, tolerance).pivots;
  function rref(matrix, tolerance = EPSILON) {
    if (!isFiniteNumber(tolerance) || tolerance < 0) fail('tolerance must be a non-negative finite number.', RangeError);
    const output = clone(matrix); const { rows, columns } = shape(output); const steps = []; const pivots = []; let pivotRow = 0;
    const clean = () => output.forEach(row => row.forEach((value, index) => { if (Math.abs(value) <= tolerance) row[index] = 0; }));
    const record = step => { clean(); steps.push({ ...step, matrix: output.map(row => row.slice()) }); };
    for (let column = 0; column < columns && pivotRow < rows; column++) {
      let bestRow = pivotRow;
      for (let row = pivotRow + 1; row < rows; row++) if (Math.abs(output[row][column]) > Math.abs(output[bestRow][column])) bestRow = row;
      if (Math.abs(output[bestRow][column]) <= tolerance) continue;
      if (bestRow !== pivotRow) {
        [output[pivotRow], output[bestRow]] = [output[bestRow], output[pivotRow]];
        record({ type: 'swap', row: pivotRow, otherRow: bestRow });
      }
      const pivot = output[pivotRow][column];
      if (Math.abs(pivot - 1) > tolerance) {
        output[pivotRow] = output[pivotRow].map(value => value / pivot);
        record({ type: 'scale', row: pivotRow, factor: 1 / pivot });
      }
      for (let row = 0; row < rows; row++) {
        if (row === pivotRow) continue;
        const factor = output[row][column];
        if (Math.abs(factor) <= tolerance) continue;
        output[row] = output[row].map((value, index) => value - factor * output[pivotRow][index]);
        record({ type: 'replace', row, sourceRow: pivotRow, factor: -factor });
      }
      pivots.push(column);
      pivotRow++;
    }
    clean();
    return { matrix: output, pivots, steps };
  }
  function solveLinearSystem(matrix, vector, tolerance = EPSILON) {
    const { rows, columns } = assertMatrix(matrix, 'coefficient matrix');
    if (assertVector(vector, 'constant vector') !== rows) fail('Coefficient matrix rows and constant vector dimensions must agree.', RangeError);
    const augmented = matrix.map((row, index) => [...row, vector[index]]);
    const reduced = rref(augmented, tolerance);
    const rankA = rank(matrix, tolerance); const rankAugmented = rank(augmented, tolerance);
    let classification; let solution = null;
    if (rankA < rankAugmented) classification = 'inconsistent';
    else if (rankA < columns) classification = 'infinite';
    else {
      classification = 'unique'; solution = Array(columns).fill(0);
      reduced.pivots.forEach((column, row) => { if (column < columns) solution[column] = reduced.matrix[row][columns]; });
    }
    return { augmented, rref: reduced.matrix, pivots: reduced.pivots, steps: reduced.steps, rankA, rankAugmented, classification, solution };
  }
  function leastSquares(matrix, vector, tolerance = EPSILON) {
    const { rows } = assertMatrix(matrix, 'design matrix');
    if (assertVector(vector, 'observation vector') !== rows) fail('Design matrix rows and observation vector dimensions must agree.', RangeError);
    if (!isFiniteNumber(tolerance) || tolerance < 0) fail('tolerance must be a non-negative finite number.', RangeError);
    const transposed = transpose(matrix); const normalMatrix = multiply(transposed, matrix); const normalVector = multiplyVector(transposed, vector);
    const normalSolution = solveLinearSystem(normalMatrix, normalVector, tolerance);
    if (normalSolution.classification !== 'unique') return { classification: normalSolution.classification, coefficients: null, fitted: null, residual: null, sse: null, r2: null, normalMatrix, normalVector, normalSolution };
    const coefficients = normalSolution.solution; const fitted = multiplyVector(matrix, coefficients); const residual = vector.map((value, index) => value - fitted[index]); const sse = dot(residual, residual);
    const mean = vector.reduce((sum, value) => sum + value, 0) / vector.length; const totalSumSquares = vector.reduce((sum, value) => sum + (value - mean) ** 2, 0);
    const r2 = totalSumSquares <= tolerance ? (sse <= tolerance ? 1 : 0) : 1 - sse / totalSumSquares;
    return { classification: 'unique', coefficients, fitted, residual, sse, r2, normalMatrix, normalVector, normalSolution };
  }
  function qr2x2(matrix, tolerance = EPSILON) {
    const { rows, columns } = assertMatrix(matrix, 'matrix');
    if (rows !== 2 || columns !== 2) fail('qr2x2 requires a 2×2 matrix.', RangeError);
    if (!isFiniteNumber(tolerance) || tolerance < 0) fail('tolerance must be a non-negative finite number.', RangeError);

    const clean = value => Math.abs(value) <= tolerance ? 0 : value;
    const cleanVector = vector => vector.map(clean);
    const source = clone(matrix);
    const u = [source[0][0], source[1][0]];
    const v = [source[0][1], source[1][1]];
    const r11 = norm(u);
    const base = { source, u, v, rank: rank(source, tolerance), q1: null, q2: null, projection: null, residual: null, Q: null, R: null, reconstruction: null, orthogonality: null };

    if (r11 <= tolerance) {
      return {
        ...base,
        classification: 'dependent',
        reason: 'first-vector-zero',
        steps: [
          { id: 'source', matrix: source, u, v },
          { id: 'normalize-first', q1: null, message: 'The first column is zero, so Gram-Schmidt cannot start.' }
        ]
      };
    }

    const q1 = cleanVector(u.map(value => value / r11));
    const r12 = dot(q1, v);
    const projected = cleanVector(q1.map(value => value * r12));
    const residual = cleanVector(v.map((value, index) => value - projected[index]));
    const r22 = norm(residual);
    const commonSteps = [
      { id: 'source', matrix: source, u, v },
      { id: 'normalize-first', q1, r11 },
      { id: 'subtract-projection', r12, projection: projected, residual }
    ];

    if (r22 <= tolerance) {
      return {
        ...base,
        q1,
        projection: projected,
        residual,
        classification: 'dependent',
        reason: 'second-vector-dependent',
        steps: [...commonSteps, { id: 'normalize-second', q2: null, r22, message: 'The second orthogonal residual is zero.' }]
      };
    }

    const q2 = cleanVector(residual.map(value => value / r22));
    const Q = [[q1[0], q2[0]], [q1[1], q2[1]]];
    const R = [[clean(r11), clean(r12)], [0, clean(r22)]];
    const reconstruction = multiply(Q, R).map(cleanVector);
    const orthogonality = multiply(transpose(Q), Q).map(cleanVector);
    return {
      ...base,
      q1,
      q2,
      projection: projected,
      residual,
      Q,
      R,
      reconstruction,
      orthogonality,
      classification: 'independent',
      reason: null,
      steps: [...commonSteps, { id: 'normalize-second', q2, r22 }, { id: 'factorize', Q, R, reconstruction, orthogonality }]
    };
  }
  function pca2d(points, tolerance = EPSILON) {
    if (!Array.isArray(points) || points.length < 2) fail('pca2d requires at least two 2D points.', RangeError);
    if (!isFiniteNumber(tolerance) || tolerance < 0) fail('tolerance must be a non-negative finite number.', RangeError);
    const source = points.map((point, index) => {
      if (!Array.isArray(point) || point.length !== 2) fail(`points[${index}] must be a 2D vector.`, RangeError);
      assertVector(point, `points[${index}]`);
      return point.slice();
    });
    const count = source.length;
    const mean = [0, 1].map(axis => source.reduce((sum, point) => sum + point[axis], 0) / count);
    const centered = source.map(point => point.map((value, axis) => value - mean[axis]));
    const covariance = [[0, 0], [0, 0]];
    centered.forEach(point => {
      covariance[0][0] += point[0] * point[0]; covariance[0][1] += point[0] * point[1];
      covariance[1][0] += point[1] * point[0]; covariance[1][1] += point[1] * point[1];
    });
    covariance.forEach(row => row.forEach((value, index) => { row[index] = value / count; }));
    const totalVariance = covariance[0][0] + covariance[1][1];
    const base = { points: source, mean, centered, covariance, totalVariance, eigenvalues: [0, 0], components: null, scores: null, projected: null, residuals: null, explainedVariance: [0, 0] };
    if (totalVariance <= tolerance) return { ...base, classification: 'zero-variance' };

    const orient = vector => {
      const oriented = vector.slice();
      const firstNonZero = oriented.findIndex(value => Math.abs(value) > tolerance);
      if (firstNonZero >= 0 && oriented[firstNonZero] < 0) return oriented.map(value => -value);
      return oriented;
    };
    const eigen = symmetricEigen2x2(covariance[0][0], covariance[0][1], covariance[1][1]);
    const eigenvalues = eigen.values.map(value => Math.max(0, Math.abs(value) <= tolerance ? 0 : value));
    const components = eigen.vectors.map(orient);
    const scores = centered.map(point => components.map(component => dot(point, component)));
    const projected = scores.map(score => mean.map((value, axis) => value + score[0] * components[0][axis]));
    const residuals = source.map((point, index) => point.map((value, axis) => value - projected[index][axis]));
    const explainedVariance = eigenvalues.map(value => value / totalVariance);
    return { ...base, classification: Math.abs(eigenvalues[0] - eigenvalues[1]) <= tolerance ? 'isotropic' : 'ok', eigenvalues, components, scores, projected, residuals, explainedVariance };
  }
  const determinant = (matrix, tolerance = EPSILON) => {
    const { rows, columns } = assertMatrix(matrix);
    if (rows !== columns) fail('Determinant is defined only for square matrices.', RangeError);
    const output = clone(matrix); let sign = 1; let result = 1;
    for (let column = 0; column < columns; column++) {
      let bestRow = column;
      for (let row = column + 1; row < rows; row++) if (Math.abs(output[row][column]) > Math.abs(output[bestRow][column])) bestRow = row;
      if (Math.abs(output[bestRow][column]) <= tolerance) return 0;
      if (bestRow !== column) { [output[column], output[bestRow]] = [output[bestRow], output[column]]; sign *= -1; }
      const pivot = output[column][column]; result *= pivot;
      for (let row = column + 1; row < rows; row++) {
        const factor = output[row][column] / pivot;
        for (let nextColumn = column + 1; nextColumn < columns; nextColumn++) output[row][nextColumn] -= factor * output[column][nextColumn];
      }
    }
    return Math.abs(result) <= tolerance ? 0 : sign * result;
  };
  function inverse2x2(matrix, tolerance = EPSILON) {
    const { rows, columns } = assertMatrix(matrix);
    if (rows !== 2 || columns !== 2) fail('inverse2x2 requires a 2×2 matrix.', RangeError);
    if (!isFiniteNumber(tolerance) || tolerance < 0) fail('tolerance must be a non-negative finite number.', RangeError);
    const source = clone(matrix);
    const determinantValue = determinant(source, tolerance);
    if (Math.abs(determinantValue) <= tolerance) {
      return { matrix: source, determinant: 0, classification: 'singular', inverse: null };
    }
    const inverse = [
      [source[1][1] / determinantValue, -source[0][1] / determinantValue],
      [-source[1][0] / determinantValue, source[0][0] / determinantValue]
    ];
    if (!inverse.flat().every(isFiniteNumber)) fail('inverse2x2 cannot represent the inverse with finite numbers.', RangeError);
    return { matrix: source, determinant: determinantValue, classification: 'invertible', inverse };
  }
  function symmetricEigen2x2(a, b, c) {
    [a, b, c].forEach(value => { if (!isFiniteNumber(value)) fail('Symmetric matrix entries must be finite.', RangeError); });
    const trace = a + c; const determinantValue = a * c - b * b;
    const discriminant = Math.sqrt(Math.max(0, trace * trace - 4 * determinantValue));
    const values = [(trace + discriminant) / 2, (trace - discriminant) / 2];
    const theta = Math.abs(b) > EPSILON ? Math.atan2(values[0] - a, b) : (a >= c ? 0 : Math.PI / 2);
    return { values, vectors: [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]], angle: theta };
  }
  function svd2x2(matrix) {
    const { rows, columns } = assertMatrix(matrix);
    if (rows !== 2 || columns !== 2) fail('svd2x2 requires a 2×2 matrix.', RangeError);
    const ata = multiply(transpose(matrix), matrix);
    const eigen = symmetricEigen2x2(ata[0][0], ata[0][1], ata[1][1]);
    const singularValues = eigen.values.map(value => Math.sqrt(Math.max(0, value)));
    const V = [[eigen.vectors[0][0], eigen.vectors[1][0]], [eigen.vectors[0][1], eigen.vectors[1][1]]];
    // For a zero singular value, A vᵢ / σᵢ is undefined. Complete U with the
    // orthogonal complement instead of an arbitrary axis so U remains orthogonal.
    let columnsU;
    if (singularValues[0] <= EPSILON) columnsU = [[1, 0], [0, 1]];
    else {
      const first = multiplyVector(matrix, eigen.vectors[0]).map(value => value / singularValues[0]);
      const firstNorm = norm(first);
      const u1 = first.map(value => value / firstNorm);
      if (singularValues[1] <= EPSILON) columnsU = [u1, [-u1[1], u1[0]]];
      else {
        const second = multiplyVector(matrix, eigen.vectors[1]).map(value => value / singularValues[1]);
        const secondNorm = norm(second);
        columnsU = [u1, second.map(value => value / secondNorm)];
      }
    }
    const U = [[columnsU[0][0], columnsU[1][0]], [columnsU[0][1], columnsU[1][1]]];
    return { U, S: [[singularValues[0], 0], [0, singularValues[1]]], V, singularValues, rightVectors: eigen.vectors, leftVectors: columnsU };
  }
  return { EPSILON, assertMatrix, assertVector, shape, clone, identity, transpose, multiply, multiplyVector, dot, norm, projection, rank, rref, solveLinearSystem, leastSquares, qr2x2, pca2d, determinant, inverse2x2, symmetricEigen2x2, svd2x2 };
});
