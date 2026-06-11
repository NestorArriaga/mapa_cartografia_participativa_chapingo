# Mapa Vivo UACh-Texcoco — Demo Final

## Plataforma Cartográfica Participativa y Ética

Esta versión representa la entrega final (Fase 3) de la plataforma web. Ha sido sometida a una profunda auditoría, sanitización y mejora visual/técnica para garantizar que cumpla con los estándares éticos requeridos y ofrezca una experiencia premium de "observatorio nocturno".

## 1. Fuga Ética Resuelta (Sanitización)

**Problema:** La capa original `evidencia_documental_agregada_por_zona_v06.geojson` (que se encontraba en `/public/data/`) exponía features catalogadas como `"04_no_publicar_sensible"`, incluyendo información sobre el internado, baños y casas de compañeras.

**Solución:** 
- Se implementó el script automatizado `scripts/sanitize-v06-public-data.ts`.
- Este script procesa los datos originales en cuarentena y genera nuevas versiones `*.public.geojson` en `public/data/sanitized/`.
- **9 features** extremadamente sensibles fueron bloqueadas permanentemente de los archivos públicos.
- Se ha generado un `layerRegistry.sanitized.generated.ts` que el frontend consume, garantizando que sea imposible cargar datos que no han pasado por el filtro.
- Se implementó un Gate Ético en QA (`scripts/final-ethics-gate.ts`) que hace fallar el despliegue si se detecta lenguaje como "zona peligrosa" o si se suben archivos sensibles.

## 2. Optimización de Capa de 4.3 GB (Movilidad)

**Problema:** El archivo `vias_contexto_movilidad_v06.geojson` pesaba más de 4 GB, bloqueando cualquier intento de carga en el navegador.

**Solución:**
- El archivo original se ha bloqueado a nivel de código mediante `loadStrategy: "disabled_too_large"`.
- Se desarrolló el script `scripts/create-lightweight-mobility-layer.ts` usando streaming (`stream-json`).
- Este script calculó el *Bounding Box* de las zonas públicas (añadiendo un padding espacial de ~2km) y extrajo exclusivamente las ~1,000 features que cruzan ese espacio (de un total de 4.3 millones).
- El archivo resultante (`vias_contexto_movilidad.light.geojson`) pesa menos de 1 MB, se carga instantáneamente y mantiene el contexto exacto requerido.

## 3. Uso de Datos Reales y Ricos (No Mock)

**Problema:** El prototipo inicial usaba placeholders (lorem ipsum) e ignoraba las ricas métricas calculadas en el backend (pct_alerta, score_integrado, urgencia, etc.).

**Solución:**
- Se eliminaron todos los mocks.
- El panel derecho (`RightDetailPanel.tsx`) ahora lee y formatea dinámicamente las propiedades reales de las capas.
- Se creó `src/lib/featureFormatters.ts` para traducir strings técnicos ("03_revision_controlada") a lenguaje humano ("Revisión controlada (oculto)").
- Los tooltips y popups ahora reflejan las narrativas del proyecto (resumen, popup, ética).

## 4. Upgrade de Diseño Visual (Atmósfera)

**Solución:**
- Se migró hacia una paleta de colores inmersiva basada en azul/negro nocturno con acentos neón controlados.
- Se añadieron viñetas y gradientes atmosféricos en `globals.css`.
- Los Nodos (MapLibre/Deck.GL) ahora tienen halos luminosos y pulsos animados proporcionales a su nivel de urgencia o prioridad.
- Paneles con Glassmorphism premium.

## 5. Participación Cuidadosa

**Solución:**
- Formulario de Participación reimaginado con 2 vías: "Rápida" y "Testimonio Cuidado".
- Motor de detección de contenido sensible en tiempo real (advierte si el usuario ingresa teléfonos o direcciones).
- Guardado seguro en `localStorage`.

---

## Ejecución del Proyecto

1. **Instalar dependencias:** `npm install`
2. **QA Ultimate:** `npm run qa:ultimate` (Sanitiza, optimiza, audita, hace build).
3. **Desarrollo:** `npm run dev`
4. **Producción:** `npm run preview`

*Proyecto listo para validación participativa y demo.*
