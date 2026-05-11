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
    button { width: 100%; display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; grid-template-rows: auto auto; gap: 6px 16px; align-items: center; padding: 16px; border: 1px solid var(--bp-border); border-radius: 16px; background: white; text-align: left; cursor: pointer; box-shadow: 0 4px 14px rgba(11,31,47,.04); }
    button:hover { border-color: var(--bp-secondary-blue); box-shadow: 0 10px 24px rgba(11,31,47,.08); }
    img { grid-column: 1; grid-row: 1 / span 2; width: 64px; height: 64px; border-radius: 14px; object-fit: cover; background: var(--bp-primary-blue); }
    strong { grid-column: 2; grid-row: 1; font-size: 16px; min-width: 0; overflow-wrap: anywhere; }
    small { grid-column: 2; grid-row: 2; color: var(--bp-slate-gray); min-width: 0; overflow-wrap: anywhere; }
    bp-status-chip { grid-column: 3; grid-row: 1 / span 2; justify-self: end; }
    @media (max-width: 720px) {
      button { grid-template-columns: 64px minmax(0, 1fr); }
      bp-status-chip { grid-column: 2; grid-row: 3; justify-self: start; }
    }
  `],
})
export class AnimalCardComponent {
  @Input({ required: true }) animal!: Animal;
  @Output() selected = new EventEmitter<Animal>();
}
