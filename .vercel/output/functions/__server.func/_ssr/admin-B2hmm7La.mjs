import { o as __toESM } from "../_runtime.mjs";
import { C as REWARDS, D as WASTE_CATEGORIES, G as useEcokinDb, H as upsertUser, L as logAudit, N as deleteUser, U as useAccess, V as updateUser, a as COMMUNES, o as COMMUNE_BUDGET } from "./data-BCSEOeCK.mjs";
import { c as useLiveReports, d as resetAllEcoKinData, i as URGENCY_META, l as cn, n as SiteNav, t as STATUS_META } from "./site-nav-C-JuZVHm.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as require_jsx_runtime, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as buttonVariants, t as Button } from "./button-BCR49TON.mjs";
import { C as Settings, Ct as Activity, I as Map, J as Gift, K as House, _t as Brain, a as User, bt as Bell, c as UserCog, d as TriangleAlert, m as Trash2, t as X, tt as Database, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useHouseholds, n as Label, t as Input } from "./input-DzFlecq1.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-DXhPHhxC.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CEHf6yjo.mjs";
import { i as filterReportsByScope } from "./dashboard-analytics-Cn2yFHhu.mjs";
import { a as YAxis, d as Pie, f as Cell, h as Legend, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer, r as BarChart, u as Bar } from "../_libs/recharts+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dialog-DlahTJtK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/admin-B2hmm7La.js
var KEY$1 = "ecokin_ia_learning_v1";
var DEFAULT = {
	corrections: [],
	validations: 0
};
function read$1() {
	if (typeof window === "undefined") return DEFAULT;
	try {
		const raw = localStorage.getItem(KEY$1);
		return raw ? {
			...DEFAULT,
			...JSON.parse(raw)
		} : DEFAULT;
	} catch {
		return DEFAULT;
	}
}
function write$1(s) {
	if (typeof window === "undefined") return;
	localStorage.setItem(KEY$1, JSON.stringify(s));
}
function useLearning() {
	const [store, setStore] = (0, import_react.useState)(DEFAULT);
	(0, import_react.useEffect)(() => setStore(read$1()), []);
	const validate = () => {
		setStore((s) => {
			const next = {
				...s,
				validations: s.validations + 1
			};
			write$1(next);
			return next;
		});
	};
	const correct = (c) => {
		setStore((s) => {
			const next = {
				...s,
				corrections: [c, ...s.corrections].slice(0, 200)
			};
			write$1(next);
			return next;
		});
	};
	const total = store.validations + store.corrections.length;
	return {
		store,
		validate,
		correct,
		precisionPct: total === 0 ? 92.4 : Math.min(99, Math.max(60, Math.round((store.validations + 30) / (total + 30) * 100)))
	};
}
var K_PAY = "ecokin_waste_tax_v1";
var K_RATES = "ecokin_waste_tax_rates_v1";
var EVT$1 = "ecokin:tax";
var BASE_TARIFF = {
	"120L": 5e3,
	"240L": 9e3,
	"660L": 22e3
};
var KIND_COEF = {
	menage: 1,
	pme: 1.5
};
var DEFAULT_RATES = {
	bin: { ...BASE_TARIFF },
	pmeMultiplier: KIND_COEF.pme
};
function readRates() {
	if (typeof window === "undefined") return DEFAULT_RATES;
	try {
		const saved = JSON.parse(localStorage.getItem(K_RATES) ?? "{}");
		return {
			bin: {
				...DEFAULT_RATES.bin,
				...saved.bin
			},
			pmeMultiplier: Number.isFinite(saved.pmeMultiplier) && (saved.pmeMultiplier ?? 0) > 0 ? saved.pmeMultiplier : DEFAULT_RATES.pmeMultiplier
		};
	} catch {
		return DEFAULT_RATES;
	}
}
function writeRates(rates) {
	if (typeof window === "undefined") return;
	localStorage.setItem(K_RATES, JSON.stringify(rates));
	window.dispatchEvent(new Event(EVT$1));
}
function monthlyAmount(h) {
	const rates = readRates();
	const base = rates.bin[h.binType] ?? BASE_TARIFF[h.binType] ?? 5e3;
	const occCoef = 1 + Math.max(0, h.occupants - 4) * .05;
	const kindCoef = h.kind === "pme" ? rates.pmeMultiplier : KIND_COEF.menage;
	return Math.round(base * kindCoef * occCoef);
}
function pad(n) {
	return String(n).padStart(2, "0");
}
function generateInvoices(h) {
	const start = new Date(h.createdAt);
	const now = /* @__PURE__ */ new Date();
	const list = [];
	const d = new Date(start.getFullYear(), start.getMonth(), 1);
	while (d <= now) {
		const period = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
		const due = new Date(d.getFullYear(), d.getMonth(), 15);
		list.push({
			id: `INV-${h.id}-${period}`,
			householdId: h.id,
			period,
			amountCdf: monthlyAmount(h),
			dueDate: due.toISOString(),
			status: due.getTime() < now.getTime() ? "late" : "due"
		});
		d.setMonth(d.getMonth() + 1);
	}
	return list;
}
function readPayments() {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(K_PAY) || "[]");
	} catch {
		return [];
	}
}
function writePayments(list) {
	if (typeof window === "undefined") return;
	localStorage.setItem(K_PAY, JSON.stringify(list));
	window.dispatchEvent(new Event(EVT$1));
}
function useWasteTax(household) {
	const [payments, setPayments] = (0, import_react.useState)([]);
	const [rates, setRates] = (0, import_react.useState)(DEFAULT_RATES);
	const refresh = (0, import_react.useCallback)(() => {
		setPayments(readPayments());
		setRates(readRates());
	}, []);
	(0, import_react.useEffect)(() => {
		refresh();
		const h = () => refresh();
		window.addEventListener(EVT$1, h);
		window.addEventListener("storage", h);
		return () => {
			window.removeEventListener(EVT$1, h);
			window.removeEventListener("storage", h);
		};
	}, [refresh]);
	const invoices = household ? generateInvoices(household) : [];
	const paidIds = new Set(payments.map((p) => p.invoiceId));
	const merged = invoices.map((inv) => paidIds.has(inv.id) ? {
		...inv,
		status: "paid"
	} : inv);
	const householdPayments = household ? payments.filter((p) => p.householdId === household.id) : payments;
	const totalDue = merged.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amountCdf, 0);
	const totalPaid = householdPayments.reduce((s, p) => s + p.amountCdf, 0);
	const updateRates = (nextRates) => {
		const normalized = {
			bin: {
				"120L": Math.max(0, Number(nextRates.bin["120L"]) || 0),
				"240L": Math.max(0, Number(nextRates.bin["240L"]) || 0),
				"660L": Math.max(0, Number(nextRates.bin["660L"]) || 0)
			},
			pmeMultiplier: Math.max(.1, Number(nextRates.pmeMultiplier) || DEFAULT_RATES.pmeMultiplier)
		};
		writeRates(normalized);
		setRates(normalized);
	};
	return {
		invoices: merged.sort((a, b) => a.period < b.period ? 1 : -1),
		payments: householdPayments.sort((a, b) => a.paidAt < b.paidAt ? 1 : -1),
		allPayments: payments,
		totalDue,
		totalPaid,
		rates,
		updateRates,
		pay(invoice, method, provider, reference) {
			const next = {
				id: `PAY-${Date.now().toString(36).toUpperCase()}`,
				invoiceId: invoice.id,
				householdId: invoice.householdId,
				method,
				provider,
				reference,
				amountCdf: invoice.amountCdf,
				paidAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			writePayments([next, ...readPayments()]);
			return next;
		}
	};
}
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var DEFAULT_SETTINGS = {
	profile: {
		name: "Administrateur",
		email: "admin@ecokin.cd",
		phone: "+243 900 000 000",
		title: "Super Administrateur"
	},
	platform: {
		platformName: "EcoKin Smart",
		platformDescription: "Plateforme Smart City pour la gestion intelligente des déchets sur les 24 communes de Kinshasa.",
		contactEmail: "contact@ecokin.cd",
		contactPhone: "+243 800 000 000",
		address: "Kinshasa, République Démocratique du Congo",
		website: "https://ecokin.cd",
		language: "fr",
		timezone: "Africa/Lagos",
		currency: "CDF",
		maintenanceMode: false,
		maintenanceMessage: "Plateforme en maintenance. Veuillez réessayer plus tard."
	},
	notifications: {
		emailNotifications: true,
		smsNotifications: true,
		pushNotifications: true,
		reportCreated: true,
		reportStatusChanged: true,
		crisisAlert: true,
		weeklyDigest: false,
		monthlyReport: true,
		systemAlerts: true,
		emailFrom: "noreply@ecokin.cd",
		smsProvider: "Orange Money"
	},
	security: {
		twoFactorEnabled: false,
		sessionTimeout: 60,
		maxLoginAttempts: 5,
		passwordMinLength: 8,
		requireSpecialChars: true,
		requireNumbers: true,
		ipWhitelistEnabled: false,
		ipWhitelist: [],
		auditLogRetention: 90,
		autoLogoutEnabled: true,
		autoLogoutMinutes: 30
	},
	wasteCollection: {
		collectionFrequency: {},
		defaultBinTypes: [
			"120L",
			"240L",
			"660L"
		],
		binCapacities: {
			"120L": 120,
			"240L": 240,
			"660L": 660
		},
		pmeMultiplier: 1.5,
		latePaymentPenalty: 5,
		gracePeriodDays: 15,
		collectionHours: "06:00 – 12:00",
		emergencyCollectionEnabled: true,
		minimumVolumeForEmergency: 5
	},
	gis: {
		defaultMapCenter: [-4.3317, 15.3139],
		defaultZoom: 12,
		mapProvider: "carto",
		showCollectionPoints: true,
		showRecyclingCenters: true,
		showFloodZones: true,
		showTruckTracking: true,
		clusterMarkers: true,
		heatmapEnabled: false,
		refreshInterval: 30
	},
	ai: {
		enabled: true,
		model: "google/gemini-3-flash-preview",
		apiKey: "",
		autoClassification: true,
		autoUrgencyDetection: true,
		autoAssignment: true,
		floodRiskDetection: true,
		volumeEstimation: true,
		compositionAnalysis: true,
		confidenceThreshold: 70,
		learningEnabled: true,
		maxDailyApiCalls: 1e3,
		fallbackOnError: true
	},
	backup: {
		autoBackup: true,
		backupFrequency: "daily",
		backupTime: "03:00",
		retentionDays: 30,
		includeAuditLogs: true,
		includeReports: true,
		includeHouseholds: true,
		includeSettings: true
	}
};
var KEY = "ecokin_admin_settings_v1";
var EVT = "ecokin:admin-settings";
function read() {
	if (typeof window === "undefined") return DEFAULT_SETTINGS;
	try {
		const raw = localStorage.getItem(KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				...DEFAULT_SETTINGS,
				...parsed
			};
		}
	} catch {}
	return DEFAULT_SETTINGS;
}
function write(settings) {
	if (typeof window === "undefined") return;
	localStorage.setItem(KEY, JSON.stringify(settings));
	window.dispatchEvent(new Event(EVT));
}
function useAdminSettings() {
	const [settings, setSettings] = (0, import_react.useState)(DEFAULT_SETTINGS);
	const [isLoaded, setIsLoaded] = (0, import_react.useState)(false);
	const refresh = (0, import_react.useCallback)(() => {
		setSettings(read());
		setIsLoaded(true);
	}, []);
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
	return {
		settings,
		isLoaded,
		updateSettings: (0, import_react.useCallback)((patch) => {
			setSettings((prev) => {
				const next = {
					...prev,
					...patch
				};
				write(next);
				logAudit({
					user: "Administrateur",
					role: "admin",
					action: "settings_update",
					details: `Mise à jour des paramètres: ${Object.keys(patch).join(", ")}`
				});
				return next;
			});
		}, []),
		updateSection: (0, import_react.useCallback)((section, values) => {
			setSettings((prev) => {
				const next = {
					...prev,
					[section]: {
						...prev[section],
						...values
					}
				};
				write(next);
				logAudit({
					user: "Administrateur",
					role: "admin",
					action: "settings_update",
					details: `Mise à jour: ${section}`
				});
				return next;
			});
		}, []),
		resetSettings: (0, import_react.useCallback)(() => {
			write(DEFAULT_SETTINGS);
			setSettings(DEFAULT_SETTINGS);
			logAudit({
				user: "Administrateur",
				role: "admin",
				action: "settings_update",
				details: "Réinitialisation de tous les paramètres"
			});
		}, []),
		exportSettings: (0, import_react.useCallback)(() => {
			return JSON.stringify(settings, null, 2);
		}, [settings]),
		importSettings: (0, import_react.useCallback)((json) => {
			try {
				const parsed = JSON.parse(json);
				const merged = {
					...DEFAULT_SETTINGS,
					...parsed
				};
				write(merged);
				setSettings(merged);
				logAudit({
					user: "Administrateur",
					role: "admin",
					action: "settings_update",
					details: "Importation des paramètres"
				});
				return true;
			} catch {
				return false;
			}
		}, [])
	};
}
var LANGUAGES = [
	{
		value: "fr",
		label: "Français"
	},
	{
		value: "en",
		label: "English"
	},
	{
		value: "lingala",
		label: "Lingala"
	}
];
var TIMEZONES = [
	"Africa/Lagos",
	"Africa/Kinshasa",
	"Africa/Lubumbashi",
	"UTC",
	"Europe/Paris",
	"America/New_York"
];
var MAP_PROVIDERS = [
	{
		value: "carto",
		label: "CARTO Voyager"
	},
	{
		value: "osm",
		label: "OpenStreetMap"
	},
	{
		value: "mapbox",
		label: "MapBox"
	}
];
var BACKUP_FREQUENCIES = [
	{
		value: "daily",
		label: "Quotidien"
	},
	{
		value: "weekly",
		label: "Hebdomadaire"
	},
	{
		value: "monthly",
		label: "Mensuel"
	}
];
var SMS_PROVIDERS = [
	"Orange Money",
	"Airtel Money",
	"M-Pesa (Vodacom)",
	"Africell Money",
	"Twilio",
	"AWS SNS"
];
var AI_MODELS = [
	{
		value: "google/gemini-3-flash-preview",
		label: "Google Gemini 3 Flash"
	},
	{
		value: "google/gemini-3-pro-preview",
		label: "Google Gemini 3 Pro"
	},
	{
		value: "openai/gpt-4o",
		label: "OpenAI GPT-4o"
	},
	{
		value: "openai/gpt-4o-mini",
		label: "OpenAI GPT-4o Mini"
	},
	{
		value: "anthropic/claude-3.5-sonnet",
		label: "Anthropic Claude 3.5 Sonnet"
	},
	{
		value: "meta/llama-3.1-70b",
		label: "Meta Llama 3.1 70B"
	}
];
var TABS = [
	{
		id: "overview",
		label: "Vue d'ensemble",
		icon: Activity
	},
	{
		id: "ia",
		label: "Validation IA",
		icon: Brain
	},
	{
		id: "users",
		label: "Utilisateurs & Rôles",
		icon: UserCog
	},
	{
		id: "households",
		label: "Ménages",
		icon: House
	},
	{
		id: "reports",
		label: "Signalements",
		icon: Database
	},
	{
		id: "rewards",
		label: "Récompenses",
		icon: Gift
	},
	{
		id: "settings",
		label: "Paramètres",
		icon: Settings
	}
];
function AdminPage() {
	const [tab, setTab] = (0, import_react.useState)("overview");
	const { items: reports } = useLiveReports();
	const { households } = useHouseholds();
	const { totalPaid } = useWasteTax();
	const { session } = useAccess();
	const db = useEcokinDb();
	const scopedReports = (0, import_react.useMemo)(() => filterReportsByScope(reports, session), [reports, session]);
	const totalUsers = (0, import_react.useMemo)(() => db.users.filter((user) => !session.commune || user.role === "gouverneur" || user.commune === session.commune), [db.users, session.commune]).length;
	const totalBudget = Object.values(COMMUNE_BUDGET).reduce((s, b) => s + b.mensuel, 0);
	const kpis = {
		totalUsers,
		totalReports: scopedReports.length,
		totalBudget,
		totalHouseholds: households.length,
		totalTaxPaid: totalPaid
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "size-4" }), "Espace Administrateur"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold",
							children: "Centre de Contrôle Principal"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-muted-foreground",
							children: "Gestion et supervision de l'ensemble des modules, utilisateurs et paramètres de la plateforme EcoKin Smart."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "space-y-1",
					children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setTab(t.id),
						className: `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${tab === t.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-4" }),
							" ",
							t.label
						]
					}, t.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {
							reports: scopedReports,
							kpis
						}),
						tab === "ia" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IATab, {}),
						tab === "users" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersTab, {}),
						tab === "households" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdsTab, {}),
						tab === "reports" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsTab, {}),
						tab === "rewards" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RewardsTab, {}),
						tab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsTab, {})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function ReportsByCommuneChart({ data }) {
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
					interval: 0,
					angle: -45,
					textAnchor: "end",
					height: 60
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "Signalements",
					fill: "hsl(var(--primary))",
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
var STATUS_CHART_COLORS = {
	en_attente: "#f59e0b",
	assignee: "#3b82f6",
	en_cours: "#8b5cf6",
	terminee: "#10b981",
	rejete: "#ef4444"
};
function ReportsByStatusChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 250,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
				data,
				dataKey: "value",
				nameKey: "name",
				cx: "50%",
				cy: "50%",
				outerRadius: 80,
				labelLine: false,
				label: ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
					const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
					const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x,
						y: cy + radius * Math.sin(-midAngle * (Math.PI / 180)),
						fill: "currentColor",
						textAnchor: x > cx ? "start" : "end",
						dominantBaseline: "central",
						className: "text-xs",
						children: `${(percent * 100).toFixed(0)}%`
					});
				},
				children: data.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: STATUS_CHART_COLORS[entry.name] ?? "#8884d8" }, `cell-${entry.name}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: "12px" } })
		] })
	});
}
function Overview({ kpis, reports }) {
	const reportsByCommune = (0, import_react.useMemo)(() => {
		const counts = reports.reduce((acc, r) => {
			acc[r.commune] = (acc[r.commune] || 0) + 1;
			return acc;
		}, {});
		return Object.entries(counts).map(([id, count]) => ({
			name: COMMUNES.find((c) => c.id === id)?.name || id,
			Signalements: count
		})).sort((a, b) => b.Signalements - a.Signalements);
	}, [reports]);
	const reportsByStatus = (0, import_react.useMemo)(() => {
		const counts = reports.reduce((acc, r) => {
			acc[r.status] = (acc[r.status] || 0) + 1;
			return acc;
		}, {});
		return Object.entries(counts).map(([status, count]) => ({
			name: STATUS_META[status]?.label ?? status,
			value: count
		}));
	}, [reports]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				{
					l: "Utilisateurs",
					v: kpis.totalUsers.toLocaleString("fr-FR"),
					d: "Tous rôles confondus"
				},
				{
					l: "Ménages & PME",
					v: kpis.totalHouseholds.toLocaleString("fr-FR"),
					d: "Comptes enregistrés"
				},
				{
					l: "Signalements totaux",
					v: kpis.totalReports.toLocaleString("fr-FR"),
					d: "Depuis le lancement"
				},
				{
					l: "Recettes taxe (CDF)",
					v: `${(kpis.totalTaxPaid / 1e6).toFixed(2)} M`,
					d: "Total perçu"
				}
			].map((k, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
						children: k.l
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 font-display text-2xl font-bold",
						children: k.v
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-xs text-muted-foreground",
						children: k.d
					})
				]
			}, k.l))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-4 font-display text-lg font-bold",
					children: "Répartition par commune"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsByCommuneChart, { data: reportsByCommune })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-4 font-display text-lg font-bold",
					children: "Répartition par statut"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsByStatusChart, { data: reportsByStatus })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-card p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Journal système"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2 font-mono text-xs",
				children: [
					"[06:42] IA · 142 photos analysées (lot batch_2026_06_19)",
					"[06:30] Notification push envoyée à 1 284 citoyens · Kisenso",
					"[05:58] Backup base de données : OK (124 Mo)",
					"[05:15] Synchro SIG cadastrale Kinshasa : 3 communes à jour",
					"[03:00] Tâche cron rapport mensuel : généré"
				].map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-border/60 py-1.5 text-muted-foreground",
					children: l
				}, i))
			})]
		})
	] });
}
function HouseholdsByKindChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 250,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pie, {
				data,
				dataKey: "value",
				nameKey: "name",
				cx: "50%",
				cy: "50%",
				outerRadius: 80,
				label: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: "hsl(var(--eco))" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: "hsl(var(--primary))" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: "12px" } })
		] })
	});
}
function HouseholdsTab() {
	const { households } = useHouseholds();
	const [filters, setFilters] = (0, import_react.useState)({
		q: "",
		commune: "all",
		kind: "all"
	});
	const filteredHouseholds = (0, import_react.useMemo)(() => {
		return households.filter((h) => {
			if (filters.commune !== "all" && h.commune !== filters.commune) return false;
			if (filters.kind !== "all" && h.kind !== filters.kind) return false;
			if (filters.q && !`${h.name} ${h.address} ${h.phone}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
			return true;
		});
	}, [households, filters]);
	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: value
		}));
	};
	const byKind = (0, import_react.useMemo)(() => {
		const menages = households.filter((h) => h.kind === "menage").length;
		const pme = households.filter((h) => h.kind === "pme").length;
		return [{
			name: "Ménages",
			value: menages
		}, {
			name: "PME",
			value: pme
		}];
	}, [households]);
	const byCommune = (0, import_react.useMemo)(() => {
		const counts = households.reduce((acc, h) => {
			acc[h.commune] = (acc[h.commune] || 0) + 1;
			return acc;
		}, {});
		return Object.entries(counts).map(([id, count]) => ({
			name: COMMUNES.find((c) => c.id === id)?.name || id,
			Signalements: count
		})).sort((a, b) => b.Signalements - a.Signalements);
	}, [households]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-4 font-display text-lg font-bold",
					children: "Répartition par type"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdsByKindChart, { data: byKind })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-4 font-display text-lg font-bold",
					children: "Répartition par commune"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsByCommuneChart, { data: byCommune })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "mb-4 font-display text-lg font-bold",
					children: [
						"Gestion des ménages (",
						filteredHouseholds.length,
						" / ",
						households.length,
						")"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Rechercher nom, adresse, tél...",
							value: filters.q,
							onChange: (e) => handleFilterChange("q", e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.commune,
							onValueChange: (v) => handleFilterChange("commune", v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "Toutes les communes"
							}), COMMUNES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.name,
								children: c.name
							}, c.id))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.kind,
							onValueChange: (v) => handleFilterChange("kind", v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "Tous les types"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "menage",
									children: "Ménage"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "pme",
									children: "PME"
								})
							] })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2",
										children: "Nom"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commune" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Bac" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Téléphone" })
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredHouseholds.slice(0, 100).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 font-semibold",
									children: h.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "capitalize",
									children: h.kind
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: h.commune }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: h.binType }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "font-mono text-xs",
									children: h.phone
								})
							]
						}, h.id)) })]
					})
				})
			]
		})]
	});
}
function UsersTab() {
	const db = useEcokinDb();
	const { session } = useAccess();
	const [isFormOpen, setIsFormOpen] = (0, import_react.useState)(false);
	const [editingUser, setEditingUser] = (0, import_react.useState)(null);
	const [deletingUser, setDeletingUser] = (0, import_react.useState)(null);
	const allUsers = (0, import_react.useMemo)(() => {
		return db.users.filter((user) => !session.commune || user.role === "gouverneur" || user.commune === session.commune).map((user) => ({
			...user,
			status: user.active ? "Actif" : "Inactif",
			isAuthority: user.role !== "citoyen"
		}));
	}, [db.users, session.commune]);
	const handleEdit = (user) => {
		setEditingUser(user);
		setIsFormOpen(true);
	};
	const handleCreate = () => {
		setEditingUser(null);
		setIsFormOpen(true);
	};
	const handleSave = (data) => {
		if (editingUser) {
			updateUser(editingUser.id, data);
			toast.success("Utilisateur mis à jour.");
		} else {
			upsertUser({
				role: data.role ?? "citoyen",
				name: data.name,
				identifier: data.phone || data.identifier,
				password: data.pin || data.password || "0000",
				phone: data.phone,
				commune: data.commune
			});
			toast.success("Utilisateur créé.");
		}
		setIsFormOpen(false);
	};
	const handleDelete = () => {
		if (deletingUser) {
			deleteUser(deletingUser.id);
			toast.success("Utilisateur supprimé.");
			setDeletingUser(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-display text-lg font-bold",
					children: [
						"Gestion des utilisateurs et des rôles (",
						allUsers.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleCreate,
					className: "rounded-md bg-eco px-3 py-1.5 text-xs font-bold text-white",
					children: "Créer un utilisateur"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Rôle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Nom" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Statut" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Action" })
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: allUsers.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 font-semibold capitalize",
							children: l.role
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${l.status === "Actif" ? "bg-eco/15 text-eco" : "bg-slate-500/15 text-slate-600"}`,
							children: l.status
						}) }),
						!l.isAuthority ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "space-x-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleEdit(l),
								className: "rounded-md border border-border px-2 py-1 text-xs",
								children: "Modifier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setDeletingUser(l),
								className: "rounded-md border border-border px-2 py-1 text-xs text-red-600",
								children: "Supprimer"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "text-xs text-muted-foreground",
							children: "Non modifiable"
						})
					]
				}, l.id)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserForm, {
				isOpen: isFormOpen,
				onClose: () => setIsFormOpen(false),
				onSave: handleSave,
				user: editingUser
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!deletingUser,
				onOpenChange: (open) => !open && setDeletingUser(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Confirmer la suppression" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"Êtes-vous sûr de vouloir supprimer l'utilisateur \"",
					deletingUser?.name,
					"\" ? Cette action est irréversible."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Annuler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: handleDelete,
					className: "bg-red-600 hover:bg-red-700",
					children: "Supprimer"
				})] })] })
			})
		]
	});
}
function UserForm({ isOpen, onClose, onSave, user }) {
	const [formData, setFormData] = (0, import_react.useState)({
		name: "",
		commune: "",
		phone: ""
	});
	(0, import_react.useEffect)(() => {
		if (user) setFormData({
			name: user.name,
			commune: user.commune,
			phone: user.phone
		});
		else setFormData({
			name: "",
			commune: "gombe",
			phone: ""
		});
	}, [user, isOpen]);
	const handleChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value
		}));
	};
	const handleSubmit = () => {
		onSave({
			...user,
			...formData,
			kind: user?.kind || "menage",
			occupants: user?.occupants || 1,
			binType: user?.binType || "120L"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: isOpen,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: user ? "Modifier l'utilisateur" : "Créer un utilisateur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Gérer les informations d'un compte citoyen." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Nom complet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							value: formData.name,
							onChange: (e) => handleChange("name", e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "commune",
							children: "Commune"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: formData.commune,
							onValueChange: (v) => handleChange("commune", v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COMMUNES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.id,
								children: c.name
							}, c.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "phone",
							children: "Téléphone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "phone",
							value: formData.phone,
							onChange: (e) => handleChange("phone", e.target.value)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: handleSubmit,
				children: "Enregistrer"
			})] })
		] })
	});
}
function ReportsTab() {
	const { items: reports, setStatus } = useLiveReports();
	const { session } = useAccess();
	const [filters, setFilters] = (0, import_react.useState)({
		q: "",
		commune: "all",
		status: "all",
		urgency: "all"
	});
	const filteredReports = (0, import_react.useMemo)(() => {
		return filterReportsByScope(reports, session).filter((r) => {
			if (filters.commune !== "all" && r.commune !== filters.commune) return false;
			if (filters.status !== "all" && r.status !== filters.status) return false;
			if (filters.urgency !== "all" && r.urgency !== filters.urgency) return false;
			if (filters.q && !`${r.id} ${r.description}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
			return true;
		});
	}, [
		reports,
		filters,
		session
	]);
	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: value
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: [
					"Modération des signalements (",
					filteredReports.length,
					" / ",
					reports.length,
					")"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-2 gap-2 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Rechercher ID, description...",
						value: filters.q,
						onChange: (e) => handleFilterChange("q", e.target.value)
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
						value: filters.status,
						onValueChange: (v) => handleFilterChange("status", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "Tous les statuts"
						}), Object.entries(STATUS_META).map(([key, meta]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: key,
							children: meta.label
						}, key))] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: filters.urgency,
						onValueChange: (v) => handleFilterChange("urgency", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "Toutes les urgences"
						}), Object.entries(URGENCY_META).map(([key, meta]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: key,
							children: meta.label
						}, key))] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2",
									children: "ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commune" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Urgence" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Statut" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Actions" })
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredReports.slice(0, 50).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 font-mono text-xs",
								children: r.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "capitalize",
								children: r.commune
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[r.urgency]?.bg} ${URGENCY_META[r.urgency]?.color}`,
								children: URGENCY_META[r.urgency]?.label
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_META[r.status]?.color}`,
								children: STATUS_META[r.status]?.label
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "space-x-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStatus(r.id, "terminee", session.name),
									className: "rounded-md bg-eco/10 px-2 py-1 text-xs font-semibold text-eco",
									children: "Valider"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStatus(r.id, "rejete", session.name),
									className: "rounded-md bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-600",
									children: "Rejeter"
								})]
							})
						]
					}, r.id)) })]
				})
			})
		]
	});
}
function RewardsTab() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-4 font-display text-lg font-bold",
			children: "Catalogue partenaires"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: REWARDS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold",
					children: r.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground capitalize",
					children: r.kind
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-eco",
						children: [r.cost, " GP"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "rounded-md border border-border px-2 py-1 text-xs",
						children: "Éditer"
					})]
				})]
			}, r.id))
		})]
	});
}
function SettingsTab() {
	const { settings, updateSection, resetSettings, exportSettings, importSettings } = useAdminSettings();
	const [settingsTab, setSettingsTab] = (0, import_react.useState)("profile");
	const [confirmingReset, setConfirmingReset] = (0, import_react.useState)(false);
	const [resetDone, setResetDone] = (0, import_react.useState)(false);
	const [importJson, setImportJson] = (0, import_react.useState)("");
	const [importError, setImportError] = (0, import_react.useState)("");
	const [importSuccess, setImportSuccess] = (0, import_react.useState)(false);
	const [exportCopied, setExportCopied] = (0, import_react.useState)(false);
	const SETTINGS_TABS = [
		{
			id: "profile",
			label: "Profil administrateur",
			icon: User
		},
		{
			id: "platform",
			label: "Configuration générale",
			icon: Settings
		},
		{
			id: "notifications",
			label: "Notifications",
			icon: Bell
		},
		{
			id: "security",
			label: "Sécurité",
			icon: ShieldCheck
		},
		{
			id: "waste",
			label: "Collecte des déchets",
			icon: Trash2
		},
		{
			id: "gis",
			label: "Cartographie / SIG",
			icon: Map
		},
		{
			id: "ai",
			label: "Intelligence Artificielle",
			icon: Brain
		},
		{
			id: "backup",
			label: "Sauvegarde & données",
			icon: Database
		},
		{
			id: "danger",
			label: "Zone dangereuse",
			icon: TriangleAlert
		}
	];
	const handleImport = () => {
		if (!importJson.trim()) return;
		if (importSettings(importJson)) {
			setImportSuccess(true);
			setImportError("");
			setTimeout(() => setImportSuccess(false), 3e3);
		} else setImportError("JSON invalide. Vérifiez le format.");
	};
	const handleExport = () => {
		const json = exportSettings();
		navigator.clipboard.writeText(json).then(() => {
			setExportCopied(true);
			setTimeout(() => setExportCopied(false), 3e3);
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-2",
				children: SETTINGS_TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSettingsTab(t.id),
					className: `flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${settingsTab === t.id ? "bg-eco text-white shadow-sm" : "text-muted-foreground hover:bg-muted/50"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-3.5" }), t.label]
				}, t.id))
			}),
			settingsTab === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSettings, {
				profile: settings.profile,
				onUpdate: (v) => updateSection("profile", v)
			}),
			settingsTab === "platform" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlatformSettings, {
				platform: settings.platform,
				onUpdate: (v) => updateSection("platform", v)
			}),
			settingsTab === "notifications" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationSettingsSection, {
				notifications: settings.notifications,
				onUpdate: (v) => updateSection("notifications", v)
			}),
			settingsTab === "security" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecuritySettingsSection, {
				security: settings.security,
				onUpdate: (v) => updateSection("security", v)
			}),
			settingsTab === "waste" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WasteCollectionSettingsSection, {
				waste: settings.wasteCollection,
				onUpdate: (v) => updateSection("wasteCollection", v)
			}),
			settingsTab === "gis" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GisSettingsSection, {
				gis: settings.gis,
				onUpdate: (v) => updateSection("gis", v)
			}),
			settingsTab === "ai" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiSettingsSection, {
				ai: settings.ai,
				onUpdate: (v) => updateSection("ai", v)
			}),
			settingsTab === "backup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackupSettingsSection, {
				backup: settings.backup,
				onUpdate: (v) => updateSection("backup", v)
			}),
			settingsTab === "danger" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-red-500/30 bg-red-500/5 p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mb-1 font-display text-lg font-bold text-red-700",
								children: "Réinitialisation complète de la plateforme"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Supprime tous les signalements, statistiques, ménages enregistrés, GPS flotte, notifications, journaux d'audit et sessions autorités. Les compteurs repartent à 0."
							}),
							!confirmingReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setConfirmingReset(true),
								className: "mt-4 rounded-xl border border-red-500/40 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-500/10",
								children: "Réinitialiser toutes les données"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold text-red-700",
										children: "Cette action est irréversible."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: async () => {
											resetAllEcoKinData();
											setResetDone(true);
											setTimeout(() => window.location.reload(), 800);
										},
										className: "rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white",
										children: "Confirmer la réinitialisation"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setConfirmingReset(false),
										className: "rounded-xl border border-border px-3 py-2 text-sm font-semibold",
										children: "Annuler"
									}),
									resetDone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-eco",
										children: "✓ Données remises à zéro…"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mb-1 font-display text-lg font-bold text-orange-700",
								children: "Réinitialiser les paramètres"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-sm text-muted-foreground",
								children: "Remet tous les paramètres de la plateforme à leurs valeurs par défaut."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									resetSettings();
									toast.success("Paramètres réinitialisés aux valeurs par défaut.");
								},
								className: "rounded-xl border border-orange-500/40 bg-white px-4 py-2 text-sm font-bold text-orange-700 hover:bg-orange-500/10",
								children: "Réinitialiser les paramètres"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mb-1 font-display text-lg font-bold",
								children: "Export / Import des paramètres"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-sm text-muted-foreground",
								children: "Exportez la configuration pour la sauvegarder ou importez une configuration existante."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: handleExport,
									className: "rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/50",
									children: exportCopied ? "✓ Copié dans le presse-papier" : "Exporter la configuration"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "import-json",
										children: "Importer une configuration (JSON)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "import-json",
										value: importJson,
										onChange: (e) => {
											setImportJson(e.target.value);
											setImportError("");
											setImportSuccess(false);
										},
										rows: 4,
										className: "w-full rounded-xl border border-border bg-background p-3 text-xs font-mono focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30",
										placeholder: "Collez le JSON de configuration ici..."
									}),
									importError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-red-600",
										children: importError
									}),
									importSuccess && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-eco",
										children: "✓ Configuration importée avec succès."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: handleImport,
										disabled: !importJson.trim(),
										children: "Importer"
									})
								]
							})
						]
					})
				]
			})
		]
	});
}
function ProfileSettings({ profile, onUpdate }) {
	const [form, setForm] = (0, import_react.useState)(profile);
	(0, import_react.useEffect)(() => setForm(profile), [profile]);
	const handleSave = () => {
		onUpdate(form);
		toast.success("Profil administrateur mis à jour.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Profil administrateur"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "admin-name",
							children: "Nom complet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "admin-name",
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "admin-title",
							children: "Titre / Fonction"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "admin-title",
							value: form.title,
							onChange: (e) => setForm({
								...form,
								title: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "admin-email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "admin-email",
							type: "email",
							value: form.email,
							onChange: (e) => setForm({
								...form,
								email: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "admin-phone",
							children: "Téléphone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "admin-phone",
							type: "tel",
							value: form.phone,
							onChange: (e) => setForm({
								...form,
								phone: e.target.value
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: handleSave,
				children: "Enregistrer le profil"
			})
		]
	});
}
function PlatformSettings({ platform, onUpdate }) {
	const [form, setForm] = (0, import_react.useState)(platform);
	(0, import_react.useEffect)(() => setForm(platform), [platform]);
	const handleSave = () => {
		onUpdate(form);
		toast.success("Configuration générale mise à jour.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Configuration générale de la plateforme"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-name",
							children: "Nom de la plateforme"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "platform-name",
							value: form.platformName,
							onChange: (e) => setForm({
								...form,
								platformName: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-website",
							children: "Site web"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "platform-website",
							value: form.website,
							onChange: (e) => setForm({
								...form,
								website: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-desc",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "platform-desc",
							value: form.platformDescription,
							onChange: (e) => setForm({
								...form,
								platformDescription: e.target.value
							}),
							rows: 3,
							className: "w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-email",
							children: "Email de contact"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "platform-email",
							type: "email",
							value: form.contactEmail,
							onChange: (e) => setForm({
								...form,
								contactEmail: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-phone",
							children: "Téléphone de contact"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "platform-phone",
							type: "tel",
							value: form.contactPhone,
							onChange: (e) => setForm({
								...form,
								contactPhone: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-address",
							children: "Adresse"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "platform-address",
							value: form.address,
							onChange: (e) => setForm({
								...form,
								address: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-lang",
							children: "Langue par défaut"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.language,
							onValueChange: (v) => setForm({
								...form,
								language: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: LANGUAGES.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: l.value,
								children: l.label
							}, l.value)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-tz",
							children: "Fuseau horaire"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.timezone,
							onValueChange: (v) => setForm({
								...form,
								timezone: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TIMEZONES.map((tz) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: tz,
								children: tz
							}, tz)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "platform-currency",
							children: "Devise"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "platform-currency",
							value: form.currency,
							onChange: (e) => setForm({
								...form,
								currency: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "maintenance-mode",
							checked: form.maintenanceMode,
							onCheckedChange: (v) => setForm({
								...form,
								maintenanceMode: v
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "maintenance-mode",
							className: "font-semibold text-red-600",
							children: "Mode maintenance"
						})]
					}),
					form.maintenanceMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "maintenance-msg",
							children: "Message de maintenance"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "maintenance-msg",
							value: form.maintenanceMessage,
							onChange: (e) => setForm({
								...form,
								maintenanceMessage: e.target.value
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: handleSave,
				children: "Enregistrer la configuration"
			})
		]
	});
}
function NotificationSettingsSection({ notifications, onUpdate }) {
	const [form, setForm] = (0, import_react.useState)(notifications);
	(0, import_react.useEffect)(() => setForm(notifications), [notifications]);
	const handleSave = () => {
		onUpdate(form);
		toast.success("Paramètres de notification mis à jour.");
	};
	const ToggleRow = ({ id, label, checked }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-lg border border-border px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id,
			checked,
			onCheckedChange: (v) => setForm({
				...form,
				[id]: v
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Paramètres des notifications"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-bold uppercase tracking-widest text-muted-foreground",
						children: "Canaux de notification"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "emailNotifications",
						label: "Notifications par email",
						checked: form.emailNotifications
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "smsNotifications",
						label: "Notifications par SMS",
						checked: form.smsNotifications
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "pushNotifications",
						label: "Notifications push",
						checked: form.pushNotifications
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-bold uppercase tracking-widest text-muted-foreground",
						children: "Événements"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "reportCreated",
						label: "Nouveau signalement créé",
						checked: form.reportCreated
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "reportStatusChanged",
						label: "Changement de statut d'un signalement",
						checked: form.reportStatusChanged
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "crisisAlert",
						label: "Alerte de crise / urgence",
						checked: form.crisisAlert
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "systemAlerts",
						label: "Alertes système",
						checked: form.systemAlerts
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "weeklyDigest",
						label: "Digest hebdomadaire",
						checked: form.weeklyDigest
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "monthlyReport",
						label: "Rapport mensuel",
						checked: form.monthlyReport
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "email-from",
						children: "Email expéditeur"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "email-from",
						type: "email",
						value: form.emailFrom,
						onChange: (e) => setForm({
							...form,
							emailFrom: e.target.value
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "sms-provider",
						children: "Fournisseur SMS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.smsProvider,
						onValueChange: (v) => setForm({
							...form,
							smsProvider: v
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SMS_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: p,
							children: p
						}, p)) })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: handleSave,
				children: "Enregistrer les notifications"
			})
		]
	});
}
function SecuritySettingsSection({ security, onUpdate }) {
	const [form, setForm] = (0, import_react.useState)(security);
	(0, import_react.useEffect)(() => setForm(security), [security]);
	const [newIp, setNewIp] = (0, import_react.useState)("");
	const handleSave = () => {
		onUpdate(form);
		toast.success("Paramètres de sécurité mis à jour.");
	};
	const addIp = () => {
		if (newIp && !form.ipWhitelist.includes(newIp)) {
			setForm({
				...form,
				ipWhitelist: [...form.ipWhitelist, newIp]
			});
			setNewIp("");
		}
	};
	const removeIp = (ip) => {
		setForm({
			...form,
			ipWhitelist: form.ipWhitelist.filter((i) => i !== ip)
		});
	};
	const ToggleRow = ({ id, label, checked }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-lg border border-border px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id,
			checked,
			onCheckedChange: (v) => setForm({
				...form,
				[id]: v
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Paramètres de sécurité"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "twoFactorEnabled",
						label: "Authentification à deux facteurs (2FA)",
						checked: form.twoFactorEnabled
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "autoLogoutEnabled",
						label: "Déconnexion automatique",
						checked: form.autoLogoutEnabled
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "ipWhitelistEnabled",
						label: "Liste blanche d'IP",
						checked: form.ipWhitelistEnabled
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "session-timeout",
							children: "Expiration de session (minutes)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "session-timeout",
							type: "number",
							value: form.sessionTimeout,
							onChange: (e) => setForm({
								...form,
								sessionTimeout: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "auto-logout",
							children: "Déconnexion automatique après (minutes)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "auto-logout",
							type: "number",
							value: form.autoLogoutMinutes,
							onChange: (e) => setForm({
								...form,
								autoLogoutMinutes: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "max-login",
							children: "Tentatives de connexion max"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "max-login",
							type: "number",
							value: form.maxLoginAttempts,
							onChange: (e) => setForm({
								...form,
								maxLoginAttempts: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pwd-min",
							children: "Longueur minimale du mot de passe"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pwd-min",
							type: "number",
							value: form.passwordMinLength,
							onChange: (e) => setForm({
								...form,
								passwordMinLength: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "audit-retention",
							children: "Rétention des logs d'audit (jours)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "audit-retention",
							type: "number",
							value: form.auditLogRetention,
							onChange: (e) => setForm({
								...form,
								auditLogRetention: Number(e.target.value)
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
					id: "requireSpecialChars",
					label: "Caractères spéciaux requis",
					checked: form.requireSpecialChars
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
					id: "requireNumbers",
					label: "Chiffres requis",
					checked: form.requireNumbers
				})]
			}),
			form.ipWhitelistEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Liste blanche d'IP" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: newIp,
							onChange: (e) => setNewIp(e.target.value),
							placeholder: "192.168.1.1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: addIp,
							variant: "outline",
							size: "sm",
							children: "Ajouter"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: form.ipWhitelist.map((ip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-mono",
							children: [ip, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => removeIp(ip),
								className: "text-red-500 hover:text-red-700",
								children: "×"
							})]
						}, ip))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: handleSave,
				children: "Enregistrer la sécurité"
			})
		]
	});
}
function WasteCollectionSettingsSection({ waste, onUpdate }) {
	const [form, setForm] = (0, import_react.useState)(waste);
	(0, import_react.useEffect)(() => setForm(waste), [waste]);
	const handleSave = () => {
		onUpdate(form);
		toast.success("Paramètres de collecte mis à jour.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Paramètres de collecte des déchets"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "collection-hours",
							children: "Horaires de collecte"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "collection-hours",
							value: form.collectionHours,
							onChange: (e) => setForm({
								...form,
								collectionHours: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pme-multiplier",
							children: "Coefficient PME"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pme-multiplier",
							type: "number",
							step: "0.1",
							value: form.pmeMultiplier,
							onChange: (e) => setForm({
								...form,
								pmeMultiplier: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "late-penalty",
							children: "Pénalité de retard (%)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "late-penalty",
							type: "number",
							value: form.latePaymentPenalty,
							onChange: (e) => setForm({
								...form,
								latePaymentPenalty: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "grace-period",
							children: "Délai de grâce (jours)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "grace-period",
							type: "number",
							value: form.gracePeriodDays,
							onChange: (e) => setForm({
								...form,
								gracePeriodDays: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "min-emergency",
							children: "Volume minimum pour collecte d'urgence (m³)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "min-emergency",
							type: "number",
							value: form.minimumVolumeForEmergency,
							onChange: (e) => setForm({
								...form,
								minimumVolumeForEmergency: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "emergency-enabled",
							checked: form.emergencyCollectionEnabled,
							onCheckedChange: (v) => setForm({
								...form,
								emergencyCollectionEnabled: v
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "emergency-enabled",
							className: "font-semibold",
							children: "Collecte d'urgence activée"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground",
					children: "Types de bacs par défaut"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: form.defaultBinTypes.map((bt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-eco/10 px-3 py-1 text-xs font-semibold text-eco",
						children: [
							bt,
							" (",
							form.binCapacities[bt] ?? "?",
							"L)"
						]
					}, bt))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground",
						children: "Fréquence de collecte par commune"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs text-muted-foreground",
						children: "Définissez le nombre de collectes par semaine pour chaque commune."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
						children: COMMUNES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-lg border border-border px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-2 rounded-full",
									style: { background: c.color }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1 text-sm",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: form.collectionFrequency[c.id] ?? 2,
									onChange: (e) => setForm({
										...form,
										collectionFrequency: {
											...form.collectionFrequency,
											[c.id]: Number(e.target.value)
										}
									}),
									className: "rounded-lg border bg-background px-2 py-1 text-xs",
									children: [
										1,
										2,
										3,
										4,
										5,
										6,
										7
									].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: n,
										children: [n, "x/sem"]
									}, n))
								})
							]
						}, c.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: handleSave,
				children: "Enregistrer la collecte"
			})
		]
	});
}
function GisSettingsSection({ gis, onUpdate }) {
	const [form, setForm] = (0, import_react.useState)(gis);
	(0, import_react.useEffect)(() => setForm(gis), [gis]);
	const handleSave = () => {
		onUpdate(form);
		toast.success("Paramètres cartographiques mis à jour.");
	};
	const ToggleRow = ({ id, label, checked }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-lg border border-border px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id,
			checked,
			onCheckedChange: (v) => setForm({
				...form,
				[id]: v
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Paramètres de cartographie / SIG"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "map-provider",
							children: "Fournisseur de carte"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.mapProvider,
							onValueChange: (v) => setForm({
								...form,
								mapProvider: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MAP_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p.value,
								children: p.label
							}, p.value)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "map-zoom",
							children: "Zoom par défaut"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "map-zoom",
							type: "number",
							min: 1,
							max: 19,
							value: form.defaultZoom,
							onChange: (e) => setForm({
								...form,
								defaultZoom: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "map-lat",
							children: "Latitude du centre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "map-lat",
							type: "number",
							step: "0.0001",
							value: form.defaultMapCenter[0],
							onChange: (e) => setForm({
								...form,
								defaultMapCenter: [Number(e.target.value), form.defaultMapCenter[1]]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "map-lng",
							children: "Longitude du centre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "map-lng",
							type: "number",
							step: "0.0001",
							value: form.defaultMapCenter[1],
							onChange: (e) => setForm({
								...form,
								defaultMapCenter: [form.defaultMapCenter[0], Number(e.target.value)]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "refresh-interval",
							children: "Intervalle de rafraîchissement (secondes)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "refresh-interval",
							type: "number",
							value: form.refreshInterval,
							onChange: (e) => setForm({
								...form,
								refreshInterval: Number(e.target.value)
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-bold uppercase tracking-widest text-muted-foreground",
						children: "Calques affichés"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "showCollectionPoints",
						label: "Points de collecte",
						checked: form.showCollectionPoints
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "showRecyclingCenters",
						label: "Centres de recyclage",
						checked: form.showRecyclingCenters
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "showFloodZones",
						label: "Zones inondables",
						checked: form.showFloodZones
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "showTruckTracking",
						label: "Suivi des camions",
						checked: form.showTruckTracking
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "clusterMarkers",
						label: "Regrouper les marqueurs",
						checked: form.clusterMarkers
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "heatmapEnabled",
						label: "Carte de chaleur",
						checked: form.heatmapEnabled
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: handleSave,
				children: "Enregistrer la cartographie"
			})
		]
	});
}
function AiSettingsSection({ ai, onUpdate }) {
	const [form, setForm] = (0, import_react.useState)(ai);
	(0, import_react.useEffect)(() => setForm(ai), [ai]);
	const handleSave = () => {
		onUpdate(form);
		toast.success("Paramètres IA mis à jour.");
	};
	const ToggleRow = ({ id, label, checked }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-lg border border-border px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id,
			checked,
			onCheckedChange: (v) => setForm({
				...form,
				[id]: v
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Paramètres de l'Intelligence Artificielle"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center gap-3 rounded-xl border border-eco/30 bg-eco/5 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					id: "ai-enabled",
					checked: form.enabled,
					onCheckedChange: (v) => setForm({
						...form,
						enabled: v
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ai-enabled",
					className: "font-bold text-eco",
					children: "IA activée"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Désactiver pour utiliser le mode dégradé (fallback)"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-model",
							children: "Modèle IA"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.model,
							onValueChange: (v) => setForm({
								...form,
								model: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: AI_MODELS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: m.value,
								children: m.label
							}, m.value)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-apikey",
							children: "Clé API (Lovable AI Gateway)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ai-apikey",
							type: "password",
							value: form.apiKey,
							onChange: (e) => setForm({
								...form,
								apiKey: e.target.value
							}),
							placeholder: "sk-..."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-confidence",
							children: "Seuil de confiance (%)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ai-confidence",
							type: "number",
							min: 0,
							max: 100,
							value: form.confidenceThreshold,
							onChange: (e) => setForm({
								...form,
								confidenceThreshold: Number(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-max-calls",
							children: "Appels API max / jour"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ai-max-calls",
							type: "number",
							value: form.maxDailyApiCalls,
							onChange: (e) => setForm({
								...form,
								maxDailyApiCalls: Number(e.target.value)
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-bold uppercase tracking-widest text-muted-foreground",
						children: "Fonctionnalités IA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "autoClassification",
						label: "Classification automatique des déchets",
						checked: form.autoClassification
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "autoUrgencyDetection",
						label: "Détection automatique de l'urgence",
						checked: form.autoUrgencyDetection
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "autoAssignment",
						label: "Assignation automatique aux équipes",
						checked: form.autoAssignment
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "floodRiskDetection",
						label: "Détection des risques d'inondation",
						checked: form.floodRiskDetection
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "volumeEstimation",
						label: "Estimation du volume",
						checked: form.volumeEstimation
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "compositionAnalysis",
						label: "Analyse de la composition",
						checked: form.compositionAnalysis
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "learningEnabled",
						label: "Apprentissage continu (corrections)",
						checked: form.learningEnabled
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "fallbackOnError",
						label: "Mode dégradé en cas d'erreur",
						checked: form.fallbackOnError
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: handleSave,
				children: "Enregistrer les paramètres IA"
			})
		]
	});
}
function BackupSettingsSection({ backup, onUpdate }) {
	const [form, setForm] = (0, import_react.useState)(backup);
	(0, import_react.useEffect)(() => setForm(backup), [backup]);
	const handleSave = () => {
		onUpdate(form);
		toast.success("Paramètres de sauvegarde mis à jour.");
	};
	const handleBackupNow = () => {
		onUpdate({
			lastBackup: (/* @__PURE__ */ new Date()).toISOString(),
			backupSize: `${(Math.random() * 50 + 10).toFixed(1)} Mo`
		});
		toast.success("Sauvegarde manuelle effectuée avec succès.");
	};
	const ToggleRow = ({ id, label, checked }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-lg border border-border px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id,
			checked,
			onCheckedChange: (v) => setForm({
				...form,
				[id]: v
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Sauvegarde et données"
			}),
			backup.lastBackup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 rounded-xl border border-eco/30 bg-eco/5 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-eco",
						children: "Dernière sauvegarde"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							new Date(backup.lastBackup).toLocaleString("fr-FR"),
							" · ",
							backup.backupSize ?? "N/A"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-6 text-eco" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					id: "autoBackup",
					checked: form.autoBackup,
					onCheckedChange: (v) => setForm({
						...form,
						autoBackup: v
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "autoBackup",
					className: "font-semibold",
					children: "Sauvegarde automatique"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "backup-freq",
							children: "Fréquence"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.backupFrequency,
							onValueChange: (v) => setForm({
								...form,
								backupFrequency: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: BACKUP_FREQUENCIES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: f.value,
								children: f.label
							}, f.value)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "backup-time",
							children: "Heure de la sauvegarde"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "backup-time",
							type: "time",
							value: form.backupTime,
							onChange: (e) => setForm({
								...form,
								backupTime: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "retention-days",
							children: "Rétention (jours)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "retention-days",
							type: "number",
							value: form.retentionDays,
							onChange: (e) => setForm({
								...form,
								retentionDays: Number(e.target.value)
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-bold uppercase tracking-widest text-muted-foreground",
						children: "Contenu de la sauvegarde"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "includeAuditLogs",
						label: "Journaux d'audit",
						checked: form.includeAuditLogs
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "includeReports",
						label: "Signalements",
						checked: form.includeReports
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "includeHouseholds",
						label: "Ménages et utilisateurs",
						checked: form.includeHouseholds
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						id: "includeSettings",
						label: "Paramètres de la plateforme",
						checked: form.includeSettings
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSave,
					children: "Enregistrer les sauvegardes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: handleBackupNow,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "mr-2 size-4" }), " Effectuer une sauvegarde maintenant"]
				})]
			})
		]
	});
}
function IATab() {
	const { store, validate, correct, precisionPct } = useLearning();
	const { items: reports, setStatus } = useLiveReports();
	const { session } = useAccess();
	const [validatedIds, setValidatedIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const pendingReports = (0, import_react.useMemo)(() => {
		return reports.filter((r) => r.status === "en_attente" && !validatedIds.has(r.id)).slice(0, 20);
	}, [reports, validatedIds]);
	const handleValidate = (reportId) => {
		setStatus(reportId, "assignee", session.name);
		validate();
		setValidatedIds((prev) => new Set(prev).add(reportId));
		toast.success(`Signalement ${reportId} validé et assigné.`);
	};
	const handleCorrect = (reportId, correctedValue) => {
		if (!correctedValue) return;
		setStatus(reportId, "assignee", session.name);
		correct({
			reportId,
			predicted: reports.find((r) => r.id === reportId)?.category || "inconnu",
			corrected: correctedValue,
			by: session.name,
			at: (/* @__PURE__ */ new Date()).toISOString()
		});
		setValidatedIds((prev) => new Set(prev).add(reportId));
		toast.success(`Signalement ${reportId} corrigé en "${correctedValue}" et assigné.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-eco/30 bg-eco/5 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-bold uppercase tracking-widest text-eco",
								children: "Précision IA (apprentissage continu)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 font-display text-4xl font-bold",
								children: [precisionPct, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									store.validations,
									" validations · ",
									store.corrections.length,
									" corrections"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Modèle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 font-mono text-sm",
								children: "google/gemini-3-flash-preview"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "via Lovable AI Gateway"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Catégories"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 font-display text-2xl font-bold",
								children: WASTE_CATEGORIES.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Plastique, organique, médical, …"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mb-1 font-display text-lg font-bold",
						children: [
							"Validation des signalements en attente (",
							pendingReports.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-sm text-muted-foreground",
						children: "Validez la classification automatique ou corrigez-la. Chaque correction améliore le modèle."
					}),
					pendingReports.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-12 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-full bg-eco/10 p-4 mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-8 text-eco" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-lg font-semibold text-muted-foreground",
								children: "Aucun signalement en attente de validation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-1",
								children: "Tous les signalements ont été traités."
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2",
											children: "ID"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commune" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Classification IA" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Urgence IA" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Description" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Action" })
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pendingReports.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 font-mono text-xs",
										children: r.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap text-xs text-muted-foreground",
										children: new Date(r.createdAt).toLocaleDateString("fr-FR")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "capitalize",
										children: COMMUNES.find((c) => c.id === r.commune)?.name || r.commune
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "capitalize font-semibold",
										children: r.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[r.urgency]?.bg} ${URGENCY_META[r.urgency]?.color}`,
										children: URGENCY_META[r.urgency]?.label
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "max-w-xs truncate text-xs text-muted-foreground",
										children: r.description || "–"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "space-x-2 whitespace-nowrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleValidate(r.id),
											className: "rounded-md bg-eco/10 px-2 py-1 text-xs font-semibold text-eco hover:bg-eco/20 transition-colors",
											children: "✓ Valider"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											onChange: (e) => {
												handleCorrect(r.id, e.target.value);
												e.currentTarget.selectedIndex = 0;
											},
											className: "rounded-md border border-border bg-background px-2 py-1 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "Corriger…"
											}), WASTE_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: c.id,
												children: c.label
											}, c.id))]
										})]
									})
								]
							}, r.id)) })]
						})
					})
				]
			}),
			store.corrections.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 font-display text-lg font-bold",
					children: "Historique des corrections"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5 font-mono text-xs",
					children: store.corrections.slice(0, 10).map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-muted-foreground",
						children: [
							"[",
							new Date(c.at).toLocaleString(),
							"] ",
							c.reportId,
							" ·",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-red-500",
								children: c.predicted
							}),
							" →",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-eco",
								children: c.corrected
							}),
							" (",
							c.by,
							")"
						]
					}, i))
				})]
			})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: ["admin"],
	title: "Administration EcoKin",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPage, {})
});
//#endregion
export { SplitComponent as component };
