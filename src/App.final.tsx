/**
 * App.final.tsx — Mapa Vivo UACh-Texcoco
 * Sala limpia: autocontenido, sin imports de componentes rotos.
 * Stack: React 18 + MapLibre GL JS + TypeScript
 *
 * REAL DATA STRUCTURE (from sanitized GeoJSON files):
 *  Zones (5): zona, score_integrado, prioridad_v05, nota_web...
 *  Nodes Ori (60): nodo_id, nombre, tipo_web, zona_base...
 *  Nodes Doc (20): node_id, titulo, categoria, zona, urgencia...
 *  Routes (82): id, nombre, tipo, categoria...
 *  Qual Signals: Array of {zoneName, signalType, intensity, confidence...}
 *  Survey Signals: Array of {zoneId, zoneName, score, confidence...}
 */

import React, {
  useEffect, useRef, useState, useCallback, useMemo
} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ─────────────────────────────────────────────────────────
// PALETA
// ─────────────────────────────────────────────────────────
const C = {
  obsidian:  '#030712',
  panel:     'rgba(3,7,18,0.93)',
  panelHard: 'rgba(3,7,18,0.97)',
  gold:      '#D6A83A',
  maize:     '#F2C14E',
  green:     '#35D07F',
  greenSoft: '#7EE2A8',
  magenta:   '#F43F9D',
  coral:     '#FF4D5E',
  orange:    '#FB923C',
  amber:     '#FBBF24',
  violet:    '#A855F7',
  gray:      '#64748B',
  white:     '#F4F7FB',
  muted:     '#9AA9BA',
  border:    'rgba(214,168,58,0.13)',
  borderHov: 'rgba(214,168,58,0.28)',
};

// ─────────────────────────────────────────────────────────
// TIPOGRAFÍA
// ─────────────────────────────────────────────────────────
const FONT_LINK = `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap`;

function injectFonts() {
  if (document.getElementById('mv-fonts')) return;
  const link = document.createElement('link');
  link.id = 'mv-fonts';
  link.rel = 'stylesheet';
  link.href = FONT_LINK;
  document.head.appendChild(link);
}

