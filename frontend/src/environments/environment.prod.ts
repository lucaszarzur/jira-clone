import { EnvironmentModel } from './environment-model';

export const environment: EnvironmentModel = {
  production: true,
  apiUrl: '/api', // Usará o proxy do Nginx da máquina host
  baseUrl: '', // Empty baseUrl for relative paths
  version: '1.0.0',
  SENTRY_DSN: '' // Disable Sentry in production
};
