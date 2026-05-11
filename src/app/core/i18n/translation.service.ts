import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type SupportedLanguage = 'en-US' | 'es-419';

type Dictionary = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly dictionaries = signal<Record<SupportedLanguage, Dictionary>>({ 'en-US': {}, 'es-419': {} });
  readonly currentLanguage = signal<SupportedLanguage>('en-US');

  constructor(private readonly http: HttpClient) {}

  async initialize(): Promise<void> {
    const [en, es] = await Promise.all([
      firstValueFrom(this.http.get<Dictionary>('/assets/i18n/en-US.json')),
      firstValueFrom(this.http.get<Dictionary>('/assets/i18n/es-419.json')),
    ]);
    this.dictionaries.set({ 'en-US': en, 'es-419': es });
    const stored = localStorage.getItem('bluepatitas.lang') as SupportedLanguage | null;
    if (stored === 'es-419' || stored === 'en-US') {
      this.currentLanguage.set(stored);
    }
  }

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage.set(language);
    localStorage.setItem('bluepatitas.lang', language);
  }

  translate(key: string): string {
    const language = this.currentLanguage();
    const dictionaries = this.dictionaries();
    return dictionaries[language][key] ?? dictionaries['en-US'][key] ?? key;
  }
}
