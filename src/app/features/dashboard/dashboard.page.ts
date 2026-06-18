import { Component, OnInit, OnDestroy } from '@angular/core';
import { Alert, Animal, Device, MonitoringZone } from '../../core/domain/models/bluepatitas.models';
import { GetAlertsUseCase, GetDevicesUseCase, GetMonitoringZonesUseCase, GetFeedingEventsUseCase, GetFeedingPlansUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { GetAnimalsUseCase } from '../../core/application/use-cases/animal.use-cases';
import { GetAllApiFeedingPlansUseCase } from '../../core/application/use-cases/feeding.api-use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';
import { AlertCardComponent } from '../../shared/components/alert-card/alert-card.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

interface DashboardFeedingEvent {
  id: string;
  animalName: string;
  animalPhoto?: string;
  time: string;
  dietName: string;
  confirmed: boolean;
}

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
            @empty {
              <p class="empty-message">No hay alertas activas en este momento.</p>
            }
          </div>
        </bp-card>

        <bp-card [title]="'dashboard.upcomingFeedings' | translate" [actionLabel]="'dashboard.manageDiets' | translate">
          <table>
            <thead><tr><th>{{ 'animals.name' | translate }}</th><th>{{ 'dashboard.time' | translate }}</th><th>{{ 'dashboard.dietType' | translate }}</th><th>{{ 'common.status' | translate }}</th></tr></thead>
            <tbody>
              @for (event of feedingEvents; track event.id) {
                <tr>
                  <td>
                    @if (event.animalPhoto) {
                      <img [src]="event.animalPhoto" alt="" />
                    } @else {
                      <span class="avatar-mini">{{ event.animalName.charAt(0) }}</span>
                    }
                    {{ event.animalName }}
                  </td>
                  <td>{{ event.time }}</td>
                  <td><span class="pill">{{ event.dietName }}</span></td>
                  <td>{{ event.confirmed ? '✓' : '✗' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="empty-feedings">
                    No hay próximas alimentaciones programadas
                  </td>
                </tr>
              }
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
    td img, .avatar-mini { width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 8px; object-fit: cover; }
    .avatar-mini { display: inline-grid; place-items: center; background: var(--bp-surface-blue); color: var(--bp-action-blue); font-weight: 800; font-size: 12px; }
    .pill { display: inline-flex; border-radius: 999px; background: #d8fbf4; color: #006d66; padding: 5px 10px; font-size: 11px; font-weight: 800; }
    .muted-pill { background: #eef2f4; color: var(--bp-slate-gray); }
    .danger-pill { background: #fff1f1; color: var(--bp-critical); }
    .empty-message { margin: 10px 0; color: var(--bp-slate-gray); font-size: 13px; text-align: center; }
    .empty-feedings { text-align: center; color: var(--bp-slate-gray); padding: 24px 0 !important; }
    @media (max-width: 1100px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dashboard-grid { grid-template-columns: 1fr; } }
    @media (max-width: 620px) { .metrics { grid-template-columns: 1fr; } .actions { justify-content: stretch; } }
  `],
})
export class DashboardPage implements OnInit, OnDestroy {
  animals: Animal[] = [];
  alerts: Alert[] = [];
  devices: Device[] = [];
  zones: MonitoringZone[] = [];
  feedingEvents: DashboardFeedingEvent[] = [];

  private refreshIntervalId: any;

  constructor(
    private readonly getAnimals: GetAnimalsUseCase,
    private readonly getAlerts: GetAlertsUseCase,
    private readonly getDevices: GetDevicesUseCase,
    private readonly getZones: GetMonitoringZonesUseCase,
    private readonly getFeedingEvents: GetFeedingEventsUseCase,
    private readonly getFeedingPlans: GetFeedingPlansUseCase,
    private readonly getAllApiPlans: GetAllApiFeedingPlansUseCase,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
    // Poll data every 1 minute to get real-time telemetry updates and diet plan schedules
    this.refreshIntervalId = setInterval(() => {
      this.loadData();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
  }

  async loadData(): Promise<void> {
    try {
      const [animals, alerts, devices, zones, apiPlans] = await Promise.all([
        this.getAnimals.execute(),
        this.getAlerts.execute(),
        this.getDevices.execute(),
        this.getZones.execute(),
        this.getAllApiPlans.execute(),
      ]);

      this.animals = animals;
      this.devices = devices;
      this.zones = zones;

      const newEnvAlerts: Alert[] = [];
      for (const zone of zones) {
        const temp = zone.temperatureC;
        const hum = zone.humidity;

        if (temp !== null && temp !== undefined) {
          if (zone.maxTemperatureC !== null && zone.maxTemperatureC !== undefined && temp > zone.maxTemperatureC) {
            newEnvAlerts.push({
              id: `temp-high-${zone.id}`,
              type: 'High temperature',
              message: `Temperature is above the optimal range in ${zone.name}.`,
              severity: 'Critical',
              zoneId: zone.id,
              createdAt: new Date().toISOString()
            });
          } else if (zone.minTemperatureC !== null && zone.minTemperatureC !== undefined && temp < zone.minTemperatureC) {
            newEnvAlerts.push({
              id: `temp-low-${zone.id}`,
              type: 'Low temperature',
              message: `Temperature is below the optimal range in ${zone.name}.`,
              severity: 'Critical',
              zoneId: zone.id,
              createdAt: new Date().toISOString()
            });
          }
        }

        if (hum !== null && hum !== undefined && hum >= 70) {
          newEnvAlerts.push({
            id: `hum-high-${zone.id}`,
            type: 'High humidity',
            message: `Humidity has exceeded the safe threshold in ${zone.name}.`,
            severity: 'Warning',
            zoneId: zone.id,
            createdAt: new Date().toISOString()
          });
        }
      }

      this.alerts = [...newEnvAlerts, ...alerts];

      const animalMap = new Map(animals.map((a) => [a.id, a]));
      const events: DashboardFeedingEvent[] = [];

      // Only filter active plans
      const activePlans = apiPlans.filter(plan => plan.status === 'ACTIVE');

      for (const plan of activePlans) {
        const animal = animalMap.get(plan.animalId);
        if (!animal) continue;

        const scheduledTimes = plan.schedule?.scheduledTimes || '';
        const times = scheduledTimes.split(',').map(t => t.trim()).filter(Boolean);

        for (const time of times) {
          events.push({
            id: `${plan.id}-${time}`,
            animalName: animal.name,
            animalPhoto: animal.photoUrl,
            time: time,
            dietName: plan.dietType?.name || 'Dieta estándar',
            confirmed: true
          });
        }
      }

      // Sort feeding events chronologically
      events.sort((a, b) => a.time.localeCompare(b.time));
      this.feedingEvents = events;
    } catch (error) {
      console.warn('Failed to load dashboard data', error);
    }
  }
}
