import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { AvatarModule } from 'primeng/avatar';


@Component({
  selector: 'app-welcome',
  imports: [
    MenubarModule,
    AnimateOnScrollModule,
    AvatarModule,


  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
      this.items = [
          {
              label: 'Home',
              icon: 'pi pi-home',
              routerLink: '/'
          },

          {
              label: 'Services',
              icon: 'pi pi-cog'
          },

          {
            label: 'About Us',
            icon: 'pi pi-info-circle',

        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },

        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },
        {
          label: '',
          icon: '',
        },


        {
              label: 'Login',
              icon: 'pi pi-sign-in',
              routerLink: '/login'
        },

        {
              label: 'Register',
              icon: 'pi pi-user-plus',
              routerLink: '/register'
        },

      ]
  }

}
