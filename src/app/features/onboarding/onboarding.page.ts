import { Component, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe, BpButtonComponent, FormFieldComponent],
  template: `
    <main>
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
          <bp-button [routerLink]="nextLink()">{{ stepNumber() === 3 ? ('onboarding.finish' | translate) : ('onboarding.next' | translate) }}</bp-button>
        </footer>
      </section>
    </main>
  `,
  styles: [`
    main { min-height: 100vh; display: grid; place-items: center; padding: 32px; background: linear-gradient(135deg, #f3faff, var(--bp-primary-blue)); }
    .panel { width: min(720px, 100%); display: grid; gap: 24px; background: white; border-radius: 22px; padding: 40px; box-shadow: var(--bp-shadow); }
    img { width: 92px; height: 92px; border-radius: 50%; background: var(--bp-dark-navy); padding: 12px; }
    h1 { margin: 0; font-size: 36px; }
    .step { color: var(--bp-action-blue); font-weight: 800; margin: 0 0 6px; }
    .fields { display: grid; gap: 12px; }
    footer { display: flex; justify-content: flex-end; gap: 12px; }
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
