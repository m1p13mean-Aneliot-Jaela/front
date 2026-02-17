import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

type UserType = 'admin' | 'shop' | 'client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  
  // Simulation des types d'utilisateur
  userTypes: { value: UserType; label: string; icon: string; color: string }[] = [
    { value: 'admin', label: 'Administrateur', icon: 'shield', color: '#ef4444' },
    { value: 'shop', label: 'Boutique / Shop', icon: 'store', color: '#8b5cf6' },
    { value: 'client', label: 'Client', icon: 'user', color: '#10b981' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      userType: ['client', Validators.required] // Valeur par défaut
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    const { email, password, userType } = this.loginForm.value;

    // Simulation locale de l'authentification
    setTimeout(() => {
      this.loading = false;
      
      // Simuler un utilisateur connecté avec le type sélectionné
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        name: this.getUserNameByType(userType),
        userType: userType as UserType,
        token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 16)
      };

      this.authService.simulateLogin(mockUser);
      this.redirectByRole(userType as UserType);
    }, 1000);
  }

  private getUserNameByType(userType: UserType): string {
    const names = {
      admin: 'Admin User',
      shop: 'Shop Manager',
      client: 'John Client'
    };
    return names[userType];
  }

  private redirectByRole(userType: UserType): void {
    const routes = {
      admin: '/admin/dashboard',
      shop: '/shop/dashboard',
      client: '/app/dashboard'
    };
    this.router.navigate([routes[userType]]);
  }
}
