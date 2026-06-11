import { ArcLayer } from '@deck.gl/layers';
import { NodeConnection } from '../../../services/nodeNetworkEngine';

export function createNodeNetworkLayer({
  id, connections, nodes, visible, isSelected
}: {
  id: string;
  connections: NodeConnection[];
  nodes: any[];
  visible: boolean;
  isSelected: (id: string) => boolean;
}) {
  if (!visible || connections.length === 0 || nodes.length === 0) return [];

  const getNodeCoords = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.geometry?.coordinates;
  };

  // Only render connections if one of their nodes is selected, to prevent clutter
  const activeConnections = connections.filter(c => 
    isSelected(c.fromNodeId) || (c.toNodeId && isSelected(c.toNodeId))
  );

  if (activeConnections.length === 0) return [];

  return [
    new ArcLayer({
      id: `${id}-arcs`,
      data: activeConnections,
      pickable: false,
      getSourcePosition: (d: NodeConnection) => getNodeCoords(d.fromNodeId) || [0,0],
      getTargetPosition: (d: NodeConnection) => {
        if (d.toNodeId) return getNodeCoords(d.toNodeId) || [0,0];
        // If it's a zone connection, draw arc slightly up to indicate area
        const from = getNodeCoords(d.fromNodeId) || [0,0];
        return [from[0], from[1] + 0.001]; 
      },
      getSourceColor: [214, 168, 58, 200], // Gold
      getTargetColor: [244, 63, 157, 200], // Magenta
      getWidth: (d: NodeConnection) => d.strength * 3,
      updateTriggers: {
        data: [activeConnections]
      }
    })
  ];
}
