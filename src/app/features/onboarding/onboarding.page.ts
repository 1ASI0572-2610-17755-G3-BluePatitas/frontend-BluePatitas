import { Component, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, TranslatePipe, BpButtonComponent, FormFieldComponent],
  template: `
    <main>
      <header class="onboarding-topbar">
        <a routerLink="/login" class="brand">
          <img src="/assets/bluepatitas/bluepatitas-logo.png" alt="BluePatitas" />
          <span>BluePatitas</span>
        </a>
        <strong>{{ 'onboarding.initialSetup' | translate }}</strong>
      </header>

      @if (stepNumber() === 3) {
        <section class="setup-card confirmation-card">
          <ng-container *ngTemplateOutlet="stepper" />

          <div class="success-mark">✓</div>
          <h1>{{ 'onboarding.successTitle' | translate }}</h1>
          <p>{{ 'onboarding.successSubtitle' | translate }}</p>

          <article class="shelter-summary">
            <small>{{ 'onboarding.shelterSummary' | translate }}</small>
            <dl>
              <div><span class="summary-icon building"></span><dt>{{ 'onboarding.shelterName' | translate }}</dt><dd>Refugio Esperanza</dd></div>
              <div><span class="summary-icon pin"></span><dt>{{ 'onboarding.address' | translate }}</dt><dd>Sede Norte</dd></div>
              <div><span class="summary-icon map"></span><dt>{{ 'onboarding.districtCity' | translate }}</dt><dd>San Miguel, Lima</dd></div>
            </dl>
          </article>

          <footer class="confirmation-footer">
            <bp-button routerLink="/dashboard">{{ 'onboarding.goToShelter' | translate }} →</bp-button>
          </footer>
        </section>
      } @else {
        <section class="setup-card form-card">
          <ng-container *ngTemplateOutlet="stepper" />
          <div class="copy">
            <h1>{{ titleKey() | translate }}</h1>
            <p>{{ stepNumber() === 1 ? ('onboarding.createSubtitle' | translate) : ('onboarding.locationSubtitle' | translate) }}</p>
          </div>

          <div class="form-grid">
            @if (stepNumber() === 1) {
              <bp-form-field [label]="'onboarding.shelterNameRequired' | translate" />
              <bp-form-field label="RUC" />
              <bp-form-field [label]="'onboarding.institutionalEmailRequired' | translate" />
              <bp-form-field [label]="'onboarding.contactPhoneRequired' | translate" />
            } @else {
              <bp-form-field [label]="'onboarding.addressRequired' | translate" [placeholder]="'onboarding.addressPlaceholder' | translate" />
              <bp-form-field [label]="'onboarding.referenceOptional' | translate" [placeholder]="'onboarding.referencePlaceholder' | translate" />
              <bp-form-field [label]="'onboarding.districtRequired' | translate" [placeholder]="'onboarding.districtPlaceholder' | translate" />
              <bp-form-field [label]="'onboarding.cityRequired' | translate" [placeholder]="'onboarding.cityPlaceholder' | translate" />
            }
          </div>

          <footer class="form-footer">
            @if (stepNumber() === 1) {
              <bp-button variant="secondary" routerLink="/register">{{ 'common.cancel' | translate }}</bp-button>
            } @else {
              <bp-button variant="secondary" [routerLink]="backLink()">{{ 'onboarding.back' | translate }}</bp-button>
            }
            <bp-button [routerLink]="nextLink()">{{ stepNumber() === 1 ? ('onboarding.next' | translate) : ('onboarding.createShelter' | translate) }}</bp-button>
          </footer>
        </section>
      }

      <ng-template #stepper>
        <div class="stepper" aria-label="Onboarding progress">
          <span [class.done]="stepNumber() > 1" [class.active]="stepNumber() === 1"><b>{{ stepNumber() > 1 ? '✓' : '1' }}</b>{{ 'onboarding.basicStep' | translate }}</span>
          <i [class.done]="stepNumber() > 1"></i>
          <span [class.done]="stepNumber() > 2" [class.active]="stepNumber() === 2"><b>{{ stepNumber() > 2 ? '✓' : '2' }}</b>{{ 'onboarding.locationStep' | translate }}</span>
          <i [class.done]="stepNumber() > 2"></i>
          <span [class.active]="stepNumber() === 3"><b>{{ stepNumber() === 3 ? '✓' : '3' }}</b>{{ 'onboarding.confirmationStep' | translate }}</span>
        </div>
      </ng-template>
    </main>
  `,
  styles: [`
    main { min-height: 100vh; background: var(--bp-soft-background); }
    .onboarding-topbar { height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; background: var(--bp-dark-navy); color: #fff; }
    .brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; }
    .brand img { width: 32px; height: 32px; object-fit: contain; }
    .onboarding-topbar strong { font-size: 18px; }
    .setup-card { width: min(544px, calc(100vw - 32px)); margin: 122px auto 0; background: #fff; border: 1px solid var(--bp-border); border-radius: 7px; box-shadow: 0 18px 42px rgba(11, 31, 47, .06); }
    .form-card { padding: 34px 24px 20px; }
    .confirmation-card { width: min(486px, calc(100vw - 32px)); margin-top: 58px; padding: 30px 45px 16px; text-align: center; }
    .stepper { display: grid; grid-template-columns: auto 88px auto 88px auto; align-items: start; justify-content: center; gap: 12px; margin-bottom: 32px; color: var(--bp-slate-gray); font-size: 10px; font-weight: 800; }
    .stepper span { display: grid; justify-items: center; gap: 8px; min-width: 74px; }
    .stepper b { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--bp-slate-gray); color: var(--bp-slate-gray); background: #fff; font-size: 12px; }
    .stepper i { height: 2px; margin-top: 12px; background: #c6ced8; }
    .stepper .active, .stepper .done { color: var(--bp-action-blue); }
    .stepper .active b, .stepper .done b { color: #fff; background: var(--bp-action-blue); border-color: var(--bp-action-blue); }
    .stepper i.done { background: var(--bp-action-blue); }
    .copy h1 { margin: 0 0 8px; font-size: 18px; line-height: 1.2; color: var(--bp-dark-navy); }
    .copy p { margin: 0 0 20px; color: var(--bp-slate-gray); font-size: 12px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 10px; }
    .form-footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--bp-border); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .success-mark { width: 48px; height: 48px; display: grid; place-items: center; margin: 0 auto 18px; border-radius: 50%; background: #7ce4d8; color: #006e68; font-size: 26px; font-weight: 900; }
    .confirmation-card h1 { margin: 0; font-size: 18px; line-height: 1.25; color: var(--bp-dark-navy); }
    .confirmation-card p { margin: 8px 0 18px; color: var(--bp-slate-gray); font-size: 12px; }
    .shelter-summary { width: min(304px, 100%); margin: 0 auto 26px; padding: 16px; text-align: left; border: 1px solid #a9d0e9; border-radius: 5px; background: #d9effc; }
    .shelter-summary small { display: block; margin-bottom: 14px; text-transform: uppercase; color: #405064; font-weight: 800; letter-spacing: .04em; font-size: 10px; }
    dl { display: grid; gap: 12px; margin: 0; }
    dl div { display: grid; grid-template-columns: 22px 1fr; column-gap: 8px; }
    dt { color: var(--bp-slate-gray); font-size: 11px; }
    dd { margin: 2px 0 0; font-weight: 800; grid-column: 2; font-size: 12px; }
    .summary-icon { grid-row: 1 / span 2; width: 16px; height: 16px; position: relative; color: #526574; }
    .summary-icon::before, .summary-icon::after { content: ''; position: absolute; box-sizing: border-box; }
    .building::before { inset: 2px 3px; border: 2px solid currentColor; }
    .building::after { inset: 7px 7px 2px; border-left: 2px solid currentColor; border-right: 2px solid currentColor; }
    .pin::before { inset: 1px 4px 4px; border: 2px solid currentColor; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); }
    .map::before { inset: 2px; border: 2px solid currentColor; border-radius: 2px; }
    .map::after { top: 3px; bottom: 3px; left: 7px; border-left: 2px solid currentColor; box-shadow: 5px 0 0 currentColor; }
    .confirmation-footer { border-top: 1px solid var(--bp-border); padding-top: 14px; display: flex; justify-content: center; }
    .confirmation-footer bp-button { width: min(252px, 100%); }
    @media (max-width: 640px) {
      .setup-card { margin-top: 28px; }
      .form-grid, .stepper { grid-template-columns: 1fr; }
      .stepper i { display: none; }
      .form-footer { display: grid; }
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
    return ['onboarding.createShelterTitle', 'onboarding.locationTitle', 'onboarding.confirmationTitle'][this.stepNumber() - 1];
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
