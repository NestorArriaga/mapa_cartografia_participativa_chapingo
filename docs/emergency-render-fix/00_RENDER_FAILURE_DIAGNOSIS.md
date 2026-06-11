# Diagnóstico del Fallo Visible

## 1.1 Estado actual en navegador

El análisis estructural de los componentes UI y del Store muestra las siguientes fallas críticas que causan que el mapa no se renderice:

| Revisión | Resultado | Evidencia | Acción |
| -------- | --------- | --------- | ------ |
| URL local usada | `http://localhost:5175/` | Confirmado mediante logs de Vite. | N/A |
| Si aparece `Cargando capas geoespaciales...` | SÍ | Es visible constantemente al abrir la app. | |
| Si el loading desaparece | NO | `isLoading` empieza como `true` en `mapStore.ts` y **no existe lógica en todo el proyecto que llame a `setLoading(false)`**. Esto bloquea el render de la interfaz para el usuario. | Implementar control de estado real de carga de capas en la tienda y `loaders.ts`. |
| Si aparece mapa base | NO VISIBLE | Está tapado visualmente por el overlay de carga que nunca se quita. Además, el `DARK_MAP_STYLE` podría no estar apuntando a un mapa robusto libre de tokens. | Cambiar a fondo base `Carto Dark Matter` con fallback raster. |
| Si aparece canvas de deck.gl | NO VISIBLE | El overlay tapa todo. | Quitar bloqueo y verificar render. |
| `layerRegistry.sanitized.generated.ts` apunta a rutas correctas | SÍ | Las rutas apuntan a `/data/sanitized/*.geojson`. | |
| Si algún overlay CSS está tapando el mapa | SÍ | El overlay `isLoading` de `MapView.tsx` tiene z-index alto, fondo, e intercepta eventos si no está bien configurado, tapando por completo la experiencia. | Remover/ajustar overlay de loading para que no sea bloqueante, y quitarlo en cuanto cargue 1 capa. |

## Conclusión

La causa principal por la que la app "no funciona" y se ve como rota, es un **loading infinito**. Se estableció el estado inicial `isLoading: true` pero no se conectó el final de la promesa de carga de datos para desactivarlo. Además, el mapa base necesita un estilo robusto sin autenticación (como Carto) para asegurar que siempre haya una referencia geográfica. Por último, la falta de estilo visual propio hace que, cuando se llegue a ver, parezca un template genérico.