// ─────────────────────────────────────────────────────────
// ESTILOS GLOBALES
// ─────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #030712; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }
  .maplibregl-canvas { border-radius: 0 !important; }
  .maplibregl-ctrl-attrib { display: none !important; }
  .maplibregl-ctrl-group { background: rgba(3,7,18,0.85) !important; border: 1px solid rgba(214,168,58,0.15) !important; border-radius: 8px !important; }
  .maplibregl-ctrl-group button { width: 28px !important; height: 28px !important; }
  .maplibregl-ctrl-group button + button { border-top: 1px solid rgba(214,168,58,0.10) !important; }
  .maplibregl-ctrl-group button span { filter: invert(0.7) !important; }

  .mv-scroll::-webkit-scrollbar { width: 3px; }
  .mv-scroll::-webkit-scrollbar-track { background: transparent; }
  .mv-scroll::-webkit-scrollbar-thumb { background: rgba(214,168,58,0.2); border-radius: 10px; }

  @keyframes mv-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }
  @keyframes mv-slide-left { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes mv-slide-right { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes mv-slide-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mv-callout-in { from{opacity:0;transform:translate(-50%,-90%) scale(.93)} to{opacity:1;transform:translate(-50%,-100%) scale(1)} }
  @keyframes mv-toast-in { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes mv-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes mv-fade-in { from{opacity:0} to{opacity:1} }
  @keyframes mv-scale-in { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  @media (max-width: 768px) {
    .mv-mobile-btn-label { display: none !important; }
    .mv-contrib-btn { padding: 8px 14px !important; }
  }
`;

function injectGlobalCSS() {
  if (document.getElementById('mv-global-css')) return;
  const style = document.createElement('style');
  style.id = 'mv-global-css';
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────
// SATELLITE STYLE
// ─────────────────────────────────────────────────────────
const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri',
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
};

const MAP_CENTER: [number, number] = [-98.8885, 19.4844];
const MAP_ZOOM = 13.5;

// ─────────────────────────────────────────────────────────
// NODE CATEGORIES — mapped from tipo_web + categoria values
// ─────────────────────────────────────────────────────────
const NODE_CATS: Record<string, { color: string; label: string; icon: string }> = {
  referencia_campus:        { color: C.gold,     label: 'Referencia Campus',    icon: '◈' },
  acceso_movilidad:         { color: C.amber,    label: 'Acceso Movilidad',     icon: '⬡' },
  edificio_academico:       { color: C.greenSoft,label: 'Edificio Académico',   icon: '◉' },
  percepcion_espacio:       { color: C.magenta,  label: 'Percepción Espacio',   icon: '◆' },
  infraestructura_vial:     { color: C.orange,   label: 'Infraestructura Vial', icon: '■' },
  movilidad_peatonal:       { color: C.amber,    label: 'Movilidad Peatonal',   icon: '⬡' },
  recurso_comunitario:      { color: C.green,    label: 'Recurso Comunitario',  icon: '▲' },
  participacion_social:     { color: C.violet,   label: 'Participación Social', icon: '★' },
  memoria_territorial:      { color: C.maize,    label: 'Memoria Territorial',  icon: '◎' },
  protegido_agregado:       { color: C.gray,     label: 'Protegido',            icon: '⬟' },
  documental:               { color: C.greenSoft,label: 'Documental',           icon: '◉' },
  cualitativo:              { color: C.magenta,  label: 'Cualitativo',          icon: '◆' },
  orientacion:              { color: C.gold,     label: 'Orientación',          icon: '◈' },
};

// Fallback category
const DEFAULT_CAT = { color: C.gold, label: 'Nodo', icon: '◈' };
function getCatInfo(cat: string) { return NODE_CATS[cat] ?? DEFAULT_CAT; }

// ─────────────────────────────────────────────────────────
// ALGORITHM TYPES
// ─────────────────────────────────────────────────────────
type SignalType = 'quantitative_survey'|'qualitative_testimony'|'documentary_evidence'|'protected_signal'|'participatory_feedback'|'mobility_connectivity';
type PriorityLabel = 'prioridad_alta'|'prioridad_media'|'validacion_cualitativa'|'sin_datos_estructurados';

const BASE_WEIGHTS: Record<SignalType,number> = {
  quantitative_survey:    0.35,
  qualitative_testimony:  0.25,
  documentary_evidence:   0.15,
  protected_signal:       0.10,
  participatory_feedback: 0.10,
  mobility_connectivity:  0.05,
};

const PRIORITY_COLORS: Record<PriorityLabel,string> = {
  prioridad_alta:          C.coral,
  prioridad_media:         C.amber,
  validacion_cualitativa:  C.violet,
  sin_datos_estructurados: C.gray,
};

const PRIORITY_LABELS: Record<PriorityLabel,string> = {
  prioridad_alta:          'Prioridad alta',
  prioridad_media:         'Prioridad media',
  validacion_cualitativa:  'Validación cualitativa',
  sin_datos_estructurados: 'Sin datos estructurados',
};

interface Signal { type: SignalType; score: number; confidence: 'alta'|'media'|'baja'; source?: string; }

interface ZoneResult {
  id: string; name: string;
  score: number; label: PriorityLabel;
  color: string; displayLabel: string;
  signals: Signal[]; isBoyeros: boolean;
  warnings: string[];
  properties: Record<string,unknown>;
}

// ─────────────────────────────────────────────────────────
// PRIORITY ALGORITHM
// ─────────────────────────────────────────────────────────
function calcPriority(
  id: string, name: string,
  signals: Signal[],
  contributions: Signal[] = [],
  props: Record<string,unknown> = {}
): ZoneResult {
  const isBoyeros = name.toLowerCase().includes('boyeros') || id.toLowerCase().includes('boyeros');
  const all = [...signals, ...contributions];

  if (isBoyeros && !all.some(s => s.type === 'qualitative_testimony')) {
    all.push({ type: 'qualitative_testimony', score: 70, confidence: 'baja' });
  }

  if (all.length === 0) {
    return {
      id, name, score: 0,
      label: 'sin_datos_estructurados',
      color: PRIORITY_COLORS.sin_datos_estructurados,
      displayLabel: PRIORITY_LABELS.sin_datos_estructurados,
      signals: all, isBoyeros, warnings: [`${name}: sin señales registradas`],
      properties: props,
    };
  }

  const byType: Partial<Record<SignalType, number[]>> = {};
  all.forEach(s => {
    if (!byType[s.type]) byType[s.type] = [];
    byType[s.type]!.push(s.score);
  });

  const available = Object.keys(byType) as SignalType[];
  const totalWeight = available.reduce((sum, t) => sum + BASE_WEIGHTS[t], 0);

  let score = 0;
  available.forEach(t => {
    const avg = byType[t]!.reduce((a,b)=>a+b,0) / byType[t]!.length;
    score += (BASE_WEIGHTS[t] / totalWeight) * avg;
  });
  score = Math.round(Math.min(100, Math.max(0, score)));

  const onlyQual = available.every(t =>
    t === 'qualitative_testimony' || t === 'participatory_feedback'
  );

  let label: PriorityLabel;
  if (isBoyeros || onlyQual) {
    label = 'validacion_cualitativa';
  } else if (score >= 65) {
    label = 'prioridad_alta';
  } else if (score >= 35) {
    label = 'prioridad_media';
  } else {
    label = 'sin_datos_estructurados';
  }

  const warnings: string[] = [];
  if (isBoyeros) warnings.push('Boyeros: señal de validación cualitativa — trayecto DICIFO–Boyeros.');

  return {
    id, name, score, label,
    color: PRIORITY_COLORS[label],
    displayLabel: PRIORITY_LABELS[label],
    signals: all, isBoyeros, warnings,
    properties: props,
  };
}

// ─────────────────────────────────────────────────────────
// DATA LOADERS
// ─────────────────────────────────────────────────────────
async function loadGeoJSON(path: string): Promise<GeoJSON.FeatureCollection> {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.type === 'FeatureCollection') return data;
    throw new Error('not a FeatureCollection');
  } catch (e) {
    console.warn(`[MapVivo] No se pudo cargar ${path}:`, e);
    return { type: 'FeatureCollection', features: [] };
  }
}

async function loadJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`[MapVivo] No se pudo cargar ${path}:`, e);
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────
// RAW DERIVED SIGNAL TYPES (as they appear in the JSON)
// ─────────────────────────────────────────────────────────
interface RawQualSignal {
  zoneName: string;
  signalType: string;
  intensity: number;
  confidence: string;
  title?: string;
  summary?: string;
  ethicalNote?: string;
  factors?: string[];
  visibility?: string;
}
interface RawSurveySignal {
  zoneId: string;
  zoneName: string;
  respondents: number;
  score: number;
  confidence: string;
  iluminacionScore?: number;
  acompanamientoScore?: number;
  infraestructuraScore?: number;
  transporteScore?: number;
}

// Convert raw signals to our internal Signal format, grouped by zoneName
function buildSignalsByZone(
  qualRaw: RawQualSignal[],
  surveyRaw: RawSurveySignal[],
): Record<string, Signal[]> {
  const map: Record<string, Signal[]> = {};

  for (const q of qualRaw) {
    const key = q.zoneName;
    if (!map[key]) map[key] = [];
    map[key].push({
      type: (q.signalType === 'qualitative_testimony' ? 'qualitative_testimony' : 'qualitative_testimony') as SignalType,
      score: Math.min(100, Math.max(0, q.intensity)),
      confidence: (q.confidence === 'alta' ? 'alta' : q.confidence === 'media' ? 'media' : 'baja') as Signal['confidence'],
      source: q.title ?? 'Testimonio cualitativo',
    });
  }

  for (const s of surveyRaw) {
    const key = s.zoneName;
    if (!map[key]) map[key] = [];
    // Convert survey score (1-5 scale) to 0-100
    const normalizedScore = Math.round(Math.min(100, Math.max(0, (s.score / 5) * 100)));
    map[key].push({
      type: 'quantitative_survey',
      score: normalizedScore,
      confidence: (s.confidence === 'alta' ? 'alta' : s.confidence === 'media' ? 'media' : 'baja') as Signal['confidence'],
      source: `Encuesta (n=${s.respondents})`,
    });
  }

  return map;
}

// ─────────────────────────────────────────────────────────
// NORMALIZE NODES — handle both nodos_orientacion (tipo_web) and nodos_documentales (categoria)
// ─────────────────────────────────────────────────────────
function normalizeNodes(fc: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  return {
    ...fc,
    features: fc.features.map((f, i) => {
      const p = (f.properties ?? {}) as Record<string, unknown>;
      // ID: prefer nodo_id, node_id, id
      const id = String(p.nodo_id ?? p.node_id ?? p.id ?? `node_${i}`);
      // Category: tipo_web (orientation nodes) or categoria (documentary nodes)
      const rawCat = String(p.tipo_web ?? p.categoria ?? p.category ?? p.tipo ?? 'orientacion')
        .toLowerCase().replace(/\s+/g,'_');
      const category = rawCat in NODE_CATS ? rawCat : 'orientacion';
      // Title: nombre or titulo
      const title = String(p.nombre ?? p.titulo ?? p.title ?? p.name ?? 'Nodo sin nombre');
      // Summary/description
      const summary = String(p.resumen ?? p.descripcion ?? p.summary ?? p.popup ?? '');
      // Urgency → intensity mapping
      const urgencyMap: Record<string,number> = { 'alta':4, 'media':3, 'baja':2 };
      const intensity = urgencyMap[String(p.urgencia ?? '').toLowerCase()]
        ?? Math.min(4, Math.max(1, Number(p.intensidad ?? p.intensity ?? 2)));
      // Zone
      const zoneName = String(p.zona ?? p.zona_base ?? p.zone ?? '');
      // Ethical note
      const ethicalNote = String(p.etica ?? p.nota_etica ?? p.ethicalNote ?? p.nota ?? '');
      // Boyeros check
      const isBoy = zoneName.toLowerCase().includes('boyero');

      return {
        ...f,
        properties: {
          ...p,
          id,
          category: isBoy ? 'cualitativo' : category,
          intensity,
          title,
          summary,
          zoneName,
          ethicalNote: isBoy && !ethicalNote
            ? 'Señal cualitativa agregada. No representa punto exacto ni condición absoluta.'
            : ethicalNote,
        },
      };
    }),
  };
}

function mergeFC(...fcs: GeoJSON.FeatureCollection[]): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: fcs.flatMap(fc => fc.features) };
}

// ─────────────────────────────────────────────────────────
// DATA PATHS
// ─────────────────────────────────────────────────────────
const BASE = import.meta.env.BASE_URL;
const PATHS = {
  zones:          `${BASE}data/sanitized/zonas_prioridad_integrada_o_indicadores.public.geojson`,
  nodesOri:       `${BASE}data/sanitized/nodos_orientacion_base.public.geojson`,
  nodesDoc:       `${BASE}data/sanitized/nodos_documentales_publicos_agregados.public.geojson`,
  routes:         `${BASE}data/sanitized/rutas_campus_y_trayectos.public.geojson`,
  connectors:     `${BASE}data/sanitized/conectores_visualizacion.public.geojson`,
  trayectos:      `${BASE}data/sanitized/trayectos_lectura.public.geojson`,
  evidence:       `${BASE}data/sanitized/evidencia_documental_agregada_por_zona.public.geojson`,
  qualSignals:    `${BASE}data/derived/qualitative_signals_by_zone.json`,
  surveySignals:  `${BASE}data/derived/survey_signals_by_zone.json`,
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function AppFinal() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [zones, setZones] = useState<GeoJSON.FeatureCollection>({ type:'FeatureCollection', features:[] });
  const [nodes, setNodes] = useState<GeoJSON.FeatureCollection>({ type:'FeatureCollection', features:[] });
  const [routes, setRoutes] = useState<GeoJSON.FeatureCollection>({ type:'FeatureCollection', features:[] });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [signalsByZone, setSignalsByZone] = useState<Record<string, Signal[]>>({});

  const [panelsHidden, setPanelsHidden] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneResult|null>(null);
  const [selectedNode, setSelectedNode] = useState<Record<string,unknown>|null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'resumen'|'señales'|'mapa'|'aportar'>('resumen');
  const [toast, setToast] = useState<string|null>(null);
  const [contributions, setContributions] = useState<Record<string,Signal[]>>({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showContribForm, setShowContribForm] = useState(false);
  const [contribMode, setContribMode] = useState<'punto'|'tramo'|'zona'|null>(null);
  const [callout, setCallout] = useState<{x:number;y:number;props:Record<string,unknown>}|null>(null);

  // PRIORITY CALCULATION
  const zoneResults = useMemo<ZoneResult[]>(() => {
    const feats = zones.features;
    if (!feats.length) return [];
    return feats.map((f, i) => {
      const p = (f.properties ?? {}) as Record<string,unknown>;
      // Zone name is in "zona" field (e.g. "UNIVERSIDAD AUTONOMA CHAPINGO")
      const name = String(p.zona ?? p.nombre ?? p.name ?? `Zona ${i+1}`);
      const id = String(p.zona_join ?? name).replace(/\s+/g,'_').toLowerCase();
      const prioridad = String(p.prioridad_v05 ?? '').toLowerCase();
      const scoreIntegrado = Number(p.score_integrado ?? 0);

      // Build signals from:
      // 1. Real derived data (qualitative + survey signals keyed by zoneName)
      const realSignals: Signal[] = [...(signalsByZone[name] ?? [])];

      // 2. Documentary evidence from zone properties
      const urg = String(p.urg_doc_txt ?? '').toLowerCase();
      if (urg) {
        const urgScores: Record<string,number> = { alta: 80, media: 55, baja: 30 };
        realSignals.push({
          type: 'documentary_evidence',
          score: urgScores[urg] ?? 50,
          confidence: (urg === 'alta' ? 'alta' : urg === 'media' ? 'media' : 'baja') as Signal['confidence'],
          source: `Documentación (urg: ${urg})`,
        });
      }

      // 3. Protected/sensitive signals
      const sensible = Number(p.sensible_n ?? 0);
      if (sensible > 0) {
        realSignals.push({
          type: 'protected_signal',
          score: Math.min(100, sensible * 25),
          confidence: 'media',
          source: `${sensible} dato(s) sensible(s)`,
        });
      }

      // 4. If score_integrado is available, add as mobility signal
      if (scoreIntegrado > 0) {
        realSignals.push({
          type: 'mobility_connectivity',
          score: Math.round(scoreIntegrado * 100),
          confidence: 'alta',
          source: 'Score integrado v05',
        });
      }

      // 5. Fallback: if STILL no signals, use prioridad_v05
      if (realSignals.length === 0) {
        if (prioridad === 'alta') {
          realSignals.push({ type: 'quantitative_survey', score: 72, confidence: 'alta' });
        } else if (prioridad === 'media') {
          realSignals.push({ type: 'quantitative_survey', score: 48, confidence: 'media' });
        } else if (prioridad === 'baja') {
          realSignals.push({ type: 'quantitative_survey', score: 25, confidence: 'baja' });
        }
      }

      return calcPriority(id, name, realSignals, contributions[id] ?? [], p);
    });
  }, [zones, contributions, signalsByZone]);

  // INJECT CSS/FONTS
  useEffect(() => { injectFonts(); injectGlobalCSS(); }, []);

  // LOAD DATA
  useEffect(() => {
    (async () => {
      const [z, nOri, nDoc, r, conn, tray, qualRaw, surveyRaw] = await Promise.all([
        loadGeoJSON(PATHS.zones),
        loadGeoJSON(PATHS.nodesOri),
        loadGeoJSON(PATHS.nodesDoc),
        loadGeoJSON(PATHS.routes),
        loadGeoJSON(PATHS.connectors),
        loadGeoJSON(PATHS.trayectos),
        loadJSON<RawQualSignal[]>(PATHS.qualSignals, []),
        loadJSON<RawSurveySignal[]>(PATHS.surveySignals, []),
      ]);

      setZones(z);
      setNodes(normalizeNodes(mergeFC(nOri, nDoc)));
      setRoutes(mergeFC(r, conn, tray));
      setSignalsByZone(buildSignalsByZone(qualRaw, surveyRaw));
      setDataLoaded(true);

      console.log(`[MapVivo] Loaded: ${z.features.length} zones, ${nOri.features.length + nDoc.features.length} nodes, ${r.features.length + conn.features.length + tray.features.length} routes, ${qualRaw.length} qual signals, ${surveyRaw.length} survey signals`);
    })();
  }, []);

  // INIT MAPLIBRE
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: SATELLITE_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');
    map.on('load', () => setMapReady(true));
    const fallback = setTimeout(() => setMapReady(true), 3000);
    return () => {
      clearTimeout(fallback);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // MAP LAYERS
  useEffect(() => {
    if (!mapReady || !dataLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const addOrUpdate = (sourceId: string, data: GeoJSON.FeatureCollection) => {
      const src = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
      if (src) { src.setData(data); return; }
      map.addSource(sourceId, { type: 'geojson', data });
    };

    // ENRICH ZONES
    const enrichedZones: GeoJSON.FeatureCollection = {
      ...zones,
      features: zones.features.map((f, i) => {
        const result = zoneResults[i];
        return {
          ...f,
          properties: {
            ...f.properties,
            _priorityColor: result?.color ?? C.gray,
            _score: result?.score ?? 0,
            _zoneId: result?.id ?? '',
          },
        };
      }),
    };

    addOrUpdate('mv-zones', enrichedZones);
    addOrUpdate('mv-routes', routes);
    addOrUpdate('mv-nodes', nodes);

    const safeAdd = (id: string, def: maplibregl.LayerSpecification) => {
      if (!map.getLayer(id)) map.addLayer(def);
    };

    // ── ZONES: translucent fill (0.12-0.15, NOT 0.40-0.50) ──
    safeAdd('zones-fill', {
      id: 'zones-fill', type: 'fill', source: 'mv-zones',
      paint: {
        'fill-color': ['coalesce', ['get', '_priorityColor'], C.gray],
        'fill-opacity': 0.13,
      },
    });
    safeAdd('zones-outline', {
      id: 'zones-outline', type: 'line', source: 'mv-zones',
      paint: {
        'line-color': ['coalesce', ['get', '_priorityColor'], C.gray],
        'line-width': 1.8,
        'line-opacity': 0.60,
      },
    });

    // ── ROUTES: ribbon with glow ──
    safeAdd('routes-halo', {
      id: 'routes-halo', type: 'line', source: 'mv-routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-width': 14, 'line-color': C.orange, 'line-opacity': 0.09, 'line-blur': 6 },
    });
    safeAdd('routes-body', {
      id: 'routes-body', type: 'line', source: 'mv-routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-width': 4.5, 'line-color': C.orange, 'line-opacity': 0.78 },
    });
    safeAdd('routes-shine', {
      id: 'routes-shine', type: 'line', source: 'mv-routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-width': 1.5, 'line-color': 'rgba(244,247,251,0.28)' },
    });

    // ── NODES: halo + ring + core ──
    const catColor: maplibregl.ExpressionSpecification = [
      'match', ['get','category'],
      'referencia_campus', C.gold,
      'acceso_movilidad', C.amber,
      'edificio_academico', C.greenSoft,
      'percepcion_espacio', C.magenta,
      'infraestructura_vial', C.orange,
      'movilidad_peatonal', C.amber,
      'recurso_comunitario', C.green,
      'participacion_social', C.violet,
      'memoria_territorial', C.maize,
      'protegido_agregado', C.gray,
      'documental', C.greenSoft,
      'cualitativo', C.magenta,
      'orientacion', C.gold,
      C.gold
    ];

    safeAdd('nodes-halo', {
      id: 'nodes-halo', type: 'circle', source: 'mv-nodes',
      paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'], 11,16, 15,26],
        'circle-color': catColor,
        'circle-opacity': 0.08,
        'circle-pitch-alignment': 'map',
      },
    });
    safeAdd('nodes-ring', {
      id: 'nodes-ring', type: 'circle', source: 'mv-nodes',
      paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'], 11,9, 15,14],
        'circle-color': 'rgba(0,0,0,0)',
        'circle-stroke-width': 1.5,
        'circle-stroke-color': catColor,
        'circle-stroke-opacity': ['match',['get','intensity'], 1,0.40, 2,0.55, 3,0.70, 4,0.90, 0.55],
        'circle-pitch-alignment': 'map',
      },
    });
    safeAdd('nodes-core', {
      id: 'nodes-core', type: 'circle', source: 'mv-nodes',
      paint: {
        'circle-radius': ['match',['get','intensity'], 1,4, 2,6, 3,8, 4,11, 6],
        'circle-color': catColor,
        'circle-opacity': ['match',['get','intensity'], 1,0.55, 2,0.72, 3,0.88, 4,1.0, 0.72],
        'circle-pitch-alignment': 'map',
      },
    });

    // ── NODE LABELS ──
    safeAdd('nodes-label', {
      id: 'nodes-label', type: 'symbol', source: 'mv-nodes',
      minzoom: 14.5,
      layout: {
        'text-field': ['get', 'title'],
        'text-font': ['Open Sans Regular'],
        'text-size': 10,
        'text-offset': [0, 1.8],
        'text-anchor': 'top',
        'text-max-width': 12,
      },
      paint: {
        'text-color': C.white,
        'text-halo-color': 'rgba(3,7,18,0.85)',
        'text-halo-width': 1.5,
        'text-opacity': 0.80,
      },
    });

    // ── MAP EVENTS ──
    map.on('mouseenter','nodes-core', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave','nodes-core', () => { map.getCanvas().style.cursor = ''; setCallout(null); });

    map.on('click','nodes-core', (e) => {
      if (!e.features?.[0]) return;
      const props = e.features[0].properties as Record<string,unknown>;
      const pt = map.project((e.features[0].geometry as GeoJSON.Point).coordinates as [number,number]);
      setCallout({ x: pt.x, y: pt.y, props });
      setSelectedNode(props);
      setSelectedZone(null);
      setRightPanelTab('resumen');
      if (isMobile) setPanelsHidden(false);
    });

    map.on('mouseenter','zones-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave','zones-fill', () => { map.getCanvas().style.cursor = ''; });

    map.on('click','zones-fill', (e) => {
      if (!e.features?.[0]) return;
      const p = e.features[0].properties as Record<string,unknown>;
      const zoneId = String(p._zoneId ?? '');
      const found = zoneResults.find(z => z.id === zoneId);
      if (found) {
        setSelectedZone(found);
        setSelectedNode(null);
        setCallout(null);
        setRightPanelTab('resumen');
        if (isMobile) setPanelsHidden(false);
      }
    });

    map.on('click', (e) => {
      const nodeFeat = map.queryRenderedFeatures(e.point, { layers: ['nodes-core'] });
      const zoneFeat = map.queryRenderedFeatures(e.point, { layers: ['zones-fill'] });
      if (!nodeFeat.length && !zoneFeat.length) {
        setCallout(null); setSelectedNode(null); setSelectedZone(null);
      }
    });

  }, [mapReady, dataLoaded, zones, routes, nodes, zoneResults]);

  // KEYBOARD
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'h' || e.key === 'H') setPanelsHidden(v => !v);
      if (e.key === 'f' || e.key === 'F') setFocusMode(v => !v);
      if (e.key === 'a' || e.key === 'A') setShowAnalytics(v => !v);
      if (e.key === 'Escape') {
        setCallout(null); setSelectedNode(null); setSelectedZone(null);
        setShowContribForm(false); setContribMode(null); setShowAnalytics(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // TOAST
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // CONTRIBUTION
  const handleContribute = useCallback((zoneId: string, scoreEstimate: number) => {
    const newSignal: Signal = { type: 'participatory_feedback', score: scoreEstimate, confidence: 'baja' };
    setContributions(prev => ({ ...prev, [zoneId]: [...(prev[zoneId] ?? []), newSignal] }));
    showToast('Aportación registrada. Métricas actualizadas.');
    setShowContribForm(false);
  }, [showToast]);

  // FLY TO ZONE
  const flyToZone = useCallback((zone: ZoneResult) => {
    if (!mapRef.current) return;
    const feat = zones.features.find(f => {
      const p = (f.properties ?? {}) as Record<string,unknown>;
      const n = String(p.zona ?? p.nombre ?? '');
      return n === zone.name;
    });
    if (!feat) return;
    const coords: number[][] = [];
    const extract = (geom: unknown) => {
      if (!geom || typeof geom !== 'object') return;
      const g = geom as { type: string; coordinates: unknown };
      if (g.type === 'Polygon') (g.coordinates as number[][][]).forEach(r => r.forEach(c => coords.push(c)));
      else if (g.type === 'MultiPolygon') (g.coordinates as number[][][][]).forEach(p => p.forEach(r => r.forEach(c => coords.push(c))));
    };
    extract(feat.geometry);
    if (coords.length > 0) {
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
      coords.forEach(([lng, lat]) => {
        if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
      });
      mapRef.current.fitBounds([[minLng, minLat],[maxLng, maxLat]], { padding: 80, duration: 1200 });
    }
  }, [zones]);

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  const panels = !panelsHidden && !focusMode;
  const hasRight = !!(selectedZone || selectedNode);

  return (
    <div style={{ position:'relative', width:'100vw', height:'100vh', overflow:'hidden', background:C.obsidian }}>

      {/* MAP */}
      <div ref={mapContainer} style={{ position:'absolute', inset:0 }} data-testid="stable-map-root" />

      {/* NODE CALLOUT */}
      {callout && (
        <div style={{ position:'absolute', left:callout.x, top:callout.y, transform:'translate(-50%,-100%)', marginTop:-16, zIndex:30, animation:'mv-callout-in 200ms cubic-bezier(0.4,0,0.2,1) forwards', pointerEvents:'none' }} data-testid="node-callout">
          <div style={{ background:'rgba(3,7,18,0.97)', border:`1px solid ${C.borderHov}`, borderRadius:10, padding:'10px 13px', minWidth:180, maxWidth:240, boxShadow:`0 8px 32px rgba(0,0,0,.65), 0 0 0 1px rgba(214,168,58,.07)`, marginBottom:14 }}>
            <div style={{ fontSize:9, fontFamily:'Inter,system-ui,sans-serif', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:getCatInfo(String(callout.props.category)).color, marginBottom:4 }}>
              {getCatInfo(String(callout.props.category)).icon} {getCatInfo(String(callout.props.category)).label}
            </div>
            <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:13, fontWeight:600, color:C.white, marginBottom:4, lineHeight:1.3 }}>
              {String(callout.props.title ?? 'Sin título')}
            </div>
            {Boolean(callout.props.summary) && String(callout.props.summary).length > 0 && (
              <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, lineHeight:1.5 }}>
                {String(callout.props.summary).slice(0,120)}{String(callout.props.summary).length>120?'…':''}
              </div>
            )}
            {Boolean(callout.props.ethicalNote) && String(callout.props.ethicalNote).length > 0 && (
              <div style={{ marginTop:8, padding:'6px 8px', background:'rgba(251,191,36,.07)', border:'1px solid rgba(251,191,36,.22)', borderRadius:6, fontSize:9.5, color:'rgba(251,191,36,.85)', lineHeight:1.5, fontFamily:'Inter,system-ui,sans-serif' }}>
                {String(callout.props.ethicalNote)}
              </div>
            )}
          </div>
          <div style={{ width:1, height:14, background:`linear-gradient(${C.gold}80,transparent)`, margin:'0 auto' }} />
        </div>
      )}

      {/* HEADER */}
      {!focusMode && (
        <div style={{ position:'fixed', top:12, left: panels && !isMobile ? 284 : 12, right: panels && hasRight && !isMobile ? 324 : 12, height:44, background:'rgba(3,7,18,0.88)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:`1px solid ${C.border}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', zIndex:20, transition:'left 250ms cubic-bezier(0.4,0,0.2,1), right 250ms cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:13, fontWeight:600, color:C.gold }}>Mapa Vivo</span>
            {!isMobile && (
              <>
                <span style={{ color:'rgba(214,168,58,.3)', fontSize:12 }}>/</span>
                <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted }}>UACh–Texcoco · Observatorio de Movilidad Vivida</span>
              </>
            )}
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <HeaderBtn icon="📊" tip="Analítica (A)" onClick={() => setShowAnalytics(v=>!v)} active={showAnalytics} />
            <HeaderBtn icon="▣" tip="Paneles (H)" onClick={() => setPanelsHidden(v=>!v)} active={panelsHidden} />
            <HeaderBtn icon="⛶" tip="Enfoque (F)" onClick={() => setFocusMode(v=>!v)} active={focusMode} />
          </div>
        </div>
      )}

      {/* LEFT PANEL */}
      {panels && (
        <div data-testid="left-control-panel" style={{ position:'fixed', left:12, top: isMobile ? 'auto' : 12, bottom: isMobile ? 80 : 12, right: isMobile ? 12 : 'auto', width: isMobile ? 'auto' : 260, height: isMobile ? '45vh' : 'auto', background:C.panel, backdropFilter:'blur(20px) saturate(1.4)', WebkitBackdropFilter:'blur(20px) saturate(1.4)', border:`1px solid ${C.border}`, borderRadius: isMobile ? '24px 24px 14px 14px' : 14, boxShadow:`0 0 0 1px rgba(214,168,58,.05), 0 24px 48px rgba(0,0,0,.65), inset 0 1px 0 rgba(244,247,251,.04)`, display: (isMobile && hasRight) ? 'none' : 'flex', flexDirection:'column', overflow:'hidden', zIndex:20, animation:'mv-slide-up 250ms cubic-bezier(0.4,0,0.2,1) forwards' }}>
          {/* Header */}
          <div style={{ padding:'18px 18px 14px', borderBottom:`1px solid rgba(214,168,58,.10)`, flexShrink:0 }}>
            <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:13, fontWeight:600, color:C.gold, textTransform:'uppercase', letterSpacing:'0.02em' }}>Mapa Vivo</div>
            <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, marginTop:2 }}>Cartografía Participativa Ecofeminista</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:10, padding:'3px 9px', background:'rgba(53,208,127,.09)', border:'1px solid rgba(53,208,127,.20)', borderRadius:20 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:C.green, animation:'mv-pulse 2s infinite' }} />
              <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, fontWeight:600, color:C.greenSoft, textTransform:'uppercase', letterSpacing:'0.05em' }}>Modo Académico</span>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="mv-scroll" style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'14px 14px 10px' }}>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:16 }}>
              {[
                { val:zones.features.length, label:'Zonas', color:C.gold },
                { val:nodes.features.length, label:'Nodos', color:C.green },
                { val:routes.features.length, label:'Rutas', color:C.orange },
              ].map(({val,label,color}) => (
                <div key={label} style={{ background:'rgba(244,247,251,.04)', border:`1px solid rgba(244,247,251,.08)`, borderRadius:8, padding:'8px 6px', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:18, fontWeight:700, color, lineHeight:1 }}>{val}</div>
                  <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, color:C.muted, marginTop:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <SectionLabel>Leyenda</SectionLabel>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
              {(Object.keys(PRIORITY_COLORS) as PriorityLabel[]).map(key => (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:4, padding:'2px 7px', borderRadius:4, background:'rgba(244,247,251,.03)', border:'1px solid rgba(244,247,251,.06)' }}>
                  <div style={{ width:7, height:7, borderRadius:2, background:PRIORITY_COLORS[key] }} />
                  <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:8.5, color:C.muted }}>{PRIORITY_LABELS[key]}</span>
                </div>
              ))}
            </div>

            {/* Zone list */}
            <SectionLabel>Zonas de prioridad</SectionLabel>
            {zoneResults.length === 0 && <EmptyState icon="🗺" text="Cargando zonas…" />}
            {[...zoneResults].sort((a,b) => b.score - a.score).map(z => (
              <ZoneRow key={z.id} zone={z} selected={selectedZone?.id === z.id}
                onClick={() => { setSelectedZone(z); setSelectedNode(null); setCallout(null); flyToZone(z); }}
              />
            ))}

            {/* Global signals */}
            <SectionLabel style={{ marginTop:16 }}>Señales globales</SectionLabel>
            {[
              { dot:C.coral,  name:'Prioridad alta', val:zoneResults.filter(z=>z.label==='prioridad_alta').length },
              { dot:C.amber,  name:'Prioridad media', val:zoneResults.filter(z=>z.label==='prioridad_media').length },
              { dot:C.violet, name:'Validación cual.', val:zoneResults.filter(z=>z.label==='validacion_cualitativa').length },
              { dot:C.gray,   name:'Sin datos', val:zoneResults.filter(z=>z.label==='sin_datos_estructurados').length },
              { dot:C.green,  name:'Nodos totales', val:nodes.features.length },
              { dot:C.orange, name:'Aportaciones', val:Object.values(contributions).flat().length },
            ].map(({dot,name,val}) => (
              <div key={name} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(244,247,251,.04)' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:dot, flexShrink:0 }} />
                <span style={{ flex:1, fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.white, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</span>
                <span style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:12, fontWeight:600, color:dot }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ flexShrink:0, padding:'10px 14px', borderTop:`1px solid rgba(214,168,58,.08)`, display:'flex', gap:6 }}>
            {[
              { icon:'✦', label:'Aportar', action: () => setShowContribForm(true) },
              { icon:'📊', label:'Analítica', action: () => setShowAnalytics(v=>!v) },
              { icon:'↗', label:'Exportar', action: () => {
                const d = JSON.stringify({ zones:zoneResults, contributions }, null, 2);
                const b = new Blob([d], { type:'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(b); a.download = 'mapvivo_export.json'; a.click();
                showToast('Datos exportados.');
              }},
            ].map(({icon,label,action}) => (
              <button key={label} onClick={action} style={{ flex:1, padding:'8px 4px', background:'rgba(244,247,251,.04)', border:`1px solid rgba(244,247,251,.09)`, borderRadius:9, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all 140ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(214,168,58,.10)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(214,168,58,.22)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,247,251,.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(244,247,251,.09)'; }}
              >
                <span style={{ fontSize:14 }}>{icon}</span>
                <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:8, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RIGHT PANEL */}
      {(!focusMode && hasRight) && (
        <div data-testid="right-detail-panel" style={{ position:'fixed', right:12, top: isMobile ? 'auto' : 12, bottom: isMobile ? 80 : 12, left: isMobile ? 12 : 'auto', width: isMobile ? 'auto' : 300, height: isMobile ? '55vh' : 'auto', background:C.panel, backdropFilter:'blur(20px) saturate(1.4)', WebkitBackdropFilter:'blur(20px) saturate(1.4)', border:`1px solid ${C.border}`, borderRadius: isMobile ? '24px 24px 14px 14px' : 14, boxShadow:`0 0 0 1px rgba(214,168,58,.05), 0 24px 48px rgba(0,0,0,.65)`, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:20, animation:'mv-slide-up 250ms cubic-bezier(0.4,0,0.2,1) forwards' }}>
          <div style={{ padding:'16px 18px 14px', borderBottom:`1px solid rgba(214,168,58,.10)`, flexShrink:0, position:'relative' }}>
            <button onClick={() => { setSelectedZone(null); setSelectedNode(null); setCallout(null); }} style={{ position:'absolute', top:14, right:14, background:'rgba(244,247,251,.06)', border:'none', borderRadius:6, width:24, height:24, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:12 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,77,94,.15)'; (e.currentTarget as HTMLButtonElement).style.color = C.coral; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,247,251,.06)'; (e.currentTarget as HTMLButtonElement).style.color = C.muted; }}
            >✕</button>
            {selectedZone && <ZoneDetailHeader zone={selectedZone} />}
            {selectedNode && !selectedZone && <NodeDetailHeader node={selectedNode} />}
            <div style={{ display:'flex', gap:4, marginTop:14 }}>
              {(['resumen','señales','mapa','aportar'] as const).map(tab => (
                <TabBtn key={tab} active={rightPanelTab===tab} onClick={() => setRightPanelTab(tab)}>
                  {tab.charAt(0).toUpperCase()+tab.slice(1)}
                </TabBtn>
              ))}
            </div>
          </div>
          <div className="mv-scroll" style={{ flex:1, overflowY:'auto', padding:'14px 16px' }}>
            {rightPanelTab === 'resumen' && selectedZone && <ZoneResumenTab zone={selectedZone} />}
            {rightPanelTab === 'resumen' && selectedNode && !selectedZone && <NodeResumenTab node={selectedNode} />}
            {rightPanelTab === 'señales' && selectedZone && <SeñalesTab zone={selectedZone} />}
            {rightPanelTab === 'señales' && !selectedZone && <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.muted, padding:12, textAlign:'center' }}>Selecciona una zona.</div>}
            {rightPanelTab === 'mapa' && <MapaTab zone={selectedZone} node={selectedNode} map={mapRef.current} />}
            {rightPanelTab === 'aportar' && selectedZone && <AportarTab zone={selectedZone} onContribute={handleContribute} />}
            {rightPanelTab === 'aportar' && !selectedZone && <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.muted, padding:12, textAlign:'center' }}>Selecciona una zona.</div>}
          </div>
        </div>
      )}

      {/* CONTRIBUTION TOOLBAR */}
      {!focusMode && (
        <div style={{ position:'fixed', bottom: isMobile ? 12 : 20, left:'50%', transform:'translateX(-50%)', display:'flex', gap: isMobile ? 2 : 6, zIndex:25, background:C.panel, backdropFilter:'blur(16px) saturate(1.4)', WebkitBackdropFilter:'blur(16px) saturate(1.4)', border:`1px solid ${C.border}`, borderRadius:40, padding: isMobile ? '4px 6px' : '6px 10px', boxShadow:'0 8px 24px rgba(0,0,0,.5)', animation:'mv-slide-up 300ms cubic-bezier(0.4,0,0.2,1) forwards', maxWidth: isMobile ? 'calc(100vw - 24px)' : 'auto', overflowX: isMobile ? 'auto' : 'visible' }} data-testid="contribution-toolbar">
          {[
            { icon:'📍', label:'Punto', color:C.green, action: () => { setContribMode('punto'); showToast('Click en el mapa para marcar'); }},
            { icon:'〰️', label:'Tramo', color:C.orange, action: () => { setContribMode('tramo'); showToast('Click en el mapa para trazar'); }},
            { icon:'◎', label:'Zona', color:C.violet, action: () => { setContribMode('zona'); setShowContribForm(true); }},
            { icon:'🔔', label:'Alerta', color:C.coral, action: () => { setContribMode('zona'); setShowContribForm(true); }},
            { icon:'↓', label:'Exportar', color:C.gold, action: () => {
              const d = JSON.stringify({ zones:zoneResults, contributions }, null, 2);
              const b = new Blob([d], { type:'application/json' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'mapvivo_export.json'; a.click();
              showToast('Exportado.');
            }},
          ].map(({icon,label,color,action}) => (
            <ContribBtn key={label} icon={icon} label={label} color={color} onClick={action} active={contribMode===label.toLowerCase()} />
          ))}
        </div>
      )}

      {/* ANALYTICS */}
      {showAnalytics && <AnalyticsPanel zones={zoneResults} nodes={nodes} routes={routes} onClose={() => setShowAnalytics(false)} />}

      {/* CONTRIBUTION FORM */}
      {showContribForm && <ContribForm zones={zoneResults} onSubmit={(id, sc) => handleContribute(id, sc)} onClose={() => { setShowContribForm(false); setContribMode(null); }} />}

      {/* TOAST */}
      {toast && (
        <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', background:C.panel, border:`1px solid rgba(214,168,58,.20)`, borderRadius:10, padding:'10px 16px', display:'flex', alignItems:'center', gap:8, fontFamily:'Inter,system-ui,sans-serif', fontSize:11.5, fontWeight:500, color:C.white, zIndex:50, boxShadow:'0 8px 24px rgba(0,0,0,.5)', animation:'mv-toast-in 250ms cubic-bezier(0.4,0,0.2,1) forwards' }}>
          <span style={{ color:C.green, fontSize:14 }}>✓</span>{toast}
        </div>
      )}

      {/* CONTRIB MODE INDICATOR */}
      {contribMode && (
        <div style={{ position:'fixed', top:70, left:'50%', transform:'translateX(-50%)', background:'rgba(53,208,127,.15)', border:'1px solid rgba(53,208,127,.35)', borderRadius:8, padding:'8px 16px', zIndex:40, fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.greenSoft, display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ animation:'mv-spin 1s linear infinite', display:'inline-block' }}>⟳</span>
          Modo {contribMode}: haz click en el mapa
          <button onClick={() => setContribMode(null)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:11, textDecoration:'underline' }}>Cancelar</button>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS */}
      {!focusMode && !panelsHidden && (
        <div style={{ position:'fixed', bottom:20, right:12, fontFamily:'Inter,system-ui,sans-serif', fontSize:9, color:'rgba(154,169,186,.30)', lineHeight:1.8, textAlign:'right', zIndex:10 }}>
          <div>H — Ocultar paneles</div>
          <div>F — Modo enfoque</div>
          <div>A — Analítica</div>
          <div>Esc — Deseleccionar</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, fontWeight:700, color:C.muted, letterSpacing:'0.10em', textTransform:'uppercase', marginBottom:10, ...style }}>{children}</div>;
}

function EmptyState({ icon, text }: { icon:string; text:string }) {
  return (
    <div style={{ padding:'20px 0', textAlign:'center' }}>
      <div style={{ fontSize:24, marginBottom:8, opacity:0.35 }}>{icon}</div>
      <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.muted }}>{text}</div>
    </div>
  );
}

function HeaderBtn({ icon, tip, onClick, active }: { icon:string; tip:string; onClick:()=>void; active:boolean }) {
  return (
    <button onClick={onClick} title={tip} style={{ width:32, height:32, borderRadius:8, background: active ? 'rgba(214,168,58,.15)' : 'rgba(244,247,251,.05)', border: active ? '1px solid rgba(214,168,58,.30)' : '1px solid rgba(244,247,251,.08)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color: active ? C.gold : C.muted, transition:'all 150ms' }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(214,168,58,.10)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,247,251,.05)'; }}
    >{icon}</button>
  );
}

function ZoneRow({ zone, selected, onClick }: { zone:ZoneResult; selected:boolean; onClick:()=>void }) {
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:9, cursor:'pointer', marginBottom:4, background: selected ? 'rgba(214,168,58,.10)' : 'transparent', border: selected ? '1px solid rgba(214,168,58,.18)' : '1px solid transparent', transition:'all 180ms' }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(214,168,58,.06)'; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <div style={{ width:10, height:10, borderRadius:3, background:zone.color, flexShrink:0, boxShadow:`0 0 6px ${zone.color}40` }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, fontWeight:500, color:C.white, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{zone.name}</div>
        <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, color:C.muted, marginTop:1 }}>{zone.displayLabel}</div>
      </div>
      <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:12, fontWeight:700, color:zone.color, flexShrink:0 }}>
        {zone.label === 'sin_datos_estructurados' ? '—' : zone.label === 'validacion_cualitativa' ? `~${zone.score}` : zone.score}
      </div>
    </div>
  );
}

