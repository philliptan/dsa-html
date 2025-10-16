🔥 Nice — we’re moving into the **theming system**, one of the most fun and high-impact features in UX and front-end engineering.

This will take your app from “static good-looking” to **dynamic and personalized**, letting users switch between **Light**, **Dark**, and even **Custom Accent** themes — all powered by your existing design tokens.

---

## 🎨 Step 4: Theming System — Light / Dark / Custom Accent

### 🎯 Goals

* Allow **manual theme switching** (not just system preference).
* Use **CSS variables** for instant, smooth transitions.
* Keep themes **modular and composable** (no duplicated CSS).
* Add an accessible **theme toggle button** in the Header.

---

## 🧠 UX Notes (Designer’s POV)

* Theme toggles should give **immediate feedback** (color fade).
* Remember user choice via **localStorage**.
* Offer a **neutral transition** (not flash white/black when switching).
* Support color blindness or low-contrast users (future-ready).

---

## 🧱 Step 4.1 – Extend Tokens (`tokens.css`)

Add theme tokens and transition handling to the end of your file:

```css
/* -----------------------------
🌓 THEME VARIANTS
----------------------------- */
:root {
  --theme-transition: background-color var(--duration-slow) var(--ease-in-out),
                      color var(--duration-slow) var(--ease-in-out);
}

/* Light (default) */
:root[data-theme='light'] {
  --color-bg: hsl(0, 0%, 100%);
  --color-bg-alt: hsl(0, 0%, 97%);
  --color-surface: hsl(0, 0%, 98%);
  --color-border: hsl(0, 0%, 80%);
  --color-text: hsl(0, 0%, 10%);
  --color-text-muted: hsl(0, 0%, 40%);
}

/* Dark */
:root[data-theme='dark'] {
  --color-bg: hsl(0, 0%, 6%);
  --color-bg-alt: hsl(0, 0%, 10%);
  --color-surface: hsl(0, 0%, 14%);
  --color-border: hsl(0, 0%, 25%);
  --color-text: hsl(0, 0%, 90%);
  --color-text-muted: hsl(0, 0%, 65%);
}

/* Custom Accent */
:root[data-theme='ocean'] {
  --hue-primary: 195;
  --hue-accent: 175;
  --color-primary: hsl(var(--hue-primary), var(--sat-strong), 50%);
  --color-accent: hsl(var(--hue-accent), var(--sat-strong), 45%);
}
```

---

## 🧩 Step 4.2 – Update Header Component (`Header.js`)

Add a small **theme toggle control** next to your title.

```js
// Header.js
export function createHeader(onToggleDrawer) {
  const header = document.createElement('header');
  header.className = 'app-header split';

  const button = document.createElement('button');
  button.className = 'drawer-toggle';
  button.setAttribute('aria-controls', 'drawer');
  button.setAttribute('aria-expanded', 'false');
  button.textContent = '☰';

  const title = document.createElement('h1');
  title.textContent = 'Dashboard';

  // Theme switcher
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.textContent = '🌗';
  themeToggle.setAttribute('aria-label', 'Toggle theme');

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'ocean' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  // Restore saved theme
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.dataset.theme = saved;

  const left = document.createElement('div');
  left.className = 'cluster align-center';
  left.append(button, title);

  header.append(left, themeToggle);
  return header;
}
```

---

## 💅 Step 4.3 – Add Theme Transition Styling

In `/styles/base.css`, near the `body` selector, add:

```css
body {
  transition: var(--theme-transition);
}
```

Also, in `/styles/components.css`, make the toggle clean and modern:

```css
.theme-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-text);
  padding: var(--space-xs) var(--space-sm);
  transition: color var(--duration-fast) var(--ease-in-out);
}

.theme-toggle:hover {
  color: var(--color-accent);
}
```

---

## 🧠 Step 4.4 – UX Details

* The **theme transition** uses the same timing tokens (`--duration-slow`) you already defined — consistent motion = elegant UX.
* The **“ocean”** theme demonstrates how to extend hues for brand accents (you can add more themes easily).
* You can also detect system preferences initially with:

  ```js
  if (!localStorage.getItem('theme')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  }
  ```

---

## 🧩 Optional Bonus: Theme Indicator (UX polish)

You can add a subtle active state or label for clarity:

```css
[data-theme='light'] .theme-toggle::after { content: '☀️'; }
[data-theme='dark'] .theme-toggle::after { content: '🌙'; }
[data-theme='ocean'] .theme-toggle::after { content: '🌊'; }
```

---

## ✅ Results

| Mode  | Example Colors                | Use Case                          |
| ----- | ----------------------------- | --------------------------------- |
| Light | Clean, neutral, high contrast | Default for daylight / reading    |
| Dark  | Deep surfaces, bright accents | Low-light environments            |
| Ocean | Soft cyan tones               | Brand personality or “focus mode” |

---

Would you like to **continue** into the **data-driven cards** next (live metric widgets, charts, and interactions)?
Or go **deep** into **theme customization** (e.g., color picker, user presets, gradient themes)?
