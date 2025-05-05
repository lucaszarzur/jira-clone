export interface EnvironmentModel {
  production: boolean;
  apiUrl: string;
  baseUrl: string; // URL base do backend para recursos estáticos
  version: string;
  SENTRY_DSN: string;
}