function TabBtn({ children, active, onClick }: { children:React.ReactNode; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{ padding:'5px 10px', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'Inter,system-ui,sans-serif', fontSize:10, fontWeight:600, background: active ? 'rgba(214,168,58,.14)' : 'transparent', color: active ? C.gold : C.muted, transition:'all 150ms' }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,247,251,.05)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >{children}</button>
  );
}

function ContribBtn({ icon, label, color, onClick, active }: { icon:string; label:string; color:string; onClick:()=>void; active:boolean }) {
  return (
    <button className="mv-contrib-btn" onClick={onClick} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'8px 12px', borderRadius:28, border:'none', cursor:'pointer', background: active ? `${color}20` : 'transparent', transition:'all 150ms' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}15`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = active ? `${color}20` : 'transparent'; }}
    >
      <span style={{ fontSize:16 }}>{icon}</span>
      <span className="mv-mobile-btn-label" style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:8, fontWeight:600, color, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
    </button>
  );
}

function ZoneDetailHeader({ zone }: { zone:ZoneResult }) {
  return (
    <>
      <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:20, fontFamily:'Inter,system-ui,sans-serif', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, background:`${zone.color}20`, border:`1px solid ${zone.color}45`, color:zone.color }}>
        ◆ {zone.displayLabel}{zone.isBoyeros && ' — Boyeros'}
      </div>
      <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:16, fontWeight:600, color:C.white, lineHeight:1.25, marginBottom:3 }}>{zone.name}</div>
      <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.muted }}>{zone.signals.length} señal{zone.signals.length !== 1 ? 'es' : ''}</div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:2, marginTop:12 }}>
        <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginRight:6, lineHeight:'14px' }}>Score</span>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ width:6, height:4+i*2.5, borderRadius:2, background: i < Math.round(zone.score/10) ? zone.color : 'rgba(244,247,251,.08)', transition:'background 200ms' }} />
        ))}
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:500, color:zone.color, marginLeft:6 }}>{zone.score}</span>
      </div>
    </>
  );
}

function NodeDetailHeader({ node }: { node:Record<string,unknown> }) {
  const info = getCatInfo(String(node.category ?? ''));
  return (
    <>
      <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:20, fontFamily:'Inter,system-ui,sans-serif', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, background:`${info.color}20`, border:`1px solid ${info.color}45`, color:info.color }}>
        {info.icon} {info.label}
      </div>
      <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:16, fontWeight:600, color:C.white, lineHeight:1.25, marginBottom:3 }}>{String(node.title ?? 'Nodo')}</div>
      <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.muted }}>{node.zoneName ? `Zona: ${String(node.zoneName)}` : 'Sin zona'}</div>
    </>
  );
}

function ZoneResumenTab({ zone }: { zone:ZoneResult }) {
  const signalTypes = new Set(zone.signals.map(s => s.type));
  return (
    <div style={{ animation:'mv-fade-in 200ms ease' }}>
      <div style={{ background:'rgba(244,247,251,.03)', border:'1px solid rgba(244,247,251,.07)', borderRadius:10, padding:14, marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em' }}>Score territorial</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:20, fontWeight:700, color:zone.color }}>{zone.score}</span>
        </div>
        <div style={{ height:4, borderRadius:2, background:'rgba(244,247,251,.06)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${zone.score}%`, borderRadius:2, background:`linear-gradient(90deg,${zone.color}80,${zone.color})`, transition:'width 600ms cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
      </div>
      <SectionLabel>Tipos de señal</SectionLabel>
      {Array.from(signalTypes).map(type => {
        const L: Record<string,string> = { quantitative_survey:'Encuesta cuantitativa', qualitative_testimony:'Testimonio cualitativo', documentary_evidence:'Evidencia documental', protected_signal:'Señal protegida', participatory_feedback:'Aportación participativa', mobility_connectivity:'Movilidad/conectividad' };
        const Cl: Record<string,string> = { quantitative_survey:C.green, qualitative_testimony:C.magenta, documentary_evidence:C.greenSoft, protected_signal:C.gray, participatory_feedback:C.violet, mobility_connectivity:C.amber };
        return (
          <div key={type} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(244,247,251,.04)' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:Cl[type] ?? C.muted }} />
            <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.white }}>{L[type]??type}</span>
          </div>
        );
      })}
      {zone.warnings.length > 0 && (
        <div style={{ marginTop:14 }}>
          <SectionLabel>Advertencias</SectionLabel>
          {zone.warnings.map((w,i) => (
            <div key={i} style={{ padding:'8px 10px', background:'rgba(251,191,36,.06)', border:'1px solid rgba(251,191,36,.18)', borderRadius:7, fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:'rgba(251,191,36,.85)', lineHeight:1.5, marginBottom:6 }}>{w}</div>
          ))}
        </div>
      )}
      {Boolean(zone.properties.nota_web) && (
        <div style={{ marginTop:10, padding:'8px 10px', background:'rgba(214,168,58,.05)', border:'1px solid rgba(214,168,58,.12)', borderRadius:7, fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:'rgba(214,168,58,.80)', lineHeight:1.5 }}>
          {String(zone.properties.nota_web)}
        </div>
      )}
    </div>
  );
}

