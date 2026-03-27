/**
 * Vuex module for poker source detection and settings management.
 *
 * Manages the lifecycle of:
 *  1. First-launch scan modal visibility
 *  2. Active drive scans (progress, cancellation)
 *  3. Detected sources awaiting user review
 *  4. Saved/confirmed sources used by the import pipeline
 */

import {
  isFirstLaunch,
  markFirstLaunchDone,
  scanForSources,
  saveDetectedSources,
  loadSavedSources,
  browseForDirectory,
} from '../../services/driveScanner';
import { getAllSources, getSourceById } from '../../services/pokerSourceRegistry';

const state = () => ({
  // Modal visibility
  showStartupModal: false,

  // Scan state
  scanning: false,
  scanProgress: { checked: 0, total: 0, current: '', found: [] },
  scanAbortController: null,

  // Results awaiting user review (from a scan or manual add)
  pendingDetected: [],

  // Confirmed sources persisted to localStorage
  savedSources: [],

  // Registry reference (read-only, for UI listing)
  availableSources: getAllSources(),
});

const mutations = {
  SET_SHOW_STARTUP_MODAL(state, value) {
    state.showStartupModal = value;
  },
  SET_SCANNING(state, value) {
    state.scanning = value;
  },
  SET_SCAN_PROGRESS(state, progress) {
    state.scanProgress = progress;
  },
  SET_SCAN_ABORT_CONTROLLER(state, controller) {
    state.scanAbortController = controller;
  },
  SET_PENDING_DETECTED(state, sources) {
    state.pendingDetected = sources;
  },
  TOGGLE_PENDING_SOURCE(state, index) {
    if (state.pendingDetected[index]) {
      state.pendingDetected[index].selected = !state.pendingDetected[index].selected;
    }
  },
  SET_SAVED_SOURCES(state, sources) {
    state.savedSources = sources;
  },
  ADD_SAVED_SOURCE(state, source) {
    const exists = state.savedSources.find(
      (s) => s.sourceId === source.sourceId && s.path === source.path,
    );
    if (!exists) {
      state.savedSources.push(source);
    }
  },
  REMOVE_SAVED_SOURCE(state, index) {
    state.savedSources.splice(index, 1);
  },
  UPDATE_SAVED_SOURCE_PATH(state, { index, path }) {
    if (state.savedSources[index]) {
      state.savedSources[index].path = path;
    }
  },
};

const actions = {
  /**
   * Called once on app startup – shows the modal if this is the first launch.
   */
  initSourceDetection({ commit }) {
    const saved = loadSavedSources();
    commit('SET_SAVED_SOURCES', saved);

    if (isFirstLaunch()) {
      commit('SET_SHOW_STARTUP_MODAL', true);
    }
  },

  /**
   * Triggers a full filesystem scan for poker sources.
   */
  async startScan({ commit, state }, { drives, username, homedir } = {}) {
    if (state.scanning) return;

    const controller = new AbortController();
    commit('SET_SCAN_ABORT_CONTROLLER', controller);
    commit('SET_SCANNING', true);
    commit('SET_PENDING_DETECTED', []);

    try {
      const result = await scanForSources({
        drives,
        username,
        homedir,
        signal: controller.signal,
        onProgress(progress) {
          commit('SET_SCAN_PROGRESS', { ...progress });
        },
      });

      commit('SET_PENDING_DETECTED', result.detected);
    } finally {
      commit('SET_SCANNING', false);
      commit('SET_SCAN_ABORT_CONTROLLER', null);
    }
  },

  /**
   * Cancels a running scan.
   */
  cancelScan({ state, commit }) {
    if (state.scanAbortController) {
      state.scanAbortController.abort();
    }
    commit('SET_SCANNING', false);
  },

  /**
   * User confirms the currently pending detected sources.
   * Only sources with `selected === true` are saved.
   */
  confirmDetectedSources({ commit, state }) {
    const toSave = state.pendingDetected.filter((s) => s.selected);
    const merged = [...state.savedSources];

    for (const src of toSave) {
      const duplicate = merged.find(
        (s) => s.sourceId === src.sourceId && s.path === src.path,
      );
      if (!duplicate) {
        merged.push({ ...src });
      }
    }

    commit('SET_SAVED_SOURCES', merged);
    saveDetectedSources(merged);
    commit('SET_PENDING_DETECTED', []);
  },

  /**
   * Dismisses the startup modal and marks first launch as complete.
   */
  dismissStartupModal({ commit }) {
    commit('SET_SHOW_STARTUP_MODAL', false);
    markFirstLaunchDone();
  },

  /**
   * Manually add a source path via the directory picker.
   */
  async addSourceManually({ commit, state }, sourceId) {
    const path = await browseForDirectory();
    if (!path) return;

    const def = getSourceById(sourceId);
    if (!def) return;

    const newSource = {
      sourceId: def.id,
      name: def.name,
      category: def.category,
      path,
      sourceType: def.sourceType,
      matchedFiles: [],
      selected: true,
    };

    commit('ADD_SAVED_SOURCE', newSource);
    saveDetectedSources(state.savedSources);
  },

  /**
   * Remove a saved source by index.
   */
  removeSavedSource({ commit, state }, index) {
    commit('REMOVE_SAVED_SOURCE', index);
    saveDetectedSources(state.savedSources);
  },

  /**
   * Update the path of a saved source (e.g. user re-browses).
   */
  async updateSourcePath({ commit, state }, index) {
    const path = await browseForDirectory();
    if (!path) return;

    commit('UPDATE_SAVED_SOURCE_PATH', { index, path });
    saveDetectedSources(state.savedSources);
  },

  /**
   * Toggle a pending detected source's selected state.
   */
  togglePendingSource({ commit }, index) {
    commit('TOGGLE_PENDING_SOURCE', index);
  },
};

const getters = {
  showStartupModal: (state) => state.showStartupModal,
  isScanning: (state) => state.scanning,
  scanProgress: (state) => state.scanProgress,
  pendingDetected: (state) => state.pendingDetected,
  savedSources: (state) => state.savedSources,
  availableSources: (state) => state.availableSources,
  savedSourcesByCategory: (state) => (category) =>
    state.savedSources.filter((s) => s.category === category),
  hasSavedSources: (state) => state.savedSources.length > 0,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
