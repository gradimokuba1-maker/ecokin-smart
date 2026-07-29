import { o as __toESM } from "../_runtime.mjs";
import { c as readDb, i as findUserByCredentials, n as DB_EVT, o as logAudit } from "./ecokin-db-CJricvzN.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-store-ClkdaLJp.js
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
export { useAccess as i, AUTH_USERS as n, getAuthorityDashboardPath as r, ACCESS_CODES as t };
