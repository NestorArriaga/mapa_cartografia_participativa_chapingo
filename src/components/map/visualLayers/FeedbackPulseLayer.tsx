import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { useLiveMetricsStore } from "../../../stores/liveMetricsStore";
import { MAPVIVO } from "../../../lib/colorScales";

interface FeedbackPulseLayerProps {
  map: maplibregl.Map | null;
}

export const FeedbackPulseLayer: React.FC<FeedbackPulseLayerProps> = ({ map }) => {
  const localSubmissions = useLiveMetricsStore((state) => state.localSubmissions);
  const [pulseFeatures, setPulseFeatures] = useState<any[]>([]);

  useEffect(() => {
    if (localSubmissions.length === 0) return;

    // Get the most recent submission
    const latest = localSubmissions[localSubmissions.length - 1];
    if (!latest.geometry || latest.geometry.type !== "Point") return;

    // Add to pulsing features list
    const newFeature = {
      type: "Feature",
      properties: {
        id: latest.id,
        createdAt: Date.now(),
        opacity: 1.0,
        radius: 10,
      },
      geometry: latest.geometry,
    };

    setPulseFeatures((prev) => [...prev, newFeature]);

    // Cleanup / dissolve animation: remove after 6 seconds
    const timer = setTimeout(() => {
      setPulseFeatures((prev) => prev.filter((f) => f.properties.id !== latest.id));
    }, 6000);

    return () => clearTimeout(timer);
  }, [localSubmissions]);

  useEffect(() => {
    if (!map) return;

    const sourceId = "feedback-pulse-source";
    const data = {
      type: "FeatureCollection",
      features: pulseFeatures,
    };

    try {
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data as any);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: data as any,
        });
      }

      if (!map.getLayer("local-feedback-halo")) {
        map.addLayer({
          id: "local-feedback-halo",
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": ["coalesce", ["get", "radius"], 12],
            "circle-color": MAPVIVO.magentaCare,
            "circle-opacity": ["coalesce", ["get", "opacity"], 0.8],
            "circle-stroke-color": MAPVIVO.softWhite,
            "circle-stroke-width": 2,
            "circle-stroke-opacity": ["coalesce", ["get", "opacity"], 0.8],
          },
        });
      }
    } catch (err) {
      console.error("Error updating pulse layer:", err);
    }

    // Animate the pulse size and dissolve opacity
    let animationFrameId: number;
    let startTimestamp: number;

    const animatePulse = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;

      // Update radius and opacity dynamically
      let changed = false;
      const updatedFeatures = pulseFeatures.map((f) => {
        const age = Date.now() - f.properties.createdAt;
        if (age > 6000) return f;

        changed = true;
        const ratio = age / 6000;
        return {
          ...f,
          properties: {
            ...f.properties,
            radius: 10 + ratio * 35, // grow radius
            opacity: Math.max(0, 1 - ratio), // dissolve opacity
          },
        };
      });

      if (changed && map && map.getSource(sourceId)) {
        try {
          (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: updatedFeatures,
          });
        } catch (e) {
          // ignore map updates after removal
        }
      }

      animationFrameId = requestAnimationFrame(animatePulse);
    };

    if (pulseFeatures.length > 0) {
      animationFrameId = requestAnimationFrame(animatePulse);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (!map || !map.getStyle()) return;
      try {
        if (map.getLayer("local-feedback-halo")) map.removeLayer("local-feedback-halo");
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (err) {
        // ignore style destruction errors
      }
    };
  }, [map, pulseFeatures]);

  return null;
};
