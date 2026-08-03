export type DuplicateCandidateReason = "nearby_active" | "image_similarity" | "confirmation";

export type DuplicateCandidate = {
    id: string;
    reason: DuplicateCandidateReason;
    similarity: number;
    distanceMeters: number;
};

export type EvaluateDuplicateReportInput = {
    reports: Array<{
        id: string;
        lat?: number;
        lng?: number;
        commune?: string;
        status?: string;
        ack?: boolean;
        createdAt?: string;
        history?: Array<{ label: string }>;
        imageHash?: string;
    }>;
    lat: number;
    lng: number;
    hash?: string;
    imageSimilarity?: number;
    radiusMeters?: number;
};

const ACTIVE_STATUSES = new Set(["en_attente", "assignee", "en_cours"]);

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
    const R = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * sinLng * sinLng;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export function evaluateDuplicateReport(input: EvaluateDuplicateReportInput): { candidate: DuplicateCandidate; reason: DuplicateCandidateReason } | null {
    const radiusMeters = input.radiusMeters ?? 120;
    const imageSimilarity = input.imageSimilarity ?? 0;
    const hashMatches = input.hash && input.reports.some((report) => report.imageHash && report.imageHash === input.hash);

    const candidate = input.reports.find((report) => {
        if (!report.lat || !report.lng) return false;
        if (!report.status || !ACTIVE_STATUSES.has(report.status)) return false;
        const distanceMeters = haversineMeters(input.lat, input.lng, report.lat, report.lng);
        if (distanceMeters > radiusMeters) return false;
        if (hashMatches) {
            return true;
        }
        if (imageSimilarity >= 98) {
            return true;
        }
        return false;
    });

    if (!candidate) return null;

    return {
        candidate: {
            id: candidate.id,
            reason: hashMatches ? "nearby_active" : imageSimilarity >= 98 ? "nearby_active" : "confirmation",
            similarity: imageSimilarity || 100,
            distanceMeters: haversineMeters(input.lat, input.lng, candidate.lat!, candidate.lng!),
        },
        reason: hashMatches ? "nearby_active" : imageSimilarity >= 98 ? "nearby_active" : "confirmation",
    };
}
