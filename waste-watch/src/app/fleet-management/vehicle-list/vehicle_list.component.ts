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
  faSpinner, faMapMarkerAlt, faIdBadge, faEye, faMapMarked, faTimes,
  faHashtag, faTrashAlt, faWeightHanging, faCalendarAlt, faCheckCircle,
  faSave, faInfoCircle, faSignature, faTags
} from '@fortawesome/free-solid-svg-icons';
import { VehicleService, Vehicle, Driver, Route, RouteLocation } from '../../services/FleetService';
import { BinService, Bin } from '../../services/BinService';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent, FontAwesomeModule, HttpClientModule],
  providers: [VehicleService, BinService],
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
  faTimes = faTimes;
  faHashtag = faHashtag;
  faTrashAlt = faTrashAlt;
  faWeightHanging = faWeightHanging;
  faCalendarAlt = faCalendarAlt;
  faCheckCircle = faCheckCircle;
  faSave = faSave;
  faInfoCircle = faInfoCircle;
  faSignature = faSignature;
  faTags = faTags;

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
  showRouteForm = false;
  useCustomDriver = false;

  vehicle: Vehicle = this.getDefaultVehicle();
  availableBins: Bin[] = [];
  binSearchQuery = '';
  routeVehicleId: number | null = null;

  newRoute: Route = {
    id: 0,
    name: '',
    type: '',
    locations: []
  };

  // Pagination
  currentPage: number = 1;
  pageSize: number = 7;

  constructor(
    private vehicleService: VehicleService,
    private binService: BinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
    this.availableDrivers = this.vehicleService.getAvailableDrivers();
  }

  loadVehicles() {
    this.isLoading = true;
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

  // Pagination methods
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

  get totalPages(): number {
    return Math.ceil(this.filteredVehicles.length / this.pageSize);
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

  onFilterChange() {
    this.currentPage = 1;
  }

  // Vehicle methods
  selectVehicle(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.vehicle = this.getDefaultVehicle();
    }
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
          this.loadVehicles();
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
      this.vehicle.driverName = this.vehicle.driver.name;

      this.vehicleService.addVehicle(this.vehicle).subscribe({
        next: () => {
          this.vehicle = this.getDefaultVehicle();
          this.showAddForm = false;
          this.isLoading = false;
          this.loadVehicles();
        },
        error: (err) => {
          console.error('Error adding vehicle:', err);
          this.error = 'Failed to add vehicle. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  // Route methods
  navigateToRoute(vehicleId: number) {
    if (!vehicleId) return;

    this.routeVehicleId = vehicleId;
    this.binService.getBins().subscribe(bins => {
      this.availableBins = bins;
      this.showRouteForm = true;
      this.resetRouteForm();
    });
  }

  toggleBinSelection(bin: Bin) {
    const index = this.newRoute.locations.findIndex(loc =>
      loc.latitude === bin.location.latitude &&
      loc.longitude === bin.location.longitude
    );

    if (index >= 0) {
      this.newRoute.locations.splice(index, 1);
    } else {
      this.newRoute.locations.push({
        latitude: bin.location.latitude,
        longitude: bin.location.longitude
      });
    }
  }

  isBinSelected(bin: Bin): boolean {
    return this.newRoute.locations.some(loc =>
      loc.latitude === bin.location.latitude &&
      loc.longitude === bin.location.longitude
    );
  }

  getBinByLocation(latitude: string, longitude: string): Bin | undefined {
    return this.availableBins.find(bin =>
      bin.location.latitude === latitude &&
      bin.location.longitude === longitude
    );
  }

  createRoute() {
    if (this.routeVehicleId && this.newRoute.name && this.newRoute.type && this.newRoute.locations.length > 0) {
      this.isLoading = true;

      const vehicle = this.vehicles.find(v => v.id === this.routeVehicleId);
      if (vehicle) {
        vehicle.route = {
          ...this.newRoute,
          id: 0 // Will be assigned by backend
        };

        this.vehicleService.updateVehicleRoute(this.routeVehicleId, vehicle.route).subscribe({
          next: (updatedVehicle) => {
            this.isLoading = false;
            this.showRouteForm = false;
            this.resetRouteForm();
            this.loadVehicles();
          },
          error: (error) => {
            this.isLoading = false;
            this.error = 'Failed to create route. Please try again.';
          }
        });
      }
    }
  }

  resetRouteForm() {
    this.newRoute = {
      id: 0,
      name: '',
      type: '',
      locations: []
    };
    this.binSearchQuery = '';
  }

  // Helper methods
  getBinTypeName(type: number): string {
    const types = ['General', 'Recycling', 'Hazardous', 'Organic'];
    return types[type] || 'Unknown';
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
    this.loadVehicles();
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
}
