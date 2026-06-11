import React from "react";
import { Popup } from "react-map-gl/maplibre";
import { dispatchAction } from "../../controllers/actionRegistry";

interface SelectedNodeCalloutProps {
  longitude: number;
  latitude: number;
  feature: any;
  onClose: () => void;
}

export const SelectedNodeCallout: React.FC<SelectedNodeCalloutProps> = ({ longitude, latitude, feature, onClose }) => {
  if (!feature || !feature.properties) return null;
  const props = feature.properties;

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeButton={false}
      closeOnClick={false}
      anchor="bottom"
      offset={24}
      className="custom-selected-callout"
      style={{ zIndex: 15 }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* The Card */}
        <div className="mv-panel-readable" style={{
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minWidth: 180,
          borderRadius: 12
        }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: "bold", color: props.visualRingColor || "#9AA9BA", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-title)" }}>
              {props.visualClass || "Nodo Seleccionado"}
            </div>
            <div style={{ fontSize: "14px", color: "#F4F7FB", fontWeight: 700, fontFamily: "var(--font-ui)", lineHeight: "1.2", marginTop: 2 }}>
              {props.visualLabel || "Sin nombre"}
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 4 }}>
            <button 
              className="mv-action-primary"
              style={{ padding: "6px 0", fontSize: "10px", borderRadius: 6 }}
              onClick={() => {
                dispatchAction("open_detail_panel", { payload: { type: "node", id: props.id || props.id_nodo } });
              }}
            >
              Ver detalle
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <button 
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#9AA9BA",
                  fontSize: "9px",
                  padding: "4px 0",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
                onClick={() => dispatchAction("start_contribution", { payload: { location: [longitude, latitude] }})}
              >
                Aportar
              </button>
              <button 
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#9AA9BA",
                  fontSize: "9px",
                  padding: "4px 0",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
        
        {/* The Stem */}
        <div style={{
          width: 3,
          height: 24,
          background: `linear-gradient(to bottom, rgba(244,247,251,0.8), transparent)`
        }} />
      </div>
    </Popup>
  );
};
