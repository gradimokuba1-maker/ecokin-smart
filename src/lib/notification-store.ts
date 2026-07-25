// EcoKin Smart — Système de notifications temps réel (localStorage + CustomEvent).
import { useEffect, useState } from "react";

export type NotificationKind =
  | "report_created"
  | "agent_assigned"
  | "status_changed"
  | "intervention_completed"
  | "mission_assigned";

export type EcoNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  at: string;
  read: boolean;
  targetId?: string;
  meta?: Record<string, string | number>;
};

const KEY = "ecokin_notifications_v1";
const EVT = "ecokin:notifications";
const MAX = 100;

function read(): EcoNotification[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(list: EcoNotification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event(EVT));
}

export function pushNotification(input: Omit<EcoNotification, "id" | "at" | "read">) {
  const item: EcoNotification = {
    ...input,
    id: `NTF-${Date.now().toString(36).toUpperCase()}`,
    at: new Date().toISOString(),
    read: false,
  };
  write([item, ...read()]);

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(item.title, { body: item.message, tag: item.id });
    } catch {
      /* ignore */
    }
  }
  return item;
}

export function markNotificationRead(id: string) {
  write(read().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function markAllNotificationsRead() {
  write(read().map((n) => ({ ...n, read: true })));
}

export function useNotifications() {
  const [items, setItems] = useState<EcoNotification[]>([]);

  useEffect(() => {
    const refresh = () => setItems(read());
    refresh();
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  return {
    items,
    unreadCount,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
  };
}
