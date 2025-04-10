import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus, faMinus, faSearch, faFilter, faTruck, faIdCard, faUser, faCircle, faRoute, faWeight, faTools,
  faTrash, faExclamationTriangle, faSpinner, faMapMarkerAlt, faIdBadge, faEye, faMapMarked, faTimes,
  faHashtag, faTrashAlt, faWeightHanging, faCalendarAlt, faCheckCircle, faSave, faInfoCircle,
  faSignature, faTags, faMap, faListAlt, faDirections,faLeaf,faClock,faCloud
} from '@fortawesome/free-solid-svg-icons';
import { VehicleService, Vehicle, Driver, Route } from '../../services/FleetService';
import { BinService, Bin } from '../../services/BinService';
import { GoogleMapsService } from '../../services/GoogleMapsService';
import { environment } from '../../../environments/environtment';


@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent, FontAwesomeModule, HttpClientModule],
  providers: [VehicleService, BinService],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css'],
})
export class VehicleListComponent implements OnInit {
  // FontAwesome icons
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
  faMap = faMap;
  faListAlt = faListAlt;
  faDirections = faDirections;
  faLeaf = faLeaf;
  faClock = faClock;
  faCloud = faCloud;

  vehicles: Vehicle[] = [];
  availableDrivers: Driver[] = [];
  routes: Route[] = [];
  selectedDriverIndex: number = -1;
  isLoading = false;
  isLoadingRoute = false;
  error = '';
  selectedStatus = '';
  selectedRoute = '';
  selectedCapacity = '';
  searchQuery = '';
  selectedVehicle: Vehicle | null = null;
  viewedVehicle: Vehicle | null = null;
  showAddForm = false;
  showDeleteConfirmation = false;
  showRouteForm = false;
  showRouteView = false;
  useCustomDriver = false;
  vehicle: Vehicle = this.getDefaultVehicle();
  availableBins: Bin[] = [];
  binSearchQuery = '';
  routeVehicleId: number | null = null;
  newRoute: Route = { name: '', type: '', locations: [] };
  addresses: string[] = [];
  currentPage = 1;
  pageSize = 7;
  estimatedTime = "";
  isEcoFriendlyRoute = false;
  co2Emissions = 0.0;

  @ViewChild('routeMapContainer', { static: false }) routeMapContainer!: ElementRef;
  routeMap: any = null;
  routeMarkers: any[] = [];
  routePolyline: any = null;

  constructor(
    private vehicleService: VehicleService,
    private binService: BinService,
    private router: Router,
    private googleMapsService: GoogleMapsService
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

  ngAfterViewInit() {
    // Ensure the container exists before proceeding
    if (!this.routeMapContainer?.nativeElement) {
      console.error('Map container not found or not yet rendered.');
      return;
    }

    // Load Google Maps API asynchronously using the service
    this.googleMapsService.loadApi().then(() => {
      // Delay initialization to ensure the container is fully rendered
      setTimeout(() => {
        // Now that the API is loaded, check if the container exists again
        if (this.routeMapContainer?.nativeElement) {
          if (this.viewedVehicle && this.viewedVehicle.route?.locations?.length) {
            this.initRouteMap();
          }
        }
      }, 500); // Delay for 500ms (adjust as necessary)
    }).catch((error) => {
      console.error('Error loading Google Maps API:', error);
    });
  }



private initRouteMap(): void {
  if (!this.viewedVehicle?.route?.locations?.length || !this.routeMapContainer?.nativeElement) {
    console.error('Map container not found or not yet rendered.');
    return;
  }

  try {
    // Initialize the map
    this.routeMap = new google.maps.Map(this.routeMapContainer.nativeElement, {
      zoom: 12,
      mapTypeId: 'roadmap',
      streetViewControl: false,
    });

    // Initialize DirectionsService and DirectionsRenderer
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.routeMap,
      suppressMarkers: true, // Suppress the default markers
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      },
    });

    // Track eco-friendly preferences
    const avoidHighways = true; // Default to avoid highways for eco-friendly routes
    const avoidTolls = true; // Default to avoid tolls

