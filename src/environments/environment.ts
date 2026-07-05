/**
 * environment.ts — Development environment configuration
 *
 * The apiBaseUrl points to the Spring Boot backend running locally.
 * Change this to your deployed backend URL for production.
 */
export const environment = {
  production: false,
  /** Base URL of the BluePatitas Spring Boot backend (no trailing slash). */
  apiBaseUrl: 'https://backend-bluepatitas.onrender.com',
  firebaseConfig: {
    apiKey: "AIzaSyAXvxStbzvI65fMwuTFsX4wk87n6PIwcqk",
    authDomain: "flowtracknotis.firebaseapp.com",
    projectId: "flowtracknotis",
    storageBucket: "flowtracknotis.firebasestorage.app",
    messagingSenderId: "747649396736",
    appId: "1:747649396736:web:e7237de83e6e5015df28e5",
    measurementId: "G-NH0DMMY729"
  },
  vapidKey: "BNID1VgjzSqhmqfI-tGj-yfnexLVQ_25GTNTvdA5jBug09UAss0Y33FHRu5TwZVDvqI6ewcwxfhAvS-mcu9VWf4"
};
