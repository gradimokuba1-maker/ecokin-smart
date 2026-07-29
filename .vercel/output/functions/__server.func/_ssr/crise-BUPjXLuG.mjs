import { o as __toESM } from "../_runtime.mjs";
import { E as HOTSPOTS, G as WEATHER_FORECAST, R as PRIORITY_ALERTS, U as TRUCKS, h as AI_RECOMMENDATIONS } from "./ecokin-db-CJricvzN.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as TEAMS_LIST, r as URGENCY_META, s as useLiveReports, t as STATUS_META } from "./live-reports-YSvqXRNr.mjs";
import { t as SiteNav } from "./site-nav-C_XHakXe.mjs";
import { i as useAccess } from "./access-store-ClkdaLJp.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { R as MapPin, i as Users, lt as CircleCheck, u as Truck, y as Siren } from "../_libs/lucide-react.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-BVebF8pM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crise-BUPjXLuG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const w = WEATHER_FORECAST[0];
	const active = !!w && (w.floodRisk === "critique" || w.floodRisk === "eleve");
	const { items, ack, assign, setStatus } = useLiveReports();
	const { session } = useAccess();
	const stats = (0, import_react.useMemo)(() => {
		const byUrg = {
			faible: 0,
			moyen: 0,
			eleve: 0,
			critique: 0
		};
		let unack = 0;
		for (const it of items) {
			byUrg[it.urgency]++;
			if (!it.ack) unack++;
		}
		return {
			byUrg,
			unack,
			total: items.length
		};
	}, [items]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: `border-b ${active ? "bg-red-600 text-white" : "bg-secondary/40"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${active ? "text-white" : "text-eco"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Siren, { className: "size-4 animate-pulse" }), " Module 7 · Salle de crise"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold",
							children: active ? "🚨 CRISE ACTIVÉE" : "Veille environnementale"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-1 max-w-2xl text-sm ${active ? "text-white/80" : "text-muted-foreground"}`,
							children: active ? `Pluies ${w.rainMm} mm prévues — risque d'inondation ${w.floodRisk} sur Kinshasa. Plan d'urgence activé automatiquement.` : "Aucun déclencheur critique. La salle s'active automatiquement en cas de fortes pluies, inondations ou décharges majeures."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "overflow-hidden rounded-3xl border border-border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-5 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-bold uppercase tracking-widest text-eco",
								children: "Flux temps réel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-bold",
								children: "Signalements citoyens & alertes"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2 text-[11px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										label: "Total",
										v: stats.total
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										label: "Non acquittés",
										v: stats.unack,
										tone: "red"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										label: "Critique",
										v: stats.byUrg.critique,
										tone: "red"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										label: "Élevé",
										v: stats.byUrg.eleve,
										tone: "orange"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										label: "Moyen",
										v: stats.byUrg.moyen,
										tone: "amber"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										label: "Faible",
										v: stats.byUrg.faible,
										tone: "green"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-h-[520px] divide-y divide-border overflow-y-auto",
							children: [items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-8 text-center text-sm text-muted-foreground",
								children: "Aucun signalement en direct. Les nouveaux signalements citoyens apparaîtront ici instantanément."
							}), items.map((r) => {
								const u = URGENCY_META[r.urgency];
								const s = STATUS_META[r.status];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-start",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${u.bg} ${u.color}`,
														children: u.label
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${s.color}`,
														children: s.label
													}),
													r.ack && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), " Acquitté"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-muted-foreground",
														children: r.id
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground",
														children: new Date(r.createdAt).toLocaleString("fr-FR")
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 text-sm font-semibold capitalize",
												children: [
													r.category,
													" · ",
													r.commune,
													r.priorityScore !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "ml-2 text-xs text-muted-foreground",
														children: [
															"Score ",
															r.priorityScore,
															"/100"
														]
													})
												]
											}),
											r.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-0.5 text-xs text-muted-foreground",
												children: r.description
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 text-[11px] text-muted-foreground",
												children: [
													"Par ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.author }),
													r.lat !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono",
														children: [
															r.lat.toFixed(4),
															", ",
															r.lng.toFixed(4)
														]
													})] }),
													r.team && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · Équipe : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.team })] })
												]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-1.5 sm:min-w-[220px]",
										children: [
											!r.ack && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => ack(r.id, session.name),
												className: "rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700",
												children: "✓ Acquitter l'alerte"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: r.team ?? "",
												onChange: (e) => e.target.value && assign(r.id, e.target.value, session.name),
												className: "rounded-lg border border-border bg-background px-2 py-1.5 text-[11px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "Assigner une équipe…"
												}), TEAMS_LIST.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: t,
													children: t
												}, t))]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: r.status,
												onChange: (e) => setStatus(r.id, e.target.value, session.name),
												className: "rounded-lg border border-border bg-background px-2 py-1.5 text-[11px]",
												children: Object.entries(STATUS_META).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: k,
													children: v.label
												}, k))
											})
										]
									})]
								}, r.id);
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-red-500" }), " Zones prioritaires"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-2 text-xs",
									children: HOTSPOTS.filter((h) => h.predictedRiskNext7d === "critique" || h.predictedRiskNext7d === "eleve").map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "rounded-lg bg-secondary/40 p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold",
											children: h.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "capitalize text-muted-foreground",
											children: [
												h.commune,
												" · ",
												h.predictedRiskNext7d
											]
										})]
									}, h.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-4 text-eco" }), " Ressources mobilisables"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-3 space-y-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Camions disponibles" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: TRUCKS.length })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Camions en collecte" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: TRUCKS.filter((t) => t.status === "collecte").length })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Équipes d'urgence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "4" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stock pompes mobiles" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "6" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sacs anti-inondation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "1 200" })]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-kin" }), " Cellules activées"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-3 space-y-1.5 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "✅ Cabinet du Gouverneur" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "✅ Bourgmestres des 24 communes" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "✅ Direction Urbanisme" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "✅ Croix-Rouge RDC" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "⌛ Protection civile (à confirmer)" })
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold",
								children: "Plan d'action recommandé par l'IA"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Itinéraires d'intervention optimisés selon la gravité et la proximité des hotspots."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 space-y-3",
								children: AI_RECOMMENDATIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-4 rounded-2xl border border-border bg-secondary/30 p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-10 shrink-0 place-items-center rounded-xl bg-red-500 font-display text-lg font-bold text-white",
											children: r.priorite
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold",
												children: r.titre
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground",
												children: r.motif
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												"🚛 ",
												r.camions,
												" · 👷 ",
												r.equipes
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-bold text-eco",
												children: r.eta
											})]
										})
									]
								}, r.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border bg-kin p-6 text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg font-bold",
							children: "Alertes prioritaires diffusées"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2 text-sm",
							children: PRIORITY_ALERTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-xl bg-white/5 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-widest text-eco",
									children: a.level
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1",
									children: a.msg
								})]
							}, a.id))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Badge({ label, v, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${tone === "red" ? "bg-red-500/15 text-red-700" : tone === "orange" ? "bg-orange-500/15 text-orange-700" : tone === "amber" ? "bg-amber-500/15 text-amber-700" : tone === "green" ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-foreground"}`,
		children: [
			label,
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
				className: "font-mono",
				children: v
			})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: ["gouverneur"],
	title: "Salle de Crise Environnementale",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {})
});
//#endregion
export { SplitComponent as component };
