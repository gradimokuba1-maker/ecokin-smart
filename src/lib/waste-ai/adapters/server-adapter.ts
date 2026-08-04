import type { ModelAdapter, AdapterDetectionHint } from "./types";
import type { DetectionResult } from "../detection";
import type { SegmentationResult } from "../segmentation";
import type { DepthEstimate } from "../volume-estimator";

/**
 * Prototype d'adaptateur pour un moteur IA serveur externe.
 *
 * Cette implémentation n'est pas activée par défaut. Elle sert de base
 * pour intégrer ultérieurement un modèle IA plus performant côté serveur.
 */
export const serverWasteAIAdapter: ModelAdapter = {
    async detect(imageDataUrl, _options) {
        throw new Error(
            "serverWasteAIAdapter.detect n'est pas implémenté. Utilisez defaultWasteAIAdapter par défaut.",
        );
    },
    async segment(imageDataUrl, _detections, _options) {
        throw new Error(
            "serverWasteAIAdapter.segment n'est pas implémenté. Utilisez defaultWasteAIAdapter par défaut.",
        );
    },
    async estimateVolume(imageDataUrl, _segments, _options) {
        throw new Error(
            "serverWasteAIAdapter.estimateVolume n'est pas implémenté. Utilisez defaultWasteAIAdapter par défaut.",
        );
    },
};
