import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LEADERBOARD, REWARDS } from "@/lib/data";
import { useEcoUser } from "@/lib/user-store";
import { Award, Gift, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/recompenses")({
  head: () => ({
    meta: [
      { title: "Récompenses Green Points — EcoKin Smart" },
      {
        name: "description",
        content:
          "Échangez vos Green Points contre du crédit téléphonique, des bons d'achat ou des avantages communaux. Consultez le classement citoyen.",
      },
    ],
  }),
  component: RecompensesPage,
});

const BADGES = [
  { id: "eco", name: "Éco-Citoyen", desc: "10 signalements validés", color: "bg-eco" },
  { id: "sentinelle", name: "Sentinelle", desc: "Premier sur sa zone", color: "bg-urban" },
  { id: "champion", name: "Champion Smart City", desc: "Top 10 national", color: "bg-amber-500" },
];

function RecompensesPage() {
  const { user, spend } = useEcoUser();

  function claim(cost: number, name: string) {
    if (spend(cost)) toast.success(`Récompense « ${name} » débloquée !`);
    else toast.error("Solde insuffisant");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Programme citoyen</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Green Points & Récompenses</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Chaque signalement validé rapporte des points. Échangez-les contre des avantages
            concrets auprès de nos partenaires.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
        {/* Wallet + badges */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-eco via-eco to-urban p-7 text-white shadow-xl shadow-eco/20">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80">
              <Sparkles className="size-4" /> Votre solde
            </div>
            <div className="mt-4 font-display text-6xl font-extrabold tracking-tight">
              {user.points.toLocaleString()}
            </div>
            <div className="mt-1 text-sm opacity-90">Green Points · ≈ {(user.points * 4).toLocaleString()} CDF</div>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-center">
              <div>
                <div className="font-display text-2xl font-bold">{user.reports}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">Signalements</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold">#248</div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">Rang national</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold">{user.badges.length}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">Badges</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Award className="size-5 text-eco" />
              <h3 className="font-display text-lg font-bold">Vos badges</h3>
            </div>
            <ul className="space-y-3">
              {BADGES.map((b) => {
                const owned = user.badges.includes(b.id);
                return (
                  <li
                    key={b.id}
                    className={`flex items-center gap-4 rounded-xl border p-3 ${
                      owned ? "border-eco/30 bg-eco/5" : "border-border bg-secondary opacity-60"
                    }`}
                  >
                    <span className={`grid size-10 place-items-center rounded-full text-white ${b.color}`}>
                      <Award className="size-4" />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.desc}</div>
                    </div>
                    {owned && <span className="text-xs font-bold text-eco">✓ Obtenu</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Rewards + Leaderboard */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Gift className="size-5 text-eco" />
              <h3 className="font-display text-lg font-bold">Catalogue de récompenses</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {REWARDS.map((r) => {
                const enough = user.points >= r.cost;
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {r.kind}
                      </div>
                    </div>
                    <button
                      onClick={() => claim(r.cost, r.name)}
                      disabled={!enough}
                      className={`rounded-lg px-3 py-2 text-xs font-bold ${
                        enough ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {r.cost.toLocaleString()} GP
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              <h3 className="font-display text-lg font-bold">Classement des citoyens</h3>
            </div>
            <ul className="divide-y divide-border">
              {LEADERBOARD.map((l) => (
                <li key={l.rank} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                        l.rank === 1
                          ? "bg-amber-500 text-white"
                          : l.rank === 2
                            ? "bg-slate-300 text-foreground"
                            : l.rank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-secondary text-foreground"
                      }`}
                    >
                      {l.rank}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{l.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.commune} · {l.reports} signalements
                      </div>
                    </div>
                  </div>
                  <span className="font-display text-base font-bold text-eco">
                    {l.points.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
