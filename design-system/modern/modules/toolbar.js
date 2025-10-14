// js/toolbar.js
// -------------------------------------------
// Toolbar code toggles
// -------------------------------------------

export function initToolbarToggles() {
  document.addEventListener("click", e => {
    const btn = e.target.closest(".toolbar-btn");
    if (!btn) return;

    const demo = btn.closest(".component-demo");
    const type = btn.textContent.trim().toLowerCase();
    const codeBlock = demo.querySelector(`.code-${type}`);

    if (codeBlock) {
      const isVisible = codeBlock.style.display === "block";
      codeBlock.style.display = isVisible ? "none" : "block";
    }
  });
}
