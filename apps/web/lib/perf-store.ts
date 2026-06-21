import { create } from "zustand";

export interface ApiCall {
  url: string;
  method: string;
  durationMs: number;
  status: number;
  sqlCount: number;
  sqlMs: number;
  requestId: string;
  duplicate: boolean;
}

export interface RouteMetrics {
  route: string;
  transitionMs: number;
  apiCalls: ApiCall[];
  sqlCount: number;
  sqlMs: number;
  vitals: Record<string, { value: number; rating: string }>;
  timestamp: number;
}

interface PerfState {
  current: RouteMetrics | null;
  history: RouteMetrics[];
  routeStartTime: number;
  // actions
  startRoute: (route: string) => void;
  recordFetch: (call: Omit<ApiCall, "duplicate">) => void;
  recordVital: (name: string, value: number, rating: string) => void;
  clear: () => void;
}

function makeRoute(route: string, transitionMs: number): RouteMetrics {
  return {
    route,
    transitionMs,
    apiCalls: [],
    sqlCount: 0,
    sqlMs: 0,
    vitals: {},
    timestamp: Date.now(),
  };
}

export const usePerfStore = create<PerfState>((set, get) => ({
  current: null,
  history: [],
  routeStartTime: performance.now(),

  startRoute(route) {
    const now = performance.now();
    const prev = get().current;
    set((s) => ({
      history: prev ? [prev, ...s.history].slice(0, 20) : s.history,
      current: makeRoute(route, Math.round(now - s.routeStartTime)),
      routeStartTime: now,
    }));
  },

  recordFetch(call) {
    set((s) => {
      if (!s.current) return s;
      const seen = s.current.apiCalls.map((c) => c.url);
      const duplicate = seen.includes(call.url);
      const updated: ApiCall = { ...call, duplicate };
      const apiCalls = [...s.current.apiCalls, updated];
      const sqlCount = s.current.sqlCount + call.sqlCount;
      const sqlMs = s.current.sqlMs + call.sqlMs;
      return { current: { ...s.current, apiCalls, sqlCount, sqlMs } };
    });
  },

  recordVital(name, value, rating) {
    set((s) => {
      if (!s.current) return s;
      const vitals = { ...s.current.vitals, [name]: { value, rating } };
      return { current: { ...s.current, vitals } };
    });
  },

  clear() {
    set({ current: null, history: [], routeStartTime: performance.now() });
  },
}));
