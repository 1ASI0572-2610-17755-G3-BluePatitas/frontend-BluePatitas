import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Animal, MonitoringZone, Report } from '../../../core/domain/models/bluepatitas.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BpButtonComponent } from '../../../shared/components/bp-button/bp-button.component';
import { BpModalComponent } from '../../../shared/components/bp-modal/bp-modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { HttpAnimalRepository } from '../../../core/infrastructure/repositories/http-animal.repository';
import { FormsModule } from '@angular/forms';
import { ApiFeedingPlan, CreateFeedingPlanRequest } from '../../../core/domain/models/feeding-api.models';
import { HttpFeedingRepository } from '../../../core/infrastructure/repositories/http-feeding.repository';
import { firstValueFrom } from 'rxjs';
import { CreateAnimalUseCase } from '../../../core/application/use-cases/animal.use-cases';
import { MediaService } from '../../../core/infrastructure/services/media.service';

@Component({
  selector: 'bp-add-animal-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent, FormsModule],
  template: `
    <bp-modal [open]="open" [title]="'animals.add' | translate" size="compact" (closed)="handleClose()">
      <div class="modal-body animal-form">
        <div class="photo-upload">
          <span (click)="fileInput.click()" [style.backgroundImage]="previewUrl ? 'url(' + previewUrl + ')' : ''" [class.has-preview]="previewUrl"></span>
          <div class="photo-actions">
            <small (click)="fileInput.click()">{{ 'animals.uploadPhoto' | translate }}</small>
            @if (previewUrl) {
              <button type="button" (click)="removeSelectedImage(fileInput)">{{ 'animals.removePhoto' | translate }}</button>
            }
          </div>
          <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none" accept="image/*">
        </div>
        @if (errorMessage) {
          <p class="form-feedback error">{{ errorMessage | translate }}</p>
        }
        @if (successMessage) {
          <p class="form-feedback success">{{ successMessage | translate }}</p>
        }
        <bp-form-field [label]="'animals.name' | translate" placeholder="Firulais" [(value)]="name" />
        <bp-form-field [label]="'animals.species' | translate" [placeholder]="'animals.selectSpecies' | translate" [(value)]="species" />
        <bp-form-field [label]="'animals.breedCross' | translate" placeholder="Mixed breed" [(value)]="breed" />
        <div class="field-block">
          <label>{{ 'animals.sex' | translate }}</label>
          <div class="segmented">
            <button type="button" [class.active]="sex === 'Male'" (click)="sex = 'Male'">{{ 'animals.male' | translate }}</button>
            <button type="button" [class.active]="sex === 'Female'" (click)="sex = 'Female'">{{ 'animals.female' | translate }}</button>
          </div>
        </div>
        <div class="field-block">
          <label>{{ 'animals.location' | translate }}</label>
          <select class="zone-select" [(ngModel)]="selectedZoneId" name="zoneId">
            <option value="puppies">{{ 'animals.unassignedZone' | translate }}</option>
            @for (zone of zones; track zone.id) {
              <option [value]="zone.id">{{ zone.name }}</option>
            }
          </select>
        </div>
        <div class="two-cols">
          <bp-form-field [label]="'animals.years' | translate" placeholder="0" type="number" [(value)]="years" />
          <bp-form-field [label]="'animals.months' | translate" placeholder="0" type="number" [(value)]="months" />
        </div>
        <div class="field-block">
          <label>{{ 'animals.initialHealth' | translate }}</label>
          <select class="zone-select" [(ngModel)]="initialHealth" name="initialHealth">
            <option value="Healthy">{{ 'states.Healthy' | translate }}</option>
            <option value="Warning">{{ 'states.Warning' | translate }}</option>
            <option value="Critical">{{ 'states.Critical' | translate }}</option>
          </select>
        </div>
        <div class="two-cols">
          <bp-form-field [label]="'animals.weight' | translate" type="number" [(value)]="weightKg" placeholder="10.0" />
          <bp-form-field [label]="'animals.entryDate' | translate" type="date" [(value)]="entryDate" />
        </div>
        <div class="modal-actions">
          <bp-button variant="ghost" (clicked)="handleClose()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button prefix="+" (clicked)="register()">{{ (isSubmitting ? 'animals.savingAnimal' : 'animals.registerAnimal') | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .animal-form { display: grid; gap: 12px; min-width: 0; }
    .photo-upload { display: grid; justify-items: center; gap: 8px; margin-top: -4px; }
    .photo-upload span { width: 88px; height: 88px; border-radius: 50%; border: 1px dashed #7d6b91; background: #f3eef6; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .photo-upload span::before { content: '+'; position: absolute; inset: 0; display: grid; place-items: center; color: #7d6b91; font-size: 28px; font-weight: 700; }
    .photo-upload span.has-preview::before { display: none; }
    .photo-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; }
    .photo-upload small { color: var(--bp-action-blue); font-size: 11px; font-weight: 700; cursor: pointer; }
    .photo-actions button { border: 0; background: transparent; color: var(--bp-critical); font-size: 11px; font-weight: 800; cursor: pointer; padding: 0; }
    .form-feedback { margin: 0; border-radius: 10px; padding: 10px 12px; font-size: 12px; font-weight: 700; }
    .form-feedback.error { background: rgba(217, 48, 37, .08); color: var(--bp-critical); border: 1px solid rgba(217, 48, 37, .16); }
    .form-feedback.success { background: rgba(87, 182, 95, .1); color: #1f7a34; border: 1px solid rgba(87, 182, 95, .2); }
    .field-block label { display: block; margin-bottom: 7px; color: var(--bp-dark-navy); font-size: 12px; font-weight: 700; }
    .segmented { display: grid; grid-template-columns: 1fr 1fr; border-radius: 10px; background: #eee8ef; padding: 4px; }
    .segmented button { min-height: 32px; border: 0; border-radius: 7px; background: transparent; color: var(--bp-slate-gray); cursor: pointer; }
    .segmented .active { background: #fff; color: var(--bp-action-blue); box-shadow: 0 1px 4px rgba(11,31,47,.08); }
    .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
    .modal-actions { justify-content: flex-end; margin-top: 8px; }
    @media (max-width: 520px) { .two-cols { grid-template-columns: 1fr; } }
    .zone-select {
      width: 100%;
      min-height: 50px;
      padding: 0 16px;
      border: 1px solid var(--bp-border);
      border-radius: 12px;
      background: #fff;
      color: var(--bp-dark-navy);
      font-size: 14px;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 16px;
    }
    .zone-select:focus {
      border-color: var(--bp-action-blue);
      box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
    }
  `],
})
export class AddAnimalModalComponent {
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

