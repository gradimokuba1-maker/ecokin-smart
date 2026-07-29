import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, j as redirect, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$27 } from "./connexion-C2pX7Nfq.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DifojYpx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-jzDGPz4t.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$26 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "EcoKin Smart — Gestion intelligente des déchets à Kinshasa" },
			{
				name: "description",
				content: "Plateforme Smart City pour la gestion intelligente des déchets sur les 24 communes de Kinshasa. Signalement citoyen, IA, SIG, suivi GPS et récompenses Green Points."
			},
			{
				name: "author",
				content: "EcoKin Smart"
			},
			{
				property: "og:title",
				content: "EcoKin Smart — Gestion intelligente des déchets à Kinshasa"
			},
			{
				property: "og:description",
				content: "Réduire les déchets et prévenir les inondations grâce à la participation citoyenne, l'IA et les SIG — sur toute la ville de Kinshasa."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "EcoKin Smart — Gestion intelligente des déchets à Kinshasa"
			},
			{
				name: "twitter:description",
				content: "Signalement citoyen, IA, SIG et suivi GPS sur les 24 communes de Kinshasa."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5baab05b-0e6f-4063-928d-dcfc32806996/id-preview-b4a4b4b4--e3bb42f9-7a4c-42fc-be4b-b5b7dd8374cc.lovable.app-1781852479674.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5baab05b-0e6f-4063-928d-dcfc32806996/id-preview-b4a4b4b4--e3bb42f9-7a4c-42fc-be4b-b5b7dd8374cc.lovable.app-1781852479674.png"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: ""
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$26.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			richColors: true,
			position: "top-right"
		})]
	});
}
var $$splitComponentImporter$23 = () => import("./situation-CIEo3cpy.mjs");
var Route$25 = createFileRoute("/situation")({
	head: () => ({ meta: [{ title: "Centre de Situation Urbaine — EcoKin Smart" }, {
		name: "description",
		content: "Centre de situation urbaine en temps réel : incidents, hotspots, urgences."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var BASE_URL = "";
var paths = [
	"/",
	"/carte",
	"/signaler",
	"/recompenses",
	"/sensibilisation",
	"/autorites"
];
var Route$24 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq><priority>${p === "/" ? "1.0" : "0.7"}</priority></url>`).join("\n")}\n</urlset>`;
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$22 = () => import("./signaler-VXLMYqJ0.mjs");
var Route$23 = createFileRoute("/signaler")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./sensibilisation-D0NgIz9L.mjs");
var Route$22 = createFileRoute("/sensibilisation")({
	head: () => ({ meta: [{ title: "Sensibilisation environnementale — EcoKin Smart" }, {
		name: "description",
		content: "Conseils, alertes et campagnes pour réduire les déchets et prévenir les inondations à Kinshasa."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./recompenses-QZ9ZVvc4.mjs");
var Route$21 = createFileRoute("/recompenses")({
	head: () => ({ meta: [{ title: "Récompenses Green Points — EcoKin Smart" }, {
		name: "description",
		content: "Échangez vos Green Points contre du crédit téléphonique, des bons d'achat ou des avantages communaux. Consultez le classement citoyen."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./rapports-BrEUkZ2i.mjs");
var Route$20 = createFileRoute("/rapports")({
	head: () => ({ meta: [{ title: "Rapports automatiques — EcoKin Smart" }, {
		name: "description",
		content: "Rapports PDF quotidiens, hebdomadaires et mensuels générés automatiquement pour le Gouverneur et les Bourgmestres."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./predictif-DOQNgzXg.mjs");
var Route$19 = createFileRoute("/predictif")({
	head: () => ({ meta: [{ title: "Analyse Prédictive — EcoKin Smart" }, {
		name: "description",
		content: "Prévision des points critiques, déchets et inondations."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./observatoire-A1iyFCWw.mjs");
var Route$18 = createFileRoute("/observatoire")({
	head: () => ({ meta: [{ title: "Observatoire de la propreté — EcoKin Smart" }, {
		name: "description",
		content: "Indice de Propreté de Kinshasa (IPK), performance des communes, valorisation."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var Route$17 = createFileRoute("/menagers")({ beforeLoad: () => {
	throw redirect({ to: "/menage" });
} });
var $$splitComponentImporter$16 = () => import("./menage-DVUC7JWk.mjs");
var Route$16 = createFileRoute("/menage")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./itineraires-DnqNT3RB.mjs");
var Route$15 = createFileRoute("/itineraires")({
	head: () => ({ meta: [{ title: "Cartographie intelligente des itinéraires — EcoKin Smart" }, {
		name: "description",
		content: "Planification et optimisation IA des tournées de collecte : itinéraires, points de collecte, distances et coûts de carburant."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./interventions-DSOMQGM2.mjs");
var Route$14 = createFileRoute("/interventions")({
	head: () => ({ meta: [{ title: "Gestion des interventions — EcoKin Smart" }, {
		name: "description",
		content: "Affectation des équipes, suivi GPS des camions et validation par photo avant/après."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./gps-flotte-CMIn6lcW.mjs");
var Route$13 = createFileRoute("/gps-flotte")({
	head: () => ({ meta: [{ title: "Suivi GPS temps réel de la flotte — EcoKin Smart" }, {
		name: "description",
		content: "Position en direct, vitesse, statut, historique des trajets et alertes automatiques (déviation, arrêt prolongé, hors ligne)."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./gouverneur-BaHNOqIW.mjs");
var Route$12 = createFileRoute("/gouverneur")({
	head: () => ({ meta: [{ title: "Centre de Commandement du Gouverneur — EcoKin Smart" }, {
		name: "description",
		content: "Tableau de bord stratégique de la Ville de Kinshasa : propreté, risque d'inondation, IPK, flotte GPS, alertes et budget des opérations."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
/**
* Renders children only on the client-side.
* @param {object} props
* @param {React.ReactNode} props.children The children to render on the client.
* @param {React.ReactNode} [props.fallback=null] The fallback to render on the server.
*/
var $$splitComponentImporter$11 = () => import("./decisions-25BfXbMi.mjs");
var Route$11 = createFileRoute("/decisions")({
	head: () => ({ meta: [{ title: "Mur des Décisions — EcoKin Smart" }, {
		name: "description",
		content: "Suivi public et transparent des décisions de gouvernance environnementale."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./crise-BUPjXLuG.mjs");
var Route$10 = createFileRoute("/crise")({
	head: () => ({ meta: [{ title: "Salle de Crise Environnementale — EcoKin Smart" }, {
		name: "description",
		content: "Activation automatique en cas d'urgence : zones prioritaires, ressources, itinéraires."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./carte-DSkVbwiH.mjs");
var Route$9 = createFileRoute("/carte")({
	head: () => ({ meta: [{ title: "Carte SIG Kinshasa — EcoKin Smart" }, {
		name: "description",
		content: "Cartographie SIG interactive des 24 communes de Kinshasa : signalements en temps réel, clustering, géolocalisation citoyenne et recherche de lieux."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./bourgmestre-CcCPqHHa.mjs");
var Route$8 = createFileRoute("/bourgmestre")({
	head: () => ({ meta: [{ title: "Tableau de Bord Bourgmestre — EcoKin Smart" }, {
		name: "description",
		content: "Tableau de bord décisionnel pour le bourgmestre : signalements, collecte, zones critiques et indicateurs de performance de la commune."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./autorites-Cg7xxd3u.mjs");
var Route$7 = createFileRoute("/autorites")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./autorite-BYgWPpIU.mjs");
var Route$6 = createFileRoute("/autorite")({
	head: () => ({ meta: [{ title: "Espace Autorité — EcoKin Smart" }, {
		name: "description",
		content: "Accès réservé aux gouverneurs, bourgmestres, administrateurs et agents de la plateforme EcoKin Smart."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./audit-B1gz2DiS.mjs");
var Route$5 = createFileRoute("/audit")({
	head: () => ({ meta: [{ title: "Journal d'audit — EcoKin Smart" }, {
		name: "description",
		content: "Traçabilité complète : connexions, validations, interventions et changements de rôle."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./assistant-ia-Dv6eZYWu.mjs");
var Route$4 = createFileRoute("/assistant-ia")({
	head: () => ({ meta: [{ title: "Assistant IA des décideurs — EcoKin Smart" }, {
		name: "description",
		content: "Posez vos questions en langage naturel à l'IA EcoKin."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./agent-CZpUYQUK.mjs");
var Route$3 = createFileRoute("/agent")({
	head: () => ({ meta: [{ title: "Tableau de Bord Agent — EcoKin Smart" }, {
		name: "description",
		content: "Tableau de bord opérationnel pour les agents de terrain."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./admin-login-Du_DH5fc.mjs");
var Route$2 = createFileRoute("/admin-login")({
	head: () => ({ meta: [
		{ title: "Connexion administrateur — EcoKin Smart" },
		{
			name: "description",
			content: "Connexion sécurisée à la console d'administration EcoKin Smart par téléphone et code PIN."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin-E7E9aeX7.mjs");
var Route$1 = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "Administration — EcoKin Smart" }, {
		name: "description",
		content: "Espace administrateur de la plateforme EcoKin Smart."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./routes-CeOG6NW6.mjs");
var Route = createFileRoute("/")({
	head: () => ({ meta: [{ title: "EcoKin Smart — Plateforme Smart City de Kinshasa" }, {
		name: "description",
		content: "Deux modules citoyens pour gérer les déchets à Kinshasa : ménagers et dépôts sauvages."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var SituationRoute = Route$25.update({
	id: "/situation",
	path: "/situation",
	getParentRoute: () => Route$26
});
var SitemapDotxmlRoute = Route$24.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$26
});
var SignalerRoute = Route$23.update({
	id: "/signaler",
	path: "/signaler",
	getParentRoute: () => Route$26
});
var SensibilisationRoute = Route$22.update({
	id: "/sensibilisation",
	path: "/sensibilisation",
	getParentRoute: () => Route$26
});
var RecompensesRoute = Route$21.update({
	id: "/recompenses",
	path: "/recompenses",
	getParentRoute: () => Route$26
});
var RapportsRoute = Route$20.update({
	id: "/rapports",
	path: "/rapports",
	getParentRoute: () => Route$26
});
var PredictifRoute = Route$19.update({
	id: "/predictif",
	path: "/predictif",
	getParentRoute: () => Route$26
});
var ObservatoireRoute = Route$18.update({
	id: "/observatoire",
	path: "/observatoire",
	getParentRoute: () => Route$26
});
var MenagersRoute = Route$17.update({
	id: "/menagers",
	path: "/menagers",
	getParentRoute: () => Route$26
});
var MenageRoute = Route$16.update({
	id: "/menage",
	path: "/menage",
	getParentRoute: () => Route$26
});
var ItinerairesRoute = Route$15.update({
	id: "/itineraires",
	path: "/itineraires",
	getParentRoute: () => Route$26
});
var InterventionsRoute = Route$14.update({
	id: "/interventions",
	path: "/interventions",
	getParentRoute: () => Route$26
});
var GpsFlotteRoute = Route$13.update({
	id: "/gps-flotte",
	path: "/gps-flotte",
	getParentRoute: () => Route$26
});
var GouverneurRoute = Route$12.update({
	id: "/gouverneur",
	path: "/gouverneur",
	getParentRoute: () => Route$26
});
var DecisionsRoute = Route$11.update({
	id: "/decisions",
	path: "/decisions",
	getParentRoute: () => Route$26
});
var CriseRoute = Route$10.update({
	id: "/crise",
	path: "/crise",
	getParentRoute: () => Route$26
});
var CarteRoute = Route$9.update({
	id: "/carte",
	path: "/carte",
	getParentRoute: () => Route$26
});
var BourgmestreRoute = Route$8.update({
	id: "/bourgmestre",
	path: "/bourgmestre",
	getParentRoute: () => Route$26
});
var AutoritesRoute = Route$7.update({
	id: "/autorites",
	path: "/autorites",
	getParentRoute: () => Route$26
});
var AutoriteRoute = Route$6.update({
	id: "/autorite",
	path: "/autorite",
	getParentRoute: () => Route$26
});
var AuditRoute = Route$5.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => Route$26
});
var AssistantIaRoute = Route$4.update({
	id: "/assistant-ia",
	path: "/assistant-ia",
	getParentRoute: () => Route$26
});
var AgentRoute = Route$3.update({
	id: "/agent",
	path: "/agent",
	getParentRoute: () => Route$26
});
var AdminLoginRoute = Route$2.update({
	id: "/admin-login",
	path: "/admin-login",
	getParentRoute: () => Route$26
});
var AdminRoute = Route$1.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$26
});
var IndexRoute = Route.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$26
});
var AutoriteRouteChildren = { AutoriteConnexionRoute: Route$27.update({
	id: "/connexion",
	path: "/connexion",
	getParentRoute: () => AutoriteRoute
}) };
var rootRouteChildren = {
	IndexRoute,
	AdminRoute,
	AdminLoginRoute,
	AgentRoute,
	AssistantIaRoute,
	AuditRoute,
	AutoriteRoute: AutoriteRoute._addFileChildren(AutoriteRouteChildren),
	AutoritesRoute,
	BourgmestreRoute,
	CarteRoute,
	CriseRoute,
	DecisionsRoute,
	GouverneurRoute,
	GpsFlotteRoute,
	InterventionsRoute,
	ItinerairesRoute,
	MenageRoute,
	MenagersRoute,
	ObservatoireRoute,
	PredictifRoute,
	RapportsRoute,
	RecompensesRoute,
	SensibilisationRoute,
	SignalerRoute,
	SitemapDotxmlRoute,
	SituationRoute
};
var routeTree = Route$26._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
