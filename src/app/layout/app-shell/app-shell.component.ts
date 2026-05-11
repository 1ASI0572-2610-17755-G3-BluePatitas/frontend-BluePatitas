import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'bp-app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <bp-sidebar />
      <main>
        <bp-topbar />
        <section class="content">
          <router-outlet />
        </section>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; background: var(--bp-soft-background); }
    main { min-width: 0; flex: 1; }
    .content { padding: 0 32px 32px; }
  `],
})
export class AppShellComponent {}
