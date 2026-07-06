import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import {
  AddApiRecommendationUseCase,
  CreateApiObservationUseCase,
  GetApiObservationsByAnimalUseCase,
  GetVeterinaryAnimalsUseCase,
  GetVeterinaryDashboardUseCase
} from '../../core/application/use-cases/veterinary.api-use-cases';
import { ApiVeterinaryObservation, VeterinaryAnimalResource, VeterinaryDashboardResource } from '../../core/domain/models/veterinary-api.models';

@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ 'veterinary.clinicalHistory' | translate }}</p>
          <h1>{{ animal?.name || ('veterinary.animalDetail' | translate) }}</h1>
          <p>{{ animal?.species || '-' }} · {{ animal?.breed || '-' }}</p>
        </div>
        <a class="secondary-action" routerLink="/veterinary/animals">{{ 'veterinary.backToAnimals' | translate }}</a>
      </header>

      @if (loading) {
        <div class="state-card">{{ 'veterinary.loadingClinicalHistory' | translate }}</div>
      } @else if (errorKey) {
        <div class="state-card error">{{ errorKey | translate }}</div>
      } @else {
        <section class="detail-grid">
          <aside class="animal-summary">
            <img [src]="animal?.photoUrl || placeholderPhoto" [alt]="animal?.name || ''" (error)="usePlaceholder($event)" />
            <div>
              <span>{{ 'veterinary.healthCondition' | translate }}</span>
              <strong>{{ healthKey(animal?.healthCondition) | translate }}</strong>
            </div>
            <div>
              <span>{{ 'veterinary.weight' | translate }}</span>
              <strong>{{ animal?.weightKg ?? '-' }} kg</strong>
            </div>
          </aside>

          <main class="history-card">
            <form class="observation-form" (ngSubmit)="createObservation()">
              <h2>{{ 'veterinary.newObservation' | translate }}</h2>
              <label>
                {{ 'veterinary.description' | translate }}
                <textarea name="description" [(ngModel)]="description" required rows="4" [placeholder]="'veterinary.descriptionPlaceholder' | translate"></textarea>
              </label>
              <button class="primary-action" type="submit" [disabled]="savingObservation">{{ savingObservation ? ('common.save' | translate) : ('veterinary.createObservation' | translate) }}</button>
              @if (successKey) {
                <p class="success">{{ successKey | translate }}</p>
              }
            </form>

            <section class="observations">
              <h2>{{ 'veterinary.observations' | translate }}</h2>
              @if (!observations.length) {
                <div class="empty">{{ 'veterinary.noObservations' | translate }}</div>
              } @else {
                @for (observation of observations; track observation.id) {
                  <article class="observation">
                    <div class="observation-header">
                      <strong>{{ observation.createdAt | date:'medium' }}</strong>
                    </div>
                    <p>{{ observation.description }}</p>
                    @if (observation.recommendation) {
                      <div class="recommendation">
                        <span>{{ 'veterinary.recommendation' | translate }}</span>
                        <p>{{ observation.recommendation }}</p>
                      </div>
                    } @else {
                      <form class="recommendation-form" (ngSubmit)="addRecommendation(observation)">
                        <input name="recommendation-{{ observation.id }}" [(ngModel)]="recommendationDrafts[observation.id]" [placeholder]="'veterinary.recommendationPlaceholder' | translate" />
                        <button type="submit">{{ 'veterinary.addRecommendation' | translate }}</button>
                      </form>
                    }
                  </article>
                }
              }
            </section>
          </main>
        </section>
      }
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 24px; padding: 12px 0 32px; }
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
    .eyebrow { margin: 0 0 4px; color: var(--bp-slate-gray); font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    h1 { margin: 0; color: var(--bp-action-blue); font-size: 36px; }
    h2 { margin: 0; font-size: 22px; }
    p { margin: 6px 0 0; color: var(--bp-slate-gray); }
    .secondary-action, .primary-action, .recommendation-form button { border-radius: 999px; font-weight: 800; }
    .secondary-action { padding: 11px 18px; border: 1px solid var(--bp-border); color: var(--bp-action-blue); background: #fff; }
    .primary-action, .recommendation-form button { border: 0; padding: 12px 18px; background: var(--bp-action-blue); color: #fff; cursor: pointer; }
    .primary-action:disabled { opacity: .64; cursor: progress; }
    .detail-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 20px; align-items: start; }
    .animal-summary, .history-card, .state-card { border: 1px solid var(--bp-border); border-radius: 12px; background: #fff; box-shadow: 0 12px 28px rgba(11, 31, 47, .06); }
    .animal-summary { display: grid; gap: 16px; padding: 18px; }
    .animal-summary img { width: 100%; aspect-ratio: 1; border-radius: 12px; object-fit: cover; background: var(--bp-surface-blue); }
    .animal-summary span { display: block; color: var(--bp-slate-gray); font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .animal-summary strong { font-size: 20px; }
    .history-card { display: grid; gap: 24px; padding: 22px; }
    .observation-form { display: grid; gap: 14px; padding-bottom: 22px; border-bottom: 1px solid var(--bp-border); }
    label { display: grid; gap: 8px; color: var(--bp-dark-navy); font-size: 13px; font-weight: 800; }
    textarea, input { width: 100%; box-sizing: border-box; border: 1px solid var(--bp-border); border-radius: 10px; padding: 13px 14px; font: inherit; color: var(--bp-dark-navy); background: #fff; }
    textarea:focus, input:focus { outline: 2px solid rgba(0, 102, 204, .18); border-color: var(--bp-action-blue); }
    .observations { display: grid; gap: 14px; }
    .observation { display: grid; gap: 12px; padding: 16px; border: 1px solid var(--bp-border); border-radius: 10px; background: #fbfdff; }
    .observation-header { display: flex; justify-content: space-between; gap: 12px; }
    .recommendation { border-left: 4px solid var(--bp-action-blue); padding: 10px 12px; background: var(--bp-surface-blue); border-radius: 8px; }
    .recommendation span { color: var(--bp-action-blue); font-weight: 800; font-size: 12px; text-transform: uppercase; }
    .recommendation-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; }
    .empty, .state-card { padding: 24px; color: var(--bp-slate-gray); }
    .state-card.error { color: var(--bp-critical); background: #fff7f7; border-color: rgba(217, 48, 37, .32); }
    .success { color: var(--bp-success); font-weight: 800; }
    @media (max-width: 900px) {
      .page-header { align-items: flex-start; flex-direction: column; }
      .detail-grid { grid-template-columns: 1fr; }
      .animal-summary { grid-template-columns: 120px minmax(0, 1fr); align-items: center; }
      .animal-summary img { width: 120px; }
    }
    @media (max-width: 560px) {
      .animal-summary, .recommendation-form { grid-template-columns: 1fr; }
      .animal-summary img { width: 100%; }
    }
  `],
})
export class VeterinaryAnimalDetailPage implements OnInit {
  readonly placeholderPhoto = '/assets/bluepatitas/animal-firulais.png';
  animal: VeterinaryAnimalResource | null = null;
  dashboard: VeterinaryDashboardResource | null = null;
  observations: ApiVeterinaryObservation[] = [];
  recommendationDrafts: Record<string, string> = {};
  description = '';
  loading = true;
  savingObservation = false;
  errorKey = '';
  successKey = '';

  private animalId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly getDashboard: GetVeterinaryDashboardUseCase,
    private readonly getAnimals: GetVeterinaryAnimalsUseCase,
    private readonly getObservations: GetApiObservationsByAnimalUseCase,
    private readonly createObservationUseCase: CreateApiObservationUseCase,
    private readonly addRecommendationUseCase: AddApiRecommendationUseCase
  ) {}

  async ngOnInit(): Promise<void> {
    this.animalId = this.route.snapshot.paramMap.get('id') ?? '';
    await this.loadData();
  }

  async createObservation(): Promise<void> {
    if (!this.description.trim() || !this.dashboard?.veterinarianId || !this.animalId) {
      return;
    }

    this.savingObservation = true;
    this.successKey = '';
    this.errorKey = '';
    try {
      await this.createObservationUseCase.execute({
        animalId: this.animalId,
        veterinarianId: String(this.dashboard.veterinarianId),
        description: this.description.trim(),
      });
      this.description = '';
      this.successKey = 'veterinary.observationCreated';
      this.observations = await this.getObservations.execute(this.animalId);
    } catch {
      this.errorKey = 'veterinary.createObservationError';
    } finally {
      this.savingObservation = false;
    }
  }

  async addRecommendation(observation: ApiVeterinaryObservation): Promise<void> {
    const recommendation = this.recommendationDrafts[observation.id]?.trim();
    if (!recommendation) {
      return;
    }

    try {
      await this.addRecommendationUseCase.execute(observation.id, { recommendation });
      this.recommendationDrafts[observation.id] = '';
      this.successKey = 'veterinary.recommendationAdded';
      this.errorKey = '';
      this.observations = await this.getObservations.execute(this.animalId);
    } catch {
      this.errorKey = 'veterinary.recommendationError';
    }
  }

  usePlaceholder(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholderPhoto;
  }

  healthKey(condition: string | null | undefined): string {
    const key = String(condition ?? '').toUpperCase();
    const known = ['HEALTHY', 'IN_TREATMENT', 'CRITICAL', 'UNDER_OBSERVATION'];
    return known.includes(key) ? `health.${key}` : 'health.UNKNOWN';
  }

  private async loadData(): Promise<void> {
    try {
      const [dashboard, animals, observations] = await Promise.all([
        this.getDashboard.execute(),
        this.getAnimals.execute(),
        this.getObservations.execute(this.animalId),
      ]);
      this.dashboard = dashboard;
      this.animal = animals.find((item) => item.id === this.animalId) ?? null;
      this.observations = observations;
    } catch {
      this.errorKey = 'veterinary.clinicalHistoryError';
    } finally {
      this.loading = false;
    }
  }
}
