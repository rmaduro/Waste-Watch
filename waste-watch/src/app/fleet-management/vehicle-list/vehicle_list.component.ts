import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus, faMinus, faSearch, faFilter, faTruck, faIdCard, faUser,
  faCircle, faRoute, faWeight, faTools, faTrash, faExclamationTriangle,
  faSpinner, faMapMarkerAlt, faIdBadge
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

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    // Subscribe to live vehicle updates
    this.vehicleService.vehicles$.subscribe({
      next: (data) => (this.vehicles = data),
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.error = 'Failed to load vehicles. Please try again later.';
      }
    });

    this.availableDrivers = this.vehicleService.getAvailableDrivers();
  }

  /**
   * Shows or hides the vehicle form
   */
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.vehicle = this.getDefaultVehicle();
    }
  }

  /**
   * Filters vehicles based on selected criteria
   */
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

  /**
   * Selects a vehicle for details
   */
  selectVehicle(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }

  /**
   * Shows the delete confirmation dialog
   */
  showDeleteDialog() {
    if (this.selectedVehicle) {
      this.showDeleteConfirmation = true;
    }
  }

  /**
   * Cancels the delete action
   */
  cancelDelete() {
    this.showDeleteConfirmation = false;
  }

  /**
   * Confirms and deletes a vehicle
   */
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

  /**
   * Adds a new vehicle
   */
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

  /**
   * Clears the form and resets the vehicle object
   */
  clearForm() {
    this.vehicle = this.getDefaultVehicle();
    this.selectedDriverIndex = -1;
    this.useCustomDriver = false;
  }

  /**
   * Handles driver selection from the list
   */
  onDriverSelect() {
    if (this.selectedDriverIndex >= 0) {
      this.vehicle.driver = { ...this.availableDrivers[this.selectedDriverIndex] };
    }
  }

  /**
   * Toggles between custom driver entry and dropdown selection
   */
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

  /**
   * Formats capacity for display
   */
  formatCapacity(capacity: string | number): string {
    return typeof capacity === 'number' ? `${capacity}kg` : capacity;
  }

  /**
   * Gets the driver's name for display
   */
  getDriverName(vehicle: Vehicle): string {
    return vehicle.driver?.name || vehicle.driverName || 'N/A';
  }

  /**
   * Returns a default vehicle object
   */
  private getDefaultVehicle(): Vehicle {
    return {
      licensePlate: '',
      status: 'Active',
      routeType: 'Commercial',
      maxCapacity: '1000kg',
      lastMaintenance: new Date().toISOString().split('T')[0],
      location: { latitude: 38.7169, longitude: -9.1399 },
      driver: { name: '', age: 30, licenseNumber: '', collaboratorType: 'Driver' }
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
