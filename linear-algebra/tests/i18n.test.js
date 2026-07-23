const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('every declared translation key has Chinese and English values', () => {
  const keys = [...html.matchAll(/data-i18n(?:-title|-aria-label)?="([^"]+)"/g)].map(match => match[1]);
  assert.ok(keys.length > 0);
  for (const key of new Set(keys)) {
    const occurrences = [...app.matchAll(new RegExp(`\\b${key}\\s*:`, 'g'))].length;
    assert.ok(occurrences >= 2, `${key} must have values in both language dictionaries`);
  }
});

test('known mixed-language content is translated and language is applied on startup', () => {
  assert.match(html, /<h1 data-i18n="hero_title">Understand Linear Algebra Through Geometry, Relationships, and Change<\/h1>/);
  assert.match(app, /hero_title:\s*"在图形、关系与变化中，理解线性代数"/);
  assert.match(app, /hero_title:\s*"Understand Linear Algebra Through Geometry, Relationships, and Change"/);
  assert.match(html, /data-i18n="t_spectral_desc"/);
  assert.match(html, /data-i18n="lbl_sigma_1"/);
  assert.match(html, /data-i18n="lbl_sigma_2"/);
  assert.match(html, /data-i18n="sim_pca_title"/);
  assert.match(html, /data-i18n-aria-label="aria_pca_canvas"/);
  assert.match(app, /applyLanguage\(appState\.lang\)/);
  assert.match(app, /data-i18n-aria-label/);
  assert.match(app, /refreshThemeControl\(\)/);
  assert.match(app, /refreshPhoneticsControl\(\)/);
});

test('matrix transform controls and every cheatsheet card are connected to i18n', () => {
  const requiredKeys = [
    'lbl_transform_matrix',
    'preset_transform_identity',
    'preset_transform_rotation',
    'preset_transform_shear',
    'preset_transform_scale',
    'preset_transform_singular',
    'preset_transform_reflection',
    'lbl_transform_determinant',
    'lbl_transform_trace',
    'lbl_transform_rank',
    'cheat_matrix_ops_title',
    'cheat_subspaces_title',
    'cheat_pd_title',
    'cheat_svd_title',
    'cheat_least_squares_title',
    'cheat_pitfalls_title',
    'cheat_pitfall_1_title',
    'cheat_pitfall_2_title'
  ];

  requiredKeys.forEach(key => {
    assert.match(html, new RegExp(`data-i18n="${key}"`), `${key} must be bound in the page`);
    assert.equal([...app.matchAll(new RegExp(`\\b${key}\\s*:`, 'g'))].length, 2, `${key} must have both translations`);
  });
});

test('floating watermark exposes an accessible feedback panel with contact links', () => {
  const feedbackKeys = [
    'feedback_title',
    'feedback_email_label',
    'feedback_github_label',
    'title_feedback_toggle',
    'aria_feedback_toggle',
    'title_feedback_close',
    'aria_feedback_close'
  ];

  feedbackKeys.forEach(key => {
    assert.equal([...app.matchAll(new RegExp(`\\b${key}\\s*:`, 'g'))].length, 2, `${key} must have both translations`);
  });
  assert.match(html, /<button class="floating-watermark-badge" id="feedbackToggle" type="button" aria-controls="watermarkFeedbackPanel" aria-expanded="false"/);
  assert.match(html, /<section class="feedback-panel" id="watermarkFeedbackPanel" aria-labelledby="feedbackWidgetTitle" hidden>/);
  assert.match(html, /href="mailto:lyuxiaomeng701@gmail\.com"/);
  assert.match(html, /href="https:\/\/github\.com\/Shermen701" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /<svg class="feedback-github-icon" viewBox="0 0 16 16" aria-hidden="true">/);
  assert.match(html, /class="feedback-contact-content"/);
  assert.doesNotMatch(html, /feedback-contact-button/);
  assert.match(app, /initFeedbackWidget\(\)/);
  assert.match(app, /getElementById\('watermarkFeedbackPanel'\)/);
  assert.match(app, /event\.key === 'Escape'/);
});

test('visible copy uses neutral learning language instead of interview framing', () => {
  const visibleHtml = html.replace(/<!--[\s\S]*?-->/g, '');
  assert.doesNotMatch(visibleHtml, /面试|interview/i);
  assert.doesNotMatch(app, /面试|interview/i);
  assert.match(app, /document\.title = i18n\[lang\]\.page_title/);
  assert.match(html, /data-i18n="quiz_explanation"/);
  assert.match(html, /data-i18n="cheat_pitfalls_title"/);
});
