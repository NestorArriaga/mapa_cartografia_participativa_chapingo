#!/bin/bash
set -e

echo "=== QA ULTIMATE: PHASE 3 FINAL ==="

echo "1. Sanitize Data..."
tsx scripts/sanitize-v06-public-data.ts

echo "2. Mobility Optimization..."
tsx scripts/create-lightweight-mobility-layer.ts

echo "3. Mock Audit..."
tsx scripts/audit-mock-data.ts

echo "4. Ethics Gate..."
tsx scripts/final-ethics-gate.ts

echo "5. Technical Gate..."
tsx scripts/final-technical-gate.ts

echo "6. Running Tests..."
npm run test -- --run

echo "7. Typechecking..."
npm run typecheck

echo "8. Building Product..."
npm run build

echo "=== QA ULTIMATE PASSED ==="
