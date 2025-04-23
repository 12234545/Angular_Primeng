import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-home',
  imports: [ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router : Router) {

   }
  logOut(){
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
