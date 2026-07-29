import { o as __toESM } from "../_runtime.mjs";
import { X as detectCityCommune, q as DEFAULT_CITY } from "./data-BCSEOeCK.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-BCR49TON.mjs";
import { G as Images, U as LoaderCircle, d as TriangleAlert, mt as Camera, r as Video, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SmartWasteCamera-Byi8IFy9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function detectDepthSensor() {
	const nav = typeof navigator !== "undefined" ? navigator : void 0;
	if (typeof window === "undefined" || !nav || !("xr" in nav)) return {
		source: "ai",
		label: "IA (serveur/sans-XR)",
		supported: true
	};
	try {
		if (await nav.xr.isSessionSupported("immersive-ar")) {
			const session = await nav.xr.requestSession("immersive-ar", { requiredFeatures: ["depth-sensing"] }).catch(() => null);
			if (session) {
				session.end();
				const userAgent = navigator.userAgent || navigator.vendor || window.opera;
				const source = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream ? "arkit" : "arcore";
				return {
					source,
					label: source === "arkit" ? "ARKit Depth" : "ARCore Depth",
					supported: true,
					confidence: .85,
					resolution: {
						width: 256,
						height: 192
					}
				};
			}
		}
	} catch (e) {
		console.warn("WebXR depth sensing detection failed, may not be supported.", e);
	}
	if (Math.random() > .8) return {
		source: "tof",
		label: "Capteur ToF (simulé)",
		supported: true,
		confidence: .7,
		resolution: {
			width: 320,
			height: 240
		}
	};
	return {
		source: "ai",
		label: "IA monoculaire",
		supported: true,
		confidence: .6
	};
}
var getDepthAcquisition = async () => {
	try {
		return await detectDepthSensor();
	} catch (error) {
		console.error("Erreur lors de la détection du capteur de profondeur:", error);
		return {
			source: "ai",
			label: "IA monoculaire (fallback)",
			supported: true,
			confidence: .5
		};
	}
};
/**
* Demande la position GPS avec haute précision
* Retourne l'état GPS et les coordonnées
*/
function requestGPSPosition(options) {
	return new Promise((resolve) => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			resolve({ status: "unavailable" });
			return;
		}
		navigator.geolocation.getCurrentPosition((position) => {
			resolve({
				status: "ok",
				lat: position.coords.latitude,
				lng: position.coords.longitude,
				accuracy: position.coords.accuracy,
				altitudeM: position.coords.altitude ?? void 0
			});
		}, (error) => {
			if (error.code === error.PERMISSION_DENIED) resolve({ status: "denied" });
			else resolve({ status: "unavailable" });
		}, {
			enableHighAccuracy: true,
			timeout: options?.timeout ?? 15e3,
			maximumAge: options?.maximumAge ?? 6e4
		});
	});
}
/**
* Construit les informations de localisation complètes
* à partir des coordonnées GPS
*/
function buildLocationInfo(lat, lng, accuracy, altitudeM) {
	const commune = detectCityCommune(DEFAULT_CITY, lat, lng);
	return {
		lat: Math.round(lat * 1e5) / 1e5,
		lng: Math.round(lng * 1e5) / 1e5,
		accuracy: Math.round(accuracy),
		commune: commune.id,
		altitudeM: altitudeM == null ? void 0 : Math.round(altitudeM),
		capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
		quartier: estimateQuartier(lat, lng, commune.id),
		adresse: buildApproximateAddress(lat, lng, commune.name)
	};
}
/**
* Estimation du quartier basée sur les coordonnées
* (version simplifiée - à enrichir avec une base de données réelle)
*/
function estimateQuartier(lat, lng, communeId) {
	const communeQuartiers = {
		matete: [
			"Mokali",
			"Mabanga",
			"Kimpwanza",
			"Mazamba"
		],
		lemba: [
			"Lemba-Terminus",
			"Kindele",
			"Mama Mobutu",
			"Salongo"
		],
		kisenso: [
			"Kisenso",
			"Mikondo",
			"Kimbangu",
			"Mbanza-Lemba"
		],
		gombe: [
			"Gombe",
			"CBD",
			"Batetela",
			"Joli-Parc"
		],
		kintambo: [
			"Kintambo",
			"Mbinza",
			"Mbinza-Météo",
			"Mbinza-Upn"
		],
		bandalungwa: [
			"Bandal",
			"Bandal Tshibangu",
			"Bandal Mbanza"
		],
		"kasa-vubu": [
			"Kasa-Vubu",
			"Buma",
			"Mukulua"
		],
		kalamu: [
			"Kalamu",
			"Matonge",
			"Yolo",
			"Yolo-Nord"
		],
		bumbu: [
			"Bumbu",
			"Bumbu-Mbanza",
			"Mbanza-Bumbu"
		],
		makala: [
			"Makala",
			"Mbanza-Makala",
			"Ngaba-Makala"
		],
		selembao: [
			"Selembao",
			"Mbanza-Selembao",
			"Mikondo"
		],
		ngaba: [
			"Ngaba",
			"Mbanza-Ngaba",
			"Ngaba-Makala"
		],
		limete: [
			"Limete",
			"Limete-Industriel",
			"Limete-Résidentiel"
		],
		lingwala: [
			"Lingwala",
			"Lingwala-Mbanza",
			"Victoire"
		],
		kinshasa: [
			"Kinshasa",
			"Kinshasa-Mbanza",
			"Kinshasa-Centre"
		],
		barumbu: [
			"Barumbu",
			"Barumbu-Mbanza",
			"Mbanza-Barumbu"
		],
		"ngiri-ngiri": [
			"Ngiri-Ngiri",
			"Mbanza-Ngiri",
			"Ngiri-Mbanza"
		],
		"mont-ngafula": [
			"Mont-Ngafula",
			"Mbinza",
			"Mbinza-Météo",
			"Kimwenza"
		],
		ngaliema: [
			"Ngaliema",
			"Mbinza",
			"Mbinza-Upn",
			"Joli-Parc"
		],
		masina: [
			"Masina",
			"Masina-Mbanza",
			"Masina-Ngiri"
		],
		ndjili: [
			"N'djili",
			"Mbanza-Ndjili",
			"Ndjili-Mbanza"
		],
		nsele: [
			"N'sele",
			"Mbanza-Nsele",
			"Nsele-Mbanza"
		],
		maluku: [
			"Maluku",
			"Mbanza-Maluku",
			"Maluku-Mbanza"
		],
		kimbanseke: [
			"Kimbanseke",
			"Mbanza-Kimbanseke",
			"Kimbanseke-Mbanza"
		]
	}[communeId];
	if (!communeQuartiers || communeQuartiers.length === 0) return "Quartier non déterminé";
	return communeQuartiers[Math.abs(Math.round(lat * 1e3 + lng * 1e3)) % communeQuartiers.length];
}
/**
* Construit une adresse approximative
*/
function buildApproximateAddress(lat, lng, communeName) {
	const latDir = lat >= 0 ? "N" : "S";
	const lngDir = lng >= 0 ? "E" : "O";
	const latDeg = Math.abs(lat);
	const lngDeg = Math.abs(lng);
	return `${communeName}, Kinshasa (${latDir} ${latDeg.toFixed(4)}°, ${lngDir} ${lngDeg.toFixed(4)}°)`;
}
var MAX_VIDEO_SECONDS = 12;
var MULTI_PHOTO_COUNT = 3;
var MAX_ANALYSIS_IMAGE_EDGE = 1600;
var JPEG_QUALITY = .88;
var CAMERA_START_TIMEOUT_MS = 12e3;
function stopStream(stream) {
	stream?.getTracks().forEach((track) => track.stop());
}
async function requestPreferredCameraStream() {
	const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : void 0;
	if (!mediaDevices?.getUserMedia) throw new DOMException("L'API caméra n'est pas supportée sur ce navigateur.", "NotSupportedError");
	const constraints = {
		audio: false,
		video: {
			facingMode: "environment",
			width: { ideal: 1920 },
			height: { ideal: 1080 }
		}
	};
	try {
		return await mediaDevices.getUserMedia(constraints);
	} catch (e) {
		console.error("Failed to get ideal camera, trying fallback", e);
		try {
			return await mediaDevices.getUserMedia({
				audio: false,
				video: true
			});
		} catch (fallbackError) {
			console.error("Fallback camera request also failed", fallbackError);
			throw fallbackError;
		}
	}
}
function withCameraTimeout(promise) {
	return Promise.race([promise, new Promise((_, reject) => {
		window.setTimeout(() => reject(new DOMException("La camera ne repond pas.", "TimeoutError")), CAMERA_START_TIMEOUT_MS);
	})]);
}
function cameraErrorMessage(error) {
	const name = error instanceof Error ? error.name : "";
	if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") return "Autorisation de la caméra refusée. Activez-la dans les paramètres du navigateur pour continuer.";
	if (name === "NotFoundError" || name === "DevicesNotFoundError") return "Aucune caméra utilisable n’a été détectée sur cet appareil.";
	if (name === "NotReadableError" || name === "TrackStartError") return "La caméra est actuellement utilisée par une autre application ou un autre onglet.";
	return "Impossible d’accéder à la caméra. Vérifiez les autorisations et l'état de votre appareil, puis réessayez.";
}
function analysisDimensions(width, height) {
	const longestEdge = Math.max(width, height);
	if (longestEdge <= MAX_ANALYSIS_IMAGE_EDGE) return {
		width,
		height
	};
	const scale = MAX_ANALYSIS_IMAGE_EDGE / longestEdge;
	return {
		width: Math.max(1, Math.round(width * scale)),
		height: Math.max(1, Math.round(height * scale))
	};
}
function imageDataUrlFromSource(source, width, height, canvas) {
	const dimensions = analysisDimensions(width, height);
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	const context = canvas.getContext("2d", { alpha: false });
	if (!context) return null;
	context.drawImage(source, 0, 0, dimensions.width, dimensions.height);
	return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
function qualityFromDimensions(width, height) {
	const pixels = width * height;
	if (pixels >= 1280 * 720) return "excellent";
	if (pixels >= 960 * 540) return "correct";
	return "faible";
}
function dataUrlFromCanvas(video, canvas) {
	return imageDataUrlFromSource(video, video.videoWidth, video.videoHeight, canvas);
}
function SmartWasteCamera({ onCapture, onClose }) {
	const videoRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const mediaStreamRef = (0, import_react.useRef)(null);
	const [depthSensor, setDepthSensor] = (0, import_react.useState)(null);
	const [cameraPermission, setCameraPermission] = (0, import_react.useState)("idle");
	const [isProcessing, setIsProcessing] = (0, import_react.useState)(false);
	const [diag, setDiag] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		if (depthSensor) setDiag((d) => ({
			...d,
			depthSensor: {
				label: depthSensor.label,
				supported: depthSensor.supported,
				source: depthSensor.source,
				resolution: depthSensor.resolution,
				confidence: depthSensor.confidence
			}
		}));
	}, [depthSensor]);
	const [captureMode, setCaptureMode] = (0, import_react.useState)("multi");
	const [additionalPhotos, setAdditionalPhotos] = (0, import_react.useState)([]);
	const recorderRef = (0, import_react.useRef)(null);
	const recorderChunksRef = (0, import_react.useRef)([]);
	const recordingFramesRef = (0, import_react.useRef)([]);
	const recordingTimerRef = (0, import_react.useRef)(null);
	const recordingClockRef = (0, import_react.useRef)(null);
	const recordingSecondsRef = (0, import_react.useRef)(0);
	const videoUrlRef = (0, import_react.useRef)(null);
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [recordingSeconds, setRecordingSeconds] = (0, import_react.useState)(0);
	const handleClose = (0, import_react.useCallback)(() => {
		stopStream(mediaStreamRef.current);
		mediaStreamRef.current = null;
		onClose();
	}, [onClose]);
	(0, import_react.useEffect)(() => {
		let isCancelled = false;
		async function startCamera() {
			if (mediaStreamRef.current) return;
			setCameraPermission("requesting");
			setDiag({ status: "Requesting permissions..." });
			try {
				const stream = await withCameraTimeout(requestPreferredCameraStream());
				if (isCancelled) {
					stopStream(stream);
					return;
				}
				mediaStreamRef.current = stream;
				setDiag((d) => ({
					...d,
					getUserMedia: "OK",
					stream: "OUI",
					videoTracks: stream.getVideoTracks().length
				}));
				getDepthAcquisition().then((depth) => {
					if (!isCancelled) setDepthSensor(depth);
				});
				requestGPSPosition();
				setCameraPermission("granted");
			} catch (error) {
				if (isCancelled) return;
				const err = error instanceof Error ? error : new Error(String(error));
				console.error("Camera startup failed:", err);
				const name = err.name;
				setCameraPermission(name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError" ? "denied" : "unavailable");
				setDiag((d) => ({
					...d,
					getUserMedia: "ERREUR",
					error: {
						name: err.name,
						message: err.message
					}
				}));
			}
		}
		startCamera();
		return () => {
			isCancelled = true;
			stopStream(mediaStreamRef.current);
			mediaStreamRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const videoEl = videoRef.current;
		const stream = mediaStreamRef.current;
		if (cameraPermission !== "granted" || !stream || !videoEl) return;
		const playVideo = async () => {
			try {
				await videoEl.play();
				setDiag((d) => ({
					...d,
					isPlaying: !videoEl.paused,
					playAttempt: "success"
				}));
			} catch (error) {
				console.error("Video play failed:", error);
				const err = error instanceof Error ? error : new Error(String(error));
				setDiag((d) => ({
					...d,
					playError: {
						name: err.name,
						message: err.message
					},
					isPlaying: false
				}));
			}
		};
		setDiag((d) => ({
			...d,
			stream: {
				active: stream.active,
				tracks: stream.getVideoTracks().map((t) => ({
					id: t.id,
					enabled: t.enabled,
					muted: t.muted,
					readyState: t.readyState,
					kind: t.kind
				}))
			}
		}));
		const onLoadedMetadata = () => {
			setDiag((d) => ({
				...d,
				videoWidth: videoEl.videoWidth,
				videoHeight: videoEl.videoHeight,
				readyState: videoEl.readyState,
				event: "loadedmetadata"
			}));
		};
		const onCanPlay = () => {
			setDiag((d) => ({
				...d,
				event: "canplay"
			}));
			playVideo();
		};
		const onPlaying = () => setDiag((d) => ({
			...d,
			event: "playing",
			paused: videoEl.paused
		}));
		const onPause = () => setDiag((d) => ({
			...d,
			event: "pause"
		}));
		const onStalled = () => setDiag((d) => ({
			...d,
			event: "stalled"
		}));
		const onSuspend = () => setDiag((d) => ({
			...d,
			event: "suspend"
		}));
		const onWaiting = () => setDiag((d) => ({
			...d,
			event: "waiting"
		}));
		const onError = (e) => {
			const error = videoEl.error;
			setDiag((d) => ({
				...d,
				event: "error",
				videoError: {
					code: error?.code,
					message: error?.message
				}
			}));
		};
		if (videoEl.srcObject !== stream) videoEl.srcObject = stream;
		videoEl.addEventListener("loadedmetadata", onLoadedMetadata);
		videoEl.addEventListener("canplay", onCanPlay);
		videoEl.addEventListener("playing", onPlaying);
		videoEl.addEventListener("pause", onPause);
		videoEl.addEventListener("stalled", onStalled);
		videoEl.addEventListener("suspend", onSuspend);
		videoEl.addEventListener("waiting", onWaiting);
		videoEl.addEventListener("error", onError);
		if (videoEl.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) playVideo();
		return () => {
			videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
			videoEl.removeEventListener("canplay", onCanPlay);
			videoEl.removeEventListener("playing", onPlaying);
			videoEl.removeEventListener("pause", onPause);
			videoEl.removeEventListener("stalled", onStalled);
			videoEl.removeEventListener("suspend", onSuspend);
			videoEl.removeEventListener("waiting", onWaiting);
			videoEl.removeEventListener("error", onError);
		};
	}, [cameraPermission]);
	const deliverCapture = (0, import_react.useCallback)(async (imageDataUrl, additionalImages, mode, quality, options) => {
		setIsProcessing(true);
		try {
			const gpsPosition = await requestGPSPosition({
				maximumAge: 0,
				timeout: 15e3
			});
			if (gpsPosition.status !== "ok") {
				toast.error("Position GPS obligatoire. Activez la localisation et réessayez.");
				setIsProcessing(false);
				return;
			}
			const location = buildLocationInfo(gpsPosition.lat, gpsPosition.lng, gpsPosition.accuracy, gpsPosition.altitudeM);
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const depthResult = depthSensor ?? {
				source: "ai",
				label: "Analyse IA",
				supported: false,
				depthData: void 0,
				confidence: .55
			};
			onCapture({
				imageDataUrl,
				additionalImages,
				cameraCapability: depthResult.source,
				depthData: depthResult.depthData,
				location,
				captureMode: mode,
				capturedAt: now,
				videoDurationSeconds: options?.videoDurationSeconds,
				videoBlob: options?.videoBlob,
				videoPreviewUrl: options?.videoPreviewUrl,
				imageQuality: quality
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Erreur de capture.");
			setIsProcessing(false);
		}
	}, [onCapture]);
	const captureStill = (0, import_react.useCallback)(async () => {
		if (!videoRef.current || !canvasRef.current || isProcessing || cameraPermission !== "granted") return;
		const video = videoRef.current;
		const frame = dataUrlFromCanvas(video, canvasRef.current);
		if (!frame) {
			toast.error("Impossible de capturer l'image.");
			return;
		}
		setIsProcessing(true);
		const quality = qualityFromDimensions(video.videoWidth, video.videoHeight);
		if (captureMode === "multi") {
			const nextPhotos = [...additionalPhotos, frame];
			setAdditionalPhotos(nextPhotos);
			if (nextPhotos.length === 1) toast.info("Vue 1/3: OK. Déplacez-vous légèrement vers la gauche.", { duration: 4e3 });
			else if (nextPhotos.length === 2) toast.info("Vue 2/3: OK. Déplacez-vous légèrement vers la droite.", { duration: 4e3 });
			if (nextPhotos.length < MULTI_PHOTO_COUNT) {
				setIsProcessing(false);
				return;
			}
			await deliverCapture(nextPhotos[0], nextPhotos.slice(1), "multi", quality);
			return;
		}
		await deliverCapture(frame, [], "single", quality);
	}, [
		additionalPhotos,
		captureMode,
		deliverCapture,
		isProcessing,
		cameraPermission
	]);
	const clearRecordingTimers = (0, import_react.useCallback)(() => {
		if (recordingTimerRef.current != null) window.clearInterval(recordingTimerRef.current);
		if (recordingClockRef.current != null) window.clearInterval(recordingClockRef.current);
		recordingTimerRef.current = null;
		recordingClockRef.current = null;
	}, []);
	const finishVideo = (0, import_react.useCallback)(async () => {
		clearRecordingTimers();
		const video = videoRef.current;
		const canvas = canvasRef.current;
		const recorder = recorderRef.current;
		recorderRef.current = null;
		setRecording(false);
		if (!video || !canvas) return;
		const firstFrame = dataUrlFromCanvas(video, canvas) ?? recordingFramesRef.current[0];
		const frames = recordingFramesRef.current;
		recordingFramesRef.current = [];
		if (!firstFrame) {
			toast.error("La vidéo ne contient aucune image exploitable.");
			return;
		}
		const chunks = recorderChunksRef.current;
		const blob = chunks.length > 0 ? new Blob(chunks, { type: recorder?.mimeType || "video/webm" }) : void 0;
		if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
		const url = blob ? URL.createObjectURL(blob) : void 0;
		videoUrlRef.current = url ?? null;
		const duration = Math.max(1, recordingSecondsRef.current);
		recorderChunksRef.current = [];
		const quality = qualityFromDimensions(video.videoWidth, video.videoHeight);
		await deliverCapture(firstFrame, frames.slice(0, 5), "video", quality, {
			videoDurationSeconds: duration,
			videoBlob: blob,
			videoPreviewUrl: url
		});
	}, [clearRecordingTimers, deliverCapture]);
	const startVideoRecording = (0, import_react.useCallback)(() => {
		const stream = mediaStreamRef.current;
		const video = videoRef.current;
		const canvas = canvasRef.current;
		if (!stream || !video || !canvas || typeof MediaRecorder === "undefined") {
			toast.error("L'enregistrement vidéo n'est pas disponible.");
			return;
		}
		const mimeType = [
			"video/webm;codecs=vp9",
			"video/webm;codecs=vp8",
			"video/webm"
		].find((type) => MediaRecorder.isTypeSupported(type));
		const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : void 0);
		recorderChunksRef.current = [];
		recorder.ondataavailable = (event) => {
			if (event.data.size > 0) recorderChunksRef.current.push(event.data);
		};
		recorder.onstop = () => void finishVideo();
		recorderRef.current = recorder;
		recordingFramesRef.current = [];
		setRecordingSeconds(0);
		recordingSecondsRef.current = 0;
		setRecording(true);
		recorder.start(500);
		recordingTimerRef.current = window.setInterval(() => {
			const frame = dataUrlFromCanvas(video, canvas);
			if (frame && recordingFramesRef.current.length < 6) recordingFramesRef.current.push(frame);
		}, 1600);
		let elapsed = 0;
		recordingClockRef.current = window.setInterval(() => {
			elapsed += 1;
			recordingSecondsRef.current = elapsed;
			setRecordingSeconds(elapsed);
			if (elapsed >= MAX_VIDEO_SECONDS && recorder.state === "recording") recorder.stop();
		}, 1e3);
	}, [finishVideo]);
	const stopVideoRecording = (0, import_react.useCallback)(() => {
		if (recorderRef.current?.state === "recording") recorderRef.current.stop();
	}, []);
	const handleCaptureAction = (0, import_react.useCallback)(() => {
		if (captureMode === "video") {
			if (recording) stopVideoRecording();
			else startVideoRecording();
			return;
		}
		captureStill();
	}, [
		captureMode,
		captureStill,
		recording,
		startVideoRecording,
		stopVideoRecording
	]);
	if (cameraPermission === "denied" || cameraPermission === "unavailable") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-background p-4 text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mx-auto size-8 text-red-500" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-display text-xl font-bold",
					children: "Accès caméra impossible"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-sm text-sm text-muted-foreground mb-6",
					children: cameraErrorMessage({ name: cameraPermission === "denied" ? "NotAllowedError" : "NotFoundError" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleClose,
					children: "Retour à l'accueil"
				})
			]
		})
	});
	if (cameraPermission !== "granted") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center text-white",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-8 animate-spin text-eco" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-medium",
				children: "Ouverture de la caméra..."
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 bg-black text-white",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Caméra de signalement",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				autoPlay: true,
				playsInline: true,
				muted: true,
				className: "absolute inset-0 w-full h-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "hidden"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute right-4 top-24 z-[99] max-w-sm rounded-lg bg-black/60 p-2 text-xs text-white backdrop-blur-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-bold",
					children: "Capteur détecté :"
				}), depthSensor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 font-mono text-xs whitespace-pre-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: depthSensor.label }),
						depthSensor.resolution && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Résolution: ",
							depthSensor.resolution.width,
							"x",
							depthSensor.resolution.height
						] }),
						depthSensor.confidence && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Confiance: ",
							Math.round(depthSensor.confidence * 100),
							"%"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Supporté: ", depthSensor.supported ? "Oui" : "Non"] })
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-xs",
					children: "Détection..."
				})]
			}),
			isProcessing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center bg-black/80 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-8 animate-spin text-eco" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 font-medium",
						children: "Traitement..."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex flex-col justify-between p-4 pt-safe-top pb-safe-bottom",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "flex items-center justify-start",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleClose,
						className: "pointer-events-auto rounded-full bg-black/50 p-2.5 backdrop-blur-sm",
						"aria-label": "Fermer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "flex flex-col items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm mb-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
									active: captureMode === "single",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5" }),
									label: "Photo",
									onClick: () => setCaptureMode("single")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
									active: captureMode === "multi",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-5" }),
									label: "3 Vues",
									onClick: () => setCaptureMode("multi")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
									active: captureMode === "video",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-5" }),
									label: "Vidéo",
									onClick: () => setCaptureMode("video")
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-center justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleCaptureAction,
								disabled: isProcessing || cameraPermission !== "granted",
								className: `pointer-events-auto size-16 rounded-full border-4 border-white ring-offset-black transition-transform active:scale-90 disabled:opacity-50 ${recording ? "bg-red-500" : "bg-white/30"}`,
								"aria-label": captureMode === "video" ? recording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement" : captureMode === "multi" ? `Prendre la photo ${additionalPhotos.length + 1}/${MULTI_PHOTO_COUNT}` : "Prendre une photo"
							}), recording && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute size-16 rounded-full border-4 border-red-500 animate-pulse" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "h-10 text-center mt-2",
							children: [captureMode === "multi" && additionalPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-medium text-white/90",
								children: [
									additionalPhotos.length,
									" / ",
									MULTI_PHOTO_COUNT,
									" vues capturées."
								]
							}), recording && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-red-400 animate-pulse mt-2",
								children: `Enregistrement ${recordingSeconds}s / ${MAX_VIDEO_SECONDS}s`
							})]
						})
					]
				})]
			})
		]
	});
}
function ModeButton({ active, icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: `pointer-events-auto inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${active ? "bg-white text-black" : "bg-transparent text-white/80 hover:text-white"}`,
		children: [
			icon,
			" ",
			label
		]
	});
}
//#endregion
export { SmartWasteCamera };