  @Input() zones: MonitoringZone[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() registered = new EventEmitter<Animal>();

  private readonly mediaService = inject(MediaService);
  private readonly createAnimal = inject(CreateAnimalUseCase);
  private readonly maxFileSizeBytes = 10 * 1024 * 1024;

  name = '';
  species = '';
  breed = '';
  sex = 'Male';
  years = '';
  months = '';
  initialHealth = 'Healthy';
  weightKg = '10.0';
  entryDate = '';
  previewUrl = '';
  selectedFile?: File;
  selectedZoneId = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.errorMessage = '';
      this.successMessage = '';

      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'animals.photoInvalidType';
        input.value = '';
        return;
      }

      if (file.size > this.maxFileSizeBytes) {
        this.errorMessage = 'animals.photoTooLarge';
        input.value = '';
        return;
      }

      this.revokePreview();
      this.selectedFile = file;
      this.previewUrl = URL.createObjectURL(file);
    }
  }

  removeSelectedImage(input?: HTMLInputElement): void {
    this.revokePreview();
    this.selectedFile = undefined;
    if (input) {
      input.value = '';
    }
  }

  async register(): Promise<void> {
    if (this.isSubmitting) return;

    const ageYears = parseInt(this.years || '0', 10);
    const ageMonths = parseInt(this.months || '0', 10);
    let ageStr = '';
    if (ageYears > 0) {
      ageStr += `${ageYears} year${ageYears > 1 ? 's' : ''}`;
    }
    if (ageMonths > 0) {
      if (ageStr) ageStr += ' ';
      ageStr += `${ageMonths} month${ageMonths > 1 ? 's' : ''}`;
    }
    if (!ageStr) {
      ageStr = 'Unknown age';
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    let uploadCompleted = !this.selectedFile;

    try {
      let photoUrl = '';
      if (this.selectedFile) {
        const uploadResponse = await firstValueFrom(this.mediaService.uploadImage(this.selectedFile));
        photoUrl = uploadResponse.secureUrl || uploadResponse.url || '';

        if (!photoUrl) {
          throw new Error('Media upload response did not include a usable image URL.');
        }
        uploadCompleted = true;
      }

      const animalData: Omit<Animal, 'id'> = {
      name: this.name || 'Unnamed',
      species: (this.species.trim().toLowerCase() === 'cat' || this.species.trim().toLowerCase() === 'gato') ? 'Cat' : 'Dog',
      breed: this.breed || 'Unknown breed',
      age: ageStr,
      weightKg: Number(this.weightKg) || 10.0,
      status: (this.initialHealth === 'Warning' || this.initialHealth === 'Critical') ? this.initialHealth : 'Healthy',
      zoneId: this.selectedZoneId || 'puppies',
      photoUrl,
      entryDate: this.entryDate || new Date().toISOString().split('T')[0],
      notes: 'Registered via form.'
      };

      const created = await this.createAnimal.execute(animalData);
      this.successMessage = 'animals.animalCreated';
      this.registered.emit(created);
      this.reset();
      this.closed.emit();
    } catch (error) {
      console.error('Failed to register animal', error);
      this.errorMessage = uploadCompleted ? 'animals.createError' : 'animals.photoUploadError';
    } finally {
      this.isSubmitting = false;
    }
  }

  handleClose(): void {
    if (this.isSubmitting) return;
    this.reset();
    this.closed.emit();
  }

  private reset(): void {
    this.revokePreview();
    this.name = '';
    this.species = '';
    this.breed = '';
    this.sex = 'Male';
    this.years = '';
    this.months = '';
    this.initialHealth = 'Healthy';
    this.weightKg = '10.0';
    this.entryDate = '';
    this.previewUrl = '';
    this.selectedFile = undefined;
    this.selectedZoneId = 'puppies';
    this.errorMessage = '';
    this.successMessage = '';
  }

  private revokePreview(): void {
    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}


@Component({
  selector: 'bp-assign-diet-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent, FormsModule],
  template: `
    <bp-modal [open]="open" [title]="(activePlan ? 'animals.editDiet' : 'animals.assignDiet') | translate" (closed)="closed.emit()">
      <div class="modal-body diet-form">
        <div class="food-types">
          <button [class.active]="foodType === 'Dry'" type="button" (click)="foodType = 'Dry'">{{ 'animals.dryFood' | translate }}</button>
          <button [class.active]="foodType === 'Wet'" type="button" (click)="foodType = 'Wet'">{{ 'animals.wetFood' | translate }}</button>
          <button [class.active]="foodType === 'Special'" type="button" (click)="foodType = 'Special'">{{ 'animals.specialDiet' | translate }}</button>
        </div>
        <bp-form-field [label]="'animals.foodBrand' | translate" placeholder="Puppy Pro" [(value)]="foodBrand" />
        <div class="two-cols">
          <bp-form-field [label]="'animals.portion' | translate" placeholder="250 g" [(value)]="portion" />
          <bp-form-field [label]="'animals.dailyFrequency' | translate" placeholder="2" type="number" [(value)]="frequency" />
        </div>
        <bp-form-field [label]="'animals.dispenseInterval' | translate" placeholder="cada 1 minuto" [(value)]="dispenseInterval" />
        <bp-form-field [label]="'animals.feedingNotes' | translate" placeholder="Hydration check after each meal" [multiline]="true" [(value)]="notes" />
        <div class="modal-actions">
          <bp-button variant="secondary" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button (clicked)="save()">{{ 'animals.saveDiet' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .diet-form { display: grid; gap: 14px; }
    .food-types { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .food-types button { min-height: 56px; border: 1px solid var(--bp-border); border-radius: 12px; background: #fff; color: var(--bp-dark-navy); font-weight: 800; cursor: pointer; }
    .food-types .active { border-color: var(--bp-action-blue); background: var(--bp-surface-blue); color: var(--bp-action-blue); }
    .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
    .modal-actions { margin-top: 8px; }
    @media (max-width: 560px) { .food-types, .two-cols { grid-template-columns: 1fr; } }
  `],
})
export class AssignDietModalComponent {
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

