import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ActivationService } from '../services/activation.service';

export const activationGuard: CanActivateFn = (route, state) => {
  const activationService = inject(ActivationService);
  const router = inject(Router);

  // Check if application is already activated
  if (activationService.isActivatedLocally()) {
    return true;
  }

  // If not activated, redirect to activation page
  router.navigate(['/activation']);
  return false;
};
