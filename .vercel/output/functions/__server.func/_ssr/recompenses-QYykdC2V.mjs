import { D as REWARDS, x as LEADERBOARD } from "./access-store-BeLmIsfR.mjs";
import { n as useEcoUser, t as SiteNav } from "./site-nav-BQEX1RbF.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { J as Gift, l as Trophy, v as Sparkles, xt as Award } from "../_libs/lucide-react.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recompenses-QYykdC2V.js
var import_jsx_runtime = require_jsx_runtime();
var BADGES = [
	{
		id: "eco",
		name: "Éco-Citoyen",
		desc: "10 signalements validés",
		color: "bg-eco"
	},
	{
		id: "sentinelle",
		name: "Sentinelle",
		desc: "Premier sur sa zone",
		color: "bg-urban"
	},
	{
		id: "champion",
		name: "Champion Smart City",
		desc: "Top 10 national",
		color: "bg-amber-500"
	}
];
function RecompensesPage() {
	const { user, spend } = useEcoUser();
	function claim(cost, name) {
		if (spend(cost)) toast.success(`Récompense « ${name} » débloquée !`);
		else toast.error("Solde insuffisant");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-secondary/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold uppercase tracking-widest text-eco",
							children: "Programme citoyen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold tracking-tight",
							children: "Green Points & Récompenses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-muted-foreground",
							children: "Chaque signalement validé rapporte des points. Échangez-les contre des avantages concrets auprès de nos partenaires."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl bg-gradient-to-br from-eco via-eco to-urban p-7 text-white shadow-xl shadow-eco/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " Votre solde"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 font-display text-6xl font-extrabold tracking-tight",
								children: user.points.toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-sm opacity-90",
								children: [
									"Green Points · ≈ ",
									(user.points * 4).toLocaleString(),
									" CDF"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-2xl font-bold",
										children: user.reports
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase tracking-widest opacity-80",
										children: "Signalements"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-2xl font-bold",
										children: "#248"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase tracking-widest opacity-80",
										children: "Rang national"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-2xl font-bold",
										children: user.badges.length
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase tracking-widest opacity-80",
										children: "Badges"
									})] })
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border bg-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "size-5 text-eco" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold",
								children: "Vos badges"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-3",
							children: BADGES.map((b) => {
								const owned = user.badges.includes(b.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: `flex items-center gap-4 rounded-xl border p-3 ${owned ? "border-eco/30 bg-eco/5" : "border-border bg-secondary opacity-60"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `grid size-10 place-items-center rounded-full text-white ${b.color}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-bold",
												children: b.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground",
												children: b.desc
											})]
										}),
										owned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-bold text-eco",
											children: "✓ Obtenu"
										})
									]
								}, b.id);
							})
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border bg-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-5 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-5 text-eco" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold",
								children: "Catalogue de récompenses"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: REWARDS.map((r) => {
								const enough = user.points >= r.cost;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between rounded-xl border border-border bg-background p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-semibold",
										children: r.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
										children: r.kind
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => claim(r.cost, r.name),
										disabled: !enough,
										className: `rounded-lg px-3 py-2 text-xs font-bold ${enough ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`,
										children: [r.cost.toLocaleString(), " GP"]
									})]
								}, r.id);
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border bg-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-5 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-5 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold",
								children: "Classement des citoyens"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: LEADERBOARD.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `grid size-8 place-items-center rounded-full text-xs font-bold ${l.rank === 1 ? "bg-amber-500 text-white" : l.rank === 2 ? "bg-slate-300 text-foreground" : l.rank === 3 ? "bg-amber-700 text-white" : "bg-secondary text-foreground"}`,
										children: l.rank
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-semibold",
										children: l.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [
											l.commune,
											" · ",
											l.reports,
											" signalements"
										]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-base font-bold text-eco",
									children: l.points.toLocaleString()
								})]
							}, l.rank))
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { RecompensesPage as component };
