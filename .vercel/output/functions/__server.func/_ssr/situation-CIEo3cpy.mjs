import { E as HOTSPOTS, R as PRIORITY_ALERTS, S as COMMUNE_PERFORMANCE, k as INTERVENTION_HISTORY, y as COMMUNES, z as REPORTS } from "./ecokin-db-CJricvzN.mjs";
import { t as SiteNav } from "./site-nav-C_XHakXe.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { A as Radar, Ct as Activity, d as TriangleAlert, q as History } from "../_libs/lucide-react.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-BVebF8pM.mjs";
import { t as ClientOnly } from "./client-only-BPSORI3B.mjs";
import { t as EcoMap } from "./eco-map-BMXCpNr4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/situation-CIEo3cpy.js
var import_jsx_runtime = require_jsx_runtime();
function SituationPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
		required: ["bourgmestre", "gouverneur"],
		title: "Centre de Situation Urbaine",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {})
	});
}
function Content() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-kin text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, { className: "size-4" }), " Module 1 · Situation temps réel"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold",
							children: "Centre de Situation Urbaine"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-white/70",
							children: "Visualisation en direct des incidents environnementaux et points critiques d'accumulation."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 md:grid-cols-3",
						children: COMMUNES.map((c) => {
							const perf = COMMUNE_PERFORMANCE[c.id];
							const reports = REPORTS.filter((r) => r.commune === c.id);
							const critiques = reports.filter((r) => r.severity === "critique").length;
							const level = critiques > 4 ? "critique" : critiques > 2 ? "eleve" : "modere";
							const lvlColor = level === "critique" ? "bg-red-500" : level === "eleve" ? "bg-orange-500" : "bg-amber-500";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
										children: "Commune"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-xl font-bold",
										children: c.name
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `rounded-full px-3 py-1 text-[10px] font-bold uppercase text-white ${lvlColor}`,
										children: level
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid grid-cols-3 gap-2 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
											label: "Signalements",
											value: reports.length.toString()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
											label: "Critiques",
											value: critiques.toString()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
											label: "IPK",
											value: perf ? perf.ipk + "" : "—"
										})
									]
								})]
							}, c.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 lg:grid-cols-[1.4fr_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-3xl border border-border bg-card p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-3 pt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Carte temps réel · incidents, dépôts sauvages, caniveaux, hotspots"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EcoMap, {
									reports: REPORTS,
									height: 520,
									showCollection: false,
									showFloodZones: true,
									showDumps: true,
									showDrains: true,
									showPois: true
								}) })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-red-200 bg-red-500/5 p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-bold text-red-600",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }), " Alertes prioritaires"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-2",
									children: PRIORITY_ALERTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "rounded-xl bg-card p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] font-bold uppercase tracking-widest text-red-600",
											children: a.level
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 font-semibold",
											children: a.msg
										})]
									}, a.id))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-eco" }), " Hotspots récurrents"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-2 text-xs",
									children: HOTSPOTS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between gap-2 border-b border-border/60 pb-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate font-semibold",
												children: h.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "capitalize text-muted-foreground",
												children: [
													h.commune,
													" · ",
													h.recurrence,
													"/mois · ",
													h.trend
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${h.predictedRiskNext7d === "critique" ? "bg-red-500" : h.predictedRiskNext7d === "eleve" ? "bg-orange-500" : h.predictedRiskNext7d === "modere" ? "bg-amber-500" : "bg-emerald-500"}`,
											children: h.predictedRiskNext7d
										})]
									}, h.id))
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border bg-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-eco" }), " Historique des interventions"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2",
												children: "Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commune" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Équipe" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Durée" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Volume" })
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: INTERVENTION_HISTORY.map((i, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/60",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 font-mono text-xs",
											children: i.date
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "capitalize",
											children: i.commune
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "capitalize",
											children: i.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: i.equipe }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [i.duree_h, " h"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [i.volume_m3, " m³"] })
									]
								}, k)) })]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Mini({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-secondary/40 px-2 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[9px] font-bold uppercase tracking-widest text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-display text-base font-bold",
			children: value
		})]
	});
}
//#endregion
export { SituationPage as component };
