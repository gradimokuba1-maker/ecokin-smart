//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-3qdcbccb.js
var manifest = {
	"050133e91a1e4a97dcedd938d4044b9fb1fd5b2fe15f957e82ef1fc0bc47591e": {
		functionName: "submitCitizenReport_createServerFn_handler",
		importer: () => import("./_ssr/report-submit.functions-BeFTBmRG.mjs")
	},
	"4c2db2826bb73273e13ed421258788e28df030ab007357adaa5ed3497af7f168": {
		functionName: "analyzeWastePhotoAdvanced_createServerFn_handler",
		importer: () => import("./_ssr/waste-ai.functions-0Tmx7ElI.mjs")
	},
	"9c343534c8711b23a2a610cf4e1540de1cd5008af978988eb5af527e5830e0ef": {
		functionName: "commitReportHash_createServerFn_handler",
		importer: () => import("./_ssr/report-submit.functions-BeFTBmRG.mjs")
	},
	"c0cce0f56c7b933e57d0cd361b6c6457b03d9781b997919a2844ac1f3dabd2b8": {
		functionName: "analyzeWastePhoto_createServerFn_handler",
		importer: () => import("./_ssr/waste-ai.functions-0Tmx7ElI.mjs")
	},
	"cd4cf115d2ea3e2b5b513abb54aa04c6f4d2e678df5c4fe9b98d51aa29a472b8": {
		functionName: "askDecisionAssistant_createServerFn_handler",
		importer: () => import("./_ssr/waste-ai.functions-0Tmx7ElI.mjs")
	},
	"f53ea3a397a2ec958fd3cc3acde690afe7d6a4a8048c8c4751b16269bdb4f399": {
		functionName: "validateReportHash_createServerFn_handler",
		importer: () => import("./_ssr/report-submit.functions-BeFTBmRG.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
