// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { EnvironmentModel } from './environment-model';

export const environment: EnvironmentModel = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Apontando para a nova API REST
  baseUrl: 'http://localhost:3000', // URL base do backend para recursos estáticos
  version: '1.0.0',
  SENTRY_DSN: ''
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
