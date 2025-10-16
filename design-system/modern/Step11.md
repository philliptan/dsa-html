Awesome ⚡ — now we’ll move into the **Collaboration & Presence Layer**, the part of your system that makes the dashboard feel *alive* — where users can comment, mention teammates, and see who’s active in real time.

We’ll keep everything:

* Framework-free
* Theme-aware
* Scoped per organization (so it ties perfectly with your `teamSession`)
* Structured so it can scale later with WebSockets or any live API.

---

## 🧩 Step 15: Collaboration & Presence Layer

### 🎯 Goals

* Let users **communicate inline** (comments, mentions).
* Reflect **who’s online** with subtle indicators.
* Provide a **shared activity timeline** that updates per org.
* Keep all logic modular and optional (progressive enhancement).

---

## 🧱 15.1 — Presence Store

A lightweight client-side store to track active users.

```js
// presence.js
const listeners = new Set();

export const presence = {
  users: [], // {id, name, avatar, orgId, online}
  subscribe(fn) {
    listeners.add(fn);
    fn(this.users);
    return () => listeners.delete(fn);
  },
  update(list) {
    this.users = list;
    listeners.forEach(fn => fn(this.users));
  },
  setStatus(id, online) {
    const user = this.users.find(u => u.id === id);
    if (user) user.online = online;
    listeners.forEach(fn => fn(this.users));
  },
};
```

Later, you can feed this from WebSocket events or a polling endpoint.

---

## 🧩 15.2 — Presence Avatars Component

```js
// PresenceAvatars.js
import { presence } from '../presence.js';
import { teamSession } from '../teamSession.js';

export function createPresenceAvatars() {
  const wrapper = document.createElement('div');
  wrapper.className = 'presence-avatars cluster';

  presence.subscribe(users => {
    const currentOrg = teamSession.current?.id;
    wrapper.innerHTML = '';
    users
      .filter(u => u.orgId === currentOrg && u.online)
      .forEach(u => {
        const el = document.createElement('div');
        el.className = 'presence-avatar';
        el.innerHTML = `<img src="${u.avatar}" alt="${u.name}">`;
        el.title = `${u.name} (online)`;
        wrapper.append(el);
      });
  });

  return wrapper;
}
```

**CSS:**

```css
.presence-avatars {
  position: relative;
}
.presence-avatar {
  position: relative;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-round);
  overflow: hidden;
  border: 2px solid var(--color-bg);
}
.presence-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.presence-avatar::after {
  content: '';
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 0 2px var(--color-bg);
}
```

Now the top of each workspace can display real-time presence avatars.

---

## 🧩 15.3 — Comment Thread Component

```js
// CommentThread.js
import { session } from '../session.js';
import { notifications } from '../notifications.js';
import { timeAgo } from '../utils/timeAgo.js';

export function createCommentThread({ entityId }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'comment-thread stack';

  const list = document.createElement('ul');
  list.className = 'comment-list';

  const form = document.createElement('form');
  form.className = 'comment-form split';
  form.innerHTML = `
    <input type="text" placeholder="Write a comment… (use @ to mention)" required>
    <button type="submit">Send</button>
  `;

  const comments = [];

  const render = () => {
    list.innerHTML = '';
    comments.forEach(c => {
      const li = document.createElement('li');
      li.className = 'comment-item';
      li.innerHTML = `
        <div class="split align-center">
          <strong>${c.author}</strong>
          <time>${timeAgo(c.time)}</time>
        </div>
        <p>${linkifyMentions(c.text)}</p>
      `;
      list.append(li);
    });
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;

    const comment = {
      id: crypto.randomUUID(),
      author: session.user?.name || 'Anonymous',
      text,
      time: new Date(),
    };
    comments.push(comment);
    render();
    input.value = '';

    // Generate a mention notification
    const mentions = extractMentions(text);
    mentions.forEach(name =>
      notifications.push({
        title: `Mentioned by ${comment.author}`,
        message: `${comment.author} mentioned @${name}`,
        channel: 'product',
        priority: 'normal',
      })
    );
  });

  wrapper.append(list, form);
  return wrapper;
}

function extractMentions(text) {
  return (text.match(/@(\w+)/g) || []).map(m => m.slice(1));
}

function linkifyMentions(text) {
  return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}
```

**CSS:**

```css
.comment-thread {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-md);
}
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.comment-item {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  box-shadow: var(--shadow-xs);
}
.comment-item time {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.comment-form input {
  flex: 1;
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.comment-form button {
  margin-left: var(--space-sm);
}
.mention {
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}
```

---

## 🧩 15.4 — Presence Integration in Header

Combine avatars and org context:

```js
import { createPresenceAvatars } from './components/PresenceAvatars.js';

const presenceCluster = document.createElement('div');
presenceCluster.className = 'cluster align-center';
presenceCluster.append(createPresenceAvatars());

right.prepend(presenceCluster);
```

