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
      <input matInput [type]="type" [placeholder]="placeholder" />
    </mat-form-field>
  `,
  styles: [`mat-form-field { width: 100%; }`],
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
}
