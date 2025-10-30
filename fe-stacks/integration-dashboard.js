import { setupNavbar } from './organisms-navbar-extended.js';
import { setupSidebar } from './organisms-sidebar-extended.js';
import { setupModalV2 } from './organisms-modal-extended.js';
import { showToastV2 } from './organisms-toast-extended.js';
import { postService } from './services.js';
import { cachedFetch } from './services.js';

document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  setupSidebar();
  setupModalV2();

  const loadBtn = document.querySelector('#load-data-btn');
  loadBtn.addEventListener('click', async () => {
    try {
      showToastV2('Fetching data...', 'accent');
      const posts = await cachedFetch('posts', () => postService.getAll());
      console.log('Loaded posts:', posts);
      showToastV2(`Fetched ${posts.length} items!`, 'success');
    } catch (err) {
      showToastV2('Error fetching data', 'danger');
    }
  });

  // Persist sidebar + theme across reloads
  const theme = localStorage.getItem('theme');
  if (theme) document.documentElement.dataset.theme = theme;
});
