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
        <bp-button routerLink="/animals">{{ 'dashboard.addAnimal' | translate }}</bp-button>
        <bp-button variant="secondary" routerLink="/monitoring">{{ 'dashboard.viewMonitoring' | translate }}</bp-button>
        <bp-button variant="secondary" routerLink="/veterinarians">{{ 'dashboard.registerVet' | translate }}</bp-button>
      </div>
    </div>

    <section class="metrics">
      <article><small>{{ 'dashboard.animalsRegistered' | translate }}</small><strong>{{ animals.length }}</strong></article>
      <article class="critical"><small>{{ 'dashboard.activeAlerts' | translate }}</small><strong>{{ alerts.length }}</strong></article>
      <article><small>{{ 'dashboard.monitoredZones' | translate }}</small><strong>{{ zones.length }}</strong></article>
      <article><small>{{ 'dashboard.devices' | translate }}</small><strong>{{ devices.length }}</strong></article>
    </section>

    <section class="dashboard-grid">
      <bp-card [title]="'dashboard.recentAlerts' | translate">
        <div class="stack">
          @for (alert of alerts.slice(0, 3); track alert.id) { <bp-alert-card [alert]="alert" /> }
        </div>
      </bp-card>

      <bp-card [title]="'dashboard.environmentByZone' | translate">
        <div class="zone-list">
          @for (zone of zones; track zone.id) {
            <article class="zone">
              <header><strong>{{ zone.name }}</strong><bp-status-chip [status]="zone.status" /></header>
              <div class="readings">
                <span>{{ 'monitoring.temperature' | translate }} <b>{{ zone.temperatureC ?? '--' }}°C</b></span>
                <span>{{ 'monitoring.humidity' | translate }} <b>{{ zone.humidity ?? '--' }}%</b></span>
              </div>
            </article>
          }
        </div>
      </bp-card>

      <bp-card [title]="'dashboard.upcomingFeedings' | translate">
        <table>
          <tr><th>Animal</th><th>Time</th><th>Diet</th></tr>
          <tr><td>Luna</td><td>14:00</td><td>Puppy Pro</td></tr>
          <tr><td>Milo</td><td>15:00</td><td>Adult Care</td></tr>
        </table>
      </bp-card>
    </section>
  `,
  styles: [`
    .actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; align-items: center; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-bottom: 24px; }
    .metrics article { background: white; border: 1px solid var(--bp-border); border-radius: 16px; padding: 22px 24px; box-shadow: var(--bp-shadow); min-height: 126px; display: grid; align-content: space-between; }
    .metrics .critical { border-color: rgba(217, 48, 37, .35); background: rgba(217, 48, 37, .04); }
    small { display: block; color: var(--bp-slate-gray); font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
    .metrics strong { display: block; margin-top: 10px; font-size: 40px; line-height: 1; }
    .critical strong { color: var(--bp-critical); }
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .dashboard-grid bp-card:first-child { grid-row: span 2; }
    .stack, .zone-list { display: grid; gap: 12px; }
    .zone { border: 1px solid var(--bp-border); border-radius: 14px; padding: 16px; }
    .zone header, .readings { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .readings { margin-top: 16px; }
    .readings span { flex: 1; border-radius: 10px; background: var(--bp-surface-blue); padding: 12px; color: var(--bp-slate-gray); }
    .readings b { display: block; color: var(--bp-dark-navy); font-size: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid var(--bp-border); }
    @media (max-width: 1100px) { .metrics, .dashboard-grid { grid-template-columns: 1fr; } }
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
