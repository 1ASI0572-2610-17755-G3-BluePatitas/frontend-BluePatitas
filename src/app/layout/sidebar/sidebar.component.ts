import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface NavItem {
  labelKey: string;
  path: string;
}

@Component({
  selector: 'bp-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
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
            <span class="nav-icon" aria-hidden="true"></span>
            {{ item.labelKey | translate }}
          </a>
        }
      </nav>
      <footer>
        <img src="/assets/bluepatitas/admin-avatar.png" alt="" />
        <strong>{{ 'topbar.role' | translate }}</strong>
        <span class="logout-mark" aria-hidden="true"></span>
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
    .nav-icon { width: 18px; height: 18px; border-radius: 6px; border: 2px solid currentColor; opacity: .86; position: relative; flex: 0 0 auto; }
    .nav-icon::after { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: currentColor; }
    footer { margin-top: auto; display: flex; align-items: center; gap: 12px; padding: 20px 16px; border-top: 1px solid var(--bp-border); }
    footer img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
    .logout-mark { margin-left: auto; width: 16px; height: 16px; border: 2px solid currentColor; border-left: 0; border-radius: 3px; opacity: .72; }
  `],
})
export class SidebarComponent {
  readonly items: NavItem[] = [
    { labelKey: 'nav.dashboard', path: '/dashboard' },
    { labelKey: 'nav.animals', path: '/animals' },
    { labelKey: 'nav.monitoring', path: '/monitoring' },
    { labelKey: 'nav.veterinarians', path: '/veterinarians' },
    { labelKey: 'nav.settings', path: '/settings' },
  ];
}
