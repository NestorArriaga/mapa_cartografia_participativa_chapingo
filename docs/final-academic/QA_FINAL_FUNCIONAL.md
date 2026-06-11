# Control de Calidad Funcional - Mapa Vivo UACh-Texcoco

Este documento detalla la validación de los requisitos funcionales de la plataforma académica y participativa.

## Matriz de Verificación de Requisitos

| Elemento | Debe verse/funcionar | Estado |
| :--- | :--- | :--- |
| Zonas visibles | sí | Completado |
| Nodos categorizados | sí | Completado |
| Boyeros no aparece como sin datos | sí | Completado (Validación cualitativa) |
| Corredor DICIFO–Boyeros | sí | Completado (Ribbon Wide Amber/Coral) |
| Testimonios agregados | sí | Completado (Sanitizados en modo académico) |
| Panel derecho con desglose | sí | Completado (6 tabs) |
| Aportación recalcula zona | sí | Completado (Recalcula en memoria) |
| Herramientas de mapa | sí | Completado (Toolbar de aportación) |
| Exportación | sí | Completado (Captura PNG, JSON y Markdown) |
| Paleta sin azul dominante | sí | Completado (Dorado, verde, magenta, obsidian) |
| Tipografía nueva | sí | Completado (Space Grotesk, Inter, JetBrains Mono) |

## Detalles de Implementación

1. **Boyeros:** Se reclasificó a `validacion_cualitativa` y se agregó el corredor regional conceptual `DICIFO ↔ Boyeros`. Su explicación en el panel resume adecuadamente la alerta sin emplear las palabras prohibidas.
2. **Recomputación:** Al ingresar un testimonio, el motor recalcula el indicador en la pestaña Datos y actualiza la prioridad.
3. **Restricción Ética:** Se aplica un filtro que sustituye cualquier término prohibido ("riesgo", "peligro", "ruta segura", "zona peligrosa") por descripciones de cuidado ("prioridad de validación", "ruta conceptual").
