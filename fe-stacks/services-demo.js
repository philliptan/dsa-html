import { postService, cachedFetch } from './services.js';
import { showToast } from './features.js';

export function setupDataDemo() {
  const main = document.querySelector('.app-main');
  main.innerHTML = `
    <h1>Data Layer Demo</h1>
    <button id="load-posts" class="btn" data-variant="primary">Load Posts</button>
    <div id="posts-grid" class="grid" style="margin-top:var(--space-md);"></div>
  `;

  document.querySelector('#load-posts').addEventListener('click', async () => {
    try {
      const posts = await cachedFetch('posts', () => postService.getAll());
      renderPosts(posts);
      showToast('Posts loaded!', 'success');
    } catch (err) {
      showToast('Failed to load posts', 'danger');
      console.error(err);
    }
  });

  function renderPosts(posts) {
    const grid = document.querySelector('#posts-grid');
    grid.innerHTML = posts
      .map(
        (p) => `
      <div class="card" data-variant="outlined">
        <div class="card__header">${p.title.slice(0, 20)}</div>
        <p>${p.body.slice(0, 80)}...</p>
      </div>`
      )
      .join('');
  }
}
