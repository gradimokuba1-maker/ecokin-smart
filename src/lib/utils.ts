import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Locale-stable number formatter to prevent SSR/CSR hydration mismatches
// caused by `Number.prototype.toLocaleString()` differing between server (en-US)
// and browser (fr-FR).
export function formatNumber(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Clears every EcoKin Smart client-side dataset. Used by the admin "Reset"
// button to start a fresh field-test phase.
export const ECOKIN_STORAGE_KEYS = [
  "ecokin_user_v1",
  "ecokin_access_v1",
  "ecokin_audit_v1",
  "ecokin_live_reports_v1",
  "ecokin_kin_label_v1",
  "ecokin_learning_v1",
  "ecokin_fleet_v1",
  "ecokin_routes_v1",
  "ecokin_image_hashes_v1",
  "ecokin_notifications_v1",
];

export function resetAllEcoKinData() {
  if (typeof window === "undefined") return;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith("ecokin_")) localStorage.removeItem(k);
    }
  } catch {}
}
