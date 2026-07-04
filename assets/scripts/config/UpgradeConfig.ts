/**
 * Upgrade definitions for 摸鱼工厂 MVP.
 * Cost formula: baseCost * 1.15^level
 */

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  /** Effect added per level (meaning depends on effectType). */
  effectPerLevel: number;
  effectType: 'clickPower' | 'autoRate' | 'offlineCap' | 'offlineMultiplier' | 'globalMultiplier';
  maxLevel: number;
}

export const UPGRADE_COST_MULTIPLIER = 1.15;

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'click_power',
    name: '手速训练',
    description: '每次点击产出更多摸鱼值',
    baseCost: 10,
    effectPerLevel: 1,
    effectType: 'clickPower',
    maxLevel: 50,
  },
  {
    id: 'auto_desk',
    name: '自动工位',
    description: '每秒自动产出摸鱼值',
    baseCost: 50,
    effectPerLevel: 0.5,
    effectType: 'autoRate',
    maxLevel: 50,
  },
  {
    id: 'offline_cap',
    name: '摸鱼仓库',
    description: '离线收益上限 +1 小时',
    baseCost: 200,
    effectPerLevel: 3600,
    effectType: 'offlineCap',
    maxLevel: 8,
  },
  {
    id: 'offline_bonus',
    name: '带薪摸鱼',
    description: '离线收益倍率 +10%',
    baseCost: 500,
    effectPerLevel: 0.1,
    effectType: 'offlineMultiplier',
    maxLevel: 20,
  },
  {
    id: 'global_bonus',
    name: '全厂加成',
    description: '所有产出 +5%',
    baseCost: 1000,
    effectPerLevel: 0.05,
    effectType: 'globalMultiplier',
    maxLevel: 30,
  },
];

export function getUpgradeCost(baseCost: number, level: number): number {
  return Math.floor(baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, level));
}

export function getUpgradeById(id: string): UpgradeDefinition | undefined {
  return UPGRADES.find((u) => u.id === id);
}

/** Base offline cap in seconds (2 hours) before offline_cap upgrades. */
export const BASE_OFFLINE_CAP_SECONDS = 2 * 3600;

/** Base click power before upgrades. */
export const BASE_CLICK_POWER = 1;

/** Base auto rate per second before upgrades. */
export const BASE_AUTO_RATE = 0;
