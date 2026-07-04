import { _decorator, Component, game } from 'cc';
import { AD_BOOST_DURATION_MS, AUTO_TICK_INTERVAL, REWARDED_AD_UNIT_ID } from '../config/GameConstants';
import { IdleProduction } from './IdleProduction';
import { ResourceManager } from './ResourceManager';
import { SaveManager } from './SaveManager';
import { UpgradeSystem } from './UpgradeSystem';
import { DouyinPlatform } from '../platform/DouyinPlatform';

const { ccclass, property } = _decorator;

export type GameEventType =
  | 'coins_changed'
  | 'upgrade_purchased'
  | 'offline_collected'
  | 'boost_activated'
  | 'boost_expired';

export type GameEventListener = (type: GameEventType, payload?: unknown) => void;

/**
 * Central game orchestrator. Attach to a persistent root node in Main scene.
 */
@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager | null = null;

  readonly resources = new ResourceManager();
  readonly production = new IdleProduction();
  readonly platform = DouyinPlatform.instance;
  readonly saveManager = new SaveManager(this.resources, this.production, this.platform);
  readonly upgrades = new UpgradeSystem(this.resources, this.production);

  private _eventListeners: GameEventListener[] = [];
  private _autoTickAccumulator = 0;
  private _initialized = false;

  static get instance(): GameManager | null {
    return GameManager._instance;
  }

  onLoad(): void {
    if (GameManager._instance && GameManager._instance !== this) {
      this.node.destroy();
      return;
    }
    GameManager._instance = this;
    game.addPersistRootNode(this.node);
  }

  start(): void {
    if (this._initialized) return;
    this._initialized = true;

    this.platform.init(REWARDED_AD_UNIT_ID);
    const save = this.saveManager.load();

    const offline = this.production.calcOfflineEarnings(save.lastSaveTimestamp);
    if (offline > 0) {
      this.resources.add(offline);
      this.emit('offline_collected', offline);
    }

    this.resources.onChange(() => this.emit('coins_changed'));
    this.upgrades.onUpgrade((id, level) => this.emit('upgrade_purchased', { id, level }));

    this.saveManager.startAutoSave();
    this.saveManager.save();
  }

  update(dt: number): void {
    this.production.refreshBoost();
    const wasBoosted = this.production.isBoostActive();

    this._autoTickAccumulator += dt;
    while (this._autoTickAccumulator >= AUTO_TICK_INTERVAL) {
      this._autoTickAccumulator -= AUTO_TICK_INTERVAL;
      const yield_ = this.production.getAutoTickYield();
      if (yield_ > 0) {
        this.resources.add(yield_);
      }
    }

    if (wasBoosted && !this.production.isBoostActive()) {
      this.emit('boost_expired');
    }
  }

  onDestroy(): void {
    this.saveManager.stopAutoSave();
    this.saveManager.save();
    if (GameManager._instance === this) {
      GameManager._instance = null;
    }
  }

  /** Player tap on main production button. */
  onTap(): void {
    const yield_ = this.production.getClickYield();
    this.resources.add(yield_);
    this.saveManager.incrementTaps();
  }

  /** Watch rewarded ad for temporary 2x boost. */
  async watchAdForBoost(): Promise<boolean> {
    const watched = await this.platform.showRewardedAd();
    if (watched) {
      this.production.activateBoost(AD_BOOST_DURATION_MS, 2);
      this.emit('boost_activated');
      this.platform.showToast('双倍摸鱼生效 5 分钟！');
      this.saveManager.save();
    }
    return watched;
  }

  on(event: GameEventType, listener: GameEventListener): void {
    this._eventListeners.push((type, payload) => {
      if (type === event) listener(type, payload);
    });
  }

  private emit(type: GameEventType, payload?: unknown): void {
    for (const listener of this._eventListeners) {
      listener(type, payload);
    }
  }
}
