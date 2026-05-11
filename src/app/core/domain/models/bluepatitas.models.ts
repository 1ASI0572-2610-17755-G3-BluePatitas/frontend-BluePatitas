export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';
export type DeviceStatus = 'Active' | 'Low Battery' | 'Disconnected';
export type AlertType = 'High temperature' | 'Geofence exit' | 'Feeding not confirmed' | 'Device offline';

export interface Shelter {
  id: string;
  name: string;
  city: string;
  address: string;
  administrator: string;
  phone: string;
  email: string;
}

export interface MonitoringZone {
  id: string;
  name: string;
  temperatureC: number | null;
  humidity: number | null;
  status: 'Active' | 'Warning' | 'Disconnected';
  animalCount: number;
  cameraEnabled: boolean;
}

export interface Animal {
  id: string;
  name: string;
  species: 'Dog' | 'Cat';
  breed: string;
  age: string;
  weightKg: number;
  status: HealthStatus;
  zoneId: string;
  photoUrl: string;
  entryDate: string;
  notes: string;
  dietPlanId?: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'Camera' | 'Sensor T/H' | 'GPS Collar' | 'Dispenser';
  zoneId: string;
  status: DeviceStatus;
  battery: number | null;
  lastSync: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  severity: 'Warning' | 'Critical';
  zoneId?: string;
  animalId?: string;
  createdAt: string;
}

export interface FeedingPlan {
  id: string;
  name: string;
  animalId: string;
  foodType: string;
  schedule: string;
  notes: string;
}

export interface FeedingEvent {
  id: string;
  animalId: string;
  planId: string;
  time: string;
  confirmed: boolean;
}

export interface Veterinarian {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: 'Active' | 'Warning';
}

export interface User {
  id: string;
  name: string;
  role: 'Administrator' | 'Veterinarian' | 'Caretaker';
  email: string;
  status: 'Active' | 'Warning';
}

export interface Report {
  id: string;
  animalId: string;
  title: string;
  createdAt: string;
  summary: string;
}
