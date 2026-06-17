import { Component } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { PlaceholderPageComponent } from '../../shared/components/placeholder-page/placeholder-page.component';

@Component({
  standalone: true,
  imports: [PlaceholderPageComponent, TranslatePipe],
  template: `<bp-placeholder-page [title]="'nav.devices' | translate" route="/devices" />`,
})
export class DevicesPage {}
