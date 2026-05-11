import { Component, Input } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'bp-placeholder-page',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>{{ title }}</h1>
        <p>{{ 'common.placeholder.body' | translate }}</p>
      </div>
    </div>
    <section>
      <h2>{{ 'common.placeholder.title' | translate }}</h2>
      <p class="muted">{{ route }}</p>
    </section>
  `,
  styles: [`section { background: white; border: 1px dashed var(--bp-border); border-radius: 16px; padding: 32px; } h2 { margin-top: 0; }`],
})
export class PlaceholderPageComponent {
  @Input() title = '';
  @Input() route = '';
}
