const test = require('node:test');
const assert = require('node:assert/strict');
const canvas = require('../core/canvas.js');

const luminance = hex => {
  const channels = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
};
const contrast = (first, second) => (Math.max(luminance(first), luminance(second)) + .05) / (Math.min(luminance(first), luminance(second)) + .05);

test('canvas palettes expose complete semantic colors and a readable light axis', () => {
  for (const theme of ['dark', 'light']) {
    const palette = canvas.getPalette(theme);
    for (const key of ['background', 'grid', 'axis', 'tick', 'guide', 'reference']) assert.ok(palette[key], `${theme} palette lacks ${key}`);
  }
  assert.ok(contrast(canvas.getPalette('light').axis, canvas.getPalette('light').background) >= 4.5);
});

test('canvas drag bindings are removed by their cleanup function', () => {
  const listeners = new Map();
  const target = {
    addEventListener(event, handler) { listeners.set(`${event}:${handler.name}`, handler); },
    removeEventListener(event, handler) { listeners.delete(`${event}:${handler.name}`); }
  };
  const previousRootListeners = { addEventListener: globalThis.addEventListener, removeEventListener: globalThis.removeEventListener };
  globalThis.addEventListener = target.addEventListener.bind(target);
  globalThis.removeEventListener = target.removeEventListener.bind(target);
  const fakeCanvas = { ...target, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) };
  const cleanup = canvas.enableDrag(fakeCanvas, () => {}, () => {});
  assert.equal(listeners.size, 6);
  cleanup();
  assert.equal(listeners.size, 0);
  globalThis.addEventListener = previousRootListeners.addEventListener;
  globalThis.removeEventListener = previousRootListeners.removeEventListener;
});
