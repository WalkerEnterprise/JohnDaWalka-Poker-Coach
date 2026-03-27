/**
 * Registry of known poker software sources with their expected filesystem paths,
 * file patterns, and metadata. Used by the drive scanner to auto-detect installed
 * poker clients, trackers, and HUD tools.
 */

const POKER_SOURCE_REGISTRY = [
  // ── Poker Clients ──────────────────────────────────────────────
  {
    id: 'acr-hand-histories',
    name: 'ACR / WPN Hand Histories',
    category: 'client',
    description: 'Americas Cardroom / Winning Poker Network hand history files',
    searchPaths: [
      '{DRIVE}/ACR Poker/HandHistory',
      '{DRIVE}/WPN/HandHistory',
      '{DRIVE}/Users/{USER}/AppData/Local/ACR Poker/HandHistory',
      '{DRIVE}/Users/{USER}/AppData/Local/WPN/HandHistory',
      '{DRIVE}/Program Files/ACR Poker/HandHistory',
      '{DRIVE}/Program Files (x86)/ACR Poker/HandHistory',
    ],
    filePatterns: ['*.txt', '*.xml'],
    sourceType: 'hand-history',
    icon: 'acr',
  },
  {
    id: 'acr-tournament-summaries',
    name: 'ACR / WPN Tournament Summaries',
    category: 'client',
    description: 'Americas Cardroom / Winning Poker Network tournament summary files',
    searchPaths: [
      '{DRIVE}/ACR Poker/TournamentSummary',
      '{DRIVE}/WPN/TournamentSummary',
      '{DRIVE}/Users/{USER}/AppData/Local/ACR Poker/TournamentSummary',
      '{DRIVE}/Users/{USER}/AppData/Local/WPN/TournamentSummary',
      '{DRIVE}/Program Files/ACR Poker/TournamentSummary',
      '{DRIVE}/Program Files (x86)/ACR Poker/TournamentSummary',
    ],
    filePatterns: ['*.txt', '*.xml'],
    sourceType: 'tournament-summary',
    icon: 'acr',
  },
  {
    id: 'coinpoker',
    name: 'CoinPoker',
    category: 'client',
    description: 'CoinPoker hand history and data folders',
    searchPaths: [
      '{DRIVE}/CoinPoker',
      '{DRIVE}/Users/{USER}/AppData/Local/CoinPoker',
      '{DRIVE}/Users/{USER}/AppData/Roaming/CoinPoker',
      '{DRIVE}/Program Files/CoinPoker',
      '{DRIVE}/Program Files (x86)/CoinPoker',
      '{HOME}/.coinpoker',
      '{HOME}/CoinPoker',
    ],
    filePatterns: ['*.txt', '*.log', '*.xml'],
    sourceType: 'hand-history',
    icon: 'coinpoker',
  },

  // ── Trackers / HUDs ───────────────────────────────────────────
  {
    id: 'drivehud2-database',
    name: 'DriveHUD 2 Database',
    category: 'tracker',
    description: 'DriveHUD 2 SQLite database files',
    searchPaths: [
      '{DRIVE}/DriveHUD2',
      '{DRIVE}/DriveHUD 2',
      '{DRIVE}/Users/{USER}/AppData/Local/DriveHUD2',
      '{DRIVE}/Users/{USER}/AppData/Local/DriveHUD 2',
      '{DRIVE}/Program Files/DriveHUD2',
      '{DRIVE}/Program Files (x86)/DriveHUD2',
    ],
    filePatterns: ['*.db', '*.sqlite', '*.sqlite3'],
    sourceType: 'database',
    icon: 'drivehud',
  },
  {
    id: 'drivehud2-processed',
    name: 'DriveHUD 2 Processed Data',
    category: 'tracker',
    description: 'DriveHUD 2 processed/exported data files',
    searchPaths: [
      '{DRIVE}/DriveHUD2/Data',
      '{DRIVE}/DriveHUD 2/Data',
      '{DRIVE}/Users/{USER}/AppData/Local/DriveHUD2/Data',
      '{DRIVE}/Users/{USER}/AppData/Local/DriveHUD 2/Data',
      '{DRIVE}/Users/{USER}/Documents/DriveHUD2',
      '{DRIVE}/Users/{USER}/Documents/DriveHUD 2',
    ],
    filePatterns: ['*.csv', '*.json', '*.xml'],
    sourceType: 'processed-data',
    icon: 'drivehud',
  },
  {
    id: 'hand2note',
    name: 'Hand2Note',
    category: 'tracker',
    description: 'Hand2Note poker tracker database and configuration',
    searchPaths: [
      '{DRIVE}/Hand2Note',
      '{DRIVE}/Users/{USER}/AppData/Local/Hand2Note',
      '{DRIVE}/Users/{USER}/AppData/Roaming/Hand2Note',
      '{DRIVE}/Program Files/Hand2Note',
      '{DRIVE}/Program Files (x86)/Hand2Note',
    ],
    filePatterns: ['*.db', '*.sqlite', '*.h2n'],
    sourceType: 'database',
    icon: 'hand2note',
  },
  {
    id: 'holdem-manager-3',
    name: 'Holdem Manager 3',
    category: 'tracker',
    description: 'Holdem Manager 3 (HM3) database and hand history archive',
    searchPaths: [
      '{DRIVE}/HM3',
      '{DRIVE}/Holdem Manager 3',
      '{DRIVE}/HoldemManager3',
      '{DRIVE}/Users/{USER}/AppData/Local/HM3',
      '{DRIVE}/Users/{USER}/AppData/Local/Holdem Manager 3',
      '{DRIVE}/Users/{USER}/AppData/Roaming/HM3',
      '{DRIVE}/Users/{USER}/AppData/Roaming/Holdem Manager 3',
      '{DRIVE}/Program Files/Holdem Manager 3',
      '{DRIVE}/Program Files (x86)/Holdem Manager 3',
    ],
    filePatterns: ['*.db', '*.sqlite', '*.hmdb', '*.txt'],
    sourceType: 'database',
    icon: 'hm3',
  },
  {
    id: 'pokertracker-4',
    name: 'PokerTracker 4',
    category: 'tracker',
    description: 'PokerTracker 4 (PT4) database and imported hand data',
    searchPaths: [
      '{DRIVE}/PokerTracker 4',
      '{DRIVE}/PokerTracker4',
      '{DRIVE}/PT4',
      '{DRIVE}/Users/{USER}/AppData/Local/PokerTracker 4',
      '{DRIVE}/Users/{USER}/AppData/Local/PokerTracker4',
      '{DRIVE}/Users/{USER}/AppData/Roaming/PokerTracker 4',
      '{DRIVE}/Program Files/PokerTracker 4',
      '{DRIVE}/Program Files (x86)/PokerTracker 4',
    ],
    filePatterns: ['*.db', '*.pt4', '*.sqlite'],
    sourceType: 'database',
    icon: 'pt4',
  },
];

/**
 * Returns all registered source definitions.
 */
export function getAllSources() {
  return POKER_SOURCE_REGISTRY;
}

/**
 * Returns sources filtered by category ('client' or 'tracker').
 */
export function getSourcesByCategory(category) {
  return POKER_SOURCE_REGISTRY.filter((s) => s.category === category);
}

/**
 * Returns a single source definition by id, or undefined if not found.
 */
export function getSourceById(id) {
  return POKER_SOURCE_REGISTRY.find((s) => s.id === id);
}

/**
 * Expands path templates for a given drive letter and username.
 * - {DRIVE} → e.g. "C:" or "D:"
 * - {USER}  → e.g. "JohnDoe"
 * - {HOME}  → e.g. "/home/johndoe" or "C:/Users/JohnDoe"
 */
export function expandSearchPaths(source, { drives, username, homedir }) {
  const expanded = [];
  for (const drive of drives) {
    for (const tpl of source.searchPaths) {
      expanded.push(
        tpl
          .replace(/\{DRIVE\}/g, drive)
          .replace(/\{USER\}/g, username)
          .replace(/\{HOME\}/g, homedir),
      );
    }
  }
  return expanded;
}

export default POKER_SOURCE_REGISTRY;
