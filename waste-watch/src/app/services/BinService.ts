import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';

/**
 * Represents a bin in the system with its properties and location.
 */
export interface Bin {
  id?: number;

  type: number; // Type of the bin (e.g., plastic, paper, etc.)
  status: number; // Status of the bin (e.g., active, full, etc.)
  capacity: number; // Maximum capacity of the bin
  lastEmptied: string; // Timestamp of when the bin was last emptied
  location: {
    longitude: number; // Longitude of the bin's location
    latitude: number;  // Latitude of the bin's location
    timestamp: string; // Timestamp of the last location update
  };
}

/**
 * Represents the history of a collection for a particular bin.
 */
export interface CollectionHistory {
  id: number;
  binId: number; // The ID of the bin
  vehicleId: number; // The ID of the vehicle performing the collection
  timestamp: string; // The timestamp of the collection
  collectionStatus: number; // Status of the collection (e.g., completed, failed, etc.)
  issuesLogged: string; // Any issues logged during the collection
  amountCollected: number; // Amount of waste collected (in kilograms or another unit)
}

/**
 * Represents various collection data statistics used for analytics and monitoring.
 */
export interface CollectionData {
  activeTrucks: number; // Number of active collection trucks
  fuelEfficiency: number; // Fuel efficiency of the collection system
  nearingCapacity: number; // Percentage of bins nearing full capacity
  todayCollections: number; // Total collections done today
  totalCollections: number; // Total collections across all time
  collectionTrend: number; // Collection trend over a period (e.g., percentage change)
  activeAlerts: Alert[]; // Active alerts regarding bins or vehicles
  collectionTypeData: number[]; // Data on different collection types (e.g., plastic, paper)
  collectionsData: number[]; // Data on the number of collections over time
}

/**
 * Represents an alert related to the system, typically about the status of a truck or bin.
 */
export interface Alert {
  id: string; // Unique identifier for the alert
  type: 'Critical' | 'Warning'; // The severity of the alert
  message: string; // Brief message describing the alert
  details: string; // Detailed explanation of the alert
}

@Injectable({
  providedIn: 'root',
})
export class BinService {
  private binsSubject = new BehaviorSubject<Bin[]>([]); // Stores the current bins data
  private apiUrl = 'https://localhost:7259/api/bins'; // URL to interact with the bins API
  private collectionApiUrl = 'https://localhost:7259/api/collection-history'; // URL to interact with collection history API

