import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles.module.scss';

interface DialogProps {
  visible: boolean;
  title?: string;
  content?: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function Dialog(props: DialogProps) {
  const { visible, title, content, onConfirm, onCancel, confirmText = '确定', cancelText = '取消' } = props;

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div className={styles.dialogContainer} onClick={(e) => e.stopPropagation()}>
        {title && <div className={styles.dialogTitle}>{title}</div>}
        {content && <div className={styles.dialogContent}>{content}</div>}
        <div className={styles.dialogActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}