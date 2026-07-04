import {
  DouyinAPI,
  DouyinRewardedVideoAd,
  getDouyinAPI,
  isDouyinRuntime,
} from './DouyinTypes';

const SAVE_STORAGE_KEY = 'moyu_factory_save_v1';

/**
 * Douyin mini game platform adapter (singleton).
 * Uses tt.* on device; localStorage in Cocos editor / browser preview.
 */
export class DouyinPlatform {
  private static _instance: DouyinPlatform | null = null;

  static get instance(): DouyinPlatform {
    if (!DouyinPlatform._instance) {
      DouyinPlatform._instance = new DouyinPlatform();
    }
    return DouyinPlatform._instance;
  }

  private adUnitId = '';
  private rewardedAd: DouyinRewardedVideoAd | null = null;
  private pendingAdResolve: ((watched: boolean) => void) | null = null;
  private closeHandler: ((data: { isEnded: boolean; count?: number }) => void) | null = null;
  private errorHandler: ((err: { errCode: number; errMsg?: string }) => void) | null = null;

  isDouyin(): boolean {
    return isDouyinRuntime();
  }

  /** Initialize rewarded video ad — call once on boot with traffic主 ad unit id. */
  init(adUnitId: string): void {
    this.adUnitId = adUnitId;
    if (!this.isDouyin()) {
      console.log('[DouyinPlatform] Editor mode: rewarded ad stub enabled');
      return;
    }

    const tt = getDouyinAPI()!;
    this.rewardedAd = tt.createRewardedVideoAd({
      adUnitId,
      multiton: true,
      multitonRewardMsg: ['500摸鱼值', '700摸鱼值', '900摸鱼值'],
      multitonRewardTimes: 3,
      progressTip: true,
    });

    this.closeHandler = (data) => {
      this.pendingAdResolve?.(data.isEnded);
      this.pendingAdResolve = null;
      this.preloadAd();
    };

    this.errorHandler = (err) => {
      console.warn('[DouyinPlatform] Ad error', err);
      this.pendingAdResolve?.(false);
      this.pendingAdResolve = null;
    };

    this.rewardedAd.onClose(this.closeHandler);
    this.rewardedAd.onError(this.errorHandler);
    this.preloadAd();
  }

  private preloadAd(): void {
    this.rewardedAd?.load().catch(() => {
      /* retry on next show */
    });
  }

  /** Show rewarded video; resolves true when user watched to end. */
  showRewardedAd(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isDouyin()) {
        setTimeout(() => resolve(true), 500);
        return;
      }

      if (!this.rewardedAd) {
        resolve(false);
        return;
      }

      this.pendingAdResolve = resolve;
      this.rewardedAd.show().catch(() => {
        this.preloadAd();
        this.pendingAdResolve?.(false);
        this.pendingAdResolve = null;
      });
    });
  }

  loadData(): string | null {
    try {
      if (this.isDouyin()) {
        const val = getDouyinAPI()!.getStorageSync(SAVE_STORAGE_KEY);
        return val || null;
      }
      return localStorage.getItem(SAVE_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  saveData(json: string): void {
    try {
      if (this.isDouyin()) {
        getDouyinAPI()!.setStorageSync(SAVE_STORAGE_KEY, json);
      } else {
        localStorage.setItem(SAVE_STORAGE_KEY, json);
      }
    } catch (e) {
      console.warn('[DouyinPlatform] saveData failed', e);
    }
  }

  clearSave(): void {
    try {
      if (this.isDouyin()) {
        getDouyinAPI()!.removeStorageSync(SAVE_STORAGE_KEY);
      } else {
        localStorage.removeItem(SAVE_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[DouyinPlatform] clearSave failed', e);
    }
  }

  showToast(title: string): void {
    const tt = getDouyinAPI();
    if (tt?.showToast) {
      tt.showToast({ title, icon: 'none', duration: 2000 });
    } else {
      console.log('[Toast]', title);
    }
  }

  /** Sidebar revisit hook (必接能力 placeholder). */
  checkSidebarAvailable(callback: (available: boolean) => void): void {
    const tt = getDouyinAPI();
    if (!tt?.checkScene) {
      callback(false);
      return;
    }
    tt.checkScene({
      scene: 'sidebar',
      success: (res) => callback(res.isExist),
      fail: () => callback(false),
    });
  }

  navigateToSidebar(onSuccess?: () => void, onFail?: () => void): void {
    const tt = getDouyinAPI();
    if (!tt?.navigateToScene) {
      onFail?.();
      return;
    }
    tt.navigateToScene({
      scene: 'sidebar',
      success: onSuccess,
      fail: onFail,
    });
  }

  onAppShow(callback: () => void): void {
    /* tt.onShow available on platform — wire when adding lifecycle hooks */
    if (this.isDouyin()) {
      const tt = getDouyinAPI() as DouyinAPI & { onShow?: (cb: () => void) => void };
      tt.onShow?.(callback);
    }
  }

  onAppHide(callback: () => void): void {
    if (this.isDouyin()) {
      const tt = getDouyinAPI() as DouyinAPI & { onHide?: (cb: () => void) => void };
      tt.onHide?.(callback);
    }
  }
}
