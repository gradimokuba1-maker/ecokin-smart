import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useServerFn } from "@tanstack/react-start";
import { analyzeWastePhoto, type WasteAnalysis } from "@/lib/waste-ai.functions";
import { useEcoUser } from "@/lib/user-store";
import { COMMUNES } from "@/lib/data";
import { Camera, Crosshair, Loader2, Sparkles, Trophy, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signaler")({
  head: () => ({
    meta: [
      { title: "Signaler un dépôt — EcoKin Smart" },
      {
        name: "description",
        content:
          "Signalez un dépôt sauvage ou un caniveau obstrué. L'IA classifie automatiquement le déchet et vous gagnez des Green Points.",
      },
    ],
  }),
  component: SignalerPage,
});

function SignalerPage() {
  const { user, addPoints } = useEcoUser();
  const analyze = useServerFn(analyzeWastePhoto);
  const [imgData, setImgData] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [commune, setCommune] = useState<string>("matete");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WasteAnalysis | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 4 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImgPreview(url);
      setImgData(url);
      setResult(null);
      setSubmitted(false);
    };
    reader.readAsDataURL(f);
  }

  function geolocate() {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non disponible");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
        toast.success("Position détectée");
      },
      () => toast.error("Impossible de récupérer la position"),
      { enableHighAccuracy: true },
    );
  }

  async function runAnalysis() {
    if (!imgData) {
      toast.error("Veuillez d'abord ajouter une photo");
      return;
    }
    setLoading(true);
    try {
      const r = await analyze({ data: { imageDataUrl: imgData } });
      setResult(r);
      toast.success("Analyse IA terminée");
    } catch (e) {
      console.error(e);
      toast.error("Erreur d'analyse IA");
    } finally {
      setLoading(false);
    }
  }

  function submitReport() {
    if (!result) {
      toast.error("Lancez d'abord l'analyse IA");
      return;
    }
    const earned = result.severity === "critique" ? 80 : result.severity === "modere" ? 50 : 25;
    addPoints(earned);
    setSubmitted(true);
    toast.success(`Signalement enregistré · +${earned} Green Points`);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Signalement citoyen</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Signaler un dépôt sauvage
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Prenez une photo, géolocalisez et laissez notre IA classifier le déchet. Gagnez des
            Green Points dès la validation.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        {/* Form */}
        <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div>
            <label className="text-sm font-bold">1 · Photo du dépôt</label>
            <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 text-sm text-muted-foreground transition-colors hover:border-eco hover:bg-eco/5">
                {imgPreview ? (
                  <img src={imgPreview} alt="Aperçu" className="size-full rounded-2xl object-cover" />
                ) : (
                  <>
                    <Upload className="size-6 text-eco" />
                    <span className="font-semibold">Cliquez pour ajouter une photo</span>
                    <span className="text-xs">JPG / PNG · max 4 Mo</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
              </label>
              <div className="flex flex-col gap-2 sm:w-44">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-eco px-4 py-3 text-sm font-bold text-white hover:bg-eco/90">
                  <Camera className="size-4" /> Prendre photo
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
                </label>
                <button
                  onClick={runAnalysis}
                  disabled={!imgData || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-eco/40 bg-eco/5 px-4 py-3 text-sm font-bold text-eco transition-colors hover:bg-eco/10 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  Analyser IA
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold">2 · Localisation</label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={geolocate}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                <Crosshair className="size-4 text-urban" /> Détecter ma position
              </button>
              {position && (
                <span className="font-mono text-xs text-muted-foreground">
                  {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </span>
              )}
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold"
              >
                {COMMUNES.map((c) => (
                  <option key={c.id} value={c.id}>
                    Commune de {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold">3 · Description (optionnelle)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Ex. caniveau bloqué près du marché Matete, accumulation depuis 3 jours…"
              className="mt-3 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
            />
          </div>

          <button
            onClick={submitReport}
            disabled={!result || submitted}
            className="w-full rounded-xl bg-foreground py-4 text-sm font-bold text-background transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitted ? "✓ Signalement envoyé" : "Envoyer le signalement"}
          </button>
        </div>

        {/* Results / sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-eco/30 bg-eco/5 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-eco" />
              <h3 className="font-display text-lg font-bold">Analyse IA en direct</h3>
            </div>
            {!result ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Importez une photo puis cliquez sur « Analyser IA » pour obtenir la classification
                automatique du déchet, le volume estimé et le risque d'inondation.
              </p>
            ) : (
              <div className="mt-4 space-y-4 font-mono text-xs">
                <Row label="Type" value={result.type.toUpperCase()} />
                <Row label="Confiance" value={`${Math.round(result.confidence * 100)}%`} />
                <Row label="Sévérité" value={result.severity} color={sevColor(result.severity)} />
                <Row label="Volume estimé" value={`${result.volumeEstimateM3.toFixed(1)} m³`} />
                <Row label="Risque inondation" value={result.floodRisk ? "OUI" : "non"} color={result.floodRisk ? "text-flood" : ""} />
                <div className="mt-2 rounded-lg bg-background p-3 font-sans text-xs text-foreground">
                  {result.description}
                </div>
                <ul className="ml-4 list-disc space-y-1 font-sans text-xs text-muted-foreground">
                  {result.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-kin p-6 text-white">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-eco" />
              <h3 className="font-display text-lg font-bold">Votre profil</h3>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat l="Green Points" v={user.points.toLocaleString()} />
              <Stat l="Signalements" v={user.reports.toString()} />
              <Stat l="Badges" v={user.badges.length.toString()} />
            </div>
            <p className="mt-4 text-xs text-white/60">
              Vous êtes connecté en tant que <b>{user.name}</b> · {user.commune}
            </p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-eco/15 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${color ?? ""}`}>{value}</span>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">{l}</div>
      <div className="mt-1 font-display text-xl font-bold">{v}</div>
    </div>
  );
}

function sevColor(s: string) {
  return s === "critique" ? "text-flood" : s === "modere" ? "text-amber-500" : "text-eco";
}
