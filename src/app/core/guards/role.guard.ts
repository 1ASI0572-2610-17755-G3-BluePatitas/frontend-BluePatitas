import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NormalizedRole, SessionService } from '../auth/session.service';

export const roleGuard: CanActivateFn = (route) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const user = session.getCurrentUser();

  if (!session.getToken() || !user) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = (route.data?.['roles'] ?? []) as NormalizedRole[];
  if (!allowedRoles.length || allowedRoles.includes(user.role)) {
    return true;
  }

  if (user.role === 'VETERINARIAN') {
    return router.createUrlTree(['/veterinary']);
  }

  return router.createUrlTree(['/dashboard']);
};
