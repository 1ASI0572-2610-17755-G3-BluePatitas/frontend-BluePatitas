import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface NavItem {
  labelKey: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'bp-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslatePipe],
  template: `
    <aside>
      <div class="brand">
        <span><img src="/assets/bluepatitas/bluepatitas-logo.png" alt="BluePatitas" /></span>
      </div>
      <section class="shelter">
        <strong>{{ 'topbar.shelter' | translate }}</strong>
        <small>{{ 'topbar.role' | translate }}</small>
      </section>
      <nav>
        @for (item of items; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active">
            <mat-icon>{{ item.icon }}</mat-icon>
            {{ item.labelKey | translate }}
          </a>
        }
      </nav>
      <footer>
        <img src="/assets/bluepatitas/admin-avatar.png" alt="" />
        <strong>{{ 'topbar.role' | translate }}</strong>
        <mat-icon>logout</mat-icon>
      </footer>
    </aside>
  `,
  styles: [`
    aside { width: 280px; height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; background: white; border-right: 1px solid var(--bp-border); }
    .brand { display: grid; place-items: center; padding: 28px 24px 18px; }
    .brand span { display: grid; place-items: center; width: 122px; height: 122px; border-radius: 50%; background: var(--bp-dark-navy); overflow: hidden; }
    .brand img { width: 90px; height: 90px; object-fit: contain; }
    .shelter { margin: 8px 24px 28px; padding: 14px; border-radius: 10px; background: var(--bp-surface-blue); border: 1px solid rgba(141,185,216,.28); display: grid; gap: 4px; }
    .shelter small, footer { color: var(--bp-slate-gray); }
    nav { display: grid; gap: 6px; padding: 0 16px; }
    a { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 0 18px; border-radius: 8px; color: var(--bp-slate-gray); font-weight: 700; }
    a.active { color: var(--bp-action-blue); background: #d6e3ff; border-left: 4px solid var(--bp-action-blue); }
    footer { margin-top: auto; display: flex; align-items: center; gap: 12px; padding: 20px 16px; border-top: 1px solid var(--bp-border); }
    footer img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
    footer mat-icon { margin-left: auto; font-size: 18px; }
  `],
})
export class SidebarComponent {
  readonly items: NavItem[] = [
    { labelKey: 'nav.dashboard', icon: 'dashboard', path: '/dashboard' },
    { labelKey: 'nav.animals', icon: 'pets', path: '/animals' },
    { labelKey: 'nav.monitoring', icon: 'sensors', path: '/monitoring' },
    { labelKey: 'nav.veterinarians', icon: 'medical_services', path: '/veterinarians' },
    { labelKey: 'nav.settings', icon: 'settings', path: '/settings' },
  ];
}
