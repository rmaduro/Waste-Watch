import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faMinus,
  faSearch,
  faFilter,
  faTrashCan,
  faIdCard,
  faLocationDot,
  faCircle,
  faPercent,
  faTrash,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { BinService } from '../../services/BinService';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';

// ✅ Updated Bin Interface with the new fillLevel property for local use only
export interface Bin {
  id?: number;
  type: number;
  status: number;
  capacity: number;
  lastEmptied: string;
  location: {
    longitude: number;
    latitude: number;
    timestamp: string;
  };
  fillLevel?: number;  // Added for local use
}

@Component({
  selector: 'app-bin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, HttpClientModule, SideNavComponent],
  providers: [BinService],
  templateUrl: './bin-list-component.html',
  styleUrls: ['./bin-list-components.css']
})
export class BinListComponent implements OnInit {
  // Font Awesome Icons
  faPlus = faPlus;
  faMinus = faMinus;
  faSearch = faSearch;
  faFilter = faFilter;
  faTrashCan = faTrashCan;
  faIdCard = faIdCard;
  faLocationDot = faLocationDot;
  faCircle = faCircle;
  faPercent = faPercent;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;

  bins: Bin[] = [];
  isLoading = false;
  error = '';

  selectedStatus = '';
  selectedType: string = '';
  searchQuery = '';
  selectedBin: Bin | null = null;
  showAddForm = false;
  showDeleteConfirmation = false;

  // ✅ Initialize fillLevel to 0 for new bins
  bin: Bin = {
    type: 0,
    status: 0,
    capacity: 100,
    lastEmptied: new Date().toISOString(),
    location: {
      longitude: 0,
      latitude: 0,
      timestamp: new Date().toISOString()
    },
    fillLevel: 0 // This will remain local and will be updated later
  };

  constructor(private binService: BinService) {}

  ngOnInit(): void {
    this.loadBins();
  }

  loadBins(): void {
    this.isLoading = true;
    this.error = '';

    this.binService.getBins().subscribe({
      next: (data: Bin[]) => {
        // Assuming bins are fetched and fillLevel is calculated here
        this.bins = data.map(bin => {
          // Calculate and set the fillLevel if not set
          const fillLevel = this.calculateFillLevel(bin);
          return { ...bin, fillLevel: fillLevel, status: this.getStatusBasedOnFillLevel(fillLevel) };
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bins:', err);
        this.error = 'Failed to load bins. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // Calculate fillLevel as a percentage based on capacity and some other factor (e.g., current fill weight)
  calculateFillLevel(bin: Bin): number {
    // For simplicity, let's assume the bin's fill level is based on the capacity
    // You can replace this with an actual formula if you have more data
    return (bin.capacity > 0) ? (bin.status * 25) : 0;  // Dummy example, replace with actual logic
  }

  // Get filtered bins based on the status, type, and search query
  get filteredBins() {
    return this.bins.filter((bin) => {
      const statusMatches =
        this.selectedStatus === '' || bin.status === parseInt(this.selectedStatus, 10);
        const typeMatches =
        this.selectedType === '' || this.getTypeNumericValue(this.selectedType) === bin.type;

      const searchMatches =
        this.searchQuery === '' || (bin.id && bin.id.toString().includes(this.searchQuery));

      return statusMatches && typeMatches && searchMatches;
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.clearForm();
    }
  }

  selectBin(bin: Bin) {
    this.selectedBin = bin;
  }

  showDeleteDialog() {
    if (this.selectedBin) {
      this.showDeleteConfirmation = true;
    }
  }

  cancelDelete() {
    this.showDeleteConfirmation = false;
  }

  confirmDelete() {
    if (this.selectedBin && this.selectedBin.id) {
      this.isLoading = true;

      this.binService.deleteBin(this.selectedBin.id).subscribe({
        next: () => {
          this.loadBins();
          this.selectedBin = null;
          this.showDeleteConfirmation = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Error deleting bin:', err);
          this.error = 'Failed to delete bin. Please try again later.'; // Custom error message for deletion
          this.isLoading = false;
          this.showDeleteConfirmation = false;
        }
      });
    }
  }


  addBin() {
    this.isLoading = true;
    this.error = ''; // Clear previous errors if any

    const newBin: Bin = {
      ...this.bin,
      type: this.getTypeNumericValue(this.bin.type.toString()),
      lastEmptied: new Date().toISOString(),
      location: {
        longitude: this.bin.location.longitude,
        latitude: this.bin.location.latitude,
        timestamp: new Date().toISOString()
      }
    };

    this.binService.createBin(newBin).subscribe({
      next: () => {
        this.loadBins();
        this.clearForm();
        this.showAddForm = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error adding bin:', err);
        this.error = 'Failed to add bin. Please check the data and try again.'; // Custom error message
        this.isLoading = false;
      }
    });
  }


  clearForm() {
    this.bin = {
      type: 0,
      status: 0,
      capacity: 0,
      lastEmptied: new Date().toISOString(),
      location: {
        longitude: 0,
        latitude: 0,
        timestamp: new Date().toISOString()
      },
      fillLevel: 0 // Reset fillLevel when clearing the form
    };
  }

  getStatusClass(status?: number): string {
    switch (status) {
      case 0:
        return 'status-empty';
      case 1:
        return 'status-partial';
      case 2:
        return 'status-full';
      case 3:
        return 'status-overflow';
      default:
        return '';
    }
  }

  setDefaultLocation() {
    this.bin.location.longitude = 0;  // Static longitude
    this.bin.location.latitude = 0;   // Static latitude
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Empty';
      case 1:
        return 'Partial';
      case 2:
        return 'Full';
      case 3:
        return 'Overflow';
      default:
        return 'Unknown';
    }
  }

  // This method returns a status based on the fill level (in percentage)
  getStatusBasedOnFillLevel(fillLevel: number): number {
    if (fillLevel === 0) {
      return 0; // Empty
    } else if (fillLevel > 0 && fillLevel <= 50) {
      return 1; // Partial
    } else if (fillLevel > 50 && fillLevel <= 100) {
      return 2; // Full
    } else {
      return 3; // Overflow
    }
  }

  getTypeNumericValue(type: string): number {
    switch (type) {
      case 'General':
        return 0;
      case 'Recycling':
        return 1;
      case 'Compost':
        return 2;
      case 'Hazardous':
        return 3;
      default:
        return 0; // Default to General
    }
  }

  getTypeText(type: number): string {
    switch (type) {
      case 0: return 'General';
      case 1: return 'Recycling';
      case 2: return 'Compost';
      case 3: return 'Hazardous';
      default: return 'Unknown';
    }
  }
}
