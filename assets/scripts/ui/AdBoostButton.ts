import { _decorator, Component } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass } = _decorator;

/** Attach to "看广告双倍" button. */
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
