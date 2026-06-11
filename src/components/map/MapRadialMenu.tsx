import React, { useEffect, useState } from "react";
import { AlertTriangle, LightbulbOff, Lock, RouteOff, HeartHandshake, PenTool } from "lucide-react";

interface MapRadialMenuProps {
  x: number;
  y: number;
  onComplete: () => void;
  latLng?: [number, number];
  onOpenForm: (prefilledType: string, prefilledZone: string | null, geom: any) => void;
}

export const MapRadialMenu: React.FC<MapRadialMenuProps> = ({ x, y, onComplete, latLng, onOpenForm }) => {
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setAnim(true));
  }, []);

  const handleSelect = (id: string) => {
    const geom = latLng ? {
      type: "Point" as const,
      coordinates: latLng,
      precision: "approximate" as const,
      privacyMode: "requires_review" as const
    } : null;

    onOpenForm(id, null, geom);
    onComplete();
  };

  const options = [
    { id: "alerta", label: "Me sentí en alerta", icon: <AlertTriangle size={16}/>, color: "#FF4D5E", angle: -90 },
    { id: "iluminacion", label: "Falta iluminación", icon: <LightbulbOff size={16}/>, color: "#FBBF24", angle: -30 },
    { id: "cerrado", label: "Acceso cerrado", icon: <Lock size={16}/>, color: "#9AA9BA", angle: 30 },
    { id: "evitada", label: "Ruta evitada", icon: <RouteOff size={16}/>, color: "#FB923C", angle: 90 },
    { id: "apoyo", label: "Punto de apoyo", icon: <HeartHandshake size={16}/>, color: "#35D07F", angle: 150 },
    { id: "mejora", label: "Sugerir mejora", icon: <PenTool size={16}/>, color: "#F43F9D", angle: 210 },
  ];

  return (
    <div className="absolute pointer-events-auto z-50" style={{ left: x, top: y, width: "10px", height: "10px" }} data-testid="map-radial-menu">
      {options.map((opt) => {
        const radius = anim ? 75 : 0;
        const rad = opt.angle * (Math.PI / 180);
        const tx = Math.cos(rad) * radius;
        const ty = Math.sin(rad) * radius;

        return (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            data-testid={`radial-option-${opt.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-[#030712] border-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group"
            style={{
              width: "42px",
              height: "42px",
              transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${anim ? 1 : 0})`,
              borderColor: opt.color,
              color: opt.color,
              cursor: "pointer"
            }}
          >
            {opt.icon}
            <div className="absolute top-full mt-2 bg-[#0B1220] px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 uppercase tracking-widest font-mono border border-white/10">
              {opt.label}
            </div>
          </button>
        );
      })}
    </div>
  );
};
export default MapRadialMenu;
