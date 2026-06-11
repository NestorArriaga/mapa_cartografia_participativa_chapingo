# Baseline Current Working Version

**Date:** 2026-06-11
**Target:** Final Academic Demo Lockdown

## Status
* **current app renders satellite:** true
* **zones visible:** true
* **nodes visible:** true
* **routes visible:** true
* **panels visible:** true

## Current Limitations
- UI panels still retain some generic/blue styles that need to be completely removed.
- Buttons lack comprehensive functional wiring to a centralized action registry.
- Advanced charts (Signal Breakdown, Theme Frequency, etc.) are currently missing.
- Priority and Recommendation logic (especially for Boyeros) needs hardcoded "Validación cualitativa" validation to ensure it never shows as "sin datos".
- Popups lack the requested custom HTML `RichMapPopup` design and still rely on default MapLibre styling or basic tooltips.
