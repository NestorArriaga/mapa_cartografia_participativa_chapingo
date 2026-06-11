// normalizeNodesGeoJSON.ts

export function normalizeNodesGeoJSON(
  geojson: any
): any {
  if (!geojson || !Array.isArray(geojson.features)) {
    return geojson;
  }

  const normalizedFeatures: any[] = geojson.features.map((feature: any, index: number) => {
    const props = feature.properties || {};

    // 1. Assign unique id if it doesn't exist
    const id = props.id || props.nodo_id || `node_${Date.now()}_${index}`;

    // 2. Assign default category if it doesn't exist
    let category = props.category || 'orientacion';

    // 3. Assign default intensity if it doesn't exist
    const intensity = props.intensity !== undefined ? props.intensity : 2;

    // 4. Boyeros Rule: force category='cualitativo'
    const zoneName = String(props.zoneName || props.zona || '').toLowerCase();
    const nodeIdStr = String(id).toLowerCase();
    
    if (zoneName.includes('boyeros') || nodeIdStr.includes('boyeros')) {
      category = 'cualitativo';
    }

    return {
      ...feature,
      properties: {
        ...props,
        id,
        category,
        intensity,
      },
    };
  });

  return {
    ...geojson,
    features: normalizedFeatures,
  };
}
