import React from "react";
import { Popup } from "react-map-gl/maplibre";

interface NodeHoverBeaconProps {
  longitude: number;
  latitude: number;
  feature: any;
}

export const NodeHoverBeacon: React.FC<NodeHoverBeaconProps> = ({ longitude, latitude, feature }) => {
  if (!feature || !feature.properties) return null;
  const props = feature.properties;

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeButton={false}
      closeOnClick={false}
      anchor="bottom"
      offset={20}
      className="custom-hover-beacon"
      style={{ zIndex: 10 }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none"
      }}>
        {/* The Card */}
        <div style={{
          background: "rgba(3, 7, 18, 0.94)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: `1px solid ${props.visualRingColor || "rgba(255,255,255,0.1)"}`,
          borderRadius: 8,
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          minWidth: 140
        }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: props.visualRingColor || "#9AA9BA", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-title)" }}>
            {props.visualClass || "Nodo"}
          </div>
          <div style={{ fontSize: "12px", color: "#F4F7FB", fontWeight: 700, fontFamily: "var(--font-ui)", lineHeight: "1.2" }}>
            {props.visualLabel || "Sin nombre"}
          </div>
          {props.relatedZoneName && (
            <div style={{ fontSize: "9px", color: "#9AA9BA", fontFamily: "var(--font-mono)" }}>
              Zona: {props.relatedZoneName}
            </div>
          )}
          <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
            <span style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: "8px", color: "#F4F7FB", fontFamily: "var(--font-mono)" }}>
              Métrica: {props.signalCount || 1}
            </span>
          </div>
        </div>
        
        {/* The Stem */}
        <div style={{
          width: 2,
          height: 16,
          background: `linear-gradient(to bottom, ${props.visualRingColor || "#D6A83A"}, transparent)`
        }} />
      </div>
    </Popup>
  );
};
