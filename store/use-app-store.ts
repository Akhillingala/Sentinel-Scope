import { create } from "zustand";

export interface RiskRegion {
  id: string;
  name: string;
  riskScore: number;
  coordinates: [number, number][][];
  trend: "up" | "down" | "stable";
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
}

interface AppState {
  metrics: DashboardMetric[];
  regions: RiskRegion[];
  setMetrics: (m: DashboardMetric[]) => void;
  setRegions: (r: RiskRegion[]) => void;
}

const defaultMetrics: DashboardMetric[] = [
  { id: "1", label: "Active Alerts", value: 12, unit: "", change: 2, trend: "up" },
  { id: "2", label: "High-Risk Regions", value: 7, unit: "", change: -1, trend: "down" },
  { id: "3", label: "Conflict Index", value: 0.62, unit: "", change: 0.03, trend: "up" },
  { id: "4", label: "Climate Stress", value: 0.78, unit: "", change: -0.05, trend: "down" },
];

export const useAppStore = create<AppState>((set) => ({
  metrics: defaultMetrics,
  regions: [],
  setMetrics: (metrics) => set({ metrics }),
  setRegions: (regions) => set({ regions }),
}));
