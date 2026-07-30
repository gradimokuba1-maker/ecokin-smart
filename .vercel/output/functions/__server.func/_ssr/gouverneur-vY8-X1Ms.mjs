import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { N as Percent, O as Recycle, X as Funnel, d as TriangleAlert, l as Trophy, lt as CircleCheck, m as Trash2, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { a as YAxis, d as Pie, f as Cell, h as Legend, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer, r as BarChart, s as Area, t as AreaChart, u as Bar } from "../_libs/recharts+[...].mjs";
import { I as WASTE_CATEGORIES, U as DEFAULT_CITY, m as COMMUNES, p as COLLECTION_POINTS } from "./router-C5nfmudE.mjs";
import { _ as useEcokinDb } from "./access-store-LTdRjLvC.mjs";
import { c as useLiveReports, i as URGENCY_META, n as SiteNav, o as useAgentTracking } from "./site-nav-7GSWuwOx.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-UWDiz1-u.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CEHf6yjo.mjs";
import { a as illegalDumpCount, c as reportVolume, l as reportWeight, n as authorityPerformance, o as pendingReports, r as environmentalIndicators, s as recycledVolume, t as agentPerformance, u as reportsByQuarter } from "./dashboard-analytics-Cn2yFHhu.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CeDh1Ly7.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-Cm2aS8QX.mjs";
import { t as useAuthorityLocalStore } from "./authority-local-store-lC9KlhLU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gouverneur-vY8-X1Ms.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var periodOptions = [
	{
		value: "all",
		label: "Toute période"
	},
	{
		value: "24h",
		label: "Dernières 24h"
	},
	{
		value: "7d",
		label: "7 derniers jours"
	},
	{
		value: "30d",
		label: "30 derniers jours"
	}
];
var urgencyOptions = [{
	value: "all",
	label: "Toute priorité"
}, ...Object.entries(URGENCY_META).map(([value, { label }]) => ({
	value,
	label: `Priorité ${label}`
}))];
var categoryOptions = [{
	value: "all",
	label: "Tout type de déchet"
}, ...WASTE_CATEGORIES.map((c) => ({
	value: c.id,
	label: c.label
}))];
/**
* Renders children only on the client-side.
* @param {object} props
* @param {React.ReactNode} props.children The children to render on the client.
* @param {React.ReactNode} [props.fallback=null] The fallback to render on the server.
*/
function ClientOnly({ children, fallback = null }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	if (!mounted) return fallback;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: children() });
}
function KpiCard({ item }) {
	const Icon = item.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-row items-center justify-between space-y-0 pb-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-sm font-medium",
			children: item.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${item.color}` })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-2xl font-bold",
		children: item.value
	}) })] });
}
var URGENCY_HEX_COLORS = {
	faible: "#10b981",
	moyen: "#f59e0b",
	eleve: "#f97316",
	critique: "#ef4444"
};
var CATEGORY_ICONS = {
	plastique: "🧴",
	organique: "🍃",
	menager: "🗑",
	electronique: "🔌",
	medical: "⚕",
	construction: "🧱",
	metal: "⚙",
	verre: "🍾",
	mixte: "♻"
};
function GovernorMap({ reports }) {
	const containerRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const reportsLayerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			const L = (await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.n()))).default;
			await import("./leaflet-BtgLLS8b.mjs").then((n) => n.t).then((n) => n.t);
			if (cancelled || !containerRef.current) return;
			const map = L.map(containerRef.current, {
				zoomControl: true,
				scrollWheelZoom: true
			}).setView(DEFAULT_CITY.center, DEFAULT_CITY.defaultZoom);
			map.setMaxBounds(L.latLngBounds(DEFAULT_CITY.bounds[0], DEFAULT_CITY.bounds[1]).pad(.16));
			L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
				attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
				maxZoom: 19
			}).addTo(map);
			COMMUNES.forEach((c) => {
				L.circle(c.center, {
					radius: 1700,
					color: "#10b981",
					weight: 1.5,
					opacity: .4,
					fillOpacity: .06,
					dashArray: "5 5"
				}).bindTooltip(`Commune de ${c.name}`, { direction: "top" }).addTo(map);
			});
			COLLECTION_POINTS.forEach((cp) => {
				const bgColor = {
					regroupement: "#0ea5e9",
					collecte: "#10b981",
					transfert: "#8b5cf6",
					valorisation: "#f59e0b",
					traitement: "#ef4444",
					tri: "#6366f1",
					recyclage: "#14b8a6"
				}[cp.kind] || "#0ea5e9";
				L.marker([cp.lat, cp.lng], { icon: L.divIcon({
					className: "",
					html: `<div style="background:${bgColor};color:#fff;width:28px;height:28px;display:grid;place-items:center;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);font:bold 13px/1 Inter,sans-serif;">♻</div>`,
					iconSize: [28, 28],
					iconAnchor: [14, 14]
				}) }).bindPopup(`<div style="min-width:200px;font-family:Inter,sans-serif">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${cp.name}</div>
              <div style="font-size:12px;color:#475569;text-transform:capitalize;">Type : ${cp.kind}</div>
              <div style="font-size:12px;color:#475569;">Commune : ${COMMUNES.find((c) => c.id === cp.commune)?.name || cp.commune}</div>
            </div>`).addTo(map);
			});
			reportsLayerRef.current = L.layerGroup().addTo(map);
			mapRef.current = map;
			setTimeout(() => map.invalidateSize(), 120);
		})();
		return () => {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!reportsLayerRef.current || !mapRef.current) return;
		(async () => {
			const L = (await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.n()))).default;
			reportsLayerRef.current.clearLayers();
			reports.forEach((report) => {
				if (!report.lat || !report.lng) return;
				const urgencyColor = URGENCY_HEX_COLORS[report.urgency] || "#6b7280";
				const categoryIcon = CATEGORY_ICONS[report.category] || "📦";
				const communeName = COMMUNES.find((c) => c.id === report.commune)?.name || report.commune;
				const statusLabel = report.status === "terminee" ? "Terminée" : report.status === "en_cours" ? "En cours" : report.status === "assignee" ? "Assignée" : "En attente";
				const volume = report.volumeM3 ? `${report.volumeM3} m³` : "N/A";
				const description = report.description ? report.description.substring(0, 100) : "Aucune description";
				const radius = report.urgency === "critique" ? 12 : report.urgency === "eleve" ? 10 : report.urgency === "moyen" ? 8 : 6;
				const borderWidth = report.urgency === "critique" ? 3 : 2;
				L.circleMarker([report.lat, report.lng], {
					radius,
					color: urgencyColor,
					weight: borderWidth,
					fillColor: urgencyColor,
					fillOpacity: .85
				}).bindPopup(`
            <div style="min-width:220px;font-family:Inter,sans-serif">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span style="font-size:18px;">${categoryIcon}</span>
                <span style="font-weight:700;font-size:13px;">${report.id}</span>
              </div>
              <div style="font-size:11px;color:#475569;margin-bottom:4px;">
                <strong>Catégorie :</strong> ${report.category} · <strong>Commune :</strong> ${communeName}
              </div>
              <div style="font-size:11px;color:#475569;margin-bottom:4px;">
                <strong>Volume :</strong> ${volume} · <strong>Statut :</strong> ${statusLabel}
              </div>
              <div style="font-size:11px;color:#475569;margin-bottom:6px;">
                <strong>Description :</strong> ${description}
              </div>
              <div style="font-size:11px;color:#475569;margin-bottom:6px;">
                <strong>Date :</strong> ${new Date(report.createdAt).toLocaleDateString("fr-FR", {
					day: "2-digit",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit"
				})}
              </div>
              <div style="margin-top:4px">
                <span style="background-color:${urgencyColor};color:#fff;padding:3px 8px;border-radius:9999px;font-size:10px;font-weight:700;text-transform:uppercase;">
                  Urgence ${report.urgency}
                </span>
              </div>
            </div>
          `, {
					maxWidth: 300,
					minWidth: 220
				}).addTo(reportsLayerRef.current);
			});
		})();
	}, [reports]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: containerRef,
		className: "h-[500px] w-full overflow-hidden rounded-lg border bg-secondary"
	});
}
function PerformanceByCommuneChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 250,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			margin: {
				top: 5,
				right: 20,
				left: -10,
				bottom: 5
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					stroke: "hsl(var(--border))",
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "name",
					stroke: "hsl(var(--muted-foreground))",
					fontSize: 10,
					tickLine: false,
					axisLine: false,
					interval: 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					stroke: "hsl(var(--muted-foreground))",
					fontSize: 10,
					tickLine: false,
					axisLine: false,
					allowDecimals: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					cursor: { fill: "hsl(var(--accent))" },
					contentStyle: {
						background: "hsl(var(--background))",
						border: "1px solid hsl(var(--border))",
						borderRadius: "var(--radius)",
						fontSize: "12px"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: "12px" } }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "Signalements",
					fill: "hsl(var(--primary))",
					radius: [
						4,
						4,
						0,
						0
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "Résolus",
					fill: "hsl(var(--eco))",
					radius: [
						4,
						4,
						0,
						0
					]
				})
			]
		})
	});
}
function ReportsEvolutionChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 250,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
			data,
			margin: {
				top: 5,
				right: 20,
				left: -10,
				bottom: 5
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "colorSignalements",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "5%",
						stopColor: "hsl(var(--primary))",
						stopOpacity: .8
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "95%",
						stopColor: "hsl(var(--primary))",
						stopOpacity: 0
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					stroke: "hsl(var(--border))",
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "name",
					stroke: "hsl(var(--muted-foreground))",
					fontSize: 10,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					stroke: "hsl(var(--muted-foreground))",
					fontSize: 10,
					tickLine: false,
					axisLine: false,
					allowDecimals: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
					background: "hsl(var(--background))",
					border: "1px solid hsl(var(--border))",
					borderRadius: "var(--radius)",
					fontSize: "12px"
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "Signalements",
					stroke: "hsl(var(--primary))",
					fillOpacity: 1,
					fill: "url(#colorSignalements)"
				})
			]
		})
	});
}
function GovernorCharts({ reports }) {
	const performanceByCommune = (0, import_react.useMemo)(() => {
		return COMMUNES.map((commune) => {
			const communeReports = reports.filter((r) => r.commune === commune.id);
			return {
				name: commune.name,
				Signalements: communeReports.length,
				Résolus: communeReports.filter((r) => r.status === "terminee").length
			};
		}).filter((d) => d.Signalements > 0).sort((a, b) => b.Signalements - a.Signalements);
	}, [reports]);
	const evolutionData = (0, import_react.useMemo)(() => {
		return Array.from({ length: 30 }, (_, i) => {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() - i);
			const dayStr = d.toISOString().slice(0, 10);
			return {
				name: d.toLocaleDateString("fr-FR", {
					day: "2-digit",
					month: "short"
				}),
				Signalements: reports.filter((r) => r.createdAt.startsWith(dayStr)).length
			};
		}).reverse();
	}, [reports]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Analyse des Performances" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Visualisation des tendances et répartition des signalements." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "pl-2 pr-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "performance",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "performance",
						children: "Performance / Commune"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "evolution",
						children: "Évolution (30j)"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "performance",
					className: "pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceByCommuneChart, { data: performanceByCommune })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "evolution",
					className: "pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsEvolutionChart, { data: evolutionData })
				})
			]
		})
	})] });
}
function ResolutionTimeChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 300,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			layout: "vertical",
			margin: {
				top: 5,
				right: 30,
				left: 20,
				bottom: 5
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					stroke: "hsl(var(--border))",
					horizontal: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					type: "number",
					stroke: "hsl(var(--muted-foreground))",
					fontSize: 10,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					type: "category",
					dataKey: "name",
					stroke: "hsl(var(--muted-foreground))",
					fontSize: 10,
					tickLine: false,
					axisLine: false,
					width: 80
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					cursor: { fill: "hsl(var(--accent))" },
					contentStyle: {
						background: "hsl(var(--background))",
						border: "1px solid hsl(var(--border))",
						borderRadius: "var(--radius)",
						fontSize: "12px"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "Temps moyen (h)",
					fill: "hsl(var(--eco))",
					radius: [
						0,
						4,
						4,
						0
					]
				})
			]
		})
	});
}
var CATEGORY_COLORS = [
	"#10b981",
	"#0ea5e9",
	"#6366f1",
	"#f97316",
	"#ef4444",
	"#8b5cf6",
	"#ec4899"
];
function ReportsByCategoryChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 300,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
				data,
				dataKey: "value",
				nameKey: "name",
				cx: "50%",
				cy: "50%",
				outerRadius: 100,
				label: true,
				children: data.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }, `cell-${index}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: "12px" } })
		] })
	});
}
function GovernorStatsTab({ reports }) {
	const localStore = useAuthorityLocalStore();
	const db = useEcokinDb();
	const tracking = useAgentTracking();
	const quarterRows = (0, import_react.useMemo)(() => reportsByQuarter(reports).slice(0, 10), [reports]);
	const agentRows = (0, import_react.useMemo)(() => agentPerformance(reports, tracking.missions, db.users).slice(0, 10), [
		reports,
		tracking.missions,
		db.users
	]);
	const adminRows = (0, import_react.useMemo)(() => authorityPerformance(reports, db.users, "admin"), [reports, db.users]);
	const bourgmestreRows = (0, import_react.useMemo)(() => authorityPerformance(reports, db.users, "bourgmestre"), [reports, db.users]);
	const reportsByCategory = (0, import_react.useMemo)(() => {
		const counts = reports.reduce((acc, r) => {
			const category = r.category || "inconnu";
			acc[category] = (acc[category] || 0) + 1;
			return acc;
		}, {});
		return Object.entries(counts).map(([name, value]) => ({
			name,
			value
		})).sort((a, b) => b.value - a.value);
	}, [reports]);
	const resolutionTimeData = (0, import_react.useMemo)(() => {
		const resolutionTimesByCommune = {};
		reports.forEach((report) => {
			if (report.status === "terminee") {
				const resolutionEntry = report.history.find((h) => h.label.includes("terminee"));
				if (resolutionEntry) {
					const creationDate = new Date(report.createdAt);
					const durationHours = (new Date(resolutionEntry.at).getTime() - creationDate.getTime()) / (1e3 * 60 * 60);
					if (!resolutionTimesByCommune[report.commune]) resolutionTimesByCommune[report.commune] = [];
					resolutionTimesByCommune[report.commune].push(durationHours);
				}
			}
		});
		return Object.entries(resolutionTimesByCommune).map(([commune, durations]) => ({
			name: commune,
			"Temps moyen (h)": Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
		})).sort((a, b) => a["Temps moyen (h)"] - b["Temps moyen (h)"]);
	}, [reports]);
	const communeRows = (0, import_react.useMemo)(() => {
		return COMMUNES.map((commune) => {
			const communeReports = reports.filter((report) => report.commune === commune.id);
			const resolved = communeReports.filter((report) => report.status === "terminee").length;
			const performance = communeReports.length > 0 ? Math.round(resolved / communeReports.length * 100) : 0;
			return {
				commune,
				volume: Math.round(communeReports.reduce((sum, report) => sum + (report.volumeM3 ?? 0), 0)),
				agents: localStore.agents.filter((item) => item.commune === commune.id).length,
				pmes: localStore.pmes.filter((item) => item.commune === commune.id).length,
				teams: localStore.teams.filter((item) => item.commune === commune.id).length,
				activities: localStore.activities.filter((item) => item.commune === commune.id && item.status !== "terminee").length,
				performance
			};
		});
	}, [reports, localStore]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Indicateurs comparatifs par commune" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Vision globale du Gouverneur sur les 24 communes." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2",
										children: "Commune"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Déchets collectés" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Agents" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "PME" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Équipes" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Activités" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Performance" })
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: communeRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 font-semibold",
									children: row.commune.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [row.volume, " m³"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.agents }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.pmes }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.teams }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.activities }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-eco/10 px-2 py-0.5 text-xs font-bold text-eco",
									children: [row.performance, "%"]
								}) })
							]
						}, row.commune.id)) })]
					})
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Répartition par Catégorie de Déchet" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Distribution des signalements selon le type de déchet identifié." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsByCategoryChart, { data: reportsByCategory }) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Performances de Résolution" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Temps moyen de résolution par commune et par type d'urgence." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResolutionTimeChart, { data: resolutionTimeData }) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Signalements par quartier / zone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Classement calcule depuis les localisations enregistrees." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceByCommuneChart, { data: quarterRows }) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Performances des agents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Missions assignees, actives et terminees." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceTable, {
				rows: agentRows,
				columns: [
					"name",
					"commune",
					"assignes",
					"termines",
					"taux"
				]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Performances des administrateurs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Suivi par entite administrative." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceTable, {
				rows: adminRows,
				columns: [
					"name",
					"commune",
					"signalements",
					"resolus",
					"taux"
				]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Performances des bourgmestres" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Resultats consolides par commune." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceTable, {
				rows: bourgmestreRows,
				columns: [
					"name",
					"commune",
					"signalements",
					"resolus",
					"taux"
				]
			}) })] })
		]
	});
}
function PerformanceTable({ rows, columns }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Aucune donnee enregistree pour le moment."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b",
					children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 capitalize",
						children: column
					}, column))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-border/60",
				children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					className: "py-2",
					children: [String(row[column] ?? "-"), column === "taux" ? "%" : ""]
				}, column))
			}, String(row.id ?? index))) })]
		})
	});
}
function useKpiData(filteredReports) {
	return (0, import_react.useMemo)(() => {
		const total = filteredReports.length;
		const resolus = filteredReports.filter((r) => r.status === "terminee").length;
		const volume = reportVolume(filteredReports);
		const poidsTotal = reportWeight(filteredReports);
		const tauxCollecte = total > 0 ? Math.round(resolus / total * 100) : 0;
		const alertes = filteredReports.filter((r) => r.urgency === "critique" || r.urgency === "eleve").length;
		const interventionUrgent = filteredReports.filter((r) => r.interventionUrgent).length;
		const env = environmentalIndicators(filteredReports);
		const communeCounts = filteredReports.reduce((acc, r) => {
			acc[r.commune] = (acc[r.commune] || 0) + 1;
			return acc;
		}, {});
		const topCommune = Object.entries(communeCounts).sort((a, b) => b[1] - a[1])[0];
		return [
			{
				title: "Signalements affichés",
				value: total.toLocaleString("fr-FR"),
				icon: TriangleAlert,
				color: "text-yellow-500"
			},
			{
				title: "Signalements résolus",
				value: resolus.toLocaleString("fr-FR"),
				icon: CircleCheck,
				color: "text-green-500"
			},
			{
				title: "Volume estimé (m³)",
				value: volume.toLocaleString("fr-FR", { maximumFractionDigits: 0 }),
				icon: Trash2,
				color: "text-blue-500"
			},
			{
				title: "Poids estimé (tonnes)",
				value: `${poidsTotal.toFixed(1)} t`,
				icon: Trash2,
				color: "text-orange-500"
			},
			{
				title: "Dechets en attente",
				value: String(pendingReports(filteredReports).length),
				icon: Trash2,
				color: "text-amber-500"
			},
			{
				title: "Dechets recyclables",
				value: `${Math.round(recycledVolume(filteredReports))} m3`,
				icon: Recycle,
				color: "text-eco"
			},
			{
				title: "Depots sauvages",
				value: String(illegalDumpCount(filteredReports)),
				icon: TriangleAlert,
				color: "text-red-500"
			},
			{
				title: "Indice environnemental",
				value: `${env.cleanlinessScore}/100`,
				icon: ShieldCheck,
				color: "text-emerald-600"
			},
			{
				title: "Taux de collecte",
				value: `${tauxCollecte}%`,
				icon: Percent,
				color: "text-indigo-500"
			},
			{
				title: "Interventions urgentes",
				value: String(interventionUrgent),
				icon: TriangleAlert,
				color: "text-red-500"
			},
			{
				title: "Commune la + active",
				value: topCommune ? topCommune[0] : "N/A",
				icon: Trophy,
				color: "text-amber-500"
			},
			{
				title: "Alertes prioritaires",
				value: alertes.toLocaleString("fr-FR"),
				icon: TriangleAlert,
				color: "text-red-500"
			}
		];
	}, [filteredReports]);
}
function GovernorDashboard() {
	const { items: liveReports } = useLiveReports();
	const [filters, setFilters] = (0, import_react.useState)({
		commune: "all",
		period: "all",
		category: "all",
		urgency: "all"
	});
	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: value
		}));
	};
	const filteredReports = (0, import_react.useMemo)(() => {
		return liveReports.filter((report) => {
			if (filters.commune !== "all" && report.commune !== filters.commune) return false;
			if (filters.category !== "all" && report.category !== filters.category) return false;
			if (filters.urgency !== "all" && report.urgency !== filters.urgency) return false;
			if (filters.period !== "all") {
				const reportDate = new Date(report.createdAt);
				const now = /* @__PURE__ */ new Date();
				let days = 0;
				if (filters.period === "24h") days = 1;
				else if (filters.period === "7d") days = 7;
				else if (filters.period === "30d") days = 30;
				if (days > 0) {
					if (reportDate < /* @__PURE__ */ new Date(now.getTime() - days * 24 * 60 * 60 * 1e3)) return false;
				}
			}
			return true;
		});
	}, [liveReports, filters]);
	const kpiData = useKpiData(filteredReports);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "container py-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Espace Gouverneur"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 font-display text-4xl font-bold",
								children: "Centre de Commandement Stratégique"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: "Vue d'ensemble en temps réel de la propreté et des opérations dans la ville de Kinshasa."
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container py-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 grid grid-cols-1 gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-bold text-muted-foreground lg:col-span-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4 text-eco" }), "Filtrer les données"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filters.commune,
									onValueChange: (v) => handleFilterChange("commune", v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "all",
										children: "Toutes les communes"
									}), COMMUNES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: c.id,
										children: c.name
									}, c.id))] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filters.period,
									onValueChange: (v) => handleFilterChange("period", v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: periodOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: o.value,
										children: o.label
									}, o.value)) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filters.category,
									onValueChange: (v) => handleFilterChange("category", v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: categoryOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: o.value,
										children: o.label
									}, o.value)) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filters.urgency,
									onValueChange: (v) => handleFilterChange("urgency", v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: urgencyOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: o.value,
										children: o.label
									}, o.value)) })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
							children: kpiData.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, { item }, item.title))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							defaultValue: "overview",
							className: "mt-8 w-full",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "overview",
									children: "Vue d'ensemble"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "stats",
									children: "Statistiques Détaillées"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "overview",
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 gap-8 lg:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Carte Opérationnelle de la Ville" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Visualisation des signalements, des infrastructures et des unités mobiles." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
											fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[500px] animate-pulse rounded-lg bg-muted" }),
											children: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GovernorMap, { reports: filteredReports })
										}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GovernorCharts, { reports: filteredReports })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "stats",
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GovernorStatsTab, { reports: filteredReports })
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: ["gouverneur"],
	title: "Centre de Commandement du Gouverneur",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GovernorDashboard, {})
});
//#endregion
export { SplitComponent as component };
