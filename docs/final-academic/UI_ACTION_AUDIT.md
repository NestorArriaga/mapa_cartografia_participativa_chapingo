# Reporte de Auditoría de Acciones de Interfaz de Usuario
Generado el: 6/10/2026, 7:53:27 PM
Proyecto: **Mapa Vivo UACh–Texcoco**

## Resumen de Auditoría
* **Total de componentes de botón auditados:** 52
* **Errores (Empty Callbacks):** 0
* **Advertencias (Missing Action/Test IDs):** 5

---

## Detalle de Errores Críticos (Rechazados)
*No se encontraron errores críticos de controladores vacíos. ¡Paso de calidad aprobado!*


---

## Detalle de Advertencias


### ⚠️ Botón interactivo carece de data-action-id o data-testid para E2E y Registro de Acciones.
* **Archivo:** [src/components/admin/SubmissionInspector.tsx](file:////Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach/src/components/admin/SubmissionInspector.tsx) L76
* **Código:** `<button onClick={() => handleUpdate('rejected_sensitive')} className="text-mapCoral hover:underline text-xs py-1">`


### ⚠️ Botón interactivo carece de data-action-id o data-testid para E2E y Registro de Acciones.
* **Archivo:** [src/components/admin/SubmissionInspector.tsx](file:////Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach/src/components/admin/SubmissionInspector.tsx) L79
* **Código:** `<button onClick={handleDelete} className="text-textMuted hover:text-mapCoral transition-colors text-xs py-1 mt-2">`


### ⚠️ Botón interactivo carece de data-action-id o data-testid para E2E y Registro de Acciones.
* **Archivo:** [src/components/demo/DemoTour.tsx](file:////Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach/src/components/demo/DemoTour.tsx) L36
* **Código:** `<button onClick={() => setIsOpen(true)} className="absolute top-4 left-[380px] z-10 glass-panel px-4 py-2 rounded-full text-sm font-medium text-white flex items-center gap-2 hover:bg-white/10 transition-colors">`


### ⚠️ Botón interactivo carece de data-action-id o data-testid para E2E y Registro de Acciones.
* **Archivo:** [src/components/demo/DemoTour.tsx](file:////Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach/src/components/demo/DemoTour.tsx) L56
* **Código:** `<button onClick={() => setStep(s => s - 1)} className="px-4 py-2 rounded-full border border-white/10 text-white hover:bg-white/5">`


### ⚠️ Botón interactivo carece de data-action-id o data-testid para E2E y Registro de Acciones.
* **Archivo:** [src/components/system/AppErrorBoundary.tsx](file:////Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach/src/components/system/AppErrorBoundary.tsx) L49
* **Código:** `<button onClick={() => window.location.reload()}>`


---
*Fin del reporte de auditoría. Certificación de integridad de acciones interactiva UACh.*
