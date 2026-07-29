import { o as __toESM } from "../_runtime.mjs";
import { c as readDb, m as writeDb, s as nextId } from "./ecokin-db-BKLrlUs1.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/authority-local-store-3UHfoifR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "ecokin_authority_local_v1";
var EVT = "ecokin:authority-local";
var DEFAULT = {
	pmes: [],
	teams: [],
	agents: [],
	activities: []
};
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
