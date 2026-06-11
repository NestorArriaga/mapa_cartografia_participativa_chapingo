# 05 — Auditoría de Rendimiento

> Proyecto: **Mapa Vivo UACh-Texcoco** — Fase 3
> Fecha: 2026-06-10

---

## Problema Crítico: vias_contexto_movilidad_v06.geojson

> [!CAUTION]
> **Tamaño: 4.3 GB** — Este archivo es el mayor riesgo de rendimiento del proyecto.

### Estado Actual
- El archivo está en `public/data/` (fue copiado por el script de escaneo)
- Si un componente intenta hacer `fetch()` de este archivo, el navegador se congelará
- El script de validación GeoJSON NO puede parsearlo (out of memory)

### Soluciones Recomendadas

| Solución | Complejidad | Resultado |
|----------|------------|-----------|
| **No cargar por defecto** | ✅ Fácil | Checkbox "Cargar vías" desactivado |
| **Tippecanoe → PMTiles** | ⚠️ Media | Tiles vectoriales servidos localmente |
| **Simplificación geométrica** | ⚠️ Media | mapshaper o ogr2ogr para reducir complejidad |
| **Streaming GeoJSON** | 🔴 Alta | Leer en chunks con oboe.js o similar |
| **Excluir de public/data/** | ✅ Fácil | Solo mantener en paquete fuente |

### Recomendación Inmediata

```typescript
// En la configuración de capas:
{
  id: 'vias_contexto_movilidad_v06',
  visibleDefault: false,  // NUNCA cargar por defecto
  loadOnDemand: true,      // Solo si el usuario lo solicita
  warningMessage: 'Este archivo pesa 4.3 GB. La carga puede tardar varios minutos.',
}
```

## Peso de las Capas

| Capa | Tamaño | Features | Peso Estimado |
|------|--------|----------|---------------|
| zonas_prioridad_integrada_o_indicadores_v06.geojson | ~5 KB | ~6 | 🟢 Light |
| evidencia_documental_agregada_por_zona_v06.geojson | ~30 KB | ~27 | 🟢 Light |
| nodos_documentales_publicos_agregados_v06.geojson | ~16 KB | ~20+ | 🟢 Light |
| nodos_orientacion_base_v06.geojson | ~34 KB | ~40+ | 🟢 Light |
| conectores_visualizacion_v06.geojson | ~2 KB | ~5 | 🟢 Light |
| vias_contexto_movilidad_v06.geojson | **4.3 GB** | ? | 🔴 **HEAVY** |

## Métricas de Rendimiento Web

### Lighthouse (Objetivos)

| Métrica | Objetivo | Notas |
|---------|----------|-------|
| FCP (First Contentful Paint) | < 1.5s | Sin cargar vías |
| LCP (Largest Contentful Paint) | < 2.5s | Mapa base + zonas |
| TTI (Time to Interactive) | < 3.0s | Panel lateral funcional |
| CLS (Cumulative Layout Shift) | < 0.1 | Evitar reflows por datos |

### Bundle Size

| Componente | Tamaño Estimado |
|-----------|----------------|
| React + ReactDOM | ~40 KB gzip |
| MapLibre GL | ~200 KB gzip |
| deck.gl | ~150 KB gzip |
| Turf.js | ~50 KB gzip |
| App code | ~20 KB gzip |
| **Total** | **~460 KB gzip** |

## Estrategia de Carga de Datos

```
1. Mapa base → Inmediato (tile layer)
2. Zonas de prioridad → Fetch inmediato (~5 KB)
3. Evidencia documental → Fetch inmediato (~30 KB, filtrar sensibles)
4. Nodos públicos → Fetch diferido 100ms (~16 KB)
5. Nodos orientación → Fetch diferido 200ms (~34 KB)
6. Conectores → Fetch diferido 300ms (~2 KB)
7. Vías de movilidad → NUNCA automático (4.3 GB)
```

## Módulo de Rendimiento

El módulo `src/lib/performance.ts` proporciona:

- `shouldReduceMotion()` — Respeta `prefers-reduced-motion`
- `getPerformanceMode()` — Detecta dispositivos limitados
- `estimateLayerWeight()` — Clasifica capas como light/medium/heavy

### Adaptaciones por Modo de Rendimiento

| Feature | Normal | Reduced |
|---------|--------|---------|
| Animaciones de transición | ✅ Habilitadas | ❌ Deshabilitadas |
| Tooltips animados | ✅ Fade in | ⚡ Instantáneo |
| Número de capas cargadas | Todas | Solo esenciales |
| Calidad de renderizado | Alta | Simplificada |

---

*Para generar reportes detallados, ejecutar `npm run qa:geojson`.*
