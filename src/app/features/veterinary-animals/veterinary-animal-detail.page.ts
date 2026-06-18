import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GetVeterinaryAnimalByIdUseCase } from '../../core/application/use-cases/veterinary.use-cases';
import { VeterinaryAnimal } from '../../core/domain/models/veterinary.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe, BpButtonComponent, BpCardComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ animal?.name || ('veterinary.animalDetail' | translate) }}</h1>
        <p>{{ 'veterinary.animalDetailSubtitle' | translate }}</p>
      </div>
      <bp-button variant="secondary" routerLink="/veterinary/animals">{{ 'onboarding.back' | translate }}</bp-button>
    </div>

    @if (errorMessage) {
      <div class="error">{{ errorMessage | translate }}</div>
    } @else if (animal) {
      <section class="detail-grid">
        <bp-card [title]="'animals.profile' | translate">
          <div class="profile">
            <img [src]="animal.photoUrl || '/assets/bluepatitas/animal-profile-firulais.png'" [alt]="animal.name" />
            <div>
              <strong>{{ animal.species }} · {{ animal.breed }}</strong>
              <span>{{ 'veterinary.healthCondition' | translate }}: {{ animal.healthCondition }}</span>
              <span>{{ 'animals.weight' | translate }}: {{ animal.weightKg ?? '--' }} kg</span>
            </div>
          </div>
        </bp-card>

        <bp-card [title]="'veterinary.recentObservations' | translate">
          <div class="observations">
            @for (observation of animal.observations ?? []; track observation.id) {
              <article>
                <strong>{{ observation.summary }}</strong>
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
    .detail-grid { display: grid; grid-template-columns: .8fr 1.2fr; gap: 18px; align-items: start; }
    .profile { display: flex; gap: 14px; align-items: center; }
    img { width: 96px; height: 96px; border-radius: 12px; object-fit: cover; background: var(--bp-surface-blue); }
    .profile div, .observations { display: grid; gap: 10px; }
    .profile span, .empty, .observations small { color: var(--bp-slate-gray); }
    .observations article { border: 1px solid var(--bp-border); border-radius: 10px; padding: 12px; background: var(--bp-surface-blue); }
    .error { border: 1px solid rgba(217,48,37,.24); background: rgba(217,48,37,.08); color: var(--bp-critical); border-radius: 10px; padding: 14px 16px; font-weight: 800; }
    @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }
  `],
})
export class VeterinaryAnimalDetailPage implements OnInit {
  animal?: VeterinaryAnimal;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly getAnimal: GetVeterinaryAnimalByIdUseCase,
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'auth.accessDenied';
      return;
    }

    try {
      this.animal = await this.getAnimal.execute(id);
    } catch {
      this.errorMessage = 'auth.accessDenied';
    }
  }
}
