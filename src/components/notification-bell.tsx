import { useEffect, useRef, useState } from "react";
import { Bell, ShieldAlert } from "lucide-react";
import { PRIORITY_ALERTS, WEATHER_FORECAST } from "@/lib/data";

const READ_KEY = "ecokin_alerts_read_v1";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      if (raw) setReadIds(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const weatherAlert = WEATHER_FORECAST.find((d) => d.floodRisk === "critique" || d.floodRisk === "eleve");
  const allAlerts = [
    ...PRIORITY_ALERTS.map((a) => ({ id: a.id, level: a.level, msg: a.msg, kind: "priorité" as const })),
    ...(weatherAlert
      ? [{ id: "weather", level: weatherAlert.floodRisk as any, msg: `Pluies ${weatherAlert.rainMm} mm – ${weatherAlert.day} · risque ${weatherAlert.floodRisk}`, kind: "météo" as const }]
      : []),
  ];
  const unread = allAlerts.filter((a) => !readIds.includes(a.id)).length;

  const markRead = () => {
    const ids = allAlerts.map((a) => a.id);
    setReadIds(ids);
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markRead();
        }}
        className="relative grid size-9 place-items-center rounded-full border border-border hover:bg-muted"
        aria-label="Alertes prioritaires"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10">
          <div className="border-b border-border bg-kin px-4 py-3 text-white">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Alertes prioritaires</div>
            <div className="font-display text-sm font-bold">{allAlerts.length} notifications actives</div>
          </div>
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {allAlerts.map((a) => {
              const color =
                a.level === "critique" ? "text-red-600 bg-red-500/10" :
                a.level === "eleve" ? "text-orange-600 bg-orange-500/10" :
                "text-amber-600 bg-amber-500/10";
              return (
                <li key={a.id} className="flex gap-3 p-3 text-sm">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${color}`}>
                    <ShieldAlert className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">{a.kind}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${a.level === "critique" ? "text-red-600" : a.level === "eleve" ? "text-orange-600" : "text-amber-600"}`}>{a.level}</span>
                    </div>
                    <p className="mt-1 text-xs text-foreground">{a.msg}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
