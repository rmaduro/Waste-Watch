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
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { jsPDF } from 'jspdf';


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
  faFilePdf = faFilePdf;

  // Correctly type the data here
  inMaintenanceBins: number = 0;
  totalBinsCollected: number = 0;
  almostFullBins: number = 0;
  collectionHistory: CollectionHistory[] = []; // Now using the CollectionHistory type
  maintenanceHistory: any[] = [];

  constructor(private binService: BinService) { }

  isLoading: boolean = false;
  error: string | null = null;
  reportGenerated: boolean = false;

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

  async generateMaintenanceReport() {
    this.isLoading = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const pageHeight = pdf.internal.pageSize.height; // typically 297mm for A4
      const bottomMargin = 25; // Leave space for footer
      const maxTableHeight = pageHeight - bottomMargin; // the approximate area where we can safely write rows

      // Helper to format date as DD/MM/YYYY
      const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${
          (date.getMonth() + 1).toString().padStart(2, '0')
        }/${date.getFullYear()}`;
      };

      const addPageHeader = () => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 0, pageWidth, 15, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('WasteWatch Maintenance Report', margin, 10);
        const companyLogo = 'assets/images/logo2.png';
        pdf.addImage(companyLogo, 'PNG', pageWidth - 30, 3, 15, 15);
      };

      const addPageFooter = (pageNum: number, totalPages: number) => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${pageNum} of ${totalPages}`, margin, pageHeight - 5);
        pdf.text(
          `Generated: ${new Date().toLocaleString()}`,
          pageWidth - margin,
          pageHeight - 5,
          { align: 'right' }
        );
      };

      const addSectionHeader = (title: string, y: number = 30) => {
        pdf.setFontSize(14);
        pdf.setTextColor(51, 122, 183);
        pdf.text(title, margin, y);
      };

      const addParagraph = (text: string, startY: number) => {
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, startY);
        return startY + lines.length * 4.5;
      };

      /**
       * Prints the maintenance table, ensuring we only add a new page
       * when the next row won't fit on the current page.
       */
      const addMaintenanceTable = (startY: number) => {
        const rowHeight = 9;
        const colWidths = [20, 25, 25, 25, 25, 30, 20];

        // Print table header at the top of the table region
        const printTableHeader = (headerY: number) => {
          pdf.setFillColor(51, 122, 183);
          pdf.rect(margin, headerY, contentWidth, rowHeight, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);

          let xPos = margin;
          const headers = [
            'Bin ID',
            'Type',
            'Start Date',
            'End Date',
            'Status',
            'Maintenance Type',
            'Technician'
          ];

          headers.forEach((header, i) => {
            pdf.text(header, xPos + 3, headerY + 6.5);
            xPos += colWidths[i];
          });
          return headerY + rowHeight;
        };

        // Start by printing the table header
        let currentY = printTableHeader(startY);

        // Print each row, checking space before printing
        this.maintenanceHistory.forEach((record, index) => {
          const nextRowY = currentY + rowHeight;

          // If we don't have enough room for the next row, add a new page
          if (nextRowY > maxTableHeight) {
            pdf.addPage();
            addPageHeader();

            // Start new page a bit lower to avoid colliding with header
            currentY = printTableHeader(30);
          }

          // Fill row background color
          pdf.setFillColor(index % 2 === 0 ? 245 : 255, 245, 245);
          pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
          pdf.setTextColor(80, 80, 80);
          pdf.setFontSize(8);

          // Prepare row data with formatted dates
          const rowData = [
            record.binId || 'N/A',
            record.type || 'Unknown',
            formatDate(record.startDate),
            record.endDate ? formatDate(record.endDate) : 'Ongoing',
            record.status || 'Unknown',
            record.maintenanceType || 'Unspecified',
            record.userId || 'N/A'
          ];

          // Print the row cells
          let xPos = margin;
          rowData.forEach((text, i) => {
            pdf.text(text?.toString() || 'N/A', xPos + 3, currentY + 6);
            xPos += colWidths[i];
          });

          currentY += rowHeight;
        });

        return currentY + 10; // Some spacing after the table
      };

      // --- COVER PAGE ---
      pdf.setFillColor(51, 122, 183);
      pdf.rect(0, 0, pageWidth, 100, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(26);
      pdf.text('MAINTENANCE REPORT', margin, 50);
      pdf.setFontSize(12);
      pdf.text(`Bins in Maintenance: ${this.inMaintenanceBins}`, margin, 65);
      pdf.text(new Date().toLocaleDateString(), margin, 75);

      // Summary Block on Cover Page
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, 110, contentWidth, 30, 'F');
      const coverSummaryText = `This report provides a summary of all maintenance activities for waste collection bins, including preventive, corrective, and emergency efforts.`;
      addParagraph(coverSummaryText, 120);

      // --- DETAILED MAINTENANCE RECORDS ---
      pdf.addPage();
      addPageHeader();
      addSectionHeader('DETAILED MAINTENANCE RECORDS', 40);
      let currentY = addParagraph(
        `Complete log of maintenance activities, including types, dates, and technician assignments.`,
        50
      );

      // Add the table
      addMaintenanceTable(currentY + 10);

      // Add footers to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(i, totalPages);
      }

      pdf.save(
        `Maintenance_Report_${new Date().toISOString().split('T')[0]}.pdf`
      );
      this.isLoading = false;
    } catch (error) {
      console.error('Error generating maintenance report:', error);
      this.isLoading = false;
      // Handle error appropriately
    }
  }        }
