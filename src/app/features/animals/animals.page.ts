import { Component, OnInit, ViewChild } from '@angular/core';
import { Animal, Report } from '../../core/domain/models/bluepatitas.models';
import { GetAnimalsUseCase } from '../../core/application/use-cases/animal.use-cases';
import { GetReportsUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { AnimalCardComponent } from '../../shared/components/animal-card/animal-card.component';
import { AnimalProfilePanelComponent } from './components/animal-profile-panel.component';
import { AddAnimalModalComponent, AssignDietModalComponent, ViewReportsModalComponent } from './components/animal-modals.component';

@Component({
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, AnimalCardComponent, AnimalProfilePanelComponent, AddAnimalModalComponent, AssignDietModalComponent, ViewReportsModalComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'animals.title' | translate }}</h1>
        <p>{{ 'animals.subtitle' | translate }}</p>
      </div>
      <bp-button icon="add" (clicked)="addOpen = true">{{ 'animals.add' | translate }}</bp-button>
    </div>
    <section class="animals-grid">
      @for (animal of animals; track animal.id) {
        <bp-animal-card [animal]="animal" (selected)="selectAnimal($event)" />
      }
    </section>
    <bp-animal-profile-panel [animal]="selectedAnimal" (closed)="selectedAnimal = undefined" (assignDiet)="dietOpen = true" (viewReports)="openReports()" />
    <bp-add-animal-modal [open]="addOpen" (closed)="addOpen = false" />
    <bp-assign-diet-modal [open]="dietOpen" (closed)="dietOpen = false" />
    <bp-view-reports-modal [open]="reportsOpen" [reports]="reports" (closed)="reportsOpen = false" />
  `,
  styles: [`.animals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }`],
})
export class AnimalsPage implements OnInit {
  animals: Animal[] = [];
  reports: Report[] = [];
  selectedAnimal?: Animal;
  addOpen = false;
  dietOpen = false;
  reportsOpen = false;

  constructor(private readonly getAnimals: GetAnimalsUseCase, private readonly getReports: GetReportsUseCase) {}

  async ngOnInit(): Promise<void> {
    this.animals = await this.getAnimals.execute();
  }

  selectAnimal(animal: Animal): void {
    this.selectedAnimal = animal;
  }

  async openReports(): Promise<void> {
    this.reports = await this.getReports.execute(this.selectedAnimal?.id);
    this.reportsOpen = true;
  }
}