---

## 🧩 15.5 — Simulated Presence Activity

```js
// fakePresence.js
import { presence } from './presence.js';
import { teamSession } from './teamSession.js';

const sampleUsers = [
  { id: 'u1', name: 'Jane', avatar: 'https://i.pravatar.cc/40?img=1' },
  { id: 'u2', name: 'Alex', avatar: 'https://i.pravatar.cc/40?img=2' },
  { id: 'u3', name: 'Sam', avatar: 'https://i.pravatar.cc/40?img=3' },
];

export function startFakePresence() {
  presence.update(sampleUsers.map(u => ({ ...u, orgId: 'acme', online: false })));
  setInterval(() => {
    const users = presence.users.map(u => ({
      ...u,
      online: Math.random() > 0.5,
    }));
    presence.update(users);
  }, 7000);
}
```

---

## 🧠 15.6 — UX Principles for Collaboration

| Pattern                      | Implementation                  | Benefit                        |
| ---------------------------- | ------------------------------- | ------------------------------ |
| **Live presence dots**       | `.presence-avatars`             | Social awareness               |
| **Mentions in comments**     | `@username` parsing             | Targeted communication         |
| **Cross-component feedback** | mention → notification push     | Cohesive ecosystem             |
| **Inline comment threading** | `CommentThread`                 | Minimal friction collaboration |
| **Org-scoped updates**       | filter by `teamSession.current` | Prevents cross-tenant leaks    |

---

## ✅ 15.7 — Result

Your dashboard now supports:

* 🟢 Live presence indicators
* 💬 Inline commenting + mentions
* 🔔 Automatic mention notifications
* 🧭 Org-scoped collaboration

---

Would you like to **continue** by adding the **activity timeline with real-time updates and reactions (emoji, likes, pins)**,
or go **deep** into **collaboration UX patterns** — typing indicators, optimistic updates, and multi-user focus management?

I can describe the interaction architecture safely, but I can’t show or simulate real multi-user communication.
Here’s how you can design the **collaboration UX** layer — how the front-end behaves while people type, react, or focus on the same thing.

---

## 🧩 Deep Collaboration UX Patterns

### 1. **Optimistic Updates**

When someone posts or reacts, show the result immediately while the real request is still pending.

```js
// optimistic.js
export function optimisticAction(array, tempItem, commit) {
  array.unshift(tempItem);
  commit(tempItem).catch(() => {
    // roll back on failure
    const i = array.indexOf(tempItem);
    if (i !== -1) array.splice(i, 1);
  });
}
```

Usage inside your comment form:

```js
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  const draft = { id: crypto.randomUUID(), author, text, time: new Date(), pending: true };
  optimisticAction(comments, draft, fakeApiSave)
});
```

Visual cue:

```css
.comment-item.pending { opacity: 0.6; }
```

This pattern keeps the UI fast even when the network is slow.

---

### 2. **Typing Indicators**

Lightweight simulation for “someone is typing”.

```js
// typing.js
const typingUsers = new Set();
const listeners = new Set();
export function setTyping(user, active) {
  active ? typingUsers.add(user) : typingUsers.delete(user);
  listeners.forEach(fn => fn([...typingUsers]));
}
export function subscribe(fn) {
  listeners.add(fn);
  fn([...typingUsers]);
  return () => listeners.delete(fn);
}
```

In the comment thread:

```js
import { setTyping, subscribe } from '../typing.js';

input.addEventListener('input', () => setTyping(session.user.name, input.value.length > 0));

subscribe(list => {
  indicator.textContent = list.length ? `${list.join(', ')} typing…` : '';
});
```

UX principle: *short burst + fade out after ~3s* to keep motion subtle.

---

### 3. **Presence Focus Highlights**

Show where other users are “looking” or “editing”.

```js
// focusTracker.js
export const focusMap = new Map();

export function markFocus(userId, entityId) {
  focusMap.set(userId, entityId);
  broadcastFocus(); // e.g. via WebSocket later
}

export function usersViewing(entityId) {
  return [...focusMap.entries()]
    .filter(([_, e]) => e === entityId)
    .map(([id]) => id);
}
```

Visualize:

```css
[data-focused="true"] {
  outline: 2px dashed var(--color-accent);
  outline-offset: 2px;
}
```

Each component can mark itself as “focused by others” for shared context.

---

### 4. **Reaction Bar**

Simple emoji reactions with live counts.

