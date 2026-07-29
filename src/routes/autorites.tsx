import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/autorites")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/autorites"!</div>;
}
