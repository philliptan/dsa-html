✅ **Step 10 — Infrastructure / Config (Tooling + Build Setup)**

This final layer defines how everything fits together — structure, build pipeline, and environment configuration.
We’ll keep it lightweight and **framework-agnostic**, but fully modern.

---

### 🧩 **Folder Structure (Final Overview)**

```
project-root/
│
├── index.html              → Entry (App Shell)
├── login.html              → Example screen
│
├── css/
│   ├── tokens.css          → Design tokens
│   ├── themes.css          → Contextual themes
│   ├── layout.css          → Layout primitives
│   ├── utils.css           → Utility classes
│   ├── components.css      → UI components
│   ├── features.css        → Modals, toasts, etc.
│   ├── pages.css           → Page-level layouts
│   └── app.css             → App shell
│
├── js/
│   ├── theme.js
│   ├── theme-switcher.js
│   ├── utils.js
│   ├── components.js
│   ├── features.js
│   ├── pages.js
│   ├── app.js
│   ├── services.js
│   └── services-demo.js
│
├── assets/                 → (optional) images, icons, fonts
│
├── package.json
├── vite.config.js          → (or parcel / webpack config)
└── README.md
```

---

### ⚙️ **Development Setup (with Vite)**

Minimal `package.json`:

```json
{
  "name": "hue-ui-system",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

---

### 🧱 **`vite.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: '/index.html',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

---

### 🧩 **Environment Config**

Add `.env` (optional for API keys, etc.):

```bash
VITE_API_BASE=https://jsonplaceholder.typicode.com
```

Then modify `services.js`:

```js
const API_BASE = import.meta.env.VITE_API_BASE;
```

---

### 🧰 **Recommended Tooling Add-ons**

| Tool           | Purpose                            |
| -------------- | ---------------------------------- |
| **Prettier**   | Code formatting                    |
| **ESLint**     | JS linting (`eslint:recommended`)  |
| **Stylelint**  | CSS linting (tokens consistency)   |
| **PostCSS**    | Autoprefix + minify CSS            |
| **Vitest**     | Unit testing                       |
| **Playwright** | UI/E2E testing                     |
| **Storybook**  | Visual documentation of components |

---

### 💡 **Build Output Example**

When you run `npm run build`:

```
dist/
 ├── index.html
 ├── assets/
 ├── js/ (bundled & minified)
 ├── css/ (minified)
 └── ...
```

---

✅ **Now your Infrastructure Layer provides:**

* Organized file/folder architecture
* Modern dev server + build (Vite)
* Optional `.env` for API or theming configs
* Extendable lint/test/documentation setup

---

👉 Type **`continue`** for a **final summary + next-step roadmap** (e.g., documentation, design tokens automation, and component publishing).
