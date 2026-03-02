import Modal from '../Modal/Modal';
import styles from '../VariableModal/VariableModal.module.css';

interface DeleteConfirmProps {
  open: boolean;
  promptTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({
  open,
  promptTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className={styles.header}>确认删除</div>
      <div className={styles.body}>
        确认删除「{promptTitle}」这条 Prompt 吗？此操作不可恢复。
      </div>
      <div className={styles.footer}>
        <button className={styles.footerBtnMuted} onClick={onCancel}>
          取消
        </button>
        <button
          className={styles.footerBtnPrimary}
          style={{ color: 'var(--danger)', fontWeight: 600 }}
          onClick={onConfirm}
        >
          删除
        </button>
      </div>
    </Modal>
  );
}
