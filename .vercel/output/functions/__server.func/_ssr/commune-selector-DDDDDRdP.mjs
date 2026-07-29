import { y as COMMUNES } from "./ecokin-db-CJricvzN.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/commune-selector-DDDDDRdP.js
var import_jsx_runtime = require_jsx_runtime();
function CommuneSelector({ value, onChange, required, disabled, label = "Commune" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
		children: [label, required ? " *" : ""]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
		value,
		onChange: (e) => onChange(e.target.value),
		required,
		disabled,
		className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: "",
			children: "Choisir une commune"
		}), COMMUNES.map((commune) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: commune.id,
			children: commune.name
		}, commune.id))]
	})] });
}
//#endregion
export { CommuneSelector as t };
