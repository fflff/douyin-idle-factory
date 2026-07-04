import { GameSaveData } from './GameTypes';

export type ResourceChangeListener = (coins: number) => void;

/**
 * Manages the primary resource (摸鱼值 / coins).
 */
export class ResourceManager {
  private _coins = 0;
  private _listeners: ResourceChangeListener[] = [];

  get coins(): number {
    return this._coins;
  }

  set coins(value: number) {
    this._coins = Math.max(0, value);
    this.notify();
  }

  add(amount: number): void {
    if (amount <= 0) return;
    this._coins += amount;
    this.notify();
  }

  spend(amount: number): boolean {
    if (amount <= 0 || this._coins < amount) return false;
    this._coins -= amount;
    this.notify();
    return true;
  }

  canAfford(amount: number): boolean {
    return this._coins >= amount;
  }

  onChange(listener: ResourceChangeListener): void {
    this._listeners.push(listener);
  }

  offChange(listener: ResourceChangeListener): void {
    this._listeners = this._listeners.filter((l) => l !== listener);
  }

  loadFromSave(data: GameSaveData): void {
    this._coins = data.coins;
    this.notify();
  }

  toSaveFragment(): Pick<GameSaveData, 'coins'> {
    return { coins: this._coins };
  }

  private notify(): void {
    for (const listener of this._listeners) {
      listener(this._coins);
    }
  }
}
