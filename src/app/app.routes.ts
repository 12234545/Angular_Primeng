import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate : [authGuard],
    loadComponent: () =>{
      return import('./components/home/home.component').then(m => m.HomeComponent);
    }
  },
  {
    path: 'home',
    canActivate : [authGuard],
    loadComponent: () =>{
      return import('./components/home/home.component').then(m => m.HomeComponent);

    }
  },
  {
    path: 'login',
    loadComponent: () =>{
      return import('./components/login/login.component').then(m => m.LoginComponent);
    }
  },
  {
    path: 'register',
    loadComponent: () =>{
      return import('./components/register/register.component').then(m => m.RegisterComponent);
    }
  },
];
