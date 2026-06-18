export interface VeterinaryDashboard {
  veterinarianName: string;
  shelterName: string;
  animalsUnderCare: number;
  pendingObservations: number;
  activeAlerts: number;
  recentObservations: VeterinaryObservation[];
}

export interface VeterinaryObservation {
  id: string;
  animalName: string;
  summary: string;
  createdAt: string;
}

export interface VeterinaryAnimal {
  id: string;
  photoUrl?: string;
  name: string;
  species: string;
  breed: string;
  healthCondition: string;
  weightKg: number | null;
  observations?: VeterinaryObservation[];
}
