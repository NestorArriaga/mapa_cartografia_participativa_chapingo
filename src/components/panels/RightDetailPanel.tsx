import React from "react";
import { useSelectionStore } from "../../stores/selectionStore";
import { X, Download } from "lucide-react";
import { RichMapPopup } from "../ui/RichMapPopup";

interface RightDetailPanelProps {
  className?: string;
  onOpenForm?: (type?: string, zone?: string | null, geom?: any) => void;
}

export const RightDetailPanel: React.FC<RightDetailPanelProps> = () => {
  const { selectedFeature, clearSelection } = useSelectionStore();

  if (!selectedFeature) return null;

  const handleExport = () => {
    const props = selectedFeature.properties || {};
    const title = props.title || props.nombre || props.name || "Elemento";
    const type = props.category || props.corridorType || props.priorityLabel || "Territorio";
    
    const content = `MAPA VIVO UACH-TEXCOCO\nFICHA DE TERRITORIO\n========================\n\nTÍTULO: ${title}\nTIPO: ${type}\n\nDESCRIPCIÓN:\n${props.description || props.summary || props.ethicalNote || "Sin descripción"}\n\nDATA:\n${JSON.stringify(props, null, 2)}`;
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ficha-${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="mv-panel-header" style={{display: 'flex', justifyContent: 'flex-end', paddingBottom: 0, borderBottom: 'none'}}>
        <button 
          onClick={clearSelection}
          className="text-[#9AA9BA] hover:text-white transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mv-panel-body">
        <RichMapPopup feature={selectedFeature} type="" />
      </div>
      
      <div className="mv-panel-footer">
        <div className="mv-btn-row">
          <button 
            onClick={handleExport}
            className="mv-btn mv-btn-ghost"
          >
            <Download className="mv-btn-symbol" size={14} />
            <span className="mv-btn-label">Exportar Ficha</span>
          </button>
        </div>
      </div>
    </>
  );
};