import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Animal } from '../../core/domain/models/bluepatitas.models';
import { ANIMAL_REPOSITORY, AnimalRepository } from '../../core/domain/repositories/repository.tokens';
import {
  AssignAnimalToVeterinarianUseCase,
  GetAdminVeterinariansUseCase,
  GetVeterinarianAssignedAnimalsUseCase,
  InviteVeterinarianUseCase,
  UnassignAnimalFromVeterinarianUseCase
} from '../../core/application/use-cases/veterinary.api-use-cases';
import { AdminVeterinarianResource } from '../../core/domain/models/veterinary-api.models';

@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ 'veterinarians.title' | translate }}</h1>
        <p>{{ 'veterinarians.subtitle' | translate }}</p>
      </div>
      <button class="primary-action" type="button" (click)="openInviteModal()">
        + {{ 'veterinarians.add' | translate }}
      </button>
    </div>

    <div class="search-filter">
      <label class="search-box">
        <input [(ngModel)]="query" [placeholder]="'veterinarians.searchPlaceholder' | translate" />
      </label>
      <select class="filter-select" [(ngModel)]="statusFilter" aria-label="Veterinarian status">
        <option value="all">{{ 'animals.allStatuses' | translate }}</option>
        <option value="PENDING">{{ 'veterinarians.statusPending' | translate }}</option>
        <option value="ACTIVE">{{ 'veterinarians.statusActive' | translate }}</option>
      </select>
    </div>

    @if (loadingVeterinarians) {
      <section class="surface-card state-card">{{ 'veterinarians.loading' | translate }}</section>
    } @else if (pageErrorKey) {
      <section class="surface-card state-card error">{{ pageErrorKey | translate }}</section>
    } @else if (!filteredVets.length) {
      <section class="surface-card state-card">{{ 'veterinarians.empty' | translate }}</section>
    } @else {
      <section class="vet-table surface-card">
        <header class="table-head">
          <span>{{ 'veterinarians.nameEmail' | translate }}</span>
          <span>{{ 'common.status' | translate }}</span>
          <span>{{ 'veterinarians.assignedAnimals' | translate }}</span>
          <span>{{ 'veterinarians.shelter' | translate }}</span>
          <span>{{ 'common.actions' | translate }}</span>
        </header>

        @for (vet of filteredVets; track vet.id) {
          <article class="vet-row">
            <div class="identity">
              <span class="avatar">{{ initials(vet) }}</span>
              <div>
                <strong>{{ fullName(vet) }}</strong>
                <small>{{ vet.email }}</small>
              </div>
            </div>
            <span class="status-pill" [class.pending]="vet.status === 'PENDING'">
              {{ statusKey(vet.status) | translate }}
            </span>
            <b class="count">{{ vet.assignedAnimalsCount || 0 }}</b>
            <span class="shelter-name">{{ vet.shelterName || '-' }}</span>
            <div class="row-actions">
              <button type="button" (click)="openAssignments(vet)">
                {{ 'veterinarians.manageAnimals' | translate }}
              </button>
            </div>
          </article>
        }

        <footer>{{ 'veterinarians.showingPrefix' | translate }} {{ filteredVets.length }} / {{ vets.length }}</footer>
      </section>
    }

    @if (inviteOpen) {
      <div class="modal-backdrop" role="presentation">
        <section class="modal-card compact" role="dialog" aria-modal="true">
          <header class="modal-header">
            <div>
              <h2>{{ 'veterinarians.newTitle' | translate }}</h2>
              <p>{{ 'veterinarians.inviteSubtitle' | translate }}</p>
            </div>
            <button class="close-button" type="button" (click)="inviteOpen = false">×</button>
          </header>

          <form class="modal-body" (ngSubmit)="inviteVeterinarian()">
            @if (inviteErrorKey) {
              <div class="form-error">{{ inviteErrorKey | translate }}</div>
            }
            <label>
              {{ 'auth.firstName' | translate }}
              <input name="firstName" [(ngModel)]="inviteForm.firstName" autocomplete="given-name" />
            </label>
            <label>
              {{ 'auth.lastName' | translate }}
              <input name="lastName" [(ngModel)]="inviteForm.lastName" autocomplete="family-name" />
            </label>
            <label>
              {{ 'auth.email' | translate }}
              <input name="email" [(ngModel)]="inviteForm.email" type="email" autocomplete="email" />
            </label>
            <footer class="modal-actions">
              <button class="secondary-action" type="button" (click)="inviteOpen = false">{{ 'common.cancel' | translate }}</button>
              <button class="primary-action" type="submit" [disabled]="inviteLoading">
                {{ inviteLoading ? ('veterinarians.inviting' | translate) : ('veterinarians.createInvitation' | translate) }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    }

    @if (codeOpen) {
      <div class="modal-backdrop" role="presentation">
        <section class="modal-card compact" role="dialog" aria-modal="true">
          <header class="modal-header">
            <div>
              <h2>{{ 'veterinarians.invitationCode' | translate }}</h2>
              <p>{{ 'veterinarians.invitationCodeHelp' | translate }}</p>
            </div>
            <button class="close-button" type="button" (click)="codeOpen = false">×</button>
          </header>
          <div class="modal-body">
            <div class="code-box">{{ invitationCode }}</div>
            @if (codeCopied) {
              <p class="success">{{ 'veterinarians.codeCopied' | translate }}</p>
            }
            <footer class="modal-actions">
              <button class="secondary-action" type="button" (click)="codeOpen = false">{{ 'common.close' | translate }}</button>
              <button class="primary-action" type="button" (click)="copyInvitationCode()">{{ 'veterinarians.copyCode' | translate }}</button>
            </footer>
          </div>
        </section>
      </div>
    }

    @if (assignOpen) {
      <div class="modal-backdrop" role="presentation">
        <section class="modal-card wide" role="dialog" aria-modal="true">
          <header class="modal-header">
            <div>
              <h2>{{ 'veterinarians.manageAnimals' | translate }}</h2>
              <p>{{ fullName(selectedVet) }}</p>
            </div>
            <button class="close-button" type="button" (click)="closeAssignments()">×</button>
          </header>

          <div class="modal-body">
            @if (assignmentErrorKey) {
              <div class="form-error">{{ assignmentErrorKey | translate }}</div>
            }
            @if (animalsLoading) {
              <div class="state-card">{{ 'veterinarians.loadingAnimals' | translate }}</div>
            } @else if (!animals.length) {
              <div class="state-card">{{ 'veterinarians.noAnimals' | translate }}</div>
            } @else {
              @if (!assignedAnimalIds.length) {
                <div class="state-card">{{ 'veterinarians.noAssignedAnimals' | translate }}</div>
              }
              <div class="animal-list">
                @for (animal of animals; track animal.id) {
                  <article class="animal-row">
                    <img [src]="animal.photoUrl || placeholderPhoto" [alt]="animal.name" (error)="usePlaceholder($event)" />
                    <div>
                      <strong>{{ animal.name }}</strong>
                      <small>{{ animal.species }} · {{ animal.breed }} · {{ statusKeyFromAnimal(animal) | translate }}</small>
                    </div>
                    <label class="toggle">
                      <input
                        type="checkbox"
                        [checked]="isAssigned(animal.id)"
                        [disabled]="assignmentBusy[animal.id]"
                        (change)="toggleAssignment(animal)"
                      />
                      <span>{{ isAssigned(animal.id) ? ('veterinarians.assigned' | translate) : ('veterinarians.unassigned' | translate) }}</span>
                    </label>
                  </article>
                }
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin: 6px 0 20px; }
    .page-title h1 { margin: 0; color: var(--bp-action-blue); font-size: 34px; }
    .page-title p { margin: 6px 0 0; color: var(--bp-slate-gray); }
    .primary-action, .secondary-action { min-height: 42px; padding: 0 20px; border-radius: 999px; font-weight: 800; cursor: pointer; }
    .primary-action { border: 0; background: var(--bp-action-blue); color: #fff; }
    .primary-action:disabled { opacity: .65; cursor: progress; }
    .secondary-action { border: 1px solid var(--bp-border); background: #fff; color: var(--bp-action-blue); }
    .search-filter { display: grid; grid-template-columns: minmax(0, 1fr) 180px; gap: 12px; margin-bottom: 20px; }
    .search-box input, .filter-select, label input { width: 100%; box-sizing: border-box; min-height: 42px; border: 1px solid var(--bp-border); border-radius: 10px; padding: 0 14px; background: #fff; font: inherit; color: var(--bp-dark-navy); }
    .surface-card { border: 1px solid var(--bp-border); border-radius: 12px; background: #fff; }
    .state-card { padding: 24px; color: var(--bp-slate-gray); }
    .state-card.error, .form-error { color: var(--bp-critical); background: #fff7f7; border: 1px solid rgba(217, 48, 37, .26); }
    .form-error { padding: 10px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; }
    .vet-table { overflow: hidden; }
    .table-head, .vet-row { display: grid; grid-template-columns: minmax(240px, 1.4fr) 120px 140px minmax(150px, 1fr) 180px; gap: 16px; align-items: center; padding: 14px 20px; }
    .table-head { background: #f0f9ff; color: var(--bp-slate-gray); font-size: 12px; font-weight: 800; border-bottom: 1px solid var(--bp-border); }
    .vet-row { border-bottom: 1px solid var(--bp-border); background: #fff; }
    .identity { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .avatar { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: var(--bp-primary-blue); border: 1px solid var(--bp-border); color: #315b76; font-weight: 900; flex: 0 0 auto; }
    strong, small { display: block; min-width: 0; overflow-wrap: anywhere; }
    strong { color: var(--bp-dark-navy); }
    small { color: var(--bp-slate-gray); font-size: 12px; margin-top: 3px; }
    .status-pill { justify-self: start; padding: 7px 12px; border-radius: 999px; background: #eaf7ec; color: #2e9d43; font-size: 12px; font-weight: 800; }
    .status-pill.pending { background: #fff3cd; color: #9a6a00; }
    .count { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: var(--bp-surface-blue); color: var(--bp-action-blue); font-size: 13px; }
    .shelter-name { color: var(--bp-slate-gray); }
    .row-actions button { min-height: 34px; border: 1px solid var(--bp-border); border-radius: 999px; background: #fff; color: var(--bp-action-blue); padding: 0 14px; font-weight: 800; cursor: pointer; }
    .vet-table footer { padding: 14px 20px; color: var(--bp-slate-gray); font-size: 12px; }
    .modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 24px; background: rgba(11, 31, 47, .52); }
    .modal-card { width: min(720px, calc(100vw - 32px)); max-height: calc(100vh - 48px); overflow: hidden; display: grid; grid-template-rows: auto minmax(0, 1fr); border-radius: 14px; background: #fff; }
    .modal-card.compact { width: min(460px, calc(100vw - 32px)); }
    .modal-card.wide { width: min(760px, calc(100vw - 32px)); }
    .modal-header { display: flex; justify-content: space-between; gap: 16px; padding: 22px 24px 16px; border-bottom: 1px solid var(--bp-border); }
    .modal-header h2 { margin: 0; font-size: 22px; }
    .modal-header p { margin: 4px 0 0; color: var(--bp-slate-gray); }
    .close-button { width: 34px; height: 34px; border: 0; border-radius: 50%; background: var(--bp-surface-blue); color: var(--bp-dark-navy); font-size: 22px; cursor: pointer; }
    .modal-body { min-width: 0; overflow-y: auto; display: grid; gap: 14px; padding: 20px 24px 24px; }
    label { display: grid; gap: 7px; color: var(--bp-dark-navy); font-size: 13px; font-weight: 800; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 6px; }
    .code-box { padding: 18px; border: 1px dashed var(--bp-action-blue); border-radius: 12px; background: var(--bp-surface-blue); color: var(--bp-action-blue); font-size: 30px; font-weight: 900; text-align: center; letter-spacing: .08em; }
    .success { margin: 0; color: var(--bp-success); font-weight: 800; }
    .animal-list { display: grid; gap: 10px; }
    .animal-row { display: grid; grid-template-columns: 58px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--bp-border); border-radius: 10px; background: #fbfdff; }
    .animal-row img { width: 58px; height: 58px; border-radius: 10px; object-fit: cover; background: var(--bp-surface-blue); }
    .toggle { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--bp-action-blue); }
    .toggle input { width: 18px; height: 18px; accent-color: var(--bp-action-blue); }
    @media (max-width: 960px) {
      .table-head { display: none; }
      .vet-row { grid-template-columns: 1fr; gap: 10px; }
      .search-filter { grid-template-columns: 1fr; }
      .page-header { align-items: flex-start; flex-direction: column; }
    }
  `],
})
export class VeterinariansPage implements OnInit {
  readonly placeholderPhoto = '/assets/bluepatitas/animal-firulais.png';

  vets: AdminVeterinarianResource[] = [];
  animals: Animal[] = [];
  assignedAnimalIds: string[] = [];
  assignmentBusy: Record<string, boolean> = {};
  query = '';
  statusFilter = 'all';
  loadingVeterinarians = true;
  animalsLoading = false;
  inviteLoading = false;
  inviteOpen = false;
  codeOpen = false;
  assignOpen = false;
  codeCopied = false;
  invitationCode = '';
  selectedVet?: AdminVeterinarianResource;
  pageErrorKey = '';
  inviteErrorKey = '';
  assignmentErrorKey = '';
  inviteForm = {
    firstName: '',
    lastName: '',
    email: '',
  };

  constructor(
    private readonly getVeterinarians: GetAdminVeterinariansUseCase,
    private readonly inviteVeterinarianUseCase: InviteVeterinarianUseCase,
    private readonly getAssignedAnimals: GetVeterinarianAssignedAnimalsUseCase,
    private readonly assignAnimalUseCase: AssignAnimalToVeterinarianUseCase,
    private readonly unassignAnimalUseCase: UnassignAnimalFromVeterinarianUseCase,
    @Inject(ANIMAL_REPOSITORY) private readonly animalRepo: AnimalRepository
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadVeterinarians();
  }

  get filteredVets(): AdminVeterinarianResource[] {
    const needle = this.query.trim().toLowerCase();
    return this.vets.filter((vet) => {
      const status = (vet.status || '').toUpperCase();
      const matchesStatus = this.statusFilter === 'all' || status === this.statusFilter;
      const matchesQuery = !needle || [
        vet.firstName,
        vet.lastName,
        vet.email,
        vet.shelterName,
        status,
      ].join(' ').toLowerCase().includes(needle);
      return matchesStatus && matchesQuery;
    });
  }

  async loadVeterinarians(): Promise<void> {
    this.loadingVeterinarians = true;
    this.pageErrorKey = '';
    try {
      this.vets = await this.getVeterinarians.execute();
    } catch (error) {
      this.pageErrorKey = this.errorKey(error);
    } finally {
      this.loadingVeterinarians = false;
    }
  }

  openInviteModal(): void {
    this.inviteForm = { firstName: '', lastName: '', email: '' };
    this.inviteErrorKey = '';
    this.inviteOpen = true;
  }

  async inviteVeterinarian(): Promise<void> {
    this.inviteErrorKey = '';
    const payload = {
      firstName: this.inviteForm.firstName.trim(),
      lastName: this.inviteForm.lastName.trim(),
      email: this.inviteForm.email.trim(),
    };

    if (!payload.firstName || !payload.lastName || !this.isValidEmail(payload.email)) {
      this.inviteErrorKey = 'veterinarians.errorValidation';
      return;
    }

    this.inviteLoading = true;
    try {
      const invited = await this.inviteVeterinarianUseCase.execute(payload);
      this.invitationCode = invited.invitationCode;
      this.codeCopied = false;
      this.inviteOpen = false;
      this.codeOpen = true;
      await this.loadVeterinarians();
    } catch (error) {
      this.inviteErrorKey = this.errorKey(error);
    } finally {
      this.inviteLoading = false;
    }
  }

  async copyInvitationCode(): Promise<void> {
    if (!this.invitationCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.invitationCode);
      this.codeCopied = true;
    } catch {
      this.codeCopied = false;
    }
  }

  async openAssignments(vet: AdminVeterinarianResource): Promise<void> {
    this.selectedVet = vet;
    this.assignOpen = true;
    this.assignmentErrorKey = '';
    this.animalsLoading = true;
    try {
      const [animals, assigned] = await Promise.all([
        this.animalRepo.getAnimals(),
        this.getAssignedAnimals.execute(vet.id),
      ]);
      this.animals = animals;
      this.assignedAnimalIds = assigned.map((animal) => animal.id);
    } catch (error) {
      this.assignmentErrorKey = this.errorKey(error);
    } finally {
      this.animalsLoading = false;
    }
  }

  closeAssignments(): void {
    this.assignOpen = false;
    this.selectedVet = undefined;
    this.assignedAnimalIds = [];
    this.assignmentBusy = {};
  }

  async toggleAssignment(animal: Animal): Promise<void> {
    if (!this.selectedVet || this.assignmentBusy[animal.id]) {
      return;
    }

    this.assignmentBusy[animal.id] = true;
    this.assignmentErrorKey = '';
    const wasAssigned = this.isAssigned(animal.id);

    try {
      if (wasAssigned) {
        await this.unassignAnimalUseCase.execute(this.selectedVet.id, animal.id);
        this.assignedAnimalIds = this.assignedAnimalIds.filter((id) => id !== animal.id);
      } else {
        await this.assignAnimalUseCase.execute(this.selectedVet.id, animal.id);
        this.assignedAnimalIds = [...this.assignedAnimalIds, animal.id];
      }

      this.updateSelectedVetCount();
    } catch (error) {
      this.assignmentErrorKey = this.errorKey(error);
    } finally {
      this.assignmentBusy[animal.id] = false;
    }
  }

  isAssigned(animalId: string): boolean {
    return this.assignedAnimalIds.includes(animalId);
  }

  fullName(vet?: AdminVeterinarianResource): string {
    if (!vet) {
      return '';
    }
    return `${vet.firstName || ''} ${vet.lastName || ''}`.trim() || vet.email;
  }

  initials(vet: AdminVeterinarianResource): string {
    return [vet.firstName, vet.lastName]
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'VT';
  }

  statusKey(status: string): string {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'PENDING') {
      return 'veterinarians.statusPending';
    }
    if (normalized === 'ACTIVE') {
      return 'veterinarians.statusActive';
    }
    return 'health.UNKNOWN';
  }

  statusKeyFromAnimal(animal: Animal): string {
    return `states.${animal.status}`;
  }

  usePlaceholder(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholderPhoto;
  }

  private updateSelectedVetCount(): void {
    if (!this.selectedVet) {
      return;
    }

    const nextCount = this.assignedAnimalIds.length;
    this.selectedVet = { ...this.selectedVet, assignedAnimalsCount: nextCount };
    this.vets = this.vets.map((vet) => vet.id === this.selectedVet?.id ? { ...vet, assignedAnimalsCount: nextCount } : vet);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private errorKey(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'veterinarians.errorValidation';
      }
      if (error.status === 401 || error.status === 403) {
        return 'veterinarians.errorUnauthorized';
      }
      if (error.status === 404) {
        return 'veterinarians.errorNotFound';
      }
    }
    return 'veterinarians.errorOperation';
  }
}
