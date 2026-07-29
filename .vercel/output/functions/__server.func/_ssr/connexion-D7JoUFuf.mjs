import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { i as useAccess, n as AUTH_USERS, r as getAuthorityDashboardPath } from "./access-store-ohDhqBrz.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { V as Lock, a as User, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as CommuneSelector } from "./commune-selector-CNZO2THv.mjs";
import { t as Route } from "./connexion-Cmv4TKm8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connexion-D7JoUFuf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginForm({ role, title, onSubmit }) {
	const [identifier, setIdentifier] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [commune, setCommune] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const needsCommune = role === "agent" || role === "bourgmestre" || role === "admin";
	const userDetails = AUTH_USERS[role];
	const handleSubmit = (event) => {
		event.preventDefault();
		if (needsCommune && !commune) {
			setErr("Veuillez choisir votre commune avant de continuer.");
			return;
		}
		if (onSubmit(identifier, password, needsCommune ? commune : void 0)) setErr(null);
		else setErr("Identifiant, mot de passe ou commune incorrect.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "mt-5 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: "Identifiant"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: identifier,
					onChange: (e) => setIdentifier(e.target.value),
					type: "text",
					placeholder: "Identifiant",
					autoComplete: "username",
					className: "w-full bg-transparent text-sm outline-none"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: "Mot de passe"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: password,
					onChange: (e) => setPassword(e.target.value),
					type: "password",
					placeholder: "••••••••",
					autoComplete: "current-password",
					className: "w-full bg-transparent text-sm outline-none"
				})]
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer font-semibold",
					children: [
						"Identifiants de démo (",
						title,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 space-y-0.5 font-mono",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Identifiant: ", userDetails.identifier] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Mot de passe: ", userDetails.password] })]
				})]
			})
		]
	});
}
var ROLE_DETAILS = {
	gouverneur: {
		title: "Gouverneur",
		icon: ShieldCheck
	},
	bourgmestre: {
		title: "Bourgmestre",
		icon: ShieldCheck
	},
	admin: {
		title: "Administrateur",
		icon: ShieldCheck
	},
	agent: {
		title: "Agent de terrain",
		icon: ShieldCheck
	}
};
function AuthorityLoginPage() {
	const navigate = useNavigate();
	const { role } = Route.useSearch();
	const { session, login } = useAccess();
	const details = ROLE_DETAILS[role];
	(0, import_react.useEffect)(() => {
		if (session.role === role && (role === "admin" || role === "gouverneur" || session.commune)) navigate({
			to: getAuthorityDashboardPath(role),
			replace: true
		});
	}, [
		session.role,
		session.commune,
		role,
		navigate
	]);
	const handleLogin = (identifier, password, commune) => {
		if (login(role, identifier, password, commune)) {
			navigate({
				to: getAuthorityDashboardPath(role),
				replace: true
			});
			return true;
		}
		return false;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto grid max-w-md place-items-center px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 place-items-center rounded-2xl bg-kin text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(details.icon, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
						children: "Accès réservé"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-xl font-bold capitalize",
						children: ["Connexion ", details.title]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: "Authentifiez-vous pour accéder à votre tableau de bord."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, {
					role,
					title: details.title,
					onSubmit: handleLogin
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/autorite",
					className: "mt-3 block text-center text-xs text-muted-foreground hover:underline",
					children: "← Retour aux profils"
				})
			]
		})
	});
}
//#endregion
export { AuthorityLoginPage as component };
