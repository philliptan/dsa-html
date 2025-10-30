const themes = ["light", "dark", "brand"];
let current = 0;

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// Sync with system preference
function syncSystemTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  if (prefersDark.matches && !localStorage.getItem("theme")) {
    applyTheme("dark");
  }
}

// Live hue update
function setHue(hue) {
  document.documentElement.style.setProperty("--hue", hue);
  localStorage.setItem("hue", hue);
}

document.addEventListener("DOMContentLoaded", () => {
  syncSystemTheme();

  const savedTheme = localStorage.getItem("theme");
  const savedHue = localStorage.getItem("hue");
  if (savedTheme) applyTheme(savedTheme);
  if (savedHue) setHue(savedHue);

  document.querySelector("#theme-btn").addEventListener("click", () => {
    current = (current + 1) % themes.length;
    applyTheme(themes[current]);
  });

  const hueSlider = document.querySelector("#hue-slider");
  hueSlider.addEventListener("input", e => setHue(e.target.value));
});
