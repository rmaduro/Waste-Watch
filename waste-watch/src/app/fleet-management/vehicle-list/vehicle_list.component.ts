import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faMinus,
  faSearch,
  faFilter,
  faTruck,
  faIdCard,
  faUser,
  faCircle,
  faRoute,
  faWeight,
  faTools
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent, FontAwesomeModule],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css']
})
export class VehicleListComponent {
  // Font Awesome Icons
  faPlus = faPlus;
  faMinus = faMinus;
  faSearch = faSearch;
  faFilter = faFilter;
  faTruck = faTruck;
  faIdCard = faIdCard;
  faUser = faUser;
  faCircle = faCircle;
  faRoute = faRoute;
  faWeight = faWeight;
  faTools = faTools;

  vehicles = [
    {
      id: 1,
      licensePlate: '00-XX-00',
      driverName: 'Alexandra Atkins',
      status: 'Active',
      routeType: 'Commercial',
      maxCapacity: '1000kg',
      lastMaintenance: '02-May-2024',
    },
    {
      id: 2,
      licensePlate: '00-XX-00',
      driverName: 'Alice Adams',
      status: 'Idle',
      routeType: 'Industrial',
      maxCapacity: '1500kg',
      lastMaintenance: '18-Jun-2024',
    },
  ];

  selectedStatus = '';
  selectedRoute = '';
  selectedCapacity = '';
  searchQuery = '';


  get filteredVehicles() {
    return this.vehicles.filter((vehicle) => {
      return (
        (this.selectedStatus === '' || vehicle.status === this.selectedStatus) &&
        (this.selectedRoute === '' || vehicle.routeType === this.selectedRoute) &&
        (this.selectedCapacity === '' || vehicle.maxCapacity === this.selectedCapacity) &&
        (this.searchQuery === '' || vehicle.id.toString().includes(this.searchQuery))
      );
    });
  }
}
