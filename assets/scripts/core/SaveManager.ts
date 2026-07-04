import { DouyinPlatform } from '../platform/DouyinPlatform';
import { createDefaultSaveData, GameSaveData } from './GameTypes';
import { IdleProduction } from './IdleProduction';
import { ResourceManager } from './ResourceManager';

const SAVE_VERSION = 1;
const AUTO_SAVE_INTERVAL_MS = 30_000;

interface PersistedPayload {
  version: number;
  data: GameSaveData;
}

/**
 * Save/load game state via DouyinPlatform storage adapter.
 */
export class SaveManager {
  private _lastSaveTimestamp = Date.now();
  private _totalTaps = 0;
  private _autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly resources: ResourceManager,
    private readonly production: IdleProduction,
    private readonly platform: DouyinPlatform,
  ) {}

  get lastSaveTimestamp(): number {
    return this._lastSaveTimestamp;
  }

  get totalTaps(): number {
    return this._totalTaps;
  }

  incrementTaps(): void {
    this._totalTaps += 1;
  }

  load(): GameSaveData {
    const raw = this.platform.loadData();
    if (!raw) {
      const fresh = createDefaultSaveData();
      this.apply(fresh);
      return fresh;
    }

    try {
      const parsed = JSON.parse(raw) as PersistedPayload;
      const data = parsed.version === SAVE_VERSION ? parsed.data : createDefaultSaveData();
      this.apply(data);
      return data;
    } catch {
      const fresh = createDefaultSaveData();
      this.apply(fresh);
      return fresh;
    }
  }

  save(): void {
    this._lastSaveTimestamp = Date.now();
    const data: GameSaveData = {
      coins: this.resources.coins,
      upgradeLevels: { ...this.production.upgradeLevels },
      lastSaveTimestamp: this._lastSaveTimestamp,
      totalTaps: this._totalTaps,
      boostExpiresAt: this.production.toSaveFragment().boostExpiresAt,
    };

    const payload: PersistedPayload = { version: SAVE_VERSION, data };
    this.platform.saveData(JSON.stringify(payload));
  }

  startAutoSave(): void {
    this.stopAutoSave();
    this._autoSaveTimer = setInterval(() => this.save(), AUTO_SAVE_INTERVAL_MS);
  }

  stopAutoSave(): void {
    if (this._autoSaveTimer !== null) {
      clearInterval(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }
  }

  reset(): void {
    this.platform.clearSave();
    const fresh = createDefaultSaveData();
    this.apply(fresh);
    this.save();
  }

  private apply(data: GameSaveData): void {
    this._lastSaveTimestamp = data.lastSaveTimestamp;
    this._totalTaps = data.totalTaps;
    this.resources.loadFromSave(data);
    this.production.loadFromSave(data);
  }
}
