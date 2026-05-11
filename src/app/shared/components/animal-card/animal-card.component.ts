import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Animal } from '../../../core/domain/models/bluepatitas.models';
import { StatusChipComponent } from '../status-chip/status-chip.component';

@Component({
  selector: 'bp-animal-card',
  standalone: true,
  imports: [StatusChipComponent],
  template: `
    <button type="button" (click)="selected.emit(animal)">
      <img [src]="animal.photoUrl" [alt]="animal.name" />
      <strong>{{ animal.name }}</strong>
      <small>{{ animal.breed }} · {{ animal.age }}</small>
      <bp-status-chip [status]="animal.status" />
    </button>
  `,
  styles: [`
    button { width: 100%; display: grid; grid-template-columns: 56px 1fr auto; grid-template-rows: auto auto; gap: 4px 14px; align-items: center; padding: 14px; border: 1px solid var(--bp-border); border-radius: 14px; background: white; text-align: left; cursor: pointer; }
    img { grid-row: 1 / span 2; width: 56px; height: 56px; border-radius: 14px; object-fit: cover; background: var(--bp-primary-blue); }
    strong { font-size: 16px; }
    small { color: var(--bp-slate-gray); }
    bp-status-chip { grid-row: 1 / span 2; }
  `],
})
export class AnimalCardComponent {
  @Input({ required: true }) animal!: Animal;
  @Output() selected = new EventEmitter<Animal>();
}
