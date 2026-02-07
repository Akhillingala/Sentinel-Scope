"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Map,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  FileText,
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

const CHART_DATA = [
  { month: "Jan", risk: 0.52 },
  { month: "Feb", risk: 0.55 },
  { month: "Mar", risk: 0.58 },
  { month: "Apr", risk: 0.54 },
  { month: "May", risk: 0.61 },
  { month: "Jun", risk: 0.59 },
  { month: "Jul", risk: 0.62 },
];

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
    let start = display;
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
  useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Early Warning Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Real-time climate–conflict risk indicators and alerts.
        </p>
      </motion.div>

      {/* Bento grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mounted &&
          metrics.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="glass overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {m.label}
                  </CardTitle>
                  {m.trend === "up" && (
                    <TrendingUp className="h-4 w-4 text-[var(--crisis)]" />
                  )}
                  {m.trend === "down" && (
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                  )}
                  {m.trend === "stable" && (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <AnimatedNumber
                      value={m.value}
                      decimals={m.unit === "" && m.value < 10 ? 2 : 0}
                    />
                    {m.unit}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.change >= 0 ? "+" : ""}
                    {m.change} from last period
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Conflict index trend</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last 7 months aggregate risk
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient
                        id="riskGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
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
                      fontSize={12}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      domain={[0.4, 0.7]}
                      tickFormatter={(v) => v.toFixed(2)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number | undefined) => [value != null ? value.toFixed(2) : "", "Risk"]}
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="glass h-full border-border/50">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild className="w-full justify-start gap-2">
                <Link href="/map">
                  <Map className="h-4 w-4" />
                  Open map view
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link href="/memos">
                  <FileText className="h-4 w-4" />
                  AI Memos
                </Link>
              </Button>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--crisis)]" />
                <span className="text-xs text-muted-foreground">
                  12 active alerts in high-risk regions
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
