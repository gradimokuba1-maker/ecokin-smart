// Perceptual hash (aHash 8x8) — détection anti-fraude des photos réutilisées.
// Fonctionne en navigateur : downscale via canvas, moyenne des niveaux de gris,
// produit une empreinte 64 bits (hex 16 chars). Comparaison Hamming.

const KEY = "ecokin_image_hashes_v1";

export type StoredHash = { hash: string; at: string; reportId?: string };

export async function computePerceptualHash(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 8;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no ctx"));
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const grays: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          grays.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }
        const avg = grays.reduce((a, b) => a + b, 0) / grays.length;
        let bits = "";
        for (const g of grays) bits += g >= avg ? "1" : "0";
        // -> hex 16 chars
        let hex = "";
        for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
        resolve(hex);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = dataUrl;
  });
}

export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d;
}

export function similarityPct(a: string, b: string): number {
  return Math.round((1 - hammingDistance(a, b) / 64) * 100);
}

function read(): StoredHash[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(list: StoredHash[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(-500)));
}

export function findDuplicate(hash: string, threshold = 95): { match: StoredHash; similarity: number } | null {
  const list = read();
  let best: { match: StoredHash; similarity: number } | null = null;
  for (const h of list) {
    const sim = similarityPct(hash, h.hash);
    if (sim >= threshold && (!best || sim > best.similarity)) best = { match: h, similarity: sim };
  }
  return best;
}

export function saveHash(hash: string, reportId?: string) {
  const list = read();
  list.push({ hash, at: new Date().toISOString(), reportId });
  write(list);
}
