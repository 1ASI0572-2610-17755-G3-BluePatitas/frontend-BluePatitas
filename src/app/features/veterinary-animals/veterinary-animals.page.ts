import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetVeterinaryAnimalsUseCase } from '../../core/application/use-cases/veterinary.use-cases';
import { VeterinaryAnimal } from '../../core/domain/models/veterinary.models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe, BpButtonComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'veterinary.animalsTitle' | translate }}</h1>
        <p>{{ 'veterinary.animalsSubtitle' | translate }}</p>
      </div>
    </div>

    @if (errorMessage) {
      <div class="error">{{ errorMessage | translate }}</div>
    }

    <section class="animal-grid">
      @for (animal of animals; track animal.id) {
        <article class="animal-card">
          <img [src]="animal.photoUrl || '/assets/bluepatitas/animal-profile-firulais.png'" [alt]="animal.name" (error)="hideBrokenImage($event)" />
          <div class="animal-main">
            <h2>{{ animal.name }}</h2>
            <p>{{ animal.species }} · {{ animal.breed }}</p>
            <small>{{ 'veterinary.healthCondition' | translate }}: {{ animal.healthCondition }}</small>
          </div>
          <div class="animal-meta">
            <strong>{{ animal.weightKg ?? '--' }} kg</strong>
            <bp-button variant="secondary" [routerLink]="'/veterinary/animals/' + animal.id">{{ 'monitoring.viewDetail' | translate }}</bp-button>
          </div>
        </article>
      } @empty {
        <p class="empty">{{ 'veterinary.noAnimals' | translate }}</p>
      }
    </section>
  `,
  styles: [`
    .animal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 16px; }
    .animal-card { display: grid; grid-template-columns: 72px minmax(0, 1fr) auto; align-items: center; gap: 14px; border: 1px solid var(--bp-border); border-radius: 12px; background: #fff; padding: 14px; box-shadow: var(--bp-shadow); }
    img { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; background: var(--bp-surface-blue); }
    h2 { margin: 0 0 5px; font-size: 18px; }
    p, small { margin: 0; color: var(--bp-slate-gray); }
    small { display: block; margin-top: 6px; }
    .animal-meta { display: grid; justify-items: end; gap: 10px; }
    .animal-meta strong { font-size: 18px; }
    .error { margin-bottom: 14px; border: 1px solid rgba(217,48,37,.24); background: rgba(217,48,37,.08); color: var(--bp-critical); border-radius: 10px; padding: 14px 16px; font-weight: 800; }
    .empty { color: var(--bp-slate-gray); }
    @media (max-width: 640px) { .animal-card { grid-template-columns: 64px 1fr; } .animal-meta { grid-column: 1 / -1; justify-items: stretch; } }
  `],
})
export class VeterinaryAnimalsPage implements OnInit {
  animals: VeterinaryAnimal[] = [];
  errorMessage = '';

  constructor(private readonly getAnimals: GetVeterinaryAnimalsUseCase) {}

  async ngOnInit(): Promise<void> {
    try {
      this.animals = await this.getAnimals.execute();
    } catch {
      this.errorMessage = 'auth.accessDenied';
    }
  }

  hideBrokenImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
