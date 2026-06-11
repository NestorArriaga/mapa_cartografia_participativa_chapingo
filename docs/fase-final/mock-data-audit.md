# Auditoría de Datos Mock y Hardcodeados

Generado: 2026-06-11T20:46:08.009Z

Esta auditoría busca términos como mock, dummy, fake, lorem, sample, placeholder, hardcoded, TODO data, ejemplo para asegurar que la aplicación utilice datos reales del paquete v06 en lugar de placeholders.

## Resultados

Se encontraron 11 coincidencias sospechosas.



### /src/components/form/ParticipatoryForm.tsx:146 (Match: "placeholder")
```typescript
className="w-full h-32 bg-black/40 border border-white/10 focus:border-[#F43F9D] rounded-xl p-3 text-sm text-white resize-none outline-none transition-colors placeholder:text-[#64748B] font-ui"
```

### /src/components/form/ParticipatoryForm.tsx:147 (Match: "placeholder")
```typescript
placeholder="Describe la situación. Por seguridad, no incluyas nombres propios, direcciones exactas ni información que te identifique."
```

### /src/components/forms/ParticipatoryForm.tsx:51 (Match: "placeholder")
```typescript
className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#F43F9D] focus:ring-1 focus:ring-[#F43F9D] min-h-[120px] font-['Inter']"
```

### /src/components/forms/ParticipatoryForm.tsx:52 (Match: "placeholder")
```typescript
placeholder="Ej: Frecuentemente esta vía carece de iluminación después de las 20:00hrs..."
```

### /src/components/map/EnhancedMapExperience.tsx:227 (Match: "mock")
```typescript
// To bypass window binding, we can mock lookups or bind in renderer.
```

### /src/components/map/StableMapLibreRenderer.tsx:70 (Match: "mock")
```typescript
console.warn("WebGL not supported. Fallback mock map activated.");
```

### /src/components/search/SmartSearch.tsx:9 (Match: "mock")
```typescript
// Simple mock logic for UI, real implementation would index layer data
```

### /src/components/search/SmartSearch.tsx:22 (Match: "placeholder")
```typescript
placeholder="Buscar zona, nodo o categoría…"
```

### /src/components/search/SmartSearch.tsx:23 (Match: "placeholder")
```typescript
className="w-full bg-[rgba(15,23,42,0.6)] border border-white/10 rounded-full py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-textMuted focus:outline-none focus:border-mapCyan/50 focus:ring-1 focus:ring-mapCyan/50 transition-all"
```

### /src/lib/signals/TerritorialPriorityEngine.ts:33 (Match: "sample")
```typescript
sampleSize?: number;
```

### /src/lib/signals/TerritorialPriorityEngine.ts:90 (Match: "sample")
```typescript
sampleSize: undefined,
```

