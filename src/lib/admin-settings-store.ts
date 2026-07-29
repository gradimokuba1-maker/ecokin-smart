// EcoKin Smart — Store de paramètres administrateur
// Persistance localStorage pour tous les paramètres de la plateforme
import { useEffect, useState, useCallback } from "react";
import { logAudit } from "./audit-log";

// ============================================================
// Types
// ============================================================

export type AdminProfile = {
  name: string;
  email: string;
  phone: string;
  title: string;
  avatar?: string;
};

export type PlatformConfig = {
  platformName: string;
  platformDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website: string;
  language: "fr" | "en" | "lingala";
  timezone: string;
  currency: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

export type NotificationSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  reportCreated: boolean;
  reportStatusChanged: boolean;
  crisisAlert: boolean;
  weeklyDigest: boolean;
  monthlyReport: boolean;
  systemAlerts: boolean;
  emailFrom: string;
  smsProvider: string;
};

export type SecuritySettings = {
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string[];
  auditLogRetention: number; // jours
  autoLogoutEnabled: boolean;
  autoLogoutMinutes: number;
};

export type WasteCollectionSettings = {
  collectionFrequency: Record<string, number>; // commune -> jours/semaine
  defaultBinTypes: string[];
  binCapacities: Record<string, number>; // type -> litres
  pmeMultiplier: number;
  latePaymentPenalty: number; // pourcentage
  gracePeriodDays: number;
  collectionHours: string;
  emergencyCollectionEnabled: boolean;
  minimumVolumeForEmergency: number; // m³
};

export type GisSettings = {
  defaultMapCenter: [number, number];
  defaultZoom: number;
  mapProvider: "carto" | "osm" | "mapbox";
  showCollectionPoints: boolean;
  showRecyclingCenters: boolean;
  showFloodZones: boolean;
  showTruckTracking: boolean;
  clusterMarkers: boolean;
  heatmapEnabled: boolean;
  refreshInterval: number; // secondes
};

export type AiSettings = {
  enabled: boolean;
  model: string;
  apiKey: string;
  autoClassification: boolean;
  autoUrgencyDetection: boolean;
  autoAssignment: boolean;
  floodRiskDetection: boolean;
  volumeEstimation: boolean;
  compositionAnalysis: boolean;
  confidenceThreshold: number; // 0-100
  learningEnabled: boolean;
  maxDailyApiCalls: number;
  fallbackOnError: boolean;
};

export type BackupSettings = {
  autoBackup: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupTime: string; // HH:mm
  retentionDays: number;
  lastBackup?: string;
  backupSize?: string;
  includeAuditLogs: boolean;
  includeReports: boolean;
  includeHouseholds: boolean;
  includeSettings: boolean;
};

export type AdminSettings = {
  profile: AdminProfile;
  platform: PlatformConfig;
  notifications: NotificationSettings;
  security: SecuritySettings;
  wasteCollection: WasteCollectionSettings;
  gis: GisSettings;
  ai: AiSettings;
  backup: BackupSettings;
};

// ============================================================
// Valeurs par défaut
// ============================================================

