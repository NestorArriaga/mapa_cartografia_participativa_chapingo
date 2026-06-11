import React from "react";
import { Popup } from "react-map-gl/maplibre";

interface RichMapTooltipProps {
  longitude: number;
  latitude: number;
  feature: any;
}

export const RichMapTooltip: React.FC<RichMapTooltipProps> = ({ longitude, latitude, feature }) => {
  if (!feature) return null;
  const props = feature.properties || {};

  const isZone = !!props.zone_id;
  const isRoute = !!props.tiempo_caminata_min;

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeButton={false}
      closeOnClick={false}
      anchor="top"
      offset={10}
      style={{ zIndex: 20 }}
      className="custom-rich-tooltip"
    >
      <div style={{
        background: "rgba(3,7,18,0.85)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pointerEvents: "none",
        minWidth: 120
      }}>
        <div style={{ fontSize: "9px", color: "#D6A83A", textTransform: "uppercase", fontWeight: "bold", fontFamily: "var(--font-title)" }}>
          {isZone ? "Territorio" : isRoute ? "Trayecto" : "Elemento"}
        </div>
        <div style={{ fontSize: "12px", color: "#F4F7FB", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
          {props.visualLabel || props.nombre || props.name || "Sin Nombre"}
        </div>
        {props.visualClass && (
          <div style={{ fontSize: "10px", color: "#9AA9BA", fontFamily: "var(--font-ui)" }}>
            {props.visualClass.replace(/_/g, " ")}
          </div>
        )}
      </div>
    </Popup>
  );
};
