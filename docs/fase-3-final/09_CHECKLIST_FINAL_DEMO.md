# 09 — Checklist Final para Demo

> Proyecto: **Mapa Vivo UACh-Texcoco** — Fase 3
> Fecha: 2026-06-10

---

## Pre-Demo: Verificaciones Técnicas

### Datos
- [ ] Ejecutar `npm run qa:final` — todos los scripts pasan
- [ ] Verificar que `public/data/` NO contiene archivos de `05_no_publicar_sensible`
- [ ] Confirmar que `evidencia_documental_agregada_por_zona_v06.geojson` filtra features sensibles
- [ ] Confirmar que `vias_contexto_movilidad_v06.geojson` NO se carga automáticamente
- [ ] Verificar que `layer-stats.generated.json` tiene datos actualizados

### Build
- [ ] Ejecutar `npm run typecheck` — sin errores
- [ ] Ejecutar `npm run build` — build exitoso
- [ ] Verificar tamaño del bundle (< 500 KB gzip sin datos)
- [ ] Ejecutar `npm run preview` — verificar en producción local

### Mapa
- [ ] El mapa carga centrado en UACh-Texcoco
- [ ] Las zonas de prioridad se renderizan con colores correctos
- [ ] Los nodos documentales aparecen como puntos
- [ ] Los nodos de orientación aparecen como puntos
- [ ] Los conectores aparecen como líneas
- [ ] Hacer zoom in/out funciona fluidamente
- [ ] Click en feature muestra popup con datos formateados

### Privacidad y Ética
- [ ] Ningún popup muestra testimonios crudos
- [ ] Ningún popup muestra nombres de víctimas
- [ ] Ningún popup muestra ubicaciones exactas sensibles
- [ ] El lenguaje en la UI usa términos aprobados (copyGuard)
- [ ] Los features con `nivel_uso = "04_no_publicar_sensible"` NO se muestran
- [ ] No hay "focos rojos" ni semáforos de seguridad en el diseño

### Interfaz
- [ ] El panel lateral abre y cierra correctamente
- [ ] La leyenda de colores es visible
- [ ] Los formateadores muestran texto en español
- [ ] Los estados de carga son visibles (loading/error)
- [ ] Funciona en pantalla completa y en ventana

## Durante la Demo

### Narrativa Sugerida (5-7 minutos)

1. **Contexto** (1 min): "Este mapa nace de una investigación ecofeminista sobre las experiencias de movilidad y seguridad de las mujeres y disidencias en la UACh y su entorno."

2. **Vista general** (1 min): Mostrar el mapa con las zonas de prioridad. Explicar que los colores representan niveles de urgencia de validación, no "niveles de peligro".

3. **Evidencia documental** (1 min): Click en una zona para mostrar la evidencia documental agregada. Explicar que los datos provienen de encuestas, fuentes documentales, y reportes —nunca de un solo testimonio.

4. **Nodos de orientación** (1 min): Mostrar los recursos de apoyo como capas positivas. Explicar que el mapa no solo identifica problemas sino también recursos comunitarios.

5. **Protección de datos** (1 min): Explicar cómo el sistema filtra automáticamente contenido sensible. Mostrar que no hay puntos exactos de víctimas ni nombres.

6. **Formulario participativo** (1 min): Mostrar el formulario (si está implementado). Explicar la anonimidad y el consentimiento informado.

7. **Preguntas** (1 min): Abrir a preguntas del público.

### Preguntas Frecuentes Anticipadas

| Pregunta | Respuesta Sugerida |
|----------|-------------------|
| ¿Esto es un mapa de peligro? | No. Es una cartografía de cuidado que muestra percepciones y evidencias documentales para priorizar acciones. |
| ¿Pueden identificar a las víctimas? | No. Los datos son agregados por zona. No almacenamos puntos exactos ni datos personales. |
| ¿Esto sustituye denuncias formales? | No. El mapa es una herramienta de diagnóstico participativo, no un canal de denuncia. |
| ¿Qué pasa con los 4.3 GB de vías? | Requiere procesamiento adicional (tiling). Es un dato de contexto, no es esencial para la narrativa. |
| ¿Los datos son en tiempo real? | No. Son datos de investigación que se actualizan periódicamente tras validación. |

## Post-Demo: Acciones

- [ ] Documentar feedback recibido
- [ ] Crear issues en el repositorio para mejoras sugeridas
- [ ] Verificar que no se dejaron datos sensibles expuestos durante la demo
- [ ] Actualizar este checklist con lecciones aprendidas

---

## Contacto de Emergencia Técnica

Si durante la demo algo falla:

1. **Mapa no carga**: Verificar conexión, recargar con cache limpio
2. **Datos sensibles visibles**: Cerrar la aplicación inmediatamente
3. **Browser crash**: Probablemente cargó vias_contexto_movilidad — reiniciar y verificar config
4. **Build fails**: Usar `dist/` pre-generado como fallback

---

*Checklist preparado para la demostración del Mapa Vivo UACh-Texcoco, Fase 3.*
