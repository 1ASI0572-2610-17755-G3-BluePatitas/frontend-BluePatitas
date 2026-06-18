import { Component, OnInit } from '@angular/core';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { GetVeterinaryDashboardUseCase } from '../../core/application/use-cases/veterinary.use-cases';
import { VeterinaryDashboard } from '../../core/domain/models/veterinary.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';

@Component({
  standalone: true,
  imports: [TranslatePipe, BpCardComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'veterinary.dashboardTitle' | translate }}</h1>
        <p>{{ 'veterinary.dashboardSubtitle' | translate }} {{ shelterName }}</p>
      </div>
    </div>

    @if (errorMessage) {
      <div class="error">{{ errorMessage | translate }}</div>
    } @else {
      <section class="metrics">
        <article>
          <small>{{ 'veterinary.animalsUnderCare' | translate }}</small>
          <strong>{{ dashboard?.animalsUnderCare ?? 0 }}</strong>
        </article>
        <article>
          <small>{{ 'veterinary.pendingObservations' | translate }}</small>
          <strong>{{ dashboard?.pendingObservations ?? 0 }}</strong>
        </article>
        <article class="critical">
          <small>{{ 'veterinary.activeAlerts' | translate }}</small>
          <strong>{{ dashboard?.activeAlerts ?? 0 }}</strong>
        </article>
      </section>

      <section class="dashboard-grid">
        <bp-card [title]="'veterinary.profileSummary' | translate">
          <div class="summary">
            <span>{{ 'veterinary.veterinarian' | translate }}</span>
            <strong>{{ dashboard?.veterinarianName || userName }}</strong>
            <span>{{ 'veterinary.shelter' | translate }}</span>
            <strong>{{ dashboard?.shelterName || shelterName }}</strong>
          </div>
        </bp-card>

        <bp-card [title]="'veterinary.recentObservations' | translate">
          <div class="observations">
            @for (observation of dashboard?.recentObservations ?? []; track observation.id) {
              <article>
                <strong>{{ observation.animalName }}</strong>
                <p>{{ observation.summary }}</p>
                <small>{{ observation.createdAt }}</small>
              </article>
            } @empty {
              <p class="empty">{{ 'veterinary.noObservations' | translate }}</p>
            }
          </div>
        </bp-card>
      </section>
    }
  `,
  styles: [`
    .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-bottom: 20px; }
    .metrics article { background: #fff; border: 1px solid var(--bp-border); border-radius: 12px; padding: 18px 20px; box-shadow: var(--bp-shadow); min-height: 92px; }
    .metrics small { color: var(--bp-slate-gray); text-transform: uppercase; font-size: 12px; font-weight: 800; }
    .metrics strong { display: block; margin-top: 12px; font-size: 36px; line-height: 1; }
    .metrics .critical { border-color: rgba(217, 48, 37, .35); background: rgba(217, 48, 37, .04); }
    .metrics .critical strong { color: var(--bp-critical); }
    .dashboard-grid { display: grid; grid-template-columns: .85fr 1.15fr; gap: 20px; align-items: start; }
    .summary { display: grid; gap: 8px; }
    .summary span { color: var(--bp-slate-gray); font-size: 12px; text-transform: uppercase; font-weight: 800; }
    .summary strong { font-size: 18px; }
    .observations { display: grid; gap: 12px; }
    .observations article { border-radius: 10px; border: 1px solid var(--bp-border); background: var(--bp-surface-blue); padding: 12px 14px; }
    .observations p { margin: 5px 0; color: var(--bp-slate-gray); }
    .observations small, .empty { color: var(--bp-slate-gray); }
    .error { border: 1px solid rgba(217,48,37,.24); background: rgba(217,48,37,.08); color: var(--bp-critical); border-radius: 10px; padding: 14px 16px; font-weight: 800; }
    @media (max-width: 900px) { .metrics, .dashboard-grid { grid-template-columns: 1fr; } }
  `],
})
export class VeterinaryDashboardPage implements OnInit {
  dashboard?: VeterinaryDashboard;
  errorMessage = '';

  constructor(
    private readonly getDashboard: GetVeterinaryDashboardUseCase,
    private readonly session: AuthSessionService,
  ) {}

  get shelterName(): string {
    return this.session.currentSession?.shelterName || 'WUF Shelter';
  }

  get userName(): string {
    return this.session.fullName();
  }

  async ngOnInit(): Promise<void> {
    try {
      this.dashboard = await this.getDashboard.execute();
    } catch {
      this.errorMessage = 'auth.accessDenied';
    }
  }
}
