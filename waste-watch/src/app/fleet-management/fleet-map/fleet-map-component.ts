import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { VehicleService, Vehicle } from '../../services/FleetService';
import { faMapMarkerAlt, faSync, faTruck, faUserAlt, faCalendarAlt, faRoute } from '@fortawesome/free-solid-svg-icons';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../services/AuthService';
import { environment } from '../../../environments/environtment';

interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId: string;
  streetViewControl: boolean;
  [key: string]: any;
}

interface MarkerOptions {
  position: { lat: number; lng: number };
  map: any;
  title?: string;
  [key: string]: any;
}

interface GoogleMaps {
  Map: new (element: HTMLElement, options?: MapOptions) => any;
  Marker: new (options: MarkerOptions) => any;
  InfoWindow: new (options: any) => any;
}

declare global {
  interface Window {
    google: {
      maps: GoogleMaps;
    };
  }
}

@Component({
  selector: 'app-fleet-map',
  standalone: true,
  templateUrl: './fleet-map-component.html',
  styleUrls: ['./fleet-map-component.css'],
  imports: [CommonModule, FontAwesomeModule, SideNavComponent],
})
export class FleetMapComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map: any = null;
  infoWindow: any = null;

  // Icons
  faMapMarkerAlt = faMapMarkerAlt;
  faSync = faSync;
  faTruck = faTruck;
  faUserAlt = faUserAlt;
  faCalendarAlt = faCalendarAlt;
  faRoute = faRoute;

  // Component state
  vehicles: Vehicle[] = [];
  selectedVehicle: Vehicle | null = null;
  isAuthorized: boolean = false;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Default center coordinates (Lisbon)
  lat: number = 38.7223;
  lng: number = -9.1393;

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkAuthorization();
    this.loadVehicles();
    this.loadGoogleMaps();
  }

  checkAuthorization(): void {
    this.isAuthorized = this.authService.getUserRoles().includes('Admin') ||
      this.authService.getUserRoles().includes('Maintenance');
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.isLoading = false;
        this.plotVehiclesOnMap();
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
        this.errorMessage = 'Failed to load fleet data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadGoogleMaps(): void {
    if (window.google?.maps) {
      this.initMap();
      return;
    }

    const callbackName = `initMap_${Date.now()}`;
    (window as any)[callbackName] = () => {
      this.initMap();
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    try {
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: { lat: this.lat, lng: this.lng },
        zoom: 12,
        mapTypeId: 'satellite',  // Set mapTypeId to 'satellite' for satellite view
        streetViewControl: false,
      });
      this.plotVehiclesOnMap();
    } catch (error) {
      console.error('Error initializing map:', error);
      this.errorMessage = 'Failed to initialize the map. Please try again later.';
    }
  }


  plotVehiclesOnMap(): void {
    if (!this.map || !this.vehicles.length) return;

    this.infoWindow = new google.maps.InfoWindow({
      maxWidth: 400,
      minWidth: 300,
    });

    this.vehicles.forEach((vehicle) => {
      const lat = this.convertDMSToDecimal(vehicle.latitude);
      const lng = this.convertDMSToDecimal(vehicle.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        console.error(`Invalid coordinates for vehicle ${vehicle.licensePlate}`);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        title: `${vehicle.licensePlate} - ${vehicle.status}`,
        icon: {
          url: this.getVehicleIcon(vehicle), // Pass the vehicle to get the correct icon based on capacity
          scaledSize: new google.maps.Size(64, 64),  // Increase the size here (64px by 64px)
        },
      });

      marker.addListener('click', () => {
        this.showVehicleInfo(vehicle, marker);
      });
    });
  }



  showVehicleInfo(vehicle: Vehicle, marker: any): void {
    const statusClass = this.getStatusClass(vehicle);
    const statusText = vehicle.status;

    const content = `
      <div class="info-window-container" style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 320px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header Section -->
        <div style="background: #F3F4F6; padding: 16px; border-bottom: 1px solid #E5E7EB;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">
              ${vehicle.licensePlate}
            </h3>
            <span class="vehicle-status ${statusClass}" style="
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 500;
            ">
              ${statusText}
            </span>
          </div>
          <p style="margin: 0; color: #6B7280; font-size: 14px;">
            ${vehicle.routeType} Vehicle
          </p>
        </div>

        <!-- Content Section -->
        <div style="padding: 16px;">
          <!-- Driver Info -->
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
              Driver Information
            </h4>
            <div style="
              background: #F9FAFB;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #E5E7EB;
            ">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="color: #6B7280; font-size: 14px;">Assigned Driver</span>
                <span style="color: #111827; font-weight: 500; font-size: 14px;">
                  ${vehicle.driver?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          <!-- Vehicle Details -->
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
              Vehicle Details
            </h4>
            <div style="
              background: #F9FAFB;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #E5E7EB;
            ">
              <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span style="color: #6B7280; font-size: 14px;">Max Capacity</span>
                <span style="color: #111827; font-weight: 500; font-size: 14px;">
                  ${vehicle.maxCapacity}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B7280; font-size: 14px;">Last Maintenance</span>
                <span style="color: #111827; font-weight: 500; font-size: 14px;">
                  ${new Date(vehicle.lastMaintenance).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <!-- Location Details -->
          <div>
            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
              Current Location
            </h4>
            <div style="
              background: #F9FAFB;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #E5E7EB;
            ">
              <div style="margin-bottom: 8px;">
                <span style="color: #6B7280; font-size: 14px;">Latitude</span>
                <span style="display: block; color: #111827; font-weight: 500; font-size: 14px;">
                  ${this.convertDMSToDecimal(vehicle.latitude).toFixed(6)}
                </span>
              </div>
              <div>
                <span style="color: #6B7280; font-size: 14px;">Longitude</span>
                <span style="display: block; color: #111827; font-weight: 500; font-size: 14px;">
                  ${this.convertDMSToDecimal(vehicle.longitude).toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);

    this.selectedVehicle = vehicle;
    this.map.panTo(marker.getPosition());

    if (this.map.getZoom() < 16) {
      this.map.setZoom(16);
    }
  }

  getVehicleIcon(vehicle: Vehicle): string {
    const baseUrl = 'assets/images/vehicles/';
    const maxCapacity = Number(vehicle.maxCapacity);  // Ensure maxCapacity is a number

    if (isNaN(maxCapacity)) {
      console.error(`Invalid max capacity for vehicle ${vehicle.licensePlate}`);
      return `${baseUrl}default-truck.png`; // Fallback to default icon if maxCapacity is not a number
    }

    // Route type check and icon selection
    switch (vehicle.routeType.toLowerCase()) {
      case 'residential':
        // Icons for Residential vehicles
        if (maxCapacity >= 10000) {
          return `${baseUrl}residential-truck-large.png`; // Large residential truck
        } else if (maxCapacity >= 5000) {
          return `${baseUrl}residential-truck-medium.png`; // Medium residential truck
        } else {
          return `${baseUrl}residential-truck-small.png`; // Small residential truck
        }

      case 'industrial':
        // Icons for Industrial vehicles
        if (maxCapacity >= 10000) {
          return `${baseUrl}industrial-truck-large.png`; // Large industrial truck
        } else if (maxCapacity >= 5000) {
          return `${baseUrl}industrial-truck-medium.png`; // Medium industrial truck
        } else {
          return `${baseUrl}industrial-truck-small.png`; // Small industrial truck
        }

      case 'commercial':
        // Icons for Commercial vehicles
        if (maxCapacity >= 10000) {
          return `${baseUrl}commercial-truck-large.png`; // Large commercial truck
        } else if (maxCapacity >= 5000) {
          return `${baseUrl}commercial-truck-medium.png`; // Medium commercial truck
        } else {
          return `${baseUrl}commercial-truck-small.png`; // Small commercial truck
        }

      default:
        // Default icon if the route type is unknown or unclassified
        return `${baseUrl}commercial-truck-small.png`;
    }
  }



  convertDMSToDecimal(dms: string): number {
    if (/^-?\d+(\.\d+)?$/.test(dms.trim())) {
      return parseFloat(dms.trim());
    }

    const regex = /(\d+)°(\d+)'(\d+(\.\d+)?)\"([NSEW])/;
    const parts = dms.match(regex);

    if (!parts) {
      console.error('Invalid DMS format:', dms);
      return NaN;
    }

    const degrees = parseInt(parts[1]);
    const minutes = parseInt(parts[2]);
    const seconds = parseFloat(parts[3]);
    const direction = parts[5];

    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }

    return decimal;
  }

  getStatusClass(vehicle: Vehicle): string {
    return vehicle.status.toLowerCase().replace(' ', '-');
  }

  refreshMap(): void {
    this.loadVehicles();
  }

  selectVehicle(vehicle: Vehicle): void {

    const lat = this.convertDMSToDecimal(vehicle.latitude);
    const lng = this.convertDMSToDecimal(vehicle.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates for vehicle:', vehicle.licensePlate);
      return;
    }

    // Pan to the selected vehicle's location
    this.map.panTo({ lat, lng });

    // Set the zoom level to 17 when selecting a vehicle
    this.map.setZoom(17);

    // Set the selected vehicle
    this.selectedVehicle = vehicle;

    console.log('Selected Vehicle:', this.selectedVehicle); // Add this line to check
  }



}
