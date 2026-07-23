const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const matrix = require('../core/matrix.js');

function makeNode(value = '') {
  const listeners = new Map();
  return {
    value,
    classList: { toggle() {} },
    addEventListener(event, handler) { listeners.set(event, [...(listeners.get(event) || []), handler]); },
    removeEventListener(event, handler) { listeners.set(event, (listeners.get(event) || []).filter(candidate => candidate !== handler)); },
    setAttribute() {},
    removeAttribute() {},
    listenerCount(event) { return (listeners.get(event) || []).length; },
    dispatch(event) { (listeners.get(event) || []).forEach(handler => handler({})); }
  };
}

test('inverse listeners are cleaned up before reinitialization', () => {
  const nodes = new Map([
    ['invA11', makeNode('0')], ['invA12', makeNode('-1')], ['invA21', makeNode('1')], ['invA22', makeNode('0')],
    ['inverseBadge', makeNode()], ['inverseDeterminant', makeNode()], ['inverseAdjugate', makeNode()],
    ['inverseMatrix', makeNode()], ['inverseVerification', makeNode()], ['inverseCalloutText', makeNode()], ['inverseRecoveryState', makeNode()]
  ]);
  let inverseUpdates = 0;
  Object.defineProperty(nodes.get('inverseMatrix'), 'textContent', { set() { inverseUpdates++; } });
  const presetButtons = ['identity', 'rotation', 'shear', 'reflection', 'singular'].map(name => {
    const button = makeNode(); button.dataset = { inversePreset: name }; return button;
  });
  const windowListeners = new Map();
  const addWindowListener = (event, handler) => windowListeners.set(event, [...(windowListeners.get(event) || []), handler]);
  const removeWindowListener = (event, handler) => windowListeners.set(event, (windowListeners.get(event) || []).filter(candidate => candidate !== handler));
  let registered;
  const sandbox = {
    LinAlgLab: { matrix, modules: { register(module) { registered = module; } }, canvas: {} },
    addEventListener: addWindowListener,
    removeEventListener: removeWindowListener,
    document: {
      getElementById(id) { return nodes.get(id) || null; },
      querySelectorAll(selector) { return selector === '[data-inverse-preset]' ? presetButtons : []; }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'modules', 'inverse.js'), 'utf8'), sandbox);

  registered.init({ state: { lang: 'en' } });
  registered.destroy();
  registered.init({ state: { lang: 'en' } });
  assert.equal(nodes.get('invA11').listenerCount('input'), 1);
  assert.equal(presetButtons[0].listenerCount('click'), 1);
  assert.equal(windowListeners.get('resize').length, 1);

  inverseUpdates = 0;
  nodes.get('invA11').value = '2';
  nodes.get('invA11').dispatch('input');
  assert.equal(inverseUpdates, 1);
  registered.destroy();
  assert.equal(windowListeners.get('resize').length, 0);
});