function NodeResumenTab({ node }: { node:Record<string,unknown> }) {
  const info = getCatInfo(String(node.category ?? ''));
  return (
    <div style={{ animation:'mv-fade-in 200ms ease' }}>
      <div style={{ background:'rgba(244,247,251,.03)', border:'1px solid rgba(244,247,251,.07)', borderRadius:10, padding:14, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:`${info.color}18`, border:`1px solid ${info.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:info.color }}>{info.icon}</div>
          <div>
            <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, fontWeight:600, color:C.white }}>{info.label}</div>
            <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, color:C.muted }}>Intensidad: {String(node.intensity ?? '?')}/4</div>
          </div>
        </div>
      </div>
      {Boolean(node.summary) && String(node.summary).length > 0 && (
        <div style={{ marginBottom:14 }}>
          <SectionLabel>Descripción</SectionLabel>
          <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:'rgba(244,247,251,.80)', lineHeight:1.6 }}>{String(node.summary)}</div>
        </div>
      )}
      {Boolean(node.ethicalNote) && String(node.ethicalNote).length > 0 && (
        <div style={{ padding:'8px 10px', background:'rgba(251,191,36,.06)', border:'1px solid rgba(251,191,36,.18)', borderRadius:7, fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:'rgba(251,191,36,.85)', lineHeight:1.5, marginBottom:14 }}>
          ⚠ {String(node.ethicalNote)}
        </div>
      )}
    </div>
  );
}

function SeñalesTab({ zone }: { zone:ZoneResult }) {
  const L: Record<string,string> = { quantitative_survey:'Encuesta cuantitativa', qualitative_testimony:'Testimonio cualitativo', documentary_evidence:'Evidencia documental', protected_signal:'Señal protegida', participatory_feedback:'Aportación participativa', mobility_connectivity:'Movilidad/conectividad' };
  const Cl: Record<string,string> = { quantitative_survey:C.green, qualitative_testimony:C.magenta, documentary_evidence:C.greenSoft, protected_signal:C.gray, participatory_feedback:C.violet, mobility_connectivity:C.amber };
  const CC: Record<string,string> = { alta:C.green, media:C.amber, baja:C.coral };

  return (
    <div style={{ animation:'mv-fade-in 200ms ease' }}>
      {zone.signals.length === 0 ? <EmptyState icon="📡" text="Sin señales" /> : zone.signals.map((s,i) => (
        <div key={i} style={{ background:'rgba(244,247,251,.03)', border:'1px solid rgba(244,247,251,.07)', borderRadius:9, padding:12, marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, fontWeight:600, color:Cl[s.type]??C.muted }}>{L[s.type]??s.type}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:Cl[s.type]??C.muted }}>{s.score}</span>
          </div>
          <div style={{ height:3, borderRadius:2, background:'rgba(244,247,251,.06)', marginBottom:6 }}>
            <div style={{ height:'100%', width:`${s.score}%`, borderRadius:2, background:Cl[s.type]??C.muted }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, color:C.muted }}>Confianza: <span style={{ color:CC[s.confidence]??C.muted, fontWeight:600 }}>{s.confidence}</span></span>
            <span style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, color:C.muted }}>Peso: {(BASE_WEIGHTS[s.type]*100).toFixed(0)}%</span>
          </div>
          {s.source && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(154,169,186,.5)', marginTop:4 }}>Fuente: {s.source}</div>}
        </div>
      ))}
      <div style={{ marginTop:12, padding:10, background:'rgba(214,168,58,.05)', border:'1px solid rgba(214,168,58,.12)', borderRadius:8 }}>
        <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:9, fontWeight:700, color:C.gold, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Fórmula</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.muted, lineHeight:1.8 }}>
          score = Σ (peso_norm × avg_score)<br/>
          Alta: ≥65 | Media: 35–64 | Cual.: solo testimonios
        </div>
      </div>
    </div>
  );
}

function MapaTab({ zone, node, map }: { zone:ZoneResult|null; node:Record<string,unknown>|null; map:maplibregl.Map|null }) {
  const bs: React.CSSProperties = { padding:'10px 14px', borderRadius:8, border:'1px solid rgba(244,247,251,.08)', background:'rgba(244,247,251,.04)', cursor:'pointer', fontFamily:'Inter,system-ui,sans-serif', fontSize:11, fontWeight:500, color:C.white, transition:'all 150ms', textAlign:'left', width:'100%' };
  const hi = (e:React.MouseEvent) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(214,168,58,.10)'; };
  const ho = (e:React.MouseEvent) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,247,251,.04)'; };
  return (
    <div style={{ animation:'mv-fade-in 200ms ease', display:'flex', flexDirection:'column', gap:8, padding:'4px 0' }}>
      <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.muted, marginBottom:6, textAlign:'center' }}>Controles de vista</div>
      <button onClick={() => map?.flyTo({ center:MAP_CENTER, zoom:MAP_ZOOM, duration:1200 })} style={bs} onMouseEnter={hi} onMouseLeave={ho}>🌍 Vista general</button>
      <button onClick={() => map?.flyTo({ center:MAP_CENTER, zoom:15.5, duration:1200 })} style={bs} onMouseEnter={hi} onMouseLeave={ho}>🔍 Zoom campus</button>
      <button onClick={() => { if (map) map.setBearing(map.getBearing()+45); }} style={bs} onMouseEnter={hi} onMouseLeave={ho}>🔄 Rotar 45°</button>
      <button onClick={() => map?.flyTo({ center:MAP_CENTER, zoom:MAP_ZOOM, bearing:0, pitch:0, duration:1200 })} style={bs} onMouseEnter={hi} onMouseLeave={ho}>↺ Resetear vista</button>
      {zone && <div style={{ marginTop:10, fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, textAlign:'center' }}>Zona: <span style={{color:C.white,fontWeight:500}}>{zone.name}</span></div>}
      {node && <div style={{ marginTop:6, fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, textAlign:'center' }}>Nodo: <span style={{color:C.white,fontWeight:500}}>{String(node.title??'')}</span></div>}
    </div>
  );
}

function AportarTab({ zone, onContribute }: { zone:ZoneResult; onContribute:(id:string,sc:number)=>void }) {
  const [score, setScore] = useState(50);
  const [note, setNote] = useState('');
  return (
    <div style={{ animation:'mv-fade-in 200ms ease' }}>
      <SectionLabel>Aportar observación para</SectionLabel>
      <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:14, fontWeight:600, color:C.white, marginBottom:14 }}>{zone.name}</div>
      <label style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, display:'block', marginBottom:6 }}>Percepción (0–100)</label>
      <input type="range" min={0} max={100} value={score} onChange={e=>setScore(Number(e.target.value))} style={{ width:'100%', accentColor:C.gold }} />
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:C.gold, textAlign:'center', marginTop:4, marginBottom:14 }}>{score}</div>
      <label style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, display:'block', marginBottom:6 }}>Nota (opcional)</label>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe tu observación..." rows={3} style={{ width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(244,247,251,.04)', border:'1px solid rgba(244,247,251,.08)', fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.white, resize:'vertical', outline:'none', marginBottom:14 }} />
      <button onClick={()=>onContribute(zone.id,score)} style={{ width:'100%', padding:'10px', borderRadius:9, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${C.gold},${C.maize})`, fontFamily:'Inter,system-ui,sans-serif', fontSize:11, fontWeight:700, color:C.obsidian }}>
        ✦ Registrar aportación
      </button>
      <div style={{ marginTop:12, padding:'8px 10px', background:'rgba(244,247,251,.02)', border:'1px solid rgba(244,247,251,.05)', borderRadius:7, fontFamily:'Inter,system-ui,sans-serif', fontSize:9, color:C.muted, lineHeight:1.6 }}>
        Se registra como <strong style={{color:C.violet}}>participatory_feedback</strong> con confianza <strong style={{color:C.coral}}>baja</strong>.
      </div>
    </div>
  );
}

