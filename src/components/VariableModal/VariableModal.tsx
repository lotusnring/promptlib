import { useState } from 'react';
import Modal from '../Modal/Modal';
import { extractVariables, replaceVariables } from '../../utils/variables';
import styles from './VariableModal.module.css';

interface VariableModalProps {
  open: boolean;
  promptTitle: string;
  content: string;
  onConfirm: (filledContent: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function VariableModal({
  open,
  promptTitle,
  content,
  onConfirm,
  onSkip,
  onClose,
}: VariableModalProps) {
  const variables = extractVariables(content);
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    const filled = replaceVariables(content, values);
    onConfirm(filled);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.header}>填写变量</div>
      <div className={styles.body}>
        <div className={styles.promptTitle}>{promptTitle}</div>
        {variables.map(name => (
          <div key={name} className={styles.formGroup}>
            <label className={styles.varLabel}>{name}</label>
            <input
              className={styles.varInput}
              type="text"
              placeholder="输入变量值"
              value={values[name] || ''}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <button className={styles.footerBtnMuted} onClick={onSkip}>
          跳过，直接复制
        </button>
        <button className={styles.footerBtnPrimary} onClick={handleConfirm}>
          确认复制
        </button>
      </div>
    </Modal>
  );
}
