// page.js
// -------------------------------------------
// Entry point for the UI Demo page
// -------------------------------------------

import { initLazyLoad } from "./modules/lazyLoad.js";
import { initToolbarToggles } from "./modules/toolbar.js";

function addFadeInCleanup() {
  document.addEventListener("animationend", e => {
    if (e.target.classList.contains("fade-in")) {
      e.target.classList.remove("fade-in");
    }
  });
}

function initPage() {
  initLazyLoad();
  initToolbarToggles();
  addFadeInCleanup();
  console.log("%c[UI Demo]%c Initialized successfully", "color: lime", "color: inherit");
}

document.addEventListener("DOMContentLoaded", initPage);
