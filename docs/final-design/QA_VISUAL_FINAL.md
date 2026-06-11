# Control de Calidad Visual (QA Visual)

Este reporte confirma que la nueva identidad visual y cartográfica cumple íntegramente con los requisitos premium de la demo académica, eliminando el azul genérico del diseño base y reemplazándolo por la paleta Chapingo-Ecofeminista.

| Elemento | Estado | Observación |
| :--- | :---: | :--- |
| **Paleta sin azul dominante** | ✅ Cumplido | El diseño se cimenta sobre `deepCanopy` (verde oliva profundo), `chapingoGold` (dorado) y `magentaCare` (cuidado). El azul cian queda relegado a un acento menor de datos secundarios. |
| **Tipografía nueva** | ✅ Cumplido | Los títulos usan `Space Grotesk`/`Sora`, el cuerpo de la UI usa `Inter` y las métricas cartográficas y técnicas usan `JetBrains Mono`. |
| **Nodos coloridos y visibles** | ✅ Cumplido | Los nodos están clasificados por colores según su categoría (orientación: blanco suave, documental: magenta, recurso: verde, etc.) con halos dinámicos. |
| **Zonas con halo** | ✅ Cumplido | Las zonas de prioridad cuentan con relleno coloreado por su nivel de riesgo y un reborde destacado que respira (halo dinámico). |
| **Rutas internas visibles** | ✅ Cumplido | Conexiones de proximidad inter-nodos menores a 250 m dibujadas en color verde/dorado medio. |
| **Trayectos territoriales visibles** | ✅ Cumplido | Los 4 trayectos regionales clave dibujados con trazo grueso destacado en color dorado/coral. |
| **Herramientas colaboración visibles** | ✅ Cumplido | La barra superior (`ContributionToolbar`) despliega herramientas para situar puntos, trazar rutas, marcar zonas y calcular trayectos. |
| **Panel derecho con datos** | ✅ Cumplido | El panel se divide en 5 pestañas completas y se conecta con el store de selección, eliminando leyendas de error o datos ausentes. |
| **Recomendaciones visibles** | ✅ Cumplido | Muestra un mínimo de 2 recomendaciones de cuidado colectivas por elemento con sus respectivos límites éticos de exposición. |
| **Retroalimentación recalcula métricas** | ✅ Cumplido | Al añadir aportaciones, se recalcula reactivamente el indicador de prioridad local de la zona y se persiste en `localStorage`. |
| **Exportación funciona** | ✅ Cumplido | Los controles permiten descargar capturas PNG del mapa, fichas académicas Markdown y archivos JSON de aportaciones. |
