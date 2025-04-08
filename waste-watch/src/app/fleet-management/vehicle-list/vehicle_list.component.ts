import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus, faMinus, faSearch, faFilter, faTruck, faIdCard, faUser,
  faCircle, faRoute, faWeight, faTools, faTrash, faExclamationTriangle,
  faSpinner, faMapMarkerAlt, faIdBadge, faEye, faMapMarked
} from '@fortawesome/free-solid-svg-icons';
import { VehicleService, Vehicle, Driver } from '../../services/FleetService';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent, FontAwesomeModule, HttpClientModule],
  providers: [VehicleService],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css']
})
export class VehicleListComponent implements OnInit {
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
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;
  faMapMarkerAlt = faMapMarkerAlt;
  faIdBadge = faIdBadge;
  faEye = faEye;
  faMapMarked = faMapMarked;

  vehicles: Vehicle[] = [];
  availableDrivers: Driver[] = [];
  selectedDriverIndex: number = -1;
  isLoading = false;
  error = '';

  selectedStatus = '';
  selectedRoute = '';
  selectedCapacity = '';
  searchQuery = '';
  selectedVehicle: Vehicle | null = null;
  showAddForm = false;
  showDeleteConfirmation = false;
  useCustomDriver = false;

  vehicle: Vehicle = this.getDefaultVehicle();

  // Pagination
  currentPage: number = 1;
  pageSize: number = 7;

  // Add these methods to the VehicleListComponent class:

get paginatedVehicles() {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  return this.filteredVehicles.slice(start, end);
}

nextPage() {
  if (this.currentPage * this.pageSize < this.filteredVehicles.length) {
    this.currentPage++;
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

// Also update the totalPages getter to use filteredVehicles:
get totalPages(): number {
  return Math.ceil(this.filteredVehicles.length / this.pageSize);
}

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vehicleService.vehicles$.subscribe({
      next: (data) => (this.vehicles = data),
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.error = 'Failed to load vehicles. Please try again later.';
      }
    });

    this.availableDrivers = this.vehicleService.getAvailableDrivers();
  }

  navigateToRoute(vehicleId: number) {
    this.router.navigate(['/routes', vehicleId]);
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.vehicle = this.getDefaultVehicle();
    }
  }

 // Update the filteredVehicles getter to not reset currentPage automatically
get filteredVehicles() {
  return this.vehicles.filter((vehicle) => {
    const maxCapacityString = typeof vehicle.maxCapacity === 'number'
      ? `${vehicle.maxCapacity}kg`
      : vehicle.maxCapacity;

    return (
      (this.selectedStatus === '' || vehicle.status === this.selectedStatus) &&
      (this.selectedRoute === '' || vehicle.routeType === this.selectedRoute) &&
      (this.selectedCapacity === '' || maxCapacityString === this.selectedCapacity) &&
      (this.searchQuery === '' ||
        (vehicle.id && vehicle.id.toString().includes(this.searchQuery)))
    );
  });
}

// Add this method to reset page when filters change
onFilterChange() {
  this.currentPage = 1;
}

  selectVehicle(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }

  showDeleteDialog() {
    if (this.selectedVehicle) {
      this.showDeleteConfirmation = true;
    }
  }

  cancelDelete() {
    this.showDeleteConfirmation = false;
  }

  confirmDelete() {
    if (this.selectedVehicle?.id) {
      this.isLoading = true;

      this.vehicleService.deleteVehicle(this.selectedVehicle.id).subscribe({
        next: () => {
          this.showDeleteConfirmation = false;
          this.selectedVehicle = null;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error deleting vehicle:', err);
          this.error = 'Failed to delete vehicle. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  addVehicle() {
    if (this.vehicle.licensePlate && this.vehicle.driver?.name && this.vehicle.driver?.licenseNumber) {
      this.isLoading = true;

      // For backward compatibility with the table display
      this.vehicle.driverName = this.vehicle.driver.name;

      this.vehicleService.addVehicle(this.vehicle).subscribe({
        next: () => {
          this.vehicle = this.getDefaultVehicle();
          this.showAddForm = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error adding vehicle:', err);
          this.error = 'Failed to add vehicle. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  clearForm() {
    this.vehicle = this.getDefaultVehicle();
    this.selectedDriverIndex = -1;
    this.useCustomDriver = false;
  }

  onDriverSelect() {
    if (this.selectedDriverIndex >= 0) {
      this.vehicle.driver = { ...this.availableDrivers[this.selectedDriverIndex] };
    }
  }

  toggleDriverMode() {
    this.useCustomDriver = !this.useCustomDriver;
    if (!this.useCustomDriver) {
      this.selectedDriverIndex = -1;
    } else {
      this.vehicle.driver = {
        name: '',
        age: 30,
        licenseNumber: '',
        collaboratorType: 'Driver'
      };
    }
  }




  formatCapacity(capacity: string | number): string {
    return typeof capacity === 'number' ? `${capacity}kg` : capacity;
  }

  getDriverName(vehicle: Vehicle): string {
    return vehicle.driver?.name || vehicle.driverName || 'N/A';
  }

  private getDefaultVehicle(): Vehicle {
    return {
      licensePlate: '',
      status: 'Active',
      routeType: 'Commercial',
      maxCapacity: '1000kg',
      lastMaintenance: new Date().toISOString().split('T')[0],
        latitude: "38°43'00.8\"N",
        longitude: "9°08'23.6\"W",
      driver: {
        name: '',
        age: 30,
        licenseNumber: '',
        collaboratorType: 'Driver'
      }
    };
  }

  refreshVehicles() {
    this.isLoading = true;
    this.error = '';

    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.error = 'Failed to load vehicles. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
