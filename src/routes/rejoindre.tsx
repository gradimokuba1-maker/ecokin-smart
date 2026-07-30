import { createFileRoute } from "@tanstack/react-router";
import { CitizenGate } from "@/components/citizen-gate";

export const Route = createFileRoute("/rejoindre")({
  component: RejoindrePage,
});

function RejoindrePage() {
  return (
    <CitizenGate
      title="Rejoignez EcoKin"
      description="Créez votre compte citoyen pour cumuler vos Green Points et suivre l'impact de vos actions."
      forceForm
    />
  );
}
