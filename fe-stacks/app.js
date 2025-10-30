import { showToast } from './features.js';

// Simple hash-based router
export function setupAppShell() {
  const main = document.querySelector('.app-main');
  const routes = {
    '#home': renderHome,
    '#dashboard': renderDashboard,
    '#settings': renderSettings,
  };

  function navigate() {
    const hash = window.location.hash || '#home';
    const route = routes[hash] || renderHome;
    main.innerHTML = '';
    route(main);
  }

  window.addEventListener('hashchange', navigate);
  navigate();
}

/* --- Page views --- */
function renderHome(container) {
  container.innerHTML = `
    <h1>Welcome Home</h1>
    <p>This is your app shell base layout.</p>
    <button class="btn" data-variant="primary" id="go-dash">Go to Dashboard</button>
  `;
  container.querySelector('#go-dash').addEventListener('click', () => {
    location.hash = '#dashboard';
  });
}

function renderDashboard(container) {
  container.innerHTML = `
    <h1>Dashboard</h1>
    <p>Reusable components inside the shell.</p>
    <button class="btn" data-variant="accent" id="toast-btn">Show Toast</button>
  `;
  container.querySelector('#toast-btn').addEventListener('click', () =>
    showToast('Dashboard loaded!', 'accent')
  );
}

function renderSettings(container) {
  container.innerHTML = `
    <h1>Settings</h1>
    <label>Hue:</label>
    <input id="hue-slider" type="range" min="0" max="360" value="210">
  `;
  const slider = container.querySelector('#hue-slider');
  slider.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--hue', e.target.value);
    localStorage.setItem('hue', e.target.value);
  });
}
