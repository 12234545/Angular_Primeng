import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators , FormGroup} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-login',
  imports: [CardModule ,
    InputTextModule,
    ReactiveFormsModule ,
    ButtonModule ,
    RouterLink ,
    CommonModule ,
    ToastModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder ,
    private authService: AuthService ,
    private router : Router ,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get email() {
    return this.loginForm.controls['email'];
  }
  get password() {
    return this.loginForm.controls['password'];
  }

  loginUser() {
    const {email , password} = this.loginForm.value;
    this.authService.getUserByEmail(email as string).subscribe(
       response => {
        if (response.length > 0 && response[0].password === password) {
          sessionStorage.setItem('email' , email as string);
           this.router.navigate(['/home']);
        }else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Email or password is wrong' });
        }
       },
       error =>{
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong' });
       }

    )
  }

  goBack(){
    this.router.navigate(['/']);

  }
}
