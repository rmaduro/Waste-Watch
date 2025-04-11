/**
 * @class VehicleListComponent
 * @brief Angular component for managing and displaying a list of vehicles.
 *
 * This component provides functionality to view, add, delete, and manage routes for vehicles.
 * It includes features like filtering, pagination, and interactive route visualization using Google Maps.
 */
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
  faMap,
  faListAlt,
  faDirections,
  faLeaf,
  faClock,
  faCloud,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import {
  VehicleService,
  Vehicle,
  Driver,
  Route,
} from '../../services/FleetService';
import { BinService, Bin } from '../../services/BinService';
import { GoogleMapsService } from '../../services/GoogleMapsService';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SideNavComponent,
    FontAwesomeModule,
    HttpClientModule,
    TranslateModule
  ],
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
  faFilePdf = faFilePdf;

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
  estimatedTime = '';
  isEcoFriendlyRoute = false;
  co2Emissions = 0.0;

  @ViewChild('routeMapContainer', { static: false })
  routeMapContainer!: ElementRef;
  routeMap: any = null;
  routeMarkers: any[] = [];
  routePolyline: any = null;

  currentLanguage = 'en';
  currentLanguageFlag = 'gb';
  currentLanguageName = 'English';
  languageOptions = [
    { code: 'en', flag: 'gb', name: 'English' },
    { code: 'es', flag: 'es', name: 'Español' },
    { code: 'de', flag: 'de', name: 'Deutsch' },
    { code: 'pt', flag: 'pt', name: 'Português' },
    { code: 'fr', flag: 'fr', name: 'Français' },
  ];

  /**
   * @brief Constructor for VehicleListComponent
   * @param vehicleService Service for vehicle-related operations
   * @param binService Service for bin-related operations
   * @param router Angular router service
   * @param googleMapsService Service for Google Maps integration
   */
  constructor(
    private vehicleService: VehicleService,
    private binService: BinService,
    private router: Router,
    private googleMapsService: GoogleMapsService, private translate: TranslateService) {
      const savedLang = localStorage.getItem('userLanguage') || 'en';
    this.changeLanguage(savedLang);
    }

  /**
   * @brief Angular lifecycle hook - initializes component
   */
  ngOnInit(): void {
    this.loadVehicles();
    this.loadRoutes();
    this.availableDrivers = this.vehicleService.getAvailableDrivers();
  }

  changeLanguage(langCode: string) {
    const selectedLang = this.languageOptions.find((l) => l.code === langCode);
    if (selectedLang) {
      this.currentLanguage = selectedLang.code;
      this.currentLanguageFlag = selectedLang.flag;
      this.currentLanguageName = selectedLang.name;
      this.translate.use(langCode);
      // Optional: Save to localStorage
      localStorage.setItem('userLanguage', langCode);
    }
  }

  /**
   * @brief Loads vehicles from the service
   */
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

  /**
   * @brief Angular lifecycle hook - initializes after view is ready
   */
  ngAfterViewInit() {
    // Ensure the container exists before proceeding
    if (!this.routeMapContainer?.nativeElement) {
      console.error('Map container not found or not yet rendered.');
      return;
    }

    // Load Google Maps API asynchronously using the service
    this.googleMapsService
      .loadApi()
      .then(() => {
        // Delay initialization to ensure the container is fully rendered
        setTimeout(() => {
          // Now that the API is loaded, check if the container exists again
          if (this.routeMapContainer?.nativeElement) {
            if (
              this.viewedVehicle &&
              this.viewedVehicle.route?.locations?.length
            ) {
              this.initRouteMap();
            }
          }
        }, 500); // Delay for 500ms (adjust as necessary)
      })
      .catch((error) => {
        console.error('Error loading Google Maps API:', error);
      });
  }

  /**
   * @brief Initializes the route map with the viewed vehicle's route
   */
  private initRouteMap(): void {
    if (
      !this.viewedVehicle?.route?.locations?.length ||
      !this.routeMapContainer?.nativeElement
    ) {
      console.error('Map container not found or not yet rendered.');
      return;
    }

    try {
      // Initialize the map
      this.routeMap = new google.maps.Map(
        this.routeMapContainer.nativeElement,
        {
          zoom: 12,
          mapTypeId: 'roadmap',
          streetViewControl: false,
        }
      );

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
        lat: this.convertToDecimal(
          this.viewedVehicle.route.locations[0].latitude
        ),
        lng: this.convertToDecimal(
          this.viewedVehicle.route.locations[0].longitude
        ),
      };

      const destination = {
        lat: this.convertToDecimal(
          this.viewedVehicle.route.locations[
            this.viewedVehicle.route.locations.length - 1
          ].latitude
        ),
        lng: this.convertToDecimal(
          this.viewedVehicle.route.locations[
            this.viewedVehicle.route.locations.length - 1
          ].longitude
        ),
      };

      // Create waypoints (intermediate stops)
      const waypoints = this.viewedVehicle.route.locations
        .slice(1, -1)
        .map((loc) => ({
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
      directionsService.route(
        requestWithHighways,
        (resultWithHighways, statusWithHighways) => {
          if (statusWithHighways === google.maps.DirectionsStatus.OK) {
            // Calculate the route time with highways
            const routeWithHighways = resultWithHighways!.routes[0];
            let totalRouteTimeWithHighways =
              this.calculateTotalRouteTime(routeWithHighways);
            let totalDistanceWithHighways =
              this.calculateTotalRouteDistance(routeWithHighways);

            // Calculate CO2 emissions for highway route
            let co2EmissionsWithHighways = this.calculateCO2Emissions(
              totalDistanceWithHighways,
              'highway'
            );

            // Request the route without highways (eco-friendly option)
            directionsService.route(
              requestWithoutHighways,
              (resultWithoutHighways, statusWithoutHighways) => {
                if (statusWithoutHighways === google.maps.DirectionsStatus.OK) {
                  // Calculate the route time without highways
                  const routeWithoutHighways = resultWithoutHighways!.routes[0];
                  let totalRouteTimeWithoutHighways =
                    this.calculateTotalRouteTime(routeWithoutHighways);
                  let totalDistanceWithoutHighways =
                    this.calculateTotalRouteDistance(routeWithoutHighways);

                  // Calculate CO2 emissions for eco-friendly route
                  let co2EmissionsWithoutHighways = this.calculateCO2Emissions(
                    totalDistanceWithoutHighways,
                    'eco-friendly'
                  );

                  // Calculate stop times (in seconds)
                  const averageTimePerStop = 2; // Adjust the stop time as necessary
                  const totalStopTime =
                    this.viewedVehicle?.route?.locations?.length! *
                    averageTimePerStop *
                    60; // Convert minutes to seconds

                  // Add stop time to both routes
                  totalRouteTimeWithHighways += totalStopTime;
                  totalRouteTimeWithoutHighways += totalStopTime;

                  // Now decide based on both time and CO2 emissions
                  if (
                    totalRouteTimeWithHighways <
                      totalRouteTimeWithoutHighways &&
                    co2EmissionsWithHighways <= co2EmissionsWithoutHighways
                  ) {
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
                  console.error(
                    'Directions request failed due to ' + statusWithoutHighways
                  );
                }
              }
            );
          } else {
            console.error(
              'Directions request failed due to ' + statusWithHighways
            );
          }
        }
      );
    } catch (error) {
      console.error('Error initializing route map:', error);
    }
  }

  /**
   * @brief Calculates CO2 emissions for a route
   * @param distance Route distance in kilometers
   * @param routeType Type of route ('highway' or 'eco-friendly')
   * @returns CO2 emissions in grams
   */
  private calculateCO2Emissions(
    distance: number,
    routeType: 'highway' | 'eco-friendly'
  ): number {
    const emissionFactorHighway = 120; // CO2 emissions in grams per kilometer for highway (example value: 120 g/km)
    const emissionFactorEcoFriendly = 150; // CO2 emissions in grams per kilometer for eco-friendly (example value: 150 g/km)

    let emissionFactor =
      routeType === 'highway'
        ? emissionFactorHighway
        : emissionFactorEcoFriendly;

    // Calculate emissions based on distance and emission factor in grams
    return distance * emissionFactor; // in grams of CO2
  }

  /**
   * @brief Calculates total distance of a route
   * @param route Google Maps route object
   * @returns Total distance in kilometers
   */
  private calculateTotalRouteDistance(
    route: google.maps.DirectionsRoute
  ): number {
    let totalDistance = 0;
    const legs = route.legs;

    // Loop through each leg (segment between two stops)
    for (let i = 0; i < legs.length; i++) {
      totalDistance += legs[i].distance!.value; // distance in meters
    }

    return totalDistance / 1000; // Convert to kilometers
  }

  /**
   * @brief Calculates total time for a route
   * @param route Google Maps route object
   * @returns Total time in seconds
   */
  private calculateTotalRouteTime(route: google.maps.DirectionsRoute): number {
    let totalRouteTime = 0;
    const legs = route.legs;

    // Loop through each leg (segment between two stops)
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];

      // Calculate time for this leg (in seconds)
      const legTime = leg.duration_in_traffic
        ? leg.duration_in_traffic.value
        : leg.duration!.value;
      totalRouteTime += legTime;
    }

    return totalRouteTime;
  }

  /**
   * @brief Formats time in seconds to human-readable string
   * @param seconds Time in seconds
   * @returns Formatted time string
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min${
      minutes !== 1 ? 's' : ''
    }`;
  }

  /**
   * @brief Formats duration object to string
   * @param duration Google Maps duration object
   * @returns Formatted duration string
   */
  private formatDuration(duration: google.maps.Duration): string {
    return duration.text;
  }

  /**
   * @brief Adds markers to the route map
   */
  private addMarkersToRoute(): void {
    const path = this.viewedVehicle?.route?.locations?.map((loc) => ({
      lat: this.convertToDecimal(loc.latitude),
      lng: this.convertToDecimal(loc.longitude),
    }));

    if (!path) return;

    this.routeMarkers = path.map((point, index) => {
      const marker = new google.maps.Marker({
        position: point,
        map: this.routeMap,
        title: `Stop ${index + 1}`,
        label: {
          text: `${index + 1}`,
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: '12px',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#4F46E5', // Indigo-600
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 10,
        },
        optimized: false,
      });

      const content = `
            <div class="info-window-container" style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 320px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: #4F46E5; padding: 16px; border-bottom: 1px solid #4338CA;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <h3 style="margin: 0; color: white; font-size: 18px; font-weight: 600;">
                            Stop #${index + 1}
                        </h3>
                    </div>
                    <p style="margin: 0; color: #E0E7FF; font-size: 14px;">
                        ${this.getStopType(index, path.length)}
                    </p>
                </div>

                <!-- Info Section -->
                <div style="padding: 16px;">
                    <!-- Address -->
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
                            Location
                        </h4>
                        <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB;">
                            <div>
                                <span style="display: block; color: #111827; font-weight: 500; font-size: 14px;">
                                    ${
                                      this.addresses[index] ||
                                      'Address not specified'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Coordinates -->
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
                            Coordinates
                        </h4>
                        <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #6B7280; font-size: 14px;">Latitude</span>
                                <span style="color: #111827; font-weight: 500; font-size: 14px;">${point.lat.toFixed(
                                  6
                                )}</span>
                            </div>
                            <div style="height: 1px; background: #E5E7EB; margin: 8px 0;"></div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #6B7280; font-size: 14px;">Longitude</span>
                                <span style="color: #111827; font-weight: 500; font-size: 14px;">${point.lng.toFixed(
                                  6
                                )}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sequence -->
                    <div>
                        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
                            Route Information
                        </h4>
                        <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #6B7280; font-size: 14px;">Stop Sequence</span>
                                <span style="color: #111827; font-weight: 500; font-size: 14px;">
                                    ${index + 1} of ${path.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

      const infoWindow = new google.maps.InfoWindow({
        content: content,
        maxWidth: 320,
      });

      marker.addListener('click', () => {
        // Close all other info windows first
        this.routeMarkers.forEach((m) => {
          const iw = m.get('infoWindow');
          if (iw) iw.close();
        });

        infoWindow.open(this.routeMap, marker);
        marker.set('infoWindow', infoWindow);
      });

      return marker;
    });
  }

  /**
   * @brief Gets stop type description
   * @param index Stop index
   * @param total Total number of stops
   * @returns Stop type description
   */
  private getStopType(index: number, total: number): string {
    if (index === 0) return 'Starting location for this route';
    if (index === total - 1) return 'Final destination for this route';
    return `Intermediate stop #${index}`;
  }

  /**
   * @brief Loads routes from the service
   */
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

  /**
   * @brief Gets paginated vehicles for current page
   */
  get paginatedVehicles() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredVehicles.slice(start, start + this.pageSize);
  }

  /**
   * @brief Calculates total number of pages
   */
  get totalPages(): number {
    return Math.ceil(this.filteredVehicles.length / this.pageSize);
  }

  /**
   * @brief Filters vehicles based on current filters
   */
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

  /**
   * @brief Navigates to next page
   */
  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredVehicles.length) {
      this.currentPage++;
    }
  }

  /**
   * @brief Navigates to previous page
   */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * @brief Handles filter changes
   */
  onFilterChange() {
    this.currentPage = 1;
  }

  /**
   * @brief Selects a vehicle
   * @param vehicle Vehicle to select
   */
  selectVehicle(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }

  /**
   * @brief Toggles add vehicle form visibility
   */
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.vehicle = this.getDefaultVehicle();
    }
  }

  /**
   * @brief Shows delete confirmation dialog
   */
  showDeleteDialog() {
    if (this.selectedVehicle) {
      this.showDeleteConfirmation = true;
    }
  }

  /**
   * @brief Cancels delete operation
   */
  cancelDelete() {
    this.showDeleteConfirmation = false;
  }

  /**
   * @brief Confirms and executes vehicle deletion
   */
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

  /**
   * @brief Adds a new vehicle
   */
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

  /**
   * @brief Navigates to route creation for a vehicle
   * @param vehicleId ID of vehicle to create route for
   */
  navigateToRoute(vehicleId: number) {
    if (!vehicleId) return;
    this.routeVehicleId = vehicleId;
    this.binService.getBins().subscribe((bins) => {
      this.availableBins = bins;
      this.showRouteForm = true;
      this.resetRouteForm();
    });
  }

  /**
   * @brief Toggles bin selection for route creation
   * @param bin Bin to toggle selection for
   */
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
      this.newRoute.locations ??= [];
      this.newRoute.locations.push({
        latitude: bin.location.latitude,
        longitude: bin.location.longitude,
      });
    }
  }

  /**
   * @brief Checks if bin is selected for route
   * @param bin Bin to check
   * @returns True if bin is selected
   */
  isBinSelected(bin: Bin): boolean {
    return !!this.newRoute.locations?.some(
      (loc) =>
        loc.latitude === bin.location.latitude &&
        loc.longitude === bin.location.longitude
    );
  }

  /**
   * @brief Creates a new route
   */
  async createRoute() {
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
      const createdRoute = await this.vehicleService
        .createRoute(this.newRoute)
        .toPromise();
      if (!createdRoute?.id)
        throw new Error('Route creation failed or returned invalid ID');
      await this.vehicleService
        .updateVehicleRoute(this.routeVehicleId, createdRoute.id)
        .toPromise();

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

  /**
   * @brief Opens route view for a vehicle
   * @param vehicle Vehicle to view route for
   */
  async openRouteView(vehicle: Vehicle) {
    this.viewedVehicle = vehicle;
    this.showRouteView = true;

    // Clear any existing map
    this.clearRouteMap();

    if (vehicle.route?.locations?.length) {
      this.addresses = [];

      for (const location of vehicle.route.locations) {
        try {
          const address = await this.getAddressFromCoordinates(
            location.latitude,
            location.longitude
          );
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

  /**
   * @brief Clears the route map
   */
  private clearRouteMap(): void {
    if (this.routeMarkers) {
      this.routeMarkers.forEach((marker) => marker.setMap(null));
      this.routeMarkers = [];
    }
    if (this.routePolyline) {
      this.routePolyline.setMap(null);
      this.routePolyline = null;
    }
    this.routeMap = null;
  }

  /**
   * @brief Gets address from coordinates
   * @param latitude Latitude coordinate
   * @param longitude Longitude coordinate
   * @returns Promise resolving to address string
   */
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

  /**
   * @brief Converts coordinate string to decimal
   * @param coordinate Coordinate string
   * @returns Decimal coordinate value
   */
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

  /**
   * @brief Handles route button click
   * @param vehicle Vehicle to handle action for
   */
  handleRouteButtonClick(vehicle: Vehicle) {
    if (vehicle.route) {
      this.openRouteView(vehicle);
    } else {
      this.navigateToRoute(vehicle.id!);
    }
  }

  /**
   * @brief Resets route form
   */
  resetRouteForm() {
    this.newRoute = { name: '', type: '', locations: [] };
    this.binSearchQuery = '';
  }

  /**
   * @brief Formats capacity value
   * @param capacity Capacity value
   * @returns Formatted capacity string
   */
  formatCapacity(capacity: string | number): string {
    return typeof capacity === 'number' ? `${capacity}kg` : capacity;
  }

  /**
   * @brief Gets driver name for vehicle
   * @param vehicle Vehicle to get driver for
   * @returns Driver name or 'N/A'
   */
  getDriverName(vehicle: Vehicle): string {
    return vehicle.driver?.name || vehicle.driverName || 'N/A';
  }

  /**
   * @brief Refreshes vehicle list
   */
  refreshVehicles() {
    this.isLoading = true;
    this.error = '';
    this.loadVehicles();
    this.loadRoutes();
  }

  /**
   * @brief Handles driver selection
   */
  onDriverSelect() {
    if (this.selectedDriverIndex >= 0) {
      this.vehicle.driver = {
        ...this.availableDrivers[this.selectedDriverIndex],
      };
    }
  }

  /**
   * @brief Toggles between custom driver and available drivers
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
        collaboratorType: 'Driver',
      };
    }
  }

  /**
   * @brief Gets default vehicle template
   * @returns Default vehicle object
   */
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

  async generateRouteReport() {
    this.isLoading = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      const addPageHeader = () => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 0, pageWidth, 15, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('WasteWatch Route Report', margin, 10);
        const companyLogo = 'assets/images/logo2.png';
        pdf.addImage(companyLogo, 'PNG', pageWidth - 30, 3, 15, 15);
      };

      const addPageFooter = (pageNum: number, totalPages: number) => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 282, pageWidth, 15, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${pageNum} of ${totalPages}`, margin, 290);
        pdf.text(
          `Generated: ${new Date().toLocaleString()}`,
          pageWidth - margin,
          290,
          { align: 'right' }
        );
      };

      const addSectionHeader = (title: string, y: number = 30) => {
        pdf.setFontSize(16);
        pdf.setTextColor(51, 122, 183);
        pdf.text(title, margin, y);
      };

      const addParagraph = (text: string, startY: number) => {
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, startY);
        return startY + lines.length * 5;
      };

      const addMetricTable = (
        startY: number,
        data: { label: string; value: string; highlight?: boolean }[]
      ) => {
        const rowHeight = 10;
        const colWidth = contentWidth / 2;

        pdf.setFillColor(51, 122, 183);
        pdf.rect(margin, startY, contentWidth, rowHeight, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text('METRIC', margin + 5, startY + 7);
        pdf.text('VALUE', margin + colWidth + 5, startY + 7);

        data.forEach((row, index) => {
          const y = startY + rowHeight * (index + 1);
          pdf.setFillColor(
            row.highlight ? 230 : index % 2 === 0 ? 245 : 255,
            245,
            245
          );
          pdf.rect(margin, y, contentWidth, rowHeight, 'F');
          pdf.setTextColor(80, 80, 80);
          pdf.setFont('helvetica', row.highlight ? 'bold' : 'normal');
          pdf.text(row.label, margin + 5, y + 7);
          pdf.text(row.value, margin + colWidth + 5, y + 7);
          pdf.setFont('helvetica', 'normal');
        });

        return startY + rowHeight * (data.length + 1);
      };

      const addStopsSection = () => {
        pdf.addPage();
        addPageHeader();
        addSectionHeader('4. COLLECTION STOPS');
        let stopY = 45;

        this.addresses.forEach((address, index) => {
          if (stopY > 250) {
            pdf.addPage();
            addPageHeader();
            stopY = 30;
          }

          pdf.setFillColor(245, 245, 245);
          pdf.rect(margin, stopY, contentWidth, 25, 'F');
          pdf.setFillColor(51, 122, 183);
          pdf.circle(margin + 10, stopY + 12, 8, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.text((index + 1).toString(), margin + 10, stopY + 14, {
            align: 'center',
          });

          pdf.setTextColor(80, 80, 80);
          pdf.setFontSize(10);
          const addressLines = pdf.splitTextToSize(address, contentWidth - 40);
          pdf.text(addressLines, margin + 25, stopY + 10);

          const coords = `${
            this.viewedVehicle?.route?.locations![index].latitude || ''
          }, ${this.viewedVehicle?.route?.locations![index].longitude || ''}`;
          pdf.setTextColor(120, 120, 120);
          pdf.setFontSize(8);
          pdf.text(coords, margin + 25, stopY + 20);

          stopY += 30;
        });
      };

      // --- COVER ---
      pdf.setFillColor(51, 122, 183);
      pdf.rect(0, 0, pageWidth, 100, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.text('ROUTE REPORT', margin, 50);
      pdf.setFontSize(14);
      pdf.text(this.viewedVehicle?.licensePlate || 'N/A', margin, 65);
      pdf.setFontSize(12);
      pdf.text(new Date().toLocaleDateString(), margin, 75);

      // Vehicle Info Block
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, 120, contentWidth, 50, 'F');
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(10);
      const infoY = 130;
      const lineH = 12;
      pdf.text(
        `Vehicle License: ${this.viewedVehicle?.licensePlate || 'N/A'}`,
        margin + 5,
        infoY
      );
      pdf.text(
        `Driver: ${this.getDriverName(this.viewedVehicle!)}`,
        margin + 5,
        infoY + lineH
      );
      pdf.text(
        `Route Name: ${this.viewedVehicle?.route?.name || 'N/A'}`,
        margin + 5,
        infoY + lineH * 2
      );
      pdf.text(
        `Route Type: ${this.viewedVehicle?.route?.type || 'N/A'}`,
        margin + 5,
        infoY + lineH * 3
      );

      // --- TOC ---
      pdf.addPage();
      addPageHeader();
      addSectionHeader('CONTENTS');
      const tocY = 45;
      const tocLh = 10;
      const tocEntries = [
        '1. Route Summary',
        '2. Environmental Impact Analysis',
        '3. Route Map',
        '4. Collection Stops',
      ];
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      tocEntries.forEach((text, i) => pdf.text(text, margin, tocY + tocLh * i));

      // --- ROUTE SUMMARY ---
      pdf.addPage();
      addPageHeader();
      addSectionHeader('1. ROUTE SUMMARY');
      const routeText = `This report provides a comprehensive overview of the ${
        this.viewedVehicle?.route?.name || ''
      } route, assigned to vehicle ${
        this.viewedVehicle?.licensePlate || ''
      }. The analysis includes key performance metrics, environmental impact assessment, and detailed stop information to help optimize waste collection operations.`;
      const afterDescY = addParagraph(routeText, 40);

      const summaryMetrics = [
        {
          label: 'Route Name',
          value: this.viewedVehicle?.route?.name || 'N/A',
        },
        {
          label: 'Route Type',
          value: this.viewedVehicle?.route?.type || 'N/A',
        },
        {
          label: 'Vehicle License',
          value: this.viewedVehicle?.licensePlate || 'N/A',
        },
        {
          label: 'Assigned Driver',
          value: this.getDriverName(this.viewedVehicle!),
        },
        {
          label: 'Total Stops',
          value: (this.viewedVehicle?.route?.locations?.length || 0).toString(),
        },
        {
          label: 'Route Optimization',
          value: this.isEcoFriendlyRoute ? 'Eco-Friendly' : 'Standard',
        },
        {
          label: 'Estimated Duration',
          value: this.estimatedTime || 'N/A',
          highlight: true,
        },
        {
          label: 'Last Maintenance',
          value: this.viewedVehicle?.lastMaintenance || 'N/A',
        },
        {
          label: 'Vehicle Capacity',
          value: this.formatCapacity(this.viewedVehicle?.maxCapacity || 'N/A'),
        },
      ];
      addMetricTable(afterDescY + 10, summaryMetrics);

      // --- ENVIRONMENTAL IMPACT ---
      pdf.addPage();
      addPageHeader();
      addSectionHeader('2. ENVIRONMENTAL IMPACT ANALYSIS');
      const impactText = `This section provides a detailed analysis of the environmental footprint associated with the ${
        this.viewedVehicle?.route?.name || 'N/A'
      } route. The evaluation includes measurements of carbon dioxide emissions, fuel consumption, and the effectiveness of eco-friendly routing strategies. By leveraging data-driven methodologies, this report highlights how route optimization contributes to sustainability targets and cost efficiency. Special attention is given to identifying opportunities for emission reduction and the adoption of low-impact driving behaviors. The metrics presented here are grounded in both real-time GPS telemetry and historical performance data, providing a comprehensive view of the route's ecological impact. This analysis not only supports internal green initiatives but also ensures compliance with environmental regulations and aligns with broader climate responsibility goals. Through continuous monitoring and iterative improvements, this route plays a vital role in minimizing environmental disruption while maintaining service quality.`;
      const afterImpactY = addParagraph(impactText, 45);

      const envMetrics = [
        {
          label: 'CO2 Emissions',
          value: `${this.co2Emissions.toFixed(0)} g/km`,
          highlight: true,
        },
        {
          label: 'Eco-Friendly Routing',
          value: this.isEcoFriendlyRoute ? 'Yes' : 'No',
        },
        {
          label: 'Estimated Fuel Consumption',
          value: `${(this.co2Emissions / 2.31).toFixed(1)} liters`,
        },
        {
          label: 'Emissions Savings Potential',
          value: this.isEcoFriendlyRoute
            ? 'Optimized'
            : `${(this.co2Emissions * 0.15).toFixed(0)} g/km possible`,
        },
        {
          label: 'Carbon Footprint Rating',
          value:
            this.co2Emissions < 100
              ? 'Excellent'
              : this.co2Emissions < 200
              ? 'Good'
              : 'Needs Improvement',
        },
      ];
      addMetricTable(afterImpactY , envMetrics);

      // --- ROUTE MAP ---
      pdf.addPage();
      addPageHeader();
      addSectionHeader('3. ROUTE MAP');
      const mapCanvas = await html2canvas(
        this.routeMapContainer.nativeElement,
        { scale: 2, logging: false, useCORS: true }
      );
      const mapImage = mapCanvas.toDataURL('image/png');
      pdf.addImage(mapImage, 'PNG', margin, 40, contentWidth, 100);

      const mapText = `The map above illustrates the carefully optimized route designed to maximize efficiency while minimizing environmental impact. Each stop along the route has been strategically placed based on various factors including collection demand, traffic patterns, fuel economy, and safety considerations. By analyzing real-time data and historical trends, this route has been tailored to reduce idle time and distance traveled, thereby lowering carbon emissions and operational costs. The visual representation provides a clear overview of the vehicle’s path, highlighting the sequential order of collection points, directionality, and key geographical markers. This optimized route not only supports sustainability goals but also enhances service reliability and logistical performance. The map serves as a vital tool for drivers and managers alike, ensuring alignment with performance targets and regulatory standards.

`;
      addParagraph(mapText, 150);

      // --- COLLECTION STOPS ---
      addStopsSection();

      // FOOTERS
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(i, totalPages);
      }

      pdf.save(
        `Route_Report_${this.viewedVehicle?.licensePlate || 'Unknown'}_${
          new Date().toISOString().split('T')[0]
        }.pdf`
      );
      this.isLoading = false;
    } catch (error) {
      console.error('Error generating report:', error);
      this.error = 'Failed to generate report';
      this.isLoading = false;
    }
  }
}
