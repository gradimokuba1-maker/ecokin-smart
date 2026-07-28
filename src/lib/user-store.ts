// EcoKin Smart — Module Utilisateur.
import { useEffect, useState, useCallback } from "react";

export type UserRole = "citoyen" | "agent" | "bourgmestre" | "gouverneur" | "admin";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  commune?: string; // For bourgmestre
};

const K_USER = "ecokin_user_v1";
const EVT = "ecokin:user";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event(EVT));
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  const refresh = useCallback(() => {
    setUser(read<User>(K_USER));
  }, []);

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, [refresh]);

  // Initialize with a default user if empty
  useEffect(() => {
    const data = read<User>(K_USER);
    if (!data) {
        const defaultUser: User = {
            id: "U-1",
            name: "Citoyen",
            role: "citoyen",
        };
      write(K_USER, defaultUser);
      refresh();
    }
  }, [refresh]);

  return {
    user,
    login(u: User) {
      write(K_USER, u);
      refresh();
    },
    logout() {
        if (typeof window === "undefined") return;
        localStorage.removeItem(K_USER);
        refresh();
    }
  };
}
