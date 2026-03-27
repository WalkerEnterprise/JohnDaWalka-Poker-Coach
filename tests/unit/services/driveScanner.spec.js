import {
  isFirstLaunch,
  markFirstLaunchDone,
  saveDetectedSources,
  loadSavedSources,
  scanForSources,
} from '@/services/driveScanner';

describe('driveScanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isFirstLaunch / markFirstLaunchDone', () => {
    it('returns true on first launch', () => {
      expect(isFirstLaunch()).toBe(true);
    });

    it('returns false after marking first launch done', () => {
      markFirstLaunchDone();
      expect(isFirstLaunch()).toBe(false);
    });
  });

  describe('saveDetectedSources / loadSavedSources', () => {
    it('round-trips source data through localStorage', () => {
      const sources = [
        { sourceId: 'acr-hand-histories', path: 'C:/ACR', name: 'ACR' },
      ];
      saveDetectedSources(sources);
      const loaded = loadSavedSources();
      expect(loaded).toEqual(sources);
    });

    it('returns empty array when nothing is saved', () => {
      expect(loadSavedSources()).toEqual([]);
    });

    it('returns empty array when localStorage has invalid JSON', () => {
      localStorage.setItem('poker-coach-saved-sources', 'not-json');
      expect(loadSavedSources()).toEqual([]);
    });
  });

  describe('scanForSources', () => {
    it('returns a ScanResult with expected shape', async () => {
      const result = await scanForSources({ drives: ['C:'] });
      expect(result).toHaveProperty('detected');
      expect(result).toHaveProperty('drives');
      expect(result).toHaveProperty('elapsed');
      expect(result).toHaveProperty('complete');
      expect(Array.isArray(result.detected)).toBe(true);
      expect(result.complete).toBe(true);
    });

    it('respects abort signal', async () => {
      const controller = new AbortController();
      controller.abort();
      const result = await scanForSources({
        drives: ['C:', 'D:'],
        signal: controller.signal,
      });
      expect(result.complete).toBe(false);
    });

    it('calls onProgress callback during scan', async () => {
      const progressCalls = [];
      await scanForSources({
        drives: ['C:'],
        onProgress(p) {
          progressCalls.push(p);
        },
      });
      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[0]).toHaveProperty('checked');
      expect(progressCalls[0]).toHaveProperty('total');
    });
  });
});
