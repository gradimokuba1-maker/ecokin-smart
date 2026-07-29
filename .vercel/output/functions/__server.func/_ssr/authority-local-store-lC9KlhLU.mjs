import { o as __toESM } from "../_runtime.mjs";
import { K as writeDb, R as nextId, q as DEFAULT_CITY, z as readDb } from "./data-BCSEOeCK.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/authority-local-store-lC9KlhLU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "ecokin_authority_local_v1";
var EVT = "ecokin:authority-local";
var DEFAULT = {
	pmes: [],
	teams: [],
	agents: [],
	activities: []
};
function communeId(name, fallbackIndex) {
	return DEFAULT_CITY.communes.find((commune) => commune.name.toLowerCase() === name.toLowerCase())?.id ?? DEFAULT_CITY.communes[fallbackIndex]?.id ?? name.toLowerCase();
}
function demoState() {
	const at = (/* @__PURE__ */ new Date()).toISOString();
	const kalamu = communeId("Kalamu", 3);
	const matete = communeId("Matete", 0);
	const limete = communeId("Limete", 4);
	return {
		pmes: [{
			id: "PME-DEMO-001",
			name: "RASKIN Proprete Kalamu",
			commune: kalamu,
			manager: "Grace Mbala",
			phone: "+243810100001",
			createdAt: at
		}, {
			id: "PME-DEMO-002",
			name: "Kin Tri Services",
			commune: limete,
			manager: "Cedric Nsimba",
			phone: "+243810100002",
			createdAt: at
		}],
		teams: [
			{
				id: "EQ-DEMO-001",
				name: "Equipe RASKIN Kalamu-1",
				commune: kalamu,
				pmeId: "PME-DEMO-001",
				createdAt: at
			},
			{
				id: "EQ-DEMO-002",
				name: "Equipe RASKIN Matete-1",
				commune: matete,
				createdAt: at
			},
			{
				id: "EQ-DEMO-003",
				name: "Equipe Limete Industriel",
				commune: limete,
				pmeId: "PME-DEMO-002",
				createdAt: at
			}
		],
		agents: [
			{
				id: "AG-DEMO-001",
				uniqueNumber: `AG-${kalamu.toUpperCase()}-0001`,
				name: "Agent terrain",
				commune: kalamu,
				teamId: "EQ-DEMO-001",
				phone: "+243820000001",
				createdAt: at
			},
			{
				id: "AG-DEMO-002",
				uniqueNumber: `AG-${matete.toUpperCase()}-0001`,
				name: "Patrick Luzolo",
				commune: matete,
				teamId: "EQ-DEMO-002",
				phone: "+243820000002",
				createdAt: at
			},
			{
				id: "AG-DEMO-003",
				uniqueNumber: `AG-${limete.toUpperCase()}-0001`,
				name: "Sarah Moke",
				commune: limete,
				teamId: "EQ-DEMO-003",
				phone: "+243820000003",
				createdAt: at
			}
		],
		activities: [{
			id: "ECO-COL-000001",
			commune: kalamu,
			teamId: "EQ-DEMO-001",
			agentId: "AG-DEMO-001",
			label: "Levee rapide du point Matonge",
			status: "en_cours",
			at
		}, {
			id: "ECO-COL-000002",
			commune: matete,
			teamId: "EQ-DEMO-002",
			agentId: "AG-DEMO-002",
			label: "Collecte organique Mutoto",
			status: "planifiee",
			at
		}]
	};
}
function read() {
	if (typeof window === "undefined") return DEFAULT;
	try {
		return {
			...DEFAULT,
			...JSON.parse(localStorage.getItem(KEY) ?? "{}")
		};
	} catch {
		return DEFAULT;
	}
}
function write(next) {
	if (typeof window === "undefined") return;
	localStorage.setItem(KEY, JSON.stringify(next));
	window.dispatchEvent(new Event(EVT));
}
var id = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;
function collectionId() {
	const db = readDb();
	const generated = nextId(db, "ECO-COL");
	writeDb(db);
	return generated;
}
function useAuthorityLocalStore() {
	const [state, setState] = (0, import_react.useState)(DEFAULT);
	(0, import_react.useEffect)(() => {
		const refresh = () => setState(read());
		refresh();
		window.addEventListener(EVT, refresh);
		window.addEventListener("storage", refresh);
		return () => {
			window.removeEventListener(EVT, refresh);
			window.removeEventListener("storage", refresh);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const current = read();
		if (current.pmes.length === 0 && current.teams.length === 0 && current.agents.length === 0 && current.activities.length === 0) {
			write(demoState());
			setState(read());
		}
	}, []);
	return {
		...state,
		addPme(input) {
			const current = read();
			write({
				...current,
				pmes: [{
					...input,
					id: id("PME"),
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				}, ...current.pmes]
			});
		},
		addTeam(input) {
			const current = read();
			write({
				...current,
				teams: [{
					...input,
					id: id("EQ"),
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				}, ...current.teams]
			});
		},
		addAgent(input) {
			const current = read();
			const count = current.agents.filter((agent) => agent.commune === input.commune).length + 1;
			const uniqueNumber = `AG-${input.commune.toUpperCase()}-${String(count).padStart(4, "0")}`;
			write({
				...current,
				agents: [{
					...input,
					id: id("AG"),
					uniqueNumber,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				}, ...current.agents]
			});
		},
		addActivity(input) {
			const current = read();
			write({
				...current,
				activities: [{
					...input,
					id: collectionId(),
					at: (/* @__PURE__ */ new Date()).toISOString()
				}, ...current.activities]
			});
		}
	};
}
//#endregion
export { useAuthorityLocalStore as t };
