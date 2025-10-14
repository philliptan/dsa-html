// modules/toolbar.js
export function initToolbarToggles() {
  document.querySelectorAll(".component-demo").forEach(demo => {
    demo.addEventListener("click", e => {
      const btn = e.target.closest(".toolbar-btn");
      if (!btn) return;

      const type = btn.textContent.trim().toLowerCase();
      const codeBlock = demo.querySelector(`.code-${type}`);
      if (!codeBlock) return;

      const isVisible = codeBlock.style.display === "block";
      codeBlock.style.display = isVisible ? "none" : "block";
    });
  });
}
