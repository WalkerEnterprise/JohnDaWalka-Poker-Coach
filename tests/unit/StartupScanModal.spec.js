import { shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import StartupScanModal from '@/components/StartupScanModal.vue';

Vue.use(Vuex);

describe('StartupScanModal.vue', () => {
  let actions;
  let getters;
  let store;

  beforeEach(() => {
    actions = {
      'sourceDetection/startScan': jest.fn(() => Promise.resolve()),
      'sourceDetection/cancelScan': jest.fn(),
      'sourceDetection/confirmDetectedSources': jest.fn(),
      'sourceDetection/dismissStartupModal': jest.fn(),
      'sourceDetection/togglePendingSource': jest.fn(),
    };
    getters = {
      'sourceDetection/showStartupModal': () => true,
      'sourceDetection/isScanning': () => false,
      'sourceDetection/scanProgress': () => ({ checked: 0, total: 0, current: '', found: [] }),
      'sourceDetection/pendingDetected': () => [],
    };
    store = new Vuex.Store({ actions, getters });
  });

  it('renders the modal when showStartupModal is true', () => {
    const wrapper = shallowMount(StartupScanModal, { store, localVue: Vue });
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
  });

  it('does not render when showStartupModal is false', () => {
    getters['sourceDetection/showStartupModal'] = () => false;
    store = new Vuex.Store({ actions, getters });
    const wrapper = shallowMount(StartupScanModal, { store, localVue: Vue });
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('shows welcome step by default', () => {
    const wrapper = shallowMount(StartupScanModal, { store, localVue: Vue });
    expect(wrapper.text()).toContain('Welcome to Poker Coach');
  });

  it('has C: and D: drives checked by default', () => {
    const wrapper = shallowMount(StartupScanModal, { store, localVue: Vue });
    expect(wrapper.vm.selectedDrives).toEqual(['C:', 'D:']);
  });

  it('calls dismissStartupModal when Skip is clicked', async () => {
    const wrapper = shallowMount(StartupScanModal, { store, localVue: Vue });
    const skipBtn = wrapper.findAll('.btn-secondary').at(0);
    await skipBtn.trigger('click');
    expect(actions['sourceDetection/dismissStartupModal']).toHaveBeenCalled();
  });

  it('starts scan when Scan Now is clicked', async () => {
    const wrapper = shallowMount(StartupScanModal, { store, localVue: Vue });
    const scanBtn = wrapper.find('.btn-primary');
    await scanBtn.trigger('click');
    expect(actions['sourceDetection/startScan']).toHaveBeenCalled();
  });
});
