Got it 👌 — we’ll pause the chart system here (it’s already powerful and modular) and move on to the **next layer of components** that make your dashboard feel complete, usable, and enterprise-ready.

Here’s what’s next in our component roadmap:

---

## 🧩 Next Component Set Overview

We’ll now build out **functional UI components** beyond data visualization:

1. **Notification Toasts** — ephemeral success/error/info banners.
2. **Modal Dialogs** — confirmations and detailed popups.
3. **Tabs / Navigation Panel** — for switching views within the main area.
4. **Empty State / Error Components** — UX fallback patterns.

All of these will follow your **tokens, base, and layout system**, ensuring visual harmony and scalability.

---

## 🧱 Step 8: Notification Toast System

### 🎯 Purpose

* Deliver transient messages (success, warning, error, info).
* Auto-dismiss after timeout, with accessible announcements.
* Non-blocking and theme-aware.

---

### `/src/components/Toast.js`

```js
// Toast.js
export function createToast({ message, type = 'info', duration = 3000 }) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  const container =
    document.querySelector('.toast-container') ||
    (() => {
      const c = document.createElement('div');
      c.className = 'toast-container';
      document.body.appendChild(c);
      return c;
    })();

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);

  return toast;
}
```

---

### `/styles/components.css` additions

```css
.toast-container {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  z-index: var(--z-toast);
}

.toast {
  opacity: 0;
  transform: translateY(-10px);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-bg);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-in-out);
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-info { background: var(--color-primary); }
.toast-success { background: var(--color-success); }
.toast-warning { background: var(--color-warning); }
.toast-error { background: var(--color-error); }
```

---

### Usage Example

```js
import { createToast } from './components/Toast.js';

createToast({ message: 'Data loaded successfully', type: 'success' });
```

---

## 🧩 Step 9: Modal Component (Dialog)

### `/src/components/Modal.js`

```js
// Modal.js
export function createModal({ title, content, onConfirm, onCancel }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.tabIndex = -1;

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('header');
  header.className = 'modal-header split';
  header.innerHTML = `<h3>${title}</h3>`;

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.innerHTML = content;

  const footer = document.createElement('footer');
  footer.className = 'modal-footer cluster justify-end';
  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.className = 'btn-primary';
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';

  footer.append(cancelBtn, confirmBtn);
  modal.append(header, body, footer);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  confirmBtn.addEventListener('click', () => {
    onConfirm?.();
    closeModal();
  });

  cancelBtn.addEventListener('click', () => {
    onCancel?.();
    closeModal();
  });

  const closeModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  return overlay;
}
```

---

### Modal Styling

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-in-out);
}

.modal-overlay.show {
  opacity: 1;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  max-width: 32rem;
  width: 90%;
  box-shadow: var(--shadow-lg);
  transform: translateY(-10px);
  transition: transform var(--duration-base) var(--ease-in-out);
}

.modal-overlay.show .modal {
  transform: translateY(0);
}

