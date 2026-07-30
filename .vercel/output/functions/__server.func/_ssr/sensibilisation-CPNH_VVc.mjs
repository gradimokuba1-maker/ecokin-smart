import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { F as Megaphone, _ as Sprout, d as TriangleAlert, yt as BookOpen } from "../_libs/lucide-react.mjs";
import { P as TIPS, d as ALERTS } from "./router-C5nfmudE.mjs";
import { n as SiteNav } from "./site-nav-7GSWuwOx.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sensibilisation-CPNH_VVc.js
var import_jsx_runtime = require_jsx_runtime();
var ARTICLES = [
	{
		title: "Pourquoi nos caniveaux débordent à chaque pluie",
		excerpt: "Comprendre le lien direct entre l'accumulation de plastique et les inondations dans les quartiers bas de Kinshasa.",
		tag: "Dossier"
	},
	{
		title: "Le tri à la maison en 5 étapes simples",
		excerpt: "Séparer plastiques, organiques et métaux avant la collecte, sans matériel spécialisé.",
		tag: "Guide"
	},
	{
		title: "Comment l'IA d'EcoKin valide vos signalements",
		excerpt: "Un aperçu transparent de notre modèle de classification et de la chaîne de validation.",
		tag: "Tech"
	}
];
function SensibilisationPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-secondary/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold uppercase tracking-widest text-eco",
							children: "Engagement citoyen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold tracking-tight",
							children: "Sensibilisation & alertes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-muted-foreground",
							children: "Comprendre, prévenir, agir. Conseils environnementaux et notifications en temps réel pour protéger nos communes."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-5 flex items-center gap-2 font-display text-2xl font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-5 text-eco" }), " Alertes en cours"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: ALERTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `rounded-2xl border p-5 ${a.level === "critique" ? "border-flood/30 bg-flood/5" : "border-border bg-card"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: a.level === "critique" ? "text-flood" : "text-urban",
									children: a.level === "critique" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }), " Alerte critique"]
									}) : "Information"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: a.date
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold",
								children: a.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: a.body
							})
						]
					}, a.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-5 flex items-center gap-2 font-display text-2xl font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-5 text-eco" }), " Guides & dossiers"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: ARTICLES.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "group flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-start rounded-full bg-eco/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-eco",
								children: a.tag
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-4 font-display text-lg font-bold leading-tight",
								children: a.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 flex-1 text-sm text-muted-foreground",
								children: a.excerpt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-4 text-sm font-bold text-eco group-hover:underline",
								children: "Lire l'article →"
							})
						]
					}, a.title))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-border bg-gradient-to-br from-eco/5 to-urban/5 p-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprout, { className: "size-5 text-eco" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl font-bold",
							children: "Le saviez-vous ?"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-4 md:grid-cols-2",
						children: TIPS.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-eco/10 font-bold text-eco",
								children: i + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t })]
						}, i))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { SensibilisationPage as component };
