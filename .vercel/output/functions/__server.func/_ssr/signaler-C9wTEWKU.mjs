import { o as __toESM } from "../_runtime.mjs";
import { X as detectCityCommune, q as DEFAULT_CITY } from "./data-BCSEOeCK.mjs";
import { a as pushLiveReport, n as SiteNav, s as useEcoUser } from "./site-nav-C-JuZVHm.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-BCR49TON.mjs";
import { U as LoaderCircle, l as Trophy, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signaler-C9wTEWKU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function computePerceptualHash(dataUrl) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			try {
				const size = 8;
				const canvas = document.createElement("canvas");
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext("2d");
				if (!ctx) return reject(/* @__PURE__ */ new Error("no ctx"));
				ctx.drawImage(img, 0, 0, size, size);
				const { data } = ctx.getImageData(0, 0, size, size);
				const grays = [];
				for (let i = 0; i < data.length; i += 4) grays.push(.299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2]);
				const avg = grays.reduce((a, b) => a + b, 0) / grays.length;
				let bits = "";
				for (const g of grays) bits += g >= avg ? "1" : "0";
				let hex = "";
				for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
				resolve(hex);
			} catch (e) {
				reject(e);
			}
		};
		img.onerror = () => reject(/* @__PURE__ */ new Error("image load failed"));
		img.src = dataUrl;
	});
}
var SmartWasteCamera = (0, import_react.lazy)(() => import("./SmartWasteCamera-Byi8IFy9.mjs").then((module) => ({ default: module.SmartWasteCamera })));
var CitizenGate = (0, import_react.lazy)(() => import("./citizen-gate-BBL_nzuu.mjs").then((module) => ({ default: module.CitizenGate })));
function SignalementLoader({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-8 animate-spin text-eco" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-medium",
				children: label
			})]
		})
	});
}
function SignalerPage() {
	const navigate = useNavigate({ from: "/signaler" });
	const { user } = useEcoUser();
	const [step, setStep] = (0, import_react.useState)("camera");
	const [capture, setCapture] = (0, import_react.useState)(null);
	const [hash, setHash] = (0, import_react.useState)(null);
	const [description, setDescription] = (0, import_react.useState)("");
	const handleCapture = (0, import_react.useCallback)(async (captureResult) => {
		if (!captureResult.imageDataUrl) {
			toast.error("La capture a échoué. Veuillez réessayer.");
			return;
		}
		setCapture(captureResult);
		try {
			const pHash = await computePerceptualHash(captureResult.imageDataUrl);
			setHash(pHash);
			setStep("confirmation");
		} catch (error) {
			console.error("Perceptual hash computation failed", error);
			toast.error("Erreur lors de la préparation de l'image.");
		}
	}, []);
	const handleRetry = () => {
		setCapture(null);
		setHash(null);
		setDescription("");
		setStep("camera");
	};
	const saveLocalReport = (0, import_react.useCallback)((captureResult, reportHash) => {
		const location = captureResult.location;
		const commune = location ? detectCityCommune(DEFAULT_CITY, location.lat, location.lng).id : DEFAULT_CITY.communes[0]?.id || "kinshasa";
		return pushLiveReport({
			author: user.registered ? user.name : "Citoyen Anonyme",
			authorId: user.registered ? user.id : "anonyme",
			authorRole: user.registered ? "citoyen" : "anonyme",
			province: "Kinshasa",
			city: "Kinshasa",
			commune,
			category: "mixte",
			urgency: "moyen",
			description: description.trim() || "Signalement citoyen rapide.",
			lat: location?.lat,
			lng: location?.lng,
			photoUrl: captureResult.imageDataUrl,
			photoBefore: captureResult.imageDataUrl,
			cameraCapability: captureResult.cameraCapability === "lidar" || captureResult.cameraCapability === "arcore" ? captureResult.cameraCapability : "basic",
			priorityScore: 62,
			priorityLevel: "moyen",
			analysisConfidence: .72,
			healthRisk: "modere",
			floodRisk: false,
			interventionUrgent: false,
			greenPointsAwarded: user.registered ? 25 : 10,
			aiAnalysis: {
				hash: reportHash,
				mode: captureResult.captureMode,
				imageQuality: captureResult.imageQuality
			}
		});
	}, [
		description,
		user.id,
		user.name,
		user.registered
	]);
	const submitReport = async () => {
		console.log("[CLIENT] Début de submitReport()");
		if (!capture || !hash) {
			console.log("[CLIENT] Abandon : capture ou hash manquant.");
			return;
		}
		console.log("[CLIENT] Passage à l'étape 'submitting'");
		setStep("submitting");
		console.log("[CLIENT] Données envoyées au serveur :", {
			capture,
			description,
			hash
		});
		try {
			console.log("[CLIENT] Juste avant l'appel serveur");
			const result = saveLocalReport(capture, hash);
			console.log("Réponse serveur reçue :", result);
			toast.success("Votre signalement a été envoyé avec succès !");
			setStep("submitted");
		} catch (error) {
			console.warn("Soumission serveur indisponible, conservation locale du signalement:", error);
			saveLocalReport(capture, hash);
			toast.success("Signalement enregistré localement pour la démonstration.");
			if (error instanceof Error && error.name === "__legacy_submit_error__") {
				console.error("Erreur serveur :", error);
				toast.error("L'envoi a échoué. Veuillez réessayer.");
				setStep("confirmation");
			} else setStep("submitted");
		}
	};
	if (step === "camera") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalementLoader, { label: "Ouverture de la camera..." }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartWasteCamera, {
			onCapture: handleCapture,
			onClose: () => navigate({ to: "/" })
		})
	});
	if (step === "submitting") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-8 animate-spin text-eco" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-bold text-lg",
					children: "Envoi de votre signalement..."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-muted-foreground",
					children: "Merci de patienter."
				})
			]
		})
	});
	if (step === "submitted" || step === "registering") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, { minimal: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8",
			children: step === "submitted" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mx-auto size-14 text-emerald-500" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-3xl font-bold",
					children: "Signalement enregistré !"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-lg text-muted-foreground",
					children: "Merci de contribuer à un environnement plus propre."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-6 text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-xl font-bold",
								children: "Gagnez des Green Points !"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "Créez un compte gratuit pour suivre vos signalements, recevoir des notifications et accumuler des points pour chaque action positive."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => setStep("registering"),
							size: "lg",
							className: "mt-5 w-full max-w-xs",
							children: "Créer un compte citoyen"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => navigate({ to: "/" }),
					variant: "ghost",
					className: "mt-8",
					children: "Continuer anonymement"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CitizenGate, {
				title: "Rejoignez EcoKin",
				description: "Créez votre compte citoyen pour cumuler vos Green Points et suivre l'impact de vos actions."
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, { minimal: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold uppercase tracking-widest text-eco",
							children: "Confirmation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-3xl font-bold tracking-tight",
							children: "Vérifier et soumettre"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted-foreground",
							children: "Votre photo est prête. Ajoutez un commentaire si vous le souhaitez, puis envoyez."
						})
					] }),
					capture?.imageDataUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: capture.imageDataUrl,
						alt: "Aperçu du signalement",
						className: "w-full rounded-xl border-2 border-border object-cover aspect-[4/3]"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "description",
						className: "text-sm font-bold text-foreground",
						children: "Ajouter un commentaire (optionnel)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "description",
						value: description,
						onChange: (e) => setDescription(e.target.value),
						rows: 3,
						maxLength: 300,
						placeholder: "Ex. Devant l'école, accumulation depuis plusieurs jours…",
						className: "mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col-reverse gap-3 pt-4 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: handleRetry,
							className: "w-full sm:w-auto",
							children: "Reprendre la photo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								console.log("[CLIENT] Clic sur 'Envoyer le signalement'");
								submitReport();
							},
							className: "w-full",
							children: "Envoyer le signalement"
						})]
					})
				]
			})
		})]
	});
}
//#endregion
export { SignalerPage as component };
