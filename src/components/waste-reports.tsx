import { STATUS_META, URGENCY_META, type LiveReport } from "@/lib/eco-store";

export function WasteReports({ reports, limit = 10 }: { reports: LiveReport[]; limit?: number }) {
  const visible = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <tr className="border-b">
            <th className="py-2">ID</th>
            <th>Commune</th>
            <th>Volume</th>
            <th>Priorité</th>
            <th>Risque</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((report) => (
            <tr key={report.id} className="border-b border-border/60">
              <td className="py-2 font-mono text-xs">{report.id}</td>
              <td className="capitalize">{report.commune}</td>
              <td>{report.volumeM3 ? `${report.volumeM3} m³` : "-"}</td>
              <td className="capitalize">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    report.priorityLevel === "critique"
                      ? "bg-red-500 text-white"
                      : report.priorityLevel === "eleve"
                        ? "bg-orange-500 text-white"
                        : ""
                  }`}
                >
                  {report.priorityLevel ?? "N/A"}
                </span>
              </td>
              <td className="capitalize">{report.healthRisk ?? "N/A"}</td>
              <td>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    STATUS_META[report.status]?.color
                  }`}
                >
                  {STATUS_META[report.status]?.label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
