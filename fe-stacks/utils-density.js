// utils-density.js
export function setDensity(level = 1) {
  document.documentElement.style.setProperty('--density-scale', level);
  localStorage.setItem('density', level);
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('density');
  if (saved) setDensity(saved);

  const densityToggle = document.querySelector('#density-slider');
  if (densityToggle) {
    densityToggle.addEventListener('input', (e) => setDensity(e.target.value));
  }
});
