/**
 * Hue-morphing Theme Engine
 * - Animates hue variables for a smooth visual shift
 * - Keeps localStorage persistence
 * - Works with your OKLCH token system
 */

(() => {
  const root = document.documentElement;

  // Theme definitions: each is just hue triplets
  const themes = {
    ocean: { primary: 205, accent: 175, neutral: 240 },
    sunset: { primary: 15, accent: 35, neutral: 25 },
    forest: { primary: 140, accent: 90, neutral: 120 }
  };

  // ---------- helpers ----------
  const setMode = (mode) => {
    root.dataset.mode = mode;
    localStorage.setItem("theme-mode", mode);
  };

  const toggleMode = () =>
    setMode(root.dataset.mode === "dark" ? "light" : "dark");

  const getCurrentTheme = () =>
    root.dataset.theme || Object.keys(themes)[0];

  const setThemeInstant = (name) => {
    const t = themes[name];
    if (!t) return;
    root.style.setProperty("--hue-primary", t.primary);
    root.style.setProperty("--hue-accent", t.accent);
    root.style.setProperty("--hue-neutral", t.neutral);
    root.dataset.theme = name;
    localStorage.setItem("theme-name", name);
  };

  // Animate hues numerically over 600 ms
  const morphTheme = (target) => {
    const start = {
      p: parseFloat(getComputedStyle(root).getPropertyValue("--hue-primary")),
      a: parseFloat(getComputedStyle(root).getPropertyValue("--hue-accent")),
      n: parseFloat(getComputedStyle(root).getPropertyValue("--hue-neutral"))
    };
    const end = themes[target];
    if (!end) return;

    const dur = 600;
    const t0 = performance.now();

    const step = (now) => {
      const f = Math.min((now - t0) / dur, 1);
      const ease = 0.5 - Math.cos(f * Math.PI) / 2; // easeInOut
      root.style.setProperty("--hue-primary", start.p + (end.primary - start.p) * ease);
      root.style.setProperty("--hue-accent", start.a + (end.accent - start.a) * ease);
      root.style.setProperty("--hue-neutral", start.n + (end.neutral - start.n) * ease);
      if (f < 1) requestAnimationFrame(step);
      else {
        root.dataset.theme = target;
        localStorage.setItem("theme-name", target);
      }
    };
    requestAnimationFrame(step);
  };

  const nextTheme = () => {
    const keys = Object.keys(themes);
    const i = keys.indexOf(getCurrentTheme());
    morphTheme(keys[(i + 1) % keys.length]);
  };

  // ---------- restore saved preferences ----------
  const storedName = localStorage.getItem("theme-name");
  const storedMode = localStorage.getItem("theme-mode");

  if (storedName && themes[storedName]) setThemeInstant(storedName);
  else setThemeInstant(Object.keys(themes)[0]);

  if (storedMode) root.dataset.mode = storedMode;
  else root.dataset.mode = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  // ---------- keyboard shortcuts ----------
  window.addEventListener("keydown", (e) => {
    if (e.key === "t") toggleMode();
    if (e.key === "n") nextTheme();
  });

  // expose API
  window.themeEngine = { morphTheme, nextTheme, toggleMode, setMode };
})();
