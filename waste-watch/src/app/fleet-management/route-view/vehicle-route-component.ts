import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { VehicleService, Vehicle, Route } from '../../services/FleetService';
import { faSync, faTruck, faUserAlt, faCalendarAlt, faRoute } from '@fortawesome/free-solid-svg-icons';
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
  selector: 'app-vehicles-route',
  standalone: true,
  templateUrl: './vehicle-route-component.html',
  styleUrls: ['./vehicle-route-component.css'],
  imports: [CommonModule, FontAwesomeModule, SideNavComponent],
})
export class VehiclesRouteComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map: any = null;
  directionsService: any = null;
  directionsRenderer: any = null;
  markers: any[] = [];

  // Icons
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=geometry&callback=${callbackName}`;
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

      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 6
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      this.errorMessage = 'Failed to initialize the map. Please try again later.';
    }
  }

  selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicle = vehicle;
    this.clearMap();

    if (!this.map || !this.directionsService || !this.directionsRenderer) return;

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
        url: this.getVehicleIcon(vehicle),
        scaledSize: new google.maps.Size(64, 64),
      }
    });

    this.markers.push(marker);
    this.map.panTo({ lat, lng });
    this.map.setZoom(14);

    if (vehicle.route?.locations && vehicle.route.locations.length > 1) {
      this.displayRoute(vehicle.route);
    }
  }

  displayRoute(route: Route): void {
    if (!this.map || !this.directionsService || !this.directionsRenderer ||
        !route.locations || route.locations.length < 2) {
      return;
    }

    const waypoints = route.locations
      .slice(1, -1)
      .map(location => ({
        location: new google.maps.LatLng(
          this.convertDMSToDecimal(location.latitude),
          this.convertDMSToDecimal(location.longitude)
        ),
        stopover: true
      }));

    const origin = new google.maps.LatLng(
      this.convertDMSToDecimal(route.locations[0].latitude),
      this.convertDMSToDecimal(route.locations[0].longitude)
    );

    const destination = new google.maps.LatLng(
      this.convertDMSToDecimal(route.locations[route.locations.length - 1].latitude),
      this.convertDMSToDecimal(route.locations[route.locations.length - 1].longitude)
    );

    this.directionsService.route({
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    }, (response: any, status: string) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(response);
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }

  clearMap(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 6
        }
      });
    }
  }

  getVehicleIcon(vehicle: Vehicle): string {
    const baseUrl = 'assets/images/vehicles/';
    const maxCapacity = Number(vehicle.maxCapacity);

    if (isNaN(maxCapacity)) {
      return `${baseUrl}default-truck.png`;
    }

    switch (vehicle.routeType.toLowerCase()) {
      case 'residential':
        return maxCapacity >= 10000 ? `${baseUrl}residential-truck-large.png` :
               maxCapacity >= 5000 ? `${baseUrl}residential-truck-medium.png` :
               `${baseUrl}residential-truck-small.png`;
      case 'industrial':
        return maxCapacity >= 10000 ? `${baseUrl}industrial-truck-large.png` :
               maxCapacity >= 5000 ? `${baseUrl}industrial-truck-medium.png` :
               `${baseUrl}industrial-truck-small.png`;
      case 'commercial':
        return maxCapacity >= 10000 ? `${baseUrl}commercial-truck-large.png` :
               maxCapacity >= 5000 ? `${baseUrl}commercial-truck-medium.png` :
               `${baseUrl}commercial-truck-small.png`;
      default:
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
    this.clearMap();
    this.selectedVehicle = null;
  }
}
