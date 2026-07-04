/**
 * Douyin mini game (tt) API type stubs for editor / browser testing.
 * At runtime on Douyin, `globalThis.tt` is injected by the platform.
 */

export interface DouyinRewardedVideoAd {
  load(): Promise<void>;
  show(): Promise<void>;
  onClose(callback: (data: { isEnded: boolean; count?: number }) => void): void;
  onError(callback: (err: { errCode: number; errMsg?: string }) => void): void;
  offClose(callback?: (data: { isEnded: boolean; count?: number }) => void): void;
}

export interface DouyinRewardedVideoAdOptions {
  adUnitId: string;
  multiton?: boolean;
  multitonRewardMsg?: string[];
  multitonRewardTimes?: number;
  progressTip?: boolean;
}

export interface DouyinAPI {
  getStorageSync(key: string): string;
  setStorageSync(key: string, data: string): void;
  removeStorageSync(key: string): void;
  createRewardedVideoAd(options: DouyinRewardedVideoAdOptions): DouyinRewardedVideoAd;
  showToast?(options: { title: string; icon?: string; duration?: number }): void;
  /** Sidebar revisit — implement when wiring required platform capabilities. */
  navigateToScene?(options: { scene: string; success?: () => void; fail?: (err: unknown) => void }): void;
  checkScene?(options: {
    scene: string;
    success?: (res: { isExist: boolean }) => void;
    fail?: (err: unknown) => void;
  }): void;
}

declare global {
  // eslint-disable-next-line no-var
  var tt: DouyinAPI | undefined;
}

export function getDouyinAPI(): DouyinAPI | null {
  if (typeof globalThis !== 'undefined' && globalThis.tt) {
    return globalThis.tt;
  }
  return null;
}

export function isDouyinRuntime(): boolean {
  return getDouyinAPI() !== null;
}