    // Prepare the request for DirectionsService
    const origin = {
      lat: this.convertToDecimal(this.viewedVehicle.route.locations[0].latitude),
      lng: this.convertToDecimal(this.viewedVehicle.route.locations[0].longitude),
    };

    const destination = {
      lat: this.convertToDecimal(
        this.viewedVehicle.route.locations[this.viewedVehicle.route.locations.length - 1].latitude
      ),
      lng: this.convertToDecimal(
        this.viewedVehicle.route.locations[this.viewedVehicle.route.locations.length - 1].longitude
      ),
    };

    // Create waypoints (intermediate stops)
    const waypoints = this.viewedVehicle.route.locations.slice(1, -1).map((loc) => ({
      location: {
        lat: this.convertToDecimal(loc.latitude),
        lng: this.convertToDecimal(loc.longitude),
      },
      stopover: true,
    }));

    // Request directions with waypoints to compare with and without highways
    const requestWithHighways = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false, // Do not avoid highways for the first route (highway route)
      avoidTolls: avoidTolls,
      transitOptions: {
        departureTime: new Date(), // For real-time traffic estimates
      },
    };

    const requestWithoutHighways = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: true, // Avoid highways for the second route (eco-friendly route)
      avoidTolls: avoidTolls,
      transitOptions: {
        departureTime: new Date(),
      },
    };

    // Request the route with highways (standard, faster option)
    directionsService.route(requestWithHighways, (resultWithHighways, statusWithHighways) => {
      if (statusWithHighways === google.maps.DirectionsStatus.OK) {
        // Calculate the route time with highways
        const routeWithHighways = resultWithHighways!.routes[0];
        let totalRouteTimeWithHighways = this.calculateTotalRouteTime(routeWithHighways);
        let totalDistanceWithHighways = this.calculateTotalRouteDistance(routeWithHighways);

        // Calculate CO2 emissions for highway route
        let co2EmissionsWithHighways = this.calculateCO2Emissions(totalDistanceWithHighways, 'highway');

        // Request the route without highways (eco-friendly option)
        directionsService.route(requestWithoutHighways, (resultWithoutHighways, statusWithoutHighways) => {
          if (statusWithoutHighways === google.maps.DirectionsStatus.OK) {
            // Calculate the route time without highways
            const routeWithoutHighways = resultWithoutHighways!.routes[0];
            let totalRouteTimeWithoutHighways = this.calculateTotalRouteTime(routeWithoutHighways);
            let totalDistanceWithoutHighways = this.calculateTotalRouteDistance(routeWithoutHighways);

            // Calculate CO2 emissions for eco-friendly route
            let co2EmissionsWithoutHighways = this.calculateCO2Emissions(totalDistanceWithoutHighways, 'eco-friendly');

            // Calculate stop times (in seconds)
            const averageTimePerStop = 2; // Adjust the stop time as necessary
            const totalStopTime = this.viewedVehicle?.route?.locations?.length! * averageTimePerStop * 60; // Convert minutes to seconds

            // Add stop time to both routes
            totalRouteTimeWithHighways += totalStopTime;
            totalRouteTimeWithoutHighways += totalStopTime;

            // Now decide based on both time and CO2 emissions
            if (totalRouteTimeWithHighways < totalRouteTimeWithoutHighways && co2EmissionsWithHighways <= co2EmissionsWithoutHighways) {
              // If highway route is faster and has comparable or lower emissions, use it
              this.estimatedTime = this.formatDuration({
                text: this.formatTime(totalRouteTimeWithHighways), // Convert to readable time format
                value: totalRouteTimeWithHighways,
              });
              this.isEcoFriendlyRoute = false; // Mark as not eco-friendly, but faster
              directionsRenderer.setDirections(resultWithHighways);

              // Set the CO2 emissions for the selected route
              this.co2Emissions = co2EmissionsWithHighways; // Set CO2 emissions to highway route
            } else {
              // If eco-friendly route is better or close enough in emissions, use it
              this.estimatedTime = this.formatDuration({
                text: this.formatTime(totalRouteTimeWithoutHighways), // Convert to readable time format
                value: totalRouteTimeWithoutHighways,
              });
              this.isEcoFriendlyRoute = true; // Mark as eco-friendly
              directionsRenderer.setDirections(resultWithoutHighways);

              // Set the CO2 emissions for the selected route
              this.co2Emissions = co2EmissionsWithoutHighways; // Set CO2 emissions to eco-friendly route
            }

            // Add markers to the route
            this.addMarkersToRoute();
          } else {
            console.error('Directions request failed due to ' + statusWithoutHighways);
          }
        });
      } else {
        console.error('Directions request failed due to ' + statusWithHighways);
      }
    });

  } catch (error) {
    console.error('Error initializing route map:', error);
  }
}


