import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'bp-modal',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (open) {
      <section class="backdrop" (click)="closed.emit()">
        <article [class.compact]="size === 'compact'" (click)="$event.stopPropagation()">
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
    :host { box-sizing: border-box; }
    .backdrop { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 24px; background: rgba(11, 31, 47, .34); overflow: hidden; }
    article { box-sizing: border-box; width: min(640px, calc(100vw - 48px)); max-height: min(90vh, calc(100vh - 48px)); overflow-y: auto; overflow-x: hidden; background: white; border-radius: 18px; box-shadow: 0 28px 60px rgba(11, 31, 47, .24); }
    article.compact { width: min(520px, calc(100vw - 48px)); }
    header { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 20px; border-bottom: 1px solid var(--bp-border); background: #fff; }
    h2 { margin: 0; font-size: 18px; font-family: var(--bp-heading-font); }
    button { flex: 0 0 auto; display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 50%; background: var(--bp-surface-blue); cursor: pointer; color: var(--bp-dark-navy); font-size: 26px; line-height: 1; font-family: var(--bp-ui-font); }
    ::ng-deep .modal-body { box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; padding: 24px; }
    ::ng-deep .modal-body *,
    ::ng-deep .modal-body *::before,
    ::ng-deep .modal-body *::after { box-sizing: border-box; max-width: 100%; }
    ::ng-deep .modal-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex-wrap: wrap; width: 100%; max-width: 100%; }
    ::ng-deep .modal-actions bp-button { max-width: 100%; min-width: 0; }
    @media (max-width: 560px) {
      .backdrop { padding: 16px; }
      article, article.compact { width: calc(100vw - 32px); max-height: calc(100vh - 32px); }
      ::ng-deep .modal-body { padding: 18px; }
      ::ng-deep .modal-actions { display: grid; grid-template-columns: 1fr; }
      ::ng-deep .modal-actions bp-button,
      ::ng-deep .modal-actions button { width: 100%; }
    }
  `],
})
export class BpModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'default' | 'compact' = 'default';
  @Output() closed = new EventEmitter<void>();
}
