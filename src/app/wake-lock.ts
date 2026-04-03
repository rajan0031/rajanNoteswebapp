import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WakeLock {
  private wakeLock: WakeLockSentinel | null = null;
  private fallbackInterval: any = null;
  private lastX = 0;
  private lastY = 0;

  isActive = signal(false);
  isSupported = signal('wakeLock' in navigator);
  errorMessage = signal('');

  async enable(): Promise<void> {
    if (!this.isSupported()) {
      this.errorMessage.set('Screen Wake Lock API is not supported in this browser.');
      // Even if API not supported, start fallback
      this.startFallbackKeepAlive();
      return;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.isActive.set(true);
      this.errorMessage.set('');

      // Also start fallback as backup for corporate VWDs that block Wake Lock
      this.startFallbackKeepAlive();

      // When the lock is released (e.g. tab loses focus), update state
      this.wakeLock.addEventListener('release', () => {
        this.isActive.set(false);
        this.stopFallbackKeepAlive();
      });
    } catch (err: any) {
      this.errorMessage.set(`Could not activate: ${err.message}`);
      // Start fallback even if Wake Lock fails
      this.startFallbackKeepAlive();
    }
  }

  async disable(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
    this.isActive.set(false);
    this.stopFallbackKeepAlive();
  }

  async toggle(): Promise<void> {
    this.isActive() ? await this.disable() : await this.enable();
  }

  /**
   * Fallback method: simulate periodic user activity to prevent Windows sleep.
   * Works by moving the mouse slightly in a hidden element, which tricks Windows
   * into thinking the user is still active.
   */
  private startFallbackKeepAlive(): void {
    // Only start if not already running
    if (this.fallbackInterval) {
      return;
    }

    // Create a hidden canvas element for subtle mouse movements
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = '-9999px';
    canvas.style.top = '-9999px';
    canvas.id = 'wake-lock-canvas';
    document.body.appendChild(canvas);

    // Move mouse every 30 seconds to simulate activity
    this.fallbackInterval = setInterval(() => {
      // Simulate small mouse movements
      this.lastX = (this.lastX + 1) % 100;
      this.lastY = (this.lastY + 1) % 100;

      // Create a mouse move event on the hidden canvas
      const event = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: this.lastX,
        clientY: this.lastY,
      });
      canvas.dispatchEvent(event);

      // Also dispatch a dummy keyboard event as extra insurance
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          code: 'Space',
          bubbles: true,
          cancelable: true,
        })
      );
    }, 30000); // Every 30 seconds
  }

  private stopFallbackKeepAlive(): void {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    // Remove the hidden canvas
    const canvas = document.getElementById('wake-lock-canvas');
    if (canvas) {
      canvas.remove();
    }
  }
}

