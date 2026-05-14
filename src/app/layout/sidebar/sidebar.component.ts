import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface NavItem {
  labelKey: string;
  path: string;
  icon: 'dashboard' | 'animals' | 'monitoring' | 'veterinarians' | 'settings';
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
          <a [routerLink]="item.path" routerLinkActive="active" (click)="navigate.emit()">
            <span class="nav-icon" [class]="item.icon" aria-hidden="true"></span>
            {{ item.labelKey | translate }}
          </a>
        }
      </nav>
      <footer>
        <img src="/assets/bluepatitas/admin-avatar.png" alt="" />
        <strong>{{ 'topbar.role' | translate }}</strong>
        <button type="button" (click)="logout()" [attr.aria-label]="'common.logout' | translate">
          <span class="logout-mark" aria-hidden="true"></span>
        </button>
      </footer>
    </aside>
  `,
  styles: [`
    :host { display: block; width: 238px; max-width: 82vw; }
    aside { width: 238px; height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; background: white; border-right: 1px solid var(--bp-border); }
    .brand { display: grid; place-items: center; padding: 22px 24px 14px; }
    .brand span { display: grid; place-items: center; width: 92px; height: 92px; border-radius: 50%; background: var(--bp-dark-navy); overflow: hidden; }
    .brand img { width: 72px; height: 72px; object-fit: contain; }
    .shelter { margin: 8px 20px 28px; padding: 12px; border-radius: 6px; background: var(--bp-surface-blue); border: 1px solid rgba(141,185,216,.28); display: grid; gap: 3px; }
    .shelter small, footer { color: var(--bp-slate-gray); }
    nav { display: grid; gap: 8px; padding: 0 12px; }
    a { display: flex; align-items: center; gap: 12px; min-height: 40px; padding: 0 14px; border-radius: 6px; color: #445363; font-weight: 600; font-size: 13px; border-left: 4px solid transparent; }
    a.active { color: var(--bp-action-blue); background: #cdddfd; border-left-color: var(--bp-action-blue); font-weight: 800; }
    .nav-icon { width: 18px; height: 18px; position: relative; flex: 0 0 auto; color: currentColor; }
    .nav-icon::before, .nav-icon::after { content: ''; position: absolute; box-sizing: border-box; }
    .dashboard::before { inset: 1px; border: 2px solid currentColor; border-radius: 2px; box-shadow: 8px 0 0 -2px currentColor, 0 8px 0 -2px currentColor, 8px 8px 0 -2px currentColor; }
    .animals::before { width: 8px; height: 8px; left: 5px; top: 8px; border-radius: 50% 50% 45% 45%; background: currentColor; }
    .animals::after { width: 4px; height: 4px; left: 2px; top: 4px; border-radius: 50%; background: currentColor; box-shadow: 5px -3px 0 currentColor, 10px 0 0 currentColor, 13px 5px 0 currentColor; }
    .monitoring::before { left: 2px; top: 5px; width: 14px; height: 8px; border-left: 2px solid currentColor; border-right: 2px solid currentColor; border-radius: 50%; }
    .monitoring::after { left: 7px; top: 8px; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
    .veterinarians::before { inset: 3px 1px 1px; border: 2px solid currentColor; border-radius: 2px; }
    .veterinarians::after { left: 7px; top: 0; width: 4px; height: 10px; border: 2px solid currentColor; border-top: 0; border-bottom: 0; }
    .settings::before { inset: 2px; border: 2px solid currentColor; border-radius: 50%; }
    .settings::after { left: 7px; top: 7px; width: 4px; height: 4px; border-radius: 50%; background: currentColor; box-shadow: 0 -8px 0 -1px currentColor, 0 8px 0 -1px currentColor, -8px 0 0 -1px currentColor, 8px 0 0 -1px currentColor; }
    footer { margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-top: 1px solid var(--bp-border); font-size: 13px; }
    footer img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
    footer button { margin-left: auto; width: 30px; height: 30px; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: currentColor; cursor: pointer; }
    footer button:hover { background: var(--bp-surface-blue); color: var(--bp-action-blue); }
    .logout-mark { margin-left: auto; width: 16px; height: 16px; border: 2px solid currentColor; border-left: 0; border-radius: 3px; opacity: .72; }
    @media (max-width: 920px) {
      aside { width: min(238px, 82vw); position: relative; }
    }
  `],
})
export class SidebarComponent {
  constructor(private readonly router: Router) {}

  @Output() navigate = new EventEmitter<void>();

  readonly items: NavItem[] = [
    { labelKey: 'nav.dashboard', path: '/dashboard', icon: 'dashboard' },
    { labelKey: 'nav.animals', path: '/animals', icon: 'animals' },
    { labelKey: 'nav.monitoring', path: '/monitoring', icon: 'monitoring' },
    { labelKey: 'nav.veterinarians', path: '/veterinarians', icon: 'veterinarians' },
    { labelKey: 'nav.settings', path: '/settings', icon: 'settings' },
  ];

  logout(): void {
    this.navigate.emit();
    void this.router.navigateByUrl('/login');
  }
}
