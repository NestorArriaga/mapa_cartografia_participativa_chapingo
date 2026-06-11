# Revisión de Ética de Datos

## 1. Privacidad de Capas Sensibles
- **Estado Actual:** Exitoso. Las capas en `05_no_publicar_sensible` fueron excluidas físicamente de `public/data`. No hay fuga de datos geográficos.
- **Acción a tomar:** Crear `scripts/validate-web-layers.ts` para que esto sea comprobable mediante CI o un script estricto.

## 2. Nodos Aproximados vs. Exactos
- **Estado Actual:** El tooltip hardcodeado dice "Nodo aproximado/contextual", pero es necesario que el renderer identifique el tipo de nodo desde los datos y muestre anillos concéntricos sutiles para reforzar la idea de "zona de lectura" en lugar de un punto pin-point.

## 3. Lenguaje de Cuidado
- **Estado Actual:** Se usaron términos correctos ("alerta", "recurso").
- **Acción a tomar:** Extender este vocabulario a todos los tooltips dinámicos y a la leyenda interactiva. Asegurar que "Prioridad" esté claramente documentado como "necesidad de validación/intervención" y no "peligro".

## 4. Testimonios Crudos
- **Estado Actual:** El formulario ya integra `detectSensitiveContent`.
- **Acción a tomar:** Enlazar la validación con Zod. Mejorar el panel derecho para que NUNCA muestre testimonios crudos que provengan de features cargadas.
