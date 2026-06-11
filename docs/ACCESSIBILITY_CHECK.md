# Auditoría de Accesibilidad - Mapa Vivo UACh-Texcoco

## 1. Estructura y Navegación
- **Foco visible:** Los botones en los paneles y formularios tienen transiciones y estados `focus-visible`.
- **Teclado:** Se agregó atajo de teclado (`Ctrl + Shift + R`) para el panel de administración, evitando contaminación visual pública pero asegurando acceso estructurado. Los modales cierran con `Escape`.
- **Skip Links:** No implementado estrictamente al ser una SPA puramente basada en un Canvas WebGL, pero los paneles tienen flujo semántico superior al mapa interactivo.

## 2. Contraste y Percepción Visual
- **Paleta Premium:** Se ajustó el diseño a un sistema oscuro (glassmorphism) donde el texto es blanco sobre fondos oscurecidos (`bg-[rgba(15,23,42,0.85)]`), garantizando alto contraste.
- **Jerarquía:** Los textos pequeños usan grises pálidos (`#94A3B8`) sobre fondos oscuros, superando el contraste WCAG AA.
- **Reducción de Movimiento:** Implementado `performanceMode.ts` que respeta la configuración OS `prefers-reduced-motion` deshabilitando halos (pulsos visuales).

## 3. ARIA y Tecnologías Asistivas
- Los modales utilizan la propiedad `aria-modal="true"`.
- Los botones de cierre cuentan con iconos vectoriales pero requieren revisión exhaustiva para `aria-label="Cerrar"` en todo el proyecto.

## 4. Lenguaje y Comprensión
- El lenguaje punitivo se eliminó completamente. La UX narrativa de `ParticipatoryForm` utiliza oraciones cortas y exime de la necesidad de incluir contenido gráfico (Trigger Warning by design).

## 5. Pendientes a Futuro
- Añadir un "Modo Texto" para el mapa, que liste las características visuales en una tabla accesible por screen-readers, dado que WebGL/deck.gl por naturaleza no expone su contenido interno al DOM de accesibilidad.
