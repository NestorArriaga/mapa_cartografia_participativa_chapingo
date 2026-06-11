# Mapa Vivo UACh–Texcoco

**Cartografía participativa ecofeminista de movilidad, cuidado y alerta**

Esta es una plataforma web interactiva y altamente estética diseñada para visualizar zonas de movilidad y recabar testimonios sobre condiciones de cuidado y alerta, salvaguardando en todo momento la privacidad y la ética de los datos.

## 🚀 Cómo empezar

### Requisitos
- Node.js (v18 o superior)
- npm o yarn

### Instalación

1. Instala las dependencias del proyecto:
   \`\`\`bash
   npm install
   \`\`\`

2. Prepara los datos. Este proyecto cuenta con un script que escanea la base de datos de origen y copia *únicamente* la información segura y pública.
   \`\`\`bash
   npm run build:data
   # o alternativamente:
   npx tsx scripts/scan-v06-package.ts
   \`\`\`
   
3. Inicia el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

### Carpeta de Datos Originales
El script de datos asume que el paquete original (versión 06) se encuentra en:
\`/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/chapingo_web_v06_final_nodos_integrados_20260610_123131\`

## 🛡 Principios Éticos y de Privacidad
- **Separación Estricta:** La carpeta \`05_no_publicar_sensible\` NUNCA se copia al directorio público.
- **Datos Agregados:** Los nodos se muestran como representaciones agregadas con radios amplios, no como ubicaciones exactas.
- **Filtro de Contenido:** El formulario participativo incluye un filtro proactivo que alerta si detecta información sensible (nombres, teléfonos, etc.).

## 🏗 Arquitectura
- **React + Vite** para el núcleo del frontend.
- **MapLibre GL JS + deck.gl** para visualizaciones geoespaciales de alto rendimiento.
- **Tailwind CSS + Glassmorphism** para un diseño inmersivo, técnico y nocturno.
- **Zustand** para la gestión de estados (mapa, ui, formularios).
