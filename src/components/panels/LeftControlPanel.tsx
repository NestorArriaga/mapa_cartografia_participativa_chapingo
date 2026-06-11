import React from "react";
import { useLayoutStore } from "../../stores/layoutStore";
import { 
  PlusCircle,
  Minimize2,
  Maximize2,
  BarChart3
} from "lucide-react";
import { FeatureCollection, Feature } from "geojson";

interface LeftControlPanelProps {
  onOpenForm: (prefilledType?: string, prefilledZone?: string | null, geom?: any) => void;
  onSelectZone?: (zoneName: string) => void;
  onSelectFeature?: (id: string | null) => void;
  zonesGeoJSON?: FeatureCollection | any;
}

export const LeftControlPanel: React.FC<LeftControlPanelProps> = ({
  onOpenForm,
  onSelectZone,
  zonesGeoJSON
}) => {
  const { setLeftPanelState, leftPanelState } = useLayoutStore();

  // Extract zones from GeoJSON
  const zones: Feature[] = zonesGeoJSON?.features || [];

  if (leftPanelState === "hidden") {
    return (
      <div className="flex items-center justify-center h-full w-full p-4">
        <button onClick={() => setLeftPanelState("expanded")} className="text-[#D6A83A]">
          <Maximize2 size={20} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mv-panel-header">
        <div className="flex justify-between items-start">
          <div>
            <div className="mv-panel-logo">Mapa Vivo</div>
            <div className="mv-panel-subtitle">UACh – Texcoco</div>
          </div>
          <button onClick={() => setLeftPanelState("hidden")} className="text-[#9AA9BA] hover:text-[#F8FAFC]">
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      <div className="mv-panel-body">
        <div className="mv-section-label">Zonas de Prioridad</div>
        {zones.length === 0 ? (
          <div className="mv-empty-state">
            <div className="mv-empty-text">No hay zonas cargadas</div>
          </div>
        ) : (
          zones.map((feature, idx) => {
            const props = feature.properties || {};
            const name = props.displayName || props.nombre || props.zona || `Zona ${idx + 1}`;
            // Determine priority class for styling based on 'prioridad' or intensity
            let pClass = "mv-priority-none";
            if (props.prioridad === "alta" || props.intensity === 3) pClass = "mv-priority-alta";
            else if (props.prioridad === "media" || props.intensity === 2) pClass = "mv-priority-media";
            else if (name.toLowerCase().includes("boyeros") || props.prioridad === "validacion_cualitativa") pClass = "mv-priority-cual";

            return (
              <div 
                key={idx} 
                className={`mv-zone-item ${pClass}`}
                onClick={() => onSelectZone && onSelectZone(name)}
              >
                <div className="mv-zone-dot"></div>
                <div className="mv-zone-name" title={name}>{name}</div>
                <div className="mv-zone-score">{props.intensity ? (props.intensity * 33) : "—"}</div>
              </div>
            );
          })
        )}
      </div>

      <div className="mv-panel-footer">
        <div className="mv-btn-row">
          <button 
            onClick={() => onOpenForm()}
            className="mv-btn mv-btn-ghost"
          >
            <PlusCircle className="mv-btn-symbol" size={14} />
            <span className="mv-btn-label">Aportar</span>
          </button>
          <button 
            onClick={() => useLayoutStore.getState().setShowDashboard(true)}
            className="mv-btn mv-btn-ghost"
          >
            <BarChart3 className="mv-btn-symbol" size={14} />
            <span className="mv-btn-label">Métricas</span>
          </button>
        </div>
      </div>
    </>
  );
};