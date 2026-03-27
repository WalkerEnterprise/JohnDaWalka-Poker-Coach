<template>
  <div id="app">
    <StartupScanModal />
    <nav class="app-nav">
      <button
        :class="{ active: activeTab === 'analysis' }"
        @click="activeTab = 'analysis'"
      >
        Hand Analysis
      </button>
      <button
        :class="{ active: activeTab === 'sources' }"
        @click="activeTab = 'sources'"
      >
        Source Settings
      </button>
    </nav>
    <PokerHandAnalysis v-if="activeTab === 'analysis'" />
    <SourceSettings v-if="activeTab === 'sources'" />
  </div>
</template>

<script>
import PokerHandAnalysis from './components/PokerHandAnalysis.vue';
import StartupScanModal from './components/StartupScanModal.vue';
import SourceSettings from './components/SourceSettings.vue';

export default {
  name: 'App',
  components: {
    PokerHandAnalysis,
    StartupScanModal,
    SourceSettings,
  },
  data() {
    return {
      activeTab: 'analysis',
    };
  },
  created() {
    this.$store.dispatch('sourceDetection/initSourceDetection');
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.app-nav button {
  padding: 8px 20px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  background: #fff;
  color: #2c3e50;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s;
}

.app-nav button:hover {
  background: #f0f4f8;
}

.app-nav button.active {
  background: #2980b9;
  color: #fff;
  border-color: #2980b9;
}
</style>
