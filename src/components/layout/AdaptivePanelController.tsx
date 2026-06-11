import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";
import { useLayoutStore } from "../../stores/layoutStore";

interface AdaptivePanelControllerProps {
  map: maplibregl.Map | null;
}

export const AdaptivePanelController: React.FC<AdaptivePanelControllerProps> = ({ map }) => {
  const { notifyMapInteraction, setFocusMode, setLeftPanelState, setRightPanelState, } = useLayoutStore();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case "h": {
          // Toggle Hide
          const currentLeft = useLayoutStore.getState().leftPanelState;
          if (currentLeft === "hidden") {
            setLeftPanelState("expanded");
            setRightPanelState("expanded");
          } else {
            setLeftPanelState("hidden");
            setRightPanelState("hidden");
          }
          break;
        }
        case "f":
          // Toggle Focus Mode
          setFocusMode(!useLayoutStore.getState().focusMode);
          break;
        case "e":
          // Expand panels
          setLeftPanelState("expanded");
          setRightPanelState("expanded");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setFocusMode, setLeftPanelState, setRightPanelState]);

  // Map Interaction
  useEffect(() => {
    if (!map) return;

    const onStart = () => notifyMapInteraction(true);
    const onEnd = () => notifyMapInteraction(false);

    map.on("dragstart", onStart);
    map.on("zoomstart", onStart);
    map.on("rotatestart", onStart);
    map.on("pitchstart", onStart);

    map.on("dragend", onEnd);
    map.on("zoomend", onEnd);
    map.on("rotateend", onEnd);
    map.on("pitchend", onEnd);

    return () => {
      map.off("dragstart", onStart);
      map.off("zoomstart", onStart);
      map.off("rotatestart", onStart);
      map.off("pitchstart", onStart);

      map.off("dragend", onEnd);
      map.off("zoomend", onEnd);
      map.off("rotateend", onEnd);
      map.off("pitchend", onEnd);
    };
  }, [map, notifyMapInteraction]);

  return null;
};
