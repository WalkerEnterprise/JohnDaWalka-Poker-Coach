import { shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import SourceSettings from '@/components/SourceSettings.vue';

Vue.use(Vuex);

describe('SourceSettings.vue', () => {
  let actions;
  let getters;
  let store;

  beforeEach(() => {
    actions = {
      'sourceDetection/startScan': jest.fn(() => Promise.resolve()),
      'sourceDetection/cancelScan': jest.fn(),
      'sourceDetection/confirmDetectedSources': jest.fn(),
      'sourceDetection/togglePendingSource': jest.fn(),
      'sourceDetection/addSourceManually': jest.fn(() => Promise.resolve()),
      'sourceDetection/removeSavedSource': jest.fn(),
      'sourceDetection/updateSourcePath': jest.fn(() => Promise.resolve()),
    };
    getters = {
      'sourceDetection/isScanning': () => false,
      'sourceDetection/scanProgress': () => ({ checked: 0, total: 0, current: '', found: [] }),
      'sourceDetection/pendingDetected': () => [],
      'sourceDetection/savedSources': () => [
        {
          sourceId: 'acr-hand-histories',
          name: 'ACR / WPN Hand Histories',
          category: 'client',
          path: 'C:/ACR Poker/HandHistory',
          sourceType: 'hand-history',
          matchedFiles: ['hand1.txt'],
          selected: true,
        },
        {
          sourceId: 'drivehud2-database',
          name: 'DriveHUD 2 Database',
          category: 'tracker',
          path: 'C:/DriveHUD2',
          sourceType: 'database',
          matchedFiles: [],
          selected: true,
        },
      ],
      'sourceDetection/availableSources': () => [
        { id: 'acr-hand-histories', name: 'ACR / WPN Hand Histories' },
        { id: 'coinpoker', name: 'CoinPoker' },
      ],
    };
    store = new Vuex.Store({ actions, getters });
  });

  it('renders the component', () => {
    const wrapper = shallowMount(SourceSettings, { store, localVue: Vue });
    expect(wrapper.find('.source-settings').exists()).toBe(true);
  });

  it('displays saved client sources', () => {
    const wrapper = shallowMount(SourceSettings, { store, localVue: Vue });
    expect(wrapper.text()).toContain('ACR / WPN Hand Histories');
  });

  it('displays saved tracker sources', () => {
    const wrapper = shallowMount(SourceSettings, { store, localVue: Vue });
    expect(wrapper.text()).toContain('DriveHUD 2 Database');
  });

  it('shows "No sources" message when savedSources is empty', () => {
    getters['sourceDetection/savedSources'] = () => [];
    store = new Vuex.Store({ actions, getters });
    const wrapper = shallowMount(SourceSettings, { store, localVue: Vue });
    expect(wrapper.text()).toContain('No sources configured yet');
  });

  it('triggers re-scan when button is clicked', async () => {
    const wrapper = shallowMount(SourceSettings, { store, localVue: Vue });
    const scanBtn = wrapper.find('.btn-primary');
    await scanBtn.trigger('click');
    expect(actions['sourceDetection/startScan']).toHaveBeenCalled();
  });

  it('populates available sources in manual-add dropdown', () => {
    const wrapper = shallowMount(SourceSettings, { store, localVue: Vue });
    const options = wrapper.findAll('.source-select option');
    expect(options.length).toBe(3); // placeholder + 2 sources
  });
});
