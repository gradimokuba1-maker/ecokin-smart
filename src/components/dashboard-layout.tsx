import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

type Props = {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardLayout({ eyebrow, title, description, actions, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1">
        <div className="border-b bg-card">
          <div className="container py-8">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco">{eyebrow}</div>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-bold">{title}</h1>
                {description && <p className="mt-1 text-muted-foreground">{description}</p>}
              </div>
              {actions}
            </div>
          </div>
        </div>
        <div className="container py-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
