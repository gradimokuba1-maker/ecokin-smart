import { Link } from "@tanstack/react-router";
import { Leaf, Lock } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-ecokin.png"
              alt="EcoKin Smart"
              className="size-8 rounded-lg object-cover"
            />
            <span className="font-display text-lg font-bold">
              EcoKin <span className="text-eco">Smart</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Plateforme Smart City pour la gestion intelligente des déchets sur l'ensemble des 24
            communes de Kinshasa. Une initiative numérique au service d'une ville plus propre, plus
            saine et résiliente face aux inondations.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            République Démocratique du Congo · Hôtel de Ville de Kinshasa
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Couverture
          </h4>
          <ul className="space-y-2 text-sm">
            <li>24 communes de Kinshasa</li>
            <li>Signalements temps réel</li>
            <li>Suivi GPS de la flotte</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Partenaires
          </h4>
          <ul className="space-y-2 text-sm">
            <li>Régie d'Assainissement de Kinshasa</li>
            <li>Ministère de l'Environnement</li>
            <li>Opérateurs Télécom partenaires</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© 2026 EcoKin Smart · Tous droits réservés</span>
          <span className="inline-flex items-center gap-2">
            <span>Propulsé par l'IA et les SIG</span>
            <Link
              to="/autorite/connexion"
              aria-label="Accès réservé aux autorités"
              className="inline-flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-emerald-400/30 hover:text-eco"
            >
              <Lock className="size-2.5" />
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
