import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as SiteNav } from "./site-nav-B-Or7zPf.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Ct as Activity, Y as Gauge, b as Signal, ct as CirclePause, d as TriangleAlert, et as Download, h as Timer, k as Radio, st as CirclePlay, u as Truck } from "../_libs/lucide-react.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-BjjPBL9b.mjs";
import { t as ClientOnly } from "./client-only-DU1fAtk9.mjs";
import { r as useFleet } from "./fleet-gps-DHsGU54E.mjs";
import { t as FleetMap } from "./fleet-map-GoKlK5Sx.mjs";
import { n as init_jspdf_es_min, t as E } from "../_libs/jspdf.mjs";
import { t as require_jspdf_plugin_autotable } from "../_libs/jspdf-autotable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gps-flotte-CKZupj7b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
init_jspdf_es_min();
var import_jspdf_plugin_autotable = /* @__PURE__ */ __toESM(require_jspdf_plugin_autotable());
var STATUS_LABEL = {
	en_circulation: "En circulation",
	arret: "À l'arrêt",
	hors_ligne: "Hors ligne"
};
var STATUS_COLOR = {
	en_circulation: "bg-eco/15 text-eco",
	arret: "bg-amber-500/15 text-amber-700",
	hors_ligne: "bg-slate-500/15 text-slate-700"
};
function GpsPage() {
	const { vehicles, alerts, setStatus } = useFleet(3500);
	const [selected, setSelected] = (0, import_react.useState)(vehicles[0]?.id);
	const active = vehicles.find((v) => v.id === selected) ?? vehicles[0];
	const stats = (0, import_react.useMemo)(() => {
		const live = vehicles.filter((v) => v.status === "en_circulation").length;
		const off = vehicles.filter((v) => v.status === "hors_ligne").length;
		const avg = vehicles.reduce((s, v) => s + v.current.speedKmh, 0) / (vehicles.length || 1);
		return {
			live,
			off,
			avg: Math.round(avg)
		};
	}, [vehicles]);
	function exportPdf() {
		const doc = new E();
		doc.setFillColor(11, 31, 58);
		doc.rect(0, 0, 210, 26, "F");
		doc.setTextColor(255, 255, 255);
		doc.setFontSize(15);
		doc.setFont("helvetica", "bold");
		doc.text("EcoKin Smart — Rapport GPS de la flotte", 14, 12);
		doc.setFontSize(9);
		doc.setFont("helvetica", "normal");
		doc.text((/* @__PURE__ */ new Date()).toLocaleString("fr-FR"), 14, 20);
		doc.setTextColor(0, 0, 0);
		(0, import_jspdf_plugin_autotable.default)(doc, {
			startY: 34,
			head: [[
				"Véhicule",
				"Immat.",
				"Chauffeur",
				"Commune",
				"Statut",
				"Vitesse",
				"Charge",
				"Déviation",
				"Dernier fix"
			]],
			body: vehicles.map((v) => [
				v.id,
				v.plate,
				v.driver,
				v.commune,
				STATUS_LABEL[v.status],
				`${Math.round(v.current.speedKmh)} km/h`,
				`${v.loadPct}%`,
				`${v.deviationMeters} m`,
				v.lastFixAt ? new Date(v.lastFixAt).toLocaleTimeString("fr-FR") : "—"
			]),
			styles: { fontSize: 8 },
			headStyles: { fillColor: [
				16,
				185,
				129
			] }
		});
		if (alerts.length) (0, import_jspdf_plugin_autotable.default)(doc, {
			head: [[
				"Heure",
				"Véhicule",
				"Alerte"
			]],
			body: alerts.map((a) => [
				new Date(a.at).toLocaleTimeString("fr-FR"),
				a.vehicleId,
				a.msg
			]),
			styles: { fontSize: 8 },
			headStyles: { fillColor: [
				239,
				68,
				68
			] }
		});
		doc.save(`gps-flotte-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-kin text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold uppercase tracking-widest text-eco",
							children: "Télémétrie · Temps réel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold tracking-tight",
							children: "Suivi GPS de la flotte"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-white/70",
							children: "Position live, vitesse, statut, historique des trajets, alertes automatiques (déviation, arrêt prolongé, hors ligne) et relecture des tournées passées."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-4 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {}),
								label: "Véhicules connectés",
								value: `${vehicles.length - stats.off}/${vehicles.length}`,
								tone: "eco"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, {}),
								label: "En circulation",
								value: String(stats.live),
								tone: "kin"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {}),
								label: "Vitesse moyenne",
								value: `${stats.avg} km/h`,
								tone: "urban"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {}),
								label: "Alertes actives",
								value: String(alerts.length),
								tone: "flood"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground inline-flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative flex size-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-eco/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex size-2 rounded-full bg-eco" })]
							}), "Synchronisation live · rafraîchissement 3,5 s"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: exportPdf,
							className: "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Rapport PDF"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-6 lg:grid-cols-[1.6fr_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-3xl border border-border bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-border px-5 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
									children: "Carte temps réel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-lg font-bold",
									children: "Position & trajets en direct"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[520px] animate-pulse bg-muted" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FleetMap, {
									vehicles,
									selectedId: selected,
									onSelect: setSelected,
									height: 520
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-3xl border border-border bg-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-lg font-bold",
									children: "Véhicules"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-2",
									children: vehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setSelected(v.id),
										className: `flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${selected === v.id ? "border-eco bg-eco/5" : "border-border bg-background hover:bg-secondary"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-bold",
											children: [
												v.id,
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] text-muted-foreground",
													children: ["· ", v.plate]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-muted-foreground",
											children: [
												v.driver,
												" · ",
												v.commune
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLOR[v.status]}`,
												children: STATUS_LABEL[v.status]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 text-[10px] text-muted-foreground",
												children: [Math.round(v.current.speedKmh), " km/h"]
											})]
										})]
									}) }, v.id))
								})]
							}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-3xl border border-border bg-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "font-display text-lg font-bold",
										children: [active.id, " — télémétrie"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "mt-3 grid grid-cols-2 gap-2 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												label: "Vitesse",
												value: `${Math.round(active.current.speedKmh)} km/h`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												label: "Cap",
												value: `${Math.round(active.current.headingDeg)}°`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												label: "Charge",
												value: `${active.loadPct}%`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												label: "Déviation",
												value: `${active.deviationMeters} m`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												label: "Latitude",
												value: active.current.lat.toFixed(5)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												label: "Longitude",
												value: active.current.lng.toFixed(5)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												label: "Départ",
												value: active.startedAt ? new Date(active.startedAt).toLocaleTimeString("fr-FR") : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												label: "Dernier fix",
												value: active.lastFixAt ? new Date(active.lastFixAt).toLocaleTimeString("fr-FR") : "—"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setStatus(active.id, "en_circulation"),
												className: "inline-flex items-center gap-1 rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlay, { className: "size-3" }), " En circulation"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setStatus(active.id, "arret"),
												className: "inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePause, { className: "size-3" }), " Arrêt"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setStatus(active.id, "hors_ligne"),
												className: "inline-flex items-center gap-1 rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Signal, { className: "size-3" }), " Hors ligne"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
										className: "mt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
											className: "cursor-pointer text-xs font-semibold text-eco",
											children: [
												"Relecture — ",
												active.track.length,
												" points"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-2 max-h-48 space-y-1 overflow-auto text-[11px]",
											children: active.track.slice(0, 40).map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center justify-between rounded-md border border-border bg-background px-2 py-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "mr-1 inline size-3" }), new Date(f.at).toLocaleTimeString("fr-FR")] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													Math.round(f.speedKmh),
													" km/h · ",
													f.lat.toFixed(4),
													", ",
													f.lng.toFixed(4)
												] })]
											}, i))
										})]
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl border border-border bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display text-lg font-bold inline-flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-flood" }), " Alertes automatiques"]
						}), alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "Aucune anomalie détectée. La flotte est nominale."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1.5 text-sm",
							children: alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mr-2 inline size-3 text-red-500" }), a.msg] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: new Date(a.at).toLocaleTimeString("fr-FR")
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
function Tile({ icon, label, value, tone }) {
	const bg = {
		eco: "bg-eco/10 text-eco",
		kin: "bg-kin/10 text-kin",
		urban: "bg-urban/10 text-urban",
		flood: "bg-flood/10 text-flood"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `grid size-8 place-items-center rounded-lg ${bg}`,
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 font-display text-2xl font-bold",
			children: value
		})]
	});
}
function Info({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-background px-2 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-widest text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-semibold",
			children: value
		})]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: [
		"agent",
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	title: "Suivi GPS de la flotte",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GpsPage, {})
});
//#endregion
export { SplitComponent as component };