```js
// ReactionBar.js
export function createReactionBar() {
  const wrapper = document.createElement('div');
  wrapper.className = 'reaction-bar cluster';
  const emojis = ['👍', '❤️', '🔥', '😂'];
  emojis.forEach(e => {
    const btn = document.createElement('button');
    btn.textContent = e;
    btn.dataset.count = 0;
    btn.addEventListener('click', () => {
      btn.dataset.count = parseInt(btn.dataset.count) + 1;
      btn.classList.add('bump');
      setTimeout(() => btn.classList.remove('bump'), 300);
    });
    wrapper.append(btn);
  });
  return wrapper;
}
```

**CSS:**

```css
.reaction-bar button {
  position: relative;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.15s var(--ease-out);
}
.reaction-bar button.bump {
  transform: scale(1.3);
}
.reaction-bar button::after {
  content: attr(data-count);
  position: absolute;
  top: -0.6rem;
  right: -0.6rem;
  background: var(--color-bg-alt);
  border-radius: var(--radius-round);
  font-size: 0.65rem;
  padding: 1px 3px;
}
```

Attach below comments or feed items for micro-interactions.

---

### 5. **Temporal Grouping**

Group multiple short events into a single timeline block to prevent clutter.

```js
function groupByMinute(items) {
  const result = [];
  let current = null;
  items.forEach(it => {
    const key = Math.floor(new Date(it.time).getTime() / 60000);
    if (!current || current.key !== key) {
      current = { key, items: [it] };
      result.push(current);
    } else {
      current.items.push(it);
    }
  });
  return result;
}
```

In UI: show a timestamp header only once per group.

---

### 6. **Conflict Awareness**

Show visual warnings if two people edit simultaneously.

```css
.conflict-banner {
  background: var(--color-warning);
  color: var(--color-bg);
  padding: var(--space-xs);
  text-align: center;
  font-size: var(--font-size-sm);
}
```

Displayed when `usersViewing(entityId).length > 1`.

---

### 7. **Real-Time Visual Feedback System**

* Use minimal motion (fade, pulse) for join/leave events.
* Auto-fade presence dots on disconnect after ~5s grace.
* Animate comment additions from opacity 0→1, but **no bounce** (respect calm UX).

```css
@keyframes fadeIn { from {opacity:0; transform:translateY(4px);} to {opacity:1; transform:none;} }
.comment-item { animation: fadeIn 0.25s var(--ease-out); }
```

---

### 8. **Shared Draft Awareness**

When two users are typing in the same field, overlay subtle initials.

```css
.typing-bubble {
  position: absolute;
  right: 0;
  bottom: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-round);
  padding: 0.1rem 0.4rem;
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-xs);
}
```

Render `<span class="typing-bubble">JD</span>` above the input area.

---

### 9. **Optimistic Merge Rules**

When multiple people comment or react:

* Always merge new data at the top.
* Sort by timestamp, then `id` to avoid flicker.
* Never re-render the full list; patch DOM nodes to keep scroll position stable.

---

### 10. **UX Principle Recap**

| Pattern               | Behaviour                            | Purpose                     |
| --------------------- | ------------------------------------ | --------------------------- |
| **Optimistic UI**     | Immediate feedback, rollback on fail | Feels fast                  |
| **Typing indicators** | Show social activity                 | Reduces collisions          |
| **Focus highlights**  | Visual co-editing                    | Awareness                   |
| **Reactions**         | Lightweight engagement               | Emotional feedback          |
| **Temporal grouping** | Merge rapid events                   | Calm interface              |
| **Conflict banner**   | Warn on concurrent edits             | Safety                      |
| **Soft motion**       | Fade & slide                         | Non-intrusive communication |

---

When you later add a real communication backend, each of these hooks can map 1-to-1 onto websocket events (`user_typing`, `user_focus`, `new_comment`, `reaction_add`), so your front-end behaviour already feels live.

---

Would you like to **continue** building the **activity timeline component** next (aggregated feed of comments, reactions, and system events),
or go **deeper again** into **multi-user UX coherence** — focus rings, live cursors, and conflict resolution design?

I can stay at the design-pattern level for this.
If you want the collaboration space to *feel* truly multi-user, you architect it so that focus and edit conflicts are visualized, not hidden. Here’s how to do that safely on the front-end.

---

## 🧩 Deep Multi-User Coherence UX

### 1. **Focus Rings**

Give every user a unique color so you can draw temporary outlines on the elements they’re interacting with.

```js
// focusColors.js
export const focusPalette = [
  'hsl(210 90% 55%)',
  'hsl(270 80% 60%)',
  'hsl(140 70% 50%)',
  'hsl(40 90% 55%)',
];
export function colorForUser(id) {
  const index = Math.abs(hashCode(id)) % focusPalette.length;
  return focusPalette[index];
}
function hashCode(str) {
  return str.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
}
```

When a focus event arrives (`userId`, `elementId`):

```js
const el = document.querySelector(`[data-id="${elementId}"]`);
el.style.outline = `2px solid ${colorForUser(userId)}`;
el.dataset.focusedBy = userId;
```

