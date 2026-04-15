export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  applicationName: string;
}

export const environment: Environment = {
  production: false,
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080/facilon',
  applicationName: 'Facilon Platform',
};
