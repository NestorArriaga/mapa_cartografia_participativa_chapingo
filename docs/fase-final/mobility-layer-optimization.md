# Optimización de Capa Vial de Contexto

Este documento detalla el proceso de reducción de la capa vial para hacerla funcional en el navegador.

- **Archivo Original**: vias_contexto_movilidad_v06.geojson
- **Tamaño Original**: 4.07 GB
- **Estado en Registry**: Marcado como `disabled_too_large`
- **Estrategia**: Filtrado en streaming (sin cargar en memoria) basado en el Bounding Box de las zonas de validación prioritarias (con padding de ~2km).

## Resultados

- **Archivo Resultante**: vias_contexto_movilidad.light.geojson
- **Límite de features establecido**: 4000
- **Features revisadas en stream**: 4349691
- **Features conservadas**: 1049
- **Tamaño final optimizado**: 0.72 MB

Esta versión ligera puede cargarse de forma segura en el navegador sin bloquear el hilo principal.
