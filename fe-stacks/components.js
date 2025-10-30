// ✅ Ripple + loading simulation
export function enableInteractiveComponents() {
  document.querySelectorAll('.btn').forEach(btn => {
    // Ripple
    btn.addEventListener('click', (e) => {
      if (btn.disabled || btn.dataset.state === 'loading') return;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      ripple.style.left = e.clientX - rect.left + 'px';
      ripple.style.top = e.clientY - rect.top + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });

    // Demo: loading simulation
    if (btn.dataset.action === 'load-demo') {
      btn.addEventListener('click', () => {
        btn.dataset.state = 'loading';
        btn.disabled = true;
        setTimeout(() => {
          btn.dataset.state = '';
          btn.disabled = false;
        }, 2000);
      });
    }
  });
}
