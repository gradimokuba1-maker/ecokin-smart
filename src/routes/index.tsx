import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClientOnly } from "@/components/client-only";
import { EcoMap } from "@/components/eco-map";
import {
  COMMUNES,
  REPORTS,
  LEADERBOARD,
  ALERTS,
  TIPS,
  COMMUNE_KPIS,
} from "@/lib/data";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Cpu,
  Droplets,
  Gift,
  Home as HomeIcon,
  LineChart,
  MapPin,
  Recycle,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoKin Smart — Smart City Kinshasa" },
      {
        name: "description",
        content:
          "Plateforme Smart City pour la gestion intelligente des déchets sur les 24 communes de Kinshasa.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const total = REPORTS.length;
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.eco/15),transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-eco/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-eco">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-eco/70" />
                <span className="relative inline-flex size-2 rounded-full bg-eco" />
              </span>
              Couverture · 24 communes de Kinshasa
            </div>
            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Pour une Kinshasa <span className="text-eco">qui respire</span>.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
              Gestion intelligente des déchets par la participation citoyenne, l'IA et
              les SIG. Réduire la pollution, prévenir les inondations, valoriser nos quartiers.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signaler"
                className="inline-flex items-center gap-2 rounded-full bg-eco px-6 py-3 text-sm font-bold text-white shadow-lg shadow-eco/30 transition-transform hover:-translate-y-0.5"
              >
                <Camera className="size-4" /> Signaler un dépôt
              </Link>
              <Link
                to="/autorites"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-bold text-foreground hover:bg-muted"
              >
                <LineChart className="size-4" /> Portail Autorités
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { v: "12.4 t", l: "Plastique collecté" },
                { v: "+2 842", l: "Signalements" },
                { v: "-24%", l: "Risque d'inondation" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {s.l}
                  </dt>
                  <dd className="font-display text-2xl font-bold text-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <ClientOnly
              fallback={
                <div className="grid h-[480px] place-items-center rounded-3xl border border-border bg-secondary text-sm text-muted-foreground">
                  Chargement de la carte SIG…
                </div>
              }
            >
              <EcoMap reports={REPORTS} height={480} />
            </ClientOnly>
            <div className="absolute -bottom-5 left-5 hidden rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Carte SIG en direct
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="size-2 animate-pulse rounded-full bg-eco" />
                <span className="text-sm font-semibold">{total} signalements actifs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats banner */}
      <section className="border-y border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
          {[
            { i: "01", label: "Signalements 24h", v: "+1 284", c: "text-eco" },
            { i: "02", label: "Plastique collecté", v: "12.4 t", c: "text-urban" },
            { i: "03", label: "Caniveaux dégagés", v: "47", c: "text-eco" },
            { i: "04", label: "Risque inondation", v: "Modéré", c: "text-amber-400" },
          ].map((s) => (
            <div key={s.i} className="flex items-center gap-3">
              <span className="font-mono text-xs text-eco">[{s.i}]</span>
              <span className="text-xs font-bold uppercase tracking-widest">
                {s.label}: <span className={s.c}>{s.v}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-tight">Agir en 30 secondes.</h2>
            <p className="mt-2 text-muted-foreground">
              Notre IA identifie le déchet et valide votre impact instantanément.
            </p>
          </div>
          <span className="hidden font-mono text-xs text-muted-foreground md:block">
            EcoKin_PROCESS_V2.4
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              icon: Camera,
              t: "Photographiez",
              d: "Prenez une photo du dépôt sauvage ou du caniveau obstrué. Activez la géolocalisation.",
            },
            {
              n: "2",
              icon: Cpu,
              t: "IA classifie",
              d: "L'IA détecte le type de déchet, estime le volume et évalue le risque d'inondation.",
            },
            {
              n: "3",
              icon: Gift,
              t: "Gagnez des points",
              d: "Recevez vos Green Points et échangez-les contre crédits, bons d'achat ou avantages.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="group rounded-3xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-secondary font-display text-lg font-bold text-foreground transition-colors group-hover:bg-eco group-hover:text-white">
                  {s.n}
                </span>
                <s.icon className="size-5 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Communes KPIs */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold">Communes de Kinshasa en chiffres</h2>
          <p className="mt-2 text-muted-foreground">
            Données consolidées des opérations de signalement et de collecte.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {COMMUNES.map((c) => {
              const k = COMMUNE_KPIS[c.id];
              return (
                <div key={c.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                      <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">{c.population}</span>
                  </div>
                  <dl className="mt-6 grid grid-cols-2 gap-4">
                    {[
                      { l: "Signalements", v: k.signalements, i: MapPin },
                      { l: "Tonnes collectées", v: `${k.collecte_t} t`, i: Recycle },
                      { l: "Taux recyclage", v: `${k.recyclage}%`, i: TrendingUp },
                      { l: "Risque inondation", v: `${k.risque}%`, i: Droplets },
                    ].map((x) => (
                      <div key={x.l} className="rounded-xl bg-secondary p-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <x.i className="size-3" /> {x.l}
                        </div>
                        <div className="mt-1 font-display text-xl font-bold text-foreground">{x.v}</div>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rewards + Authorities split */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-3xl bg-card p-8 ring-1 ring-border">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="size-5 text-eco" />
            <h3 className="font-display text-2xl font-bold">Espace citoyen — Green Points</h3>
          </div>
          {LEADERBOARD.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
              <div className="text-sm font-semibold">Classement à venir</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Le tableau s'alimentera automatiquement à partir des signalements réels des citoyens.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-eco/10 via-card to-urban/10 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">Top citoyen</div>
                    <div className="mt-1 font-display text-3xl font-bold">{LEADERBOARD[0].name}</div>
                    <div className="text-sm text-muted-foreground">
                      Commune de {LEADERBOARD[0].commune} · {LEADERBOARD[0].reports} signalements
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-eco">
                      Green Points
                    </div>
                    <div className="font-display text-4xl font-extrabold text-eco">
                      {LEADERBOARD[0].points.toLocaleString("fr-FR")}
                    </div>
                  </div>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-border">
                {LEADERBOARD.slice(1, 5).map((l) => (
                  <li key={l.rank} className="flex items-center justify-between py-3 text-sm">
                    <span className="flex items-center gap-3">
                      <span className="grid size-7 place-items-center rounded-full bg-secondary text-xs font-bold">
                        {l.rank}
                      </span>
                      <span>
                        <span className="font-medium">{l.name}</span>{" "}
                        <span className="text-muted-foreground">· {l.commune}</span>
                      </span>
                    </span>
                    <span className="font-semibold text-eco">{l.points.toLocaleString("fr-FR")} pts</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Link
            to="/recompenses"
            className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-eco hover:underline"
          >
            Découvrir les récompenses →
          </Link>
        </div>

        <div className="rounded-3xl bg-kin p-8 text-white">
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck className="size-5 text-urban" />
            <h3 className="font-display text-2xl font-bold">Tableau de bord Autorités</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Signalements actifs", v: "482", d: "+12% vs hier", c: "text-flood" },
              { l: "Efficacité collecte", v: "78.4%", d: "+5% ce mois", c: "text-eco" },
              { l: "Caniveaux dégagés", v: "47", d: "Cette semaine", c: "text-urban" },
              { l: "Risque global", v: "Modéré", d: "Zones basses élevé", c: "text-amber-400" },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {k.l}
                </div>
                <div className="mt-1 font-display text-2xl font-bold">{k.v}</div>
                <div className={`mt-1 text-[10px] ${k.c}`}>{k.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Carte thermique (Kinshasa)
            </div>
            <div className="mt-3 flex h-24 items-end gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const h = 20 + Math.sin(i / 1.5) * 25 + Math.random() * 50;
                const c = h > 60 ? "#ef4444" : h > 40 ? "#f59e0b" : "#10b981";
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ height: `${h}%`, background: c, opacity: 0.85 }}
                  />
                );
              })}
            </div>
          </div>
          <Link
            to="/autorites"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Accéder à la console complète
          </Link>
        </div>
      </section>

      {/* Alerts strip */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold">Alertes & sensibilisation</h2>
          <Link to="/sensibilisation" className="text-sm font-bold text-eco hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ALERTS.map((a) => (
            <article
              key={a.id}
              className={`rounded-2xl border p-5 ${
                a.level === "critique"
                  ? "border-flood/30 bg-flood/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span
                  className={
                    a.level === "critique" ? "text-flood" : "text-urban"
                  }
                >
                  {a.level === "critique" ? (
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="size-3" /> Alerte critique
                    </span>
                  ) : (
                    "Information"
                  )}
                </span>
                <span className="text-muted-foreground">{a.date}</span>
              </div>
              <h3 className="font-display text-lg font-bold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 grid gap-4 rounded-3xl border border-border bg-urban/5 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-urban/15 text-urban">
            <Users className="size-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold">Le saviez-vous ?</h3>
            <p className="text-sm text-muted-foreground">{TIPS[Math.floor(Math.random() * TIPS.length)]}</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
