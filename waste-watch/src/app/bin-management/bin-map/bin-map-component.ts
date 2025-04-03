import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BinService, Bin } from '../../services/BinService';
import { faMapMarkerAlt, faRoute, faLock, faUnlock, faSync, faTrashAlt, faInfoCircle, faWeight, faClock } from '@fortawesome/free-solid-svg-icons';

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
  selector: 'app-bin-map',
  standalone: true,
  templateUrl: './bin-map-component.html',
  styleUrls: ['./bin-map-component.css'],
  imports: [CommonModule, FontAwesomeModule, SideNavComponent],
})
export class BinMapComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map: any = null;
  infoWindow: any = null;

  // Existing Icons
  faMapMarkerAlt = faMapMarkerAlt;
  faRoute = faRoute;
  faLock = faLock;
  faUnlock = faUnlock;
  faSync = faSync;

  // New Icons for Info Window
  faTrashAlt = faTrashAlt;
  faInfoCircle = faInfoCircle;
  faWeight = faWeight;
  faClock = faClock;

  // Component state
  bins: Bin[] = [];
  selectedBin: Bin | null = null;
  isAuthorized: boolean = false;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Latitude and Longitude of the specific location
  lat: number = 38.552583;
  lng: number = -8.859192;



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

    (window as any).initMap = undefined;
    const callbackName = `initMap_${Date.now()}`;
    (window as any)[callbackName] = () => {
      this.initMap();
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&v=3.44&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      console.error('Google Maps failed to load - trying fallback');
      this.fallbackMapLoading();
      delete (window as any)[callbackName];
    };

    document.head.appendChild(script);
  }

  private fallbackMapLoading() {
    this.errorMessage = 'Map loading delayed by browser security settings or failed to load';
    setTimeout(() => this.loadGoogleMaps(), 2000);
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    try {
      if (window.google?.maps?.Map) {
        this.map = new window.google.maps.Map(this.mapContainer.nativeElement, {
          center: { lat: this.lat, lng: this.lng },
          zoom: 12,
          mapTypeId: 'satellite',
          streetViewControl: false,
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

  plotBinsOnMap(): void {
    if (!this.map || !this.bins.length) return;

    this.infoWindow = new google.maps.InfoWindow({
      maxWidth: 400,
      minWidth: 300
    });

    this.bins.forEach(bin => {
      let latStr: string = bin.location.latitude?.toString().trim() || "";
      let lngStr: string = bin.location.longitude?.toString().trim() || "";

      if (!latStr || !lngStr) {
        console.error(`Missing coordinates for Bin ${bin.id}:`, bin);
        return;
      }

      let lat: number = this.convertDMSToDecimal(latStr);
      let lng: number = this.convertDMSToDecimal(lngStr);

      if (isNaN(lat) || isNaN(lng)) {
        console.error(`Invalid coordinates for Bin ${bin.id}:`, bin);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: this.map,
        title: `Bin ${bin.id} - ${this.getStatusText(bin)}`,
        icon: {
          url: this.getBinIcon(bin.type),  // Get icon based on bin type
          scaledSize: new google.maps.Size(50, 55),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(11, 40)
        },
        optimized: false
      });

      this.setMarkerVisibility(marker);

      google.maps.event.addListener(this.map, 'zoom_changed', () => {
        this.setMarkerVisibility(marker);
      });

      google.maps.event.addListener(marker, 'click', () => {
        this.showBinInfo(bin, marker);
      });
    });
  }


  showBinInfo(bin: Bin, marker: any): void {
    const content = `
      <div class="gm-style-iw p-2 rounded shadow" style="max-width: 280px; font-family: Arial, sans-serif;">
        <div style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 5px;">
          <h5 class="fw-bold text-primary mb-1" style="font-size: 16px;">
            <i class="fas fa-trash-alt me-2"></i> Bin #${bin.id}
          </h5>
          <span class="small text-muted">${this.getBinTypeText(bin.type)}</span>
        </div>

        <div class="info-content" style="font-size: 14px;">
          <p class="mb-1"><i class="fas fa-info-circle me-1 text-secondary"></i>
            <strong>Status:</strong> <span class="badge ${this.getStatusClass(bin)}">${this.getStatusText(bin)}</span>
          </p>
          <p class="mb-1"><i class="fas fa-weight me-1 text-secondary"></i>
            <strong>Capacity:</strong> ${bin.capacity} kg
          </p>
          <p class="mb-1"><i class="fas fa-clock me-1 text-secondary"></i>
            <strong>Last Emptied:</strong> ${new Date(bin.lastEmptied).toLocaleString()}
          </p>

          <hr class="my-2">

          <div class="location-details">
            <p class="mb-1"><i class="fas fa-map-marker-alt me-1 text-danger"></i>
              <strong>Location:</strong>
            </p>
            <p class="small text-muted mb-0">
              Latitude: <strong>${this.convertDMSToDecimal(bin.location.latitude).toFixed(6)}</strong>
            </p>
            <p class="small text-muted">
              Longitude: <strong>${this.convertDMSToDecimal(bin.location.longitude).toFixed(6)}</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);

    this.selectedBin = bin;
    this.map.panTo(marker.getPosition());

    if (this.map.getZoom() < 16) {
      this.map.setZoom(16);
    }
}

getBinIcon(binType: number): string {
  switch (binType) {
    case 0:
      return 'assets/images/general-waste.png';  // General Waste Bin
    case 1:
      return 'assets/images/bin.png';  // Recycling Bin
    case 2:
      return 'assets/images/organic-bin.png';    // Organic Waste Bin
    case 3:
      return 'assets/images/hazardous-bin.png';  // Hazardous Waste Bin
    default:
      return 'assets/images/default-bin.png';    // Default Bin Icon
  }
}



  setMarkerVisibility(marker: any): void {
    const zoomLevel = this.map.getZoom();
    marker.setVisible(zoomLevel >= 12);
  }

  selectCard(bin: Bin): void {
    let lat: number;
    let lng: number;
    const latStr = bin.location.latitude?.toString().trim() || "";
    const lngStr = bin.location.longitude?.toString().trim() || "";

    if (/^-?\d+(\.\d+)?$/.test(latStr)) {
      lat = parseFloat(latStr);
    } else {
      lat = this.convertDMSToDecimal(latStr);
    }

    if (/^-?\d+(\.\d+)?$/.test(lngStr)) {
      lng = parseFloat(lngStr);
    } else {
      lng = this.convertDMSToDecimal(lngStr);
    }

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates for Bin:', bin.id);
      return;
    }

    if (this.map) {
      const position = new google.maps.LatLng(lat, lng);
      this.map.panTo(position);

      const currentZoom = this.map.getZoom();
      const targetZoom = 17;

      if (currentZoom !== targetZoom) {
        this.map.setZoom(targetZoom);
      }

      // Find and click the corresponding marker
      const markers = this.map.markers;
      if (markers) {
        const marker = markers.find((m: any) =>
          m.getPosition().lat() === lat &&
          m.getPosition().lng() === lng
        );
        if (marker) {
          google.maps.event.trigger(marker, 'click');
        }
      }
    }
  }

  convertDMSToDecimal(dms: string | number): number {
    if (typeof dms === 'number') {
      return dms;
    }

    if (/^-?\d+(\.\d+)?$/.test(dms.trim())) {
      return parseFloat(dms.trim());
    }

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
