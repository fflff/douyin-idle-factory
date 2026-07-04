export interface GameSaveData {
  coins: number;
  upgradeLevels: Record<string, number>;
  lastSaveTimestamp: number;
  totalTaps: number;
  /** Timestamp when 2x boost expires (ms), 0 if inactive. */
  boostExpiresAt: number;
}

export function createDefaultSaveData(): GameSaveData {
  return {
    coins: 0,
    upgradeLevels: {},
    lastSaveTimestamp: Date.now(),
    totalTaps: 0,
    boostExpiresAt: 0,
  };
}
