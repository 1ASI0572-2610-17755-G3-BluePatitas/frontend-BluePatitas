import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Veterinarian, Animal } from '../../../core/domain/models/bluepatitas.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { HttpAnimalRepository } from '../../../core/infrastructure/repositories/http-animal.repository';
import { environment } from '../../../../environments/environment';

const modalStyles = `
  .form-grid { display: grid; gap: 14px; min-width: 0; }
  .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
  .modal-actions { margin-top: 8px; }
  .photo-upload { display: grid; justify-items: center; gap: 8px; margin: 4px 0 10px; color: var(--bp-action-blue); font-size: 11px; font-weight: 800; }
  .photo-circle { width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; border: 1px dashed #b2a5bb; background: #f6f2f8; color: #8e7d9b; position: relative; overflow: hidden; background-size: cover; background-position: center; cursor: pointer; }
  .photo-circle img { width: 100%; height: 100%; object-fit: cover; }
  .photo-circle::before { content: '+'; font-size: 26px; font-weight: 800; }
  .photo-circle.has-image::before { display: none; }
  .status-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 4px; border: 1px solid #cbe5f7; border-radius: 10px; background: var(--bp-surface-blue); }
  .status-tabs button { min-height: 30px; border: 0; border-radius: 7px; background: transparent; color: var(--bp-slate-gray); font-weight: 700; cursor: pointer; }
  .status-tabs .active { background: #fff; color: var(--bp-action-blue); box-shadow: 0 1px 4px rgba(11,31,47,.08); }
  .assigned-note { display: flex; gap: 12px; align-items: center; padding: 12px; border: 1px solid #bfe0f4; border-radius: 10px; background: var(--bp-surface-blue); }
  .assigned-note span { width: 34px; height: 34px; border-radius: 8px; background: #fff; position: relative; flex: 0 0 auto; }
  .assigned-note span::before { content: ''; position: absolute; left: 9px; top: 8px; width: 5px; height: 5px; border-radius: 50%; background: var(--bp-slate-gray); box-shadow: 7px 0 0 var(--bp-slate-gray); }
  .assigned-note strong, .assigned-note small { display: block; }
  .assigned-note small { color: var(--bp-slate-gray); font-size: 11px; }
  label.field-label { color: var(--bp-dark-navy); font-size: 12px; font-weight: 800; }
  .animal-assignment-section { display: grid; gap: 8px; }
  .animals-scroll-list { max-height: 150px; overflow-y: auto; border: 1px solid var(--bp-border); border-radius: 10px; padding: 10px; background: #fff; display: grid; gap: 6px; }
  .animal-checkbox-item { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 6px; cursor: pointer; transition: background .15s; }
  .animal-checkbox-item:hover { background: #f3f9fc; }
  .animal-checkbox-item input { width: 16px; height: 16px; accent-color: var(--bp-action-blue); cursor: pointer; }
  .animal-avatar-mini { width: 24px; height: 24px; border-radius: 50%; background-size: cover; background-position: center; border: 1px solid var(--bp-border); }
  .animal-name-text { font-size: 13px; font-weight: 600; color: var(--bp-dark-navy); }
  .empty-animals { margin: 0; padding: 10px; font-size: 12px; color: var(--bp-slate-gray); text-align: center; }
  @media (max-width: 560px) { .two-cols, .status-tabs { grid-template-columns: 1fr; } }
`;

