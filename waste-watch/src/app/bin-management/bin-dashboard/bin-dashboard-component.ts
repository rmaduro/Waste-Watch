import { Component, OnInit } from '@angular/core';
import { BinService, CollectionHistory } from '../../services/BinService';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './bin-dashboard-component.html',
  styleUrls: ['./bin-dashboard-component.css'],
  imports: [CommonModule, FontAwesomeModule, SideNavComponent, TranslateModule],
  providers: [TranslateService]
})
export class BinDashboardComponent implements OnInit {
  // Icons
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

  // Data properties
  inMaintenanceBins: number = 0;
  totalBinsCollected: number = 0;
  almostFullBins: number = 0;
  collectionHistory: CollectionHistory[] = [];
  maintenanceHistory: any[] = [];

  // Language properties
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

  // State properties
  isLoading: boolean = false;
  error: string | null = null;
  reportGenerated: boolean = false;

  constructor(private binService: BinService, private translate: TranslateService) {
    const savedLang = localStorage.getItem('userLanguage') || 'en';
    this.changeLanguage(savedLang);
  }

  ngOnInit(): void {
    this.loadDashboardData();
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

  loadDashboardData(): void {
    this.binService.getActiveMaintenanceBins().subscribe((data) => {
      this.inMaintenanceBins = data.length;
    });

    this.binService.getTotalCollections().subscribe((data) => {
      this.totalBinsCollected = data.totalCollections;
    });

    this.binService.getAlmostFullBins().subscribe((data) => {
      this.almostFullBins = data.length;
    });

    this.binService.getCollectionHistory().subscribe((data) => {
      if (Array.isArray(data) && data.length > 0) {
        this.collectionHistory = data.map((entry: any) => {
          const timestamp = entry.timestamp ? this.fixTimestamp(entry.timestamp) : null;
          return {
            id: entry.id,
            binId: entry.binId,
            vehicleId: entry.vehicleId,
            timestamp: timestamp ? timestamp.toISOString() : "",
            collectionStatus: entry.collectionStatus,
            issuesLogged: entry.issuesLogged,
            amountCollected: entry.amountCollected
          };
        });
      } else {
        this.collectionHistory = [];
      }
    });

    this.binService.getMaintenanceHistory().subscribe((data) => {
      this.maintenanceHistory = data;
    });
  }

  fixTimestamp(timestamp: string): Date | null {
    if (timestamp) {
      const truncatedTimestamp = timestamp.slice(0, 23);
      const date = new Date(truncatedTimestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
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
      const pageHeight = pdf.internal.pageSize.height;
      const bottomMargin = 25;
      const maxTableHeight = pageHeight - bottomMargin;

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

      const addMaintenanceTable = (startY: number) => {
        const rowHeight = 9;
        const colWidths = [20, 25, 25, 25, 25, 30, 20];

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

        let currentY = printTableHeader(startY);

        this.maintenanceHistory.forEach((record, index) => {
          const nextRowY = currentY + rowHeight;

          if (nextRowY > maxTableHeight) {
            pdf.addPage();
            addPageHeader();
            currentY = printTableHeader(30);
          }

          pdf.setFillColor(index % 2 === 0 ? 245 : 255, 245, 245);
          pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
          pdf.setTextColor(80, 80, 80);
          pdf.setFontSize(8);

          const rowData = [
            record.binId || 'N/A',
            record.type || 'Unknown',
            formatDate(record.startDate),
            record.endDate ? formatDate(record.endDate) : 'Ongoing',
            record.status || 'Unknown',
            record.maintenanceType || 'Unspecified',
            record.userId || 'N/A'
          ];

          let xPos = margin;
          rowData.forEach((text, i) => {
            pdf.text(text?.toString() || 'N/A', xPos + 3, currentY + 6);
            xPos += colWidths[i];
          });

          currentY += rowHeight;
        });

        return currentY + 10;
      };

      // Cover Page
      pdf.setFillColor(51, 122, 183);
      pdf.rect(0, 0, pageWidth, 100, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(26);
      pdf.text('MAINTENANCE REPORT', margin, 50);
      pdf.setFontSize(12);
      pdf.text(`Bins in Maintenance: ${this.inMaintenanceBins}`, margin, 65);
      pdf.text(new Date().toLocaleDateString(), margin, 75);

      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, 110, contentWidth, 30, 'F');
      const coverSummaryText = `This report provides a summary of all maintenance activities for waste collection bins, including preventive, corrective, and emergency efforts.`;
      addParagraph(coverSummaryText, 120);

      // Detailed Records
      pdf.addPage();
      addPageHeader();
      addSectionHeader('DETAILED MAINTENANCE RECORDS', 40);
      let currentY = addParagraph(
        `Complete log of maintenance activities, including types, dates, and technician assignments.`,
        50
      );

      addMaintenanceTable(currentY + 10);

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(i, totalPages);
      }

      pdf.save(`Maintenance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      this.error = 'Failed to generate report';
    }
  }
}
