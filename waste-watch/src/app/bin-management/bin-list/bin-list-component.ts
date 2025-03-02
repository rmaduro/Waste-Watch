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
import { BinService } from './bin-list-service/bin-list-service';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';

// Moved Bin interface directly into the component
export interface Bin {
  id?: number;
  location: string;
  fillLevel: number;
  status: string;
  type: string;
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
  selectedType = '';
  searchQuery = '';
  selectedBin: Bin | null = null;
  showAddForm = false;
  showDeleteConfirmation = false;

  bin: Bin = {
    location: '',
    fillLevel: 0,
    status: 'Empty',
    type: 'General'
  };

  constructor(private binService: BinService) {}

  ngOnInit(): void {
    this.loadBins();
  }

  loadBins(): void {
    this.isLoading = true;
    this.error = '';

    this.binService.getBins().subscribe({
      next: (data) => {
        this.bins = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bins:', err);
        this.error = 'Failed to load bins. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      // Reset form when opening
      this.clearForm();
    }
  }

  get filteredBins() {
    return this.bins.filter((bin) => {
      return (
        (this.selectedStatus === '' || bin.status === this.selectedStatus) &&
        (this.selectedType === '' || bin.type === this.selectedType) &&
        (this.searchQuery === '' ||
          (bin.id && bin.id.toString().includes(this.searchQuery)) ||
          bin.location.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    });
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
          console.error('Error deleting bin:', err);
          this.error = 'Failed to delete bin. Please try again later.';
          this.isLoading = false;
          this.showDeleteConfirmation = false;
        }
      });
    }
  }

  addBin() {
    if (this.bin.location) {
      this.isLoading = true;

      this.binService.addBin(this.bin).subscribe({
        next: () => {
          this.loadBins();
          this.clearForm();
          this.showAddForm = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error adding bin:', err);
          this.error = 'Failed to add bin. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  clearForm() {
    this.bin = {
      location: '',
      fillLevel: 0,
      status: 'Empty',
      type: 'General'
    };
  }

  // Helper method to get status class
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'empty':
        return 'status-empty';
      case 'partial':
        return 'status-partial';
      case 'full':
        return 'status-full';
      case 'overflow':
        return 'status-overflow';
      default:
        return '';
    }
  }
}
