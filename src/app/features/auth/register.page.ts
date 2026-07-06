import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { CreateUserUseCase, LoginUseCase, RedeemVeterinarianCodeUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { SessionService } from '../../core/auth/session.service';
import { FcmNotificationService } from '../../shared/services/fcm-notification.service';

type RegisterAccountType = 'admin' | 'veterinarian';

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

          @if (errorKey) {
            <div class="error-banner">{{ errorKey | translate }}</div>
          }

          <div class="account-selector" role="group" [attr.aria-label]="'auth.accountType' | translate">
            <span>{{ 'auth.accountType' | translate }}</span>
            <div class="account-options">
              <button type="button" [class.active]="accountType === 'admin'" (click)="setAccountType('admin')">
                {{ 'auth.shelterAdministrator' | translate }}
              </button>
              <button type="button" [class.active]="accountType === 'veterinarian'" (click)="setAccountType('veterinarian')">
                {{ 'auth.veterinarian' | translate }}
              </button>
            </div>
          </div>

          @if (accountType === 'admin') {
            <div class="split">
              <bp-form-field [label]="'auth.firstName' | translate" [(value)]="firstName" />
              <bp-form-field [label]="'auth.lastName' | translate" [(value)]="lastName" />
            </div>
            <bp-form-field [label]="'auth.email' | translate" [(value)]="email" />
            <bp-form-field [label]="'auth.phone' | translate" [(value)]="phone" />
            <bp-form-field [label]="'auth.password' | translate" type="password" [(value)]="password" />
            <bp-button [disabled]="isSubmitting" (clicked)="onSubmit()">
              {{ (isSubmitting ? 'auth.registering' : 'auth.registerTitle') | translate }}
            </bp-button>
          } @else {
            <div class="vet-copy">
              <strong>{{ 'auth.completeVeterinarianRegistration' | translate }}</strong>
              <span>{{ 'auth.veterinarianInvitationHint' | translate }}</span>
            </div>
            <bp-form-field [label]="'auth.invitationCode' | translate" placeholder="VET-XXXXXX" [(value)]="invitationCode" />
            <bp-form-field [label]="'auth.createPassword' | translate" type="password" [(value)]="password" />
            <bp-form-field [label]="'auth.confirmPassword' | translate" type="password" [(value)]="confirmPassword" />
            <bp-button [disabled]="isSubmitting" (clicked)="onSubmit()">
              {{ (isSubmitting ? 'auth.registering' : 'auth.completeRegistration') | translate }}
            </bp-button>
          }

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
    .account-selector { display: grid; gap: 10px; }
    .account-selector > span { color: var(--bp-dark-navy); font-size: 13px; font-weight: 800; }
    .account-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 5px; border-radius: 999px; background: #eaf4fb; }
    .account-options button { min-height: 40px; border: 0; border-radius: 999px; background: transparent; color: var(--bp-slate-gray); font-family: var(--bp-ui-font); font-weight: 800; cursor: pointer; }
    .account-options button.active { background: #fff; color: var(--bp-action-blue); box-shadow: 0 4px 12px rgba(0, 91, 176, .12); }
    .vet-copy { display: grid; gap: 4px; padding: 14px 16px; border: 1px solid #bde1f6; border-radius: 12px; background: #eaf7ff; }
    .vet-copy strong { color: var(--bp-dark-navy); }
    .vet-copy span { color: var(--bp-slate-gray); font-size: 13px; }
    h1 { font-size: 44px; line-height: 1.1; margin: 0; }
    p, small { color: var(--bp-slate-gray); }
    small { text-align: center; }
    a { color: var(--bp-action-blue); font-weight: 700; }
    .error-banner { padding: 12px 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #991b1b; font-size: 14px; font-weight: 500; }
    @media (max-width: 900px) {
      .auth { grid-template-columns: 1fr; }
      .image-pane { display: none; }
      .split, .account-options { grid-template-columns: 1fr; border-radius: 18px; }
    }
  `],
})
export class RegisterPage {
  accountType: RegisterAccountType = 'admin';
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  invitationCode = '';
  password = '';
  confirmPassword = '';
  isSubmitting = false;
  errorKey = '';

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly redeemVeterinarianCodeUseCase: RedeemVeterinarianCodeUseCase,
    private readonly session: SessionService,
    private readonly fcmService: FcmNotificationService,
    private readonly router: Router
  ) {}

  setAccountType(type: RegisterAccountType): void {
    this.accountType = type;
    this.errorKey = '';
    this.password = '';
    this.confirmPassword = '';
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    this.errorKey = '';

    if (this.accountType === 'veterinarian') {
      await this.registerVeterinarian();
      return;
    }

    await this.registerAdmin();
  }

  private async registerAdmin(): Promise<void> {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.phone.trim() || !this.password) {
      this.errorKey = 'auth.completeAllFields';
      return;
    }

    if (this.password.length < 6) {
      this.errorKey = 'auth.invalidPassword';
      return;
    }

    this.isSubmitting = true;
    try {
      await this.createUserUseCase.execute({
        name: `${this.firstName.trim()} ${this.lastName.trim()}`,
        role: 'Administrator',
        email: this.email.trim(),
        status: 'Active',
        password: this.password
      } as any);

      try {
        const result = await this.loginUseCase.execute(this.email.trim(), this.password);
        if (result) {
          this.session.saveSession(result.token, result.user);
          this.registerPushToken();
        }
      } catch (loginErr) {
        console.error('Error during auto-login:', loginErr);
      }

      await this.router.navigate(['/onboarding/refuge/basic-info']);
    } catch {
      this.errorKey = 'auth.registerError';
    } finally {
      this.isSubmitting = false;
    }
  }

  private async registerVeterinarian(): Promise<void> {
    const code = this.invitationCode.trim();

    if (!code || !this.password || !this.confirmPassword) {
      this.errorKey = 'auth.completeAllFields';
      return;
    }

    if (this.password.length < 6) {
      this.errorKey = 'auth.invalidPassword';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorKey = 'auth.passwordMismatch';
      return;
    }

    this.isSubmitting = true;
    try {
      const result = await this.redeemVeterinarianCodeUseCase.execute(code, this.password);
      this.session.saveSession(result.token, result.user);
      this.registerPushToken();
      await this.router.navigate(['/veterinary']);
    } catch (error) {
      this.errorKey = this.veterinarianRegisterErrorKey(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private registerPushToken(): void {
    const user = this.session.getCurrentUser();
    if (user?.id) {
      this.fcmService.requestPermissionAndRegisterToken(user.id);
    }
  }

  private veterinarianRegisterErrorKey(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const rawMessage = JSON.stringify(error.error ?? '').toLowerCase();
      if (error.status === 400) {
        if (rawMessage.includes('used') || rawMessage.includes('utilizado')) {
          return 'auth.invitationCodeUsed';
        }
        if (rawMessage.includes('password') || rawMessage.includes('contrase')) {
          return 'auth.invalidPassword';
        }
        return 'auth.invalidInvitationCode';
      }
      if (error.status === 404) {
        return 'auth.invalidInvitationCode';
      }
    }

    return 'auth.veterinarianRegisterError';
  }
}
