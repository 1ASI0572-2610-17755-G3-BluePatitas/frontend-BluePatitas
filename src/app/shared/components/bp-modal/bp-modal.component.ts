import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'bp-modal',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (open) {
      <section class="backdrop" (click)="closed.emit()">
        <article (click)="$event.stopPropagation()">
          <header>
            <h2>{{ title }}</h2>
            <button type="button" (click)="closed.emit()" [attr.aria-label]="'common.close' | translate">×</button>
          </header>
          <ng-content />
        </article>
      </section>
    }
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 24px; background: rgba(11, 31, 47, .34); }
    article { width: min(580px, 96vw); max-height: 90vh; overflow: auto; background: white; border-radius: 22px; box-shadow: 0 28px 60px rgba(11, 31, 47, .24); }
    header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 22px 26px; border-bottom: 1px solid var(--bp-border); }
    h2 { margin: 0; font-size: 22px; font-family: var(--bp-heading-font); }
    button { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 50%; background: var(--bp-surface-blue); cursor: pointer; color: var(--bp-dark-navy); font-size: 26px; line-height: 1; font-family: var(--bp-ui-font); }
    ::ng-deep .modal-body { padding: 26px; }
  `],
})
export class BpModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();
}
