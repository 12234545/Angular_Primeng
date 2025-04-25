import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',

    loadComponent: () =>{
      return import('./components/welcome/welcome.component').then(m => m.WelcomeComponent);
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
  {
    path: 'todoList',
    loadComponent: () =>{
      return import('./components/todo-list/todo-list.component').then(m => m.TodoListComponent);
    }
  },
  {
    path: 'shop',
    loadComponent: () =>{
      return import('./components/product/product.component').then(m => m.ProductComponent);
    }
  },
];
