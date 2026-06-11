# Real browser failure

## URL

http://localhost:5173/

## Screenshot

Pending — user reports blank white screen.

## Browser console errors

TypeScript build errors prevented Vite from serving valid JS bundle:

```
src/components/panels/LeftControlPanel.tsx(175,9): error TS6133: 'handleSelectZone' is declared but its value is never read.
src/components/panels/LeftControlPanel.tsx(176,24): error TS2554: Expected 1 arguments, but got 2.
```

These errors caused `tsc -b` to fail with exit code 2. The `npm run build` command (`tsc -b && vite build`) never reached the Vite build step, so the JS bundle in `dist/` was stale or never generated.

In dev mode (`npm run dev`), Vite compiles on-the-fly via esbuild, but when `tsconfig.json` has `"strict": true` and the project uses `tsc -b` as the build command, the mismatch between esbuild's leniency and tsc's strictness can cause the dev overlay to show a compile error — or worse, esbuild may emit broken code that crashes React on mount.

## Terminal errors

```
src/components/panels/LeftControlPanel.tsx(175,9): error TS6133
src/components/panels/LeftControlPanel.tsx(176,24): error TS2554: Expected 1 arguments, but got 2.
```

## Root element status

- `#root` exists in index.html
- React never mounts because the JS bundle either fails to compile or crashes on import
- Result: `#root` has zero children → white screen

## Suspected cause

A duplicate `handleSelectZone` function was introduced in `LeftControlPanel.tsx` during the V5 panel refactor. It called `onSelectZone(name, priority)` with 2 arguments, but the interface declares `onSelectZone: (zoneName: string) => void` (1 argument). This caused:

1. `tsc -b` to fail → no production build
2. Vite dev server to show a compile error overlay or crash React mount

Additionally, the previous "fix" used `sed` to batch-remove unused variables, which corrupted several import lines (e.g., `import React` became `import,` in MapErrorBoundary). These were partially fixed but the duplicate function remained.

## Fix applied

1. Removed duplicate `handleSelectZone` from LeftControlPanel.tsx
2. Build now passes cleanly: `tsc -b && vite build` succeeds
3. Creating safe mode fallback app for resilience
4. Creating proper error boundaries
5. Creating visibility E2E tests
