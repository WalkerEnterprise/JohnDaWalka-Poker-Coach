# Extended Source Detection & Startup Scan – Change Report

## Summary

Added first-launch startup scan modal and broadened auto-detection to cover
major poker clients and tracking software. Users can review detected paths
before saving, manage sources from a dedicated settings panel, and manually
add paths via a directory browser.

## Supported Poker Sources

| ID                       | Name                            | Category | Source Type        |
|--------------------------|---------------------------------|----------|--------------------|
| acr-hand-histories       | ACR / WPN Hand Histories        | client   | hand-history       |
| acr-tournament-summaries | ACR / WPN Tournament Summaries  | client   | tournament-summary |
| coinpoker                | CoinPoker                       | client   | hand-history       |
| drivehud2-database       | DriveHUD 2 Database             | tracker  | database           |
| drivehud2-processed      | DriveHUD 2 Processed Data       | tracker  | processed-data     |
| hand2note                | Hand2Note                       | tracker  | database           |
| holdem-manager-3         | Holdem Manager 3                | tracker  | database           |
| pokertracker-4           | PokerTracker 4                  | tracker  | database           |

## Changed / Added Files

### New Files

| File | Purpose |
|------|---------|
| `src/services/pokerSourceRegistry.js` | Registry of all known poker sources with path templates and file patterns |
| `src/services/driveScanner.js` | Drive scanning service (filesystem check, localStorage persistence, abort support) |
| `src/store/modules/sourceDetection.js` | Vuex module for scan state, pending results, and saved sources |
| `src/components/StartupScanModal.vue` | First-launch modal: welcome → scan → review → save |
| `src/components/SourceSettings.vue` | Persistent settings panel for managing saved sources |
| `tests/unit/services/pokerSourceRegistry.spec.js` | Tests for the source registry |
| `tests/unit/services/driveScanner.spec.js` | Tests for the drive scanner service |
| `tests/unit/store/sourceDetection.spec.js` | Tests for the Vuex source detection module |
| `tests/unit/StartupScanModal.spec.js` | Tests for the startup scan modal component |
| `tests/unit/SourceSettings.spec.js` | Tests for the source settings component |
| `CHANGES_REPORT.md` | This file |

### Modified Files

| File | Change |
|------|--------|
| `src/store/index.js` | Added `sourceDetection` Vuex module import and registration |
| `src/App.vue` | Integrated `StartupScanModal`, `SourceSettings`, tab navigation, and `initSourceDetection` dispatch |

## Rebuild Instructions

```bash
# Install dependencies (if not already done)
npm install

# Run the development server
npm run serve

# Run tests
npm test
```

## Architecture Notes

- **No destructive actions**: The scanner is read-only. Users review detected paths in a
  checkbox list before anything is persisted.
- **localStorage persistence**: Saved sources and first-launch flag use `localStorage` so
  the scan modal only appears once per browser profile.
- **Electron-ready**: The scanner checks for `window.__electronFs` and
  `window.__electronDialog` bridges. In pure browser mode, directory existence checks
  return false and users rely on the manual browse flow (File System Access API).
- **Abort support**: Long scans can be cancelled via `AbortController`.
- **Namespaced Vuex module**: All source detection state lives under `sourceDetection/`
  to avoid collisions with existing store state.
