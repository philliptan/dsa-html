// Prefers reduced motion
export function usePrefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Media query listener
export function useMediaQuery(query, callback) {
  const mq = window.matchMedia(query);
  callback(mq.matches);
  mq.addEventListener('change', e => callback(e.matches));
}

// Contrast helper
export function getReadableTextColor(bgHue, bgSat = 90, bgLight = 55) {
  const lightness = bgLight > 50 ? 10 : 98;
  return `hsl(${bgHue}, ${bgSat * 0.1}%, ${lightness}%)`;
}

// Safe CSS var setter
export function setCSSVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

// 🌈 Dynamic contrast toggle
export function toggleContrastMode() {
  const current = document.documentElement.getAttribute('data-contrast') || 'normal';
  const next = current === 'normal' ? 'high' : 'normal';
  document.documentElement.setAttribute('data-contrast', next);
  localStorage.setItem('contrast', next);
}

// 🧩 Runtime color inspector
export function initInspector() {
  const box = document.createElement('div');
  box.id = 'inspector';
  box.innerHTML = `
    <div><span style="background:var(--color-bg)"></span> BG</div>
    <div><span style="background:var(--color-primary)"></span> Primary</div>
    <div><span style="background:var(--color-accent)"></span> Accent</div>
    <button id="contrast-toggle">Toggle Contrast</button>
  `;
  document.body.appendChild(box);
  document.querySelector('#contrast-toggle').addEventListener('click', toggleContrastMode);
}

// Utility generator — apply `.u-{prop}-{value}`
export function applyUtilityClass(prop, value) {
  const cls = `u-${prop}-${value}`;
  const styleId = `util-${prop}-${value}`;
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `.${cls}{${prop}:${value}!important;}`;
    document.head.appendChild(style);
  }
  return cls;
}
