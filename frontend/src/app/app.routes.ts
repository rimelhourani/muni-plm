import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'items', loadComponent: () => import('./pages/items/item-list/item-list.component').then(m => m.ItemListComponent) },
      { path: 'items/:id', loadComponent: () => import('./pages/items/item-detail/item-detail.component').then(m => m.ItemDetailComponent) },
      { path: 'ecr', loadComponent: () => import('./pages/ecr/ecr-list/ecr-list.component').then(m => m.EcrListComponent) },
      { path: 'ecr/:id', loadComponent: () => import('./pages/ecr/ecr-detail/ecr-detail.component').then(m => m.EcrDetailComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
