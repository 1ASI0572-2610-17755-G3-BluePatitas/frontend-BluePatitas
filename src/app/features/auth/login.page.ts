import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SignInUseCase } from '../../core/application/use-cases/auth.use-cases';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, TranslatePipe, BpButtonComponent],
  template: `
    <main class="auth login">
      <section class="form-pane">
        <form class="form-card" (ngSubmit)="signIn()">
          <h1>{{ 'auth.signIn' | translate }}</h1>
          <p>{{ 'auth.loginSubtitle' | translate }}</p>

          <label>
            <span>{{ 'auth.email' | translate }}</span>
            <input name="email" type="email" [(ngModel)]="email" autocomplete="email" placeholder="admin@bluepatitas.com" required />
          </label>

          <label>
            <span>{{ 'auth.password' | translate }}</span>
            <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" placeholder="Password" required />
          </label>

          @if (errorMessage) {
            <div class="error" role="alert">{{ errorMessage | translate }}</div>
          }

          <a class="forgot" href="#">{{ 'auth.forgot' | translate }}</a>
          <bp-button type="submit">{{ (loading ? 'auth.signingIn' : 'auth.signIn') | translate }}</bp-button>
          <small>{{ 'auth.noAccount' | translate }} <a routerLink="/register">{{ 'auth.signUp' | translate }}</a></small>
        </form>
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
    label { display: grid; gap: 7px; color: var(--bp-dark-navy); font-size: 13px; font-weight: 800; }
    input { width: 100%; min-height: 54px; border: 1px solid var(--bp-border); border-radius: 10px; padding: 0 16px; background: #fff; color: var(--bp-dark-navy); font: inherit; font-weight: 500; box-sizing: border-box; }
    input:focus { outline: 2px solid rgba(0, 101, 193, .18); border-color: var(--bp-action-blue); }
    .forgot { justify-self: end; color: var(--bp-action-blue); font-size: 13px; font-weight: 700; }
    .error { border-radius: 10px; border: 1px solid rgba(217, 48, 37, .22); background: rgba(217, 48, 37, .08); color: var(--bp-critical); padding: 12px 14px; font-size: 13px; font-weight: 700; }
    small { text-align: center; color: var(--bp-slate-gray); }
    small a { color: var(--bp-action-blue); font-weight: 700; }
    .image-pane { overflow: hidden; background: var(--bp-primary-blue); }
    .image-pane img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
    @media (max-width: 900px) { .auth { grid-template-columns: 1fr; } .image-pane { display: none; } }
  `],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly session: AuthSessionService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const current = this.session.currentSession;
    if (current) {
      void this.router.navigateByUrl(this.session.dashboardPath(current));
    }
  }

  async signIn(): Promise<void> {
    if (this.loading || !this.email.trim() || !this.password) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const authSession = await this.signInUseCase.execute({
        email: this.email.trim(),
        password: this.password,
      });
      this.session.setSession(authSession);
      await this.router.navigateByUrl(this.session.dashboardPath(authSession));
    } catch (error) {
      this.errorMessage = this.resolveErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 403) {
      return 'auth.accessDenied';
    }

    return 'auth.invalidCredentials';
  }
}
