import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ActivationService } from '../services/activation.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const activationService = inject(ActivationService);
  const router = inject(Router);

  // Check activation first
  if (!activationService.isActivatedLocally()) {
    router.navigate(['/activation']);
    return false;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login page
  router.navigate(['/login']);
  return false;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const activationService = inject(ActivationService);
  const router = inject(Router);

  // Check activation first
  if (!activationService.isActivatedLocally()) {
    router.navigate(['/activation']);
    return false;
  }

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Redirect to dashboard if already logged in
  router.navigate(['/dashboard']);
  return false;
};
