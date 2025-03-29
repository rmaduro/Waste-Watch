import { Component, OnInit } from '@angular/core';
import { BinService, Bin } from '../../services/BinService';
import { faMapMarkerAlt, faRoute, faLock, faUnlock, faSync } from '@fortawesome/free-solid-svg-icons';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-bin-map',
  standalone: true,
  templateUrl: './bin-map-component.html',
  styleUrls: ['./bin-map-component.css'],
  imports: [CommonModule, FontAwesomeModule, SideNavComponent],
})
export class BinMapComponent implements OnInit {
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

  constructor(
    private binService: BinService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthorization();
    this.loadBins();
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
      },
      error: (err) => {
        console.error('Error loading bins:', err);
        this.errorMessage = 'Failed to load bin data. Please try again later.';
        this.isLoading = false;
      }
    });
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
