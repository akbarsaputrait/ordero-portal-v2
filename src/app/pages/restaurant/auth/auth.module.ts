import { NgModule } from '@angular/core';

import { ToggleDarkModeModule } from '@aka/components/toggle-dark-mode/toggle-dark-mode.module';
import { SharedModule } from '@app/shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { RestaurantAuthComponent } from './auth.component';
import { RestaurantLoginComponent } from './login/login.component';
import { RestaurantRegisterComponent } from './register/register.component';
import { RestaurantVerifyComponent } from './verify/verify.component';
import { RestaurantChangePasswordComponent } from './change-password/change-password.component';
import { RestaurantForgotPasswordComponent } from './forgot-password/forgot-password.component';

@NgModule({
  declarations: [
    RestaurantAuthComponent,
    RestaurantLoginComponent,
    RestaurantRegisterComponent,
    RestaurantVerifyComponent,
    RestaurantForgotPasswordComponent,
    RestaurantChangePasswordComponent,
  ],
  imports: [SharedModule, AuthRoutingModule, ToggleDarkModeModule],
})
export class RestaurantAuthModule {}
