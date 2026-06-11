import React from "react";
import { Popup } from "react-map-gl/maplibre";
import { dispatchAction } from "../../controllers/actionRegistry";

interface RichMapPopupProps {
  longitude: number;
  latitude: number;
  feature: any;
  onClose: () => void;
}

export const RichMapPopup: React.FC<RichMapPopupProps> = ({ longitude, latitude, feature, onClose }) => {
  if (!feature) return null;
  const props = feature.properties || {};

  const isZone = !!props.zone_id;
  const isNode = !!props.visualClass && !props.tiempo_caminata_min;
  const isRoute = !!props.tiempo_caminata_min;

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeButton={true}
      closeOnClick={false}
      onClose={onClose}
      anchor="bottom"
      offset={16}
      style={{ zIndex: 30 }}
      className="custom-rich-popup"
    >
      <div style={{
        background: "rgba(3,7,18,0.94)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(214,168,58,0.25)",
        borderRadius: 16,
        padding: "16px",
        width: 320,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)"
      }}>
        {/* Eyebrow & Category Chip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: "10px", color: "#D6A83A", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.08em", fontFamily: "var(--font-title)" }}>
            {isZone ? "Territorio" : isNode ? "Señal" : isRoute ? "Trayecto" : "Elemento"}
          </div>
          <div style={{ 
            background: props.visualColor ? `${props.visualColor}20` : "rgba(255,255,255,0.1)", 
            color: props.visualColor || "#F4F7FB", 
            padding: "3px 8px", 
            borderRadius: 6, 
            fontSize: "9px", 
            fontWeight: "bold",
            fontFamily: "var(--font-mono)"
          }}>
            {props.visualClass || props.categoria || "Desconocido"}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ margin: 0, fontSize: "18px", color: "#F4F7FB", fontFamily: "var(--font-title)", fontWeight: 800, lineHeight: "1.2" }}>
          {props.visualLabel || props.nombre || props.name || "Sin Nombre"}
        </h3>

        {/* Boyeros / Qualitative Special Handling */}
        {(props.visualClass === "ruta_boyeros_cualitativa" || String(props.nombre).includes("Boyeros")) && (
          <div style={{ 
            background: "rgba(251,191,36,0.1)", 
            borderLeft: "3px solid #FBBF24", 
            padding: "8px 10px",
            borderRadius: 4
          }}>
            <div style={{ fontSize: "11px", color: "#FBBF24", fontWeight: "bold", marginBottom: 2 }}>Validación cualitativa</div>
            <div style={{ fontSize: "10px", color: "#9AA9BA" }}>Corredor DICIFO–Boyeros. No es ruta segura ni ruta exacta.</div>
          </div>
        )}

        {/* Metric Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {isZone && (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 6 }}>
                <div style={{ fontSize: "9px", color: "#9AA9BA", textTransform: "uppercase" }}>Cuantitativo</div>
                <div style={{ fontSize: "13px", color: "#F4F7FB", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{props.score_cuantitativo || "N/A"}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 6 }}>
                <div style={{ fontSize: "9px", color: "#9AA9BA", textTransform: "uppercase" }}>Recomendaciones</div>
                <div style={{ fontSize: "13px", color: "#35D07F", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{props.recomendaciones_count || 0}</div>
              </div>
            </>
          )}
          {isNode && (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 6 }}>
                <div style={{ fontSize: "9px", color: "#9AA9BA", textTransform: "uppercase" }}>Precisión</div>
                <div style={{ fontSize: "13px", color: "#F4F7FB", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{props.precision || "Aproximada"}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 6 }}>
                <div style={{ fontSize: "9px", color: "#9AA9BA", textTransform: "uppercase" }}>Señales</div>
                <div style={{ fontSize: "13px", color: "#F43F9D", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{props.signalCount || 1}</div>
              </div>
            </>
          )}
          {isRoute && (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 6 }}>
                <div style={{ fontSize: "9px", color: "#9AA9BA", textTransform: "uppercase" }}>Distancia</div>
                <div style={{ fontSize: "13px", color: "#F4F7FB", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{props.distancia_m} m</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 6 }}>
                <div style={{ fontSize: "9px", color: "#9AA9BA", textTransform: "uppercase" }}>Caminata</div>
                <div style={{ fontSize: "13px", color: "#D6A83A", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{props.tiempo_caminata_min} min</div>
              </div>
            </>
          )}
        </div>

        {/* Narrative / Description */}
        <p style={{ margin: 0, fontSize: "12px", color: "#9AA9BA", lineHeight: "1.5", fontFamily: "var(--font-ui)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {props.descripcion || props.etica || "No hay detalles adicionales disponibles para este elemento en la capa actual."}
        </p>

        {/* Action Row */}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {isZone && (
            <>
              <button className="mv-action-primary" style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: "11px" }} onClick={() => {
                dispatchAction("open_detail_panel", { payload: { type: "zone", id: props.zone_id || props.nombre } });
                onClose();
              }}>Ver detalle</button>
              <button style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#F4F7FB", border: "none", borderRadius: 8, fontSize: "11px", fontWeight: "bold", cursor: "pointer" }} onClick={() => {
                dispatchAction("start_contribution", { payload: { zone: props.nombre } });
                onClose();
              }}>Aportar aquí</button>
            </>
          )}
          {isNode && (
            <>
              <button className="mv-action-primary" style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: "11px" }} onClick={() => {
                dispatchAction("open_detail_panel", { payload: { type: "node", id: props.id || props.nombre } });
                onClose();
              }}>Ver detalle</button>
              <button style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#F4F7FB", border: "none", borderRadius: 8, fontSize: "11px", fontWeight: "bold", cursor: "pointer" }} onClick={() => {
                dispatchAction("start_contribution", { payload: { location: [longitude, latitude] } });
                onClose();
              }}>Aportar cerca</button>
            </>
          )}
          {isRoute && (
            <button className="mv-action-primary" style={{ width: "100%", padding: "8px 0", borderRadius: 8, fontSize: "11px" }} onClick={() => {
              dispatchAction("open_detail_panel", { payload: { type: "route", id: props.id || props.nombre } });
              onClose();
            }}>Ver en panel derecho</button>
          )}
        </div>
      </div>
    </Popup>
  );
};
