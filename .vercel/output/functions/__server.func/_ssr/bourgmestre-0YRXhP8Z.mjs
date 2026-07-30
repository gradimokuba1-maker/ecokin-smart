import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { $ as FileDown, N as Percent, d as TriangleAlert, ht as Building, lt as CircleCheck, pt as ChartColumn } from "../_libs/lucide-react.mjs";
import { a as YAxis, l as CartesianGrid, m as Tooltip, o as XAxis, p as ResponsiveContainer, r as BarChart, u as Bar } from "../_libs/recharts+[...].mjs";
import { R as Button, m as COMMUNES, p as COLLECTION_POINTS } from "./router-C5nfmudE.mjs";
import { h as useAccess } from "./access-store-LTdRjLvC.mjs";
import { c as useLiveReports, i as URGENCY_META, n as SiteNav, t as STATUS_META } from "./site-nav-7GSWuwOx.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-UWDiz1-u.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CeDh1Ly7.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-Cm2aS8QX.mjs";
import { t as ClientOnly } from "./client-only-DU1fAtk9.mjs";
import { t as InteractiveMap } from "./interactive-map-CRk6pmzq.mjs";
import { t as useAuthorityLocalStore } from "./authority-local-store-lC9KlhLU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bourgmestre-0YRXhP8Z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WasteReports({ reports, limit = 10 }) {
	const visible = [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
							children: "ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commune" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Catégorie" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Urgence" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Statut" })
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visible.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border/60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 font-mono text-xs",
						children: report.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "capitalize",
						children: report.commune
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "capitalize",
						children: report.category
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[report.urgency]?.bg} ${URGENCY_META[report.urgency]?.color}`,
						children: URGENCY_META[report.urgency]?.label
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_META[report.status]?.color}`,
						children: STATUS_META[report.status]?.label
					}) })
				]
			}, report.id)) })]
		})
	});
}
function KpiCard({ item }) {
	const Icon = item.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex items-center justify-between pb-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-sm font-medium",
			children: item.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: item.color + " size-5" })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-2xl font-bold",
		children: item.value
	}) })] });
}
function EvolutionChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 250,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					stroke: "hsl(var(--border))",
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "name",
					stroke: "hsl(var(--muted-foreground))",
					fontSize: 12,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					stroke: "hsl(var(--muted-foreground))",
					fontSize: 12,
					tickLine: false,
					axisLine: false,
					allowDecimals: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					cursor: { fill: "hsl(var(--accent))" },
					contentStyle: {
						background: "hsl(var(--background))",
						border: "1px solid hsl(var(--border))",
						borderRadius: "var(--radius)"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "créés",
					fill: "hsl(var(--primary))",
					radius: [
						4,
						4,
						0,
						0
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "résolus",
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
function BourgmestreCharts({ reports }) {
	const dailyData = (0, import_react.useMemo)(() => {
		return Array.from({ length: 7 }, (_, i) => {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() - i);
			const dayStr = d.toISOString().slice(0, 10);
			return {
				name: i === 0 ? "Auj." : i === 1 ? "Hier" : d.toLocaleDateString("fr-FR", { weekday: "short" }),
				créés: reports.filter((r) => r.createdAt.startsWith(dayStr)).length,
				résolus: reports.filter((r) => r.status === "terminee" && r.history.find((h) => h.label.startsWith("Statut →"))?.at?.startsWith(dayStr)).length
			};
		}).reverse();
	}, [reports]);
	const monthlyData = (0, import_react.useMemo)(() => {
		return Array.from({ length: 6 }, (_, i) => {
			const d = /* @__PURE__ */ new Date();
			d.setMonth(d.getMonth() - i);
			const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
			return {
				name: d.toLocaleDateString("fr-FR", {
					month: "short",
					year: "2-digit"
				}),
				créés: reports.filter((r) => r.createdAt.startsWith(monthStr)).length,
				résolus: reports.filter((r) => r.status === "terminee" && r.history.find((h) => h.label.startsWith("Statut →"))?.at?.startsWith(monthStr)).length
			};
		}).reverse();
	}, [reports]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-5 text-eco" }), " Évolution des performances"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Suivi des signalements créés et résolus sur différentes périodes." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		defaultValue: "daily",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
				value: "daily",
				children: "Quotidien (7j)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
				value: "monthly",
				children: "Mensuel (6m)"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "daily",
				className: "pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvolutionChart, { data: dailyData })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "monthly",
				className: "pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvolutionChart, { data: monthlyData })
			})
		]
	}) })] });
}
function RecentReportsTable({ reports }) {
	const recentReports = (0, import_react.useMemo)(() => {
		return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
	}, [reports]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Derniers signalements" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Suivi des 10 dernières interventions enregistrées dans la commune." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WasteReports, { reports: recentReports })
	}) })] });
}
function LocalManagement({ commune }) {
	const store = useAuthorityLocalStore();
	const [pme, setPme] = (0, import_react.useState)({
		name: "",
		manager: "",
		phone: ""
	});
	const [team, setTeam] = (0, import_react.useState)({
		name: "",
		pmeId: ""
	});
	const [agent, setAgent] = (0, import_react.useState)({
		name: "",
		phone: "",
		teamId: ""
	});
	const [activity, setActivity] = (0, import_react.useState)({
		label: "",
		teamId: "",
		agentId: "",
		status: "planifiee"
	});
	const pmes = store.pmes.filter((item) => item.commune === commune);
	const teams = store.teams.filter((item) => item.commune === commune);
	const agents = store.agents.filter((item) => item.commune === commune);
	const activities = store.activities.filter((item) => item.commune === commune);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Gestion locale" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "PME, équipes et agents actifs uniquement dans votre commune." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2 sm:grid-cols-4",
					onSubmit: (event) => {
						event.preventDefault();
						if (!pme.name.trim()) return;
						store.addPme({
							...pme,
							commune
						});
						setPme({
							name: "",
							manager: "",
							phone: ""
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm sm:col-span-2",
							placeholder: "PME de collecte",
							value: pme.name,
							onChange: (e) => setPme({
								...pme,
								name: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm",
							placeholder: "Responsable",
							value: pme.manager,
							onChange: (e) => setPme({
								...pme,
								manager: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "rounded-lg bg-eco px-3 py-2 text-sm font-bold text-white",
							children: "Enregistrer PME"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2 sm:grid-cols-4",
					onSubmit: (event) => {
						event.preventDefault();
						if (!team.name.trim()) return;
						store.addTeam({
							...team,
							commune,
							pmeId: team.pmeId || void 0
						});
						setTeam({
							name: "",
							pmeId: ""
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm sm:col-span-2",
							placeholder: "Équipe de collecte",
							value: team.name,
							onChange: (e) => setTeam({
								...team,
								name: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm",
							value: team.pmeId,
							onChange: (e) => setTeam({
								...team,
								pmeId: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "PME"
							}), pmes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.id,
								children: item.name
							}, item.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "rounded-lg bg-eco px-3 py-2 text-sm font-bold text-white",
							children: "Créer équipe"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2 sm:grid-cols-4",
					onSubmit: (event) => {
						event.preventDefault();
						if (!agent.name.trim()) return;
						store.addAgent({
							...agent,
							commune,
							teamId: agent.teamId || void 0
						});
						setAgent({
							name: "",
							phone: "",
							teamId: ""
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm",
							placeholder: "Nom agent",
							value: agent.name,
							onChange: (e) => setAgent({
								...agent,
								name: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm",
							placeholder: "Téléphone",
							value: agent.phone,
							onChange: (e) => setAgent({
								...agent,
								phone: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm",
							value: agent.teamId,
							onChange: (e) => setAgent({
								...agent,
								teamId: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Équipe"
							}), teams.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.id,
								children: item.name
							}, item.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "rounded-lg bg-eco px-3 py-2 text-sm font-bold text-white",
							children: "Ajouter agent"
						})
					]
				})
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Activités et effectifs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Suivi des activités réalisées par équipe et par agent." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2 sm:grid-cols-4",
					onSubmit: (event) => {
						event.preventDefault();
						if (!activity.label.trim()) return;
						store.addActivity({
							...activity,
							commune,
							teamId: activity.teamId || void 0,
							agentId: activity.agentId || void 0
						});
						setActivity({
							label: "",
							teamId: "",
							agentId: "",
							status: "planifiee"
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm sm:col-span-2",
							placeholder: "Activité",
							value: activity.label,
							onChange: (e) => setActivity({
								...activity,
								label: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "rounded-lg border bg-background px-3 py-2 text-sm",
							value: activity.teamId,
							onChange: (e) => setActivity({
								...activity,
								teamId: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Équipe"
							}), teams.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.id,
								children: item.name
							}, item.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "rounded-lg bg-eco px-3 py-2 text-sm font-bold text-white",
							children: "Ajouter activité"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "PME"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xl font-bold",
								children: pmes.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Équipes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xl font-bold",
								children: teams.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Agents"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xl font-bold",
								children: agents.length
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-64 overflow-auto rounded-xl border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
						className: "w-full text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [agents.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-semibold",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-mono text-xs",
								children: item.uniqueNumber
							})]
						}, item.id)), activities.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b bg-muted/30",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-xs capitalize",
								children: item.status
							})]
						}, item.id))] })
					})
				})
			]
		})] })]
	});
}
function BourgmestreDashboard() {
	const { session } = useAccess();
	const { items: liveReports } = useLiveReports();
	const localStore = useAuthorityLocalStore();
	const communeName = (0, import_react.useMemo)(() => COMMUNES.find((c) => c.id === session.commune), [session.commune])?.name ?? session.commune ?? "Commune";
	const communeReports = (0, import_react.useMemo)(() => session.commune ? liveReports.filter((r) => r.commune === session.commune) : [], [liveReports, session.commune]);
	const kpiData = (0, import_react.useMemo)(() => {
		const en_attente = communeReports.filter((r) => r.status === "en_attente").length;
		const resolus = communeReports.filter((r) => r.status === "terminee").length;
		const total = communeReports.length;
		const volume = communeReports.reduce((sum, report) => sum + (report.volumeM3 ?? 0), 0);
		const poidsTotal = communeReports.reduce((sum, report) => sum + (report.weightTons ?? 0), 0);
		const critiques = communeReports.filter((r) => r.priorityLevel === "critique" || r.urgency === "critique").length;
		const pmes = localStore.pmes.filter((item) => item.commune === session.commune).length;
		const teams = localStore.teams.filter((item) => item.commune === session.commune).length;
		const agents = localStore.agents.filter((item) => item.commune === session.commune).length;
		localStore.activities.filter((item) => item.commune === session.commune).length;
		const tauxCollecte = total > 0 ? Math.round(resolus / total * 100) : 0;
		return [
			{
				title: "Volume total",
				value: `${Math.round(volume)} m³`,
				icon: CircleCheck,
				color: "text-green-500"
			},
			{
				title: "Poids estimé",
				value: `${poidsTotal.toFixed(1)} t`,
				icon: TriangleAlert,
				color: "text-yellow-500"
			},
			{
				title: "Signalements critiques",
				value: String(critiques),
				icon: TriangleAlert,
				color: "text-red-500"
			},
			{
				title: "Équipes actives",
				value: String(teams),
				icon: Building,
				color: "text-blue-500"
			},
			{
				title: "PME partenaires",
				value: String(pmes),
				icon: Building,
				color: "text-eco"
			},
			{
				title: "Agents actifs",
				value: String(agents),
				icon: CircleCheck,
				color: "text-indigo-500"
			},
			{
				title: "Signalements en attente",
				value: String(en_attente),
				icon: TriangleAlert,
				color: "text-orange-500"
			},
			{
				title: "Taux de collecte",
				value: `${tauxCollecte}%`,
				icon: Percent,
				color: "text-indigo-500"
			}
		];
	}, [
		communeReports,
		(0, import_react.useMemo)(() => session.commune ? COLLECTION_POINTS.filter((p) => p.commune === session.commune) : [], [session.commune]),
		localStore,
		session.commune
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
            @media print { .no-print { display: none !important; } body { background: white !important; } .container { max-width: 100% !important; padding: 0 !important; } }
        ` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "container py-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "size-4" }), " Espace Bourgmestre"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "font-display text-4xl font-bold",
								children: ["Tableau de Bord · ", communeName]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: "Vue d'ensemble des opérations et de la propreté de votre commune."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => window.print(),
								className: "no-print",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-2 size-4" }), " Télécharger le rapport"]
							})]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container py-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
							children: kpiData.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, { item }, item.title))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: ["Carte Opérationnelle · ", communeName] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Visualisation des signalements et infrastructures de la commune." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
									fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[400px] animate-pulse rounded-lg bg-muted" }),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InteractiveMap, {
										commune: session.commune,
										reports: communeReports
									})
								}) })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BourgmestreCharts, { reports: communeReports }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentReportsTable, { reports: communeReports })
							]
						}),
						session.commune && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalManagement, { commune: session.commune })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	})] });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: ["bourgmestre"],
	title: "Tableau de Bord Bourgmestre",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BourgmestreDashboard, {})
});
//#endregion
export { SplitComponent as component };
