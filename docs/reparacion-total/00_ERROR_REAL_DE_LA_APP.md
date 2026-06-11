# Error real de la app

## URL probada
`http://localhost:5175/` (entorno local de Vite)

## Comando ejecutado
`npm run build` y `npm run dev`

## Error visible en navegador
Al ejecutarse en modo desarrollo y fallar la compilación, Vite muestra la pantalla de Overlay de Error de TypeScript impidiendo la carga de la UI, o bien el mapa base y componentes colapsan debido a propiedades indefinidas.

## Error exacto de terminal
```
src/components/map/MapView.tsx(6,10): error TS2300: Duplicate identifier 'getPublicLayers'.
src/components/map/MapView.tsx(6,27): error TS2300: Duplicate identifier 'loadLayerData'.
src/components/map/MapView.tsx(8,10): error TS2300: Duplicate identifier 'getPublicLayers'.
src/components/panels/LeftControlPanel.tsx(5,38): error TS6133: 'LayersIcon' is declared but its value is never read.
src/components/panels/RightDetailPanel.tsx(29,9): error TS6133: 'isNode' is declared but its value is never read.
src/components/panels/RightDetailPanel.tsx(107,109): error TS2304: Cannot find name 'Activity'.
src/lib/recommendationEngine.ts(63,9): error TS2322: Type '"informacion"' is not assignable to type '"cuidado" | "validacion" | "infraestructura"'.
```

## Archivo probable responsable
Múltiples archivos tienen desincronización de importaciones y tipos post-refactorización rápida:
- `src/components/map/MapView.tsx`
- `src/components/panels/RightDetailPanel.tsx`
- `src/lib/recommendationEngine.ts`

Adicionalmente, el bootstrap de la app actual asume que todas las capas están 100% listas y bloquea si alguna falla, sin tener un `ErrorBoundary` global ni un modo seguro.

## Causa raíz
1. Duplicación de imports y variables declaradas sin uso.
2. Incompatibilidad de tipos en `recommendationEngine.ts` (faltaba el enum de `tone`).
3. Falta de un sistema resiliente (AppErrorBoundary y BootStatusPanel) que administre el inicio seguro del visor geoespacial, impidiendo que falle por completo.
4. Complejidad y mezcla en el rendering principal (`DeckLayerRenderer` sin dividirse en capas modulares como `ZonePriorityLayer`, `NodeConstellationLayer`, etc).

## Corrección aplicada
(En proceso mediante el Plan de Implementación Total).

## Estado después de corregir
(Pendiente de verificación post-ejecución del plan).
