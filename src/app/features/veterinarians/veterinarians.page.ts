import { Component, OnInit } from '@angular/core';
import { Veterinarian } from '../../core/domain/models/bluepatitas.models';
import { GetVeterinariansUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { BpCardComponent } from '../../shared/components/bp-card/bp-card.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { AddVeterinarianModalComponent, EditVeterinarianModalComponent } from './components/veterinarian-modals.component';

@Component({
  standalone: true,
  imports: [TranslatePipe, BpButtonComponent, BpCardComponent, StatusChipComponent, AddVeterinarianModalComponent, EditVeterinarianModalComponent],
  template: `
    <div class="page-header">
      <div class="page-title"><h1>{{ 'veterinarians.title' | translate }}</h1><p>{{ 'veterinarians.subtitle' | translate }}</p></div>
      <bp-button (clicked)="addOpen = true">{{ 'veterinarians.add' | translate }}</bp-button>
    </div>
    <bp-card>
      <div class="vet-list">
        @for (vet of vets; track vet.id) {
          <article>
            <div><strong>{{ vet.name }}</strong><p>{{ vet.specialty }} · {{ vet.email }}</p></div>
            <bp-status-chip [status]="vet.status" />
            <bp-button variant="secondary" (clicked)="editOpen = true">{{ 'common.edit' | translate }}</bp-button>
          </article>
        }
      </div>
    </bp-card>
    <bp-add-veterinarian-modal [open]="addOpen" (closed)="addOpen = false" />
    <bp-edit-veterinarian-modal [open]="editOpen" (closed)="editOpen = false" />
  `,
  styles: [`.vet-list { display: grid; gap: 12px; } article { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 18px; align-items: center; border: 1px solid var(--bp-border); border-radius: 14px; padding: 18px 20px; background: #fff; } p { margin: 4px 0 0; color: var(--bp-slate-gray); }`],
})
export class VeterinariansPage implements OnInit {
  vets: Veterinarian[] = [];
  addOpen = false;
  editOpen = false;

  constructor(private readonly getVeterinarians: GetVeterinariansUseCase) {}

  async ngOnInit(): Promise<void> {
    this.vets = await this.getVeterinarians.execute();
  }
}
