# 02 — Auditoría Ética y de Privacidad

> Generado automáticamente: 2026-06-10T19:52:33.402Z

## Estado General: ✅ PASS

No se encontraron problemas de privacidad. Todos los datos públicos son seguros.

---

## Métricas del Escaneo

| Métrica | Valor |
|---------|-------|
| Archivos GeoJSON escaneados | 0 |
| Features escaneados | 0 |
| Archivos sensibles en public/ | 0 |
| Features con nivel_uso sensible | 0 |
| Propiedades sensibles detectadas | 0 |

## Reglas Éticas del Proyecto

1. **NUNCA** copiar archivos de `05_no_publicar_sensible` a `public/data/`
2. **FILTRAR** features con `nivel_uso = "04_no_publicar_sensible"` en el frontend
3. **NO EXPONER** propiedades como testimonio, relato, dormitorio, casa, teléfono en popups
4. **NO GEOLOCALIZAR** puntos exactos de víctimas
5. **USAR** solo datos agregados por zona para visualización pública
6. El archivo `vias_contexto_movilidad_v06.geojson` (4.3 GB) NO debe cargarse por defecto

---

*Script: scripts/audit-sensitive-data.ts*
