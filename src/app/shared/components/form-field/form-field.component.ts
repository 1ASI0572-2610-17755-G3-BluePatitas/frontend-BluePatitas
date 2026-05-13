import { Component, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'bp-form-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>{{ label }}</mat-label>
      @if (multiline) {
        <textarea matInput [placeholder]="placeholder" rows="4"></textarea>
      } @else {
        <input matInput [type]="type" [placeholder]="placeholder" />
      }
    </mat-form-field>
  `,
  styles: [`
    :host { display: block; min-width: 0; max-width: 100%; }
    mat-form-field { width: 100%; min-width: 0; max-width: 100%; }
    :host ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    :host ::ng-deep .mat-mdc-text-field-wrapper { min-height: 54px; }
    :host ::ng-deep .mat-mdc-form-field-infix { min-height: 54px; padding-top: 18px; padding-bottom: 10px; }
  `],
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() multiline = false;
}
