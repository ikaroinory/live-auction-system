import { useNotificationStore } from '../../store/useNotificationStore';
import './ToastNotification.scss';

export const ToastNotification = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="toast-notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast-notification ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="toast-icon">
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✕'}
            {notification.type === 'warning' && '⚠'}
            {notification.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-message">{notification.message}</div>
        </div>
      ))}
    </div>
  );
};
