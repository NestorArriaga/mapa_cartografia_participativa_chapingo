# 04 — Auditoría de Diseño Visual

> Proyecto: **Mapa Vivo UACh-Texcoco** — Fase 3
> Fecha: 2026-06-10

---

## Paleta de Colores

### Colores de Urgencia (Capas de Datos)

| Urgencia | Color Sugerido | Hex | Uso |
|----------|---------------|-----|-----|
| Muy Alta | Rojo oscuro | `#B91C1C` | Zonas con urgencia máxima de validación |
| Alta | Naranja intenso | `#EA580C` | Zonas con prioridad alta |
| Media-Alta | Ámbar | `#D97706` | Prioridad media-alta |
| Media | Amarillo | `#CA8A04` | Prioridad media |
| Baja | Verde salvia | `#65A30D` | Prioridad baja |
| Recurso | Azul cuidado | `#2563EB` | Recursos de apoyo (capa positiva) |

> [!IMPORTANT]
> Los colores NO deben usar rojo brillante tipo "foco rojo" ni semáforo.
> Se busca una paleta que comunique urgencia sin ser alarmista.

### Colores de Estado

| Estado | Color | Uso |
|--------|-------|-----|
| Público | `#059669` (verde) | Features publicables |
| En revisión | `#D97706` (ámbar) | Features en revisión controlada |
| Sensible | `#DC2626` (rojo) | Features NO publicables |
| Documentación | `#6B7280` (gris) | Archivos de referencia |

### Colores de la Interfaz

| Elemento | Color | Nota |
|----------|-------|------|
| Fondo principal | `#F9FAFB` | Gris muy claro |
| Fondo panel | `#FFFFFF` | Blanco |
| Texto principal | `#111827` | Casi negro |
| Texto secundario | `#6B7280` | Gris medio |
| Borde | `#E5E7EB` | Gris claro |
| Acento | `#7C3AED` | Violeta (identidad del proyecto) |
| Acento hover | `#6D28D9` | Violeta oscuro |

## Tipografía

| Uso | Fuente | Tamaño | Peso |
|-----|--------|--------|------|
| Títulos | Inter / System | 18-24px | 600-700 |
| Cuerpo | Inter / System | 14-16px | 400 |
| Etiquetas mapa | Inter / System | 11-13px | 500 |
| Datos numéricos | Monospace / Tabular | 14px | 400 |

## Iconografía

Los íconos del proyecto usan **Lucide React** para consistencia:

| Concepto | Ícono Sugerido | Nota |
|----------|---------------|------|
| Zona de prioridad | `AlertTriangle` | Sin connotación de "peligro" |
| Nodo documental | `FileText` | Evidencia/documento |
| Nodo de orientación | `Compass` | Recurso de orientación |
| Conector | `GitBranch` | Conexión entre zonas |
| Recurso de apoyo | `Heart` / `Shield` | Capa positiva |
| Formulario | `MessageCircle` | Participación comunitaria |

## Mapa Base

| Propiedad | Valor |
|-----------|-------|
| Estilo | CARTO Positron (Light) |
| Razón | Neutral, no distrae de los datos |
| Alternativa dark | CARTO Dark Matter |
| Idioma | Español cuando disponible |

## Evaluación Visual

| Criterio | Estado | Comentario |
|----------|--------|-----------|
| Consistencia de colores | ✅ | Paleta definida en colorScales.ts |
| Contraste WCAG AA | ⚠️ Pendiente | Requiere verificación con herramienta |
| Jerarquía visual | ⚠️ Parcial | Capas necesitan mejor diferenciación z-index |
| Estados interactivos | ⚠️ Parcial | Hover/focus/active necesitan trabajo |
| Animaciones | ✅ | Respeta prefers-reduced-motion |
| Densidad de información | ⚠️ | Popups pueden estar sobrecargados |

## Anti-patrones Visuales a Evitar

> [!CAUTION]
> Estos patrones visuales están **prohibidos** en el proyecto:

1. ❌ **Semáforos rojo-amarillo-verde** — Reproduce marcos punitivos
2. ❌ **Mapas de calor tipo "crimen"** — Estigmatiza zonas
3. ❌ **Pins rojos de "peligro"** — Alarmismo sin contexto
4. ❌ **Gradientes dramáticos** — Sensacionalismo visual
5. ❌ **Fotos de víctimas** — Revictimización
6. ❌ **Contadores tipo "score de seguridad"** — Reduce la complejidad a un número

---

*Guía visual para el equipo de desarrollo. Consultar con el equipo de diseño para validación final.*
