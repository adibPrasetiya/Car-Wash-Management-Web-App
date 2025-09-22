import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { activationGuard } from './core/guards/activation.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [activationGuard],
    children: [
      {
        path: '',
        redirectTo: '/main/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'activation',
    loadComponent: () => import('./features/activation/activation/activation.component').then(m => m.ActivationComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'main',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./shared/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'cashier',
        children: [
          {
            path: '',
            loadComponent: () => import('./shared/components/cashier/cashier.component').then(m => m.CashierComponent)
          },
          {
            path: 'transactions',
            loadComponent: () => import('./features/cashier/transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
          },
          {
            path: 'transactions/new',
            loadComponent: () => import('./features/cashier/transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent)
          },
          {
            path: 'transactions/:id',
            loadComponent: () => import('./features/cashier/transactions/transaction-detail/transaction-detail.component').then(m => m.TransactionDetailComponent)
          }
        ]
      },
      {
        path: 'client',
        children: [
          {
            path: 'client-list',
            loadComponent: () => import('./features/cashier/client/client-list/client-list.component').then(m => m.ClientListComponent)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/main/dashboard'
  }
];
