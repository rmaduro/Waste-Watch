import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/AuthService'; // Adjust the path as necessary
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  faTruck,
  faGasPump,
  faExclamationTriangle,
  faChartLine,
  faSync,
  faTools,
} from '@fortawesome/free-solid-svg-icons';
import Chart from 'chart.js/auto';

interface Alert {
  id: string;
  type: 'Critical' | 'Warning';
  message: string;
  details: string;
}

@Component({
  selector: 'app-fleet-dashboard',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SideNavComponent,TranslateModule],
  templateUrl: './fleet-dashboard-component.html',
  styleUrls: ['./fleet-dashboard-component.css'],
})
export class FleetDashboardComponent implements OnInit {
  @ViewChild('barChart', { static: true })
  barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: true })
  pieChart!: ElementRef<HTMLCanvasElement>;

  faTruck = faTruck;
  faGasPump = faGasPump;
  faExclamationTriangle = faExclamationTriangle;
  faChartLine = faChartLine;
  faSync = faSync;
  faTools = faTools;

  activeTrucks: number = 4;
  fuelEfficiency: number = 4;
  nearingCapacity: number = 4;
  todayCollections: number = 145;
  collectionTrend: number = 5.25;
  isLoading: boolean = false;

  activeAlerts: Alert[] = [
    {
      id: 'T001',
      type: 'Critical',
      message: 'Truck #T001 Critical',
      details: 'Requires immediate maintenance - structural damage',
    },
    {
      id: 'T002',
      type: 'Warning',
      message: 'Truck #T002 Warning',
      details: 'Approaching full capacity',
    },
  ];

  collectionTypeData: number[] = [40, 25, 20, 15];
  collectionTypeLabels: string[] = [
    'General',
    'Recycling',
    'Compost',
    'Hazardous',
  ];
  collectionsData: number[] = [120, 140, 160, 135, 150, 170, 145];
  collectionLabels: string[] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  barChartInstance!: Chart;
  pieChartInstance!: Chart;

  currentUser: { email: string; userName: string; roles: string[] } | null =
    null;

  constructor(private authService: AuthService, private translate: TranslateService) {
      translate.setDefaultLang('en');
      translate.use('en');
    }

  ngOnInit(): void {
    this.loadDashboardData();

    // Subscribe to currentUser$ observable to get the logged-in user info
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user; // Store the logged-in user data
      console.log('Logged-in User Info:', this.currentUser); // Print the logged-in user info to the console
    });

    setTimeout(() => {
      this.renderChart();
      this.renderPieChart();
    }, 100);
  }

  loadDashboardData(): void {
    this.todayCollections = Math.floor(Math.random() * 50) + 130;
    this.collectionTrend = parseFloat((Math.random() * 10 - 5).toFixed(2));

    this.collectionsData = this.collectionsData.map(
      (value) => value + Math.floor(Math.random() * 10 - 5)
    );

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
}
