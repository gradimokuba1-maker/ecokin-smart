import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as LogIn, W as Leaf, s as UserPlus, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { G as KINSHASA_COMMUNES, V as formatNumber } from "./router-C5nfmudE.mjs";
import { s as useEcoUser } from "./site-nav-7GSWuwOx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/citizen-gate-C_EW-EIt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CitizenGate({ title, description, children }) {
	const { user, register, signIn } = useEcoUser();
	const [mode, setMode] = (0, import_react.useState)("signup");
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		commune: KINSHASA_COMMUNES[0]?.name ?? "Kinshasa",
		phone: "",
		pin: ""
	});
	const [err, setErr] = (0, import_react.useState)(null);
	if (user.registered) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	const hasExisting = user.points > 0 || user.reports > 0 || user.phone;
	const onSubmit = (e) => {
		e.preventDefault();
		setErr(null);
		if (mode === "signup") {
			if (!form.name.trim() || !form.phone.trim() || form.pin.length < 4) {
				setErr("Nom, téléphone et code PIN (4 chiffres min) sont obligatoires.");
				return;
			}
			register(form);
		} else if (!signIn(form.phone, form.pin)) setErr("Téléphone ou code PIN incorrect.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto grid min-h-screen max-w-md place-items-center px-4 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-2xl bg-eco/10 text-eco",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
							children: "Compte citoyen requis"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-xl font-bold",
							children: title
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: description ?? "Créez votre compte citoyen EcoKin pour accéder à ce module. Votre compte conserve vos Green Points et votre historique pour vos prochaines visites."
					}),
					hasExisting && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-xl border border-eco/30 bg-eco/5 p-3 text-xs text-eco",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold uppercase tracking-widest",
							children: [formatNumber(user.points), " Green Points conservés"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-eco/80",
							children: "Ils resteront associés à votre compte après identification."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex gap-2 rounded-full bg-muted p-1 text-xs font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setMode("signup"),
							className: `flex-1 rounded-full px-3 py-2 ${mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-1 inline size-3.5" }), " Créer un compte"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setMode("signin"),
							className: `flex-1 rounded-full px-3 py-2 ${mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "mr-1 inline size-3.5" }), " Se connecter"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit,
						className: "mt-4 space-y-3",
						children: [
							mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Nom complet"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								}),
								placeholder: "Ex. Jean Mbala",
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Commune"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: form.commune,
								onChange: (e) => setForm({
									...form,
									commune: e.target.value
								}),
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
								children: KINSHASA_COMMUNES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.name,
									children: c.name
								}, c.id))
							})] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Téléphone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.phone,
								onChange: (e) => setForm({
									...form,
									phone: e.target.value
								}),
								placeholder: "+243 ...",
								inputMode: "tel",
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Code PIN (4 chiffres min)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.pin,
								onChange: (e) => setForm({
									...form,
									pin: e.target.value
								}),
								type: "password",
								inputMode: "numeric",
								placeholder: "••••",
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							})] }),
							err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-red-600",
								children: err
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "submit",
								className: "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), mode === "signup" ? "Créer mon compte" : "Se connecter"]
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
export { CitizenGate };
