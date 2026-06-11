# Revisión de Diseño e Interfaz

## 1. Atmósfera y Fondo
- **Falta:** La instrucción requiere un `app-shell::before` con gradientes radiales para generar la "sala de control cartográfica nocturna" con viñetas suaves.

## 2. Nodos y Geometrías
- **Zonas:** Actualmente son polígonos simples. Necesitan un `HaloLayer` o tratamiento para que tengan bordes más luminosos e internamente texturas sutiles si hay evidencia.
- **Conectores:** Necesitan estilos de línea punteada/translúcida clara y etiquetas éticas.

## 3. Paneles de UI (Glassmorphism)
- **GlassPanel:** Ya implementado, pero requiere variaciones: `panel-glass-strong`, `panel-glass-soft`, `panel-danger-ethic`.
- **Panel Izquierdo:** Debe dividirse con subtítulos limpios, contadores de "elementos sensibles ocultos" y un diseño menos apretado.
- **Panel Derecho:** Debe ser completamente condicional (`empty`, `zone`, `node`) con tarjetas internas.

## 4. Modal de Participación
- **Falta:** El rediseño hacia una experiencia por tarjetas (opciones de botones grandes) con navegación real apoyada en Zod para el estado local.

## 5. Responsividad
- En dispositivos pequeños `< 768px`, la barra inferior es muy grande y los paneles fijos ocultan el mapa. Necesitamos convertirlos en "Bottom Sheets" o "Drawers".

## 6. Accesibilidad
- Faltan `aria-labels` en botones de iconos.
- Control de foco (`tabIndex`).
- Respetar `prefers-reduced-motion` reduciendo las animaciones `pulse`.
