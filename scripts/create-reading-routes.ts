import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'public', 'data', 'sanitized', 'trayectos_lectura.public.geojson');

const campus = [-98.8816, 19.4950];
const salitreria = [-98.8860, 19.5020];
const cooperativo = [-98.8770, 19.4990];
const boyeros = [-98.8820, 19.4880];
const issste = [-98.8750, 19.4890];

// Crear trayectos conceptuales con algunas curvas (waypoints falsos para dar suavidad)
function curveBetween(p1: number[], p2: number[]): number[][] {
  const points = [p1];
  const midX = (p1[0] + p2[0]) / 2 + 0.001; // slight offset
  const midY = (p1[1] + p2[1]) / 2 + 0.001;
  points.push([midX, midY]);
  points.push(p2);
  return points;
}

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "ruta-salitreria",
        nombre: "Campus ↔ Salitrería",
        categoria: "trayecto_lectura",
        descripcion: "Conexión conceptual hacia zona habitacional estudiantil norte.",
        etica: "Trayecto de lectura conceptual. No es ruta segura ni recomendación de traslado."
      },
      geometry: { type: "LineString", coordinates: curveBetween(campus, salitreria) }
    },
    {
      type: "Feature",
      properties: {
        id: "ruta-cooperativo",
        nombre: "Campus ↔ Cooperativo",
        categoria: "trayecto_lectura",
        descripcion: "Ruta de comercio y vida social universitaria.",
        etica: "Trayecto de lectura conceptual. No es ruta segura ni recomendación de traslado."
      },
      geometry: { type: "LineString", coordinates: curveBetween(campus, cooperativo) }
    },
    {
      type: "Feature",
      properties: {
        id: "ruta-boyeros",
        nombre: "Campus ↔ Boyeros",
        categoria: "trayecto_lectura",
        descripcion: "Conexión sur hacia zona de residencias periféricas.",
        etica: "Trayecto de lectura conceptual. No es ruta segura ni recomendación de traslado."
      },
      geometry: { type: "LineString", coordinates: curveBetween(campus, boyeros) }
    },
    {
      type: "Feature",
      properties: {
        id: "ruta-issste",
        nombre: "Campus ↔ ISSSTE",
        categoria: "trayecto_lectura",
        descripcion: "Conexión hacia infraestructura de salud y vivienda.",
        etica: "Trayecto de lectura conceptual. No es ruta segura ni recomendación de traslado."
      },
      geometry: { type: "LineString", coordinates: curveBetween(campus, issste) }
    }
  ]
};

fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2));
console.log('✅ Trayectos de lectura creados en:', outPath);
