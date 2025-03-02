import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
  faTools,
  faTrash,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { VehicleService, Vehicle } from './vehicle-list-service/vehicle-list-service'

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

  vehicles: Vehicle[] = [];
  isLoading = false;
  error = '';

  selectedStatus = '';
  selectedRoute = '';
  selectedCapacity = '';
  searchQuery = '';
  selectedVehicle: Vehicle | null = null;
  showAddForm = false;
  showDeleteConfirmation = false;

  vehicle: Vehicle = {
    licensePlate: '',
    driverName: '',
    status: 'Active',
    routeType: 'Commercial',
    maxCapacity: '1000kg',
    lastMaintenance: new Date().toISOString().split('T')[0]
  };

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
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

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      // Reset form when opening
      this.clearForm();
    }
  }

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
    if (this.selectedVehicle && this.selectedVehicle.id) {
      this.isLoading = true;

      this.vehicleService.deleteVehicle(this.selectedVehicle.id).subscribe({
        next: () => {
          this.loadVehicles();
          this.selectedVehicle = null;
          this.showDeleteConfirmation = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error deleting vehicle:', err);
          this.error = 'Failed to delete vehicle. Please try again later.';
          this.isLoading = false;
          this.showDeleteConfirmation = false;
        }
      });
    }
  }

  addVehicle() {
    if (this.vehicle.licensePlate && this.vehicle.driverName) {
      this.isLoading = true;

      this.vehicleService.addVehicle(this.vehicle).subscribe({
        next: () => {
          this.loadVehicles();
          this.clearForm();
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
    this.vehicle = {
      licensePlate: '',
      driverName: '',
      status: 'Active',
      routeType: 'Commercial',
      maxCapacity: '1000kg',
      lastMaintenance: new Date().toISOString().split('T')[0]
    };
  }

  // Helper method to format capacity for display
  formatCapacity(capacity: string | number): string {
    if (typeof capacity === 'number') {
      return `${capacity}kg`;
    }
    return capacity;
  }
}
