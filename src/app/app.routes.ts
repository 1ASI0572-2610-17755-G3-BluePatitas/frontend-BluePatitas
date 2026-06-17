import { Routes } from '@angular/router';

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
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'animals', loadComponent: () => import('./features/animals/animals.page').then((m) => m.AnimalsPage) },
      { path: 'monitoring', loadComponent: () => import('./features/monitoring/monitoring.page').then((m) => m.MonitoringPage) },
      { path: 'veterinarians', loadComponent: () => import('./features/veterinarians/veterinarians.page').then((m) => m.VeterinariansPage) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPage) },
      { path: 'alerts', loadComponent: () => import('./features/alerts/alerts.page').then((m) => m.AlertsPage) },
      { path: 'feeding', loadComponent: () => import('./features/feeding/feeding.page').then((m) => m.FeedingPage) },
      { path: 'devices', loadComponent: () => import('./features/devices/devices.page').then((m) => m.DevicesPage) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports.page').then((m) => m.ReportsPage) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
