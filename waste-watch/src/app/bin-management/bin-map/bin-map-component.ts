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
        console.log("Bins received from service:", bins); // Debugging log
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
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      this.initMap();
      return;
    }

    // Remove any existing callback from window
    (window as any).initMap = undefined;

    // Create a unique callback name to avoid conflicts
    const callbackName = `initMap_${Date.now()}`;

    // Assign the callback to window
    (window as any)[callbackName] = () => {
      this.initMap();
      // Clean up after ourselves
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&v=3.44&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      console.error('Google Maps failed to load - trying fallback');
      this.fallbackMapLoading();
      // Clean up the callback if loading failed
      delete (window as any)[callbackName];
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

    // Custom icon configuration to match Google's default marker size
    const customIcon = {
      url: 'assets/images/bin.png', // Path to your custom icon
      scaledSize: new google.maps.Size(22, 40), // Standard Google Maps marker size (width, height)
      origin: new google.maps.Point(0, 0), // Origin point
      anchor: new google.maps.Point(11, 40) // Anchor point (centered horizontally, bottom-aligned)
    };

    this.bins.forEach(bin => {
      let latStr: string = bin.location.latitude?.toString().trim() || "";
      let lngStr: string = bin.location.longitude?.toString().trim() || "";

      // Ensure latitude and longitude are not empty or undefined
      if (!latStr || !lngStr) {
        console.error(`Missing coordinates for Bin ${bin.id}:`, bin);
        return;
      }

      let lat: number;
      let lng: number;

      // Parse latitude (handle both decimal and DMS formats)
      if (/^-?\d+(\.\d+)?$/.test(latStr)) {
        lat = parseFloat(latStr);
      } else {
        lat = this.convertDMSToDecimal(latStr);
        if (isNaN(lat)) {
          console.error(`Invalid latitude format for Bin ${bin.id}: ${latStr}`);
          return;
        }
      }

      // Parse longitude (handle both decimal and DMS formats)
      if (/^-?\d+(\.\d+)?$/.test(lngStr)) {
        lng = parseFloat(lngStr);
      } else {
        lng = this.convertDMSToDecimal(lngStr);
        if (isNaN(lng)) {
          console.error(`Invalid longitude format for Bin ${bin.id}: ${lngStr}`);
          return;
        }
      }

      // Ensure coordinates are valid numbers
      if (isNaN(lat) || isNaN(lng)) {
        console.error(`Invalid coordinates for Bin ${bin.id}: Latitude = ${lat}, Longitude = ${lng}`);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: this.map,
        title: `Bin ${bin.id} - ${this.getStatusText(bin)}`,
        icon: customIcon, // Use the configured icon
        optimized: false // Helps with performance when using custom icons
      });

      this.setMarkerVisibility(marker);

      google.maps.event.addListener(this.map, 'zoom_changed', () => {
        this.setMarkerVisibility(marker);
      });

      google.maps.event.addListener(marker, 'click', () => {
        this.selectCard(bin);
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

  selectCard(bin: Bin): void {
    // Set the selected bin
    this.selectedBin = bin;

    // Get the latitude and longitude of the selected bin
    let lat: number;
    let lng: number;
    const latStr = bin.location.latitude?.toString().trim() || "";
    const lngStr = bin.location.longitude?.toString().trim() || "";

    // Parse latitude
    if (/^-?\d+(\.\d+)?$/.test(latStr)) {
        lat = parseFloat(latStr);
    } else {
        lat = this.convertDMSToDecimal(latStr);
    }

    // Parse longitude
    if (/^-?\d+(\.\d+)?$/.test(lngStr)) {
        lng = parseFloat(lngStr);
    } else {
        lng = this.convertDMSToDecimal(lngStr);
    }

    // Check if coordinates are valid
    if (isNaN(lat) || isNaN(lng)) {
        console.error('Invalid coordinates for Bin:', bin.id);
        return;  // Prevent map centering if coordinates are invalid
    }

    // Focus the map on the selected bin's coordinates with a smooth zoom transition
    if (this.map) {
        this.map.setCenter({ lat, lng });  // Center the map on the selected bin

        // Use animation for zoom transition (e.g., using Google Maps' animateZoom)
        const currentZoom = this.map.getZoom();
        const targetZoom = 17;  // Set zoom level to a level that is appropriate for viewing the bin

        // Gradually adjust zoom level with ease-in animation
        let zoomStep = currentZoom < targetZoom ? 1 : -1;  // Determine direction
        let zoomInterval = setInterval(() => {
            let currentZoomLevel = this.map.getZoom();
            if (zoomStep > 0 && currentZoomLevel < targetZoom) {
                this.map.setZoom(currentZoomLevel + zoomStep);
            } else if (zoomStep < 0 && currentZoomLevel > targetZoom) {
                this.map.setZoom(currentZoomLevel + zoomStep);
            } else {
                clearInterval(zoomInterval);  // Stop the zooming animation when the target zoom is reached
            }
        }, 100);  // Update zoom every 100ms for smooth transition
    }
}






  // Convert DMS (Degrees, Minutes, Seconds) format to Decimal Degrees
  // Convert DMS (Degrees, Minutes, Seconds) format to Decimal Degrees
// Also handles decimal degrees directly
convertDMSToDecimal(dms: string | number): number {
  // If it's already a number, return it directly
  if (typeof dms === 'number') {
    return dms;
  }

  // If it's a string that's already in decimal format, parse it
  if (/^-?\d+(\.\d+)?$/.test(dms.trim())) {
    return parseFloat(dms.trim());
  }

  // Otherwise, try to parse as DMS format
  const regex = /(\d{1,3})°\s*(\d{1,2})'\s*(\d+(\.\d+)?)"?\s*([NSEW])?/i;
  const matches = dms.match(regex);

  if (!matches) {
    console.error(`Invalid coordinate format: ${dms}`);
    return NaN;
  }

  const degrees = parseFloat(matches[1]);
  const minutes = parseFloat(matches[2]) || 0;
  const seconds = parseFloat(matches[3]) || 0;
  const direction = matches[5] ? matches[5].toUpperCase() : '';

  let decimal = degrees + minutes / 60 + seconds / 3600;

  // Convert to negative for South (S) or West (W)
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }

  return decimal;
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
