import { showToast } from './features.js';

export function setupLogin() {
  const form = document.querySelector('#login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    const pass = form.querySelector('input[type="password"]').value;

    if (!email || !pass) {
      showToast('Please fill all fields', 'danger');
      return;
    }

    showToast(`Welcome, ${email}!`, 'success');
  });
}
