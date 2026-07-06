import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { GetVeterinaryDashboardUseCase } from '../../core/application/use-cases/veterinary.api-use-cases';
import { VeterinaryDashboardResource } from '../../core/domain/models/veterinary-api.models';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ 'veterinary.workspace' | translate }}</p>
          <h1>{{ 'veterinary.dashboardTitle' | translate }}</h1>
          <p>{{ 'veterinary.dashboardSubtitle' | translate }}</p>
        </div>
        <a class="primary-action" routerLink="/veterinary/animals">{{ 'veterinary.viewMyAnimals' | translate }}</a>
      </header>

      @if (loading) {
        <div class="state-card">{{ 'veterinary.loadingDashboard' | translate }}</div>
      } @else if (errorKey) {
        <div class="state-card error">{{ errorKey | translate }}</div>
      } @else if (dashboard) {
        <section class="welcome-card">
          <div>
            <span>{{ 'veterinary.welcome' | translate }}</span>
            <h2>{{ dashboard.veterinarianName || ('veterinary.veterinarian' | translate) }}</h2>
          </div>
          <div>
            <span>{{ 'veterinary.shelter' | translate }}</span>
            <strong>{{ dashboard.shelterName || '-' }}</strong>
          </div>
        </section>

        <section class="metrics">
          <article>
            <span>{{ 'veterinary.assignedAnimals' | translate }}</span>
            <strong>{{ metric(dashboard.assignedAnimalsCount) }}</strong>
          </article>
          <article>
            <span>{{ 'veterinary.pendingObservations' | translate }}</span>
            <strong>{{ metric(dashboard.pendingObservationsCount) }}</strong>
          </article>
          <article class="warning">
            <span>{{ 'veterinary.activeAlerts' | translate }}</span>
            <strong>{{ metric(dashboard.activeAlertsCount) }}</strong>
          </article>
          <article>
            <span>{{ 'veterinary.recentObservations' | translate }}</span>
            <strong>{{ metric(dashboard.recentObservationsCount) }}</strong>
          </article>
        </section>
      }
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 24px; padding: 12px 0 32px; }
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
    .eyebrow { margin: 0 0 4px; color: var(--bp-slate-gray); font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    h1 { margin: 0; color: var(--bp-action-blue); font-size: 36px; }
    h2 { margin: 4px 0 0; font-size: 28px; }
    p { margin: 6px 0 0; color: var(--bp-slate-gray); }
    .primary-action { padding: 13px 22px; border-radius: 999px; background: var(--bp-action-blue); color: white; font-weight: 800; box-shadow: 0 12px 24px rgba(0, 102, 204, .18); }
    .welcome-card, .state-card, .metrics article { border: 1px solid var(--bp-border); border-radius: 12px; background: #fff; box-shadow: 0 12px 28px rgba(11, 31, 47, .06); }
    .welcome-card { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 24px; }
    .welcome-card span, .metrics span { color: var(--bp-slate-gray); font-size: 13px; font-weight: 700; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
    .metrics article { display: grid; gap: 14px; padding: 22px; min-height: 128px; }
    .metrics strong { font-size: 38px; line-height: 1; color: var(--bp-dark-navy); }
    .metrics .warning { border-color: rgba(217, 48, 37, .34); background: #fff7f7; }
    .metrics .warning strong { color: var(--bp-critical); }
    .state-card { padding: 24px; color: var(--bp-slate-gray); }
    .state-card.error { color: var(--bp-critical); background: #fff7f7; border-color: rgba(217, 48, 37, .32); }
    @media (max-width: 900px) {
      .page-header, .welcome-card { align-items: flex-start; flex-direction: column; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 560px) {
      .metrics { grid-template-columns: 1fr; }
      h1 { font-size: 30px; }
    }
  `],
})
export class VeterinaryDashboardPage implements OnInit {
  dashboard: VeterinaryDashboardResource | null = null;
  loading = true;
  errorKey = '';

  constructor(private readonly getDashboard: GetVeterinaryDashboardUseCase) {}

  metric(value: number | null | undefined): number {
    return value ?? 0;
  }

  async ngOnInit(): Promise<void> {
    try {
      this.dashboard = await this.getDashboard.execute();
    } catch {
      this.errorKey = 'veterinary.dashboardError';
    } finally {
      this.loading = false;
    }
  }
}
