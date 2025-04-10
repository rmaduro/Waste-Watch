import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { VehicleListComponent } from './fleet-management/vehicle-list/vehicle_list.component';
import { DefinePasswordComponent } from './auth/define-password/define-password.component';
import { BinListComponent } from './bin-management/bin-list/bin-list-component';
import { RegisterUserComponent } from './auth/register-user/register-user-component';
import { FleetDashboardComponent } from './fleet-management/fleet-dashboard/fleet-dashboard-component';
import { BinDashboardComponent } from './bin-management/bin-dashboard/bin-dashboard-component';
import { BinMapComponent } from '../app/bin-management/bin-map/bin-map-component';
import { FleetMapComponent } from '../app/fleet-management/fleet-map/fleet-map-component';
import { VehiclesRouteComponent } from './fleet-management/route-view/vehicle-route-component';



// Define routes
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'register-user', component: RegisterUserComponent },
  { path: 'login', component: LoginComponent },
  { path: 'define-password', component: DefinePasswordComponent },
  { path: 'vehicle-list', component: VehicleListComponent },
  { path: 'bin-list', component: BinListComponent },
  { path: 'fleet-dashboard', component: FleetDashboardComponent },
  { path: 'bin-dashboard', component: BinDashboardComponent },
  { path: 'bin-map', component: BinMapComponent },
  { path: 'vehicle-map', component: FleetMapComponent },
  { path: 'vehicle-routes', component: VehiclesRouteComponent },
  { path: 'route-view/:id', component: VehiclesRouteComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Import RouterModule with routes
  exports: [RouterModule], // Export RouterModule so it can be used in other parts of the app
})
export class AppRoutingModule {}
