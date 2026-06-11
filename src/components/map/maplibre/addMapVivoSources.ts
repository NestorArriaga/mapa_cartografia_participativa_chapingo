import maplibregl from 'maplibre-gl';
import { MapVivoAcademicDataset } from '../../../data/mapVivoAcademicDataset.generated';

export function addMapVivoSources(map: maplibregl.Map, dataset: MapVivoAcademicDataset) {
  const sources = [
    { id: 'mapvivo-zones', data: dataset.publicLayers.zones },
    { id: 'mapvivo-evidence-polygons', data: dataset.publicLayers.evidencePolygons },
    { id: 'mapvivo-documentary-nodes', data: dataset.publicLayers.documentaryNodes },
    { id: 'mapvivo-orientation-nodes', data: dataset.publicLayers.orientationNodes },
    { id: 'mapvivo-mobility', data: dataset.publicLayers.mobilityLines },
    { id: 'mapvivo-connectors', data: dataset.publicLayers.connectors },
    { id: 'mapvivo-reading-routes', data: dataset.publicLayers.readingRoutes },
    { id: 'mapvivo-review-aggregates', data: dataset.researchLayers.reviewItemsAggregated },
    { id: 'mapvivo-computed-routes', data: { type: 'FeatureCollection', features: [] } },
    { id: 'mapvivo-local-submissions', data: { type: 'FeatureCollection', features: [] } }
  ];

  sources.forEach(({ id, data }) => {
    if (!map.getSource(id)) {
      map.addSource(id, {
        type: 'geojson',
        data: data as GeoJSON.GeoJSON
      });
    } else {
      (map.getSource(id) as maplibregl.GeoJSONSource).setData(data as GeoJSON.GeoJSON);
    }
  });
}
