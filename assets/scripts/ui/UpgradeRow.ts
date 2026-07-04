import { _decorator, Button, Component, Label } from 'cc';
import { formatCoins } from './FormatUtils';

const { ccclass, property } = _decorator;

/** Single upgrade row — used as UpgradeRow prefab root. */
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
