import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { i as useAccess, n as AUTH_USERS } from "./access-store-BeLmIsfR.mjs";
import { t as SiteNav } from "./site-nav-BQEX1RbF.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { M as Phone, V as Lock, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as CommuneSelector } from "./commune-selector-BSNzzQMw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-login-HmZFcYfk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLoginPage() {
	const navigate = useNavigate();
	const { session, loginAdmin } = useAccess();
	const [phone, setPhone] = (0, import_react.useState)("");
	const [pin, setPin] = (0, import_react.useState)("");
	const [commune, setCommune] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (session.role === "admin" && session.commune) navigate({
			to: "/admin",
			replace: true
		});
	}, [
		session.role,
		session.commune,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid max-w-md place-items-center px-4 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 place-items-center rounded-2xl bg-kin text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
								children: "Accès réservé"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-xl font-bold",
								children: "Connexion administrateur"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: "Cet espace est strictement réservé aux administrateurs habilités de la plateforme EcoKin Smart. Authentifiez-vous par téléphone et code PIN."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								if (!commune) {
									setErr("Veuillez choisir la commune administree.");
									return;
								}
								if (loginAdmin(phone, pin, commune)) {
									setErr(null);
									navigate({
										to: "/admin",
										replace: true
									});
								} else setErr("Téléphone ou code PIN invalide.");
							},
							className: "mt-5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
									children: "Téléphone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: phone,
										onChange: (e) => setPhone(e.target.value),
										type: "tel",
										placeholder: "+243 900 000 000",
										autoComplete: "tel",
										className: "w-full bg-transparent text-sm outline-none"
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
									children: "Code PIN"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: pin,
										onChange: (e) => setPin(e.target.value),
										type: "password",
										inputMode: "numeric",
										placeholder: "••••",
										autoComplete: "current-password",
										className: "w-full bg-transparent text-sm outline-none"
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommuneSelector, {
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
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "mt-2 space-y-0.5 font-mono",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Téléphone : ", AUTH_USERS.admin.identifier] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["PIN : ", AUTH_USERS.admin.password] })]
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { AdminLoginPage as component };
