import { _decorator, Button, Component, Label, Node, Prefab, instantiate } from 'cc';
import { GameManager } from '../core/GameManager';
import { formatCoins } from './UIManager';

const { ccclass, property } = _decorator;

/**
 * Tap button handler — attach to main "摸鱼" button.
 */
@ccclass('TapButton')
export class TapButton extends Component {
  onTap(): void {
    GameManager.instance?.onTap();
  }
}

/**
 * Rewarded ad button — attach to "看广告双倍" button.
 */
@ccclass('AdBoostButton')
export class AdBoostButton extends Component {
  private _busy = false;

  async onWatchAd(): Promise<void> {
    if (this._busy) return;
    this._busy = true;
    try {
      await GameManager.instance?.watchAdForBoost();
    } finally {
      this._busy = false;
    }
  }
}

/**
 * Single upgrade row. Used by UpgradePanel to populate list.
 */
@ccclass('UpgradeRow')
export class UpgradeRow extends Component {
  @property(Label)
  nameLabel: Label | null = null;

  @property(Label)
  descLabel: Label | null = null;

  @property(Label)
  levelLabel: Label | null = null;

  @property(Label)
  costLabel: Label | null = null;

  @property(Button)
  buyButton: Button | null = null;

  private _upgradeId = '';

  setup(
    id: string,
    name: string,
    description: string,
    level: number,
    maxLevel: number,
    cost: number,
    canPurchase: boolean,
    onBuy: (id: string) => void,
  ): void {
    this._upgradeId = id;

    if (this.nameLabel) this.nameLabel.string = name;
    if (this.descLabel) this.descLabel.string = description;
    if (this.levelLabel) this.levelLabel.string = `Lv.${level}/${maxLevel}`;
    if (this.costLabel) {
      this.costLabel.string = level >= maxLevel ? '已满级' : formatCoins(cost);
    }
    if (this.buyButton) {
      this.buyButton.interactable = canPurchase;
      this.buyButton.node.off(Button.EventType.CLICK);
      this.buyButton.node.on(Button.EventType.CLICK, () => onBuy(id), this);
    }
  }
}

/**
 * Upgrade list panel — wire upgradeRowPrefab and content container in editor.
 */
@ccclass('UpgradePanel')
export class UpgradePanel extends Component {
  @property(Prefab)
  upgradeRowPrefab: Prefab | null = null;

  @property(Node)
  contentNode: Node | null = null;

  private _game: GameManager | null = null;

  start(): void {
    this._game = GameManager.instance;
    if (!this._game) return;

    this.rebuild();
    this._game.on('coins_changed', () => this.rebuild());
    this._game.on('upgrade_purchased', () => this.rebuild());
  }

  rebuild(): void {
    if (!this._game || !this.contentNode || !this.upgradeRowPrefab) return;

    this.contentNode.removeAllChildren();
    const states = this._game.upgrades.getAllUpgradeStates();

    for (const state of states) {
      const rowNode = instantiate(this.upgradeRowPrefab);
      this.contentNode.addChild(rowNode);
      const row = rowNode.getComponent(UpgradeRow);
      row?.setup(
        state.id,
        state.name,
        state.description,
        state.level,
        state.maxLevel,
        state.cost,
        state.canPurchase,
        (id) => this.onBuy(id),
      );
    }
  }

  private onBuy(id: string): void {
    const result = this._game?.upgrades.purchase(id);
    if (result?.success) {
      this._game?.saveManager.save();
    }
  }
}
