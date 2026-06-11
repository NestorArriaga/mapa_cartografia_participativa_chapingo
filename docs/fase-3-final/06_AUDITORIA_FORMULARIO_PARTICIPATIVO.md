# 06 — Auditoría del Formulario Participativo

> Proyecto: **Mapa Vivo UACh-Texcoco** — Fase 3
> Fecha: 2026-06-10

---

## Propósito del Formulario

El formulario participativo permite a las personas de la comunidad universitaria (especialmente mujeres y disidencias) contribuir sus percepciones y experiencias de movilidad y seguridad en el campus y sus alrededores.

> [!IMPORTANT]
> El formulario NO es una denuncia ni un sistema de reportes policiales.
> Es una herramienta de cartografía participativa con enfoque de cuidado.

## Campos del Formulario

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| Zona general | Selector | ✅ | Opciones predefinidas |
| Hora del día | Selector | ✅ | mañana / tarde / noche |
| Tipo de percepción | Selector | ✅ | Categorías predefinidas |
| Descripción (opcional) | Textarea | ❌ | Max 500 caracteres |
| Frecuencia | Selector | ✅ | diario / semanal / ocasional |
| Consentimiento | Checkbox | ✅ | Debe aceptar |

## Campos que NO Debe Tener

> [!CAUTION]
> Los siguientes campos están **prohibidos** para proteger a las usuarias:

- ❌ Nombre real
- ❌ Matrícula o número de control
- ❌ Correo electrónico
- ❌ Teléfono
- ❌ Foto
- ❌ Ubicación GPS exacta
- ❌ Descripción de agresores
- ❌ Fecha exacta de incidente
- ❌ Nombre de víctimas o testigos

## Almacenamiento

| Aspecto | Implementación |
|---------|---------------|
| Backend | ❌ No hay backend — datos en localStorage |
| Persistencia | localStorage del navegador |
| Exportación | JSON descargable (solo para investigadoras) |
| Cifrado | No aplica (no hay datos personales) |

> [!NOTE]
> En una versión futura, se podría implementar un backend con cifrado E2E.
> Para la demo, localStorage es suficiente y no expone datos a servidores.

## Validación con Zod

```typescript
// Schema sugerido (a implementar en src/types/submissions.ts)
const submissionSchema = z.object({
  zona: z.string().min(1),
  hora_dia: z.enum(['mañana', 'tarde', 'noche']),
  tipo_percepcion: z.string().min(1),
  descripcion: z.string().max(500).optional(),
  frecuencia: z.enum(['diario', 'semanal', 'ocasional']),
  consentimiento: z.literal(true),
  timestamp: z.string().datetime(),
});
```

## Consentimiento Informado

El formulario DEBE mostrar el siguiente texto antes de permitir el envío:

> *"Al enviar esta percepción, contribuyes a la cartografía participativa de la comunidad UACh.
> Tus datos son anónimos, no se almacenan en ningún servidor, y se usan exclusivamente
> para visualizar percepciones agregadas. No es una denuncia y no sustituye canales
> institucionales de atención. Puedes borrar tus datos en cualquier momento."*

## Flujo del Formulario

```
1. Usuaria abre el panel lateral
2. Selecciona "Agregar percepción"
3. Selecciona zona en el mapa o en lista
4. Completa los campos obligatorios
5. Lee y acepta el consentimiento
6. Envía → Se guarda en localStorage
7. Se muestra confirmación con contador
8. El dato aparece (opcionalmente) como capa participativa
```

## Evaluación

| Criterio | Estado | Nota |
|----------|--------|------|
| Anonimato | ✅ Diseñado | Sin datos personales |
| Consentimiento | ⚠️ Pendiente | Texto definido, UI por implementar |
| Validación | ⚠️ Pendiente | Schema Zod definido |
| Almacenamiento | ⚠️ Pendiente | localStorage planned |
| Accesibilidad | ⚠️ Pendiente | Labels y aria attributes |
| Borrado de datos | ⚠️ Pendiente | Botón "borrar mis datos" |

---

*El formulario participativo es un componente central del enfoque ecofeminista del proyecto.
Su implementación debe priorizarse con las garantías éticas descritas.*
