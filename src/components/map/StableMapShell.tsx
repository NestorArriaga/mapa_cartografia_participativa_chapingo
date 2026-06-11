import React from "react";
import { EnhancedMapExperience } from "./EnhancedMapExperience";
import { MapErrorBoundary } from "../system/MapErrorBoundary";
import { SafeLayer } from "../../lib/safeDataLoader";

interface StableMapShellProps {
  layers: SafeLayer[];
  onMapLoaded: (loaded: boolean) => void;
  onLayersLoaded: (loaded: boolean) => void;
  onLayerCounts: (counts: { zones: number; nodes: number; routes: number }) => void;
  addErrors: (errs: string[]) => void;
  onOpenForm: (prefilledType: string, prefilledZone: string | null, geom: any) => void;
}

export const StableMapShell: React.FC<StableMapShellProps> = (props) => {
  return (
    <MapErrorBoundary 
      moduleName="StableMapShell"
      fallback={
        <div className="w-full h-full bg-[#030712] flex items-center justify-center text-white">
          <div className="text-center space-y-4">
            <div className="text-[#FF4D5E] font-bold">Error fatal del renderizador</div>
            <p className="text-sm text-[#9AA9BA]">El visor no pudo inicializarse. Reinicie la aplicación.</p>
          </div>
        </div>
      }
    >
      <EnhancedMapExperience {...props} />
    </MapErrorBoundary>
  );
};
