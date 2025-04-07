import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BinService, Bin } from '../../services/BinService';
import { AuthService } from '../../services/AuthService';
import {
  faMapMarkerAlt,
  faRoute,
  faLock,
  faUnlock,
  faSync,
  faTrashAlt,
  faInfoCircle,
  faWeight,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
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

  faMapMarkerAlt = faMapMarkerAlt;
  faRoute = faRoute;
  faLock = faLock;
  faUnlock = faUnlock;
  faSync = faSync;
  faTrashAlt = faTrashAlt;
  faInfoCircle = faInfoCircle;
  faWeight = faWeight;
  faClock = faClock;

  bins: Bin[] = [];
  damagedBins: Set<number> = new Set();
  selectedBin: Bin | null = null;
  isAuthorized: boolean = false;
  isLoading: boolean = true;
  errorMessage: string | null = null;

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
    this.isAuthorized =
      this.authService.getUserRoles().includes('Admin') ||
      this.authService.getUserRoles().includes('Maintenance');
  }

  loadBins(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // First load damaged bins
    this.binService.getDamagedBins().subscribe({
      next: (damagedBins) => {
        this.damagedBins = new Set(damagedBins.map((bin) => bin.id));

        // Then load all bins
        this.binService.getBins().subscribe({
          next: (bins) => {
            this.bins = bins;
            this.isLoading = false;
            this.plotBinsOnMap();
          },
          error: (err) => {
            console.error('Error loading bins:', err);
            this.errorMessage =
              'Failed to load bin data. Please try again later.';
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error loading damaged bins:', err);
        this.errorMessage =
          'Failed to load damaged bin data. Please try again later.';
        this.isLoading = false;
      },
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
    this.errorMessage =
      'Map loading delayed by browser security settings or failed to load';
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
        this.errorMessage =
          'Failed to initialize the map. Please try again later.';
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
      minWidth: 300,
    });

    this.bins.forEach((bin) => {
      let latStr: string = bin.location.latitude?.toString().trim() || '';
      let lngStr: string = bin.location.longitude?.toString().trim() || '';

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
          url: this.getBinIcon(bin),
          scaledSize: new google.maps.Size(50, 55),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(11, 40),
        },
        optimized: false,
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

  async showBinInfo(bin: Bin, marker: any): Promise<void> {
    const isDamaged =
      (bin.id !== undefined && this.damagedBins.has(bin.id)) ||
      bin.status === 4;

    const lat = this.convertDMSToDecimal(bin.location.latitude);
    const lng = this.convertDMSToDecimal(bin.location.longitude);
    const address = await this.getAddressFromCoords(lat, lng);

    const content = `
      <div class="info-window-container" style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 320px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: ${
          isDamaged ? '#FEE2E2' : '#F3F4F6'
        }; padding: 16px; border-bottom: 1px solid ${
      isDamaged ? '#FCA5A5' : '#E5E7EB'
    };">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <h3 style="margin: 0; color: ${
              isDamaged ? '#991B1B' : '#111827'
            }; font-size: 18px; font-weight: 600;">
              Bin #${bin.id}
            </h3>
            <span style="
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 500;
              background: ${isDamaged ? '#FEE2E2' : '#F3F4F6'};
              color: ${isDamaged ? '#991B1B' : '#1F2937'};
              border: 1px solid ${isDamaged ? '#FCA5A5' : '#E5E7EB'};
            ">
              ${this.getStatusText(bin)}
            </span>
          </div>
          <p style="margin: 0; color: ${
            isDamaged ? '#991B1B' : '#6B7280'
          }; font-size: 14px;">
            ${this.getBinTypeText(bin.type)}
          </p>
        </div>

        <!-- Damage Alert -->
        ${
          isDamaged
            ? `
          <div style="background: #FEF2F2; padding: 12px 16px; border-bottom: 1px solid #FCA5A5;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #991B1B;">⚠️</span>
              <p style="margin: 0; color: #991B1B; font-size: 14px; font-weight: 500;">
                Maintenance Required
              </p>
            </div>
          </div>`
            : ''
        }

        <!-- Info Section -->
        <div style="padding: 16px;">
          <!-- Capacity -->
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
              Capacity Information
            </h4>
            <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B7280; font-size: 14px;">Maximum Capacity</span>
                <span style="color: #111827; font-weight: 500; font-size: 14px;">${
                  bin.capacity
                } kg</span>
              </div>
            </div>
          </div>

          <!-- Last Emptied -->
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
              Last Collection
            </h4>
            <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B7280; font-size: 14px;">Timestamp</span>
                <span style="color: #111827; font-weight: 500; font-size: 14px;">
                  ${new Date(bin.lastEmptied).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div>
            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
              Address
            </h4>
            <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB;">
              <div>
                <span style="display: block; color: #111827; font-weight: 500; font-size: 14px;">
                  ${address}
                </span>
              </div>
            </div>
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

  getAddressFromCoords(lat: number, lng: number): Promise<string> {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      const latLng = { lat, lng };

      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results[0].formatted_address);
        } else {
          console.warn(`Geocoder failed: ${status}`);
          resolve('Address not available');
        }
      });
    });
  }

  getBinIcon(bin: Bin): string {
    const isDamaged =
      (bin.id !== undefined && this.damagedBins.has(bin.id)) ||
      bin.status === 4;

    if (isDamaged) {
      return 'assets/images/transferir.jpeg'; // make sure this image exists in your assets/images folder
    }

    switch (bin.type) {
      case 0:
        return 'assets/images/general-waste.png';
      case 1:
        return 'assets/images/bin.png';
      case 2:
        return 'assets/images/organic-bin.png';
      case 3:
        return 'assets/images/hazardous-bin.png';
      default:
        return 'assets/images/default-bin.png';
    }
  }

  setMarkerVisibility(marker: any): void {
    const zoomLevel = this.map.getZoom();
    marker.setVisible(zoomLevel >= 12);
  }

  selectCard(bin: Bin): void {
    let lat: number;
    let lng: number;
    const latStr = bin.location.latitude?.toString().trim() || '';
    const lngStr = bin.location.longitude?.toString().trim() || '';

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

      const markers = this.map.markers;
      if (markers) {
        const marker = markers.find(
          (m: any) =>
            m.getPosition().lat() === lat && m.getPosition().lng() === lng
        );
        if (marker) {
          google.maps.event.trigger(marker, 'click');
        }
      }
    }
  }

  convertDMSToDecimal(dms: string | number | undefined): number {
    if (dms === undefined || dms === null) return NaN;

    if (typeof dms === 'number') return dms;

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
    if (
      (bin.id !== undefined && this.damagedBins.has(bin.id)) ||
      bin.status === 4
    ) {
      return 'Damaged';
    }

    switch (bin.status) {
      case 0:
        return 'status-empty';
      case 1:
        return 'status-partial';
      case 2:
        return 'status-full';
      case 3:
        return 'status-overflow';
      default:
        return 'status-empty';
    }
  }

  getStatusText(bin: Bin): string {
    if (
      (bin.id !== undefined && this.damagedBins.has(bin.id)) ||
      bin.status === 4
    ) {
      return 'Damaged';
    }

    switch (bin.status) {
      case 0:
        return 'Empty';
      case 1:
        return 'Partial';
      case 2:
        return 'Almost Full';
      case 3:
        return 'Full';
      default:
        return 'Unknown';
    }
  }

  getBinTypeText(type: number): string {
    switch (type) {
      case 0:
        return 'General Waste';
      case 1:
        return 'Recycling';
      case 2:
        return 'Organic';
      case 3:
        return 'Hazardous';
      default:
        return 'Unknown';
    }
  }

  refreshMap(): void {
    this.loadBins();
  }
}
