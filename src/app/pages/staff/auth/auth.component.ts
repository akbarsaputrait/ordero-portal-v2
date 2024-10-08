import { Component, OnInit } from '@angular/core';
import { INavRoute } from '@app/core/services/navigation.service';
import { StaffLoginNavRoute, StaffLoginRoute } from './login/login.component';
import { StaffForgotPasswordNavRoute, StaffForgotPasswordRoute } from './forgot-password/forgot-password.component';
import { StaffChangePasswordNavRoute, StaffChangePasswordRoute } from './change-password/change-password.component';

@Component({
  selector: 'aka-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

export const StaffAuthNavRoute: INavRoute = {
  path: '',
  name: 'staff.auth',
  title: 'auth.parent',
  children: [StaffLoginNavRoute, StaffForgotPasswordNavRoute, StaffChangePasswordNavRoute],
};

export const StaffAuthRoute: INavRoute = {
  ...StaffAuthNavRoute,
  component: AuthComponent,
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'login',
    },
    StaffLoginRoute,
    StaffForgotPasswordRoute,
    StaffChangePasswordRoute,
  ],
};
