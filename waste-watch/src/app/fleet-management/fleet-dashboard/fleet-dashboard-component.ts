import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { BinService } from '../../services/BinService';
import { VehicleService } from '../../services/FleetService';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { faTruck, faGasPump, faExclamationTriangle, faChartLine, faSync, faTools } from '@fortawesome/free-solid-svg-icons';
import Chart from 'chart.js/auto';

interface Alert {
  id: string;
  type: 'Critical' | 'Warning';
  message: string;
  details: string;
}

export interface CollectionData {
  activeTrucks: number;
  fuelEfficiency: number;
  nearingCapacity: number;
  todayCollections: number;
  totalCollections: number;
  collectionTrend: number;
  activeAlerts: Alert[];
  collectionTypeData: number[];
  collectionsData: number[];
}


@Component({
  selector: 'app-fleet-dashboard',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SideNavComponent],
  templateUrl: './fleet-dashboard-component.html',
  styleUrls: ['./fleet-dashboard-component.css'],
})
export class FleetDashboardComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: true }) pieChart!: ElementRef<HTMLCanvasElement>;

  faTruck = faTruck;
  faGasPump = faGasPump;
  faExclamationTriangle = faExclamationTriangle;
  faChartLine = faChartLine;
  faSync = faSync;
  faTools = faTools;

  activeTrucks: number = 0;
  fuelEfficiency: number = 0;
  avgCO2Emissions: number = 0;
  todayCollections: number = 0;
  totalCollections: number = 0;
  collectionTrend: number = 0;
  isLoading: boolean = false;

  activeAlerts: Alert[] = [];
  collectionTypeData: number[] = [];
  collectionTypeLabels: string[] = ['General', 'Recycling', 'Compost', 'Hazardous'];
  collectionsData: number[] = [];
  collectionLabels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  barChartInstance!: Chart;
  pieChartInstance!: Chart;

  currentUser: { email: string; userName: string; roles: string[] } | null = null;

  constructor(
    private authService: AuthService,
    private binService: BinService,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();

    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      console.log('Logged-in User Info:', this.currentUser);
    });

    setTimeout(() => {
      this.renderChart();
      this.renderPieChart();
    }, 100);
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Fetch overall collection data
    this.binService.getCollectionData().subscribe(
      (data: CollectionData) => {
        console.log('Fetched Collection Data:', data);

        this.fuelEfficiency = data.fuelEfficiency || 0;
        this.totalCollections = data.totalCollections || 0;
        console.log('Total Collections:', this.totalCollections);

        this.collectionTrend = data.collectionTrend || 0;
        this.activeAlerts = data.activeAlerts || [];
        this.collectionTypeData = data.collectionTypeData || [];
        this.collectionsData = data.collectionsData || [];

        this.countActiveTrucks();
        this.updateCharts();
      },
      (error) => {
        console.error('Error fetching collection data:', error);
      }
    );

    // Fetch daily collection data
    this.binService.getDailyCollections().subscribe(
      (dailyCollections) => {
        this.todayCollections = dailyCollections; // Now correctly a number
        console.log("Today's Collections:", this.todayCollections);
      },
      (error) => {
        console.error('Error fetching daily collection data:', error);
        this.todayCollections = 0;
      }
    );




    this.isLoading = false;
  }

  countActiveTrucks(): void {
    this.vehicleService.getVehicles().subscribe((vehicles) => {
      this.activeTrucks = vehicles.filter((vehicle) => vehicle.status === 'Active').length;
      console.log('Active Trucks:', this.activeTrucks);
    });
  }

  updateCharts(): void {
    if (this.barChartInstance) {
      this.barChartInstance.data.datasets[0].data = this.collectionsData;
      this.barChartInstance.update();
    }

    if (this.pieChartInstance) {
      this.pieChartInstance.data.datasets[0].data = this.collectionTypeData;
      this.pieChartInstance.update();
    }
  }

  renderChart(): void {
    if (!this.barChart?.nativeElement) return;

    this.barChartInstance = new Chart(this.barChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.collectionLabels,
        datasets: [
          {
            label: 'Collections',
            data: this.collectionsData,
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.2)',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#16a34a',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
          x: { display: true },
        },
      },
    });
  }

  renderPieChart(): void {
    if (!this.pieChart?.nativeElement) return;

    this.pieChartInstance = new Chart(this.pieChart.nativeElement, {
      type: 'pie',
      data: {
        labels: this.collectionTypeLabels,
        datasets: [
          {
            label: 'Monthly Collection Breakdown',
            data: this.collectionTypeData,
            backgroundColor: ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444'],
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
        },
      },
    });
  }

  refreshData(): void {
    this.isLoading = true;
    this.loadDashboardData();
  }
}
