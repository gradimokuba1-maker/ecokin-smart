import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Y as Gauge } from "../_libs/lucide-react.mjs";
import { a as YAxis, c as Line, h as Legend, i as LineChart, l as CartesianGrid, m as Tooltip, o as XAxis, p as ResponsiveContainer, r as BarChart, u as Bar } from "../_libs/recharts+[...].mjs";
import { T as IPK_TREND, _ as COMMUNE_PERFORMANCE, m as COMMUNES, w as IPK } from "./router-C5nfmudE.mjs";
import { n as SiteNav } from "./site-nav-7GSWuwOx.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/observatoire-DSUoCp-e.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const perfData = COMMUNES.map((c) => ({
		commune: c.name,
		IPK: COMMUNE_PERFORMANCE[c.id].ipk,
		Collecte: COMMUNE_PERFORMANCE[c.id].tauxCollecte,
		Résolution: COMMUNE_PERFORMANCE[c.id].tauxResolution,
		Valorisation: COMMUNE_PERFORMANCE[c.id].tauxValorisation
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-secondary/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-4" }), " Module 6 · Observatoire urbain"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold",
							children: "Observatoire de la propreté"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-muted-foreground",
							children: "Indice de Propreté de Kinshasa (IPK), performance des communes et taux de valorisation."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-eco/30 bg-eco/5 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-bold uppercase tracking-widest text-eco",
								children: "IPK Kinshasa"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 font-display text-4xl font-bold",
								children: [0, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base text-muted-foreground",
									children: "/100"
								})]
							})]
						}), COMMUNES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
									children: ["IPK ", c.name]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 font-display text-3xl font-bold",
									children: [IPK[c.id].score, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `ml-2 text-sm font-semibold ${IPK[c.id].trend >= 0 ? "text-eco" : "text-red-500"}`,
										children: [IPK[c.id].trend >= 0 ? "+" : "", IPK[c.id].trend]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 text-xs text-muted-foreground",
									children: ["Rang #", IPK[c.id].rang]
								})
							]
						}, c.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-3xl border border-border bg-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mb-3 font-display text-lg font-bold",
								children: "Évolution mensuelle de l'IPK"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-64",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
									data: IPK_TREND,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											strokeDasharray: "3 3",
											stroke: "#e5e7eb"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "mois",
											tick: { fontSize: 11 }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											tick: { fontSize: 11 },
											domain: [30, 100]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											type: "monotone",
											dataKey: "kinshasa",
											stroke: "#0f172a",
											strokeWidth: 2.5
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											type: "monotone",
											dataKey: "matete",
											stroke: "#10b981"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											type: "monotone",
											dataKey: "lemba",
											stroke: "#0ea5e9"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											type: "monotone",
											dataKey: "kisenso",
											stroke: "#f59e0b"
										})
									]
								}) })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-3xl border border-border bg-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mb-3 font-display text-lg font-bold",
								children: "Performance des communes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-64",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: perfData,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											strokeDasharray: "3 3",
											stroke: "#e5e7eb"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "commune",
											tick: { fontSize: 11 }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 11 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "IPK",
											fill: "#10b981"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "Collecte",
											fill: "#0ea5e9"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "Résolution",
											fill: "#6366f1"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "Valorisation",
											fill: "#f59e0b"
										})
									]
								}) })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border bg-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-4 font-display text-lg font-bold",
							children: "Indice de performance détaillé"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2",
											children: "Commune"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "IPK" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Taux collecte" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Taux résolution" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Taux valorisation" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Temps réponse moyen" })
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: COMMUNES.map((c) => {
								const p = COMMUNE_PERFORMANCE[c.id];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/60",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 font-semibold",
											children: c.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "font-bold text-eco",
											children: [p.ipk, "/100"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [p.tauxCollecte, "%"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [p.tauxResolution, "%"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [p.tauxValorisation, "%"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [p.tempsReponseH, " h"] })
									]
								}, c.id);
							}) })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Page as component };
