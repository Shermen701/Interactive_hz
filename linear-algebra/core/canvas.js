(function (root) {
  const lab = root.LinAlgLab = root.LinAlgLab || {};
  const palettes = {
    dark: {
      background: '#090d16', grid: 'rgba(255, 255, 255, 0.08)', axis: 'rgba(255, 255, 255, 0.35)',
      tick: 'rgba(255, 255, 255, 0.4)', guide: 'rgba(255, 255, 255, 0.15)', reference: 'rgba(255, 255, 255, 0.15)'
    },
    light: {
      background: '#ffffff', grid: 'rgba(71, 85, 105, 0.16)', axis: '#334155',
      tick: '#475569', guide: 'rgba(71, 85, 105, 0.46)', reference: 'rgba(71, 85, 105, 0.5)'
    }
  };
  const getPalette = theme => palettes[theme] || palettes.dark;
  const getActivePalette = () => getPalette(root.document && root.document.body && root.document.body.classList.contains('light-mode') ? 'light' : 'dark');
  function setupHiDPI(canvas) {
    const ratio = root.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width; const height = rect.height || canvas.height;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, width, height };
  }
  function drawGrid(ctx, width, height, origin, scale, palette = getActivePalette()) {
    if (typeof palette === 'string') palette = getActivePalette();
    ctx.strokeStyle = palette.grid; ctx.lineWidth = 1;
    for (let x = origin.x % scale; x < width; x += scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = origin.y % scale; y < height; y += scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    ctx.strokeStyle = palette.axis; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(width, origin.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, height); ctx.stroke();
    ctx.font = '10px Inter, sans-serif'; ctx.fillStyle = palette.tick;
    for (let index = -5; index <= 5; index++) if (index !== 0) { ctx.fillText(index, origin.x + index * scale - 4, origin.y + 14); ctx.fillText(-index, origin.x - 14, origin.y + index * scale + 4); }
  }
  function drawVector(ctx, origin, vector, scale, color, width, label) {
    const x = origin.x + vector[0] * scale; const y = origin.y - vector[1] * scale; const angle = Math.atan2(origin.y - y, x - origin.x);
    ctx.shadowColor = color; ctx.shadowBlur = 6; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12 * Math.cos(angle - Math.PI / 6), y + 12 * Math.sin(angle - Math.PI / 6)); ctx.lineTo(x - 12 * Math.cos(angle + Math.PI / 6), y + 12 * Math.sin(angle + Math.PI / 6)); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    if (label) { ctx.font = '600 13px Inter, sans-serif'; ctx.fillStyle = color; ctx.fillText(label, x + 8, y - 8); }
  }
  function gridPosition(canvas, event, scale = 40) { const rect = canvas.getBoundingClientRect(); const point = event.touches ? event.touches[0] : event; return { x: (point.clientX - rect.left - rect.width / 2) / scale, y: (rect.height / 2 - (point.clientY - rect.top)) / scale }; }
  function enableDrag(canvas, onMove, onEnd, scale = 40) {
    if (!canvas) return () => {}; let active = false;
    const start = event => { active = true; onMove(gridPosition(canvas, event, scale), true); };
    const move = event => { if (active) { event.preventDefault(); onMove(gridPosition(canvas, event, scale), false); } };
    const end = () => { if (active) { active = false; onEnd(); } };
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); root.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: true }); canvas.addEventListener('touchmove', move, { passive: false }); root.addEventListener('touchend', end);
    return () => {
      active = false;
      canvas.removeEventListener('mousedown', start); canvas.removeEventListener('mousemove', move); root.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start); canvas.removeEventListener('touchmove', move); root.removeEventListener('touchend', end);
    };
  }
  lab.canvas = { getPalette, getActivePalette, setupHiDPI, drawGrid, drawVector, gridPosition, enableDrag };
  if (typeof module !== 'undefined' && module.exports) module.exports = lab.canvas;
})(typeof globalThis !== 'undefined' ? globalThis : this);