  bins$ = this.binsSubject.asObservable(); // Observable to subscribe to bin data updates

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }), // HTTP options for requests
  };

  constructor(private http: HttpClient) {
    this.loadBins(); // Load bins when the service is initialized
  }

  /** Bin Management Methods **/

  /**
   * Loads all bins and updates the bins subject with the latest data.
   */
  loadBins(): void {
    this.http.get<Bin[]>(this.apiUrl).pipe(
      tap((bins) => this.binsSubject.next(bins)),
      catchError((error) => {
        console.error('Error loading bins:', error);
        return of([]); // Return an empty array in case of error
      })

    ).subscribe((bins) => this.binsSubject.next(bins)); // Update the BehaviorSubject with new bins
  }

  /**
   * Gets the current list of bins.
   * @returns Observable<Bin[]> - The current bins data.
   */
  getBins(): Observable<Bin[]> {
    return this.bins$;
  }


  /**
   * Fetches a bin by its ID.
   * @param id - The ID of the bin.
   * @returns Observable<Bin> - The bin data.
   */
  getBinById(id: number): Observable<Bin> {
    return this.http.get<Bin>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching bin ${id}:`, error);
        return of({} as Bin); // Return an empty bin object in case of error
      })
    );
  }


  /**
   * Creates a new bin.
   * @param bin - The bin to be created.
   * @returns Observable<Bin> - The created bin data.
   */
  createBin(bin: Bin): Observable<Bin> {
    // ✅ Ensure `id` is NOT included in the location before sending to the backend
    const newBin = {
      ...bin,
      location: {
        longitude: bin.location.longitude,
        latitude: bin.location.latitude,
        timestamp: bin.location.timestamp
      }
    };

    return this.http.post<Bin>(this.apiUrl, newBin, this.httpOptions).pipe(
      tap(() => this.loadBins()),
      catchError((error) => {
        console.error('Error adding bin:', error);
        return of({} as Bin); // Return an empty bin object in case of error
      })
    );
  }

  /**
   * Deletes a bin by its ID.
   * @param id - The ID of the bin to be deleted.
   * @returns Observable<void> - The result of the deletion (void).
   */
  deleteBin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this.loadBins()),
      catchError((error) => {
        console.error(`Error deleting bin ${id}:`, error);
        return of(); // Return an empty result in case of error
      })
    );
  }

  /**
   * Updates the information of a bin.
   * @param bin - The updated bin data.
   * @returns Observable<Bin> - The updated bin data.
   */
  updateBin(bin: Bin): Observable<Bin> {
    // ✅ Ensure `id` is NOT included in the location before updating
    const updatedBin = {
      ...bin,
      location: {
        longitude: bin.location.longitude,
        latitude: bin.location.latitude,
        timestamp: bin.location.timestamp
      }
    };

    return this.http.put<Bin>(`${this.apiUrl}/${bin.id}`, updatedBin, this.httpOptions).pipe(
      tap(() => this.loadBins()),
      catchError((error) => {
        console.error(`Error updating bin ${bin.id}:`, error);
        return of(bin); // Return the original bin object in case of error
      })
    );
  }

  /** Collection History Methods **/

  /**
   * Fetches all collection history records.
   * @returns Observable<CollectionHistory[]> - The collection history records.
   */
  getAllCollections(): Observable<CollectionHistory[]> {
    return this.http.get<CollectionHistory[]>(`${this.collectionApiUrl}/total`).pipe(
      catchError((error) => {
        console.error('Error fetching collection history:', error);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  /**
   * Fetches the total number of collections done today.
   * @returns Observable<number> - The number of collections done today.
   */
  getDailyCollections(): Observable<number> {
    const url = `${this.collectionApiUrl}/daily-collections`;
    return this.http.get<{ date: string; totalCollections: number }>(url).pipe(
      map(response => response.totalCollections) // Extract only the number of collections
    );
  }

  /**
   * Fetches the collection history for a specific bin.
   * @param binId - The ID of the bin.
   * @returns Observable<CollectionHistory[]> - The collection history for the specified bin.
   */
  getCollectionByBin(binId: number): Observable<CollectionHistory[]> {
    return this.http.get<CollectionHistory[]>(`${this.collectionApiUrl}/bin/${binId}`).pipe(
      catchError((error) => {
        console.error(`Error fetching collection history for bin ${binId}:`, error);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  /**
   * Fetches the collection history.
   * @returns Observable<CollectionHistory[]> - The collection history for all bins.
   */
  getCollectionHistory(): Observable<CollectionHistory[]> {
    return this.http.get<CollectionHistory[]>(`${this.collectionApiUrl}`).pipe(
      catchError((error) => {
        console.error('Error fetching collection history:', error);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  /**
   * Fetches the latest collection history for each bin.
   * @returns Observable<CollectionHistory[]> - The latest collection data for each bin.
   */
  getLatestCollectionForEachBin(): Observable<CollectionHistory[]> {
    return this.http.get<CollectionHistory[]>(`${this.collectionApiUrl}/latest`).pipe(
      catchError((error) => {
        console.error('Error fetching latest collection for each bin:', error);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  /**
   * Fetches the total number of collections across all bins.
   * @returns Observable<{ totalCollections: number }> - The total number of collections.
   */
  getTotalCollections(): Observable<{ totalCollections: number }> {
    return this.http.get<{ totalCollections: number }>(`${this.collectionApiUrl}/total`).pipe(
      catchError((error) => {
        console.error('Error fetching total collections:', error);
        return of({ totalCollections: 0 }); // Return zero if error occurs
      })
    );
  }

  /** Collection Data Methods **/

  /**
   * Fetches aggregated collection data for various metrics like active trucks, fuel efficiency, etc.
   * @returns Observable<CollectionData> - The aggregated collection data.
   */
  getCollectionData(): Observable<CollectionData> {
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
                                  activeTrucks: 4, // Mock data for active trucks
                                  fuelEfficiency: 4, // Mock data for fuel efficiency
                                  nearingCapacity: 4, // Mock data for nearing capacity percentage
                                  todayCollections: todayCollections,
                                  totalCollections: totalCollections.totalCollections,
                                  collectionTrend: collectionTrend, // This should now be a number
                                  activeAlerts: activeAlerts,
                                  collectionTypeData: collectionTypeData,
                                  collectionsData: collectionsData,
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
        return of({} as CollectionData); // Return empty data on error
      })
    );
  }

  // Mock method for daily average CO2 emissions
  getDailyAvgCO2Emissions(): Observable<number> {
    return of(5); // Example mock data
  }

  // Mock method for collection trend
  getCollectionTrend(): Observable<number> {
    return of(10); // Example mock data for collection trend
  }


  /** Helper Methods for Collection Data **/

  /**
   * Fetches active alerts (e.g., critical issues, warnings).
   * @returns Observable<Alert[]> - The active alerts.
   */
  getActiveAlerts(): Observable<Alert[]> {
    return of([
      { id: 'T001', type: 'Critical', message: 'Truck #T001 Critical', details: 'Requires immediate maintenance - structural damage' },
      { id: 'T002', type: 'Warning', message: 'Truck #T002 Warning', details: 'Approaching full capacity' },
    ]);
  }

  /**
   * Fetches collection type data (e.g., percentages for different types of waste).
   * @returns Observable<number[]> - The collection type data.
   */
  getCollectionTypeData(): Observable<number[]> {
    return of([40, 25, 20, 15]); // Mock data for collection types (plastic, paper, etc.)
  }

  /**
   * Fetches collections data over time (e.g., number of collections per day).
   * @returns Observable<number[]> - The collections data over time.
   */
  getCollectionsData(): Observable<number[]> {
    return of([120, 140, 160, 135, 150, 170, 145]); // Mock collections data over a period
  }

  /** Maintenance Methods **/

  /**
   * Fetches the maintenance history of bins.
   * @returns Observable<any[]> - The maintenance history records.
   */
  getMaintenanceHistory(): Observable<any[]> {
    const url = `${this.apiUrl}/maintenance-history`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching maintenance history:', error);
        return of([]); // Return empty history in case of error
      })
    );
  }

  /**
   * Fetches active bins requiring maintenance.
   * @returns Observable<any[]> - The active maintenance bins.
   */
  getActiveMaintenanceBins(): Observable<any[]> {
    const url = `${this.apiUrl}/maintenance-history/active`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching active maintenance bins:', error);
        return of([]); // Return empty list if error occurs
      })
    );
  }

  /**
   * Fetches bins that are almost full.
   * @returns Observable<any[]> - The bins nearing full capacity.
   */
  getAlmostFullBins(): Observable<any[]> {
    const url = `${this.apiUrl}/almost-full`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching almost full bins:', error);
        return of([]); // Return empty list if error occurs
      })
    );
  }
}
