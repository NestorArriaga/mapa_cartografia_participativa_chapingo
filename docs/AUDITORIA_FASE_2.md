# Auditoría Estado Actual - Fase 2

## 1. Capas cargadas
Actualmente se han registrado 16 capas en `layerRegistry.generated.ts`. 

## 2. Procedencia de capas
- **01_web_publico_core**: 2 capas poligonales.
- **02_web_publico_nodos**: 2 capas de puntos.
- **03_web_contexto_movilidad**: 2 capas de líneas/desconocido.
- **04_revision_controlada**: 1 capa de puntos.
- **05_no_publicar_sensible**: 2 capas de puntos.
- **06_manifest_documentacion**: 7 tablas CSV y JSON.

## 3. Revisión de capas sensibles (05_no_publicar_sensible)
Las capas `nodos_documentales_NO_PUBLICAR_v06` y `nodos_revision_sensible_base_v06` existen en el registry, **PERO** no tienen la propiedad `publicPath`, lo que confirma que el script original impidió su copiado a la carpeta pública. Su bandera `canShowOnPublicMap` es `false`.

## 4. Revisión de capas en revisión (04_revision_controlada)
La capa `nodos_documentales_revision_v06` tiene `canShowOnPublicMap: false` y `visibleDefault: false`. No tiene `publicPath`. No está expuesta públicamente.

## 5. Lenguaje
El modal introductorio usa correctamente "Este no es un mapa de peligro. Es una cartografía de cuidado."
Sin embargo, hay que revisar todo el código para asegurar que no haya variables o descripciones internas que digan "peligro".

## 6. Popups
Actualmente los popups están hardcodeados en el RightDetailPanel con datos "mock". Deben conectarse dinámicamente usando `buildPopupContent(feature, layer)`.

## 7. Formulario participativo
Actualmente es un prototipo básico que simula pasos. Debe implementarse validación completa con Zod y guardar en LocalStorage (`ecoFemSubmissions`).

## 8. Diseño visual
El diseño usa Glassmorphism y la paleta correcta, pero falta la capa de atmósfera global (radial gradients, viñeta, ruido) para unificar la estética nocturna profunda.

## 9. Paneles e interfaz
El panel izquierdo requiere mejor estructura modular.
El panel derecho requiere implementación real de estados `empty`, `zone` y `node`.
Faltan componentes de Accesibilidad (a11y).

## 10. Rendimiento
El mapa recarga colores pero podría optimizarse con `useMemo` más profundo y manejo de estados.

## 11. Errores TypeScript/Lint
El proyecto compila sin errores después de la última corrección, pero el refactor exigirá controles estrictos.
