import { useState } from 'react';
import { Prompt } from '../../types/prompt';
import { matchesSearch } from '../../utils/search';
import PromptCard from '../PromptCard/PromptCard';
import styles from './PromptList.module.css';

interface PromptListProps {
  prompts: Prompt[];
  activeTag: string | null;
  searchQuery: string;
  onEdit: (id: string) => void;
  onCopy: (prompt: Prompt) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PromptList({
  prompts,
  activeTag,
  searchQuery,
  onEdit,
  onCopy,
  onTogglePin,
  onDelete,
}: PromptListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = prompts
    .filter(p => activeTag === null || p.tags.includes(activeTag))
    .filter(p => matchesSearch(p, searchQuery));

  const pinned = filtered
    .filter(p => p.isPinned)
    .sort((a, b) => new Date(b.pinnedAt!).getTime() - new Date(a.pinnedAt!).getTime());

  const unpinned = filtered
    .filter(p => !p.isPinned)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (filtered.length === 0) {
    return (
      <div className={styles.listArea}>
        <div className={styles.emptyState}>
          {searchQuery || activeTag ? '没有匹配的 Prompt' : '还没有 Prompt，点击 + 创建一条吧'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.listArea}>
      {pinned.length > 0 && (
        <>
          <div className={styles.sectionLabel}>📌 置顶</div>
          {pinned.map(p => (
            <PromptCard
              key={p.id}
              prompt={p}
              isExpanded={expandedId === p.id}
              onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              onEdit={() => onEdit(p.id)}
              onCopy={() => onCopy(p)}
              onTogglePin={() => onTogglePin(p.id)}
              onDelete={() => onDelete(p.id)}
            />
          ))}
        </>
      )}
      {unpinned.length > 0 && (
        <>
          <div className={styles.sectionLabel}>全部</div>
          {unpinned.map(p => (
            <PromptCard
              key={p.id}
              prompt={p}
              isExpanded={expandedId === p.id}
              onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              onEdit={() => onEdit(p.id)}
              onCopy={() => onCopy(p)}
              onTogglePin={() => onTogglePin(p.id)}
              onDelete={() => onDelete(p.id)}
            />
          ))}
        </>
      )}
      {(searchQuery || activeTag) && (
        <div className={styles.emptyState}>共 {filtered.length} 条结果</div>
      )}
    </div>
  );
}
