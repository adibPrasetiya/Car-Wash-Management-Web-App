import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentPageTitle = 'Dashboard';
  currentPageSubtitle = 'Welcome back! Here\'s what\'s happening today.';
  isUserDropdownOpen = false;

  private pageConfig: { [key: string]: { title: string; subtitle: string } } = {
    '/main/dashboard': {
      title: 'Dashboard',
      subtitle: 'Welcome back! Here\'s what\'s happening today.'
    },
    '/main/clients': {
      title: 'Clients',
      subtitle: 'Manage your customer database'
    },
    '/main/vehicles': {
      title: 'Vehicles',
      subtitle: 'Track and manage vehicle information'
    },
    '/main/cashier': {
      title: 'Cashier',
      subtitle: 'Point of sale and transaction management'
    },
    '/main/cashier/transactions': {
      title: 'Transactions',
      subtitle: 'View and manage all transactions'
    },
    '/main/cashier/transactions/new': {
      title: 'New Transaction',
      subtitle: 'Create a new transaction'
    },
    '/main/users': {
      title: 'Users',
      subtitle: 'Manage system users and permissions'
    },
    '/main/loyalty': {
      title: 'Loyalty Program',
      subtitle: 'Manage customer loyalty and rewards'
    },
    '/main/settings': {
      title: 'Settings',
      subtitle: 'Configure system preferences'
    }
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set initial page title based on current route
    this.updatePageTitle(this.router.url);

    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.urlAfterRedirects);
      });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (this.isUserDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-profile')) {
          this.isUserDropdownOpen = false;
        }
      }
    });
  }

  toggleMobileSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  onProfile(): void {
    // Navigate to profile or open profile modal
    console.log('Navigate to profile');
    this.isUserDropdownOpen = false;
  }

  onSettings(): void {
    this.router.navigate(['/main/settings']);
    this.isUserDropdownOpen = false;
  }

  onLogout(): void {
    // Handle logout
    console.log('Logout');
    this.router.navigate(['/auth/login']);
    this.isUserDropdownOpen = false;
  }

  private updatePageTitle(url: string): void {
    // Handle dynamic routes (e.g., /main/cashier/transactions/123)
    let matchedRoute = '';

    // Check for exact match first
    if (this.pageConfig[url]) {
      matchedRoute = url;
    } else {
      // Check for partial matches (for dynamic routes)
      const routes = Object.keys(this.pageConfig);
      for (const route of routes) {
        if (url.startsWith(route) && route !== '/main/cashier/transactions/new') {
          matchedRoute = route;
          break;
        }
      }

      // Special handling for transaction detail pages
      if (url.match(/\/main\/cashier\/transactions\/\d+$/)) {
        this.currentPageTitle = 'Transaction Details';
        this.currentPageSubtitle = 'View and manage transaction information';
        return;
      }
    }

    if (matchedRoute && this.pageConfig[matchedRoute]) {
      this.currentPageTitle = this.pageConfig[matchedRoute].title;
      this.currentPageSubtitle = this.pageConfig[matchedRoute].subtitle;
    }
  }
}
