import { Component, OnInit } from '@angular/core';
import { Alert, Animal, Device, MonitoringZone } from '../../core/domain/models/bluepatitas.models';
import { GetAlertsUseCase, GetDevicesUseCase, GetMonitoringZonesUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { GetAnimalsUseCase } from '../../core/application/use-cases/animal.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';
import { AlertCardComponent } from '../../shared/components/alert-card/alert-card.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

@Component({
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, BpCardComponent, AlertCardComponent, StatusChipComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'dashboard.title' | translate }}</h1>
        <p>{{ 'dashboard.subtitle' | translate }}</p>
      </div>
      <div class="actions">
        <bp-button prefix="+" routerLink="/animals">{{ 'dashboard.addAnimal' | translate }}</bp-button>
        <bp-button variant="secondary" routerLink="/monitoring">{{ 'dashboard.viewMonitoring' | translate }}</bp-button>
        <bp-button variant="secondary" routerLink="/veterinarians">{{ 'dashboard.registerVet' | translate }}</bp-button>
      </div>
    </div>

    <section class="metrics">
      <article>
        <small>{{ 'dashboard.animalsRegistered' | translate }}</small>
        <strong>{{ animals.length }}</strong>
        <i class="metric-dot animals"></i>
      </article>
      <article class="critical">
        <small>{{ 'dashboard.activeAlerts' | translate }}</small>
        <strong>{{ alerts.length }}</strong>
        <i class="metric-dot alert"></i>
      </article>
      <article>
        <small>{{ 'dashboard.monitoredZones' | translate }}</small>
        <strong>{{ zones.length }}</strong>
        <i class="metric-dot zone"></i>
      </article>
      <article>
        <small>{{ 'dashboard.devices' | translate }}</small>
        <strong>{{ devices.length }}</strong>
        <i class="metric-dot device"></i>
      </article>
    </section>

    <section class="dashboard-grid">
      <div class="left-stack">
        <bp-card [title]="'dashboard.recentAlerts' | translate" [actionLabel]="'dashboard.viewAll' | translate">
          <div class="stack">
            @for (alert of alerts.slice(0, 3); track alert.id) { <bp-alert-card [alert]="alert" /> }
          </div>
        </bp-card>

        <bp-card [title]="'dashboard.upcomingFeedings' | translate" [actionLabel]="'dashboard.manageDiets' | translate">
          <table>
            <thead><tr><th>{{ 'animals.name' | translate }}</th><th>{{ 'dashboard.time' | translate }}</th><th>{{ 'dashboard.dietType' | translate }}</th><th>{{ 'common.status' | translate }}</th></tr></thead>
            <tbody>
              <tr><td><img src="/assets/bluepatitas/animal-luna.png" alt="" /> Luna</td><td>14:00</td><td><span class="pill">Puppy Pro</span></td><td>✓</td></tr>
              <tr><td><img src="/assets/bluepatitas/animal-rex.png" alt="" /> Rex</td><td>14:30</td><td><span class="pill muted-pill">Adult</span></td><td>✓</td></tr>
              <tr><td><img src="/assets/bluepatitas/animal-milo.png" alt="" /> Milo</td><td>15:00</td><td><span class="pill danger-pill">Diet</span></td><td>✓</td></tr>
            </tbody>
          </table>
        </bp-card>
      </div>

      <bp-card [title]="'dashboard.environmentByZone' | translate">
        <div class="zone-list">
          @for (zone of zones; track zone.id) {
            <article class="zone" [class.warn]="zone.status === 'Warning'" [class.offline]="zone.status === 'Disconnected'">
              <header><strong>{{ zone.name }}</strong><bp-status-chip [status]="zone.status" /></header>
              <div class="readings">
                <span>{{ 'monitoring.temperature' | translate }} <b>{{ zone.temperatureC ?? '--' }}°C</b></span>
                <span>{{ 'monitoring.humidity' | translate }} <b>{{ zone.humidity ?? '--' }}%</b></span>
              </div>
              @if (zone.status === 'Warning') { <p>{{ 'dashboard.zoneWarning' | translate }}</p> }
            </article>
          }
        </div>
      </bp-card>
    </section>
  `,
  styles: [`
    .actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; align-items: center; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-bottom: 18px; }
    .metrics article { position: relative; overflow: hidden; background: white; border: 1px solid var(--bp-border); border-radius: 12px; padding: 18px 20px; box-shadow: var(--bp-shadow); min-height: 90px; display: grid; align-content: space-between; }
    .metrics article::after { content: ''; position: absolute; right: -32px; top: -36px; width: 104px; height: 104px; border-radius: 50%; background: rgba(207, 229, 245, .45); }
    .metrics .critical { border-color: rgba(217, 48, 37, .35); background: rgba(217, 48, 37, .04); }
    small { display: block; color: var(--bp-slate-gray); font-weight: 800; text-transform: uppercase; letter-spacing: .04em; font-size: 12px; }
    .metrics strong { display: block; margin-top: 10px; font-size: 36px; line-height: 1; }
    .critical strong { color: var(--bp-critical); }
    .metric-dot { position: absolute; right: 18px; top: 18px; width: 22px; height: 22px; border-radius: 50%; background: #e9f7f5; z-index: 1; }
    .metric-dot::before { content: ''; position: absolute; inset: 7px; border-radius: 50%; background: var(--bp-action-blue); }
    .metric-dot.alert::before { background: var(--bp-critical); }
    .metric-dot.zone::before { background: #008e84; }
    .metric-dot.device::before { background: var(--bp-slate-gray); }
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
    .left-stack, .stack, .zone-list { display: grid; gap: 14px; }
    .zone { border: 1px solid var(--bp-border); border-radius: 12px; padding: 16px; background: #fff; }
    .zone.warn { border-color: rgba(217, 48, 37, .28); background: rgba(217, 48, 37, .03); }
    .zone.offline { opacity: .72; }
    .zone header, .readings { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .readings { margin-top: 16px; }
    .readings span { flex: 1; border-radius: 8px; background: var(--bp-surface-blue); padding: 12px; color: var(--bp-slate-gray); }
    .warn .readings span:first-child { background: #fff; border: 1px solid rgba(217,48,37,.18); color: var(--bp-critical); }
    .readings b { display: block; color: var(--bp-dark-navy); font-size: 20px; }
    .zone p { margin: 14px 0 0; padding: 10px; border-radius: 6px; background: rgba(217,48,37,.1); color: var(--bp-critical); font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid var(--bp-border); font-size: 13px; }
    th { color: var(--bp-slate-gray); text-transform: uppercase; font-size: 11px; }
    td img { width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 8px; object-fit: cover; }
    .pill { display: inline-flex; border-radius: 999px; background: #d8fbf4; color: #006d66; padding: 5px 10px; font-size: 11px; font-weight: 800; }
    .muted-pill { background: #eef2f4; color: var(--bp-slate-gray); }
    .danger-pill { background: #fff1f1; color: var(--bp-critical); }
    @media (max-width: 1100px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dashboard-grid { grid-template-columns: 1fr; } }
    @media (max-width: 620px) { .metrics { grid-template-columns: 1fr; } .actions { justify-content: stretch; } }
  `],
})
export class DashboardPage implements OnInit {
  animals: Animal[] = [];
  alerts: Alert[] = [];
  devices: Device[] = [];
  zones: MonitoringZone[] = [];

  constructor(
    private readonly getAnimals: GetAnimalsUseCase,
    private readonly getAlerts: GetAlertsUseCase,
    private readonly getDevices: GetDevicesUseCase,
    private readonly getZones: GetMonitoringZonesUseCase,
  ) {}

  async ngOnInit(): Promise<void> {
    [this.animals, this.alerts, this.devices, this.zones] = await Promise.all([
      this.getAnimals.execute(),
      this.getAlerts.execute(),
      this.getDevices.execute(),
      this.getZones.execute(),
    ]);
  }
}
