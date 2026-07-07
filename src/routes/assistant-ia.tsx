import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { useServerFn } from "@tanstack/react-start";
import { askDecisionAssistant } from "@/lib/waste-ai.functions";
import {
  COMMUNE_PERFORMANCE,
  IPK,
  IPK_KINSHASA,
  PRIORITY_ALERTS,
  HOTSPOTS,
  WEATHER_FORECAST,
  REPORTS,
} from "@/lib/data";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/assistant-ia")({
  head: () => ({
    meta: [
      { title: "Assistant IA des décideurs — EcoKin Smart" },
      { name: "description", content: "Posez vos questions en langage naturel à l'IA EcoKin." },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre", "gouverneur"]} title="Assistant IA des décideurs">
      <Page />
    </AccessGate>
  ),
});

const SUGGESTIONS = [
  "Quelles communes sont les plus touchées aujourd'hui ?",
  "Où faut-il intervenir en priorité ?",
  "Quels quartiers présentent un risque élevé d'inondation ?",
  "Quel est le taux de résolution ce mois-ci ?",
  "Quelle commune affiche les meilleures performances ?",
  "Rédige une note de synthèse pour le conseil de demain.",
];

type Msg = { role: "user" | "assistant"; content: string };

function buildContext() {
  return JSON.stringify({
    ipk: { ...IPK, kinshasa: IPK_KINSHASA },
    performance: COMMUNE_PERFORMANCE,
    alertesPrioritaires: PRIORITY_ALERTS,
    hotspots: HOTSPOTS,
    meteo7j: WEATHER_FORECAST,
    signalements: {
      total: REPORTS.length,
      critiques: REPORTS.filter((r) => r.severity === "critique").length,
      parCommune: {
        matete: REPORTS.filter((r) => r.commune === "matete").length,
        lemba: REPORTS.filter((r) => r.commune === "lemba").length,
        kisenso: REPORTS.filter((r) => r.commune === "kisenso").length,
      },
    },
  });
}

function Page() {
  const ask = useServerFn(askDecisionAssistant);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Bonjour. Je suis l'Assistant IA EcoKin Smart. Posez-moi vos questions sur l'état de la propreté, les risques et les priorités d'intervention." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const r = await ask({ data: { question: q, context: buildContext() } });
      setMessages((m) => [...m, { role: "assistant", content: r.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Erreur de connexion à l'IA." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <Bot className="size-4" /> Module 8 · Assistant IA
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Posez vos questions en langage naturel</h1>
          <p className="mt-1 text-white/70">
            L'IA croise les données EcoKin en temps réel : IPK, alertes, hotspots, météo, signalements.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
        <div className="flex h-[640px] flex-col rounded-3xl border border-border bg-card">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user" ? "bg-eco text-white" : "bg-secondary text-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="inline size-4 animate-spin" /> IA en train de répondre…
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Votre question…"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-eco px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <Send className="size-4" /> Envoyer
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="size-4 text-eco" /> Questions suggérées
            </div>
            <ul className="mt-3 space-y-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => send(s)}
                    className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2 text-left text-xs hover:bg-secondary"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      <SiteFooter />
    </div>
  );
}
