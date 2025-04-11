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
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { BinService } from '../../services/BinService';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface Bin {
  id?: number;
  type: number;
  status: number;
  capacity: number;
  lastEmptied: string;
  location: {
    longitude: string;
    latitude: string;
    timestamp: string;
  };
  fillLevel?: number;
}

@Component({
  selector: 'app-bin-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule,
    SideNavComponent,
    TranslateModule,
  ],
  providers: [BinService],
  templateUrl: './bin-list-component.html',
  styleUrls: ['./bin-list-components.css'],
})
export class BinListComponent implements OnInit {
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
  currentLanguage = 'en';
  currentLanguageFlag = 'gb';
  currentLanguageName = 'English';
  languageOptions = [
    { code: 'en', flag: 'gb', name: 'English' },
    { code: 'es', flag: 'es', name: 'Español' },
    { code: 'de', flag: 'de', name: 'Deutsch' },
    { code: 'pt', flag: 'pt', name: 'Português' },
    { code: 'fr', flag: 'fr', name: 'Français' },
  ];

  bin: Bin = {
    type: 0,
    status: 0,
    capacity: 100,
    lastEmptied: new Date().toISOString(),
    location: {
      longitude: '',
      latitude: '',
      timestamp: new Date().toISOString(),
    },
    fillLevel: 0,
  };

  currentPage: number = 1;
  pageSize: number = 7;

  get totalPages(): number {
    return Math.ceil(this.bins.length / this.pageSize);
  }

  constructor(
    private binService: BinService,
    private translate: TranslateService
  ) {
    const savedLang = localStorage.getItem('userLanguage') || 'en';
    this.changeLanguage(savedLang);
  }

  ngOnInit(): void {
    this.loadBins();
  }

  changeLanguage(langCode: string) {
    const selectedLang = this.languageOptions.find((l) => l.code === langCode);
    if (selectedLang) {
      this.currentLanguage = selectedLang.code;
      this.currentLanguageFlag = selectedLang.flag;
      this.currentLanguageName = selectedLang.name;
      this.translate.use(langCode);
      localStorage.setItem('userLanguage', langCode);
    }
  }

  loadBins(): void {
    this.isLoading = true;
    this.error = '';

    this.binService.getBins().subscribe({
      next: (data: Bin[]) => {
        this.bins = data.map((bin) => {
          const fillLevel = this.calculateFillLevel(bin);
          return {
            ...bin,
            fillLevel: fillLevel,
            status: this.getStatusBasedOnFillLevel(fillLevel),
          };
        });
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load bins. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  get paginatedBins() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.bins.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.bins.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  calculateFillLevel(bin: Bin): number {
    return bin.capacity > 0 ? bin.status * 25 : 0;
  }

  get filteredBins() {
    return this.bins.filter((bin) => {
      const statusMatches =
        this.selectedStatus === '' ||
        bin.status === parseInt(this.selectedStatus, 10);
      const typeMatches =
        this.selectedType === '' ||
        this.getTypeNumericValue(this.selectedType) === bin.type;

      const searchMatches =
        this.searchQuery === '' ||
        (bin.id && bin.id.toString().includes(this.searchQuery));

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
        error: () => {
          this.error = 'Failed to delete bin. Please try again later.';
          this.isLoading = false;
          this.showDeleteConfirmation = false;
        },
      });
    }
  }

  addBin() {
    this.isLoading = true;
    this.error = '';

    const newBin: Bin = {
      ...this.bin,
      type: this.getTypeNumericValue(this.bin.type.toString()),
      lastEmptied: new Date().toISOString(),
      location: {
        longitude: this.bin.location.longitude,
        latitude: this.bin.location.latitude,
        timestamp: new Date().toISOString(),
      },
    };

    this.binService.createBin(newBin).subscribe({
      next: () => {
        this.loadBins();
        this.clearForm();
        this.showAddForm = false;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to add bin. Please check the data and try again.';
        this.isLoading = false;
      },
    });
  }

  clearForm() {
    this.bin = {
      type: 0,
      status: 0,
      capacity: 0,
      lastEmptied: new Date().toISOString(),
      location: {
        longitude: '',
        latitude: '',
        timestamp: new Date().toISOString(),
      },
      fillLevel: 0,
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
    this.bin.location.longitude = '';
    this.bin.location.latitude = '';
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

  getStatusBasedOnFillLevel(fillLevel: number): number {
    if (fillLevel === 0) {
      return 0;
    } else if (fillLevel > 0 && fillLevel <= 50) {
      return 1;
    } else if (fillLevel > 50 && fillLevel <= 100) {
      return 2;
    } else {
      return 3;
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
        return 0;
    }
  }

  getTypeText(type: number): string {
    switch (type) {
      case 0:
        return 'General';
      case 1:
        return 'Recycling';
      case 2:
        return 'Compost';
      case 3:
        return 'Hazardous';
      default:
        return 'Unknown';
    }
  }
}
