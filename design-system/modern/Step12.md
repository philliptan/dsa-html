Perfect 👌

Let’s move on to **Step 2 — Implementing the dynamic component loader system**, which will make your component browser actually **load, inject, and display** each component’s demo with its code and optional scripts.

---

## 🧩 Step 2 — Dynamic Component Loader Implementation

We’ll now add:

* ✅ `scripts/components.js` → the registry
* ✅ Updated `scripts/main.js` → dynamic loading logic for HTML + CSS + JS + code viewer

---

### 🗂 **File: `scripts/components.js`**

```js
// Registry of available components in the library.
// Each entry: { name: folderName, label: displayName }
export const components = [
  { name: 'button', label: 'Button' },
  { name: 'card', label: 'Card' },
  { name: 'table', label: 'Table' }
];
```

Later, just add:

```js
{ name: 'alert', label: 'Alert' }
```

…and the sidebar updates automatically.

---

### ⚙️ **File: `scripts/main.js` (enhanced)**

Replace your previous `main.js` with this modular version:

```js
import { components } from './components.js';

// --- DOM references ---
const drawer = document.querySelector('.app-drawer');
const toggle = document.querySelector('.drawer-toggle');
const backdrop = document.querySelector('.drawer-backdrop');
const list = document.querySelector('.component-list');
const title = document.getElementById('component-title');
const demo = document.getElementById('component-demo');
const codeViewer = document.getElementById('code-viewer');

// --- Populate sidebar ---
list.innerHTML = components
  .map(c => `<a href="#" data-component="${c.name}">${c.label}</a>`)
  .join('');

// --- Drawer toggle ---
toggle.addEventListener('click', () => {
  drawer.classList.toggle('open');
  backdrop.classList.toggle('active');
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', !expanded);
});

backdrop.addEventListener('click', () => {
  drawer.classList.remove('open');
  backdrop.classList.remove('active');
  toggle.setAttribute('aria-expanded', false);
});

// --- Component loading functions ---
async function loadComponent(name) {
  try {
    // Load HTML
    const res = await fetch(`components/${name}/${name}.html`);
    const html = await res.text();
    demo.innerHTML = html;

    // Update title
    title.textContent = name.charAt(0).toUpperCase() + name.slice(1);

    // Load CSS & JS
    await Promise.all([loadCSS(name), loadJS(name)]);

    // Hide code viewer
    codeViewer.classList.add('hidden');
    codeViewer.textContent = '';
  } catch (err) {
    demo.innerHTML = `<p style="color:red;">Failed to load ${name}</p>`;
    console.error(err);
  }
}

async function loadCSS(name) {
  if (document.querySelector(`style[data-component="${name}"]`)) return;
  try {
    const res = await fetch(`components/${name}/${name}.css`);
    if (!res.ok) return;
    const css = await res.text();
    const style = document.createElement('style');
    style.dataset.component = name;
    style.textContent = css;
    document.head.appendChild(style);
  } catch {}
}

async function loadJS(name) {
  try {
    const module = await import(`../components/${name}/${name}.js`);
    if (module.init) module.init();
  } catch {
    // No JS = fine
  }
}

// --- Sidebar click handler ---
list.addEventListener('click', async e => {
  const link = e.target.closest('a[data-component]');
  if (!link) return;
  e.preventDefault();
  const name = link.dataset.component;
  await loadComponent(name);
});

// --- Toolbar code viewer ---
['html', 'css', 'js'].forEach(type => {
  document.getElementById(`show-${type}`).addEventListener('click', async () => {
    const current = title.textContent.toLowerCase();
    if (!current || current === 'select a component') return;

    const path = `components/${current}/${current}.${type}`;
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('missing');
      const code = await res.text();
      codeViewer.textContent = code;
      codeViewer.classList.toggle('hidden');
    } catch {
      codeViewer.textContent = `No ${type.toUpperCase()} file for ${current}`;
      codeViewer.classList.remove('hidden');
    }
  });
});
```

---

### 🔍 What Happens Now

* Sidebar list is auto-generated from the registry.
* Clicking a component:

  * Loads its HTML → displays it.
  * Dynamically injects its CSS.
  * Executes its JS (if exists).
* Toolbar buttons (`HTML`, `CSS`, `JS`) fetch the corresponding file and show code.

---

### ✅ You can now test by creating this quick stub

#### `/components/button/button.html`

```html
<button class="btn">Primary Button</button>
```

#### `/components/button/button.css`

