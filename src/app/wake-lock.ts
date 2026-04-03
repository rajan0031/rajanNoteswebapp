import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WakeLock {
  private wakeLock: WakeLockSentinel | null = null;

  isActive = signal(false);
  isSupported = signal('wakeLock' in navigator);
  errorMessage = signal('');

  async enable(): Promise<void> {
    if (!this.isSupported()) {
      this.errorMessage.set('Screen Wake Lock API is not supported in this browser.');
      return;
    }
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.isActive.set(true);
      this.errorMessage.set('');

      // When the lock is released (e.g. tab loses focus), update state
      this.wakeLock.addEventListener('release', () => {
        this.isActive.set(false);
      });
    } catch (err: any) {
      this.errorMessage.set(`Could not activate: ${err.message}`);
    }
  }

  async disable(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      this.isActive.set(false);
    }
  }

  async toggle(): Promise<void> {
    this.isActive() ? await this.disable() : await this.enable();
  }
}
