import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/menagers")({
  beforeLoad: () => {
    throw redirect({
      to: "/menage",
    });
  },
});
