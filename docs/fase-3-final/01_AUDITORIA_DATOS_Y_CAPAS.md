# 01 — Auditoría de Datos y Capas

> Proyecto: **Mapa Vivo UACh-Texcoco** — Fase 3
> Fecha: 2026-06-10

---

## Inventario de Capas GeoJSON en public/data/

| Archivo | Tipo Geom. | Carpeta Fuente | Status |
|---------|-----------|----------------|--------|
| zonas_prioridad_integrada_o_indicadores_v06.geojson | MultiPolygon | 01_web_publico_core | ✅ Público |
| evidencia_documental_agregada_por_zona_v06.geojson | MultiPolygon | 01_web_publico_core | ⚠️ Requiere filtrado frontend |
| nodos_documentales_publicos_agregados_v06.geojson | Point | 02_web_publico_nodos | ✅ Público |
| nodos_orientacion_base_v06.geojson | Point | 02_web_publico_nodos | ✅ Público |
| conectores_visualizacion_v06.geojson | LineString | 03_web_contexto_movilidad | ✅ Público |
| vias_contexto_movilidad_v06.geojson | Unknown | 03_web_contexto_movilidad | 🚨 4.3 GB — No cargar |

## Inventario de Archivos CSV en public/data/

| Archivo | Uso | Status |
|---------|-----|--------|
| catalogo_nodos_documentales_v06.csv | Catálogo de nodos | ✅ Documentación |
| diccionario_variables_web_v06.csv | Diccionario de variables | ✅ Documentación |
| inventario_capas_qgis_v06.csv | Inventario QGIS | ✅ Documentación |
| items_documentales_sin_geometria_v06.csv | Items sin geometría | ✅ Documentación |
| manifest_capas_web_v06.csv | Manifiesto web | ✅ Documentación |
| pendientes_finales_validacion_v06.csv | Pendientes de validación | ✅ Documentación |

## Archivos Generados

| Archivo | Generado por | Contenido |
|---------|-------------|-----------|
| layer-manifest.generated.json | scan-v06-package.ts | Registro completo de todas las capas |
| layer-stats.generated.json | generate-layer-stats.ts | Estadísticas de conteo |
| web_layers_config_v06.json | Paquete fuente | Configuración de capas web |

## Capas NO Publicadas (Correctamente Excluidas)

> [!IMPORTANT]
> Estas capas permanecen SOLO en el paquete fuente y NO están en public/data/.

| Capa | Carpeta | Razón de Exclusión |
|------|---------|-------------------|
| nodos_documentales_revision_v06.geojson | 04_revision_controlada | En proceso de revisión |
| nodos_documentales_NO_PUBLICAR_v06.geojson | 05_no_publicar_sensible | Contenido sensible |
| nodos_revision_sensible_base_v06.geojson | 05_no_publicar_sensible | Contenido sensible |

## Notas de Calidad de Datos

### evidencia_documental_agregada_por_zona_v06.geojson

> [!WARNING]
> Este archivo contiene features con `nivel_uso = "04_no_publicar_sensible"`.
> El frontend DEBE filtrar estos features antes de renderizar.

Features sensibles detectados (por `nivel_uso`):
- M1_03 — Internado / residencias de noche
- M1_04 — Baños del internado
- M1_07 — Acceso Puerta San Ignacio
- M3_01 — La Tía — bar clandestino
- M7_09 — Apoyo informal: cuarto/casa de compañera

### vias_contexto_movilidad_v06.geojson

> [!CAUTION]
> Este archivo pesa **4.3 GB**. Cargarlo en el navegador provocará crash inmediato.
> Requiere:
> - Tiling con tippecanoe → MBTiles/PMTiles
> - O simplificación con ogr2ogr/mapshaper
> - O carga bajo demanda con streaming

## Validación CRS

Todos los archivos GeoJSON utilizan CRS84 (`urn:ogc:def:crs:OGC:1.3:CRS84`), compatible con EPSG:4326 y el estándar RFC 7946.

---

*Para reportes detallados de validación, ejecutar `npm run qa:geojson` y consultar geojson-validation-report.json.*
