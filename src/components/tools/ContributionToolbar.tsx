import React from "react";
import { MapPin, Route, Hexagon, Ruler, Compass, Bell, Download } from "lucide-react";
import { useMapStore, ToolMode } from "../../stores/mapStore";

export const ContributionToolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useMapStore();

  const handleTool = (id: string) => {
    setActiveTool(id as ToolMode);
  };

  const tools = [
    { id: "add_point", icon: <MapPin size={16} />, label: "Agregar punto", color: "#F43F9D", testId: "tool-add-point" },
    { id: "draw_route", icon: <Route size={16} />, label: "Dibujar ruta", color: "#D6A83A", testId: "tool-draw-route" },
    { id: "draw_zone", icon: <Hexagon size={16} />, label: "Marcar zona", color: "#35D07F", testId: "tool-draw-zone" },
    { id: "measure_distance", icon: <Ruler size={16} />, label: "Medir distancia", color: "#22D3EE", testId: "tool-measure-distance" },
    { id: "calculate_route", icon: <Compass size={16} />, label: "Calcular trayecto", color: "#FB923C", testId: "tool-calculate-route" },
    { id: "radial_menu", icon: <Bell size={16} />, label: "Reporte rápido", color: "#FF4D5E", testId: "tool-quick-report" },
    { id: "export_tools", icon: <Download size={16} />, label: "Exportar", color: "#9AA9BA", testId: "tool-export" },
  ];

  return (
    <>
      {tools.map(t => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => handleTool(t.id)}
            data-testid={t.testId}
            className={`mv-contrib-btn ${isActive ? 'mv-contrib-btn-primary' : 'mv-contrib-btn-ghost'}`}
            title={t.label}
          >
            {t.icon}
          </button>
        );
      })}
    </>
  );
};
export default ContributionToolbar;
