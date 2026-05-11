import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  standalone: true,
  imports: [RouterLink, MatIconModule, TranslatePipe, BpButtonComponent, FormFieldComponent],
  template: `
    <main class="auth login">
      <section class="form-pane">
        <div class="form-card">
          <h1>{{ 'auth.signIn' | translate }}</h1>
          <p>{{ 'auth.loginSubtitle' | translate }}</p>
          <bp-form-field [label]="'auth.email' | translate" placeholder="admin@refugiowuf.org" />
          <bp-form-field [label]="'auth.password' | translate" type="password" placeholder="••••••••" />
          <a class="forgot" href="#">{{ 'auth.forgot' | translate }}</a>
          <bp-button routerLink="/dashboard">{{ 'auth.signIn' | translate }}</bp-button>
          <small>{{ 'auth.noAccount' | translate }} <a routerLink="/register">{{ 'auth.signUp' | translate }}</a></small>
        </div>
      </section>
      <section class="image-pane"><img src="/assets/bluepatitas/login-dog.png" alt="" /></section>
    </main>
  `,
  styles: [`
    .auth { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; background: #f3faff; }
    .form-pane { display: grid; place-items: center; padding: 64px; }
    .form-card { width: min(440px, 100%); display: grid; gap: 18px; }
    h1 { font-size: 48px; line-height: 1.1; margin: 0; }
    p { margin: 0 0 18px; color: var(--bp-slate-gray); }
    .forgot { justify-self: end; color: var(--bp-action-blue); font-size: 13px; font-weight: 700; }
    small { text-align: center; color: var(--bp-slate-gray); }
    small a { color: var(--bp-action-blue); font-weight: 700; }
    .image-pane { overflow: hidden; background: var(--bp-primary-blue); }
    .image-pane img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
    @media (max-width: 900px) { .auth { grid-template-columns: 1fr; } .image-pane { display: none; } }
  `],
})
export class LoginPage {}
