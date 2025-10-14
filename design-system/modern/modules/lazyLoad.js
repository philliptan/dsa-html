// js/lazyLoad.js
// -------------------------------------------
// Lazy-load component demos dynamically
// -------------------------------------------

export function initLazyLoad() {
  const demos = document.querySelectorAll(".component-demo");

  if (!("IntersectionObserver" in window)) {
    // Fallback for old browsers — load everything at once
    demos.forEach(loadDemo);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      loadDemo(el);
      obs.unobserve(el);
    });
  }, { rootMargin: "100px" });

  demos.forEach(demo => observer.observe(demo));
}

function getComponentDemoPath(el) {
  if (!el) return;

  return `/demos/${el.dataset.demo}.html`;
}

export async function loadDemo(el) {
  const src = getComponentDemoPath(el);
  if (!src || el.dataset.loaded) return;

  const container = el.querySelector(".demo-area");
  container.classList.add("loading");

  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(res.statusText);

    const html = await res.text();
    container.innerHTML = html;
    el.dataset.loaded = "true";
    container.classList.remove("loading");
    container.classList.add("fade-in");
  } catch (err) {
    container.textContent = "⚠️ Failed to load demo.";
    console.error(`[LazyLoad] Failed: ${src}`, err);
  }
}
