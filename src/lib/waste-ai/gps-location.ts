// EcoKin Smart — Service de localisation GPS automatique
// Détection de la commune, quartier et adresse approximative

import type { LocationInfo } from "./types";
import { DEFAULT_CITY, detectCityCommune } from "@/lib/cities";

export type GPSState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "ok"; lat: number; lng: number; accuracy: number; altitudeM?: number }
  | { status: "denied" }
  | { status: "unavailable" };

/**
 * Demande la position GPS avec haute précision
 * Retourne l'état GPS et les coordonnées
 */
export function requestGPSPosition(options?: {
  maximumAge?: number;
  timeout?: number;
}): Promise<GPSState> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ status: "unavailable" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          status: "ok",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitudeM: position.coords.altitude ?? undefined,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ status: "denied" });
        } else {
          resolve({ status: "unavailable" });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: options?.timeout ?? 15000,
        maximumAge: options?.maximumAge ?? 60000,
      },
    );
  });
}

/**
 * Construit les informations de localisation complètes
 * à partir des coordonnées GPS
 */
export function buildLocationInfo(
  lat: number,
  lng: number,
  accuracy: number,
  altitudeM?: number,
): LocationInfo {
  const commune = detectCityCommune(DEFAULT_CITY, lat, lng);

  return {
    lat: Math.round(lat * 100000) / 100000,
    lng: Math.round(lng * 100000) / 100000,
    accuracy: Math.round(accuracy),
    commune: commune.id,
    altitudeM: altitudeM == null ? undefined : Math.round(altitudeM),
    capturedAt: new Date().toISOString(),
    quartier: estimateQuartier(lat, lng, commune.id),
    adresse: buildApproximateAddress(lat, lng, commune.name),
  };
}

/**
 * Estimation du quartier basée sur les coordonnées
 * (version simplifiée - à enrichir avec une base de données réelle)
 */
function estimateQuartier(lat: number, lng: number, communeId: string): string {
  // Quartiers connus par commune (à étendre)
  const quartiers: Record<string, string[]> = {
    matete: ["Mokali", "Mabanga", "Kimpwanza", "Mazamba"],
    lemba: ["Lemba-Terminus", "Kindele", "Mama Mobutu", "Salongo"],
    kisenso: ["Kisenso", "Mikondo", "Kimbangu", "Mbanza-Lemba"],
    gombe: ["Gombe", "CBD", "Batetela", "Joli-Parc"],
    kintambo: ["Kintambo", "Mbinza", "Mbinza-Météo", "Mbinza-Upn"],
    bandalungwa: ["Bandal", "Bandal Tshibangu", "Bandal Mbanza"],
    "kasa-vubu": ["Kasa-Vubu", "Buma", "Mukulua"],
    kalamu: ["Kalamu", "Matonge", "Yolo", "Yolo-Nord"],
    bumbu: ["Bumbu", "Bumbu-Mbanza", "Mbanza-Bumbu"],
    makala: ["Makala", "Mbanza-Makala", "Ngaba-Makala"],
    selembao: ["Selembao", "Mbanza-Selembao", "Mikondo"],
    ngaba: ["Ngaba", "Mbanza-Ngaba", "Ngaba-Makala"],
    limete: ["Limete", "Limete-Industriel", "Limete-Résidentiel"],
    lingwala: ["Lingwala", "Lingwala-Mbanza", "Victoire"],
    kinshasa: ["Kinshasa", "Kinshasa-Mbanza", "Kinshasa-Centre"],
    barumbu: ["Barumbu", "Barumbu-Mbanza", "Mbanza-Barumbu"],
    "ngiri-ngiri": ["Ngiri-Ngiri", "Mbanza-Ngiri", "Ngiri-Mbanza"],
    "mont-ngafula": ["Mont-Ngafula", "Mbinza", "Mbinza-Météo", "Kimwenza"],
    ngaliema: ["Ngaliema", "Mbinza", "Mbinza-Upn", "Joli-Parc"],
    masina: ["Masina", "Masina-Mbanza", "Masina-Ngiri"],
    ndjili: ["N'djili", "Mbanza-Ndjili", "Ndjili-Mbanza"],
    nsele: ["N'sele", "Mbanza-Nsele", "Nsele-Mbanza"],
    maluku: ["Maluku", "Mbanza-Maluku", "Maluku-Mbanza"],
    kimbanseke: ["Kimbanseke", "Mbanza-Kimbanseke", "Kimbanseke-Mbanza"],
  };

  const communeQuartiers = quartiers[communeId];
  if (!communeQuartiers || communeQuartiers.length === 0) {
    return "Quartier non déterminé";
  }

  // Sélection pseudo-aléatoire basée sur les coordonnées pour la cohérence
  const hash = Math.abs(Math.round(lat * 1000 + lng * 1000));
  const index = hash % communeQuartiers.length;
  return communeQuartiers[index];
}

/**
 * Construit une adresse approximative
 */
function buildApproximateAddress(lat: number, lng: number, communeName: string): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "O";
  const latDeg = Math.abs(lat);
  const lngDeg = Math.abs(lng);
  return `${communeName}, Kinshasa (${latDir} ${latDeg.toFixed(4)}°, ${lngDir} ${lngDeg.toFixed(4)}°)`;
}

/**
 * Calcule la distance entre deux points GPS en mètres
 */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
