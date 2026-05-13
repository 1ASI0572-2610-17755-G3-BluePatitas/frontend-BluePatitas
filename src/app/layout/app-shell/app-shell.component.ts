import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'bp-app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell" [class.drawer-open]="sidebarOpen">
      <button class="drawer-backdrop" type="button" aria-label="Close menu" (click)="sidebarOpen = false"></button>
      <bp-sidebar class="shell-sidebar" (navigate)="sidebarOpen = false" />
      <main>
        <bp-topbar (menuClicked)="sidebarOpen = true" />
        <section class="content">
          <router-outlet />
        </section>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; background: var(--bp-soft-background); overflow-x: clip; }
    main { min-width: 0; flex: 1; }
    .content { width: min(100%, 1180px); padding: 0 32px 32px; }
    .drawer-backdrop { display: none; }

    @media (max-width: 920px) {
      .shell { display: block; }
      .shell-sidebar { position: fixed; inset: 0 auto 0 0; z-index: 60; transform: translateX(-104%); transition: transform .22s ease; }
      .drawer-open .shell-sidebar { transform: translateX(0); }
      .drawer-backdrop { position: fixed; inset: 0; z-index: 50; border: 0; background: rgba(11, 31, 47, .42); cursor: pointer; }
      .drawer-open .drawer-backdrop { display: block; }
      .content { width: 100%; padding: 0 18px 24px; }
    }
  `],
})
export class AppShellComponent {
  sidebarOpen = false;

  @HostListener('window:keydown.escape')
  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
