import {
  BASE_AUTO_RATE,
  BASE_CLICK_POWER,
  BASE_OFFLINE_CAP_SECONDS,
  UPGRADES,
} from '../config/UpgradeConfig';
import { GameSaveData } from './GameTypes';

export interface ProductionStats {
  clickPower: number;
  autoRatePerSecond: number;
  offlineCapSeconds: number;
  offlineMultiplier: number;
  globalMultiplier: number;
}

/**
 * Computes production rates from upgrade levels and applies boost multiplier.
 */
export class IdleProduction {
  private _upgradeLevels: Record<string, number> = {};
  private _boostMultiplier = 1;
  private _boostExpiresAt = 0;

  get upgradeLevels(): Readonly<Record<string, number>> {
    return this._upgradeLevels;
  }

  getUpgradeLevel(id: string): number {
    return this._upgradeLevels[id] ?? 0;
  }

  setUpgradeLevel(id: string, level: number): void {
    this._upgradeLevels[id] = level;
  }

  loadFromSave(data: GameSaveData): void {
    this._upgradeLevels = { ...data.upgradeLevels };
    this._boostExpiresAt = data.boostExpiresAt ?? 0;
    this.refreshBoost();
  }

  toSaveFragment(): Pick<GameSaveData, 'upgradeLevels' | 'boostExpiresAt'> {
    return {
      upgradeLevels: { ...this._upgradeLevels },
      boostExpiresAt: this._boostExpiresAt,
    };
  }

  getStats(): ProductionStats {
    let clickPower = BASE_CLICK_POWER;
    let autoRate = BASE_AUTO_RATE;
    let offlineCap = BASE_OFFLINE_CAP_SECONDS;
    let offlineMultiplier = 1;
    let globalMultiplier = 1;

    for (const def of UPGRADES) {
      const level = this.getUpgradeLevel(def.id);
      if (level <= 0) continue;

      switch (def.effectType) {
        case 'clickPower':
          clickPower += def.effectPerLevel * level;
          break;
        case 'autoRate':
          autoRate += def.effectPerLevel * level;
          break;
        case 'offlineCap':
          offlineCap += def.effectPerLevel * level;
          break;
        case 'offlineMultiplier':
          offlineMultiplier += def.effectPerLevel * level;
          break;
        case 'globalMultiplier':
          globalMultiplier += def.effectPerLevel * level;
          break;
      }
    }

    return {
      clickPower: clickPower * globalMultiplier * this._boostMultiplier,
      autoRatePerSecond: autoRate * globalMultiplier * this._boostMultiplier,
      offlineCapSeconds: offlineCap,
      offlineMultiplier: offlineMultiplier * globalMultiplier,
      globalMultiplier,
    };
  }

  /** Coins earned from one tap. */
  getClickYield(): number {
    return this.getStats().clickPower;
  }

  /** Coins earned per auto tick (call every 1 second). */
  getAutoTickYield(): number {
    return this.getStats().autoRatePerSecond;
  }

  /**
   * Calculate offline earnings since lastSaveTimestamp.
   */
  calcOfflineEarnings(lastSaveTimestamp: number, now = Date.now()): number {
    const elapsedSec = Math.max(0, (now - lastSaveTimestamp) / 1000);
    const stats = this.getStats();
    const cappedSec = Math.min(elapsedSec, stats.offlineCapSeconds);
    const baseRate = stats.autoRatePerSecond > 0 ? stats.autoRatePerSecond : 0.1;
    return Math.floor(cappedSec * baseRate * stats.offlineMultiplier);
  }

  /** Activate 2x production boost for durationMs. */
  activateBoost(durationMs: number, multiplier = 2): void {
    const now = Date.now();
    this._boostExpiresAt = now + durationMs;
    this._boostMultiplier = multiplier;
  }

  isBoostActive(): boolean {
    this.refreshBoost();
    return this._boostMultiplier > 1;
  }

  getBoostRemainingMs(): number {
    this.refreshBoost();
    if (this._boostExpiresAt <= 0) return 0;
    return Math.max(0, this._boostExpiresAt - Date.now());
  }

  refreshBoost(): void {
    if (this._boostExpiresAt > 0 && Date.now() >= this._boostExpiresAt) {
      this._boostExpiresAt = 0;
      this._boostMultiplier = 1;
    }
  }
}
