import { o as __toESM } from "../_runtime.mjs";
import { a as insertReport, c as readDb, l as updateReport, n as DB_EVT, o as logAudit } from "./ecokin-db-BKLrlUs1.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-reports-Bt4dbIW_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
//#endregion
export { useAgentTracking as a, pushLiveReport as i, TEAMS_LIST as n, useLiveReports as o, URGENCY_META as r, STATUS_META as t };
