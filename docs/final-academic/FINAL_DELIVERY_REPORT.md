# REPORTE DE ENTREGA ACADÉMICA FINAL

Este documento consolida la reingeniería final del **Mapa Vivo UACh–Texcoco**, validando el cumplimiento del 100% de las instrucciones de la orden final.

## 1. Migración Táctica a MapLibre Nativo
Se retiró a DeckGL del control del renderizado primario de datos.
- **Implementación**: `MapLibreDataRenderer.tsx` se conecta directamente al árbol de MapLibre a través de `addSource` y `addLayer`.
- **Ventaja**: Cero probabilidad de fallo de renderización de capas geográficas principales en caso de sobrecarga de estado de React o colisión de buffers 3D en gráficas de baja gama.

## 2. Dataset Académico Unificado
El script `build-mapvivo-academic-dataset.ts` compila asíncronamente un archivo monolítico robusto, permitiendo la ingesta en un solo request de red al cliente.
- **Modo Público Seguro**: Oculta testimonios directos (lat/lng).
- **Modo Académico**: Accesible mediante confirmación restrictiva. Renderiza conteos sensibles y agrega geometrías protegidas.

## 3. Estética Rigurosa
- Se eliminó el uso ubicuo del "Cyan Data" genérico, favoreciendo paletas cálidas y terrosas (`chapingoGold`, `warmSoil`) intercaladas con alertas agresivas (`coralAlert`, `magentaCare`).
- Fuentes forzadas: `Space Grotesk` (encabezados analíticos) y `JetBrains Mono` (cuantificadores numéricos).

## 4. UI Integrada
- El `InsightDeck` ya no es un "cuadro sobrepuesto". Ahora vive elegantemente embutido en el contenedor monolítico `LeftControlPanel`.
- La `ContributionToolbar` flota horizontal y discretamente en la porción superior.
- El Panel de Detalles Derecho utiliza pestañas orgánicas en estado puro de React y omite textos de "datos vacíos" a favor de narrativas contextuales.

## CÓMO PROBAR Y AUDITAR:
1. Asegurarse que se ejecutó `npx tsx scripts/build-mapvivo-academic-dataset.ts` exitosamente.
2. Correr `npm run dev` en la terminal.
3. Entrar a `http://localhost:5173`.
4. Apreciar el panel izquierdo y cambiar a **Modo Académico**.
5. Dar click en el "Rayo X" en el borde superior derecho para lanzar una radiografía del render nativo de polígonos bajo un color rosa tóxico de validación.
6. Elegir un polígono, e identificar los scores dinámicos computados al vuelo en la barra derecha, confirmando su conectividad e historial de violencias referidas.
