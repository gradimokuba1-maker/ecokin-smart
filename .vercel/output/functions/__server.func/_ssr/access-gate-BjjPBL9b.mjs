import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { i as useAccess, t as ACCESS_CODES } from "./access-store-ohDhqBrz.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { V as Lock, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as CommuneSelector } from "./commune-selector-CNZO2THv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-gate-BjjPBL9b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccessGate({ required, title, children }) {
	const { session, login } = useAccess();
	const [role, setRole] = (0, import_react.useState)(required[0]);
	const [identifier, setIdentifier] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [commune, setCommune] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const needsCommune = role === "agent" || role === "bourgmestre" || role === "admin";
	if (required.includes(session.role) && (session.role !== "agent" && session.role !== "bourgmestre" && session.role !== "admin" || session.commune)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto grid min-h-screen max-w-md place-items-center px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-2xl bg-kin/10 text-kin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
							children: "Accès contrôlé"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-xl font-bold",
							children: title
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Cet espace est réservé aux responsables habilités. Connectez-vous avec votre identifiant institutionnel et votre mot de passe."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							if (needsCommune && !commune) {
								setErr("Veuillez choisir votre commune avant de continuer.");
								return;
							}
							if (login(role, identifier, password, needsCommune ? commune : void 0)) setErr(null);
							else setErr("Identifiant, mot de passe ou commune incorrect.");
						},
						className: "mt-5 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Rôle"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: role,
								onChange: (e) => {
									setRole(e.target.value);
									setCommune("");
								},
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
								children: required.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: r,
									children: r === "gouverneur" ? "Gouverneur" : r === "bourgmestre" ? "Bourgmestre" : r === "agent" ? "Agent" : "Administrateur"
								}, r))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Identifiant"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: identifier,
								onChange: (e) => setIdentifier(e.target.value),
								type: "text",
								placeholder: "ECOKIN-...",
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Mot de passe"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: password,
								onChange: (e) => setPassword(e.target.value),
								type: "password",
								placeholder: "••••••••",
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							})] }),
							needsCommune && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommuneSelector, {
								value: commune,
								onChange: setCommune,
								required: true
							}),
							err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-red-600",
								children: err
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "submit",
								className: "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Se connecter"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer font-semibold",
									children: "Identifiants de démonstration"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-0.5 font-mono",
									children: Object.entries(ACCESS_CODES).map(([r, c]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										r,
										" : ",
										c
									] }, r))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "block text-center text-xs text-muted-foreground hover:underline",
								children: "← Retour à l'accueil"
							})
						]
					})
				]
			})
		})
	});
}
//#endregion
export { AccessGate as t };
