import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Bin {
  id?: number;
  type: number;    // 0 = General, 1 = Recycling, etc.
  status: number;  // 0 = Empty, 1 = Partial, etc.
  capacity: number;
  lastEmptied: string;  // ISO date format
  location: {
    longitude: number;
    latitude: number;
    timestamp: string; // Ensure it's a string in ISO format
  };
}

@Injectable({
  providedIn: 'root',
})
export class BinService {
  private binsSubject = new BehaviorSubject<Bin[]>([]);
  private apiUrl = 'https://localhost:7259/api/bins';

  bins$ = this.binsSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {
    this.loadBins();
  }

  /** Loads all bins from the API and updates the state */
  loadBins(): void {
    this.http.get<Bin[]>(this.apiUrl).pipe(
      tap((bins) => this.binsSubject.next(bins)),
      catchError((error) => {
        console.error('Error loading bins:', error);
        return of([]);
      })
    ).subscribe();
  }

  /** Fetches bins manually (if needed) */
  getBins(): Observable<Bin[]> {
    return this.bins$;
  }

  /** Fetches a single bin by ID */
  getBinById(id: number): Observable<Bin> {
    return this.http.get<Bin>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching bin ${id}:`, error);
        return of({} as Bin);
      })
    );
  }

  /** Adds a new bin */
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
        return of({} as Bin);
      })
    );
  }

  /** Deletes a bin */
  deleteBin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this.loadBins()),
      catchError((error) => {
        console.error(`Error deleting bin ${id}:`, error);
        return of();
      })
    );
  }

  /** Updates a bin */
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
        return of(bin);
      })
    );
  }

  
}
