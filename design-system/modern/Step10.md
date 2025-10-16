Perfect 🔥 — now we’ll bring the **multi-tenant system to life** with an **Activity Feed + Notification Center** that reacts to team context, supports unread tracking, and gives a sense of real-time collaboration — all while following your existing modular, theme-aware architecture.

---

## 🧩 Step 14: Activity Feed & Notification Center

### 🎯 Goals

* Provide a **unified place** to see activity, updates, and system notifications.
* Integrate with `teamSession` (org context) and `session` (user).
* Support **real-time updates**, **read/unread state**, and **filtering**.
* Keep it light, framework-agnostic, and accessible.

---

## 🧱 14.1 — Notification Store

Let’s keep notifications separate from UI logic, same pattern as your data store.

```js
// notifications.js
const listeners = new Set();

export const notifications = {
  list: [],
  subscribe(fn) {
    listeners.add(fn);
    fn(this.list);
    return () => listeners.delete(fn);
  },
  push(note) {
    this.list.unshift({
      id: crypto.randomUUID(),
      time: new Date(),
      read: false,
      ...note,
    });
    listeners.forEach(fn => fn(this.list));
  },
  markRead(id) {
    const n = this.list.find(n => n.id === id);
    if (n) n.read = true;
    listeners.forEach(fn => fn(this.list));
  },
  markAllRead() {
    this.list.forEach(n => (n.read = true));
    listeners.forEach(fn => fn(this.list));
  },
  clear() {
    this.list = [];
    listeners.forEach(fn => fn(this.list));
  },
};
```

---

## 🧩 14.2 — ActivityFeed Component

```js
// ActivityFeed.js
import { notifications } from '../notifications.js';
import { teamSession } from '../teamSession.js';
import { timeAgo } from '../utils/timeAgo.js';

export function createActivityFeed() {
  const wrapper = document.createElement('div');
  wrapper.className = 'activity-feed stack';

  const header = document.createElement('div');
  header.className = 'split align-center';
  const h2 = document.createElement('h2');
  h2.textContent = 'Activity Feed';

  const markAll = document.createElement('button');
  markAll.textContent = 'Mark all read';
  markAll.addEventListener('click', () => notifications.markAllRead());
  header.append(h2, markAll);

  const list = document.createElement('ul');
  list.className = 'feed-list';

  notifications.subscribe(feed => {
    list.innerHTML = '';
    const currentOrg = teamSession.current?.id;
    feed
      .filter(f => !currentOrg || f.orgId === currentOrg)
      .forEach(f => {
        const li = document.createElement('li');
        li.className = `feed-item ${f.read ? 'read' : 'unread'}`;
        li.innerHTML = `
          <div class="feed-head split align-center">
            <strong>${f.title}</strong>
            <time>${timeAgo(f.time)}</time>
          </div>
          <p>${f.message}</p>
        `;
        li.addEventListener('click', () => notifications.markRead(f.id));
        list.append(li);
      });
  });

  wrapper.append(header, list);
  return wrapper;
}
```

---

## 🧩 14.3 — Notification Bell Component

This is the small badge you’ll place in the header.

```js
// NotificationBell.js
import { notifications } from '../notifications.js';
import { createActivityFeed } from './ActivityFeed.js';
import { createModal } from './Modal.js';

export function createNotificationBell() {
  const btn = document.createElement('button');
  btn.className = 'notif-bell';
  btn.setAttribute('aria-label', 'Notifications');
  btn.innerHTML = '🔔<span class="notif-badge"></span>';

  const badge = btn.querySelector('.notif-badge');
  notifications.subscribe(list => {
    const unread = list.filter(n => !n.read).length;
    badge.textContent = unread > 0 ? unread : '';
    badge.hidden = unread === 0;
  });

  btn.addEventListener('click', () => {
    createModal({
      title: 'Notifications',
      content: createActivityFeed().outerHTML,
      onCancel: () => {},
    });
  });

  return btn;
}
```

---

## 🧩 14.4 — Styling Additions (`components.css`)

```css
.notif-bell {
  position: relative;
  font-size: 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
}

.notif-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: var(--color-error);
  color: var(--color-bg);
  border-radius: var(--radius-round);
  font-size: 0.65rem;
  padding: 2px 5px;
  font-weight: var(--font-weight-bold);
  min-width: 1rem;
  text-align: center;
}

.feed-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 60vh;
  overflow-y: auto;
}

.feed-item {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--duration-base);
}

.feed-item.unread {
  background-color: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface));
}

.feed-item:hover {
  background: var(--color-bg-alt);
}

.feed-head time {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
```