  @Input() animal?: Animal;
  @Input() activePlan?: ApiFeedingPlan;
  @Output() closed = new EventEmitter<void>();
  @Output() dietAssigned = new EventEmitter<void>();

  private readonly feedingRepo = inject(HttpFeedingRepository);

  foodType = 'Dry';
  foodBrand = '';
  portion = '';
  frequency = '';
  dispenseInterval = '';
  notes = '';

  private initForm(): void {
    if (this.activePlan) {
      const name = this.activePlan.dietType.name || '';
      const parts = name.split(' - ');
      this.foodType = parts[0] || 'Dry';
      this.foodBrand = parts[1] || '';
      this.portion = `${this.activePlan.foodAmount.quantity} ${this.activePlan.foodAmount.unit}`;
      this.frequency = String(this.activePlan.schedule.timesPerDay);
      this.dispenseInterval = this.activePlan.schedule.scheduledTimes || '';
      this.notes = this.activePlan.dietType.nutritionalNotes || '';
    } else {
      this.reset();
    }
  }

  async save(): Promise<void> {
    if (!this.animal) return;

    // Parse quantity and unit
    const qtyMatch = this.portion.match(/^(\d+(?:\.\d+)?)/);
    const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 250;
    const unit = this.portion.toLowerCase().includes('kg') ? 'kg' : 'g';

    const times = parseInt(this.frequency, 10) || 2;

    const request = {
      dietName: `${this.foodType} - ${this.foodBrand || 'Standard'}`,
      nutritionalNotes: this.notes || 'N/A',
      foodQuantity: quantity,
      foodUnit: unit,
      timesPerDay: times,
      scheduledTimes: this.dispenseInterval || 'cada 1 minuto',
      toleranceMinutes: 30
    };

    try {
      if (this.activePlan) {
        await this.feedingRepo.updatePlan(this.activePlan.id, request);
        if (this.activePlan.status !== 'ACTIVE') {
          await this.feedingRepo.activatePlan(this.activePlan.id);
        }
      } else {
        const plan = await this.feedingRepo.createPlan({
          animalId: this.animal.id,
          ...request
        });
        await this.feedingRepo.activatePlan(plan.id);
      }
      this.dietAssigned.emit();
      this.closed.emit();
    } catch (error) {
      console.error('Failed to assign diet plan', error);
    }
  }

