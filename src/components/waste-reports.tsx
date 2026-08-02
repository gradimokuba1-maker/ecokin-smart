import { Button } from "./ui/button";
import { STATUS_META, URGENCY_META, type LiveReport } from "@/lib/eco-store";

export function WasteReports({
  reports,
  limit = 10,
  onSelectReport,
}: {
  reports: LiveReport[];
  limit?: number;
  onSelectReport?: (report: LiveReport) => void;
}) {
  const visible = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <tr className="border-b">
            <th>Photo</th>
            <th className="py-2">ID</th>
            <th>Commune</th>
            <th>Volume</th>
            <th>Priorité</th>
            <th>IA</th>
            <th>Catégories</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((report) => (
            <tr key={report.id} className="border-b border-border/60">
              <td className="py-2">
                {report.photoBefore || report.photoUrl ? (
                  <img
                    src={report.photoBefore || report.photoUrl}
                    alt={`Photo ${report.id}`}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
                    N/A
                  </span>
                )}
              </td>
              <td className="py-2 font-mono text-xs">{report.id}</td>
              <td className="capitalize">{report.commune}</td>
              <td>{report.volumeM3 ? `${report.volumeM3} m³` : "-"}</td>
              <td className="capitalize">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${report.priorityLevel === "critique"
                      ? "bg-red-500 text-white"
                      : report.priorityLevel === "eleve"
                        ? "bg-orange-500 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                >
                  {report.priorityLevel ?? "N/A"}
                </span>
              </td>
              <td className="text-xs font-semibold uppercase tracking-wide">
                {report.analysisConfidence != null ? `${Math.round(report.analysisConfidence * 100)}%` : "N/A"}
              </td>
              <td>{report.detectedObjects?.map((object) => object.label).join(", ") || report.category || "-"}</td>
              <td>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_META[report.status]?.color
                    }`}
                >
                  {STATUS_META[report.status]?.label}
                </span>
              </td>
              <td>
                {onSelectReport && (
                  <Button variant="outline" size="sm" onClick={() => onSelectReport(report)}>
                    Détails
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
