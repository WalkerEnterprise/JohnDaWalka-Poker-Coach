<template>
  <div class="source-settings">
    <h2>Poker Source Settings</h2>
    <p class="settings-description">
      Manage the poker clients and tracking tools that Poker Coach imports data
      from. You can re-scan your drives or add paths manually.
    </p>

    <!-- Re-scan controls -->
    <div class="scan-controls">
      <div class="drive-selection-inline">
        <label v-for="d in driveOptions" :key="d" class="drive-checkbox">
          <input type="checkbox" :value="d" v-model="selectedDrives" />
          {{ d }}
        </label>
      </div>
      <button
        class="btn btn-primary btn-sm"
        :disabled="isScanning || selectedDrives.length === 0"
        @click="runScan"
      >
        {{ isScanning ? 'Scanning…' : 'Re-Scan Drives' }}
      </button>
    </div>

    <!-- Progress during re-scan -->
    <div v-if="isScanning" class="inline-progress">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <p class="progress-text">{{ scanProgress.checked }} / {{ scanProgress.total }}</p>
      <button class="btn btn-secondary btn-sm" @click="cancelScan">Cancel</button>
    </div>

    <!-- Pending review (after re-scan) -->
    <div v-if="pendingDetected.length > 0 && !isScanning" class="pending-review">
      <h3>New Sources Detected</h3>
      <div
        v-for="(src, idx) in pendingDetected"
        :key="'pending-' + idx"
        class="source-row"
        :class="{ deselected: !src.selected }"
      >
        <label class="source-label">
          <input
            type="checkbox"
            :checked="src.selected"
            @change="togglePendingSource(idx)"
          />
          <span>
            <strong>{{ src.name }}</strong>
            <code>{{ src.path }}</code>
          </span>
        </label>
      </div>
      <div class="pending-actions">
        <button class="btn btn-primary btn-sm" @click="confirmDetectedSources">
          Save Selected
        </button>
      </div>
    </div>

    <!-- Saved sources grouped by category -->
    <div v-if="savedSources.length > 0" class="saved-section">
      <h3>Poker Clients</h3>
      <div v-if="clientSources.length === 0" class="empty-category">
        No client sources configured.
      </div>
      <div
        v-for="(src, idx) in clientSources"
        :key="'client-' + idx"
        class="source-row saved"
      >
        <span class="source-info">
          <strong>{{ src.name }}</strong>
          <code>{{ src.path }}</code>
          <span v-if="src.matchedFiles.length > 0" class="file-count">
            {{ src.matchedFiles.length }} file(s)
          </span>
        </span>
        <span class="source-actions">
          <button
            class="btn btn-secondary btn-xs"
            @click="updateSourcePath(savedIndexOf(src))"
            title="Change path"
          >
            Browse
          </button>
          <button
            class="btn btn-danger btn-xs"
            @click="removeSavedSource(savedIndexOf(src))"
            title="Remove source"
          >
            Remove
          </button>
        </span>
      </div>

      <h3>Trackers &amp; HUDs</h3>
      <div v-if="trackerSources.length === 0" class="empty-category">
        No tracker sources configured.
      </div>
      <div
        v-for="(src, idx) in trackerSources"
        :key="'tracker-' + idx"
        class="source-row saved"
      >
        <span class="source-info">
          <strong>{{ src.name }}</strong>
          <code>{{ src.path }}</code>
          <span v-if="src.matchedFiles.length > 0" class="file-count">
            {{ src.matchedFiles.length }} file(s)
          </span>
        </span>
        <span class="source-actions">
          <button
            class="btn btn-secondary btn-xs"
            @click="updateSourcePath(savedIndexOf(src))"
            title="Change path"
          >
            Browse
          </button>
          <button
            class="btn btn-danger btn-xs"
            @click="removeSavedSource(savedIndexOf(src))"
            title="Remove source"
          >
            Remove
          </button>
        </span>
      </div>
    </div>

    <div v-else class="no-sources">
      <p>No sources configured yet. Run a scan or add one manually.</p>
    </div>

    <!-- Manual add -->
    <div class="manual-add">
      <h3>Add Source Manually</h3>
      <div class="manual-add-row">
        <select v-model="manualSourceId" class="source-select">
          <option value="">Select a source type…</option>
          <option
            v-for="src in availableSources"
            :key="src.id"
            :value="src.id"
          >
            {{ src.name }}
          </option>
        </select>
        <button
          class="btn btn-primary btn-sm"
          :disabled="!manualSourceId"
          @click="addManually"
        >
          Browse…
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'SourceSettings',
  data() {
    return {
      driveOptions: ['C:', 'D:'],
      selectedDrives: ['C:', 'D:'],
      manualSourceId: '',
    };
  },
  computed: {
    ...mapGetters('sourceDetection', [
      'isScanning',
      'scanProgress',
      'pendingDetected',
      'savedSources',
      'availableSources',
    ]),
    progressPercent() {
      if (this.scanProgress.total === 0) return 0;
      return Math.round((this.scanProgress.checked / this.scanProgress.total) * 100);
    },
    clientSources() {
      return this.savedSources.filter((s) => s.category === 'client');
    },
    trackerSources() {
      return this.savedSources.filter((s) => s.category === 'tracker');
    },
  },
  methods: {
    ...mapActions('sourceDetection', [
      'startScan',
      'cancelScan',
      'confirmDetectedSources',
      'togglePendingSource',
      'addSourceManually',
      'removeSavedSource',
      'updateSourcePath',
    ]),
    async runScan() {
      await this.startScan({ drives: this.selectedDrives });
    },
    async addManually() {
      if (!this.manualSourceId) return;
      await this.addSourceManually(this.manualSourceId);
      this.manualSourceId = '';
    },
    savedIndexOf(src) {
      return this.savedSources.indexOf(src);
    },
  },
};
</script>

