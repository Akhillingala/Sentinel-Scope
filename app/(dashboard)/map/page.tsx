"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Map } from "mapbox-gl";
import { MapGL } from "@/components/map/MapGL";
import { DeckOverlay } from "@/components/map/DeckOverlay";
import { ParticleField } from "@/components/map/ParticleField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const ParticleFieldDynamic = dynamic(
  () => import("@/components/map/ParticleField").then((m) => ({ default: m.ParticleField })),
  { ssr: false }
);

export default function MapPage() {
  const [map, setMap] = useState<Map | null>(null);

  const onMapLoad = useCallback((m: Map) => setMap(m), []);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      <MapGL
        className="absolute inset-0"
        onLoad={onMapLoad}
      />
      <DeckOverlay map={map} />
      <ParticleFieldDynamic className="absolute inset-0" />

      <div className="absolute left-4 top-4 z-10 flex flex-col gap-3">
        <Button variant="secondary" size="sm" className="glass border-border/50" asChild>
          <Link href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass w-72 border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="h-4 w-4 text-[var(--crisis)]" />
                Risk overlay
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Height and color indicate climate–conflict risk score. Red = high risk.
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="glass rounded-lg border border-border/50 px-4 py-2 text-center text-sm text-muted-foreground">
          Climate–Conflict Early Warning • Watershed
        </div>
      </motion.div>
    </div>
  );
}
