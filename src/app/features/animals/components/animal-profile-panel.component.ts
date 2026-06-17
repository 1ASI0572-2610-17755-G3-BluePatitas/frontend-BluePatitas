import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Animal } from '../../../core/domain/models/bluepatitas.models';
import { ApiFeedingPlan } from '../../../core/domain/models/feeding-api.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'bp-animal-profile-panel',
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, StatusChipComponent],
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
          <span [class.active]="activeTab === 'general'" (click)="activeTab = 'general'">{{ 'animals.generalInfo' | translate }}</span>
          <span [class.active]="activeTab === 'diet'" (click)="activeTab = 'diet'">{{ 'animals.diet' | translate }}</span>
          <span [class.active]="activeTab === 'location'" (click)="activeTab = 'location'">{{ 'animals.location' | translate }}</span>
          <span [class.active]="activeTab === 'alerts'" (click)="activeTab = 'alerts'">{{ 'nav.alerts' | translate }}</span>
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
            <h3>{{ zoneName }}</h3>
            <button type="button">{{ 'animals.viewZoneCamera' | translate }}</button>
          </section>
        }

        @if (activeTab === 'alerts') {
          <section class="clinical">
            <h3>{{ 'nav.alerts' | translate }}</h3>
            <p>No active alerts for this animal.</p>
          </section>
        }

        <footer>
          <bp-button variant="secondary" (clicked)="assignDiet.emit()">{{ (activePlan ? 'animals.editDiet' : 'animals.assignDiet') | translate }}</bp-button>
          <bp-button (clicked)="viewReports.emit()">{{ 'animals.viewReports' | translate }}</bp-button>
        </footer>
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
  `],
})
export class AnimalProfilePanelComponent implements OnInit {
  @Input() animal?: Animal;
  @Input() zoneName = 'Patio 1';
  @Input() activePlan?: ApiFeedingPlan;
  @Output() closed = new EventEmitter<void>();
  @Output() assignDiet = new EventEmitter<void>();
  @Output() viewReports = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();

  activeTab = 'general';

  private readonly http = inject(HttpClient);
  
  scheduleActive = false;
  schedulingLoading = false;
  manualDispensing = false;

  ngOnInit() {
    this.checkScheduleStatus();
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
