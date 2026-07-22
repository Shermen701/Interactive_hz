(function (root) {
  const modules = new Map();
  const initialized = new Set();
  root.StatLab = root.StatLab || {};
  root.StatLab.modules = {
    register(module) {
      if (!module || !module.id || typeof module.init !== 'function') throw new TypeError('A module requires an id and init function.');
      if (modules.has(module.id)) throw new Error(`Module "${module.id}" is already registered.`);
      modules.set(module.id, module);
    },
    initAll(context) {
      modules.forEach((module, id) => {
        if (!initialized.has(id)) { module.init(context); initialized.add(id); }
      });
    },
    refreshAll(context) { modules.forEach(module => module.refresh && module.refresh(context)); },
    destroyAll() { modules.forEach(module => module.destroy && module.destroy()); initialized.clear(); }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
