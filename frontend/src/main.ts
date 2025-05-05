import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const initSentry = () => {
  if (environment.SENTRY_DSN) {
    Sentry.init({
      dsn: `${environment.SENTRY_DSN}`,
      release: environment.version,
      integrations: [
        new Integrations.BrowserTracing({
          tracingOrigins: ['localhost', 'https://taskflow.app/'],
          routingInstrumentation: Sentry.routingInstrumentation,
        }),
      ],
      tracesSampleRate: 1.0,
    });
  }
};

if (environment.production) {
  enableProdMode();
  initSentry();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
