import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Bin } from '../bin-list-component';

@Injectable({
  providedIn: 'root'
})
export class BinService {
  private apiUrl = 'https://api.example.com/bins'; // Replace with your actual API endpoint

  // Mock data for demonstration
  private mockBins: Bin[] = [
    { id: 1, location: 'Main Street', fillLevel: 25, status: 'Partial', type: 'General' },
    { id: 2, location: 'City Park', fillLevel: 10, status: 'Empty', type: 'Recycling' },
    { id: 3, location: 'Downtown Plaza', fillLevel: 90, status: 'Full', type: 'General' },
    { id: 4, location: 'Industrial Zone', fillLevel: 100, status: 'Overflow', type: 'Hazardous' }
  ];

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // For demonstration, using mock data
  // In a real application, replace with actual HTTP calls
  getBins(): Observable<Bin[]> {
    // Uncomment for real API call
    // return this.http.get<Bin[]>(this.apiUrl);

    // Using mock data
    return of(this.mockBins);
  }

  addBin(bin: Bin): Observable<Bin> {
    // Uncomment for real API call
    // return this.http.post<Bin>(this.apiUrl, bin, this.httpOptions);

    // Using mock data
    const newBin = { ...bin, id: this.mockBins.length + 1 };
    this.mockBins.push(newBin);
    return of(newBin);
  }

  deleteBin(id: number): Observable<any> {
    // Uncomment for real API call
    // return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions);

    // Using mock data
    const index = this.mockBins.findIndex(bin => bin.id === id);
    if (index !== -1) {
      this.mockBins.splice(index, 1);
    }
    return of({});
  }
}
