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
  ) {}

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
        mapTypeId: 'roadmap',
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
      minWidth: 300
    });

    this.vehicles.forEach(vehicle => {
      if (!vehicle.location) return;

      const lat = this.convertDMSToDecimal(vehicle.location.latitude);
      const lng = this.convertDMSToDecimal(vehicle.location.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        console.error(`Invalid coordinates for vehicle ${vehicle.licensePlate}`);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        title: `${vehicle.licensePlate} - ${vehicle.status}`,
        icon: {
          url: this.getVehicleIcon(vehicle.routeType),
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      marker.addListener('click', () => {
        this.showVehicleInfo(vehicle, marker);
      });
    });
  }

  showVehicleInfo(vehicle: Vehicle, marker: any): void {
    const content = `
      <div style="padding: 15px; max-width: 300px;">
        <h3 style="margin: 0 0 10px; color: #333;">${vehicle.licensePlate}</h3>
        <div style="margin-bottom: 10px;">
          <strong>Status:</strong>
          <span class="status-badge ${vehicle.status.toLowerCase()}">${vehicle.status}</span>
        </div>
        <div style="margin-bottom: 5px;">
          <strong>Driver:</strong> ${vehicle.driver?.name || 'Unassigned'}
        </div>
        <div style="margin-bottom: 5px;">
          <strong>Route Type:</strong> ${vehicle.routeType}
        </div>
        <div style="margin-bottom: 5px;">
          <strong>Max Capacity:</strong> ${vehicle.maxCapacity}
        </div>
        <div>
          <strong>Last Maintenance:</strong> ${new Date(vehicle.lastMaintenance).toLocaleDateString()}
        </div>
      </div>
    `;

    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
    this.selectedVehicle = vehicle;
  }

  getVehicleIcon(routeType: string): string {
    const baseUrl = 'assets/images/vehicles/';
    switch (routeType.toLowerCase()) {
      case 'collection':
        return `${baseUrl}garbage-truck.png`;
      case 'delivery':
        return `${baseUrl}delivery-truck.png`;
      case 'maintenance':
        return `${baseUrl}maintenance-truck.png`;
      default:
        return `${baseUrl}default-truck.png`;
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
    if (!vehicle.location) return;

    const lat = this.convertDMSToDecimal(vehicle.location.latitude);
    const lng = this.convertDMSToDecimal(vehicle.location.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates for vehicle:', vehicle.licensePlate);
      return;
    }

    this.map.panTo({ lat, lng });
    this.map.setZoom(16);
    this.selectedVehicle = vehicle;
  }
}