  private reset(): void {
    this.foodType = 'Dry';
    this.foodBrand = '';
    this.portion = '';
    this.frequency = '';
    this.dispenseInterval = '';
    this.notes = '';
  }
}

@Component({
  selector: 'bp-view-reports-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, BpButtonComponent],
  template: `
    <bp-modal [open]="open" [title]="'animals.viewReports' | translate" (closed)="closed.emit()">
      <div class="modal-body reports">
        <header>
          <div>
            <small>{{ 'animals.reportFor' | translate }}</small>
            <h3>{{ animalName || 'Animal' }}</h3>
          </div>
          <div class="range-tabs"><button class="active">7D</button><button>30D</button><button>90D</button></div>
        </header>
        <section class="summary">
          <article><b>18.4 kg</b><span>{{ 'animals.weightTrend' | translate }}</span></article>
          <article><b>92%</b><span>{{ 'animals.feedingCompletion' | translate }}</span></article>
        </section>
        <div class="chart" aria-label="Report chart"><i></i><i></i><i></i><i></i><i></i></div>
        <section class="timeline">
          @for (report of reports; track report.id) {
            <article>
              <time>{{ report.createdAt }}</time>
              <strong>{{ report.title }}</strong>
              <p>{{ report.summary }}</p>
            </article>
          }
        </section>
        <div class="modal-actions">
          <bp-button variant="secondary">{{ 'animals.exportPdf' | translate }}</bp-button>
          <bp-button (clicked)="closed.emit()">{{ 'common.close' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .reports { display: grid; gap: 16px; }
    header, .summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .modal-actions { margin-top: 4px; }
    header h3 { margin: 2px 0 0; font-size: 22px; }
    header small, time, p, .summary span { color: var(--bp-slate-gray); }
    .range-tabs { display: inline-flex; border: 1px solid var(--bp-border); border-radius: 999px; padding: 3px; }
    .range-tabs button { border: 0; border-radius: 999px; background: transparent; padding: 7px 12px; cursor: pointer; color: var(--bp-slate-gray); }
    .range-tabs .active { background: var(--bp-action-blue); color: #fff; }
    .summary article { flex: 1; border: 1px solid var(--bp-border); border-radius: 12px; padding: 14px; background: var(--bp-surface-blue); }
    .summary b, .summary span { display: block; }
    .summary b { font-size: 24px; }
    .chart { height: 118px; display: grid; grid-template-columns: repeat(5, 1fr); align-items: end; gap: 10px; border: 1px solid var(--bp-border); border-radius: 12px; padding: 16px; background: linear-gradient(180deg, #fff, #f7fbff); }
    .chart i { display: block; border-radius: 999px 999px 4px 4px; background: var(--bp-secondary-blue); }
    .chart i:nth-child(1) { height: 42%; } .chart i:nth-child(2) { height: 62%; } .chart i:nth-child(3) { height: 54%; } .chart i:nth-child(4) { height: 78%; } .chart i:nth-child(5) { height: 68%; }
    .timeline { display: grid; gap: 10px; }
    .timeline article { border-left: 3px solid var(--bp-action-blue); padding: 4px 0 4px 12px; }
    .timeline strong { display: block; margin: 3px 0; }
    .timeline p { margin: 0; }
    @media (max-width: 560px) { header, .summary, .modal-actions { display: grid; } }
  `],
})
export class ViewReportsModalComponent {
  @Input() open = false;
  @Input() animalName = '';
  @Input() reports: Report[] = [];
  @Output() closed = new EventEmitter<void>();
}

