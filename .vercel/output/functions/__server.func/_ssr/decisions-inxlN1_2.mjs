import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { E as ScrollText } from "../_libs/lucide-react.mjs";
import { v as DECISIONS } from "./router-C5nfmudE.mjs";
import { n as SiteNav } from "./site-nav-7GSWuwOx.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-UWDiz1-u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/decisions-inxlN1_2.js
var import_jsx_runtime = require_jsx_runtime();
var etatColor = (e) => e === "terminee" ? "bg-emerald-500" : e === "en_cours" ? "bg-sky-500" : e === "planifiee" ? "bg-amber-500" : "bg-red-500";
function Page() {
	const total = DECISIONS.reduce((s, d) => s + d.budget, 0);
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, { className: "size-4" }), " Module 9 · Redevabilité"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold",
							children: "Mur des Décisions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-muted-foreground",
							children: "Chaque décision suivie publiquement : responsable, budget, avancement et résultats mesurés."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-4",
					children: [
						{
							l: "Décisions actives",
							v: DECISIONS.length.toString()
						},
						{
							l: "En cours",
							v: DECISIONS.filter((d) => d.etat === "en_cours").length + ""
						},
						{
							l: "Terminées",
							v: DECISIONS.filter((d) => d.etat === "terminee").length + ""
						},
						{
							l: "Budget total",
							v: (total / 1e6).toFixed(1) + " M CDF"
						}
					].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
							children: k.l
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-display text-2xl font-bold",
							children: k.v
						})]
					}, k.l))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: DECISIONS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-3xl border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs text-muted-foreground",
											children: d.id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${etatColor(d.etat)}`,
											children: d.etat.replace("_", " ")
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-1 font-display text-xl font-bold",
										children: d.titre
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											"Responsable : ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: d.responsable }),
											" · Lancée le ",
											d.dateLancement,
											" · Commune :",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "capitalize",
												children: d.commune
											})
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
										children: "Budget"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-display text-lg font-bold",
										children: [(d.budget / 1e6).toFixed(1), " M CDF"]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1 flex justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Avancement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-foreground",
										children: [d.avancementPct, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 overflow-hidden rounded-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-eco",
										style: { width: d.avancementPct + "%" }
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm",
								children: d.resultats
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: d.kpis.map((k, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-secondary px-3 py-1 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [k.label, " :"] }),
										" ",
										k.value
									]
								}, i))
							})
						]
					}, d.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: ["bourgmestre", "gouverneur"],
	title: "Mur des Décisions",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {})
});
//#endregion
export { SplitComponent as component };
