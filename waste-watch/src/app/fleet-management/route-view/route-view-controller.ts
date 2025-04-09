import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { VehicleService, Vehicle } from '../../services/FleetService';

@Component({
  selector: 'app-route-viewer',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './route-view-component.html',
  styleUrls: ['./route-view-controller.css']
})
export class RouteViewerComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  vehicle: Vehicle | null = null;
  map: any = null;
  directionsService: google.maps.DirectionsService;
  directionsRenderer: google.maps.DirectionsRenderer;

  center: google.maps.LatLngLiteral = { lat: 38.7167, lng: -9.1333 };
  zoom = 12;

  faArrowLeft = faArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
    });
  }

  ngOnInit() {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.vehicleService.getVehicles().subscribe(vehicles => {
        this.vehicle = vehicles.find(v => v.id === parseInt(vehicleId, 10)) || null;
        if (this.vehicle?.route?.locations.length) {
          this.initMap();
        }
      });
    }
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      mapTypeId: 'roadmap',
      streetViewControl: false
    });

    this.directionsRenderer.setMap(this.map);

    if (this.vehicle?.route?.locations.length) {
      const waypoints = this.vehicle.route.locations.map(loc => ({
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude)
      }));

      this.calculateAndDisplayRoute(waypoints);
    }
  }

  calculateAndDisplayRoute(waypoints: google.maps.LatLngLiteral[]) {
    if (waypoints.length < 2) return;

    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const middleWaypoints = waypoints.slice(1, -1).map(point => ({
      location: point,
      stopover: true
    }));

    this.directionsService.route(
      {
        origin,
        destination,
        waypoints: middleWaypoints,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          this.directionsRenderer.setDirections(response);
        }
      }
    );
  }

  goBack() {
    this.router.navigate(['/vehicles']);
  }
}
