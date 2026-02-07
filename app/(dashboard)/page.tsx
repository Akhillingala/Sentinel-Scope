"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Map } from "mapbox-gl";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MAP_STYLES } from "@/components/map/MapGL";
import {
  Map as MapIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  FileText,
  Palette,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MapGLDynamic = dynamic(
  () => import("@/components/map/MapGL").then((m) => ({ default: m.MapGL })),
  { ssr: false }
);
const DeckOverlay = dynamic(
  () =>
    import("@/components/map/DeckOverlay").then((m) => ({
      default: m.DeckOverlay,
    })),
  { ssr: false }
);
const MapSearch = dynamic(
  () =>
    import("@/components/map/MapSearch").then((m) => ({ default: m.MapSearch })),
  { ssr: false }
);

const CHART_DATA = [
  { month: "Jan", risk: 0.52 },
  { month: "Feb", risk: 0.55 },
  { month: "Mar", risk: 0.58 },
  { month: "Apr", risk: 0.54 },
  { month: "May", risk: 0.61 },
  { month: "Jun", risk: 0.59 },
  { month: "Jul", risk: 0.62 },
];

const STYLE_OPTIONS = [
  { id: "outdoors", label: "Outdoors", value: MAP_STYLES.outdoors },
  { id: "streets", label: "Streets", value: MAP_STYLES.streets },
  { id: "dark", label: "Dark", value: MAP_STYLES.dark },
  { id: "light", label: "Light", value: MAP_STYLES.light },
] as const;

function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const start = display;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / (duration * 1000), 1);
      setDisplay(Number((start + (value - start) * t).toFixed(decimals)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, decimals, duration]);
  return <span>{display.toFixed(decimals)}</span>;
}

export default function DashboardPage() {
  const { metrics } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [map, setMap] = useState<Map | null>(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.outdoors);
  useEffect(() => setMounted(true), []);
  const onMapLoad = useCallback((m: Map) => setMap(m), []);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      {/* Full-screen map background */}
      <div className="map-container absolute inset-0">
        <MapGLDynamic
          className="absolute inset-0"
          style={mapStyle}
          onLoad={onMapLoad}
        />
        <DeckOverlay map={map} />
      </div>

      {/* Top-left: Title + search + map style picker */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-4 top-4 z-10 flex flex-col gap-3"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground drop-shadow-lg">
            Early Warning Dashboard
          </h1>
          <p className="text-sm text-muted-foreground/90 drop-shadow">
            Real-time climate–conflict risk indicators
          </p>
        </div>
        <MapSearch map={map} placeholder="Search country or place…" />
        <div className="flex flex-wrap gap-1.5">
          {STYLE_OPTIONS.map((s) => (
            <Button
              key={s.id}
              variant={mapStyle === s.value ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 border-border/50 text-foreground"
              onClick={() => setMapStyle(s.value)}
            >
              <Palette className="h-3.5 w-3.5" />
              {s.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Left sidebar: Metrics */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute bottom-4 left-4 z-10 w-72"
      >
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Key metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {mounted &&
              metrics.slice(0, 4).map((m, i) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-border/30 bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {m.label}
                    </span>
                    {m.trend === "up" && (
                      <TrendingUp className="h-3.5 w-3.5 text-[var(--crisis)]" />
                    )}
                    {m.trend === "down" && (
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    {m.trend === "stable" && (
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    <AnimatedNumber
                      value={m.value}
                      decimals={m.unit === "" && m.value < 10 ? 2 : 0}
                    />
                    {m.unit}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Right sidebar: Chart + Quick actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="absolute right-4 top-4 z-10 flex w-80 flex-col gap-3"
      >
        <Card className="glass border-border/50">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-foreground">
              Conflict index trend
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Last 7 months aggregate risk
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    domain={[0.4, 0.7]}
                    tickFormatter={(v) => v.toFixed(2)}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number | undefined) => [
                      value != null ? value.toFixed(2) : "",
                      "Risk",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#riskGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              asChild
              className="w-full justify-start gap-2 text-foreground"
            >
              <Link href="/map" className="gap-2">
                <MapIcon className="h-4 w-4" />
                Full map view
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 text-foreground"
            >
              <Link href="/memos" className="gap-2">
                <FileText className="h-4 w-4" />
                AI Memos
              </Link>
            </Button>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--crisis)]" />
              <span className="text-xs text-muted-foreground">
                12 active alerts in high-risk regions
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom center: overlay legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="glass flex items-center gap-4 rounded-lg border border-border/50 px-4 py-2">
          <span className="text-sm font-medium text-foreground">
            Climate–Conflict Early Warning
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--crisis)]" />
            Height & color = risk score
          </span>
        </div>
      </motion.div>
    </div>
  );
}
