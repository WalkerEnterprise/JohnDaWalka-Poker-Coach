<template>
  <div v-if="showStartupModal" class="modal-overlay" @click.self="dismiss">
    <div class="modal-container">
      <!-- Step 1: Welcome / offer to scan -->
      <div v-if="step === 'welcome'" class="modal-step">
        <h2>Welcome to Poker Coach</h2>
        <p>
          We can scan your drives to automatically find installed poker clients
          and tracking software. Detected paths will be shown for your review
          before anything is saved.
        </p>

        <div class="drive-selection">
          <h4>Select drives to scan:</h4>
          <label v-for="d in driveOptions" :key="d" class="drive-checkbox">
            <input type="checkbox" :value="d" v-model="selectedDrives" />
            {{ d }}
          </label>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" @click="beginScan" :disabled="selectedDrives.length === 0">
            Scan Now
          </button>
          <button class="btn btn-secondary" @click="dismiss">
            Skip for Now
          </button>
        </div>
      </div>

      <!-- Step 2: Scanning in progress -->
      <div v-if="step === 'scanning'" class="modal-step">
        <h2>Scanning for Poker Sources&hellip;</h2>

        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p class="progress-text">
          Checked {{ scanProgress.checked }} / {{ scanProgress.total }} paths
        </p>
        <p class="current-path">{{ scanProgress.current }}</p>

        <div v-if="scanProgress.found.length > 0" class="early-results">
          <p>Found {{ scanProgress.found.length }} source(s) so far&hellip;</p>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancelScan">
            Cancel
          </button>
        </div>
      </div>

      <!-- Step 3: Review results -->
      <div v-if="step === 'review'" class="modal-step">
        <h2>Scan Complete</h2>

        <div v-if="pendingDetected.length === 0" class="no-results">
          <p>
            No poker sources were detected on the selected drives. You can add
            sources manually from the Settings panel.
          </p>
        </div>

        <div v-else class="results-list">
          <p>We found the following poker sources. Uncheck any you don't want to import:</p>

          <div
            v-for="(src, idx) in pendingDetected"
            :key="idx"
            class="result-item"
            :class="{ deselected: !src.selected }"
          >
            <label class="result-checkbox">
              <input
                type="checkbox"
                :checked="src.selected"
                @change="toggleSource(idx)"
              />
              <span class="result-info">
                <strong>{{ src.name }}</strong>
                <span class="result-category">{{ src.category }}</span>
                <br />
                <code class="result-path">{{ src.path }}</code>
                <span v-if="src.matchedFiles.length > 0" class="result-files">
                  — {{ src.matchedFiles.length }} file(s) found
                </span>
              </span>
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button
            v-if="pendingDetected.length > 0"
            class="btn btn-primary"
            @click="confirmAndClose"
          >
            Save Selected Sources
          </button>
          <button class="btn btn-secondary" @click="dismiss">
            {{ pendingDetected.length > 0 ? 'Skip' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'StartupScanModal',
  data() {
    return {
      step: 'welcome',
      driveOptions: ['C:', 'D:'],
      selectedDrives: ['C:', 'D:'],
    };
  },
  computed: {
    ...mapGetters('sourceDetection', [
      'showStartupModal',
      'isScanning',
      'scanProgress',
      'pendingDetected',
    ]),
    progressPercent() {
      if (this.scanProgress.total === 0) return 0;
      return Math.round((this.scanProgress.checked / this.scanProgress.total) * 100);
    },
  },
  methods: {
    ...mapActions('sourceDetection', [
      'startScan',
      'cancelScan',
      'confirmDetectedSources',
      'dismissStartupModal',
      'togglePendingSource',
    ]),
    async beginScan() {
      this.step = 'scanning';
      await this.startScan({ drives: this.selectedDrives });
      this.step = 'review';
    },
    toggleSource(idx) {
      this.togglePendingSource(idx);
    },
    confirmAndClose() {
      this.confirmDetectedSources();
      this.dismissStartupModal();
    },
    dismiss() {
      if (this.isScanning) {
        this.cancelScan();
      }
      this.dismissStartupModal();
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  max-width: 580px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.modal-step h2 {
  margin: 0 0 12px;
  font-size: 1.4em;
  color: #2c3e50;
}

.drive-selection {
  margin: 16px 0;
}

.drive-selection h4 {
  margin: 0 0 8px;
  font-weight: 600;
}

.drive-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 16px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95em;
  cursor: pointer;
  transition: background 0.2s;
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

/* Progress */
.progress-bar-container {
  background: #ecf0f1;
  border-radius: 8px;
  height: 10px;
  margin: 16px 0 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #2980b9;
  transition: width 0.3s ease;
  border-radius: 8px;
}

.progress-text {
  font-size: 0.85em;
  color: #7f8c8d;
  margin: 0;
}

.current-path {
  font-family: monospace;
  font-size: 0.8em;
  color: #95a5a6;
  word-break: break-all;
  margin: 4px 0 0;
}

.early-results {
  margin-top: 12px;
  color: #27ae60;
  font-weight: 600;
}

/* Review list */
.results-list {
  margin: 12px 0;
}

.result-item {
  padding: 10px 12px;
  margin: 6px 0;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #2980b9;
}

.result-item.deselected {
  opacity: 0.55;
  border-left-color: #bdc3c7;
}

.result-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.result-checkbox input {
  margin-top: 4px;
}

.result-info {
  flex: 1;
}

.result-category {
  font-size: 0.75em;
  padding: 2px 6px;
  background: #dfe6e9;
  border-radius: 3px;
  text-transform: uppercase;
  margin-left: 8px;
}

.result-path {
  font-size: 0.82em;
  color: #636e72;
  word-break: break-all;
}

.result-files {
  font-size: 0.82em;
  color: #27ae60;
}

.no-results {
  text-align: center;
  color: #7f8c8d;
  padding: 20px 0;
}
</style>
