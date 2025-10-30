// === Accessible Modal ===
export function setupModal() {
  const backdrop = document.querySelector('#modal-backdrop');
  const modal = backdrop.querySelector('.modal');
  const openBtn = document.querySelector('#open-modal-btn');
  const closeBtn = document.querySelector('#close-modal-btn');
  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    backdrop.setAttribute('data-open', 'true');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.focus();
  }

  function closeModal() {
    backdrop.setAttribute('data-open', 'false');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  // Click + ESC + focus trap
  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => e.target === backdrop && closeModal());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.dataset.open === 'true') closeModal();
    if (e.key === 'Tab' && backdrop.dataset.open === 'true') trapFocus(e, modal);
  });
}

// Trap focus inside modal
function trapFocus(e, modal) {
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// === Toast System ===
let toastQueue = [];

export function showToast(message, variant = 'primary', duration = 4000) {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.dataset.variant = variant;
  toast.textContent = message;

  container.appendChild(toast);
  toastQueue.push(toast);

  // Remove after animation
  setTimeout(() => {
    toast.remove();
    toastQueue = toastQueue.filter(t => t !== toast);
  }, duration + 1000);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.className = 'toast-container';
  document.body.appendChild(div);
  return div;
}
