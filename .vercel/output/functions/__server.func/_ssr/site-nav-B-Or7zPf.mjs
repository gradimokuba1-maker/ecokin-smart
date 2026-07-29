import { o as __toESM } from "../_runtime.mjs";
import { d as upsertUser, i as findUserByCredentials, u as updateUser } from "./ecokin-db-CVUKc8qE.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as useLiveReports, r as URGENCY_META } from "./live-reports-CfR-HNOU.mjs";
import { M as WEATHER_FORECAST, T as PRIORITY_ALERTS, i as useAccess } from "./access-store-ohDhqBrz.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { g as Link, l as useRouterState, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { K as House, P as Menu, R as MapPin, S as ShieldAlert, St as ArrowLeft, W as Leaf, bt as Bell, m as Trash2, t as X, x as ShieldCheck, z as LogOut } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-CLJVa-rL.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatNumber(n) {
	const rounded = Math.round(n);
	return (rounded < 0 ? "-" : "") + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function resetAllEcoKinData() {
	if (typeof window === "undefined") return;
	try {
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const k = localStorage.key(i);
			if (k && k.startsWith("ecokin_")) localStorage.removeItem(k);
		}
	} catch {}
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/site-nav-B-Or7zPf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var K_USER = "ecokin_user_v1";
var EVT = "ecokin:user";
var DEFAULT_USER = {
	id: "citoyen-anonyme",
	name: "Citoyen",
	role: "citoyen",
	points: 0,
	reports: 0,
	badges: [],
	registered: false
};
function read(key) {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function write(key, data) {
	if (typeof window === "undefined") return;
	localStorage.setItem(key, JSON.stringify(data));
	window.dispatchEvent(new Event(EVT));
}
function userFromRecord(record) {
	return {
		id: record.id,
		name: record.name,
		role: record.role,
		commune: record.commune,
		phone: record.phone,
		points: record.points,
		reports: record.reports,
		badges: record.badges,
		registered: true
	};
}
function readUser() {
	const stored = read(K_USER);
	if (!stored) return DEFAULT_USER;
	if (stored.role === "citoyen" && stored.registered && stored.id) {
		const record = findUserByCredentials("citoyen", stored.phone ?? "", "");
		if (record && record.id === stored.id) return userFromRecord(record);
	}
	return {
		...DEFAULT_USER,
		...stored
	};
}
function useEcoUser() {
	const [user, setUser] = (0, import_react.useState)(readUser);
	const refresh = (0, import_react.useCallback)(() => {
		setUser(readUser());
	}, []);
	(0, import_react.useEffect)(() => {
		refresh();
		const h = () => refresh();
		window.addEventListener(EVT, h);
		window.addEventListener("storage", h);
		return () => {
			window.removeEventListener(EVT, h);
			window.removeEventListener("storage", h);
		};
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		if (!read(K_USER)) {
			write(K_USER, DEFAULT_USER);
			refresh();
		}
	}, [refresh]);
	return {
		user,
		login(u) {
			write(K_USER, u);
			setUser(u);
		},
		logout() {
			if (typeof window === "undefined") return;
			localStorage.removeItem(K_USER);
			setUser(DEFAULT_USER);
			window.dispatchEvent(new Event(EVT));
		},
		register(input) {
			const normalizedPhone = input.phone.trim();
			if (!normalizedPhone) return false;
			const record = findUserByCredentials("citoyen", normalizedPhone, input.pin);
			const next = userFromRecord(record ? record : upsertUser({
				role: "citoyen",
				identifier: normalizedPhone,
				password: input.pin,
				name: input.name,
				phone: normalizedPhone,
				commune: input.commune,
				points: 0,
				reports: 0,
				badges: []
			}));
			write(K_USER, next);
			setUser(next);
			return true;
		},
		signIn(phone, pin) {
			const record = findUserByCredentials("citoyen", phone.trim(), pin);
			if (!record) return false;
			const next = userFromRecord(record);
			write(K_USER, next);
			setUser(next);
			return true;
		},
		spend(cost) {
			if (user.points < cost) return false;
			if (!user.registered) return false;
			const updated = updateUser(user.id, { points: user.points - cost });
			if (!updated) return false;
			const next = userFromRecord(updated);
			write(K_USER, next);
			setUser(next);
			return true;
		}
	};
}
var READ_KEY = "ecokin_alerts_read_v1";
function NotificationBell() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [readIds, setReadIds] = (0, import_react.useState)([]);
	const ref = (0, import_react.useRef)(null);
	const { items: live } = useLiveReports();
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(READ_KEY);
			if (raw) setReadIds(JSON.parse(raw));
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !("Notification" in window)) return;
		if (Notification.permission === "default") try {
			Notification.requestPermission();
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		const onClick = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, []);
	const weatherAlert = WEATHER_FORECAST.find((d) => d.floodRisk === "critique" || d.floodRisk === "eleve");
	const allAlerts = [
		...live.slice(0, 8).map((r) => ({
			id: r.id,
			level: r.urgency === "critique" ? "critique" : r.urgency === "eleve" ? "eleve" : r.urgency === "moyen" ? "moyen" : "faible",
			msg: `${URGENCY_META[r.urgency].label} · ${r.category} à ${r.commune}${r.ack ? " ✓" : ""}`,
			kind: "signalement"
		})),
		...PRIORITY_ALERTS.map((a) => ({
			id: a.id,
			level: a.level,
			msg: a.msg,
			kind: "priorité"
		})),
		...weatherAlert ? [{
			id: "weather",
			level: weatherAlert.floodRisk,
			msg: `Pluies ${weatherAlert.rainMm} mm – ${weatherAlert.day} · risque ${weatherAlert.floodRisk}`,
			kind: "météo"
		}] : []
	];
	const unread = allAlerts.filter((a) => !readIds.includes(a.id)).length;
	const markRead = () => {
		const ids = allAlerts.map((a) => a.id);
		setReadIds(ids);
		localStorage.setItem(READ_KEY, JSON.stringify(ids));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => {
				setOpen((o) => !o);
				if (!open) markRead();
			},
			className: "relative grid size-9 place-items-center rounded-full border border-border hover:bg-muted",
			"aria-label": "Alertes prioritaires",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white",
				children: unread
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border bg-kin px-4 py-3 text-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] uppercase tracking-widest text-white/60",
					children: "Notifications temps réel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display text-sm font-bold",
					children: [allAlerts.length, " notifications actives"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "max-h-96 divide-y divide-border overflow-y-auto",
				children: [allAlerts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "p-6 text-center text-xs text-muted-foreground",
					children: "Aucune notification pour l'instant."
				}), allAlerts.map((a) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3 p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid size-8 shrink-0 place-items-center rounded-lg ${a.level === "critique" ? "text-red-600 bg-red-500/10" : a.level === "eleve" ? "text-orange-600 bg-orange-500/10" : a.level === "moyen" ? "text-amber-600 bg-amber-500/10" : "text-emerald-600 bg-emerald-500/10"}`,
							children: a.kind === "signalement" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
									children: a.kind
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-[10px] font-bold uppercase tracking-widest ${a.level === "critique" ? "text-red-600" : a.level === "eleve" ? "text-orange-600" : a.level === "moyen" ? "text-amber-600" : "text-emerald-600"}`,
									children: a.level
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-foreground",
								children: a.msg
							})]
						})]
					}, a.id);
				})]
			})]
		})]
	});
}
var NAV = [{
	to: "/menagers",
	label: "Déchets ménagers",
	icon: House
}, {
	to: "/signaler",
	label: "Dépôts sauvages",
	icon: Trash2
}];
function SiteNav({ minimal } = {}) {
	const router = useRouter();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const { user } = useEcoUser();
	const { session, logout } = useAccess();
	const [open, setOpen] = (0, import_react.useState)(false);
	const isAuthority = session.role !== "citoyen";
	const authorityLink = session.role === "gouverneur" ? {
		to: "/gouverneur",
		label: "Espace Gouverneur",
		icon: ShieldCheck
	} : session.role === "bourgmestre" ? {
		to: "/bourgmestre",
		label: "Espace Bourgmestre",
		icon: ShieldCheck
	} : session.role === "admin" ? {
		to: "/admin",
		label: "Administration",
		icon: ShieldCheck
	} : session.role === "agent" ? {
		to: "/agent",
		label: "Espace Agent",
		icon: ShieldCheck
	} : null;
	const links = isAuthority ? authorityLink ? [authorityLink] : [] : NAV;
	const handleBack = () => {
		if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
		else router.navigate({ to: "/" });
	};
	if (pathname === "/") return null;
	if (minimal) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: handleBack,
				className: "inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Retour"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), " Accueil"]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: `sticky top-0 z-50 border-b backdrop-blur-md ${isAuthority ? "border-slate-800/60 bg-[linear-gradient(135deg,#071523_0%,#102f40_45%,#0f3b2a_100%)] text-white" : "border-border bg-background/85 text-foreground"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 place-items-center rounded-xl bg-eco text-white shadow-sm shadow-eco/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-xl font-bold tracking-tight",
						children: ["EcoKin ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-eco",
							children: "Smart"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleBack,
						className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-sm font-medium transition-colors ${isAuthority ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Retour"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-sm font-medium transition-colors ${isAuthority ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Accueil"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden items-center gap-2 md:flex",
					children: links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: l.to,
						className: `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`,
						activeProps: { className: isAuthority ? "text-white bg-white/10" : "text-eco bg-eco/5" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(l.icon, { className: "size-4" }),
							" ",
							l.label
						]
					}, l.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden items-center gap-3 md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-xs font-semibold ${isAuthority ? "text-emerald-300" : "text-eco"}`,
								children: [formatNumber(user.points), " GP"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-[10px] uppercase tracking-widest ${isAuthority ? "text-white/70" : "text-muted-foreground"}`,
								children: session.role === "citoyen" ? user.name : session.name
							})]
						}),
						session.role === "citoyen" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: logout,
							className: `inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold ${isAuthority ? "border-white/20 text-white/80 hover:bg-white/10" : "border-border text-muted-foreground hover:bg-muted"}`,
							title: "Se déconnecter",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-3.5" }), " Sortir"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpen((o) => !o),
					className: "md:hidden",
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border bg-background md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							handleBack();
							setOpen(false);
						},
						className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Retour"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						onClick: () => setOpen(false),
						className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), " Accueil"]
					}),
					links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: l.to,
						onClick: () => setOpen(false),
						className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`,
						activeProps: { className: isAuthority ? "text-white bg-white/10" : "text-eco bg-eco/5" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(l.icon, { className: "size-4" }),
							" ",
							l.label
						]
					}, l.to)),
					isAuthority && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							logout();
							setOpen(false);
						},
						className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Se déconnecter"]
					})
				]
			})
		})]
	});
}
//#endregion
export { resetAllEcoKinData as a, formatNumber as i, useEcoUser as n, cn as r, SiteNav as t };
