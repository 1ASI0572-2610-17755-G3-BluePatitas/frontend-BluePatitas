import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'bp-modal',
  standalone: true,
  imports: [MatIconModule, TranslatePipe],
  template: `
    @if (open) {
      <section class="backdrop" (click)="closed.emit()">
        <article (click)="$event.stopPropagation()">
          <header>
            <h2>{{ title }}</h2>
            <button type="button" (click)="closed.emit()" [attr.aria-label]="'common.close' | translate"><mat-icon>close</mat-icon></button>
          </header>
          <ng-content />
        </article>
      </section>
    }
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 24px; background: rgba(11, 31, 47, .34); }
    article { width: min(560px, 96vw); max-height: 90vh; overflow: auto; background: white; border-radius: 20px; box-shadow: 0 28px 60px rgba(11, 31, 47, .24); }
    header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--bp-border); }
    h2 { margin: 0; font-size: 22px; }
    button { border: 0; background: transparent; cursor: pointer; color: var(--bp-slate-gray); }
    ::ng-deep .modal-body { padding: 24px; }
  `],
})
export class BpModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();
}
