// src/app/bin-management/bin-dashboard/bin-dashboard-component.ts

import { Component, OnInit } from '@angular/core';
import { BinService, CollectionHistory } from '../../services/BinService'; // Import CollectionHistory here
// Import new icons for your dashboard
import {
  faTrash,
  faSync,
  faTools,
  faTrashRestore,
  faExclamationTriangle,
  faHistory,
  faIdCard,
  faBinoculars,
  faClock,
  faArrowUp,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './bin-dashboard-component.html',
  styleUrls: ['./bin-dashboard-component.css'],
  imports: [CommonModule, FontAwesomeModule, SideNavComponent], // Add SideNavComponent here
})
export class BinDashboardComponent implements OnInit {
  // Assign icons to class properties
  faTrash = faTrash;
  faSync = faSync;
  faTools = faTools;
  faTrashRestore = faTrashRestore;
  faExclamationTriangle = faExclamationTriangle;
  faHistory = faHistory;
  faIdCard = faIdCard;
  faBinoculars = faBinoculars;
  faClock = faClock;
  faArrowUp = faArrowUp;
  faWrench = faWrench;

  // Correctly type the data here
  inMaintenanceBins: number = 0;
  totalBinsCollected: number = 0;
  almostFullBins: number = 0;
  collectionHistory: CollectionHistory[] = []; // Now using the CollectionHistory type
  maintenanceHistory: any[] = [];

  constructor(private binService: BinService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Fetch the number of bins in maintenance
    this.binService.getActiveMaintenanceBins().subscribe((data) => {
      this.inMaintenanceBins = data.length;
    });

    // Fetch total bins collected
    this.binService.getTotalCollections().subscribe((data) => {
      this.totalBinsCollected = data.totalCollections;
    });

    // Fetch bins that are almost full
    this.binService.getAlmostFullBins().subscribe((data) => {
      this.almostFullBins = data.length;
    });

    // Fetch collection history with the new structure
    this.binService.getCollectionHistory().subscribe((data) => {
      console.log("Raw API Response:", data); // Debugging step

      if (Array.isArray(data) && data.length > 0) {
        this.collectionHistory = data.map((entry: any) => {
          const timestamp = entry.timestamp ? this.fixTimestamp(entry.timestamp) : null;

          return {
            id: entry.id,
            binId: entry.binId,
            vehicleId: entry.vehicleId,
            timestamp: timestamp ? timestamp.toISOString() : "", // Ensure timestamp is a string
            collectionStatus: entry.collectionStatus,
            issuesLogged: entry.issuesLogged,
            amountCollected: entry.amountCollected
          };
        });

        console.log("Mapped Collection History:", this.collectionHistory); // Debugging step
      } else {
        console.error("Expected an array, but got:", data);
        this.collectionHistory = [];
      }
    });


    // Fetch maintenance history
    this.binService.getMaintenanceHistory().subscribe((data) => {
      this.maintenanceHistory = data;
    });
  }
    // Helper function to sanitize timestamp and ensure it's a valid Date
  fixTimestamp(timestamp: string): Date | null {
    // Check if timestamp is valid
    if (timestamp) {
      // Truncate the timestamp if it's too precise, to make it parseable
      const truncatedTimestamp = timestamp.slice(0, 23); // Keep only the first 23 characters (YYYY-MM-DDTHH:mm:ss.SSS)
      const date = new Date(truncatedTimestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    return null; // Return null if timestamp is undefined or invalid
  }

  loadMaintenanceData(): void {
    // Fetch active bins under maintenance
    this.binService.getActiveMaintenanceBins().subscribe(
      (bins) => {
        this.inMaintenanceBins = bins.length;
        console.log('Active Maintenance Bins:', bins);
      },
      (error) => {
        console.error('Error fetching active maintenance bins:', error);
      }
    );

    // Fetch maintenance history and map the data correctly
    this.binService.getMaintenanceHistory().subscribe(
      (data: any[]) => {
        console.log('Raw Maintenance History API Response:', data); // Log raw data for debugging

        this.maintenanceHistory = data.map((record) => ({
          binId: record.binId,
          type: record.type,
          status: record.status,
          capacity: record.capacity,
          lastEmptied: record.lastEmptied,
          location: record.location,
          userId: record.userId,
          startDate: record.startDate,
          endDate: record.endDate ?? 'Ongoing',
          maintenanceType: record.maintenanceType,
          description: record.description,
        }));

        console.log('Mapped Maintenance History:', this.maintenanceHistory); // Log mapped data
      },
      (error) => {
        console.error('Error fetching maintenance history:', error);
      }
    );
  }


  refreshData(): void {
    this.loadDashboardData();
  }
}
