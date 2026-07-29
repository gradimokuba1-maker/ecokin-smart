import { o as __toESM } from "../_runtime.mjs";
import { _ as KINSHASA_COMMUNES, h as DEFAULT_CITY, v as detectCityCommune } from "./ecokin-db-BKLrlUs1.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { i as formatNumber, n as useEcoUser, t as SiteNav } from "./site-nav-BQEX1RbF.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as LogIn, G as Images, U as LoaderCircle, W as Leaf, d as TriangleAlert, l as Trophy, mt as Camera, r as Video, s as UserPlus, t as X, x as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bk-W14TZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as createServerFn } from "./esm-CuMU5gNd.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BdlII7Sc.mjs";
import { a as objectType, i as numberType, o as stringType, t as anyType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signaler-ChdOPSeI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HashSchema = stringType().regex(/^[0-9a-f]{16}$/i, "Empreinte invalide");
var ValidateSchema = objectType({
	hash: HashSchema,
	lat: numberType().gte(-90).lte(90).optional(),
	lng: numberType().gte(-180).lte(180).optional(),
	category: stringType().max(40).optional()
});
var CommitSchema = ValidateSchema.extend({ reportId: stringType().min(3).max(60) });
createServerFn({ method: "POST" }).validator((d) => ValidateSchema.parse(d)).handler(createSsrRpc("f53ea3a397a2ec958fd3cc3acde690afe7d6a4a8048c8c4751b16269bdb4f399"));
createServerFn({ method: "POST" }).validator((d) => CommitSchema.parse(d)).handler(createSsrRpc("9c343534c8711b23a2a610cf4e1540de1cd5008af978988eb5af527e5830e0ef"));
var CitizenReportSchema = objectType({
	capture: anyType(),
	description: stringType().max(500).optional(),
	hash: HashSchema
});
var submitCitizenReport = createServerFn({ method: "POST" }).validator((d) => CitizenReportSchema.parse(d)).handler(createSsrRpc("050133e91a1e4a97dcedd938d4044b9fb1fd5b2fe15f957e82ef1fc0bc47591e"));
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
				const stream = await requestPreferredCameraStream();
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
function CitizenGate({ title, description, children }) {
	const { user, register, signIn } = useEcoUser();
	const [mode, setMode] = (0, import_react.useState)("signup");
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		commune: KINSHASA_COMMUNES[0]?.name ?? "Kinshasa",
		phone: "",
		pin: ""
	});
	const [err, setErr] = (0, import_react.useState)(null);
	if (user.registered) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	const hasExisting = user.points > 0 || user.reports > 0 || user.phone;
	const onSubmit = (e) => {
		e.preventDefault();
		setErr(null);
		if (mode === "signup") {
			if (!form.name.trim() || !form.phone.trim() || form.pin.length < 4) {
				setErr("Nom, téléphone et code PIN (4 chiffres min) sont obligatoires.");
				return;
			}
			register(form);
		} else if (!signIn(form.phone, form.pin)) setErr("Téléphone ou code PIN incorrect.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto grid min-h-screen max-w-md place-items-center px-4 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-2xl bg-eco/10 text-eco",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
							children: "Compte citoyen requis"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-xl font-bold",
							children: title
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: description ?? "Créez votre compte citoyen EcoKin pour accéder à ce module. Votre compte conserve vos Green Points et votre historique pour vos prochaines visites."
					}),
					hasExisting && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-xl border border-eco/30 bg-eco/5 p-3 text-xs text-eco",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold uppercase tracking-widest",
							children: [formatNumber(user.points), " Green Points conservés"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-eco/80",
							children: "Ils resteront associés à votre compte après identification."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex gap-2 rounded-full bg-muted p-1 text-xs font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setMode("signup"),
							className: `flex-1 rounded-full px-3 py-2 ${mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-1 inline size-3.5" }), " Créer un compte"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setMode("signin"),
							className: `flex-1 rounded-full px-3 py-2 ${mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "mr-1 inline size-3.5" }), " Se connecter"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit,
						className: "mt-4 space-y-3",
						children: [
							mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Nom complet"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								}),
								placeholder: "Ex. Jean Mbala",
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Commune"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: form.commune,
								onChange: (e) => setForm({
									...form,
									commune: e.target.value
								}),
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
								children: KINSHASA_COMMUNES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.name,
									children: c.name
								}, c.id))
							})] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Téléphone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.phone,
								onChange: (e) => setForm({
									...form,
									phone: e.target.value
								}),
								placeholder: "+243 ...",
								inputMode: "tel",
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
								children: "Code PIN (4 chiffres min)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.pin,
								onChange: (e) => setForm({
									...form,
									pin: e.target.value
								}),
								type: "password",
								inputMode: "numeric",
								placeholder: "••••",
								className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							})] }),
							err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-red-600",
								children: err
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "submit",
								className: "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), mode === "signup" ? "Créer mon compte" : "Se connecter"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "block text-center text-xs text-muted-foreground hover:underline",
								children: "← Retour à l'accueil"
							})
						]
					})
				]
			})
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
	const submitReportFn = useServerFn(submitCitizenReport);
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
	const submitReport = async () => {
		console.log("[CLIENT] Début de submitReport()");
		if (!capture || !hash) {
			console.log("[CLIENT] Abandon : capture ou hash manquant.");
			return;
		}
		console.log("[CLIENT] Passage à l'étape 'submitting'");
		setStep("submitting");
		const payload = {
			capture,
			description,
			hash
		};
		console.log("[CLIENT] Données envoyées au serveur :", payload);
		try {
			console.log("[CLIENT] Juste avant l'appel serveur");
			const result = await submitReportFn({ data: payload });
			console.log("Réponse serveur reçue :", result);
			toast.success("Votre signalement a été envoyé avec succès !");
			setStep("submitted");
		} catch (error) {
			console.error("Erreur serveur :", error);
			toast.error("L'envoi a échoué. Veuillez réessayer.");
			setStep("confirmation");
		}
	};
	if (step === "camera") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartWasteCamera, {
		onCapture: handleCapture,
		onClose: () => navigate({ to: "/" })
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
