import { Alert, Animal, Device, FeedingEvent, FeedingPlan, MonitoringZone, Report, Shelter, User, Veterinarian } from '../../domain/models/bluepatitas.models';

export const assetPath = '/assets/bluepatitas/';

export const mockShelter: Shelter = {
  id: 'shelter-wuf',
  name: 'Refugio WUF',
  city: 'Lima',
  address: 'Av. Animal Care 420',
  administrator: 'Administrator',
  phone: '+51 999 888 777',
  email: 'admin@refugiowuf.org',
};

export const mockZones: MonitoringZone[] = [
  { id: 'puppies', name: 'Puppy Zone', temperatureC: 24, humidity: 45, status: 'Active', animalCount: 2, cameraEnabled: true },
  { id: 'quarantine', name: 'Quarantine Zone', temperatureC: 28, humidity: 60, status: 'Warning', animalCount: 1, cameraEnabled: true },
  { id: 'recovery', name: 'Recovery Zone', temperatureC: null, humidity: null, status: 'Disconnected', animalCount: 3, cameraEnabled: false },
];

export const mockAnimals: Animal[] = [
  { id: 'firulais', name: 'Firulais', species: 'Dog', breed: 'Mixed breed', age: '3 years', weightKg: 18.4, status: 'Healthy', zoneId: 'puppies', photoUrl: `${assetPath}animal-firulais.png`, entryDate: '2025-10-12', notes: 'Calm and social. Responds well to routines.', dietPlanId: 'diet-firulais' },
  { id: 'luna', name: 'Luna', species: 'Dog', breed: 'Golden mix', age: '2 years', weightKg: 21.2, status: 'Healthy', zoneId: 'puppies', photoUrl: `${assetPath}animal-luna.png`, entryDate: '2026-01-18', notes: 'High energy. Needs outdoor time twice a day.', dietPlanId: 'diet-luna' },
  { id: 'rex', name: 'Rex', species: 'Dog', breed: 'Labrador', age: '5 years', weightKg: 25.7, status: 'Warning', zoneId: 'quarantine', photoUrl: `${assetPath}animal-rex.png`, entryDate: '2025-08-02', notes: 'Under observation after geofence alert.' },
  { id: 'milo', name: 'Milo', species: 'Cat', breed: 'Tabby', age: '1 year', weightKg: 4.8, status: 'Healthy', zoneId: 'recovery', photoUrl: `${assetPath}animal-milo.png`, entryDate: '2026-02-21', notes: 'Playful and responsive to feeding schedule.' },
  { id: 'nala', name: 'Nala', species: 'Cat', breed: 'Domestic short hair', age: '4 years', weightKg: 5.1, status: 'Healthy', zoneId: 'recovery', photoUrl: `${assetPath}animal-nala.png`, entryDate: '2025-11-07', notes: 'Requires quiet recovery space.' },
  { id: 'toby', name: 'Toby', species: 'Dog', breed: 'Beagle mix', age: '6 years', weightKg: 16.3, status: 'Critical', zoneId: 'quarantine', photoUrl: `${assetPath}animal-toby.png`, entryDate: '2026-03-14', notes: 'Temperature trend requires immediate review.' },
];

export const mockDevices: Device[] = [
  { id: 'cam-01', name: 'Camera', type: 'Camera', zoneId: 'puppies', status: 'Active', battery: null, lastSync: '5 min ago' },
  { id: 'sensor-01', name: 'Sensor T/H', type: 'Sensor T/H', zoneId: 'quarantine', status: 'Active', battery: 84, lastSync: '3 min ago' },
  { id: 'gps-01', name: 'GPS Collar', type: 'GPS Collar', zoneId: 'puppies', status: 'Low Battery', battery: 18, lastSync: '15 min ago' },
  { id: 'disp-01', name: 'Dispenser', type: 'Dispenser', zoneId: 'recovery', status: 'Disconnected', battery: 0, lastSync: '1 h ago' },
];

export const mockAlerts: Alert[] = [
  { id: 'alert-1', type: 'High temperature', message: 'Temperature is above the optimal range in Quarantine Zone.', severity: 'Critical', zoneId: 'quarantine', createdAt: '5 min ago' },
  { id: 'alert-2', type: 'Geofence exit', message: 'Rex left the allowed perimeter.', severity: 'Warning', animalId: 'rex', createdAt: '15 min ago' },
  { id: 'alert-3', type: 'Feeding not confirmed', message: 'Milo feeding was not confirmed.', severity: 'Warning', animalId: 'milo', createdAt: '40 min ago' },
  { id: 'alert-4', type: 'Device offline', message: 'Recovery Zone dispenser is offline.', severity: 'Critical', zoneId: 'recovery', createdAt: '1 h ago' },
];

export const mockFeedingPlans: FeedingPlan[] = [
  { id: 'diet-firulais', animalId: 'firulais', name: 'Adult Care', foodType: 'Dry food', schedule: '08:00 / 18:00', notes: 'Standard portion with hydration check.' },
  { id: 'diet-luna', animalId: 'luna', name: 'Puppy Pro', foodType: 'High protein', schedule: '09:00 / 14:00 / 19:00', notes: 'Growth plan.' },
];

export const mockFeedingEvents: FeedingEvent[] = [
  { id: 'feed-1', animalId: 'luna', planId: 'diet-luna', time: '14:00', confirmed: true },
  { id: 'feed-2', animalId: 'milo', planId: 'diet-firulais', time: '15:00', confirmed: false },
];

export const mockVeterinarians: Veterinarian[] = [
  { id: 'vet-1', name: 'Dra. Elena Ramos', specialty: 'Internal medicine', phone: '+51 900 111 222', email: 'elena@bluepatitas.app', status: 'Active' },
  { id: 'vet-2', name: 'Dr. Carlos Vega', specialty: 'Emergency care', phone: '+51 900 333 444', email: 'carlos@bluepatitas.app', status: 'Active' },
  { id: 'vet-3', name: 'Dra. Laura Montes', specialty: 'Nutrition', phone: '+51 900 555 666', email: 'laura@bluepatitas.app', status: 'Warning' },
];

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Administrator', role: 'Administrator', email: 'admin@refugiowuf.org', status: 'Active' },
  { id: 'user-2', name: 'Elena Ramos', role: 'Veterinarian', email: 'elena@bluepatitas.app', status: 'Active' },
  { id: 'user-3', name: 'Shelter Care Team', role: 'Caretaker', email: 'care@refugiowuf.org', status: 'Warning' },
];

export const mockReports: Report[] = [
  { id: 'rep-1', animalId: 'firulais', title: 'Weekly health summary', createdAt: '2026-05-08', summary: 'Stable vitals and regular feeding confirmation.' },
  { id: 'rep-2', animalId: 'rex', title: 'Geofence incident', createdAt: '2026-05-09', summary: 'Perimeter exit detected and resolved by caretaker.' },
  { id: 'rep-3', animalId: 'toby', title: 'Temperature risk review', createdAt: '2026-05-10', summary: 'Critical temperature readings require follow-up.' },
];
