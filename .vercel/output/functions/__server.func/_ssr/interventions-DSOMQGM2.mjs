import { o as __toESM } from "../_runtime.mjs";
import { O as INTERVENTIONS, U as TRUCKS } from "./ecokin-db-CJricvzN.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as SiteNav } from "./site-nav-C_XHakXe.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { R as MapPin, i as Users, mt as Camera } from "../_libs/lucide-react.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-BVebF8pM.mjs";
import { t as ClientOnly } from "./client-only-BPSORI3B.mjs";
import { t as EcoMap } from "./eco-map-BMXCpNr4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/interventions-DSOMQGM2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var typeLabel = {
	collecte: "Collecte",
	curage: "Curage",
	sensibilisation: "Sensibilisation",
	urgence: "Urgence"
};
function InterventionsPage() {
	const [trucks, setTrucks] = (0, import_react.useState)(TRUCKS);
	const [items, setItems] = (0, import_react.useState)(INTERVENTIONS);
	(0, import_react.useEffect)(() => {
		const i = setInterval(() => {
			setTrucks((prev) => prev.map((t) => t.status === "pause" || t.status === "depot" ? t : {
				...t,
				lat: t.lat + (Math.random() - .5) * 8e-4,
				lng: t.lng + (Math.random() - .5) * 8e-4
			}));
		}, 2500);
		return () => clearInterval(i);
	}, []);
	function advance(id) {
		setItems((prev) => prev.map((it) => it.id === id ? {
			...it,
			status: it.status === "planifiee" ? "en_cours" : it.status === "en_cours" ? "terminee" : "terminee",
			beforePhoto: it.beforePhoto ?? "x",
			afterPhoto: it.status === "en_cours" ? "x" : it.afterPhoto
		} : it));
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
							children: "Opérations"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold tracking-tight",
							children: "Gestion des interventions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-white/70",
							children: "Affectation des équipes, suivi GPS de la flotte et validation par photo avant/après."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-3xl border border-border bg-card lg:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-border px-5 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
								children: "Carte temps réel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-bold",
								children: "Suivi GPS de la flotte"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[480px] animate-pulse bg-muted" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EcoMap, {
								trucks,
								showRoads: true,
								showRivers: true,
								showCollection: true,
								height: 480
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg font-bold",
							children: "Camions actifs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2 text-sm",
							children: trucks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold",
									children: [
										t.id,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: ["· ", t.driver]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs",
									children: [
										t.status,
										" · ",
										t.loadPct,
										"%"
									]
								})]
							}, t.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl border border-border bg-card p-5 lg:col-span-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-bold",
							children: "Interventions planifiées & en cours"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-4 md:grid-cols-2",
							children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-2xl border border-border bg-background p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-base font-bold",
											children: it.id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${it.status === "terminee" ? "bg-emerald-500/15 text-emerald-700" : it.status === "en_cours" ? "bg-amber-500/15 text-amber-700" : "bg-slate-500/15 text-slate-700"}`,
											children: it.status
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: typeLabel[it.type]
											}),
											" · ",
											it.commune
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: it.notes
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }),
													" ",
													it.team
												]
											}),
											it.truckId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3" }),
													" ",
													it.truckId
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: it.scheduledAt })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `flex h-12 flex-1 items-center justify-center rounded-lg border border-dashed text-[11px] ${it.beforePhoto ? "border-eco/40 bg-eco/5 text-eco" : "border-border text-muted-foreground"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-1 size-3" }),
												" ",
												it.beforePhoto ? "Avant ✓" : "Photo avant"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `flex h-12 flex-1 items-center justify-center rounded-lg border border-dashed text-[11px] ${it.afterPhoto ? "border-eco/40 bg-eco/5 text-eco" : "border-border text-muted-foreground"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-1 size-3" }),
												" ",
												it.afterPhoto ? "Après ✓" : "Photo après"
											]
										})]
									}),
									it.status !== "terminee" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => advance(it.id),
										className: "mt-3 w-full rounded-xl bg-eco px-3 py-2 text-xs font-bold text-white hover:bg-eco/90",
										children: it.status === "planifiee" ? "Démarrer l'intervention" : "Valider & clôturer"
									})
								]
							}, it.id))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: [
		"agent",
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	title: "Interventions sur le terrain",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterventionsPage, {})
});
//#endregion
export { SplitComponent as component };
