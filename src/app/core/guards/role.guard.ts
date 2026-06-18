import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../auth/auth-session.service';
import { BluePatitasRole } from '../domain/models/auth.models';

export function roleGuard(allowedRoles: BluePatitasRole[]): CanActivateFn {
  return () => {
    const session = inject(AuthSessionService);
    const router = inject(Router);
    const current = session.currentSession;

    if (!current) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.some((role) => session.hasRole(role))) {
      return true;
    }

    return router.createUrlTree([session.dashboardPath(current)]);
  };
}
