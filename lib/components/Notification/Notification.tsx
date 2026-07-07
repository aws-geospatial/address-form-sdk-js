import { FunctionComponent } from "react";
import clsx from "clsx";
import { Notification as NotificationType } from "../../stores/notificationStore";
import { notificationVariants, messageVariants, closeButtonVariants } from "./styles.css";

type NotificationProps = {
  notification: NotificationType;
  onRemove: (id: string) => void;
};

export const Notification: FunctionComponent<NotificationProps> = ({ notification, onRemove }) => {
  return (
    <div
      className={clsx(notificationVariants[notification.type], "aws-notification")}
      data-notification-type={notification.type}
    >
      <span className={messageVariants[notification.type]}>{notification.message}</span>
      <button className={closeButtonVariants[notification.type]} onClick={() => onRemove(notification.id)}>
        ×
      </button>
    </div>
  );
};
