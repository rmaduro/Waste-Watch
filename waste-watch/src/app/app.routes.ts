import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { VehicleListComponent } from './fleet-management/vehicle-list/vehicle_list.component';
import {DefinePasswordComponent } from "./auth/define-password/define-password.component";


// Define routes
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'define-password', component: DefinePasswordComponent },
  { path: 'vehicle-list', component: VehicleListComponent },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Import RouterModule with routes
  exports: [RouterModule]  // Export RouterModule so it can be used in other parts of the app
})
export class AppRoutingModule { }
