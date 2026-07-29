// EcoKin Smart — Waste3DViewer : Visualisation 3D du dépôt sauvage
// Aperçu du modèle 3D si disponible (LiDAR/ARCore) ou représentation volumétrique

import { type WasteAnalysisResult } from "@/lib/waste-ai/types";
import { Box, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Props = {
  result: WasteAnalysisResult;
  compact?: boolean;
};

export function Waste3DViewer({ result, compact }: Props) {
  const [expanded, setExpanded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation simple de rotation pour la visualisation 3D
  useEffect(() => {
    if (!canvasRef.current || !result) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // DPI scaling for better performance on high-res mobile screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;
    let angle = 0;

    const draw = () => {
      if (!ctx || !canvas) return;
      // Use client rect dimensions for calculations
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Fond
      ctx.fillStyle = "hsl(var(--secondary))";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Dimensions du volume
      const dim = result.dimensions;
      const maxDim = Math.max(dim.lengthM, dim.widthM, dim.heightAvgM, 1);
      const scale = (Math.min(w, h) * 0.3) / maxDim;

      const l = dim.lengthM * scale;
      const wi = dim.widthM * scale;
      const he = dim.heightAvgM * scale;

      angle += 0.008; // Slower rotation is less CPU intensive
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      // Dessiner un parallélépipède 3D simple (vue isométrique)
      const drawBox = () => {
        const depth = Math.min(l, wi) * 0.4;

        // Points du parallélépipède
        const pts: [number, number, number][] = [
          [-l / 2, -he / 2, -depth / 2], // 0: arrière-gauche-bas
          [l / 2, -he / 2, -depth / 2], // 1: arrière-droit-bas
          [l / 2, -he / 2, depth / 2], // 2: avant-droit-bas
          [-l / 2, -he / 2, depth / 2], // 3: avant-gauche-bas
          [-l / 2, he / 2, -depth / 2], // 4: arrière-gauche-haut
          [l / 2, he / 2, -depth / 2], // 5: arrière-droit-haut
          [l / 2, he / 2, depth / 2], // 6: avant-droit-haut
          [-l / 2, he / 2, depth / 2], // 7: avant-gauche-haut
        ];

        // Projection isométrique simple
        const project = (x: number, y: number, z: number): [number, number] => {
          const cos30 = Math.cos(Math.PI / 6);
          const sin30 = Math.sin(Math.PI / 6);
          const px = cx + (x * cosA - z * sinA);
          const py = cy + (y * cos30 + (x * sinA + z * cosA) * sin30);
          return [px, py];
        };

        const projected = pts.map((p) => project(p[0], p[1], p[2]));

        // Couleurs basées sur la composition
        const mainColor = getCompositionColor(result.mainCategory);

        // Dessiner les faces (arrière-plan d'abord)
        ctx.strokeStyle = mainColor + "90"; // Slightly transparent stroke
        ctx.lineWidth = 2;

        // Face avant
        ctx.fillStyle = mainColor + "30";
        ctx.beginPath();
        ctx.moveTo(projected[3][0], projected[3][1]);
        ctx.lineTo(projected[2][0], projected[2][1]);
        ctx.lineTo(projected[6][0], projected[6][1]);
        ctx.lineTo(projected[7][0], projected[7][1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Face dessus
        ctx.fillStyle = mainColor + "20";
        ctx.beginPath();
        ctx.moveTo(projected[4][0], projected[4][1]);
        ctx.lineTo(projected[5][0], projected[5][1]);
        ctx.lineTo(projected[6][0], projected[6][1]);
        ctx.lineTo(projected[7][0], projected[7][1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Face droite
        ctx.fillStyle = mainColor + "25";
        ctx.beginPath();
        ctx.moveTo(projected[1][0], projected[1][1]);
        ctx.lineTo(projected[2][0], projected[2][1]);
        ctx.lineTo(projected[6][0], projected[6][1]);
        ctx.lineTo(projected[5][0], projected[5][1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Arêtes visibles
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        for (const [i, j] of [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
          [4, 5],
          [5, 6],
          [6, 7],
          [7, 4],
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
        ]) {
          ctx.beginPath();
          ctx.moveTo(projected[i][0], projected[i][1]);
          ctx.lineTo(projected[j][0], projected[j][1]);
          ctx.stroke();
        }

        // Labels des dimensions
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "11px Inter, sans-serif";
        ctx.textAlign = "center";

        const labelOffset = 20;
        // Longueur
        const lMid = [
          (projected[0][0] + projected[1][0]) / 2,
          (projected[0][1] + projected[1][1]) / 2 + labelOffset,
        ];
        ctx.fillText(`${dim.lengthM}m`, lMid[0], lMid[1]);

        // Largeur
        const wMid = [
          (projected[1][0] + projected[2][0]) / 2 + labelOffset,
          (projected[1][1] + projected[2][1]) / 2,
        ];
        ctx.fillText(`${dim.widthM}m`, wMid[0], wMid[1]);

        // Hauteur
        const hMid = [
          (projected[4][0] + projected[0][0]) / 2 - labelOffset,
          (projected[4][1] + projected[0][1]) / 2,
        ];
        ctx.fillText(`${dim.heightAvgM}m`, hMid[0], hMid[1]);
      };

      drawBox();
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [result, expanded]); // Reruns when expanded changes size

  const getCompositionColor = (material: string): string => {
    const colors: Record<string, string> = {
      plastique: "#0ea5e9",
      carton: "#f59e0b",
      papier: "#eab308",
      verre: "#14b8a6",
      metal: "#94a3b8",
      organique: "#65a30d",
      dangereux: "#ef4444",
      meuble: "#a16207",
      electronique: "#6366f1",
      construction: "#a16207",
      mixte: "#475569",
      inconnu: "#6b7280",
    };
    return colors[material] ?? "#6b7280";
  };

  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-lg border bg-card">
        <canvas ref={canvasRef} width={300} height={180} className="w-full" />
        <div className="absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-1 text-xs font-bold backdrop-blur-sm">
          {result.dimensions.volumeM3} m³
        </div>
        <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-1 text-[10px] backdrop-blur-sm">
          Précision {Math.round(result.dimensions.confidence * 100)}%
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-eco/15 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Box className="size-4" />
          Visualisation 3D
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg p-1 hover:bg-secondary"
        >
          {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={expanded ? 600 : 400}
        height={expanded ? 400 : 250}
        className="w-full rounded-lg"
      />

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded bg-secondary/50 p-2">
          <div className="text-muted-foreground">Longueur</div>
          <div className="font-bold">{result.dimensions.lengthM} m</div>
        </div>
        <div className="rounded bg-secondary/50 p-2">
          <div className="text-muted-foreground">Largeur</div>
          <div className="font-bold">{result.dimensions.widthM} m</div>
        </div>
        <div className="rounded bg-secondary/50 p-2">
          <div className="text-muted-foreground">Hauteur</div>
          <div className="font-bold">{result.dimensions.heightAvgM} m</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 rounded-lg bg-eco/5 p-2 text-sm font-bold text-eco">
        <Box className="size-4" />
        Volume : {result.dimensions.volumeM3} m³
        <span className="text-[10px] text-muted-foreground">
          · ±{Math.round((1 - result.dimensions.confidence) * 100)}% marge
        </span>
      </div>
    </div>
  );
}
