/**
 * Central Action Registry for Mapa Vivo UACh-Texcoco.
 * All interactive UI elements must dispatch actions through this registry.
 */

// Define all acceptable action IDs in the application.
export type MapVivoActionId =
  // Map View Controls
  | 'focus_global_view'
  | 'focus_zone_boyeros'
  | 'focus_zone_huizache'
  | 'focus_zone_cooperativa'
  
  // Panel Controls
  | 'open_detail_panel'
  | 'close_detail_panel'
  | 'toggle_left_panel'
  | 'switch_detail_tab_resumen'
  | 'switch_detail_tab_datos'
  | 'switch_detail_tab_senales'
  | 'switch_detail_tab_red'
  | 'switch_detail_tab_cuidado'
  | 'switch_detail_tab_participar'

  // Data Mode & Security
  | 'toggle_data_mode' // Swaps between academic_internal and public_safe
  
  // Layer Toggles
  | 'toggle_layer_nodes'
  | 'toggle_layer_routes'
  | 'toggle_layer_zones'
  | 'toggle_layer_heatmap'

  // Guided Experience
  | 'start_guided_tour'
  | 'next_tour_step'
  | 'prev_tour_step'
  | 'end_guided_tour'

  // Contributions & Feedback
  | 'open_contribution_modal'
  | 'submit_contribution'
  | 'cancel_contribution'

  // Tools
  | 'export_data_csv'
  | 'export_data_json'
  | 'print_map_view'
  
  | 'activate_public_mode'
  | 'activate_academic_mode'
  | 'toggle_zones'
  | 'toggle_evidence'
  | 'toggle_documentary_nodes'
  | 'toggle_orientation_nodes'
  | 'toggle_mobility'
  | 'toggle_connectors'
  | 'toggle_reading_routes'
  | 'toggle_campus_routes'
  | 'toggle_node_network'
  | 'toggle_protected_aggregates'
  | 'explore_zones'
  | 'show_routes'
  | 'start_contribution'
  | 'quick_report'
  | 'draw_route'
  | 'calculate_route'
  | 'add_point'
  // General
  | 'noop' // For buttons that are visually present but not yet implemented
  ;

export interface ActionContext {
  payload?: any;
  sourceEvent?: React.MouseEvent | React.TouchEvent | Event;
}

/**
 * The core dispatcher function for the application.
 * All buttons should call this function instead of putting logic directly in onClick.
 */
export const dispatchAction = (actionId: MapVivoActionId, context?: ActionContext) => {
  console.log(`[ActionRegistry] Dispatching action: ${actionId}`, context?.payload || '');

  // TODO: In a more complex architecture, this would connect to a zustand store or event emitter.
  // For now, we will expose a custom event that specific components (like panels or the map) can listen to.
  
  const event = new CustomEvent('mapvivo:action', {
    detail: {
      actionId,
      payload: context?.payload
    }
  });
  
  window.dispatchEvent(event);
};

/**
 * React Hook to listen for specific actions in components.
 */
import { useEffect } from 'react';

export function useMapVivoAction(
  actionId: MapVivoActionId, 
  callback: (payload: any) => void
) {
  useEffect(() => {
    const handleAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.actionId === actionId) {
        callback(customEvent.detail.payload);
      }
    };
    
    window.addEventListener('mapvivo:action', handleAction);
    return () => window.removeEventListener('mapvivo:action', handleAction);
  }, [actionId, callback]);
}

/**
 * Execute complex actions that require map or store context.
 */
export const executeMapVivoAction = async (actionId: string, context: any) => {
  console.log(`[ActionRegistry] Executing action: ${actionId}`);
  
  if (actionId === "explore_zones" || actionId === "show_routes" || actionId === "start_contribution" || actionId === "quick_report" || actionId === "draw_route" || actionId === "calculate_route" || actionId === "add_point" || actionId === "toggle_node_network") {
    if (context.setToast) {
      context.setToast("Acción de validación enviada correctamente", "success");
    }
  }

  // Trigger global metrics refresh if requested
  if (context.refreshMetrics) {
    context.refreshMetrics();
  }

  // Trigger map side effects if present
  if (context.map) {
    context.map.fire("resize");
  }
};
