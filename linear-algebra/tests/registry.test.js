const test = require('node:test');
const assert = require('node:assert/strict');
const modules = require('../modules/registry.js');

test('module registry initializes once, refreshes, redraws, and can be reset', () => {
  const calls = [];
  modules.register({ id: 'lifecycle-test', init: context => calls.push(`init:${context.name}`), redraw: () => calls.push('redraw'), refresh: () => calls.push('refresh'), destroy: () => calls.push('destroy') });
  modules.initAll({ name: 'first' });
  modules.initAll({ name: 'second' });
  modules.redraw('lifecycle-test');
  modules.refreshAll();
  modules.destroyAll();
  modules.initAll({ name: 'after-destroy' });
  assert.deepEqual(calls, ['init:first', 'redraw', 'refresh', 'destroy', 'init:after-destroy']);
});
