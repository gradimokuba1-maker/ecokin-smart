import { t as SiteNav } from "./site-nav-C_XHakXe.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { O as Recycle, W as Leaf, m as Trash2, x as ShieldCheck } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CeOG6NW6.js
var import_jsx_runtime = require_jsx_runtime();
var MODULES = [{
	to: "/menagers",
	icon: Recycle,
	title: "Gestion des déchets ménagers",
	desc: "Accédez à la collecte régulière, aux services ménagers et au suivi de votre compte.",
	accent: "from-eco to-emerald-600"
}, {
	to: "/signaler",
	icon: Trash2,
	title: "Dépôt sauvage et tas de déchets",
	desc: "Signalez rapidement un dépôt sauvage et contribuez à la propreté de votre quartier.",
	accent: "from-sky-500 to-emerald-500"
}];
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen overflow-hidden bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-cover bg-center",
				style: {
					backgroundImage: "linear-gradient(135deg, rgba(2, 6, 23, 0.82) 0%, rgba(3, 24, 20, 0.62) 42%, rgba(2, 6, 23, 0.88) 100%), url('/images/photo.jpg')",
					backgroundSize: "cover",
					backgroundPosition: "center"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.16),transparent_55%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10 flex min-h-screen flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-8 flex items-center gap-3 rounded-full border border-eco/20 bg-white/80 px-4 py-2 shadow-sm backdrop-blur",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-10 place-items-center rounded-full bg-eco text-white shadow-lg shadow-eco/20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-lg font-semibold tracking-tight text-foreground",
								children: ["EcoKin ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-eco",
									children: "Smart"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-3xl rounded-[2rem] border border-white/15 bg-slate-950/20 px-6 py-5 text-center shadow-[0_20px_70px_rgba(2,6,23,0.35)] backdrop-blur-sm sm:px-8 sm:py-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-balance font-display text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.75)] sm:text-5xl lg:text-6xl",
								children: ["Bienvenue sur ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-emerald-300",
									children: "EcoKin Smart"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-4 max-w-2xl text-lg text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] sm:text-xl",
								children: "Choisissez votre module pour accéder au service correspondant à votre profil."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-10 flex w-full max-w-3xl flex-col items-center gap-5",
							children: [MODULES.map(({ to, icon: Icon, title, desc, accent }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to,
								className: "group relative flex w-full min-h-[150px] items-center overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(16,185,129,0.35)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-10` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex w-full items-center gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg sm:size-16`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-7 sm:size-8" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-lg font-semibold text-foreground sm:text-xl",
												children: title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm leading-6 text-muted-foreground",
												children: desc
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-2 inline-flex items-center gap-2 text-sm font-semibold text-eco",
											children: "Accéder"
										})
									]
								})]
							}, to)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/autorite",
								className: "inline-flex items-center gap-2 self-center rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70 shadow-sm backdrop-blur transition-colors hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-100",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), "Accès réservé aux autorités"]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "border-t border-border/60 bg-background/80 px-4 py-6 text-center backdrop-blur",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-4xl flex-col items-center gap-1 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "EcoKin Smart"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pour une ville propre, durable et intelligente." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© EcoKin Smart – Tous droits réservés." })
						]
					})
				})]
			})
		]
	});
}
//#endregion
export { Home as component };
