import { createFileRoute } from "@tanstack/react-router";
import { CitizenGate } from "@/components/citizen-gate";

export const Route = createFileRoute("/rejoindre")({
  validateSearch: (search: Record<string, unknown>) => ({
    reportId: typeof search.reportId === "string" ? search.reportId : undefined,
  }),
  component: RejoindrePage,
});

function RejoindrePage() {
  const { reportId } = Route.useSearch();

  return (
    <CitizenGate
      title="Rejoignez EcoKin"
      description="Créez votre compte citoyen pour cumuler vos Green Points et suivre l'impact de vos actions."
      forceForm
      postAuthRedirect={
        reportId ? `/signaler?confirmedReportId=${encodeURIComponent(reportId)}` : undefined
      }
    />
  );
}
