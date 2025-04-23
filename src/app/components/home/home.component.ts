import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, CommonModule , RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  userInfo: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const email = sessionStorage.getItem('email');
    if (email) {
      this.authService.getUserByEmail(email).subscribe(
        (users) => {
          if (users.length > 0) {
            this.userInfo = users[0];
          }
        },
        (error) => {
          console.error('Error loading user info:', error);
        }
      );
    }
  }

  logOut(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