const DEFAULT_SETTINGS: AdminSettings = {
  profile: {
    name: "Administrateur",
    email: "admin@ecokin.cd",
    phone: "+243 900 000 000",
    title: "Super Administrateur",
  },
  platform: {
    platformName: "EcoKin Smart",
    platformDescription:
      "Plateforme Smart City pour la gestion intelligente des déchets sur les 24 communes de Kinshasa.",
    contactEmail: "contact@ecokin.cd",
    contactPhone: "+243 800 000 000",
    address: "Kinshasa, République Démocratique du Congo",
    website: "https://ecokin.cd",
    language: "fr",
    timezone: "Africa/Lagos",
    currency: "CDF",
    maintenanceMode: false,
    maintenanceMessage: "Plateforme en maintenance. Veuillez réessayer plus tard.",
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    reportCreated: true,
    reportStatusChanged: true,
    crisisAlert: true,
    weeklyDigest: false,
    monthlyReport: true,
    systemAlerts: true,
    emailFrom: "noreply@ecokin.cd",
    smsProvider: "Orange Money",
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
    auditLogRetention: 90,
    autoLogoutEnabled: true,
    autoLogoutMinutes: 30,
  },
  wasteCollection: {
    collectionFrequency: {},
    defaultBinTypes: ["120L", "240L", "660L"],
    binCapacities: { "120L": 120, "240L": 240, "660L": 660 },
    pmeMultiplier: 1.5,
    latePaymentPenalty: 5,
    gracePeriodDays: 15,
    collectionHours: "06:00 – 12:00",
    emergencyCollectionEnabled: true,
    minimumVolumeForEmergency: 5,
  },
  gis: {
    defaultMapCenter: [-4.3317, 15.3139],
    defaultZoom: 12,
    mapProvider: "carto",
    showCollectionPoints: true,
    showRecyclingCenters: true,
    showFloodZones: true,
    showTruckTracking: true,
    clusterMarkers: true,
    heatmapEnabled: false,
    refreshInterval: 30,
  },
  ai: {
    enabled: true,
    model: "google/gemini-3-flash-preview",
    apiKey: "",
    autoClassification: true,
    autoUrgencyDetection: true,
    autoAssignment: true,
    floodRiskDetection: true,
    volumeEstimation: true,
    compositionAnalysis: true,
    confidenceThreshold: 70,
    learningEnabled: true,
    maxDailyApiCalls: 1000,
    fallbackOnError: true,
  },
  backup: {
    autoBackup: true,
    backupFrequency: "daily",
    backupTime: "03:00",
    retentionDays: 30,
    includeAuditLogs: true,
    includeReports: true,
    includeHouseholds: true,
    includeSettings: true,
  },
};

// ============================================================
// Store
// ============================================================

const KEY = "ecokin_admin_settings_v1";
const EVT = "ecokin:admin-settings";

function read(): AdminSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function write(settings: AdminSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(EVT));
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setSettings(read());
    setIsLoaded(true);
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

  const updateSettings = useCallback((patch: Partial<AdminSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      write(next);
      logAudit({
        user: "Administrateur",
        role: "admin",
        action: "settings_update",
        details: `Mise à jour des paramètres: ${Object.keys(patch).join(", ")}`,
      });
      return next;
    });
  }, []);

  const updateSection = useCallback(
    <K extends keyof AdminSettings>(section: K, values: Partial<AdminSettings[K]>) => {
      setSettings((prev) => {
        const next = {
          ...prev,
          [section]: { ...prev[section], ...values },
        };
        write(next);
        logAudit({
          user: "Administrateur",
          role: "admin",
          action: "settings_update",
          details: `Mise à jour: ${section}`,
        });
        return next;
      });
    },
    [],
  );

  const resetSettings = useCallback(() => {
    write(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
    logAudit({
      user: "Administrateur",
      role: "admin",
      action: "settings_update",
      details: "Réinitialisation de tous les paramètres",
    });
  }, []);

  const exportSettings = useCallback((): string => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      write(merged);
      setSettings(merged);
      logAudit({
        user: "Administrateur",
        role: "admin",
        action: "settings_update",
        details: "Importation des paramètres",
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    updateSection,
    resetSettings,
    exportSettings,
    importSettings,
  };
}

// ============================================================
// Helpers
// ============================================================

export const LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "lingala", label: "Lingala" },
];

export const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Kinshasa",
  "Africa/Lubumbashi",
  "UTC",
  "Europe/Paris",
  "America/New_York",
];

export const MAP_PROVIDERS = [
  { value: "carto", label: "CARTO Voyager" },
  { value: "osm", label: "OpenStreetMap" },
  { value: "mapbox", label: "MapBox" },
];

export const BACKUP_FREQUENCIES = [
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
];

export const SMS_PROVIDERS = [
  "Orange Money",
  "Airtel Money",
  "M-Pesa (Vodacom)",
  "Africell Money",
  "Twilio",
  "AWS SNS",
];

export const AI_MODELS = [
  { value: "google/gemini-3-flash-preview", label: "Google Gemini 3 Flash" },
  { value: "google/gemini-3-pro-preview", label: "Google Gemini 3 Pro" },
  { value: "openai/gpt-4o", label: "OpenAI GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
  { value: "anthropic/claude-3.5-sonnet", label: "Anthropic Claude 3.5 Sonnet" },
  { value: "meta/llama-3.1-70b", label: "Meta Llama 3.1 70B" },
];