```css
.btn {
  background: var(--color-primary, royalblue);
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 4px;
  cursor: pointer;
}
.btn:hover {
  background: var(--color-primary-hover, dodgerblue);
}
```

#### `/components/button/button.js`

```js
export function init() {
  console.log('Button component initialized');
}
```

Then open your `index.html` → click “Button” → demo appears → click “HTML”, “CSS”, “JS” to see code.

---

Would you like to **continue** to Step 3 — create the **first real reusable component (Button)** with refined tokens and variations,
or go **deep** into how we’ll **scope styles and manage component-level tokens** before coding it?

Excellent — you’re thinking like a real design system architect 👏

Let’s **go deep** into **Step 3 — how to structure, scope, and manage component-level styles** before we start building the first actual component (`Button`).

This is a crucial step for **scalability**, **theme consistency**, and **maintainability** as your library grows.

---

## 🎨 Deep Dive: Component Styling Strategy

We’ll use a **token-based**, **layered**, and **scoped CSS approach**, perfectly aligned with your existing architecture:

```
reset.css → tokens.css → base.css → layout.css → components/*
```

---

### 🧱 1. Layered Style System Recap

| Layer           | Purpose                                                                 | Example                                              |
| --------------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| **reset.css**   | Normalize and reset browser defaults.                                   | `*, *::before, *::after { box-sizing: border-box; }` |
| **tokens.css**  | Define all **design tokens** (colors, spacing, typography, etc.).       | `--color-primary`, `--font-size-sm`                  |
| **base.css**    | Apply generic element styles (typography, links, etc.).                 | `body { font-family: var(--font-body); }`            |
| **layout.css**  | Structure and grid (Holy Grail, responsive utilities).                  | `.app-grid`, `.stack`                                |
| **components/** | Individual reusable parts, each with **isolated, token-driven styles**. | `button.css`, `card.css`                             |

This structure ensures that **components never hardcode visual values**, only reference **tokens**.

---

### 🎨 2. Component-Level Tokens

Each component can define **local tokens** (namespaced with the component name).
Example — `Button` component:

```css
:root {
  --btn-bg: var(--color-primary);
  --btn-bg-hover: var(--color-primary-hover);
  --btn-fg: var(--color-on-primary);
  --btn-radius: var(--radius-md);
  --btn-padding: 0.5em 1em;
}
```

Now inside `button.css`:

```css
.btn {
  background: var(--btn-bg);
  color: var(--btn-fg);
  border-radius: var(--btn-radius);
  padding: var(--btn-padding);
}
```

If you later add **themes** (light/dark), or **brand overrides**, you can redefine these tokens without touching the component code.

---

### ⚙️ 3. Scoping Styles

Each component’s CSS should:

* Avoid leaking styles globally.
* Use a **class namespace** tied to the component name.
* Optionally wrap with a parent class for isolated demos.

Example:

```css
.component-button .btn { ... }
.component-button .btn--secondary { ... }
```

or (for full isolation within the viewer):

```html
<section class="component-preview component-button">
  <button class="btn">Primary</button>
</section>
```

This avoids CSS collision and ensures that when you load multiple components, their styles won’t interfere.

---

### 🧩 4. Variants and Modifiers

We’ll follow **BEM-like** naming for variants and states:

| Type     | Example                       | Meaning                          |
| -------- | ----------------------------- | -------------------------------- |
| Modifier | `.btn--secondary`             | Variant (secondary color scheme) |
| State    | `.btn.is-active`              | Current state                    |
| Element  | `.card__title`, `.card__body` | Sub-elements                     |

Example:

```css
.btn--secondary {
  background: var(--color-secondary);
  color: var(--color-on-secondary);
}
.btn.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}
```

---

### 🧠 5. Using Design Tokens Consistently

From `tokens.css`, you’ll have base tokens like:

```css
:root {
  --color-primary: royalblue;
  --color-primary-hover: dodgerblue;
  --color-secondary: slategray;
  --color-on-primary: white;

  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;

  --radius-sm: 2px;
  --radius-md: 4px;
}
```

Each component **maps these tokens to its own variables** — ensuring isolation but consistency.

Example:

```css
:root {
  --btn-bg: var(--color-primary);
  --btn-bg-hover: var(--color-primary-hover);
  --btn-radius: var(--radius-md);
  --btn-padding: var(--space-sm) var(--space-md);
}
```

---

### 🧩 6. Component Structure Convention

Each component folder should follow this naming and structure convention:

```
components/
└── button/
    ├── button.html     → markup demo
    ├── button.css      → styles (uses tokens)
    └── button.js       → optional logic (e.g. ripple, toggle)
```

Each file should be:

* **Independent** (can work standalone).
* **Self-registering** (JS handles only its own DOM).
* **Token-driven** (no hard-coded colors or spacing).

---

### 🧩 7. Theming Ready (Future-Proof)

When you later introduce themes:

```css
[data-theme="dark"] {
  --color-primary: #5b9aff;
  --color-on-primary: #ffffff;
  --color-surface: #121212;
}
```

All components automatically adapt — because they depend on tokens, not direct colors.

---

### 🧰 8. Component Code Preview Enhancement (Optional)

In the next iteration, we can:

* Add syntax highlighting (e.g. Prism.js)
* Provide a “copy code” button
* Toggle between “live” and “code” view

---

✅ **Summary:**
You now have a **robust design system style architecture**:

* Global tokens → component tokens → scoped styles
* Clear BEM-style naming
* Token-driven consistency
* Ready for theming, dark mode, and scaling

---

Would you like to **continue** to Step 3.1 — actually **build the Button component** (with variants, tokens, and live demo integration)?

Excellent — this is where we level up 🚀

You already have a working **component loader and modular styling system**.
Now, let’s go **deep** into **Step 4 — component documentation and metadata architecture** — essentially, how we’ll make your system “self-documenting,” like a lightweight **Storybook** or **Pattern Library**, without adding complexity.

---

## 🧠 Deep Dive: Component Documentation & Metadata System

Each component (Button, Card, Table, etc.) will not only have **HTML / CSS / JS**, but also optional **metadata** describing what it is, its props, states, variants, and usage.
This will allow the viewer to:

* Show a **description panel**
* Render **usage examples**
* Auto-generate **code previews**
* Eventually filter or search components by category or tags

---

### 🗂 1. Updated Component Folder Structure

Let’s evolve your component folders slightly:

```
components/
└── button/
    ├── button.html      → live demo markup
    ├── button.css       → styles
    ├── button.js        → optional logic
    └── button.meta.json → metadata (docs, props, examples)
```

The `.meta.json` file becomes the **documentation contract**.

---

### 📜 2. Example: `button.meta.json`

```json
{
  "name": "Button",
  "category": "Inputs",
  "description": "A clickable element used to trigger actions or events.",
  "variants": [
    { "class": "btn", "label": "Primary", "description": "Default button style" },
    { "class": "btn--secondary", "label": "Secondary", "description": "Alternative color" },
    { "class": "btn--outline", "label": "Outline", "description": "Outlined button" }
  ],
  "states": [
    { "class": "is-disabled", "description": "Indicates non-interactive or disabled state" }
  ],
  "usage": {
    "html": "<button class=\"btn\">Click Me</button>",
    "notes": "You can apply any variant by adding its modifier class, e.g. `.btn--secondary`."
  },
  "tags": ["interactive", "form", "control"]
}
```

This file provides enough structured data to:

* Generate a **component details sidebar or modal**
* Show a **props/variants table**
* Display a **live usage snippet**
* Support search or filtering

---

### ⚙️ 3. How the Viewer Uses Metadata

We’ll extend the loader (`main.js` or `components.js`) to:

1. Check if a `component.meta.json` exists.
2. Load and parse it with `fetch()`.
3. Display metadata in a **Documentation Panel** below the demo area.

Example snippet:

```js
async function loadMetadata(name) {
  try {
    const res = await fetch(`components/${name}/${name}.meta.json`);
    if (!res.ok) return null;
    const meta = await res.json();
    renderMetadata(meta);
  } catch {
    // optional: no metadata
  }
}

function renderMetadata(meta) {
  const container = document.createElement('div');
  container.className = 'component-meta';
  container.innerHTML = `
    <h3>About</h3>
    <p>${meta.description}</p>
    <h4>Variants</h4>
    <ul>
      ${meta.variants.map(v => `<li><code>${v.class}</code> — ${v.description}</li>`).join('')}
    </ul>
    <h4>Usage</h4>
    <pre><code>${meta.usage.html}</code></pre>
    <p>${meta.usage.notes}</p>
  `;
  document.querySelector('#component-demo').appendChild(container);
}
```

This keeps documentation **auto-linked to each component** — no central manual docs page.

---

### 🎛 4. Schema Consistency

To keep things consistent across dozens of components, define a **metadata schema** (you can even validate it later).

| Field         | Type   | Description                               |
| ------------- | ------ | ----------------------------------------- |
| `name`        | string | Human-readable component name             |
| `category`    | string | For grouping (Inputs, Layout, etc.)       |
| `description` | string | Short overview                            |
| `variants`    | array  | List of modifier classes and descriptions |
| `states`      | array  | List of state classes                     |
| `usage`       | object | Example code + notes                      |
| `tags`        | array  | Keywords for search/filter                |

---

### 🧩 5. Auto-Generating Sidebar (Future Upgrade)

Once every component has `meta.json`, you can use those files to **auto-generate the entire component registry** (`components.js`) dynamically.

```js
// pseudo example
const res = await fetch('components/index.json');
const registry = await res.json();
// Each entry generated from its meta.json automatically
```

This makes adding new components **zero-configuration** — just drop in a new folder.

---

### 🧰 6. Future: “Props” / API Support

If you want to go beyond CSS classes, you can extend metadata for JS props:

```json
"props": [
  { "name": "disabled", "type": "boolean", "default": false, "description": "Disables the button" },
  { "name": "variant", "type": "string", "values": ["primary","secondary","outline"], "default": "primary" }
]
```

The viewer could then render a **form-based control panel** to tweak props live (like Storybook Controls).

---

### 🪶 7. Styling for Metadata Panel

Add a simple section at the end of your `layout.css`:

```css
.component-meta {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  font-size: 0.9rem;
}

.component-meta h3,
.component-meta h4 {
  margin-top: var(--space-md);
}
.component-meta ul {
  margin-left: var(--space-md);
  list-style: disc;
}
.component-meta code {
  background: var(--color-surface-alt);
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-family: monospace;
}
```

---

### 🧭 8. Benefits

* 📘 **Self-documenting components** — documentation lives beside code.
* 🧱 **Scalable architecture** — add new components easily.
* 🔍 **Searchable / filterable** — by tags or category.
* 🧠 **Human + machine-readable** — works for UI and for future automation.
* 🛠 **Storybook-lite** — your own minimal design system viewer without dependencies.

---

✅ **Summary:**
You now have a blueprint for a **metadata-driven component documentation system**, enabling your component viewer to serve as a **design system explorer** — fully extensible and consistent.

---

Would you like to **continue** to Step 5 — implementing metadata loading + docs panel in the app (using your `Button` component as the first example)?

Perfect 👌 — let’s move to **Step 5: implementing the metadata loading + documentation panel** inside your component viewer.

We’ll extend your existing architecture so that when a user selects a component (e.g. **Button**), the app loads:

1. its `HTML` demo,
2. its `CSS` and `JS`, and
3. its `meta.json` → to display human-readable docs under the preview.

---

## 🧩 Step 5 — Add Metadata Loader & Docs Panel

### 🗂 File: `scripts/main.js` (update)

Add this new logic into your existing script (after the component loader section).

```js
import { components } from './components.js';

// DOM references
const drawer = document.querySelector('.app-drawer');
const toggle = document.querySelector('.drawer-toggle');
const backdrop = document.querySelector('.drawer-backdrop');
const list = document.querySelector('.component-list');
const title = document.getElementById('component-title');
const demo = document.getElementById('component-demo');
const codeViewer = document.getElementById('code-viewer');

// Build sidebar
list.innerHTML = components
  .map(c => `<a href="#" data-component="${c.name}">${c.label}</a>`)
  .join('');

// Drawer toggle
toggle.addEventListener('click', () => {
  drawer.classList.toggle('open');
  backdrop.classList.toggle('active');
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', !expanded);
});
backdrop.addEventListener('click', () => {
  drawer.classList.remove('open');
  backdrop.classList.remove('active');
  toggle.setAttribute('aria-expanded', false);
});

// --- COMPONENT LOADING ---

async function loadComponent(name) {
  try {
    const res = await fetch(`components/${name}/${name}.html`);
    const html = await res.text();
    demo.innerHTML = html;
    title.textContent = name.charAt(0).toUpperCase() + name.slice(1);

    await Promise.all([loadCSS(name), loadJS(name), loadMetadata(name)]);

    codeViewer.classList.add('hidden');
    codeViewer.textContent = '';
  } catch (err) {
    demo.innerHTML = `<p style="color:red;">Failed to load ${name}</p>`;
    console.error(err);
  }
}

async function loadCSS(name) {
  if (document.querySelector(`style[data-component="${name}"]`)) return;
  try {
    const res = await fetch(`components/${name}/${name}.css`);
    if (!res.ok) return;
    const css = await res.text();
    const style = document.createElement('style');
    style.dataset.component = name;
    style.textContent = css;
    document.head.appendChild(style);
  } catch {}
}

async function loadJS(name) {
  try {
    const module = await import(`../components/${name}/${name}.js`);
    if (module.init) module.init();
  } catch {}
}

// --- NEW: METADATA LOADING ---
async function loadMetadata(name) {
  try {
    const res = await fetch(`components/${name}/${name}.meta.json`);
    if (!res.ok) return;
    const meta = await res.json();
    renderMetadata(meta);
  } catch {
    // no metadata file
  }
}

function renderMetadata(meta) {
  // Remove old docs if any
  const oldMeta = document.querySelector('.component-meta');
  if (oldMeta) oldMeta.remove();

  const container = document.createElement('section');
  container.className = 'component-meta';
  container.innerHTML = `
    <h3>About</h3>
    <p>${meta.description || ''}</p>

    ${meta.variants?.length ? `
      <h4>Variants</h4>
      <ul>${meta.variants
        .map(v => `<li><code>${v.class}</code> — ${v.description}</li>`)
        .join('')}</ul>` : ''}

    ${meta.states?.length ? `
      <h4>States</h4>
      <ul>${meta.states
        .map(s => `<li><code>${s.class}</code> — ${s.description}</li>`)
        .join('')}</ul>` : ''}

    ${meta.usage ? `
      <h4>Usage</h4>
      <pre><code>${meta.usage.html.replace(/</g, '&lt;')}</code></pre>
      <p>${meta.usage.notes || ''}</p>` : ''}
  `;
  demo.appendChild(container);
}

// Sidebar clicks
list.addEventListener('click', async e => {
  const link = e.target.closest('a[data-component]');
  if (!link) return;
  e.preventDefault();
  const name = link.dataset.component;
  await loadComponent(name);
});

// Toolbar buttons
['html', 'css', 'js'].forEach(type => {
  document.getElementById(`show-${type}`).addEventListener('click', async () => {
    const current = title.textContent.toLowerCase();
    if (!current || current === 'select a component') return;
    const path = `components/${current}/${current}.${type}`;
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('missing');
      const code = await res.text();
      codeViewer.textContent = code;
      codeViewer.classList.toggle('hidden');
    } catch {
      codeViewer.textContent = `No ${type.toUpperCase()} file for ${current}`;
      codeViewer.classList.remove('hidden');
    }
  });
});
```

---

### 📜 Example: `components/button/button.meta.json`

```json
{
  "name": "Button",
  "category": "Inputs",
  "description": "A clickable element used to trigger actions or events.",
  "variants": [
    { "class": "btn", "description": "Primary button (default)" },
    { "class": "btn--secondary", "description": "Secondary button variant" },
    { "class": "btn--outline", "description": "Outline-styled button" }
  ],
  "states": [
    { "class": "is-disabled", "description": "Disabled button state" }
  ],
  "usage": {
    "html": "<button class=\"btn\">Click me</button>",
    "notes": "Add a modifier like `.btn--secondary` for alternate styles."
  },
  "tags": ["interactive", "form", "control"]
}
```

---

### 🎨 Style for Docs Panel (append to `layout.css`)

```css
.component-meta {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  font-size: 0.9rem;
  background: var(--color-surface, #fff);
}

.component-meta h3,
.component-meta h4 {
  margin-top: var(--space-md);
  font-weight: 600;
}

.component-meta ul {
  list-style: disc;
  margin-left: var(--space-md);
}

.component-meta code {
  background: var(--color-surface-alt, #f3f3f3);
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-family: monospace;
}
```

---

### ✅ What You Now Have

* Each component can include a `.meta.json` file.
* When loaded, its **documentation** (description, variants, states, usage) appears below the live demo.
* No need to edit global JS — the viewer automatically pulls and renders docs.

---

### 🧩 Future Enhancements (optional)

* Add a **“Docs”** tab or collapsible panel.
* Allow **search/filter** across metadata tags.
* Generate a **category index** (“Inputs”, “Layout”, “Data display”, etc.).
* Add syntax highlighting for the code block.

---

Would you like to **continue** to Step 6 — create the **Card component** (with its own demo, metadata, and scoped CSS)?
