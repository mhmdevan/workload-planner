// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { API_CONFIG } from './core/services/api-config.token';

export const appConfig: ApplicationConfig = {
  providers: [
    // Routing
    provideRouter(appRoutes, withComponentInputBinding()),

    // Http + interceptors + fetch (برای SSR)
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, apiErrorInterceptor])),

    // Animations
    provideAnimations(),

    // Charts (ng2-charts v8+)
    provideCharts(withDefaultRegisterables()),

    // API config
    {
      provide: API_CONFIG,
      useValue: {
        baseUrl: 'MOCK',
      },
    },

    // PWA / Service Worker
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      // معمول‌ترین استراتژی:
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
