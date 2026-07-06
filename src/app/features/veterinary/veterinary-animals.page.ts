import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { GetVeterinaryAnimalsUseCase } from '../../core/application/use-cases/veterinary.api-use-cases';
import { VeterinaryAnimalResource } from '../../core/domain/models/veterinary-api.models';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ 'veterinary.workspace' | translate }}</p>
          <h1>{{ 'veterinary.myAnimalsTitle' | translate }}</h1>
          <p>{{ 'veterinary.myAnimalsSubtitle' | translate }}</p>
        </div>
        <a class="secondary-action" routerLink="/veterinary">{{ 'veterinary.backToDashboard' | translate }}</a>
      </header>

      @if (loading) {
        <div class="state-card">{{ 'veterinary.loadingAnimals' | translate }}</div>
      } @else if (errorKey) {
        <div class="state-card error">{{ errorKey | translate }}</div>
      } @else if (!animals.length) {
        <div class="state-card">{{ 'veterinary.noAssignedAnimals' | translate }}</div>
      } @else {
        <section class="animal-grid">
          @for (animal of animals; track animal.id) {
            <article class="animal-card">
              <img [src]="animal.photoUrl || placeholderPhoto" [alt]="animal.name" (error)="usePlaceholder($event)" />
              <div class="animal-body">
                <div class="animal-title">
                  <div>
                    <h2>{{ animal.name }}</h2>
                    <small>{{ animal.species || '-' }} · {{ animal.breed || '-' }}</small>
                  </div>
                  <span class="chip" [class.critical]="isCritical(animal.healthCondition)">{{ healthKey(animal.healthCondition) | translate }}</span>
                </div>
                <div class="animal-meta">
                  <span>{{ 'veterinary.weight' | translate }} <strong>{{ animal.weightKg ?? '-' }} kg</strong></span>
                </div>
                <a class="primary-action" [routerLink]="['/veterinary/animals', animal.id]">{{ 'veterinary.viewClinicalHistory' | translate }}</a>
              </div>
            </article>
          }
        </section>
      }
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 24px; padding: 12px 0 32px; }
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
    .eyebrow { margin: 0 0 4px; color: var(--bp-slate-gray); font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    h1 { margin: 0; color: var(--bp-action-blue); font-size: 36px; }
    p { margin: 6px 0 0; color: var(--bp-slate-gray); }
    .secondary-action, .primary-action { border-radius: 999px; font-weight: 800; }
    .secondary-action { padding: 11px 18px; border: 1px solid var(--bp-border); color: var(--bp-action-blue); background: #fff; }
    .primary-action { justify-self: start; padding: 11px 18px; background: var(--bp-action-blue); color: #fff; }
    .animal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
    .animal-card, .state-card { border: 1px solid var(--bp-border); border-radius: 12px; background: #fff; box-shadow: 0 12px 28px rgba(11, 31, 47, .06); }
    .animal-card { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 16px; padding: 14px; }
    .animal-card img { width: 112px; height: 112px; border-radius: 10px; object-fit: cover; background: var(--bp-surface-blue); }
    .animal-body { min-width: 0; display: grid; gap: 12px; }
    .animal-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; min-width: 0; }
    h2 { margin: 0; font-size: 20px; }
    small, .animal-meta { color: var(--bp-slate-gray); }
    .chip { flex: 0 0 auto; padding: 7px 12px; border-radius: 999px; background: #eaf7ec; color: #2e9d43; font-size: 12px; font-weight: 800; }
    .chip.critical { background: #fde7e5; color: var(--bp-critical); }
    .state-card { padding: 24px; color: var(--bp-slate-gray); }
    .state-card.error { color: var(--bp-critical); background: #fff7f7; border-color: rgba(217, 48, 37, .32); }
    @media (max-width: 720px) {
      .page-header { align-items: flex-start; flex-direction: column; }
      .animal-card { grid-template-columns: 88px minmax(0, 1fr); }
      .animal-card img { width: 88px; height: 88px; }
      .animal-title { flex-direction: column; }
    }
  `],
})
export class VeterinaryAnimalsPage implements OnInit {
  readonly placeholderPhoto = '/assets/bluepatitas/animal-firulais.png';
  animals: VeterinaryAnimalResource[] = [];
  loading = true;
  errorKey = '';

  constructor(private readonly getAnimals: GetVeterinaryAnimalsUseCase) {}

  async ngOnInit(): Promise<void> {
    try {
      this.animals = await this.getAnimals.execute();
    } catch {
      this.errorKey = 'veterinary.animalsError';
    } finally {
      this.loading = false;
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

  isCritical(condition: string | null | undefined): boolean {
    return String(condition ?? '').toUpperCase() === 'CRITICAL';
  }
}
