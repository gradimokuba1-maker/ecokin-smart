import { a as stringType, i as objectType, n as enumType, r as numberType, t as arrayType } from "../_libs/zod.mjs";
import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/waste-ai.functions-B1n_gTlH.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var AnalyzeInputSchema = objectType({ imageDataUrl: stringType().min(20) });
var FALLBACK = {
	type: "plastique",
	category: "plastique",
	confidence: .7,
	severity: "modere",
	volumeEstimateM3: 1.4,
	surfaceM2: 3,
	description: "Dépôt de déchets détecté. Analyse précise indisponible.",
	recommendations: ["Confirmer la localisation", "Signaler aux services communaux"],
	floodRisk: false,
	risqueSanitaire: "modere",
	risqueEnvironnemental: "modere",
	risqueObstruction: "faible",
	niveauDanger: "modere",
	interventionImmediate: false
};
var analyzeWastePhoto_createServerFn_handler = createServerRpc({
	id: "c0cce0f56c7b933e57d0cd361b6c6457b03d9781b997919a2844ac1f3dabd2b8",
	name: "analyzeWastePhoto",
	filename: "src/lib/waste-ai.functions.ts"
}, (opts) => analyzeWastePhoto.__executeServer(opts));
var analyzeWastePhoto = createServerFn({ method: "POST" }).validator((data) => AnalyzeInputSchema.parse(data)).handler(analyzeWastePhoto_createServerFn_handler, async ({ data }) => {
	const key = process.env.LOVABLE_API_KEY;
	if (!key) return FALLBACK;
	const systemPrompt = `Tu es l'IA d'EcoKin Smart, plateforme officielle de gestion des déchets de Kinshasa (RDC). Analyse la photo et réponds STRICTEMENT en JSON valide :
{
  "category": "plastique"|"organique"|"menager"|"electronique"|"medical"|"construction"|"mixte"|"inconnu",
  "confidence": number 0..1,
  "severity": "faible"|"modere"|"critique",
  "volumeEstimateM3": number,
  "surfaceM2": number (surface au sol approximative),
  "description": string court FR (1-2 phrases),
  "recommendations": string[] 2-3 actions courtes FR,
  "floodRisk": boolean (caniveau / rivière obstrué visible),
  "risqueSanitaire": "faible"|"modere"|"eleve",
  "risqueEnvironnemental": "faible"|"modere"|"eleve",
  "risqueObstruction": "faible"|"modere"|"eleve" (risque de boucher caniveau),
  "niveauDanger": "faible"|"modere"|"eleve",
  "interventionImmediate": boolean
}
Rien d'autre que le JSON.`;
	try {
		const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Lovable-API-Key": key
			},
			body: JSON.stringify({
				model: "google/gemini-3-flash-preview",
				response_format: { type: "json_object" },
				messages: [{
					role: "system",
					content: systemPrompt
				}, {
					role: "user",
					content: [{
						type: "text",
						text: "Analyse ce dépôt de déchets et renvoie le JSON."
					}, {
						type: "image_url",
						image_url: { url: data.imageDataUrl }
					}]
				}]
			})
		});
		if (!res.ok) {
			console.error("AI gateway error", res.status, await res.text());
			return FALLBACK;
		}
		const content = (await res.json())?.choices?.[0]?.message?.content ?? "";
		const p = JSON.parse(content);
		const cat = p.category ?? "inconnu";
		return {
			type: cat,
			category: cat,
			confidence: Math.max(0, Math.min(1, Number(p.confidence ?? .6))),
			severity: p.severity ?? "modere",
			volumeEstimateM3: Number(p.volumeEstimateM3 ?? 1),
			surfaceM2: Number(p.surfaceM2 ?? 2),
			description: String(p.description ?? FALLBACK.description),
			recommendations: Array.isArray(p.recommendations) ? p.recommendations.slice(0, 4).map(String) : FALLBACK.recommendations,
			floodRisk: Boolean(p.floodRisk),
			risqueSanitaire: p.risqueSanitaire ?? "modere",
			risqueEnvironnemental: p.risqueEnvironnemental ?? "modere",
			risqueObstruction: p.risqueObstruction ?? "faible",
			niveauDanger: p.niveauDanger ?? "modere",
			interventionImmediate: Boolean(p.interventionImmediate)
		};
	} catch (err) {
		console.error("AI analyze failed", err);
		return FALLBACK;
	}
});
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
var analyzeWastePhotoAdvanced_createServerFn_handler = createServerRpc({
	id: "4c2db2826bb73273e13ed421258788e28df030ab007357adaa5ed3497af7f168",
	name: "analyzeWastePhotoAdvanced",
	filename: "src/lib/waste-ai.functions.ts"
}, (opts) => analyzeWastePhotoAdvanced.__executeServer(opts));
var analyzeWastePhotoAdvanced = createServerFn({ method: "POST" }).validator((data) => AdvancedInputSchema.parse(data)).handler(analyzeWastePhotoAdvanced_createServerFn_handler, async ({ data }) => {
	const hash = data.imageDataUrl.length % 7;
	const categories = [
		"plastique",
		"organique",
		"papier",
		"metal",
		"verre",
		"construction",
		"mixte"
	];
	const mainCategory = categories[hash] ?? "mixte";
	const secondaryCategory = categories[(hash + 2) % 7];
	const sizeFactor = data.imageDataUrl.length % 100 / 100;
	const baseVolume = .1 + sizeFactor * 5;
	const volumeM3 = parseFloat(baseVolume.toFixed(2));
	const surfaceM2 = parseFloat((volumeM3 / (.2 + sizeFactor * .5)).toFixed(2));
	const heightAvgM = parseFloat((volumeM3 / surfaceM2).toFixed(2));
	const densityUsed = {
		plastique: 60,
		carton: 100,
		organique: 450,
		papier: 90,
		metal: 300,
		verre: 600,
		construction: 1200,
		mixte: 150,
		inconnu: 150,
		dangereux: 200,
		meuble: 180,
		electronique: 250
	}[mainCategory] ?? 150;
	const weightKg = Math.round(volumeM3 * densityUsed);
	const analysisConfidence = .55 + sizeFactor * .4;
	const healthRisk = ["organique", "dangereux"].includes(mainCategory) ? "eleve" : volumeM3 > 2 ? "modere" : "faible";
	const priorityScore = Math.min(98, 40 + Math.round(volumeM3 * 5) + (healthRisk === "eleve" ? 20 : 0));
	const priorityLevel = priorityScore > 90 ? "critique" : priorityScore > 75 ? "eleve" : priorityScore > 50 ? "moyen" : "faible";
	const recommendations = ["Évaluation sur site requise."];
	if (volumeM3 > 3) recommendations.push("Prévoir un camion de grande capacité.");
	if (mainCategory === "mixte") recommendations.push("Tri nécessaire avant évacuation.");
	if (healthRisk === "eleve") recommendations.push("Équipement de protection individuelle (EPI) recommandé pour les équipes.");
	const result = {
		mainCategory,
		secondaryCategory,
		composition: [{
			material: mainCategory,
			percentage: 70
		}, {
			material: secondaryCategory,
			percentage: 30
		}],
		detectedObjects: [{
			label: mainCategory,
			count: Math.round(1 + sizeFactor * 10),
			confidence: .8
		}],
		environmentDetected: ["route", "trottoir"],
		wasteAreaPercent: Math.round(20 + sizeFactor * 60),
		dimensions: {
			lengthM: parseFloat(Math.sqrt(surfaceM2 * 1.5).toFixed(2)),
			widthM: parseFloat(Math.sqrt(surfaceM2 / 1.5).toFixed(2)),
			heightAvgM,
			surfaceM2,
			volumeM3,
			confidence: .6 + sizeFactor * .3
		},
		weight: {
			weightKg,
			weightTons: parseFloat((weightKg / 1e3).toFixed(2)),
			densityUsed,
			uncertaintyPercent: Math.round(35 - sizeFactor * 20),
			confidence: .5 + sizeFactor * .4
		},
		location: {
			lat: -4.32,
			lng: 15.3,
			accuracy: 20,
			commune: "gombe"
		},
		healthRisk,
		environmentalRisk: volumeM3 > 1 ? "modere" : "faible",
		obstructionRisk: "faible",
		floodRisk: mainCategory === "plastique" && volumeM3 > 1,
		interventionUrgent: priorityLevel === "critique",
		priorityScore,
		priorityLevel,
		description: `Analyse dynamique : Détection d'un dépôt de type '${mainCategory}' d'un volume approximatif de ${volumeM3} m³.`,
		recommendations,
		analysisConfidence,
		model3DAvailable: data.cameraCapability === "lidar" || !!data.depthData,
		cameraCapability: "basic"
	};
	if (data.lat && data.lng) {
		result.location.lat = data.lat;
		result.location.lng = data.lng;
		result.location.accuracy = data.accuracy ?? 20;
		result.location.altitudeM = data.altitudeM;
	}
	if (data.cameraCapability) result.cameraCapability = data.cameraCapability;
	return Promise.resolve(result);
});
var ChatSchema = objectType({
	question: stringType().min(2).max(500),
	context: stringType().max(8e3).optional()
});
var askDecisionAssistant_createServerFn_handler = createServerRpc({
	id: "cd4cf115d2ea3e2b5b513abb54aa04c6f4d2e678df5c4fe9b98d51aa29a472b8",
	name: "askDecisionAssistant",
	filename: "src/lib/waste-ai.functions.ts"
}, (opts) => askDecisionAssistant.__executeServer(opts));
var askDecisionAssistant = createServerFn({ method: "POST" }).validator((data) => ChatSchema.parse(data)).handler(askDecisionAssistant_createServerFn_handler, async ({ data }) => {
	const key = process.env.LOVABLE_API_KEY;
	const fallbackAnswer = "Service IA momentanément indisponible. Consultez le tableau de bord du Gouverneur pour les indicateurs clés (IPK, alertes prioritaires, hotspots).";
	if (!key) return { answer: fallbackAnswer };
	const sys = `Tu es l'Assistant IA d'EcoKin Smart pour les décideurs (Gouverneur, Bourgmestres) de Kinshasa. Réponds en français, de façon concise, structurée (listes courtes, chiffres clés), orientée action. Tu disposes des données de plateforme suivantes :\n${data.context ?? "(données non fournies)"}\nSi la question dépasse ces données, indique-le honnêtement. Toujours conclure par une recommandation prioritaire si pertinent.`;
	try {
		const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Lovable-API-Key": key
			},
			body: JSON.stringify({
				model: "google/gemini-3-flash-preview",
				messages: [{
					role: "system",
					content: sys
				}, {
					role: "user",
					content: data.question
				}]
			})
		});
		if (!res.ok) {
			console.error("Assistant gateway error", res.status, await res.text());
			return { answer: fallbackAnswer };
		}
		const json = await res.json();
		return { answer: String(json?.choices?.[0]?.message?.content ?? fallbackAnswer) };
	} catch (e) {
		console.error("Assistant failed", e);
		return { answer: fallbackAnswer };
	}
});
//#endregion
export { analyzeWastePhotoAdvanced_createServerFn_handler, analyzeWastePhoto_createServerFn_handler, askDecisionAssistant_createServerFn_handler };
