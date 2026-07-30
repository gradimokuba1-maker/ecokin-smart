import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { H as LocateFixed, T as Search, U as LoaderCircle } from "../_libs/lucide-react.mjs";
import { U as DEFAULT_CITY, j as REPORTS, q as haversineMeters } from "./router-C5nfmudE.mjs";
import { c as useLiveReports, n as SiteNav } from "./site-nav-7GSWuwOx.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as ClientOnly } from "./client-only-DU1fAtk9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/carte-BtJxUMyA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_COLOR = {
	nouveau: "#ef4444",
	en_attente: "#ef4444",
	assignee: "#f59e0b",
	en_cours: "#f59e0b",
	collecte: "#0ea5e9",
	resolu: "#10b981",
	terminee: "#10b981"
};
var STATUS_LABEL = {
	nouveau: "Nouveau",
	en_attente: "Nouveau",
	assignee: "Assigné",
	en_cours: "En cours",
	collecte: "Collecté",
	resolu: "Résolu",
	terminee: "Résolu"
};
function KinshasaMap({ city, reports, height = 560, picker, followUser = true, onUserLocation }) {
	const containerRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const clusterRef = (0, import_react.useRef)(null);
	const userMarkerRef = (0, import_react.useRef)(null);
	const accuracyCircleRef = (0, import_react.useRef)(null);
	const pickerMarkerRef = (0, import_react.useRef)(null);
	const LRef = (0, import_react.useRef)(null);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [suggestions, setSuggestions] = (0, import_react.useState)([]);
	const [userPos, setUserPos] = (0, import_react.useState)(null);
	const [mapReady, setMapReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			const L = (await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.n()))).default;
			await import("./leaflet-BtgLLS8b.mjs").then((n) => n.t).then((n) => n.t);
			await import("../_libs/leaflet.markercluster.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			await Promise.resolve({});
			await Promise.resolve({});
			if (cancelled || !containerRef.current) return;
			LRef.current = L;
			const map = L.map(containerRef.current, {
				zoomControl: true,
				scrollWheelZoom: true,
				preferCanvas: true
			}).setView(city.center, city.defaultZoom);
			mapRef.current = map;
			map.setMaxBounds(L.latLngBounds(city.bounds[0], city.bounds[1]).pad(.15));
			L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
				attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
				maxZoom: 19
			}).addTo(map);
			city.communes.forEach((c) => {
				L.circleMarker(c.center, {
					radius: 4,
					color: "#10b981",
					weight: 2,
					fillColor: "#10b981",
					fillOpacity: .5
				}).bindTooltip(c.name, { direction: "top" }).addTo(map);
			});
			const cluster = L.markerClusterGroup({
				chunkedLoading: true,
				maxClusterRadius: 55,
				showCoverageOnHover: false
			});
			clusterRef.current = cluster;
			map.addLayer(cluster);
			setTimeout(() => map.invalidateSize(), 120);
			setMapReady(true);
		})();
		return () => {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, [city.id]);
	(0, import_react.useEffect)(() => {
		if (!mapReady || !clusterRef.current || !LRef.current) return;
		const L = LRef.current;
		const cluster = clusterRef.current;
		cluster.clearLayers();
		const userLL = userPos ? [userPos.lat, userPos.lng] : null;
		reports.forEach((r) => {
			if (!Number.isFinite(r.lat) || !Number.isFinite(r.lng)) return;
			const color = STATUS_COLOR[r.status ?? "nouveau"] ?? "#ef4444";
			const label = STATUS_LABEL[r.status ?? "nouveau"] ?? "Nouveau";
			const marker = L.circleMarker([r.lat, r.lng], {
				radius: 8,
				color: "#fff",
				weight: 2,
				fillColor: color,
				fillOpacity: .9
			});
			const dist = userLL ? haversineMeters(userLL, [r.lat, r.lng]) : null;
			const distStr = dist == null ? "" : `<div style="color:#64748b;font-size:11px;margin-top:4px">📍 ${dist < 1e3 ? Math.round(dist) + " m" : (dist / 1e3).toFixed(1) + " km"} de vous</div>`;
			const photo = r.photoUrl ? `<img src="${r.photoUrl}" style="width:100%;max-height:120px;object-fit:cover;border-radius:6px;margin-bottom:6px" />` : "";
			const created = r.createdAt ? new Date(r.createdAt).toLocaleString("fr-FR") : "";
			marker.bindPopup(`<div style="min-width:180px;font-family:Inter,sans-serif">
          ${photo}
          <div style="font-weight:700">${r.id}</div>
          <div style="font-size:12px;color:#334155">${r.category ?? "Déchet"} · ${r.commune ?? ""}</div>
          <div style="margin-top:4px"><span style="background:${color};color:#fff;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700">${label}</span>${r.priorityScore != null ? ` <span style="font-size:11px;color:#64748b">priorité ${r.priorityScore}/100</span>` : ""}</div>
          ${r.description ? `<div style="font-size:12px;margin-top:4px">${r.description}</div>` : ""}
          <div style="font-size:11px;color:#64748b;margin-top:4px">${created}</div>
          ${distStr}
        </div>`);
			cluster.addLayer(marker);
		});
	}, [
		reports,
		mapReady,
		userPos
	]);
	(0, import_react.useEffect)(() => {
		if (!mapReady || !picker || !LRef.current || !mapRef.current) return;
		const L = LRef.current;
		if (pickerMarkerRef.current) {
			pickerMarkerRef.current.setLatLng([picker.lat, picker.lng]);
			return;
		}
		const icon = L.divIcon({
			className: "",
			html: `<div style="width:28px;height:28px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,.35);display:grid;place-items:center;color:#fff;font-weight:700;font-size:14px">📍</div>`,
			iconSize: [28, 28],
			iconAnchor: [14, 14]
		});
		const m = L.marker([picker.lat, picker.lng], {
			icon,
			draggable: true
		}).addTo(mapRef.current);
		m.bindTooltip("Glissez pour ajuster la position", {
			direction: "top",
			offset: [0, -12]
		}).openTooltip();
		m.on("dragend", () => {
			const p = m.getLatLng();
			picker.onChange(p.lat, p.lng);
		});
		mapRef.current.on("click", (e) => {
			m.setLatLng(e.latlng);
			picker.onChange(e.latlng.lat, e.latlng.lng);
		});
		pickerMarkerRef.current = m;
	}, [
		mapReady,
		picker?.lat,
		picker?.lng
	]);
	(0, import_react.useEffect)(() => {
		if (!followUser || typeof navigator === "undefined" || !navigator.geolocation) return;
		let firstFix = true;
		const wid = navigator.geolocation.watchPosition((p) => {
			const lat = p.coords.latitude;
			const lng = p.coords.longitude;
			const acc = p.coords.accuracy;
			setUserPos({
				lat,
				lng,
				accuracy: acc
			});
			onUserLocation?.(lat, lng, acc);
			if (!mapRef.current || !LRef.current) return;
			const L = LRef.current;
			if (!userMarkerRef.current) {
				const icon = L.divIcon({
					className: "",
					html: `<div style="width:18px;height:18px;background:#0ea5e9;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 6px rgba(14,165,233,.25)"></div>`,
					iconSize: [18, 18],
					iconAnchor: [9, 9]
				});
				userMarkerRef.current = L.marker([lat, lng], {
					icon,
					interactive: false
				}).addTo(mapRef.current);
				accuracyCircleRef.current = L.circle([lat, lng], {
					radius: acc,
					color: "#0ea5e9",
					weight: 1,
					fillOpacity: .08
				}).addTo(mapRef.current);
			} else {
				userMarkerRef.current.setLatLng([lat, lng]);
				accuracyCircleRef.current.setLatLng([lat, lng]);
				accuracyCircleRef.current.setRadius(acc);
			}
			if (firstFix) {
				firstFix = false;
				mapRef.current.setView([lat, lng], 15);
			}
		}, () => {}, {
			enableHighAccuracy: true,
			maximumAge: 1e4,
			timeout: 2e4
		});
		return () => navigator.geolocation.clearWatch(wid);
	}, [followUser, onUserLocation]);
	async function runSearch(q) {
		setQuery(q);
		if (q.trim().length < 3) {
			setSuggestions([]);
			return;
		}
		setSearching(true);
		try {
			const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=0&viewbox=${`${city.bounds[0][1]},${city.bounds[0][0]},${city.bounds[1][1]},${city.bounds[1][0]}`}&bounded=1&q=${encodeURIComponent(q + ", " + city.name)}`;
			const j = await (await fetch(url, { headers: { "Accept-Language": "fr" } })).json();
			setSuggestions(j.map((x) => ({
				label: x.display_name,
				lat: parseFloat(x.lat),
				lng: parseFloat(x.lon)
			})));
		} catch {
			setSuggestions([]);
		} finally {
			setSearching(false);
		}
	}
	function focusPlace(lat, lng) {
		mapRef.current?.setView([lat, lng], 16);
		setSuggestions([]);
	}
	function locateMe() {
		if (!userPos || !mapRef.current) {
			navigator.geolocation?.getCurrentPosition((p) => mapRef.current?.setView([p.coords.latitude, p.coords.longitude], 15), () => {}, { enableHighAccuracy: true });
			return;
		}
		mapRef.current.setView([userPos.lat, userPos.lng], 16);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		style: {
			height,
			width: "100%"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: containerRef,
				style: {
					height,
					width: "100%"
				},
				className: "overflow-hidden rounded-2xl border border-border bg-secondary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-3 right-3 top-3 z-[500] sm:right-auto sm:w-96",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur",
					children: [searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-eco" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (e) => runSearch(e.target.value),
						placeholder: `Rechercher commune, quartier, avenue à ${city.name}…`,
						className: "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					})]
				}), suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1 max-h-64 overflow-auto rounded-xl border border-border bg-card shadow-lg",
					children: suggestions.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => focusPlace(s.lat, s.lng),
						className: "w-full truncate px-3 py-2 text-left text-xs hover:bg-secondary",
						children: s.label
					}) }, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: locateMe,
				className: "absolute bottom-3 right-3 z-[500] inline-flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur hover:bg-secondary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-4 text-eco" }), " Ma position"]
			})
		]
	});
}
function CartePage() {
	const { items: live } = useLiveReports();
	const [status, setStatus] = (0, import_react.useState)("all");
	const all = (0, import_react.useMemo)(() => {
		const seed = REPORTS.map((r) => ({
			id: r.id,
			lat: r.lat,
			lng: r.lng,
			category: r.type,
			status: r.status === "nouveau" ? "nouveau" : r.status === "en_cours" ? "en_cours" : "resolu",
			createdAt: r.createdAt,
			description: r.description,
			commune: r.commune,
			priorityScore: void 0
		}));
		return [...live.filter((l) => l.lat != null && l.lng != null).map((l) => ({
			id: l.id,
			lat: l.lat,
			lng: l.lng,
			category: l.category,
			status: l.status === "en_attente" ? "nouveau" : l.status === "assignee" ? "en_cours" : l.status === "en_cours" ? "en_cours" : "resolu",
			createdAt: l.createdAt,
			description: l.description,
			commune: l.commune,
			priorityScore: l.priorityScore
		})), ...seed];
	}, [live]);
	const filtered = (0, import_react.useMemo)(() => {
		if (status === "all") return all;
		return all.filter((r) => r.status === status);
	}, [all, status]);
	const counts = (0, import_react.useMemo)(() => {
		const c = {
			nouveau: 0,
			en_cours: 0,
			collecte: 0,
			resolu: 0
		};
		all.forEach((r) => {
			if (r.status && c[r.status] !== void 0) c[r.status]++;
		});
		return c;
	}, [all]);
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
							children: "Carte SIG · 24 communes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-bold tracking-tight",
							children: "Cartographie SIG de Kinshasa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-muted-foreground",
							children: "Tous les signalements de Kinshasa, en temps réel, avec clustering intelligent, géolocalisation live et recherche de commune, quartier ou avenue."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-5 flex flex-wrap items-center gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-1 rounded-full bg-secondary p-1",
							children: [
								["all", `Tous (${all.length})`],
								["nouveau", `Nouveaux (${counts.nouveau ?? 0})`],
								["en_cours", `En cours (${counts.en_cours ?? 0})`],
								["collecte", `Collectés (${counts.collecte ?? 0})`],
								["resolu", `Résolus (${counts.resolu ?? 0})`]
							].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setStatus(id),
								className: `rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${status === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`,
								children: label
							}, id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-[620px] place-items-center rounded-2xl border border-border bg-secondary text-sm text-muted-foreground",
							children: "Chargement de la carte…"
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KinshasaMap, {
							city: DEFAULT_CITY,
							reports: filtered,
							height: 640,
							followUser: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
								color: "#ef4444",
								label: "Nouveau signalement"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
								color: "#f59e0b",
								label: "En cours de traitement"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
								color: "#0ea5e9",
								label: "Collecté"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
								color: "#10b981",
								label: "Résolu"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Legend({ color, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "size-4 rounded-full ring-2 ring-white",
			style: { background: color }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium",
			children: label
		})]
	});
}
//#endregion
export { CartePage as component };
