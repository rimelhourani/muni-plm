import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <div class="register-brand">
        <div class="brand-icon">
          <mat-icon>precision_manufacturing</mat-icon>
        </div>
        <h1>miniPLM</h1>
        <p class="brand-tagline">PLM Learning Platform · Teamcenter Concepts</p>
      </div>

      <mat-card class="register-card">
        <mat-card-content>
          <h2>Create Account</h2>

          <div *ngIf="error" class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ error }}</span>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="username" placeholder="Choose a username" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput formControlName="email" type="email" placeholder="your.email@example.com" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPass ? 'text' : 'password'" formControlName="password" />
              <button type="button" mat-icon-button matSuffix (click)="showPass = !showPass">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showConfirmPass ? 'text' : 'password'" formControlName="confirmPassword" />
              <button type="button" mat-icon-button matSuffix (click)="showConfirmPass = !showConfirmPass">
                <mat-icon>{{ showConfirmPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div *ngIf="registerForm.get('confirmPassword')?.touched && !passwordsMatch()" class="error-text">
              <mat-icon>info</mat-icon>
              <span>Passwords do not match</span>
            </div>

            <button mat-raised-button color="primary" class="full-width register-btn" type="submit" [disabled]="loading || registerForm.invalid">
              <mat-spinner *ngIf="loading" diameter="20" class="inline-spinner"></mat-spinner>
              <span *ngIf="!loading">Create Account</span>
            </button>
          </form>

          <div class="login-link">
            <p>Already have an account? <a routerLink="/login" class="link-button">Sign in here</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 24px;
      font-family: 'Inter', sans-serif;
    }
    .register-brand {
      text-align: center;
      margin-bottom: 32px;
      color: white;
    }
    .brand-icon {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 8px 32px rgba(99,102,241,0.4);
    }
    .brand-icon mat-icon { font-size: 36px; width: 36px; height: 36px; color: white; }
    .register-brand h1 { font-size: 2rem; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
    .brand-tagline { opacity: 0.6; font-size: 0.875rem; margin: 8px 0 0; }
    .register-card {
      width: 100%;
      max-width: 420px;
      border-radius: 16px !important;
      background: #1e293b !important;
      border: 1px solid rgba(255,255,255,0.08);
    }
    mat-card-content { padding: 32px !important; }
    h2 { color: white; margin: 0 0 24px; font-size: 1.25rem; font-weight: 600; }
    .full-width { width: 100%; }
    .register-btn { height: 48px; font-size: 1rem; font-weight: 600; border-radius: 8px !important; margin-top: 8px; }
    .inline-spinner { display: inline-block; }
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.3);
      color: #f87171;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }
    .error-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f87171;
      font-size: 0.875rem;
      margin: -12px 0 16px 0;
    }
    .error-text mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .login-link {
      text-align: center;
      margin-top: 16px;
      font-size: 0.875rem;
      color: rgba(255,255,255,0.6);
    }
    .link-button {
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s;
    }
    .link-button:hover {
      color: #818cf8;
      text-decoration: underline;
    }

    :host ::ng-deep .mat-mdc-form-field .mdc-text-field { background: rgba(255,255,255,0.05) !important; }

    :host ::ng-deep .mat-mdc-form-field input {
      color: white !important;
      caret-color: white;
    }

    :host ::ng-deep .mat-mdc-text-field-wrapper {
      height: 56px;
    }

    :host ::ng-deep .mat-mdc-form-field-flex {
      align-items: center;
      height: 56px;
    }

    :host ::ng-deep .mdc-floating-label {
      color: rgba(255,255,255,0.5) !important;
      top: 50%;
    }

    :host ::ng-deep .mdc-floating-label--float-above {
      color: rgba(255,255,255,0.7) !important;
    }

    :host ::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading,
    :host ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch,
    :host ::ng-deep .mat-mdc-form-field .mdc-notched-outline__trailing {
      border-color: rgba(255,255,255,0.2) !important;
    }

    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #6366f1 !important;
    }

    :host ::ng-deep .mat-mdc-form-field-icon-prefix {
      color: rgba(255,255,255,0.5);
      padding-right: 8px;
    }
  `]
})
export class RegisterComponent {
  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });
  
  loading = false;
  error = '';
  showPass = false;
  showConfirmPass = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  passwordsMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onRegister() {
    if (this.registerForm.invalid || !this.passwordsMatch()) return;
    this.loading = true;
    this.error = '';
    
    const formValue = this.registerForm.value;
    this.auth.register({
      username: formValue.username!,
      email: formValue.email!,
      password: formValue.password!,
      confirmPassword: formValue.confirmPassword!,
      role: 'VIEWER'
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        let errorMsg = 'Registration failed. Please try again.';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.error?.errors) {
          errorMsg = Object.values(err.error.errors).join(', ');
        }
        this.error = errorMsg;
        this.loading = false;
      }
    });
  }
}
