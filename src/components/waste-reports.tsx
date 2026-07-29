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
            <th>Catégorie</th>
            <th>Urgence</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((report) => (
            <tr key={report.id} className="border-b border-border/60">
              <td className="py-2 font-mono text-xs">{report.id}</td>
              <td className="capitalize">{report.commune}</td>
              <td className="capitalize">{report.category}</td>
              <td>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[report.urgency]?.bg} ${URGENCY_META[report.urgency]?.color}`}
                >
                  {URGENCY_META[report.urgency]?.label}
                </span>
              </td>
              <td>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_META[report.status]?.color}`}
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
