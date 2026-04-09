export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  applicationName: string;
}

export const environment: Environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8082/facilon',
  applicationName: 'Facilon Platform',
};
