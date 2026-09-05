import { Component, inject, HostListener, OnInit, signal } from '@angular/core';
import { WakeLock } from './wake-lock';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected wakeLock = inject(WakeLock);
  protected visitCount = signal(0);
  private visitChannel?: BroadcastChannel;
  protected securityCode = '';
  protected securityError = '';
  protected isUnlocked = localStorage.getItem('question-bank-unlocked') === 'true';

  private readonly requiredSecurityCode = '@Deepika@99%';

  ngOnInit(): void {
    this.countVisit();

    if ('BroadcastChannel' in window) {
      this.visitChannel = new BroadcastChannel('question-bank-visits');
      this.visitChannel.onmessage = event => {
        if (typeof event.data === 'number') {
          this.visitCount.set(event.data);
        }
      };
    }
  }

  private async countVisit(): Promise<void> {
    try {
      const result = await fetch('/.netlify/functions/visits', { method: 'POST' });
      if (!result.ok) {
        throw new Error(`Visit request failed with status ${result.status}`);
      }

      const { count } = await result.json() as { count: number };
      this.visitCount.set(count);
      this.visitChannel?.postMessage(count);
    } catch (error) {
      console.error('Unable to count visit:', error);
    }
  }

  protected unlock(): void {
    if (this.securityCode === this.requiredSecurityCode) {
      this.isUnlocked = true;
      this.securityError = '';
      localStorage.setItem('question-bank-unlocked', 'true');
      return;
    }

    this.securityError = 'Incorrect security code. Please try again.';
    this.securityCode = '';
  }

  // Re-acquire lock when the page becomes visible again (user switches back to tab)
  @HostListener('document:visibilitychange')
  async onVisibilityChange() {
    if (document.visibilityState === 'visible' && this.wakeLock.isActive()) {
      await this.wakeLock.enable();
    }
  }
}
