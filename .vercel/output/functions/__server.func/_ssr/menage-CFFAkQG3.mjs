import { o as __toESM } from "../_runtime.mjs";
import { _ as KINSHASA_COMMUNES } from "./ecokin-db-CVUKc8qE.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as useEcoUser, r as cn, t as SiteNav } from "./site-nav-B-Or7zPf.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as Settings, I as Map, K as House, i as Users, lt as CircleCheck, m as Trash2, n as Wrench, rt as CreditCard, u as Truck } from "../_libs/lucide-react.mjs";
import { n as Label, r as useHouseholds, t as Input } from "./input-Ck_234xc.mjs";
import { t as Button } from "./button-Bk-W14TZ.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CEHf6yjo.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CeDh1Ly7.mjs";
import { t as require_leaflet_src } from "../_libs/leaflet.mjs";
import { a as MapContainer, i as Marker, n as Popup, t as TileLayer } from "../_libs/react-leaflet.mjs";
import { n as useFleet, t as FleetMap } from "./fleet-map-GoKlK5Sx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/menage-CFFAkQG3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = require_leaflet_src();
var Table = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "relative w-full overflow-auto",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
}));
Table.displayName = "Table";
var TableHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
}));
TableHeader.displayName = "TableHeader";
var TableBody = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
}));
TableBody.displayName = "TableBody";
var TableFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
}));
TableFooter.displayName = "TableFooter";
var TableRow = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
	ref,
	className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
	...props
}));
TableRow.displayName = "TableRow";
var TableHead = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
	ref,
	className: cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableHead.displayName = "TableHead";
var TableCell = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
	ref,
	className: cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableCell.displayName = "TableCell";
