# 03 — Auditoría de Interfaz y UX

> Proyecto: **Mapa Vivo UACh-Texcoco** — Fase 3
> Fecha: 2026-06-10

---

## Principios de Diseño UX

El Mapa Vivo se diseña bajo principios de **cartografía de cuidado ecofeminista**:

1. **No revictimizar** — La interfaz nunca debe señalar víctimas o responsabilizar personas
2. **Datos agregados** — Siempre mostrar datos a nivel de zona, nunca puntos exactos de incidentes
3. **Lenguaje de cuidado** — Usar terminología aprobada (ver `src/lib/copyGuard.ts`)
4. **Accesibilidad** — Respetar preferencias de movimiento reducido y alto contraste
5. **Progresividad** — Cargar capas bajo demanda, no todo de golpe

## Componentes de la Interfaz

### Mapa Principal
- [x] MapLibre GL como base
- [x] deck.gl para capas de datos
- [x] Vista centrada en UACh-Texcoco
- [ ] Controles de zoom accesibles (WAI-ARIA)
- [ ] Leyenda de colores para niveles de urgencia

### Panel Lateral
- [ ] Lista de capas con toggles
- [ ] Filtros por urgencia/categoría
- [ ] Indicadores de conteo por capa
- [ ] Sección de formulario participativo

### Popups / Tooltips
- [x] Formateo de prioridades en español
- [x] Porcentajes formateados
- [x] Resúmenes de evidencia
- [x] Estado ético visible
- [ ] No mostrar propiedades sensibles
- [ ] Narrativa de zona en panel expandido

### Formulario Participativo
- [ ] Campos básicos (ubicación, percepción, hora)
- [ ] Validación con Zod
- [ ] Almacenamiento en localStorage
- [ ] Contador de envíos
- [ ] Consentimiento informado obligatorio

## Evaluación de Accesibilidad

| Criterio | Estado | Nota |
|----------|--------|------|
| Contraste de colores | ⚠️ Pendiente | Verificar con WCAG 2.1 AA |
| Navegación por teclado | ⚠️ Pendiente | Mapa necesita skip links |
| Lector de pantalla | ⚠️ Pendiente | Agregar aria-labels |
| Movimiento reducido | ✅ Implementado | `shouldReduceMotion()` en performance.ts |
| Texto alternativo | ⚠️ Pendiente | Falta en íconos SVG |
| Idioma declarado | ⚠️ Pendiente | Verificar `lang="es"` en HTML |

## Responsividad

| Breakpoint | Estado | Nota |
|-----------|--------|------|
| Desktop (> 1024px) | ✅ Principal | Diseño primario |
| Tablet (768-1024px) | ⚠️ Parcial | Panel lateral debe colapsar |
| Móvil (< 768px) | ⚠️ Parcial | Mapa a pantalla completa, panel como sheet |

## Recomendaciones UX

1. **Agregar onboarding**: Un tour guiado para primera visita explicando el propósito
2. **Leyenda siempre visible**: Los colores de urgencia necesitan leyenda permanente
3. **Filtro ético implícito**: El usuario no debería poder desactivar el filtrado ético
4. **Feedback de carga**: Skeleton screens para capas que tardan en cargar
5. **Mensaje sin datos**: Estado vacío amigable cuando no hay features en la vista

---

*Evaluación UX para demo. Se recomienda pruebas de usabilidad con usuarias target.*
