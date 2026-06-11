import React, { useState } from "react";
import { BookOpen, ChevronRight, ChevronLeft, Map } from "lucide-react";
import { useMapStore } from "../../stores/mapStore";
import { useLiveMetricsStore } from "../../stores/liveMetricsStore";
import { executeMapVivoAction, MapVivoActionId } from "../../controllers/actionRegistry";

interface GuidedTerritoryStoriesProps {
  onSelectZone: (zoneName: string) => void;
  onSelectFeature: (id: string | null) => void;
}

export const GuidedTerritoryStories: React.FC<GuidedTerritoryStoriesProps> = ({
  onSelectZone,
  onSelectFeature,
}) => {
  const { setViewState, selectFeature } = useMapStore();
  const [currentStep, setCurrentStep] = useState(0);

  const stories = [
    {
      title: "Leer el campus",
      explanation: "Esta historia te lleva a explorar la red de nodos del campus central de la Universidad Autónoma Chapingo. Aquí mapeamos los puntos de orientación y servicios estudiantiles principales.",
      longitude: -98.8850,
      latitude: 19.4920,
      zoom: 15.0,
      zoneName: "UNIVERSIDAD AUTONOMA CHAPINGO",
      featureId: "zone_chapingo"
    },
    {
      title: "Trayectos hacia colonias",
      explanation: "Los trayectos regionales vinculan el campus con los asentamientos peri-campus. Analizamos la movilidad de cuidado en los caminos cotidianos de la comunidad.",
      longitude: -98.8890,
      latitude: 19.4930,
      zoom: 14.0,
      zoneName: "TRAMO ISSSTE - CHAPINGO",
      featureId: "zone_issste"
    },
    {
      title: "Boyeros: señal cualitativa",
      explanation: "Aunque Boyeros posee una muestra cuantitativa estructurada baja, la señal cualitativa e indicios testimoniales revelan necesidades críticas de validación en el trayecto DICIFO-Boyeros.",
      longitude: -98.9106,
      latitude: 19.4990,
      zoom: 14.5,
      zoneName: "Boyeros",
      featureId: "zone_boyeros"
    },
    {
      title: "Salitrería y Cooperativo: alerta agregada",
      explanation: "Estas zonas peri-campus presentan alta incidencia de alerta y evitación agregada por deficiencias de alumbrado y transporte nocturno.",
      longitude: -98.8900,
      latitude: 19.5002,
      zoom: 14.5,
      zoneName: "SALITRERIA",
      featureId: "zone_salitreria"
    },
    {
      title: "Cómo participar sin exponerte",
      explanation: "Puedes colaborar agregando puntos de mejora o reportes rápidos de forma completamente anónima. La plataforma sanitiza la geometría exacta para tu seguridad.",
      longitude: -98.8816,
      latitude: 19.4950,
      zoom: 14.2,
      zoneName: "COOPERATIVO/CABAÑAS",
      featureId: "zone_cooperativo"
    }
  ];

  const handleNext = () => {
    const nextIdx = (currentStep + 1) % stories.length;
    setCurrentStep(nextIdx);
    applyStoryStep(nextIdx, "next_tour_step");
  };

  const handlePrev = () => {
    const prevIdx = (currentStep - 1 + stories.length) % stories.length;
    setCurrentStep(prevIdx);
    applyStoryStep(prevIdx, "prev_tour_step");
  };

  const applyStoryStep = async (idx: number, actionId: MapVivoActionId) => {
    const story = stories[idx];
    const map = (window as any).maplibreMapInstance;

    // Move Camera via MapLibre flyTo
    if (map) {
      map.flyTo({
        center: [story.longitude, story.latitude],
        zoom: story.zoom,
        pitch: 45,
        bearing: -15,
        essential: true,
        duration: 1500
      });
    } else {
      setViewState({
        longitude: story.longitude,
        latitude: story.latitude,
        zoom: story.zoom,
        pitch: 45,
        bearing: -15,
        transitionDuration: 1000
      });
    }

    // Set active layers based on story step theme
    const store = useMapStore.getState();
    let storyLayers: string[] = ["zones"];
    if (idx === 0) {
      storyLayers = ["zones", "documentaryNodes", "orientationNodes", "campusRoutes"];
    } else if (idx === 1) {
      storyLayers = ["zones", "mobilityLines", "readingRoutes"];
    } else if (idx === 2) {
      storyLayers = ["zones", "documentaryNodes", "mobilityLines", "connectors"];
    } else if (idx === 3) {
      storyLayers = ["zones", "evidencePolygons", "documentaryNodes"];
    } else if (idx === 4) {
      storyLayers = ["zones", "documentaryNodes", "connectors"];
    }
    store.setLayers(storyLayers);

    // Run action through registry
    await executeMapVivoAction(actionId, {
      map,
      refreshMetrics: () => useLiveMetricsStore.getState().refreshMetrics()
    });

    // Select zone / route / node in UI
    onSelectZone(story.zoneName);
    onSelectFeature(story.featureId);
    selectFeature(story.featureId);
  };

  const story = stories[currentStep];

  return (
    <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-3" data-testid="guided-territory-stories">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-xs font-black text-[#D6A83A] uppercase tracking-wider flex items-center gap-1.5 font-title">
          <BookOpen size={14} />
          Recorridos Guiados
        </h3>
        <span className="text-[10px] font-mono text-[#9AA9BA]">
          {currentStep + 1} / {stories.length}
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-title">
          <Map size={12} className="text-[#FBBF24]" />
          {story.title}
        </h4>
        <p className="text-xs text-[#9AA9BA] font-ui leading-relaxed">
          {story.explanation}
        </p>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 text-[11px] font-bold text-[#9AA9BA] hover:text-white px-2 py-1 bg-white/5 rounded border border-white/5 transition-all cursor-pointer"
        >
          <ChevronLeft size={14} />
          Anterior
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-1 text-[11px] font-bold text-[#F43F9D] hover:text-white px-3 py-1 bg-[#F43F9D]/10 hover:bg-[#F43F9D]/20 rounded border border-[#F43F9D]/30 transition-all cursor-pointer"
          data-testid="story-next-btn"
        >
          Siguiente
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
export default GuidedTerritoryStories;
