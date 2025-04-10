import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  faSpinner,
  faMapMarkerAlt,
  faIdBadge,
  faEye,
  faMapMarked,
  faTimes,
  faHashtag,
  faTrashAlt,
  faWeightHanging,
  faCalendarAlt,
  faCheckCircle,
  faSave,
  faInfoCircle,
  faSignature,
  faTags,
} from '@fortawesome/free-solid-svg-icons';
import {
  VehicleService,
  Vehicle,
  Driver,
  Route,
} from '../../services/FleetService';
import { BinService, Bin } from '../../services/BinService';
import { GoogleMapsService } from '../../services/GoogleMapsService';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SideNavComponent,
    FontAwesomeModule,
    HttpClientModule,
  ],
  providers: [VehicleService, BinService],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css'],
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

  // Component state
  vehicles: Vehicle[] = [];
  availableDrivers: Driver[] = [];
  routes: Route[] = [];
  selectedDriverIndex: number = -1;
  isLoading = false;
  isLoadingRoute = false;
  error = '';

  // Filter and search
  selectedStatus = '';
  selectedRoute = '';
  selectedCapacity = '';
  searchQuery = '';

  // Vehicle selection
  selectedVehicle: Vehicle | null = null;
  viewedVehicle: Vehicle | null = null;

  // Form states
  showAddForm = false;
  showDeleteConfirmation = false;
  showRouteForm = false;
  showRouteView = false;
  useCustomDriver = false;

  // Form data
  vehicle: Vehicle = this.getDefaultVehicle();
  availableBins: Bin[] = [];
  binSearchQuery = '';
  routeVehicleId: number | null = null;

  // New route data
  newRoute: Route = {
    name: '',
    type: '',
    locations: [],
  };

  addresses: string[] = [];
  // Pagination
  currentPage: number = 1;
  pageSize: number = 7;

  constructor(
    private vehicleService: VehicleService,
    private binService: BinService,
    private router: Router,
    private googleMapsService: GoogleMapsService // inject service
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
    this.loadRoutes();
    this.availableDrivers = this.vehicleService.getAvailableDrivers();
  }

  loadVehicles() {
    this.isLoading = true;
    this.vehicleService.getVehiclesWithRoutes().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.error = 'Failed to load vehicles. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  loadRoutes() {
    this.vehicleService.getRoutes().subscribe({
      next: (data) => {
        this.routes = data;
      },
      error: (err) => {
        console.error('Error fetching routes:', err);
      },
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
      const maxCapacityString =
        typeof vehicle.maxCapacity === 'number'
          ? `${vehicle.maxCapacity}kg`
          : vehicle.maxCapacity;

      return (
        (this.selectedStatus === '' ||
          vehicle.status === this.selectedStatus) &&
        (this.selectedRoute === '' ||
          vehicle.routeType === this.selectedRoute) &&
        (this.selectedCapacity === '' ||
          maxCapacityString === this.selectedCapacity) &&
        (this.searchQuery === '' ||
          (vehicle.id && vehicle.id.toString().includes(this.searchQuery)) ||
          vehicle.licensePlate
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()))
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
        },
      });
    }
  }

  addVehicle() {
    if (
      this.vehicle.licensePlate &&
      this.vehicle.driver?.name &&
      this.vehicle.driver?.licenseNumber
    ) {
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
        },
      });
    }
  }

  // Route methods
  navigateToRoute(vehicleId: number) {
    if (!vehicleId) return;

    this.routeVehicleId = vehicleId;
    this.binService.getBins().subscribe((bins) => {
      this.availableBins = bins;
      this.showRouteForm = true;
      this.resetRouteForm();
    });
  }

  toggleBinSelection(bin: Bin) {
    const index =
      this.newRoute.locations?.findIndex(
        (loc) =>
          loc.latitude === bin.location.latitude &&
          loc.longitude === bin.location.longitude
      ) ?? -1;

    if (index >= 0) {
      this.newRoute.locations?.splice(index, 1);
    } else {
      if (!this.newRoute.locations) {
        this.newRoute.locations = [];
      }
      this.newRoute.locations.push({
        latitude: bin.location.latitude,
        longitude: bin.location.longitude,
      });
    }
  }

  isBinSelected(bin: Bin): boolean {
    return !!this.newRoute.locations?.some(
      (loc) =>
        loc.latitude === bin.location.latitude &&
        loc.longitude === bin.location.longitude
    );
  }

  async createRoute() {
    // Validation for required fields
    if (
      !this.routeVehicleId ||
      !this.newRoute.name ||
      !this.newRoute.type ||
      !this.newRoute.locations?.length
    ) {
      this.error = 'Please ensure all required fields are filled out.';
      return;
    }

    this.isLoading = true;

    try {
      // 1. Create the route
      const createdRoute = await this.vehicleService
        .createRoute(this.newRoute)
        .toPromise();

      if (!createdRoute || !createdRoute.id) {
        throw new Error('Route creation failed or returned invalid ID');
      }

      // 2. Update the vehicle with the new route ID
      await this.vehicleService
        .updateVehicleRoute(this.routeVehicleId, createdRoute.id)
        .toPromise();

      // 3. Update local state immediately (no need to wait for refresh)
      const vehicleIndex = this.vehicles.findIndex(
        (v) => v.id === this.routeVehicleId
      );
      if (vehicleIndex >= 0) {
        this.vehicles = [...this.vehicles];
        this.vehicles[vehicleIndex] = {
          ...this.vehicles[vehicleIndex],
          routeId: createdRoute.id,
          route: createdRoute,
        };
      }

      // 4. Close form and show success message
      this.showRouteForm = false;
      this.resetRouteForm();
      this.error = '';
    } catch (error) {
      console.error('Route creation failed:', error);
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to create route. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  handleRouteButtonClick(vehicle: Vehicle) {
    if (vehicle.route) {
      // Show route in modal
      this.viewedVehicle = vehicle;
      this.showRouteView = true;
    } else {
      // Open route creation form
      this.navigateToRoute(vehicle.id!);
    }
  }

  resetRouteForm() {
    this.newRoute = {
      name: '',
      type: '',
      locations: [],
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
      latitude: '38°43\'00.8"N',
      longitude: '9°08\'23.6"W',
      driver: {
        name: '',
        age: 30,
        licenseNumber: '',
        collaboratorType: 'Driver',
      },
    };
  }

  getAddressFromCoordinates(
    latitude: string,
    longitude: string
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.googleMapsService.loadApi();

        const lat = this.convertToDecimal(latitude);
        const lng = this.convertToDecimal(longitude);

        const geocoder = new google.maps.Geocoder();
        const latlng = { lat, lng };

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results![0]) {
            resolve(results![0].formatted_address);
          } else {
            console.error('Geocoding failed:', status);
            reject('Address not found');
          }
        });
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        reject('Failed to load Google Maps API');
      }
    });
  }

  async openRouteView(vehicle: Vehicle) {
    this.viewedVehicle = vehicle;
    this.showRouteView = true;

    if (vehicle.route?.locations?.length) {
      this.addresses = [];

      for (const location of vehicle.route.locations) {
        try {
          const address = await this.getAddressFromCoordinates(location.latitude, location.longitude);
          this.addresses.push(address);
        } catch {
          this.addresses.push('Address not found');
        }
      }
    }
  }

  convertToDecimal(coordinate: string): number {
    const regex = /(\d+)°(\d+)'(\d+(?:\.\d+)?)"?([NSEW])/;
    const parts = coordinate.match(regex);

    if (!parts) return parseFloat(coordinate); // fallback if already decimal

    const degrees = parseFloat(parts[1]);
    const minutes = parseFloat(parts[2]);
    const seconds = parseFloat(parts[3]);
    const direction = parts[4];

    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (direction === 'S' || direction === 'W') {
      decimal *= -1;
    }

    return decimal;
  }

  refreshVehicles() {
    this.isLoading = true;
    this.error = '';
    this.loadVehicles();
    this.loadRoutes();
  }

  onDriverSelect() {
    if (this.selectedDriverIndex >= 0) {
      this.vehicle.driver = {
        ...this.availableDrivers[this.selectedDriverIndex],
      };
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
        collaboratorType: 'Driver',
      };
    }
  }
}
