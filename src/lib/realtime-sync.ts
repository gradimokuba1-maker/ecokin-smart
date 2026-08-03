export const REALTIME_EVENT = "ecokin:realtime";
export const FOCUS_REPORT_EVENT = "ecokin:focus-report";

export type RealtimeEventType = "report" | "notification" | "db" | "focus-report";

export type RealtimeEventPayload = {
    type: RealtimeEventType;
    reportId?: string;
    notificationId?: string;
    ts: number;
};

const SYNC_KEY = "ecokin:realtime:v1";
const CHANNEL_NAME = "ecokin-smart-sync";

let channel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
    if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
    return channel;
}

export function publishRealtimeEvent(type: RealtimeEventType, payload: Partial<RealtimeEventPayload> = {}) {
    if (typeof window === "undefined") return;

    const detail: RealtimeEventPayload = {
        type,
        ts: Date.now(),
        ...payload,
    };

    window.dispatchEvent(new CustomEvent(REALTIME_EVENT, { detail }));

    try {
        const bc = getBroadcastChannel();
        bc?.postMessage(detail);
    } catch {
        // ignore broadcast issues
    }

    try {
        localStorage.setItem(SYNC_KEY, JSON.stringify(detail));
    } catch {
        // ignore storage issues
    }
}

export function subscribeRealtime(handler: (payload: RealtimeEventPayload) => void) {
    if (typeof window === "undefined") return () => undefined;

    const onEvent = (event: Event) => {
        const customEvent = event as CustomEvent<RealtimeEventPayload>;
        if (customEvent.detail) handler(customEvent.detail);
    };

    const onStorage = (event: StorageEvent) => {
        if (event.key !== SYNC_KEY || !event.newValue) return;
        try {
            handler(JSON.parse(event.newValue) as RealtimeEventPayload);
        } catch {
            // ignore malformed sync payloads
        }
    };

    const onMessage = (event: MessageEvent<RealtimeEventPayload>) => handler(event.data);

    window.addEventListener(REALTIME_EVENT, onEvent as EventListener);
    window.addEventListener("storage", onStorage);

    const bc = getBroadcastChannel();
    bc?.addEventListener("message", onMessage as EventListener);

    return () => {
        window.removeEventListener(REALTIME_EVENT, onEvent as EventListener);
        window.removeEventListener("storage", onStorage);
        bc?.removeEventListener("message", onMessage as EventListener);
    };
}

export function focusReport(reportId: string) {
    if (typeof window === "undefined") return;
    publishRealtimeEvent("focus-report", { reportId });
    window.dispatchEvent(new CustomEvent(FOCUS_REPORT_EVENT, { detail: { reportId } }));
}

export function subscribeFocusedReport(handler: (reportId: string) => void) {
    if (typeof window === "undefined") return () => undefined;

    const onFocus = (event: Event) => {
        const customEvent = event as CustomEvent<{ reportId?: string }>;
        if (customEvent.detail?.reportId) handler(customEvent.detail.reportId);
    };

    window.addEventListener(FOCUS_REPORT_EVENT, onFocus as EventListener);
    return () => window.removeEventListener(FOCUS_REPORT_EVENT, onFocus as EventListener);
}

export function clearFocusedReport() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(FOCUS_REPORT_EVENT, { detail: { reportId: null } }));
}