@Component({
  selector: 'bp-edit-animal-modal',
  standalone: true,
  imports: [TranslatePipe, BpModalComponent, FormFieldComponent, BpButtonComponent, FormsModule],
  template: `
    <bp-modal [open]="open" [title]="'animals.editProfile' | translate" size="compact" (closed)="closed.emit()">
      <div class="modal-body animal-form">
        <div class="photo-upload">
          <span (click)="fileInput.click()" [style.backgroundImage]="previewUrl ? 'url(' + previewUrl + ')' : ''" [class.has-preview]="previewUrl"></span>
          <small (click)="fileInput.click()">{{ 'animals.changePhoto' | translate }}</small>
          <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none" accept="image/*">
        </div>
        <bp-form-field [label]="'animals.name' | translate" placeholder="Firulais" [(value)]="name" />
        <bp-form-field [label]="'animals.species' | translate" [placeholder]="'animals.selectSpecies' | translate" [(value)]="species" />
        <bp-form-field [label]="'animals.breedCross' | translate" placeholder="Mixed breed" [(value)]="breed" />
        <div class="field-block">
          <label>{{ 'animals.sex' | translate }}</label>
          <div class="segmented">
            <button type="button" [class.active]="sex === 'Male'" (click)="sex = 'Male'">{{ 'animals.male' | translate }}</button>
            <button type="button" [class.active]="sex === 'Female'" (click)="sex = 'Female'">{{ 'animals.female' | translate }}</button>
          </div>
        </div>
        <div class="field-block">
          <label>{{ 'animals.location' | translate }}</label>
          <select class="zone-select" [(ngModel)]="selectedZoneId" name="zoneId">
            <option value="puppies">{{ 'animals.unassignedZone' | translate }}</option>
            @for (zone of zones; track zone.id) {
              <option [value]="zone.id">{{ zone.name }}</option>
            }
          </select>
        </div>
        <div class="two-cols">
          <bp-form-field [label]="'animals.years' | translate" placeholder="0" type="number" [(value)]="years" />
          <bp-form-field [label]="'animals.months' | translate" placeholder="0" type="number" [(value)]="months" />
        </div>
        <div class="field-block">
          <label>{{ 'animals.initialHealth' | translate }}</label>
          <select class="zone-select" [(ngModel)]="initialHealth" name="initialHealth">
            <option value="Healthy">{{ 'states.Healthy' | translate }}</option>
            <option value="Warning">{{ 'states.Warning' | translate }}</option>
            <option value="Critical">{{ 'states.Critical' | translate }}</option>
          </select>
        </div>
        <div class="two-cols">
          <bp-form-field [label]="'animals.weight' | translate" type="number" [(value)]="weightKg" placeholder="10.0" />
          <bp-form-field [label]="'animals.entryDate' | translate" type="date" [(value)]="entryDate" />
        </div>
        <div class="modal-actions">
          <bp-button variant="ghost" (clicked)="closed.emit()">{{ 'common.cancel' | translate }}</bp-button>
          <bp-button (clicked)="save()">{{ 'veterinarians.saveChanges' | translate }}</bp-button>
        </div>
      </div>
    </bp-modal>
  `,
  styles: [`
    .animal-form { display: grid; gap: 12px; min-width: 0; }
    .photo-upload { display: grid; justify-items: center; gap: 8px; margin-top: -4px; }
    .photo-upload span { width: 88px; height: 88px; border-radius: 50%; border: 1px dashed #7d6b91; background: #f3eef6; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .photo-upload span::before { content: '+'; position: absolute; inset: 0; display: grid; place-items: center; color: #7d6b91; font-size: 28px; font-weight: 700; }
    .photo-upload span.has-preview::before { display: none; }
    .photo-upload small { color: var(--bp-action-blue); font-size: 11px; font-weight: 700; cursor: pointer; }
    .field-block label { display: block; margin-bottom: 7px; color: var(--bp-dark-navy); font-size: 12px; font-weight: 700; }
    .segmented { display: grid; grid-template-columns: 1fr 1fr; border-radius: 10px; background: #eee8ef; padding: 4px; }
    .segmented button { min-height: 32px; border: 0; border-radius: 7px; background: transparent; color: var(--bp-slate-gray); cursor: pointer; }
    .segmented .active { background: #fff; color: var(--bp-action-blue); box-shadow: 0 1px 4px rgba(11,31,47,.08); }
    .two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
    .modal-actions { justify-content: flex-end; margin-top: 8px; }
    @media (max-width: 520px) { .two-cols { grid-template-columns: 1fr; } }
    .zone-select {
      width: 100%;
      min-height: 50px;
      padding: 0 16px;
      border: 1px solid var(--bp-border);
      border-radius: 12px;
      background: #fff;
      color: var(--bp-dark-navy);
      font-size: 14px;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 16px;
    }
    .zone-select:focus {
      border-color: var(--bp-action-blue);
      box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
    }
  `],
})
export class EditAnimalModalComponent {
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

