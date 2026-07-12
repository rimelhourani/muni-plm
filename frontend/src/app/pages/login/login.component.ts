import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-brand">
        <div class="brand-icon">
          <mat-icon>precision_manufacturing</mat-icon>
        </div>
        <h1>miniPLM</h1>
        <p class="brand-tagline">Plateforme de Formation PLM · Concepts Teamcenter</p>
      </div>

      <mat-card class="login-card">
        <mat-card-content>
          <h2>Connexion</h2>

          <div *ngIf="error" class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ error }}</span>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom d'utilisateur</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="username" placeholder="ex: engineer" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPass ? 'text' : 'password'" formControlName="password" />
              <button type="button" mat-icon-button matSuffix (click)="showPass = !showPass">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button color="primary" class="full-width login-btn" type="submit" [disabled]="loading">
              <mat-spinner *ngIf="loading" diameter="20" class="inline-spinner"></mat-spinner>
              <span *ngIf="!loading">Se connecter</span>
            </button>
          </form>

          <div class="demo-accounts">
            <p class="demo-title">Comptes de démo</p>
            <div class="demo-grid">
              <div class="demo-chip" *ngFor="let acc of demoAccounts" (click)="fillDemo(acc)">
                <span class="chip-role">{{ acc.role }}</span>
                <span class="chip-user">{{ acc.username }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 24px;
      font-family: 'Inter', sans-serif;
    }
    .login-brand {
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
    .login-brand h1 { font-size: 2rem; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
    .brand-tagline { opacity: 0.6; font-size: 0.875rem; margin: 8px 0 0; }
    .login-card {
      width: 100%;
      max-width: 420px;
      border-radius: 16px !important;
      background: #1e293b !important;
      border: 1px solid rgba(255,255,255,0.08);
    }
    mat-card-content { padding: 32px !important; }
    h2 { color: white; margin: 0 0 24px; font-size: 1.25rem; font-weight: 600; }
    .full-width { width: 100%; }
    .login-btn { height: 48px; font-size: 1rem; font-weight: 600; border-radius: 8px !important; margin-top: 8px; }
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
    .demo-accounts { margin-top: 24px; }
    .demo-title { color: rgba(255,255,255,0.4); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .demo-chip {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 10px 12px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .demo-chip:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); }
    .chip-role { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #818cf8; }
    .chip-user { font-size: 0.875rem; color: rgba(255,255,255,0.8); font-weight: 500; }

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
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  loading = false;
  error = '';
  showPass = false;

  demoAccounts = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Ingénieur', username: 'engineer', password: 'engineer123' },
    { role: 'Approbateur', username: 'approver', password: 'approver123' },
    { role: 'Lecteur', username: 'viewer', password: 'viewer123' },
  ];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  fillDemo(acc: any) {
    this.loginForm.setValue({ username: acc.username, password: acc.password });
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, password } = this.loginForm.value;
    this.auth.login({ username: username!, password: password! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error = err.error?.message || 'Identifiants incorrects';
        this.loading = false;
      }
    });
  }
}