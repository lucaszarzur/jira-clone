import { EnvironmentModel } from './environment-model';

export const environment: EnvironmentModel = {
  production: true,
  apiUrl: 'http://localhost:3000/api', // Apontando para a nova API REST
  baseUrl: 'http://localhost:3000', // URL base do backend para recursos estáticos
  version: '1.0.0',
  SENTRY_DSN: 'https://your-sentry-dsn-here@sentry.io/12345'
};
