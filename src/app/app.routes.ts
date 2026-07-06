import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./features/auth/register.page').then((m) => m.RegisterPage) },
  {
    path: 'onboarding/refuge',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basic-info' },
      { path: 'basic-info', loadComponent: () => import('./features/onboarding/onboarding.page').then((m) => m.OnboardingPage) },
      { path: 'location', loadComponent: () => import('./features/onboarding/onboarding.page').then((m) => m.OnboardingPage) },
      { path: 'confirmation', loadComponent: () => import('./features/onboarding/onboarding.page').then((m) => m.OnboardingPage) },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: 'dashboard', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'animals', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/animals/animals.page').then((m) => m.AnimalsPage) },
      { path: 'monitoring', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/monitoring/monitoring.page').then((m) => m.MonitoringPage) },
      { path: 'veterinarians', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/veterinarians/veterinarians.page').then((m) => m.VeterinariansPage) },
      { path: 'settings', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPage) },
      { path: 'alerts', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/alerts/alerts.page').then((m) => m.AlertsPage) },
      { path: 'feeding', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/feeding/feeding.page').then((m) => m.FeedingPage) },
      { path: 'devices', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/devices/devices.page').then((m) => m.DevicesPage) },
      { path: 'reports', canActivate: [roleGuard], data: { roles: ['SHELTER_ADMIN'] }, loadComponent: () => import('./features/reports/reports.page').then((m) => m.ReportsPage) },
      {
        path: 'veterinary',
        children: [
          { path: '', canActivate: [roleGuard], data: { roles: ['VETERINARIAN'] }, loadComponent: () => import('./features/veterinary/veterinary-dashboard.page').then((m) => m.VeterinaryDashboardPage) },
          { path: 'animals', canActivate: [roleGuard], data: { roles: ['VETERINARIAN'] }, loadComponent: () => import('./features/veterinary/veterinary-animals.page').then((m) => m.VeterinaryAnimalsPage) },
          { path: 'animals/:id', canActivate: [roleGuard], data: { roles: ['VETERINARIAN'] }, loadComponent: () => import('./features/veterinary/veterinary-animal-detail.page').then((m) => m.VeterinaryAnimalDetailPage) },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
