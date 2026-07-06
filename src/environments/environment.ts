/**
 * environment.ts — Development environment configuration
 *
 * The apiBaseUrl points to the Spring Boot backend running locally.
 * Change this to your deployed backend URL for production.
 */
export const environment = {
  production: false,
  /** Base URL of the BluePatitas Spring Boot backend (no trailing slash). */
  apiBaseUrl: 'http://localhost:8080',
};
