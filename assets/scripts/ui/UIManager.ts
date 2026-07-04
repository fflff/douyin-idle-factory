import { _decorator, Component, Label } from 'cc';
import { GameManager } from '../core/GameManager';
import { GAME_TITLE } from '../config/GameConstants';

const { ccclass, property } = _decorator;

/** Formats large numbers for mobile UI (e.g. 1.2K, 3.4M). */
export function formatCoins(value: number): string {
  if (value < 1000) return Math.floor(value).toString();
  if (value < 1_000_000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return `${(value / 1_000_000_000).toFixed(1)}B`;
}

/**
 * Updates HUD labels: coins, auto rate, boost timer.
 * Wire Label references in Cocos Editor.
 */
@ccclass('UIManager')
export class UIManager extends Component {
  @property(Label)
  coinsLabel: Label | null = null;

  @property(Label)
  autoRateLabel: Label | null = null;

  @property(Label)
  boostLabel: Label | null = null;

  @property(Label)
  titleLabel: Label | null = null;

  private _game: GameManager | null = null;

  start(): void {
    this._game = GameManager.instance;
    if (!this._game) {
      console.error('[UIManager] GameManager not found');
      return;
    }

    if (this.titleLabel) {
      this.titleLabel.string = GAME_TITLE;
    }

    this.refresh();
    this._game.on('coins_changed', () => this.refresh());
    this._game.on('upgrade_purchased', () => this.refresh());
    this._game.on('offline_collected', () => this.refreshOffline());
    this._game.on('boost_activated', () => this.refresh());
    this._game.on('boost_expired', () => this.refresh());
  }

  update(): void {
    if (!this._game) return;
    if (this._game.production.isBoostActive() && this.boostLabel) {
      const sec = Math.ceil(this._game.production.getBoostRemainingMs() / 1000);
      this.boostLabel.string = `双倍 ${sec}s`;
      this.boostLabel.node.active = true;
    } else if (this.boostLabel) {
      this.boostLabel.node.active = false;
    }
  }

  private refresh(): void {
    if (!this._game) return;
    const stats = this._game.production.getStats();

    if (this.coinsLabel) {
      this.coinsLabel.string = formatCoins(this._game.resources.coins);
    }
    if (this.autoRateLabel) {
      this.autoRateLabel.string = `+${formatCoins(stats.autoRatePerSecond)}/秒`;
    }
  }

  private refreshOffline(): void {
    /* Hook: show offline popup — extend in Week 3 */
  }
}
