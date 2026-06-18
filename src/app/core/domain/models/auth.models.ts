export type BluePatitasRole = 'SHELTER_ADMIN' | 'VETERINARIAN';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  shelterId: string;
  role: BluePatitasRole;
  roles: BluePatitasRole[];
  shelterName: string;
  onboardingCompleted: boolean;
}
