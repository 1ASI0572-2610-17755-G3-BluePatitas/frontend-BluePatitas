import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoginUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { FcmNotificationService } from '../../shared/services/fcm-notification.service';

@Component({
  standalone: true,
  imports: [RouterLink, MatIconModule, TranslatePipe, BpButtonComponent, FormFieldComponent],
  template: `
    <main class="auth login">
      <section class="form-pane">
        <div class="form-card">
          <h1>{{ 'auth.signIn' | translate }}</h1>
          <p>{{ 'auth.loginSubtitle' | translate }}</p>
          
          @if (errorMessage) {
            <div class="error-banner">{{ errorMessage }}</div>
          }

          <bp-form-field [label]="'auth.email' | translate" placeholder="admin@refugiowuf.org" [(value)]="email" />
          <bp-form-field [label]="'auth.password' | translate" type="password" placeholder="••••••••" [(value)]="password" />
          <a class="forgot" href="#">{{ 'auth.forgot' | translate }}</a>
          <bp-button (clicked)="onSubmit()">{{ 'auth.signIn' | translate }}</bp-button>
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
    .error-banner { padding: 12px 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #991b1b; font-size: 14px; font-weight: 500; }
    @media (max-width: 900px) { .auth { grid-template-columns: 1fr; } .image-pane { display: none; } }
  `],
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly router: Router,
    private readonly fcmService: FcmNotificationService
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa correo y contraseña.';
      return;
    }

    try {
      const result = await this.loginUseCase.execute(this.email.trim(), this.password);
      if (result) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        
        // Request Notification permission and send FCM token to backend
        this.fcmService.requestPermissionAndRegisterToken(result.user.id);

        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
      }
    } catch (error) {
      this.errorMessage = 'Ocurrió un error al iniciar sesión.';
    }
  }
}

