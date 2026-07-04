import { _decorator, Component } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass } = _decorator;

/** Attach to main "摸鱼" button. */
@ccclass('TapButton')
export class TapButton extends Component {
  onTap(): void {
    GameManager.instance?.onTap();
  }
}
