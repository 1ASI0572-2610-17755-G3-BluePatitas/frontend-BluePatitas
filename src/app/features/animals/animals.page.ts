import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Animal, MonitoringZone, Report } from '../../core/domain/models/bluepatitas.models';
import { GetAnimalsUseCase } from '../../core/application/use-cases/animal.use-cases';
import { GetMonitoringZonesUseCase, GetReportsUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { AnimalCardComponent } from '../../shared/components/animal-card/animal-card.component';
import { AnimalProfilePanelComponent } from './components/animal-profile-panel.component';
import { AddAnimalModalComponent, AssignDietModalComponent, ViewReportsModalComponent } from './components/animal-modals.component';

@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe, BpButtonComponent, AnimalCardComponent, AnimalProfilePanelComponent, AddAnimalModalComponent, AssignDietModalComponent, ViewReportsModalComponent],
  template: `
    <div class="page-header" [class.has-panel]="selectedAnimal">
      <div class="page-title">
        <h1>{{ 'animals.title' | translate }}</h1>
        <p>{{ 'animals.subtitle' | translate }}</p>
      </div>
      <bp-button prefix="+" (clicked)="addOpen = true">{{ 'animals.add' | translate }}</bp-button>
    </div>

    <div class="search-filter" [class.has-panel]="selectedAnimal">
      <label class="search-box">
        <input [(ngModel)]="query" [placeholder]="'animals.searchPlaceholder' | translate" />
      </label>
      <select class="filter-select" [(ngModel)]="statusFilter" aria-label="Animal status">
        <option value="all">{{ 'animals.allStatuses' | translate }}</option>
        <option value="Healthy">{{ 'states.Healthy' | translate }}</option>
        <option value="Warning">{{ 'states.Warning' | translate }}</option>
        <option value="Critical">{{ 'states.Critical' | translate }}</option>
      </select>
    </div>

    <section class="animals-layout" [class.has-panel]="selectedAnimal">
      <div class="animals-grid">
        @for (animal of filteredAnimals; track animal.id) {
          <bp-animal-card
            [animal]="animal"
            [selectedId]="selectedAnimal?.id ?? ''"
            [zoneLabel]="zoneName(animal.zoneId)"
            (selected)="selectAnimal($event)"
          />
        }
      </div>
    </section>

    <bp-animal-profile-panel
      [animal]="selectedAnimal"
      [zoneName]="selectedAnimal ? zoneName(selectedAnimal.zoneId) : ''"
      (closed)="selectedAnimal = undefined"
      (assignDiet)="dietOpen = true"
      (viewReports)="openReports()"
    />
    <bp-add-animal-modal [open]="addOpen" (closed)="addOpen = false" />
    <bp-assign-diet-modal [open]="dietOpen" (closed)="dietOpen = false" />
    <bp-view-reports-modal [open]="reportsOpen" [animalName]="selectedAnimal?.name ?? ''" [reports]="reports" (closed)="reportsOpen = false" />
  `,
  styles: [`
    .animals-layout, .page-header, .search-filter { transition: padding-right .18s ease; }
    .animals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: 18px; align-items: start; }
    @media (min-width: 1180px) {
      .animals-layout.has-panel, .page-header.has-panel, .search-filter.has-panel { padding-right: 350px; }
    }
    @media (max-width: 1180px) { .page-header.has-panel, .search-filter.has-panel { padding-right: 0; } }
  `],
})
export class AnimalsPage implements OnInit {
  animals: Animal[] = [];
  zones: MonitoringZone[] = [];
  reports: Report[] = [];
  selectedAnimal?: Animal;
  query = '';
  statusFilter = 'all';
  addOpen = false;
  dietOpen = false;
  reportsOpen = false;

  constructor(
    private readonly getAnimals: GetAnimalsUseCase,
    private readonly getReports: GetReportsUseCase,
    private readonly getZones: GetMonitoringZonesUseCase,
  ) {}

  get filteredAnimals(): Animal[] {
    const needle = this.query.trim().toLowerCase();
    return this.animals.filter((animal) => {
      const matchesStatus = this.statusFilter === 'all' || animal.status === this.statusFilter;
      const matchesQuery = !needle || [animal.name, animal.species, animal.breed, this.zoneName(animal.zoneId)].join(' ').toLowerCase().includes(needle);
      return matchesStatus && matchesQuery;
    });
  }

  async ngOnInit(): Promise<void> {
    [this.animals, this.zones] = await Promise.all([this.getAnimals.execute(), this.getZones.execute()]);
    this.selectedAnimal = this.animals[0];
  }

  selectAnimal(animal: Animal): void {
    this.selectedAnimal = animal;
  }

  zoneName(zoneId: string): string {
    return this.zones.find((zone) => zone.id === zoneId)?.name ?? zoneId;
  }

  async openReports(): Promise<void> {
    this.reports = await this.getReports.execute(this.selectedAnimal?.id);
    this.reportsOpen = true;
  }
}
