import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'bp-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-flat-button [class.secondary]="variant === 'secondary'" [class.ghost]="variant === 'ghost'" [type]="type" (click)="handleClick()">
      @if (icon) { <mat-icon>{{ icon }}</mat-icon> }
      <span><ng-content /></span>
    </button>
  `,
  styles: [`
    button { border-radius: 999px; min-height: 42px; padding: 0 22px; background: var(--bp-action-blue); color: white; box-shadow: 0 8px 20px rgba(0, 91, 176, .18); }
    button.secondary { background: white; color: var(--bp-action-blue); border: 1px solid var(--bp-border); box-shadow: none; }
    button.ghost { background: transparent; color: var(--bp-action-blue); box-shadow: none; }
    mat-icon { font-size: 18px; height: 18px; width: 18px; margin-right: 6px; }
  `],
})
export class BpButtonComponent {
  constructor(private readonly router: Router) {}

  @Input() icon = '';
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() routerLink = '';
  @Output() clicked = new EventEmitter<void>();

  handleClick(): void {
    this.clicked.emit();
    if (this.routerLink) {
      void this.router.navigateByUrl(this.routerLink);
    }
  }
}
