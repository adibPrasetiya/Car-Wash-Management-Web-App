import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  isExpanded?: boolean;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-home',
      route: '/main/dashboard',
      isActive: false
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: 'fas fa-users',
      isExpanded: false,
      children: [
        {
          id: 'client-list',
          label: 'Client List',
          icon: 'fas fa-list',
          route: '/main/client/client-list'
        },
        {
          id: 'client-groups',
          label: 'Client Groups',
          icon: 'fas fa-layer-group',
          route: '/main/client/groups'
        }
      ]
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: 'fas fa-car',
      route: '/main/vehicles'
    },
    {
      id: 'services',
      label: 'Services',
      icon: 'fas fa-cogs',
      route: '/main/services'
    },
    {
      id: 'discounts',
      label: 'Discounts',
      icon: 'fas fa-percentage',
      route: '/main/discounts'
    },
    {
      id: 'cashier',
      label: 'Cashier',
      icon: 'fas fa-cash-register',
      isExpanded: false,
      children: [
        {
          id: 'transactions',
          label: 'Transactions',
          icon: 'fas fa-receipt',
          route: '/main/cashier/transactions'
        },
        {
          id: 'pos',
          label: 'Point of Sale',
          icon: 'fas fa-shopping-cart',
          route: '/main/cashier/pos'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'fas fa-chart-bar',
      isExpanded: false,
      children: [
        {
          id: 'sales',
          label: 'Sales Report',
          icon: 'fas fa-chart-line',
          route: '/main/reports/sales'
        },
        {
          id: 'customers',
          label: 'Customer Report',
          icon: 'fas fa-user-chart',
          route: '/main/reports/customers'
        }
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'fas fa-user',
      route: '/main/users'
    },
    {
      id: 'loyalty',
      label: 'Loyalty',
      icon: 'fas fa-star',
      route: '/main/loyalty'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'fas fa-cog',
      isExpanded: false,
      children: [
        {
          id: 'general',
          label: 'General',
          icon: 'fas fa-sliders-h',
          route: '/main/settings/general'
        },
        {
          id: 'security',
          label: 'Security',
          icon: 'fas fa-shield-alt',
          route: '/main/settings/security'
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set initial active state based on current route
    this.updateActiveState(this.router.url);

    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveState(event.urlAfterRedirects);
      });
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.children) {
      item.isExpanded = !item.isExpanded;
    }
  }

  setActive(item: MenuItem): void {
    // Reset all active states
    this.resetActiveStates(this.menuItems);
    // Set clicked item as active
    item.isActive = true;
  }

  private resetActiveStates(items: MenuItem[]): void {
    items.forEach(item => {
      item.isActive = false;
      if (item.children) {
        this.resetActiveStates(item.children);
      }
    });
  }

  private updateActiveState(url: string): void {
    // Reset all active states first
    this.resetActiveStates(this.menuItems);

    // Find and set active menu based on current route
    this.findAndSetActiveMenu(this.menuItems, url);
  }

  private findAndSetActiveMenu(items: MenuItem[], url: string): boolean {
    for (const item of items) {
      // Check if this item has children
      if (item.children && item.children.length > 0) {
        // Check children first
        const childIsActive = this.findAndSetActiveMenu(item.children, url);
        if (childIsActive) {
          // If a child is active, expand the parent
          item.isExpanded = true;
          return true;
        }
      }

      // Check if current item matches the URL
      if (item.route) {
        // Exact match
        if (item.route === url) {
          item.isActive = true;
          return true;
        }

        // Partial match for nested routes (e.g., /main/cashier/transactions/123)
        if (url.startsWith(item.route + '/') ||
            (item.route === '/main/cashier/transactions' && url.includes('/main/cashier/transactions'))) {
          item.isActive = true;
          return true;
        }
      }
    }
    return false;
  }
}
