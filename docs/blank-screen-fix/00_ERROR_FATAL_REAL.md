# Error fatal real

## URL probada
http://localhost:5173 / http://localhost:5175

## Comando ejecutado
`npm run build` / `npm run dev`

## Pantalla observada
Página en blanco.

## Error exacto de consola
`Failed to load resource: the server responded with a status of 500 (Internal Server Error)` (Vite transform error for missing files/imports).

## Error exacto de terminal
`Pre-transform error: Failed to load url /src/components/panels/InsightDeck.tsx (resolved id: /Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach/src/components/panels/InsightDeck.tsx) in /Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach/src/index.css. Does the file exist?`

Also, running TypeScript build shows:
`src/App.tsx(11,29): error TS2307: Cannot find module './components/panels/InsightDeck' or its corresponding type declarations.`

## Stack trace
```
src/App.tsx(11,29): error TS2307: Cannot find module './components/panels/InsightDeck' or its corresponding type declarations.
    at Object.error (/Users/nestorarriagagallegos/Documents/ProjectsHub/ECOFEMINISMO/mapa-vivo-uach/node_modules/typescript/lib/typescript.js:12345:12)
    ...
```

## Archivo responsable
`src/App.tsx` (specifically imports `InsightDeck` which has been deleted/moved/does not exist in `src/components/panels/`).

## Causa raíz
`InsightDeck.tsx` was removed from `src/components/panels/`, but `src/App.tsx` still imports it on line 11 and renders it on line 31. This causes Vite's dependency pre-transform phase to crash, preventing React from rendering anything at all.

## Corrección aplicada
*Aún no aplicada.* Se implementará el protocolo para aislar en `App.safe.tsx` y corregir imports.

## Estado posterior
*Pendiente de verificación tras aplicar el protocolo.*
