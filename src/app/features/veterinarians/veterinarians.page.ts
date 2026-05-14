import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Veterinarian } from '../../core/domain/models/bluepatitas.models';
import { GetVeterinariansUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { AddVeterinarianModalComponent, EditVeterinarianModalComponent } from './components/veterinarian-modals.component';

@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe, BpButtonComponent, StatusChipComponent, AddVeterinarianModalComponent, EditVeterinarianModalComponent],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'veterinarians.title' | translate }}</h1>
        <p>{{ 'veterinarians.subtitle' | translate }}</p>
      </div>
      <bp-button prefix="+" (clicked)="addOpen = true">{{ 'veterinarians.add' | translate }}</bp-button>
    </div>

    <div class="search-filter">
      <label class="search-box"><input [(ngModel)]="query" [placeholder]="'veterinarians.searchPlaceholder' | translate" /></label>
      <select class="filter-select" [(ngModel)]="statusFilter" aria-label="Veterinarian status">
        <option value="all">{{ 'animals.allStatuses' | translate }}</option>
        <option value="Active">{{ 'states.Active' | translate }}</option>
        <option value="Warning">{{ 'states.Warning' | translate }}</option>
      </select>
    </div>

    <section class="vet-table surface-card">
      <header class="table-head">
        <span>{{ 'veterinarians.nameEmail' | translate }}</span>
        <span>{{ 'veterinarians.specialty' | translate }}</span>
        <span>{{ 'veterinarians.assignedAnimals' | translate }}</span>
        <span>{{ 'common.status' | translate }}</span>
        <span>{{ 'common.actions' | translate }}</span>
      </header>
      @for (vet of filteredVets; track vet.id; let index = $index) {
        <article class="vet-row">
          <div class="identity">
            <span class="avatar" [class.has-image]="vet.avatarUrl">
              @if (vet.avatarUrl) { <img [src]="vet.avatarUrl" [alt]="vet.name" /> } @else { {{ initials(vet.name) }} }
            </span>
            <div><strong>{{ vet.name }}</strong><small>{{ vet.email }}</small></div>
          </div>
          <span>{{ vet.specialty }}</span>
          <b class="count">{{ assignedCount(index) }}</b>
          <bp-status-chip [status]="vet.status" />
          <div class="row-actions">
            <button class="edit-action" type="button" (click)="openEdit(vet)" [attr.aria-label]="'common.edit' | translate"><span></span></button>
            <button class="mail-action" type="button" [attr.aria-label]="'auth.email' | translate"><span></span></button>
          </div>
        </article>
      }
      <footer>{{ 'veterinarians.showing' | translate }}</footer>
    </section>

    <bp-add-veterinarian-modal [open]="addOpen" (closed)="addOpen = false" />
    <bp-edit-veterinarian-modal [open]="editOpen" [vet]="selectedVet" (closed)="editOpen = false" />
  `,
  styles: [`
    .vet-table { overflow: hidden; }
    .table-head, .vet-row { display: grid; grid-template-columns: minmax(220px, 1.2fr) 1fr 130px 120px 110px; gap: 16px; align-items: center; padding: 14px 20px; }
    .table-head { background: #f0f9ff; color: var(--bp-slate-gray); font-size: 12px; font-weight: 800; border-bottom: 1px solid var(--bp-border); }
    .vet-row { border-bottom: 1px solid var(--bp-border); background: #fff; }
    .identity { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: var(--bp-primary-blue); border: 1px solid var(--bp-border); color: #315b76; font-weight: 800; flex: 0 0 auto; overflow: hidden; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    strong, small { display: block; min-width: 0; overflow-wrap: anywhere; }
    strong { color: var(--bp-action-blue); }
    small { color: var(--bp-slate-gray); font-size: 12px; margin-top: 3px; }
    .count { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: var(--bp-surface-blue); color: var(--bp-action-blue); font-size: 12px; }
    .row-actions { display: flex; gap: 12px; }
    .row-actions button { width: 30px; height: 30px; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: #344454; cursor: pointer; }
    .row-actions button span { width: 16px; height: 16px; position: relative; color: currentColor; }
    .row-actions button span::before, .row-actions button span::after { content: ''; position: absolute; box-sizing: border-box; }
    .edit-action span::before { left: 3px; top: 9px; width: 10px; height: 4px; border: 2px solid currentColor; border-top: 0; transform: rotate(-45deg); }
    .edit-action span::after { left: 9px; top: 2px; width: 4px; height: 9px; border-radius: 2px; background: currentColor; transform: rotate(45deg); }
    .mail-action span::before { inset: 3px 1px; border: 2px solid currentColor; border-radius: 2px; }
    .mail-action span::after { left: 2px; right: 2px; top: 5px; height: 8px; border-left: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(-45deg); }
    footer { padding: 14px 20px; color: var(--bp-slate-gray); font-size: 12px; }
    @media (max-width: 880px) {
      .table-head { display: none; }
      .vet-row { grid-template-columns: 1fr auto; gap: 10px; }
      .vet-row > span, .count { grid-column: 1; }
      .row-actions { grid-column: 2; grid-row: 1 / span 3; align-self: start; }
    }
  `],
})
export class VeterinariansPage implements OnInit {
  vets: Veterinarian[] = [];
  query = '';
  statusFilter = 'all';
  addOpen = false;
  editOpen = false;
  selectedVet?: Veterinarian;

  constructor(private readonly getVeterinarians: GetVeterinariansUseCase) {}

  get filteredVets(): Veterinarian[] {
    const needle = this.query.trim().toLowerCase();
    return this.vets.filter((vet) => {
      const matchesStatus = this.statusFilter === 'all' || vet.status === this.statusFilter;
      const matchesQuery = !needle || [vet.name, vet.email, vet.specialty].join(' ').toLowerCase().includes(needle);
      return matchesStatus && matchesQuery;
    });
  }

  async ngOnInit(): Promise<void> {
    this.vets = await this.getVeterinarians.execute();
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase();
  }

  assignedCount(index: number): number {
    return [12, 8, 15, 5][index] ?? 6;
  }

  openEdit(vet: Veterinarian): void {
    this.selectedVet = vet;
    this.editOpen = true;
  }
}
