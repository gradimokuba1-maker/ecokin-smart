import { useEffect, useState, useCallback } from "react";

export type CollectionActorStatus = "active" | "inactive" | "suspended";
export type CollectionVehicleType = "camion_benne" | "tricycle" | "moto" | "vehicule_legere";
export type MissionStatus = "planned" | "assigned" | "in_progress" | "completed" | "blocked";

export type CollectionPme = {
    id: string;
    name: string;
    manager: string;
    contacts: string;
    commune: string;
    zonesCovered: string[];
    agentCount: number;
    vehicleCount: number;
    status: CollectionActorStatus;
    createdAt: string;
    operationsHistory: Array<{ title: string; at: string }>;
};

export type IndependentCollector = {
    id: string;
    name: string;
    identifier: string;
    commune: string;
    vehicleType: CollectionVehicleType;
    zone: string;
    available: boolean;
    missionsAssigned: number;
    history: Array<{ title: string; at: string }>;
    createdAt: string;
};

export type CollectionMission = {
    id: string;
    title: string;
    commune: string;
    zone: string;
    assignedCollectorId?: string;
    assignedVehicleId?: string;
    householdIds: string[];
    status: MissionStatus;
    progressPercent: number;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    notes?: string;
    history: Array<{ label: string; at: string }>;
};

type CollectionOperationsState = {
    pmes: CollectionPme[];
    collectors: IndependentCollector[];
    missions: CollectionMission[];
};

const KEY = "ecokin_collection_operations_v1";
const EVT = "ecokin:collection-operations";

const DEFAULT_STATE: CollectionOperationsState = {
    pmes: [],
    collectors: [],
    missions: [],
};

function read(): CollectionOperationsState {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? ({ ...DEFAULT_STATE, ...JSON.parse(raw) } as CollectionOperationsState) : DEFAULT_STATE;
    } catch {
        return DEFAULT_STATE;
    }
}

function write(next: CollectionOperationsState) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
}

function seedState(): CollectionOperationsState {
    const now = new Date().toISOString();
    return {
        pmes: [
            {
                id: "PME-001",
                name: "RASKIN Proprete Kalamu",
                manager: "Grace Mbala",
                contacts: "+243810100001",
                commune: "Kalamu",
                zonesCovered: ["Matonge", "Yolo"],
                agentCount: 8,
                vehicleCount: 3,
                status: "active",
                createdAt: now,
                operationsHistory: [{ title: "Collecte hebdo confirmée", at: now }],
            },
            {
                id: "PME-002",
                name: "Kin Tri Services",
                manager: "Cedric Nsimba",
                contacts: "+243810100002",
                commune: "Limete",
                zonesCovered: ["Mont Ngafula"],
                agentCount: 5,
                vehicleCount: 2,
                status: "active",
                createdAt: now,
                operationsHistory: [{ title: "Mise en service Limete", at: now }],
            },
        ],
        collectors: [
            {
                id: "COL-001",
                name: "Patrick Luzolo",
                identifier: "COL-2026-001",
                commune: "Kalamu",
                vehicleType: "tricycle",
                zone: "Matonge",
                available: true,
                missionsAssigned: 2,
                history: [{ title: "3 passages réalisés", at: now }],
                createdAt: now,
            },
            {
                id: "COL-002",
                name: "Miriam Nkulu",
                identifier: "COL-2026-002",
                commune: "Limete",
                vehicleType: "moto",
                zone: "Mont Ngafula",
                available: false,
                missionsAssigned: 1,
                history: [{ title: "1 collecte terminée", at: now }],
                createdAt: now,
            },
        ],
        missions: [
            {
                id: "MIS-001",
                title: "Collecte hebdomadaire Matonge",
                commune: "Kalamu",
                zone: "Matonge",
                assignedCollectorId: "COL-001",
                assignedVehicleId: "V-1",
                householdIds: ["HH-1"],
                status: "in_progress",
                progressPercent: 65,
                createdAt: now,
                startedAt: now,
                history: [{ label: "Mission lancée", at: now }],
            },
        ],
    };
}

export function useCollectionOperations() {
    const [state, setState] = useState<CollectionOperationsState>(DEFAULT_STATE);

    const refresh = useCallback(() => {
        setState(read());
    }, []);

    useEffect(() => {
        refresh();
        const handler = () => refresh();
        window.addEventListener(EVT, handler);
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener(EVT, handler);
            window.removeEventListener("storage", handler);
        };
    }, [refresh]);

    useEffect(() => {
        const current = read();
        if (current.pmes.length === 0 && current.collectors.length === 0 && current.missions.length === 0) {
            write(seedState());
            setState(read());
        }
    }, []);

    return {
        ...state,
        registerPme(input: Omit<CollectionPme, "id" | "createdAt" | "operationsHistory">) {
            const current = read();
            const next: CollectionPme = {
                ...input,
                id: `PME-${Date.now().toString(36).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                operationsHistory: [{ title: "Enregistrement initial", at: new Date().toISOString() }],
            };
            write({ ...current, pmes: [next, ...current.pmes] });
            setState(read());
            return next;
        },
        registerCollector(input: Omit<IndependentCollector, "id" | "createdAt" | "missionsAssigned" | "history">) {
            const current = read();
            const next: IndependentCollector = {
                ...input,
                id: `COL-${Date.now().toString(36).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                missionsAssigned: 0,
                history: [{ title: "Profil créé", at: new Date().toISOString() }],
            };
            write({ ...current, collectors: [next, ...current.collectors] });
            setState(read());
            return next;
        },
        createMission(input: Omit<CollectionMission, "id" | "createdAt" | "progressPercent" | "status" | "history">) {
            const current = read();
            const next: CollectionMission = {
                ...input,
                id: `MIS-${Date.now().toString(36).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                progressPercent: 0,
                status: "planned",
                history: [{ label: "Mission créée", at: new Date().toISOString() }],
            };
            write({ ...current, missions: [next, ...current.missions] });
            setState(read());
            return next;
        },
        assignMission(id: string, collectorId?: string, vehicleId?: string) {
            const current = read();
            const nextMissions = current.missions.map((mission) =>
                mission.id === id
                    ? {
                        ...mission,
                        assignedCollectorId: collectorId,
                        assignedVehicleId: vehicleId,
                        status: "assigned",
                        history: [...mission.history, { label: "Mission assignée", at: new Date().toISOString() }],
                    }
                    : mission,
            );
            write({ ...current, missions: nextMissions });
            setState(read());
        },
        updateMissionStatus(id: string, status: MissionStatus, note?: string) {
            const current = read();
            const nextMissions = current.missions.map((mission) =>
                mission.id === id
                    ? {
                        ...mission,
                        status,
                        notes: note ?? mission.notes,
                        progressPercent: status === "completed" ? 100 : mission.progressPercent,
                        completedAt: status === "completed" ? new Date().toISOString() : mission.completedAt,
                        history: [
                            ...mission.history,
                            { label: `Statut → ${status}`, at: new Date().toISOString() },
                        ],
                    }
                    : mission,
            );
            write({ ...current, missions: nextMissions });
            setState(read());
        },
    };
}
