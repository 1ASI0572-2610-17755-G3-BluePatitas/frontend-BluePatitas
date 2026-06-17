import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { TranslationService } from './core/i18n/translation.service';
import { repositoryProviders } from './core/infrastructure/repositories/repository.providers';
import { authInterceptor } from './core/infrastructure/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimationsAsync(),
    provideAppInitializer(() => inject(TranslationService).initialize()),
    ...repositoryProviders,
  ],
};

