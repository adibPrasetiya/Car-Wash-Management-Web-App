import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { ToastrService } from '../../../core/services/toastr.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/main/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const credentials: LoginRequest = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastrService.success('Login berhasil! Selamat datang.');

          // Redirect based on user role
          const role = response.user.role;
          if (role === 'owner') {
            this.router.navigate(['/main/dashboard']);
          } else if (role === 'cashier') {
            this.router.navigate(['/main/cashier']);
          } else {
            this.router.navigate(['/main/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);

          if (error.status === 401) {
            this.toastrService.error('Username atau password salah. Silakan coba lagi.');
          } else if (error.status === 0) {
            this.toastrService.error('Tidak dapat terhubung ke server. Pastikan server berjalan.');
          } else {
            this.toastrService.error('Terjadi kesalahan saat login. Silakan coba lagi.');
          }
        },
      });
    } else {
      this.toastrService.warning('Mohon lengkapi semua field yang diperlukan.');
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Quick login for development (remove in production)
  quickLogin(role: 'owner' | 'cashier'): void {
    const credentials =
      role === 'owner'
        ? { username: 'owner', password: 'password' }
        : { username: 'cashier', password: 'password' };

    this.loginForm.patchValue(credentials);
    this.onSubmit();
  }
}