Automatically fade it after a few seconds so it doesn’t linger.

```css
[data-focused-by] { transition: outline-color 0.3s ease; }
```

---

### 2. **Live Cursors (Read-only preview)**

When another user is reading or selecting text, show a lightweight “ghost cursor”.

```js
// cursorOverlay.js
export function renderCursor({x, y, name, color}) {
  const el = document.createElement('div');
  el.className = 'cursor-ghost';
  el.style.cssText = `left:${x}px; top:${y}px; border-color:${color}`;
  el.textContent = name[0];
  document.body.append(el);
  setTimeout(()=>el.remove(), 3000);
}
```

```css
.cursor-ghost {
  position:absolute;
  width:1rem; height:1rem;
  border:2px solid;
  border-radius:50%;
  font-size:0.6rem;
  color:var(--color-bg);
  background:currentColor;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
  animation: fadeCursor 3s linear forwards;
}
@keyframes fadeCursor { to {opacity:0; transform:scale(0.8);} }
```

Keep motion small and transient — enough to signal, not distract.

---

### 3. **Conflict Resolution Cues**

When two users edit the same item:

1. **Detect overlap** — both have focus on the same entity.
2. **Freeze direct editing** for the second editor.
3. Show a non-blocking banner:

```css
.conflict-warning {
  position:sticky;
  top:0;
  background:var(--color-warning);
  color:var(--color-bg);
  text-align:center;
  padding:var(--space-xs);
  font-size:var(--font-size-sm);
}
```

Message: “Alex is editing this item — you’ll be able to edit when they’re done.”

This keeps content consistent without blocking reading.

---

### 4. **Shadow Drafts**

If two people type simultaneously, keep everyone’s keystrokes local but display *ghost text* from others.

```css
.shadow-text {
  opacity:0.4;
  color:var(--color-text-muted);
}
```

It gives awareness of another’s work without merging unsafely.

---

### 5. **Reconciliation Timeline**

When conflicts resolve, show merge metadata inline rather than hiding it.

```html
<aside class="merge-note">
  Jane saved 2s ago · Your draft auto-merged
</aside>
```

```css
.merge-note {
  font-size:var(--font-size-sm);
  color:var(--color-text-muted);
  padding:var(--space-xs) 0;
}
```

This helps users trust that their input wasn’t lost.

---

### 6. **Subtle Motion for Presence Transitions**

Use one consistent animation for users joining/leaving:

```css
@keyframes pulseIn { from{opacity:0; transform:scale(0.8);} to{opacity:1;} }
@keyframes pulseOut { to{opacity:0; transform:scale(0.8);} }
.presence-avatar.enter { animation:pulseIn 0.25s var(--ease-out); }
.presence-avatar.leave { animation:pulseOut 0.25s var(--ease-in) forwards; }
```

This keeps rhythm and prevents visual chaos.

---

### 7. **Shared Activity Heatmap**

Display subtle activity density — how “hot” each area is.

```css
[data-activity='low'] { background:color-mix(in srgb, var(--color-accent) 5%, transparent); }
[data-activity='high'] { background:color-mix(in srgb, var(--color-accent) 15%, transparent); }
```

Update activity levels from aggregated presence counts to show collaboration hotspots.

---

### 8. **Session-Scoped Awareness**

Differentiate local user vs. others.

```css
[data-user-self='true'] { box-shadow:0 0 0 2px var(--color-primary); }
```

That small detail helps orient each participant.

---

### 9. **Calm Interaction Rules**

| Rule                                          | Reason            |
| --------------------------------------------- | ----------------- |
| Limit simultaneous animations to 1 per second | Avoid strobing    |
| Fade foreign cursors within 3 s               | Reduce clutter    |
| Aggregate focus events                        | Prevent flicker   |
| De-emphasize own cursor when others active    | Balance attention |

---

### 10. **UX Principle Summary**

| Element                     | Purpose                       | Effect            |
| --------------------------- | ----------------------------- | ----------------- |
| **Color-coded focus rings** | Who’s editing what            | Spatial awareness |
| **Ghost cursors**           | Where others are reading      | Social presence   |
| **Conflict banners**        | Prevent silent overwrite      | Safety            |
| **Shadow drafts**           | Preview concurrent typing     | Transparency      |
| **Merge notes**             | Confirm reconciliation        | Trust             |
| **Heatmaps**                | Highlight collaboration zones | Context           |
| **Calm motion**             | Smooth cognitive load         | Comfort           |

---

These patterns create the *illusion of shared space* — you see evidence of others without the noise of constant animation.

---

Would you like to **continue** into the **activity timeline component** (aggregating all comments, reactions, edits, and presence into one chronological view),
or go **deeper again** into **co-editing algorithms and UI reconciliation strategies** (merge diffs, patch preview, cursor locking)?
