import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useLiveReports } from "../lib/live-reports";
import { ReportDetailsDialog } from "../components/report-details-dialog";
import { clearFocusedReport, subscribeFocusedReport } from "../lib/realtime-sync";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "index,follow" },
      {
        name: "keywords",
        content:
          "EcoKin Smart, Kinshasa, gestion des déchets, cartographie, signalements, IA, inondations, smart city",
      },
      { title: "EcoKin Smart" },
      {
        name: "description",
        content:
          "Plateforme intelligente de gestion des déchets, de cartographie, de suivi environnemental et de prédiction des inondations à Kinshasa grâce à l'intelligence artificielle.",
      },
      { name: "author", content: "EcoKin Smart" },
      {
        property: "og:title",
        content: "EcoKin Smart",
      },
      {
        property: "og:description",
        content:
          "Plateforme intelligente de gestion des déchets, de cartographie, de suivi environnemental et de prédiction des inondations à Kinshasa grâce à l'intelligence artificielle.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ecokin-smart-76xj.vercel.app/" },
      { property: "og:site_name", content: "EcoKin Smart" },
      {
        property: "og:image",
        content: "https://ecokin-smart-76xj.vercel.app/images/ecokin-preview.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "EcoKin Smart",
      },
      {
        name: "twitter:description",
        content:
          "Plateforme intelligente de gestion des déchets, de cartographie, de suivi environnemental et de prédiction des inondations à Kinshasa grâce à l'intelligence artificielle.",
      },
      {
        name: "twitter:image",
        content: "https://ecokin-smart-76xj.vercel.app/images/ecokin-preview.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://ecokin-smart-76xj.vercel.app/" },
      { rel: "icon", href: "/images/logo-ecokin.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RealtimeFocusDialog() {
  const { items: reports } = useLiveReports();
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeFocusedReport((reportId) => setFocusedReportId(reportId));
    return unsubscribe;
  }, []);

  const report = reports.find((item) => item.id === focusedReportId) ?? null;

  return (
    <ReportDetailsDialog
      report={report as any}
      isOpen={Boolean(focusedReportId && report)}
      onClose={() => clearFocusedReport()}
      canProvideFeedback
    />
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <RealtimeFocusDialog />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
