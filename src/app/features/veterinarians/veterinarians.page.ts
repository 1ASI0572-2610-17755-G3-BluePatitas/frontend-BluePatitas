import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Veterinarian, Animal } from '../../core/domain/models/bluepatitas.models';
import { GetVeterinariansUseCase, CreateVeterinarianUseCase, UpdateVeterinarianUseCase, DeleteVeterinarianUseCase } from '../../core/application/use-cases/bluepatitas.use-cases';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../shared/components/bp-button/bp-button.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { AddVeterinarianModalComponent, EditVeterinarianModalComponent } from './components/veterinarian-modals.component';
import { AnimalRepository, ANIMAL_REPOSITORY } from '../../core/domain/repositories/repository.tokens';
import { environment } from '../../../environments/environment';
import { TranslationService } from '../../core/i18n/translation.service';

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
      @for (vet of filteredVets; track vet.id) {
        <article class="vet-row">
          <div class="identity">
            <span class="avatar" [class.has-image]="vet.avatarUrl">
              @if (vet.avatarUrl) { <img [src]="getAvatarUrl(vet.avatarUrl)" [alt]="vet.name" /> } @else { {{ initials(vet.name) }} }
            </span>
            <div><strong>{{ vet.name }}</strong><small>{{ vet.email }}</small></div>
          </div>
          <span>{{ vet.specialty }}</span>
          <b class="count">{{ assignedCount(vet) }}</b>
          <bp-status-chip [status]="vet.status" />
          <div class="row-actions">
            <button class="edit-action" type="button" (click)="openEdit(vet)" [attr.aria-label]="'common.edit' | translate"><span></span></button>
            <button class="delete-action" type="button" (click)="onDelete(vet)" [attr.aria-label]="'common.delete' | translate"><span></span></button>
          </div>
        </article>
      }
      <footer>{{ showingFooterText }}</footer>
    </section>

    <bp-add-veterinarian-modal [open]="addOpen" [animals]="animals" (closed)="addOpen = false" (registered)="onVetRegistered($event)" />
    <bp-edit-veterinarian-modal [open]="editOpen" [vet]="selectedVet" [animals]="animals" (closed)="editOpen = false" (updated)="onVetUpdated($event)" />
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
    .delete-action span::before { content: ''; position: absolute; left: 2px; top: 2px; width: 12px; height: 2px; background: currentColor; }
    .delete-action span::after { content: ''; position: absolute; left: 4px; top: 4px; width: 8px; height: 9px; border: 2px solid currentColor; border-top: 0; }
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
  animals: Animal[] = [];
  query = '';
  statusFilter = 'all';
  addOpen = false;
  editOpen = false;
  selectedVet?: Veterinarian;

  constructor(
    private readonly getVeterinarians: GetVeterinariansUseCase,
    private readonly createVeterinarian: CreateVeterinarianUseCase,
    private readonly updateVeterinarian: UpdateVeterinarianUseCase,
    private readonly deleteVeterinarian: DeleteVeterinarianUseCase,
    @Inject(ANIMAL_REPOSITORY) private readonly animalRepo: AnimalRepository,
    private readonly translationService: TranslationService,
  ) {}

  get filteredVets(): Veterinarian[] {
    const needle = this.query.trim().toLowerCase();
    return this.vets.filter((vet) => {
      const matchesStatus = this.statusFilter === 'all' || vet.status === this.statusFilter;
      const matchesQuery = !needle || [vet.name, vet.email, vet.specialty].join(' ').toLowerCase().includes(needle);
      return matchesStatus && matchesQuery;
    });
  }

  get showingFooterText(): string {
    const total = this.filteredVets.length;
    const lang = this.translationService.currentLanguage();
    if (lang === 'es-419') {
      return total === 0 
        ? 'No hay veterinarios registrados' 
        : `Mostrando 1-${total} de ${total} veterinario${total > 1 ? 's' : ''}`;
    } else {
      return total === 0 
        ? 'No veterinarians registered' 
        : `Showing 1-${total} of ${total} veterinarian${total > 1 ? 's' : ''}`;
    }
  }

  async ngOnInit(): Promise<void> {
    [this.vets, this.animals] = await Promise.all([
      this.getVeterinarians.execute(),
      this.animalRepo.getAnimals()
    ]);
  }

  getAvatarUrl(avatarUrl?: string): string | undefined {
    if (!avatarUrl) return undefined;
    const apiBase = environment.apiBaseUrl.replace(/\/$/, '');
    return avatarUrl.startsWith('/') ? `${apiBase}${avatarUrl}` : avatarUrl;
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase();
  }

  assignedCount(vet: Veterinarian): number {
    return vet.assignedAnimalIds?.length ?? 0;
  }

  openEdit(vet: Veterinarian): void {
    this.selectedVet = vet;
    this.editOpen = true;
  }

  async onVetRegistered(vetData: Omit<Veterinarian, 'id'>): Promise<void> {
    const created = await this.createVeterinarian.execute(vetData);
    this.vets = [...this.vets, created];
  }

  async onVetUpdated(vet: Veterinarian): Promise<void> {
    const updated = await this.updateVeterinarian.execute(vet);
    this.vets = this.vets.map(v => v.id === updated.id ? updated : v);
  }

  async onDelete(vet: Veterinarian): Promise<void> {
    const confirmed = confirm(`¿Estás seguro de que deseas eliminar a ${vet.name}?`);
    if (confirmed) {
      await this.deleteVeterinarian.execute(vet.id);
      this.vets = this.vets.filter(v => v.id !== vet.id);
    }
  }
}

