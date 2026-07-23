(function (root) {
  const cleanups = [];
  const finite = input => {
    const value = Number.parseFloat(input.value);
    if (Number.isFinite(value)) { input.removeAttribute('aria-invalid'); input.removeAttribute('title'); return true; }
    input.setAttribute('aria-invalid', 'true'); input.title = 'Please enter a finite number.'; return false;
  };
  root.LinAlgLab.interactions = {
    bind() {
      this.destroy();
      const on = (node, event, handler) => { node.addEventListener(event, handler); cleanups.push(() => node.removeEventListener(event, handler)); };
      document.querySelectorAll('[data-speak]').forEach(button => on(button, 'click', () => root.speakTerm(button.dataset.speak)));
      document.querySelectorAll('[data-action="matrix-preset"]').forEach(button => on(button, 'click', () => root.LinAlgLab.modules.invoke('transform', 'applyPreset', button.dataset.preset)));
      document.querySelectorAll('[data-action="svd-step"]').forEach(button => on(button, 'click', () => root.LinAlgLab.modules.invoke('svd', 'setStep', button.dataset.step)));
      document.querySelectorAll('input[type="number"]').forEach(input => on(input, 'input', () => finite(input)));
      return () => this.destroy();
    },
    destroy() { cleanups.splice(0).forEach(remove => remove()); },
    finite
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
