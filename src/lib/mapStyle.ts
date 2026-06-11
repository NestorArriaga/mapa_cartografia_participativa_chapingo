export const DARK_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: 'Mapa Vivo Dark',
  sources: {
    // Si tuviéramos un servidor de tiles (ej. un mbtiles local o mapbox/maptiler):
    // 'basemap': { type: 'vector', url: '...' }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#05070D'
      }
    }
    // En un entorno real, agregaríamos capas base de tierra, agua, calles, etc.
    // Al ser un prototipo y no depender de un token comercial,
    // usamos un fondo oscuro sólido o si se proveen tiles vectoriales locales, se cargarían aquí.
  ]
};
