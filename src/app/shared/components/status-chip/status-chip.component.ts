import { Component, Input } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'bp-status-chip',
  standalone: true,
  imports: [TranslatePipe],
  template: `<span [class]="statusClass"><i></i>{{ ('states.' + status) | translate }}</span>`,
  styles: [`
    span { display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 700; border: 1px solid transparent; white-space: nowrap; }
    i { width: 7px; height: 7px; border-radius: 999px; background: currentColor; }
    .success { color: var(--bp-success); background: rgba(87, 182, 95, .12); }
    .warning { color: #9b7200; background: rgba(244, 180, 0, .16); }
    .critical { color: var(--bp-critical); background: rgba(217, 48, 37, .12); }
    .neutral { color: var(--bp-slate-gray); background: rgba(95, 113, 132, .12); }
  `],
})
export class StatusChipComponent {
  @Input() status = 'Active';

  get statusClass(): string {
    if (this.status === 'Active' || this.status === 'Healthy') return 'success';
    if (this.status === 'Warning' || this.status === 'Low Battery') return 'warning';
    if (this.status === 'Critical') return 'critical';
    return 'neutral';
  }
}