.modal-footer button {
  margin-left: var(--space-sm);
}
```

---

## 🧩 Step 10: Tabs / Navigation Component

```js
// Tabs.js
export function createTabs({ tabs }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs';

  const tabList = document.createElement('div');
  tabList.className = 'tab-list';

  const panels = document.createElement('div');
  panels.className = 'tab-panels';

  tabs.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.textContent = t.label;
    btn.className = 'tab-btn';
    if (i === 0) btn.classList.add('active');

    const panel = document.createElement('div');
    panel.className = 'tab-panel';
    panel.hidden = i !== 0;
    panel.append(t.content);

    btn.addEventListener('click', () => {
      [...tabList.children].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      [...panels.children].forEach(p => (p.hidden = true));
      panel.hidden = false;
    });

    tabList.append(btn);
    panels.append(panel);
  });

  wrapper.append(tabList, panels);
  return wrapper;
}
```

### Tabs Styling

```css
.tabs {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.tab-list {
  display: flex;
  gap: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  background: none;
  border: none;
  padding: var(--space-xs) var(--space-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
  transition: color var(--duration-fast), border-color var(--duration-fast);
}

.tab-btn:hover,
.tab-btn.active {
  color: var(--color-text);
  border-color: var(--color-accent);
}
```

---

## 🧩 Step 11: Empty / Error State Components

```js
// EmptyState.js
export function createEmptyState({ icon = '📭', title, message }) {
  const div = document.createElement('div');
  div.className = 'empty-state center stack';
  div.innerHTML = `
    <div class="icon">${icon}</div>
    <h3>${title}</h3>
    <p>${message}</p>
  `;
  return div;
}
```

```css
.empty-state {
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
  text-align: center;
}

.empty-state .icon {
  font-size: 2rem;
}
```

---

## 💡 Quick Summary

| Component       | Role                   | UX Benefit             |
| --------------- | ---------------------- | ---------------------- |
| **Toast**       | Non-blocking feedback  | Keeps users informed   |
| **Modal**       | Confirmation / focus   | Prevents mistakes      |
| **Tabs**        | Content grouping       | Cleaner navigation     |
| **Empty State** | Placeholder / fallback | Clarity in sparse data |

---

✅ **You now have a full dashboard component library**:

* Structural (Header, Drawer, Main, Footer)
* Functional (Cards, Charts, Analytics Panel)
* Feedback/UI (Toasts, Modals, Tabs, Empty States)

---

Would you like to **continue** with **user interaction enhancements** (like keyboard shortcuts, command palette, or global search),
or go **deep** into **UI state management patterns** (contextual UI sync, focus rings, and transition coordination)?

To push the system forward you can now add an *interaction layer* that makes the dashboard feel fast and cohesive without over-engineering.
We’ll look at **UI state management** and **interaction enhancement patterns**—the glue between components.

---

## 🧩 Deep Dive – UI State & Interaction Layer

### 1. **Central UI State**

Keep transient UI states (modal open, active tab, keyboard focus, toast stack) separate from your data store.

```js
// uiState.js
const listeners = new Set();

export const uiState = {
  state: { modal: null, tab: 'overview', focused: null },
  subscribe(fn) {
    listeners.add(fn);
    fn(this.state);
    return () => listeners.delete(fn);
  },
  set(partial) {
    this.state = { ...this.state, ...partial };
    listeners.forEach(fn => fn(this.state));
  },
};
```

Each visual component can subscribe or update this state instead of querying DOM directly.

---

### 2. **Keyboard Shortcuts**

Provide global keyboard access without breaking accessibility.

```js
// shortcuts.js
import { uiState } from './uiState.js';
import { createModal } from './components/Modal.js';
import { createToast } from './components/Toast.js';

export function registerShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      uiState.set({ modal: 'search' });
      createModal({
        title: 'Quick Search',
        content: '<input type="text" placeholder="Type to search…" autofocus />',
        onCancel: () => uiState.set({ modal: null }),
      });
    }
    if (e.key === '?' && e.shiftKey) {
      e.preventDefault();
      createToast({ message: 'Shortcuts: / search, ? help', type: 'info' });
    }
  });
}
```

Call `registerShortcuts()` once in `App.js`.
This gives instant keyboard usability and a “power-user” feel.

---

### 3. **Focus & Transition Coordination**

Smoothly handle focus shifts when modals, drawers, or tabs open.

```js
// focusManager.js
export function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  container.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
  first?.focus();
}
```

Call this inside `createModal` or when the drawer opens to keep tabbing contained.

---

### 4. **Coordinated Transitions**

When multiple components animate together (e.g., panel fades while toast slides), use a shared “transition queue” to avoid visual clash.

```js
// transitionQueue.js
let queue = Promise.resolve();

export function runTransition(fn) {
  queue = queue.then(
    () =>
      new Promise(resolve => {
        fn();
        setTimeout(resolve, 250); // match var(--duration-base)
      })
  );
}
```

Use:

```js
runTransition(() => card.classList.add('flash'));
```

Now UI motion never overlaps chaotically.

---

### 5. **State-Linked Classes**

Instead of direct DOM queries, link state to classes automatically.

```js
uiState.subscribe(s => {
  document.body.classList.toggle('modal-open', !!s.modal);
  document.body.dataset.activeTab = s.tab;
});
```

In CSS:

```css
body.modal-open {
  overflow: hidden;
}
body[data-active-tab='analytics'] .analytics-panel {
  outline: 2px solid var(--color-accent);
}
```

---

### 6. **Accessibility Enhancements**

* Announce state changes:

  ```js
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.className = 'sr-only';
  document.body.append(announcer);
  uiState.subscribe(s => (announcer.textContent = `Tab: ${s.tab}`));
  ```

* Maintain visible focus: always style `:focus-visible` and never remove outlines.
* Use `prefers-reduced-motion` to disable heavy transitions:

  ```css
  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
  }
  ```

---

### 7. **Persistent UI Preferences**

Store lightweight UI choices (active tab, theme, drawer state) locally.

```js
uiState.subscribe(s => localStorage.setItem('uiState', JSON.stringify(s)));
const saved = localStorage.getItem('uiState');
if (saved) uiState.state = JSON.parse(saved);
```

This keeps the interface consistent between visits.

---

### 8. **Pattern Recap**

| Feature            | Technique                    | UX Gain                              |
| ------------------ | ---------------------------- | ------------------------------------ |
| Global UI state    | `uiState` store              | Predictable, modular interactions    |
| Keyboard shortcuts | `/` for search, `?` for help | Power-user efficiency                |
| Focus trap         | `trapFocus()`                | Full keyboard accessibility          |
| Transition queue   | `runTransition()`            | Smooth, coordinated motion           |
| Linked classes     | body data-state              | Easier theming & conditional styling |
| Persistent prefs   | localStorage sync            | Feels personal and consistent        |

---

With this layer your app feels like a **real desktop-grade interface**:
smooth, reactive, keyboard-driven, and accessible—all without a heavy framework.

---

Would you like to **continue** by adding a **command palette / global search overlay** (à la VS Code or Linear), or move to **auth / user-profile components** next (avatar, dropdown menu, sign-in modal)?
