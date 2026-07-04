import { getUpgradeById, getUpgradeCost, UPGRADES } from '../config/UpgradeConfig';
import { IdleProduction } from './IdleProduction';
import { ResourceManager } from './ResourceManager';

export type UpgradeChangeListener = (upgradeId: string, newLevel: number) => void;

export interface PurchaseResult {
  success: boolean;
  reason?: 'max_level' | 'insufficient_funds' | 'unknown_upgrade';
  cost?: number;
  newLevel?: number;
}

/**
 * Handles upgrade purchases and level queries.
 */
export class UpgradeSystem {
  private _listeners: UpgradeChangeListener[] = [];

  constructor(
    private readonly resources: ResourceManager,
    private readonly production: IdleProduction,
  ) {}

  getCost(upgradeId: string): number {
    const def = getUpgradeById(upgradeId);
    if (!def) return Infinity;
    const level = this.production.getUpgradeLevel(upgradeId);
    if (level >= def.maxLevel) return Infinity;
    return getUpgradeCost(def.baseCost, level);
  }

  canPurchase(upgradeId: string): boolean {
    const def = getUpgradeById(upgradeId);
    if (!def) return false;
    const level = this.production.getUpgradeLevel(upgradeId);
    if (level >= def.maxLevel) return false;
    return this.resources.canAfford(this.getCost(upgradeId));
  }

  purchase(upgradeId: string): PurchaseResult {
    const def = getUpgradeById(upgradeId);
    if (!def) {
      return { success: false, reason: 'unknown_upgrade' };
    }

    const level = this.production.getUpgradeLevel(upgradeId);
    if (level >= def.maxLevel) {
      return { success: false, reason: 'max_level' };
    }

    const cost = getUpgradeCost(def.baseCost, level);
    if (!this.resources.spend(cost)) {
      return { success: false, reason: 'insufficient_funds', cost };
    }

    const newLevel = level + 1;
    this.production.setUpgradeLevel(upgradeId, newLevel);
    this.notify(upgradeId, newLevel);
    return { success: true, cost, newLevel };
  }

  getAllUpgradeStates(): Array<{
    id: string;
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    cost: number;
    canPurchase: boolean;
  }> {
    return UPGRADES.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      level: this.production.getUpgradeLevel(def.id),
      maxLevel: def.maxLevel,
      cost: this.getCost(def.id),
      canPurchase: this.canPurchase(def.id),
    }));
  }

  onUpgrade(listener: UpgradeChangeListener): void {
    this._listeners.push(listener);
  }

  offUpgrade(listener: UpgradeChangeListener): void {
    this._listeners = this._listeners.filter((l) => l !== listener);
  }

  private notify(upgradeId: string, newLevel: number): void {
    for (const listener of this._listeners) {
      listener(upgradeId, newLevel);
    }
  }
}
