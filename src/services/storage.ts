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