private calculateCO2Emissions(distance: number, routeType: 'highway' | 'eco-friendly'): number {
  const emissionFactorHighway = 120; // CO2 emissions in grams per kilometer for highway (example value: 120 g/km)
  const emissionFactorEcoFriendly = 150; // CO2 emissions in grams per kilometer for eco-friendly (example value: 150 g/km)

  let emissionFactor = routeType === 'highway' ? emissionFactorHighway : emissionFactorEcoFriendly;

  // Calculate emissions based on distance and emission factor in grams
  return distance * emissionFactor; // in grams of CO2
}


  private calculateTotalRouteDistance(route: google.maps.DirectionsRoute): number {
    let totalDistance = 0;
    const legs = route.legs;

    // Loop through each leg (segment between two stops)
    for (let i = 0; i < legs.length; i++) {
      totalDistance += legs[i].distance!.value; // distance in meters
    }

    return totalDistance / 1000; // Convert to kilometers
  }

  private calculateTotalRouteTime(route: google.maps.DirectionsRoute): number {
    let totalRouteTime = 0;
    const legs = route.legs;

    // Loop through each leg (segment between two stops)
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];

      // Calculate time for this leg (in seconds)
      const legTime = leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration!.value;
      totalRouteTime += legTime;
    }

    return totalRouteTime;
  }

  // Helper method to format time in seconds into hours, minutes, and seconds
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  private formatDuration(duration: google.maps.Duration): string {
    // Format the duration into a user-friendly string (e.g., "10 min")
    return duration.text;
  }


  private addMarkersToRoute(): void {
    const path = this.viewedVehicle?.route!.locations!.map((loc) => ({
      lat: this.convertToDecimal(loc.latitude),
      lng: this.convertToDecimal(loc.longitude),
    }));

    // Add markers for each stop
    this.routeMarkers = path!.map((point, index) => {
      const marker = new google.maps.Marker({
        position: point,
        map: this.routeMap,
        title: `Stop ${index + 1}`,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
        },
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      // Add info window for each marker
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;">
          <strong>Stop ${index + 1}</strong><br>
          ${this.addresses[index] || 'Address not available'}<br>
          Coordinates: ${point.lat}, ${point.lng}
        </div>`,
      });

      marker.addListener('click', () => {
        infoWindow.open(this.routeMap, marker);
      });

      return marker;
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

  get paginatedVehicles() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredVehicles.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVehicles.length / this.pageSize);
  }

  get filteredVehicles() {
    return this.vehicles.filter((vehicle) => {
      const maxCapacityString = typeof vehicle.maxCapacity === 'number' ? `${vehicle.maxCapacity}kg` : vehicle.maxCapacity;
      return (
        (this.selectedStatus === '' || vehicle.status === this.selectedStatus) &&
        (this.selectedRoute === '' || vehicle.routeType === this.selectedRoute) &&
        (this.selectedCapacity === '' || maxCapacityString === this.selectedCapacity) &&
        (this.searchQuery === '' ||
          (vehicle.id && vehicle.id.toString().includes(this.searchQuery)) ||
          vehicle.licensePlate.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    });
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

  onFilterChange() {
    this.currentPage = 1;
  }

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
        },
      });
    }
  }

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
    const index = this.newRoute.locations?.findIndex(
      (loc) => loc.latitude === bin.location.latitude && loc.longitude === bin.location.longitude
    ) ?? -1;

    if (index >= 0) {
      this.newRoute.locations?.splice(index, 1);
    } else {
      this.newRoute.locations ??= [];
      this.newRoute.locations.push({
        latitude: bin.location.latitude,
        longitude: bin.location.longitude,
      });
    }
  }

  isBinSelected(bin: Bin): boolean {
    return !!this.newRoute.locations?.some(
      (loc) => loc.latitude === bin.location.latitude && loc.longitude === bin.location.longitude
    );
  }

  async createRoute() {
    if (!this.routeVehicleId || !this.newRoute.name || !this.newRoute.type || !this.newRoute.locations?.length) {
      this.error = 'Please ensure all required fields are filled out.';
      return;
    }

    this.isLoading = true;
    try {
      const createdRoute = await this.vehicleService.createRoute(this.newRoute).toPromise();
      if (!createdRoute?.id) throw new Error('Route creation failed or returned invalid ID');
      await this.vehicleService.updateVehicleRoute(this.routeVehicleId, createdRoute.id).toPromise();

      const vehicleIndex = this.vehicles.findIndex((v) => v.id === this.routeVehicleId);
      if (vehicleIndex >= 0) {
        this.vehicles = [...this.vehicles];
        this.vehicles[vehicleIndex] = { ...this.vehicles[vehicleIndex], routeId: createdRoute.id, route: createdRoute };
      }

      this.showRouteForm = false;
      this.resetRouteForm();
      this.error = '';
    } catch (error) {
      console.error('Route creation failed:', error);
      this.error = error instanceof Error ? error.message : 'Failed to create route. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async openRouteView(vehicle: Vehicle) {
    this.viewedVehicle = vehicle;
    this.showRouteView = true;

    // Clear any existing map
    this.clearRouteMap();

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

      setTimeout(() => {
        if (this.routeMapContainer && this.routeMapContainer.nativeElement) {
          this.initRouteMap();
        } else {
          console.error('Map container not found or not yet rendered.');
        }
      }, 100);

    }
  }

  private clearRouteMap(): void {
    if (this.routeMarkers) {
      this.routeMarkers.forEach(marker => marker.setMap(null));
      this.routeMarkers = [];
    }
    if (this.routePolyline) {
      this.routePolyline.setMap(null);
      this.routePolyline = null;
    }
    this.routeMap = null;
  }

  getAddressFromCoordinates(latitude: string, longitude: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.googleMapsService.loadApi();
        const lat = this.convertToDecimal(latitude);
        const lng = this.convertToDecimal(longitude);
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0].formatted_address);
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

  convertToDecimal(coordinate: string): number {
    const regex = /(\d+)°(\d+)'(\d+(?:\.\d+)?)"?([NSEW])/;
    const parts = coordinate.match(regex);
    if (!parts) return parseFloat(coordinate);
    const degrees = parseFloat(parts[1]);
    const minutes = parseFloat(parts[2]);
    const seconds = parseFloat(parts[3]);
    const direction = parts[4];
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') decimal *= -1;
    return decimal;
  }

  handleRouteButtonClick(vehicle: Vehicle) {
    if (vehicle.route) {
      this.openRouteView(vehicle);
    } else {
      this.navigateToRoute(vehicle.id!);
    }
  }

  resetRouteForm() {
    this.newRoute = { name: '', type: '', locations: [] };
    this.binSearchQuery = '';
  }

  formatCapacity(capacity: string | number): string {
    return typeof capacity === 'number' ? `${capacity}kg` : capacity;
  }

  getDriverName(vehicle: Vehicle): string {
    return vehicle.driver?.name || vehicle.driverName || 'N/A';
  }

  refreshVehicles() {
    this.isLoading = true;
    this.error = '';
    this.loadVehicles();
    this.loadRoutes();
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
      this.vehicle.driver = { name: '', age: 30, licenseNumber: '', collaboratorType: 'Driver' };
    }
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
}
