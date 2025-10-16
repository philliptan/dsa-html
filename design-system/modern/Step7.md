Alright 🔥—let’s expand your design system with **new data-driven components** that plug right into the same store and theming rules.

We’ll add three modular visualizations:

1. `<LineChart>` – trends over time
2. `<BarChart>` – categorical comparison
3. `<DonutChart>` – proportional metrics

Each will be framework-agnostic and subscribe to the shared `store.js`.

---

## 🧩 Step 6: Chart Components Overview

### Folder layout

```
/src
  /components
    LineChart.js
    BarChart.js
    DonutChart.js
  /utils
    chartBase.js       ← shared helpers (canvas setup, colors)
```

All use `<canvas>` for lightness and theme awareness.

---

### `/src/utils/chartBase.js`

Common helpers to keep things DRY.

```js
// chartBase.js
export function setupCanvas(width = 300, height = 150) {
  const canvas = document.createElement('canvas');
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  return { canvas, ctx };
}

export function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    primary: style.getPropertyValue('--color-primary').trim(),
    accent: style.getPropertyValue('--color-accent').trim(),
    text: style.getPropertyValue('--color-text').trim(),
    surface: style.getPropertyValue('--color-surface').trim(),
  };
}
```

---

### 🧮 `/src/components/LineChart.js`

Lightweight time-series line chart.

```js
import { setupCanvas, getThemeColors } from '../utils/chartBase.js';
import { store } from '../store.js';

export function createLineChart({ id, field, maxPoints = 20 }) {
  const { canvas, ctx } = setupCanvas(320, 120);
  canvas.className = 'chart line-chart';
  const data = [];

  const draw = () => {
    const { primary, surface } = getThemeColors();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = canvas.width / (maxPoints - 1);
    data.forEach((y, i) => {
      const px = i * step;
      const py = canvas.height - (y / 100) * canvas.height; // normalize
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    });
    ctx.stroke();

    // baseline
    ctx.strokeStyle = surface;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 1);
    ctx.lineTo(canvas.width, canvas.height - 1);
    ctx.stroke();
  };

  // subscribe to store updates
  store.subscribe((s) => {
    if (typeof s[field] === 'number') {
      data.push(s[field]);
      if (data.length > maxPoints) data.shift();
      draw();
    }
  });

  return canvas;
}
```

---

### 📊 `/src/components/BarChart.js`

```js
import { setupCanvas, getThemeColors } from '../utils/chartBase.js';

export function createBarChart({ categories = [], values = [] }) {
  const { canvas, ctx } = setupCanvas(320, 150);
  canvas.className = 'chart bar-chart';

  const draw = () => {
    const { accent, text } = getThemeColors();
    const barWidth = canvas.width / values.length - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    values.forEach((v, i) => {
      const x = i * (barWidth + 10);
      const h = (v / Math.max(...values)) * canvas.height;
      const y = canvas.height - h;
      ctx.fillStyle = accent;
      ctx.fillRect(x, y, barWidth, h);
      ctx.fillStyle = text;
      ctx.font = '12px sans-serif';
      ctx.fillText(categories[i], x + 4, canvas.height - 4);
    });
  };

  draw();
  return canvas;
}
```

---

### 🥯 `/src/components/DonutChart.js`

```js
import { setupCanvas, getThemeColors } from '../utils/chartBase.js';

export function createDonutChart({ value = 0, total = 100, label = '' }) {
  const { canvas, ctx } = setupCanvas(160, 160);
  canvas.className = 'chart donut-chart';

  const draw = () => {
    const { primary, surface, text } = getThemeColors();
    const radius = 70;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const angle = (Math.min(value / total, 1) * Math.PI * 2);

    // background circle
    ctx.strokeStyle = surface;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // progress arc
    ctx.strokeStyle = primary;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, -Math.PI / 2, angle - Math.PI / 2);
    ctx.stroke();

    // label
    ctx.fillStyle = text;
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round((value / total) * 100)}%`, center.x, center.y);
  };

  draw();
  return canvas;
}
```

---

### 💅 Add Minimal Chart Styling (`/styles/components.css`)

```css
.chart {
  width: 100%;
  max-width: 100%;
  display: block;
}

.line-chart, .bar-chart, .donut-chart {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  transition: background-color var(--duration-base) var(--ease-in-out);
}

.chart:hover {
  box-shadow: var(--shadow-sm);
}
```

---

### 🧠 Integrate into `App.js`

```js
import { createLineChart } from './components/LineChart.js';
import { createBarChart } from './components/BarChart.js';
import { createDonutChart } from './components/DonutChart.js';
import { store, startFakeFeed } from './store.js';

// Start mock data feed
startFakeFeed();

const chartSection = document.createElement('div');
chartSection.className = 'grid-3';

const line = createLineChart({ id: 'salesTrend', field: 'sales' });
const bar = createBarChart({
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  values: [45, 60, 35, 80, 50],
});
const donut = createDonutChart({ value: 68, total: 100, label: 'Goal' });

chartSection.append(line, bar, donut);
main.updateContent([chartSection]);
```

---

### 🧩 UX Behavior

| Chart | UX Trait                   | Behavior             |
| ----- | -------------------------- | -------------------- |
| Line  | Smooth live trend updates  | Feels responsive     |
| Bar   | Simple comparison snapshot | Great for categories |
| Donut | Shows goal completion      | Compact KPI gauge    |

---

### 🪄 Future-Proof Enhancements

* **Animate points/bars** with `requestAnimationFrame` easing.
* Add **hover tooltips** showing precise values.
* Support **theme transitions** by re-drawing on `data-theme` change observer.
* Allow multiple data series (multi-color lines).

---

You now have a complete, modular **chart system** that plays nicely with your theme tokens and live data store.

Would you like to **continue** into building an **interactive analytics panel** (filters, date range picker, live dataset switching),
or go **deep** into **animating these charts** for smoother real-time transitions?
