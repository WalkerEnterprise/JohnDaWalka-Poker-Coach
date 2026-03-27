import {
  getAllSources,
  getSourcesByCategory,
  getSourceById,
  expandSearchPaths,
} from '@/services/pokerSourceRegistry';

describe('pokerSourceRegistry', () => {
  describe('getAllSources', () => {
    it('returns a non-empty array of source definitions', () => {
      const sources = getAllSources();
      expect(Array.isArray(sources)).toBe(true);
      expect(sources.length).toBeGreaterThan(0);
    });

    it('every source has required fields', () => {
      const required = ['id', 'name', 'category', 'description', 'searchPaths', 'filePatterns', 'sourceType'];
      for (const src of getAllSources()) {
        for (const field of required) {
          expect(src).toHaveProperty(field);
        }
      }
    });
  });

  describe('getSourcesByCategory', () => {
    it('returns only client sources when asked for "client"', () => {
      const clients = getSourcesByCategory('client');
      expect(clients.length).toBeGreaterThan(0);
      clients.forEach((s) => expect(s.category).toBe('client'));
    });

    it('returns only tracker sources when asked for "tracker"', () => {
      const trackers = getSourcesByCategory('tracker');
      expect(trackers.length).toBeGreaterThan(0);
      trackers.forEach((s) => expect(s.category).toBe('tracker'));
    });

    it('returns empty array for unknown category', () => {
      expect(getSourcesByCategory('nonexistent')).toEqual([]);
    });
  });

  describe('getSourceById', () => {
    it('returns ACR hand histories source', () => {
      const src = getSourceById('acr-hand-histories');
      expect(src).toBeDefined();
      expect(src.name).toContain('ACR');
    });

    it('returns DriveHUD 2 database source', () => {
      const src = getSourceById('drivehud2-database');
      expect(src).toBeDefined();
      expect(src.category).toBe('tracker');
    });

    it('returns CoinPoker source', () => {
      const src = getSourceById('coinpoker');
      expect(src).toBeDefined();
      expect(src.category).toBe('client');
    });

    it('returns Hand2Note source', () => {
      const src = getSourceById('hand2note');
      expect(src).toBeDefined();
    });

    it('returns Holdem Manager 3 source', () => {
      const src = getSourceById('holdem-manager-3');
      expect(src).toBeDefined();
    });

    it('returns PokerTracker 4 source', () => {
      const src = getSourceById('pokertracker-4');
      expect(src).toBeDefined();
    });

    it('returns undefined for unknown id', () => {
      expect(getSourceById('does-not-exist')).toBeUndefined();
    });
  });

  describe('expandSearchPaths', () => {
    it('replaces {DRIVE}, {USER}, and {HOME} placeholders', () => {
      const source = {
        searchPaths: [
          '{DRIVE}/Poker/{USER}/data',
          '{HOME}/.poker',
        ],
      };
      const expanded = expandSearchPaths(source, {
        drives: ['C:'],
        username: 'TestUser',
        homedir: 'C:/Users/TestUser',
      });
      expect(expanded).toContain('C:/Poker/TestUser/data');
      expect(expanded).toContain('C:/Users/TestUser/.poker');
    });

    it('expands for multiple drives', () => {
      const source = { searchPaths: ['{DRIVE}/Poker'] };
      const expanded = expandSearchPaths(source, {
        drives: ['C:', 'D:'],
        username: '',
        homedir: '',
      });
      expect(expanded).toContain('C:/Poker');
      expect(expanded).toContain('D:/Poker');
    });
  });
});
