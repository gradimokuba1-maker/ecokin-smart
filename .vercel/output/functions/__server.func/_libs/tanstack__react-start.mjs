import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
import { O as isRedirect, v as useRouter } from "./@tanstack/react-router+[...].mjs";
//#region node_modules/@tanstack/react-start/dist/esm/useServerFn.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
//#endregion
export { useServerFn as t };