---

## 🧩 14.5 — Utility: Relative Time Formatter

```js
// utils/timeAgo.js
export function timeAgo(date) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}
```

---

## 🧩 14.6 — Simulated Live Feed Updates

```js
// fakeFeed.js
import { notifications } from './notifications.js';
import { teamSession } from './teamSession.js';

const sampleTitles = ['Report Updated', 'User Joined', 'Billing Notice', 'New Comment'];

export function startFakeFeed() {
  setInterval(() => {
    const org = teamSession.current;
    if (!org) return;
    notifications.push({
      orgId: org.id,
      title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
      message: `Something new happened in ${org.name}`,
    });
  }, 5000);
}
```

---

## 🧩 14.7 — Integrate into Header

Add the notification bell beside the user menu.

```js
import { createNotificationBell } from './NotificationBell.js';

const notifBell = createNotificationBell();
right.prepend(notifBell);
```

---

## 🧠 14.8 — UX / Interaction Design

| Interaction           | Result                   | UX Principle            |
| --------------------- | ------------------------ | ----------------------- |
| 🔔 Badge updates live | Shows new activity count | Real-time awareness     |
| Click → Modal         | Accessible quick view    | Non-disruptive          |
| Click an item         | Marks as read + fades    | Feedback loop           |
| “Mark all read”       | Clears badge instantly   | Control for power users |
| Auto-filter by org    | Contextually relevant    | Prevents confusion      |

---

## ✅ 14.9 — Summary

You now have:

* 🔔 **Notification bell** with live unread count
* 📰 **Activity feed** scoped per organization
* 🔄 **Live update simulation**
* 🕒 **Human-friendly timestamps**
* ♿ **Accessible modal feed viewer**

---

Up next, we can:

1. **Deep dive** into the **Notification Center UX** (prioritization, grouping, channels, snooze, push integration),
   or
2. **Continue** into **team collaboration features** — comments, mentions, activity reactions, and real-time presence.

Which direction do you want to take next — **deep** into notification system design, or **continue** into collaboration and presence components?

Let’s go one level deeper — not more mock APIs or backend secrets, but the **UX-architecture layer** that makes a notification system feel *human, calm, and predictable* instead of noisy.
This is how you design a **notification experience** that scales to real use while staying visually and cognitively light.

---

## 🧩 Deep Notification-Center UX Architecture

### 1. **Three Logical Channels**

Segment everything before it reaches the UI:

| Channel           | Example                       | Behaviour                                   |
| ----------------- | ----------------------------- | ------------------------------------------- |
| **System**        | errors, updates, warnings     | Always visible, never dismiss automatically |
| **Product**       | comments, mentions, approvals | Sticky until read                           |
| **Informational** | tips, reminders, newsletters  | Auto-expire after a short window            |

Structure:

```js
// notifications.js (extended)
export const CHANNELS = ['system', 'product', 'info'];

export function push(note) {
  const type = CHANNELS.includes(note.channel) ? note.channel : 'info';
  const data = { id: crypto.randomUUID(), time: new Date(), channel: type, ...note, read: false };
  this.list.unshift(data);
  this._notify();
}
```

This lets you group and filter without complex conditionals in the UI.

---

### 2. **Priority & Calm Design**

Give every notice a weight, and throttle visual noise:

```js
export const PRIORITY = { high: 3, normal: 2, low: 1 };

export function push(note) {
  // ...existing
  data.priority = PRIORITY[note.priority || 'normal'];
  // store logic unchanged
}
```

UI policy:

* Display **only top 5** in modal by default.
* Animate **high priority** with a subtle glow instead of intrusive motion.
* Auto-collapse **low priority** when multiple appear close together.

```css
.feed-item.high { border-left: 4px solid var(--color-error); }
.feed-item.low { opacity: 0.8; }
```

---

### 3. **Batching & Grouping**

When many similar notifications arrive together:

```js
function groupByTitle(list) {
  const grouped = {};
  list.forEach(n => {
    const key = n.title + n.orgId;
    grouped[key] = grouped[key] || [];
    grouped[key].push(n);
  });
  return Object.values(grouped).map(group => ({
    ...group[0],
    count: group.length,
  }));
}
```

Render:

```js
li.innerHTML = `
  <div class="feed-head split align-center">
    <strong>${f.title}</strong>
    ${f.count > 1 ? `<span class="count">+${f.count}</span>` : ''}
    <time>${timeAgo(f.time)}</time>
  </div>
  <p>${f.message}</p>
`;
```

Grouped feed entries reduce clutter and cognitive load.

---

### 4. **Notification Lifecycles**

| Phase        | Trigger                           | UX feedback                     |
| ------------ | --------------------------------- | ------------------------------- |
| Arrival      | pushed                            | badge increments, toast appears |
| Acknowledged | clicked / hovered                 | mark read, subtle fade          |
| Cleared      | auto-expire or manual “clear all” | animate out                     |
| Archived     | optional long-term storage        | hidden from active feed         |

Use motion for phase transitions:

```css
@keyframes fadeOut { to { opacity: 0; height: 0; margin: 0; } }
.feed-item.removed { animation: fadeOut 250ms forwards; }
```

---

### 5. **Attention Hierarchy**

Design the bell + feed so visual intensity matches importance:

* **Badge colour**

  * Red for system errors
  * Blue for product
  * Grey for info
* **Sort order:** High priority → Unread → Recent
* **Text weight:** bold for unread titles
* **Tone of copy:**

  * System: imperative (“Action required”)
  * Product: descriptive (“Alice mentioned you”)
  * Info: invitational (“Try the new feature”)

---

### 6. **Snooze & Do-Not-Disturb**

Give users control over interruptions.

```js
// notifications.js
export let snoozeUntil = 0;
export function setSnooze(minutes) {
  snoozeUntil = Date.now() + minutes * 60_000;
}

export function push(note) {
  if (Date.now() < snoozeUntil) return;
  // proceed normally
}
```

Add a simple control in the feed header:

```html
<select class="snooze">
  <option value="0">Notify me</option>
  <option value="15">Snooze 15 min</option>
  <option value="60">Snooze 1 hour</option>
</select>
```

---

### 7. **Accessibility & Responsiveness**

* Announce new notifications via an `aria-live="polite"` region in the bell button.
* Ensure every feed item has a logical focus order and a visible focus ring.
* On mobile viewports, render feed full-screen instead of modal window.

```css
@media (max-width: 600px) {
  .modal[data-type='notifications'] {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}
```

---

### 8. **Cross-Device Consistency**

Sync read/unread state across tabs using the same `storage` event pattern:

```js
window.addEventListener('storage', e => {
  if (e.key === 'notifications') {
    notifications.list = JSON.parse(e.newValue);
    notifications._notify();
  }
});
```

Always serialize `notifications.list` to localStorage on updates.

---

### 9. **User Feedback Loop**

Link every notification to the action that generated it, and record when users interact:

```js
li.addEventListener('click', () => {
  recordAction(`Opened notification: ${f.title}`);
  notifications.markRead(f.id);
});
```

Feed this into your audit or analytics module later.

---

### 10. **Visual & Motion System**

```css
.feed-item.unread::before {
  content: '';
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-accent);
  margin-right: var(--space-xs);
}
.feed-item.unread:hover::before {
  background: var(--color-primary);
}
```

This is a minimal cue for “new” without overwhelming the interface.

---

### 11. **UX Philosophy Recap**

| Principle              | Implementation               | Benefit               |
| ---------------------- | ---------------------------- | --------------------- |
| **Calm by default**    | Batching + channel filtering | Avoids noise          |
| **Actionable clarity** | Click = direct context       | Encourages engagement |
| **User control**       | Snooze / clear / mark all    | Reduces frustration   |
| **Consistent tone**    | Copy and colour by channel   | Builds trust          |
| **Graceful decay**     | Auto-expire low priority     | Keeps feed fresh      |

---

With these patterns, your notification system moves from a “bell icon + list” to a **thoughtful communication layer** that keeps users informed but never overloaded.

---

Would you like to **continue** by designing the **collaboration & presence layer** (comments, mentions, online indicators, activity syncing),
or go **deeper again** into **notification personalization and delivery rules** (per-user preferences, digest mode, multi-device strategy)?
