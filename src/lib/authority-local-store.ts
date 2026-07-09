import { useEffect, useState } from "react";

export type LocalPme = {
  id: string;
  name: string;
  commune: string;
  manager: string;
  phone: string;
  createdAt: string;
};

export type LocalTeam = {
  id: string;
  name: string;
  commune: string;
  pmeId?: string;
  createdAt: string;
};

export type LocalAgent = {
  id: string;
  uniqueNumber: string;
  name: string;
  commune: string;
  teamId?: string;
  phone: string;
  createdAt: string;
};

export type LocalActivity = {
  id: string;
  commune: string;
  teamId?: string;
  agentId?: string;
  label: string;
  status: "planifiee" | "en_cours" | "terminee";
  at: string;
};

const KEY = "ecokin_authority_local_v1";
const EVT = "ecokin:authority-local";

type LocalState = {
  pmes: LocalPme[];
  teams: LocalTeam[];
  agents: LocalAgent[];
  activities: LocalActivity[];
};

const DEFAULT: LocalState = { pmes: [], teams: [], agents: [], activities: [] };

function read(): LocalState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULT;
  }
}

function write(next: LocalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVT));
}

const id = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export function useAuthorityLocalStore() {
  const [state, setState] = useState<LocalState>(DEFAULT);

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
    ...state,
    addPme(input: Omit<LocalPme, "id" | "createdAt">) {
      const current = read();
      write({ ...current, pmes: [{ ...input, id: id("PME"), createdAt: new Date().toISOString() }, ...current.pmes] });
    },
    addTeam(input: Omit<LocalTeam, "id" | "createdAt">) {
      const current = read();
      write({ ...current, teams: [{ ...input, id: id("EQ"), createdAt: new Date().toISOString() }, ...current.teams] });
    },
    addAgent(input: Omit<LocalAgent, "id" | "uniqueNumber" | "createdAt">) {
      const current = read();
      const count = current.agents.filter((agent) => agent.commune === input.commune).length + 1;
      const uniqueNumber = `AG-${input.commune.toUpperCase()}-${String(count).padStart(4, "0")}`;
      write({
        ...current,
        agents: [{ ...input, id: id("AG"), uniqueNumber, createdAt: new Date().toISOString() }, ...current.agents],
      });
    },
    addActivity(input: Omit<LocalActivity, "id" | "at">) {
      const current = read();
      write({ ...current, activities: [{ ...input, id: id("ACT"), at: new Date().toISOString() }, ...current.activities] });
    },
  };
}
