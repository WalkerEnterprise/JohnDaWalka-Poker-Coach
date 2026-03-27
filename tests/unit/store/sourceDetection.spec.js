import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import sourceDetection from '@/store/modules/sourceDetection';

jest.mock('@/services/driveScanner', () => ({
  isFirstLaunch: jest.fn(() => true),
  markFirstLaunchDone: jest.fn(),
  scanForSources: jest.fn(() =>
    Promise.resolve({
      detected: [
        {
          sourceId: 'acr-hand-histories',
          name: 'ACR / WPN Hand Histories',
          category: 'client',
          path: 'C:/ACR Poker/HandHistory',
          sourceType: 'hand-history',
          matchedFiles: ['hand1.txt'],
          selected: true,
        },
      ],
      drives: ['C:'],
      elapsed: 42,
      complete: true,
    }),
  ),
  saveDetectedSources: jest.fn(),
  loadSavedSources: jest.fn(() => []),
  browseForDirectory: jest.fn(() => Promise.resolve('D:/custom/path')),
}));

jest.mock('@/services/pokerSourceRegistry', () => ({
  getAllSources: jest.fn(() => [
    { id: 'acr-hand-histories', name: 'ACR / WPN Hand Histories', category: 'client' },
  ]),
  getSourceById: jest.fn((id) => ({
    id,
    name: 'ACR / WPN Hand Histories',
    category: 'client',
    sourceType: 'hand-history',
  })),
}));

const localVue = createLocalVue();
localVue.use(Vuex);

describe('sourceDetection Vuex module', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        sourceDetection: {
          ...sourceDetection,
          state: sourceDetection.state(),
        },
      },
    });
  });

  it('shows startup modal on first launch', () => {
    store.dispatch('sourceDetection/initSourceDetection');
    expect(store.getters['sourceDetection/showStartupModal']).toBe(true);
  });

  it('dismisses startup modal', () => {
    store.dispatch('sourceDetection/initSourceDetection');
    store.dispatch('sourceDetection/dismissStartupModal');
    expect(store.getters['sourceDetection/showStartupModal']).toBe(false);
  });

  it('runs a scan and populates pendingDetected', async () => {
    await store.dispatch('sourceDetection/startScan', { drives: ['C:'] });
    const pending = store.getters['sourceDetection/pendingDetected'];
    expect(pending.length).toBe(1);
    expect(pending[0].sourceId).toBe('acr-hand-histories');
  });

  it('toggles selection on pending source', async () => {
    await store.dispatch('sourceDetection/startScan', { drives: ['C:'] });
    expect(store.getters['sourceDetection/pendingDetected'][0].selected).toBe(true);
    store.dispatch('sourceDetection/togglePendingSource', 0);
    expect(store.getters['sourceDetection/pendingDetected'][0].selected).toBe(false);
  });

  it('confirms detected sources and saves them', async () => {
    const { saveDetectedSources } = require('@/services/driveScanner');
    await store.dispatch('sourceDetection/startScan', { drives: ['C:'] });
    store.dispatch('sourceDetection/confirmDetectedSources');
    const saved = store.getters['sourceDetection/savedSources'];
    expect(saved.length).toBe(1);
    expect(saveDetectedSources).toHaveBeenCalledWith(saved);
  });

  it('removes a saved source', async () => {
    await store.dispatch('sourceDetection/startScan', { drives: ['C:'] });
    store.dispatch('sourceDetection/confirmDetectedSources');
    expect(store.getters['sourceDetection/savedSources'].length).toBe(1);
    store.dispatch('sourceDetection/removeSavedSource', 0);
    expect(store.getters['sourceDetection/savedSources'].length).toBe(0);
  });

  it('adds a source manually via browse', async () => {
    await store.dispatch('sourceDetection/addSourceManually', 'acr-hand-histories');
    const saved = store.getters['sourceDetection/savedSources'];
    expect(saved.length).toBe(1);
    expect(saved[0].path).toBe('D:/custom/path');
  });

  it('hasSavedSources getter reflects state', async () => {
    expect(store.getters['sourceDetection/hasSavedSources']).toBe(false);
    await store.dispatch('sourceDetection/addSourceManually', 'acr-hand-histories');
    expect(store.getters['sourceDetection/hasSavedSources']).toBe(true);
  });
});
