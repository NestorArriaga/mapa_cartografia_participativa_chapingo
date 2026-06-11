# Plan de Mejoras - Fase 2

## Tareas Principales

1. **Refactorización CSS / UI Global**
   - Actualizar `globals.css` para añadir `app-shell::before` con el gradiente y el `noise`.
   - Implementar las variantes de `GlassPanel`.

2. **Panel Control (Izquierdo)**
   - Reconstruir `LeftControlPanel.tsx` en módulos.
   - Añadir secciones para métricas vivas (leyendo el registry real y las aportaciones locales).
   - Añadir la cuenta de elementos restringidos (para cumplir la instrucción de "X elementos sensibles conservados fuera del mapa").

3. **Panel Detalle (Derecho)**
   - Crear componentes internos para `EmptyState`, `ZoneDetail`, y `NodeDetail`.
   - Conectar las properties del feature renderizado en el mapa con la UI.

4. **Experiencia del Mapa (Deck.gl)**
   - Mejorar `DeckLayerRenderer`. Añadir lógica para que los "nodos documentales" se rendericen como "zonas de lectura" (ej. un círculo más grande con borde punteado).
   - Añadir lógica para `presentationMode`.

5. **Formulario Participativo (Zod + LocalStorage)**
   - Instalar `@hookform/resolvers` y `react-hook-form` junto a Zod para el flujo estricto (opcional o usar Zod directo).
   - Separar el flujo en tarjetas visuales grandes en lugar de checkboxes básicos.
   - Guardar en LocalStorage explícitamente en la colección `ecoFemSubmissions`.

6. **Scripts y Validación**
   - Crear `scripts/validate-web-layers.ts` para hacer la aserción técnica que garantice que ningún archivo de la carpeta 05 existe en la carpeta `public/data`.

7. **Documentación**
   - Redactar `docs/DESIGN_SYSTEM.md`, `docs/ETHICS_AND_PRIVACY.md`, `docs/DATA_ARCHITECTURE.md`, `docs/QA_CHECKLIST.md`.
