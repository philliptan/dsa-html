// page.js
import { useModule } from "./modules/registry.js";

async function initPage() {
  const { initLazyLoad } = await useModule("/modules/lazyLoad.js");
  const { initToolbarToggles } = await useModule("/modules/toolbar.js");

  initLazyLoad();
  initToolbarToggles();
}

document.addEventListener("DOMContentLoaded", initPage);
