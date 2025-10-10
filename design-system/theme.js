/**
 * Theme Engine — lightweight and framework-agnostic
 * Works with data-theme and data-mode attributes on <html>
 * Requires your CSS token system already loaded.
 */

(() => {
  const root = document.documentElement;

  // 1. Available theme presets
  const themes = ["ocean", "sunset", "forest"];

  // 2. Simple helpers
  const setTheme = (name) => {
    if (!themes.includes(name)) return;
    root.dataset.theme = name;
    localStorage.setItem("theme-name", name);
  };

  const setMode = (mode) => {
    root.dataset.mode = mode; // "light" or "dark"
    localStorage.setItem("theme-mode", mode);
  };

  const toggleMode = () => {
    const current = root.dataset.mode === "dark" ? "light" : "dark";
    setMode(current);
  };

  const nextTheme = () => {
    const current = root.dataset.theme || themes[0];
    const idx = themes.indexOf(current);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  // 3. Restore user preference on load
  const storedTheme = localStorage.getItem("theme-name");
  const storedMode = localStorage.getItem("theme-mode");

  if (storedTheme && themes.includes(storedTheme)) {
    root.dataset.theme = storedTheme;
  } else {
    root.dataset.theme = themes[0];
  }

  if (storedMode) {
    root.dataset.mode = storedMode;
  } else {
    // Default: match system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.mode = prefersDark ? "dark" : "light";
  }

  // 4. Smooth transition effect
  const addTransition = () => {
    root.style.transition = "color 0.4s ease, background-color 0.4s ease, filter 0.4s ease";
    setTimeout(() => (root.style.transition = ""), 600);
  };

  // 5. Optional keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.key === "t") { addTransition(); toggleMode(); }
    if (e.key === "n") { addTransition(); nextTheme(); }
  });

  // 6. Expose small API globally
  window.themeEngine = { setTheme, setMode, toggleMode, nextTheme };
})();
