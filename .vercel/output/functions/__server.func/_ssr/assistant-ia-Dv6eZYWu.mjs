import { o as __toESM } from "../_runtime.mjs";
import { A as IPK, E as HOTSPOTS, G as WEATHER_FORECAST, R as PRIORITY_ALERTS, S as COMMUNE_PERFORMANCE, z as REPORTS } from "./ecokin-db-CJricvzN.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as SiteNav } from "./site-nav-C_XHakXe.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { U as LoaderCircle, v as Sparkles, vt as Bot, w as Send } from "../_libs/lucide-react.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-BVebF8pM.mjs";
import { l as createServerFn } from "./esm-CuMU5gNd.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CcUvPtY4.mjs";
import { a as objectType, i as numberType, n as arrayType, o as stringType, r as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assistant-ia-Dv6eZYWu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AnalyzeInputSchema = objectType({ imageDataUrl: stringType().min(20) });
createServerFn({ method: "POST" }).validator((data) => AnalyzeInputSchema.parse(data)).handler(createSsrRpc("c0cce0f56c7b933e57d0cd361b6c6457b03d9781b997919a2844ac1f3dabd2b8"));
var AdvancedInputSchema = objectType({
	imageDataUrl: stringType().min(20),
	additionalImages: arrayType(stringType()).optional(),
	lat: numberType().optional(),
	lng: numberType().optional(),
	accuracy: numberType().optional(),
	altitudeM: numberType().optional(),
	capturedAt: stringType().datetime().optional(),
	cameraCapability: enumType([
		"lidar",
		"arcore",
		"basic"
	]).optional(),
	depthData: stringType().optional()
});
createServerFn({ method: "POST" }).validator((data) => AdvancedInputSchema.parse(data)).handler(createSsrRpc("4c2db2826bb73273e13ed421258788e28df030ab007357adaa5ed3497af7f168"));
var ChatSchema = objectType({
	question: stringType().min(2).max(500),
	context: stringType().max(8e3).optional()
});
var askDecisionAssistant = createServerFn({ method: "POST" }).validator((data) => ChatSchema.parse(data)).handler(createSsrRpc("cd4cf115d2ea3e2b5b513abb54aa04c6f4d2e678df5c4fe9b98d51aa29a472b8"));
var SUGGESTIONS = [
	"Quelles communes sont les plus touchées aujourd'hui ?",
	"Où faut-il intervenir en priorité ?",
	"Quels quartiers présentent un risque élevé d'inondation ?",
	"Quel est le taux de résolution ce mois-ci ?",
	"Quelle commune affiche les meilleures performances ?",
	"Rédige une note de synthèse pour le conseil de demain."
];
function buildContext() {
	return JSON.stringify({
		ipk: {
			...IPK,
			kinshasa: 0
		},
		performance: COMMUNE_PERFORMANCE,
		alertesPrioritaires: PRIORITY_ALERTS,
		hotspots: HOTSPOTS,
		meteo7j: WEATHER_FORECAST,
		signalements: {
			total: REPORTS.length,
			critiques: REPORTS.filter((r) => r.severity === "critique").length,
			parCommune: {
				matete: REPORTS.filter((r) => r.commune === "matete").length,
				lemba: REPORTS.filter((r) => r.commune === "lemba").length,
				kisenso: REPORTS.filter((r) => r.commune === "kisenso").length
			}
		}
	});
}
function Page() {
	const ask = useServerFn(askDecisionAssistant);
	const [messages, setMessages] = (0, import_react.useState)([{
		role: "assistant",
		content: "Bonjour. Je suis l'Assistant IA EcoKin Smart. Posez-moi vos questions sur l'état de la propreté, les risques et les priorités d'intervention."
	}]);
	const [input, setInput] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const send = async (text) => {
		const q = (text ?? input).trim();
		if (!q || loading) return;
		setMessages((m) => [...m, {
			role: "user",
			content: q
		}]);
		setInput("");
		setLoading(true);
		try {
			const r = await ask({ data: {
				question: q,
				context: buildContext()
			} });
			setMessages((m) => [...m, {
				role: "assistant",
				content: r.answer
			}]);
		} catch {
			setMessages((m) => [...m, {
				role: "assistant",
				content: "Erreur de connexion à l'IA."
			}]);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-kin text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), " Module 8 · Assistant IA"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold",
							children: "Posez vos questions en langage naturel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-white/70",
							children: "L'IA croise les données EcoKin en temps réel : IPK, alertes, hotspots, météo, signalements."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-[640px] flex-col rounded-3xl border border-border bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-4 overflow-y-auto p-6",
						children: [messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex ${m.role === "user" ? "justify-end" : "justify-start"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-eco text-white" : "bg-secondary text-foreground"}`,
								children: m.content
							})
						}, i)), loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-start",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "inline size-4 animate-spin" }), " IA en train de répondre…"]
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: input,
								onChange: (e) => setInput(e.target.value),
								onKeyDown: (e) => e.key === "Enter" && send(),
								placeholder: "Votre question…",
								className: "flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => send(),
								disabled: loading || !input.trim(),
								className: "inline-flex items-center gap-2 rounded-xl bg-eco px-4 py-3 text-sm font-bold text-white disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), " Envoyer"]
							})]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "space-y-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-eco" }), " Questions suggérées"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: SUGGESTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => send(s),
								className: "w-full rounded-xl border border-border bg-secondary/30 px-3 py-2 text-left text-xs hover:bg-secondary",
								children: s
							}) }, s))
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: ["bourgmestre", "gouverneur"],
	title: "Assistant IA des décideurs",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {})
});
//#endregion
export { SplitComponent as component };
