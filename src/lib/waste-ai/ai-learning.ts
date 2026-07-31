import type { CaptureResult } from "@/components/waste-ai/SmartWasteCamera";
import type { WasteMaterial } from "./types";

export type AnnotationRecord = {
    reportId: string;
    category: string;
    material: WasteMaterial;
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    mask: string;
    correctedBy: string;
    correctedAt: string;
};

export type LearningRecord = {
    reportId: string;
    imageDataUrl: string;
    sensors: {
        camera: boolean;
        gps: boolean;
        depthApi: boolean;
        lidar: boolean;
        offlineMode: boolean;
    };
    annotations: AnnotationRecord[];
    validated: boolean;
    createdAt: string;
};

type LearningStoreShape = {
    validatedSamples: LearningRecord[];
    corrections: AnnotationRecord[];
    datasetVersion: string;
};

type GlobalWithLearningStore = typeof globalThis & {
    __ecokin_learning_store__?: LearningStoreShape;
};

function getLearningStore(): LearningStoreShape {
    const globalObject = globalThis as GlobalWithLearningStore;
    if (!globalObject.__ecokin_learning_store__) {
        globalObject.__ecokin_learning_store__ = {
            validatedSamples: [],
            corrections: [],
            datasetVersion: `ds-${Date.now().toString(36)}`,
        };
    }
    return globalObject.__ecokin_learning_store__;
}

export function registerValidatedImage(
    reportId: string,
    capture: CaptureResult,
    annotations: AnnotationRecord[],
): LearningRecord {
    const store = getLearningStore();
    const record: LearningRecord = {
        reportId,
        imageDataUrl: capture.imageDataUrl,
        sensors: {
            camera: Boolean(capture.imageDataUrl),
            gps: Boolean(capture.location?.lat != null && capture.location?.lng != null),
            depthApi: capture.depthData != null,
            lidar: capture.cameraCapability === "lidar",
            offlineMode: typeof navigator !== "undefined" && !navigator.onLine,
        },
        annotations,
        validated: true,
        createdAt: new Date().toISOString(),
    };
    store.validatedSamples.push(record);
    return record;
}

export function registerCorrection(record: AnnotationRecord): number {
    const store = getLearningStore();
    store.corrections.push(record);
    return store.corrections.length;
}

export function createDatasetSnapshot(): LearningRecord[] {
    return getLearningStore().validatedSamples;
}

export function queueFineTune(): { queued: boolean; datasetVersion: string; size: number } {
    const store = getLearningStore();
    return {
        queued: true,
        datasetVersion: store.datasetVersion,
        size: store.validatedSamples.length,
    };
}

export function listCorrections(): AnnotationRecord[] {
    return getLearningStore().corrections;
}
