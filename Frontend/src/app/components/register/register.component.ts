import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators , FormGroup} from '@angular/forms';
import { passwordMatchValidator } from '../../shared/password-match.directive';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/auth';
import { MessageService } from 'primeng/api';

import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-register',
  imports: [CardModule ,
    InputTextModule,
    ReactiveFormsModule ,
    ButtonModule ,
     RouterLink ,
     CommonModule ,

     ToastModule,
     ],
  templateUrl: './register.component.html',
  providers: [MessageService],
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder ,
    private authService: AuthService ,
    private messageService: MessageService,
    private router : Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/[a-zA-Z ]+(?: [a-zA-Z ]+)*$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    },{
      validators : passwordMatchValidator
    }
  );
  }

  get fullName() {
    return this.registerForm.controls['fullName'];
  }

  get email() {
    return this.registerForm.controls['email'];
  }
  get password() {
    return this.registerForm.controls['password'];
  }

  get confirmPassword() {
    return this.registerForm.controls['confirmPassword'];
  }

  submitDetails(){
    const postData = {...this.registerForm.value};
    delete postData.confirmPassword;
    this.authService.registerUser(postData as User).subscribe({
      next: (response) => {
        console.log(response);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Registered Successfully' });
        setTimeout(() => {
          this.router.navigate(['login']);
        }, 2000); // Attendre 2 secondes avant de rediriger
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong' });
      }
    });
  }

  goBack(){
    this.router.navigate(['/']);

  }

}