function AnalyticsPanel({ zones, nodes, routes, onClose }: { zones:ZoneResult[]; nodes:GeoJSON.FeatureCollection; routes:GeoJSON.FeatureCollection; onClose:()=>void }) {
  const alta = zones.filter(z=>z.label==='prioridad_alta');
  const media = zones.filter(z=>z.label==='prioridad_media');
  const cual = zones.filter(z=>z.label==='validacion_cualitativa');
  const sinD = zones.filter(z=>z.label==='sin_datos_estructurados');
  const avg = zones.length ? Math.round(zones.reduce((s,z)=>s+z.score,0)/zones.length) : 0;

  const cats: Record<string,number> = {};
  nodes.features.forEach(f => { const c = String((f.properties as Record<string,unknown>)?.category??'orientacion'); cats[c]=(cats[c]??0)+1; });

  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(3,7,18,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', animation:'mv-fade-in 150ms ease' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'calc(100% - 24px)', maxWidth:520, maxHeight:'80vh', background:C.panelHard, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:'0 24px 80px rgba(0,0,0,.7)', animation:'mv-scale-in 200ms cubic-bezier(0.4,0,0.2,1) forwards', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'18px 20px 14px', borderBottom:`1px solid rgba(214,168,58,.10)`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:15, fontWeight:600, color:C.gold }}>📊 Panel de Analítica</div>
            <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, marginTop:2 }}>Resumen territorial en tiempo real</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(244,247,251,.06)', border:'none', borderRadius:6, width:28, height:28, cursor:'pointer', color:C.muted, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div className="mv-scroll" style={{ flex:1, overflowY:'auto', padding:'16px 20px', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(100px, 1fr))', gap:8, marginBottom:18 }}>
            {[{l:'Score prom.',v:avg,c:C.gold},{l:'Zonas',v:zones.length,c:C.white},{l:'Nodos',v:nodes.features.length,c:C.green},{l:'Rutas',v:routes.features.length,c:C.orange}].map(({l,v,c}) => (
              <div key={l} style={{ background:'rgba(244,247,251,.03)', border:'1px solid rgba(244,247,251,.06)', borderRadius:8, padding:'10px 8px', textAlign:'center' }}>
                <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:20, fontWeight:700, color:c }}>{v}</div>
                <div style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:8, color:C.muted, marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
              </div>
            ))}
          </div>
          <SectionLabel>Distribución de prioridad</SectionLabel>
          {[{l:'Prioridad alta',n:alta.length,c:C.coral},{l:'Prioridad media',n:media.length,c:C.amber},{l:'Validación cual.',n:cual.length,c:C.violet},{l:'Sin datos',n:sinD.length,c:C.gray}].map(({l,n,c}) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:c }} />
              <span style={{ flex:1, fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.white }}>{l}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:c }}>{n}</span>
              <div style={{ width:80, height:6, borderRadius:3, background:'rgba(244,247,251,.06)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${zones.length?(n/zones.length)*100:0}%`, borderRadius:3, background:c }} />
              </div>
            </div>
          ))}
          <SectionLabel style={{marginTop:16}}>Nodos por categoría</SectionLabel>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:6 }}>
            {Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,count]) => {
              const i = getCatInfo(cat);
              return (
                <div key={cat} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 8px', borderRadius:6, background:'rgba(244,247,251,.03)', border:'1px solid rgba(244,247,251,.05)' }}>
                  <span style={{fontSize:12}}>{i.icon}</span>
                  <span style={{ flex:1, fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.white }}>{i.label}</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:i.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContribForm({ zones, onSubmit, onClose }: { zones:ZoneResult[]; onSubmit:(id:string,sc:number)=>void; onClose:()=>void }) {
  const [sel, setSel] = useState(zones[0]?.id ?? '');
  const [sc, setSc] = useState(50);
  const [note, setNote] = useState('');
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(3,7,18,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', animation:'mv-fade-in 150ms ease' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'calc(100% - 24px)', maxWidth:380, background:C.panelHard, border:`1px solid ${C.border}`, borderRadius:14, boxShadow:'0 24px 80px rgba(0,0,0,.7)', padding:'20px 22px', animation:'mv-scale-in 200ms cubic-bezier(0.4,0,0.2,1) forwards' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:15, fontWeight:600, color:C.gold }}>✦ Aportar observación</div>
          <button onClick={onClose} style={{ background:'rgba(244,247,251,.06)', border:'none', borderRadius:6, width:24, height:24, cursor:'pointer', color:C.muted, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <label style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, display:'block', marginBottom:6 }}>Zona</label>
        <select value={sel} onChange={e=>setSel(e.target.value)} style={{ width:'100%', padding:'8px 10px', borderRadius:8, marginBottom:14, background:'rgba(244,247,251,.05)', border:'1px solid rgba(244,247,251,.10)', fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.white, outline:'none' }}>
          {zones.map(z => <option key={z.id} value={z.id} style={{background:C.obsidian,color:C.white}}>{z.name}</option>)}
        </select>
        <label style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, display:'block', marginBottom:6 }}>Percepción (0–100)</label>
        <input type="range" min={0} max={100} value={sc} onChange={e=>setSc(Number(e.target.value))} style={{ width:'100%', accentColor:C.gold, marginBottom:4 }} />
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:C.gold, textAlign:'center', marginBottom:14 }}>{sc}</div>
        <label style={{ fontFamily:'Inter,system-ui,sans-serif', fontSize:10, color:C.muted, display:'block', marginBottom:6 }}>Nota (opcional)</label>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe tu observación..." rows={3} style={{ width:'100%', padding:'8px 10px', borderRadius:8, marginBottom:14, background:'rgba(244,247,251,.04)', border:'1px solid rgba(244,247,251,.08)', fontFamily:'Inter,system-ui,sans-serif', fontSize:11, color:C.white, resize:'vertical', outline:'none' }} />
        <button onClick={()=>onSubmit(sel,sc)} style={{ width:'100%', padding:'11px', borderRadius:9, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${C.gold},${C.maize})`, fontFamily:'Inter,system-ui,sans-serif', fontSize:11, fontWeight:700, color:C.obsidian }}>
          ✦ Registrar aportación
        </button>
      </div>
    </div>
  );
}
