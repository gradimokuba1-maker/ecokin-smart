import { o as __toESM } from "../_runtime.mjs";
import { C as MONTHLY_TREND, M as WEATHER_FORECAST, T as PRIORITY_ALERTS, _ as INTERVENTIONS, a as AI_RECOMMENDATIONS, d as COMMUNE_KPIS, l as COMMUNES, u as COMMUNE_BUDGET, y as IPK } from "./access-store-BeLmIsfR.mjs";
import { t as SiteNav } from "./site-nav-BQEX1RbF.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { I as Map, Q as FileText, et as Download } from "../_libs/lucide-react.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-C5rR_hvD.mjs";
import { n as init_jspdf_es_min, t as E } from "../_libs/jspdf.mjs";
import { t as require_jspdf_plugin_autotable } from "../_libs/jspdf-autotable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rapports-CJ1f2Zhl.js
var import_jsx_runtime = require_jsx_runtime();
init_jspdf_es_min();
var import_jspdf_plugin_autotable = /* @__PURE__ */ __toESM(require_jspdf_plugin_autotable());
function header(doc, title, subtitle) {
	doc.setFillColor(11, 31, 58);
	doc.rect(0, 0, 210, 32, "F");
	doc.setTextColor(255, 255, 255);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(16);
	doc.text("EcoKin Smart", 14, 14);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.text("Ville de Kinshasa · RDC", 14, 20);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(13);
	doc.text(title, 14, 28);
	doc.setTextColor(120, 120, 120);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.text(subtitle, 196, 14, { align: "right" });
	doc.setTextColor(0, 0, 0);
}
function footer(doc) {
	const pages = doc.getNumberOfPages();
	for (let i = 1; i <= pages; i++) {
		doc.setPage(i);
		doc.setFontSize(8);
		doc.setTextColor(140, 140, 140);
		doc.text(`EcoKin Smart · Document confidentiel · ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR")}`, 14, 290);
		doc.text(`Page ${i}/${pages}`, 196, 290, { align: "right" });
	}
}
function generateReport(kind) {
	const doc = new E();
	const label = {
		quotidien: "Rapport quotidien",
		hebdomadaire: "Rapport hebdomadaire",
		mensuel: "Rapport mensuel",
		strategique: "Rapport stratégique du Gouverneur",
		carte: "Synthèse cartographique"
	}[kind];
	header(doc, label, (/* @__PURE__ */ new Date()).toLocaleString("fr-FR"));
	doc.setFontSize(11);
	doc.setFont("helvetica", "bold");
	doc.text(`Indice de Propreté de Kinshasa (IPK) : 0/100`, 14, 42);
	(0, import_jspdf_plugin_autotable.default)(doc, {
		startY: 48,
		head: [[
			"Commune",
			"IPK",
			"Tendance",
			"Signalements",
			"Collecte (t)",
			"Recyclage",
			"Risque"
		]],
		body: COMMUNES.map((c) => {
			const k = COMMUNE_KPIS[c.id];
			const i = IPK[c.id];
			return [
				c.name,
				`${i.score}/100`,
				`${i.trend >= 0 ? "+" : ""}${i.trend}`,
				k.signalements,
				`${k.collecte_t} t`,
				`${k.recyclage} %`,
				`${k.risque} %`
			];
		}),
		theme: "striped",
		headStyles: { fillColor: [
			16,
			185,
			129
		] }
	});
	let y = doc.lastAutoTable.finalY + 10;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(11);
	doc.text("Alertes prioritaires", 14, y);
	(0, import_jspdf_plugin_autotable.default)(doc, {
		startY: y + 4,
		head: [[
			"Niveau",
			"Commune",
			"Message"
		]],
		body: PRIORITY_ALERTS.map((a) => [
			a.level,
			a.commune,
			a.msg
		]),
		headStyles: { fillColor: [
			239,
			68,
			68
		] }
	});
	y = doc.lastAutoTable.finalY + 10;
	doc.setFont("helvetica", "bold");
	doc.text("Prévision météo — 7 jours", 14, y);
	(0, import_jspdf_plugin_autotable.default)(doc, {
		startY: y + 4,
		head: [[
			"Jour",
			"Température",
			"Pluie",
			"Risque inondation"
		]],
		body: WEATHER_FORECAST.map((d) => [
			d.day,
			`${d.tempC} °C`,
			`${d.rainMm} mm`,
			d.floodRisk
		]),
		headStyles: { fillColor: [
			14,
			165,
			233
		] }
	});
	y = doc.lastAutoTable.finalY + 10;
	if (y > 250) {
		doc.addPage();
		y = 20;
	}
	doc.setFont("helvetica", "bold");
	doc.text("Plan d'action recommandé (IA)", 14, y);
	(0, import_jspdf_plugin_autotable.default)(doc, {
		startY: y + 4,
		head: [[
			"#",
			"Commune",
			"Action",
			"Camions",
			"Équipes",
			"Délai"
		]],
		body: AI_RECOMMENDATIONS.map((r) => [
			r.priorite,
			r.commune,
			r.titre,
			r.camions,
			r.equipes,
			r.eta
		]),
		headStyles: { fillColor: [
			99,
			102,
			241
		] }
	});
	if (kind === "mensuel" || kind === "strategique") {
		doc.addPage();
		header(doc, label, "Annexes");
		doc.setFont("helvetica", "bold");
		doc.text("Tendance mensuelle", 14, 42);
		(0, import_jspdf_plugin_autotable.default)(doc, {
			startY: 46,
			head: [[
				"Mois",
				"Signalements",
				"Collecte (t)"
			]],
			body: MONTHLY_TREND.map((m) => [
				m.mois,
				m.signalements,
				m.collecte
			])
		});
		const y2 = doc.lastAutoTable.finalY + 10;
		doc.setFont("helvetica", "bold");
		doc.text("Budget opérationnel par commune", 14, y2);
		(0, import_jspdf_plugin_autotable.default)(doc, {
			startY: y2 + 4,
			head: [[
				"Commune",
				"Hebdo (CDF)",
				"Mensuel (CDF)",
				"Coût / tonne"
			]],
			body: COMMUNES.map((c) => {
				const b = COMMUNE_BUDGET[c.id];
				return [
					c.name,
					b.hebdo.toLocaleString("fr-FR"),
					b.mensuel.toLocaleString("fr-FR"),
					b.cout_tonne.toLocaleString("fr-FR")
				];
			})
		});
		const y3 = doc.lastAutoTable.finalY + 10;
		doc.setFont("helvetica", "bold");
		doc.text("Interventions enregistrées", 14, y3);
		(0, import_jspdf_plugin_autotable.default)(doc, {
			startY: y3 + 4,
			head: [[
				"ID",
				"Commune",
				"Type",
				"Équipe",
				"Statut",
				"Planifié"
			]],
			body: INTERVENTIONS.map((i) => [
				i.id,
				i.commune,
				i.type,
				i.team,
				i.status,
				i.scheduledAt
			])
		});
	}
	footer(doc);
	return doc;
}
function downloadReport(kind, filename) {
	generateReport(kind).save(filename ?? `ecokin-${kind}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`);
}
var reports = [
	{
		id: "rep1",
		titre: "Rapport quotidien",
		periode: "Quotidien",
		taille: "≈ 60 Ko",
		pages: 2,
		kind: "quotidien"
	},
	{
		id: "rep2",
		titre: "Rapport hebdomadaire",
		periode: "Hebdomadaire",
		taille: "≈ 90 Ko",
		pages: 3,
		kind: "hebdomadaire"
	},
	{
		id: "rep3",
		titre: "Rapport mensuel",
		periode: "Mensuel",
		taille: "≈ 140 Ko",
		pages: 5,
		kind: "mensuel"
	},
	{
		id: "rep4",
		titre: "Synthèse cartographique",
		periode: "Cartographie",
		taille: "≈ 90 Ko",
		pages: 3,
		kind: "carte"
	},
	{
		id: "rep5",
		titre: "Rapport stratégique Gouverneur",
		periode: "Stratégique",
		taille: "≈ 160 Ko",
		pages: 6,
		kind: "strategique"
	}
];
function RapportsPage() {
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
							children: "Reporting"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold tracking-tight",
							children: "Rapports automatiques"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-white/70",
							children: "Génération automatique de rapports quotidiens, hebdomadaires, mensuels, et cartes PDF pour le Gouverneur et les Bourgmestres."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
							label: "IPK Kinshasa",
							value: `0/100`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
							label: "Interventions",
							value: String(INTERVENTIONS.length)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
							label: "Communes couvertes",
							value: "24"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: "Bibliothèque des rapports"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 divide-y divide-border",
						children: reports.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-10 place-items-center rounded-xl bg-eco/10 text-eco",
									children: r.periode === "Cartographie" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: r.titre
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										r.periode,
										" · ",
										r.pages,
										" pages · ",
										r.taille
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => downloadReport(r.kind),
								className: "inline-flex items-center gap-2 rounded-xl bg-kin px-4 py-2 text-xs font-bold text-white hover:bg-kin/90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Télécharger PDF"]
							})]
						}, r.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Tile({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-border bg-card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 font-display text-3xl font-bold",
			children: value
		})]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: [
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	title: "Rapports & exports PDF",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RapportsPage, {})
});
//#endregion
export { SplitComponent as component };