@Component({
  selector: 'bp-add-veterinarian-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'veterinarians.newTitle' | translate" size="compact" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <p class="muted">{{ 'veterinarians.newSubtitle' | translate }}</p>
        <div class="photo-upload">
          <span class="photo-circle" (click)="fileInput.click()" [style.backgroundImage]="previewUrl ? 'url(' + previewUrl + ')' : ''" [class.has-image]="previewUrl"></span>
          <small (click)="fileInput.click()">{{ 'veterinarians.uploadPhoto' | translate }}</small>
          <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none" accept="image/*">
        </div>
        <bp-form-field [label]="'veterinarians.fullName' | translate" placeholder="Dr. Juan Perez" [(value)]="name" />
        <bp-form-field [label]="'veterinarians.institutionalEmail' | translate" placeholder="user@bluepatitas.com" [(value)]="email" />
        <bp-form-field [label]="'veterinarians.phoneWhatsapp' | translate" placeholder="+51 999 888 777" [(value)]="phone" />
        <bp-form-field [label]="'veterinarians.specialty' | translate" [placeholder]="'veterinarians.selectSpecialty' | translate" [(value)]="specialty" />
        
        <div class="animal-assignment-section">
          <label class="field-label">Asignar animales bajo su cuidado</label>
          <div class="animals-scroll-list">
            @for (animal of animals; track animal.id) {
              <label class="animal-checkbox-item">
                <input type="checkbox" 
                       [checked]="isAnimalSelected(animal.id)" 
                       (change)="toggleAnimal(animal.id)" />
                <span class="animal-avatar-mini" [style.backgroundImage]="'url(' + animal.photoUrl + ')'"></span>
                <span class="animal-name-text">{{ animal.name }} ({{ animal.species === 'Cat' ? 'Gato' : 'Perro' }})</span>
              </label>
            } @empty {
              <p class="empty-animals">No hay animales registrados en el refugio</p>
            }
          </div>
        </div>

        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button prefix="+" (clicked)="register()">{{ 'veterinarians.register' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles + `.muted { margin: -8px 0 4px; color: var(--bp-slate-gray); }`],
})
export class AddVeterinarianModalComponent {
  private _open = false;
  @Input() set open(val: boolean) {
    this._open = val;
    if (val) {
      this.reset();
    }
  }
  get open(): boolean {
    return this._open;
  }

  @Input() animals: Animal[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() registered = new EventEmitter<Omit<Veterinarian, 'id'>>();

  private readonly animalRepo = inject(HttpAnimalRepository);

  name = '';
  email = '';
  phone = '';
  specialty = '';
  previewUrl = '';
  uploadedPhotoUrl = '';
  selectedAnimalIds: string[] = [];

  isAnimalSelected(id: string): boolean {
    return this.selectedAnimalIds.includes(id);
  }

  toggleAnimal(id: string): void {
    if (this.isAnimalSelected(id)) {
      this.selectedAnimalIds = this.selectedAnimalIds.filter(x => x !== id);
    } else {
      this.selectedAnimalIds.push(id);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.previewUrl = URL.createObjectURL(file);
      try {
        this.uploadedPhotoUrl = await this.animalRepo.uploadPhoto(file);
      } catch (error) {
        console.error('Failed to upload photo', error);
      }
    }
  }

  register(): void {
    const vetData: Omit<Veterinarian, 'id'> = {
      name: this.name || 'Dr. Unknown',
      email: this.email || 'unknown@bluepatitas.app',
      phone: this.phone || '+51 900 000 000',
      specialty: this.specialty || 'General',
      status: 'Active',
      avatarUrl: this.uploadedPhotoUrl || undefined,
      assignedAnimalIds: this.selectedAnimalIds
    };

    this.registered.emit(vetData);
    this.reset();
    this.closed.emit();
  }

  private reset(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.specialty = '';
    this.previewUrl = '';
    this.uploadedPhotoUrl = '';
    this.selectedAnimalIds = [];
  }
}

@Component({
  selector: 'bp-edit-veterinarian-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'veterinarians.edit' | translate" size="compact" (closed)="closed.emit()">
      <div class="modal-body form-grid">
        <p class="muted">{{ 'veterinarians.editSubtitle' | translate }}</p>
        <div class="photo-upload">
          <span class="photo-circle" (click)="fileInput.click()" [style.backgroundImage]="previewUrl ? 'url(' + previewUrl + ')' : ''" [class.has-image]="previewUrl"></span>
          <small (click)="fileInput.click()">{{ 'veterinarians.changePhoto' | translate }}</small>
          <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none" accept="image/*">
        </div>
        <bp-form-field [label]="'veterinarians.fullName' | translate" placeholder="Dr. Elena Ramos" [(value)]="name" />
        <bp-form-field [label]="'auth.email' | translate" placeholder="eramos@bluepatitas.com" [(value)]="email" />
        <bp-form-field [label]="'veterinarians.phoneWhatsapp' | translate" placeholder="+51 999 888 777" [(value)]="phone" />
        <bp-form-field [label]="'veterinarians.specialty' | translate" placeholder="Internal medicine" [(value)]="specialty" />
        <label class="field-label">{{ 'veterinarians.availabilityStatus' | translate }}</label>
        <div class="status-tabs">
          <button [class.active]="status === 'Active'" type="button" (click)="status = 'Active'">{{ 'states.Active' | translate }}</button>
          <button [class.active]="status === 'Warning'" type="button" (click)="status = 'Warning'">{{ 'veterinarians.resting' | translate }}</button>
          <button type="button">{{ 'veterinarians.inactive' | translate }}</button>
        </div>

        <div class="animal-assignment-section">
          <label class="field-label">Asignar animales bajo su cuidado</label>
          <div class="animals-scroll-list">
            @for (animal of animals; track animal.id) {
              <label class="animal-checkbox-item">
                <input type="checkbox" 
                       [checked]="isAnimalSelected(animal.id)" 
                       (change)="toggleAnimal(animal.id)" />
                <span class="animal-avatar-mini" [style.backgroundImage]="'url(' + animal.photoUrl + ')'"></span>
                <span class="animal-name-text">{{ animal.name }} ({{ animal.species === 'Cat' ? 'Gato' : 'Perro' }})</span>
              </label>
            } @empty {
              <p class="empty-animals">No hay animales registrados en el refugio</p>
            }
          </div>
        </div>

        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button (clicked)="save()">{{ 'veterinarians.saveChanges' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [modalStyles + `.muted { margin: -8px 0 4px; color: var(--bp-slate-gray); }`],
})
export class EditVeterinarianModalComponent {
  private _open = false;
  @Input() set open(val: boolean) {
    this._open = val;
    if (val) {
      this.initForm();
    }
  }
  get open(): boolean {
    return this._open;
  }

  @Input() vet?: Veterinarian;
  @Input() animals: Animal[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Veterinarian>();

  private readonly animalRepo = inject(HttpAnimalRepository);

  name = '';
  email = '';
  specialty = '';
  phone = '';
  status: 'Active' | 'Warning' = 'Active';
  previewUrl = '';
  uploadedPhotoUrl = '';
  selectedAnimalIds: string[] = [];

  private initForm(): void {
    if (!this.vet) return;
    this.name = this.vet.name;
    this.email = this.vet.email;
    this.specialty = this.vet.specialty;
    this.phone = this.vet.phone;
    this.status = this.vet.status;
    const rawUrl = this.vet.avatarUrl || '';
    const apiBase = environment.apiBaseUrl.replace(/\/$/, '');
    this.previewUrl = rawUrl.startsWith('/') ? `${apiBase}${rawUrl}` : rawUrl;
    this.uploadedPhotoUrl = rawUrl;
    this.selectedAnimalIds = [...(this.vet.assignedAnimalIds || [])];
  }

  isAnimalSelected(id: string): boolean {
    return this.selectedAnimalIds.includes(id);
  }

  toggleAnimal(id: string): void {
    if (this.isAnimalSelected(id)) {
      this.selectedAnimalIds = this.selectedAnimalIds.filter(x => x !== id);
    } else {
      this.selectedAnimalIds.push(id);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.previewUrl = URL.createObjectURL(file);
      try {
        this.uploadedPhotoUrl = await this.animalRepo.uploadPhoto(file);
      } catch (error) {
        console.error('Failed to upload photo', error);
      }
    }
  }

  save(): void {
    if (!this.vet) return;
    const updatedVet: Veterinarian = {
      ...this.vet,
      name: this.name || this.vet.name,
      email: this.email || this.vet.email,
      specialty: this.specialty || this.vet.specialty,
      phone: this.phone || this.vet.phone,
      status: this.status,
      avatarUrl: this.uploadedPhotoUrl || undefined,
      assignedAnimalIds: this.selectedAnimalIds
    };
    this.updated.emit(updatedVet);
    this.closed.emit();
  }
}
