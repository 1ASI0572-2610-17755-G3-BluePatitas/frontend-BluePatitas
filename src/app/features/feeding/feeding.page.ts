import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';
import { ApiFeedingPlan } from '../../core/domain/models/feeding-api.models';
import {
  ActivateApiFeedingPlanUseCase,
  DeactivateApiFeedingPlanUseCase,
  GetAllApiFeedingPlansUseCase
} from '../../core/application/use-cases/feeding.api-use-cases';
import { EdgeGatewayService, EdgeDispenserStatus, EdgeScheduleConfig, EdgeSimulatorStatus } from '../../core/infrastructure/services/edge-gateway.service';

@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <section class="feeding-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ 'topbar.shelter' | translate }}</p>
          <h1>{{ 'feeding.title' | translate }}</h1>
          <p>{{ 'feeding.subtitle' | translate }}</p>
        </div>
        <button type="button" class="secondary-btn" (click)="refreshAll()" [disabled]="plansLoading || edgeLoading">
          {{ 'common.refresh' | translate }}
        </button>
      </header>

      <div class="feeding-grid">
        <article class="panel plans-panel">
          <div class="panel-header">
            <div>
              <span class="panel-icon">FD</span>
              <h2>{{ 'feeding.persistentPlans' | translate }}</h2>
            </div>
          </div>

          @if (plansLoading) {
            <p class="state">{{ 'feeding.loadingPlans' | translate }}</p>
          } @else if (plansError) {
            <p class="state error">{{ 'feeding.planError' | translate }}</p>
          } @else if (plans.length === 0) {
            <p class="state">{{ 'feeding.noPlans' | translate }}</p>
          } @else {
            <div class="plan-list">
              @for (plan of plans; track plan.id) {
                <article class="plan-card" [class.active]="plan.status === 'ACTIVE'">
                  <div class="plan-main">
                    <div>
                      <strong>{{ formatDietName(plan.dietType.name) }}</strong>
                      <small>{{ 'feeding.animalId' | translate }}: {{ plan.animalId }}</small>
                    </div>
                    <span class="status-pill" [class.inactive]="plan.status !== 'ACTIVE'">{{ plan.status }}</span>
                  </div>

                  <div class="plan-details">
                    <span>
                      <small>{{ 'feeding.portion' | translate }}</small>
                      <b>{{ plan.foodAmount.quantity }} {{ plan.foodAmount.unit }}</b>
                    </span>
                    <span>
                      <small>{{ 'feeding.frequency' | translate }}</small>
                      <b>{{ plan.schedule.timesPerDay }}</b>
                    </span>
                    <span>
                      <small>{{ 'feeding.schedule' | translate }}</small>
                      <b>{{ plan.schedule.scheduledTimes || '--' }}</b>
                    </span>
                  </div>

                  @if (plan.dietType.nutritionalNotes) {
                    <p class="notes">{{ plan.dietType.nutritionalNotes }}</p>
                  }

                  <div class="plan-actions">
                    @if (plan.status === 'ACTIVE') {
                      <button type="button" class="outline-btn" (click)="deactivatePlan(plan)" [disabled]="planActionLoading === plan.id">
                        {{ 'feeding.deactivatePlan' | translate }}
                      </button>
                    } @else {
                      <button type="button" class="primary-btn" (click)="activatePlan(plan)" [disabled]="planActionLoading === plan.id">
                        {{ 'feeding.activatePlan' | translate }}
                      </button>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </article>

        <aside class="panel edge-panel">
          <div class="panel-header">
            <div>
              <span class="panel-icon">IoT</span>
              <h2>{{ 'feeding.iotDispenser' | translate }}</h2>
            </div>
            <span class="edge-status" [class.offline]="!edgeOnline">
              {{ (edgeOnline ? 'feeding.edgeOnline' : 'feeding.edgeOffline') | translate }}
            </span>
          </div>

          <div class="edge-summary">
            <span>
              <small>{{ 'feeding.lastCheck' | translate }}</small>
              <b>{{ edgeLastCheckedLabel }}</b>
            </span>
            <span>
              <small>{{ 'feeding.scheduleActive' | translate }}</small>
              <b>{{ scheduleActive ? ('feeding.yes' | translate) : ('feeding.no' | translate) }}</b>
            </span>
            <span>
              <small>{{ 'feeding.simulationActive' | translate }}</small>
              <b>{{ simulatorActive ? ('feeding.yes' | translate) : ('feeding.no' | translate) }}</b>
            </span>
          </div>

          @if (!edgeOnline) {
            <p class="edge-hint">{{ 'feeding.edgeOfflineHint' | translate }}</p>
          }

          <label class="field-label" for="schedule-interval">{{ 'feeding.interval' | translate }}</label>
          <input id="schedule-interval" class="text-input" [(ngModel)]="scheduleInterval" placeholder="cada 5 minuto" />

          @if (coordinatesLabel) {
            <p class="coordinates">{{ 'feeding.coordinates' | translate }}: {{ coordinatesLabel }}</p>
          }

          @if (edgeMessageKey) {
            <p class="edge-message" [class.success]="edgeMessageSuccess">{{ edgeMessageKey | translate }}</p>
          }

          <div class="edge-actions">
            <button type="button" class="outline-btn" (click)="refreshEdge()" [disabled]="edgeLoading">
              {{ 'feeding.refreshEdge' | translate }}
            </button>
            <button type="button" class="primary-btn" (click)="manualDispense()" [disabled]="manualLoading || !edgeOnline">
              {{ (manualLoading ? 'animals.dispensing' : 'feeding.manualDispense') | translate }}
            </button>
            <button type="button" class="secondary-btn full" (click)="toggleSchedule()" [disabled]="scheduleLoading || !edgeOnline">
              {{ (scheduleActive ? 'feeding.disableSchedule' : 'feeding.enableSchedule') | translate }}
            </button>
          </div>

          @if (dispenserRawStatus) {
            <p class="raw-status">{{ 'common.status' | translate }}: {{ dispenserRawStatus }}</p>
          }
        </aside>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .feeding-page { display: grid; gap: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: end; gap: 20px; }
    .eyebrow { color: var(--bp-dark-navy); font-size: 16px; font-weight: 800; margin: 0 0 28px; }
    h1 { color: var(--bp-action-blue); font-size: 32px; line-height: 1.1; margin: 0 0 8px; }
    h2 { color: var(--bp-dark-navy); font-size: 22px; margin: 0; }
    p { color: var(--bp-slate-gray); margin: 0; }
    .feeding-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 20px; align-items: start; }
    .panel { background: #fff; border: 1px solid var(--bp-border); border-radius: 12px; box-shadow: 0 18px 40px rgba(11, 31, 47, .06); padding: 24px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; }
    .panel-header > div { display: flex; align-items: center; gap: 12px; }
    .panel-icon { align-items: center; background: #dff3ff; border-radius: 8px; color: var(--bp-action-blue); display: inline-flex; font-size: 11px; font-weight: 900; height: 40px; justify-content: center; width: 40px; }
    .plan-list { display: grid; gap: 14px; }
    .plan-card { border: 1px solid var(--bp-border); border-radius: 10px; padding: 16px; }
    .plan-card.active { border-color: #9bd9d0; background: linear-gradient(135deg, #fff 0%, #f1fffb 100%); }
    .plan-main { align-items: start; display: flex; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .plan-main strong { color: var(--bp-dark-navy); display: block; font-size: 16px; }
    .plan-main small, .plan-details small { color: var(--bp-slate-gray); display: block; font-size: 11px; margin-top: 3px; }
    .status-pill, .edge-status { background: #e7f8ea; border-radius: 999px; color: #1d9d39; display: inline-flex; font-size: 12px; font-weight: 800; padding: 7px 12px; white-space: nowrap; }
    .status-pill.inactive, .edge-status.offline { background: #eef2f5; color: #64748b; }
    .plan-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .plan-details span, .edge-summary span { background: var(--bp-surface-blue); border-radius: 8px; padding: 12px; }
    .plan-details b, .edge-summary b { color: var(--bp-dark-navy); display: block; font-size: 15px; margin-top: 2px; }
    .notes { background: #f6fbff; border-radius: 8px; color: var(--bp-slate-gray); font-size: 13px; margin-top: 12px; padding: 10px; }
    .plan-actions { display: flex; justify-content: flex-end; margin-top: 14px; }
    .edge-summary { display: grid; gap: 10px; margin-bottom: 16px; }
    .field-label { color: var(--bp-dark-navy); display: block; font-size: 12px; font-weight: 800; margin-bottom: 8px; }
    .text-input { border: 1px solid var(--bp-border); border-radius: 10px; box-sizing: border-box; color: var(--bp-dark-navy); font: inherit; height: 44px; outline: none; padding: 0 14px; width: 100%; }
    .text-input:focus { border-color: var(--bp-action-blue); box-shadow: 0 0 0 3px rgba(0, 101, 196, .12); }
    .edge-hint, .edge-message, .state { border-radius: 8px; font-size: 13px; margin: 12px 0; padding: 12px; }
    .edge-hint, .edge-message.error, .state.error { background: #fff7f7; border: 1px solid #fecaca; color: #9a1b1b; }
    .edge-message { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }
    .edge-message.success { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
    .state { background: #f6fbff; color: var(--bp-slate-gray); }
    .coordinates, .raw-status { color: var(--bp-slate-gray); font-size: 12px; margin-top: 10px; }
    .edge-actions { display: grid; gap: 10px; margin-top: 18px; }
    button { border-radius: 999px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; min-height: 42px; padding: 0 20px; transition: transform .15s, box-shadow .15s; }
    button:hover:not(:disabled) { box-shadow: 0 10px 24px rgba(0, 101, 196, .16); transform: translateY(-1px); }
    button:disabled { cursor: default; opacity: .6; }
    .primary-btn, .secondary-btn { background: var(--bp-action-blue); border: 1px solid var(--bp-action-blue); color: #fff; }
    .secondary-btn { background: #fff; color: var(--bp-action-blue); }
    .outline-btn { background: #fff; border: 1px solid var(--bp-border); color: var(--bp-action-blue); }
    .full { width: 100%; }
    @media (max-width: 1080px) {
      .feeding-grid { grid-template-columns: 1fr; }
      .edge-panel { order: -1; }
    }
    @media (max-width: 720px) {
      .page-header { align-items: stretch; flex-direction: column; }
      .plan-details { grid-template-columns: 1fr; }
      .panel { padding: 18px; }
      h1 { font-size: 28px; }
    }
  `]
})
export class FeedingPage implements OnInit {
  private readonly getPlansUseCase = inject(GetAllApiFeedingPlansUseCase);
  private readonly activateUseCase = inject(ActivateApiFeedingPlanUseCase);
  private readonly deactivateUseCase = inject(DeactivateApiFeedingPlanUseCase);
  private readonly edgeGateway = inject(EdgeGatewayService);
  private readonly translationService = inject(TranslationService);

  plans: ApiFeedingPlan[] = [];
  plansLoading = false;
  plansError = false;
  planActionLoading = '';

  edgeOnline = false;
  edgeLoading = false;
  edgeLastChecked?: Date;
  scheduleActive = false;
  scheduleInterval = 'cada 5 minuto';
  simulatorActive = false;
  coordinatesLabel = '';
  dispenserRawStatus = '';
  edgeMessageKey = '';
  edgeMessageSuccess = false;
  manualLoading = false;
  scheduleLoading = false;

  ngOnInit(): void {
    this.refreshAll();
  }

  async refreshAll(): Promise<void> {
    await Promise.all([this.loadPlans(), this.refreshEdge()]);
  }

  async loadPlans(): Promise<void> {
    this.plansLoading = true;
    this.plansError = false;
    try {
      this.plans = await this.getPlansUseCase.execute();
    } catch (error) {
      console.error('Failed to load feeding plans', error);
      this.plansError = true;
    } finally {
      this.plansLoading = false;
    }
  }

  async activatePlan(plan: ApiFeedingPlan): Promise<void> {
    await this.runPlanAction(plan.id, () => this.activateUseCase.execute(plan.id));
  }

  async deactivatePlan(plan: ApiFeedingPlan): Promise<void> {
    await this.runPlanAction(plan.id, () => this.deactivateUseCase.execute(plan.id));
  }

  async refreshEdge(): Promise<void> {
    if (this.edgeLoading) return;
    this.edgeLoading = true;
    this.edgeMessageKey = '';
    try {
      const [dispenser, schedule, simulator] = await Promise.all([
        this.edgeGateway.getDispenserStatus(),
        this.edgeGateway.getScheduleConfig(),
        this.edgeGateway.getSimulatorStatus()
      ]);
      this.edgeOnline = dispenser.ok || schedule.ok || simulator.ok;
      this.edgeLastChecked = dispenser.checkedAt;
      this.applyDispenserStatus(dispenser.data);
      this.applyScheduleConfig(schedule.data);
      this.applySimulatorStatus(simulator.data);
    } finally {
      this.edgeLoading = false;
    }
  }

  async manualDispense(): Promise<void> {
    if (this.manualLoading || !this.edgeOnline) return;
    this.manualLoading = true;
    this.edgeMessageKey = '';
    try {
      const result = await this.edgeGateway.forceFeed();
      this.edgeOnline = result.ok;
      this.edgeLastChecked = result.checkedAt;
      this.applyDispenserStatus(result.data);
      this.setEdgeMessage(result.ok ? 'feeding.manualDispenseSuccess' : 'feeding.manualDispenseError', result.ok);
    } finally {
      this.manualLoading = false;
    }
  }

  async toggleSchedule(): Promise<void> {
    if (this.scheduleLoading || !this.edgeOnline) return;
    this.scheduleLoading = true;
    this.edgeMessageKey = '';
    try {
      const result = await this.edgeGateway.configureSchedule(!this.scheduleActive, this.scheduleInterval);
      this.edgeOnline = result.ok;
      this.edgeLastChecked = result.checkedAt;
      if (result.ok && result.data) {
        this.applyScheduleConfig(result.data);
        this.setEdgeMessage(this.scheduleActive ? 'feeding.scheduleEnabled' : 'feeding.scheduleDisabled', true);
      } else {
        this.setEdgeMessage('feeding.scheduleError', false);
      }
    } finally {
      this.scheduleLoading = false;
    }
  }

  get edgeLastCheckedLabel(): string {
    return this.edgeLastChecked ? this.edgeLastChecked.toLocaleTimeString() : '--';
  }

  formatDietName(dietName: string): string {
    if (!dietName) return dietName;
    if (this.translationService.currentLanguage() !== 'es-419') return dietName;
    return dietName
      .replace(/^Dry/i, this.translationService.translate('animals.dryFood'))
      .replace(/^Wet/i, this.translationService.translate('animals.wetFood'))
      .replace(/^Special/i, this.translationService.translate('animals.specialDiet'));
  }

  private async runPlanAction(planId: string, action: () => Promise<ApiFeedingPlan>): Promise<void> {
    if (this.planActionLoading) return;
    this.planActionLoading = planId;
    try {
      const updated = await action();
      this.plans = this.plans.map(plan => plan.id === updated.id ? updated : plan);
    } catch (error) {
      console.error('Failed to update feeding plan', error);
      this.plansError = true;
    } finally {
      this.planActionLoading = '';
    }
  }

  private applyDispenserStatus(status?: EdgeDispenserStatus): void {
    this.dispenserRawStatus = String(status?.['estado'] || status?.['status'] || '');
  }

  private applyScheduleConfig(config?: EdgeScheduleConfig): void {
    if (!config) return;
    this.scheduleActive = !!config.activo;
    this.scheduleInterval = String(config.intervalo || this.scheduleInterval);
  }

  private applySimulatorStatus(status?: EdgeSimulatorStatus): void {
    if (!status) return;
    this.simulatorActive = !!status.simulacion_activa;
    if (typeof status.latitude === 'number' && typeof status.longitude === 'number') {
      this.coordinatesLabel = `${status.latitude.toFixed(5)}, ${status.longitude.toFixed(5)}`;
    }
  }

  private setEdgeMessage(key: string, success: boolean): void {
    this.edgeMessageKey = key;
    this.edgeMessageSuccess = success;
  }
}
