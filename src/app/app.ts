import { Component, inject, HostListener } from '@angular/core';
import { WakeLock } from './wake-lock';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected wakeLock = inject(WakeLock);

  // Re-acquire lock when the page becomes visible again (user switches back to tab)
  @HostListener('document:visibilitychange')
  async onVisibilityChange() {
    if (document.visibilityState === 'visible' && this.wakeLock.isActive()) {
      await this.wakeLock.enable();
    }
  }
}
