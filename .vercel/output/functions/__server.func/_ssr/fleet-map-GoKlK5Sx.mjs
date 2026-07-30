import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as require_leaflet_src } from "../_libs/leaflet.mjs";
import { a as MapContainer, i as Marker, n as Popup, r as Polyline, t as TileLayer } from "../_libs/react-leaflet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fleet-map-GoKlK5Sx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = require_leaflet_src();
var K_VEHICLES = "ecokin_vehicles_v1";
var EVT = "ecokin:fleet";
function read(key) {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function write(key, list) {
	if (typeof window === "undefined") return;
	localStorage.setItem(key, JSON.stringify(list));
	window.dispatchEvent(new Event(EVT));
}
function useFleet() {
	const [vehicles, setVehicles] = (0, import_react.useState)([]);
	const refresh = (0, import_react.useCallback)(() => {
		setVehicles(read(K_VEHICLES));
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
		const interval = setInterval(() => {
			write(K_VEHICLES, vehicles.map((v) => {
				if (v.status === "en_service" && v.route && v.currentPosition) {
					const newLat = v.currentPosition.lat + (Math.random() - .5) * .001;
					const newLon = v.currentPosition.lon + (Math.random() - .5) * .001;
					return {
						...v,
						currentPosition: {
							lat: newLat,
							lon: newLon
						}
					};
				}
				return v;
			}));
		}, 5e3);
		return () => clearInterval(interval);
	}, [vehicles]);
	(0, import_react.useEffect)(() => {
		if (read(K_VEHICLES).length === 0) {
			write(K_VEHICLES, [
				{
					id: "V-1",
					plate: "AB-123-CD",
					type: "camion_benne",
					capacityKg: 5e3,
					status: "en_service",
					currentPosition: {
						lat: -4.325,
						lon: 15.322222
					},
					route: {
						name: "Collecte Matonge",
						path: [
							{
								lat: -4.325,
								lon: 15.322222
							},
							{
								lat: -4.328,
								lon: 15.323
							},
							{
								lat: -4.33,
								lon: 15.325
							}
						]
					}
				},
				{
					id: "V-2",
					plate: "EF-456-GH",
					type: "tricycle",
					capacityKg: 500,
					status: "en_service",
					currentPosition: {
						lat: -4.335,
						lon: 15.31
					}
				},
				{
					id: "V-3",
					plate: "IJ-789-KL",
					type: "moto",
					capacityKg: 100,
					status: "en_panne",
					currentPosition: {
						lat: -4.34,
						lon: 15.315
					}
				}
			]);
			refresh();
		}
	}, [refresh]);
	return {
		vehicles,
		addVehicle(v) {
			const list = read(K_VEHICLES);
			const next = {
				...v,
				id: `V-${Date.now().toString(36).toUpperCase()}`
			};
			write(K_VEHICLES, [next, ...list]);
			return next;
		},
		updateVehicle(id, patch) {
			write(K_VEHICLES, read(K_VEHICLES).map((x) => x.id === id ? {
				...x,
				...patch
			} : x));
		}
	};
}
var truckIcon = (0, import_leaflet_src.icon)({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41]
});
function getRouteCoordinates(route) {
	if (!route) return [];
	if (Array.isArray(route)) return route;
	return route.path.map((point) => [point.lat, point.lon]);
}
function FleetMap({ vehicles: controlledVehicles, selectedId, onSelect, height = 520 }) {
	const fleet = useFleet();
	const vehicles = controlledVehicles ?? fleet.vehicles.map((v) => ({
		id: v.id,
		plate: v.plate,
		driver: v.type === "camion_benne" ? "Camion" : v.type === "tricycle" ? "Tricycle" : "Vélo",
		current: v.currentPosition ? {
			lat: v.currentPosition.lat,
			lng: v.currentPosition.lon
		} : void 0,
		currentPosition: v.currentPosition,
		route: v.route
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
		center: [-4.325, 15.322222],
		zoom: 12,
		scrollWheelZoom: false,
		style: {
			height,
			width: "100%"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
			attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
			url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		}), vehicles.map((vehicle) => {
			const coords = vehicle.current ? [vehicle.current.lat, vehicle.current.lng] : void 0;
			const routeCoords = getRouteCoordinates(vehicle.route);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [coords && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
				icon: truckIcon,
				position: coords,
				eventHandlers: onSelect ? { click: () => onSelect(vehicle.id) } : void 0,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popup, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: vehicle.plate }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					vehicle.driver
				] })
			}), routeCoords.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Polyline, {
				positions: routeCoords,
				color: vehicle.id === selectedId ? "#10b981" : "blue"
			})] }, vehicle.id);
		})]
	});
}
//#endregion
export { useFleet as n, FleetMap as t };
