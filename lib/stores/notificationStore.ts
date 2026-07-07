import { create } from "zustand";

export type NotificationType = "error" | "warning";

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
};

type NotificationStore = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id"> & { id?: string }, onAdd?: () => void) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification, onAdd) => {
    set((state) => {
      const id = notification.id ?? crypto.randomUUID();

      if (state.notifications.some((notification) => notification.id === id)) {
        return state;
      }

      onAdd?.();

      return {
        notifications: [...state.notifications, { ...notification, id }],
      };
    });
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },

  clearNotifications: () => {
    set({
      notifications: [],
    });
  },
}));
