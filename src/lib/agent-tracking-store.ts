// EcoKin Smart — Suivi GPS des agents et historique des missions.
import { useEffect, useState } from "react";

export type AgentMissionStatus = "en_attente" | "en_cours" | "terminee";

export type AgentFix = {
  lat: number;
  lng: number;
  accuracy: number;
  at: string;
};

export type AgentMission = {
  reportId: string;
  agentId: string;
  agentName: string;
  commune: string;
  status: AgentMissionStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  category?: string;
  team?: string;
};

export type TrackedAgent = {
  id: string;
  name: string;
  commune: string;
  teamId?: string;
  phone?: string;
  current?: AgentFix;
  track: AgentFix[];
  activeMissionId?: string;
  lastSeenAt?: string;
};

type AgentTrackingState = {
  agents: TrackedAgent[];
  missions: AgentMission[];
};

const KEY = "ecokin_agent_tracking_v1";
const EVT = "ecokin:agent-tracking";
const MAX_TRACK = 50;

function read(): AgentTrackingState {
  if (typeof window === "undefined") return { agents: [], missions: [] };
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{"agents":[],"missions":[]}');
  } catch {
    return { agents: [], missions: [] };
  }
}

function write(state: AgentTrackingState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVT));
}

export function updateAgentPosition(agentId: string, name: string, commune: string, fix: Omit<AgentFix, "at">) {
  const state = read();
  const at = new Date().toISOString();
  const newFix: AgentFix = { ...fix, at };
  const existing = state.agents.find((a) => a.id === agentId);
  const agents = existing
    ? state.agents.map((a) =>
        a.id === agentId
          ? { ...a, current: newFix, track: [newFix, ...a.track].slice(0, MAX_TRACK), lastSeenAt: at, name, commune }
          : a,
      )
    : [
        {
          id: agentId,
          name,
          commune,
          current: newFix,
          track: [newFix],
          lastSeenAt: at,
        },
        ...state.agents,
      ];
  write({ ...state, agents });
}

export function assignMission(input: {
  reportId: string;
  agentId: string;
  agentName: string;
  commune: string;
  category?: string;
  team?: string;
}) {
  const state = read();
  const mission: AgentMission = {
    ...input,
    status: "en_attente",
    assignedAt: new Date().toISOString(),
  };
  const missions = [
    mission,
    ...state.missions.filter((m) => m.reportId !== input.reportId),
  ];
  const agents = state.agents.map((a) =>
    a.id === input.agentId ? { ...a, activeMissionId: input.reportId } : a,
  );
  write({ agents, missions });
  return mission;
}

export function updateMissionStatus(reportId: string, status: AgentMissionStatus) {
  const state = read();
  const now = new Date().toISOString();
  const missions = state.missions.map((m) => {
    if (m.reportId !== reportId) return m;
    if (status === "en_cours") return { ...m, status, startedAt: now };
    if (status === "terminee") return { ...m, status, completedAt: now };
    return { ...m, status };
  });
  const completedMission = missions.find((m) => m.reportId === reportId && status === "terminee");
  const agents = completedMission
    ? state.agents.map((a) =>
        a.activeMissionId === reportId ? { ...a, activeMissionId: undefined } : a,
      )
    : state.agents;
  write({ agents, missions });
}

export function useAgentTracking() {
  const [state, setState] = useState<AgentTrackingState>({ agents: [], missions: [] });

  useEffect(() => {
    const refresh = () => setState(read());
    refresh();
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return {
    agents: state.agents,
    missions: state.missions,
    updatePosition: updateAgentPosition,
    assignMission,
    updateMissionStatus,
  };
}
