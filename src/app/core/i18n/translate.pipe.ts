import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private readonly translations: TranslationService) {}

  transform(key: string): string {
    return this.translations.translate(key);
  }
}
