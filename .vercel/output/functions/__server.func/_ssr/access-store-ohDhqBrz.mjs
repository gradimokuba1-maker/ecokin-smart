import { o as __toESM } from "../_runtime.mjs";
import { _ as KINSHASA_COMMUNES, c as readDb, i as findUserByCredentials, n as DB_EVT, o as logAudit } from "./ecokin-db-CVUKc8qE.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/data-BCSEOeCK.js
var COMMUNE_COLORS = [
	"#10b981",
	"#0ea5e9",
	"#f59e0b",
	"#6366f1",
	"#ef4444",
	"#14b8a6",
	"#8b5cf6",
	"#84cc16"
];
var COMMUNES = KINSHASA_COMMUNES.map((commune, index) => ({
	...commune,
	population: "Données à consolider",
	color: COMMUNE_COLORS[index % COMMUNE_COLORS.length]
}));
var WASTE_CATEGORIES = [
	{
		id: "plastique",
		label: "Plastiques",
		color: "#0ea5e9",
		icon: "🧴"
	},
	{
		id: "organique",
		label: "Organiques",
		color: "#65a30d",
		icon: "🍃"
	},
	{
		id: "menager",
		label: "Ménagers",
		color: "#a3a3a3",
		icon: "🗑"
	},
	{
		id: "electronique",
		label: "Électroniques",
		color: "#6366f1",
		icon: "🔌"
	},
	{
		id: "medical",
		label: "Médicaux",
		color: "#ef4444",
		icon: "⚕"
	},
	{
		id: "construction",
		label: "Gravats / Construction",
		color: "#a16207",
		icon: "🧱"
	},
	{
		id: "metal",
		label: "Métal",
		color: "#94a3b8",
		icon: "⚙"
	},
	{
		id: "verre",
		label: "Verre",
		color: "#14b8a6",
		icon: "🍾"
	},
	{
		id: "mixte",
		label: "Mixtes",
		color: "#475569",
		icon: "♻"
	}
];
var REPORTS = [];
var COLLECTION_POINTS = COMMUNES.flatMap((commune, index) => {
	const [lat, lng] = commune.center;
	const offset = .002 + index % 4 * 4e-4;
	return [
		{
			id: `cp-${commune.id}-regroupement`,
			name: `Point de regroupement ${commune.name}`,
			commune: commune.id,
			lat: lat + offset,
			lng: lng - offset,
			kind: "regroupement"
		},
		{
			id: `cp-${commune.id}-collecte`,
			name: `Zone de collecte ${commune.name}`,
			commune: commune.id,
			lat: lat - offset,
			lng: lng + offset,
			kind: "collecte"
		},
		...index % 3 === 0 ? [{
			id: `cp-${commune.id}-transfert`,
			name: `Centre de transfert ${commune.name}`,
			commune: commune.id,
			lat: lat + offset * 1.6,
			lng: lng + offset,
			kind: "transfert"
		}] : [],
		...index % 4 === 0 ? [{
			id: `cp-${commune.id}-valorisation`,
			name: `Centre de valorisation ${commune.name}`,
			commune: commune.id,
			lat: lat - offset * 1.4,
			lng: lng - offset,
			kind: "valorisation"
		}] : [],
		...index % 5 === 0 ? [{
			id: `cp-${commune.id}-traitement`,
			name: `Centre de traitement ${commune.name}`,
			commune: commune.id,
			lat,
			lng: lng + offset * 1.7,
			kind: "traitement"
		}] : []
	];
});
var LEADERBOARD = [];
var REWARDS = [
	{
		id: "rw1",
		name: "Crédit Orange 1 000 CDF",
		cost: 500,
		kind: "telecom"
	},
	{
		id: "rw2",
		name: "Crédit Vodacom 2 000 CDF",
		cost: 950,
		kind: "telecom"
	},
	{
		id: "rw3",
		name: "Ticket Transco",
		cost: 2e3,
		kind: "transport"
	},
	{
		id: "rw4",
		name: "Bon Kin Marché 5 000 CDF",
		cost: 2500,
		kind: "shopping"
	},
	{
		id: "rw5",
		name: "Réduction inscription état civil",
		cost: 4e3,
		kind: "commune"
	},
	{
		id: "rw6",
		name: "Sac réutilisable EcoKin",
		cost: 1200,
		kind: "merch"
	}
];
var ALERTS = [];
var TIPS = [
	"Un sachet plastique met jusqu'à 400 ans à se décomposer dans nos caniveaux.",
	"80 % des inondations à Kinshasa sont aggravées par les déchets bloquant les caniveaux.",
	"Trier le PET (bouteilles) permet une revalorisation locale et finance la collecte.",
	"Compostez vos déchets organiques : ils représentent près de 60 % de nos poubelles.",
	"Un signalement précis (photo + position) accélère l'intervention de jusqu'à 4×."
];
var COMMUNE_KPIS = {};
var MONTHLY_TREND = [];
var FLOOD_RISK_ZONES = [];
var POIS = [
	{
		id: "ec1",
		name: "École Lumumba",
		kind: "ecole",
		lat: -4.382,
		lng: 15.33,
		commune: "matete"
	},
	{
		id: "ec2",
		name: "Lycée Bosangani",
		kind: "ecole",
		lat: -4.378,
		lng: 15.298,
		commune: "lemba"
	},
	{
		id: "ec3",
		name: "Institut Kisenso",
		kind: "ecole",
		lat: -4.414,
		lng: 15.335,
		commune: "kisenso"
	},
	{
		id: "ec4",
		name: "École Mokali",
		kind: "ecole",
		lat: -4.42,
		lng: 15.341,
		commune: "kisenso"
	},
	{
		id: "hp1",
		name: "Hôpital général Matete",
		kind: "hopital",
		lat: -4.385,
		lng: 15.332,
		commune: "matete"
	},
	{
		id: "hp2",
		name: "Centre médical Lemba",
		kind: "hopital",
		lat: -4.38,
		lng: 15.296,
		commune: "lemba"
	},
	{
		id: "hp3",
		name: "Hôpital Kisenso",
		kind: "hopital",
		lat: -4.412,
		lng: 15.338,
		commune: "kisenso"
	},
	{
		id: "mk1",
		name: "Marché Matete",
		kind: "marche",
		lat: -4.386,
		lng: 15.335,
		commune: "matete"
	},
	{
		id: "mk2",
		name: "Marché Lemba-Terminus",
		kind: "marche",
		lat: -4.379,
		lng: 15.3,
		commune: "lemba"
	},
	{
		id: "mk3",
		name: "Marché Kimpwanza",
		kind: "marche",
		lat: -4.417,
		lng: 15.34,
		commune: "kisenso"
	}
];
var ILLEGAL_DUMPS = [];
var BLOCKED_DRAINS = [];
var MAIN_ROADS = [{
	name: "Bd Lumumba",
	path: [
		[-4.37, 15.29],
		[-4.385, 15.32],
		[-4.405, 15.345]
	]
}, {
	name: "Av. By-Pass",
	path: [
		[-4.378, 15.295],
		[-4.392, 15.32],
		[-4.418, 15.342]
	]
}];
var RIVERS = [{
	name: "Rivière Matete",
	path: [
		[-4.378, 15.325],
		[-4.388, 15.334],
		[-4.4, 15.342]
	]
}, {
	name: "Bassin Kisenso",
	path: [
		[-4.41, 15.33],
		[-4.418, 15.339],
		[-4.425, 15.348]
	]
}];
var TRUCKS = [];
var WEATHER_FORECAST = [];
var IPK = {};
var INTERVENTIONS = [];
var COMMUNE_BUDGET = {};
var AI_RECOMMENDATIONS = [];
var PRIORITY_ALERTS = [];
var HOTSPOTS = [];
var COMMUNE_PERFORMANCE = {};
var DECISIONS = [];
var INTERVENTION_HISTORY = [];
var IPK_TREND = [];
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/access-store-ohDhqBrz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "ecokin_access_v1";
var ACCESS_CODES = {
	agent: "AGENT2026",
	bourgmestre: "BOURG2026",
	gouverneur: "GOUV2026",
	admin: "ADMIN2026"
};
var AUTH_USERS = {
	agent: {
		identifier: "ECOKIN-AGENT",
		password: "AGENT2026",
		label: "Agent terrain"
	},
	bourgmestre: {
		identifier: "ECOKIN-BOURG",
		password: "BOURG2026",
		label: "Bourgmestre"
	},
	gouverneur: {
		identifier: "ECOKIN-GOUV",
		password: "GOUV2026",
		label: "Cabinet du Gouverneur"
	},
	admin: {
		identifier: "ECOKIN-ADMIN",
		password: "ADMIN2026",
		label: "Administrateur communal"
	}
};
function getAuthorityDashboardPath(role) {
	switch (role) {
		case "gouverneur": return "/gouverneur";
		case "bourgmestre": return "/bourgmestre";
		case "admin": return "/admin";
		case "agent": return "/agent";
		default: return "/autorite";
	}
}
var ROUTE_ROLES = {
	"/gouverneur": ["gouverneur"],
	"/situation": [
		"agent",
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/predictif": [
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/observatoire": [
		"citoyen",
		"agent",
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/crise": ["gouverneur"],
	"/assistant-ia": [
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/decisions": [
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/interventions": [
		"agent",
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/itineraires": [
		"agent",
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/gps-flotte": [
		"agent",
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/autorites": [
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/rapports": [
		"bourgmestre",
		"gouverneur",
		"admin"
	],
	"/audit": ["admin", "gouverneur"],
	"/admin": ["admin"]
};
var ROLE_PERMISSIONS = {
	citoyen: ["signaler"],
	agent: [
		"signaler",
		"manage_fleet",
		"manage_activities"
	],
	bourgmestre: [
		"signaler",
		"export_data",
		"manage_alerts",
		"manage_activities",
		"manage_fleet",
		"moderate_reports"
	],
	gouverneur: [
		"signaler",
		"export_data",
		"manage_alerts",
		"manage_activities",
		"manage_fleet",
		"moderate_reports"
	],
	admin: [
		"signaler",
		"export_data",
		"manage_alerts",
		"manage_activities",
		"manage_fleet",
		"moderate_reports",
		"reset_data"
	]
};
var DEFAULT = {
	role: "citoyen",
	name: "Citoyen EcoKin",
	permissions: ROLE_PERMISSIONS.citoyen
};
function toSession(record, commune) {
	return {
		userId: record.id,
		role: record.role,
		name: record.name,
		province: record.province,
		city: record.city,
		commune: commune || record.commune,
		quartier: record.quartier,
		zone: record.zone,
		permissions: record.permissions ?? ROLE_PERMISSIONS[record.role]
	};
}
function read() {
	if (typeof window === "undefined") return DEFAULT;
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? {
			...DEFAULT,
			...JSON.parse(raw)
		} : DEFAULT;
	} catch {
		return DEFAULT;
	}
}
function write(session) {
	if (typeof window === "undefined") return;
	localStorage.setItem(KEY, JSON.stringify(session));
	window.dispatchEvent(new Event(DB_EVT));
}
function findAuthority(role, identifier, password) {
	const direct = findUserByCredentials(role, identifier, password);
	if (direct) return direct;
	if (identifier.trim().toUpperCase() !== "ECOKIN2026" || ACCESS_CODES[role] !== password.trim()) return void 0;
	return readDb().users.find((user) => user.role === role && user.password === ACCESS_CODES[role]);
}
function roleRequiresCommune(role) {
	return role === "agent" || role === "bourgmestre" || role === "admin";
}
function useAccess() {
	const [session, setSession] = (0, import_react.useState)(DEFAULT);
	(0, import_react.useEffect)(() => {
		const refresh = () => setSession(read());
		refresh();
		window.addEventListener(DB_EVT, refresh);
		window.addEventListener("storage", refresh);
		return () => {
			window.removeEventListener(DB_EVT, refresh);
			window.removeEventListener("storage", refresh);
		};
	}, []);
	const login = (role, identifier, password, commune) => {
		const normalizedCommune = commune?.trim();
		const record = findAuthority(role, identifier, password ?? "");
		if (!record) return false;
		if (roleRequiresCommune(role) && !(normalizedCommune || record.commune)) return false;
		const next = toSession(record, normalizedCommune);
		write(next);
		setSession(next);
		logAudit({
			user: next.name,
			role,
			action: "login"
		});
		return true;
	};
	const logout = () => {
		const prev = read();
		if (typeof window !== "undefined") {
			localStorage.removeItem(KEY);
			window.dispatchEvent(new Event(DB_EVT));
		}
		setSession(DEFAULT);
		if (prev.role !== "citoyen") logAudit({
			user: prev.name,
			role: prev.role,
			action: "logout"
		});
	};
	const loginAdmin = (identifier, password, commune) => login("admin", identifier, password, commune);
	const can = (path) => {
		const allowed = ROUTE_ROLES[path];
		if (!allowed) return true;
		return allowed.includes(session.role);
	};
	const hasPermission = (perm) => session.permissions.includes(perm);
	return {
		session,
		login,
		loginAdmin,
		logout,
		can,
		hasPermission
	};
}
//#endregion
export { TRUCKS as A, MONTHLY_TREND as C, REWARDS as D, REPORTS as E, WEATHER_FORECAST as M, RIVERS as O, MAIN_ROADS as S, PRIORITY_ALERTS as T, INTERVENTIONS as _, AI_RECOMMENDATIONS as a, IPK_TREND as b, COLLECTION_POINTS as c, COMMUNE_KPIS as d, COMMUNE_PERFORMANCE as f, ILLEGAL_DUMPS as g, HOTSPOTS as h, useAccess as i, WASTE_CATEGORIES as j, TIPS as k, COMMUNES as l, FLOOD_RISK_ZONES as m, AUTH_USERS as n, ALERTS as o, DECISIONS as p, getAuthorityDashboardPath as r, BLOCKED_DRAINS as s, ACCESS_CODES as t, COMMUNE_BUDGET as u, INTERVENTION_HISTORY as v, POIS as w, LEADERBOARD as x, IPK as y };
