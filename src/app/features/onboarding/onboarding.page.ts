import { Component, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe, BpButtonComponent, FormFieldComponent],
  template: `
    @if (stepNumber() === 3) {
      <main class="confirmation">
        <header class="onboarding-topbar">
          <a routerLink="/login" class="brand">
            <img src="/assets/bluepatitas/bluepatitas-logo.png" alt="BluePatitas" />
            <span>BluePatitas</span>
          </a>
          <strong>{{ 'onboarding.initialSetup' | translate }}</strong>
        </header>

        <section class="confirmation-card">
          <div class="stepper" aria-label="Onboarding progress">
            <span><b>✓</b>{{ 'onboarding.basicStep' | translate }}</span>
            <i></i>
            <span><b>✓</b>{{ 'onboarding.locationStep' | translate }}</span>
            <i></i>
            <span><b>✓</b>{{ 'onboarding.confirmationStep' | translate }}</span>
          </div>

          <div class="success-mark">✓</div>
          <h1>{{ 'onboarding.successTitle' | translate }}</h1>
          <p>{{ 'onboarding.successSubtitle' | translate }}</p>

          <article class="shelter-summary">
            <small>{{ 'onboarding.shelterSummary' | translate }}</small>
            <dl>
              <div><span class="summary-icon building"></span><dt>{{ 'onboarding.shelterName' | translate }}</dt><dd>Refugio WUF</dd></div>
              <div><span class="summary-icon pin"></span><dt>{{ 'onboarding.address' | translate }}</dt><dd>Sede Norte</dd></div>
              <div><span class="summary-icon map"></span><dt>{{ 'onboarding.districtCity' | translate }}</dt><dd>San Miguel, Lima</dd></div>
            </dl>
          </article>

          <footer>
            <bp-button routerLink="/dashboard">{{ 'onboarding.goToShelter' | translate }} →</bp-button>
          </footer>
        </section>
      </main>
    } @else {
      <main class="standard">
        <section class="panel">
          <img src="/assets/bluepatitas/bluepatitas-logo.png" alt="BluePatitas" />
          <div>
            <p class="step">Step {{ stepNumber() }} / 3</p>
            <h1>{{ titleKey() | translate }}</h1>
            <p class="muted">{{ 'onboarding.subtitle' | translate }}</p>
          </div>
          <div class="fields">
            <bp-form-field label="Shelter name" placeholder="Refugio WUF" />
            <bp-form-field label="Administrator email" placeholder="admin@refugiowuf.org" />
            <bp-form-field label="City / Location" placeholder="Lima" />
          </div>
          <footer>
            @if (stepNumber() > 1) { <bp-button variant="secondary" [routerLink]="backLink()">{{ 'onboarding.back' | translate }}</bp-button> }
            <bp-button [routerLink]="nextLink()">{{ 'onboarding.next' | translate }}</bp-button>
          </footer>
        </section>
      </main>
    }
  `,
  styles: [`
    main { min-height: 100vh; background: linear-gradient(135deg, #f3faff, var(--bp-primary-blue)); }
    .standard { display: grid; place-items: center; padding: 32px; }
    .panel { width: min(720px, 100%); display: grid; gap: 24px; background: white; border-radius: 22px; padding: 40px; box-shadow: var(--bp-shadow); }
    .panel > img { width: 92px; height: 92px; border-radius: 50%; background: var(--bp-dark-navy); padding: 12px; }
    h1 { margin: 0; font-size: 36px; }
    .step { color: var(--bp-action-blue); font-weight: 800; margin: 0 0 6px; }
    .fields { display: grid; gap: 12px; }
    footer { display: flex; justify-content: flex-end; gap: 12px; }
    .onboarding-topbar { height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; background: var(--bp-dark-navy); color: #fff; }
    .brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 20px; }
    .brand img { width: 32px; height: 32px; object-fit: contain; }
    .onboarding-topbar strong { font-size: 18px; }
    .confirmation { display: grid; grid-template-rows: auto 1fr; background: var(--bp-soft-background); }
    .confirmation-card { align-self: start; justify-self: center; width: min(592px, calc(100vw - 36px)); margin-top: 70px; padding: 36px 56px 18px; background: #fff; border: 1px solid var(--bp-border); border-radius: 8px; box-shadow: 0 18px 42px rgba(11, 31, 47, .08); text-align: center; }
    .stepper { display: grid; grid-template-columns: auto 92px auto 92px auto; align-items: start; justify-content: center; gap: 14px; margin-bottom: 34px; color: var(--bp-action-blue); font-size: 11px; font-weight: 800; }
    .stepper span { display: grid; justify-items: center; gap: 8px; }
    .stepper b { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; background: var(--bp-action-blue); color: #fff; font-size: 16px; }
    .stepper i { height: 2px; margin-top: 18px; background: var(--bp-action-blue); }
    .success-mark { width: 58px; height: 58px; display: grid; place-items: center; margin: 0 auto 22px; border-radius: 50%; background: #7ce4d8; color: #006e68; font-size: 30px; font-weight: 900; }
    .confirmation-card h1 { font-size: 20px; line-height: 1.25; color: var(--bp-dark-navy); }
    .confirmation-card p { margin: 8px 0 22px; color: var(--bp-slate-gray); }
    .shelter-summary { width: min(370px, 100%); margin: 0 auto 32px; padding: 18px; text-align: left; border: 1px solid #a9d0e9; border-radius: 6px; background: #d9effc; }
    .shelter-summary small { display: block; margin-bottom: 14px; text-transform: uppercase; color: #405064; font-weight: 800; letter-spacing: .04em; }
    dl { display: grid; gap: 14px; margin: 0; }
    dl div { display: grid; grid-template-columns: 24px 1fr; column-gap: 8px; }
    dt { color: var(--bp-slate-gray); font-size: 12px; }
    dd { margin: 2px 0 0; font-weight: 800; grid-column: 2; }
    .summary-icon { grid-row: 1 / span 2; width: 18px; height: 18px; position: relative; color: #526574; }
    .summary-icon::before, .summary-icon::after { content: ''; position: absolute; box-sizing: border-box; }
    .building::before { inset: 2px 3px; border: 2px solid currentColor; }
    .building::after { inset: 7px 7px 2px; border-left: 2px solid currentColor; border-right: 2px solid currentColor; }
    .pin::before { inset: 1px 4px 4px; border: 2px solid currentColor; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); }
    .map::before { inset: 2px; border: 2px solid currentColor; border-radius: 2px; }
    .map::after { top: 3px; bottom: 3px; left: 7px; border-left: 2px solid currentColor; box-shadow: 5px 0 0 currentColor; }
    .confirmation-card footer { border-top: 1px solid var(--bp-border); padding-top: 18px; justify-content: center; }
    .confirmation-card footer bp-button { width: min(308px, 100%); }
    @media (max-width: 640px) {
      .confirmation-card { margin-top: 28px; padding: 24px 20px 18px; }
      .stepper { grid-template-columns: 1fr; }
      .stepper i { display: none; }
      .onboarding-topbar { padding: 0 16px; }
    }
  `],
})
export class OnboardingPage {
  constructor(private readonly route: ActivatedRoute) {}

  readonly segment = computed(() => this.route.snapshot.routeConfig?.path ?? 'basic-info');

  stepNumber(): number {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'location') return 2;
    if (path === 'confirmation') return 3;
    return 1;
  }

  titleKey(): string {
    return ['onboarding.basicTitle', 'onboarding.locationTitle', 'onboarding.confirmationTitle'][this.stepNumber() - 1];
  }

  nextLink(): string {
    if (this.stepNumber() === 1) return '/onboarding/refuge/location';
    if (this.stepNumber() === 2) return '/onboarding/refuge/confirmation';
    return '/dashboard';
  }

  backLink(): string {
    return this.stepNumber() === 3 ? '/onboarding/refuge/location' : '/onboarding/refuge/basic-info';
  }
}
