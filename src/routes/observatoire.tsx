import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { COMMUNE_PERFORMANCE, COMMUNES, IPK, IPK_KINSHASA, IPK_TREND } from "@/lib/data";
import { Gauge } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/observatoire")({
  head: () => ({
    meta: [
      { title: "Observatoire de la propreté — EcoKin Smart" },
      {
        name: "description",
        content: "Indice de Propreté de Kinshasa (IPK), performance des communes, valorisation.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const perfData = COMMUNES.map((c) => ({
    commune: c.name,
    IPK: COMMUNE_PERFORMANCE[c.id].ipk,
    Collecte: COMMUNE_PERFORMANCE[c.id].tauxCollecte,
    Résolution: COMMUNE_PERFORMANCE[c.id].tauxResolution,
    Valorisation: COMMUNE_PERFORMANCE[c.id].tauxValorisation,
  }));
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <Gauge className="size-4" /> Module 6 · Observatoire urbain
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Observatoire de la propreté</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Indice de Propreté de Kinshasa (IPK), performance des communes et taux de valorisation.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-eco/30 bg-eco/5 p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-eco">IPK Kinshasa</div>
            <div className="mt-1 font-display text-4xl font-bold">
              {IPK_KINSHASA}
              <span className="text-base text-muted-foreground">/100</span>
            </div>
          </div>
          {COMMUNES.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                IPK {c.name}
              </div>
              <div className="mt-1 font-display text-3xl font-bold">
                {IPK[c.id].score}
                <span
                  className={`ml-2 text-sm font-semibold ${IPK[c.id].trend >= 0 ? "text-eco" : "text-red-500"}`}
                >
                  {IPK[c.id].trend >= 0 ? "+" : ""}
                  {IPK[c.id].trend}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Rang #{IPK[c.id].rang}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-5">
            <h3 className="mb-3 font-display text-lg font-bold">Évolution mensuelle de l'IPK</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={IPK_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[30, 100]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="kinshasa" stroke="#0f172a" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="matete" stroke="#10b981" />
                  <Line type="monotone" dataKey="lemba" stroke="#0ea5e9" />
                  <Line type="monotone" dataKey="kisenso" stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <h3 className="mb-3 font-display text-lg font-bold">Performance des communes</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={perfData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="commune" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="IPK" fill="#10b981" />
                  <Bar dataKey="Collecte" fill="#0ea5e9" />
                  <Bar dataKey="Résolution" fill="#6366f1" />
                  <Bar dataKey="Valorisation" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Indice de performance détaillé</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2">Commune</th>
                <th>IPK</th>
                <th>Taux collecte</th>
                <th>Taux résolution</th>
                <th>Taux valorisation</th>
                <th>Temps réponse moyen</th>
              </tr>
            </thead>
            <tbody>
              {COMMUNES.map((c) => {
                const p = COMMUNE_PERFORMANCE[c.id];
                return (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="py-2 font-semibold">{c.name}</td>
                    <td className="font-bold text-eco">{p.ipk}/100</td>
                    <td>{p.tauxCollecte}%</td>
                    <td>{p.tauxResolution}%</td>
                    <td>{p.tauxValorisation}%</td>
                    <td>{p.tempsReponseH} h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
