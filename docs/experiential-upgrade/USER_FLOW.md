# Flujo de Usuario - Observatorio Vivo UACh-Texcoco

Este manual narra la interacción esperada de un(a) usuario(a) dentro del nuevo ecosistema.

## 1. Llegada e Inmersión
- **Tour Guiado:** Al entrar, el usuario puede dar click en `Tour Guiado` en la parte superior. La cámara volará suavemente (`transitionDuration: 2000`) por los elementos más importantes del Campus, habilitando capas automáticamente y explicando con paneles glassmorphism qué es cada elemento.
- **Panel de Control:** En el panel izquierdo, el usuario verá las métricas en tiempo real. Abajo, puede cambiar el mapa base (recomendado: Satélite para ver el territorio) y habilitar libremente capas agrupadas (Territorio, Constelación, Movilidad).

## 2. Exploración de Datos
- **Interacción con Nodos:** Al pasar el ratón (`hover`) sobre un nodo que late, su centro se expande.
- **Detalle de Nodo:** Al hacer click, el panel derecho (`RightDetailPanel`) se abre con un slide lateral. Aquí el usuario puede navegar entre:
  - *Resumen* y Notas Éticas.
  - *Evidencia* y testimonios encriptados.
  - *Cuidado*, donde las recomendaciones comunitarias aparecen destacadas en verde.
- **Acciones Rápidas:** Dentro de la pestaña Acciones, el usuario puede copiar el texto del resumen o descargar una ficha completa (`.txt`).

## 3. Aportación Participativa
- **Aportar sobre un Nodo:** Dentro de las acciones del nodo, puede hacer click en `Aportar testimonio` para agregar información ligada a esa ubicación.
- **Barra de Herramientas:** En la esquina inferior derecha, se encuentra el lápiz.
  - *Agregar Punto:* El cursor cambia a cruz. Al hacer click, se abre el formulario pre-rellenando las coordenadas.
  - *Marcar Zona / Dibujar Ruta:* Al hacer varios clicks, se dibuja temporalmente la ruta/polígono en color dorado (Chapingo Gold). Al hacer doble click, el dibujo finaliza y se transfiere la geometría al formulario.
- **Reporte Rápido (Menú Radial):** Si se selecciona el botón del rayo, cualquier click en el mapa abrirá un menú circular. Al escoger una opción (ej: Iluminación o Alerta), se abre el formulario pre-configurado para ese tipo de amenaza o mejora.

## 4. Exportación General
- **Consola Inferior:** Usando el botón `Exportar` en el panel inferior, el usuario puede descargar una captura en PNG de la vista actual del mapa (útil para reportes externos) o guardar la configuración de capas en formato JSON.
