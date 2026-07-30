import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link, l as useRouterState, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { K as House, P as Menu, R as MapPin, S as ShieldAlert, St as ArrowLeft, W as Leaf, bt as Bell, m as Trash2, t as X, x as ShieldCheck, z as LogOut } from "../_libs/lucide-react.mjs";
import { A as PRIORITY_ALERTS, L as WEATHER_FORECAST, V as formatNumber } from "./router-C5nfmudE.mjs";
import { c as insertReport, d as readDb, f as updateReport, h as useAccess, i as DB_EVT, l as logAudit, m as upsertUser, o as findUserByCredentials, p as updateUser } from "./access-store-LTdRjLvC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-nav-7GSWuwOx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var K_USER = "ecokin_user_v1";
var EVT$3 = "ecokin:user";
var DEFAULT_USER = {
	id: "citoyen-anonyme",
	name: "Citoyen",
	role: "citoyen",
	points: 0,
	reports: 0,
	badges: [],
	registered: false
};
function read$3(key) {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function write$2(key, data) {
	if (typeof window === "undefined") return;
	localStorage.setItem(key, JSON.stringify(data));
	window.dispatchEvent(new Event(EVT$3));
}
function userFromRecord(record) {
	return {
		id: record.id,
		name: record.name,
		role: record.role,
		commune: record.commune,
		phone: record.phone,
		points: record.points,
		reports: record.reports,
		badges: record.badges,
		registered: true
	};
}
function readUser() {
	const stored = read$3(K_USER);
	if (!stored) return DEFAULT_USER;
	if (stored.role === "citoyen" && stored.registered && stored.id) {
		const record = findUserByCredentials("citoyen", stored.phone ?? "", "");
		if (record && record.id === stored.id) return userFromRecord(record);
	}
	return {
		...DEFAULT_USER,
		...stored
	};
}
function useEcoUser() {
	const [user, setUser] = (0, import_react.useState)(readUser);
	const refresh = (0, import_react.useCallback)(() => {
		setUser(readUser());
	}, []);
	(0, import_react.useEffect)(() => {
		refresh();
		const h = () => refresh();
		window.addEventListener(EVT$3, h);
		window.addEventListener("storage", h);
		return () => {
			window.removeEventListener(EVT$3, h);
			window.removeEventListener("storage", h);
		};
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		if (!read$3(K_USER)) {
			write$2(K_USER, DEFAULT_USER);
			refresh();
		}
	}, [refresh]);
	return {
		user,
		login(u) {
			write$2(K_USER, u);
			setUser(u);
		},
		logout() {
			if (typeof window === "undefined") return;
			localStorage.removeItem(K_USER);
			setUser(DEFAULT_USER);
			window.dispatchEvent(new Event(EVT$3));
		},
		register(input) {
			const normalizedPhone = input.phone.trim();
			if (!normalizedPhone) return false;
			const record = findUserByCredentials("citoyen", normalizedPhone, input.pin);
			const next = userFromRecord(record ? record : upsertUser({
				role: "citoyen",
				identifier: normalizedPhone,
				password: input.pin,
				name: input.name,
				phone: normalizedPhone,
				commune: input.commune,
				points: 0,
				reports: 0,
				badges: []
			}));
			write$2(K_USER, next);
			setUser(next);
			return true;
		},
		signIn(phone, pin) {
			const record = findUserByCredentials("citoyen", phone.trim(), pin);
			if (!record) return false;
			const next = userFromRecord(record);
			write$2(K_USER, next);
			setUser(next);
			return true;
		},
		spend(cost) {
			if (user.points < cost) return false;
			if (!user.registered) return false;
			const updated = updateUser(user.id, { points: user.points - cost });
			if (!updated) return false;
			const next = userFromRecord(updated);
			write$2(K_USER, next);
			setUser(next);
			return true;
		}
	};
}
var KEY$1 = "ecokin_agent_tracking_v1";
var EVT$2 = "ecokin:agent-tracking";
var MAX_TRACK = 50;
function read$2() {
	if (typeof window === "undefined") return {
		agents: [],
		missions: []
	};
	try {
		return JSON.parse(localStorage.getItem(KEY$1) ?? "{\"agents\":[],\"missions\":[]}");
	} catch {
		return {
			agents: [],
			missions: []
		};
	}
}
function write$1(state) {
	if (typeof window === "undefined") return;
	localStorage.setItem(KEY$1, JSON.stringify(state));
	window.dispatchEvent(new Event(EVT$2));
}
function updateAgentPosition(agentId, name, commune, fix) {
	const state = read$2();
	const at = (/* @__PURE__ */ new Date()).toISOString();
	const newFix = {
		...fix,
		at
	};
	const agents = state.agents.find((a) => a.id === agentId) ? state.agents.map((a) => a.id === agentId ? {
		...a,
		current: newFix,
		track: [newFix, ...a.track].slice(0, MAX_TRACK),
		lastSeenAt: at,
		name,
		commune
	} : a) : [{
		id: agentId,
		name,
		commune,
		current: newFix,
		track: [newFix],
		lastSeenAt: at
	}, ...state.agents];
	write$1({
		...state,
		agents
	});
}
function assignMission(input) {
	const state = read$2();
	const mission = {
		...input,
		status: "en_attente",
		assignedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	const missions = [mission, ...state.missions.filter((m) => m.reportId !== input.reportId)];
	write$1({
		agents: state.agents.map((a) => a.id === input.agentId ? {
			...a,
			activeMissionId: input.reportId
		} : a),
		missions
	});
	return mission;
}
function updateMissionStatus(reportId, status) {
	const state = read$2();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const missions = state.missions.map((m) => {
		if (m.reportId !== reportId) return m;
		if (status === "en_cours") return {
			...m,
			status,
			startedAt: now
		};
		if (status === "terminee") return {
			...m,
			status,
			completedAt: now
		};
		return {
			...m,
			status
		};
	});
	write$1({
		agents: missions.find((m) => m.reportId === reportId && status === "terminee") ? state.agents.map((a) => a.activeMissionId === reportId ? {
			...a,
			activeMissionId: void 0
		} : a) : state.agents,
		missions
	});
}
function useAgentTracking() {
	const [state, setState] = (0, import_react.useState)({
		agents: [],
		missions: []
	});
	(0, import_react.useEffect)(() => {
		const refresh = () => setState(read$2());
		refresh();
		window.addEventListener(EVT$2, refresh);
		window.addEventListener("storage", refresh);
		return () => {
			window.removeEventListener(EVT$2, refresh);
			window.removeEventListener("storage", refresh);
		};
	}, []);
	return {
		agents: state.agents,
		missions: state.missions,
		updatePosition: updateAgentPosition,
		assignMission,
		updateMissionStatus
	};
}
var KEY = "ecokin_notifications_v1";
var EVT$1 = "ecokin:notifications";
var MAX = 100;
function read$1() {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? "[]");
	} catch {
		return [];
	}
}
function write(list) {
	if (typeof window === "undefined") return;
	localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
	window.dispatchEvent(new Event(EVT$1));
}
function pushNotification(input) {
	const item = {
		...input,
		id: `NTF-${Date.now().toString(36).toUpperCase()}`,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		read: false
	};
	write([item, ...read$1()]);
	if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") try {
		new Notification(item.title, {
			body: item.message,
			tag: item.id
		});
	} catch {}
	return item;
}
var EVT = "ecokin:live-reports";
var TEAMS = [
	"Equipe RASKIN Matete-1",
	"Equipe RASKIN Lemba-2",
	"Equipe RASKIN Kisenso-3",
	"Cellule d'urgence Gouvernorat"
];
function read() {
	return readDb().reports;
}
function broadcast() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(EVT));
}
function pickTeam(commune) {
	return TEAMS.find((team) => team.toLowerCase().includes(commune.toLowerCase())) ?? TEAMS[3];
}
function pushLiveReport(input) {
	const item = insertReport(input);
	if (item.urgency === "critique" || item.urgency === "eleve") {
		const team = pickTeam(item.commune);
		const history = [...item.history, {
			at: (/* @__PURE__ */ new Date()).toISOString(),
			label: `Auto-assignation -> ${team}`
		}];
		Object.assign(item, {
			team,
			status: "assignee",
			history
		});
		updateReport(item.id, {
			team,
			status: "assignee",
			history
		});
	}
	broadcast();
	logAudit({
		user: input.author,
		role: input.authorRole ?? "citoyen",
		action: "report_create",
		target: item.id,
		details: `${input.category} - ${input.commune} - urgence ${item.urgency}`
	});
	pushNotification({
		kind: "report_created",
		title: "Signalement enregistre",
		message: `${item.category} - ${item.commune} - urgence ${item.urgency}`,
		targetId: item.id,
		meta: { greenPoints: item.greenPointsAwarded ?? 0 }
	});
	if (item.status === "assignee" && item.team) pushNotification({
		kind: "agent_assigned",
		title: "Mission affectee",
		message: `${item.id} assigne a ${item.team}`,
		targetId: item.id
	});
	return item;
}
function update(id, patch, logMsg) {
	updateReport(id, patch, logMsg);
	broadcast();
}
function ackLiveReport(id, by) {
	update(id, {
		ack: true,
		ackBy: by,
		ackAt: (/* @__PURE__ */ new Date()).toISOString()
	}, `Acquitte par ${by}`);
	logAudit({
		user: by,
		role: "autorité",
		action: "report_ack",
		target: id
	});
}
function assignLiveReport(id, team, by) {
	update(id, {
		team,
		status: "assignee"
	}, `Assigne a ${team}`);
	logAudit({
		user: by,
		role: "autorité",
		action: "report_assign",
		target: id,
		details: team
	});
	pushNotification({
		kind: "agent_assigned",
		title: "Agent affecte",
		message: `${id} assigne a ${team}`,
		targetId: id
	});
}
function assignLiveReportToAgent(id, agentId, agentName, team, by) {
	const report = read().find((item) => item.id === id);
	update(id, {
		team,
		status: "assignee",
		assignedAgentId: agentId,
		assignedAgentName: agentName
	}, `Assigne a ${agentName} (${team})`);
	logAudit({
		user: by,
		role: "autorité",
		action: "report_assign",
		target: id,
		details: `${agentName} - ${team}`
	});
	if (report) assignMission({
		reportId: id,
		agentId,
		agentName,
		commune: report.commune,
		category: report.category,
		team
	});
	pushNotification({
		kind: "mission_assigned",
		title: "Mission assignee",
		message: `${agentName} a recu la mission ${id}`,
		targetId: id,
		meta: { agent: agentName }
	});
}
function setLiveStatus(id, status, by) {
	update(id, { status }, `Statut -> ${status}`);
	logAudit({
		user: by,
		role: "autorité",
		action: "report_status",
		target: id,
		details: status
	});
	pushNotification({
		kind: status === "terminee" ? "intervention_completed" : "status_changed",
		title: status === "terminee" ? "Intervention terminee" : "Statut mis a jour",
		message: `${id} -> ${{
			en_attente: "En attente",
			assignee: "Assignee",
			en_cours: "En cours",
			terminee: "Terminee",
			rejete: "Rejete"
		}[status]}`,
		targetId: id
	});
	if (status === "en_cours") updateMissionStatus(id, "en_cours");
	if (status === "terminee") updateMissionStatus(id, "terminee");
}
function setReportPhoto(id, type, photoDataUrl, by) {
	update(id, { ...type === "before" ? { photoBefore: photoDataUrl } : { photoAfter: photoDataUrl } }, `Photo ${type === "before" ? "avant" : "apres"} ajoutee par ${by}`);
	logAudit({
		user: by,
		role: "agent",
		action: "report_photo",
		target: id,
		details: `photo_${type}`
	});
}
function useLiveReports() {
	const [items, setItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const refresh = () => setItems(read());
		refresh();
		window.addEventListener(EVT, refresh);
		window.addEventListener(DB_EVT, refresh);
		window.addEventListener("storage", refresh);
		return () => {
			window.removeEventListener(EVT, refresh);
			window.removeEventListener(DB_EVT, refresh);
			window.removeEventListener("storage", refresh);
		};
	}, []);
	return {
		items,
		ack: ackLiveReport,
		assign: assignLiveReport,
		assignToAgent: assignLiveReportToAgent,
		setStatus: setLiveStatus,
		setPhoto: setReportPhoto
	};
}
var TEAMS_LIST = TEAMS;
var URGENCY_META = {
	faible: {
		label: "Faible",
		color: "text-emerald-700",
		bg: "bg-emerald-500/10"
	},
	moyen: {
		label: "Moyen",
		color: "text-amber-700",
		bg: "bg-amber-500/10"
	},
	eleve: {
		label: "Eleve",
		color: "text-orange-700",
		bg: "bg-orange-500/10"
	},
	critique: {
		label: "Critique",
		color: "text-red-700",
		bg: "bg-red-500/10"
	}
};
var STATUS_META = {
	en_attente: {
		label: "En attente",
		color: "bg-slate-500/15 text-slate-700"
	},
	assignee: {
		label: "Assignee",
		color: "bg-blue-500/15 text-blue-700"
	},
	en_cours: {
		label: "En cours",
		color: "bg-amber-500/15 text-amber-700"
	},
	terminee: {
		label: "Terminee",
		color: "bg-emerald-500/15 text-emerald-700"
	},
	rejete: {
		label: "Rejete",
		color: "bg-red-500/15 text-red-700"
	}
};
var READ_KEY = "ecokin_alerts_read_v1";
function NotificationBell() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [readIds, setReadIds] = (0, import_react.useState)([]);
	const ref = (0, import_react.useRef)(null);
	const { items: live } = useLiveReports();
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(READ_KEY);
			if (raw) setReadIds(JSON.parse(raw));
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !("Notification" in window)) return;
		if (Notification.permission === "default") try {
			Notification.requestPermission();
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		const onClick = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, []);
	const weatherAlert = WEATHER_FORECAST.find((d) => d.floodRisk === "critique" || d.floodRisk === "eleve");
	const allAlerts = [
		...live.slice(0, 8).map((r) => ({
			id: r.id,
			level: r.urgency === "critique" ? "critique" : r.urgency === "eleve" ? "eleve" : r.urgency === "moyen" ? "moyen" : "faible",
			msg: `${URGENCY_META[r.urgency].label} · ${r.category} à ${r.commune}${r.ack ? " ✓" : ""}`,
			kind: "signalement"
		})),
		...PRIORITY_ALERTS.map((a) => ({
			id: a.id,
			level: a.level,
			msg: a.msg,
			kind: "priorité"
		})),
		...weatherAlert ? [{
			id: "weather",
			level: weatherAlert.floodRisk,
			msg: `Pluies ${weatherAlert.rainMm} mm – ${weatherAlert.day} · risque ${weatherAlert.floodRisk}`,
			kind: "météo"
		}] : []
	];
	const unread = allAlerts.filter((a) => !readIds.includes(a.id)).length;
	const markRead = () => {
		const ids = allAlerts.map((a) => a.id);
		setReadIds(ids);
		localStorage.setItem(READ_KEY, JSON.stringify(ids));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => {
				setOpen((o) => !o);
				if (!open) markRead();
			},
			className: "relative grid size-9 place-items-center rounded-full border border-border hover:bg-muted",
			"aria-label": "Alertes prioritaires",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white",
				children: unread
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border bg-kin px-4 py-3 text-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] uppercase tracking-widest text-white/60",
					children: "Notifications temps réel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display text-sm font-bold",
					children: [allAlerts.length, " notifications actives"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "max-h-96 divide-y divide-border overflow-y-auto",
				children: [allAlerts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "p-6 text-center text-xs text-muted-foreground",
					children: "Aucune notification pour l'instant."
				}), allAlerts.map((a) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3 p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid size-8 shrink-0 place-items-center rounded-lg ${a.level === "critique" ? "text-red-600 bg-red-500/10" : a.level === "eleve" ? "text-orange-600 bg-orange-500/10" : a.level === "moyen" ? "text-amber-600 bg-amber-500/10" : "text-emerald-600 bg-emerald-500/10"}`,
							children: a.kind === "signalement" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
									children: a.kind
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-[10px] font-bold uppercase tracking-widest ${a.level === "critique" ? "text-red-600" : a.level === "eleve" ? "text-orange-600" : a.level === "moyen" ? "text-amber-600" : "text-emerald-600"}`,
									children: a.level
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-foreground",
								children: a.msg
							})]
						})]
					}, a.id);
				})]
			})]
		})]
	});
}
var NAV = [{
	to: "/menagers",
	label: "Déchets ménagers",
	icon: House
}, {
	to: "/signaler",
	label: "Dépôts sauvages",
	icon: Trash2
}];
function SiteNav({ minimal } = {}) {
	const router = useRouter();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const { user } = useEcoUser();
	const { session, logout } = useAccess();
	const [open, setOpen] = (0, import_react.useState)(false);
	const isAuthority = session.role !== "citoyen";
	const authorityLink = session.role === "gouverneur" ? {
		to: "/gouverneur",
		label: "Espace Gouverneur",
		icon: ShieldCheck
	} : session.role === "bourgmestre" ? {
		to: "/bourgmestre",
		label: "Espace Bourgmestre",
		icon: ShieldCheck
	} : session.role === "admin" ? {
		to: "/admin",
		label: "Administration",
		icon: ShieldCheck
	} : session.role === "agent" ? {
		to: "/agent",
		label: "Espace Agent",
		icon: ShieldCheck
	} : null;
	const links = isAuthority ? authorityLink ? [authorityLink] : [] : NAV;
	const handleBack = () => {
		if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
		else router.navigate({ to: "/" });
	};
	if (pathname === "/") return null;
	if (minimal) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: handleBack,
				className: "inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Retour"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), " Accueil"]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: `sticky top-0 z-50 border-b backdrop-blur-md ${isAuthority ? "border-slate-800/60 bg-[linear-gradient(135deg,#071523_0%,#102f40_45%,#0f3b2a_100%)] text-white" : "border-border bg-background/85 text-foreground"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 place-items-center rounded-xl bg-eco text-white shadow-sm shadow-eco/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-xl font-bold tracking-tight",
						children: ["EcoKin ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-eco",
							children: "Smart"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleBack,
						className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-sm font-medium transition-colors ${isAuthority ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Retour"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-sm font-medium transition-colors ${isAuthority ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Accueil"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden items-center gap-2 md:flex",
					children: links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: l.to,
						className: `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`,
						activeProps: { className: isAuthority ? "text-white bg-white/10" : "text-eco bg-eco/5" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(l.icon, { className: "size-4" }),
							" ",
							l.label
						]
					}, l.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden items-center gap-3 md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-xs font-semibold ${isAuthority ? "text-emerald-300" : "text-eco"}`,
								children: [formatNumber(user.points), " GP"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-[10px] uppercase tracking-widest ${isAuthority ? "text-white/70" : "text-muted-foreground"}`,
								children: session.role === "citoyen" ? user.name : session.name
							})]
						}),
						session.role === "citoyen" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: logout,
							className: `inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold ${isAuthority ? "border-white/20 text-white/80 hover:bg-white/10" : "border-border text-muted-foreground hover:bg-muted"}`,
							title: "Se déconnecter",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-3.5" }), " Sortir"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpen((o) => !o),
					className: "md:hidden",
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border bg-background md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							handleBack();
							setOpen(false);
						},
						className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Retour"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						onClick: () => setOpen(false),
						className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), " Accueil"]
					}),
					links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: l.to,
						onClick: () => setOpen(false),
						className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`,
						activeProps: { className: isAuthority ? "text-white bg-white/10" : "text-eco bg-eco/5" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(l.icon, { className: "size-4" }),
							" ",
							l.label
						]
					}, l.to)),
					isAuthority && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							logout();
							setOpen(false);
						},
						className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Se déconnecter"]
					})
				]
			})
		})]
	});
}
//#endregion
export { pushLiveReport as a, useLiveReports as c, URGENCY_META as i, SiteNav as n, useAgentTracking as o, TEAMS_LIST as r, useEcoUser as s, STATUS_META as t };
