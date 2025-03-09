import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import {
  faTruck,
  faGasPump,
  faExclamationTriangle,
  faChartLine,
  faSync,
  faTools
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
  imports: [CommonModule, FontAwesomeModule, SideNavComponent],
  templateUrl: './fleet-dashboard-component.html',
  styleUrls: ['./fleet-dashboard-component.css']
})
export class FleetDashboardComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: true }) pieChart!: ElementRef<HTMLCanvasElement>;

  // Font Awesome Icons
  faTruck = faTruck;
  faGasPump = faGasPump;
  faExclamationTriangle = faExclamationTriangle;
  faChartLine = faChartLine;
  faSync = faSync;
  faTools = faTools;

  // Dashboard Data
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
      details: 'Requires immediate maintenance - structural damage'
    },
    {
      id: 'T002',
      type: 'Warning',
      message: 'Truck #T002 Warning',
      details: 'Approaching full capacity'
    }
  ];

  // Mock Data for Monthly Collection Types
  collectionTypeData: number[] = [40, 25, 20, 15]; // Example distribution (percentages)
  collectionTypeLabels: string[] = ['General', 'Recycling', 'Compost', 'Hazardous'];

  // Mock Data for Chart (Collections over the last 7 days)
  collectionsData: number[] = [120, 140, 160, 135, 150, 170, 145];
  collectionLabels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  barChartInstance!: Chart;
  pieChartInstance!: Chart;

  constructor() {}

  ngOnInit(): void {
    this.loadDashboardData();

    // Add a delay to ensure the DOM is fully loaded before rendering charts
    setTimeout(() => {
      this.renderChart();
      this.renderPieChart();
    }, 100); // 100ms delay
  }

  loadDashboardData(): void {
    // Simulate data updates
    this.todayCollections = Math.floor(Math.random() * 50) + 130;
    this.collectionTrend = parseFloat((Math.random() * 10 - 5).toFixed(2));

    // Update Chart Data
    this.collectionsData = this.collectionsData.map(value => value + Math.floor(Math.random() * 10 - 5));

    // Update the bar chart if it exists
    if (this.barChartInstance) {
      this.barChartInstance.data.datasets[0].data = this.collectionsData;
      this.barChartInstance.update();
    }

    // Update the pie chart if it exists
    if (this.pieChartInstance) {
      this.pieChartInstance.data.datasets[0].data = this.collectionTypeData;
      this.pieChartInstance.update();
    }
  }

  renderChart(): void {
    if (!this.barChart?.nativeElement) return; // Ensure canvas is available

    this.barChartInstance = new Chart(this.barChart.nativeElement, {
      type: 'line', // Line chart
      data: {
        labels: this.collectionLabels,
        datasets: [
          {
            label: 'Collections',
            data: this.collectionsData,
            borderColor: '#16a34a', // Line color
            backgroundColor: 'rgba(22, 163, 74, 0.2)', // Light green fill
            borderWidth: 2,
            pointRadius: 5, // Bigger points for visibility
            pointBackgroundColor: '#16a34a',
            fill: true, // Add area fill under the line
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Ensure the chart fits the container
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true },
          x: { display: true }
        }
      }
    });
  }

  renderPieChart(): void {
    if (!this.pieChart?.nativeElement) return; // Ensure canvas is available

    this.pieChartInstance = new Chart(this.pieChart.nativeElement, {
      type: 'pie',
      data: {
        labels: this.collectionTypeLabels,
        datasets: [
          {
            label: 'Monthly Collection Breakdown',
            data: this.collectionTypeData,
            backgroundColor: ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444'], // Green, Blue, Yellow, Red
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Ensure the chart fits the container
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  refreshData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.loadDashboardData();
      this.isLoading = false;
    }, 1000);
  }
}
