import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe, BpButtonComponent, FormFieldComponent],
  template: `
    <main class="auth register">
      <section class="image-pane"><img src="/assets/bluepatitas/register-dog.png" alt="" /></section>
      <section class="form-pane">
        <div class="form-card">
          <h1>{{ 'auth.registerTitle' | translate }}</h1>
          <p>{{ 'auth.registerSubtitle' | translate }}</p>
          <div class="split">
            <bp-form-field [label]="'auth.firstName' | translate" />
            <bp-form-field [label]="'auth.lastName' | translate" />
          </div>
          <bp-form-field [label]="'auth.email' | translate" />
          <bp-form-field [label]="'auth.phone' | translate" />
          <bp-form-field [label]="'auth.role' | translate" [placeholder]="'auth.selectRole' | translate" />
          <bp-form-field [label]="'auth.password' | translate" type="password" />
          <bp-button routerLink="/onboarding/refuge/basic-info">{{ 'auth.registerTitle' | translate }}</bp-button>
          <small>{{ 'auth.hasAccount' | translate }} <a routerLink="/login">{{ 'auth.loginHere' | translate }}</a></small>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .auth { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; background: #f3faff; }
    .image-pane { overflow: hidden; background: var(--bp-primary-blue); }
    .image-pane img { width: 100%; height: 100%; object-fit: cover; }
    .form-pane { display: grid; place-items: center; padding: 40px 64px; }
    .form-card { width: min(440px, 100%); display: grid; gap: 14px; }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    h1 { font-size: 44px; line-height: 1.1; margin: 0; }
    p, small { color: var(--bp-slate-gray); }
    small { text-align: center; }
    a { color: var(--bp-action-blue); font-weight: 700; }
    @media (max-width: 900px) { .auth { grid-template-columns: 1fr; } .image-pane { display: none; } .split { grid-template-columns: 1fr; } }
  `],
})
export class RegisterPage {}
