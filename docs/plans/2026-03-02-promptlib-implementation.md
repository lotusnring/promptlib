# PromptLib Chrome Extension Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chrome Side Panel extension for managing prompt templates with CRUD, tagging, search, copy with variable replacement, and import/export.

**Architecture:** React + TypeScript SPA rendered in Chrome Side Panel. All data persisted in chrome.storage.local. No backend. Component-based architecture with a shared storage service layer.

**Tech Stack:** React 18, TypeScript, Vite + @crxjs/vite-plugin, CSS Modules, marked (Markdown rendering), Chrome Extension Manifest V3 + Side Panel API.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `public/manifest.json`
- Create: `src/sidepanel.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.module.css`
- Create: `src/styles/variables.css`

**Step 1: Initialize project and install dependencies**

```bash
cd /Users/eggiezhao/inspiration/project2_promptlib
npm init -y
npm install react react-dom marked
npm install -D typescript @types/react @types/react-dom @types/chrome vite @crxjs/vite-plugin @vitejs/plugin-react
```

**Step 2: Create vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    outDir: 'dist',
  },
});
```

**Step 3: Create public/manifest.json**

```json
{
  "manifest_version": 3,
  "name": "PromptLib",
  "version": "1.0.0",
  "description": "帮助 AI 大模型使用者在浏览器内实时管理和调用提示词模板",
  "permissions": ["sidePanel", "storage"],
  "side_panel": {
    "default_path": "src/sidepanel.html"
  },
  "action": {
    "default_title": "PromptLib"
  },
  "background": {
    "service_worker": "src/background.ts"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**Step 4: Create src/background.ts**

```ts
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
```

**Step 5: Create src/sidepanel.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PromptLib</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

**Step 6: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

**Step 7: Create src/styles/variables.css (design tokens from PRD)**

```css
:root {
  --bg: #F5F5F7;
  --card: #FFFFFF;
  --text: #1D1D1F;
  --text-secondary: #86868B;
  --border: #E5E5E5;
  --accent: #007AFF;
  --danger: #FF3B30;
  --success: #34C759;
  --radius: 8px;
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-brand: 'Outfit', sans-serif;
  --brand-prompt: #5B21B6;
  --brand-lib: #A78BFA;
}
```

**Step 8: Create src/main.tsx with minimal App**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/variables.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 9: Create src/App.tsx placeholder**

```tsx
export default function App() {
  return <div>PromptLib</div>;
}
```

**Step 10: Verify build**

```bash
npx vite build
```

Expected: Build succeeds, dist/ folder created.

**Step 11: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold project with Vite + React + CRX"
```

---

### Task 2: Data Types & Storage Service

**Files:**
- Create: `src/types/prompt.ts`
- Create: `src/services/storage.ts`

**Step 1: Create src/types/prompt.ts**

```ts
export interface Prompt {
  id: string;
  title: string;
  tags: string[];
  content: string;
  isPinned: boolean;
  pinnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Step 2: Create src/services/storage.ts**

```ts
import { Prompt } from '../types/prompt';

const STORAGE_KEY = 'prompts';

export async function getAllPrompts(): Promise<Prompt[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

export async function saveAllPrompts(prompts: Prompt[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: prompts });
}

export async function createPrompt(data: Pick<Prompt, 'title' | 'tags' | 'content'>): Promise<Prompt> {
  const prompts = await getAllPrompts();
  const now = new Date().toISOString();
  const prompt: Prompt = {
    id: crypto.randomUUID(),
    title: data.title,
    tags: data.tags,
    content: data.content,
    isPinned: false,
    pinnedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  prompts.push(prompt);
  await saveAllPrompts(prompts);
  return prompt;
}

export async function updatePrompt(id: string, data: Partial<Pick<Prompt, 'title' | 'tags' | 'content'>>): Promise<Prompt | null> {
  const prompts = await getAllPrompts();
  const index = prompts.findIndex(p => p.id === id);
  if (index === -1) return null;
  prompts[index] = { ...prompts[index], ...data, updatedAt: new Date().toISOString() };
  await saveAllPrompts(prompts);
  return prompts[index];
}

export async function deletePrompt(id: string): Promise<void> {
  const prompts = await getAllPrompts();
  await saveAllPrompts(prompts.filter(p => p.id !== id));
}

export async function togglePin(id: string): Promise<Prompt | null> {
  const prompts = await getAllPrompts();
  const index = prompts.findIndex(p => p.id === id);
  if (index === -1) return null;
  const isPinned = !prompts[index].isPinned;
  prompts[index] = {
    ...prompts[index],
    isPinned,
    pinnedAt: isPinned ? new Date().toISOString() : null,
  };
  await saveAllPrompts(prompts);
  return prompts[index];
}

export async function exportData(): Promise<string> {
  const prompts = await getAllPrompts();
  return JSON.stringify(prompts, null, 2);
}

export interface ImportResult {
  added: number;
  overwritten: number;
  skipped: number;
}

export async function importData(incoming: Prompt[], duplicateAction: 'overwrite' | 'skip'): Promise<ImportResult> {
  const existing = await getAllPrompts();
  const existingTitles = new Map(existing.map(p => [p.title, p]));
  const result: ImportResult = { added: 0, overwritten: 0, skipped: 0 };

  for (const item of incoming) {
    const dup = existingTitles.get(item.title);
    if (dup) {
      if (duplicateAction === 'overwrite') {
        Object.assign(dup, { ...item, id: dup.id });
        result.overwritten++;
      } else {
        result.skipped++;
      }
    } else {
      existing.push({ ...item, id: crypto.randomUUID() });
      result.added++;
    }
  }
  await saveAllPrompts(existing);
  return result;
}
```

**Step 3: Commit**

```bash
git add src/types src/services
git commit -m "feat: add Prompt types and storage service"
```

---

### Task 3: Header Component (Brand Title + Search + Actions)

**Files:**
- Create: `src/components/Header/Header.tsx`
- Create: `src/components/Header/Header.module.css`

**Implementation:**
- PromptLib brand title with dual-color Outfit font
- Search input with magnifying glass icon
- New button (+ icon, accent color)
- More button (⋯ icon) with dropdown containing import/export
- Google Fonts Outfit loaded via CSS @import in variables.css

**Reference:** prototype.html lines 74-126 for styles, lines 534-548 for markup.

**Step 1: Add Outfit font import to src/styles/variables.css**

Add `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700&display=swap');` at top.

**Step 2: Build Header.tsx**

Renders header-top (brand + buttons) and search-bar. Accepts props:
- `searchQuery: string`
- `onSearchChange: (q: string) => void`
- `onNewClick: () => void`
- `onImport: () => void`
- `onExport: () => void`

**Step 3: Build Header.module.css**

Extract styles from prototype.html: `.header`, `.headerTop`, `.headerTitle`, `.tPrompt`, `.tLib`, `.btnIcon`, `.searchBar`, `.searchInput`, `.dropdown`, `.dropdownItem`.

**Step 4: Commit**

```bash
git add src/components/Header
git commit -m "feat: add Header component with brand, search, and menu"
```

---

### Task 4: TagBar Component

**Files:**
- Create: `src/components/TagBar/TagBar.tsx`
- Create: `src/components/TagBar/TagBar.module.css`

**Implementation:**
- Renders "全部" pill + dynamically extracted tag pills
- flex-wrap for multi-line layout
- Active state styling
- Accepts props:
  - `tags: string[]`
  - `activeTag: string | null` (null = "全部")
  - `onTagSelect: (tag: string | null) => void`

**Reference:** prototype.html lines 128-155 for styles, lines 551-561 for markup.

**Step 1: Build TagBar.tsx and TagBar.module.css**

**Step 2: Commit**

```bash
git add src/components/TagBar
git commit -m "feat: add TagBar component with multi-line pill layout"
```

---

### Task 5: PromptCard Component (List Item)

**Files:**
- Create: `src/components/PromptCard/PromptCard.tsx`
- Create: `src/components/PromptCard/PromptCard.module.css`

**Implementation:**
- Displays title (with pin icon if pinned), tags, updatedAt
- Hover state shows action buttons (edit, copy, pin/unpin, delete)
- Click toggles accordion expand/collapse
- Expanded state renders content via `marked` (Markdown → HTML)
- Variable `{{变量名}}` highlighted in rendered content

**Props:**
- `prompt: Prompt`
- `isExpanded: boolean`
- `onClick: () => void`
- `onEdit: () => void`
- `onCopy: () => void`
- `onTogglePin: () => void`
- `onDelete: () => void`

**Reference:** prototype.html lines 157-263 for styles, lines 564-722 for markup.

**Step 1: Build PromptCard.tsx and PromptCard.module.css**

**Step 2: Commit**

```bash
git add src/components/PromptCard
git commit -m "feat: add PromptCard with hover actions and accordion expand"
```

---

### Task 6: PromptList Component (Main List View)

**Files:**
- Create: `src/components/PromptList/PromptList.tsx`
- Create: `src/components/PromptList/PromptList.module.css`

**Implementation:**
- Sorts prompts: pinned first (by pinnedAt desc), then unpinned (by updatedAt desc)
- Renders section labels "📌 置顶" and "全部"
- Maps sorted prompts to PromptCard components
- Manages expandedId state
- Filters by activeTag and searchQuery

**Props:**
- `prompts: Prompt[]`
- `activeTag: string | null`
- `searchQuery: string`
- `onEdit: (id: string) => void`
- `onCopy: (prompt: Prompt) => void`
- `onTogglePin: (id: string) => void`
- `onDelete: (id: string) => void`

**Step 1: Build PromptList.tsx and PromptList.module.css**

**Step 2: Commit**

```bash
git add src/components/PromptList
git commit -m "feat: add PromptList with sorting, filtering, and sections"
```

---

### Task 7: PromptForm Component (Create / Edit)

**Files:**
- Create: `src/components/PromptForm/PromptForm.tsx`
- Create: `src/components/PromptForm/PromptForm.module.css`

**Implementation:**
- Full-page form view overlaying the list
- Fields: title (required), tags (comma-separated string), content (required, textarea)
- Variable hint above textarea: `使用 {{变量名}} 插入变量`
- Back arrow button, page title ("新建 Prompt" / "编辑 Prompt")
- Save validates required fields, Cancel confirms if dirty

**Props:**
- `prompt?: Prompt` (undefined = create, defined = edit)
- `onSave: (data: { title: string; tags: string[]; content: string }) => void`
- `onCancel: () => void`

**Reference:** prototype.html lines 265-351 for styles, lines 728-771 for markup.

**Step 1: Build PromptForm.tsx and PromptForm.module.css**

**Step 2: Commit**

```bash
git add src/components/PromptForm
git commit -m "feat: add PromptForm for create and edit"
```

---

### Task 8: Modal, VariableModal, and DeleteConfirm Components

**Files:**
- Create: `src/components/Modal/Modal.tsx`
- Create: `src/components/Modal/Modal.module.css`
- Create: `src/components/VariableModal/VariableModal.tsx`
- Create: `src/components/VariableModal/VariableModal.module.css`
- Create: `src/components/DeleteConfirm/DeleteConfirm.tsx`

**Implementation:**

**Modal:** Generic overlay + centered card container. Props: `open: boolean`, `onClose: () => void`, `children`.

**VariableModal:** Extracts `{{变量名}}` from content, renders input per variable. Props:
- `open: boolean`
- `promptTitle: string`
- `content: string`
- `onConfirm: (filledContent: string) => void`
- `onSkip: () => void`
- `onClose: () => void`

**DeleteConfirm:** Confirm dialog. Props:
- `open: boolean`
- `promptTitle: string`
- `onConfirm: () => void`
- `onCancel: () => void`

**Step 1: Create `src/utils/variables.ts` helper**

```ts
export function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(.+?)\}\}/g) || [];
  return [...new Set(matches.map(m => m.slice(2, -2).trim()))];
}

export function replaceVariables(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{(.+?)\}\}/g, (match, name) => {
    const trimmed = name.trim();
    return values[trimmed] !== undefined ? values[trimmed] : match;
  });
}
```

**Step 2: Build Modal, VariableModal, DeleteConfirm components**

**Reference:** prototype.html lines 353-426 for modal styles, lines 806-827 for variable modal markup, lines 859-871 for delete confirm markup.

**Step 3: Commit**

```bash
git add src/components/Modal src/components/VariableModal src/components/DeleteConfirm src/utils
git commit -m "feat: add Modal, VariableModal, DeleteConfirm, and variable utils"
```

---

### Task 9: Toast Component

**Files:**
- Create: `src/components/Toast/Toast.tsx`
- Create: `src/components/Toast/Toast.module.css`

**Implementation:**
- Fixed bottom-center position
- Shows success icon + message
- Auto-hides after 2 seconds
- Props: `message: string`, `visible: boolean`

**Reference:** prototype.html lines 454-472.

**Step 1: Build Toast.tsx and Toast.module.css**

**Step 2: Commit**

```bash
git add src/components/Toast
git commit -m "feat: add Toast notification component"
```

---

### Task 10: ImportResult Component

**Files:**
- Create: `src/components/ImportResult/ImportResult.tsx`
- Create: `src/components/ImportResult/ImportResult.module.css`

**Implementation:**
- Bottom floating card showing import summary
- Rows: 新增 X 条, 覆盖 X 条, 跳过 X 条
- Auto-hides after 4 seconds
- Props: `result: ImportResult | null`, `visible: boolean`

**Reference:** prototype.html lines 474-506.

**Step 1: Build ImportResult.tsx and ImportResult.module.css**

**Step 2: Commit**

```bash
git add src/components/ImportResult
git commit -m "feat: add ImportResult summary component"
```

---

### Task 11: App Integration — Wire Everything Together

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.module.css`
- Create: `src/hooks/usePrompts.ts`

**Implementation:**

**usePrompts hook:** Central state management.
- State: `prompts`, `loading`
- Methods: `load`, `create`, `update`, `remove`, `togglePin`, `importData`, `exportData`
- Calls storage service, manages state.

**App.tsx:** Composes all components.
- View state: `'list' | 'create' | 'edit'`
- State: `editingPrompt`, `searchQuery`, `activeTag`, `deleteTarget`, `copyTarget`, `toast`, `importResult`
- Renders: Header, TagBar, PromptList / PromptForm (conditional), modals, toast

**Step 1: Build usePrompts.ts hook**

**Step 2: Wire App.tsx with all components**

**Step 3: Build App.module.css (panel layout)**

```css
.app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  font-family: var(--font);
  position: relative;
  overflow: hidden;
}
```

**Step 4: Verify full build**

```bash
npx vite build
```

Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/App.tsx src/App.module.css src/hooks
git commit -m "feat: integrate all components in App with full CRUD flow"
```

---

### Task 12: Search Highlight & Keyword Matching

**Files:**
- Create: `src/utils/search.ts`
- Modify: `src/components/PromptCard/PromptCard.tsx`

**Implementation:**
- `filterPrompts(prompts, query)`: filters by title and content matching
- Highlight matching keywords in PromptCard title when search query is active
- Real-time filtering (already wired via searchQuery in App)

**Step 1: Create search.ts utility**

```ts
export function matchesSearch(prompt: { title: string; content: string }, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return prompt.title.toLowerCase().includes(q) || prompt.content.toLowerCase().includes(q);
}
```

**Step 2: Add title highlight rendering in PromptCard**

**Step 3: Commit**

```bash
git add src/utils/search.ts src/components/PromptCard
git commit -m "feat: add search filtering and keyword highlighting"
```

---

### Task 13: Import/Export Full Flow

**Files:**
- Modify: `src/App.tsx` (wire import file picker and export download)

**Implementation:**

**Export:** Call `exportData()`, create Blob, trigger download as `promptlib_backup_YYYYMMDD.json`.

**Import:**
1. Hidden `<input type="file" accept=".json">` triggered from Header dropdown
2. Read file, parse JSON, validate structure
3. Check for duplicates (by title), if found show choice modal (覆盖/跳过)
4. Call `importData()`, show ImportResult

**Step 1: Add export logic in App**

**Step 2: Add import logic with file picker and duplicate handling**

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add import/export with duplicate handling"
```

---

### Task 14: Placeholder Icons & Final Polish

**Files:**
- Create: `public/icons/icon16.png`, `icon48.png`, `icon128.png`
- Modify: various components for final styling tweaks

**Implementation:**
- Generate simple placeholder PNG icons (purple "P" on white background)
- Final CSS alignment pass against prototype.html
- Ensure all hover states, transitions, scrollbar styling match prototype

**Step 1: Create placeholder icons**

Use a simple canvas-generated PNG or a static SVG-to-PNG. Simplest: create a tiny inline SVG data URL in manifest for dev, or use a 1-color placeholder.

**Step 2: Final style pass**

Compare each component's CSS against prototype.html and adjust spacing, colors, shadows.

**Step 3: Full build and manual test**

```bash
npm run build
```

Load `dist/` as unpacked extension in Chrome, open Side Panel, test all flows.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add icons and polish styling to match prototype"
```
