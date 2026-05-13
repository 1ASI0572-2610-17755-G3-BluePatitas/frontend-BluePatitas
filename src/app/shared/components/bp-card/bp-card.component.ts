import { Component, Input } from '@angular/core';

@Component({
  selector: 'bp-card',
  standalone: true,
  template: `
    @if (title) {
      <header>
        <h3>{{ title }}</h3>
        @if (actionLabel) { <button type="button">{{ actionLabel }}</button> }
      </header>
    }
    <ng-content />
  `,
  styles: [`
    :host { display: block; background: white; border: 1px solid rgba(213, 221, 231, .95); border-radius: 12px; box-shadow: var(--bp-shadow); padding: 24px; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
    h3 { margin: 0; font-size: 22px; line-height: 1.2; }
    button { border: 0; background: transparent; color: var(--bp-action-blue); font-weight: 700; cursor: pointer; }
  `],
})
export class BpCardComponent {
  @Input() title = '';
  @Input() actionLabel = '';
}
