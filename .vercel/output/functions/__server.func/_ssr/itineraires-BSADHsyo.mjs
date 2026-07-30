import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { D as Route, R as MapPin, Z as Fuel, h as Timer, p as TrendingDown, v as Sparkles } from "../_libs/lucide-react.mjs";
import { p as COLLECTION_POINTS } from "./router-C5nfmudE.mjs";
import { n as SiteNav } from "./site-nav-7GSWuwOx.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-UWDiz1-u.mjs";
import { t as ClientOnly } from "./client-only-DU1fAtk9.mjs";
import { n as routeDistanceKm, r as useFleet, t as optimizeRoute } from "./fleet-gps-DHsGU54E.mjs";
import { t as FleetMap } from "./fleet-map-GoKlK5Sx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/itineraires-BSADHsyo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ItinerairesPage() {
	const { vehicles, setRoute } = useFleet(6e3);
	const [selected, setSelected] = (0, import_react.useState)(vehicles[0]?.id);
	const active = vehicles.find((v) => v.id === selected) ?? vehicles[0];
	const stats = (0, import_react.useMemo)(() => {
		const totalKm = vehicles.reduce((s, v) => s + routeDistanceKm(v.route), 0);
		const optKm = vehicles.reduce((s, v) => s + routeDistanceKm(optimizeRoute(v.route, v.route[0])), 0);
		const saved = Math.max(0, totalKm - optKm);
		return {
			totalKm,
			optKm,
			saved,
			fuelSaved: saved * .35
		};
	}, [vehicles]);
	function optimize(id) {
		const v = vehicles.find((x) => x.id === id);
		if (!v) return;
		setRoute(id, optimizeRoute(v.route, [v.current.lat, v.current.lng]));
	}
	function addCollectionPoint(id, lat, lng) {
		const v = vehicles.find((x) => x.id === id);
		if (!v) return;
		setRoute(id, [...v.route, [lat, lng]]);
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
							children: "SIG · Planification"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold tracking-tight",
							children: "Cartographie intelligente des itinéraires"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-white/70",
							children: "Planifiez les tournées, ajoutez des arrêts et optimisez automatiquement les parcours grâce à l'IA pour réduire le temps de déplacement et le coût de carburant."
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
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-4" }),
								label: "Distance totale",
								value: `${stats.totalKm.toFixed(1)} km`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }),
								label: "Après optimisation IA",
								value: `${stats.optKm.toFixed(1)} km`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-4" }),
								label: "Économie",
								value: `${stats.saved.toFixed(1)} km`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fuel, { className: "size-4" }),
								label: "Carburant économisé",
								value: `${stats.fuelSaved.toFixed(1)} L`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-6 lg:grid-cols-[1.6fr_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-3xl border border-border bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-border px-5 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
									children: "Vue SIG"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-lg font-bold",
									children: "Itinéraires planifiés & tournées en cours"
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
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold",
											children: v.id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-2 text-xs text-muted-foreground",
											children: [
												v.commune,
												" · ",
												v.driver
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs font-semibold",
											children: [routeDistanceKm(v.route).toFixed(1), " km"]
										})]
									}) }, v.id))
								})]
							}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-3xl border border-border bg-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "font-display text-lg font-bold",
										children: [active.id, " — itinéraire"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 text-xs text-muted-foreground",
										children: [
											active.route.length,
											" arrêt(s) · ",
											routeDistanceKm(active.route).toFixed(1),
											" km"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
										className: "mt-3 space-y-1 text-xs",
										children: active.route.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid size-5 place-items-center rounded-full bg-eco text-[10px] font-bold text-white",
												children: i + 1
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												p[0].toFixed(4),
												", ",
												p[1].toFixed(4)
											] })]
										}, i))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => optimize(active.id),
											className: "inline-flex items-center gap-1 rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white hover:bg-eco/90",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" }), " Optimiser par IA"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
											children: "Ajouter un point de collecte"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-2 max-h-40 space-y-1 overflow-auto text-xs",
											children: COLLECTION_POINTS.map((cp) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => addCollectionPoint(active.id, cp.lat, cp.lng),
												className: "flex w-full items-center justify-between rounded-lg border border-border bg-background px-2 py-1.5 hover:bg-secondary",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mr-1 inline size-3 text-eco" }), cp.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] uppercase text-muted-foreground",
													children: cp.kind
												})]
											}) }, cp.id))
										})]
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl border border-border bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg font-bold",
							children: "Statistiques de tournées"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "text-left text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2",
											children: "Véhicule"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commune" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Arrêts" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Distance planifiée" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Distance optimisée" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Économie" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Vitesse moy." })
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: vehicles.map((v) => {
									const p = routeDistanceKm(v.route);
									const o = routeDistanceKm(optimizeRoute(v.route, v.route[0]));
									const avg = v.track.length ? v.track.reduce((s, f) => s + f.speedKmh, 0) / v.track.length : v.current.speedKmh;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 font-semibold",
												children: v.id
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: v.commune }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: v.route.length }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [p.toFixed(2), " km"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [o.toFixed(2), " km"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "text-eco font-semibold",
												children: [Math.max(0, p - o).toFixed(2), " km"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "mr-1 inline size-3" }),
												Math.round(avg),
												" km/h"
											] })
										]
									}, v.id);
								}) })]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Tile({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-8 place-items-center rounded-lg bg-eco/10 text-eco",
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
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: [
		"agent",
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	title: "Itinéraires intelligents",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItinerairesPage, {})
});
//#endregion
export { SplitComponent as component };
