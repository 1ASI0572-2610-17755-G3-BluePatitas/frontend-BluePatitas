import { Component, Input } from '@angular/core';
import { Alert } from '../../../core/domain/models/bluepatitas.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'bp-alert-card',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <article [class.critical]="alert.severity === 'Critical'">
      <span class="alert-icon" aria-hidden="true"></span>
      <div>
        <strong>{{ ('alerts.' + alert.type) | translate }}</strong>
        <p>{{ alert.message }}</p>
      </div>
      <time>{{ alert.createdAt }}</time>
    </article>
  `,
  styles: [`
    article { display: grid; grid-template-columns: 42px 1fr auto; gap: 14px; padding: 16px; border-radius: 12px; background: var(--bp-surface-blue); border: 1px solid rgba(141, 185, 216, .24); }
    article.critical { background: rgba(217, 48, 37, .06); border-color: rgba(217, 48, 37, .24); }
    .alert-icon { display: grid; place-items: center; height: 42px; border-radius: 999px; background: rgba(0, 91, 176, .1); color: var(--bp-action-blue); font-weight: 900; }
    .alert-icon::before { content: '!'; font-family: var(--bp-ui-font); }
    .critical .alert-icon { background: rgba(217, 48, 37, .12); color: var(--bp-critical); }
    strong { display: block; margin-bottom: 4px; }
    p { margin: 0; color: var(--bp-slate-gray); }
    time { color: var(--bp-slate-gray); font-size: 12px; }
  `],
})
export class AlertCardComponent {
  @Input({ required: true }) alert!: Alert;
}
