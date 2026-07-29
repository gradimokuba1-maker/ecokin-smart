import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as useEcoUser, r as cn } from "./site-nav-B-Or7zPf.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/household-store-Cede4ZHx.js
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
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/input-Ck_234xc.js
var import_jsx_runtime = require_jsx_runtime();
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
//#endregion
export { Label as n, useHouseholds as r, Input as t };
