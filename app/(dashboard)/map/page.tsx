"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Map } from "mapbox-gl";
import { MAP_STYLES } from "@/components/map/MapGL";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, Palette } from "lucide-react";

const MapGL = dynamic(
  () => import("@/components/map/MapGL").then((m) => ({ default: m.MapGL })),
  { ssr: false }
);
const DeckOverlay = dynamic(
  () =>
    import("@/components/map/DeckOverlay").then((m) => ({ default: m.DeckOverlay })),
  { ssr: false }
);
const ParticleFieldDynamic = dynamic(
  () =>
    import("@/components/map/ParticleField").then((m) => ({
      default: m.ParticleField,
    })),
  { ssr: false }
);
const MapSearch = dynamic(
  () =>
    import("@/components/map/MapSearch").then((m) => ({ default: m.MapSearch })),
  { ssr: false }
);

const STYLE_OPTIONS = [
  { id: "outdoors", label: "Outdoors", value: MAP_STYLES.outdoors },
  { id: "streets", label: "Streets", value: MAP_STYLES.streets },
  { id: "dark", label: "Dark", value: MAP_STYLES.dark },
  { id: "light", label: "Light", value: MAP_STYLES.light },
] as const;

export default function MapPage() {
  const [map, setMap] = useState<Map | null>(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.outdoors);

  const onMapLoad = useCallback((m: Map) => setMap(m), []);

  return (
    <div className="map-container relative h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      <MapGL
        className="absolute inset-0"
        style={mapStyle}
        onLoad={onMapLoad}
      />
      <DeckOverlay map={map} />
      <ParticleFieldDynamic className="absolute inset-0 pointer-events-none" />

      <div className="absolute left-4 top-4 z-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" className="glass border-border/50 text-foreground" asChild>
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex gap-1">
            {STYLE_OPTIONS.map((s) => (
              <Button
                key={s.id}
                variant={mapStyle === s.value ? "secondary" : "ghost"}
                size="sm"
                className="h-8 gap-1 border-border/50 text-foreground"
                onClick={() => setMapStyle(s.value)}
              >
                <Palette className="h-3.5 w-3.5" />
                {s.label}
              </Button>
            ))}
          </div>
          <MapSearch map={map} placeholder="Search country or place…" />
        </div>
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
        <div className="glass rounded-lg border border-border/50 px-4 py-2 text-center text-sm text-foreground/90">
          Climate–Conflict Early Warning • Watershed
        </div>
      </motion.div>
    </div>
  );
}
