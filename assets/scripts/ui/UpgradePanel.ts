import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { GameManager } from '../core/GameManager';
import { UpgradeRow } from './UpgradeRow';

const { ccclass, property } = _decorator;

/** Upgrade list panel — wire upgradeRowPrefab and content container in editor. */
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
