"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";
const DEFAULT_CENTER: [number, number] = [10, 20];
const DEFAULT_ZOOM = 2.2;

export interface MapGLHandle {
  getMap: () => mapboxgl.Map | null;
  getBounds: () => mapboxgl.LngLatBounds | null;
}

interface MapGLProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  onLoad?: (map: mapboxgl.Map) => void;
  mapRef?: React.RefObject<MapGLHandle | null>;
}

export function MapGL({
  className = "",
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  onLoad,
  mapRef,
}: MapGLProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  const getMap = useCallback(() => mapInstance.current, []);
  const getBounds = useCallback(
    () => mapInstance.current?.getBounds() ?? null,
    []
  );

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center,
      zoom,
      projection: "globe",
      antialias: true,
    });

    map.on("load", () => {
      mapInstance.current = map;
      setLoaded(true);
      map.setFog({
        color: "rgb(9, 9, 20)",
        "high-color": "rgb(30, 40, 80)",
        "horizon-blend": 0.2,
      });
      onLoad?.(map);
    });

    return () => {
      map.remove();
      mapInstance.current = null;
      setLoaded(false);
    };
  }, [center[0], center[1], zoom, onLoad]);

  useEffect(() => {
    if (!mapRef) return;
    (mapRef as React.MutableRefObject<MapGLHandle | null>).current = {
      getMap,
      getBounds,
    };
    return () => {
      if (mapRef)
        (mapRef as React.MutableRefObject<MapGLHandle | null>).current = null;
    };
  }, [mapRef, getMap, getBounds, loaded]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  );
}
