/**
 * Drive scanner service.
 *
 * In a real Electron / Node-based desktop app this would use `fs` and `path`
 * to walk the filesystem. In the browser-only Vue prototype, it simulates
 * detection through the File System Access API (where available) or falls
 * back to a manual directory-picker flow so users can point to folders.
 *
 * The public API is framework-agnostic: consumers receive Promises that
 * resolve to ScanResult objects regardless of the underlying mechanism.
 */

import { getAllSources, expandSearchPaths } from './pokerSourceRegistry';

// ── Types (JSDoc only – no TS in this repo) ──────────────────────

/**
 * @typedef {Object} DetectedSource
 * @property {string}   sourceId      – matches a registry entry id
 * @property {string}   name          – human-readable label
 * @property {string}   category      – 'client' | 'tracker'
 * @property {string}   path          – absolute path that was found
 * @property {string}   sourceType    – e.g. 'hand-history', 'database'
 * @property {string[]} matchedFiles  – sample filenames found at the path
 * @property {boolean}  selected      – user has ticked this for import
 */

/**
 * @typedef {Object} ScanProgress
 * @property {number} checked   – paths inspected so far
 * @property {number} total     – total paths to inspect
 * @property {string} current   – path being inspected right now
 * @property {DetectedSource[]} found – sources found so far
 */

/**
 * @typedef {Object} ScanResult
 * @property {DetectedSource[]} detected – all sources found
 * @property {string[]}          drives   – drives that were scanned
 * @property {number}            elapsed  – wall-clock ms
 * @property {boolean}           complete – true if scan was not cancelled
 */

// ── Helpers ──────────────────────────────────────────────────────

const DEFAULT_DRIVES = ['C:', 'D:'];
const STORAGE_KEY = 'poker-coach-first-launch-done';
const SAVED_SOURCES_KEY = 'poker-coach-saved-sources';

/**
 * Returns true the very first time the app is opened (per browser profile).
 */
export function isFirstLaunch() {
  return !localStorage.getItem(STORAGE_KEY);
}

/**
 * Marks the first-launch flow as completed so the modal won't reappear.
 */
export function markFirstLaunchDone() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

/**
 * Persists user-confirmed sources to localStorage.
 */
export function saveDetectedSources(sources) {
  localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(sources));
}

/**
 * Loads previously saved sources (empty array if none).
 */
export function loadSavedSources() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_SOURCES_KEY)) || [];
  } catch {
    return [];
  }
}

// ── Core scanning logic ──────────────────────────────────────────

/**
 * Checks whether a directory exists using the File System Access API.
 * Falls back to always returning false when the API is unavailable
 * (the user will need to browse manually).
 */
async function directoryExists(path) {
  if (typeof window !== 'undefined' && window.__electronFs) {
    try {
      const stat = await window.__electronFs.stat(path);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Lists files in a directory (Electron bridge only).
 */
async function listFiles(dirPath, patterns) {
  if (typeof window !== 'undefined' && window.__electronFs) {
    try {
      const entries = await window.__electronFs.readdir(dirPath);
      if (!patterns || patterns.length === 0) return entries;
      return entries.filter((name) => {
        return patterns.some((pat) => {
          const ext = pat.replace('*', '');
          return name.endsWith(ext);
        });
      });
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Perform a full drive scan for all registered poker sources.
 *
 * @param {Object}   options
 * @param {string[]} [options.drives]         – drive letters to scan (default C:, D:)
 * @param {string}   [options.username]       – OS username for path expansion
 * @param {string}   [options.homedir]        – home directory for path expansion
 * @param {Function} [options.onProgress]     – callback(ScanProgress)
 * @param {AbortSignal} [options.signal]      – allows cancellation
 * @returns {Promise<ScanResult>}
 */
export async function scanForSources({
  drives = DEFAULT_DRIVES,
  username = '',
  homedir = '',
  onProgress = null,
  signal = null,
} = {}) {
  const start = Date.now();
  const sources = getAllSources();
  const detected = [];

  // Build the full list of (source, expandedPath) pairs to check
  const checks = [];
  for (const source of sources) {
    const paths = expandSearchPaths(source, { drives, username, homedir });
    for (const p of paths) {
      checks.push({ source, path: p });
    }
  }

  for (let i = 0; i < checks.length; i++) {
    if (signal && signal.aborted) {
      return { detected, drives, elapsed: Date.now() - start, complete: false };
    }

    const { source, path } = checks[i];

    if (onProgress) {
      onProgress({
        checked: i,
        total: checks.length,
        current: path,
        found: [...detected],
      });
    }

    const exists = await directoryExists(path);
    if (exists) {
      const files = await listFiles(path, source.filePatterns);
      detected.push({
        sourceId: source.id,
        name: source.name,
        category: source.category,
        path,
        sourceType: source.sourceType,
        matchedFiles: files.slice(0, 10),
        selected: true,
      });
    }
  }

  if (onProgress) {
    onProgress({
      checked: checks.length,
      total: checks.length,
      current: '',
      found: [...detected],
    });
  }

  return { detected, drives, elapsed: Date.now() - start, complete: true };
}

/**
 * Opens a native directory picker and returns the selected path.
 * Works with the File System Access API or Electron dialog bridge.
 */
export async function browseForDirectory() {
  // Electron bridge
  if (typeof window !== 'undefined' && window.__electronDialog) {
    const result = await window.__electronDialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  }

  // Browser File System Access API
  if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
    try {
      const handle = await window.showDirectoryPicker();
      return handle.name;
    } catch {
      return null;
    }
  }

  return null;
}
