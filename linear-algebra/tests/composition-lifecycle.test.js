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

test('composition listeners are cleaned up before reinitialization', () => {
  const nodes = new Map([
    ['compA11', makeNode('0')], ['compA12', makeNode('-1')], ['compA21', makeNode('1')], ['compA22', makeNode('0')],
    ['compB11', makeNode('1')], ['compB12', makeNode('1')], ['compB21', makeNode('0')], ['compB22', makeNode('1')],
    ['compositionBadge', makeNode()], ['compositionCalloutText', makeNode()], ['compositionProduct', makeNode()],
    ['compositionEquation', makeNode()], ['compositionMatrixFlow', makeNode()], ['compositionEntryCalculations', makeNode()], ['compositionBasisLink', makeNode()]
  ]);
  let productUpdates = 0;
  let derivationUpdates = 0;
  Object.defineProperty(nodes.get('compositionProduct'), 'textContent', { set() { productUpdates++; } });
  Object.defineProperty(nodes.get('compositionEntryCalculations'), 'innerHTML', { set() { derivationUpdates++; } });
  const orderButtons = [makeNode(), makeNode()];
  orderButtons[0].dataset = { compositionOrder: 'BA' };
  orderButtons[1].dataset = { compositionOrder: 'AB' };
  const presetButtons = ['rotateShear', 'shearScale', 'nonCommuting', 'commutingScales'].map(name => {
    const button = makeNode(); button.dataset = { compositionPreset: name }; return button;
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
      querySelectorAll(selector) {
        if (selector === '[data-composition-order]') return orderButtons;
        if (selector === '[data-composition-preset]') return presetButtons;
        return [];
      }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'modules', 'composition.js'), 'utf8'), sandbox);

  registered.init({ state: { lang: 'en' } });
  registered.destroy();
  registered.init({ state: { lang: 'en' } });
  assert.equal(nodes.get('compA11').listenerCount('input'), 1);
  assert.equal(orderButtons[0].listenerCount('click'), 1);
  assert.equal(windowListeners.get('resize').length, 1);

  productUpdates = 0;
  derivationUpdates = 0;
  nodes.get('compA11').value = '2';
  nodes.get('compA11').dispatch('input');
  assert.equal(productUpdates, 1);
  assert.equal(derivationUpdates, 1);
});
