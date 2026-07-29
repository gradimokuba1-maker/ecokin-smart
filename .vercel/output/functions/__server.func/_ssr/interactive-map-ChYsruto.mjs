import { o as __toESM } from "../_runtime.mjs";
import { v as COLLECTION_POINTS, w as DEFAULT_CITY, y as COMMUNES } from "./ecokin-db-CJricvzN.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as URGENCY_META } from "./live-reports-YSvqXRNr.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/interactive-map-ChYsruto.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	transfert: {
		label: "Centre de transfert",
		color: "#0ea5e9",
		glyph: "T"
	},
	regroupement: {
		label: "Point de regroupement",
		color: "#f59e0b",
		glyph: "R"
	},
	valorisation: {
		label: "Centre de valorisation",
		color: "#10b981",
		glyph: "V"
	},
	traitement: {
		label: "Centre de traitement",
		color: "#6366f1",
		glyph: "X"
	},
	collecte: {
		label: "Zone de collecte",
		color: "#14b8a6",
		glyph: "C"
	},
	tri: {
		label: "Centre de tri",
		color: "#22c55e",
		glyph: "Tri"
	},
	recyclage: {
		label: "Recyclage",
		color: "#84cc16",
		glyph: "♻"
	}
};
function InteractiveMap({ commune, reports = [], heightClassName = "h-[420px]" }) {
	const containerRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			const L = (await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).default;
			await import("./leaflet-BtgLLS8b.mjs").then((n) => n.t).then((n) => n.t);
			if (cancelled || !containerRef.current) return;
			const focusedCommune = commune ? COMMUNES.find((item) => item.id === commune) : null;
			const map = L.map(containerRef.current, {
				zoomControl: true,
				scrollWheelZoom: true
			}).setView(focusedCommune?.center ?? DEFAULT_CITY.center, focusedCommune ? 14 : DEFAULT_CITY.defaultZoom);
			L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
				attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
				maxZoom: 19
			}).addTo(map);
			(focusedCommune ? [focusedCommune] : COMMUNES).forEach((item) => {
				L.circle(item.center, {
					radius: focusedCommune ? 1900 : 1200,
					color: item.color,
					weight: 1.6,
					opacity: .55,
					fillOpacity: .06,
					dashArray: "5 5"
				}).bindTooltip(`Commune de ${item.name}`, { direction: "top" }).addTo(map);
			});
			COLLECTION_POINTS.filter((point) => !commune || point.commune === commune).forEach((point) => {
				const meta = ICONS[point.kind] ?? ICONS.collecte;
				L.marker([point.lat, point.lng], { icon: L.divIcon({
					className: "",
					html: `<div style="background:${meta.color};color:#fff;width:28px;height:28px;display:grid;place-items:center;border-radius:8px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);font:800 10px/1 Inter,sans-serif;">${meta.glyph}</div>`,
					iconSize: [28, 28],
					iconAnchor: [14, 14]
				}) }).bindPopup(`<strong>${point.name}</strong><br/>${meta.label}`).addTo(map);
			});
			reports.forEach((report) => {
				if (!report.lat || !report.lng) return;
				const meta = URGENCY_META[report.urgency];
				const fillColor = report.urgency === "critique" ? "#ef4444" : report.urgency === "eleve" ? "#f97316" : "#10b981";
				const radius = report.urgency === "critique" ? 10 : report.urgency === "eleve" ? 8 : 6;
				const iconHtml = `<div style="background:${fillColor};color:#fff;width:${radius * 2}px;height:${radius * 2}px;display:grid;place-items:center;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);font:800 9px/1 Inter,sans-serif;">!</div>`;
				L.marker([report.lat, report.lng], { icon: L.divIcon({
					className: "",
					html: iconHtml,
					iconSize: [radius * 2, radius * 2],
					iconAnchor: [radius, radius]
				}) }).bindPopup(`
            <div style="min-width:220px;font-family:Inter,sans-serif;font-size:12px;">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${report.id}</div>
              <div style="display:flex;gap:4px;margin-bottom:6px;">
                <span style="background:${fillColor};color:#fff;padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:700;text-transform:uppercase;">
                  ${meta.label}
                </span>
                <span style="background:#f1f5f9;padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:600;text-transform:capitalize;">
                  ${report.category}
                </span>
              </div>
              <div style="border-top:1px solid #e2e8f0;padding-top:6px;margin-top:4px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;">
                  ${report.commune ? `<div><span style="color:#64748b;">Commune :</span> <strong>${report.commune}</strong></div>` : ""}
                  ${report.volumeM3 ? `<div><span style="color:#64748b;">Volume :</span> <strong>${report.volumeM3} m³</strong></div>` : ""}
                  ${report.weightTons ? `<div><span style="color:#64748b;">Poids :</span> <strong>${report.weightTons} t</strong></div>` : ""}
                  ${report.priorityScore ? `<div><span style="color:#64748b;">Priorité :</span> <strong>${report.priorityScore}/100</strong></div>` : ""}
                </div>
                ${report.composition && report.composition.length > 0 ? `
                  <div style="margin-top:4px;font-size:10px;color:#64748b;">
                    Composition : ${report.composition.map((c) => `${c.material} ${c.percentage}%`).join(" · ")}
                  </div>
                ` : ""}
                ${report.dimensions ? `
                  <div style="margin-top:2px;font-size:10px;color:#64748b;">
                    ${report.dimensions.lengthM}m × ${report.dimensions.widthM}m × ${report.dimensions.heightAvgM}m
                  </div>
                ` : ""}
              </div>
              <div style="margin-top:6px;font-size:10px;color:#94a3b8;">
                ${new Date(report.createdAt).toLocaleString("fr-FR")}
              </div>
            </div>
          `).addTo(map);
			});
			mapRef.current = map;
			setTimeout(() => map.invalidateSize(), 120);
		})();
		return () => {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, [commune, reports]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: containerRef,
		className: `${heightClassName} w-full overflow-hidden rounded-lg border bg-secondary`
	});
}
//#endregion
export { InteractiveMap as t };
