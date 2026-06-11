# Reporte de Reingeniería al 100%: De Visor a Sistema Vivo

## 1. Qué cambió de fondo
La arquitectura anterior dependía únicamente de la lectura estática de GeoJSON pre-renderizados. Se construyeron cuatro nuevos motores:
- **`liveDataEngine`**: Escucha aportaciones (alojadas temporalmente en Zustand y persistidas vía Export) para recalcular el score de percepción y prioridad en tiempo real.
- **`nodeNetworkEngine`**: Convierte los nodos aislados en grafos espaciales usando proximidad (Turf.js) y similitud de categorías.
- **`routeEngine`**: Implementa cálculos matemáticos geoespaciales para inferir distancias o construir "Conexiones Conceptuales" evitando llamadas a APIs restrictivas.
- **`recommendationEngine`**: Genera sugerencias de acción a partir del recálculo computacional.

## 2. Qué cambió visualmente
El mapa satelital cobra sentido por el enorme contraste introducido:
- **Nodos**: Rediseñados bajo `NodeConstellationLayer`. Cada uno late a un ritmo único (`hash` basado en ID) con 8 gamas cromáticas hiper-específicas (ej: Dorado Movilidad, Magenta Testimonios, Verde Apoyo).
- **Rutas**: Partículas de movilidad (`MobilityFlowLayer`) fluyendo en los trayectos activos, y trazados en vivo usando el `ComputedRoutesLayer`.
- **Polígonos**: Texturas dinámicas y variaciones de opacidad ligadas al `liveDataEngine` mediante colores institucionales vibrantes.
- **Fuentes**: Implementación estricta de `Sora` (títulos gruesos), `Inter` (cuerpo UI) y `JetBrains Mono` (datos duros).

## 3. Herramientas nuevas de colaboración
Se integró la `ContributionToolbar` vertical con:
- Añadir Punto.
- Dibujar Ruta (Click a Click, doble click para cerrar).
- Marcar Zona.
- Reporte Rápido (Despliega el `MapRadialMenu` directamente donde se hace click).
- Medir Distancia.
- Calcular Trayecto (Se integró la advertencia ética).
Y el módulo `ExportTools` para bajar un PNG directo de MapLibre y extraer el local JSON de aportaciones.

## 4. Cómo se recalculan datos
El `LiveDataEngine` recomputa las métricas de zona agregando el impacto local de las nuevas aportaciones:
`0.45 * Percepción + 0.20 * Participación + 0.15 * Protegidos + 0.10 * Evidencia`
El polígono de la zona entonces se actualiza visualmente al instante reflejando una prioridad "baja", "media", "alta" o "muy_alta".

## 5. Uso de Datos Protegidos
Según la política establecida en `dataAccessPolicy.ts`, geometrías sensibles o testimonios que requieren revisión *nunca* son renderizados punto a punto en el mapa. Sin embargo, entran en la cuenta de agregación del motor (como `protectedSignalCount`). De esta forma, el índice local eleva la alerta sin desvelar identidades ni ubicaciones de refugio.

## 6. Capas Visibles e Interacción Diagnóstica
Se implementó el modo "Rayos X" que fuerza estilos masivos y muestra cuentas reales.
- **Zonas**: Visibles.
- **Nodos**: Visibles (Halo y Núcleo).
- **Rutas y Trayectos**: Visibles.
- **Flujos**: Visibles.

## 7. Animaciones
- Pulso asíncrono en todos los nodos (vía `animationSystem.ts`).
- Expansión OnHover de nodos y polígonos.
- Movilidad particulada a través de vías contextuales.
- Fade-in de UI Glass y escalas del Menú Radial.
- Respeto nativo a `prefers-reduced-motion`.

## 8. Qué revisar (Pasos para QA en Navegador)
1. Abrir `http://localhost:5173`.
2. Observar cómo el mapa "late".
3. Dar click en el modo "Rayos X" (Barra inferior).
4. Hacer click en cualquier nodo para abrir el Panel Derecho, explorar pestañas (Datos, Red, Cuidado).
5. Tocar la herramienta `Reporte rápido` (Rayo), hacer click en el mapa y explorar el Menú Radial.
6. Exportar PNG de la vista actual desde el engranaje "Exportar".