var TableCaption = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
}));
TableCaption.displayName = "TableCaption";
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function HouseholdList({ setView }) {
	const { households } = useHouseholds();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-row items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Ménages" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Liste des ménages enregistrés." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => setView("form"),
			children: "Ajouter un ménage"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdTable, { households }) })] });
}
function HouseholdTable({ households }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Nom" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Commune" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Quartier" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Adresse" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" })
	] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: households.map((household) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: household.name }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: household.commune }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: household.quartier }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: household.address }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: household.kind === "pme" ? "default" : "secondary",
			children: household.kind
		}) })
	] }, household.id)) })] });
}
function HouseholdForm() {
	const store = useHouseholds();
	const [kind, setKind] = (0, import_react.useState)("menage");
	const [name, setName] = (0, import_react.useState)("");
	const [commune, setCommune] = (0, import_react.useState)("");
	const [quartier, setQuartier] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [occupants, setOccupants] = (0, import_react.useState)(4);
	const [binType, setBinType] = (0, import_react.useState)("120L");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [gpsCoords, setGpsCoords] = (0, import_react.useState)(null);
	const getGpsCoordinates = () => {
		if (navigator.geolocation) navigator.geolocation.getCurrentPosition((position) => {
			setGpsCoords({
				lat: position.coords.latitude,
				lon: position.coords.longitude
			});
			toast.success("Coordonnées GPS récupérées avec succès.");
		}, (error) => {
			toast.error("Erreur lors de la récupération des coordonnées GPS.");
			console.error(error);
		});
		else toast.error("La géolocalisation n'est pas supportée par ce navigateur.");
	};
	const submit = () => {
		const newErrors = {};
		if (!name.trim()) newErrors.name = "Le nom est requis.";
		if (!commune) newErrors.commune = "La commune est requise.";
		if (!quartier.trim()) newErrors.quartier = "Le quartier est requis.";
		if (!address.trim()) newErrors.address = "L'adresse est requise.";
		if (!phone.trim()) newErrors.phone = "Le téléphone est requis.";
		setErrors(newErrors);
		if (Object.keys(newErrors).length > 0) return;
		store.registerHousehold({
			kind,
			name: name.trim(),
			commune,
			quartier: quartier.trim(),
			address: address.trim(),
			phone: phone.trim(),
			occupants: Math.max(1, occupants),
			binType,
			gps: gpsCoords
		});
		toast.success("Ménage enregistré avec succès.");
		setName("");
		setQuartier("");
		setAddress("");
		setPhone("");
		setErrors({});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Enregistrer un ménage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Remplissez le formulaire pour enregistrer un nouveau ménage." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: kind,
						onValueChange: (v) => setKind(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "menage",
							children: "Ménage"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "pme",
							children: "PME / Commerce"
						})] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
							"Nom ",
							kind === "pme" ? "de l'entreprise" : "du chef de ménage",
							" *"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Ex. Kabongo Mwamba",
							className: errors.name ? "border-red-500" : ""
						}),
						errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-red-600",
							children: errors.name
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Commune *" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: commune,
							onValueChange: setCommune,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: errors.commune ? "border-red-500" : "",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sélectionner…" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
								className: "max-h-72",
								children: KINSHASA_COMMUNES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.name,
									children: c.name
								}, c.id))
							})]
						}),
						errors.commune && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-red-600",
							children: errors.commune
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Quartier *" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: quartier,
							onChange: (e) => setQuartier(e.target.value),
							placeholder: "Ex. Salongo",
							className: errors.quartier ? "border-red-500" : ""
						}),
						errors.quartier && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-red-600",
							children: errors.quartier
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 md:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Adresse *" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: address,
							onChange: (e) => setAddress(e.target.value),
							placeholder: "N° / Avenue",
							className: errors.address ? "border-red-500" : ""
						}),
						errors.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-red-600",
							children: errors.address
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Téléphone *" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							placeholder: "+243…",
							className: errors.phone ? "border-red-500" : ""
						}),
						errors.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-red-600",
							children: errors.phone
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nombre d'occupants" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						max: 50,
						value: occupants,
						onChange: (e) => setOccupants(parseInt(e.target.value || "1"))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Coordonnées GPS" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: getGpsCoordinates,
							variant: "outline",
							children: "Obtenir les coordonnées"
						}), gpsCoords && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: [
								gpsCoords.lat.toFixed(5),
								", ",
								gpsCoords.lon.toFixed(5)
							]
						})]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: submit,
			className: "bg-eco text-white hover:bg-eco/90",
			children: "Enregistrer"
		})]
	})] });
}
var K_ZONES = "ecokin_collection_zones_v1";
var EVT = "ecokin:zones";
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
function useCollectionZones() {
	const [zones, setZones] = (0, import_react.useState)([]);
	const refresh = (0, import_react.useCallback)(() => {
		setZones(read(K_ZONES));
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
		if (read(K_ZONES).length === 0) {
			write(K_ZONES, [{
				id: "Z-1",
				name: "Point de regroupement Victoire",
				commune: "Kalamu",
				quartier: "Victoire",
				type: "regroupement",
				position: {
					lat: -4.333,
					lon: 15.305
				}
			}, {
				id: "Z-2",
				name: "Centre de tri de Limete",
				commune: "Limete",
				quartier: "Industriel",
				type: "tri",
				position: {
					lat: -4.35,
					lon: 15.34
				}
			}]);
			refresh();
		}
	}, [refresh]);
	return {
		zones,
		addZone(z) {
			const list = read(K_ZONES);
			const next = {
				...z,
				id: `Z-${Date.now().toString(36).toUpperCase()}`
			};
			write(K_ZONES, [next, ...list]);
			return next;
		}
	};
}
var zoneIcon = (0, import_leaflet_src.icon)({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41]
});
function CollectionZones() {
	const { zones } = useCollectionZones();
	const [selectedCommune, setSelectedCommune] = (0, import_react.useState)(null);
	const [selectedQuartier, setSelectedQuartier] = (0, import_react.useState)(null);
	const communesWithZones = [...new Set(zones.map((z) => z.commune))];
	const quartiersWithZones = selectedCommune ? [...new Set(zones.filter((z) => z.commune === selectedCommune).map((z) => z.quartier))] : [];
	const filteredZones = selectedQuartier ? zones.filter((z) => z.quartier === selectedQuartier) : selectedCommune ? zones.filter((z) => z.commune === selectedCommune) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Zones de collecte" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Points de collecte réels à Kinshasa." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				onValueChange: (value) => {
					setSelectedCommune(value);
					setSelectedQuartier(null);
				},
				value: selectedCommune || "",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-[180px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Commune" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: KINSHASA_COMMUNES.filter((c) => communesWithZones.includes(c.name)).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: c.name,
					children: c.name
				}, c.id)) })]
			}), selectedCommune && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				onValueChange: setSelectedQuartier,
				value: selectedQuartier || "",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-[180px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Quartier" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: quartiersWithZones.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: q,
					children: q
				}, q)) })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-[400px]",
			children: filteredZones.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
				center: [filteredZones[0].position.lat, filteredZones[0].position.lon],
				zoom: 14,
				scrollWheelZoom: false,
				style: {
					height: "100%",
					width: "100%"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
					attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
					url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				}), filteredZones.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
					icon: zoneIcon,
					position: [zone.position.lat, zone.position.lon],
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popup, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: zone.name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						zone.type
					] })
				}, zone.id))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Aucun point enregistré dans cette zone."
				})
			})
		})]
	})] });
}
function OperationalDashboard() {
	const { households } = useHouseholds();
	const { vehicles } = useFleet();
	const totalHouseholds = households.length;
	const activeHouseholds = households.length;
	const availableVehicles = vehicles.filter((v) => v.status === "en_service").length;
	const activeVehicles = vehicles.filter((v) => v.status === "en_service").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				label: "Ménages enregistrés",
				value: totalHouseholds.toString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-eco" }),
				sub: "Total des ménages et PME"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				label: "Ménages actifs",
				value: activeHouseholds.toString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-green-500" }),
				sub: "Abonnement à jour"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				label: "Véhicules disponibles",
				value: `${availableVehicles} / ${vehicles.length}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-5 text-urban" }),
				sub: "En service aujourd'hui"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				label: "Véhicules en activité",
				value: activeVehicles.toString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-5 text-primary" }),
				sub: "En cours de collecte"
			})
		]
	});
}
function StatCard({ label, value, sub, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
					children: label
				}), icon]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 font-display text-xl font-bold",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-muted-foreground",
				children: sub
			})
		]
	}) });
}
function Payments() {
	const { households, updateHousehold } = useHouseholds();
	const togglePaymentStatus = (household) => {
		const newStatus = household.paymentStatus === "paid" ? "unpaid" : "paid";
		updateHousehold(household.id, { paymentStatus: newStatus });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Paiements" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Statut de paiement des ménages." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Nom" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Commune" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Action" })
	] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: households.map((household) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: household.name }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: household.commune }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: household.paymentStatus === "paid" ? "default" : "destructive",
			children: household.paymentStatus === "paid" ? "Payé" : "Non payé"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => togglePaymentStatus(household),
			children: "Changer le statut"
		}) })
	] }, household.id)) })] }) })] });
}
function MenageRoute() {
	const [view, setView] = (0, import_react.useState)("dashboard");
	const { user, login } = useEcoUser();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full flex-col bg-muted/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			view,
			setView,
			user,
			login
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:gap-4 sm:py-4 sm:pl-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, { minimal: true })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8",
					children: [
						view === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperationalDashboard, {}),
						view === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdList, { setView }),
						view === "form" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdForm, {}),
						view === "fleet" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Suivi de la flotte" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Localisation en temps réel des véhicules de collecte." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "h-[500px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FleetMap, {})
						})] }),
						view === "zones" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionZones, {}),
						view === "payments" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Payments, {})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
			]
		})]
	});
}
function AppSidebar({ view, setView, user, login }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "flex flex-col items-center gap-4 px-2 sm:py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					className: "group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 transition-all group-hover:scale-110" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "EcoKin Smart"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					onClick: () => setView("dashboard"),
					className: `flex h-9 w-9 items-center justify-center rounded-lg ${view === "dashboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Dashboard"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					onClick: () => setView("list"),
					className: `flex h-9 w-9 items-center justify-center rounded-lg ${view === "list" || view === "form" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Households"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					onClick: () => setView("fleet"),
					className: `flex h-9 w-9 items-center justify-center rounded-lg ${view === "fleet" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Suivi des véhicules"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					onClick: () => setView("zones"),
					className: `flex h-9 w-9 items-center justify-center rounded-lg ${view === "zones" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Collection Zones"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					onClick: () => setView("payments"),
					className: `flex h-9 w-9 items-center justify-center rounded-lg ${view === "payments" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Paiements"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "mt-auto flex flex-col items-center gap-4 px-2 sm:py-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full px-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: user?.role,
					onValueChange: (role) => {
						const newUser = {
							id: user?.id || "U-1",
							name: role,
							role,
							points: user?.points ?? 0,
							reports: user?.reports ?? 0,
							badges: user?.badges ?? [],
							registered: user?.registered ?? false
						};
						if (role === "bourgmestre") newUser.commune = "Kalamu";
						login(newUser);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-full h-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "citoyen",
							children: "Citoyen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "bourgmestre",
							children: "Bourgmestre"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "gouverneur",
							children: "Gouverneur"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "admin",
							children: "Admin"
						})
					] })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "#",
				onClick: () => setView("settings"),
				className: `flex h-9 w-9 items-center justify-center rounded-lg ${view === "settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Settings"
				})]
			})]
		})]
	});
}
//#endregion
export { MenageRoute as component };
