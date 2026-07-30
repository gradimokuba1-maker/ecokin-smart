import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as useEcoUser } from "./site-nav-7GSWuwOx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/household-store-DHGZDWli.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var K_HH = "ecokin_household_v1";
var K_REQ = "ecokin_collection_requests_v1";
var K_BIN = "ecokin_bin_issues_v1";
var K_HIST = "ecokin_collection_history_v1";
var EVT = "ecokin:household";
function read(key) {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function write(key, list) {
	if (typeof window === "undefined") return;
	localStorage.setItem(key, JSON.stringify(list));
	window.dispatchEvent(new Event(EVT));
}
function useHouseholds() {
	const { user } = useEcoUser();
	const [households, setHouseholds] = (0, import_react.useState)([]);
	const [requests, setRequests] = (0, import_react.useState)([]);
	const [issues, setIssues] = (0, import_react.useState)([]);
	const [history, setHistory] = (0, import_react.useState)([]);
	const refresh = (0, import_react.useCallback)(() => {
		let allHouseholds = read(K_HH);
		if (user) {
			if (user.role === "bourgmestre" && user.commune) allHouseholds = allHouseholds.filter((h) => h.commune === user.commune);
		}
		setHouseholds(allHouseholds);
		setRequests(read(K_REQ));
		setIssues(read(K_BIN));
		setHistory(read(K_HIST));
	}, [user]);
	(0, import_react.useEffect)(() => {
		refresh();
		const h = () => refresh();
		window.addEventListener(EVT, h);
		window.addEventListener("storage", h);
		return () => {
			window.removeEventListener(EVT, h);
			window.removeEventListener("storage", h);
		};
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		if (read(K_HH).length === 0) {
			write(K_HH, [
				{
					id: "HH-1",
					kind: "menage",
					name: "Famille Kabongo",
					commune: "Kalamu",
					quartier: "Matonge",
					address: "123, Avenue Victoire",
					phone: "+243810000001",
					occupants: 5,
					binType: "120L",
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				},
				{
					id: "HH-2",
					kind: "pme",
					name: "Chez Mama Nseya",
					commune: "Kalamu",
					quartier: "Yolo",
					address: "456, Avenue de l'Université",
					phone: "+243810000002",
					occupants: 10,
					binType: "240L",
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				},
				{
					id: "HH-3",
					kind: "menage",
					name: "Famille Mavanga",
					commune: "Gombe",
					quartier: "Centre-ville",
					address: "789, Boulevard du 30 Juin",
					phone: "+243810000003",
					occupants: 3,
					binType: "120L",
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				}
			]);
			refresh();
		}
	}, [refresh]);
	return {
		households,
		requests,
		issues,
		history,
		registerHousehold(h) {
			const list = read(K_HH);
			const next = {
				...h,
				id: `HH-${Date.now().toString(36).toUpperCase()}`,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			write(K_HH, [next, ...list]);
			return next;
		},
		updateHousehold(id, patch) {
			write(K_HH, read(K_HH).map((x) => x.id === id ? {
				...x,
				...patch
			} : x));
		},
		removeHousehold(id) {
			write(K_HH, read(K_HH).filter((x) => x.id !== id));
		},
		createRequest(r) {
			const next = {
				...r,
				id: `RQ-${Date.now().toString(36).toUpperCase()}`,
				requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
				status: "en_attente"
			};
			write(K_REQ, [next, ...read(K_REQ)]);
			return next;
		},
		reportBinIssue(b) {
			const next = {
				...b,
				id: `BI-${Date.now().toString(36).toUpperCase()}`,
				reportedAt: (/* @__PURE__ */ new Date()).toISOString(),
				status: "signale"
			};
			write(K_BIN, [next, ...read(K_BIN)]);
			return next;
		},
		logCollection(h) {
			const next = {
				...h,
				id: `CL-${Date.now().toString(36).toUpperCase()}`,
				at: (/* @__PURE__ */ new Date()).toISOString()
			};
			write(K_HIST, [next, ...read(K_HIST)]);
			return next;
		}
	};
}
var COLLECTION_SCHEDULE = { default: {
	days: [1, 4],
	window: "06:00 – 12:00"
} };
var SORT_TIPS = [
	{
		id: "organique",
		label: "Déchets organiques",
		color: "#84cc16",
		tips: ["Épluchures, restes de repas, marc de café → bac vert (compostable)", "Éviter de mélanger avec du plastique ou du verre"]
	},
	{
		id: "plastique",
		label: "Plastiques & PET",
		color: "#0ea5e9",
		tips: ["Rincer les bouteilles, écraser pour gagner de la place", "Séparer les bouchons et étiquettes lorsqu'ils sont amovibles"]
	},
	{
		id: "papier",
		label: "Papier & carton",
		color: "#f59e0b",
		tips: ["Aplatir les cartons pour optimiser le volume", "Éviter les papiers gras ou souillés (à composter)"]
	},
	{
		id: "verre",
		label: "Verre",
		color: "#10b981",
		tips: ["Bocaux et bouteilles rincés", "Ne pas jeter d'ampoules ni de vaisselle dans ce bac"]
	},
	{
		id: "deee",
		label: "Déchets électroniques (DEEE)",
		color: "#8b5cf6",
		tips: ["Rapporter piles, chargeurs, téléphones aux points de collecte partenaires", "Ne jamais mélanger avec les ordures ménagères"]
	},
	{
		id: "dangereux",
		label: "Déchets dangereux",
		color: "#ef4444",
		tips: ["Médicaments périmés → pharmacie", "Peintures, solvants, huiles → collecte spéciale sur demande"]
	}
];
//#endregion
export { SORT_TIPS as n, useHouseholds as r, COLLECTION_SCHEDULE as t };
