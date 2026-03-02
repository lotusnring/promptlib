import { useState, useRef } from 'react';
import { Prompt } from '../../types/prompt';
import styles from './PromptForm.module.css';

interface PromptFormProps {
  prompt?: Prompt;
  onSave: (data: { title: string; tags: string[]; content: string }) => void;
  onCancel: () => void;
}

export default function PromptForm({ prompt, onSave, onCancel }: PromptFormProps) {
  const [title, setTitle] = useState(prompt?.title ?? '');
  const [tagsStr, setTagsStr] = useState(prompt?.tags.join(', ') ?? '');
  const [content, setContent] = useState(prompt?.content ?? '');
  const isDirty = useRef(false);

  const handleChange = () => {
    isDirty.current = true;
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('请输入标题');
      return;
    }
    if (!content.trim()) {
      alert('请输入正文');
      return;
    }
    const tags = tagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    onSave({ title: title.trim(), tags, content: content.trim() });
  };

  const handleCancel = () => {
    if (isDirty.current) {
      if (!confirm('有未保存的内容，确认放弃？')) return;
    }
    onCancel();
  };

  return (
    <>
      <div className={styles.editHeader}>
        <button className={styles.btnIcon} title="返回" onClick={handleCancel}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="13,4 7,10 13,16" />
          </svg>
        </button>
        <div className={styles.editHeaderTitle}>
          {prompt ? '编辑 Prompt' : '新建 Prompt'}
        </div>
      </div>
      <div className={styles.editBody}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            标题 <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.formInput}
            type="text"
            placeholder="输入 Prompt 标题"
            value={title}
            onChange={(e) => { setTitle(e.target.value); handleChange(); }}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>标签</label>
          <input
            className={styles.formInput}
            type="text"
            placeholder="多个标签用英文逗号分隔"
            value={tagsStr}
            onChange={(e) => { setTagsStr(e.target.value); handleChange(); }}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            正文 <span className={styles.required}>*</span>
          </label>
          <div className={styles.formHint}>
            提示：使用 <span className={styles.hintTag}>{'{{变量名}}'}</span> 插入变量
          </div>
          <textarea
            className={styles.textarea}
            placeholder="输入 Prompt 正文，支持 Markdown 格式"
            value={content}
            onChange={(e) => { setContent(e.target.value); handleChange(); }}
          />
        </div>
      </div>
      <div className={styles.editFooter}>
        <button className={styles.btnSecondary} onClick={handleCancel}>取消</button>
        <button className={styles.btnPrimary} onClick={handleSave}>保存</button>
      </div>
    </>
  );
}
