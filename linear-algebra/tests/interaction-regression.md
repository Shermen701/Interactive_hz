# Linear Algebra Interaction Regression Checklist

Run this checklist in a browser after changes to `app.js`, `core/`, `modules/`, or CSS.

1. **Span** — drag each vector endpoint, then move every slider. Confirm values, determinant, status badge, and canvas update together. Repeat one drag on a touch device.
2. **Matrix transform** — set a matrix input, then select every preset. Confirm the grid, determinant, trace, rank, and invertibility explanation match the shown matrix.
3. **Matrix composition** — select every pair preset, switch both application orders, and edit each matrix. Confirm the product, row × column derivation, basis-vector link, and three stages stay synchronized without `NaN`.
4. **Inverse transformation** — select every preset and edit the matrix. Confirm invertible cases show the formula, both identity checks, and visual recovery; the singular preset must explicitly show that recovery is impossible, without a fake inverse or `NaN`.
5. **Eigen and SVD** — change the probe angle, use auto-find and start/pause sweep. For SVD, change inputs and select every decomposition step. Confirm displayed values and drawings update without console errors.
6. **Projection** — drag both vectors and set `u = (0, 0)`. The page must remain responsive and show a zero projection rather than `NaN`.
7. **Gram-Schmidt & QR** — drag both source vectors and adjust all four sliders. Use next step, auto complete, reset, and each preset. Confirm `QᵀQ`, `R`, and reconstruction appear for independent vectors; collinear and zero-first vectors must show a rank-deficient explanation without `NaN`. Repeat one drag with touch input.
8. **PCA dimensionality reduction** — drag all six points and load every preset. Confirm the mean, covariance, eigenvalues, principal direction, explained variance, 2D projection markers, and 1D projection strip update together. The near-zero-variance preset must explain the missing principal direction without `NaN`. Repeat one drag with touch input.
9. **Global controls** — switch theme and language on each tab, navigate through every tab, answer a quiz question, move forward/back, and retake it. In the composition, inverse, QR, and PCA experiments, language/theme changes must keep all data and current state unchanged.
10. **Responsive view** — repeat navigation and one Canvas drag at a narrow viewport. The navigation must scroll and controls must remain reachable.

Pass condition: no uncaught console error, no `NaN` in visible output, and all updated controls and canvases remain synchronized.
