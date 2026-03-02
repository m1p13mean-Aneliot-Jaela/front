import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get passwordStrength(): number {
    const password = this.signupForm.get('password')?.value || '';
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  }

  get passwordStrengthLabel(): string {
    const labels = ['', 'Faible', 'Moyen', 'Fort'];
    return labels[this.passwordStrength];
  }

  get passwordStrengthColor(): string {
    const colors = ['#E2E8F0', '#EF4444', '#F59E0B', '#3B82F6'];
    return colors[this.passwordStrength];
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.loading = true;
    this.error = '';

    const { email, password, first_name, last_name, phone } = this.signupForm.value;

    this.authService.signup({ email, password, first_name, last_name, phone }).subscribe({
      next: () => {
        this.loading = false;
        this.authService.redirectByRole();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Signup failed';
      }
    });
  }
}