<style scoped>
.source-settings {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  text-align: left;
}

.settings-description {
  color: #636e72;
  margin-bottom: 16px;
}

/* Scan controls */
.scan-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.drive-selection-inline {
  display: flex;
  gap: 12px;
}

.drive-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.inline-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.inline-progress .progress-bar-container {
  flex: 1;
  background: #ecf0f1;
  border-radius: 6px;
  height: 8px;
  overflow: hidden;
}

.inline-progress .progress-bar {
  height: 100%;
  background: #2980b9;
  transition: width 0.3s;
  border-radius: 6px;
}

.progress-text {
  font-size: 0.85em;
  color: #7f8c8d;
  white-space: nowrap;
}

/* Source rows */
.source-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin: 4px 0;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #2980b9;
}

.source-row.deselected {
  opacity: 0.5;
  border-left-color: #bdc3c7;
}

.source-row.saved {
  border-left-color: #27ae60;
}

.source-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}

.source-info {
  flex: 1;
}

.source-info code,
.source-label code {
  display: block;
  font-size: 0.82em;
  color: #636e72;
  word-break: break-all;
  margin-top: 2px;
}

.file-count {
  font-size: 0.8em;
  color: #27ae60;
  margin-left: 4px;
}

.source-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

/* Pending review */
.pending-review {
  margin: 16px 0;
  padding: 16px;
  background: #fdf2e9;
  border-radius: 8px;
}

.pending-actions {
  margin-top: 10px;
  text-align: right;
}

/* Sections */
.saved-section h3,
.manual-add h3,
.pending-review h3 {
  margin: 16px 0 8px;
  font-size: 1.05em;
  color: #2c3e50;
}

.empty-category {
  color: #95a5a6;
  font-size: 0.9em;
  padding: 8px 0;
}

.no-sources {
  text-align: center;
  color: #95a5a6;
  padding: 24px 0;
}

/* Manual add */
.manual-add {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
}

.manual-add-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.source-select {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 0.9em;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95em;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-sm {
  padding: 7px 14px;
  font-size: 0.88em;
}

.btn-xs {
  padding: 4px 10px;
  font-size: 0.8em;
}

.btn-primary {
  background: #2980b9;
  color: #fff;
}

.btn-primary:hover {
  background: #2471a3;
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background: #dfe6e9;
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
