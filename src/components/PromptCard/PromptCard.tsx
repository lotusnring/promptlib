import { useMemo } from 'react';
import { marked } from 'marked';
import { Prompt } from '../../types/prompt';
import styles from './PromptCard.module.css';

interface PromptCardProps {
  prompt: Prompt;
  isExpanded: boolean;
  onClick: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  if (date >= todayStart) return `今天 ${hh}:${mm}`;
  if (date >= yesterdayStart) return `昨天 ${hh}:${mm}`;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

function highlightVariables(html: string): string {
  return html.replace(
    /\{\{(.+?)\}\}/g,
    '<span style="background:#FFF3CD;padding:1px 4px;border-radius:3px;color:#856404;font-weight:500">{{$1}}</span>'
  );
}

export default function PromptCard({
  prompt,
  isExpanded,
  onClick,
  onEdit,
  onCopy,
  onTogglePin,
  onDelete,
}: PromptCardProps) {
  const renderedContent = useMemo(() => {
    const html = marked(prompt.content) as string;
    return highlightVariables(html);
  }, [prompt.content]);

  const handleAction = (e: React.MouseEvent, handler: () => void) => {
    e.stopPropagation();
    handler();
  };

  return (
    <div className={styles.promptCard} onClick={onClick}>
      <div className={styles.promptCardTitle}>
        {prompt.isPinned && <span className={styles.pinIcon}>📌</span>}
        {prompt.title}
      </div>

      <div className={styles.promptCardMeta}>
        {prompt.tags.map(tag => (
          <span key={tag} className={styles.metaTag}>{tag}</span>
        ))}
        <span className={styles.metaTime}>{formatTime(prompt.updatedAt)}</span>
      </div>

      <div className={styles.promptActions}>
        <button className={styles.actBtn} title="编辑" onClick={(e) => handleAction(e, onEdit)}>✏️</button>
        <button className={styles.actBtn} title="复制" onClick={(e) => handleAction(e, onCopy)}>📋</button>
        <button className={styles.actBtn} title={prompt.isPinned ? '取消置顶' : '置顶'} onClick={(e) => handleAction(e, onTogglePin)}>📌</button>
        <button className={`${styles.actBtn} ${styles.actBtnDanger}`} title="删除" onClick={(e) => handleAction(e, onDelete)}>🗑️</button>
      </div>

      {isExpanded && (
        <div
          className={styles.promptExpand}
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      )}
    </div>
  );
}
