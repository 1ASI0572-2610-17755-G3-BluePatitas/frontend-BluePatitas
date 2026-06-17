import { Alert, Animal, Device, FeedingEvent, FeedingPlan, MonitoringZone, Report, Shelter, User, Veterinarian } from '../../domain/models/bluepatitas.models';

export const assetPath = '/assets/bluepatitas/';

export const mockShelter: Shelter = {
  id: 'shelter-wuf',
  name: '',
  city: '',
  address: '',
  administrator: '',
  phone: '',
  email: '',
};

export const mockZones: MonitoringZone[] = [
  { id: 'puppies',    targetId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Puppy Zone',       temperatureC: 24, humidity: 45, status: 'Active',       animalCount: 0, cameraEnabled: true,  imageUrl: `${assetPath}monitoring-zone-dogs.png` },
  { id: 'quarantine', targetId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Quarantine Zone',  temperatureC: 28, humidity: 60, status: 'Warning',      animalCount: 0, cameraEnabled: true,  imageUrl: `${assetPath}monitoring-zone-cats.png` },
  { id: 'recovery',   targetId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Recovery Zone',    temperatureC: null, humidity: null, status: 'Disconnected', animalCount: 0, cameraEnabled: false },
];

export const mockAnimals: Animal[] = [];

export const mockDevices: Device[] = [
  { id: 'cam-01', name: 'Camera', type: 'Camera', zoneId: 'puppies', status: 'Active', battery: null, lastSync: '5 min ago' },
  { id: 'sensor-01', name: 'Sensor T/H', type: 'Sensor T/H', zoneId: 'quarantine', status: 'Active', battery: 84, lastSync: '3 min ago' },
  { id: 'gps-01', name: 'GPS Collar', type: 'GPS Collar', zoneId: 'puppies', status: 'Low Battery', battery: 18, lastSync: '15 min ago' },
  { id: 'disp-01', name: 'Dispenser', type: 'Dispenser', zoneId: 'recovery', status: 'Disconnected', battery: 0, lastSync: '1 h ago' },
];

export const mockAlerts: Alert[] = [];

export const mockFeedingPlans: FeedingPlan[] = [];

export const mockFeedingEvents: FeedingEvent[] = [];

export const mockVeterinarians: Veterinarian[] = [];

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Administrator', role: 'Administrator', email: 'admin@refugiowuf.org', status: 'Active' },
];

export const mockReports: Report[] = [];

