import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
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
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'animals', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/animals/animals.page').then((m) => m.AnimalsPage) },
      { path: 'monitoring', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/monitoring/monitoring.page').then((m) => m.MonitoringPage) },
      { path: 'veterinarians', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/veterinarians/veterinarians.page').then((m) => m.VeterinariansPage) },
      { path: 'settings', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPage) },
      { path: 'alerts', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/alerts/alerts.page').then((m) => m.AlertsPage) },
      { path: 'feeding', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/feeding/feeding.page').then((m) => m.FeedingPage) },
      { path: 'devices', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/devices/devices.page').then((m) => m.DevicesPage) },
      { path: 'reports', canActivate: [roleGuard(['SHELTER_ADMIN'])], loadComponent: () => import('./features/reports/reports.page').then((m) => m.ReportsPage) },
      { path: 'veterinary/dashboard', canActivate: [roleGuard(['VETERINARIAN'])], loadComponent: () => import('./features/veterinary-dashboard/veterinary-dashboard.page').then((m) => m.VeterinaryDashboardPage) },
      { path: 'veterinary/animals', canActivate: [roleGuard(['VETERINARIAN'])], loadComponent: () => import('./features/veterinary-animals/veterinary-animals.page').then((m) => m.VeterinaryAnimalsPage) },
      { path: 'veterinary/animals/:id', canActivate: [roleGuard(['VETERINARIAN'])], loadComponent: () => import('./features/veterinary-animals/veterinary-animal-detail.page').then((m) => m.VeterinaryAnimalDetailPage) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
