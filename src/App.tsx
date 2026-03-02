import { useState, useCallback, useMemo, useRef } from 'react';
import { Prompt } from './types/prompt';
import { usePrompts } from './hooks/usePrompts';
import { extractVariables } from './utils/variables';
import { ImportResult as ImportResultType } from './services/storage';
import Header from './components/Header/Header';
import TagBar from './components/TagBar/TagBar';
import PromptList from './components/PromptList/PromptList';
import PromptForm from './components/PromptForm/PromptForm';
import VariableModal from './components/VariableModal/VariableModal';
import DeleteConfirm from './components/DeleteConfirm/DeleteConfirm';
import Toast from './components/Toast/Toast';
import ImportResult from './components/ImportResult/ImportResult';
import styles from './App.module.css';

type ViewState = 'list' | 'create' | 'edit';

export default function App() {
  const { prompts, create, update, remove, togglePin, doExport, doImport } = usePrompts();

  const [view, setView] = useState<ViewState>('list');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null);
  const [copyTarget, setCopyTarget] = useState<Prompt | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Import result
  const [importResultData, setImportResultData] = useState<ImportResultType | null>(null);
  const [importResultVisible, setImportResultVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique tags
  const tags = useMemo(() => {
    const all = prompts.flatMap(p => p.tags);
    return [...new Set(all)].sort();
  }, [prompts]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  // Handlers
  const handleNewClick = () => {
    setEditingPrompt(undefined);
    setView('create');
  };

  const handleEdit = (id: string) => {
    const p = prompts.find(p => p.id === id);
    if (p) {
      setEditingPrompt(p);
      setView('edit');
    }
  };

  const handleSave = async (data: { title: string; tags: string[]; content: string }) => {
    if (view === 'edit' && editingPrompt) {
      await update(editingPrompt.id, data);
    } else {
      await create(data);
    }
    setView('list');
    setEditingPrompt(undefined);
  };

  const handleCancel = () => {
    setView('list');
    setEditingPrompt(undefined);
  };

  const handleCopy = (prompt: Prompt) => {
    const vars = extractVariables(prompt.content);
    if (vars.length > 0) {
      setCopyTarget(prompt);
    } else {
      navigator.clipboard.writeText(prompt.content);
      showToast('已复制到剪贴板');
    }
  };

  const handleCopyConfirm = (filledContent: string) => {
    navigator.clipboard.writeText(filledContent);
    setCopyTarget(null);
    showToast('已复制到剪贴板');
  };

  const handleCopySkip = () => {
    if (copyTarget) {
      navigator.clipboard.writeText(copyTarget.content);
    }
    setCopyTarget(null);
    showToast('已复制到剪贴板');
  };

  const handleDelete = (id: string) => {
    const p = prompts.find(p => p.id === id);
    if (p) setDeleteTarget(p);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    doExport();
    showToast('导出成功');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const incoming = JSON.parse(text) as Prompt[];

      if (!Array.isArray(incoming)) {
        alert('文件格式错误：不是有效的 JSON 数组');
        return;
      }

      // Check for duplicates
      const existingTitles = new Set(prompts.map(p => p.title));
      const hasDuplicates = incoming.some(p => existingTitles.has(p.title));

      let action: 'overwrite' | 'skip' = 'skip';
      if (hasDuplicates) {
        const choice = confirm('发现重复的 Prompt（标题相同），点击「确定」覆盖，点击「取消」跳过重复项');
        action = choice ? 'overwrite' : 'skip';
      }

      const result = await doImport(incoming, action);
      setImportResultData(result);
      setImportResultVisible(true);
    } catch {
      alert('导入失败：文件格式不正确');
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className={styles.app}>
      {view === 'list' ? (
        <>
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewClick={handleNewClick}
            onImport={handleImportClick}
            onExport={handleExport}
          />
          <TagBar
            tags={tags}
            activeTag={activeTag}
            onTagSelect={setActiveTag}
          />
          <PromptList
            prompts={prompts}
            activeTag={activeTag}
            searchQuery={searchQuery}
            onEdit={handleEdit}
            onCopy={handleCopy}
            onTogglePin={(id) => togglePin(id)}
            onDelete={handleDelete}
          />
        </>
      ) : (
        <PromptForm
          prompt={editingPrompt}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <VariableModal
        open={copyTarget !== null}
        promptTitle={copyTarget?.title ?? ''}
        content={copyTarget?.content ?? ''}
        onConfirm={handleCopyConfirm}
        onSkip={handleCopySkip}
        onClose={() => setCopyTarget(null)}
      />

      <DeleteConfirm
        open={deleteTarget !== null}
        promptTitle={deleteTarget?.title ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <ImportResult
        result={importResultData}
        visible={importResultVisible}
        onHide={() => setImportResultVisible(false)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
