import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BinService, Bin } from '../../services/BinService';
import { faMapMarkerAlt, faRoute, faLock, faUnlock, faSync } from '@fortawesome/free-solid-svg-icons';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../services/AuthService';
import { environment } from '../../../environments/environtment';

// Type declarations for Google Maps
interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId: string;  // Satellite view
  streetViewControl: boolean;  // Remove Street View option
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
}

declare global {
  interface Window {
    google: {
      maps: GoogleMaps;
    };
  }
}

@Component({
  selector: 'app-bin-map',
  standalone: true,
  templateUrl: './bin-map-component.html',
  styleUrls: ['./bin-map-component.css'],
  imports: [CommonModule, FontAwesomeModule, SideNavComponent],
})
export class BinMapComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map: any = null;

  // Icons
  faMapMarkerAlt = faMapMarkerAlt;
  faRoute = faRoute;
  faLock = faLock;
  faUnlock = faUnlock;
  faSync = faSync;

  // Component state
  bins: Bin[] = [];
  selectedBin: Bin | null = null;
  isAuthorized: boolean = false;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Latitude and Longitude of the specific location
  lat: number = 38.552583;  // 38º33'09.340'' N
  lng: number = -8.859192;  // 8º51'33.310'' W

  constructor(
    private binService: BinService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthorization();
    this.loadBins();
    this.loadGoogleMaps();
  }

  checkAuthorization(): void {
    this.isAuthorized = this.authService.getUserRoles().includes('Admin') ||
                        this.authService.getUserRoles().includes('Maintenance');
  }

  loadBins(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.binService.getBins().subscribe({
      next: (bins) => {
        this.bins = bins;
        this.isLoading = false;
        this.plotBinsOnMap();
      },
      error: (err) => {
        console.error('Error loading bins:', err);
        this.errorMessage = 'Failed to load bin data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadGoogleMaps(): void {
    if (window.google?.maps) {
      this.initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&v=3.44&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Delay the initialization slightly to ensure everything is ready
      setTimeout(() => {
        if (window.google?.maps) {
          this.initMap();
        } else {
          console.error('Google Maps API not available after loading');
          this.fallbackMapLoading();
        }
      }, 1000); // Delay the initialization by 1 second
    };

    script.onerror = () => {
      console.error('Google Maps failed to load - trying fallback');
      this.fallbackMapLoading();
    };

    document.head.appendChild(script);
  }

  private fallbackMapLoading() {
    this.errorMessage = 'Map loading delayed by browser security settings or failed to load';
    setTimeout(() => this.loadGoogleMaps(), 2000); // Retry after delay
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    try {
      // Make sure google.maps.Map is accessible
      if (window.google?.maps?.Map) {
        this.map = new window.google.maps.Map(this.mapContainer.nativeElement, {
          center: { lat: this.lat, lng: this.lng },  // Start at the specific location
          zoom: 12,
          mapTypeId: 'satellite', // Set map type to Satellite
          streetViewControl: false, // Remove Street View control
        });
        this.plotBinsOnMap();
      } else {
        console.error('Google Maps API is not loaded correctly');
        this.errorMessage = 'Failed to initialize the map. Please try again later.';
      }
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      this.errorMessage = 'Error initializing map. Please try again later.';
    }
  }

  convertToDecimal(coordinate: number, isLongitude: boolean = false): number {
    const coordinateStr = coordinate.toString();
    const degrees = parseInt(coordinateStr.substring(0, 2)); // First 2 digits for degrees
    const minutes = parseFloat(coordinateStr.substring(2)); // Remaining part for minutes

    const decimal = degrees + minutes / 60;

    // For longitude, negative values need to be adjusted (assuming west longitude is negative)
    return isLongitude ? -decimal : decimal;
  }


  plotBinsOnMap(): void {
    if (!this.map || !this.bins.length) return;

    const customIcon = 'assets/images/bin.png';  // Path to your custom icon

    // Store markers globally to easily hide or show them based on zoom level
    this.bins.forEach(bin => {
      let lat: number, lng: number;

      // Check if the latitude and longitude are in DDMM.mmmm format
      if (typeof bin.location.latitude === 'number') {
        lat = this.convertToDecimal(bin.location.latitude); // Convert DDMM.mmmm to Decimal Degrees
      } else {
        lat = bin.location.latitude; // Already in Decimal Degrees format
      }

      if (typeof bin.location.longitude === 'number') {
        lng = this.convertToDecimal(bin.location.longitude, true); // Convert DDMM.mmmm to Decimal Degrees (Longitude)
      } else {
        lng = bin.location.longitude; // Already in Decimal Degrees format
      }

      // Log the location in the console
      console.log(`Bin ${bin.id} Location: Latitude = ${lat}, Longitude = ${lng}`);

      const marker = new window.google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: this.map,
        title: `Bin ${bin.id} - ${this.getStatusText(bin)}`,
        icon: customIcon,
      });

      // Set an initial marker visibility based on zoom level
      this.setMarkerVisibility(marker);

      // Listen for zoom level changes and update marker visibility
      window.google.maps.event.addListener(this.map, 'zoom_changed', () => {
        this.setMarkerVisibility(marker);
      });

      // Add click event to focus the map on this bin when clicked
      window.google.maps.event.addListener(marker, 'click', () => {
        this.selectBin(bin);
      });
    });
  }


  // Helper function to set marker visibility based on zoom level
  setMarkerVisibility(marker: any): void {
    const zoomLevel = this.map.getZoom();

    // Display markers only if zoom level is 12 or greater
    if (zoomLevel >= 12) {
      marker.setVisible(true);
    } else {
      marker.setVisible(false);
    }
  }

  // Focus the map on the selected bin's location
  selectBin(bin: Bin): void {
    this.selectedBin = bin;
    const latLng = new window.google.maps.LatLng(bin.location.latitude, bin.location.longitude);
    this.map.panTo(latLng);  // Focus the map on the selected bin
    this.map.setZoom(15);  // Optional: zoom in when a bin is selected
  }

  // Convert DMS (Degrees, Minutes, Seconds) format to Decimal Degrees
  convertDMSToDecimal(dms: string, isLongitude: boolean = false): number {
    const regex = /(\d+)[^\d]+(\d+)[^\d]+([\d.]+)/;  // Matches degrees, minutes, and seconds
    const matches = dms.match(regex);

    if (matches) {
      const degrees = parseInt(matches[1], 10);
      const minutes = parseInt(matches[2], 10);
      const seconds = parseFloat(matches[3]);

      let decimal = degrees + minutes / 60 + seconds / 3600;

      // If it's a longitude (West), make it negative
      if (isLongitude && degrees > 0) {
        decimal = -decimal;
      }

      return decimal;
    }

    console.error(`Invalid DMS format: ${dms}`);
    return 0;  // Return 0 if the format is invalid
  }

  getStatusClass(bin: Bin): string {
    switch (bin.status) {
      case 0: return 'status-empty';
      case 1: return 'status-partial';
      case 2: return 'status-full';
      case 3: return 'status-overflow';
      default: return 'status-empty';
    }
  }

  getStatusText(bin: Bin): string {
    switch (bin.status) {
      case 0: return 'Empty';
      case 1: return 'Partial';
      case 2: return 'Almost Full';
      case 3: return 'Full';
      default: return 'Unknown';
    }
  }

  getBinTypeText(type: number): string {
    switch(type) {
      case 0: return 'General Waste';
      case 1: return 'Recycling';
      case 2: return 'Organic';
      case 3: return 'Hazardous';
      default: return 'Unknown';
    }
  }

  refreshMap(): void {
    this.loadBins();
  }
}