  @Input() animal?: Animal;
  @Input() zones: MonitoringZone[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Animal>();

  private readonly animalRepo = inject(HttpAnimalRepository);

  name = '';
  species = '';
  breed = '';
  sex = 'Male';
  years = '';
  months = '';
  initialHealth = 'Healthy';
  weightKg = '10.0';
  entryDate = '';
  previewUrl = '';
  uploadedPhotoUrl = '';
  selectedZoneId = '';

  private initForm(): void {
    if (!this.animal) return;
    this.name = this.animal.name;
    this.species = this.animal.species;
    this.breed = this.animal.breed;
    this.sex = this.animal.species === 'Dog' ? 'Male' : 'Female';
    
    const yearsMatch = this.animal.age.match(/(\d+)\s*year/i);
    const monthsMatch = this.animal.age.match(/(\d+)\s*month/i);
    this.years = yearsMatch ? yearsMatch[1] : '';
    this.months = monthsMatch ? monthsMatch[1] : '';
    
    this.initialHealth = this.animal.status;
    this.weightKg = String(this.animal.weightKg);
    this.entryDate = this.animal.entryDate;
    this.previewUrl = this.animal.photoUrl;
    this.uploadedPhotoUrl = this.animal.photoUrl;
    this.selectedZoneId = this.animal.zoneId;
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

  async save(): Promise<void> {
    if (!this.animal) return;

    const ageYears = parseInt(this.years || '0', 10);
    const ageMonths = parseInt(this.months || '0', 10);
    let ageStr = '';
    if (ageYears > 0) {
      ageStr += `${ageYears} year${ageYears > 1 ? 's' : ''}`;
    }
    if (ageMonths > 0) {
      if (ageStr) ageStr += ' ';
      ageStr += `${ageMonths} month${ageMonths > 1 ? 's' : ''}`;
    }
    if (!ageStr) {
      ageStr = 'Unknown age';
    }

    const updatedData: Animal = {
      ...this.animal,
      name: this.name || 'Unnamed',
      species: (this.species.trim().toLowerCase() === 'cat' || this.species.trim().toLowerCase() === 'gato') ? 'Cat' : 'Dog',
      breed: this.breed || 'Unknown breed',
      age: ageStr,
      weightKg: Number(this.weightKg) || 10.0,
      status: (this.initialHealth === 'Warning' || this.initialHealth === 'Critical') ? this.initialHealth : 'Healthy',
      zoneId: this.selectedZoneId || 'puppies',
      photoUrl: this.uploadedPhotoUrl || '/assets/bluepatitas/animal-firulais.png',
      entryDate: this.entryDate || new Date().toISOString().split('T')[0]
    };

    try {
      const saved = await this.animalRepo.updateAnimal(updatedData);
      this.updated.emit(saved);
      this.closed.emit();
    } catch (e) {
      console.error('Failed to update animal profile', e);
    }
  }
}
