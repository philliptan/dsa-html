import { usePrefersReducedMotion, useMediaQuery, getReadableTextColor, setCSSVar, initInspector, applyUtilityClass } from './utils.js';

// Initialize runtime inspector
document.addEventListener('DOMContentLoaded', () => {
  initInspector();

  // Demo: auto-change accent color based on width
  useMediaQuery('(max-width: 600px)', (small) => {
    setCSSVar('--color-accent', small ? 'hsl(340,80%,60%)' : 'hsl(280,80%,60%)');
  });

  // Demo: dynamic class injection
  const box = document.querySelector('#contrast-box');
  box.classList.add(applyUtilityClass('box-shadow', '0 4px 8px rgba(0,0,0,0.2)'));
});
