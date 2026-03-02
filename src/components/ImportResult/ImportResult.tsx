import { useEffect } from 'react';
import { ImportResult as ImportResultType } from '../../services/storage';
import styles from './ImportResult.module.css';

interface ImportResultProps {
  result: ImportResultType | null;
  visible: boolean;
  onHide: () => void;
}

export default function ImportResult({ result, visible, onHide }: ImportResultProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, 4000);
    return () => clearTimeout(timer);
  }, [visible, onHide]);

  if (!visible || !result) return null;

  return (
    <div className={styles.importResult}>
      <div className={styles.title}>
        <span className={styles.check}>✓</span> 导入完成
      </div>
      <div className={styles.row}>
        <span>新增</span>
        <span className={styles.rowValue}>{result.added} 条</span>
      </div>
      <div className={styles.row}>
        <span>覆盖</span>
        <span className={styles.rowValue}>{result.overwritten} 条</span>
      </div>
      <div className={styles.row}>
        <span>跳过</span>
        <span className={styles.rowValue}>{result.skipped} 条</span>
      </div>
    </div>
  );
}
