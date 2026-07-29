import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as useAgentTracking, r as URGENCY_META, s as useLiveReports } from "./live-reports-YSvqXRNr.mjs";
import { i as filterReportsByScope } from "./dashboard-analytics-D5gdVAdN.mjs";
import { t as SiteNav } from "./site-nav-C_XHakXe.mjs";
import { i as useAccess } from "./access-store-ClkdaLJp.mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { L as MapPinned, U as LoaderCircle, ft as Check, j as Play, mt as Camera, nt as Crosshair, o as UserRound, t as X } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bk-W14TZ.mjs";
import { t as SiteFooter } from "./site-footer-BJ1tNBrS.mjs";
import { t as AccessGate } from "./access-gate-BVebF8pM.mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CeDh1Ly7.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-Cm2aS8QX.mjs";
import { t as ClientOnly } from "./client-only-BPSORI3B.mjs";
import { t as InteractiveMap } from "./interactive-map-ChYsruto.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-CZpUYQUK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InterventionValidation({ report, onStart, onCaptureBefore, onCaptureAfter, onComplete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			report.status === "assignee" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: onStart,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-1 size-3" }), " Démarrer"]
			}),
			report.status === "en_cours" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onCaptureBefore,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-1 size-3" }),
						" Avant ",
						report.photoBefore ? "✓" : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onCaptureAfter,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-1 size-3" }),
						" Après ",
						report.photoAfter ? "✓" : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: onComplete,
					className: "bg-eco text-white hover:bg-eco/90",
					disabled: !report.photoBefore || !report.photoAfter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3" }), " Valider"]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [report.photoBefore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: report.photoBefore,
					alt: "Avant intervention",
					className: "h-8 w-8 rounded-md object-cover"
				}), report.photoAfter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: report.photoAfter,
					alt: "Après intervention",
					className: "h-8 w-8 rounded-md object-cover"
				})]
			})
		]
	});
}
function PhotoCapture({ report, type, onCapture, onClose }) {
	const videoRef = (0, import_react.useRef)(null);
	const [stream, setStream] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let isActive = true;
		(async () => {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
				if (isActive && videoRef.current) {
					videoRef.current.srcObject = mediaStream;
					setStream(mediaStream);
				}
			} catch (err) {
				console.error("Erreur d'accès à la caméra:", err);
				onClose();
			}
		})();
		return () => {
			isActive = false;
			stream?.getTracks().forEach((track) => track.stop());
		};
	}, [onClose, stream]);
	const handleCapture = () => {
		if (!videoRef.current) return;
		const canvas = document.createElement("canvas");
		canvas.width = videoRef.current.videoWidth;
		canvas.height = videoRef.current.videoHeight;
		canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
		onCapture(canvas.toDataURL("image/jpeg", .8));
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-2xl rounded-2xl bg-card p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: [
					"Photo ",
					type === "before" ? "Avant" : "Après",
					" - ",
					report.id
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Cadrez la zone d'intervention." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					autoPlay: true,
					playsInline: true,
					className: "mt-4 aspect-video w-full rounded-lg bg-muted object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex justify-center gap-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleCapture,
						size: "lg",
						className: "rounded-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-2 size-5" }), " Capturer"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onClose,
					variant: "ghost",
					size: "icon",
					className: "absolute right-2 top-2 rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})
			]
		})
	});
}
function AgentDashboard() {
	const { session } = useAccess();
	const { items: allReports, setStatus, setPhoto } = useLiveReports();
	const { updatePosition } = useAgentTracking();
	const [userPosition, setUserPosition] = (0, import_react.useState)(null);
	const [geoStatus, setGeoStatus] = (0, import_react.useState)("loading");
	const [capturing, setCapturing] = (0, import_react.useState)(null);
	const handlePhotoCapture = (reportId, type, dataUrl) => {
		if (session) setPhoto(reportId, type, dataUrl, session.name);
	};
	(0, import_react.useEffect)(() => {
		if (typeof navigator !== "undefined" && navigator.geolocation) {
			const watchId = navigator.geolocation.watchPosition((pos) => {
				setUserPosition({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude
				});
				if (session.userId && session.commune) updatePosition(session.userId, session.name, session.commune, {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
					accuracy: pos.coords.accuracy
				});
				setGeoStatus("ok");
			}, () => setGeoStatus("error"), {
				enableHighAccuracy: true,
				timeout: 1e4,
				maximumAge: 0
			});
			return () => navigator.geolocation.clearWatch(watchId);
		} else setGeoStatus("error");
	}, [
		session.commune,
		session.name,
		session.userId,
		updatePosition
	]);
	const assignedReports = (0, import_react.useMemo)(() => {
		return filterReportsByScope(allReports, session);
	}, [allReports, session]);
	const todoReports = (0, import_react.useMemo)(() => {
		return assignedReports.filter((r) => r.status === "assignee" || r.status === "en_cours");
	}, [assignedReports]);
	const doneReports = (0, import_react.useMemo)(() => {
		return assignedReports.filter((r) => r.status === "terminee");
	}, [assignedReports]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "container py-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }), " Espace Agent de terrain"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-2 font-display text-4xl font-bold",
										children: "Tableau de Bord Opérationnel"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-muted-foreground",
										children: [
											"Missions du jour, signalements et interventions de ",
											session.commune ?? "votre commune",
											"."
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 rounded-xl border bg-background p-2 text-xs",
									children: [
										geoStatus === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GPS..." })] }),
										geoStatus === "ok" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-3 text-eco" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GPS Actif" })] }),
										geoStatus === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-3 text-red-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GPS Inactif" })] })
									]
								})]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "container py-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
									className: "pb-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm",
										children: "Missions actives"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "text-2xl font-bold",
									children: todoReports.length
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
									className: "pb-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm",
										children: "Interventions terminees"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "text-2xl font-bold",
									children: doneReports.length
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
									className: "pb-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm",
										children: "Signalements visibles"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "text-2xl font-bold",
									children: assignedReports.length
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							defaultValue: "missions",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "missions",
									children: [
										"Missions (",
										todoReports.length,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "history",
									children: [
										"Historique (",
										doneReports.length,
										")"
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "missions",
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-3",
											children: todoReports.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted-foreground",
												children: "Aucune mission assignée pour le moment."
											}) : todoReports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
													className: "flex items-center justify-between text-base",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: report.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[report.urgency].bg} ${URGENCY_META[report.urgency].color}`,
														children: URGENCY_META[report.urgency].label
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm text-muted-foreground capitalize",
													children: [
														report.category,
														" · ",
														report.commune
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
													className: "space-y-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground",
														children: report.description
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, {
													className: "flex flex-wrap gap-2",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterventionValidation, {
														report,
														onStart: () => setStatus(report.id, "en_cours", session.name),
														onCaptureBefore: () => setCapturing({
															report,
															type: "before"
														}),
														onCaptureAfter: () => setCapturing({
															report,
															type: "after"
														}),
														onComplete: () => setStatus(report.id, "terminee", session.name)
													})
												})
											] }, report.id))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPinned, { className: "size-4" }), " Carte des missions"]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
											fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[400px] animate-pulse rounded-lg bg-muted" }),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InteractiveMap, {
												commune: session.commune,
												reports: todoReports
											})
										}) })] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "history",
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Interventions terminées" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "divide-y divide-border",
										children: doneReports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-semibold",
												children: [
													report.id,
													" · ",
													report.category
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: new Date(report.history.find((h) => h.label.includes("terminee"))?.at ?? report.createdAt).toLocaleString("fr-FR")
											})]
										}, report.id))
									}) })] })
								})
							]
						})]
					}),
					capturing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoCapture, {
						report: capturing.report,
						type: capturing.type,
						onClose: () => setCapturing(null),
						onCapture: (dataUrl) => handlePhotoCapture(capturing.report.id, capturing.type, dataUrl)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {
	required: ["agent"],
	title: "Tableau de Bord Agent",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentDashboard, {})
});
//#endregion
export { SplitComponent as component };
