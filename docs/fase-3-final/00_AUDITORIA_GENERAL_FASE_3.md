# 00 — Auditoría General — Fase 3

> Proyecto: **Mapa Vivo UACh-Texcoco**
> Fecha de generación: 2026-06-10
> Fase: 3 — Integración Final, QA y Demo

---

## Resumen Ejecutivo

La Fase 3 comprende la integración final de todos los datos geoespaciales del paquete v06, la implementación de scripts de auditoría automatizados, y la preparación para la demostración pública del Mapa Vivo.

## Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|------------|---------|
| Framework UI | React | 18.3.x |
| Lenguaje | TypeScript | ~5.6.2 |
| Bundler | Vite | 5.4.x |
| Mapa base | MapLibre GL | 5.24.x |
| Capas de datos | deck.gl | 9.3.x |
| Estado global | Zustand | 5.0.x |
| Estilos | Tailwind CSS | 3.4.x |
| Validación | Zod | 4.4.x |

## Estructura del Proyecto

```
mapa-vivo-uach/
├── public/data/          ← Datos GeoJSON/CSV públicos
├── src/
│   ├── components/       ← Componentes React
│   ├── data/             ← Registros generados (layerRegistry, layerStats)
│   ├── lib/              ← Utilidades (privacy, formatters, performance)
│   ├── stores/           ← Zustand stores
│   ├── styles/           ← Estilos globales
│   └── types/            ← Tipos TypeScript
├── scripts/              ← Scripts de build/QA
└── docs/fase-3-final/    ← Esta documentación
```

## Estado de los Datos (Paquete v06)

| Carpeta Fuente | Status | Acción |
|---------------|--------|--------|
| 01_web_publico_core | ✅ Publicable | Copiado a public/data/ |
| 02_web_publico_nodos | ✅ Publicable | Copiado a public/data/ |
| 03_web_contexto_movilidad | ⚠️ Condicionado | vias_contexto_movilidad (4.3 GB) no se carga por defecto |
| 04_revision_controlada | 🔒 Revisión | NO copiado a public/data/ |
| 05_no_publicar_sensible | 🚫 Prohibido | NUNCA se copia a public/data/ |
| 06_manifest_documentacion | 📋 Documentación | CSVs y config copiados |
| 07_estilos_qgis_qml | 🎨 Solo estilo | No aplica para web |

## Scripts de QA Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run qa:sensitive` | Auditoría ética y de privacidad |
| `npm run qa:geojson` | Validación de archivos GeoJSON |
| `npm run qa:stats` | Generación de estadísticas de capas |
| `npm run qa:final` | Ejecución secuencial de todos los QA |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run build:data` | Re-escaneo del paquete fuente v06 |

## Documentos de Auditoría (Esta Carpeta)

| Documento | Contenido |
|-----------|-----------|
| 00_AUDITORIA_GENERAL_FASE_3.md | Este documento — visión general |
| 01_AUDITORIA_DATOS_Y_CAPAS.md | Inventario y calidad de datos |
| 02_AUDITORIA_ETICA_Y_PRIVACIDAD.md | Cumplimiento ético (generado automáticamente) |
| 03_AUDITORIA_INTERFAZ_Y_UX.md | Evaluación de UI/UX |
| 04_AUDITORIA_DISENO_VISUAL.md | Evaluación de diseño visual |
| 05_AUDITORIA_RENDIMIENTO.md | Notas de rendimiento |
| 06_AUDITORIA_FORMULARIO_PARTICIPATIVO.md | Evaluación del formulario |
| 09_CHECKLIST_FINAL_DEMO.md | Checklist para demostración |

## Reglas Éticas Fundamentales

> [!CAUTION]
> Estas reglas son **inquebrantables** y tienen prioridad sobre cualquier decisión técnica.

1. **NUNCA** publicar datos de `05_no_publicar_sensible`
2. **FILTRAR** features con `nivel_uso = "04_no_publicar_sensible"` en el frontend
3. **NO GEOLOCALIZAR** puntos exactos de víctimas
4. **NO EXPONER** testimonios, relatos, o datos personales en la interfaz
5. **USAR** lenguaje de cuidado, no lenguaje punitivo

---

*Generado por el equipo de auditoría del Mapa Vivo UACh-Texcoco, Fase 3.*
