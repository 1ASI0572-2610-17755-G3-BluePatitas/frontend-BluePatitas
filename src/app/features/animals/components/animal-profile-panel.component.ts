import { Component, EventEmitter, Input, Output, inject, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Animal, MonitoringZone } from '../../../core/domain/models/bluepatitas.models';
import { ApiFeedingPlan } from '../../../core/domain/models/feeding-api.models';
import { PerimeterAlert } from '../../../core/domain/models/monitoring-api.models';
import { GetPerimeterAlertsUseCase, EnableTrackingUseCase, ResolveAlertUseCase, DismissAlertUseCase } from '../../../core/application/use-cases/monitoring.use-cases';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { ANIMAL_REPOSITORY } from '../../../core/domain/repositories/repository.tokens';

declare const L: any;

@Component({
  selector: 'bp-animal-profile-panel',
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, StatusChipComponent, DecimalPipe, FormsModule],
  template: `
    @if (animal) {
      <aside>
        <header class="hero">
          <img [src]="animal.photoUrl" [alt]="animal.name" />
          <div>
            <h2>{{ animal.name }}</h2>
            <div class="chips">
              <span class="id-chip">BP-{{ animal.id.toUpperCase() }}</span>
              <bp-status-chip [status]="animal.status" />
            </div>
          </div>
          <button class="close" type="button" (click)="closed.emit()" [attr.aria-label]="'common.close' | translate">×</button>
        </header>

        <nav class="tabs" aria-label="Animal profile sections">
          <span [class.active]="activeTab === 'general'" (click)="selectTab('general')">{{ 'animals.generalInfo' | translate }}</span>
          <span [class.active]="activeTab === 'diet'" (click)="selectTab('diet')">{{ 'animals.diet' | translate }}</span>
          <span [class.active]="activeTab === 'location'" (click)="selectTab('location')">{{ 'animals.location' | translate }}</span>
          <span [class.active]="activeTab === 'alerts'" (click)="selectTab('alerts')">{{ 'nav.alerts' | translate }}</span>
        </nav>

        @if (activeTab === 'general') {
          <div class="stats">
            <span><b>{{ animal.weightKg }} kg</b><small>{{ 'animals.weight' | translate }}</small></span>
            <span><b>{{ animal.species === 'Dog' ? 'Male' : 'Female' }}</b><small>{{ 'animals.sex' | translate }}</small></span>
            <span><b>{{ animal.status === 'Healthy' ? 'Up to date' : 'Review' }}</b><small>{{ 'animals.vaccines' | translate }}</small></span>
          </div>

          <section class="clinical">
            <div class="section-title">
              <h3>{{ 'animals.clinicalDetails' | translate }}</h3>
              <button type="button" (click)="editProfile.emit()">{{ 'animals.editProfile' | translate }}</button>
            </div>
            <label>{{ 'animals.breedCross' | translate }}</label>
            <p>{{ animal.breed }}</p>
            <label>{{ 'animals.entryDate' | translate }}</label>
            <p>{{ animal.entryDate }}</p>
            <label>{{ 'animals.behaviorNotes' | translate }}</label>
            <p>{{ animal.notes }}</p>

            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--bp-border); display: flex; justify-content: flex-end;">
              <button type="button" (click)="deleteAnimal()" style="border: 0; background: transparent; color: #e53e3e; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                🗑️ Eliminar animal
              </button>
            </div>
          </section>
        }

        @if (activeTab === 'diet') {
          <section class="clinical">
            <div class="section-title">
              <h3>{{ 'animals.diet' | translate }}</h3>
              <button type="button" (click)="assignDiet.emit()">{{ (activePlan ? 'animals.editDiet' : 'animals.assignDiet') | translate }}</button>
            </div>
            @if (activePlan) {
              <label>{{ 'animals.foodBrand' | translate }}</label>
              <p>{{ activePlan.dietType.name }}</p>
              <label>{{ 'animals.portion' | translate }}</label>
              <p>{{ activePlan.foodAmount.quantity }} {{ activePlan.foodAmount.unit }}</p>
              <label>{{ 'animals.dailyFrequency' | translate }}</label>
              <p>{{ activePlan.schedule.timesPerDay }}</p>
              <label>{{ 'animals.dispenseInterval' | translate }}</label>
              <p>{{ activePlan.schedule.scheduledTimes }}</p>
              @if (activePlan.dietType.nutritionalNotes) {
                <label>{{ 'animals.feedingNotes' | translate }}</label>
                <p>{{ activePlan.dietType.nutritionalNotes }}</p>
              }

              <div class="dispenser-actions">
                <button class="btn-schedule" [class.active]="scheduleActive" (click)="toggleSchedule()" [disabled]="schedulingLoading">
                  <span class="icon">⏰</span>
                  {{ scheduleActive ? 'Desactivar horario' : 'Activar por horario' }}
                </button>
                <button class="btn-manual" (click)="triggerManual()" [disabled]="manualDispensing">
                  <span class="icon">⚡</span>
                  {{ manualDispensing ? 'Dispensando...' : 'Dispensación manual' }}
                </button>
              </div>
            } @else {
              <p>No active diet plan found for this animal.</p>
            }
          </section>
        }

        @if (activeTab === 'location') {
          <section class="zone-card">
            <small>{{ 'animals.currentZone' | translate }}</small>
            @if (isChangingZone) {
              <div class="zone-select-container" style="margin: 8px 0 16px;">
                <select [(ngModel)]="selectedZoneId" style="width: 100%; height: 38px; border: 1px solid var(--bp-border); border-radius: 6px; padding: 0 8px; font-size: 14px; color: var(--bp-dark-navy);">
                  <option value="puppies">{{ 'animals.unassignedZone' | translate }}</option>
                  @for (z of zones; track z.id) {
                    <option [value]="z.id">{{ z.name }}</option>
                  }
                </select>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                  <button type="button" class="btn-save" (click)="saveZone()" [disabled]="isSavingZone" style="height: 34px; border: 0; border-radius: 6px; background: var(--bp-action-blue); color: #fff; font-weight: 800; font-size: 12px; cursor: pointer;">
                    {{ isSavingZone ? '...' : 'Guardar' }}
                  </button>
                  <button type="button" class="btn-cancel" (click)="isChangingZone = false" style="height: 34px; border: 1px solid var(--bp-border); border-radius: 6px; background: #fff; color: var(--bp-dark-navy); font-weight: 800; font-size: 12px; cursor: pointer;">
                    Cancelar
                  </button>
                </div>
              </div>
            } @else {
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 22px; color: var(--bp-action-blue);">{{ zoneName }}</h3>
                <button type="button" (click)="startChangeZone()" style="border: 0; background: transparent; color: var(--bp-action-blue); font-size: 12px; font-weight: 800; cursor: pointer;">
                  Cambiar zona
                </button>
              </div>
            }
            <button type="button">{{ 'animals.viewZoneCamera' | translate }}</button>
          </section>

          <!-- ── GPS Collar Assignment & Simulation Controls ── -->
          <section class="clinical" style="margin-top: 14px;">
            <div class="section-title">
              <h3>📡 Collar GPS Asignado</h3>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
              <input type="checkbox" id="gps-check" [(ngModel)]="hasGps" (change)="onGpsToggleChanged()" style="width: 18px; height: 18px; cursor: pointer;" />
              <label for="gps-check" style="margin: 0; font-size: 13px; font-weight: 600; cursor: pointer;">¿Tiene GPS asignado?</label>
            </div>

            @if (hasGps) {
              <div class="simulation-controls" style="display: grid; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--bp-border);">
                <span style="font-size: 11px; font-weight: 800; color: var(--bp-slate-gray); text-transform: uppercase;">Simulador de Movimiento GPS</span>
                
                <div style="position: relative; width: 100%; height: 250px; margin: 10px 0; border-radius: 8px; border: 1px solid var(--bp-border); overflow: hidden; z-index: 1;">
                  <div id="profile-map" style="width: 100%; height: 100%;"></div>
                </div>
                <p style="font-size: 11px; color: var(--bp-slate-gray); margin: 0 0 8px 0; padding: 6px; background: #f7fafc; border-radius: 4px; line-height: 1.4; border: 1px solid var(--bp-border);">
                  💡 Haz clic en el mapa o arrastra el marcador para configurar la ubicación base del GPS en el Edge.
                </p>

                <button type="button" (click)="toggleSimulation()" style="width: 100%; height: 36px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; border-radius: 6px; border: 0; cursor: pointer; transition: background 0.2s;" [style.background]="isSimulating ? '#e53e3e' : 'var(--bp-action-blue)'" [style.color]="'#fff'">
                  <span>{{ isSimulating ? '⏸️ Detener movimiento' : '▶️ Iniciar movimiento' }}</span>
                </button>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <button type="button" (click)="returnToStart()" style="height: 34px; border: 1px solid #cbd5e0; border-radius: 6px; background: #fff; color: var(--bp-dark-navy); font-weight: 800; font-size: 11px; cursor: pointer;">
                    🔄 Regresar al inicio
                  </button>
                  <button type="button" (click)="sendFarAway()" style="height: 34px; border: 1px solid #feb2b2; border-radius: 6px; background: #fff5f5; color: #c53030; font-weight: 800; font-size: 11px; cursor: pointer;">
                    🚨 Enviar muy lejos
                  </button>
                </div>

                @if (simLat !== null && simLng !== null) {
                  <div style="font-size: 11px; color: var(--bp-slate-gray); background: #f7fafc; padding: 6px 10px; border-radius: 4px; margin-top: 6px; border: 1px solid var(--bp-border);">
                    <b>Lat:</b> {{ simLat | number:'1.6-6' }}<br>
                    <b>Lng:</b> {{ simLng | number:'1.6-6' }}
                  </div>
                }
              </div>
            }
          </section>
        }

        @if (activeTab === 'alerts') {
          <section class="clinical">
            <div class="section-title">
              <h3>{{ 'nav.alerts' | translate }}</h3>
              <button type="button" (click)="loadAlerts()">🔄 Actualizar</button>
            </div>

            @if (alertsLoading) {
              <p style="font-size: 12px; color: var(--bp-slate-gray); margin-top: 8px;">⏳ Cargando alertas...</p>
            } @else if (alertsError) {
              <p style="font-size: 12px; color: var(--bp-critical); margin-top: 8px;">⚠️ Servicio no disponible</p>
            } @else if (activeAnimalAlerts.length === 0) {
              <p style="font-size: 12px; color: var(--bp-slate-gray); margin-top: 8px;">✅ Sin alertas activas para este animal.</p>
            } @else {
              <div style="display: grid; gap: 10px; margin-top: 10px;">
                @for (pa of activeAnimalAlerts; track pa.id) {
                  <article [class.critical]="pa.isBreachConfirmed && pa.trackingActive" [class.resolved]="!pa.isBreachConfirmed && !pa.trackingActive" class="perimeter-alert">
                    <div class="pa-header">
                      <strong>Brecha de Perímetro</strong>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="pa-badge" [class.tracking]="pa.trackingActive" [class.confirmed]="pa.isBreachConfirmed && !pa.trackingActive" [class.resolved]="!pa.isBreachConfirmed && !pa.trackingActive">
                          {{ pa.trackingActive ? '📡 Tracking' : pa.isBreachConfirmed ? '⚠️ Confirmada' : '✅ Resuelta' }}
                        </span>
                        @if (!pa.isBreachConfirmed && !pa.trackingActive) {
                          <button class="dismiss-btn" (click)="dismissAlert(pa)" [disabled]="actionLoading === pa.id" title="Descartar alerta">×</button>
                        }
                      </div>
                    </div>
                    <p class="pa-target">Target: <code>{{ pa.targetId.slice(0, 8) }}…</code></p>
                    @if (pa.currentCoordinates) {
                      <p class="pa-coords">📍 {{ pa.currentCoordinates.latitude | number:'1.4-4' }}, {{ pa.currentCoordinates.longitude | number:'1.4-4' }}</p>
                    }
                    <div class="pa-actions">
                      @if (pa.isBreachConfirmed && !pa.trackingActive) {
                        <button class="pa-btn track" (click)="enableTracking(pa)" [disabled]="actionLoading === pa.id">
                          {{ actionLoading === pa.id ? '…' : '📡 Tracking' }}
                        </button>
                      }
                      @if (pa.isBreachConfirmed) {
                        <button class="pa-btn resolve" (click)="resolveAlert(pa)" [disabled]="actionLoading === pa.id">
                          {{ actionLoading === pa.id ? '…' : '✔ Resolver' }}
                        </button>
                      }
                    </div>
                  </article>
                }
              </div>
            }
          </section>
        }

      </aside>
    }
  `,
  styles: [`
    aside { position: fixed; top: 0; right: 0; z-index: 20; width: min(370px, 96vw); height: 100vh; overflow: auto; background: white; border-left: 1px solid var(--bp-border); box-shadow: -18px 0 40px rgba(11,31,47,.14); display: grid; grid-template-rows: auto auto auto auto auto 1fr; }
    .hero { display: grid; grid-template-columns: 66px minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 22px 18px 18px; background: #dff3ff; border-bottom: 1px solid var(--bp-border); }
    .hero img { width: 66px; height: 66px; border-radius: 50%; object-fit: cover; background: var(--bp-primary-blue); }
    h2 { margin: 0 0 8px; font-size: 24px; line-height: 1.1; }
    .chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .id-chip { border-radius: 4px; background: #c8ddeb; color: var(--bp-dark-navy); padding: 5px 8px; font-size: 11px; font-weight: 800; }
    .close { width: 32px; height: 32px; border: 0; border-radius: 50%; background: #eef8ff; color: var(--bp-dark-navy); cursor: pointer; font-size: 22px; line-height: 1; }
    .tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-bottom: 1px solid var(--bp-border); }
    .tabs span { padding: 12px 8px; color: var(--bp-slate-gray); text-align: center; font-size: 11px; border-bottom: 2px solid transparent; cursor: pointer; }
    .tabs .active { color: var(--bp-action-blue); border-bottom-color: var(--bp-action-blue); }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 16px 18px 8px; }
    .stats span { border: 1px solid var(--bp-border); border-radius: 6px; background: #fff; padding: 14px 8px; text-align: center; min-width: 0; }
    .stats b { display: block; font-size: 15px; }
    .stats small { display: block; color: var(--bp-slate-gray); font-size: 9px; text-transform: uppercase; margin-top: 5px; }
    .clinical { margin: 10px 18px; border: 1px solid var(--bp-border); border-radius: 8px; padding: 12px 14px; }
    .section-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
    h3 { margin: 0; font-size: 14px; }
    .section-title button { border: 0; background: transparent; color: var(--bp-action-blue); font-size: 11px; font-weight: 800; cursor: pointer; }
    label { display: block; color: var(--bp-slate-gray); font-size: 10px; margin-top: 10px; }
    p { margin: 4px 0 0; border-radius: 3px; background: #eef7fd; padding: 8px; color: var(--bp-dark-navy); font-size: 12px; line-height: 1.4; }
    .zone-card { margin: 0 18px 14px; padding: 16px; border-radius: 8px; border: 1px solid #9bcaf3; background: radial-gradient(circle at right, rgba(207,229,245,.72), transparent 42%), #e7f7ff; }
    .zone-card small { color: var(--bp-dark-navy); font-weight: 800; }
    .zone-card h3 { color: var(--bp-action-blue); font-size: 22px; margin: 8px 0 16px; }
    .zone-card button { width: 100%; min-height: 34px; border: 1px solid var(--bp-border); border-radius: 6px; background: #fff; color: var(--bp-dark-navy); cursor: pointer; }
    footer { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px 18px; border-top: 1px solid var(--bp-border); background: #fff; }
    @media (max-width: 520px) {
      aside { width: 100vw; }
    }
    .dispenser-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--bp-border); }
    .dispenser-actions button { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; border: 1px solid var(--bp-border); transition: all 0.2s ease; background: #fff; color: var(--bp-dark-navy); }
    .dispenser-actions button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(11,31,47,.08); }
    .dispenser-actions button:active:not(:disabled) { transform: translateY(0); }
    .dispenser-actions button:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .btn-schedule { border-color: #9bcaf3; color: var(--bp-action-blue); }
    .btn-schedule.active { background: #005bb0; border-color: #005bb0; color: #fff; }
    
    .btn-manual { background: var(--bp-surface-blue); border-color: #9bcaf3; color: var(--bp-action-blue); }
    .btn-manual:hover:not(:disabled) { background: #dff3ff; }

    .perimeter-alert { border-left: 3px solid #e68a00 !important; background: #fffbea !important; padding: 12px; border-radius: 6px; text-align: left; }
    .perimeter-alert.critical { border-left-color: var(--bp-critical) !important; background: rgba(217,48,37,.05) !important; }
    .perimeter-alert.resolved { border-left-color: #009b96 !important; background: #f0fdfa !important; }
    .pa-header { display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap; }
    .pa-badge { font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 999px; background: #ffefc4; color: #7a4800; white-space: nowrap; }
    .pa-badge.tracking { background: #d6f0ff; color: #005f8e; }
    .pa-badge.confirmed { background: #ffe0e0; color: #a10000; }
    .pa-badge.resolved { background: #d8fbf4; color: #007a72; }
    .dismiss-btn { background: transparent; border: 0; font-size: 18px; font-weight: bold; color: var(--bp-slate-gray); cursor: pointer; padding: 0 4px; line-height: 1; transition: color 0.15s; }
    .dismiss-btn:hover { color: var(--bp-critical); }
    .pa-target, .pa-coords { margin: 4px 0 0; font-size: 11px; color: var(--bp-slate-gray); }
    .pa-target code { background: #edf3f7; border-radius: 4px; padding: 1px 4px; font-size: 10px; }
    .pa-actions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .pa-btn { border: 0; border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
    .pa-btn:disabled { opacity: .5; cursor: default; }
    .pa-btn.track { background: #d6f0ff; color: #005f8e; }
    .pa-btn.resolve { background: #d8fbf4; color: #007a72; }
  `],
})
export class AnimalProfilePanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() animal?: Animal;
  @Input() zoneName = 'Patio 1';
  @Input() zones: MonitoringZone[] = [];
  @Input() activePlan?: ApiFeedingPlan;
  @Output() closed = new EventEmitter<void>();
  @Output() assignDiet = new EventEmitter<void>();
  @Output() viewReports = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();
  @Output() animalUpdated = new EventEmitter<Animal>();
  @Output() animalDeleted = new EventEmitter<string>();

  activeTab = 'general';

  isChangingZone = false;
  isSavingZone = false;
  selectedZoneId = '';

  hasGps = false;
  simLat: number | null = null;
  simLng: number | null = null;
  isSimulating = false;
  gpsPollTimer: any = null;

  map: any = null;
  circle: any = null;
  marker: any = null;

  private readonly http = inject(HttpClient);
  private readonly animalRepo = inject(ANIMAL_REPOSITORY);
  private readonly getPerimeterAlerts = inject(GetPerimeterAlertsUseCase);
  private readonly enableTrackingUseCase = inject(EnableTrackingUseCase);
  private readonly resolveAlertUseCase = inject(ResolveAlertUseCase);
  private readonly dismissAlertUseCase = inject(DismissAlertUseCase);

  perimeterAlerts: PerimeterAlert[] = [];
  alertsLoading = false;
  alertsError = false;
  actionLoading: string | null = null;
  
  scheduleActive = false;
  schedulingLoading = false;
  manualDispensing = false;

  ngOnInit() {
    this.checkScheduleStatus();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['animal'] && this.animal) {
      this.selectedZoneId = this.animal.zoneId;
      this.isChangingZone = false;
      this.loadGpsState();
      this.loadAlerts();
    }
  }

  ngOnDestroy() {
    this.stopGpsPolling();
    this.destroyMap();
  }

  startChangeZone() {
    if (!this.animal) return;
    this.selectedZoneId = this.animal.zoneId;
    this.isChangingZone = true;
  }

  async saveZone() {
    if (!this.animal || !this.selectedZoneId) return;
    this.isSavingZone = true;
    try {
      const updated = { ...this.animal, zoneId: this.selectedZoneId };
      const saved = await this.animalRepo.updateAnimal(updated);
      this.animal = saved;
      this.animalUpdated.emit(saved);
      this.isChangingZone = false;
      
      // If zone changed, re-render map centered on new zone geofence
      if (this.activeTab === 'location' && this.hasGps) {
        this.initProfileMap();
      }
    } catch (err) {
      console.error('Failed to update animal zone', err);
      alert('Error al actualizar la zona del animal.');
    } finally {
      this.isSavingZone = false;
    }
  }

  loadGpsState() {
    if (!this.animal) return;
    this.hasGps = localStorage.getItem('gps_assigned_' + this.animal.id) === 'true';
    if (this.hasGps) {
      this.startGpsPolling();
      if (this.activeTab === 'location') {
        this.initMapDeferred();
      }
    } else {
      this.stopGpsPolling();
      this.destroyMap();
      this.simLat = null;
      this.simLng = null;
    }
  }

  onGpsToggleChanged() {
    if (!this.animal) return;
    localStorage.setItem('gps_assigned_' + this.animal.id, this.hasGps ? 'true' : 'false');
    if (this.hasGps) {
      this.startGpsPolling();
      this.initMapDeferred();
    } else {
      this.stopGpsPolling();
      this.destroyMap();
      this.simLat = null;
      this.simLng = null;
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'location') {
      if (this.hasGps) {
        this.initMapDeferred();
      }
    } else {
      this.destroyMap();
    }
    if (tab === 'alerts') {
      this.loadAlerts();
    }
  }

  async loadAlerts() {
    this.alertsLoading = true;
    this.alertsError = false;
    try {
      this.perimeterAlerts = await this.getPerimeterAlerts.execute();
    } catch (err) {
      console.error('Failed to load alerts', err);
      this.alertsError = true;
    } finally {
      this.alertsLoading = false;
    }
  }

  get activeAnimalAlerts(): PerimeterAlert[] {
    if (!this.animal || !this.zones) return [];
    const currentZone = this.zones.find(z => z.id === this.animal?.zoneId);
    if (!currentZone || !currentZone.targetId) return [];
    return this.perimeterAlerts.filter(pa => pa.targetId === currentZone.targetId);
  }

  async enableTracking(pa: PerimeterAlert) {
    this.actionLoading = pa.id;
    try {
      const updated = await this.enableTrackingUseCase.execute(pa.targetId, pa.id);
      this.perimeterAlerts = this.perimeterAlerts.map(item => item.id === pa.id ? updated : item);
    } catch (err) {
      console.error('Failed to enable tracking', err);
      window.alert('Error al activar el tracking.');
    } finally {
      this.actionLoading = null;
    }
  }

  async resolveAlert(pa: PerimeterAlert) {
    this.actionLoading = pa.id;
    try {
      const updated = await this.resolveAlertUseCase.execute(pa.id);
      this.perimeterAlerts = this.perimeterAlerts.map(item => item.id === pa.id ? updated : item);
    } catch (err) {
      console.error('Failed to resolve alert', err);
      window.alert('Error al resolver la alerta.');
    } finally {
      this.actionLoading = null;
    }
  }

  async dismissAlert(pa: PerimeterAlert) {
    this.actionLoading = pa.id;
    try {
      await this.dismissAlertUseCase.execute(pa.id);
      this.perimeterAlerts = this.perimeterAlerts.filter(item => item.id !== pa.id);
    } catch (err) {
      console.error('Failed to dismiss alert', err);
      window.alert('Error al descartar la alerta.');
    } finally {
      this.actionLoading = null;
    }
  }

  initMapDeferred() {
    setTimeout(() => {
      this.initProfileMap();
    }, 100);
  }

  initProfileMap() {
    try {
      if (typeof L === 'undefined') return;

      const mapEl = document.getElementById('profile-map');
      if (!mapEl) return;

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      const currentZone = this.zones.find(z => z.id === this.animal?.zoneId);
      const centerLat = currentZone?.geofenceLatitude ?? -12.046374;
      const centerLng = currentZone?.geofenceLongitude ?? -77.042793;
      const radius = currentZone?.geofenceRadiusMeters ?? 100;

      const initialLat = this.simLat ?? centerLat;
      const initialLng = this.simLng ?? centerLng;

      this.map = L.map('profile-map').setView([initialLat, initialLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      this.circle = L.circle([centerLat, centerLng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        radius: radius
      }).addTo(this.map);

      const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      this.marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: redIcon
      }).addTo(this.map)
        .bindPopup(`<b>${this.animal?.name || 'Mascota'}</b>`);

      this.map.on('click', (e: any) => {
        this.updateBasePosition(e.latlng.lat, e.latlng.lng);
      });

      this.marker.on('dragend', (e: any) => {
        const pos = this.marker.getLatLng();
        this.updateBasePosition(pos.lat, pos.lng);
      });
    } catch (err) {
      console.warn('Profile Map initialization failed', err);
    }
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
      this.circle = null;
    }
  }

  async updateBasePosition(lat: number, lng: number) {
    this.simLat = lat;
    this.simLng = lng;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    }
    try {
      const currentZone = this.zones.find(z => z.id === this.animal?.zoneId);
      await this.http.post('http://localhost:18090/api/simulador/config', {
        latitude: lat,
        longitude: lng,
        targetId: currentZone?.targetId
      }).toPromise();
    } catch (err) {
      console.warn('Failed to configure simulator base position', err);
    }
  }

  async toggleSimulation() {
    if (!this.animal) return;
    const url = this.isSimulating ? 'http://localhost:18090/api/simulador/detener' : 'http://localhost:18090/api/simulador/iniciar';
    try {
      const res: any = await this.http.post(url, {}).toPromise();
      if (res) {
        this.isSimulating = res.simulacion_activa;
        if (res.latitude !== undefined) {
          this.simLat = res.latitude;
          this.simLng = res.longitude;
          if (this.marker) {
            this.marker.setLatLng([this.simLat, this.simLng]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to toggle simulation', err);
      alert('Error al conectar con el simulador en el Edge Gateway');
    }
  }

  async returnToStart() {
    if (!this.animal) return;
    try {
      const res: any = await this.http.post('http://localhost:18090/api/simulador/regresar', {}).toPromise();
      if (res) {
        this.simLat = res.latitude;
        this.simLng = res.longitude;
        if (this.marker) {
          this.marker.setLatLng([this.simLat, this.simLng]);
        }
      }
    } catch (err) {
      console.error('Failed to reset simulation', err);
      alert('Error al restablecer la simulación');
    }
  }

  async sendFarAway() {
    if (!this.animal) return;
    try {
      const res: any = await this.http.post('http://localhost:18090/api/simulador/alejar', {}).toPromise();
      if (res) {
        this.simLat = res.latitude;
        this.simLng = res.longitude;
        if (this.marker) {
          this.marker.setLatLng([this.simLat, this.simLng]);
        }
      }
    } catch (err) {
      console.error('Failed to send far away', err);
      alert('Error al alejar el collar GPS');
    }
  }

  startGpsPolling() {
    this.stopGpsPolling();
    this.pollGpsStatus();
    this.gpsPollTimer = setInterval(() => {
      if (this.hasGps) {
        this.pollGpsStatus();
      }
    }, 1000);
  }

  stopGpsPolling() {
    if (this.gpsPollTimer) {
      clearInterval(this.gpsPollTimer);
      this.gpsPollTimer = null;
    }
  }

  async pollGpsStatus() {
    if (!this.animal || !this.hasGps) return;
    try {
      const res = await this.http.get<any>('http://localhost:18090/api/simulador/estado').toPromise();
      if (res) {
        this.isSimulating = res.simulacion_activa;
        this.simLat = res.latitude;
        this.simLng = res.longitude;
        
        if (this.map && this.marker) {
          this.marker.setLatLng([this.simLat, this.simLng]);
        }
      }
    } catch (err) {
      console.warn('Failed to poll GPS status from Edge Gateway', err);
    }
  }

  async deleteAnimal() {
    if (!this.animal) return;
    const confirmed = confirm(`¿Estás seguro de que deseas eliminar a ${this.animal.name}?`);
    if (confirmed) {
      try {
        await this.animalRepo.deleteAnimal(this.animal.id);
        this.animalDeleted.emit(this.animal.id);
      } catch (err) {
        console.error('Failed to delete animal', err);
        alert('Error al eliminar el animal.');
      }
    }
  }

  async checkScheduleStatus() {
    try {
      const res = await this.http.get<any>('http://localhost:18090/api/dispensador/configurar_horario').toPromise();
      this.scheduleActive = res.activo;
    } catch (err) {
      console.warn('Could not read schedule status from Edge Gateway', err);
    }
  }

  async toggleSchedule() {
    if (!this.activePlan) return;
    this.schedulingLoading = true;
    try {
      const res = await this.http.post<any>('http://localhost:18090/api/dispensador/configurar_horario', {
        activo: !this.scheduleActive,
        intervalo: this.activePlan.schedule.scheduledTimes
      }).toPromise();
      this.scheduleActive = res.activo;
    } catch (err) {
      console.error('Failed to toggle schedule on Edge Gateway', err);
      alert('Error al conectar con el Edge Gateway');
    } finally {
      this.schedulingLoading = false;
    }
  }

  async triggerManual() {
    this.manualDispensing = true;
    try {
      await this.http.post<any>('http://localhost:18090/api/dispensador/forzar_alimento', {}).toPromise();
      alert('¡Comando de dispensación manual enviado con éxito!');
    } catch (err) {
      console.error('Failed to trigger manual dispensation', err);
      alert('Error al enviar comando manual al Edge Gateway');
    } finally {
      this.manualDispensing = false;
    }
  }
}
