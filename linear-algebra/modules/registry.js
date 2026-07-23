(function (root) {
  const lab = root.LinAlgLab = root.LinAlgLab || {};
  const modules = new Map();
  const initialized = new Set();
  lab.modules = {
    register(module) {
      if (!module || !module.id || typeof module.init !== 'function') throw new TypeError('A lab module needs an id and init function.');
      if (modules.has(module.id)) throw new Error(`Duplicate lab module: ${module.id}`);
      modules.set(module.id, module);
    },
    initAll(context) { modules.forEach((module, id) => { if (!initialized.has(id)) { module.init(context); initialized.add(id); } }); },
    get(id) { return modules.get(id); },
    invoke(id, method, ...args) { const feature = modules.get(id); return feature && typeof feature[method] === 'function' ? feature[method](...args) : undefined; },
    redraw(id) { if (id) return this.invoke(id, 'redraw'); modules.forEach(module => module.redraw && module.redraw()); },
    redrawAll() { this.redraw(); },
    refreshAll() { modules.forEach(module => module.refresh && module.refresh()); },
    destroyAll() { modules.forEach(module => module.destroy && module.destroy()); initialized.clear(); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = lab.modules;
})(typeof globalThis !== 'undefined' ? globalThis : this);
