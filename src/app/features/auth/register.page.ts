import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { CreateUserUseCase, LoginUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { User } from '../../core/domain/models/bluepatitas.models';

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

          @if (errorMessage) {
            <div class="error-banner">{{ errorMessage }}</div>
          }

          <div class="split">
            <bp-form-field [label]="'auth.firstName' | translate" [(value)]="firstName" />
            <bp-form-field [label]="'auth.lastName' | translate" [(value)]="lastName" />
          </div>
          <bp-form-field [label]="'auth.email' | translate" [(value)]="email" />
          <bp-form-field [label]="'auth.phone' | translate" [(value)]="phone" />
          <bp-form-field [label]="'auth.role' | translate" [placeholder]="'auth.selectRole' | translate" [(value)]="role" />
          <bp-form-field [label]="'auth.password' | translate" type="password" [(value)]="password" />
          <bp-button (clicked)="onSubmit()">{{ 'auth.registerTitle' | translate }}</bp-button>
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
    .error-banner { padding: 12px 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #991b1b; font-size: 14px; font-weight: 500; }
    @media (max-width: 900px) { .auth { grid-template-columns: 1fr; } .image-pane { display: none; } .split { grid-template-columns: 1fr; } }
  `],
})
export class RegisterPage {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  role = 'Administrator';
  password = '';
  errorMessage = '';

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly router: Router
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.role || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos del formulario.';
      return;
    }

    try {
      const userData = {
        name: `${this.firstName.trim()} ${this.lastName.trim()}`,
        role: this.role.trim() as 'Administrator' | 'Veterinarian' | 'Caretaker',
        email: this.email.trim(),
        status: 'Active',
        password: this.password
      };

      await this.createUserUseCase.execute(userData as any);

      // Auto login after registration so subsequent onboarding requests are authenticated
      try {
        const result = await this.loginUseCase.execute(this.email.trim(), this.password);
        if (result) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('currentUser', JSON.stringify(result.user));
        }
      } catch (loginErr) {
        console.error('Error during auto-login:', loginErr);
      }

      this.router.navigate(['/onboarding/refuge/basic-info']);
    } catch (error) {
      this.errorMessage = 'Ocurrió un error al registrar el usuario.';
    }
  }
}

