# Reporte del Motor de Codificación Visual (V3)
**Proyecto: Mapa Vivo UACh–Texcoco**
**Fecha:** 2026-06-11
**Estado:** Activo y Verificado

Este documento describe la arquitectura y reglas del **Motor de Codificación Visual** (`visualEncodingEngine.ts`) diseñado para precomputar las propiedades estéticas y de privacidad de los datos territoriales antes de ser renderizados en el mapa interactivo de MapLibre GL.

---

## 1. Objetivos del Motor de Codificación

1. **Precomputación en Memoria (Performance):** Evitar expresiones complejas y cálculos lógicos de categorización en runtime dentro del renderizador de MapLibre GL.
2. **Consistencia Estética (Zero-Cyan Default):** Aplicar la paleta de colores de V3 inspirada en la UACh (Obsidian, deepCanopy, chapingoGold, agriGreen, leafSoft, magentaCare, coralAlert, orangeRoute, amberAttention).
3. **Privacidad Automatizada (Filtro Safe-Public):** Sanitizar descripciones, omitir coordenadas exactas de puntos sensibles (baños, residencias, dormitorios, casas, puntos de apoyo informal) y testimonios crudos en el **Modo Público Seguro**, permitiendo su visualización agregada y completa únicamente en el **Modo de Investigación Académica**.

---

## 2. Clasificación Visual de Elementos

El motor procesa tres tipos de geometrías espaciales:

### A. Nodos (Puntos)
Los puntos representan señales territoriales y se agrupan en las siguientes clases:

| Categoría Semántica | Clase Visual | Color Hex | Radio (px) | Halo (px) | Orden / Sort Key |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Orientación / Referencia** | Puntos de Orientación | `#F4F7FB` (Soft White) | 5 | 2 | 2 |
| **Documental** | Nodos Documentales | `#F43F9D` (Magenta Care) | 8 | 4 | 10 |
| **Cualitativo / Percepción** | Cualitativo | `#FBBF24` (Amber Attention) | 6 | 2 | 5 |
| **Memoria** | Memoria Colectiva | `#FF4D5E` (Coral Alert) | 8 | 4 | 9 |
| **Recurso / Apoyo** | Puntos de Apoyo | `#35D07F` (Agri Green) | 7 | 3 | 8 |
| **Infraestructura** | Infraestructura | `#FB923C` (Orange Route) | 6 | 2 | 5 |
| **Movilidad** | Movilidad / Acceso | `#D6A83A` (Chapingo Gold) | 6 | 2 | 5 |
| **Participación** | Aporte Local | `#7EE2A8` (Leaf Soft) | 6 | 2 | 5 |
| **Protegido / Privado** | Protegido | `#A855F7` (Violet Review) | 6 | 2 | 5 |

### B. Rutas (Líneas)
Las líneas comunican movilidad y corredores:

- **Corredor Regional DICIFO-Boyeros:** Color `#FF4D5E` (Coral Alert), ancho 6px. Clasificado como *Corredor Prioritario*.
- **Vías Regionales:** Color `#FB923C` (Orange Route), ancho 5px.
- **Rutas Peatonales / Campus:** Color `#D6A83A` (Chapingo Gold), ancho 3.5px.

### C. Zonas (Polígonos)
Representan polígonos de prioridad e indicadores:

- **Zona Boyeros (Caso Especial):** Obligatoriamente clasificada como *Prioridad Muy Alta* (evitando la clasificación errónea de "sin datos"). Color `#FF4D5E` (Coral Alert).
- **Prioridad Alta:** Color `#FB923C` (Orange Route).
- **Prioridad Media / Moderada:** Color `#FBBF24` (Amber Attention).
- **Prioridad Baja:** Color `#35D07F` (Agri Green).
- **Sin Datos / Protegido:** Color `#64748B` (Protected Gray).

---

## 3. Protocolo de Privacidad y Sanitización

Cuando el sistema opera en `public_safe` (Modo Público Seguro), se ejecutan de manera estricta las siguientes reglas:

1. **Omitir Nodos Sensibles:** Se filtran y remueven por completo del dataset los nodos del tipo Punto (Point) que corresponden a:
   - Baños y áreas sanitarias.
   - Residencias estudiantiles, dormitorios, cuartos, habitaciones y casas privadas.
   - Puntos de apoyo informal sensibles.
   - Coordenadas asociadas a testimonios de alta vulnerabilidad.
2. **Sanitizar Descripciones:** Cualquier texto explicativo es reemplazado por la frase estándar: *"Registro territorial de percepción y uso del espacio (sanitizado para resguardo de privacidad)."*
3. **Limpieza de Nombres Técnicos:** Nombres como `DOCUMENTARYNODES` o `nodos_orientacion_base` son reemplazados por sus contrapartes legibles en español, eliminando guiones bajos y aplicando capitalización adecuada.

En el **Modo Investigación Académica** (`academic_internal`), todas las geometrías y descripciones originales se conservan con fines de análisis espacial profundo por parte de investigadores autorizados.
