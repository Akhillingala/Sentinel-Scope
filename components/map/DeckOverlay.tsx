"use client";

import { useMemo, useEffect, useRef } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { GeoJsonLayer } from "@deck.gl/layers";
import * as d3 from "d3-scale-chromatic";
import type { Map } from "mapbox-gl";

export interface RiskFeature {
  type: "Feature";
  properties: { riskScore: number; name: string; id: string };
  geometry: { type: "Polygon"; coordinates: [number, number][][] };
}

const DEFAULT_DATA: RiskFeature[] = [
  {
    type: "Feature",
    properties: { riskScore: 0.85, name: "Sahel", id: "sahel" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-10, 10],
          [15, 10],
          [15, 25],
          [-10, 25],
          [-10, 10],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: { riskScore: 0.62, name: "Horn of Africa", id: "horn" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [35, 0],
          [52, 0],
          [52, 15],
          [35, 15],
          [35, 0],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: { riskScore: 0.45, name: "Southeast Asia", id: "sea" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [95, -10],
          [120, -10],
          [120, 25],
          [95, 25],
          [95, -10],
        ],
      ],
    },
  },
];

const riskToColor = (risk: number) => {
  const t = Math.max(0, Math.min(1, risk));
  return d3.interpolateYlOrRd(t);
};

interface DeckOverlayProps {
  map: Map | null;
  data?: RiskFeature[];
}

export function DeckOverlay({ map, data = DEFAULT_DATA }: DeckOverlayProps) {
  const overlayRef = useRef<MapboxOverlay | null>(null);

  const layers = useMemo(
    () => [
      new GeoJsonLayer<RiskFeature>({
        id: "risk-regions",
        data: { type: "FeatureCollection", features: data },
        getFillColor: (f) => {
          const props = f.properties as { riskScore?: number } | null;
          const c = riskToColor(props?.riskScore ?? 0);
          const match = c.match(/\d+/g);
          if (!match || match.length < 3) return [200, 80, 40, 180];
          return [
            parseInt(match[0], 10),
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            180,
          ];
        },
        getElevation: (f) => ((f.properties as { riskScore?: number })?.riskScore ?? 0) * 800000,
        extruded: true,
        getLineColor: [255, 120, 60, 220],
        lineWidthMinPixels: 1,
        pickable: true,
      }),
    ],
    [data]
  );

  useEffect(() => {
    if (!map) return;
    const overlay = new MapboxOverlay({ layers });
    overlayRef.current = overlay;
    map.addControl(overlay as unknown as mapboxgl.IControl);
    return () => {
      map.removeControl(overlay as unknown as mapboxgl.IControl);
      overlayRef.current = null;
    };
  }, [map, layers]);

  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.setProps({ layers });
  }, [layers]);

  return null;
}
