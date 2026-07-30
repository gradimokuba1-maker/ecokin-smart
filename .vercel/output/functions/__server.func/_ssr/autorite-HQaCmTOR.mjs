import { f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { V as Lock, c as UserCog, gt as Building2, o as UserRound, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as SiteNav } from "./site-nav-7GSWuwOx.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/autorite-HQaCmTOR.js
var import_jsx_runtime = require_jsx_runtime();
var ACCESS_TYPES = [
	{
		role: "gouverneur",
		title: "Gouverneur",
		subtitle: "Supervision globale",
		description: "Vision stratégique de Kinshasa, des 24 communes et des infrastructures prioritaires.",
		icon: ShieldCheck
	},
	{
		role: "bourgmestre",
		title: "Bourgmestre",
		subtitle: "Pilotage communal",
		description: "Signalements, équipes, PME, agents et indicateurs filtrés sur sa commune.",
		icon: Building2
	},
	{
		role: "admin",
		title: "Administrateur",
		subtitle: "Gestion technique",
		description: "Administration complète des utilisateurs, rôles, communes, infrastructures et statistiques.",
		icon: UserCog
	},
	{
		role: "agent",
		title: "Agent de terrain",
		subtitle: "Interventions terrain",
		description: "Missions, points de collecte, signalements locaux et validation avant/après intervention.",
		icon: UserRound
	}
];
function RoleSelector() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-8 space-y-3",
		children: ACCESS_TYPES.map((item) => {
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/autorite/connexion",
				search: { role: item.role },
				className: "block w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-left transition-all hover:border-emerald-400/30 hover:bg-white/15",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 grid size-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-200",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold text-white",
							children: item.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium text-emerald-200",
							children: item.subtitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-slate-300",
							children: item.description
						})
					] })]
				})
			}, item.role);
		})
	});
}
function AuthorityLayout() {
	const isIndex = useRouterState({ select: (state) => state.location.pathname }) === "/autorite";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			isIndex ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorityIndex, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function AuthorityIndex() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-hidden rounded-[2rem] border border-emerald-900/30 bg-[linear-gradient(135deg,#071523_0%,#0f2d3d_45%,#0e3a2c_100%)] p-6 text-white shadow-[0_20px_80px_-30px_rgba(16,185,129,0.45)] sm:p-8 lg:p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 text-center sm:text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center justify-center gap-2 self-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 sm:self-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), " Portail sécurisé · Accès réservé"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-bold tracking-tight sm:text-4xl",
							children: "Espace Autorité"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto max-w-2xl text-sm text-slate-300 sm:mx-0 sm:text-base",
							children: "Sélectionnez votre profil pour continuer vers la page de connexion sécurisée de votre service."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleSelector, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50",
					children: "Après votre sélection, vous serez redirigé vers une page de connexion sécurisée avec les champs Identifiant et Mot de passe."
				})
			]
		})
	});
}
//#endregion
export { AuthorityLayout as component };
