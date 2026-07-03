import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { ClientOnly } from "@/components/client-only";
import { FleetMap } from "@/components/fleet-map";
import { useFleet, type VehicleStatus } from "@/lib/fleet-gps";
import { Activity, AlertTriangle, Download, Gauge, PauseCircle, PlayCircle, Radio, Signal, Timer, Truck as TruckIcon } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/gps-flotte")({
  head: () => ({
    meta: [
      { title: "Suivi GPS temps réel de la flotte — EcoKin Smart" },
      { name: "description", content: "Position en direct, vitesse, statut, historique des trajets et alertes automatiques (déviation, arrêt prolongé, hors ligne)." },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre", "gouverneur", "admin"]} title="Suivi GPS de la flotte">
      <GpsPage />
    </AccessGate>
  ),
});

const STATUS_LABEL: Record<VehicleStatus, string> = {
  en_circulation: "En circulation",
  arret: "À l'arrêt",
  hors_ligne: "Hors ligne",
};
const STATUS_COLOR: Record<VehicleStatus, string> = {
  en_circulation: "bg-eco/15 text-eco",
  arret: "bg-amber-500/15 text-amber-700",
  hors_ligne: "bg-slate-500/15 text-slate-700",
};

function GpsPage() {
  const { vehicles, alerts, setStatus } = useFleet(3500);
  const [selected, setSelected] = useState<string | undefined>(vehicles[0]?.id);
  const active = vehicles.find((v) => v.id === selected) ?? vehicles[0];

  const stats = useMemo(() => {
    const live = vehicles.filter((v) => v.status === "en_circulation").length;
    const off = vehicles.filter((v) => v.status === "hors_ligne").length;
    const avg = vehicles.reduce((s, v) => s + v.current.speedKmh, 0) / (vehicles.length || 1);
    return { live, off, avg: Math.round(avg) };
  }, [vehicles]);

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFillColor(11, 31, 58);
    doc.rect(0, 0, 210, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("EcoKin Smart — Rapport GPS de la flotte", 14, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString("fr-FR"), 14, 20);
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: 34,
      head: [["Véhicule", "Immat.", "Chauffeur", "Commune", "Statut", "Vitesse", "Charge", "Déviation", "Dernier fix"]],
      body: vehicles.map((v) => [v.id, v.plate, v.driver, v.commune, STATUS_LABEL[v.status], `${Math.round(v.current.speedKmh)} km/h`, `${v.loadPct}%`, `${v.deviationMeters} m`, v.lastFixAt ? new Date(v.lastFixAt).toLocaleTimeString("fr-FR") : "—"]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
    });
    if (alerts.length) {
      autoTable(doc, {
        head: [["Heure", "Véhicule", "Alerte"]],
        body: alerts.map((a) => [new Date(a.at).toLocaleTimeString("fr-FR"), a.vehicleId, a.msg]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] },
      });
    }
    doc.save(`gps-flotte-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Télémétrie · Temps réel</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Suivi GPS de la flotte</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Position live, vitesse, statut, historique des trajets, alertes automatiques (déviation, arrêt prolongé, hors ligne)
            et relecture des tournées passées.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-4">
          <Tile icon={<Radio />} label="Véhicules connectés" value={`${vehicles.length - stats.off}/${vehicles.length}`} tone="eco" />
          <Tile icon={<TruckIcon />} label="En circulation" value={String(stats.live)} tone="kin" />
          <Tile icon={<Gauge />} label="Vitesse moyenne" value={`${stats.avg} km/h`} tone="urban" />
          <Tile icon={<AlertTriangle />} label="Alertes actives" value={String(alerts.length)} tone="flood" />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
            <span className="relative flex size-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-eco/60" /><span className="relative inline-flex size-2 rounded-full bg-eco" /></span>
            Synchronisation live · rafraîchissement 3,5 s
          </div>
          <button onClick={exportPdf} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary">
            <Download className="size-4" /> Rapport PDF
          </button>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Carte temps réel</div>
              <h2 className="font-display text-lg font-bold">Position &amp; trajets en direct</h2>
            </div>
            <ClientOnly fallback={<div className="h-[520px] animate-pulse bg-muted" />}>
              <FleetMap vehicles={vehicles} selectedId={selected} onSelect={setSelected} height={520} />
            </ClientOnly>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-bold">Véhicules</h3>
              <ul className="mt-3 space-y-2">
                {vehicles.map((v) => (
                  <li key={v.id}>
                    <button
                      onClick={() => setSelected(v.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                        selected === v.id ? "border-eco bg-eco/5" : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      <div>
                        <div className="font-bold">{v.id} <span className="text-[10px] text-muted-foreground">· {v.plate}</span></div>
                        <div className="text-[11px] text-muted-foreground">{v.driver} · {v.commune}</div>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLOR[v.status]}`}>{STATUS_LABEL[v.status]}</span>
                        <div className="mt-1 text-[10px] text-muted-foreground">{Math.round(v.current.speedKmh)} km/h</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {active && (
              <div className="rounded-3xl border border-border bg-card p-5">
                <h3 className="font-display text-lg font-bold">{active.id} — télémétrie</h3>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Info label="Vitesse" value={`${Math.round(active.current.speedKmh)} km/h`} />
                  <Info label="Cap" value={`${Math.round(active.current.headingDeg)}°`} />
                  <Info label="Charge" value={`${active.loadPct}%`} />
                  <Info label="Déviation" value={`${active.deviationMeters} m`} />
                  <Info label="Latitude" value={active.current.lat.toFixed(5)} />
                  <Info label="Longitude" value={active.current.lng.toFixed(5)} />
                  <Info label="Départ" value={active.startedAt ? new Date(active.startedAt).toLocaleTimeString("fr-FR") : "—"} />
                  <Info label="Dernier fix" value={active.lastFixAt ? new Date(active.lastFixAt).toLocaleTimeString("fr-FR") : "—"} />
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setStatus(active.id, "en_circulation")} className="inline-flex items-center gap-1 rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white">
                    <PlayCircle className="size-3" /> En circulation
                  </button>
                  <button onClick={() => setStatus(active.id, "arret")} className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white">
                    <PauseCircle className="size-3" /> Arrêt
                  </button>
                  <button onClick={() => setStatus(active.id, "hors_ligne")} className="inline-flex items-center gap-1 rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white">
                    <Signal className="size-3" /> Hors ligne
                  </button>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-eco">Relecture — {active.track.length} points</summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-[11px]">
                    {active.track.slice(0, 40).map((f, i) => (
                      <li key={i} className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1">
                        <span><Timer className="mr-1 inline size-3" />{new Date(f.at).toLocaleTimeString("fr-FR")}</span>
                        <span>{Math.round(f.speedKmh)} km/h · {f.lat.toFixed(4)}, {f.lng.toFixed(4)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold inline-flex items-center gap-2"><Activity className="size-4 text-flood" /> Alertes automatiques</h3>
          {alerts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucune anomalie détectée. La flotte est nominale.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
                  <span><AlertTriangle className="mr-2 inline size-3 text-red-500" />{a.msg}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(a.at).toLocaleTimeString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Tile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "eco" | "kin" | "urban" | "flood" }) {
  const bg = { eco: "bg-eco/10 text-eco", kin: "bg-kin/10 text-kin", urban: "bg-urban/10 text-urban", flood: "bg-flood/10 text-flood" }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className={`grid size-8 place-items-center rounded-lg ${bg}`}>{icon}</span>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
