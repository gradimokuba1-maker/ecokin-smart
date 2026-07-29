import { K as detectCityCommune, w as DEFAULT_CITY } from "./ecokin-db-CJricvzN.mjs";
import { a as urgencyFromSeverity, i as pushLiveReport } from "./live-reports-YSvqXRNr.mjs";
import { f as severityFromAnalysis, s as priorityScoreFromAnalysis } from "./dashboard-analytics-D5gdVAdN.mjs";
import { l as createServerFn } from "./esm-CuMU5gNd.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CcUvPtY4.mjs";
import { a as objectType, i as numberType, n as arrayType, o as stringType, r as enumType, t as anyType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-Dn9IlLzZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report-submit.functions-BeFTBmRG.js
var InputSchema = objectType({
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
}).extend({
	volumeM3FromDepth: numberType().optional(),
	surfaceM2FromDepth: numberType().optional(),
	heightAvgMFromDepth: numberType().optional()
});
/**
* Calcule le volume, la surface et la hauteur moyenne à partir des données de profondeur.
* @param depthData - Les données de profondeur JSON stringifiées.
* @returns Un objet avec volumeM3, surfaceM2, heightAvgM, ou null.
*/
var analyzeWastePhotoAdvanced = createServerFn({ method: "POST" }).validator((data) => InputSchema.parse(data)).handler(createSsrRpc("d75a61ae1f4b487538a45a865a1681ddcf7977db5495b473d9ae68ec0b5f8b4f"));
var HashSchema = stringType().regex(/^[0-9a-f]{16}$/i, "Empreinte invalide");
var ValidateSchema = objectType({
	hash: HashSchema,
	lat: numberType().gte(-90).lte(90).optional(),
	lng: numberType().gte(-180).lte(180).optional(),
	category: stringType().max(40).optional()
});
var CommitSchema = ValidateSchema.extend({ reportId: stringType().min(3).max(60) });
var STORE_KEY = "__ecokin_hashes__";
function store() {
	const g = globalThis;
	if (!g[STORE_KEY]) g[STORE_KEY] = [];
	return g[STORE_KEY];
}
function hamming(a, b) {
	if (a.length !== b.length) return 64;
	let d = 0;
	for (let i = 0; i < a.length; i++) {
		let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
		while (x) {
			d += x & 1;
			x >>= 1;
		}
	}
	return d;
}
function similarity(a, b) {
	return Math.round((1 - hamming(a, b) / 64) * 100);
}
var validateReportHash_createServerFn_handler = createServerRpc({
	id: "f53ea3a397a2ec958fd3cc3acde690afe7d6a4a8048c8c4751b16269bdb4f399",
	name: "validateReportHash",
	filename: "src/lib/report-submit.functions.ts"
}, (opts) => validateReportHash.__executeServer(opts));
var validateReportHash = createServerFn({ method: "POST" }).validator((d) => ValidateSchema.parse(d)).handler(validateReportHash_createServerFn_handler, async ({ data }) => {
	const list = store();
	let best = null;
	for (const s of list) {
		const sim = similarity(s.hash, data.hash);
		if (sim >= 95 && (!best || sim > best.sim)) best = {
			s,
			sim
		};
	}
	if (!best) return { duplicate: false };
	let distance;
	if (data.lat != null && data.lng != null && best.s.lat != null && best.s.lng != null) {
		const R = 6371e3, toR = (v) => v * Math.PI / 180;
		const dLat = toR(best.s.lat - data.lat);
		const dLng = toR(best.s.lng - data.lng);
		const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(data.lat)) * Math.cos(toR(best.s.lat)) * Math.sin(dLng / 2) ** 2;
		distance = Math.round(2 * R * Math.asin(Math.sqrt(h)));
	}
	return {
		duplicate: true,
		similarity: best.sim,
		matchedAt: best.s.at,
		matchedReportId: best.s.reportId,
		distanceMeters: distance
	};
});
var commitReportHash_createServerFn_handler = createServerRpc({
	id: "9c343534c8711b23a2a610cf4e1540de1cd5008af978988eb5af527e5830e0ef",
	name: "commitReportHash",
	filename: "src/lib/report-submit.functions.ts"
}, (opts) => commitReportHash.__executeServer(opts));
var commitReportHash = createServerFn({ method: "POST" }).validator((d) => CommitSchema.parse(d)).handler(commitReportHash_createServerFn_handler, async ({ data }) => {
	const list = store();
	for (const s of list) if (similarity(s.hash, data.hash) >= 95) return {
		duplicate: true,
		similarity: similarity(s.hash, data.hash),
		matchedAt: s.at,
		matchedReportId: s.reportId
	};
	list.push({
		hash: data.hash,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		reportId: data.reportId,
		lat: data.lat,
		lng: data.lng
	});
	if (list.length > 5e3) list.splice(0, list.length - 5e3);
	return { ok: true };
});
var CitizenReportSchema = objectType({
	capture: anyType(),
	description: stringType().max(500).optional(),
	hash: HashSchema
});
var submitCitizenReport_createServerFn_handler = createServerRpc({
	id: "050133e91a1e4a97dcedd938d4044b9fb1fd5b2fe15f957e82ef1fc0bc47591e",
	name: "submitCitizenReport",
	filename: "src/lib/report-submit.functions.ts"
}, (opts) => submitCitizenReport.__executeServer(opts));
var submitCitizenReport = createServerFn({ method: "POST" }).validator((d) => CitizenReportSchema.parse(d)).handler(submitCitizenReport_createServerFn_handler, async ({ data }) => {
	console.log("[1] Début submitCitizenReport");
	const { capture, description, hash } = data;
	try {
		if (!capture.location) throw new Error("Localisation GPS manquante.");
		console.log("[2] Vérification anti-fraude");
		const duplicateCheck = await validateReportHash({ data: {
			hash,
			lat: capture.location.lat,
			lng: capture.location.lng
		} });
		console.log("[3] Validation anti-fraude terminée");
		if (duplicateCheck.duplicate) console.log(`Duplicate report detected (similarity: ${duplicateCheck.similarity}%), proceeding anyway but could be flagged.`);
		const preliminaryReport = {
			author: "Citoyen Anonyme",
			authorId: "anonyme",
			authorRole: "anonyme",
			province: "Kinshasa",
			city: "Kinshasa",
			commune: detectCityCommune(DEFAULT_CITY, capture.location.lat, capture.location.lng).id,
			category: "mixte",
			urgency: 3,
			description: description || "Signalement citoyen rapide.",
			lat: capture.location.lat,
			lng: capture.location.lng,
			photoUrl: capture.imageDataUrl,
			status: "pending_analysis",
			cameraCapability: capture.cameraCapability,
			capturedAt: capture.capturedAt,
			greenPointsAwarded: 0
		};
		console.log("[4] Création du signalement");
		const item = pushLiveReport(preliminaryReport);
		console.log("[5] Signalement créé, ID:", item.id);
		console.log("[6] Commit du hash");
		await commitReportHash({ data: {
			hash,
			lat: capture.location.lat,
			lng: capture.location.lng,
			reportId: item.id,
			category: "mixte"
		} });
		console.log("[7] Commit terminé");
		console.log("[8] Début analyse IA");
		const analysisResult = await analyzeWastePhotoAdvanced({ data: {
			imageDataUrl: capture.imageDataUrl,
			additionalImages: capture.additionalImages,
			lat: capture.location?.lat,
			lng: capture.location?.lng,
			accuracy: capture.location?.accuracy,
			altitudeM: capture.location?.altitudeM,
			capturedAt: capture.capturedAt,
			cameraCapability: capture.cameraCapability,
			depthData: capture.depthData
		} });
		console.log("[9] Analyse IA terminée");
		console.log("[10] Mise à jour du signalement");
		item.category = analysisResult.mainCategory;
		item.urgency = urgencyFromSeverity(severityFromAnalysis(analysisResult), analysisResult.floodRisk);
		item.volumeM3 = analysisResult.dimensions.volumeM3;
		item.priorityScore = priorityScoreFromAnalysis(analysisResult, item.commune);
		item.composition = analysisResult.composition;
		item.weightTons = analysisResult.weight.weightTons;
		item.dimensions = analysisResult.dimensions;
		item.priorityLevel = analysisResult.priorityLevel;
		item.healthRisk = analysisResult.healthRisk;
		item.aiAnalysis = analysisResult;
		item.status = "en_attente";
		console.log("[11] Mise à jour terminée");
		console.log("[12] Fin submitCitizenReport");
		return {
			success: true,
			reportId: item.id
		};
	} catch (error) {
		console.error("Erreur détaillée dans submitCitizenReport:", error instanceof Error ? error.message : error);
		if (error instanceof Error && error.stack) console.error(error.stack);
		throw error;
	}
});
//#endregion
export { commitReportHash_createServerFn_handler, submitCitizenReport_createServerFn_handler, validateReportHash_createServerFn_handler };
