import { useState, useEffect, useCallback } from 'react';
import { Prompt } from '../types/prompt';
import * as storage from '../services/storage';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await storage.getAllPrompts();
    setPrompts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: Pick<Prompt, 'title' | 'tags' | 'content'>) => {
    await storage.createPrompt(data);
    await load();
  };

  const update = async (id: string, data: Partial<Pick<Prompt, 'title' | 'tags' | 'content'>>) => {
    await storage.updatePrompt(id, data);
    await load();
  };

  const remove = async (id: string) => {
    await storage.deletePrompt(id);
    await load();
  };

  const togglePin = async (id: string) => {
    await storage.togglePin(id);
    await load();
  };

  const doExport = async () => {
    const json = await storage.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.href = url;
    a.download = `promptlib_backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (incoming: Prompt[], duplicateAction: 'overwrite' | 'skip') => {
    const result = await storage.importData(incoming, duplicateAction);
    await load();
    return result;
  };

  return { prompts, loading, create, update, remove, togglePin, doExport, doImport };
}
