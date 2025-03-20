import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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
}

export interface CollectionHistory {
  id?: number;
  binId: number;
  timestamp: string;
  amountCollected: number;
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

export interface Alert {
  id: string;
  type: 'Critical' | 'Warning';  // Update to match the strict union type
  message: string;
  details: string;
}

@Injectable({
  providedIn: 'root',
})
export class BinService {
  private binsSubject = new BehaviorSubject<Bin[]>([]);
  private apiUrl = 'https://localhost:7259/api/bins';
  private collectionApiUrl = 'https://localhost:7259/api/collection-history';

  bins$ = this.binsSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {
    this.loadBins();
  }

  loadBins(): void {
    this.http.get<Bin[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error loading bins:', error);
        return of([]);
      })
    ).subscribe((bins) => this.binsSubject.next(bins));
  }

  getBins(): Observable<Bin[]> {
    return this.bins$;
  }

  getBinById(id: number): Observable<Bin> {
    return this.http.get<Bin>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching bin ${id}:`, error);
        return of({} as Bin);
      })
    );
  }

  createBin(bin: Bin): Observable<Bin> {
    return this.http.post<Bin>(this.apiUrl, bin, this.httpOptions).pipe(
      catchError((error) => {
        console.error('Error adding bin:', error);
        return of({} as Bin);
      })
    );
  }

  deleteBin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      catchError((error) => {
        console.error(`Error deleting bin ${id}:`, error);
        return of();
      })
    );
  }

  updateBin(bin: Bin): Observable<Bin> {
    return this.http.put<Bin>(`${this.apiUrl}/${bin.id}`, bin, this.httpOptions).pipe(
      catchError((error) => {
        console.error(`Error updating bin ${bin.id}:`, error);
        return of(bin);
      })
    );
  }

  /** Collection History Methods **/

  getAllCollections(): Observable<CollectionHistory[]> {
    return this.http.get<CollectionHistory[]>(`${this.collectionApiUrl}/total`).pipe(
      catchError((error) => {
        console.error('Error fetching collection history:', error);
        return of([]);
      })
    );
  }

  getDailyCollections(): Observable<number> {
    const url = `${this.collectionApiUrl}/daily-collections`;
    return this.http.get<{ date: string; totalCollections: number }>(url).pipe(
      map(response => response.totalCollections) // Extract only the number
    );
  }


  getCollectionByBin(binId: number): Observable<CollectionHistory[]> {
    return this.http.get<CollectionHistory[]>(`${this.collectionApiUrl}/bin/${binId}`).pipe(
      catchError((error) => {
        console.error(`Error fetching collection history for bin ${binId}:`, error);
        return of([]);
      })
    );
  }

  getLatestCollectionForEachBin(): Observable<CollectionHistory[]> {
    return this.http.get<CollectionHistory[]>(`${this.collectionApiUrl}/latest`).pipe(
      catchError((error) => {
        console.error('Error fetching latest collection for each bin:', error);
        return of([]);
      })
    );
  }

  getTotalCollections(): Observable<{ totalCollections: number }> {
    return this.http.get<{ totalCollections: number }>(`${this.collectionApiUrl}/total`).pipe(
      catchError((error) => {
        console.error('Error fetching total collections:', error);
        return of({ totalCollections: 0 });
      })
    );
  }

  getAverageConsumption(startDate?: string, endDate?: string, period?: string): Observable<{ averageConsumption: number, startDate: string, endDate: string }> {
    let params = '';
    if (startDate && endDate) {
      params = `?startDate=${startDate}&endDate=${endDate}`;
    } else if (period) {
      params = `?period=${period}`;
    }

    return this.http.get<{ averageConsumption: number, startDate: string, endDate: string }>(`${this.collectionApiUrl}/average-consumption${params}`).pipe(
      catchError((error) => {
        console.error('Error fetching average consumption:', error);
        return of({ averageConsumption: 0, startDate: '', endDate: '' });
      })
    );
  }

  getDailyAvgCO2Emissions(): Observable<number> {
    const url = `${this.collectionApiUrl}/average-consumption?period=daily`;
    return this.http.get<number>(url);  // Assuming the response is a single number (daily CO2 avg)
  }

  // New methods to fetch missing data
  getCollectionTrend(): Observable<number> {
    // Replace with your actual backend call
    return of(5.25); // Mock value for collection trend (percentage)
  }

  getActiveAlerts(): Observable<Alert[]> {
    // Replace with your actual backend call or mock data
    return of([
      { id: 'T001', type: 'Critical', message: 'Truck #T001 Critical', details: 'Requires immediate maintenance - structural damage' },
      { id: 'T002', type: 'Warning', message: 'Truck #T002 Warning', details: 'Approaching full capacity' },
    ]);
  }

  getCollectionTypeData(): Observable<number[]> {
    // Replace with your actual backend call or mock data
    return of([40, 25, 20, 15]); // Mock collection type data (example)
  }

  getCollectionsData(): Observable<number[]> {
    // Replace with your actual backend call or mock data
    return of([120, 140, 160, 135, 150, 170, 145]); // Mock collection data (example)
  }

  getCollectionData(): Observable<CollectionData> {
    // Sequential API calls to fetch data
    return this.getDailyCollections().pipe(
      switchMap((todayCollections) => {
        return this.getDailyAvgCO2Emissions().pipe(
          switchMap((dailyAvgCO2) => {
            return this.getTotalCollections().pipe(
              switchMap((totalCollections) => {
                return this.getCollectionTrend().pipe(
                  switchMap((collectionTrend) => {
                    return this.getActiveAlerts().pipe(
                      switchMap((activeAlerts) => {
                        return this.getCollectionTypeData().pipe(
                          switchMap((collectionTypeData) => {
                            return this.getCollectionsData().pipe(
                              map((collectionsData) => {
                                const data: CollectionData = {
                                  activeTrucks: 4, // Example: You should use actual data if needed
                                  fuelEfficiency: 4, // Example: You should use actual data if needed
                                  nearingCapacity: 4, // Example: Replace with actual logic
                                  todayCollections: todayCollections, // Today's collections
                                  totalCollections: totalCollections.totalCollections, // Total collections
                                  collectionTrend: collectionTrend, // Collection trend
                                  activeAlerts: activeAlerts, // Active alerts
                                  collectionTypeData: collectionTypeData, // Collection type data
                                  collectionsData: collectionsData, // Collections data
                                };
                                return data;
                              })
                            );
                          })
                        );
                      })
                    );
                  })
                );
              })
            );
          })
        );
      }),
      catchError((error) => {
        console.error('Error fetching collection data:', error);
        return of({} as CollectionData); // Return empty object on error
      })
    );
  }
}
